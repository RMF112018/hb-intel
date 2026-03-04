/**
 * Domain-scoped filter store — Blueprint §2e, PH3 §3.1 Step 7.
 *
 * Stores filter/search state per domain. Uses shallow selectors
 * via `useDomainFilters(domain)` to prevent cascade re-renders.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

export type FilterValue = string | number | boolean | string[] | null;

export interface FilterState {
  /** Nested filter map: `{ [domain]: { [field]: value } }` */
  filters: Record<string, Record<string, FilterValue>>;

  setFilter: (domain: string, field: string, value: FilterValue) => void;
  clearDomainFilters: (domain: string) => void;
  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  filters: {},

  setFilter: (domain, field, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [domain]: {
          ...state.filters[domain],
          [field]: value,
        },
      },
    })),

  clearDomainFilters: (domain) =>
    set((state) => {
      const next = { ...state.filters };
      delete next[domain];
      return { filters: next };
    }),

  clearAllFilters: () => set({ filters: {} }),
}));

/**
 * Shallow selector hook — returns filters for a single domain.
 * Components re-render only when their domain's filters change.
 */
export function useDomainFilters(domain: string) {
  return useFilterStore(
    useShallow((state) => state.filters[domain] ?? {}),
  );
}
