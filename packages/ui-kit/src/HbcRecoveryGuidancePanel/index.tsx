/**
 * HbcRecoveryGuidancePanel — Phase 11 recovery steps display.
 *
 * Renders ordered recovery steps with action-type indicators,
 * complexity estimation, and external action callouts.
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { HbcRecoveryGuidancePanelProps } from './types.js';
import { body } from '../theme/index.js';
import { HBC_STATUS_COLORS } from '../theme/index.js';

export type { HbcRecoveryGuidancePanelProps, RecoveryGuidance, RecoveryStep } from './types.js';

const COMPLEXITY_LABELS: Record<string, { label: string; color: string }> = {
  simple:            { label: 'Simple recovery', color: HBC_STATUS_COLORS.success },
  moderate:          { label: 'Moderate recovery', color: HBC_STATUS_COLORS.warning },
  complex:           { label: 'Complex recovery', color: HBC_STATUS_COLORS.error },
  'requires-support': { label: 'Requires support', color: '#991B1B' },
};

const ACTION_TYPE_LABELS: Record<string, { symbol: string; label: string }> = {
  automatic: { symbol: '⚡', label: 'Automatic' },
  manual:    { symbol: '✋', label: 'Manual' },
  external:  { symbol: '↗', label: 'External' },
};

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
    ...shorthands.padding('16px'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.08)'),
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...body,
    fontWeight: 600,
    fontSize: '14px',
  },
  complexity: {
    ...body,
    fontSize: '12px',
    fontWeight: 600,
    ...shorthands.padding('2px', '8px'),
    ...shorthands.borderRadius('4px'),
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    ...shorthands.padding('0px'),
    ...shorthands.margin('0px'),
    listStyleType: 'none',
    counterReset: 'recovery-step',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('10px'),
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    ...shorthands.borderRadius('12px'),
    backgroundColor: 'rgba(0,0,0,0.06)',
    fontSize: '12px',
    fontWeight: 600,
    flexShrink: 0,
  },
  stepContent: {
    flexGrow: 1,
    minWidth: 0,
  },
  stepLabel: {
    ...body,
    fontWeight: 600,
    fontSize: '13px',
  },
  stepDesc: {
    ...body,
    fontSize: '12px',
    opacity: 0.8,
  },
  stepType: {
    fontSize: '11px',
    opacity: 0.6,
    marginTop: '2px',
  },
  triggerButton: {
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.15)'),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    },
  },
  externalSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.borderLeft('3px', 'solid', HBC_STATUS_COLORS.warning),
    backgroundColor: 'rgba(251,191,36,0.06)',
  },
  externalTitle: {
    ...body,
    fontSize: '12px',
    fontWeight: 600,
  },
  externalItem: {
    ...body,
    fontSize: '12px',
    opacity: 0.8,
  },
  compensation: {
    ...body,
    fontSize: '12px',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.borderLeft('3px', 'solid', HBC_STATUS_COLORS.success),
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
});

export const HbcRecoveryGuidancePanel: React.FC<HbcRecoveryGuidancePanelProps> = ({
  guidance,
  onTriggerAction,
  className,
}) => {
  const styles = useStyles();
  const complexityInfo = COMPLEXITY_LABELS[guidance.estimatedComplexity] ?? COMPLEXITY_LABELS.moderate;

  return (
    <div
      data-hbc-ui="recovery-guidance-panel"
      role="region"
      aria-label="Recovery guidance"
      className={mergeClasses(styles.root, className)}
    >
      <div className={styles.header}>
        <span className={styles.title}>Recovery Guidance</span>
        <span
          className={styles.complexity}
          style={{ color: complexityInfo.color, backgroundColor: `${complexityInfo.color}10` }}
        >
          {complexityInfo.label}
        </span>
      </div>

      {guidance.compensationAvailable && (
        <div className={styles.compensation}>
          Automatic compensation is available for this action.
        </div>
      )}

      <ol className={styles.steps}>
        {guidance.steps.map((step) => {
          const typeInfo = ACTION_TYPE_LABELS[step.actionType] ?? ACTION_TYPE_LABELS.manual;
          return (
            <li key={step.order} className={styles.step}>
              <span className={styles.stepNumber}>{step.order}</span>
              <div className={styles.stepContent}>
                <div className={styles.stepLabel}>{step.label}</div>
                <div className={styles.stepDesc}>{step.description}</div>
                <div className={styles.stepType}>{typeInfo.symbol} {typeInfo.label}</div>
              </div>
              {step.actionType === 'automatic' && step.actionKey && onTriggerAction && (
                <button
                  type="button"
                  className={styles.triggerButton}
                  onClick={() => onTriggerAction(step.actionKey!)}
                >
                  Run
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {guidance.externalActions.length > 0 && (
        <div className={styles.externalSection}>
          <span className={styles.externalTitle}>External actions required:</span>
          {guidance.externalActions.map((action, i) => (
            <span key={i} className={styles.externalItem}>• {action}</span>
          ))}
        </div>
      )}
    </div>
  );
};
