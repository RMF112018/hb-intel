/**
 * Domain-scoped filter store — Blueprint §2e, PH3 §3.1 Step 7, PH4B.7 §4b.7.5
 *
 * Stores filter/search state per domain key. Uses shallow selectors
 * via `useDomainFilters(domain)` to prevent cascade re-renders.
 *
 * §4b.7.5 expansion: savedViews, columnConfig, viewMode, pagination,
 * getActivePills, deep-link URL encoding.
 */

import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type FilterValue = string | number | boolean | string[] | null;

export type ViewScope = 'personal' | 'project' | 'organization';

export interface SavedView {
  id: string;
  name: string;
  scope: ViewScope;
  filters: Record<string, FilterValue>;
  columnConfig?: ColumnConfig;
  viewMode?: 'table' | 'card';
}

export interface ColumnConfig {
  visible: string[];
  order: string[];
  widths: Record<string, number>;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems?: number;
}

export interface FilterPill {
  field: string;
  value: FilterValue;
  label: string;
}

// ---------------------------------------------------------------------------
// Store state interface — §4b.7.5
// ---------------------------------------------------------------------------
export interface FilterStoreState {
  /** Nested filter map: `{ [key]: { [field]: value } }` */
  filters: Record<string, Record<string, FilterValue>>;
  /** Per-key saved views */
  savedViews: Record<string, SavedView[]>;
  /** Per-key active view ID */
  activeViewId: Record<string, string | null>;
  /** Per-key column configuration */
  columnConfig: Record<string, ColumnConfig>;
  /** Per-key view mode (table or card) */
  viewMode: Record<string, 'table' | 'card'>;
  /** Per-key pagination state */
  pagination: Record<string, PaginationState>;

  // --- Filter actions ---
  getFilters: (key: string) => Record<string, FilterValue>;
  setFilter: (key: string, field: string, value: FilterValue) => void;
  clearFilter: (key: string, field: string) => void;
  clearFilters: (key: string) => void;
  hasActiveFilters: (key: string) => boolean;
  getActivePills: (key: string) => FilterPill[];

  // --- Saved views actions ---
  getSavedViews: (key: string) => SavedView[];
  saveView: (key: string, name: string, scope: ViewScope) => void;
  applyView: (key: string, viewId: string) => void;
  deleteView: (key: string, viewId: string) => void;
  getActiveView: (key: string) => SavedView | null;

  // --- Column config actions ---
  getColumnConfig: (key: string) => ColumnConfig;
  setColumnConfig: (key: string, config: ColumnConfig) => void;

  // --- View mode actions ---
  getViewMode: (key: string) => 'table' | 'card';
  setViewMode: (key: string, mode: 'table' | 'card') => void;

  // --- Pagination actions ---
  getPagination: (key: string) => PaginationState;
  setPagination: (key: string, state: Partial<PaginationState>) => void;

  // --- Legacy compat ---
  /** @deprecated Use clearFilters(domain) */
  clearDomainFilters: (domain: string) => void;
  /** @deprecated Use clearFilters for each key */
  clearAllFilters: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT_COLUMN_CONFIG: ColumnConfig = { visible: [], order: [], widths: {} };
const DEFAULT_PAGINATION: PaginationState = { page: 1, pageSize: 25 };

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useFilterStore = create<FilterStoreState>()((set, get) => ({
  filters: {},
  savedViews: {},
  activeViewId: {},
  columnConfig: {},
  viewMode: {},
  pagination: {},

  // --- Filter actions ---
  getFilters: (key) => get().filters[key] ?? {},

  setFilter: (key, field, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: {
          ...state.filters[key],
          [field]: value,
        },
      },
    })),

  clearFilter: (key, field) =>
    set((state) => {
      const domainFilters = { ...state.filters[key] };
      delete domainFilters[field];
      return {
        filters: {
          ...state.filters,
          [key]: domainFilters,
        },
      };
    }),

  clearFilters: (key) =>
    set((state) => {
      const next = { ...state.filters };
      delete next[key];
      return { filters: next };
    }),

  hasActiveFilters: (key) => {
    const f = get().filters[key];
    return !!f && Object.keys(f).length > 0;
  },

