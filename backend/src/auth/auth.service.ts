import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { EnhancedRolesService } from '../roles/enhanced-roles.service';
import { FirebaseService } from '../common/firebase/firebase.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private usersService: UsersService,
    private enhancedRolesService: EnhancedRolesService,
    private firebaseService: FirebaseService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password || ''))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Save in session table
    await this.prisma.session.upsert({
      where: { userId: user.id },
      update: { token },
      create: { userId: user.id, token },
    });

    return {
      access_token: token,
      name: user.userInfoId?.firstname || '',
      email: user.email,
      role: user.userInfoId?.role?.role || 'public user',
    };
  }

  async logout(token: string) {
    try {
      if (!token) {
        return { message: 'No token provided' };
      }

      // First check if the session exists
      const session = await this.prisma.session.findUnique({
        where: { token: token },
      });

      if (!session) {
        return { message: 'Session not found or already logged out' };
      }

      // If session exists, delete it
      await this.prisma.session.delete({
        where: { token: token },
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { message: 'Logout completed' }; // Return success even if there's an error, since the cookie is cleared
    }
  }

  async googleLogin(email: string, firebaseToken: string) {
    try {
      // Verify the Firebase token first
      const decodedToken =
        await this.firebaseService.verifyIdToken(firebaseToken);

      // Make sure the email from token matches the provided email
      if (decodedToken.email !== email) {
        throw new Error('Email mismatch between token and provided email');
      }

      // Check if user already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email: email },
        include: {
          userInfoId: {
            include: {
              role: true,
            },
          },
        },
      });

      if (existingUser) {
        // If user exists, update the token
        await this.prisma.session.upsert({
          where: { userId: existingUser.id },
          update: { token: firebaseToken },
          create: { userId: existingUser.id, token: firebaseToken },
        });

        return {
          access_token: firebaseToken,
          id: existingUser.id,
          name: existingUser.userInfoId?.firstname || '',
          email: existingUser.email,
          role: existingUser.userInfoId?.role?.role || 'public user',
        };
      }

      // Use dynamic role assignment based on email domain rules
      let roleId =
        await this.enhancedRolesService.assignRoleByEmailDomain(email);

      // If no role matches email domain rules, assign default "public user" role
      if (!roleId) {
        const publicRole = await this.prisma.userRole.findFirst({
          where: { role: 'public user' },
        });

        if (!publicRole) {
          throw new Error(
            'Default "public user" role not found. Please ensure it exists in the database.',
          );
        }

        roleId = publicRole.id;
        console.log(
          `No email domain rules matched for ${email}, assigned default "public user" role (ID: ${roleId})`,
        );
      } else {
        const assignedRole = await this.prisma.userRole.findUnique({
          where: { id: roleId },
        });
        console.log(
          `Email domain rule matched for ${email}, assigned "${assignedRole?.role}" role (ID: ${roleId})`,
        );
      }

      // Extract name from Firebase token or email
      const firstName =
        decodedToken.name?.split(' ')[0] ||
        email.split('@')[0].split('.')[0] ||
        'User';
      const lastName =
        decodedToken.name?.split(' ').slice(1).join(' ') ||
        email.split('@')[0].split('.')[1] ||
        '';

      // Create new user
      const newUser = await this.prisma.users.create({
        data: {
          email: email,
          providers: 'google',
          userInfoId: {
            create: {
              firstname: firstName,
              lastname: lastName,
              gender: 'Male', // Default gender, can be updated later
              roleId: roleId,
            },
          },
          session: {
            create: { token: firebaseToken },
          },
        },
        include: {
          userInfoId: {
            include: {
              role: true,
            },
          },
        },
      });

      return {
        access_token: firebaseToken,
        id: newUser.id,
        name: newUser.userInfoId?.firstname || '',
        email: newUser.email,
        role: newUser.userInfoId?.role?.role || 'public user',
      };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error(`Google login failed: ${error.message}`);
    }
  }

  async githubLogin(email: string, firebaseToken: string) {
    try {
      // Verify the Firebase token first
      const decodedToken =
        await this.firebaseService.verifyIdToken(firebaseToken);

      // Make sure the email from token matches the provided email
      if (decodedToken.email !== email) {
        throw new Error('Email mismatch between token and provided email');
      }

      // Check if user already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email: email },
        include: {
          userInfoId: {
            include: {
              role: true,
            },
          },
        },
      });

      if (existingUser) {
        // If user exists, update the token
        await this.prisma.session.upsert({
          where: { userId: existingUser.id },
          update: { token: firebaseToken },
          create: { userId: existingUser.id, token: firebaseToken },
        });

        return {
          access_token: firebaseToken,
          id: existingUser.id,
          name: existingUser.userInfoId?.firstname || '',
          email: existingUser.email,
          role: existingUser.userInfoId?.role?.role || 'public user',
        };
      }

      // Use dynamic role assignment based on email domain rules
      let roleId =
        await this.enhancedRolesService.assignRoleByEmailDomain(email);

      // If no role matches email domain rules, assign default "public user" role
      if (!roleId) {
        const publicRole = await this.prisma.userRole.findFirst({
          where: { role: 'public user' },
        });

        if (!publicRole) {
          throw new Error(
            'Default "public user" role not found. Please ensure it exists in the database.',
          );
        }

        roleId = publicRole.id;
        console.log(
          `No email domain rules matched for ${email}, assigned default "public user" role (ID: ${roleId})`,
        );
      } else {
        const assignedRole = await this.prisma.userRole.findUnique({
          where: { id: roleId },
        });
        console.log(
          `Email domain rule matched for ${email}, assigned "${assignedRole?.role}" role (ID: ${roleId})`,
        );
      }

      // Extract name from Firebase token or email
      const firstName =
        decodedToken.name?.split(' ')[0] ||
        email.split('@')[0].split('.')[0] ||
        'User';
      const lastName =
        decodedToken.name?.split(' ').slice(1).join(' ') ||
        email.split('@')[0].split('.')[1] ||
        '';

      // Create new user
      const newUser = await this.prisma.users.create({
        data: {
          email: email,
          providers: 'github',
          userInfoId: {
            create: {
              firstname: firstName,
              lastname: lastName,
              gender: 'Male', // Default gender, can be updated later
              roleId: roleId,
            },
          },
          session: {
            create: { token: firebaseToken },
          },
        },
        include: {
          userInfoId: {
            include: {
              role: true,
            },
          },
        },
      });

      return {
        access_token: firebaseToken,
        id: newUser.id,
        name: newUser.userInfoId?.firstname || '',
        email: newUser.email,
        role: newUser.userInfoId?.role?.role || 'public user',
      };
    } catch (error) {
      console.error('GitHub login error:', error);
      throw new Error(`GitHub login failed: ${error.message}`);
    }
  }
}
