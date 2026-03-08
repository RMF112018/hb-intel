/**
 * D-PH6F-6: Provisioning progress view with real-time SignalR connection.
 * Traceability: docs/architecture/plans/PH6F-6-Cleanup-ProvisioningSignalR.md §PH6F.6
 * Blueprint: §6b (Provisioning saga), §7a (SignalR real-time events)
 */
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import type { NormalizedAuthSession } from '@hbc/auth';
import { useProvisioningSignalR, useProvisioningStore } from '@hbc/provisioning';

/**
 * D-PH6F-6: Resolves a bearer token from the normalized auth session.
 * Mirrors the proven pattern from apps/estimating/src/pages/RequestDetailPage.tsx:15-24.
 */
function resolveSessionToken(session: NormalizedAuthSession | null): string {
  const payload = session?.rawContext?.payload;
  if (payload && typeof payload === 'object') {
    const rawToken =
      (payload as Record<string, unknown>).accessToken ??
      (payload as Record<string, unknown>).token;
    if (typeof rawToken === 'string' && rawToken.trim().length > 0) return rawToken;
  }
  return session?.providerIdentityRef ?? 'mock-token';
}

export function ProvisioningProgressView(): ReactNode {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const session = useCurrentSession();

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const getToken = useCallback(async () => authToken, [authToken]);

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_API_BASE_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken,
    enabled: Boolean(projectId),
  });

  const latestEvent = useProvisioningStore(
    (s) => (projectId ? s.latestEventByProjectId[projectId] : undefined),
  );

  return (
    <div>
      <h2>Provisioning Progress</h2>
      <p>Project: {projectId}</p>
      <p>SignalR: {isConnected ? 'Connected' : 'Connecting...'}</p>
      {latestEvent && (
        <div>
          <p>Step {latestEvent.stepNumber}: {latestEvent.stepName}</p>
          <p>Status: {latestEvent.status}</p>
          <p>Overall: {latestEvent.overallStatus}</p>
        </div>
      )}
    </div>
  );
}
