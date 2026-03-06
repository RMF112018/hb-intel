/**
 * useListFilterStoreBinding — Connects useFilterStore to ListLayout props
 * PH4B.7 §4b.7.5 | Blueprint §2e
 *
 * Returns a props object that can be spread onto ListLayout to auto-wire
 * filter state, saved views, view mode, and clear handlers from the store.
 *
 * Usage in a page component:
 * ```tsx
 * import { useListFilterStoreBinding } from '@hbc/query-hooks';
 *
 * function MyListPage() {
 *   const filterProps = useListFilterStoreBinding('my-domain');
 *   return (
 *     <WorkspacePageShell layout="list" listConfig={{ filterStoreKey: 'my-domain', ... }}>
 *       <ListLayout {...filterProps}>
 *         <MyDataTable />
 *       </ListLayout>
 *     </WorkspacePageShell>
 *   );
 * }
 * ```
 *
 * When a parent passes explicit controlled props (activeFilters, onFilterChange, etc.),
 * those take precedence over store state — backward compatible.
 */
import { useCallback, useMemo } from 'react';
import { useFilterStore } from './useFilterStore.js';
import { useShallow } from 'zustand/shallow';
import type { FilterValue } from './useFilterStore.js';

export interface ListFilterStoreBindingProps {
  activeFilters: Record<string, string | string[]>;
  onFilterChange: (key: string, value: string | string[] | undefined) => void;
  onClearAllFilters: () => void;
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
}

/**
 * Returns ListLayout-compatible props wired to the filter store for a given key.
 */
export function useListFilterStoreBinding(
  filterStoreKey: string,
): ListFilterStoreBindingProps {
  const filters = useFilterStore(
    useShallow((state) => state.filters[filterStoreKey] ?? {}),
  );
  const viewMode = useFilterStore((state) => state.viewMode[filterStoreKey] ?? 'table');
  const setFilter = useFilterStore((state) => state.setFilter);
  const clearFilter = useFilterStore((state) => state.clearFilter);
  const clearFilters = useFilterStore((state) => state.clearFilters);
  const setViewMode = useFilterStore((state) => state.setViewMode);

  // Convert FilterValue map to string/string[] map for ListLayout compatibility
  const activeFilters = useMemo(() => {
    const result: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;
      if (Array.isArray(value)) {
        result[key] = value;
      } else {
        result[key] = String(value);
      }
    }
    return result;
  }, [filters]);

  const onFilterChange = useCallback(
    (key: string, value: string | string[] | undefined) => {
      if (value === undefined) {
        clearFilter(filterStoreKey, key);
      } else {
        setFilter(filterStoreKey, key, value as FilterValue);
      }
    },
    [filterStoreKey, setFilter, clearFilter],
  );

  const onClearAllFilters = useCallback(() => {
    clearFilters(filterStoreKey);
  }, [filterStoreKey, clearFilters]);

  const onViewModeChange = useCallback(
    (mode: 'table' | 'card') => {
      setViewMode(filterStoreKey, mode);
    },
    [filterStoreKey, setViewMode],
  );

  return {
    activeFilters,
    onFilterChange,
    onClearAllFilters,
    viewMode,
    onViewModeChange,
  };
}
