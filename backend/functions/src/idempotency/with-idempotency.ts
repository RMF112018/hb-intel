/**
 * P1-D1 Task 2.2c: withIdempotency handler wrapper.
 *
 * Wraps an Azure Functions HTTP handler at `app.http()` registration time to
 * provide automatic idempotency deduplication for write operations.
 *
 * Composition pattern:
 *   `handler: withIdempotency(withAuth(withTelemetry(handler, meta)))`
 *
 * On each request:
 *   1. Extracts `Idempotency-Key` and `X-Idempotency-Operation` headers.
 *   2. If both present, checks for a cached response (fail-open).
 *   3. On cache hit → returns cached response immediately.
 *   4. On cache miss → calls the inner handler normally.
 *   5. Non-blocking: records the successful response for future deduplication.
 *
 * If the request does not include idempotency headers, passes through unchanged.
 */

import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { createLogger } from '../utils/logger.js';
import { createServiceFactory } from '../services/service-factory.js';
import { checkIdempotency, recordIdempotencyResult } from './idempotency-guard.js';

type AzureHandler = (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>;

/**
 * Wrap an Azure Functions HTTP handler with idempotency deduplication.
 *
 * @param handler - The inner handler (typically `withAuth(withTelemetry(fn, meta))`)
 * @returns A new handler with idempotency logic applied
 */
export function withIdempotency(handler: AzureHandler): AzureHandler {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const services = createServiceFactory();

    // Step 1: Check for cached response.
    const cached = await checkIdempotency(request, services.idempotency, logger);
    if (cached) {
      return cached;
    }

    // Step 2: Execute the inner handler.
    const response = await handler(request, context);

    // Step 3: Non-blocking record for future deduplication.
    // UPN is set to 'system' for Phase 1; audit trail is captured by withAuth telemetry.
    const bodyStr = typeof response.body === 'string' ? response.body : JSON.stringify(response.body ?? null);
    recordIdempotencyResult(
      request,
      response.status ?? 200,
      bodyStr,
      'system',
      services.idempotency,
      logger,
    );

    return response;
  };
}
