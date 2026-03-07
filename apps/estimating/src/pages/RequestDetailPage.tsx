import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  createProvisioningApiClient,
  getProvisioningVisibility,
  useProvisioningSignalR,
  useProvisioningStore,
} from '@hbc/provisioning';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { ProvisioningChecklist } from '../components/ProvisioningChecklist.js';

function resolveSessionToken(session: ReturnType<typeof useCurrentSession>): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}

/**
 * D-PH6-10 request detail page with provisioning visibility and real-time updates.
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
      <p>Current request state: {request.state}</p>

      {visibility === 'full' && provisioningStatus ? (
        <ProvisioningChecklist status={provisioningStatus} showStepDetail />
      ) : null}

      {visibility === 'full' && !provisioningStatus && request.state === 'Provisioning' ? (
        <p>Connecting to live progress…</p>
      ) : null}

      {visibility !== 'full' && request.state === 'Provisioning' ? (
        <p>Site provisioning is in progress. You will be notified when it is ready.</p>
      ) : null}
    </WorkspacePageShell>
  );
}
