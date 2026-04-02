/**
 * D-PH6F-6 / P4-03: Provisioning progress view with real-time SignalR connection.
 *
 * **Authoritative status precedence (P4-03):**
 * - The API endpoint (useProvisioningStatus) is the authoritative source of truth.
 *   The step checklist and project metadata always render from apiStatus.
 * - SignalR (latestEvent) provides real-time overallStatus overlay only —
 *   it may show a newer overallStatus before the next API poll, but does not
 *   override the full status record.
 * - On terminal state (Completed/Failed): SignalR connection is closed (no
 *   further reconnect attempts) and API polling stops (refetchInterval disabled).
 */
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import type { NormalizedAuthSession } from '@hbc/auth';
import { useProvisioningSignalR, useProvisioningStore } from '@hbc/provisioning';
import { WorkspacePageShell, HbcBanner, HbcStatusBadge } from '@hbc/ui-kit';
import { useProvisioningStatus } from '../../hooks/provisioning/index.js';

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

function stepStatusVariant(status: string): 'completed' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'Completed': return 'completed';
    case 'Failed': return 'error';
    case 'InProgress': return 'info';
    default: return 'neutral';
  }
}

export function ProvisioningProgressView(): ReactNode {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const session = useCurrentSession();

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const getToken = useCallback(async () => authToken, [authToken]);

  // P4-03: Read stored status to detect terminal state before initializing hooks.
  // Once terminal, SignalR is disabled (no reconnect attempts) and polling stops.
  const storedOverallStatus = useProvisioningStore(
    (s) => (projectId ? s.statusByProjectId[projectId]?.overallStatus : undefined),
  );
  const isKnownTerminal = storedOverallStatus === 'Completed' || storedOverallStatus === 'Failed';

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_API_BASE_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken,
    enabled: Boolean(projectId) && !isKnownTerminal,
  });

  const latestEvent = useProvisioningStore(
    (s) => (projectId ? s.latestEventByProjectId[projectId] : undefined),
  );

  // P4-03: API endpoint is the authoritative source of truth. Polling stops on terminal.
  const { data: apiStatus } = useProvisioningStatus(
    projectId ?? '',
    Boolean(projectId) && !isKnownTerminal,
  );

  // API status is the authoritative baseline; latestEvent overlays overallStatus only.
  const status = apiStatus;
  const overallStatus = latestEvent?.overallStatus ?? status?.overallStatus ?? 'Unknown';
  const isTerminal = overallStatus === 'Completed' || overallStatus === 'Failed';

  if (!session) {
    return (
      <WorkspacePageShell layout="detail" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="detail" title="Provisioning Progress">
      {/* Connection status */}
      {!isConnected && !isTerminal && (
        <HbcBanner variant="warning">
          Real-time connection lost. Status updates are refreshing every 10 seconds.
        </HbcBanner>
      )}

      {/* Terminal banners */}
      {overallStatus === 'Completed' && (
        <HbcBanner variant="success">
          Provisioning is complete. Your project site is ready.
        </HbcBanner>
      )}
      {overallStatus === 'Failed' && (
        <HbcBanner variant="error">
          Provisioning encountered an error. An administrator has been notified.
        </HbcBanner>
      )}

      {/* Overall status */}
      <p>
        <strong>Project:</strong> {status?.projectNumber ?? projectId}
        {status?.projectName && ` — ${status.projectName}`}
      </p>
      <p>
        <strong>Status:</strong>{' '}
        <HbcStatusBadge
          variant={stepStatusVariant(overallStatus)}
          label={overallStatus}
          size="small"
        />
      </p>

      {/* Step checklist */}
      {status?.steps && status.steps.length > 0 && (
        <ul>
          {status.steps.map((step) => (
            <li key={step.stepNumber}>
              <HbcStatusBadge
                variant={stepStatusVariant(step.status)}
                label={step.status}
                size="small"
              />{' '}
              Step {step.stepNumber}: {step.stepName}
              {step.errorMessage && (
                <span> — {step.errorMessage}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Real-time event indicator */}
      {latestEvent && !isTerminal && (
        <p>
          <em>
            Latest: Step {latestEvent.stepNumber} ({latestEvent.stepName}) — {latestEvent.status}
          </em>
        </p>
      )}

      {!status && !latestEvent && (
        <p>Connecting to provisioning status...</p>
      )}
    </WorkspacePageShell>
  );
}
