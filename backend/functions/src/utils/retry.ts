export interface IRetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  isTransient?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const DEFAULT_TRANSIENT: (e: unknown) => boolean = (e) => {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    return (
      msg.includes('429') ||
      msg.includes('throttl') ||
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
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
  const { maxAttempts = 3, baseDelayMs = 2000, isTransient = DEFAULT_TRANSIENT, onRetry } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        throw err;
      }

      // W0-G2-T07: Honor Retry-After header on 429 responses.
      let retryAfterMs = 0;
      const headers = (err as any)?.response?.headers;
      const retryAfterValue = typeof headers?.get === 'function'
        ? headers.get('Retry-After')
        : headers?.['retry-after'];
      if (retryAfterValue) {
        const parsed = parseInt(String(retryAfterValue), 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfterMs = parsed * 1000;
        }
      }

      const delay = Math.max(retryAfterMs, baseDelayMs * Math.pow(2, attempt - 1));
      onRetry?.(err, attempt, delay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
