import type { ReactNode } from 'react';
import { HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';

/**
 * SafetyIntakeStep — Phase-04 audit G-03 Upload redesign.
 *
 * Authored intake-runway step primitive. Gives the Upload page a numbered,
 * vertically ordered sequence of workflow steps (context / required inputs
 * / readiness / submission / outcomes) instead of a single flat card. The
 * step posture carries an optional status so the user can tell at a glance
 * which steps are pending, active, complete, or blocked.
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export type SafetyIntakeStepStatus = 'pending' | 'active' | 'ready' | 'blocked';

export interface SafetyIntakeStepProps {
  /** One-indexed step number shown in the step marker. */
  readonly stepNumber: number;
  readonly title: string;
  readonly description?: ReactNode;
  /**
   * Optional status drives the step-marker visual treatment and exposes a
   * status badge to the right of the title so it reads at a glance.
   * When omitted, the step renders in a neutral posture.
   */
  readonly status?: SafetyIntakeStepStatus;
  /** Overrides the default label shown in the status badge. */
  readonly statusLabel?: string;
  readonly children?: ReactNode;
}

const STATUS_BADGE_VARIANT: Record<SafetyIntakeStepStatus, StatusVariant> = {
  pending: 'neutral',
  active: 'info',
  ready: 'success',
  blocked: 'atRisk',
};

const DEFAULT_STATUS_LABEL: Record<SafetyIntakeStepStatus, string> = {
  pending: 'Not started',
  active: 'In progress',
  ready: 'Ready',
  blocked: 'Blocked',
};

export function SafetyIntakeStep({
  stepNumber,
  title,
  description,
  status,
  statusLabel,
  children,
}: SafetyIntakeStepProps): ReactNode {
  const effectiveStatus = status ?? 'pending';
  const effectiveLabel = statusLabel ?? DEFAULT_STATUS_LABEL[effectiveStatus];

  return (
    <section
      className="safety-intake-step"
      data-safety-ui="intake-step"
      data-step-status={effectiveStatus}
      aria-label={`Step ${stepNumber}: ${title}`}
    >
      <div className="safety-intake-step__marker" aria-hidden="true">
        <span className="safety-intake-step__marker-index">{stepNumber}</span>
      </div>
      <div className="safety-intake-step__body">
        <header className="safety-intake-step__header">
          <HbcTypography intent="heading3" as="h2">
            {title}
          </HbcTypography>
          {status && (
            <HbcStatusBadge
              variant={STATUS_BADGE_VARIANT[effectiveStatus]}
              label={effectiveLabel}
              size="small"
            />
          )}
        </header>
        {description && (
          <HbcTypography intent="bodySmall">{description}</HbcTypography>
        )}
        {children && <div className="safety-intake-step__content">{children}</div>}
      </div>
    </section>
  );
}
