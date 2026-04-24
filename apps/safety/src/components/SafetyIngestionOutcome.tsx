import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import type { IngestionRunResult } from '@hbc/features-safety';
import {
  suggestedActionForClass,
  type SafetyFailureClass,
  type SupportDetails,
} from '../pages/supportTruth.js';
import { SupportDetailsPanel } from './SupportDetailsPanel.js';

/**
 * SafetyIngestionOutcome — Phase-04 audit G-03 Upload redesign.
 *
 * Replaces the legacy IngestionResultBanner on UploadPage with per-state
 * authored outcome content. For each of the seven terminal ingestion
 * states the component renders:
 *   - status badge + authored title + run id
 *   - three framing sections: "What happened" / "What it means" /
 *     "What to do next"
 *   - next-step CTA cluster using existing routes only
 *
 * Honesty-of-routes rule: every CTA routes to a real router entry using
 * data already present on IngestionRunResult. No inferred params, no
 * speculative fetches, no fake routes. The committed secondary CTA
 * (drill into the reporting period) is rendered only when both
 * projectNumber and weekStartDate are present on
 * result.committed.projectWeekRecord — otherwise it is omitted.
 *
 * Local to Safety — not promoted to @hbc/ui-kit.
 */

export interface SafetyIngestionOutcomeProps {
  readonly result: IngestionRunResult;
}

interface OutcomeCopy {
  readonly title: string;
  readonly statusLabel: string;
  readonly statusVariant: StatusVariant;
  readonly tone: 'success' | 'warning' | 'error';
  readonly happened: ReactNode;
  readonly meaning: ReactNode;
  readonly nextStep: ReactNode;
}

function buildCopy(result: IngestionRunResult): OutcomeCopy {
  const { run } = result;
  switch (result.state) {
    case 'committed': {
      const committed = result.committed;
      if (!committed) {
        // Truthfulness guard: the backend said "committed" but the
        // committed payload is missing, so we cannot assert success
        // without fabricating detail. Render the ambiguous-terminal
        // fallback rather than a false committed outcome.
        return {
          title: 'Ingestion reported committed without a committed payload',
          statusLabel: 'Ambiguous',
          statusVariant: 'warning',
          tone: 'warning',
          happened:
            'The backend reported a committed terminal state but the committed payload was not returned with the response.',
          meaning:
            'We cannot confirm the inspection was written as the authoritative record. Operations must verify in the Review queue before trusting this run.',
          nextStep: 'Open the Review queue to verify this run before acting on it.',
        };
      }
      const score = Math.round(committed.inspectionEvent.inspectionScore * 100);
      const findingCount = committed.findings.length;
      return {
        title: 'Inspection committed',
        statusLabel: 'Committed',
        statusVariant: 'success',
        tone: 'success',
        happened: (
          <>
            The workbook validated, the project resolved, and the parsed
            inspection was written as the authoritative record for this
            reporting period.
          </>
        ),
        meaning: `The inspection scored ${score}% with ${findingCount} finding${findingCount === 1 ? '' : 's'} extracted and retained against the source workbook.`,
        nextStep:
          'Open the committed inspection to review findings, or jump to the reporting-period dashboard for the project rollup.',
      };
    }
    case 'review-required': {
      const isDuplicate = run.errorClass === 'duplicate-suspected';
      return {
        title: isDuplicate ? 'Duplicate suspected — review required' : 'Review required',
        statusLabel: 'Review required',
        statusVariant: 'atRisk',
        tone: 'warning',
        happened: isDuplicate
          ? 'The upload matched a prior inspection by identity or checksum, so the pipeline stopped before commit to prevent silent replacement.'
          : 'The upload parsed cleanly but was flagged for human review before commit.',
        meaning: isDuplicate
          ? 'The record set was not modified. You will decide in the Review queue whether to supersede the prior inspection (governed, confirmed) or discard this upload.'
          : 'The record set was not modified. The run is held in the Review queue awaiting triage.',
        nextStep: 'Open the Review queue to triage this run.',
      };
    }
    case 'unresolved-project': {
      const attempted = run.attemptedProjectSiteText;
      return {
        title: 'Project could not be resolved',
        statusLabel: 'Project unresolved',
        statusVariant: 'warning',
        tone: 'warning',
        happened: attempted
          ? `The project cell in the workbook (${attempted}) did not match an active project in HBCentral or a legacy fallback.`
          : 'The project cell in the workbook did not match an active project in HBCentral or a legacy fallback.',
        meaning:
          'No inspection was written. The run is held in the Review queue until the mapping is corrected.',
        nextStep: 'Open the Review queue to correct the project mapping and retry.',
      };
    }
    case 'reporting-period-mismatch':
      return {
        title: 'Reporting period mismatch',
        statusLabel: 'Period mismatch',
        statusVariant: 'warning',
        tone: 'warning',
        happened:
          'The workbook was submitted against a reporting period that is closed, published, or otherwise not accepting this run.',
        meaning: 'No inspection was written. The run is held in the Review queue.',
        nextStep: 'Open the Review queue to replay against the correct reporting period.',
      };
    case 'parse-error': {
      const version = run.templateVersionDetected;
      return {
        title: 'Workbook could not be parsed',
        statusLabel: 'Parse error',
        statusVariant: 'critical',
        tone: 'error',
        happened: version
          ? `The parser detected template version ${version} but could not extract responses from the workbook.`
          : 'The parser could not extract responses from the workbook.',
        meaning:
          'No inspection was written. The source workbook is retained for retry against the same parse pipeline.',
        nextStep: 'Open the Review queue to inspect the parse failure and retry.',
      };
    }
    case 'invalid-template': {
      const version = run.templateVersionDetected;
      return {
        title: 'Template version not supported',
        statusLabel: 'Invalid template',
        statusVariant: 'critical',
        tone: 'error',
        happened: version
          ? `The parser detected template version ${version}, which is not a supported Safety Checklist template.`
          : 'The workbook does not match a supported Safety Checklist template.',
        meaning:
          'No inspection was written. The upload needs to be re-issued against a supported template version.',
        nextStep:
          'Open the Review queue to confirm the detected version and decide whether to discard or retry.',
      };
    }
    case 'commit-failed':
      return {
        title: 'Commit failed after successful parse',
        statusLabel: 'Commit failed',
        statusVariant: 'critical',
        tone: 'error',
        happened:
          'The workbook parsed, scored, and resolved against a project, but the final write to the inspection record set did not complete.',
        meaning:
          'The record set may be partially touched — the run is held in the Review queue so operations can decide whether to retry or escalate.',
        nextStep:
          'Open the Review queue to retry the commit. If failures repeat, contact operations with the run id below.',
      };
    default:
      return {
        title: `Ingestion terminal: ${result.state}`,
        statusLabel: result.state,
        statusVariant: 'neutral',
        tone: 'warning',
        happened: 'The pipeline terminated in a state this page does not specifically recognize.',
        meaning: 'No inspection was committed. See the Review queue for details.',
        nextStep: 'Open the Review queue to inspect this run.',
      };
  }
}

