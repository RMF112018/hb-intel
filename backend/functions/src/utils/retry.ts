export interface IRetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  jitterRatio: number;
  isTransient?: (error: unknown) => boolean;
  onRetry?: (
    error: unknown,
    attempt: number,
    delayMs: number,
    metadata: IRetryDecisionMetadata,
  ) => void;
}

export interface IRetryDecisionMetadata {
  source: 'retry-after-seconds' | 'retry-after-date' | 'x-ms-retry-after-ms' | 'exponential-backoff';
  statusCode?: number;
  retryAfterMs: number;
  baseBackoffMs: number;
  jitterMs: number;
}

const DEFAULT_TRANSIENT: (e: unknown) => boolean = (e) => {
  const status = getErrorStatusCode(e);
  if (status !== undefined) {
    return status === 408 || status === 425 || status === 429 || status >= 500;
  }

  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    return (
      msg.includes('408') ||
      msg.includes('425') ||
      msg.includes('429') ||
      msg.includes('throttl') ||
      msg.includes('too many requests') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('eai_again') ||
      msg.includes('fetch failed')
    );
  }
  return false;
};

/**
 * D-PH6-05: Executes `fn` with exponential backoff retry.
 * Delays: 2s, 4s, 8s (for maxAttempts=3, baseDelayMs=2000).
 * Only retries if `isTransient(error)` returns true.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<IRetryOptions> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 2000,
    jitterRatio = 0.25,
    isTransient = DEFAULT_TRANSIENT,
    onRetry,
  } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        throw err;
      }

      const retryAfter = resolveRetryAfterMs(err);
      const baseBackoff = baseDelayMs * Math.pow(2, attempt - 1);
      const jitterUpperBound = Math.max(0, Math.floor(baseBackoff * jitterRatio));
      const jitterMs = jitterUpperBound > 0
        ? Math.floor(Math.random() * (jitterUpperBound + 1))
        : 0;
      const exponentialDelay = baseBackoff + jitterMs;
      const delay = Math.max(retryAfter.retryAfterMs, exponentialDelay);
      const source =
        retryAfter.retryAfterMs >= exponentialDelay
          ? retryAfter.source
          : 'exponential-backoff';

      onRetry?.(err, attempt, delay, {
        source,
        statusCode: getErrorStatusCode(err),
        retryAfterMs: retryAfter.retryAfterMs,
        baseBackoffMs: baseBackoff,
        jitterMs,
      });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

function getErrorStatusCode(error: unknown): number | undefined {
  const status = (error as { status?: unknown })?.status;
  if (typeof status === 'number' && Number.isFinite(status)) {
    return status;
  }
  const responseStatus = (error as { response?: { status?: unknown } })?.response?.status;
  if (typeof responseStatus === 'number' && Number.isFinite(responseStatus)) {
    return responseStatus;
  }
  return undefined;
}

function getHeaderValue(headers: unknown, name: string): string | null {
  if (!headers) return null;
  const lowerName = name.toLowerCase();
  const maybeHeaders = headers as { get?: (name: string) => string | null };
  if (typeof maybeHeaders.get === 'function') {
    return maybeHeaders.get(name) ?? maybeHeaders.get(lowerName);
  }
  const map = headers as Record<string, unknown>;
  const direct = map[name] ?? map[lowerName];
  return typeof direct === 'string' ? direct : null;
}

function resolveRetryAfterMs(error: unknown): {
  retryAfterMs: number;
  source: 'retry-after-seconds' | 'retry-after-date' | 'x-ms-retry-after-ms' | 'exponential-backoff';
} {
  const headers = (error as { response?: { headers?: unknown } })?.response?.headers;
  const retryAfter = getHeaderValue(headers, 'Retry-After');
  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    if (!Number.isNaN(seconds) && seconds > 0) {
      return {
        retryAfterMs: seconds * 1000,
        source: 'retry-after-seconds',
      };
    }

    const asDate = Date.parse(retryAfter);
    if (!Number.isNaN(asDate)) {
      const ms = Math.max(0, asDate - Date.now());
      if (ms > 0) {
        return {
          retryAfterMs: ms,
          source: 'retry-after-date',
        };
      }
    }
  }

  const retryAfterMsHeader = getHeaderValue(headers, 'x-ms-retry-after-ms');
  if (retryAfterMsHeader) {
    const ms = parseInt(retryAfterMsHeader, 10);
    if (!Number.isNaN(ms) && ms > 0) {
      return {
        retryAfterMs: ms,
        source: 'x-ms-retry-after-ms',
      };
    }
  }

  return {
    retryAfterMs: 0,
    source: 'exponential-backoff',
  };
}
