/**
 * P1-C3 Step 3: Handler lifecycle telemetry wrapper.
 *
 * Emits `handler.invoke`, `handler.success`, and `handler.error` custom events
 * with domain/operation metadata, correlation ID, duration, and status code.
 * Composes inside `withAuth`: `withAuth(withTelemetry(handler, meta))`.
 */

import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import type { AuthContext } from '../middleware/auth.js';
import { extractOrGenerateRequestId } from '../middleware/request-id.js';
import { createLogger } from './logger.js';

/** Metadata for telemetry events, passed per-handler at registration time. */
export interface TelemetryMeta {
  /** Domain area (e.g., 'leads', 'projects', 'provisioningSaga'). */
  domain: string;
  /** Operation name matching the app.http() registration (e.g., 'getLeads', 'createProject'). */
  operation: string;
}

const environment = process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? 'Development';

/**
 * Wraps an authenticated handler with lifecycle telemetry events.
 *
 * Emits:
 * - `handler.invoke` on entry
 * - `handler.success` on successful return (with durationMs and statusCode)
 * - `handler.error` on exception (with durationMs, errorCode, errorMessage), then re-throws
 */
export function withTelemetry(
  handler: (request: HttpRequest, context: InvocationContext, auth: AuthContext) => Promise<HttpResponseInit>,
  meta: TelemetryMeta,
): (request: HttpRequest, context: InvocationContext, auth: AuthContext) => Promise<HttpResponseInit> {
  return async (request: HttpRequest, context: InvocationContext, auth: AuthContext): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const startMs = Date.now();
    const correlationId = extractOrGenerateRequestId(request);

    logger.trackEvent('handler.invoke', {
      ...meta,
      correlationId,
      method: request.method ?? 'UNKNOWN',
      environment,
    });

    try {
      const result = await handler(request, context, auth);

      logger.trackEvent('handler.success', {
        ...meta,
        correlationId,
        durationMs: Date.now() - startMs,
        statusCode: result.status ?? 200,
      });

      return result;
    } catch (err) {
      logger.trackEvent('handler.error', {
        ...meta,
        correlationId,
        durationMs: Date.now() - startMs,
        errorCode: err instanceof Error && 'code' in err ? (err as Record<string, unknown>).code : 'unknown',
        errorMessage: err instanceof Error ? err.message : String(err),
      });

      throw err;
    }
  };
}
