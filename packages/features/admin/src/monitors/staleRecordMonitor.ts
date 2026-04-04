import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { IAlertMonitor } from '../types/IAlertMonitor.js';

/**
 * Monitors for stale records that have not been updated within expected intervals.
 *
 * **Phase 12 status: explicit non-goal.**
 *
 * Requires record-freshness metadata (last-modified timestamps or heartbeat
 * records) across provisioned resources. The current data model does not
 * track modification timestamps on SharePoint list items, project registry
 * records, or binding records in a way that supports freshness monitoring.
 *
 * Note: The probe-to-alert bridge (probeHealthAlertBridge) reuses the
 * 'stale-record' category for probe-derived infrastructure health alerts.
 * This is intentional — probe degradation is the closest semantic match
 * to "stale infrastructure" until a dedicated freshness monitor exists.
 *
 * @design D-02, SF17-T03
 * @deferred Phase 13+ — requires record-freshness metadata model
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
