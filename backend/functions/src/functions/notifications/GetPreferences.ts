/**
 * SF10-T08: GetPreferences — HTTP GET /api/notifications/preferences
 * Returns notification preferences for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { withAuth } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createLogger } from '../../utils/logger.js';
import { successResponse } from '../../utils/response-helpers.js';
import { preferencesStore } from './lib/preferencesStore.js';

app.http('GetPreferences', {
  methods: ['GET'],
  route: 'notifications/preferences',
  authLevel: 'anonymous',
  handler: withAuth(withTelemetry(async (req: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    const preferences = await preferencesStore.getOrDefault(auth.claims.oid);

    logger.info('GetPreferences: returned', { userId: auth.claims.oid });

    return successResponse(preferences);
  }, { domain: 'notifications', operation: 'GetPreferences' })),
});
