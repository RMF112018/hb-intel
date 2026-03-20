/**
 * BD Score Benchmark notification event registrations.
 * Follows Provisioning reference pattern. P2-C5 Blocker #6 (partial).
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'bd.score-threshold-crossed',
    defaultTier: 'watch',
    description: 'A pursuit score has crossed a configured threshold requiring attention.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'bd.consensus-changed',
    defaultTier: 'immediate',
    description: 'Team consensus on a pursuit score has changed — review recommended.',
    tierOverridable: false,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'bd.no-bid-flagged',
    defaultTier: 'immediate',
    description: 'A pursuit has been flagged as no-bid — acknowledgment required.',
    tierOverridable: false,
    channels: ['in-app', 'push', 'email'],
  },
];
