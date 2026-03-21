/** HbcDataTable — Blueprint §1d, PH4.7 §7.1–7.4 virtualized data table */
import type { ColumnDef, SortingState, RowSelectionState } from '@tanstack/react-table';
import type { DensityTier } from '../HbcCommandBar/types.js';
import type { IComplexityAwareProps } from '@hbc/complexity';
import type { SavedViewEntry } from './saved-views-types.js';

/** Empty state configuration for zero-data display */
export interface DataTableEmptyStateConfig {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Configuration for internal saved-view integration in `HbcDataTable`.
 *
 * @remarks
 * D-PH4C-09 establishes a config-only pattern for PH4C: consumers provide stable
 * identifiers and optional lifecycle callbacks, while the table owns saved-view state
 * internally via `useSavedViews`.
 *
 * Deferred scope (post-PH4C): fully controlled/uncontrolled dual-mode APIs where
 * consumers provide external saved-view state and synchronization handlers.
 */
export interface HbcDataTableSavedViewsConfig {
  /**
   * Stable per-table identifier used for saved-view persistence namespacing.
   * Example: `accounting-transactions-table`.
   */
  tableId: string;
  /**
   * Current user identifier used to scope saved views by user.
   */
  userId: string;
  /**
   * Optional project identifier for project-scoped views.
   */
  projectId?: string;
  /**
   * Callback fired after a saved view is created.
   */
  onViewSaved?: (view: SavedViewEntry) => void;
  /**
   * Callback fired after a saved view is deleted.
   */
  onViewDeleted?: (viewId: string) => void;
  /**
   * Callback fired after a saved view is applied to table state.
   */
  onViewApplied?: (viewId: string, view: SavedViewEntry) => void;
}

export interface HbcDataTableProps<TData> extends IComplexityAwareProps {
  /** Table data array */
  data: TData[];
  /** TanStack Table column definitions */
  columns: ColumnDef<TData, unknown>[];
  /** Enable row sorting */
  enableSorting?: boolean;
  /** Controlled sorting state */
  sorting?: SortingState;
  /** Sorting state change handler */
  onSortingChange?: (sorting: SortingState) => void;
  /** Enable row selection (checkboxes) */
  enableRowSelection?: boolean;
  /** Controlled row selection state */
  rowSelection?: RowSelectionState;
  /** Row selection change handler */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Rows per page (default 50) */
  pageSize?: number;
  /** Loading state — shows shimmer skeletons */
  isLoading?: boolean;
  /** Estimated row height for virtualizer (default derives from density tier) */
  estimatedRowHeight?: number;
  /** Table height for virtualization (default '600px') */
  height?: string;
  /** UIF-019-addl: When true, table grows to full content height with no internal scroll.
   * Use for short lists embedded in a naturally scrolling page layout. */
  autoHeight?: boolean;
  /** Callback when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Additional CSS class */
  className?: string;

  // --- PH4.7 Step 1: Adaptive Density ---
  /** Tool ID for localStorage density persistence key */
  toolId?: string;
  /** Manual density tier override */
  densityTier?: DensityTier;
  /** Callback when density tier changes */
  onDensityChange?: (tier: DensityTier) => void;

  // --- PH4.7 Step 2: Responsibility Heat Map ---
  /** Column accessor key for responsibility field */
  responsibilityField?: string;
  /** Current user ID to compare against responsibility field */
  currentUserId?: string;

  // --- PH4.7 Step 4: Card-Stack Mobile ---
  /** Accessor keys (4–5) shown on card face in mobile card-stack view (<640px) */
  mobileCardFields?: string[];

  // --- PH4.7 Step 5: Inline Editing ---
  /** Accessor keys of editable columns */
  editableColumns?: string[];
  /** Callback when a cell is edited: (rowId, columnId, newValue) => void */
  onCellEdit?: (rowId: string, columnId: string, newValue: unknown) => void;

  // --- PH4.7 Step 6: Column Configuration ---
  /** Enable column config (show/hide, resize, reorder) */
  enableColumnConfig?: boolean;
  /** Column visibility state */
  columnVisibility?: Record<string, boolean>;
  /** Column visibility change handler */
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  /** Column order state */
  columnOrder?: string[];
  /** Column order change handler */
  onColumnOrderChange?: (order: string[]) => void;

  // --- PH4C.4: Saved Views (config-only integration) ---
  /**
   * Optional saved-view integration config.
   *
   * @remarks
   * When provided, `HbcDataTable` invokes `useSavedViews` internally and surfaces
   * save/apply/delete controls using the current table sorting and column config.
   * This preserves backward compatibility: when omitted, no saved-view state or UI
   * is rendered.
   *
   * D-PH4C-09 (config-only pattern): consumers pass configuration + callbacks only;
   * internal table state management remains inside `HbcDataTable`.
   *
   * Deferred scope: fully controlled/uncontrolled APIs are intentionally postponed
   * beyond PH4C and documented in the PH4C completion plan.
   */
  savedViewsConfig?: HbcDataTableSavedViewsConfig;

  // --- PH4.7 Step 7: Data Freshness & Empty State ---
  /** Data is from cache / stale */
  isStale?: boolean;
  /** Empty state configuration when data is empty and not loading */
  emptyStateConfig?: DataTableEmptyStateConfig;

  // --- PH4.13 Step 1: Frozen Columns ---
  /** Column accessor keys to freeze (sticky left). Columns stay fixed during horizontal scroll. */
  frozenColumns?: string[];

  // --- SF03-T07: Complexity gate for advanced filters ---
  // complexityMinTier and complexityMaxTier (from IComplexityAwareProps) apply to
  // the advanced filter row only, not the table itself. Default: expert.
}
