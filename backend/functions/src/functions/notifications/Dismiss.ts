/**
 * SF10-T08: Dismiss — HTTP PATCH /api/notifications/{id}/dismiss
 * Dismisses a single notification.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { notificationStore } from './lib/notificationStore.js';

app.http('Dismiss', {
  methods: ['PATCH'],
  route: 'notifications/{id}/dismiss',
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

    await notificationStore.dismiss(id);

    logger.info('Dismiss: completed', { notificationId: id });

    return { status: 200, jsonBody: { message: 'Notification dismissed.' } };
  },
});
