import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { JwtModule } from '@nestjs/jwt';
import { PermissionsModule } from '../permissions/permissions.module';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PermissionsModule,
    FirebaseModule,
  ],
  controllers: [TestController],
})
export class TestModule {}
