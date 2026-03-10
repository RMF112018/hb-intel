import { useQuery } from '@tanstack/react-query';
import type { IUseSeedHistoryResult } from '../types';
import { SeedApi } from '../api/SeedApi';
import { SEED_HISTORY_STALE_TIME_MS } from '../constants';

/**
 * Query key factory for seed history queries.
 */
export function seedHistoryQueryKey(recordType: string) {
  return ['@hbc/data-seeding', 'history', recordType] as const;
}

/**
 * Returns the import history for a given record type, newest first.
 *
 * @param recordType - The target record type to query history for
 *                     (e.g., 'bd-lead', 'project-record')
 *
 * @example
 * const { history, isLoading } = useSeedHistory('bd-lead');
 */
export function useSeedHistory(recordType: string): IUseSeedHistoryResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: seedHistoryQueryKey(recordType),
    queryFn: () => SeedApi.getHistory(recordType),
    staleTime: SEED_HISTORY_STALE_TIME_MS,
    enabled: Boolean(recordType),
  });

  return {
    history: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => void refetch(),
  };
}
