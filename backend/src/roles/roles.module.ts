import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { UserRoleService } from '../user-role/user-role.service';
import { PrismaModule } from '../db/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [RolesController],
  providers: [UserRoleService],
  exports: [UserRoleService],
})
export class RolesModule {}
