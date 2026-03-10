/**
 * SF10-T08: GetCenter — HTTP GET /api/notifications/center
 * Returns paginated notification center results for the authenticated user.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { INotificationCenterFilter, NotificationTier } from '@hbc/notification-intelligence';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { notificationStore } from './lib/notificationStore.js';

const VALID_TIERS = new Set<string>(['immediate', 'watch', 'digest', 'all']);

app.http('GetCenter', {
  methods: ['GET'],
  route: 'notifications/center',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    let claims;
    try {
      claims = await validateToken(req);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    const tierParam = req.query.get('tier') ?? 'all';
    if (!VALID_TIERS.has(tierParam)) {
      return { status: 400, jsonBody: { error: `Invalid tier: ${tierParam}` } };
    }

    const filter: INotificationCenterFilter = {
      tier: tierParam as NotificationTier | 'all',
      unreadOnly: req.query.get('unreadOnly') === 'true',
      cursor: req.query.get('cursor') ?? undefined,
      pageSize: req.query.get('pageSize') ? parseInt(req.query.get('pageSize')!, 10) : undefined,
    };

    const result = await notificationStore.getCenter(claims.oid, filter);

    logger.info('GetCenter: returned', {
      userId: claims.oid,
      totalCount: result.totalCount,
      pageItems: result.items.length,
    });

    return { status: 200, jsonBody: result };
  },
});
