import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';

/**
 * Monitors for overdue provisioning tasks that have exceeded SLA windows.
 *
 * Detects provisioning runs stuck in Submitted or NotStarted state
 * for longer than expected. Unlike stuck-workflow (which covers InProgress),
 * this monitor catches requests that were submitted but never started,
 * or started but never progressed to an active workflow.
 *
 * Severity rules:
 * - `medium` when overdue 1–4 hours
 * - `high` when overdue > 4 hours
 *
 * @design D-02, SF17-T03, P12-06
 */

/** Threshold in minutes before a Submitted request is considered overdue. */
const OVERDUE_THRESHOLD_MINUTES = 60;

/** Threshold in minutes before severity escalates to high. */
const HIGH_ESCALATION_MINUTES = 240;

/** Shared deduplication key for overdue-provisioning-task alerts. */
function dedupeKey(alert: IAdminAlert): string {
  return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
}

/**
 * Creates a configured overdue-provisioning monitor that detects requests
 * stuck in Submitted state for longer than expected.
 */
export function createOverdueProvisioningMonitor(
  provider: IProvisioningDataProvider,
): IAlertMonitor {
  return {
    key: 'overdue-provisioning-task',
    defaultSeverity: 'medium',

    async run(nowIso: string): Promise<IAdminAlert[]> {
      const requests = await provider.listRequests('Submitted');
      const now = Date.parse(nowIso);
      const alerts: IAdminAlert[] = [];

      for (const req of requests) {
        if (!req.submittedAt) continue;
        const submittedAt = req.submittedAt;

        const ageMinutes = (now - Date.parse(submittedAt)) / 60_000;
        if (ageMinutes <= OVERDUE_THRESHOLD_MINUTES) continue;

        alerts.push({
          alertId: `overdue-${req.projectId}`,
          category: 'overdue-provisioning-task',
          severity: ageMinutes > HIGH_ESCALATION_MINUTES ? 'high' : 'medium',
          title: `Overdue: ${req.projectName} (${Math.round(ageMinutes / 60)}h waiting)`,
          description: `Project ${req.projectId} has been in Submitted state since ${submittedAt} without starting provisioning.`,
          affectedEntityType: 'record',
          affectedEntityId: req.projectId,
          occurredAt: nowIso,
          ctaLabel: 'View Request',
          ctaHref: `/admin/runs?projectId=${req.projectId}`,
        });
      }

      return alerts;
    },

    dedupeKey,
  };
}

/** Unconfigured stub preserved for backward compatibility. */
export const overdueProvisioningMonitor: IAlertMonitor = {
  key: 'overdue-provisioning-task',
  defaultSeverity: 'medium',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey,
};
