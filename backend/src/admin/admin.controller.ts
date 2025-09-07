import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('initialize')
  async initializeAdmin(
    @Body() body: { email: string; password: string; name: string },
  ) {
    const { email, password, name } = body;

    try {
      // Check if admin already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new HttpException(
          'Admin user already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create all permissions first
      const permissions = [
        {
          name: 'CREATE_USERS',
          description: 'Create new users',
          category: 'users',
          action: 'create',
        },
        {
          name: 'READ_USERS',
          description: 'View user information',
          category: 'users',
          action: 'read',
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
          name: 'CREATE_ROLES',
          description: 'Create new roles',
          category: 'roles',
          action: 'create',
        },
        {
          name: 'READ_ROLES',
          description: 'View roles',
          category: 'roles',
          action: 'read',
        },
        {
          name: 'UPDATE_ROLES',
          description: 'Update roles',
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
          name: 'CREATE_BOOKS',
          description: 'Create new books',
          category: 'books',
          action: 'create',
        },
        {
          name: 'READ_BOOKS',
          description: 'View books',
          category: 'books',
          action: 'read',
        },
        {
          name: 'UPDATE_BOOKS',
          description: 'Update books',
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
          name: 'PERMISSION_MANAGE',
          description: 'Manage permissions',
          category: 'system',
          action: 'manage',
        },
        {
          name: 'ADMIN_ACCESS',
          description: 'Full admin access',
          category: 'system',
          action: 'admin',
        },
        {
          name: 'SYSTEM_MANAGE',
          description: 'Manage system settings',
          category: 'system',
          action: 'manage',
        },
      ];

      // Create permissions (skip if already exist)
      for (const permission of permissions) {
        await this.prisma.permission.upsert({
          where: { name: permission.name },
          update: {},
          create: permission,
        });
      }

      // Create Admin role
      const adminRole = await this.prisma.userRole.upsert({
        where: { role: 'Admin' },
        update: {},
        create: {
          role: 'Admin',
        },
      });

      // Create the admin user
      const adminUser = await this.prisma.users.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      // Create userInfo for the admin user
      await this.prisma.userInfo.create({
        data: {
          firstname: name.split(' ')[0] || 'Admin',
          lastname: name.split(' ')[1] || 'User',
          Username: email.split('@')[0],
          gender: 'Other',
          roleId: adminRole.id,
          userId: adminUser.id,
        },
      });

      // Get all permissions
      const allPermissions = await this.prisma.permission.findMany();

      // Assign all permissions to Admin role
      for (const permission of allPermissions) {
        await this.prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        });
      }

      return {
        success: true,
        message: 'Admin user initialized successfully',
        data: {
          email: adminUser.email,
          name: name,
          role: 'Admin',
          permissionsCount: allPermissions.length,
        },
      };
    } catch (error) {
      console.error('Error initializing admin:', error);
      throw new HttpException(
        error.message || 'Failed to initialize admin user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('check-setup')
  async checkSetup() {
    try {
      // Find users with admin role
      const adminUsers = await this.prisma.userInfo.findMany({
        where: {
          role: {
            role: 'Admin',
          },
        },
        include: {
          user: true,
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
      });

      if (adminUsers.length === 0) {
        return {
          setupComplete: false,
          message: 'No admin user found',
        };
      }

      const adminUser = adminUsers[0];

      return {
        setupComplete: true,
        message: 'Admin setup complete',
        adminUser: {
          email: adminUser.user.email,
          name: `${adminUser.firstname} ${adminUser.lastname}`,
          role: adminUser.role.role,
          permissionCount: adminUser.role.permissions.length,
        },
      };
    } catch (error) {
      console.error('Error checking setup:', error);
      throw new HttpException(
        'Failed to check setup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
