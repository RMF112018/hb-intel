/**
 * SF10-T08: MarkRead — HTTP PATCH /api/notifications/{id}/read
 * Marks a single notification as read.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { notificationStore } from './lib/notificationStore.js';

app.http('MarkRead', {
  methods: ['PATCH'],
  route: 'notifications/{id}/read',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    try {
      await validateToken(req);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const id = req.params.id;
    if (!id) {
      return { status: 400, jsonBody: { error: 'Missing notification id' } };
    }

    await notificationStore.markRead(id);

    logger.info('MarkRead: completed', { notificationId: id });

    return { status: 200, jsonBody: { message: 'Notification marked as read.' } };
  },
});
