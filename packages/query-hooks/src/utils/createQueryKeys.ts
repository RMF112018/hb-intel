/**
 * Query-key factory helper — Blueprint §2g
 *
 * Produces a consistent key structure per domain:
 *   { all, lists(), list(opts), details(), detail(id) }
 *
 * `all` is a static readonly array (NOT a function) so existing
 * invalidation code can use `queryKeys.leads.all` without parentheses.
 */

export interface QueryKeySet<TId = number> {
  /** Static root key — used for broad invalidation. */
  readonly all: readonly [string];
  /** Base key for list queries. */
  lists: () => readonly [string, 'list'];
  /** Key for a filtered/paginated list. */
  list: (opts?: Record<string, unknown>) => readonly [string, 'list', Record<string, unknown> | undefined];
  /** Base key for detail queries. */
  details: () => readonly [string, 'detail'];
  /** Key for a single entity by id. */
  detail: (id: TId) => readonly [string, 'detail', TId];
}

/**
 * Creates the standard CRUD key set for a domain.
 *
 * @param domain - Unique domain identifier (e.g. 'leads', 'schedule')
 * @returns QueryKeySet with static `all` and functional list/detail builders
 */
export function createQueryKeys<TId = number>(domain: string): QueryKeySet<TId> {
  const all = [domain] as const;

  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (opts?: Record<string, unknown>) => [...all, 'list', opts] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: TId) => [...all, 'detail', id] as const,
  };
}
