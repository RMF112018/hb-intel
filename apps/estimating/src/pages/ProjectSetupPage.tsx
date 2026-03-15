import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import type { IProjectSetupRequest } from '@hbc/models';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import { HbcButton, WorkspacePageShell } from '@hbc/ui-kit';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';

const useStyles = makeStyles({
  actionRow: { marginBottom: '16px' },
});

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
        <Link to="/project-setup/new" search={{ mode: 'new-request', requestId: undefined }}>
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
