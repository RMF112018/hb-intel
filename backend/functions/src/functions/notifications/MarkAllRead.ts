/**
 * SF10-T08: MarkAllRead — HTTP POST /api/notifications/mark-all-read
 * Marks all notifications as read for the authenticated user, optionally filtered by tier.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { NotificationTier } from '@hbc/notification-intelligence';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { notificationStore } from './lib/notificationStore.js';

const VALID_TIERS = new Set<string>(['immediate', 'watch', 'digest']);

app.http('MarkAllRead', {
  methods: ['POST'],
  route: 'notifications/mark-all-read',
  authLevel: 'anonymous',
  handler: withAuth(async (req: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(req);

    let tier: NotificationTier | undefined;
    try {
      const body = (await req.json()) as { tier?: string };
      if (body.tier) {
        if (!VALID_TIERS.has(body.tier)) {
          return errorResponse(400, 'VALIDATION_ERROR', `Invalid tier: ${body.tier}`, requestId);
        }
        tier = body.tier as NotificationTier;
      }
    } catch {
      // No body or invalid JSON — mark all tiers
    }

    await notificationStore.markAllRead(auth.claims.oid, tier);

    logger.info('MarkAllRead: completed', { userId: auth.claims.oid, tier: tier ?? 'all' });

    return successResponse({ message: 'All notifications marked as read.' });
  }),
});
