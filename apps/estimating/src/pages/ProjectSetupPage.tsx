import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import { resolveFullBicState } from '@hbc/bic-next-move';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  DEPARTMENT_DISPLAY_LABELS,
  PROJECT_SETUP_BIC_CONFIG,
  PROJECT_SETUP_STATUS_LABELS,
  useProvisioningStore,
} from '@hbc/provisioning';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import { HbcBanner, HbcButton, HbcDataTable, HbcStatusBadge, WorkspacePageShell } from '@hbc/ui-kit';
import { HBC_SPACE_MD } from '@hbc/ui-kit/theme';
import type { ColumnDef } from '@tanstack/react-table';
import { getStateBadgeVariant } from '../components/project-setup/stateDisplayHelpers.js';
import { useProjectSetupBackend } from '../project-setup/backend/ProjectSetupBackendContext.js';
import { canCoordinatorRetry } from '../utils/failureClassification.js';

const useStyles = makeStyles({
  actionRow: { marginBottom: `${HBC_SPACE_MD}px` },
});

const SETUP_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isFirstVisit ? 'first-use' : 'truly-empty',
    heading: 'No project setup requests yet',
    description: 'Create a new request to get started.',
    primaryAction: { label: 'New Project Setup Request', href: '/project-setup/new' },
    coachingTip: 'Project setup requests go through review before provisioning begins.',
  }),
};

const SETUP_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'estimating',
  view: 'project-setup',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'estimator',
  isLoadError: false,
};

/**
 * D-PH6-10 Project Setup request list page for Estimating coordinators.
 * W0-G4-T02: Standard+ tier renders HbcDataTable with columns, row actions, and BIC ownership.
 * W0-G4-T07: Session guard, load-error state, HbcSmartEmptyState for empty list.
 */
