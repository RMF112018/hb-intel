import type { IAdminAlert } from '../types/IAdminAlert.js';
import type { NotificationRoute } from '../types/NotificationRoute.js';
import { routeAlert } from '../monitors/notificationRouter.js';

/**
 * Notification dispatch integration adapter.
 *
 * Defines the contract for dispatching admin notification events
 * without importing @hbc/notification-intelligence directly.
 *
 * @design D-02, SF17-T07
 */

/** Event payload dispatched through the notification system. */
export interface IAdminNotificationEvent {
  readonly alert: IAdminAlert;
  readonly route: NotificationRoute;
  readonly dispatchedAt: string;
}

/** Adapter interface for notification dispatch. */
export interface INotificationDispatchAdapter {
  /** Dispatch a notification event for the given alert. */
  dispatch(alert: IAdminAlert, previousSeverity?: IAdminAlert['severity']): IAdminNotificationEvent;
}

/**
 * Reference implementation using routeAlert from the notification router.
 */
export class ReferenceNotificationDispatchAdapter implements INotificationDispatchAdapter {
  dispatch(alert: IAdminAlert, previousSeverity?: IAdminAlert['severity']): IAdminNotificationEvent {
    const route = routeAlert(alert, previousSeverity);
    return {
      alert,
      route,
      dispatchedAt: new Date().toISOString(),
    };
  }
}
