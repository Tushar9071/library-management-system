import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';

@Injectable()
export class UserRoleService {
  constructor(private prisma: PrismaService) {}

  // Create a new user role
  async createRole(role: string) {
    const existingRole = await this.prisma.userRole.findUnique({
      where: { role },
    });

    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    const newRole = await this.prisma.userRole.create({
      data: { role },
    });

    return newRole;
  }

  // Get all user roles
  async getAllRoles() {
    return this.prisma.userRole.findMany({
      where: { visibility: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a specific role by ID
  async getRoleById(id: number) {
    const role = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!role || !role.visibility) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // Update a user role
  async updateRole(id: number, role: string) {
    const existingRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!existingRole || !existingRole.visibility) {
      throw new NotFoundException('Role not found');
    }

    // Check if the new role name already exists (excluding current role)
    const duplicateRole = await this.prisma.userRole.findFirst({
      where: {
        role,
        id: { not: id },
      },
    });

    if (duplicateRole) {
      throw new BadRequestException('Role name already exists');
    }

    const updatedRole = await this.prisma.userRole.update({
      where: { id },
      data: { role },
    });

    return updatedRole;
  }

  // Soft delete a user role (set visibility to false)
  async deleteRole(id: number) {
    const existingRole = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        userinfo: true,
      },
    });

    if (!existingRole || !existingRole.visibility) {
      throw new NotFoundException('Role not found');
    }

    // Check if any users are assigned to this role
    if (existingRole.userinfo.length > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    const deletedRole = await this.prisma.userRole.update({
      where: { id },
      data: { visibility: false },
    });

    return { message: 'Role deleted successfully', role: deletedRole };
  }

  // Hard delete a user role (permanently remove from database)
  async hardDeleteRole(id: number) {
    const existingRole = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        userinfo: true,
      },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if any users are assigned to this role
    if (existingRole.userinfo.length > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    await this.prisma.userRole.delete({
      where: { id },
    });

    return { message: 'Role permanently deleted' };
  }
}
