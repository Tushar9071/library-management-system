import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('test')
@UseGuards(PermissionGuard)
export class TestController {
  @Get('admin')
  @RequirePermissions('READ_USERS')
  testAdminAccess() {
    return {
      message: 'Admin access test successful!',
      timestamp: new Date(),
    };
  }

  @Get('public')
  testPublicAccess() {
    return {
      message: 'Public access works!',
      timestamp: new Date(),
    };
  }
}
