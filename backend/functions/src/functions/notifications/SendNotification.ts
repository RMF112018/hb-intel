/**
 * SF10-T08: SendNotification — HTTP POST /api/notifications/send
 * Validates the payload and enqueues to hbc-notifications-queue for async processing.
 *
 * SDK-adapted from T08 plan: uses output.storageQueue() binding objects
 * instead of inline extraOutputs with string keys.
 */

import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { NotificationSendPayload } from '@hbc/notification-intelligence';
import { withAuth } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse } from '../../utils/response-helpers.js';

const notificationQueueOutput = output.storageQueue({
  queueName: 'hbc-notifications-queue',
  connection: 'AzureWebJobsStorage',
});

app.http('SendNotification', {
  methods: ['POST'],
  route: 'notifications/send',
  authLevel: 'anonymous',
  extraOutputs: [notificationQueueOutput],
  handler: withAuth(withTelemetry(async (req: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(req);

    let payload: NotificationSendPayload;
    try {
      payload = (await req.json()) as NotificationSendPayload;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!payload.eventType || !payload.recipientUserId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Missing required fields: eventType, recipientUserId', requestId);
    }

    context.extraOutputs.set(notificationQueueOutput, JSON.stringify(payload));

    // P1-C3 §2.1.5: notification.send.enqueue telemetry
    logger.trackEvent('notification.send.enqueue', {
      notificationType: payload.eventType,
      correlationId: requestId,
      recipientUserId: payload.recipientUserId,
    });

    logger.info('SendNotification: enqueued', {
      eventType: payload.eventType,
      recipientUserId: payload.recipientUserId,
      sender: auth.claims.upn,
    });

    // Raw 202 response — fire-and-forget acknowledgment; do NOT wrap in successResponse
    return { status: 202, jsonBody: { message: 'Notification queued.' } };
  }, { domain: 'notifications', operation: 'SendNotification' })),
});
