/**
 * NotificationApi — SF10-T04
 *
 * Thin REST client for the Azure Functions notification backend.
 * All routes are prefixed with /api/notifications/.
 *
 * D-01: Azure Functions backend; HbcNotifications SharePoint list as in-app store.
 * D-07: API calls route through Azure Functions regardless of surface (PWA or SPFx).
 *
 * @see docs/architecture/adr/0099-notification-intelligence-tiered-model.md
 */

import type {
  INotificationCenterFilter,
  INotificationCenterResult,
  NotificationSendPayload,
} from '../types/INotification';
import { NotificationRegistry } from '../registry/NotificationRegistry';

const BASE_URL = '/api/notifications';

async function fetchJSON<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`NotificationApi: ${res.status} — ${error}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Send a notification event to the Azure Functions queue processor.
 * The processor resolves the effective tier, looks up user preferences,
 * and routes to the appropriate delivery channels (push, email, in-app).
 *
 * @throws {Error} If the eventType is not registered in the NotificationRegistry.
 */
async function send(payload: NotificationSendPayload): Promise<void> {
  const registration = NotificationRegistry.getByEventType(payload.eventType);
  if (!registration) {
    throw new Error(
      `NotificationApi.send: unknown eventType "${payload.eventType}". ` +
        `Register it with NotificationRegistry.register() at package initialization.`
    );
  }

  await fetchJSON<void>(`${BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieve paginated notification center items for the current user.
 */
async function getCenter(
  filter: INotificationCenterFilter = {}
): Promise<INotificationCenterResult> {
  const params = new URLSearchParams();
  if (filter.tier) params.set('tier', filter.tier);
  if (filter.unreadOnly) params.set('unreadOnly', 'true');
  if (filter.cursor) params.set('cursor', filter.cursor);
  if (filter.pageSize) params.set('pageSize', String(filter.pageSize));

  return fetchJSON<INotificationCenterResult>(
    `${BASE_URL}/center?${params.toString()}`
  );
}

/**
 * Mark a single notification as read.
 */
async function markRead(notificationId: string): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * Mark all notifications in a tier as read.
 * Pass 'all' to mark all tiers.
 */
async function markAllRead(
  tier: 'immediate' | 'watch' | 'digest' | 'all' = 'all'
): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/mark-all-read`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

/**
 * Dismiss a notification (removes it from the active center view).
 */
async function dismiss(notificationId: string): Promise<void> {
  await fetchJSON<void>(`${BASE_URL}/${notificationId}/dismiss`, {
    method: 'PATCH',
  });
}

export const NotificationApi = {
  send,
  getCenter,
  markRead,
  markAllRead,
  dismiss,
} as const;
