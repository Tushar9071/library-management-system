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
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    // Save in session table
    await this.prisma.session.upsert({
      where: { userId: user.id },
      update: { token },
      create: { userId: user.id, token },
    });

    return { access_token: token };
  }

  async logout(userId: number) {
    await this.prisma.session.delete({ where: { userId } });
    return { message: 'Logged out' };
  }
}
