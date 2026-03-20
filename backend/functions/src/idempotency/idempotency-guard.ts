/**
 * P1-D1 Task 2.2b: Idempotency check and record helpers.
 *
 * `checkIdempotency` — fail-open cache lookup; returns a cached HttpResponse
 * when a prior successful execution exists, or null to allow normal execution.
 *
 * `recordIdempotencyResult` — fire-and-forget persistence of a completed
 * response; errors are logged but never propagate to the caller.
 *
 * Both helpers integrate with the ILogger interface for telemetry continuity.
 */

import type { HttpRequest, HttpResponseInit } from '@azure/functions';
import type { IIdempotencyStorageService } from '../services/idempotency-storage-service.js';
import type { ILogger } from '../utils/logger.js';

const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const IDEMPOTENCY_OP_HEADER = 'X-Idempotency-Operation';

/** Default idempotency record TTL: 24 hours in milliseconds. */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/** R5: Maximum byte size for cached response bodies (32 KB). */
const MAX_RESPONSE_BODY_BYTES = 32_768;

/** Replace oversized response bodies with a truncation marker. */
function capResponseBody(body: string): string {
  const sizeBytes = Buffer.byteLength(body, 'utf8');
  if (sizeBytes <= MAX_RESPONSE_BODY_BYTES) return body;
  return JSON.stringify({
    _idempotencyTruncated: true,
    message: 'Original response body exceeded 32KB idempotency storage cap',
    originalSizeBytes: sizeBytes,
  });
}

// ---------------------------------------------------------------------------
// checkIdempotency
// ---------------------------------------------------------------------------

/**
 * Look up a cached response for the given idempotency key + operation.
 *
 * Fail-open: any storage error is caught and logged; the caller proceeds
 * with normal execution as if the key was not found.
 *
 * @returns A cached `HttpResponseInit` if the key was previously recorded,
 *   or `null` to continue normal handler execution.
 */
export async function checkIdempotency(
  request: HttpRequest,
  service: IIdempotencyStorageService,
  logger: ILogger,
): Promise<HttpResponseInit | null> {
  const key = request.headers.get(IDEMPOTENCY_KEY_HEADER);
  const operation = request.headers.get(IDEMPOTENCY_OP_HEADER);

  if (!key || !operation) return null;

  try {
    const record = await service.getRecord(operation, key);
    if (!record) return null;

    logger.trackEvent('idempotency.cache.hit', { operation, key });

    return {
      status: record.statusCode,
      body: record.responseBodyJson,
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Cache': 'hit' },
    };
  } catch (err) {
    // Fail-open: log the error but allow normal execution to proceed.
    logger.trackEvent('idempotency.cache.error', {
      operation: operation ?? 'unknown',
      key: key ?? 'unknown',
      errorMessage: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// recordIdempotencyResult
// ---------------------------------------------------------------------------

/**
 * Persist the response of a completed write handler for future idempotency hits.
 *
 * Non-blocking: the returned Promise is intentionally not awaited by callers.
 * Storage errors are caught and logged; they never surface to the HTTP response.
 *
 * Only records 2xx responses — errors must not be cached.
 */
export function recordIdempotencyResult(
  request: HttpRequest,
  statusCode: number,
  responseBody: string,
  upn: string,
  service: IIdempotencyStorageService,
  logger: ILogger,
): void {
  const key = request.headers.get(IDEMPOTENCY_KEY_HEADER);
  const operation = request.headers.get(IDEMPOTENCY_OP_HEADER);

  if (!key || !operation) return;
  // Only cache successful responses.
  if (statusCode < 200 || statusCode >= 300) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_TTL_MS);

  service
    .saveRecord({
      partitionKey: operation,
      rowKey: key,
      statusCode,
      responseBodyJson: capResponseBody(responseBody),
      expiresAt: expiresAt.toISOString(),
      recordedAt: now.toISOString(),
      recordedBy: upn,
    })
    .catch((err: unknown) => {
      logger.trackEvent('idempotency.record.error', {
        operation,
        key,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    });
}
