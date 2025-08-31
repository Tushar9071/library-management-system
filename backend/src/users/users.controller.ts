import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('/users')
@UseGuards(PermissionGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('READ_USERS')
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Ensure reasonable limits
    const validLimit = Math.min(Math.max(limitNum, 1), 100);

    const result = await this.usersService.findAll(
      pageNum,
      validLimit,
      search,
      role,
    );
    return {
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination,
    };
  }

  @Get('roles')
  @RequirePermissions('READ_ROLES')
  async getUserRoles() {
    const roles = await this.usersService.getUserRoles();
    return {
      message: 'User roles retrieved successfully',
      data: roles,
    };
  }

  @Get(':id')
  @RequirePermissions('READ_USERS')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(parseInt(id));
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Post()
  @RequirePermissions('CREATE_USERS')
  async createUser(@Body() createUserDto: any) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Put(':id')
  @RequirePermissions('UPDATE_USERS')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    const user = await this.usersService.update(parseInt(id), updateUserDto);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_USERS')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(parseInt(id));
    return {
      message: 'User deleted successfully',
      data: null,
    };
  }
}
