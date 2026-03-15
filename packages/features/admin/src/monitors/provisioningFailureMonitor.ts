import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';
import type { IProvisioningDataProvider } from '../types/IProvisioningDataProvider.js';

/**
 * Monitors provisioning workflows for failure patterns.
 *
 * @design D-02, SF17-T03, G6-T04
 */

/** Shared deduplication key for provisioning-failure alerts. */
function dedupeKey(alert: IAdminAlert): string {
  return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
}

/** Retry ceiling matching provisioning-runbook.md threshold. */
const RETRY_CEILING = 3;

/**
 * Creates a configured provisioning-failure monitor that detects failed
 * project setup requests via the injected data provider.
 *
 * Severity rules (G6-T04 severity model):
 * - `high` for initial failures (`retryCount < RETRY_CEILING`)
 * - `critical` when retry ceiling is reached (`retryCount >= RETRY_CEILING`)
 */
export function createProvisioningFailureMonitor(
  provider: IProvisioningDataProvider,
): IAlertMonitor {
  return {
    key: 'provisioning-failure',
    defaultSeverity: 'critical',

    async run(nowIso: string): Promise<IAdminAlert[]> {
      const failed = await provider.listRequests('Failed');
      return failed.map((req) => ({
        alertId: `pf-${req.requestId}`,
        category: 'provisioning-failure' as const,
        severity: req.retryCount >= RETRY_CEILING ? ('critical' as const) : ('high' as const),
        title: `Provisioning failed: ${req.projectName}`,
        description: `Project ${req.projectId} is in Failed state (retryCount: ${req.retryCount}).`,
        affectedEntityType: 'record' as const,
        affectedEntityId: req.projectId,
        occurredAt: nowIso,
        ctaLabel: 'View Request',
        ctaHref: `/admin/requests/${req.requestId}`,
      }));
    },

    dedupeKey,
  };
}

/** Unconfigured stub preserved for backward compatibility. */
export const provisioningFailureMonitor: IAlertMonitor = {
  key: 'provisioning-failure',
  defaultSeverity: 'critical',
  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },
  dedupeKey,
};
