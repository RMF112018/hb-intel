/** HbcDataTable — Blueprint §1d virtualized data table */
import type { ColumnDef, SortingState, RowSelectionState } from '@tanstack/react-table';

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
  /** Loading state — shows shimmer overlay */
  isLoading?: boolean;
  /** Estimated row height for virtualizer (default 48) */
  estimatedRowHeight?: number;
  /** Table height for virtualization (default '600px') */
  height?: string;
  /** Callback when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Additional CSS class */
  className?: string;
}
