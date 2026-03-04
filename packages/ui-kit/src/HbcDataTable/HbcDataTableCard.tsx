/**
 * HbcDataTableCard — Card-stack mobile view for HbcDataTable
 * PH4.7 §7.1 Step 4 | Blueprint §1d
 *
 * Renders a single data row as a card when viewport < 640px.
 * Shows mobileCardFields values with labels, chevron to expand.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import type { ColumnDef } from '@tanstack/react-table';

const useStyles = makeStyles({
  card: {
    backgroundColor: 'var(--colorNeutralBackground1)',
    borderRadius: '8px',
    border: '1px solid var(--colorNeutralStroke2)',
    marginBottom: '8px',
    overflow: 'hidden',
    transitionProperty: 'box-shadow',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
  },
  cardResponsibility: {
    borderTopWidth: '4px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_ACCENT_ORANGE,
    backgroundColor: HBC_SURFACE_LIGHT['responsibility-bg'],
  },
  cardResponsibilityField: {
    borderTopColor: HBC_ACCENT_ORANGE,
    backgroundColor: HBC_SURFACE_FIELD['responsibility-bg'],
  },
  cardSelected: {
    borderTopColor: HBC_PRIMARY_BLUE as string,
    borderBottomColor: HBC_PRIMARY_BLUE as string,
    borderLeftColor: HBC_PRIMARY_BLUE as string,
    borderRightColor: HBC_PRIMARY_BLUE as string,
    boxShadow: `0 0 0 1px ${HBC_PRIMARY_BLUE}`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '12px',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    cursor: 'pointer',
    gap: '12px',
  },
  cardCheckbox: {
    flexShrink: 0,
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  cardField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  cardLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--colorNeutralForeground3)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    flexShrink: 0,
  },
  cardValue: {
    fontSize: '0.875rem',
    color: 'var(--colorNeutralForeground1)',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    flexShrink: 0,
    fontSize: '1rem',
    color: 'var(--colorNeutralForeground3)',
    transitionProperty: 'transform',
    transitionDuration: TRANSITION_FAST,
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  expandedContent: {
    paddingTop: '0',
    paddingBottom: '12px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderTop: '1px solid var(--colorNeutralStroke3)',
  },
  expandedField: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderBottom: '1px solid var(--colorNeutralStroke3)',
    ':last-child': {
      borderBottom: 'none',
    },
  },
});

export interface HbcDataTableCardProps<TData> {
  row: TData;
  rowId: string;
  columns: ColumnDef<TData, unknown>[];
  mobileCardFields: string[];
  isExpanded: boolean;
  isSelected: boolean;
  isResponsible: boolean;
  isFieldMode: boolean;
  enableRowSelection: boolean;
  onToggleExpand: () => void;
  onRowClick?: (row: TData) => void;
  onSelectionToggle?: () => void;
}

export function HbcDataTableCard<TData>({
  row,
  columns,
  mobileCardFields,
  isExpanded,
  isSelected,
  isResponsible,
  isFieldMode,
  enableRowSelection,
  onToggleExpand,
  onRowClick,
  onSelectionToggle,
}: HbcDataTableCardProps<TData>): React.JSX.Element {
  const styles = useStyles();

  const data = row as Record<string, unknown>;

  const getColumnHeader = (accessorKey: string): string => {
    const col = columns.find((c) => {
      const def = c as { accessorKey?: string };
      return def.accessorKey === accessorKey;
    });
    if (col && typeof col.header === 'string') return col.header;
    return accessorKey;
  };

  const allAccessorKeys = columns
    .map((c) => (c as { accessorKey?: string }).accessorKey)
    .filter(Boolean) as string[];

  const remainingFields = allAccessorKeys.filter(
    (key) => !mobileCardFields.includes(key),
  );

  return (
    <div
      data-hbc-ui="data-table-card"
      className={mergeClasses(
        styles.card,
        isResponsible
          ? isFieldMode
            ? styles.cardResponsibilityField
            : styles.cardResponsibility
          : undefined,
        isSelected ? styles.cardSelected : undefined,
      )}
    >
      <div
        className={styles.cardHeader}
        onClick={() => {
          onToggleExpand();
          onRowClick?.(row);
        }}
      >
        {enableRowSelection && (
          <input
            type="checkbox"
            className={styles.cardCheckbox}
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelectionToggle?.();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <div className={styles.cardContent}>
          {mobileCardFields.map((key) => (
            <div key={key} className={styles.cardField}>
              <span className={styles.cardLabel}>{getColumnHeader(key)}</span>
              <span className={styles.cardValue}>{String(data[key] ?? '')}</span>
            </div>
          ))}
        </div>
        <span
          className={mergeClasses(
            styles.chevron,
            isExpanded ? styles.chevronExpanded : undefined,
          )}
        >
          {'\u25BC'}
        </span>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          {remainingFields.map((key) => (
            <div key={key} className={styles.expandedField}>
              <span className={styles.cardLabel}>{getColumnHeader(key)}</span>
              <span className={styles.cardValue}>{String(data[key] ?? '')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
