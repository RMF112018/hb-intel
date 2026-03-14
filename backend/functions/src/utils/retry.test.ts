import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from './retry.js';

/**
 * W0-G2-T09: withRetry retry behavior tests.
 * TC-FAIL-01 through TC-FAIL-03 + supplemental coverage.
 */
describe('W0-G2-T09: withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('TC-FAIL-01: respects Retry-After header on 429 response', async () => {
    const delays: number[] = [];
    const error429 = Object.assign(new Error('429 Too Many Requests'), {
      response: {
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '2' : null),
        },
      },
    });

    let callCount = 0;
    const fn = vi.fn(async () => {
      callCount++;
      if (callCount === 1) throw error429;
      return 'ok';
    });

    const promise = withRetry(fn, {
      maxAttempts: 3,
      baseDelayMs: 500,
      onRetry: (_err, _attempt, delayMs) => {
        delays.push(delayMs);
      },
    });

    // Advance past the Retry-After delay (2000ms > baseDelayMs * 2^0 = 500ms)
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    // Retry-After: 2 → 2000ms, which is > baseDelayMs * 2^0 = 500ms
    expect(delays[0]).toBeGreaterThanOrEqual(2000);
  });

  it('TC-FAIL-02: exponential backoff without Retry-After', async () => {
    const delays: number[] = [];
    const baseDelayMs = 100;
    let callCount = 0;

    const fn = vi.fn(async () => {
      callCount++;
      if (callCount <= 2) throw new Error('429 transient');
      return 'success';
    });

    const promise = withRetry(fn, {
      maxAttempts: 4,
      baseDelayMs,
      onRetry: (_err, _attempt, delayMs) => {
        delays.push(delayMs);
      },
    });

    // Advance through both retry delays
    await vi.advanceTimersByTimeAsync(baseDelayMs); // attempt 1 retry: 100ms
    await vi.advanceTimersByTimeAsync(baseDelayMs * 2); // attempt 2 retry: 200ms
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
    // Delay 1: baseDelayMs * 2^0 = 100, Delay 2: baseDelayMs * 2^1 = 200
    expect(delays[0]).toBe(baseDelayMs * Math.pow(2, 0));
    expect(delays[1]).toBe(baseDelayMs * Math.pow(2, 1));
  });

  it('TC-FAIL-03: exhausts maxAttempts and throws', async () => {
    // Use real timers with minimal delay to avoid unhandled rejection warnings
    // that occur when fake timers and async rejection interact.
    vi.useRealTimers();

    const fn = vi.fn(async () => {
      throw new Error('429 persistent failure');
    });

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10 })
    ).rejects.toThrow('429 persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);

    // Restore fake timers for remaining tests
    vi.useFakeTimers();
  });

  it('succeeds on second attempt', async () => {
    let callCount = 0;
    const fn = vi.fn(async () => {
      callCount++;
      if (callCount === 1) throw new Error('429 transient');
      return 42;
    });

    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 50 });
    await vi.advanceTimersByTimeAsync(50);
    const result = await promise;

    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-transient errors', async () => {
    const fn = vi.fn(async () => {
      throw new Error('non-transient validation error');
    });

    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 50 });

    await expect(promise).rejects.toThrow('non-transient validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
