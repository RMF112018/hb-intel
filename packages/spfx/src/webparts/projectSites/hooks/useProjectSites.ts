/**
 * React hook that queries the HBCentral Projects list for project sites
 * matching the resolved page year.
 *
 * Uses PnPjs v4 with SPFx context from @hbc/auth/spfx and @tanstack/react-query
 * for caching, loading, and error state management.
 *
 * @see resolvePageYear.ts — page-year resolution seam
 * @see normalizeProjectSiteEntry.ts — raw-to-UI normalization
 */
import { useQuery } from '@tanstack/react-query';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSpfxContext } from '@hbc/auth/spfx';
import type {
  IResolvedPageYear,
  IRawProjectSiteItem,
  IProjectSitesResult,
} from '../types.js';
import {
  SP_PROJECTS_FIELDS,
  SP_PROJECTS_SELECT,
} from '../types.js';
import { normalizeProjectSiteEntries } from '../normalizeProjectSiteEntry.js';

/** SharePoint list title on HBCentral. */
const PROJECTS_LIST_TITLE = 'Projects';

/** Stale time: 5 minutes — project list data changes infrequently. */
const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Fetch project site entries from the HBCentral Projects list.
 *
 * @param year - The resolved page year to filter by
 * @returns Normalized, sorted project site entries
 */
async function fetchProjectSites(year: number): Promise<IRawProjectSiteItem[]> {
  const context = getSpfxContext();
  const sp = spfi().using(SPFx(context));

  const items = await sp.web.lists
    .getByTitle(PROJECTS_LIST_TITLE)
    .items.filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${year}`)
    .select(...SP_PROJECTS_SELECT)();

  return items as IRawProjectSiteItem[];
}

/**
 * Hook: query project sites for the resolved page year.
 *
 * @param resolvedYear - Output of resolvePageYear(), or null if no year available
 * @returns IProjectSitesResult with status, entries, and error info
 */
export function useProjectSites(
  resolvedYear: IResolvedPageYear | null,
): IProjectSitesResult {
  const year = resolvedYear?.year ?? null;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites', year],
    queryFn: () => fetchProjectSites(year!),
    enabled: year !== null && year > 0,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });

  // No year resolved — configuration needed
  if (year === null) {
    return {
      status: 'no-year',
      resolvedYear: null,
      entries: [],
      errorMessage: null,
    };
  }

  // Loading
  if (isLoading) {
    return {
      status: 'loading',
      resolvedYear,
      entries: [],
      errorMessage: null,
    };
  }

  // Error
  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load project sites from the Projects list.';
    return {
      status: 'error',
      resolvedYear,
      entries: [],
      errorMessage: message,
    };
  }

  // Normalize and return
  const entries = normalizeProjectSiteEntries(data ?? []);

  if (entries.length === 0) {
    return {
      status: 'empty',
      resolvedYear,
      entries: [],
      errorMessage: null,
    };
  }

  return {
    status: 'success',
    resolvedYear,
    entries,
    errorMessage: null,
  };
}
