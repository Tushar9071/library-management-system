import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Initialize default permissions
  async initializePermissions() {
    const permissions = [
      {
        name: 'READ_BOOKS',
        description: 'Read books data',
        category: 'books',
        action: 'read',
      },
      {
        name: 'CREATE_BOOKS',
        description: 'Create new books',
        category: 'books',
        action: 'create',
      },
      {
        name: 'UPDATE_BOOKS',
        description: 'Update book information',
        category: 'books',
        action: 'update',
      },
      {
        name: 'DELETE_BOOKS',
        description: 'Delete books',
        category: 'books',
        action: 'delete',
      },
      {
        name: 'READ_USERS',
        description: 'Read users data',
        category: 'users',
        action: 'read',
      },
      {
        name: 'CREATE_USERS',
        description: 'Create new users',
        category: 'users',
        action: 'create',
      },
      {
        name: 'UPDATE_USERS',
        description: 'Update user information',
        category: 'users',
        action: 'update',
      },
      {
        name: 'DELETE_USERS',
        description: 'Delete users',
        category: 'users',
        action: 'delete',
      },
      {
        name: 'READ_ROLES',
        description: 'Read roles data',
        category: 'roles',
        action: 'read',
      },
      {
        name: 'CREATE_ROLES',
        description: 'Create new roles',
        category: 'roles',
        action: 'create',
      },
      {
        name: 'UPDATE_ROLES',
        description: 'Update role information',
        category: 'roles',
        action: 'update',
      },
      {
        name: 'DELETE_ROLES',
        description: 'Delete roles',
        category: 'roles',
        action: 'delete',
      },
      {
        name: 'MANAGE_PERMISSIONS',
        description: 'Manage role permissions',
        category: 'roles',
        action: 'manage',
      },
      {
        name: 'BORROW_BOOKS',
        description: 'Borrow books from library',
        category: 'books',
        action: 'borrow',
      },
      {
        name: 'RETURN_BOOKS',
        description: 'Return borrowed books',
        category: 'books',
        action: 'return',
      },
    ];

    for (const permission of permissions) {
      await this.prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission,
      });
    }
  }

  // Get all permissions
  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { action: 'asc' }],
    });
  }

  // Get permissions for a specific role
  async getRolePermissions(roleId: number) {
    const roleWithPermissions = await this.prisma.userRole.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roleWithPermissions?.permissions.map((rp) => rp.permission) || [];
  }

  // Get user permissions by user ID
  async getUserPermissions(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        userInfoId: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.userInfoId?.role) {
      return [];
    }

    return user.userInfoId.role.permissions.map((rp) => rp.permission);
  }

  // Check if user has specific permission
  async hasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((p) => p.name === permissionName);
  }

  // Update role permissions
  async updateRolePermissions(roleId: number, permissionIds: number[]) {
    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data: rolePermissions,
    });

    return this.getRolePermissions(roleId);
  }

  // Initialize default role permissions
  async initializeDefaultRolePermissions() {
    // Admin role - all permissions
    const adminRole = await this.prisma.userRole.findFirst({
      where: { role: 'Admin' },
    });
    const allPermissions = await this.getAllPermissions();

    if (adminRole) {
      await this.updateRolePermissions(
        adminRole.id,
        allPermissions.map((p) => p.id),
      );
    }

    // Student role - basic permissions
    const studentRole = await this.prisma.userRole.findFirst({
      where: { role: 'Student' },
    });
    const studentPermissions = await this.prisma.permission.findMany({
      where: {
        name: { in: ['READ_BOOKS', 'BORROW_BOOKS', 'RETURN_BOOKS'] },
      },
    });

    if (studentRole) {
      await this.updateRolePermissions(
        studentRole.id,
        studentPermissions.map((p) => p.id),
      );
    }

    // Public User role - read only
    const publicRole = await this.prisma.userRole.findFirst({
      where: { role: 'public user' },
    });
    const publicPermissions = await this.prisma.permission.findMany({
      where: {
        name: { in: ['READ_BOOKS'] },
      },
    });

    if (publicRole) {
      await this.updateRolePermissions(
        publicRole.id,
        publicPermissions.map((p) => p.id),
      );
    }
  }
}
