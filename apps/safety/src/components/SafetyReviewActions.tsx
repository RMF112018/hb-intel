import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcButton, HbcConfirmDialog, HbcTypography } from '@hbc/ui-kit';

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
}: SafetyReviewActionsProps): ReactNode {
  const [showSupersedeConfirm, setShowSupersedeConfirm] = useState(false);
  const posture = retryPostureFor(entryErrorClass);
  const canPlainRetry = posture === 'retryable' && !isDuplicate;

  const handleSupersedeConfirm = (): void => {
    setShowSupersedeConfirm(false);
    onRetry(runId, true);
  };

  return (
    <div className="safety-review-actions" data-safety-ui="review-actions">
      {canPlainRetry && (
        <HbcButton
          variant="secondary"
          disabled={isPending}
          onClick={() => onRetry(runId, false)}
        >
          {isPending ? 'Replaying…' : 'Retry'}
        </HbcButton>
      )}
      {!canPlainRetry && !isDuplicate && (
        <div
          className="safety-review-actions__guidance"
          data-safety-ui="review-retry-guidance"
          data-retry-posture={posture}
        >
          <HbcTypography intent="bodySmall">{guidanceFor(posture)}</HbcTypography>
        </div>
      )}
      {isDuplicate && (
        <>
          <HbcButton
            variant="secondary"
            disabled={isPending}
            onClick={() => setShowSupersedeConfirm(true)}
            data-safety-ui="supersede-trigger"
          >
            Supersede & commit
          </HbcButton>
          <HbcConfirmDialog
            open={showSupersedeConfirm}
            onClose={() => setShowSupersedeConfirm(false)}
            onConfirm={handleSupersedeConfirm}
            variant="danger"
            title="Supersede prior inspection?"
            description="This will replay the retained workbook, commit a new inspection, and mark the prior inspection as superseded. The prior record stays in audit history but will no longer count toward the project-week rollup. This cannot be reversed from the UI."
            confirmLabel="Supersede & commit"
            cancelLabel="Cancel"
            loading={isPending}
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
