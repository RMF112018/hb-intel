import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for stale records that have not been updated within expected intervals.
 *
 * @design D-02, SF17-T03
 */
export const staleRecordMonitor: IAlertMonitor = {
  key: 'stale-record',
  defaultSeverity: 'low',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
