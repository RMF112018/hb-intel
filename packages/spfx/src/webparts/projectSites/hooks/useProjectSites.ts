/**
 * React hook that queries the HBCentral Projects list for project sites
 * in a user-selected scope.
 *
 * W01r-P12 scope model:
 *   - `{ kind: 'year', year }` — server-side filtered by `Year eq {year}`
 *   - `{ kind: 'all' }` — unfiltered, capped at `top(5000)`
 *
 * The hook does NOT apply search/sort/filter — those are composed on top
 * of the normalized entries by the consumer via `projectSitesFilter.ts`.
 *
 * Uses the canonical repository adapter which enforces an explicit `$select`
 * field contract and bounded all-projects strategy.
 */
import { useQuery } from '@tanstack/react-query';
import type {
  IProjectSitesResult,
  ProjectSitesScope,
} from '../types.js';
import { normalizeProjectSiteEntries } from '../normalizeProjectSiteEntry.js';
import { getProjectSitesRepository } from '../repository/projectSitesRepository.js';

/** Stale time: 5 minutes — project list data changes infrequently. */
const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Build a stable query-key suffix for the scope. Used by React Query so
 * year-scoped and all-projects scopes have distinct cache entries.
 */
function scopeCacheKey(scope: ProjectSitesScope): string {
  return scope.kind === 'year' ? `year:${scope.year}` : 'all';
}

/**
 * Hook: query project sites for the given scope.
 *
 * @param scope - Scope discriminated union; null means "not ready yet"
 * @returns `IProjectSitesResult` with status, entries, and error info, or
 *          `null` when `scope` is still null (pre-initialization)
 */
export function useProjectSites(
  scope: ProjectSitesScope | null,
): IProjectSitesResult | null {
  const repository = getProjectSitesRepository();
  const enabled = scope !== null && (scope.kind === 'all' || (scope.kind === 'year' && scope.year > 0));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites', scope ? scopeCacheKey(scope) : 'none'],
    queryFn: () => repository.fetchProjectSites(scope!),
    enabled,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });

  if (scope === null) {
    return null;
  }

  if (isLoading) {
    return {
      status: 'loading',
      scope,
      entries: [],
      errorMessage: null,
    };
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load project sites from the Projects list.';
    return {
      status: 'error',
      scope,
      entries: [],
      errorMessage: message,
    };
  }

  const entries = normalizeProjectSiteEntries(data ?? []);

  if (entries.length === 0) {
    return {
      status: 'empty',
      scope,
      entries: [],
      errorMessage: null,
    };
  }

  return {
    status: 'success',
    scope,
    entries,
    errorMessage: null,
  };
}
