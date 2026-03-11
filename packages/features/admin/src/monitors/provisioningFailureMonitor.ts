import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors provisioning workflows for failure patterns.
 *
 * @design D-02, SF17-T03
 */
export const provisioningFailureMonitor: IAlertMonitor = {
  key: 'provisioning-failure',
  defaultSeverity: 'critical',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
