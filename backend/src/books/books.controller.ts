import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtMiddleware } from '../auth/jwt.middleware';

@Controller('api/books')
@UseGuards(JwtMiddleware)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getAllBooks() {
    const books = await this.booksService.findAll();
    return {
      message: 'Books retrieved successfully',
      data: books,
    };
  }

  @Get(':id')
  async getBookById(@Param('id') id: string) {
    const book = await this.booksService.findById(parseInt(id));
    return {
      message: 'Book retrieved successfully',
      data: book,
    };
  }

  @Post()
  async createBook(@Body() createBookDto: any) {
    const book = await this.booksService.create(createBookDto);
    return {
      message: 'Book created successfully',
      data: book,
    };
  }

  @Put(':id')
  async updateBook(@Param('id') id: string, @Body() updateBookDto: any) {
    const book = await this.booksService.update(parseInt(id), updateBookDto);
    return {
      message: 'Book updated successfully',
      data: book,
    };
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: string) {
    await this.booksService.delete(parseInt(id));
    return {
      message: 'Book deleted successfully',
      data: null,
    };
  }
}
