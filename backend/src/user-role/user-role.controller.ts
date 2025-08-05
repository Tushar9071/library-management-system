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
    return this.userRoleService.createRole(role.trim());
  }

  // Get all user roles
  @Get()
  async getAllRoles() {
    return this.userRoleService.getAllRoles();
  }

  // Get a specific role by ID
  @Get(':id')
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.getRoleById(id);
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
    return this.userRoleService.updateRole(id, role.trim());
  }

  // Soft delete a user role
  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.deleteRole(id);
  }

  // Hard delete a user role (permanently remove)
  @Delete(':id/permanent')
  async hardDeleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.hardDeleteRole(id);
  }
}
