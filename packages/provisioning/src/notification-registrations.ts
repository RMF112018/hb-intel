/**
 * W0-G1-T03: Provisioning notification event registrations.
 * All 8 locked provisioning lifecycle events for the NotificationRegistry.
 * Traceability: docs/reference/provisioning/notification-event-matrix.md
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const PROVISIONING_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'provisioning.request-submitted',
    defaultTier: 'watch',
    description: 'A new Project Setup Request has been submitted for review.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'provisioning.clarification-requested',
    defaultTier: 'immediate',
    description: 'The Controller requires additional information before provisioning can proceed.',
    tierOverridable: false,
    channels: ['in-app', 'email', 'push'],
  },
  {
    eventType: 'provisioning.ready-to-provision',
    defaultTier: 'immediate',
    description: 'The request has been reviewed and is ready for external setup and provisioning trigger.',
    tierOverridable: false,
    channels: ['in-app', 'email', 'push'],
  },
  {
    eventType: 'provisioning.started',
    defaultTier: 'watch',
    description: 'SharePoint site provisioning has started for your project.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'provisioning.first-failure',
    defaultTier: 'immediate',
    description: 'Provisioning has failed on the first attempt. Review and retry from the Admin dashboard.',
    tierOverridable: false,
    channels: ['in-app', 'email', 'push'],
  },
  {
    eventType: 'provisioning.second-failure-escalated',
    defaultTier: 'immediate',
    description: 'Provisioning has failed a second time and requires admin escalation.',
    tierOverridable: false,
    channels: ['in-app', 'email', 'push'],
  },
  {
    eventType: 'provisioning.completed',
    defaultTier: 'watch',
    description: 'Your project SharePoint site is ready for use.',
    tierOverridable: true,
    channels: ['in-app', 'push'],
  },
  {
    eventType: 'provisioning.recovery-resolved',
    defaultTier: 'watch',
    description: 'A previously failed provisioning has been successfully recovered.',
    tierOverridable: true,
    channels: ['in-app'],
  },
];
