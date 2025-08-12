import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
  ) {
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'all') {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    // Get total count for pagination
    const totalCount = await this.prisma.book_master.count({
      where: whereClause,
    });

    // Get paginated results
    const bookMasters = await this.prisma.book_master.findMany({
      where: whereClause,
      include: {
        books: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const books = bookMasters.map((bookMaster) => {
      const availableCopies = bookMaster.books.filter(
        (book) => book.status === 'available',
      ).length;

      return {
        id: bookMaster.id.toString(),
        title: bookMaster.title,
        author: bookMaster.author,
        isbn: bookMaster.title, // Using title as ISBN since schema doesn't have ISBN
        description: bookMaster.description || '',
        category: bookMaster.category || 'Other',
        status: availableCopies > 0 ? 'available' : 'checked_out',
        publishedYear: bookMaster.publish_year || new Date().getFullYear(),
        totalCopies: bookMaster.total_books,
        availableCopies: availableCopies,
        thumbnail: bookMaster.thumbnail || null,
        createdAt: bookMaster.createdAt.toISOString(),
      };
    });

    return {
      books,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getCategories() {
    const categories = await this.prisma.book_master.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: {
          not: null,
        },
      },
    });

    return categories
      .map((item) => item.category)
      .filter((category) => category && category.trim() !== '')
      .sort();
  }

  async findById(id: number) {
    const bookMaster = await this.prisma.book_master.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!bookMaster) {
      throw new Error('Book not found');
    }

    const availableCopies = bookMaster.books.filter(
      (book) => book.status === 'available',
    ).length;

    return {
      id: bookMaster.id.toString(),
      title: bookMaster.title,
      author: bookMaster.author,
      isbn: bookMaster.title,
      description: bookMaster.description || '',
      category: bookMaster.category || 'Other',
      status: availableCopies > 0 ? 'available' : 'checked_out',
      publishedYear: bookMaster.publish_year || new Date().getFullYear(),
      totalCopies: bookMaster.total_books,
      availableCopies: availableCopies,
      thumbnail: bookMaster.thumbnail || null,
      createdAt: bookMaster.createdAt.toISOString(),
    };
  }

  async create(createBookDto: any) {
    const {
      title,
      author,
      isbn,
      description,
      category,
      publishedYear,
      totalCopies,
      status,
      thumbnail,
    } = createBookDto;

    // Create book master
    const bookMaster = await this.prisma.book_master.create({
      data: {
        title,
        author,
        Publisher: author, // Using author as publisher
        description,
        category,
        publish_year: publishedYear,
        total_books: totalCopies,
        thumbnail: thumbnail || null,
        books: {
          create: Array.from({ length: totalCopies }, (_, i) => ({
            barcode: `${title.replace(/\s+/g, '')}_${i + 1}`,
            status: status || 'available',
            location: 'Main Library',
          })),
        },
      },
      include: {
        books: true,
      },
    });

    const availableCopies = bookMaster.books.filter(
      (book) => book.status === 'available',
    ).length;

    return {
      id: bookMaster.id.toString(),
      title: bookMaster.title,
      author: bookMaster.author,
      isbn: isbn || title,
      description: bookMaster.description || '',
      category: bookMaster.category || 'Other',
      status: availableCopies > 0 ? 'available' : 'checked_out',
      publishedYear: bookMaster.publish_year || new Date().getFullYear(),
      totalCopies: bookMaster.total_books,
      availableCopies: availableCopies,
      thumbnail: bookMaster.thumbnail || null,
      createdAt: bookMaster.createdAt.toISOString(),
    };
  }

  async update(id: number, updateBookDto: any) {
    const {
      title,
      author,
      isbn,
      description,
      category,
      publishedYear,
      totalCopies,
      availableCopies,
      status,
      thumbnail,
    } = updateBookDto;

    // Update book master
    const bookMaster = await this.prisma.book_master.update({
      where: { id },
      data: {
        title,
        author,
        description,
        category,
        publish_year: publishedYear,
        total_books: totalCopies,
        thumbnail: thumbnail !== undefined ? thumbnail : undefined,
      },
      include: {
        books: true,
      },
    });

    // If totalCopies changed, we need to adjust the books
    const currentBookCount = bookMaster.books.length;
    if (totalCopies > currentBookCount) {
      // Add more books
      const newBooksCount = totalCopies - currentBookCount;
      await this.prisma.books.createMany({
        data: Array.from({ length: newBooksCount }, (_, i) => ({
          book_master_id: id,
          barcode: `${title.replace(/\s+/g, '')}_${currentBookCount + i + 1}`,
          status: 'available',
          location: 'Main Library',
        })),
      });
    } else if (totalCopies < currentBookCount) {
      // Remove excess books (only available ones)
      const booksToRemove = currentBookCount - totalCopies;
      const availableBooks = bookMaster.books.filter(
        (book) => book.status === 'available',
      );
      if (availableBooks.length >= booksToRemove) {
        await this.prisma.books.deleteMany({
          where: {
            id: {
              in: availableBooks.slice(0, booksToRemove).map((book) => book.id),
            },
          },
        });
      }
    }

    // Get updated book master
    const updatedBookMaster = await this.prisma.book_master.findUnique({
      where: { id },
      include: { books: true },
    });

    if (!updatedBookMaster) {
      throw new Error('Book not found after update');
    }

    const updatedAvailableCopies = updatedBookMaster.books.filter(
      (book) => book.status === 'available',
    ).length;

    return {
      id: updatedBookMaster.id.toString(),
      title: updatedBookMaster.title,
      author: updatedBookMaster.author,
      isbn: isbn || title,
      description: updatedBookMaster.description || '',
      category: updatedBookMaster.category || 'Other',
      status: updatedAvailableCopies > 0 ? 'available' : 'checked_out',
      publishedYear: updatedBookMaster.publish_year || new Date().getFullYear(),
      totalCopies: updatedBookMaster.total_books,
      availableCopies: updatedAvailableCopies,
      thumbnail: updatedBookMaster.thumbnail || null,
      createdAt: updatedBookMaster.createdAt.toISOString(),
    };
  }

  async delete(id: number) {
    // Delete all associated books first
    await this.prisma.books.deleteMany({
      where: { book_master_id: id },
    });

    // Delete the book master
    await this.prisma.book_master.delete({
      where: { id },
    });

    return { message: 'Book deleted successfully' };
  }
}
