/**
 * Client-side pagination for the Project Sites surface.
 *
 * Pure module. Operates on the **post-pipeline** entry list (after
 * search/filter/sort have been applied) and slices it into a stable,
 * UI-renderable page.
 *
 * Why client-side: the repository now drains the full eligible dataset
 * per scope (see `repository/projectSitesRepository.ts`), and search /
 * filter / sort run as fast pure functions over that set. Pagination is
 * therefore a pure presentation concern — it must reflect the current
 * filtered cardinality, not the raw fetched cardinality, so totals stay
 * truthful as the user types or toggles facets.
 *
 * Page sizes are layout-mode-aware: wider screens render denser grids
 * (more cards per page); compact screens render fewer to keep the page
 * scannable on touch devices.
 */
import type { ProjectSitesLayoutMode } from './projectSitesLayoutMode.js';

/**
 * Default page size per layout mode. Tuned so the visible grid roughly
 * matches one comfortable scroll on a typical viewport at that mode:
 *   - `wide`   → 3–4 columns × 6 rows ≈ 24 cards
 *   - `medium` → 2–3 columns × 6 rows ≈ 18 cards
 *   - `compact`→ 1 column × 12 rows = 12 cards (touch-friendly)
 */
export const DEFAULT_PAGE_SIZE_BY_MODE: Readonly<Record<ProjectSitesLayoutMode, number>> = {
  wide: 24,
  medium: 18,
  compact: 12,
};

export function pageSizeForMode(mode: ProjectSitesLayoutMode): number {
  return DEFAULT_PAGE_SIZE_BY_MODE[mode];
}

export interface IPaginationResult<T> {
  /** Items in the current page (a slice, not a copy of the whole array). */
  items: T[];
  /** 1-based current page number, clamped to `[1, totalPages]`. */
  page: number;
  /** Total number of pages (≥ 1, even when `totalItems === 0`). */
  totalPages: number;
  /** Total items in the input list (post-pipeline cardinality). */
  totalItems: number;
  /**
   * Inclusive 1-based range of items shown on this page, e.g. [21, 40].
   * `[0, 0]` when there are no items.
   */
  range: [number, number];
}

/**
 * Slice `items` into a page. Pure — no side effects, no mutation.
 *
 * Behavior contract:
 *   - `pageSize` must be ≥ 1 (callers should pass `pageSizeForMode(mode)`).
 *   - `page` is clamped to `[1, totalPages]` so a stale page index after
 *     the user types into search (which may shrink the result set) never
 *     leaves the grid silently empty.
 *   - When `items` is empty, returns `{ totalPages: 1, page: 1, range: [0, 0] }`
 *     — keeps downstream UI rendering simple.
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): IPaginationResult<T> {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);

  if (totalItems === 0) {
    return {
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      range: [0, 0],
    };
  }

  const start = (safePage - 1) * safePageSize;
  const end = Math.min(start + safePageSize, totalItems);

  return {
    items: items.slice(start, end),
    page: safePage,
    totalPages,
    totalItems,
    range: [start + 1, end],
  };
}

/**
 * Build a stable signature string for the inputs that govern the
 * post-pipeline result set. Consumers reset the current page to 1
 * whenever this signature changes (search edited, scope switched,
 * filters toggled, sort flipped).
 *
 * Identity of the entries array is intentionally the only entries
 * input — the entries themselves are immutable per resolver run, so
 * referential equality is a sufficient and cheap signal.
 */
export function buildPaginationResetSignature(args: {
  entriesIdentity: unknown;
  searchTerm: string;
  sortKey: string;
  filtersSignature: string;
  scopeKey: string;
}): string {
  const { searchTerm, sortKey, filtersSignature, scopeKey } = args;
  // Use a unique marker for the entries identity since it can be any
  // reference; we only need a stable key per identity, not the entries
  // themselves. JSON.stringify is unsuitable (circular + slow); instead
  // we let the consumer pass identity through `useMemo` so the caller
  // controls cache identity.
  return `${scopeKey}|${searchTerm}|${sortKey}|${filtersSignature}`;
}

/**
 * Build a deterministic, compact signature for filters. Used as part of
 * the pagination reset key so toggling any facet resets to page 1.
 */
export function filtersSignature(filters: {
  stages: string[];
  projectManagerUpns: string[];
  leadEstimatorUpns: string[];
  projectExecutiveUpns: string[];
  departments: string[];
  officeDivisions: string[];
  sourceClassifications: string[];
  hasSiteOnly?: boolean;
}): string {
  const join = (xs: string[]) => [...xs].sort().join(',');
  return [
    join(filters.stages),
    join(filters.projectManagerUpns),
    join(filters.leadEstimatorUpns),
    join(filters.projectExecutiveUpns),
    join(filters.departments),
    join(filters.officeDivisions),
    join(filters.sourceClassifications),
    filters.hasSiteOnly === undefined ? '' : filters.hasSiteOnly ? 'site' : 'no-site',
  ].join('|');
}

/**
 * Build the visible page-number window for a numbered pagination
 * control. Always shows the first and last page; ellipses ('…') mark
 * gaps. Returns a small, deterministic array suitable for direct
 * rendering by the pagination component.
 *
 * Examples (current = 5, total = 20, max = 7):
 *   [1, '…', 4, 5, 6, '…', 20]
 */
export function buildPageWindow(
  currentPage: number,
  totalPages: number,
  maxButtons: number = 7,
): Array<number | '…'> {
  if (totalPages <= 1) return [1];
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const window: Array<number | '…'> = [];
  const sideSlots = Math.max(1, Math.floor((maxButtons - 3) / 2));
  const start = Math.max(2, currentPage - sideSlots);
  const end = Math.min(totalPages - 1, currentPage + sideSlots);

  window.push(1);
  if (start > 2) window.push('…');
  for (let p = start; p <= end; p += 1) window.push(p);
  if (end < totalPages - 1) window.push('…');
  window.push(totalPages);

  return window;
}
