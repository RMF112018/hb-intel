import type { ReactNode } from 'react';
import { HbcCard, HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type { ReviewQueueEntry } from '@hbc/features-safety';
import { SafetyReviewActions } from './SafetyReviewActions.js';

/**
 * SafetyReviewEntryCard — Phase-04 audit G-05 Review queue triage framing.
 *
 * Per-entry triage card. Gives every queue item authored framing:
 *   - project context (project number + snapshot)
 *   - file + run id + attempt marker when this is a replay
 *   - status badge + reason
 *   - why it's here (mapped from errorClass / terminalStatus)
 *   - what the action does (per-row, specific to the terminal cause)
 *   - action cluster (existing SafetyReviewActions — governed supersede
 *     dialog preserved)
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyReviewEntryCardProps {
  readonly entry: ReviewQueueEntry;
  readonly isPending: boolean;
  readonly onRetry: (runId: string, supersedePrior: boolean) => void;
}

function terminalBadgeVariant(status: string): StatusVariant {
  switch (status) {
    case 'review-required':
      return 'atRisk';
    case 'parse-error':
    case 'invalid-template':
    case 'commit-failed':
      return 'critical';
    case 'unresolved-project':
    case 'reporting-period-mismatch':
      return 'warning';
    case 'replayed-success':
    case 'committed':
      return 'success';
    default:
      return 'neutral';
  }
}

interface RowFraming {
  readonly whyHere: ReactNode;
  readonly actionFraming: ReactNode;
  readonly diagnostic?: { readonly label: string; readonly value: string };
}

function framingFor(entry: ReviewQueueEntry): RowFraming {
  const { run } = entry;
  const errorClass = run.errorClass;
  const terminalStatus = run.terminalStatus;

  if (errorClass === 'duplicate-suspected') {
    return {
      whyHere:
        'Identity or checksum matched a prior inspection, so the pipeline stopped before commit to prevent silent replacement.',
      actionFraming:
        'Retry will replay as a new run and fail the same way if the duplicate condition persists. Supersede & commit (governed) will replace the prior inspection.',
    };
  }

  switch (terminalStatus) {
    case 'parse-error':
      return {
        whyHere:
          'The parser could not extract responses from this workbook — template present but contents unreadable.',
        actionFraming: 'Retry replays against the retained workbook through the same parse pipeline.',
        diagnostic: run.templateVersionDetected
          ? { label: 'Template version detected', value: run.templateVersionDetected }
          : undefined,
      };
    case 'invalid-template':
      return {
        whyHere:
          'The detected template version is not a supported Safety Checklist template.',
        actionFraming: 'Retry will fail until the workbook is re-issued on a supported template.',
        diagnostic: run.templateVersionDetected
          ? { label: 'Template version detected', value: run.templateVersionDetected }
          : undefined,
      };
    case 'commit-failed':
      return {
        whyHere:
          'The workbook parsed and resolved, but the final write to the inspection record set did not complete.',
        actionFraming:
          'Retry will re-attempt the commit. If it fails again, escalate with the run id — no data silently partial.',
        diagnostic: run.errorSummary
          ? { label: 'Adapter reported', value: run.errorSummary }
          : undefined,
      };
    case 'unresolved-project':
      return {
        whyHere:
          'The workbook’s project cell did not match an active HBCentral project or legacy fallback.',
        actionFraming:
          'Correct the project mapping upstream first — retry alone will not resolve the project.',
        diagnostic: run.attemptedProjectSiteText
          ? { label: 'Attempted project', value: run.attemptedProjectSiteText }
          : undefined,
      };
    case 'reporting-period-mismatch':
      return {
        whyHere:
          'The upload was submitted against a reporting period that is closed, published, or otherwise not accepting this run.',
        actionFraming:
          'Retry will fail until replayed against a reporting period that accepts new inspections.',
      };
    default:
      return {
        whyHere: entry.reason,
        actionFraming: 'Retry replays against the retained workbook. Inspect the cause before acting.',
      };
  }
}

export function SafetyReviewEntryCard({
  entry,
  isPending,
  onRetry,
}: SafetyReviewEntryCardProps): ReactNode {
  const { run } = entry;
  const framing = framingFor(entry);
  const isDuplicate = run.errorClass === 'duplicate-suspected';
  const attemptNumber = run.attemptNumber ?? 1;
  const isReplay = attemptNumber > 1;

  return (
    <HbcCard weight="standard">
      <article
        className="safety-review-card"
        data-safety-ui="review-entry-card"
        data-duplicate={isDuplicate ? 'true' : 'false'}
        data-terminal-status={run.terminalStatus}
        aria-label={`Review entry for ${entry.projectNumber ?? 'unknown project'}, ${run.uploadFileName}`}
      >
        <header className="safety-review-card__header">
          <div className="safety-review-card__project">
            <HbcTypography intent="heading4" as="h4">
              {entry.projectNumber ?? 'Project unresolved'}
            </HbcTypography>
            {entry.projectNameSnapshot && (
              <HbcTypography intent="bodySmall">
                {entry.projectNameSnapshot}
              </HbcTypography>
            )}
          </div>
          <div className="safety-review-card__badges">
            <HbcStatusBadge
              variant={terminalBadgeVariant(run.terminalStatus)}
              label={run.terminalStatus}
              size="small"
            />
            {isReplay && (
              <HbcStatusBadge
                variant="info"
                label={`Attempt ${attemptNumber}`}
                size="small"
              />
            )}
          </div>
        </header>

        <div className="safety-review-card__meta">
          <HbcTypography intent="bodySmall">
            File: <strong>{run.uploadFileName}</strong>
          </HbcTypography>
          <HbcTypography intent="bodySmall">Run {run.id}</HbcTypography>
        </div>

        <dl className="safety-review-card__framing">
          <div className="safety-review-card__framing-row">
            <dt>
              <HbcTypography intent="label">Why it’s here</HbcTypography>
            </dt>
            <dd>
              <HbcTypography intent="body">{framing.whyHere}</HbcTypography>
            </dd>
          </div>
          <div className="safety-review-card__framing-row">
            <dt>
              <HbcTypography intent="label">What the action does</HbcTypography>
            </dt>
            <dd>
              <HbcTypography intent="body">{framing.actionFraming}</HbcTypography>
            </dd>
          </div>
          {framing.diagnostic && (
            <div className="safety-review-card__framing-row">
              <dt>
                <HbcTypography intent="label">
                  {framing.diagnostic.label}
                </HbcTypography>
              </dt>
              <dd>
                <HbcTypography intent="bodySmall">
                  {framing.diagnostic.value}
                </HbcTypography>
              </dd>
            </div>
          )}
        </dl>

        <footer className="safety-review-card__actions">
          <SafetyReviewActions
            runId={run.id}
            inspectionEventId={entry.inspectionEventId}
            isDuplicate={isDuplicate}
            isPending={isPending}
            onRetry={onRetry}
            entryErrorClass={run.errorClass}
          />
        </footer>
      </article>
    </HbcCard>
  );
}
