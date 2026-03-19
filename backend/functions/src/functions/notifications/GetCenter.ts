/**
 * SF10-T08: GetCenter — HTTP GET /api/notifications/center
 * Returns paginated notification center results for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { INotificationCenterFilter, NotificationTier } from '@hbc/notification-intelligence';
import { withAuth } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { notificationStore } from './lib/notificationStore.js';

const VALID_TIERS = new Set<string>(['immediate', 'watch', 'digest', 'all']);

app.http('GetCenter', {
  methods: ['GET'],
  route: 'notifications/center',
  authLevel: 'anonymous',
  handler: withAuth(withTelemetry(async (req: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(req);

    const tierParam = req.query.get('tier') ?? 'all';
    if (!VALID_TIERS.has(tierParam)) {
      return errorResponse(400, 'VALIDATION_ERROR', `Invalid tier: ${tierParam}`, requestId);
    }

    const filter: INotificationCenterFilter = {
      tier: tierParam as NotificationTier | 'all',
      unreadOnly: req.query.get('unreadOnly') === 'true',
      cursor: req.query.get('cursor') ?? undefined,
      pageSize: req.query.get('pageSize') ? parseInt(req.query.get('pageSize')!, 10) : undefined,
    };

    const result = await notificationStore.getCenter(auth.claims.oid, filter);

    logger.info('GetCenter: returned', {
      userId: auth.claims.oid,
      totalCount: result.totalCount,
      pageItems: result.items.length,
    });

    return successResponse(result);
  }, { domain: 'notifications', operation: 'GetCenter' })),
});
