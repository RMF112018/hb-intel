/**
 * P1-D1 Task 2.1: Idempotency key generation and tracking.
 *
 * Provides `IdempotencyContext` for write operations and `generateIdempotencyKey()`
 * to create unique keys with operation context and TTL. Used by `ProxyHttpClient.post()`
 * and `.put()` to send `Idempotency-Key` and `X-Idempotency-Operation` headers.
 */

/** Default idempotency TTL: 24 hours in milliseconds. */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Context for an idempotent write operation.
 * Sent with POST/PUT requests to prevent duplicate side-effects.
 */
export interface IdempotencyContext {
  /** Unique idempotency key (UUID). */
  key: string;
  /** Operation name (e.g., 'create-lead', 'update-project'). */
  operation: string;
  /** Timestamp when the key was generated (Date.now()). */
  createdAt: number;
  /** Timestamp when the key expires (createdAt + TTL). */
  expiresAt: number;
}

/**
 * Generate a new idempotency context for a write operation.
 *
 * @param operation - Semantic operation name (e.g., 'create-lead')
 * @param ttlMs - Time-to-live in milliseconds (default: 24 hours)
 * @returns A fresh `IdempotencyContext` with a unique UUID key
 */
export function generateIdempotencyKey(
  operation: string,
  ttlMs: number = DEFAULT_TTL_MS,
): IdempotencyContext {
  const createdAt = Date.now();
  return {
    key: crypto.randomUUID(),
    operation,
    createdAt,
    expiresAt: createdAt + ttlMs,
  };
}

/**
 * Check whether an idempotency context has expired.
 * Returns true if the current time is at or past the expiry.
 */
export function isExpired(ctx: IdempotencyContext): boolean {
  return Date.now() >= ctx.expiresAt;
}
