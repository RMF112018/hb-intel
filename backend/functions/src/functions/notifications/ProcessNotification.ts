/**
 * SF10-T08: ProcessNotification — Queue trigger on hbc-notifications-queue
 * Resolves effective tier from registry defaults + user preferences,
 * writes to in-app store, routes to push/email channels.
 *
 * SDK-adapted from T08 plan: uses output.storageQueue() binding objects
 * instead of inline extraOutputs with string keys.
 */

// W0-G1-T03: Bootstrap provisioning notification registrations before processing.
import './notificationBootstrap.js';

import { app, output, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';
import { NotificationRegistry } from '@hbc/notification-intelligence';
import { resolveEffectiveTier } from './lib/tierResolver.js';
import { resolveChannels } from './lib/channelRouter.js';
import { notificationStore } from './lib/notificationStore.js';
import { preferencesStore } from './lib/preferencesStore.js';
import { pushDelivery } from './lib/pushDelivery.js';
import { createLogger } from '../../utils/logger.js';

const emailQueueOutput = output.storageQueue({
  queueName: 'hbc-email-queue',
  connection: 'AzureWebJobsStorage',
});

app.storageQueue('ProcessNotification', {
  queueName: 'hbc-notifications-queue',
  connection: 'AzureWebJobsStorage',
  extraOutputs: [emailQueueOutput],
  handler: async (message: unknown, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const startMs = Date.now();
    const correlationId = randomUUID();
    const payload = JSON.parse(message as string) as NotificationSendPayload;

    // P1-C3 §2.1.5: notification.send.process telemetry
    logger.trackEvent('notification.send.process', {
      notificationType: payload.eventType,
      correlationId,
      recipientUserId: payload.recipientUserId,
    });

    try {
      // 1. Resolve tier from registry + user preferences
      const prefs = await preferencesStore.get(payload.recipientUserId);
      const registration = NotificationRegistry.getByEventType(payload.eventType);

      if (!registration) {
        logger.warn(`ProcessNotification: unregistered eventType "${payload.eventType}" — skipping.`);
        logger.trackEvent('notification.send.error', {
          notificationType: payload.eventType,
          correlationId,
          durationMs: Date.now() - startMs,
          errorCode: 'UNREGISTERED_EVENT_TYPE',
        });
        return;
      }

      const effectiveTier = resolveEffectiveTier(registration, prefs);
      const channels = resolveChannels(effectiveTier, prefs, registration.channels, false);

      // 2. Write to in-app store (SharePoint HbcNotifications list)
      if (channels.includes('in-app')) {
        await notificationStore.create({
          ...payload,
          computedTier: effectiveTier,
          userTierOverride: prefs?.tierOverrides[payload.eventType] ?? null,
          effectiveTier,
          actionLabel: payload.actionLabel,
          readAt: null,
          dismissedAt: null,
        });
      }

      // 3. Push notification (Azure Notification Hubs)
      if (channels.includes('push')) {
        await pushDelivery.send({
          userId: payload.recipientUserId,
          title: payload.title,
          body: payload.body,
          data: { actionUrl: payload.actionUrl },
        });
      }

      // 4. Immediate email — enqueue to email queue
      if (channels.includes('email')) {
        context.extraOutputs.set(
          emailQueueOutput,
          JSON.stringify({
            type: 'immediate',
            recipientUserId: payload.recipientUserId,
            title: payload.title,
            body: payload.body,
            actionUrl: payload.actionUrl,
            actionLabel: payload.actionLabel,
          }),
        );
      }

      // Digest items are collected by SendDigestEmail timer function — no immediate action needed

      // P1-C3 §2.1.5: notification.send.complete telemetry
      logger.trackEvent('notification.send.complete', {
        notificationType: payload.eventType,
        correlationId,
        durationMs: Date.now() - startMs,
        effectiveTier,
        channels: channels.join(','),
        recipientCount: 1,
      });

      logger.info('ProcessNotification: processed', {
        eventType: payload.eventType,
        effectiveTier,
        channels,
        recipientUserId: payload.recipientUserId,
      });
    } catch (err) {
      // P1-C3 §2.1.5: notification.send.error telemetry
      logger.trackEvent('notification.send.error', {
        notificationType: payload.eventType,
        correlationId,
        durationMs: Date.now() - startMs,
        errorCode: err instanceof Error && 'code' in err ? (err as Record<string, unknown>).code : 'UNKNOWN',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
});
