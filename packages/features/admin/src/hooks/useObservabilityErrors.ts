import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  IObservabilityErrorRecord,
  IObservabilityPagedResponse,
} from '@hbc/models/admin-control-plane';

/**
 * Query key for observability errors.
 */
export const OBSERVABILITY_ERRORS_QUERY_KEY = ['observability-errors'] as const;

/**
 * Filter state for the error log view.
 */
export interface IErrorLogFilters {
  readonly domain: string | null;
  readonly source: string | null;
  readonly classification: string | null;
  readonly severity: string | null;
  readonly runId: string | null;
  readonly from: string | null;
  readonly to: string | null;
}

const DEFAULT_FILTERS: IErrorLogFilters = {
  domain: null,
  source: null,
  classification: null,
  severity: null,
  runId: null,
  from: null,
  to: null,
};

/**
 * Return type for the error log hook.
 */
export interface UseObservabilityErrorsResult {
  readonly errors: readonly IObservabilityErrorRecord[];
  readonly totalCount: number;
  readonly filters: IErrorLogFilters;
  readonly setFilters: (filters: Partial<IErrorLogFilters>) => void;
  readonly clearFilters: () => void;
  readonly hasActiveFilters: boolean;
  readonly refresh: () => Promise<void>;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

/**
 * Hook for querying observability error events from the backend.
 *
 * Manages filter state, pagination, and React Query integration.
 *
 * @param fetchErrors - Function that calls the backend error list API
 * @design P12-08
 */
export function useObservabilityErrors(
  fetchErrors: (params: Record<string, string>) => Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>>,
): UseObservabilityErrorsResult {
  const queryClient = useQueryClient();
  const [filters, setFiltersRaw] = useState<IErrorLogFilters>(DEFAULT_FILTERS);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = { limit: '50' };
    if (filters.domain) params.domain = filters.domain;
    if (filters.source) params.source = filters.source;
    if (filters.classification) params.classification = filters.classification;
    if (filters.severity) params.severity = filters.severity;
    if (filters.runId) params.runId = filters.runId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    return params;
  }, [filters]);

  const { data, isLoading, error } = useQuery({
    queryKey: [...OBSERVABILITY_ERRORS_QUERY_KEY, queryParams],
    queryFn: () => fetchErrors(queryParams),
    refetchInterval: 30_000,
  });

  const setFilters = useCallback((update: Partial<IErrorLogFilters>) => {
    setFiltersRaw(prev => ({ ...prev, ...update }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersRaw(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() =>
    Object.values(filters).some(v => v !== null),
  [filters]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: OBSERVABILITY_ERRORS_QUERY_KEY });
  }, [queryClient]);

  return {
    errors: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    refresh,
    isLoading,
    error: error as Error | null,
  };
}