export function SafetyIngestionOutcome({
  result,
}: SafetyIngestionOutcomeProps): ReactNode {
  const copy = buildCopy(result);
  const { run } = result;

  // Gate the committed secondary CTA on real route data.
  const committedPw = result.committed?.projectWeekRecord;
  const committedWeekStartDate =
    result.state === 'committed'
      ? (committedPw as unknown as { weekStartDate?: string } | undefined)?.weekStartDate ??
        result.committed?.inspectionEvent.inspectionDate
      : undefined;
  const canDrillInPeriod =
    result.state === 'committed' &&
    !!committedPw &&
    !!committedPw.projectNumber &&
    !!committedWeekStartDate;
  const inspectionId =
    result.state === 'committed'
      ? result.committed?.inspectionEvent.id
      : undefined;
  const supportDetails = supportDetailsForRun(run);
  const hasSupportDetails =
    !!supportDetails.requestId ||
    !!supportDetails.failureClass ||
    !!supportDetails.previewFailureClass;
  const outcomeFailureClass = failureClassForOutcomeState(result.state);
  const outcomeSuggestedAction = outcomeFailureClass
    ? suggestedActionForClass(outcomeFailureClass)
    : undefined;
  const isUrgentFailure =
    result.state === 'commit-failed' ||
    result.state === 'parse-error' ||
    result.state === 'invalid-template';

  return (
    <HbcCard weight="primary">
      <section
        className="safety-ingestion-outcome"
        data-safety-ui="ingestion-outcome"
        data-outcome-state={result.state}
        data-outcome-tone={copy.tone}
        aria-labelledby="safety-ingestion-outcome-title"
        role={isUrgentFailure ? 'alert' : 'status'}
        aria-live={isUrgentFailure ? 'assertive' : 'polite'}
        aria-atomic={true}
      >
        <header className="safety-ingestion-outcome__header">
          <div className="safety-ingestion-outcome__badge">
            <HbcStatusBadge
              variant={copy.statusVariant}
              label={copy.statusLabel}
              size="medium"
            />
          </div>
          <HbcTypography intent="heading3" as="h2">
            <span id="safety-ingestion-outcome-title">{copy.title}</span>
          </HbcTypography>
          <HbcTypography intent="bodySmall">
            Run {run.id}
            {run.attemptNumber && run.attemptNumber > 1
              ? ` · attempt ${run.attemptNumber}`
              : ''}
          </HbcTypography>
        </header>

        <dl className="safety-ingestion-outcome__sections">
          <div className="safety-ingestion-outcome__section">
            <dt>
              <HbcTypography intent="label">What happened</HbcTypography>
            </dt>
            <dd>
              <HbcTypography intent="body">{copy.happened}</HbcTypography>
            </dd>
          </div>
          <div className="safety-ingestion-outcome__section">
            <dt>
              <HbcTypography intent="label">What it means</HbcTypography>
            </dt>
            <dd>
              <HbcTypography intent="body">{copy.meaning}</HbcTypography>
            </dd>
          </div>
          <div className="safety-ingestion-outcome__section">
            <dt>
              <HbcTypography intent="label">What to do next</HbcTypography>
            </dt>
            <dd>
              <HbcTypography intent="body">{copy.nextStep}</HbcTypography>
            </dd>
          </div>
          {run.errorSummary && (
            <div className="safety-ingestion-outcome__section">
              <dt>
                <HbcTypography intent="label">Adapter reported</HbcTypography>
              </dt>
              <dd>
                <HbcTypography intent="bodySmall">{run.errorSummary}</HbcTypography>
              </dd>
            </div>
          )}
        </dl>

        <nav
          className="safety-ingestion-outcome__actions"
          aria-label="Next steps"
        >
          {result.state === 'committed' && result.committed && inspectionId && (
            <Link
              className="safety-link safety-ingestion-outcome__cta safety-ingestion-outcome__cta--primary"
              to="/inspections/$inspectionEventId"
              params={{ inspectionEventId: inspectionId }}
              data-safety-ui="outcome-primary-cta"
              role="link"
            >
              Open inspection
            </Link>
          )}
          {result.state === 'committed' &&
            result.committed &&
            canDrillInPeriod &&
            committedPw && (
              <Link
                className="safety-link safety-ingestion-outcome__cta safety-ingestion-outcome__cta--secondary"
                to="/projects/$projectNumber/weeks/$weekStartDate"
                params={{
                  projectNumber: committedPw.projectNumber,
                  weekStartDate: committedWeekStartDate ?? '',
                }}
                data-safety-ui="outcome-secondary-cta"
                role="link"
              >
                Open reporting-period rollup
              </Link>
            )}
          {(result.state !== 'committed' ||
            !result.committed) && (
            <Link
              className="safety-link safety-ingestion-outcome__cta safety-ingestion-outcome__cta--primary"
              to="/review"
              data-safety-ui="outcome-primary-cta"
              role="link"
            >
              Open Review queue
            </Link>
          )}
        </nav>
        {hasSupportDetails && (
          <SupportDetailsPanel
            details={supportDetails}
            suggestedAction={outcomeSuggestedAction}
            data-safety-ui="outcome-support-details"
          />
        )}
      </section>
    </HbcCard>
  );
}

function supportDetailsForRun(run: IngestionRunResult['run']): SupportDetails {
  const loose = run as unknown as {
    requestId?: string;
    frontendRequestId?: string;
    backendRequestId?: string;
    failureClass?: string;
    previewFailureClass?: string;
  };
  const derivedFailureClass =
    loose.failureClass ?? run.errorClass ?? undefined;
  return {
    requestId: loose.requestId,
    frontendRequestId: loose.frontendRequestId,
    backendRequestId: loose.backendRequestId,
    failureClass: derivedFailureClass,
    previewFailureClass: loose.previewFailureClass,
    timestamp: run.runCompletedAt ?? undefined,
  };
}

function failureClassForOutcomeState(
  state: IngestionRunResult['state'],
): SafetyFailureClass | undefined {
  switch (state) {
    case 'commit-failed':
      return 'commit-failed';
    case 'parse-error':
      return 'parser-authority-violation';
    case 'invalid-template':
      return 'template-incompatibility';
    case 'reporting-period-mismatch':
      return 'reporting-period-mismatch';
    case 'unresolved-project':
      return 'project-unresolved';
    case 'review-required':
      return 'duplicate-supersession-risk';
    default:
      return undefined;
  }
}
