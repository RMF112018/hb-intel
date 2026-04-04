/**
 * P9.1-10: White-Glove Run Detail page.
 *
 * Displays full package run detail with device drill-down, checkpoint
 * history, evidence summary, audit events, and guided recovery actions.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import { PermissionGate } from '@hbc/auth';
import {
  WorkspacePageShell,
  HbcCard,
  HbcTypography,
  HbcButton,
  HbcStatusBadge,
  HbcBanner,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
} from '@hbc/ui-kit';
import { useWhiteGloveRunDetail } from '../hooks/useWhiteGloveRunDetail.js';
import type { IDeviceRunDetail } from '../hooks/useWhiteGloveRunDetail.js';

const ADMIN_RECOVERY_PERMISSION = 'admin:access-control:view';

const useStyles = makeStyles({
  headerCard: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  metaRow: {
    display: 'flex',
    gap: `${HBC_SPACE_LG}px`,
    flexWrap: 'wrap',
  },
  section: {
    marginTop: `${HBC_SPACE_LG}px`,
  },
  deviceCard: {
    padding: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  deviceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  subSection: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginLeft: `${HBC_SPACE_MD}px`,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${HBC_SPACE_SM / 2}px 0`,
  },
  recoveryActions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  auditEvent: {
    padding: `${HBC_SPACE_SM / 2}px 0`,
  },
});

function statusVariant(status: string): 'completed' | 'error' | 'warning' | 'inProgress' | 'neutral' {
  if (status === 'Completed') return 'completed';
  if (status === 'Failed' || status === 'RecoveryRequired') return 'error';
  if (status === 'PartiallyCompleted' || status === 'AwaitingCheckpoint') return 'warning';
  if (status === 'Running' || status === 'Enrolling' || status === 'Standardizing' || status === 'Validating' || status === 'ReadinessCheck') return 'inProgress';
  if (status === 'Cancelled') return 'neutral';
  return 'neutral';
}

function DeviceRunCard({ device, onRetry }: { device: IDeviceRunDetail; onRetry: (id: string) => void }): ReactNode {
  const styles = useStyles();
  const canRetry = device.failure?.retryEligible && device.deviceStatus === 'Failed';

  return (
    <HbcCard className={styles.deviceCard}>
      <div className={styles.deviceHeader}>
        <HbcTypography intent="heading3">{device.platform} — {device.serialNumber}</HbcTypography>
        <HbcStatusBadge variant={statusVariant(device.deviceStatus)} label={device.deviceStatus} />
      </div>

      {device.assetTag && <HbcTypography intent="bodySmall">Asset tag: {device.assetTag}</HbcTypography>}
      {device.hostname && <HbcTypography intent="bodySmall">Hostname: {device.hostname}</HbcTypography>}

      {device.progress && (
        <HbcTypography intent="bodySmall">
          Progress: step {device.progress.currentStep} of {device.progress.totalSteps}
        </HbcTypography>
      )}

      {device.failure && (
        <HbcBanner variant="error">
          {device.failure.failureClass}: {device.failure.failureMessage}
          {device.failure.retryEligible ? ` (retry ${device.failure.retryCount}x)` : ' (not retryable)'}
        </HbcBanner>
      )}

      {device.checkpoints.length > 0 && (
        <div className={styles.subSection}>
          <HbcTypography intent="label">Checkpoints</HbcTypography>
          {device.checkpoints.map((cp) => (
            <div key={cp.instanceId} className={styles.itemRow}>
              <HbcTypography intent="bodySmall">{cp.label} ({cp.checkpointType})</HbcTypography>
              <HbcStatusBadge
                variant={cp.status === 'Approved' ? 'completed' : cp.status === 'Rejected' ? 'error' : cp.status === 'Pending' ? 'warning' : 'neutral'}
                label={cp.status}
              />
            </div>
          ))}
        </div>
      )}

      {device.evidence.length > 0 && (
        <div className={styles.subSection}>
          <HbcTypography intent="label">Evidence ({device.evidence.length})</HbcTypography>
          {device.evidence.map((ev) => (
            <div key={ev.evidenceId} className={styles.itemRow}>
              <HbcTypography intent="bodySmall">
                {ev.label} — {ev.adapterSource} ({new Date(ev.capturedAt).toLocaleString()})
              </HbcTypography>
            </div>
          ))}
        </div>
      )}

      {canRetry && (
        <PermissionGate action={ADMIN_RECOVERY_PERMISSION}>
          <div className={styles.recoveryActions}>
            <HbcButton variant="secondary" onClick={() => onRetry(device.deviceRunId)}>
              Retry Device
            </HbcButton>
          </div>
        </PermissionGate>
      )}
    </HbcCard>
  );
}

export function WhiteGloveRunDetailPage({ runId }: { runId: string }): ReactNode {
  const session = useCurrentSession();
  const styles = useStyles();
  const { run, loading, error, fetchRun, retryPackageRun, retryDeviceRun, cancelPackageRun, refresh } = useWhiteGloveRunDetail();

  useEffect(() => {
    if (session && runId) {
      fetchRun(runId).catch(() => {});
    }
  }, [session, runId, fetchRun]);

  if (!session) {
    return <WorkspacePageShell layout="list" title="Loading..." isLoading>{null}</WorkspacePageShell>;
  }

  if (error && !run && !loading) {
    return (
      <WorkspacePageShell layout="list" title="Run Detail" isError errorMessage={error} onRetry={() => { refresh().catch(() => {}); }}>
        {null}
      </WorkspacePageShell>
    );
  }

  if (!run) {
    return <WorkspacePageShell layout="list" title="Loading run..." isLoading>{null}</WorkspacePageShell>;
  }

  const isTerminal = ['Completed', 'Failed', 'Cancelled', 'PartiallyCompleted'].includes(run.packageStatus);
  const canRetry = run.packageStatus === 'Failed' || run.packageStatus === 'PartiallyCompleted';
  const canCancel = !isTerminal;

  return (
    <WorkspacePageShell layout="list" title={`Package Run — ${run.employeeDisplayName}`}>
      <HbcCard className={styles.headerCard}>
        <div className={styles.headerRow}>
          <HbcTypography intent="heading2">{run.packageFamily}</HbcTypography>
          <HbcStatusBadge variant={statusVariant(run.packageStatus)} label={run.packageStatus} />
        </div>
        <div className={styles.metaRow}>
          <HbcTypography intent="bodySmall">Employee: {run.employeeDisplayName} ({run.employeeUpn})</HbcTypography>
          <HbcTypography intent="bodySmall">Template v{run.templateVersion}</HbcTypography>
          <HbcTypography intent="bodySmall">Launched: {new Date(run.launchedAt).toLocaleString()}</HbcTypography>
          {run.completedAt && <HbcTypography intent="bodySmall">Completed: {new Date(run.completedAt).toLocaleString()}</HbcTypography>}
        </div>
        <div className={styles.metaRow}>
          <HbcTypography intent="body">
            Devices: {run.completedDevices}/{run.totalDevices} completed
            {run.failedDevices > 0 ? `, ${run.failedDevices} failed` : ''}
          </HbcTypography>
        </div>

        <PermissionGate action={ADMIN_RECOVERY_PERMISSION}>
          <div className={styles.recoveryActions}>
            {canRetry && (
              <HbcButton variant="primary" onClick={() => { retryPackageRun(run.packageRunId).catch(() => {}); }}>
                Retry Failed Devices
              </HbcButton>
            )}
            {canCancel && (
              <HbcButton variant="secondary" onClick={() => { cancelPackageRun(run.packageRunId, 'Operator cancellation').catch(() => {}); }}>
                Cancel Package Run
              </HbcButton>
            )}
            <HbcButton variant="secondary" onClick={() => { refresh().catch(() => {}); }}>
              Refresh
            </HbcButton>
          </div>
        </PermissionGate>
      </HbcCard>

      <div className={styles.section}>
        <HbcTypography intent="heading2">Device Runs ({run.devices.length})</HbcTypography>
        {run.devices.map((device) => (
          <DeviceRunCard
            key={device.deviceRunId}
            device={device}
            onRetry={(id) => { retryDeviceRun(id).catch(() => {}); }}
          />
        ))}
      </div>

      {run.recentAuditEvents.length > 0 && (
        <div className={styles.section}>
          <HbcTypography intent="heading2">Audit Trail</HbcTypography>
          {run.recentAuditEvents.map((event) => (
            <div key={event.auditId} className={styles.auditEvent}>
              <HbcTypography intent="bodySmall">
                [{new Date(event.timestamp).toLocaleString()}] {event.eventType}: {event.summary}
              </HbcTypography>
            </div>
          ))}
        </div>
      )}
    </WorkspacePageShell>
  );
}
