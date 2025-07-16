import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string, info: any) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hash = await bcrypt.hash(password, 10);

    const role = await this.prisma.userRole.findFirst({
      where: { role: 'public user' },
    });

    if (!role) {
      throw new BadRequestException(`Role 'User' not found`);
    }

    const user = await this.prisma.users.create({
      data: {
        email,
        password: hash,
        userInfoId: {
          create: {
            ...info,
            dob: new Date(info.dob),
            roleId: role.id,
          },
        },
      },
      include: {
        userInfoId: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
      include: { userInfoId: true },
    });
  }
}
