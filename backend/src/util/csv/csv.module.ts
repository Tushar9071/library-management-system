import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { PrismaModule } from 'src/db/prisma/prisma.module';

@Module({
  controllers: [CsvController],
  providers: [CsvService],
  imports: [PrismaModule],
})
export class CsvModule {}
