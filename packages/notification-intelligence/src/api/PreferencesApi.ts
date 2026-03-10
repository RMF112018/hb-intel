/**
 * PreferencesApi — SF10-T04
 *
 * Manages per-user notification preferences stored in the
 * HbcNotificationPreferences SharePoint list (one row per user).
 * Accessed via the Azure Functions /api/notifications/preferences route.
 *
 * D-06: Digest schedule (digestDay, digestHour) managed here.
 *
 * @see docs/architecture/adr/0099-notification-intelligence-tiered-model.md
 */

import type { INotificationPreferences } from '../types/INotification';

const PREFERENCES_URL = '/api/notifications/preferences';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`PreferencesApi: ${res.status} — ${error}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Retrieve the notification preferences for the current user.
 * Returns platform defaults if no preferences have been saved.
 */
async function getPreferences(): Promise<INotificationPreferences> {
  return fetchJSON<INotificationPreferences>(PREFERENCES_URL);
}

/**
 * Update notification preferences for the current user.
 * Supports partial updates — only the provided fields are changed.
 */
async function updatePreferences(
  updates: Partial<Omit<INotificationPreferences, 'userId'>>
): Promise<INotificationPreferences> {
  return fetchJSON<INotificationPreferences>(PREFERENCES_URL, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export const PreferencesApi = {
  getPreferences,
  updatePreferences,
} as const;
