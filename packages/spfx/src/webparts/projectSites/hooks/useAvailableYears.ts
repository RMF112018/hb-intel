/**
 * React hook that supplies the year-selector options for the Project
 * Sites surface.
 *
 * Year discovery is **fallback-inclusive**: the repository unions the
 * distinct `Year` values from the Projects list with the distinct
 * `LegacyYear` values from approved Legacy Project Fallback Registry
 * rows, so every year with addressable inventory — modern, merged, or
 * legacy-only — appears in the Filter-by-Year dropdown. Selecting a
 * year drives a scoped `useProjectSites` query; the resolver then joins
 * both sources for that year.
 *
 * Returns a sorted (descending) array of valid years for the year
 * selector UI. Uses PnPjs v4 with SPFx context and @tanstack/react-query
 * for caching.
 */
import { useQuery } from '@tanstack/react-query';
import type { IAvailableYearsResult } from '../types.js';
import { getProjectSitesRepository } from '../repository/projectSitesRepository.js';

/** Stale time: 10 minutes — year list changes very infrequently. */
const STALE_TIME_MS = 10 * 60 * 1000;

/**
 * Hook: load distinct year options for the year selector.
 */
export function useAvailableYears(): IAvailableYearsResult {
  const repository = getProjectSitesRepository();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['project-sites-available-years'],
    queryFn: () => repository.fetchDistinctYears(),
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
        : 'Failed to load available project-site years.';
    return { status: 'error', years: [], errorMessage: message };
  }

  const years = data ?? [];
  if (years.length === 0) {
    return { status: 'empty', years: [], errorMessage: null };
  }

  return { status: 'success', years, errorMessage: null };
}
