import { Controller, Get } from '@nestjs/common';
import { CsvService } from './csv.service';

@Controller('csv')
export class CsvController {
  constructor(private csvService: CsvService) {}

  @Get('/getCsv')
  getCsv() {
    // return this.csvService.getCsv();
  }

  @Get('readCsv')
  readCsv() {
    return this.csvService.csvData();
  }

  @Get('/setDataIndatabase')
  setDataIndatabase() {
    return this.csvService.setDataIndatabase();
  }

  @Get('allbook')
  getAllBook() {
    return this.csvService.getAllBook();
  }
}
