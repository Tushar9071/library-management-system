import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    // Uncomment for debugging
    console.log('Permission Guard Debug:');
    console.log('Required permissions:', requiredPermissions);
    console.log('Token found:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');
    console.log('Request cookies:', request.headers.cookie);
    console.log('Request authorization:', request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;

      // console.log('JWT payload:', payload);

      // Check if user has required permissions
      for (const permission of requiredPermissions) {
        const hasPermission = await this.permissionsService.hasPermission(
          payload.sub,
          permission,
        );
        console.log(`User ${payload.sub} has permission ${permission}:`, hasPermission);
        if (!hasPermission) {
          throw new ForbiddenException(
            `Access denied. Required permission: ${permission}`,
          );
        }
      }

      return true;
    } catch (error) {
      console.log('Permission guard error:', error.message);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromCookie(request: any): string | undefined {
    // First try to get token from cookies
    const cookies = request.headers.cookie;
    if (cookies) {
      const tokenCookie = cookies
        .split(';')
        .find((cookie: string) => cookie.trim().startsWith('token='));
      
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        // Check if token is valid (not null, undefined, or "null" string)
        if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
          return token;
        }
      }
    }

    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Check if token is valid (not null, undefined, or "null" string)
      if (token && token !== 'null' && token !== 'undefined' && token.length > 10) {
        return token;
      }
    }

    return undefined;
  }
}
