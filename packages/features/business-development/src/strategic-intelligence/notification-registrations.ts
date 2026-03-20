/**
 * BD Strategic Intelligence notification event registrations.
 * Follows Provisioning reference pattern. P2-C5 Blocker #6 (partial).
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'bd.strategy-approval-needed',
    defaultTier: 'immediate',
    description: 'A strategic intelligence entry requires approval before it can advance.',
    tierOverridable: false,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'bd.strategy-review-due',
    defaultTier: 'watch',
    description: 'A strategic intelligence entry is approaching its review deadline.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'bd.conflict-escalation',
    defaultTier: 'immediate',
    description: 'A conflict has been escalated on a strategic intelligence entry.',
    tierOverridable: false,
    channels: ['in-app', 'push', 'email'],
  },
];
