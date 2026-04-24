/**
 * Resolves the effective tier for a notification event.
 *
 * Phase 1 (D-09 static): effective tier = user override if set, else registry defaultTier.
 * Phase 2 (future): adaptive downshift based on response patterns.
 */

import type { INotificationRegistration, INotificationPreferences, NotificationTier } from '@hbc/notification-intelligence';

export function resolveEffectiveTier(
  registration: INotificationRegistration,
  preferences: INotificationPreferences | null,
): NotificationTier {
  if (!preferences || !registration.tierOverridable) {
    return registration.defaultTier;
  }

  const override = preferences.tierOverrides[registration.eventType];
  return override ?? registration.defaultTier;
}
