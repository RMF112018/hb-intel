/**
 * SF10-T08: UpdatePreferences — HTTP PATCH /api/notifications/preferences
 * Updates notification preferences for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { INotificationPreferences } from '@hbc/notification-intelligence';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { preferencesStore } from './lib/preferencesStore.js';

app.http('UpdatePreferences', {
  methods: ['PATCH'],
  route: 'notifications/preferences',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    let claims;
    try {
      claims = await validateToken(req);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let updates: Partial<Omit<INotificationPreferences, 'userId'>>;
    try {
      updates = (await req.json()) as Partial<Omit<INotificationPreferences, 'userId'>>;
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } };
    }

    const updated = await preferencesStore.update(claims.oid, updates);

    logger.info('UpdatePreferences: updated', { userId: claims.oid });

    return { status: 200, jsonBody: updated };
  },
});
