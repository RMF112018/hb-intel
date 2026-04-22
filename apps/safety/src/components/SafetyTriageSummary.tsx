import type { ReactNode } from 'react';
import {
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type {
  SafetyQueueNarrative,
  SafetyQueueState,
  SafetyTriageCategory,
} from '../pages/reviewQueueTriage.js';

/**
 * SafetyTriageSummary — Phase-04 audit G-05 Review queue triage framing.
 *
 * Authored summary panel that names the queue state in plain language
 * (clean / light / duplicate-heavy / failure-heavy / backed-up / active),
 * carries a priority-framing sentence, and surfaces per-category counts.
 * Replaces the old "count in masthead meta + jump into the table" posture
 * so the first view of the review queue reads as a triage workspace.
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyTriageSummaryProps {
  readonly narrative: SafetyQueueNarrative;
  readonly categories: ReadonlyArray<SafetyTriageCategory>;
  readonly totalEntries: number;
}

const STATE_BADGE_VARIANT: Record<SafetyQueueState, StatusVariant> = {
  clean: 'success',
  light: 'info',
  active: 'onTrack',
  'backed-up': 'atRisk',
  'duplicate-heavy': 'atRisk',
  'failure-heavy': 'critical',
};

const STATE_BADGE_LABEL: Record<SafetyQueueState, string> = {
  clean: 'Clean',
  light: 'Light queue',
  active: 'Active',
  'backed-up': 'Backed up',
  'duplicate-heavy': 'Duplicate-heavy',
  'failure-heavy': 'Failure-heavy',
};

export function SafetyTriageSummary({
  narrative,
  categories,
  totalEntries,
}: SafetyTriageSummaryProps): ReactNode {
  const isClean = narrative.state === 'clean';

  return (
    <HbcCard weight="primary">
      <section
        className="safety-triage-summary"
        data-safety-ui="triage-summary"
        data-queue-state={narrative.state}
        aria-labelledby="safety-triage-summary-headline"
      >
        <header className="safety-triage-summary__header">
          <HbcStatusBadge
            variant={STATE_BADGE_VARIANT[narrative.state]}
            label={STATE_BADGE_LABEL[narrative.state]}
            size="small"
          />
          <HbcTypography intent="heading3" as="h2">
            <span id="safety-triage-summary-headline">{narrative.headline}</span>
          </HbcTypography>
          <HbcTypography intent="body">{narrative.rationale}</HbcTypography>
        </header>

        {!isClean && categories.length > 0 && (
          <div
            className="safety-triage-summary__categories"
            role="list"
            aria-label="Triage categories"
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                role="listitem"
                className="safety-triage-summary__category"
                data-category-id={cat.id}
              >
                <HbcTypography intent="label">{cat.title}</HbcTypography>
                <HbcTypography intent="heading3" as="span">
                  {cat.entries.length}
                </HbcTypography>
                <HbcTypography intent="bodySmall">{cat.rationale}</HbcTypography>
              </div>
            ))}
          </div>
        )}

        {isClean && (
          <div
            className="safety-triage-summary__clean"
            data-safety-ui="triage-clean-state"
          >
            <HbcTypography intent="bodySmall">
              {totalEntries === 0
                ? 'No uploads from the latest ingestion required manual review.'
                : `${totalEntries} items resolved.`}
            </HbcTypography>
          </div>
        )}
      </section>
    </HbcCard>
  );
}
