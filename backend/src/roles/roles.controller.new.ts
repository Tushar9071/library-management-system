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
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import {
  EnhancedRolesService,
  CreateRoleDto,
  UpdateRoleDto,
} from './enhanced-roles.service';

@Controller('/roles')
@UseGuards(PermissionGuard)
export class RolesController {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly enhancedRolesService: EnhancedRolesService,
  ) {}

  @Get()
  @RequirePermissions('READ_ROLES')
  async getAllRoles() {
    const roles = await this.enhancedRolesService.getAllRoles();

    return {
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  @Get(':id')
  @RequirePermissions('READ_ROLES')
  async getRoleById(@Param('id') id: string) {
    const role = await this.enhancedRolesService.getRoleById(parseInt(id));

    return {
      message: 'Role retrieved successfully',
      data: role,
    };
  }

  @Post()
  @RequirePermissions('CREATE_ROLES')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.enhancedRolesService.createRole(createRoleDto);

    return {
      message: 'Role created successfully',
      data: role,
    };
  }

  @Put(':id')
  @RequirePermissions('UPDATE_ROLES')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.enhancedRolesService.updateRole(
      parseInt(id),
      updateRoleDto,
    );

    return {
      message: 'Role updated successfully',
      data: role,
    };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_ROLES')
  async deleteRole(@Param('id') id: string) {
    const result = await this.enhancedRolesService.deleteRole(parseInt(id));

    return {
      message: result.message,
      data: null,
    };
  }

  // Test endpoint to check email domain matching
  @Post('test-email-domain')
  @RequirePermissions('READ_ROLES')
  async testEmailDomain(@Body() body: { email: string }) {
    const roleId = await this.enhancedRolesService.assignRoleByEmailDomain(
      body.email,
    );

    if (roleId) {
      const role = await this.enhancedRolesService.getRoleById(roleId);
      return {
        message: 'Email domain matched',
        data: {
          email: body.email,
          assignedRole: role,
        },
      };
    }

    return {
      message: 'No matching email domain rule found',
      data: {
        email: body.email,
        assignedRole: null,
      },
    };
  }
}
