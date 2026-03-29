/**
 * React hook that fetches distinct Year values from the HBCentral Projects list.
 *
 * Returns a sorted (descending) array of valid years for the year selector UI.
 * Uses PnPjs v4 with SPFx context and @tanstack/react-query for caching.
 */
import { useQuery } from '@tanstack/react-query';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getSpfxContext } from '@hbc/auth/spfx';
import type { IAvailableYearsResult } from '../types.js';
import { SP_PROJECTS_FIELDS, isValidYear } from '../types.js';

/** SharePoint list title on HBCentral. */
const PROJECTS_LIST_TITLE = 'Projects';

/** Stale time: 10 minutes — year list changes very infrequently. */
const STALE_TIME_MS = 10 * 60 * 1000;

/**
 * Fetch all Year values from the Projects list and deduplicate client-side.
 * PnPjs/SharePoint REST does not support DISTINCT natively.
 */
async function fetchDistinctYears(): Promise<number[]> {
  const context = getSpfxContext();
  const sp = spfi().using(SPFx(context));

  // Fetch only the Year column — lightweight query
  const items = await sp.web.lists
    .getByTitle(PROJECTS_LIST_TITLE)
    .items.select(SP_PROJECTS_FIELDS.YEAR)
    .top(5000)();

  // Extract, validate, deduplicate, sort descending
  const yearSet = new Set<number>();
  for (const item of items) {
    const raw = item[SP_PROJECTS_FIELDS.YEAR];
    if (typeof raw === 'number' && isValidYear(raw)) {
      yearSet.add(raw);
    }
  }

  return Array.from(yearSet).sort((a, b) => b - a);
}

/**
 * Hook: load distinct year options for the year selector.
 */
export function useAvailableYears(): IAvailableYearsResult {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites-available-years'],
    queryFn: fetchDistinctYears,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });

  if (isLoading) {
    return { status: 'loading', years: [], errorMessage: null };
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to load available years from the Projects list.';
    return { status: 'error', years: [], errorMessage: message };
  }

  const years = data ?? [];
  if (years.length === 0) {
    return { status: 'empty', years: [], errorMessage: null };
  }

  return { status: 'success', years, errorMessage: null };
}
