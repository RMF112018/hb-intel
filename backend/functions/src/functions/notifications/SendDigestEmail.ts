/**
 * SF10-T08: SendDigestEmail — Timer trigger
 * Runs every hour; for each user whose digestDay/digestHour matches
 * the current UTC time, queries their unread Digest items
 * and sends a SendGrid digest email.
 *
 * D-06: Azure Timer Function for digest aggregation.
 */

import { app, type Timer, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import { preferencesStore } from './lib/preferencesStore.js';
import { notificationStore } from './lib/notificationStore.js';
import { emailDelivery } from './lib/emailDelivery.js';
import { createLogger } from '../../utils/logger.js';

app.timer('SendDigestEmail', {
  schedule: '0 0 * * * *', // Top of every hour
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const startMs = Date.now();
    const correlationId = randomUUID();
    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentHour = now.getUTCHours();

    // Find users whose digest is due this hour
    const dueUsers = await preferencesStore.getUsersWithDigestDue(currentDay, currentHour);

    // P1-C3 §2.1.5: notification.digest.trigger telemetry
    logger.trackEvent('notification.digest.trigger', {
      correlationId,
      pendingCount: dueUsers.length,
      day: currentDay,
      hour: currentHour,
    });

    try {
      let processedCount = 0;
      for (const prefs of dueUsers) {
        const digestItems = await notificationStore.getUnreadDigestItems(prefs.userId);
        if (digestItems.length === 0) continue;

        await emailDelivery.sendDigest({
          recipientUserId: prefs.userId,
          items: digestItems,
        });

        await notificationStore.markDigestSent(
          prefs.userId,
          digestItems.map((i) => i.id),
        );

        processedCount++;
      }

      // P1-C3 §2.1.5: notification.digest.complete telemetry
      logger.trackEvent('notification.digest.complete', {
        correlationId,
        durationMs: Date.now() - startMs,
        processedCount,
        dueUsers: dueUsers.length,
      });

      logger.info('SendDigestEmail: completed', {
        dueUsers: dueUsers.length,
        processedUsers: processedCount,
        day: currentDay,
        hour: currentHour,
      });
    } catch (err) {
      // P1-C3 §2.1.5: notification.digest.error telemetry
      logger.trackEvent('notification.digest.error', {
        correlationId,
        durationMs: Date.now() - startMs,
        errorCode: err instanceof Error && 'code' in err ? (err as Record<string, unknown>).code : 'UNKNOWN',
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
});
