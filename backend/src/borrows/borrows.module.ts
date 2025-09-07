import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BorrowsService } from './borrows.service';
import { BorrowsController } from './borrows.controller';
import { PrismaModule } from '../db/prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    AuthModule,
    FirebaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [BorrowsController],
  providers: [BorrowsService],
})
export class BorrowsModule {}
