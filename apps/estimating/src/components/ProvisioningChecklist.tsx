import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT } from '@hbc/ui-kit/theme';

const STEP_LABELS: Record<number, string> = {
  1: 'Create SharePoint Site',
  2: 'Set Up Document Library',
  3: 'Upload Project Templates',
  4: 'Create Project Lists',
  5: 'Install HB Intel Interface',
  6: 'Set Team Permissions',
  7: 'Connect to Hub Site',
};

const STATUS_ICONS: Record<ISagaStepResult['status'], string> = {
  NotStarted: '○',
  InProgress: '⟳',
  Completed: '✓',
  Failed: '✗',
  Skipped: '–',
  DeferredToTimer: '🕐',
};

const STATUS_COLORS: Record<ISagaStepResult['status'], string> = {
  NotStarted: HBC_SURFACE_LIGHT['text-muted'],
  InProgress: HBC_STATUS_COLORS.info,
  Completed: HBC_STATUS_COLORS.success,
  Failed: HBC_STATUS_COLORS.error,
  Skipped: HBC_SURFACE_LIGHT['text-muted'],
  DeferredToTimer: HBC_STATUS_COLORS.warning,
};

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
  },
  title: { margin: 0 },
  list: {
    display: 'grid',
    gap: '8px',
    margin: 0,
    paddingLeft: '20px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  statusIcon: { fontWeight: 700 },
  inProgressText: { fontWeight: 700 },
  note: { margin: '4px 0 0 0', fontSize: '12px', color: HBC_STATUS_COLORS.warning },
  errorText: { margin: '4px 0 0 0', fontSize: '12px', color: HBC_STATUS_COLORS.error },
  timeText: { margin: '4px 0 0 0', fontSize: '12px', color: HBC_SURFACE_LIGHT['text-muted'] },
  link: {
    textAlign: 'center',
    color: HBC_SURFACE_LIGHT['surface-0'],
    padding: '8px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    backgroundColor: HBC_STATUS_COLORS.success,
  },
  pendingContainer: {
    display: 'grid',
    gap: '8px',
  },
  pendingText: {
    margin: 0,
    fontSize: '13px',
    color: HBC_STATUS_COLORS.warning,
  },
  pendingLink: {
    textAlign: 'center',
    color: HBC_SURFACE_LIGHT['surface-0'],
    padding: '8px 12px',
    borderRadius: '6px',
    textDecoration: 'none',
    backgroundColor: HBC_STATUS_COLORS.warning,
  },
});

/**
 * D-PH6-10 submitter-facing 7-step provisioning checklist.
 * Traceability: docs/architecture/plans/PH6.10-Estimating-App.md §6.10.4
 */
export function ProvisioningChecklist({
  status,
  showStepDetail = false,
}: {
  status: IProvisioningStatus;
  showStepDetail?: boolean;
}): ReactNode {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>
        Site Setup Progress — {status.projectNumber} {status.projectName}
      </h3>

      <ol className={styles.list}>
        {status.steps.map((step) => (
          <li key={step.stepNumber} className={styles.listItem}>
            <span className={styles.statusIcon} style={{ color: STATUS_COLORS[step.status] }}>
              {STATUS_ICONS[step.status]}
            </span>
            <div>
              <span className={step.status === 'InProgress' ? styles.inProgressText : undefined}>
                {STEP_LABELS[step.stepNumber] ?? step.stepName}
              </span>
              {showStepDetail && step.status === 'DeferredToTimer' ? (
                <p className={styles.note}>Will complete overnight — site is ready to use now.</p>
              ) : null}
              {showStepDetail && step.status === 'Failed' && step.errorMessage ? (
                <p className={styles.errorText}>{step.errorMessage}</p>
              ) : null}
              {showStepDetail && step.completedAt && step.status === 'Completed' ? (
                <p className={styles.timeText}>{new Date(step.completedAt).toLocaleTimeString()}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      {status.overallStatus === 'Completed' && status.siteUrl ? (
        <a href={status.siteUrl} target="_blank" rel="noreferrer" className={styles.link}>
          Open Project Site →
        </a>
      ) : null}

      {status.overallStatus === 'WebPartsPending' && status.siteUrl ? (
        <div className={styles.pendingContainer}>
          <p className={styles.pendingText}>
            The site is ready! The HB Intel interface will finish installing tonight.
          </p>
          <a href={status.siteUrl} target="_blank" rel="noreferrer" className={styles.pendingLink}>
            Open Project Site (Basic View) →
          </a>
        </div>
      ) : null}
    </div>
  );
}
