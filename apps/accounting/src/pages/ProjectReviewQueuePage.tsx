import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useCurrentSession } from '@hbc/auth';
import { HbcComplexityGate } from '@hbc/complexity';
import type { IProjectSetupRequest } from '@hbc/models';
import {
  createProvisioningApiClient,
  useProvisioningStore,
  PROJECT_SETUP_STATUS_LABELS,
  DEPARTMENT_DISPLAY_LABELS,
  PROJECT_SETUP_BIC_CONFIG,
} from '@hbc/provisioning';
import { resolveFullBicState } from '@hbc/bic-next-move';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import {
  WorkspacePageShell,
  HbcDataTable,
  HbcStatusBadge,
  HbcButton,
  HbcTabs,
} from '@hbc/ui-kit';
import type { LayoutTab, ColumnDef } from '@hbc/ui-kit';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';
import { getStateBadgeVariant } from '../utils/stateDisplayHelpers.js';

type FilterTabId = 'pending' | 'clarification' | 'external' | 'failed';

const FILTER_TABS: LayoutTab[] = [
  { id: 'pending', label: 'Pending Review' },
  { id: 'clarification', label: 'Awaiting Re-Submission' },
  { id: 'external', label: 'Awaiting External Setup' },
  { id: 'failed', label: 'Failed / Needs Routing' },
];

const TAB_STATE_FILTER: Record<FilterTabId, string> = {
  pending: 'UnderReview',
  clarification: 'NeedsClarification',
  external: 'AwaitingExternalSetup',
  failed: 'Failed',
};

const REVIEW_QUEUE_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.hasActiveFilters ? 'filter-empty' : 'truly-empty',
    heading: 'No requests pending review',
    description: context.hasActiveFilters
      ? 'No requests match this filter. Try a different tab.'
      : 'Requests will appear here once submitted for review.',
    filterClearAction: context.hasActiveFilters
      ? { label: 'Show Pending Review' }
      : undefined,
    coachingTip: 'Submitted project setup requests are routed here for controller review.',
  }),
};

/**
 * W0-G4-T03: Controller project setup review queue.
 * Displays submitted requests filtered by state with tabbed navigation.
 * W0-G4-T07: Session guard, load-error state.
 * Traceability: docs/architecture/plans/MVP/G4/W0-G4-T03
 */
export function ProjectReviewQueuePage(): ReactNode {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const session = useCurrentSession();
  const navigate = useNavigate();
  const { requests, setRequests } = useProvisioningStore();
  const [loadError, setLoadError] = useState<string | null>(null);

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const client = useMemo(
    () => createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL ?? '', async () => authToken),
    [authToken],
  );

  useEffect(() => {
    if (!session) return;
    setLoadError(null);
    client
      .listRequests()
      .then((listed: IProjectSetupRequest[]) => setRequests(listed))
      .catch(() => {
        setLoadError('Unable to load review queue. Check your connection and try again.');
      });
  }, [client, session, setRequests]);

  const filteredRequests = useMemo(() => {
    const stateFilter = TAB_STATE_FILTER[activeTab as FilterTabId];
    if (!stateFilter) return requests;
    return [...requests]
      .filter((r) => r.state === stateFilter)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [requests, activeTab]);

  const emptyContext = useMemo<IEmptyStateContext>(() => ({
    module: 'accounting',
    view: activeTab,
    hasActiveFilters: true,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'controller',
    isLoadError: Boolean(loadError),
  }), [activeTab, loadError]);

  const handleOpen = useCallback(
    (requestId: string) => {
      navigate({ to: '/project-review/$requestId', params: { requestId } });
    },
    [navigate],
  );

  const columns = useMemo<ColumnDef<IProjectSetupRequest, unknown>[]>(
    () => [
      {
        id: 'projectName',
        header: 'Project Name',
        accessorKey: 'projectName',
        cell: ({ row }) => (
          <Link to="/project-review/$requestId" params={{ requestId: row.original.requestId }}>
            {row.original.projectName}
          </Link>
        ),
      },
      {
        id: 'projectNumber',
        header: 'Project #',
        accessorKey: 'projectNumber',
        cell: ({ row }) => row.original.projectNumber ?? '—',
      },
      {
        id: 'department',
        header: 'Department',
        accessorKey: 'department',
        cell: ({ row }) =>
          row.original.department
            ? (DEPARTMENT_DISPLAY_LABELS[row.original.department] ?? row.original.department)
            : '—',
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
        id: 'submittedBy',
        header: 'Submitted By',
        accessorKey: 'submittedBy',
      },
      {
        id: 'submittedAt',
        header: 'Submitted',
        accessorKey: 'submittedAt',
        cell: ({ row }) => new Date(row.original.submittedAt).toLocaleDateString(),
      },
      {
        id: 'currentOwner',
        header: 'Current Owner',
        cell: ({ row }) => {
          const bicState = resolveFullBicState(row.original, PROJECT_SETUP_BIC_CONFIG);
          return bicState.currentOwner?.displayName ?? 'System';
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <HbcButton
            variant="secondary"
            size="sm"
            onClick={() => handleOpen(row.original.requestId)}
          >
            Open
          </HbcButton>
        ),
      },
    ],
    [handleOpen],
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
        title="Project Setup Review"
        isError
        errorMessage={loadError}
        onRetry={() => { setLoadError(null); }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="Project Setup Review">
      <HbcTabs tabs={FILTER_TABS} activeTabId={activeTab} onTabChange={setActiveTab} />

      {filteredRequests.length === 0 ? (
        <HbcSmartEmptyState
          config={REVIEW_QUEUE_EMPTY_CONFIG}
          context={emptyContext}
          variant="inline"
          onActionFired={(label) => {
            if (label === 'Show Pending Review') setActiveTab('pending');
          }}
        />
      ) : (
        <HbcComplexityGate
          minTier="standard"
          fallback={
            <ul>
              {filteredRequests.map((r) => (
                <li key={r.requestId}>
                  <Link to="/project-review/$requestId" params={{ requestId: r.requestId }}>
                    {r.projectName} — {PROJECT_SETUP_STATUS_LABELS[r.state] ?? r.state}
                  </Link>
                </li>
              ))}
            </ul>
          }
        >
          <HbcDataTable
            data={filteredRequests}
            columns={columns}
            enableSorting
            enablePagination
            pageSize={25}
            height="600px"
          />
        </HbcComplexityGate>
      )}
    </WorkspacePageShell>
  );
}
