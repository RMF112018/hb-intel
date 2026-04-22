import type { ReactNode } from 'react';
import { HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * SafetyIntakeReadiness — Phase-04 audit G-03 Upload redesign.
 *
 * Authored readiness-checklist primitive. Makes the intake readiness model
 * explicit — the user can see, at a glance, whether each precondition is
 * ready, pending, or blocked, with an optional one-line detail. This is the
 * "real readiness model" the audit called for: a disabled submit button is
 * no longer the only readiness signal.
 *
 * Caller computes row state — this primitive is pure presentation.
 */

export type SafetyIntakeReadinessStatus = 'ready' | 'pending' | 'blocked';

export interface SafetyIntakeReadinessRow {
  readonly id: string;
  readonly label: string;
  readonly status: SafetyIntakeReadinessStatus;
  /** Optional one-line clarifying detail (e.g. "No reporting period selected."). */
  readonly detail?: ReactNode;
}

export interface SafetyIntakeReadinessProps {
  readonly rows: ReadonlyArray<SafetyIntakeReadinessRow>;
  /** Optional label announced to assistive tech via aria-label on the list. */
  readonly ariaLabel?: string;
}

const STATUS_VARIANT: Record<SafetyIntakeReadinessStatus, StatusVariant> = {
  ready: 'success',
  pending: 'pending',
  blocked: 'atRisk',
};

const STATUS_LABEL: Record<SafetyIntakeReadinessStatus, string> = {
  ready: 'Ready',
  pending: 'Pending',
  blocked: 'Blocked',
};

export function SafetyIntakeReadiness({
  rows,
  ariaLabel = 'Submission readiness',
}: SafetyIntakeReadinessProps): ReactNode {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className="safety-intake-readiness"
      data-safety-ui="intake-readiness"
    >
      {rows.map((row) => (
        <div
          key={row.id}
          role="listitem"
          className="safety-intake-readiness__row"
          data-row-status={row.status}
        >
          <div className="safety-intake-readiness__status">
            <HbcStatusBadge
              variant={STATUS_VARIANT[row.status]}
              label={STATUS_LABEL[row.status]}
              size="small"
            />
          </div>
          <div className="safety-intake-readiness__body">
            <HbcTypography intent="body">{row.label}</HbcTypography>
            {row.detail && (
              <HbcTypography intent="bodySmall">{row.detail}</HbcTypography>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
