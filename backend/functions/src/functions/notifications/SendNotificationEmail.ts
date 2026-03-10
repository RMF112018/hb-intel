/**
 * SF10-T08: SendNotificationEmail — Queue trigger on hbc-email-queue
 * Parses the email message and sends via emailDelivery adapter.
 */

import { app, type InvocationContext } from '@azure/functions';
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
    const payload = JSON.parse(message as string) as EmailQueueMessage;

    await emailDelivery.sendImmediate({
      recipientUserId: payload.recipientUserId,
      title: payload.title,
      body: payload.body,
      actionUrl: payload.actionUrl,
      actionLabel: payload.actionLabel,
    });

    logger.info('SendNotificationEmail: sent', {
      type: payload.type,
      recipientUserId: payload.recipientUserId,
    });
  },
});
