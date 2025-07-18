export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginationParams {
  page?: number = 1;
  limit?: number = 10;
}
