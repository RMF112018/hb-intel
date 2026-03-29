import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import { HbcComplexityDial, HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  createProvisioningApiClient,
  getProvisioningVisibility,
  useProvisioningSignalR,
  useProvisioningStore,
} from '@hbc/provisioning';
import { getFunctionAppUrl } from '../config/runtimeConfig.js';
import { HbcBanner, HbcCard, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { ClarificationBanner } from '../components/project-setup/ClarificationBanner.js';
import { CompletionConfirmationCard } from '../components/project-setup/CompletionConfirmationCard.js';
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
 * W0-G4-T07: Breadcrumbs, session guard, load-error state, SignalR fallback, missing status banner.
 * Traceability: docs/architecture/plans/PH6.10-Estimating-App.md §6.10.3
 */
export function RequestDetailPage(): ReactNode {
  const { requestId } = useParams({ strict: false }) as { requestId: string };
  const navigate = useNavigate();
  const session = useCurrentSession();
  const { requests, setRequests, statusByProjectId, setProvisioningStatus } = useProvisioningStore();
  const [loadError, setLoadError] = useState<string | null>(null);

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const functionAppUrl = useMemo(() => getFunctionAppUrl(), []);
  const client = useMemo(
    () => createProvisioningApiClient(functionAppUrl, async () => authToken),
    [functionAppUrl, authToken],
  );

  const request: IProjectSetupRequest | undefined = requests.find((r) => r.requestId === requestId);
  const projectId = request?.projectId;
  const provisioningStatus = projectId ? statusByProjectId[projectId] : undefined;
  const visibility = getProvisioningVisibility(session, request?.submittedBy ?? '');

  // Connect SignalR during Provisioning and ReadyToProvision (saga may be running
  // before the reconciliation from Provisioning state has propagated to the request).
  const isProvisioningActive = request?.state === 'Provisioning' || request?.state === 'ReadyToProvision';
  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${functionAppUrl}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken: async () => authToken,
    enabled: Boolean(projectId && isProvisioningActive),
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
    if (!requestId || !session) return;
    let mounted = true;

    setLoadError(null);
    (async () => {
      const listed = await client.listRequests();
      if (!mounted) return;
      setRequests(listed);

      const matched = listed.find((r) => r.requestId === requestId);
      if (!matched?.projectId) return;

      const status = await client.getProvisioningStatus(matched.projectId);
      if (status && mounted) setProvisioningStatus(status);
    })().catch(() => {
      if (mounted) {
        setLoadError('Unable to load request data. Check your connection and try again.');
      }
    });

    return () => {
      mounted = false;
    };
  }, [client, requestId, session, setProvisioningStatus, setRequests]);

  // W0-G4-T07: SignalR polling fallback (covers Provisioning and ReadyToProvision)
  useEffect(() => {
    if (isConnected || !isProvisioningActive) return;
    const interval = setInterval(() => {
      refreshData().catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [isConnected, isProvisioningActive, refreshData]);

  // W0-G4-T07: Session loading guard
  if (!session) {
    return (
      <WorkspacePageShell layout="detail" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  // W0-G4-T07: Load error — no data at all
  if (loadError && !request) {
    return (
      <WorkspacePageShell
        layout="detail"
        title="Setup Request"
        isError
        errorMessage={loadError}
        onRetry={() => { setLoadError(null); }}
        breadcrumbs={[
          { label: 'Project Setup', href: '/project-setup' },
          { label: 'Error' },
        ]}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  // W0-G4-T07: Not found → empty state via shell
  if (!request) {
    return (
      <WorkspacePageShell
        layout="detail"
        title="Request Not Found"
        isEmpty
        emptyMessage="The project setup request was not found. It may have been removed or you may not have access."
        emptyActionLabel="Back to Project Setup"
        onEmptyAction={() => navigate({ to: '/project-setup' })}
        breadcrumbs={[
          { label: 'Project Setup', href: '/project-setup' },
          { label: 'Not Found' },
        ]}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell
      layout="detail"
      title={`${request.projectName} — Setup Request`}
      breadcrumbs={[
        { label: 'Project Setup', href: '/project-setup' },
        { label: request.projectName },
      ]}
    >
      {/* W0-G4-T06: Complexity dial for tier selection */}
      <HbcComplexityDial variant="header" />

      {/* W0-G4-T07: Stale data warning when refresh failed but we have cached data */}
      {loadError && (
        <HbcBanner variant="warning" onDismiss={() => setLoadError(null)}>
          Live status unavailable — showing last known state.
        </HbcBanner>
      )}

      <RequestCoreSummary request={request} />
      <RequestStateContext state={request.state} />

      {request.state === 'NeedsClarification' && (
        <ClarificationBanner requestId={requestId} clarificationNote={request.clarificationNote} />
      )}

      {/* W0-G4-T07: SignalR disconnect indicator */}
      {isProvisioningActive && !isConnected && (
        <HbcBanner variant="warning">
          Real-time connection lost. Status updates are refreshing every 30 seconds.
        </HbcBanner>
      )}

      {/* W0-G4-T07: Provisioning status missing after completion */}
      {request.state === 'Completed' && !provisioningStatus && (
        <HbcBanner variant="warning">
          Provisioning details are not yet available. The site may still be accessible — check back shortly.
        </HbcBanner>
      )}

      {/* W0-G4-T05: Completion confirmation — shown when request is Completed */}
      {request.state === 'Completed' && (
        <CompletionConfirmationCard
          request={request}
          provisioningStatus={provisioningStatus}
        />
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

      {visibility === 'full' && !provisioningStatus && isProvisioningActive && (
        <HbcBanner variant="info">Connecting to live progress…</HbcBanner>
      )}

      {visibility !== 'full' && isProvisioningActive && (
        <HbcBanner variant="info">
          Site provisioning is in progress. You will be notified when it is ready.
        </HbcBanner>
      )}

      {/* W0-G4-T02: Failed state — failure detail card + retry/escalation section */}
      {request.state === 'Failed' && provisioningStatus && projectId && (
        <>
          <FailureDetailCard status={provisioningStatus} />
          <RetrySection
            status={provisioningStatus}
            projectId={projectId}
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
