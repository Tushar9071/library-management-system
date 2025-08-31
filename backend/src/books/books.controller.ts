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
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';

@Controller('/books')
@UseGuards(PermissionGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('test-no-auth')
  async getTestBooks() {
    try {
      const result = await this.booksService.findAll(1, 10);
      return {
        message: 'Test books retrieved successfully (no auth)',
        data: result.books,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        message: 'Error retrieving books',
        error: error.message,
        stack: error.stack,
      };
    }
  }

  @Get()
  @RequirePermissions('READ_BOOKS')
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
  @RequirePermissions('READ_BOOKS')
  async getCategories() {
    const categories = await this.booksService.getCategories();
    return {
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get(':id')
  @RequirePermissions('READ_BOOKS')
  async getBookById(@Param('id') id: string) {
    const book = await this.booksService.findById(parseInt(id));
    return {
      message: 'Book retrieved successfully',
      data: book,
    };
  }

  @Post()
  @RequirePermissions('CREATE_BOOKS')
  async createBook(@Body() createBookDto: any) {
    const book = await this.booksService.create(createBookDto);
    return {
      message: 'Book created successfully',
      data: book,
    };
  }

  @Put(':id')
  @RequirePermissions('UPDATE_BOOKS')
  async updateBook(@Param('id') id: string, @Body() updateBookDto: any) {
    const book = await this.booksService.update(parseInt(id), updateBookDto);
    return {
      message: 'Book updated successfully',
      data: book,
    };
  }

  @Delete(':id')
  @RequirePermissions('DELETE_BOOKS')
  async deleteBook(@Param('id') id: string) {
    await this.booksService.delete(parseInt(id));
    return {
      message: 'Book deleted successfully',
      data: null,
    };
  }
}
