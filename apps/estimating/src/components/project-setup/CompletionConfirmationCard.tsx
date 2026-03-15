import { useState } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest, IProvisioningStatus } from '@hbc/models';
import {
  DEPARTMENT_DISPLAY_LABELS,
  SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG,
} from '@hbc/provisioning';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
} from '@hbc/ui-kit';
import type { IBicOwner } from '@hbc/workflow-handoff';
import { HbcHandoffStatusBadge, usePrepareHandoff } from '@hbc/workflow-handoff';
import { ProvisioningChecklist } from '../ProvisioningChecklist.js';

/**
 * W0-G4-T05: Completion confirmation card shown when a project setup request
 * reaches the Completed state. Displays a success summary, provisioned site
 * link, team access summary, and an optional "Open Project Hub" action.
 *
 * This is a local composition component (not a reusable primitive).
 * Traceability: docs/architecture/plans/MVP/G4/W0-G4-T05-Completion-Confirmation-and-Optional-Project-Hub-Handoff.md
 */

interface CompletionConfirmationCardProps {
  request: IProjectSetupRequest;
  provisioningStatus: IProvisioningStatus | undefined;
}

function isValidSharePointUrl(url: string | null | undefined): url is string {
  return Boolean(url && url.startsWith('https://') && url.includes('.sharepoint.com'));
}

function countAccessGroups(request: IProjectSetupRequest): number {
  let count = 0;
  if (request.groupMembers && request.groupMembers.length > 0) count++;
  if (request.groupLeaders && request.groupLeaders.length > 0) count++;
  if (request.viewerUPNs && request.viewerUPNs.length > 0) count++;
  return count;
}

export function CompletionConfirmationCard({
  request,
  provisioningStatus,
}: CompletionConfirmationCardProps): ReactNode {
  const [handoffDismissed, setHandoffDismissed] = useState(false);

  const session = useCurrentSession();
  const projectHubUrl = provisioningStatus?.siteUrl ?? request.siteUrl ?? null;
  const validUrl = isValidSharePointUrl(projectHubUrl);
  const accessGroupCount = countAccessGroups(request);

  // Construct sender identity for handoff assembly
  const currentUser: IBicOwner = {
    userId: session?.user?.email ?? session?.providerIdentityRef ?? 'unknown',
    displayName: session?.user?.displayName ?? 'User',
    role: 'Requester',
  };

  // Assemble handoff package when request is completed and URL is valid.
  // Wave 0: package is assembled but HandoffApi.create() is not called automatically,
  // so handoffId and status remain unavailable. Badge renders null.
  usePrepareHandoff(
    request.state === 'Completed' ? request : null,
    SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG,
    currentUser,
    request.state === 'Completed' && validUrl,
  );

  return (
    <HbcCard>
      <HbcStatusBadge variant="completed" label="Provisioning Complete" />
      <HbcTypography intent="heading2">
        {request.projectName} is ready
      </HbcTypography>

      {provisioningStatus?.completedAt && (
        <p>
          Completed on{' '}
          {new Date(provisioningStatus.completedAt).toLocaleDateString()} at{' '}
          {new Date(provisioningStatus.completedAt).toLocaleTimeString()}
        </p>
      )}

      <p>
        <strong>Project:</strong> {request.projectName}
      </p>
      <p>
        <strong>Department:</strong>{' '}
        {(request.department && DEPARTMENT_DISPLAY_LABELS[request.department]) ??
          request.department ??
          'N/A'}
      </p>
      <p>
        <strong>Type:</strong> {request.projectType ?? 'N/A'}
      </p>
      {validUrl && (
        <p>
          <strong>Site URL:</strong>{' '}
          <a href={projectHubUrl} target="_blank" rel="noopener noreferrer">
            {projectHubUrl}
          </a>
        </p>
      )}
      <p>
        <strong>Team Access:</strong> {accessGroupCount} access group(s) configured
      </p>

      {/* Standard-gated: step summary via ProvisioningChecklist */}
      <HbcComplexityGate minTier="standard">
        {provisioningStatus && (
          <ProvisioningChecklist status={provisioningStatus} detailLevel="summary" />
        )}
      </HbcComplexityGate>

      {/* Handoff section — dismissable per session */}
      {!handoffDismissed && (
        <div>
          <HbcTypography intent="body">
            Your project workspace — a curated hub within your project&apos;s SharePoint
            site — is now available. Use it to manage documents, track your team, and
            access project controls. You can open it now or return any time from the
            project summary.
          </HbcTypography>

          {validUrl ? (
            <HbcButton
              variant="primary"
              onClick={() =>
                window.open(projectHubUrl, '_blank', 'noopener,noreferrer')
              }
            >
              Open Project Hub
            </HbcButton>
          ) : (
            <HbcBanner variant="warning">
              Project site URL is not yet available. Check back in a few moments, or
              contact Admin if this persists.
            </HbcBanner>
          )}
          <HbcButton
            variant="secondary"
            onClick={() => setHandoffDismissed(true)}
          >
            Stay in Estimating
          </HbcButton>
        </div>
      )}

      {/* Handoff status badge — standard/expert only; hidden in Wave 0 since
          HandoffApi.create() is not called automatically (status is always null). */}
      <HbcHandoffStatusBadge
        handoffId={null}
        status={null}
        lastUpdatedAt={null}
      />
    </HbcCard>
  );
}
