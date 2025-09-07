import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';

@Injectable()
export class BorrowsService {
  constructor(private prisma: PrismaService) {}

  private async getRolePolicyByUserId(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        userInfoId: {
          include: { role: true },
        },
      },
    });
    if (!user || !user.userInfoId) throw new NotFoundException('User not found');
    const role = user.userInfoId.role;
    return {
      maxBorrowDays: role.maxBorrowDays ?? 15,
      dailyFine: role.dailyFine ?? 5,
      maxActiveBorrows: role.maxActiveBorrows ?? 3,
    };
  }

  async borrowBook(userId: number, bookMasterId: number) {
    // Check role policy
    const policy = await this.getRolePolicyByUserId(userId);

    // Check current active borrows count
    const activeCount = await this.prisma.books_history.count({
      where: { user_id: userId },
    });
    if (activeCount >= policy.maxActiveBorrows) {
      throw new BadRequestException(
        `You have reached your active borrows limit (${policy.maxActiveBorrows})`,
      );
    }

    // Find an available physical book (copy)
    const availableBook = await this.prisma.books.findFirst({
      where: { book_master_id: bookMasterId, status: 'available' },
      orderBy: { id: 'asc' },
    });
    if (!availableBook) {
      throw new BadRequestException('No available copies for this title');
    }

    const today = new Date();
    const lastDate = new Date(today);
    lastDate.setDate(lastDate.getDate() + policy.maxBorrowDays);

    // Create borrow history and mark book as checked out in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const history = await tx.books_history.create({
        data: {
          user_id: userId,
          book_id: availableBook.id,
          borrow_date: today,
          last_date: lastDate,
        },
      });

      await tx.books.update({
        where: { id: availableBook.id },
        data: { status: 'checked_out' },
      });

      return { history, book: availableBook, dueDate: lastDate };
    });

    return {
      bookId: result.book.id,
      bookMasterId,
      borrowDate: result.history.borrow_date.toISOString(),
      dueDate: result.history.last_date.toISOString(),
      maxBorrowDays: policy.maxBorrowDays,
    };
  }

  async returnBook(userId: number, bookId: number) {
    // Find active borrow
    const history = await this.prisma.books_history.findFirst({
      where: { user_id: userId, book_id: bookId },
      orderBy: { id: 'desc' },
    });
    if (!history) throw new NotFoundException('Active borrow not found');

    const today = new Date();
    const isLate = today > history.last_date;
    const policy = await this.getRolePolicyByUserId(userId);
    let fine = 0;
    if (isLate) {
      const daysLate = Math.ceil(
        (today.getTime() - history.last_date.getTime()) / (1000 * 60 * 60 * 24),
      );
      fine = daysLate * (policy.dailyFine ?? 5);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.submitted_books_history.create({
        data: {
          user_id: userId,
          book_id: bookId,
          borrow_date: history.borrow_date,
          last_date: history.last_date,
          submitted_date: today,
        },
      });

      await tx.books_history.delete({ where: { id: history.id } });

      await tx.books.update({ where: { id: bookId }, data: { status: 'available' } });

      return { fine };
    });

    return { bookId, fine, returnedAt: today.toISOString() };
  }

  async getMyActiveBorrows(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const totalCount = await this.prisma.books_history.count({ where: { user_id: userId } });
    const rows = await this.prisma.books_history.findMany({
      where: { user_id: userId },
      include: {
        books: { include: { book_master: true } },
      },
      orderBy: { borrow_date: 'desc' },
      skip,
      take: limit,
    });

    const items = rows.map((r) => {
      const now = new Date();
      const overdueDays = Math.max(0, Math.ceil((now.getTime() - r.last_date.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: r.id,
        bookId: r.book_id,
        title: r.books.book_master.title,
        author: r.books.book_master.author,
        borrowDate: r.borrow_date.toISOString(),
        dueDate: r.last_date.toISOString(),
        overdueDays,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  async getMyBorrowHistory(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const totalCount = await this.prisma.submitted_books_history.count({ where: { user_id: userId } });
    const rows = await this.prisma.submitted_books_history.findMany({
      where: { user_id: userId },
      include: {
        books: { include: { book_master: true } },
      },
      orderBy: { submitted_date: 'desc' },
      skip,
      take: limit,
    });

    const items = rows.map((r) => {
      const daysLate = Math.max(0, Math.ceil((r.submitted_date.getTime() - r.last_date.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        id: r.id,
        bookId: r.book_id,
        title: r.books.book_master.title,
        author: r.books.book_master.author,
        borrowDate: r.borrow_date.toISOString(),
        dueDate: r.last_date.toISOString(),
        returnedAt: r.submitted_date.toISOString(),
        daysLate,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }
}
