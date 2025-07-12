import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvModule } from './csv/csv.module';
import { PrismaModule } from './db/prisma/prisma.module';

@Module({
  imports: [CsvModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
