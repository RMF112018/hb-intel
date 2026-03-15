import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';

/**
 * Monitors for workflows stuck in intermediate states.
 *
 * @design D-02, SF17-T03, G6-T04
 */

/** Threshold in minutes before a provisioning run is considered stuck. */
const STUCK_THRESHOLD_MINUTES = 30;

/** Threshold in minutes before severity escalates to critical. */
const CRITICAL_ESCALATION_MINUTES = 120;

/** Shared deduplication key for stuck-workflow alerts. */
function dedupeKey(alert: IAdminAlert): string {
  return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
}

/**
 * Creates a configured stuck-workflow monitor that detects provisioning runs
 * stuck in InProgress state for longer than 30 minutes.
 *
 * Severity rules:
 * - `high` when stuck 30 min – 2 h
 * - `critical` when stuck > 2 h
 */
export function createStuckWorkflowMonitor(
  provider: IProvisioningDataProvider,
): IAlertMonitor {
  return {
    key: 'stuck-workflow',
    defaultSeverity: 'high',

    async run(nowIso: string): Promise<IAdminAlert[]> {
      const runs = await provider.listProvisioningRuns('InProgress');
      const now = Date.parse(nowIso);
      const alerts: IAdminAlert[] = [];

      for (const run of runs) {
        const ageMinutes = (now - Date.parse(run.startedAt)) / 60_000;
        if (ageMinutes <= STUCK_THRESHOLD_MINUTES) continue;

        alerts.push({
          alertId: `sw-${run.projectId}-${run.correlationId}`,
          category: 'stuck-workflow',
          severity: ageMinutes > CRITICAL_ESCALATION_MINUTES ? 'critical' : 'high',
          title: `Workflow stuck: ${run.projectName} (${Math.round(ageMinutes)} min)`,
          description: `Project ${run.projectId} has been in InProgress state since ${run.startedAt} (step ${run.currentStep}).`,
          affectedEntityType: 'job',
          affectedEntityId: run.projectId,
          occurredAt: nowIso,
          ctaLabel: 'View Run',
          ctaHref: `/admin/provisioning/${run.projectId}`,
        });
      }

      return alerts;
    },

    dedupeKey,
  };
}

/** Unconfigured stub preserved for backward compatibility. */
export const stuckWorkflowMonitor: IAlertMonitor = {
  key: 'stuck-workflow',
  defaultSeverity: 'high',
  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },
  dedupeKey,
};
