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
import { FirebaseService } from '../common/firebase/firebase.service';
import { PrismaService } from '../db/prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private permissionsService: PermissionsService,
    private prisma: PrismaService,
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
    console.log(
      'Token value:',
      token ? token.substring(0, 20) + '...' : 'none',
    );
    console.log('Request cookies:', request.headers.cookie);
    console.log('Request authorization:', request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }

    try {
      let userId: number;
      let payload: any;

      // Try to determine if this is a Firebase token or JWT token
      if (this.isFirebaseToken(token)) {
        console.log('Detected Firebase token, verifying with Firebase...');
        // Use Firebase service to verify the token and get user ID
        payload = await this.firebaseService.verifyIdToken(token);
        const firebaseUserId =
          await this.firebaseService.getUserIdFromToken(token);

        if (!firebaseUserId) {
          throw new UnauthorizedException(
            'User not found in Firebase database',
          );
        }
        userId = firebaseUserId;
      } else {
        console.log('Detected JWT token, verifying with JWT service...');
        // Try to verify as a regular JWT token
        payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });

        // Get userId from JWT payload
        userId = payload.sub || payload.userId;

        // Verify the session exists in database
        const session = await this.prisma.session.findUnique({
          where: { token },
          include: {
            user: {
              include: {
                userInfoId: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        });

        if (!session) {
          throw new UnauthorizedException('Invalid session');
        }

        userId = session.userId;
      }

      if (!userId) {
        throw new UnauthorizedException('User not found in database');
      }

      request.user = payload;
      request.userId = userId; // Store numeric user ID for other services

      // Check if user has required permissions
      for (const permission of requiredPermissions) {
        const hasPermission = await this.permissionsService.hasPermission(
          userId, // Use numeric user ID instead of Firebase UID
          permission,
        );
        console.log(
          `User ${userId} (Email: ${payload.email || 'unknown'}) has permission ${permission}:`,
          hasPermission,
        );
        if (!hasPermission) {
          throw new ForbiddenException(
            `Access denied. Required permission: ${permission}`,
          );
        }
      }

      return true;
    } catch (error) {
      console.log('Firebase token verification error:', error);
      console.log('Permission guard error:', error.message);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  /**
   * Determines if a token is a Firebase token or a JWT token
   * Firebase tokens are longer and have specific characteristics
   */
  private isFirebaseToken(token: string): boolean {
    try {
      // Firebase tokens are typically much longer (800+ characters)
      // and have 3 parts separated by dots like JWTs, but with much longer payloads
      if (token.length < 100) {
        return false; // Too short to be a Firebase token
      }

      // Try to decode the header to check if it's a Firebase token
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());

      // Firebase tokens use RS256 algorithm and have a 'kid' claim
      // JWT tokens from your backend use HS256
      return header.alg === 'RS256' && header.kid;
    } catch (error) {
      // If we can't decode it, assume it's not a Firebase token
      return false;
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
        if (
          token &&
          token !== 'null' &&
          token !== 'undefined' &&
          token.length > 10
        ) {
          return token;
        }
      }
    }

    // Fallback to Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Check if token is valid (not null, undefined, or "null" string)
      if (
        token &&
        token !== 'null' &&
        token !== 'undefined' &&
        token.length > 10
      ) {
        return token;
      }
    }

    return undefined;
  }
}
