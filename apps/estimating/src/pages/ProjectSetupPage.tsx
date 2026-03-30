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
import {
  HbcBanner,
  HbcButton,
  HbcDataTable,
  HbcStatusBadge,
  WorkspacePageShell,
  HBC_SURFACE_LIGHT,
  HBC_PRIMARY_BLUE,
  HBC_RADIUS_SM,
  HBC_RADIUS_LG,
} from '@hbc/ui-kit';
import {
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  heading2,
  bodySmall,
  label as labelType,
} from '@hbc/ui-kit/theme';
import type { ColumnDef } from '@tanstack/react-table';
import { getStateBadgeVariant } from '../components/project-setup/stateDisplayHelpers.js';
import { useProjectSetupBackend } from '../project-setup/backend/ProjectSetupBackendContext.js';
import { canCoordinatorRetry } from '../utils/failureClassification.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  // ── Page header zone ───────────────────────────────────────────────
  headerZone: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px ${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
    borderBottomWidth: '1px', // eslint-disable-line @hb-intel/hbc/enforce-hbc-tokens -- standard border, no token needed
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_SURFACE_LIGHT['surface-3'],
  },
  pageTitle: {
    fontSize: heading2.fontSize,
    fontWeight: heading2.fontWeight,
    lineHeight: heading2.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  headerTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    marginLeft: 'auto',
  },
  countBadge: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    paddingTop: `${HBC_SPACE_XS / 2}px`,
    paddingBottom: `${HBC_SPACE_XS / 2}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
  },

  // ── Table zone ─────────────────────────────────────────────────────
  tableContainer: {
    marginTop: `${HBC_SPACE_SM}px`,
  },
  projectLink: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontWeight: '600',
    textDecorationLine: 'none',
    ':hover': {
      textDecorationLine: 'underline',
    },
    ':focus-visible': {
      outlineWidth: `${HBC_SPACE_XS / 2}px`,
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: `${HBC_SPACE_XS / 2}px`,
      borderRadius: HBC_RADIUS_SM,
    },
  },
  dateCell: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  ownerCell: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  awaitingLabel: {
    fontSize: bodySmall.fontSize,
    fontWeight: labelType.fontWeight,
    fontStyle: 'italic',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  bannerContainer: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },

  // ── Essential tier list ────────────────────────────────────────────
  essentialList: {
    listStyleType: 'none',
    paddingLeft: '0',
    marginTop: '0',
    marginBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  essentialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingTop: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_SM + HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: HBC_RADIUS_LG,
  },
  essentialLink: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontWeight: '600',
    textDecorationLine: 'none',
    flexGrow: 1,
    ':hover': { textDecorationLine: 'underline' },
  },
});

// ── Empty state config ────────────────────────────────────────────────────

const SETUP_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isFirstVisit ? 'first-use' : 'truly-empty',
    heading: 'No project setup requests yet',
    description: 'Submit a new request to begin project setup. Requests are reviewed before provisioning begins.',
    primaryAction: { label: 'New Project Setup Request', href: '/project-setup/new' },
    coachingTip: 'Once submitted, requests go through automated provisioning steps. You can track progress from this queue.',
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

// ── Component ─────────────────────────────────────────────────────────────

/**
 * Project Setup Requests — operational queue page.
 * Standard+ tier renders HbcDataTable with columns, row actions, and BIC ownership.
 * Essential tier renders a simpler card list with status badges.
 */
export function ProjectSetupPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const { client, isUiReview } = useProjectSetupBackend();
  const { requests, setRequests, statusByProjectId, setProvisioningStatus } =
    useProvisioningStore();
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      if (!isUiReview) return;

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
    setIsLoading(true);
    client
      .listRequests()
      .then(async (listed: IProjectSetupRequest[]) => {
        if (!active || loadGenerationRef.current !== generation) return;
        await syncRequests(listed, generation);
      })
      .catch(() => {
        if (active && loadGenerationRef.current === generation) {
          setLoadError('Unable to load project setup requests. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (active && loadGenerationRef.current === generation) {
          setIsLoading(false);
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

  const columns = useMemo<ColumnDef<IProjectSetupRequest, unknown>[]>(
    () => [
      {
        id: 'projectName',
        header: 'Project Name',
        accessorKey: 'projectName',
        size: 220,
        cell: ({ row }) => (
          <Link
            to="/project-setup/$requestId"
            params={{ requestId: row.original.requestId }}
            className={styles.projectLink}
          >
            {row.original.projectName}
          </Link>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        size: 140,
        accessorFn: (row) => DEPARTMENT_DISPLAY_LABELS[row.department ?? ''] ?? row.department ?? '—',
      },
      {
        id: 'state',
        header: 'Status',
        size: 130,
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
        size: 160,
        accessorFn: (row) => {
          const bicState = resolveFullBicState(row, PROJECT_SETUP_BIC_CONFIG);
          return bicState.currentOwner?.displayName ?? 'System';
        },
        cell: ({ getValue }) => (
          <span className={styles.ownerCell}>{getValue() as string}</span>
        ),
      },
      {
        id: 'submittedAt',
        header: 'Submitted',
        size: 110,
        accessorKey: 'submittedAt',
        cell: ({ row }) => (
          <span className={styles.dateCell}>
            {new Date(row.original.submittedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 100,
        enableSorting: false,
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
            return <span className={styles.awaitingLabel}>Awaiting Response</span>;
          }
          return null;
        },
      },
    ],
    [styles, statusByProjectId, handleRetry, handleEscalate],
  );

  // Session loading guard
  if (!session) {
    return (
      <WorkspacePageShell layout="list" title="Project Setup Requests" isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  // Load error state
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
      {/* ── Page header with action and count ────────────────── */}
      <div className={styles.headerZone}>
        <h2 className={styles.pageTitle}>Request Queue</h2>
        <div className={styles.headerTrailing}>
          {!isLoading && requests.length > 0 && (
            <span className={styles.countBadge} aria-live="polite">
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          )}
          <Link to="/project-setup/new" search={{ mode: 'new-request', requestId: undefined }}>
            <HbcButton>New Request</HbcButton>
          </Link>
        </div>
      </div>

      {/* ── Action error banner ──────────────────────────────── */}
      {actionError && (
        <div className={styles.bannerContainer}>
          <HbcBanner variant="error" onDismiss={() => setActionError(null)}>
            {actionError}
          </HbcBanner>
        </div>
      )}

      {/* ── Content: empty, loading, or table ────────────────── */}
      {!isLoading && requests.length === 0 ? (
        <HbcSmartEmptyState
          config={SETUP_EMPTY_CONFIG}
          context={SETUP_EMPTY_CONTEXT}
          variant="full-page"
        />
      ) : (
        <div className={styles.tableContainer}>
          <HbcComplexityGate
            minTier="standard"
            fallback={
              <ul className={styles.essentialList}>
                {requests.map((request) => (
                  <li key={request.requestId} className={styles.essentialItem}>
                    <Link
                      to="/project-setup/$requestId"
                      params={{ requestId: request.requestId }}
                      className={styles.essentialLink}
                    >
                      {request.projectName}
                    </Link>
                    <HbcStatusBadge
                      variant={getStateBadgeVariant(request.state)}
                      label={PROJECT_SETUP_STATUS_LABELS[request.state] ?? request.state}
                      size="small"
                    />
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
              isLoading={isLoading}
            />
          </HbcComplexityGate>
        </div>
      )}
    </WorkspacePageShell>
  );
}
