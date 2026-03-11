import type { AlertCategory } from './AlertCategory.js';
import type { AlertSeverity } from './AlertSeverity.js';
import type { IAdminAlert } from './IAdminAlert.js';

/**
 * Contract for an alert monitor that detects a specific category of anomaly.
 *
 * @design D-02, SF17-T03
 */
export interface IAlertMonitor {
  readonly key: AlertCategory;
  readonly defaultSeverity: AlertSeverity;
  run(nowIso: string): Promise<IAdminAlert[]>;
  dedupeKey(alert: IAdminAlert): string;
}
