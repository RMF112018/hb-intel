/**
 * Common query options for list/search endpoints.
 *
 * All fields are optional — consumers pass only the parameters they need.
 *
 * @example
 * ```ts
 * const opts: IListQueryOptions = {
 *   page: 1,
 *   pageSize: 25,
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc',
 *   search: 'highway',
 * };
 * ```
 */
export interface IListQueryOptions {
  /** Page number (1-based). */
  page?: number;
  /** Number of items per page. */
  pageSize?: number;
  /** Field name to sort by. */
  sortBy?: string;
  /** Sort direction. */
  sortOrder?: 'asc' | 'desc';
  /** Free-text search string applied server-side. */
  search?: string;
}
