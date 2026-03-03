/** Paginated result using offset-based pagination. */
export interface IPagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated result using cursor-based pagination. */
export interface ICursorPageResult<T> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
}

/** Common query options for list endpoints. */
export interface IListQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
