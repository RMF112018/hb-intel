/**
 * SF10-T08: MarkRead — HTTP PATCH /api/notifications/{id}/read
 * Marks a single notification as read.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { notificationStore } from './lib/notificationStore.js';

app.http('MarkRead', {
  methods: ['PATCH'],
  route: 'notifications/{id}/read',
  authLevel: 'anonymous',
  handler: withAuth(withTelemetry(async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(req);

    const id = req.params.id;
    if (!id) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Missing notification id', requestId);
    }

    await notificationStore.markRead(id);

    logger.info('MarkRead: completed', { notificationId: id });

    return successResponse({ message: 'Notification marked as read.' });
  }, { domain: 'notifications', operation: 'MarkRead' })),
});
