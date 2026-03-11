import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for overdue provisioning tasks that have exceeded SLA windows.
 *
 * @design D-02, SF17-T03
 */
export const overdueProvisioningMonitor: IAlertMonitor = {
  key: 'overdue-provisioning-task',
  defaultSeverity: 'medium',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
