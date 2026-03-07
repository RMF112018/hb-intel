/**
 * HbcDataTable — @tanstack/react-table + @tanstack/react-virtual
 * Blueprint §1d — sorting, pagination, row selection, 10k+ row virtualization,
 * shimmer loading, semantic <table> for WCAG 2.2 AA a11y
 *
 * PH4.7 enhancements:
 *  §7.1 — Adaptive density (compact/standard/touch)
 *  §7.1 — Responsibility heat map
 *  §7.1 — Layout-matched shimmer skeletons
 *  §7.1 — Card-stack mobile view (<640px)
 *  §7.2 — Inline editing (double-click cells)
 *  §7.2 — Column configuration (show/hide, resize, reorder)
 *  §7.3 — Data freshness indicator & empty state
 *
 * PH4.13 enhancements:
 *  §13.1 — Frozen columns (sticky left with shadow border)
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
  type ColumnOrderState,
  type VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_FAST } from '../theme/animations.js';
import { elevationRest } from '../theme/elevation.js';
import {
  HBC_ACCENT_ORANGE,
  HBC_SURFACE_LIGHT,
  HBC_SURFACE_FIELD,
} from '../theme/tokens.js';
import { useAdaptiveDensity } from './hooks/useAdaptiveDensity.js';
import { useFieldMode } from '../HbcAppShell/hooks/useFieldMode.js';
import { HbcEmptyState } from '../HbcEmptyState/index.js';
import { HbcDataTableCard } from './HbcDataTableCard.js';
import { useShimmerStyles } from '../shared/index.js';
import type { HbcDataTableProps } from './types.js';

const useStyles = makeStyles({
  wrapper: {
    overflow: 'auto',
    position: 'relative',
    borderRadius: '4px',
    boxShadow: elevationRest,
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  wrapperStale: {
    borderTopWidth: '1px',
    borderTopStyle: 'dashed',
    borderTopColor: HBC_SURFACE_LIGHT['border-default'],
    transitionProperty: 'border-top-style',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease',
  },
  wrapperFresh: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_SURFACE_LIGHT['border-default'],
    transitionProperty: 'border-top-style',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease',
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
    textAlign: 'left',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--colorNeutralForeground3)',
    borderBottom: '1px solid var(--colorNeutralStroke2)',
    cursor: 'default',
    userSelect: 'none',
    position: 'relative',
  },
  thSortable: {
    cursor: 'pointer',
    ':hover': {
      color: 'var(--colorNeutralForeground1)',
    },
  },
  thResizeHandle: {
    position: 'absolute',
    right: '0',
    top: '0',
    bottom: '0',
    width: '4px',
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: 'var(--colorBrandBackground)',
    },
  },
  td: {
    borderBottom: '1px solid var(--colorNeutralStroke3)',
    color: 'var(--colorNeutralForeground1)',
  },
  tdEditable: {
    borderBottomStyle: 'dashed',
    borderBottomColor: 'var(--colorNeutralStroke2)',
    position: 'relative',
    cursor: 'text',
  },
  tdEditing: {
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
  },
  editInput: {
    width: '100%',
    height: '100%',
    border: `2px solid var(--colorBrandBackground)`,
    borderRadius: '2px',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    backgroundColor: 'var(--colorNeutralBackground1)',
    color: 'var(--colorNeutralForeground1)',
    outline: 'none',
  },
  editIcon: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.75rem',
    opacity: 0,
    color: 'var(--colorNeutralForeground3)',
    pointerEvents: 'none',
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
  trHover: {
    ':hover .edit-icon-target': {
      opacity: 1,
    },
  },
  trSelected: {
    backgroundColor: 'var(--colorBrandBackground2)',
  },
  trResponsibility: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_ACCENT_ORANGE,
    backgroundColor: HBC_SURFACE_LIGHT['responsibility-bg'],
  },
  trResponsibilityField: {
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    borderLeftColor: HBC_ACCENT_ORANGE,
    backgroundColor: HBC_SURFACE_FIELD['responsibility-bg'],
  },
  // Density: compact
  thCompact: {
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    fontSize: '0.6875rem',
  },
  tdCompact: {
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    fontSize: '0.8125rem',
  },
  // Density: standard
  thStandard: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '0.75rem',
  },
  tdStandard: {
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '0.875rem',
  },
  // Density: touch
  thTouch: {
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    fontSize: '0.875rem',
  },
  tdTouch: {
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '16px',
    paddingRight: '16px',
    fontSize: '1rem',
  },
  // Shimmer overlay layout wrapper. Animation styles are centralized in shared/shimmer.ts.
  shimmerOverlay: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    transitionProperty: 'opacity',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  shimmerTableRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--colorNeutralStroke3)',
  },
  shimmerCell: {
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  // Card-stack container
  cardStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  // PH4.13: Frozen columns
  frozenCell: {
    position: 'sticky' as const,
    zIndex: 1,
    backgroundColor: 'inherit',
  },
  frozenCellLast: {
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.08)',
  },
  frozenHeader: {
    position: 'sticky' as const,
    zIndex: 2,
    backgroundColor: 'var(--colorNeutralBackground3)',
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
  estimatedRowHeight,
  height = '600px',
  onRowClick,
  className,
  // PH4.7 Step 1: Adaptive Density
  toolId,
  densityTier: densityOverride,
  onDensityChange,
  // PH4.7 Step 2: Responsibility Heat Map
  responsibilityField,
  currentUserId,
  // PH4.7 Step 4: Card-Stack Mobile
  mobileCardFields,
  // PH4.7 Step 5: Inline Editing
  editableColumns,
  onCellEdit,
  // PH4.7 Step 6: Column Configuration
  enableColumnConfig = false,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  // PH4.7 Step 7: Data Freshness & Empty State
  isStale,
  emptyStateConfig,
  // PH4.13 Step 1: Frozen Columns
  frozenColumns,
}: HbcDataTableProps<TData>): React.JSX.Element {
  const styles = useStyles();
  const shimmerStyles = useShimmerStyles();
  // D-PH4C-10: Stable per-instance prefix keeps th/td associations deterministic and unique.
  const tableIdPrefix = React.useId().replace(/:/g, '');
  const parentRef = React.useRef<HTMLDivElement>(null);
  const { isFieldMode } = useFieldMode();

  // Adaptive density
  const { tier, config: densityConfig } = useAdaptiveDensity({
    toolId,
    densityOverride,
    isFieldMode,
  });

  // Notify density change
  const prevTierRef = React.useRef(tier);
  React.useEffect(() => {
    if (tier !== prevTierRef.current) {
      prevTierRef.current = tier;
      onDensityChange?.(tier);
    }
  }, [tier, onDensityChange]);

  // Mobile detection for card-stack
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [internalSelection, setInternalSelection] = React.useState<RowSelectionState>({});
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
  const [internalColumnOrder, setInternalColumnOrder] = React.useState<ColumnOrderState>([]);

  const sorting = controlledSorting ?? internalSorting;
  const rowSelection = controlledRowSelection ?? internalSelection;
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const columnOrder = controlledColumnOrder ?? internalColumnOrder;

  // Inline editing state
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = React.useState<string>('');
  const editInputRef = React.useRef<HTMLInputElement>(null);

  // Card-stack expanded state
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  // Track page size for skeleton row count
  const [lastKnownPageSize, setLastKnownPageSize] = React.useState(10);
  React.useEffect(() => {
    if (data.length > 0) setLastKnownPageSize(Math.min(data.length, pageSize));
  }, [data.length, pageSize]);

  const effectiveRowHeight = estimatedRowHeight ?? densityConfig.rowHeight;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange ? onSortingChange(next) : setInternalSorting(next);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      onRowSelectionChange ? onRowSelectionChange(next) : setInternalSelection(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnVisibility) : updater;
      onColumnVisibilityChange
        ? onColumnVisibilityChange(next)
        : setInternalColumnVisibility(next);
    },
    onColumnOrderChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnOrder) : updater;
      onColumnOrderChange
        ? onColumnOrderChange(next)
        : setInternalColumnOrder(next);
    },
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } },
    }),
    enableRowSelection,
    enableColumnResizing: enableColumnConfig,
    columnResizeMode: 'onChange' as const,
  });

  const rows = table.getRowModel().rows;

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => effectiveRowHeight,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();

  // D-PH4C-10: Build WCAG 1.3.1 header chains so each data cell maps to its leaf + group headers.
  const columnHeaderIds = React.useMemo(() => {
    const headersByColumn = new Map<string, string[]>();
    const headerGroups = table.getHeaderGroups();
    for (const group of headerGroups) {
      for (const header of group.headers) {
        if (header.isPlaceholder) continue;
        const colId =
          (header.column.columnDef as { accessorKey?: string }).accessorKey ?? header.column.id;
        const headerId = `${tableIdPrefix}-${header.id}`;
        const current = headersByColumn.get(colId) ?? [];
        headersByColumn.set(colId, [...current, headerId]);
      }
    }
    return headersByColumn;
  }, [table, tableIdPrefix]);

  // Density class selectors
  const thDensityClass =
    tier === 'compact'
      ? styles.thCompact
      : tier === 'touch'
        ? styles.thTouch
        : styles.thStandard;

  const tdDensityClass =
    tier === 'compact'
      ? styles.tdCompact
      : tier === 'touch'
        ? styles.tdTouch
        : styles.tdStandard;

  // Responsibility check
  const isRowResponsible = (row: TData): boolean => {
    if (!responsibilityField || !currentUserId) return false;
    return (row as Record<string, unknown>)[responsibilityField] === currentUserId;
  };

  // PH4.13: Frozen column offset map
  const frozenOffsets = React.useMemo(() => {
    if (!frozenColumns || frozenColumns.length === 0) return null;
    const offsets = new Map<string, { left: number; isLast: boolean }>();
    let cumulativeLeft = 0;
    const visibleCols = table.getVisibleLeafColumns();
    for (const colId of frozenColumns) {
      const col = visibleCols.find((c) => {
        const key = (c.columnDef as { accessorKey?: string }).accessorKey ?? c.id;
        return key === colId;
      });
      if (col) {
        offsets.set(colId, { left: cumulativeLeft, isLast: false });
        cumulativeLeft += col.getSize();
      }
    }
    // Mark last frozen column
    const lastFrozenId = frozenColumns[frozenColumns.length - 1];
    const lastEntry = offsets.get(lastFrozenId);
    if (lastEntry) offsets.set(lastFrozenId, { ...lastEntry, isLast: true });
    return offsets;
  }, [frozenColumns, table]);

  // Inline editing handlers
  const startEditing = (rowId: string, columnId: string, currentValue: unknown) => {
    if (!editableColumns?.includes(columnId)) return;
    setEditingCell({ rowId, columnId });
    setEditValue(String(currentValue ?? ''));
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.rowId, editingCell.columnId, editValue);
    }
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      commitEdit();
      // Move to next editable cell in the same row
      if (editingCell && editableColumns) {
        const currentIdx = editableColumns.indexOf(editingCell.columnId);
        const nextColumnId = editableColumns[(currentIdx + 1) % editableColumns.length];
        const row = rows.find((r) => r.id === editingCell.rowId);
        if (row && nextColumnId) {
          const cellValue = (row.original as Record<string, unknown>)[nextColumnId];
          startEditing(editingCell.rowId, nextColumnId, cellValue);
        }
      }
    }
  };

  // Stale indicator class
  const staleClass =
    isStale === true
      ? styles.wrapperStale
      : isStale === false
        ? styles.wrapperFresh
        : undefined;

  // Card-stack mode
  const showCardStack = isMobile && mobileCardFields && mobileCardFields.length > 0;

  // Empty state check
  const showEmptyState = !isLoading && data.length === 0 && emptyStateConfig;

  return (
    <div data-hbc-ui="data-table" className={className}>
      <div
        ref={parentRef}
        className={mergeClasses(styles.wrapper, staleClass)}
        style={{ height, overflow: 'auto' }}
        role="region"
        aria-label="Data table"
        tabIndex={0}
      >
        {/* Layout-matched shimmer skeletons */}
        {isLoading && (
          <div
            className={styles.shimmerOverlay}
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading"
          >
            {/* Skeleton header */}
            <div
              className={styles.shimmerTableRow}
              style={{ height: `${effectiveRowHeight}px` }}
            >
              {table.getVisibleLeafColumns().map((col) => (
                <div
                  key={col.id}
                  className={styles.shimmerCell}
                  style={{
                    width: col.getSize(),
                    padding: densityConfig.cellPaddingY + ' ' + densityConfig.cellPaddingX,
                  }}
                >
                  <div className={shimmerStyles.shimmerRow} style={{ width: '60%' }} />
                </div>
              ))}
            </div>
            {/* Skeleton data rows */}
            {Array.from({ length: lastKnownPageSize }).map((_, i) => (
              <div
                key={i}
                className={styles.shimmerTableRow}
                style={{ height: `${effectiveRowHeight}px` }}
              >
                {table.getVisibleLeafColumns().map((col, ci) => (
                  <div
                    key={col.id}
                    className={styles.shimmerCell}
                    style={{
                      width: col.getSize(),
                      padding: densityConfig.cellPaddingY + ' ' + densityConfig.cellPaddingX,
                    }}
                  >
                    <div
                      className={shimmerStyles.shimmerRow}
                      style={{
                        width: `${50 + ((i + ci) % 4) * 12}%`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmptyState && (
          <HbcEmptyState
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            illustration={emptyStateConfig.icon}
            action={emptyStateConfig.action}
          />
        )}

        {/* Card-stack mobile view */}
        {showCardStack && !showEmptyState && (
          <div className={styles.cardStack}>
            {rows.map((row) => (
              <HbcDataTableCard
                key={row.id}
                row={row.original}
                rowId={row.id}
                columns={columns}
                mobileCardFields={mobileCardFields!}
                isExpanded={expandedCards.has(row.id)}
                isSelected={row.getIsSelected()}
                isResponsible={isRowResponsible(row.original)}
                isFieldMode={isFieldMode}
                enableRowSelection={enableRowSelection}
                onToggleExpand={() => {
                  setExpandedCards((prev) => {
                    const next = new Set(prev);
                    if (next.has(row.id)) next.delete(row.id);
                    else next.add(row.id);
                    return next;
                  });
                }}
                onRowClick={onRowClick}
                onSelectionToggle={() =>
                  row.toggleSelected(!row.getIsSelected())
                }
              />
            ))}
          </div>
        )}

        {/* Standard table view */}
        {!showCardStack && !showEmptyState && (
          <table className={styles.table} role="table">
            <thead className={styles.thead}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      id={!header.isPlaceholder ? `${tableIdPrefix}-${header.id}` : undefined}
                      className={mergeClasses(
                        styles.th,
                        thDensityClass,
                        header.column.getCanSort() ? styles.thSortable : undefined,
                        frozenOffsets?.has(
                          (header.column.columnDef as { accessorKey?: string }).accessorKey ?? header.column.id,
                        )
                          ? mergeClasses(
                              styles.frozenHeader,
                              frozenOffsets.get(
                                (header.column.columnDef as { accessorKey?: string }).accessorKey ?? header.column.id,
                              )?.isLast
                                ? styles.frozenCellLast
                                : undefined,
                            )
                          : undefined,
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        width: header.getSize(),
                        ...(frozenOffsets?.has(
                          (header.column.columnDef as { accessorKey?: string }).accessorKey ?? header.column.id,
                        )
                          ? {
                              left: frozenOffsets.get(
                                (header.column.columnDef as { accessorKey?: string }).accessorKey ?? header.column.id,
                              )!.left,
                            }
                          : {}),
                      }}
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getIsSorted() === 'asc' && ' \u25B2'}
                      {header.column.getIsSorted() === 'desc' && ' \u25BC'}
                      {enableColumnConfig && (
                        <div
                          className={styles.thResizeHandle}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualRows.length > 0 && (
                <tr style={{ height: `${virtualRows[0].start}px` }}>
                  <td
                    colSpan={columns.length}
                    style={{ padding: 0, border: 'none' }}
                  />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                const responsible = isRowResponsible(row.original);
                const hasEditableColumns = editableColumns && editableColumns.length > 0;

                return (
                  <tr
                    key={row.id}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    className={mergeClasses(
                      styles.tr,
                      onRowClick ? styles.trClickable : undefined,
                      row.getIsSelected() ? styles.trSelected : undefined,
                      responsible
                        ? isFieldMode
                          ? styles.trResponsibilityField
                          : styles.trResponsibility
                        : undefined,
                      hasEditableColumns ? styles.trHover : undefined,
                    )}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => {
                      const colId =
                        (cell.column.columnDef as { accessorKey?: string })
                          .accessorKey ?? cell.column.id;
                      // D-PH4C-10: Space-separated ids support grouped headers; row headers are N/A in current table shape.
                      const headerIds = columnHeaderIds.get(colId)?.join(' ');
                      const isEditable = editableColumns?.includes(colId);
                      const isCurrentlyEditing =
                        editingCell?.rowId === row.id &&
                        editingCell?.columnId === colId;

                      const frozenInfo = frozenOffsets?.get(colId);

                      return (
                        <td
                          key={cell.id}
                          className={mergeClasses(
                            styles.td,
                            tdDensityClass,
                            isEditable && !isCurrentlyEditing
                              ? styles.tdEditable
                              : undefined,
                            isCurrentlyEditing ? styles.tdEditing : undefined,
                            frozenInfo
                              ? mergeClasses(
                                  styles.frozenCell,
                                  frozenInfo.isLast ? styles.frozenCellLast : undefined,
                                )
                              : undefined,
                          )}
                          style={frozenInfo ? { left: frozenInfo.left } : undefined}
                          headers={headerIds}
                          onDoubleClick={
                            isEditable
                              ? (e) => {
                                  e.stopPropagation();
                                  startEditing(
                                    row.id,
                                    colId,
                                    (row.original as Record<string, unknown>)[
                                      colId
                                    ],
                                  );
                                }
                              : undefined
                          }
                        >
                          {isCurrentlyEditing ? (
                            <input
                              ref={editInputRef}
                              className={styles.editInput}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={handleEditKeyDown}
                              style={{
                                padding:
                                  densityConfig.cellPaddingY +
                                  ' ' +
                                  densityConfig.cellPaddingX,
                              }}
                            />
                          ) : (
                            <>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                              {isEditable && cellIndex === 0 && (
                                <span
                                  className={mergeClasses(
                                    styles.editIcon,
                                    'edit-icon-target',
                                  )}
                                >
                                  {'\u270E'}
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {virtualRows.length > 0 && (
                <tr
                  style={{
                    height: `${virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)}px`,
                  }}
                >
                  <td
                    colSpan={columns.length}
                    style={{ padding: 0, border: 'none' }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        )}
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

export type { HbcDataTableProps, DataTableEmptyStateConfig } from './types.js';
