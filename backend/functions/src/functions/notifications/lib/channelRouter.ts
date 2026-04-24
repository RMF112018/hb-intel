/**
 * Determines which delivery channels should fire for a given tier
 * and user preference set.
 *
 * D-01: Immediate → push + email + in-app
 * D-01: Watch    → in-app (+ daily digest email if opted in)
 * D-01: Digest   → in-app + digest-email
 * D-07: SPFx users never receive push (surface detection via context claim)
 */

import type { INotificationPreferences, NotificationChannel, NotificationTier } from '@hbc/notification-intelligence';

export function resolveChannels(
  tier: NotificationTier,
  preferences: INotificationPreferences | null,
  registeredChannels: NotificationChannel[],
  isSPFxContext: boolean,
): NotificationChannel[] {
  const active: NotificationChannel[] = [];

  // Always write to in-app store
  if (registeredChannels.includes('in-app')) {
    active.push('in-app');
  }

  if (tier === 'immediate') {
    // Push: only if user has enabled it and surface supports it (D-07)
    if (
      registeredChannels.includes('push') &&
      preferences?.pushEnabled &&
      !isSPFxContext
    ) {
      active.push('push');
    }
    // Email: always for Immediate
    if (registeredChannels.includes('email')) {
      active.push('email');
    }
  }

  if (tier === 'digest') {
    if (registeredChannels.includes('digest-email')) {
      active.push('digest-email');
    }
  }

  return active;
}
