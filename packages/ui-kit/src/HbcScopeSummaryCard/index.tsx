/**
 * HbcScopeSummaryCard — Phase 11 execution scope display.
 *
 * Card showing the intended scope of an admin action: domain, target,
 * affected resource count, and scope description.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcScopeSummaryCardProps } from './types.js';
import { HbcRiskBadge } from '../HbcRiskBadge/index.js';
import { body } from '../theme/index.js';

export type { HbcScopeSummaryCardProps, ExecutionScope } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('12px', '16px'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.08)'),
    backgroundColor: 'rgba(0,0,0,0.02)',
    '@media (forced-colors: active)': {
      ...shorthands.border('1px', 'solid', 'CanvasText'),
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...body,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    opacity: 0.6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
  },
  field: {
    ...body,
    fontSize: '13px',
  },
  fieldLabel: {
    fontWeight: 600,
    marginRight: '4px',
  },
  description: {
    ...body,
    fontSize: '13px',
    opacity: 0.8,
  },
  count: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(0,0,0,0.06)',
    fontSize: '12px',
    fontWeight: 600,
  },
});

export const HbcScopeSummaryCard: React.FC<HbcScopeSummaryCardProps> = ({
  scope,
  riskLevel,
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      data-hbc-ui="scope-summary-card"
      className={mergeClasses(styles.root, className)}
    >
      <div className={styles.header}>
        <span className={styles.label}>Execution Scope</span>
        <HbcRiskBadge riskLevel={riskLevel} size="small" />
      </div>
      <div className={styles.row}>
        <span className={styles.field}>
          <span className={styles.fieldLabel}>Domain:</span>
          {scope.domain}
        </span>
        <span className={styles.count} aria-label={`${scope.affectedResourceCount} affected resources`}>
          {scope.affectedResourceCount} resource{scope.affectedResourceCount !== 1 ? 's' : ''}
        </span>
      </div>
      {scope.targetEntityLabel && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Target:</span>
          {scope.targetEntityLabel}
          {scope.targetEntityId && (
            <span style={{ opacity: 0.6, marginLeft: '4px' }}>({scope.targetEntityId})</span>
          )}
        </div>
      )}
      <div className={styles.description}>{scope.scopeDescription}</div>
    </div>
  );
};
