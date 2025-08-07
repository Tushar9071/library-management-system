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
  async readCsv() {
    const data = await this.csvService.csvData();
    return {
      message: 'CSV data retrieved successfully',
      data: data,
    };
  }

  @Get('/setDataIndatabase')
  async setDataIndatabase() {
    const result = await this.csvService.setDataIndatabase();
    return {
      message: 'Data inserted into database successfully',
      data: result,
    };
  }

  @Get('allbook')
  async getAllBook() {
    const books = await this.csvService.getAllBook();
    return {
      message: 'All books retrieved successfully',
      data: books,
    };
  }
}
