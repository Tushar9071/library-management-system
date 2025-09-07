import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  emailDomainRules?: {
    domainPattern: string;
    description?: string;
    priority?: number;
  }[];
  // Borrow policy
  maxBorrowDays?: number;
  dailyFine?: number;
  maxActiveBorrows?: number;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  emailDomainRules?: {
    id?: number;
    domainPattern: string;
    description?: string;
    priority?: number;
    isActive?: boolean;
  }[];
  // Borrow policy
  maxBorrowDays?: number;
  dailyFine?: number;
  maxActiveBorrows?: number;
}

@Injectable()
export class EnhancedRolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(data: CreateRoleDto) {
  const { name, description, permissions = [], emailDomainRules = [], maxBorrowDays, dailyFine, maxActiveBorrows } = data;

    // Check if role already exists
    const existingRole = await this.prisma.userRole.findUnique({
      where: { role: name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }

    try {
      // Filter out empty domain patterns
      const validEmailRules = emailDomainRules.filter(
        (rule) => rule.domainPattern && rule.domainPattern.trim() !== '',
      );

      // Get permission IDs from permission names
      const permissionRecords =
        permissions.length > 0
          ? await this.prisma.permission.findMany({
              where: {
                name: { in: permissions },
              },
            })
          : [];

      const role = await this.prisma.userRole.create({
        data: {
          role: name,
          description,
          ...(maxBorrowDays !== undefined && { maxBorrowDays }),
          ...(dailyFine !== undefined && { dailyFine }),
          ...(maxActiveBorrows !== undefined && { maxActiveBorrows }),
          emailRules: {
            create: validEmailRules.map((rule) => ({
              domainPattern: rule.domainPattern.trim(),
              description: rule.description || '',
              priority: rule.priority || 0,
            })),
          },
          permissions: {
            create: permissionRecords.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        },
        include: {
          emailRules: true,
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { userinfo: true },
          },
        },
      });

      return this.formatRoleResponse(role);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('role')) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }
      throw error;
    }
  }

  async updateRole(id: number, data: UpdateRoleDto) {
  const { name, description, permissions, emailDomainRules = [], maxBorrowDays, dailyFine, maxActiveBorrows } = data;

    // Check if role exists
    const existingRole = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if new name conflicts with existing role (excluding current role)
    if (name && name !== existingRole.role) {
      const conflictingRole = await this.prisma.userRole.findUnique({
        where: { role: name },
      });

      if (conflictingRole) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }
    }

    try {
      // Filter out empty domain patterns
      const validEmailRules = emailDomainRules.filter(
        (rule) => rule.domainPattern && rule.domainPattern.trim() !== '',
      );

      // Always update email domain rules (even if empty to allow deletion)
      // Delete existing rules that are not in the update
      const existingRuleIds = validEmailRules
        .filter((rule) => rule.id !== undefined)
        .map((rule) => rule.id as number);

      if (existingRuleIds.length > 0) {
        await this.prisma.emailDomainRule.deleteMany({
          where: {
            roleId: id,
            id: { notIn: existingRuleIds },
          },
        });
      } else {
        // Delete all existing rules if no valid rules provided
        await this.prisma.emailDomainRule.deleteMany({
          where: { roleId: id },
        });
      }

      // Update or create rules
      for (const rule of validEmailRules) {
        if (rule.id) {
          // Update existing rule
          await this.prisma.emailDomainRule.update({
            where: { id: rule.id },
            data: {
              domainPattern: rule.domainPattern.trim(),
              description: rule.description || '',
              priority: rule.priority || 0,
              isActive: rule.isActive ?? true,
            },
          });
        } else {
          // Create new rule
          await this.prisma.emailDomainRule.create({
            data: {
              roleId: id,
              domainPattern: rule.domainPattern.trim(),
              description: rule.description || '',
              priority: rule.priority || 0,
              isActive: rule.isActive ?? true,
            },
          });
        }
      }

      // Handle permissions update if provided
      if (permissions !== undefined) {
        // Delete existing role permissions
        await this.prisma.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permissions
        if (permissions.length > 0) {
          const permissionRecords = await this.prisma.permission.findMany({
            where: { name: { in: permissions } },
          });

          await this.prisma.rolePermission.createMany({
            data: permissionRecords.map((permission) => ({
              roleId: id,
              permissionId: permission.id,
            })),
          });
        }
      }

      const role = await this.prisma.userRole.update({
        where: { id },
        data: {
          ...(name && { role: name }),
          ...(description !== undefined && { description }),
          ...(maxBorrowDays !== undefined && { maxBorrowDays }),
          ...(dailyFine !== undefined && { dailyFine }),
          ...(maxActiveBorrows !== undefined && { maxActiveBorrows }),
        },
        include: {
          emailRules: true,
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { userinfo: true },
          },
        },
      });

      return this.formatRoleResponse(role);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('role')) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }
      throw error;
    }
  }

  async getAllRoles() {
    const roles = await this.prisma.userRole.findMany({
      where: { visibility: true },
      include: {
        emailRules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userinfo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return roles.map((role) => this.formatRoleResponse(role));
  }

  async getRoleById(id: number) {
    const role = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        emailRules: {
          orderBy: { priority: 'desc' },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { userinfo: true },
        },
      },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return this.formatRoleResponse(role);
  }

  async deleteRole(id: number) {
    // Check if role has users
    const userCount = await this.prisma.userInfo.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new Error(
        `Cannot delete role. ${userCount} users are assigned to this role.`,
      );
    }

    // Soft delete
    await this.prisma.userRole.update({
      where: { id },
      data: { visibility: false },
    });

    return { message: 'Role deleted successfully' };
  }

  async assignRoleByEmailDomain(email: string): Promise<number | null> {
    // Get all active email domain rules ordered by priority
    const rules = await this.prisma.emailDomainRule.findMany({
      where: { isActive: true },
      include: { role: true },
      orderBy: { priority: 'desc' },
    });

    for (const rule of rules) {
      if (this.matchesEmailPattern(email, rule.domainPattern)) {
        return rule.roleId;
      }
    }

    return null; // No matching rule found
  }

  private matchesEmailPattern(email: string, pattern: string): boolean {
    // Simple domain matching (e.g., "@darshan.ac.in")
    if (pattern.startsWith('@')) {
      return email.toLowerCase().endsWith(pattern.toLowerCase());
    }

    // Regex pattern matching
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(email);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return false;
    }
  }

  private formatRoleResponse(role: any) {
    return {
      id: role.id,
      name: role.role,
      description: role.description || role.role,
  maxBorrowDays: role.maxBorrowDays ?? 15,
  dailyFine: role.dailyFine ?? 5,
  maxActiveBorrows: role.maxActiveBorrows ?? 3,
      userCount: role._count?.userinfo || 0,
      emailDomainRules:
        role.emailRules?.map((rule: any) => ({
          id: rule.id,
          domainPattern: rule.domainPattern,
          description: rule.description,
          priority: rule.priority,
          isActive: rule.isActive,
          createdAt: rule.createdAt.toISOString(),
        })) || [],
      permissions:
        role.permissions?.map((rp: any) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          category: rp.permission.category,
          action: rp.permission.action,
        })) || [],
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }
}
