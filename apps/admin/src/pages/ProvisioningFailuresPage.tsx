import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useCurrentSession } from '@hbc/auth';
import type { IProvisioningStatus } from '@hbc/models';
import { createProvisioningApiClient } from '@hbc/provisioning';
import {
  HbcButton,
  HbcDataTable,
  HbcStatusBadge,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';

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
 * D-PH6-12 Admin inbox for failed provisioning runs with retry/escalate actions.
 * Traceability: docs/architecture/plans/PH6.12-CrossApp-Notifications.md §6.12.4
 */
export function ProvisioningFailuresPage(): ReactNode {
  const session = useCurrentSession();
  const [failures, setFailures] = useState<IProvisioningStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeActionByProjectId, setActiveActionByProjectId] = useState<Record<string, string>>({});
  const authToken = useMemo(() => resolveSessionToken(session), [session]);

  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';
  const client = useMemo(
    () => createProvisioningApiClient(functionAppUrl, async () => authToken),
    [authToken, functionAppUrl],
  );

  const loadFailures = useCallback(async (): Promise<void> => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const failedRuns = await client.listFailedRuns();
      setFailures(failedRuns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provisioning failures');
    } finally {
      setLoading(false);
    }
  }, [client, session]);

  useEffect(() => {
    loadFailures().catch(() => {
      // Error state is already handled in loadFailures.
    });
  }, [loadFailures]);

  const runAction = useCallback(
    async (projectId: string, actionLabel: string, action: () => Promise<void>) => {
      // D-PH6-12 live-status feedback: each row reflects in-flight retry/escalate actions.
      setActiveActionByProjectId((prev) => ({ ...prev, [projectId]: actionLabel }));
      setError(null);
      try {
        await action();
        await loadFailures();
      } catch (err) {
        setError(err instanceof Error ? err.message : `${actionLabel} failed`);
      } finally {
        setActiveActionByProjectId((prev) => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
      }
    },
    [loadFailures],
  );

  const columns = useMemo<ColumnDef<IProvisioningStatus, unknown>[]>(() => {
    return [
      { accessorKey: 'projectNumber', header: 'Project #' },
      { accessorKey: 'projectName', header: 'Project Name' },
      {
        id: 'overallStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.overallStatus;
          return (
            <HbcStatusBadge
              variant={status === 'Failed' ? 'error' : 'warning'}
              label={status}
              size="small"
            />
          );
        },
      },
      {
        id: 'failedStep',
        header: 'Failed At',
        cell: ({ row }) => {
          const failedStep = row.original.steps.find((step) => step.status === 'Failed');
          return failedStep ? `Step ${failedStep.stepNumber}: ${failedStep.stepName}` : '-';
        },
      },
      {
        id: 'failedAt',
        header: 'Failed Time',
        cell: ({ row }) =>
          row.original.failedAt ? new Date(row.original.failedAt).toLocaleString() : '-',
      },
      { accessorKey: 'triggeredBy', header: 'Triggered By' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const projectId = row.original.projectId;
          const currentAction = activeActionByProjectId[projectId];
          const isBusy = Boolean(currentAction);
          return (
            <div className="flex gap-2">
              <HbcButton
                size="sm"
                disabled={isBusy}
                onClick={() =>
                  runAction(projectId, 'Retrying', async () => {
                    await client.retryProvisioning(projectId);
                  })
                }
              >
                {currentAction === 'Retrying' ? 'Retrying...' : 'Retry'}
              </HbcButton>
              <HbcButton
                size="sm"
                variant="secondary"
                disabled={isBusy}
                onClick={() =>
                  runAction(projectId, 'Escalating', async () => {
                    const escalatedBy = session?.user.email ?? session?.providerIdentityRef ?? 'unknown';
                    await client.escalateProvisioning(projectId, escalatedBy);
                  })
                }
              >
                {currentAction === 'Escalating' ? 'Escalating...' : 'Escalate'}
              </HbcButton>
            </div>
          );
        },
      },
    ];
  }, [activeActionByProjectId, client, runAction, session]);

  return (
    <WorkspacePageShell layout="list" title="Provisioning Failures">
      {error ? <p>{error}</p> : null}
      <HbcDataTable<IProvisioningStatus>
        data={failures}
        columns={columns}
        isLoading={loading}
        emptyStateConfig={{
          title: 'No failed provisioning runs',
          description: 'Failed runs will appear here with retry and escalation actions.',
        }}
        height="520px"
      />
    </WorkspacePageShell>
  );
}
