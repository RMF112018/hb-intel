import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { NotificationRoute } from '../types/NotificationRoute.js';

/**
 * Determines the notification routing for an alert based on severity.
 * Critical/high → immediate; medium/low → digest.
 * Already-acknowledged alerts skip immediate unless severity has escalated.
 *
 * @design D-02, SF17-T03
 */
export function routeAlert(
  alert: IAdminAlert,
  previousSeverity?: IAdminAlert['severity'],
): NotificationRoute {
  const isImmediate =
    alert.severity === 'critical' || alert.severity === 'high';

  if (!isImmediate) {
    return 'digest';
  }

  if (alert.acknowledgedAt) {
    const severityRank = { critical: 4, high: 3, medium: 2, low: 1 } as const;
    const escalated =
      previousSeverity !== undefined &&
      severityRank[alert.severity] > severityRank[previousSeverity];
    return escalated ? 'immediate' : 'digest';
  }

  return 'immediate';
}
