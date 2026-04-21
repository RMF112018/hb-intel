/**
 * React hook that delivers the merged Project Sites record set for a
 * user-selected scope.
 *
 * Flow:
 *   repository → raw Projects list rows + narrowed registry candidates
 *                + bounded/fetchedCount (post-cap retrieval signals)
 *   resolver   → merged `IProjectSiteEntry[]` (project-only, merged,
 *                synthetic legacy-only) with deterministic precedence
 *   hook       → wraps status, scope, bounded info, and error surface
 *
 * This hook does NOT run its own merge or normalization — the resolver
 * (`projectSitesResolver.ts`) is the single authority. It also does NOT
 * apply search / sort / filter / pagination; those are composed on top
 * of the merged entries by the consumer via `projectSitesFilter.ts` and
 * `projectSitesPagination.ts`.
 *
 * Scope model:
 *   - `{ kind: 'year', year }` — server-side filtered by `Year eq {year}`
 *   - `{ kind: 'all' }` — fully drained via paged iteration up to the
 *     repository's defense-in-depth ceiling
 */
import { useQuery } from '@tanstack/react-query';
import type {
  IProjectSiteEntry,
  IProjectSitesResult,
  ProjectSitesScope,
} from '../types.js';
import {
  resolveProjectSiteEntries,
  type IProjectSitesQueryResult,
} from '../projectSitesResolver.js';
import { getProjectSitesRepository } from '../repository/projectSitesRepository.js';

/**
 * Post-select shape passed through React Query's `select`. Carries the
 * resolved entries plus the retrieval signals the repository emitted so
 * both travel together through the query cache with a single identity.
 */
interface IResolvedProjectSitesData {
  entries: IProjectSiteEntry[];
  bounded: boolean;
  fetchedCount: number;
}

function selectResolved(raw: IProjectSitesQueryResult): IResolvedProjectSitesData {
  return {
    entries: resolveProjectSiteEntries(raw),
    bounded: raw.bounded ?? false,
    fetchedCount: raw.fetchedCount ?? 0,
  };
}

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
 * @returns `IProjectSitesResult` with status, entries, error info, and
 *          `bounded`/`fetchedCount` retrieval signals; or `null` when
 *          `scope` is still null (pre-initialization)
 */
export function useProjectSites(
  scope: ProjectSitesScope | null,
): IProjectSitesResult | null {
  const repository = getProjectSitesRepository();
  const enabled = scope !== null && (scope.kind === 'all' || (scope.kind === 'year' && scope.year > 0));

  const { data, isLoading, isError, error } = useQuery<
    IProjectSitesQueryResult,
    Error,
    IResolvedProjectSitesData
  >({
    queryKey: ['project-sites', scope ? scopeCacheKey(scope) : 'none'],
    queryFn: () => repository.fetchProjectSites(scope!),
    select: selectResolved,
    enabled,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });

  if (scope === null) {
    return null;
  }

  const entries = data?.entries ?? [];

  if (isLoading) {
    return {
      status: 'loading',
      scope,
      entries: [],
      errorMessage: null,
      bounded: false,
      fetchedCount: 0,
    };
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load project sites.';
    return {
      status: 'error',
      scope,
      entries: [],
      errorMessage: message,
      bounded: false,
      fetchedCount: 0,
    };
  }

  const bounded = data?.bounded ?? false;
  const fetchedCount = data?.fetchedCount ?? 0;

  if (entries.length === 0) {
    return {
      status: 'empty',
      scope,
      entries: [],
      errorMessage: null,
      bounded,
      fetchedCount,
    };
  }

  return {
    status: 'success',
    scope,
    entries,
    errorMessage: null,
    bounded,
    fetchedCount,
  };
}
