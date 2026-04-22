import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcButton } from '@hbc/ui-kit';

export interface SafetyReviewActionsProps {
  runId: string;
  inspectionEventId?: string;
  isDuplicate: boolean;
  isPending: boolean;
  onRetry: (runId: string, supersedePrior: boolean) => void;
}

export function SafetyReviewActions({
  runId,
  inspectionEventId,
  isDuplicate,
  isPending,
  onRetry,
}: SafetyReviewActionsProps): ReactNode {
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
        <HbcButton
          variant="secondary"
          disabled={isPending}
          onClick={() => onRetry(runId, true)}
        >
          Supersede & commit
        </HbcButton>
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
