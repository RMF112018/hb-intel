/**
 * P1-D1 Step 1: Retry policy types and withRetry higher-order function.
 *
 * Provides exponential backoff with jitter, Retry-After header honoring,
 * max total duration ceiling, and per-operation policy selection.
 * All other D1 retry infrastructure composes on these primitives.
 */

import { HbcDataAccessError } from '../errors/index.js';

// ---------------------------------------------------------------------------
// RetryPolicy interface
// ---------------------------------------------------------------------------

export interface RetryPolicy {
  /** Total attempts including the initial call. Minimum 1 (= no retry). */
  maxAttempts: number;
  /** Delay before the first retry in milliseconds. */
  initialDelayMs: number;
  /** Multiplier applied to delay on each subsequent retry (e.g., 2.0). */
  backoffFactor: number;
  /** Maximum delay for any single retry in milliseconds. */
  maxDelayMs: number;
  /** Jitter factor (0.0–1.0). Randomizes delay to prevent retry storms. */
  jitterFactor: number;
  /** Abort retrying if cumulative delay would exceed this in milliseconds. */
  maxTotalDurationMs: number;
  /** HbcDataAccessError codes that are eligible for retry. */
  retryableErrors: Set<string>;
}

// ---------------------------------------------------------------------------
// Retryable error codes
// ---------------------------------------------------------------------------

const RETRYABLE_ERROR_CODES = new Set([
  'NETWORK_ERROR',
  'TIMEOUT',
  'SERVER_ERROR',
]);

// ---------------------------------------------------------------------------
// Pre-configured policies
// ---------------------------------------------------------------------------

/** General-purpose retry policy. 3 attempts, exponential backoff with jitter. */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffFactor: 2.0,
  maxDelayMs: 10_000,
  jitterFactor: 0.5,
  maxTotalDurationMs: 30_000,
  retryableErrors: RETRYABLE_ERROR_CODES,
};

/** Read-optimized policy. 5 attempts — reads are idempotent, retry more aggressively. */
export const READ_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 5,
};

/** Write-optimized policy. 2 attempts — writes rely on idempotency keys, minimize retries. */
export const WRITE_RETRY_POLICY: RetryPolicy = {
  ...DEFAULT_RETRY_POLICY,
  maxAttempts: 2,
};

// ---------------------------------------------------------------------------
// withRetry HOF
// ---------------------------------------------------------------------------

/**
 * Compute retry delay with bounded exponential backoff and jitter.
 *
 * Formula: `min(initialDelayMs × backoffFactor^attempt × (1 - jitter/2 + random(jitter)), maxDelayMs)`
 */
function computeDelay(attempt: number, policy: RetryPolicy): number {
  const base = policy.initialDelayMs * Math.pow(policy.backoffFactor, attempt);
  const jitterMin = 1 - policy.jitterFactor / 2;
  const jitterRange = policy.jitterFactor;
  const jittered = base * (jitterMin + Math.random() * jitterRange);
  return Math.min(jittered, policy.maxDelayMs);
}

/**
 * Check if an error carries an optional `retryAfterMs` hint (e.g., from a 429/503 Retry-After header).
 * Uses duck-typing to avoid modifying the HbcDataAccessError hierarchy.
 */
function getRetryAfterMs(error: unknown): number | undefined {
  if (
    error !== null &&
    typeof error === 'object' &&
    'retryAfterMs' in error &&
    typeof (error as Record<string, unknown>).retryAfterMs === 'number'
  ) {
    return (error as Record<string, unknown>).retryAfterMs as number;
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry logic.
 *
 * Retries on errors whose `code` is in `policy.retryableErrors`.
 * Non-retryable errors throw immediately. After exhausting attempts or
 * exceeding `maxTotalDurationMs`, the last error is thrown.
 *
 * @param fn - Async function to execute (called on each attempt)
 * @param policy - Retry configuration (defaults to DEFAULT_RETRY_POLICY)
 * @param onRetry - Optional callback invoked before each retry delay
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  onRetry?: (attempt: number, error: Error, delayMs: number) => void,
): Promise<T> {
  let lastError: Error | undefined;
  let cumulativeDelayMs = 0;

  for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Non-retryable errors throw immediately
      const code = err instanceof HbcDataAccessError ? err.code : undefined;
      if (!code || !policy.retryableErrors.has(code)) {
        throw lastError;
      }

      // Last attempt — no more retries
      if (attempt + 1 >= policy.maxAttempts) {
        break;
      }

      // Compute delay
      let delayMs = computeDelay(attempt, policy);

      // Honor Retry-After hint if present
      const retryAfter = getRetryAfterMs(err);
      if (retryAfter !== undefined) {
        delayMs = Math.max(delayMs, retryAfter);
      }

      // Check total duration ceiling
      if (cumulativeDelayMs + delayMs > policy.maxTotalDurationMs) {
        break;
      }

      onRetry?.(attempt + 1, lastError, delayMs);
      cumulativeDelayMs += delayMs;
      await sleep(delayMs);
    }
  }

  throw lastError!;
}
