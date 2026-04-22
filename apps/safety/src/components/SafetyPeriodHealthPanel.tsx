import type { ReactNode } from 'react';
import { HbcCard, HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type {
  SafetyPeriodHealth,
  SafetyPeriodHealthState,
  SafetySignalTone,
} from '../pages/reportingPeriodDashboardDerivation.js';

/**
 * SafetyPeriodHealthPanel — Phase-04 audit G-04 dashboard recomposition.
 *
 * Authored operational summary that drives the first-read story for the
 * selected reporting period. Uses the canonical period-health state set
 * (on-track / watchlist / attention-needed / critical) — do not introduce
 * synonyms.
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyPeriodHealthPanelProps {
  readonly health: SafetyPeriodHealth;
  readonly periodLabel: string;
}

const STATE_BADGE_VARIANT: Record<SafetyPeriodHealthState, StatusVariant> = {
  'on-track': 'success',
  watchlist: 'info',
  'attention-needed': 'atRisk',
  critical: 'critical',
};

const STATE_BADGE_LABEL: Record<SafetyPeriodHealthState, string> = {
  'on-track': 'On track',
  watchlist: 'Watchlist',
  'attention-needed': 'Attention needed',
  critical: 'Critical',
};

const CHIP_VARIANT: Record<SafetySignalTone, StatusVariant> = {
  info: 'info',
  success: 'success',
  warning: 'atRisk',
  critical: 'critical',
};

export function SafetyPeriodHealthPanel({
  health,
  periodLabel,
}: SafetyPeriodHealthPanelProps): ReactNode {
  return (
    <HbcCard weight="primary">
      <section
        className="safety-period-health-panel"
        data-safety-ui="period-health-panel"
        data-health-state={health.state}
        aria-labelledby="safety-period-health-headline"
      >
        <header className="safety-period-health-panel__header">
          <div className="safety-period-health-panel__badges">
            <HbcStatusBadge
              variant={STATE_BADGE_VARIANT[health.state]}
              label={STATE_BADGE_LABEL[health.state]}
              size="small"
            />
            <HbcTypography intent="bodySmall">{periodLabel}</HbcTypography>
          </div>
          <HbcTypography intent="heading3" as="h2">
            <span id="safety-period-health-headline">{health.headline}</span>
          </HbcTypography>
          <HbcTypography intent="body">{health.rationale}</HbcTypography>
        </header>

        {health.signals.length > 0 && (
          <div
            className="safety-period-health-panel__signals"
            role="list"
            aria-label="Period signals"
          >
            {health.signals.map((signal) => (
              <div
                key={signal.id}
                role="listitem"
                className="safety-period-health-panel__signal"
                data-signal-tone={signal.tone}
              >
                <HbcStatusBadge
                  variant={CHIP_VARIANT[signal.tone]}
                  label={signal.label}
                  size="small"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </HbcCard>
  );
}
