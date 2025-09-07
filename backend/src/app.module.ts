import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvModule } from './util/csv/csv.module';
import { PrismaModule } from './db/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserRoleModule } from './user-role/user-role.module';
import { BooksModule } from './books/books.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { TestModule } from './test/test.module';
import { AdminModule } from './admin/admin.module';
import { JwtMiddleware } from './auth/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { BorrowsModule } from './borrows/borrows.module';
@Module({
  imports: [
    CsvModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    UserRoleModule,
    BooksModule,
    RolesModule,
    PermissionsModule,
    FirebaseModule,
    TestModule,
    AdminModule,
  BorrowsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/getCsv');
  }
}
