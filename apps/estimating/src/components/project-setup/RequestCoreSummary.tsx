import type { ReactNode } from 'react';
import { HbcBicBadge, HbcBicDetail } from '@hbc/bic-next-move';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import { PROJECT_SETUP_BIC_CONFIG, PROJECT_SETUP_STATUS_LABELS } from '@hbc/provisioning';
import { HbcStatusBadge, HbcTypography } from '@hbc/ui-kit';
import { getStateBadgeVariant } from './stateDisplayHelpers.js';

export interface RequestCoreSummaryProps {
  request: IProjectSetupRequest;
}

/**
 * Core summary header for a project setup request detail view.
 * W0-G4-T01: Displays project name, status badge, BIC ownership, and timestamps.
 * W0-G4-T02: Upgraded to use HbcBicBadge (essential) / HbcBicDetail (standard+) components.
 */
export function RequestCoreSummary({ request }: RequestCoreSummaryProps): ReactNode {
  return (
    <>
      <HbcTypography intent="heading2">{request.projectName}</HbcTypography>

      <HbcStatusBadge
        variant={getStateBadgeVariant(request.state)}
        label={PROJECT_SETUP_STATUS_LABELS[request.state] ?? request.state}
      />

      {/* W0-G4-T02: Standard+ tier — expanded BIC detail with due date, blocked banner, chain */}
      <HbcComplexityGate minTier="standard">
        <HbcBicDetail item={request} config={PROJECT_SETUP_BIC_CONFIG} showChain />
      </HbcComplexityGate>

      {/* W0-G4-T02: Essential tier fallback — compact BIC badge */}
      <HbcComplexityGate maxTier="essential">
        <HbcBicBadge item={request} config={PROJECT_SETUP_BIC_CONFIG} />
      </HbcComplexityGate>

      <p><strong>Submitted:</strong> {request.submittedAt}</p>
      {request.completedAt && <p><strong>Completed:</strong> {request.completedAt}</p>}
    </>
  );
}
