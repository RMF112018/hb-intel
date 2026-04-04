/**
 * HbcEvidenceSummaryBar — Phase 11 evidence capture status.
 *
 * Compact bar showing which safety controls were satisfied or skipped,
 * and how many evidence artifacts were captured.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcEvidenceSummaryBarProps } from './types.js';
import { body } from '../theme/index.js';
import { HBC_STATUS_COLORS } from '../theme/index.js';

export type { HbcEvidenceSummaryBarProps, EvidenceSummary } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    ...shorthands.padding('8px', '16px'),
    ...shorthands.borderRadius('6px'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.06)'),
    backgroundColor: 'rgba(0,0,0,0.02)',
    flexWrap: 'wrap' as const,
  },
  label: {
    ...body,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    opacity: 0.6,
  },
  checks: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    flexWrap: 'wrap' as const,
  },
  check: {
    display: 'inline-flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    ...shorthands.padding('2px', '6px'),
    ...shorthands.borderRadius('3px'),
    fontSize: '11px',
    fontWeight: 500,
  },
  satisfied: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    color: HBC_STATUS_COLORS.success,
  },
  skipped: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    color: HBC_STATUS_COLORS.error,
  },
  refCount: {
    ...body,
    fontSize: '12px',
    fontWeight: 600,
    marginLeft: 'auto',
  },
});

const CHECK_LABELS: Record<string, string> = {
  preview: 'Preview',
  confirmation: 'Confirmation',
  validation: 'Validation',
  recovery: 'Recovery',
};

export const HbcEvidenceSummaryBar: React.FC<HbcEvidenceSummaryBarProps> = ({
  summary,
  className,
}) => {
  const styles = useStyles();

  const checks = [
    { key: 'preview', captured: summary.previewCaptured },
    { key: 'confirmation', captured: summary.confirmationCaptured },
    { key: 'validation', captured: summary.validationCaptured },
    { key: 'recovery', captured: summary.recoveryCaptured },
  ];

  const hasSkipped = summary.controlsSkipped.length > 0;

  return (
    <div
      data-hbc-ui="evidence-summary-bar"
      role="status"
      aria-label={`Evidence: ${summary.controlsSatisfied.length} controls satisfied${hasSkipped ? `, ${summary.controlsSkipped.length} skipped` : ''}`}
      className={mergeClasses(styles.root, className)}
    >
      <span className={styles.label}>Evidence</span>
      <div className={styles.checks}>
        {checks.map(({ key, captured }) => (
          <span
            key={key}
            className={mergeClasses(styles.check, captured ? styles.satisfied : styles.skipped)}
          >
            {captured ? '✓' : '—'} {CHECK_LABELS[key]}
          </span>
        ))}
      </div>
      <span className={styles.refCount}>
        {summary.evidenceRefCount} artifact{summary.evidenceRefCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
};
