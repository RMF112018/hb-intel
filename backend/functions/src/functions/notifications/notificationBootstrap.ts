/**
 * W0-G1-T03: Notification registration bootstrap.
 * Registers all provisioning event types with the NotificationRegistry
 * before ProcessNotification begins processing queue messages.
 *
 * Import this module from ProcessNotification.ts to ensure registrations
 * are loaded at module initialization time.
 */
import { NotificationRegistry } from '@hbc/notification-intelligence';
import { PROVISIONING_NOTIFICATION_REGISTRATIONS } from '@hbc/provisioning';

NotificationRegistry.register(PROVISIONING_NOTIFICATION_REGISTRATIONS);
