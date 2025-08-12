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
import { JwtMiddleware } from '../auth/jwt.middleware';

@Controller('/users')
@UseGuards(JwtMiddleware)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
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
  async getUserRoles() {
    const roles = await this.usersService.getUserRoles();
    return {
      message: 'User roles retrieved successfully',
      data: roles,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(parseInt(id));
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Post()
  async createUser(@Body() createUserDto: any) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    const user = await this.usersService.update(parseInt(id), updateUserDto);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(parseInt(id));
    return {
      message: 'User deleted successfully',
      data: null,
    };
  }
}
