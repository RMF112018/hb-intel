/**
 * HbcImpactSummaryList — Phase 11 preview impact items display.
 *
 * Renders a structured list of impact items from a safety preview,
 * with change-type indicators, reversibility flags, and per-item risk.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcImpactSummaryListProps, ImpactItem } from './types.js';
import { HbcRiskBadge } from '../HbcRiskBadge/index.js';
import { body } from '../theme/index.js';

export type { HbcImpactSummaryListProps, ImpactItem } from './types.js';

const CHANGE_ICONS: Record<string, { symbol: string; label: string; color: string }> = {
  create:     { symbol: '+', label: 'Create', color: '#16A34A' },
  update:     { symbol: '~', label: 'Update', color: '#D97706' },
  delete:     { symbol: '−', label: 'Delete', color: '#DC2626' },
  'no-change': { symbol: '·', label: 'No change', color: '#6B7280' },
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('0px'),
    ...shorthands.margin('0px'),
    listStyleType: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('8px'),
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'rgba(0,0,0,0.02)',
    '@media (forced-colors: active)': {
      ...shorthands.border('1px', 'solid', 'CanvasText'),
    },
  },
  changeIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    ...shorthands.borderRadius('4px'),
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: '20px',
    flexShrink: 0,
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
  },
  resource: {
    ...body,
    fontWeight: 600,
    fontSize: '13px',
  },
  description: {
    ...body,
    fontSize: '12px',
    opacity: 0.8,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    marginTop: '4px',
  },
  irreversible: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#DC2626',
  },
  empty: {
    ...body,
    fontSize: '13px',
    opacity: 0.6,
    ...shorthands.padding('12px'),
    textAlign: 'center' as const,
  },
});

export const HbcImpactSummaryList: React.FC<HbcImpactSummaryListProps> = ({
  items,
  className,
}) => {
  const styles = useStyles();

  if (items.length === 0) {
    return (
      <div data-hbc-ui="impact-summary-list" className={mergeClasses(styles.empty, className)}>
        No impact items to display.
      </div>
    );
  }

  return (
    <ul data-hbc-ui="impact-summary-list" className={mergeClasses(styles.root, className)}>
      {items.map((item, i) => {
        const change = CHANGE_ICONS[item.changeType] ?? CHANGE_ICONS['no-change'];
        return (
          <li key={`${item.resource}-${i}`} className={styles.item}>
            <span
              className={styles.changeIcon}
              style={{ color: change.color, backgroundColor: `${change.color}15` }}
              aria-label={change.label}
            >
              {change.symbol}
            </span>
            <div className={styles.content}>
              <div className={styles.resource}>{item.resource}</div>
              <div className={styles.description}>{item.description}</div>
              <div className={styles.meta}>
                <HbcRiskBadge riskLevel={item.itemRiskLevel} size="small" />
                {!item.reversible && (
                  <span className={styles.irreversible} aria-label="Irreversible change">
                    Irreversible
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
