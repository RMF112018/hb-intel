/**
 * React hook that queries the HBCentral Projects list for project sites
 * matching the selected year.
 *
 * Does NOT use $select — SharePoint returns all fields. This eliminates
 * field-name mismatch issues where display names differ from internal names.
 * The normalizer reads whichever fields are present and falls back to
 * Title parsing for missing custom fields.
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
import { SP_PROJECTS_FIELDS } from '../types.js';
import { normalizeProjectSiteEntries } from '../normalizeProjectSiteEntry.js';

/** SharePoint list title on HBCentral. */
const PROJECTS_LIST_TITLE = 'Projects';

/** Stale time: 5 minutes — project list data changes infrequently. */
const STALE_TIME_MS = 5 * 60 * 1000;

/**
 * Fetch project site entries from the HBCentral Projects list.
 * No $select — returns all fields to avoid internal-name mismatches.
 */
async function fetchProjectSites(year: number): Promise<IRawProjectSiteItem[]> {
  const context = getSpfxContext();
  const sp = spfi().using(SPFx(context));

  const items = await sp.web.lists
    .getByTitle(PROJECTS_LIST_TITLE)
    .items.filter(`${SP_PROJECTS_FIELDS.YEAR} eq ${year}`)();

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
