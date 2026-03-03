import type { IPagedResult, IListQueryOptions } from '@hbc/models';
import { MOCK_DEFAULT_PAGE_SIZE } from './constants.js';

/**
 * Paginate an in-memory array according to {@link IListQueryOptions}.
 */
export function paginate<T>(items: T[], options?: IListQueryOptions): IPagedResult<T> {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? MOCK_DEFAULT_PAGE_SIZE;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

let nextId = 1000;

/** Generate a unique numeric ID for mock entities. */
export function genId(): number {
  return nextId++;
}

/** Reset the ID counter (useful for deterministic tests). */
export function resetId(start = 1000): void {
  nextId = start;
}
