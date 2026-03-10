/**
 * SF10-T08: SendNotification — HTTP POST /api/notifications/send
 * Validates the payload and enqueues to hbc-notifications-queue for async processing.
 *
 * SDK-adapted from T08 plan: uses output.storageQueue() binding objects
 * instead of inline extraOutputs with string keys.
 */

import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';

const notificationQueueOutput = output.storageQueue({
  queueName: 'hbc-notifications-queue',
  connection: 'AzureWebJobsStorage',
});

app.http('SendNotification', {
  methods: ['POST'],
  route: 'notifications/send',
  authLevel: 'anonymous',
  extraOutputs: [notificationQueueOutput],
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    let claims;
    try {
      claims = await validateToken(req);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let payload: NotificationSendPayload;
    try {
      payload = (await req.json()) as NotificationSendPayload;
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
    }

    if (!payload.eventType || !payload.recipientUserId) {
      return { status: 400, jsonBody: { error: 'Missing required fields: eventType, recipientUserId' } };
    }

    context.extraOutputs.set(notificationQueueOutput, JSON.stringify(payload));

    logger.info('SendNotification: enqueued', {
      eventType: payload.eventType,
      recipientUserId: payload.recipientUserId,
      sender: claims.upn,
    });

    return { status: 202, jsonBody: { message: 'Notification queued.' } };
  },
});
