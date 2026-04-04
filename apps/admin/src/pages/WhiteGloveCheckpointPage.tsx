/**
 * P9.1-09: White-Glove Checkpoint page.
 *
 * Displays active package runs with pending checkpoints.
 * Provides approve/reject actions for device-level checkpoints.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
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
import { useWhiteGloveCheckpoints } from '../hooks/useWhiteGloveCheckpoints.js';

const useStyles = makeStyles({
  runCard: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  checkpointRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM}px 0`,
  },
  checkpointInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkpointActions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
});

const CHECKPOINT_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: context.isLoadError ? 'loading-failed' : 'truly-empty',
    heading: 'No Active Checkpoints',
    description: 'There are no package runs waiting for operator action. Checkpoints appear here when a device run pauses for approval.',
    primaryAction: { label: 'Launch a Package', href: '/white-glove/launch' },
    coachingTip: 'Checkpoints occur during technician pre-provisioning, enrollment blocks, and recovery scenarios.',
  }),
};

const CHECKPOINT_EMPTY_CONTEXT: IEmptyStateContext = {
  module: 'admin',
  view: 'white-glove-checkpoints',
  hasActiveFilters: false,
  hasPermission: true,
  isFirstVisit: false,
  currentUserRole: 'admin',
  isLoadError: false,
};

export function WhiteGloveCheckpointPage(): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const { activeRuns, loading, error, resolveCheckpoint, refresh } = useWhiteGloveCheckpoints();
  const [resolving, setResolving] = useState<string | null>(null);

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  if (error && activeRuns.length === 0 && !loading) {
    return (
      <WorkspacePageShell layout="list" title="White-Glove Checkpoints" isError errorMessage={error} onRetry={() => { refresh().catch(() => {}); }}>
        {null}
      </WorkspacePageShell>
    );
  }

  const handleResolve = async (deviceRunId: string, cpId: string, decision: 'approve' | 'reject'): Promise<void> => {
    setResolving(cpId);
    try {
      await resolveCheckpoint(deviceRunId, cpId, decision);
    } catch {
      // Error handled by hook
    } finally {
      setResolving(null);
    }
  };

  return (
    <WorkspacePageShell layout="list" title="White-Glove Checkpoints">
      <HbcTypography intent="heading2">Active Checkpoints</HbcTypography>
      <HbcTypography intent="body">
        Package runs paused at checkpoints requiring operator action.
      </HbcTypography>

      {activeRuns.length === 0 && !loading && (
        <HbcSmartEmptyState config={CHECKPOINT_EMPTY_CONFIG} context={CHECKPOINT_EMPTY_CONTEXT} variant="inline" />
      )}

      {activeRuns.map((run) => (
        <HbcCard key={run.packageRunId} className={styles.runCard}>
          <HbcTypography intent="heading3">{run.employeeDisplayName}</HbcTypography>
          <HbcTypography intent="bodySmall">
            {run.packageFamily} | Launched: {new Date(run.launchedAt).toLocaleString()}
          </HbcTypography>
          <HbcStatusBadge variant="warning" label={run.packageStatus} />

          {run.devices
            .filter((d) => d.checkpoints.some((cp) => cp.status === 'Pending'))
            .map((device) => (
              <div key={device.deviceRunId}>
                <HbcTypography intent="label">
                  {device.platform} — {device.serialNumber}
                </HbcTypography>
                {device.checkpoints
                  .filter((cp) => cp.status === 'Pending')
                  .map((cp) => (
                    <div key={cp.instanceId} className={styles.checkpointRow}>
                      <div className={styles.checkpointInfo}>
                        <HbcTypography intent="body">{cp.label}</HbcTypography>
                        <HbcTypography intent="bodySmall">
                          Type: {cp.checkpointType} | Created: {new Date(cp.createdAt).toLocaleString()}
                        </HbcTypography>
                      </div>
                      <div className={styles.checkpointActions}>
                        <HbcButton
                          variant="primary"
                          onClick={() => { handleResolve(device.deviceRunId, cp.instanceId, 'approve').catch(() => {}); }}
                          disabled={resolving === cp.instanceId}
                        >
                          {resolving === cp.instanceId ? 'Processing...' : 'Approve'}
                        </HbcButton>
                        <HbcButton
                          variant="secondary"
                          onClick={() => { handleResolve(device.deviceRunId, cp.instanceId, 'reject').catch(() => {}); }}
                          disabled={resolving === cp.instanceId}
                        >
                          Reject
                        </HbcButton>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </HbcCard>
      ))}

      <div className={styles.actions}>
        <HbcButton variant="secondary" onClick={() => { refresh().catch(() => {}); }} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </HbcButton>
      </div>
    </WorkspacePageShell>
  );
}
