import type { IAdminAlert } from './IAdminAlert.js';
import type { IAdminAlertBadge } from './IAdminAlertBadge.js';
import type { AlertCategory } from './AlertCategory.js';

/**
 * Return type for the useAdminAlerts hook.
 *
 * @design D-02, D-03, D-07
 */
export interface UseAdminAlertsResult {
  readonly alerts: readonly IAdminAlert[];
  readonly filteredAlerts: (category: AlertCategory) => readonly IAdminAlert[];
  readonly badge: IAdminAlertBadge;
  readonly acknowledge: (alertId: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly isLoading: boolean;
  readonly error: Error | null;
}
