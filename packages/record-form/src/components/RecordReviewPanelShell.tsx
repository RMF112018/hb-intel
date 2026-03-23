/**
 * SF23-T06 — HbcRecordReviewPanel composition shell.
 *
 * Governing: SF23-T06, L-01
 */

import React, { useMemo } from 'react';
import { HbcRecordReviewPanel, type ReviewPanelField, type ReviewPanelStep, type ReviewPanelLink } from '@hbc/ui-kit';
import type { IRecordFormState, RecordFormComplexityTier } from '../types/index.js';

export interface RecordReviewPanelShellProps {
  state: IRecordFormState;
  fields: ReviewPanelField[];
  relatedLinks?: ReviewPanelLink[];
  complexityTier: RecordFormComplexityTier;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
}

export function RecordReviewPanelShell({ state, fields, relatedLinks = [], complexityTier, onApprove, onReject }: RecordReviewPanelShellProps): React.ReactElement {
  const reviewSteps: ReviewPanelStep[] = useMemo(
    () => state.reviewSteps.map(s => ({
      stepId: s.stepId,
      label: s.blocking ? 'Blocking review' : 'Advisory review',
      blocking: s.blocking,
      phase: s.phase,
      ownerName: s.ownerName,
      ownerRole: 'Reviewer',
      status: s.status,
      reason: s.blocking ? 'Required before submission' : 'Optional review',
      nextAction: s.status === 'pending' ? 'Awaiting review' : 'Complete',
    })),
    [state.reviewSteps],
  );

  return (
    <HbcRecordReviewPanel
      fields={fields}
      reviewSteps={reviewSteps}
      relatedLinks={relatedLinks}
      complexityTier={complexityTier}
      onApprove={onApprove}
      onReject={onReject}
    />
  );
}
