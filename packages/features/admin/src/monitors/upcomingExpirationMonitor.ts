import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for resources approaching expiration dates.
 *
 * **Phase 12 status: explicit non-goal.**
 *
 * Requires expiration-tracked entities that are not yet modeled in the repo.
 * Candidates include: app registration secrets, managed certificates,
 * connector credentials, and trial-period governance items. None of these
 * currently have a lifecycle model with expiration dates exposed through
 * a queryable data provider.
 *
 * @design D-02, SF17-T03
 * @deferred Phase 13+ — requires expiration-aware entity model
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
