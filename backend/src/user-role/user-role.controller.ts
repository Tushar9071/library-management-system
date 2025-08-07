import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserRoleService } from './user-role.service';

@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  // Create a new user role
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body('role') role: string) {
    if (!role || role.trim() === '') {
      throw new Error('Role name is required');
    }
    const newRole = await this.userRoleService.createRole(role.trim());
    return {
      message: 'Role created successfully',
      data: newRole,
    };
  }

  // Get all user roles
  @Get()
  async getAllRoles() {
    const roles = await this.userRoleService.getAllRoles();
    return {
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  // Get a specific role by ID
  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    const role = await this.userRoleService.getRoleById(id);
    return {
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  // Update a user role
  @Put(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
  ) {
    if (!role || role.trim() === '') {
      throw new Error('Role name is required');
    }
    const updatedRole = await this.userRoleService.updateRole(id, role.trim());
    return {
      message: 'Role updated successfully',
      data: updatedRole,
    };
  }

  // Soft delete a user role
  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userRoleService.deleteRole(id);
    return {
      message: result.message || 'Role deleted successfully',
      data: null,
    };
  }

  // Hard delete a user role (permanently remove)
  @Delete(':id/permanent')
  async hardDeleteRole(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userRoleService.hardDeleteRole(id);
    return {
      message: result?.message || 'Role permanently deleted',
      data: null,
    };
  }
}
