import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserRoleService } from '../user-role/user-role.service';
import { JwtMiddleware } from '../auth/jwt.middleware';

@Controller('/roles')
@UseGuards(JwtMiddleware)
export class RolesController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  async getAllRoles() {
    const roles = await this.userRoleService.getAllRoles();
    const roleData = roles.map((role) => ({
      id: role.id.toString(),
      name: role.role,
      description: role.role,
      permissions: [], // This would need to be added to schema
      userCount: 0, // Would need to count users with this role
      createdAt: role.createdAt.toISOString(),
    }));

    return {
      message: 'Roles retrieved successfully',
      data: roleData,
    };
  }

  @Get(':id')
  async getRoleById(@Param('id') id: string) {
    const role = await this.userRoleService.getRoleById(parseInt(id));
    const roleData = {
      id: role.id.toString(),
      name: role.role,
      description: role.role,
      permissions: [],
      userCount: 0,
      createdAt: role.createdAt.toISOString(),
    };

    return {
      message: 'Role retrieved successfully',
      data: roleData,
    };
  }

  @Post()
  async createRole(
    @Body()
    createRoleDto: {
      name: string;
      description: string;
      permissions: string[];
    },
  ) {
    const role = await this.userRoleService.createRole(createRoleDto.name);
    const roleData = {
      id: role.id.toString(),
      name: role.role,
      description: role.role,
      permissions: createRoleDto.permissions || [],
      userCount: 0,
      createdAt: role.createdAt.toISOString(),
    };

    return {
      message: 'Role created successfully',
      data: roleData,
    };
  }

  @Put(':id')
  async updateRole(
    @Param('id') id: string,
    @Body()
    updateRoleDto: { name: string; description: string; permissions: string[] },
  ) {
    const role = await this.userRoleService.updateRole(
      parseInt(id),
      updateRoleDto.name,
    );
    const roleData = {
      id: role.id.toString(),
      name: role.role,
      description: role.role,
      permissions: updateRoleDto.permissions || [],
      userCount: 0,
      createdAt: role.createdAt.toISOString(),
    };

    return {
      message: 'Role updated successfully',
      data: roleData,
    };
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    const result = await this.userRoleService.deleteRole(parseInt(id));
    return {
      message: result.message || 'Role deleted successfully',
      data: null,
    };
  }
}
