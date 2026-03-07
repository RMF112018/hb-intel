import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import type { IProjectSetupRequest } from '@hbc/models';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import { HbcButton, WorkspacePageShell } from '@hbc/ui-kit';

const useStyles = makeStyles({
  actionRow: { marginBottom: '16px' },
});

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
 * D-PH6-10 Project Setup request list page for Estimating coordinators.
 */
export function ProjectSetupPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const { requests, setRequests } = useProvisioningStore();
  const authToken = useMemo(() => resolveSessionToken(session), [session]);

  useEffect(() => {
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL,
      async () => authToken,
    );
    client
      .listRequests()
      .then((listed: IProjectSetupRequest[]) => setRequests(listed))
      .catch(() => {
        // Preserve rendering with empty-state fallback.
      });
  }, [authToken, setRequests]);

  return (
    <WorkspacePageShell layout="list" title="Project Setup Requests">
      <div className={styles.actionRow}>
        <Link to="/project-setup/new">
          <HbcButton>New Project Setup Request</HbcButton>
        </Link>
      </div>

      {requests.length === 0 ? (
        <p>No project setup requests submitted yet.</p>
      ) : (
        <ul>
          {requests.map((request) => (
            <li key={request.requestId}>
              <Link to="/project-setup/$requestId" params={{ requestId: request.requestId }}>
                {request.projectName} — {request.state}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WorkspacePageShell>
  );
}
