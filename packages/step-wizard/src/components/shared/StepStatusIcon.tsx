import * as React from 'react';
import type { StepStatus } from '../../types/IStepWizard';

const STATUS_ICONS: Record<StepStatus, { symbol: string; ariaLabel: string; colorClass: string }> = {
  'not-started': { symbol: '\u25CB',  ariaLabel: 'Not started', colorClass: 'hbc-step-icon--neutral' },
  'in-progress': { symbol: '\u25D0',  ariaLabel: 'In progress',  colorClass: 'hbc-step-icon--active'  },
  'complete':    { symbol: '\u2713',  ariaLabel: 'Complete',     colorClass: 'hbc-step-icon--success' },
  'blocked':     { symbol: '\uD83D\uDD12', ariaLabel: 'Blocked',      colorClass: 'hbc-step-icon--warning' },
  'skipped':     { symbol: '\u2298',  ariaLabel: 'Skipped',      colorClass: 'hbc-step-icon--muted'   },
};

export function StepStatusIcon({ status }: { status: StepStatus }): React.ReactElement {
  const { symbol, ariaLabel, colorClass } = STATUS_ICONS[status];
  return (
    <span className={`hbc-step-icon ${colorClass}`} aria-label={ariaLabel} role="img">
      {symbol}
    </span>
  );
}
