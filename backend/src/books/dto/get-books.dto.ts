import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetBooksDto extends PaginationDto {
  category?: string;
}

export interface BookResponse {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  status: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
}
