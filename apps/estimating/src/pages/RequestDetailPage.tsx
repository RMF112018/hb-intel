import { useCallback, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  createProvisioningApiClient,
  getProvisioningVisibility,
  useProvisioningSignalR,
  useProvisioningStore,
} from '@hbc/provisioning';
import { HbcCard, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { ClarificationBanner } from '../components/project-setup/ClarificationBanner.js';
import { FailureDetailCard } from '../components/project-setup/FailureDetailCard.js';
import { RequestCoreSummary } from '../components/project-setup/RequestCoreSummary.js';
import { RequestStateContext } from '../components/project-setup/RequestStateContext.js';
import { RetrySection } from '../components/project-setup/RetrySection.js';
import { ProvisioningChecklist } from '../components/ProvisioningChecklist.js';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';

/**
 * W0-G4-T01 request detail page with BIC ownership, state context,
 * clarification banner, and provisioning visibility with real-time updates.
 * W0-G4-T02: Added coordinator-tier failure detail, retry/escalation, and detailed checklist.
 * Traceability: docs/architecture/plans/PH6.10-Estimating-App.md §6.10.3
 */
export function RequestDetailPage(): ReactNode {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const session = useCurrentSession();
  const { requests, setRequests, statusByProjectId, setProvisioningStatus } = useProvisioningStore();

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const client = useMemo(
    () => createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, async () => authToken),
    [authToken],
  );

  const request: IProjectSetupRequest | undefined = requests.find((r) => r.requestId === requestId);
  const projectId = request?.projectId;
  const provisioningStatus = projectId ? statusByProjectId[projectId] : undefined;
  const visibility = getProvisioningVisibility(session, request?.submittedBy ?? '');

  // D-PH6-10 SignalR should only connect while provisioning is active.
  useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_FUNCTION_APP_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken: async () => authToken,
    enabled: Boolean(projectId && request?.state === 'Provisioning'),
  });

  const refreshData = useCallback(async () => {
    const listed = await client.listRequests();
    setRequests(listed);
    const matched = listed.find((r) => r.requestId === requestId);
    if (matched?.projectId) {
      const status = await client.getProvisioningStatus(matched.projectId);
      if (status) setProvisioningStatus(status);
    }
  }, [client, requestId, setProvisioningStatus, setRequests]);

  useEffect(() => {
    if (!requestId) return;
    let mounted = true;

    (async () => {
      const listed = await client.listRequests();
      if (!mounted) return;
      setRequests(listed);

      const matched = listed.find((r) => r.requestId === requestId);
      if (!matched?.projectId) return;

      const status = await client.getProvisioningStatus(matched.projectId);
      if (status && mounted) setProvisioningStatus(status);
    })().catch(() => {
      // Preserve fallback rendering.
    });

    return () => {
      mounted = false;
    };
  }, [client, requestId, setProvisioningStatus, setRequests]);

  if (!request) {
    return <WorkspacePageShell layout="detail" title="Request Not Found">Request not found.</WorkspacePageShell>;
  }

  return (
    <WorkspacePageShell layout="detail" title={`${request.projectName} — Setup Request`}>
      <RequestCoreSummary request={request} />
      <RequestStateContext state={request.state} />

      {request.state === 'NeedsClarification' && (
        <ClarificationBanner requestId={requestId} clarificationNote={request.clarificationNote} />
      )}

      {/* W0-G4-T02: Detailed provisioning checklist for coordinator tier */}
      {visibility === 'full' && provisioningStatus && (
        <HbcComplexityGate
          minTier="standard"
          fallback={<ProvisioningChecklist status={provisioningStatus} detailLevel="summary" />}
        >
          <ProvisioningChecklist status={provisioningStatus} detailLevel="detailed" />
        </HbcComplexityGate>
      )}

      {visibility === 'full' && !provisioningStatus && request.state === 'Provisioning' && (
        <p>Connecting to live progress…</p>
      )}

      {visibility !== 'full' && request.state === 'Provisioning' && (
        <p>Site provisioning is in progress. You will be notified when it is ready.</p>
      )}

      {/* W0-G4-T02: Failed state — failure detail card + retry/escalation section */}
      {request.state === 'Failed' && provisioningStatus && (
        <>
          <FailureDetailCard status={provisioningStatus} />
          <RetrySection
            status={provisioningStatus}
            projectId={projectId!}
            onRetryComplete={refreshData}
          />
        </>
      )}

      <HbcComplexityGate minTier="standard">
        <HbcCard>
          <HbcTypography intent="heading3">Extended Details</HbcTypography>
          {request.groupMembers.length > 0 && (
            <p><strong>Team:</strong> {request.groupMembers.join(', ')}</p>
          )}
          {request.addOns && request.addOns.length > 0 && (
            <p><strong>Add-ons:</strong> {request.addOns.join(', ')}</p>
          )}
        </HbcCard>
      </HbcComplexityGate>
    </WorkspacePageShell>
  );
}
