/**
 * SF10-T08: MarkAllRead — HTTP POST /api/notifications/mark-all-read
 * Marks all notifications as read for the authenticated user, optionally filtered by tier.
 */

import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import type { NotificationTier } from '@hbc/notification-intelligence';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createLogger } from '../../utils/logger.js';
import { notificationStore } from './lib/notificationStore.js';

const VALID_TIERS = new Set<string>(['immediate', 'watch', 'digest']);

app.http('MarkAllRead', {
  methods: ['POST'],
  route: 'notifications/mark-all-read',
  authLevel: 'anonymous',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);

    let claims;
    try {
      claims = await validateToken(req);
    } catch {
      return unauthorizedResponse('Invalid token');
    }

    let tier: NotificationTier | undefined;
    try {
      const body = (await req.json()) as { tier?: string };
      if (body.tier) {
        if (!VALID_TIERS.has(body.tier)) {
          return { status: 400, jsonBody: { error: `Invalid tier: ${body.tier}` } };
        }
        tier = body.tier as NotificationTier;
      }
    } catch {
      // No body or invalid JSON — mark all tiers
    }

    await notificationStore.markAllRead(claims.oid, tier);

    logger.info('MarkAllRead: completed', { userId: claims.oid, tier: tier ?? 'all' });

    return { status: 200, jsonBody: { message: 'All notifications marked as read.' } };
  },
});
