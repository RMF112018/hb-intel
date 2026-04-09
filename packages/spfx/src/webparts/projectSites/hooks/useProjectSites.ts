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
 * Does NOT use `$select` — SharePoint returns all fields. This eliminates
 * field-name mismatch issues between the legacy `field_N` columns and the
 * W01r-P12 display-name columns. The normalizer reads whichever fields are
 * present and falls back to Title parsing for missing custom fields.
 */
import { useQuery } from '@tanstack/react-query';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSpfxContext } from '@hbc/auth/spfx';
import type {
  IRawProjectSiteItem,
  IProjectSitesResult,
  ProjectSitesScope,
} from '../types.js';
import { SP_PROJECTS_FIELDS } from '../types.js';
import { normalizeProjectSiteEntries } from '../normalizeProjectSiteEntry.js';

/** SharePoint list title on HBCentral. */
const PROJECTS_LIST_TITLE = 'Projects';

/** Stale time: 5 minutes — project list data changes infrequently. */
const STALE_TIME_MS = 5 * 60 * 1000;

/** Hard cap on `All Projects` scope fetches to keep the client set bounded. */
const ALL_PROJECTS_TOP = 5000;

/**
 * Build a stable query-key suffix for the scope. Used by React Query so
 * year-scoped and all-projects scopes have distinct cache entries.
 */
function scopeCacheKey(scope: ProjectSitesScope): string {
  return scope.kind === 'year' ? `year:${scope.year}` : 'all';
}

/**
 * Fetch project site entries from the HBCentral Projects list for the
 * given scope. No `$select` — returns all fields to avoid internal-name
 * mismatches.
 */
async function fetchProjectSites(scope: ProjectSitesScope): Promise<IRawProjectSiteItem[]> {
  const context = getSpfxContext();
  const sp = spfi().using(SPFx(context));

  const list = sp.web.lists.getByTitle(PROJECTS_LIST_TITLE);

  if (scope.kind === 'year') {
    const items = await list.items.filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${scope.year}`)();
    return items as IRawProjectSiteItem[];
  }

  // All Projects scope — bounded fetch, no year filter.
  const items = await list.items.top(ALL_PROJECTS_TOP)();
  return items as IRawProjectSiteItem[];
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
  const enabled = scope !== null && (scope.kind === 'all' || (scope.kind === 'year' && scope.year > 0));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites', scope ? scopeCacheKey(scope) : 'none'],
    queryFn: () => fetchProjectSites(scope!),
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
