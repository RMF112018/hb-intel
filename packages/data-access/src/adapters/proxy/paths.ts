/**
 * Route builder helpers for B1 proxy adapters.
 *
 * All project-scoped domains use nested paths per D6 lock:
 *   /projects/{projectId}/{domain}
 *   /projects/{projectId}/{domain}/{id}
 *
 * All collections use plural naming per D1 lock.
 */

import type { IListQueryOptions } from '@hbc/models';

/**
 * Build query parameter entries from IListQueryOptions.
 * Only includes defined, non-default values.
 */
export function buildQueryParams(options?: IListQueryOptions): Record<string, string> {
  if (!options) return {};

  const params: Record<string, string> = {};
  if (options.page !== undefined) params.page = String(options.page);
  if (options.pageSize !== undefined) params.pageSize = String(options.pageSize);
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.sortOrder) params.sortOrder = options.sortOrder;
  if (options.search) params.search = options.search;
  return params;
}

/**
 * Build a project-scoped resource path (D6 locked: nested pattern).
 *
 * @example buildProjectScopedPath('uuid-123', 'schedules') → '/projects/uuid-123/schedules'
 * @example buildProjectScopedPath('uuid-123', 'schedules', 42) → '/projects/uuid-123/schedules/42'
 */
export function buildProjectScopedPath(
  projectId: string,
  domain: string,
  id?: string | number,
): string {
  const base = `/projects/${projectId}/${domain}`;
  return id !== undefined ? `${base}/${id}` : base;
}

/**
 * Build a top-level resource path (non-project-scoped).
 *
 * @example buildResourcePath('leads') → '/leads'
 * @example buildResourcePath('leads', 42) → '/leads/42'
 */
export function buildResourcePath(
  resource: string,
  id?: string | number,
): string {
  const base = `/${resource}`;
  return id !== undefined ? `${base}/${id}` : base;
}