export function ProjectSetupPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const { client, isUiReview } = useProjectSetupBackend();
  const { requests, setRequests, statusByProjectId, setProvisioningStatus } =
    useProvisioningStore();
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const loadGenerationRef = useRef(0);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const syncRequests = useCallback(
    async (listed: IProjectSetupRequest[], generation?: number) => {
      if (!isMountedRef.current || (generation !== undefined && loadGenerationRef.current !== generation)) {
        return;
      }
      setRequests(listed);

      if (!isUiReview) {
        return;
      }

      const statuses = await Promise.all(
        listed.map(async (request) => {
          const status = await client.getProvisioningStatus(request.projectId);
          return status;
        }),
      );
      statuses.forEach((status) => {
        if (
          status &&
          isMountedRef.current &&
          (generation === undefined || loadGenerationRef.current === generation)
        ) {
          setProvisioningStatus(status);
        }
      });
    },
    [client, isUiReview, setProvisioningStatus, setRequests],
  );

  useEffect(() => {
    if (!session) return;
    let active = true;
    const generation = ++loadGenerationRef.current;
    setLoadError(null);
    client
      .listRequests()
      .then(async (listed: IProjectSetupRequest[]) => {
        if (!active || loadGenerationRef.current !== generation) {
          return;
        }
        await syncRequests(listed, generation);
      })
      .catch(() => {
        if (active && loadGenerationRef.current === generation) {
          setLoadError('Unable to load project setup requests. Check your connection and try again.');
        }
      });
    return () => {
      active = false;
      loadGenerationRef.current += 1;
    };
  }, [client, session, syncRequests]);

  const handleRetry = useCallback(
    async (projectId: string) => {
      const generation = loadGenerationRef.current;
      setActionError(null);
      try {
        await client.retryProvisioning(projectId);
        const listed = await client.listRequests();
        await syncRequests(listed, generation);
      } catch {
        setActionError('Retry failed. If the issue persists, contact Admin.');
      }
    },
    [client, syncRequests],
  );

  const handleEscalate = useCallback(
    async (projectId: string) => {
      const generation = loadGenerationRef.current;
      setActionError(null);
      try {
        const escalatedBy = session?.providerIdentityRef ?? 'unknown';
        await client.escalateProvisioning(projectId, escalatedBy);
        const listed = await client.listRequests();
        await syncRequests(listed, generation);
      } catch {
        setActionError('Escalation failed. Please contact Admin directly.');
      }
    },
    [client, session, syncRequests],
  );

  /** W0-G4-T02: Column definitions for coordinator queue table. */
  const columns = useMemo<ColumnDef<IProjectSetupRequest, unknown>[]>(
    () => [
      {
        id: 'projectName',
        header: 'Project Name',
        accessorKey: 'projectName',
        cell: ({ row }) => (
          <Link to="/project-setup/$requestId" params={{ requestId: row.original.requestId }}>
            {row.original.projectName}
          </Link>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        accessorFn: (row) => DEPARTMENT_DISPLAY_LABELS[row.department ?? ''] ?? row.department ?? '—',
      },
      {
        id: 'state',
        header: 'State',
        accessorKey: 'state',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={getStateBadgeVariant(row.original.state)}
            label={PROJECT_SETUP_STATUS_LABELS[row.original.state] ?? row.original.state}
            size="small"
          />
        ),
      },
      {
        id: 'currentOwner',
        header: 'Current Owner',
        accessorFn: (row) => {
          const bicState = resolveFullBicState(row, PROJECT_SETUP_BIC_CONFIG);
          return bicState.currentOwner?.displayName ?? 'System';
        },
      },
      {
        id: 'submittedAt',
        header: 'Submitted',
        accessorKey: 'submittedAt',
        cell: ({ row }) => {
          const date = new Date(row.original.submittedAt);
          return date.toLocaleDateString();
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const req = row.original;
          const provStatus = statusByProjectId[req.projectId];

          if (req.state === 'Failed' && provStatus && canCoordinatorRetry(provStatus)) {
            return (
              <HbcButton variant="primary" size="sm" onClick={() => handleRetry(req.projectId)}>
                Retry
              </HbcButton>
            );
          }
          if (req.state === 'Failed' && provStatus?.failureClass && !canCoordinatorRetry(provStatus)) {
            return (
              <HbcButton variant="secondary" size="sm" onClick={() => handleEscalate(req.projectId)}>
                Escalate
              </HbcButton>
            );
          }
          if (req.state === 'NeedsClarification') {
            return <span>Awaiting Response</span>;
          }
          return null;
        },
      },
    ],
    [statusByProjectId, handleRetry, handleEscalate],
  );

  // W0-G4-T07: Session loading guard (after all hooks)
  if (!session) {
    return (
      <WorkspacePageShell layout="list" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  // W0-G4-T07: Load error state
  if (loadError && requests.length === 0) {
    return (
      <WorkspacePageShell
        layout="list"
        title="Project Setup Requests"
        isError
        errorMessage={loadError}
        onRetry={() => { setLoadError(null); }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="Project Setup Requests">
      <div className={styles.actionRow}>
        <Link to="/project-setup/new" search={{ mode: 'new-request', requestId: undefined }}>
          <HbcButton>New Project Setup Request</HbcButton>
        </Link>
      </div>

      {actionError && (
        <HbcBanner variant="error" onDismiss={() => setActionError(null)}>
          {actionError}
        </HbcBanner>
      )}

      {requests.length === 0 ? (
        <HbcSmartEmptyState config={SETUP_EMPTY_CONFIG} context={SETUP_EMPTY_CONTEXT} variant="inline" />
      ) : (
        <>
          {/* W0-G4-T02: Standard+ tier — coordinator queue table */}
          <HbcComplexityGate
            minTier="standard"
            fallback={
              /* Essential tier — requester simple list (existing behavior) */
              <ul>
                {requests.map((request) => (
                  <li key={request.requestId}>
                    <Link to="/project-setup/$requestId" params={{ requestId: request.requestId }}>
                      {request.projectName} — {request.state}
                    </Link>
                  </li>
                ))}
              </ul>
            }
          >
            <HbcDataTable
              data={requests}
              columns={columns}
              enableSorting
              enablePagination
              pageSize={25}
              height="600px"
            />
          </HbcComplexityGate>
        </>
      )}
    </WorkspacePageShell>
  );
}
