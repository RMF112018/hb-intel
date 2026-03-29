/**
 * React hook that queries the HBCentral Projects list for project sites
 * matching the selected year.
 *
 * Uses a resilient two-pass query strategy:
 *   1. Try full select (all custom fields)
 *   2. On 400 error, retry with core-only select (Id, Title, Year)
 *
 * This handles the case where custom field internal names don't match
 * the expected names (e.g., SharePoint renamed them during creation).
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
} from '../types.js';
import {
  SP_PROJECTS_FIELDS,
  SP_PROJECTS_FULL_SELECT,
  SP_PROJECTS_CORE_SELECT,
} from '../types.js';
import { normalizeProjectSiteEntries } from '../normalizeProjectSiteEntry.js';

/** SharePoint list title on HBCentral. */
const PROJECTS_LIST_TITLE = 'Projects';

/** Stale time: 5 minutes — project list data changes infrequently. */
const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Fetch project site entries with resilient field selection.
 *
 * Tries the full select first. If SharePoint returns 400 (field not found),
 * retries with core-only select (Id, Title, Year). The normalizer handles
 * both cases by falling back to Title parsing when custom fields are absent.
 */
async function fetchProjectSites(year: number): Promise<IRawProjectSiteItem[]> {
  const context = getSpfxContext();
  const sp = spfi().using(SPFx(context));
  const list = sp.web.lists.getByTitle(PROJECTS_LIST_TITLE);
  const filter = `${SP_PROJECTS_FIELDS.YEAR} eq ${year}`;

  // Pass 1: try full select with all custom fields
  try {
    const items = await list.items
      .filter(filter)
      .select(...SP_PROJECTS_FULL_SELECT)();
    return items as IRawProjectSiteItem[];
  } catch (err) {
    // Only retry on 400 (bad field name) — other errors should propagate
    const is400 =
      err instanceof Error &&
      (err.message.includes('[400]') || err.message.includes('does not exist'));
    if (!is400) throw err;

    console.warn(
      '[ProjectSites] Full select failed (likely missing field), retrying with core fields only:',
      err.message,
    );
  }

  // Pass 2: core-only select (Id, Title, Year) — always works
  const items = await list.items
    .filter(filter)
    .select(...SP_PROJECTS_CORE_SELECT)();
  return items as IRawProjectSiteItem[];
}

/**
 * Hook: query project sites for the selected year.
 *
 * @param selectedYear - The year selected in the UI, or null if none selected yet
 * @returns IProjectSitesResult with status, entries, and error info
 */
export function useProjectSites(
  selectedYear: number | null,
): IProjectSitesResult | null {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites', selectedYear],
    queryFn: () => fetchProjectSites(selectedYear!),
    enabled: selectedYear !== null && selectedYear > 0,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });

  // No year selected yet — don't return a result
  if (selectedYear === null) {
    return null;
  }

  if (isLoading) {
    return {
      status: 'loading',
      selectedYear,
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
      selectedYear,
      entries: [],
      errorMessage: message,
    };
  }

  const entries = normalizeProjectSiteEntries(data ?? []);

  if (entries.length === 0) {
    return {
      status: 'empty',
      selectedYear,
      entries: [],
      errorMessage: null,
    };
  }

  return {
    status: 'success',
    selectedYear,
    entries,
    errorMessage: null,
  };
}
