/**
 * React hook that fetches distinct Year values from the canonical
 * Project Sites repository adapter.
 *
 * Returns a sorted (descending) array of valid years for the year selector UI.
 * Uses PnPjs v4 with SPFx context and @tanstack/react-query for caching.
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
