import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcButton, HbcTypography } from '@hbc/ui-kit';
import {
  SafetyReplayPreviewDialog,
  type SafetyReplayPreviewContext,
} from './SafetyReplayPreviewDialog.js';

export interface SafetyReviewActionsProps {
  runId: string;
  inspectionEventId?: string;
  isDuplicate: boolean;
  isPending: boolean;
  onRetry: (runId: string, supersedePrior: boolean) => void;
  /**
   * Domain-level run error class. When present, retry truthfulness is
   * enforced: classes that cannot be resolved by a plain replay (template,
   * parse, period, project, replay-source-missing) are shown as advisory
   * guidance instead of a naive retry button. Duplicate suspects continue
   * to flow through the governed supersede dialog.
   */
  entryErrorClass?: string;
  /**
   * Frontend capability gate. When true, the current user is not authorized
   * to replay review-queue runs per the backend SAFETY_ACTION_ROLES matrix;
   * retry and supersede are suppressed and the accompanying reason text is
   * surfaced in place. Backend remains the final authority for 403 denial.
   */
  disabledByCapability?: boolean;
  capabilityReason?: string;
  /**
   * Optional preview context surfaced inside the governed supersede dialog
   * (parent run, retained workbook, project, prior terminal, etc.). All
   * fields are row-data already fetched by the review queue; the component
   * remains callable with just core props when preview context is absent.
   */
  previewContext?: SafetyReplayPreviewContext;
}

type RetryPosture = 'retryable' | 'needs-workbook-fix' | 'needs-period-fix' | 'needs-project-fix' | 'replay-source-missing';

function retryPostureFor(errorClass: string | undefined): RetryPosture {
  switch (errorClass) {
    case 'template-invalid':
    case 'template-unsupported-version':
    case 'parse-error':
      return 'needs-workbook-fix';
    case 'reporting-period-mismatch':
      return 'needs-period-fix';
    case 'project-unresolved':
      return 'needs-project-fix';
    case 'replay-source-missing':
      return 'replay-source-missing';
    default:
      return 'retryable';
  }
}

function guidanceFor(posture: RetryPosture): string {
  switch (posture) {
    case 'needs-workbook-fix':
      return 'Replay cannot fix this — correct the workbook (template version or parser authority fields) before resubmitting.';
    case 'needs-period-fix':
      return 'Replay cannot fix this — select or open a reporting period that includes the inspection date before resubmitting.';
    case 'needs-project-fix':
      return 'Replay cannot fix this — correct the workbook project cell or pick a resolvable project, then resubmit.';
    case 'replay-source-missing':
      return 'The retained source workbook is unavailable; replay is not possible for this run.';
    default:
      return '';
  }
}

/**
 * SafetyReviewActions — review-queue row action cluster.
 *
 * Retry-truthfulness rule: replay only runs the same pipeline against the
 * retained source workbook — it cannot fix template, parse, period, or
 * project-resolution failures. For those classes, the CTA is replaced
 * with advisory guidance that points at the real next step. Duplicate
 * suspects continue to flow through the governed supersede dialog.
 *
 * Retry (standard replay) is intentionally single-click: it uses the same
 * pipeline and produces a new run but does not mutate the prior inspection.
 */
export function SafetyReviewActions({
  runId,
  inspectionEventId,
  isDuplicate,
  isPending,
  onRetry,
  entryErrorClass,
  disabledByCapability = false,
  capabilityReason,
  previewContext,
}: SafetyReviewActionsProps): ReactNode {
  const [showSupersedeConfirm, setShowSupersedeConfirm] = useState(false);
  const posture = retryPostureFor(entryErrorClass);
  const canPlainRetry = posture === 'retryable' && !isDuplicate && !disabledByCapability;

  const handleSupersedeConfirm = (): void => {
    if (disabledByCapability) return;
    setShowSupersedeConfirm(false);
    onRetry(runId, true);
  };

  const dialogContext: SafetyReplayPreviewContext = {
    ...previewContext,
    errorClass: previewContext?.errorClass ?? entryErrorClass,
  };

  return (
    <div className="safety-review-actions" data-safety-ui="review-actions">
      {disabledByCapability && (
        <div
          className="safety-review-actions__guidance"
          data-safety-ui="review-capability-blocked"
        >
          <HbcTypography intent="bodySmall">
            {capabilityReason ??
              'Your account is not authorized to replay review-queue runs.'}
          </HbcTypography>
        </div>
      )}
      {canPlainRetry && (
        <HbcButton
          variant="secondary"
          disabled={isPending}
          onClick={() => onRetry(runId, false)}
        >
          {isPending ? 'Replaying…' : 'Retry'}
        </HbcButton>
      )}
      {!canPlainRetry && !isDuplicate && !disabledByCapability && (
        <div
          className="safety-review-actions__guidance"
          data-safety-ui="review-retry-guidance"
          data-retry-posture={posture}
        >
          <HbcTypography intent="bodySmall">{guidanceFor(posture)}</HbcTypography>
        </div>
      )}
      {isDuplicate && !disabledByCapability && (
        <>
          <HbcButton
            variant="secondary"
            disabled={isPending}
            onClick={() => setShowSupersedeConfirm(true)}
            data-safety-ui="supersede-trigger"
          >
            Supersede & commit
          </HbcButton>
          <SafetyReplayPreviewDialog
            open={showSupersedeConfirm}
            runId={runId}
            inspectionEventId={inspectionEventId}
            isPending={isPending}
            context={dialogContext}
            onCancel={() => setShowSupersedeConfirm(false)}
            onConfirm={handleSupersedeConfirm}
          />
        </>
      )}
      {inspectionEventId && (
        <Link
          className="safety-link"
          to="/inspections/$inspectionEventId"
          params={{ inspectionEventId }}
        >
          Open inspection
        </Link>
      )}
    </div>
  );
}
