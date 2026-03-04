/** HbcDataTable — Blueprint §1d, PH4.7 §7.1–7.4 virtualized data table */
import type { ColumnDef, SortingState, RowSelectionState } from '@tanstack/react-table';
import type { DensityTier } from '../HbcCommandBar/types.js';

/** Empty state configuration for zero-data display */
export interface DataTableEmptyStateConfig {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface HbcDataTableProps<TData> {
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

  // --- PH4.7 Step 7: Data Freshness & Empty State ---
  /** Data is from cache / stale */
  isStale?: boolean;
  /** Empty state configuration when data is empty and not loading */
  emptyStateConfig?: DataTableEmptyStateConfig;

  // --- PH4.13 Step 1: Frozen Columns ---
  /** Column accessor keys to freeze (sticky left). Columns stay fixed during horizontal scroll. */
  frozenColumns?: string[];
}
