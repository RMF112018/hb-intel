/**
 * P1-D1 Task 2.2d: Nightly idempotency record cleanup timer.
 *
 * Deletes expired idempotency records from Azure Table Storage.
 * Runs daily at 3:00 AM (WEBSITE_TIME_ZONE = Eastern Standard Time).
 *
 * Records with `expiresAt < now` are pruned to keep the table lean.
 * A 24-hour TTL on each record ensures normal operations stay deduplication-safe.
 */

import { app, type InvocationContext, type Timer } from '@azure/functions';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';

app.timer('cleanupIdempotency', {
  schedule: '0 0 3 * * *',
  runOnStartup: false,
  handler: async (_timer: Timer, context: InvocationContext): Promise<void> => {
    const logger = createLogger(context);
    const services = createServiceFactory();
    const before = new Date();

    logger.trackEvent('idempotency.cleanup.start', {
      before: before.toISOString(),
    });

    try {
      await services.idempotency.deleteExpiredRecords(before);
      logger.trackEvent('idempotency.cleanup.success', {
        before: before.toISOString(),
      });
    } catch (err) {
      logger.trackEvent('idempotency.cleanup.error', {
        before: before.toISOString(),
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },
});
