/**
 * HbcDataTable — @tanstack/react-table + @tanstack/react-virtual
 * Blueprint §1d — sorting, pagination, row selection, 10k+ row virtualization,
 * shimmer loading, semantic <table> for WCAG 2.2 AA a11y
 */
import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { keyframes, TRANSITION_FAST } from '../theme/animations.js';
import { elevationRest, elevationHover } from '../theme/elevation.js';
import type { HbcDataTableProps } from './types.js';

const useStyles = makeStyles({
  wrapper: {
    overflowY: 'auto',
    position: 'relative',
    borderRadius: '4px',
    boxShadow: elevationRest,
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  thead: {
    position: 'sticky',
    top: '0',
    zIndex: 1,
    backgroundColor: 'var(--colorNeutralBackground3)',
  },
  th: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--colorNeutralForeground3)',
    borderBottom: '1px solid var(--colorNeutralStroke2)',
    cursor: 'default',
    userSelect: 'none',
  },
  thSortable: {
    cursor: 'pointer',
    ':hover': {
      color: 'var(--colorNeutralForeground1)',
    },
  },
  td: {
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '0.875rem',
    borderBottom: '1px solid var(--colorNeutralStroke3)',
    color: 'var(--colorNeutralForeground1)',
  },
  tr: {
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: TRANSITION_FAST,
  },
  trClickable: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--colorNeutralBackground1Hover)',
    },
  },
  trSelected: {
    backgroundColor: 'var(--colorBrandBackground2)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  shimmerRow: {
    height: '48px',
    backgroundImage: 'linear-gradient(90deg, transparent 25%, rgba(0,75,135,0.08) 50%, transparent 75%)',
    backgroundSize: '200% 100%',
    animationName: keyframes.shimmer,
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '0.813rem',
    color: 'var(--colorNeutralForeground3)',
    borderTop: '1px solid var(--colorNeutralStroke2)',
  },
  paginationButtons: {
    display: 'flex',
    gap: '4px',
  },
  pageButton: {
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    fontSize: '0.813rem',
    border: '1px solid var(--colorNeutralStroke2)',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.4,
      cursor: 'default',
    },
  },
});

// Generic component — use function declaration for proper generic forwarding
export function HbcDataTable<TData>({
  data,
  columns,
  enableSorting = false,
  sorting: controlledSorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enablePagination = false,
  pageSize = 50,
  isLoading = false,
  estimatedRowHeight = 48,
  height = '600px',
  onRowClick,
  className,
}: HbcDataTableProps<TData>): React.JSX.Element {
  const styles = useStyles();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});

  const sorting = controlledSorting ?? internalSorting;
  const rowSelection = controlledRowSelection ?? internalSelection;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange ? onSortingChange(next) : setInternalSorting(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      onRowSelectionChange ? onRowSelectionChange(next) : setInternalSelection(next);
    },
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } },
    }),
    enableRowSelection,
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div data-hbc-ui="data-table" className={className}>
      <div
        ref={parentRef}
        className={styles.wrapper}
        style={{ height, overflow: 'auto' }}
        role="region"
        aria-label="Data table"
        tabIndex={0}
      >
        {isLoading && (
          <div className={styles.loadingOverlay} aria-live="polite" aria-label="Loading">
            <div style={{ width: '100%' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.shimmerRow} />
              ))}
            </div>
          </div>
        )}

        <table className={styles.table} role="table">
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={mergeClasses(
                      styles.th,
                      header.column.getCanSort() ? styles.thSortable : undefined,
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                    scope="col"
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ▲'}
                    {header.column.getIsSorted() === 'desc' && ' ▼'}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualRows.length > 0 && (
              <tr style={{ height: `${virtualRows[0].start}px` }}>
                <td colSpan={columns.length} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  className={mergeClasses(
                    styles.tr,
                    onRowClick ? styles.trClickable : undefined,
                    row.getIsSelected() ? styles.trSelected : undefined,
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {virtualRows.length > 0 && (
              <tr
                style={{
                  height: `${virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)}px`,
                }}
              >
                <td colSpan={columns.length} style={{ padding: 0, border: 'none' }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div className={styles.pagination}>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
            {' | '}
            {data.length} total rows
          </span>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export type { HbcDataTableProps } from './types.js';