  getActivePills: (key) => {
    const f = get().filters[key] ?? {};
    return Object.entries(f)
      .filter(([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
      .map(([field, value]) => ({
        field,
        value,
        label: `${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`,
      }));
  },

  // --- Saved views actions ---
  getSavedViews: (key) => get().savedViews[key] ?? [],

  saveView: (key, name, scope) =>
    set((state) => {
      const view: SavedView = {
        id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        scope,
        filters: { ...state.filters[key] },
        columnConfig: state.columnConfig[key],
        viewMode: state.viewMode[key],
      };
      return {
        savedViews: {
          ...state.savedViews,
          [key]: [...(state.savedViews[key] ?? []), view],
        },
      };
    }),

  applyView: (key, viewId) =>
    set((state) => {
      const views = state.savedViews[key] ?? [];
      const view = views.find((v) => v.id === viewId);
      if (!view) return {};
      return {
        filters: { ...state.filters, [key]: { ...view.filters } },
        activeViewId: { ...state.activeViewId, [key]: viewId },
        ...(view.columnConfig
          ? { columnConfig: { ...state.columnConfig, [key]: view.columnConfig } }
          : {}),
        ...(view.viewMode
          ? { viewMode: { ...state.viewMode, [key]: view.viewMode } }
          : {}),
      };
    }),

  deleteView: (key, viewId) =>
    set((state) => {
      const views = (state.savedViews[key] ?? []).filter((v) => v.id !== viewId);
      const activeId = state.activeViewId[key] === viewId ? null : state.activeViewId[key];
      return {
        savedViews: { ...state.savedViews, [key]: views },
        activeViewId: { ...state.activeViewId, [key]: activeId },
      };
    }),

  getActiveView: (key) => {
    const viewId = get().activeViewId[key];
    if (!viewId) return null;
    return (get().savedViews[key] ?? []).find((v) => v.id === viewId) ?? null;
  },

  // --- Column config actions ---
  getColumnConfig: (key) => get().columnConfig[key] ?? DEFAULT_COLUMN_CONFIG,

  setColumnConfig: (key, config) =>
    set((state) => ({
      columnConfig: { ...state.columnConfig, [key]: config },
    })),

  // --- View mode actions ---
  getViewMode: (key) => get().viewMode[key] ?? 'table',

  setViewMode: (key, mode) =>
    set((state) => ({
      viewMode: { ...state.viewMode, [key]: mode },
    })),

  // --- Pagination actions ---
  getPagination: (key) => get().pagination[key] ?? DEFAULT_PAGINATION,

  setPagination: (key, partial) =>
    set((state) => ({
      pagination: {
        ...state.pagination,
        [key]: { ...(state.pagination[key] ?? DEFAULT_PAGINATION), ...partial },
      },
    })),

  // --- Legacy compat ---
  clearDomainFilters: (domain) =>
    set((state) => {
      const next = { ...state.filters };
      delete next[domain];
      return { filters: next };
    }),

  clearAllFilters: () => set({ filters: {} }),
}));

// ---------------------------------------------------------------------------
// Selector hooks
// ---------------------------------------------------------------------------

/**
 * Shallow selector hook — returns filters for a single domain.
 * Components re-render only when their domain's filters change.
 */
export function useDomainFilters(domain: string) {
  return useFilterStore(
    useShallow((state) => state.filters[domain] ?? {}),
  );
}

// ---------------------------------------------------------------------------
// Deep-link URL encoding — §4b.7.5
// ---------------------------------------------------------------------------
interface DeepLinkPayload {
  key: string;
  filters: Record<string, FilterValue>;
  viewId?: string | null;
}

/** Encode current filters for a key into URL search params */
export function encodeFiltersToUrl(key: string): string {
  const state = useFilterStore.getState();
  const payload: DeepLinkPayload = {
    key,
    filters: state.filters[key] ?? {},
    viewId: state.activeViewId[key],
  };
  return btoa(JSON.stringify(payload));
}

/** Decode filters from URL and apply to store */
export function decodeFiltersFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('filters');
    if (!encoded) return;
    const payload = JSON.parse(atob(encoded)) as DeepLinkPayload;
    const { setFilter } = useFilterStore.getState();
    for (const [field, value] of Object.entries(payload.filters)) {
      setFilter(payload.key, field, value);
    }
    if (payload.viewId) {
      useFilterStore.setState((state) => ({
        activeViewId: { ...state.activeViewId, [payload.key]: payload.viewId ?? null },
      }));
    }
  } catch {
    // Invalid deep-link — silent fail
  }
}
