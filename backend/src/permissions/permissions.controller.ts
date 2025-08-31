import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('permissions')
@UseGuards(PermissionGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('MANAGE_PERMISSIONS')
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('role/:roleId')
  @RequirePermissions('MANAGE_PERMISSIONS')
  async getRolePermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getRolePermissions(parseInt(roleId));
  }

  @Get('user/:userId')
  async getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(parseInt(userId));
  }

  @Post('role/:roleId')
  @RequirePermissions('MANAGE_PERMISSIONS')
  async updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body() body: { permissionIds: number[] }
  ) {
    return this.permissionsService.updateRolePermissions(
      parseInt(roleId),
      body.permissionIds
    );
  }

  @Post('initialize')
  async initializePermissions() {
    await this.permissionsService.initializePermissions();
    await this.permissionsService.initializeDefaultRolePermissions();
    return { message: 'Permissions initialized successfully' };
  }
}
