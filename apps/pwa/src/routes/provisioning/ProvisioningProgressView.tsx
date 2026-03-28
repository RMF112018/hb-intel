/**
 * D-PH6F-6: Provisioning progress view with real-time SignalR connection.
 * Upgraded from scaffold to a requester-facing progress surface showing
 * step checklist, connection status, and terminal state summaries.
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

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_API_BASE_URL}/api/provisioning-negotiate`,
    projectId: projectId ?? '',
    getToken,
    enabled: Boolean(projectId),
  });

  const latestEvent = useProvisioningStore(
    (s) => (projectId ? s.latestEventByProjectId[projectId] : undefined),
  );

  // API-based polling as fallback when SignalR is disconnected or for initial state
  const { data: apiStatus } = useProvisioningStatus(projectId ?? '', Boolean(projectId));

  // Merge: prefer store data (real-time) with API data as baseline
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
