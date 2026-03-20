/**
 * Project Hub Health Pulse notification event registrations.
 * Follows Provisioning reference pattern. P2-C5 Blocker #7.
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'project.health-status-changed',
    defaultTier: 'watch',
    description: 'Project health status has changed — review recommended.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'project.risk-escalated',
    defaultTier: 'immediate',
    description: 'A project risk has been escalated requiring immediate attention.',
    tierOverridable: false,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'project.confidence-dropped',
    defaultTier: 'immediate',
    description: 'Project confidence level has dropped below the configured threshold.',
    tierOverridable: false,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'project.triage-required',
    defaultTier: 'immediate',
    description: 'A project requires triage — multiple health indicators are flagged.',
    tierOverridable: false,
    channels: ['in-app', 'push', 'email'],
  },
];
