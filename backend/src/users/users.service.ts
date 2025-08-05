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

    // Determine role based on email domain
    let role;
    if (email.endsWith('@darshan.ac.in')) {
      role = await this.prisma.userRole.findFirst({
        where: { role: 'Student' },
      });
    } else {
      role = await this.prisma.userRole.findFirst({
        where: { role: 'public user' },
      });
    }

    if (!role) {
      throw new BadRequestException(`Role not found`);
    }
    const birthDateString = info.dob; // e.g. "2006-07-07"
    const dob = birthDateString ? new Date(birthDateString) : null;

    console.log(info)

    const user = await this.prisma.users.create({
      data: {
        email,
        password: hash,
        userInfoId: {
          create: {
            firstname: info.firstName,
            lastname: info.lastName,
            phone: info.phone,
            gender: info.gender,
            dob: birthDateString,
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
      include: { 
        userInfoId: {
          include: {
            role: true
          }
        }
      },
    });
  }
}
