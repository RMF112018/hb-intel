import type { ReactNode } from 'react';
import type { IBicNextMoveState } from '@hbc/bic-next-move';
import type { IProjectSetupRequest } from '@hbc/models';
import { PROJECT_SETUP_STATUS_LABELS } from '@hbc/provisioning';
import { HbcCard, HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import { getStateBadgeVariant } from './stateDisplayHelpers.js';

export interface RequestCoreSummaryProps {
  request: IProjectSetupRequest;
  bicState: IBicNextMoveState | undefined;
}

/**
 * Core summary header for a project setup request detail view.
 * W0-G4-T01: Displays project name, status badge, BIC ownership, and timestamps.
 */
export function RequestCoreSummary({ request, bicState }: RequestCoreSummaryProps): ReactNode {
  return (
    <>
      <HbcTypography intent="heading2">{request.projectName}</HbcTypography>

      <HbcStatusBadge
        variant={getStateBadgeVariant(request.state)}
        label={PROJECT_SETUP_STATUS_LABELS[request.state] ?? request.state}
      />

      <HbcCard>
        <HbcTypography intent="heading3">Ownership</HbcTypography>
        <p><strong>Current Owner:</strong> {bicState?.currentOwner?.displayName ?? 'System'}</p>
        {bicState?.expectedAction && (
          <p><strong>Expected Action:</strong> {bicState.expectedAction}</p>
        )}
        {bicState?.urgencyTier && (
          <p><strong>Urgency:</strong> {bicState.urgencyTier}</p>
        )}
      </HbcCard>

      <p><strong>Submitted:</strong> {request.submittedAt}</p>
      {request.completedAt && <p><strong>Completed:</strong> {request.completedAt}</p>}
    </>
  );
}
