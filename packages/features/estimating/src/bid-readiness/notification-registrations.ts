/**
 * Estimating Bid Readiness notification event registrations.
 * Follows Provisioning reference pattern. P2-C5 Blocker #5.
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const ESTIMATING_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'estimating.readiness-changed',
    defaultTier: 'watch',
    description: 'Bid readiness status has changed for a pursuit you own or are assigned to.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'estimating.blocker-resolved',
    defaultTier: 'immediate',
    description: 'A readiness blocker has been resolved — pursuit may now advance.',
    tierOverridable: false,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'estimating.due-approaching',
    defaultTier: 'immediate',
    description: 'A pursuit bid deadline is approaching with outstanding readiness criteria.',
    tierOverridable: false,
    channels: ['in-app', 'push', 'email'],
  },
];
