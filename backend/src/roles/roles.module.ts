import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { UserRoleService } from '../user-role/user-role.service';
import { EnhancedRolesService } from './enhanced-roles.service';
import { PrismaModule } from '../db/prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { FirebaseModule } from '../common/firebase/firebase.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    FirebaseModule, // Import FirebaseModule to get FirebaseService
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [RolesController],
  providers: [UserRoleService, EnhancedRolesService],
  exports: [UserRoleService, EnhancedRolesService],
})
export class RolesModule {}
