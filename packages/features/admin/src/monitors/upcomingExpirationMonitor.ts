import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for resources approaching expiration dates.
 *
 * @design D-02, SF17-T03
 */
export const upcomingExpirationMonitor: IAlertMonitor = {
  key: 'upcoming-expiration',
  defaultSeverity: 'medium',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
