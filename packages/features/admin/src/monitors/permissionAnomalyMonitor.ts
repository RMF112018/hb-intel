import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for permission anomalies across provisioned resources.
 *
 * **Phase 12 status: explicit non-goal.**
 *
 * Requires a permission audit data source that does not yet exist in the repo.
 * Implementing this monitor would require:
 * - A backend service that periodically snapshots effective permissions on
 *   provisioned SharePoint sites and Entra groups
 * - A comparison engine to detect drift between expected and actual permissions
 * - A query API to surface anomalies to this monitor
 *
 * None of these dependencies exist today. This monitor is preserved in the
 * registry as a named placeholder so that future work can wire it without
 * changing the registry structure.
 *
 * @design D-02, SF17-T03
 * @deferred Phase 13+ — requires permission audit infrastructure
 */
export const permissionAnomalyMonitor: IAlertMonitor = {
  key: 'permission-anomaly',
  defaultSeverity: 'high',

  async run(_nowIso: string): Promise<IAdminAlert[]> {
    return [];
  },

  dedupeKey(alert: IAdminAlert): string {
    return `${alert.category}:${alert.affectedEntityType}:${alert.affectedEntityId}`;
  },
};
