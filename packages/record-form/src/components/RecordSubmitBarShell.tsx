/**
 * SF23-T05 — HbcRecordSubmitBar composition shell.
 *
 * Wires useRecordSubmission to @hbc/ui-kit HbcRecordSubmitBar props.
 *
 * Governing: SF23-T05, L-02
 */

import React, { useMemo } from 'react';
import { HbcRecordSubmitBar, type SubmitBarReviewOwner } from '@hbc/ui-kit';
import type { IRecordFormState } from '../types/index.js';
import type { IRecordFormStorageAdapter } from '../storage/IRecordFormStorageAdapter.js';
import { useRecordSubmission } from '../hooks/useRecordSubmission.js';

export interface RecordSubmitBarShellProps {
  adapter: IRecordFormStorageAdapter;
  state: IRecordFormState;
  onSubmitComplete?: () => void;
  onCancel?: () => void;
}

export function RecordSubmitBarShell({
  adapter,
  state,
  onSubmitComplete,
  onCancel,
}: RecordSubmitBarShellProps): React.ReactElement {
  const { canSubmit, isSubmitting, submit } = useRecordSubmission({ adapter, state });

  const blockMessage = state.explanation.isBlocked
    ? state.explanation.summaryMessage
    : null;

  const warningMessage = state.explanation.hasWarnings && !state.explanation.isBlocked
    ? state.explanation.warnings.map(w => w.message).join('; ')
    : null;

  const deferMessage = state.explanation.deferReason
    ? `Submission deferred: ${state.explanation.deferReason}`
    : null;

  const syncStatus = state.sync.state === 'saved-locally' ? 'Saved locally'
    : state.sync.state === 'queued-to-sync' ? 'Queued to sync'
    : null;

  const reviewOwners: SubmitBarReviewOwner[] = useMemo(
    () => state.reviewSteps.map(step => ({
      upn: step.ownerUpn,
      displayName: step.ownerName,
      role: 'Reviewer',
      stepLabel: step.blocking ? 'Blocking review' : 'Advisory review',
      status: step.status,
    })),
    [state.reviewSteps],
  );

  const handleSubmit = async () => {
    await submit();
    onSubmitComplete?.();
  };

  return (
    <HbcRecordSubmitBar
      canSubmit={canSubmit}
      isSubmitting={isSubmitting}
      isBlocked={state.explanation.isBlocked}
      blockMessage={blockMessage}
      warningMessage={warningMessage}
      deferMessage={deferMessage}
      syncStatus={syncStatus}
      recommendedAction={state.nextRecommendedAction?.reason ?? null}
      reviewOwners={reviewOwners}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}
