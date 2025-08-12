import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtMiddleware } from '../auth/jwt.middleware';

@Controller('/books')
@UseGuards(JwtMiddleware)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async getAllBooks(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Ensure reasonable limits
    const validLimit = Math.min(Math.max(limitNum, 1), 100);

    const result = await this.booksService.findAll(
      pageNum,
      validLimit,
      search,
      category,
    );
    return {
      message: 'Books retrieved successfully',
      data: result.books,
      pagination: result.pagination,
    };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.booksService.getCategories();
    return {
      message: 'Categories retrieved successfully',
      data: categories,
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
