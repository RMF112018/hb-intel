import * as React from 'react';
import { makeStyles } from '@griffel/react';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT, HBC_RADIUS_FULL } from '@hbc/ui-kit/theme';
import type { StepStatus } from '../../types/IStepWizard';

// ── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '12px',
    height: '12px',
    borderRadius: HBC_RADIUS_FULL,
    fontSize: '0.625rem',
    lineHeight: '1',
    flexShrink: 0,
  },
});

// ── Status map ──────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<StepStatus, { symbol: string; ariaLabel: string; color: string }> = {
  'not-started': { symbol: '○', ariaLabel: 'Not started', color: HBC_STATUS_COLORS.neutral },
  'in-progress': { symbol: '◐', ariaLabel: 'In progress', color: HBC_STATUS_COLORS.info },
  'complete':    { symbol: '✓', ariaLabel: 'Complete',     color: HBC_STATUS_COLORS.success },
  'blocked':     { symbol: '🔒', ariaLabel: 'Blocked',     color: HBC_STATUS_COLORS.warning },
  'skipped':     { symbol: '⊘', ariaLabel: 'Skipped',      color: HBC_SURFACE_LIGHT['text-muted'] },
};

export function StepStatusIcon({ status }: { status: StepStatus }): React.ReactElement {
  const styles = useStyles();
  const { symbol, ariaLabel, color } = STATUS_ICONS[status];
  return (
    <span className={styles.icon} style={{ color }} aria-label={ariaLabel} role="img">
      {symbol}
    </span>
  );
}
