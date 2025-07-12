import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as path from 'path';
import { PrismaService } from 'src/db/prisma/prisma.service';
@Injectable()
export class CsvService {
  constructor(private prisma: PrismaService) {}
  async csvData() {
    const data = await this.readCsv();
    const returndata = data.map((item) => {
      return {
        title: item.title || '',
        author: item.authors || '',
        publish_year: item.published_year || 0,
        subtitle: item.subtitle || '',
        category: item.categories || '',
        description: item.description || '',
        total_books: Math.floor(Math.random() * 6) + 1,
        pages: item.num_pages || 0,
        avg_rating: item.average_rating || 0,
        rating_count: item.ratings_count || 0,
        penalty: 50,
        language: item.language || 'english',
      };
    });
    return returndata;
  }

  async readCsv(): Promise<any[]> {
    const results: any[] = [];

    const filePath = path.resolve(process.cwd(), 'src', 'assets', 'data.csv');
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  async setDataIndatabase() {
    const data = await this.csvData();
    for (const book of data) {
      let master = await this.prisma.book_master.findUnique({
        where: { title: book.title },
      });
      if (!master) {
        master = await this.prisma.book_master.create({
          data: {
            title: book.title,
            author: book.author,
            publish_year: parseInt(book.publish_year) || 0,
            subtitle: book.subtitle,
            category: book.category,
            description: book.description,
            total_books: book.total_books || 1,
            pages: parseInt(book.pages) || 0,
            avg_rating: parseFloat(book.avg_rating) || 0,
            rating_count: parseInt(book.rating_count) || 0,
            penalty: book.penalty,
            language: book.language,
          },
        });
      }
      const books = Array.from({ length: book.total_books }, () => ({
        book_master_id: master.id,
        location: 'CH-20/5',
      }));
      await this.prisma.books.createMany({ data: books });
    }
    return {
      message: 'Books and copies inserted successfully',
      count: data.length,
    };
  }
}
