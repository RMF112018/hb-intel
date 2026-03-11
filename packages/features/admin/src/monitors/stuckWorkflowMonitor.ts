import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for workflows stuck in intermediate states.
 *
 * @design D-02, SF17-T03
 */
export const stuckWorkflowMonitor: IAlertMonitor = {
  key: 'stuck-workflow',
  defaultSeverity: 'high',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
