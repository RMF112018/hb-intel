export interface IRetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  isTransient?: (error: unknown) => boolean;
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
  const { maxAttempts = 3, baseDelayMs = 2000, isTransient = DEFAULT_TRANSIENT } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isTransient(err)) {
        throw err;
      }
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
