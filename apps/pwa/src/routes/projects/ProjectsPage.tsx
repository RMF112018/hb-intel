/**
 * W0-G5-T01: Projects status list page.
 * Shows the current user's project setup requests with state badges.
 * Thin filtered view — no prioritization or inbox behavior.
 */
import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import { useRouter } from '@tanstack/react-router';
import { WorkspacePageShell } from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import {
  PROJECT_SETUP_STATUS_LABELS,
  getStateBadgeVariant,
} from '@hbc/provisioning';
import type { IProjectSetupRequest } from '@hbc/models';
import { useCurrentUser } from '@hbc/auth';
import { useMyProjectRequests } from '../../hooks/provisioning/index.js';

const EMPTY_STATE_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isFirstVisit ? 'first-use' : 'truly-empty',
    heading: context.isFirstVisit
      ? 'Welcome to Project Setup'
      : 'No Project Requests Yet',
    description: context.isFirstVisit
      ? 'Start by creating your first project setup request.'
      : 'Create a new request to get started.',
    primaryAction: {
      label: 'Start New Project Setup',
      href: '/project-setup',
    },
    coachingTip: 'Project setup requests go through review before provisioning begins.',
  }),
};

function BadgeVariant({ variant }: { variant: string }): ReactElement {
  return (
    <span
      className={`hbc-badge hbc-badge--${variant}`}
      data-variant={variant}
    />
  );
}

export function ProjectsPage(): ReactElement {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { data: requests, isLoading, isError } = useMyProjectRequests();

  const emptyContext = useMemo<IEmptyStateContext>(() => ({
    module: 'provisioning',
    view: 'my-requests',
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: !requests || requests.length === 0,
    currentUserRole: currentUser?.roles?.[0]?.name ?? 'user',
    isLoadError: isError,
  }), [requests, currentUser, isError]);

  const handleRowClick = useCallback(
    (request: IProjectSetupRequest) => {
      void router.navigate({ to: `/provisioning/${request.projectId}` });
    },
    [router],
  );

  const handleNewRequest = useCallback(() => {
    void router.navigate({ to: '/project-setup', search: { mode: 'new-request' } });
  }, [router]);

  if (isLoading) {
    return (
      <WorkspacePageShell layout="list" title="My Project Requests" isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <WorkspacePageShell layout="list" title="My Project Requests">
        <HbcSmartEmptyState config={EMPTY_STATE_CONFIG} context={emptyContext} />
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="My Project Requests">
      <header className="hbc-page__header">
        <button
          type="button"
          className="hbc-btn hbc-btn--primary"
          onClick={handleNewRequest}
        >
          New Request
        </button>
      </header>

      <table className="hbc-data-table" role="grid">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr
              key={req.requestId}
              onClick={() => handleRowClick(req)}
              role="row"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRowClick(req);
                }
              }}
              className="hbc-data-table__row--clickable"
            >
              <td>{req.projectName}</td>
              <td>{req.projectType}</td>
              <td>
                <BadgeVariant variant={getStateBadgeVariant(req.state)} />
                {PROJECT_SETUP_STATUS_LABELS[req.state]}
              </td>
              <td>{req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : '—'}</td>
              <td>
                {req.state === 'NeedsClarification' && (
                  <button
                    type="button"
                    className="hbc-btn hbc-btn--ghost hbc-btn--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      void router.navigate({
                        to: '/project-setup',
                        search: { mode: 'clarification-return', requestId: req.requestId },
                      });
                    }}
                  >
                    Respond
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </WorkspacePageShell>
  );
}
