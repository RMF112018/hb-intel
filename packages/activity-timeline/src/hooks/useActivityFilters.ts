/**
 * SF28-T04 — Activity timeline filter state hook.
 */
import { useCallback, useState } from 'react';
import type { IActivityFilterState, ActivityEventType } from '../types/index.js';

const DEFAULT_FILTERS: IActivityFilterState = {
  selectedEventTypes: [],
  selectedActorUpns: [],
  timeframeStart: null,
  timeframeEnd: null,
  relatedRecordIds: [],
  moduleScopes: [],
  excludeSystemEvents: false,
};

export interface UseActivityFiltersResult {
  filters: IActivityFilterState;
  setFilter: <K extends keyof IActivityFilterState>(key: K, value: IActivityFilterState[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useActivityFilters(
  initial?: Partial<IActivityFilterState>,
): UseActivityFiltersResult {
  const [filters, setFilters] = useState<IActivityFilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setFilter = useCallback(<K extends keyof IActivityFilterState>(
    key: K,
    value: IActivityFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initial });
  }, [initial]);

  const hasActiveFilters =
    filters.selectedEventTypes.length > 0 ||
    filters.selectedActorUpns.length > 0 ||
    filters.timeframeStart !== null ||
    filters.timeframeEnd !== null ||
    filters.relatedRecordIds.length > 0 ||
    filters.moduleScopes.length > 0 ||
    filters.excludeSystemEvents;

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
