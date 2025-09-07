import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { BorrowsService } from './borrows.service';

@Controller('/borrows')
@UseGuards(PermissionGuard)
export class BorrowsController {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Post(':bookMasterId')
  @RequirePermissions('BORROW_BOOKS')
  async borrowBook(
    @Param('bookMasterId') bookMasterId: string,
    @Req() req: any,
  ) {
    const userId = Number(req.userId);
    const result = await this.borrowsService.borrowBook(
      userId,
      parseInt(bookMasterId),
    );
    return { message: 'Book borrowed successfully', data: result };
  }

  @Post('return/:bookId')
  @RequirePermissions('BORROW_BOOKS')
  async returnBook(@Param('bookId') bookId: string, @Req() req: any) {
    const userId = Number(req.userId);
    const result = await this.borrowsService.returnBook(userId, parseInt(bookId));
    return { message: 'Book returned successfully', data: result };
  }

  @Get('my')
  @RequirePermissions('BORROW_BOOKS')
  async myActiveBorrows(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '10') {
    const userId = Number(req.userId);
    const { items, pagination } = await this.borrowsService.getMyActiveBorrows(
      userId,
      parseInt(page) || 1,
      Math.min(Math.max(parseInt(limit) || 10, 1), 100),
    );
    return { message: 'Active borrows', data: items, pagination };
  }

  @Get('history')
  @RequirePermissions('BORROW_BOOKS')
  async myBorrowHistory(@Req() req: any, @Query('page') page = '1', @Query('limit') limit = '10') {
    const userId = Number(req.userId);
    const { items, pagination } = await this.borrowsService.getMyBorrowHistory(
      userId,
      parseInt(page) || 1,
      Math.min(Math.max(parseInt(limit) || 10, 1), 100),
    );
    return { message: 'Borrow history', data: items, pagination };
  }
}
