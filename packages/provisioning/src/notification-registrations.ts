/**
 * W0-G1-T03 + W0-G3-T04: Provisioning notification event registrations.
 * 15 provisioning lifecycle events (8 from G1-T03, 7 added by G3-T04).
 * Traceability: docs/reference/workflow-experience/setup-notification-registrations.md
 */
import type { INotificationRegistration } from '@hbc/notification-intelligence';

export const PROVISIONING_NOTIFICATION_REGISTRATIONS: INotificationRegistration[] = [
  {
    eventType: 'provisioning.request-submitted',
    defaultTier: 'immediate',
    description: 'A new Project Setup Request has been submitted — Controller must review to advance workflow.',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
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
    channels: ['in-app', 'email'],
  },
  {
    eventType: 'provisioning.recovery-resolved',
    defaultTier: 'watch',
    description: 'A previously failed provisioning has been successfully recovered.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  // ─── G3-T04 additions (7 new events) ──────────────────────────────────────
  {
    eventType: 'provisioning.clarification-responded',
    defaultTier: 'immediate',
    description: 'The requester has responded to a clarification request — Controller must review the updated submission.',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'provisioning.request-approved',
    defaultTier: 'watch',
    description: 'The Project Setup Request has been approved and is moving to provisioning.',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },
  {
    eventType: 'provisioning.step-completed',
    defaultTier: 'watch',
    description: 'A provisioning step has been completed for your project.',
    tierOverridable: true,
    channels: ['in-app'],
  },
  {
    eventType: 'provisioning.handoff-received',
    defaultTier: 'immediate',
    description: 'A workflow handoff has been assigned to you — action required.',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'provisioning.handoff-acknowledged',
    defaultTier: 'watch',
    description: 'The recipient has acknowledged your workflow handoff.',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },
  {
    eventType: 'provisioning.handoff-rejected',
    defaultTier: 'immediate',
    description: 'Your workflow handoff has been rejected — action required to reassign or resolve.',
    tierOverridable: false,
    channels: ['push', 'email', 'in-app'],
  },
  {
    eventType: 'provisioning.site-access-ready',
    defaultTier: 'watch',
    description: 'Site access permissions are configured and the project site is ready for your team.',
    tierOverridable: true,
    channels: ['in-app', 'email'],
  },
];
