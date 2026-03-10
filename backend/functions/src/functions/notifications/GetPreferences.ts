/**
 * SF10-T08: GetPreferences — HTTP GET /api/notifications/preferences
 * Returns notification preferences for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { preferencesStore } from './lib/preferencesStore.js';

app.http('GetPreferences', {
  methods: ['GET'],
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

    const preferences = await preferencesStore.getOrDefault(claims.oid);

    logger.info('GetPreferences: returned', { userId: claims.oid });

    return { status: 200, jsonBody: preferences };
  },
});
