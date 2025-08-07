import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password || ''))) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    console.log(user);
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
      name: user.userInfoId.firstname,
      email: user.email,
      role: user.userInfoId.role.role,
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

  async googleLogin(email: string, token: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });

    if (user) {
      // If user exists, update the token
      await this.prisma.session.upsert({
        where: { userId: user.id },
        update: { token },
        create: { userId: user.id, token },
      });
      return {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.userInfoId?.role?.role || 'public user',
        },
      };
    }

    // Determine role based on email domain
    let roleId: number;
    if (email.endsWith('@darshan.ac.in')) {
      const studentRole = await this.prisma.userRole.findFirst({
        where: { role: 'Student' },
      });
      roleId = studentRole?.id || 1; // Default to ID 1 if Student role not found
    } else {
      const publicRole = await this.prisma.userRole.findFirst({
        where: { role: 'public user' },
      });
      roleId = publicRole?.id || 1; // Default to ID 1 if public user role not found
    }

    // Extract name from email for userInfo
    const emailName = email.split('@')[0];
    const firstName = emailName.split('.')[0] || emailName;
    const lastName = emailName.split('.')[1] || '';

    // Generate a unique temporary phone number for social login users
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    // const tempPhone = `temp_google_${timestamp}_${randomSuffix}`;

    // If user doesn't exist, create a new user with userInfo and appropriate role
    const newUser = await this.prisma.users.create({
      data: {
        email: email,
        providers: 'google',
        userInfoId: {
          create: {
            firstname: firstName,
            lastname: lastName,
            // phone: tempPhone, // Unique temporary phone number
            gender: 'Male', // Default gender, can be updated later
            roleId: roleId,
          },
        },
        session: {
          create: { token: token },
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
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.userInfoId?.role?.role || 'public user',
      },
    };
  }

  async githubLogin(email: string, token: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
      include: {
        userInfoId: {
          include: {
            role: true,
          },
        },
      },
    });

    if (user) {
      // If user exists, update the token
      await this.prisma.session.upsert({
        where: { userId: user.id },
        update: { token },
        create: { userId: user.id, token },
      });
      return {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.userInfoId?.role?.role || 'public user',
        },
      };
    }

    // Determine role based on email domain
    let roleId: number;
    if (email.endsWith('@darshan.ac.in')) {
      const studentRole = await this.prisma.userRole.findFirst({
        where: { role: 'Student' },
      });
      roleId = studentRole?.id || 1; // Default to ID 1 if Student role not found
    } else {
      const publicRole = await this.prisma.userRole.findFirst({
        where: { role: 'public user' },
      });
      roleId = publicRole?.id || 1; // Default to ID 1 if public user role not found
    }

    // Extract name from email for userInfo
    const emailName = email.split('@')[0];
    const firstName = emailName.split('.')[0] || emailName;
    const lastName = emailName.split('.')[1] || '';

    // Generate a unique temporary phone number for social login users
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    // const tempPhone = `temp_github_${timestamp}_${randomSuffix}`;

    // If user doesn't exist, create a new user with userInfo and appropriate role
    const newUser = await this.prisma.users.create({
      data: {
        email: email,
        providers: 'github',
        userInfoId: {
          create: {
            firstname: firstName,
            lastname: lastName,
            // phone: tempPhone, // Unique temporary phone number
            gender: 'Male', // Default gender, can be updated later
            roleId: roleId,
          },
        },
        session: {
          create: { token: token },
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
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.userInfoId?.role?.role || 'public user',
      },
    };
  }
}
