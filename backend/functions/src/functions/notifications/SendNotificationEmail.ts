/**
 * SF10-T08: SendNotificationEmail — Queue trigger on hbc-email-queue
 * Parses the email message and sends via emailDelivery adapter.
 */

import { app, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import { emailDelivery } from './lib/emailDelivery.js';
import { createLogger } from '../../utils/logger.js';

interface EmailQueueMessage {
  type: 'immediate';
  recipientUserId: string;
  title: string;
  body: string;
  actionUrl: string;
  actionLabel?: string;
}

app.storageQueue('SendNotificationEmail', {
  queueName: 'hbc-email-queue',
  connection: 'AzureWebJobsStorage',
  handler: async (message: unknown, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const startMs = Date.now();
    const correlationId = randomUUID();
    const payload = JSON.parse(message as string) as EmailQueueMessage;

    // P1-C3 §2.1.5: notification.send.process telemetry
    logger.trackEvent('notification.send.process', {
      notificationType: 'email',
      correlationId,
      recipientUserId: payload.recipientUserId,
    });

    try {
      await emailDelivery.sendImmediate({
        recipientUserId: payload.recipientUserId,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        actionLabel: payload.actionLabel,
      });

      // P1-C3 §2.1.5: notification.send.complete telemetry
      logger.trackEvent('notification.send.complete', {
        notificationType: 'email',
        correlationId,
        durationMs: Date.now() - startMs,
        tier: 'email',
        recipientCount: 1,
      });

      logger.info('SendNotificationEmail: sent', {
        type: payload.type,
        recipientUserId: payload.recipientUserId,
      });
    } catch (err) {
      // P1-C3 §2.1.5: notification.send.error telemetry
      logger.trackEvent('notification.send.error', {
        notificationType: 'email',
        correlationId,
        durationMs: Date.now() - startMs,
        errorCode: err instanceof Error && 'code' in err ? (err as Record<string, unknown>).code : 'UNKNOWN',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
});
