/**
 * SF10-T08: UpdatePreferences — HTTP PATCH /api/notifications/preferences
 * Updates notification preferences for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { INotificationPreferences } from '@hbc/notification-intelligence';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { preferencesStore } from './lib/preferencesStore.js';

app.http('UpdatePreferences', {
  methods: ['PATCH'],
  route: 'notifications/preferences',
  authLevel: 'anonymous',
  handler: withAuth(async (req: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(req);

    let updates: Partial<Omit<INotificationPreferences, 'userId'>>;
    try {
      updates = (await req.json()) as Partial<Omit<INotificationPreferences, 'userId'>>;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    const updated = await preferencesStore.update(auth.claims.oid, updates);

    logger.info('UpdatePreferences: updated', { userId: auth.claims.oid });

    return successResponse(updated);
  }),
});
