/**
 * P9.1-10: White-Glove Run History page.
 *
 * Paginated list of package run summaries with status filter
 * and click-through to detail view.
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  WorkspacePageShell,
  HbcCard,
  HbcTypography,
  HbcButton,
  HbcStatusBadge,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
} from '@hbc/ui-kit';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig, IEmptyStateContext } from '@hbc/smart-empty-state';
import { useWhiteGloveRunHistory } from '../hooks/useWhiteGloveRunHistory.js';

const useStyles = makeStyles({
  filters: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
  },
  runList: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  runCard: {
    padding: `${HBC_SPACE_MD}px`,
    cursor: 'pointer',
  },
  runHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  runMeta: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
  },
  pagination: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    justifyContent: 'center',
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

function statusVariant(status: string): 'completed' | 'error' | 'warning' | 'inProgress' | 'neutral' {
  if (status === 'Completed') return 'completed';
  if (status === 'Failed') return 'error';
  if (status === 'PartiallyCompleted') return 'warning';
  if (status === 'Running' || status === 'ReadinessCheck' || status === 'AwaitingLaunchConfirmation') return 'inProgress';
  if (status === 'AwaitingCheckpoint') return 'warning';
  if (status === 'Cancelled') return 'neutral';
  return 'neutral';
}

const HISTORY_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isLoadError ? 'loading-failed' : 'truly-empty',
    heading: 'No Package Runs',
    description: 'White-glove package runs will appear here after launch.',
    primaryAction: { label: 'Launch a Package', href: '/white-glove/launch' },
    coachingTip: 'Use the Launch page to start a new employee device deployment package.',
  }),
};

const HISTORY_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'white-glove-history',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

const STATUS_FILTERS = ['', 'Running', 'AwaitingCheckpoint', 'Completed', 'PartiallyCompleted', 'Failed', 'Cancelled'];

export function WhiteGloveRunHistoryPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const navigate = useNavigate();
  const { runs, total, page, pageSize, loading, error, fetchRuns } = useWhiteGloveRunHistory();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (session) {
      fetchRuns(1, 25, statusFilter || undefined).catch(() => {});
    }
  }, [session, fetchRuns, statusFilter]);

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  if (error && runs.length === 0 && !loading) {
    return (
      <WorkspacePageShell layout="list" title="White-Glove Run History" isError errorMessage={error} onRetry={() => { fetchRuns(1, 25).catch(() => {}); }}>
        {null}
      </WorkspacePageShell>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <WorkspacePageShell layout="list" title="White-Glove Run History">
      <div className={styles.filters}>
        {STATUS_FILTERS.map((s) => (
          <HbcButton
            key={s || 'all'}
            variant={statusFilter === s ? 'primary' : 'secondary'}
            onClick={() => setStatusFilter(s)}
          >
            {s || 'All'}
          </HbcButton>
        ))}
      </div>

      {runs.length === 0 && !loading && (
        <HbcSmartEmptyState config={HISTORY_EMPTY_CONFIG} context={{ ...HISTORY_EMPTY_CONTEXT, hasActiveFilters: !!statusFilter }} variant="inline" />
      )}

      <div className={styles.runList}>
        {runs.map((run) => (
          <HbcCard key={run.packageRunId} className={styles.runCard}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => { navigate({ to: `/white-glove/history/${run.packageRunId}` }).catch(() => {}); }}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate({ to: `/white-glove/history/${run.packageRunId}` }).catch(() => {}); }}
            >
              <div className={styles.runHeader}>
                <HbcTypography intent="heading3">{run.employeeDisplayName}</HbcTypography>
                <HbcStatusBadge variant={statusVariant(run.packageStatus)} label={run.packageStatus} />
              </div>
              <div className={styles.runMeta}>
                <HbcTypography intent="bodySmall">{run.packageFamily}</HbcTypography>
                <HbcTypography intent="bodySmall">Launched: {new Date(run.launchedAt).toLocaleString()}</HbcTypography>
                <HbcTypography intent="bodySmall">
                  Devices: {run.completedDevices}/{run.totalDevices} completed
                  {run.failedDevices > 0 ? `, ${run.failedDevices} failed` : ''}
                </HbcTypography>
              </div>
            </div>
          </HbcCard>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <HbcButton variant="secondary" disabled={page <= 1} onClick={() => { fetchRuns(page - 1, pageSize, statusFilter || undefined).catch(() => {}); }}>
            Previous
          </HbcButton>
          <HbcTypography intent="body">Page {page} of {totalPages}</HbcTypography>
          <HbcButton variant="secondary" disabled={page >= totalPages} onClick={() => { fetchRuns(page + 1, pageSize, statusFilter || undefined).catch(() => {}); }}>
            Next
          </HbcButton>
        </div>
      )}
    </WorkspacePageShell>
  );
}
