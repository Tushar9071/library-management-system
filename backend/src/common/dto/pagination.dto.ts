export class PaginationDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationResponse;
}
