import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcButton, HbcConfirmDialog } from '@hbc/ui-kit';

export interface SafetyReviewActionsProps {
  runId: string;
  inspectionEventId?: string;
  isDuplicate: boolean;
  isPending: boolean;
  onRetry: (runId: string, supersedePrior: boolean) => void;
}

/**
 * SafetyReviewActions — review-queue row action cluster.
 *
 * Phase-3 closure Task D: the "Supersede & commit" path now routes through
 * a governed HbcConfirmDialog (variant: danger). Supersede rewrites the
 * authoritative inspection record against the retained source workbook and
 * marks the prior inspection as superseded — this is high-risk and must not
 * be one-click.
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
}: SafetyReviewActionsProps): ReactNode {
  const [showSupersedeConfirm, setShowSupersedeConfirm] = useState(false);

  const handleSupersedeConfirm = (): void => {
    setShowSupersedeConfirm(false);
    onRetry(runId, true);
  };

  return (
    <div className="safety-review-actions" data-safety-ui="review-actions">
      <HbcButton
        variant="secondary"
        disabled={isPending}
        onClick={() => onRetry(runId, false)}
      >
        {isPending ? 'Replaying…' : 'Retry'}
      </HbcButton>
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
