import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HbcDataAccessError } from '../errors/index.js';
import {
  DEFAULT_RETRY_POLICY,
  READ_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  withRetry,
} from './retry-policy.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RetryPolicy types and defaults', () => {
  it('DEFAULT_RETRY_POLICY has expected shape', () => {
    expect(DEFAULT_RETRY_POLICY.maxAttempts).toBe(3);
    expect(DEFAULT_RETRY_POLICY.initialDelayMs).toBe(500);
    expect(DEFAULT_RETRY_POLICY.backoffFactor).toBe(2.0);
    expect(DEFAULT_RETRY_POLICY.maxDelayMs).toBe(10_000);
    expect(DEFAULT_RETRY_POLICY.jitterFactor).toBe(0.5);
    expect(DEFAULT_RETRY_POLICY.maxTotalDurationMs).toBe(30_000);
    expect(DEFAULT_RETRY_POLICY.retryableErrors.has('NETWORK_ERROR')).toBe(true);
    expect(DEFAULT_RETRY_POLICY.retryableErrors.has('TIMEOUT')).toBe(true);
    expect(DEFAULT_RETRY_POLICY.retryableErrors.has('SERVER_ERROR')).toBe(true);
  });

  it('READ_RETRY_POLICY has 5 maxAttempts', () => {
    expect(READ_RETRY_POLICY.maxAttempts).toBe(5);
    expect(READ_RETRY_POLICY.initialDelayMs).toBe(DEFAULT_RETRY_POLICY.initialDelayMs);
  });

  it('WRITE_RETRY_POLICY has 2 maxAttempts', () => {
    expect(WRITE_RETRY_POLICY.maxAttempts).toBe(2);
    expect(WRITE_RETRY_POLICY.initialDelayMs).toBe(DEFAULT_RETRY_POLICY.initialDelayMs);
  });
});

describe('withRetry()', () => {
  it('resolves immediately on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('retries and succeeds on 2nd attempt', async () => {
    const policy = { ...DEFAULT_RETRY_POLICY, maxAttempts: 2, jitterFactor: 0 };
    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'NETWORK_ERROR'))
      .mockResolvedValueOnce('recovered');

    const promise = withRetry(fn, policy);
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stops retrying on non-retryable error code', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('not found', 'NOT_FOUND'));

    await expect(withRetry(fn)).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('throws last error after maxAttempts exhausted', async () => {
    const policy = { ...DEFAULT_RETRY_POLICY, maxAttempts: 2, jitterFactor: 0 };
    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('fail 1', 'SERVER_ERROR'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail 2', 'SERVER_ERROR'));

    const promise = withRetry(fn, policy);
    // Attach rejection handler before advancing timers to avoid unhandled rejection
    const caughtPromise = promise.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(5000);
    const error = await caughtPromise as Error;
    expect(error).toBeInstanceOf(HbcDataAccessError);
    expect(error.message).toBe('fail 2');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('applies exponential backoff with ceiling', async () => {
    const policy = {
      ...DEFAULT_RETRY_POLICY,
      maxAttempts: 4,
      initialDelayMs: 100,
      backoffFactor: 2.0,
      maxDelayMs: 500,
      jitterFactor: 0,
    };

    const delays: number[] = [];
    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'TIMEOUT'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'TIMEOUT'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'TIMEOUT'))
      .mockResolvedValueOnce('ok');

    const onRetry = (_attempt: number, _error: Error, delayMs: number) => {
      delays.push(delayMs);
    };

    const promise = withRetry(fn, policy, onRetry);
    await vi.advanceTimersByTimeAsync(2000);
    const result = await promise;

    expect(result).toBe('ok');
    // attempt 0 fail → delay 100 (100 × 2^0)
    // attempt 1 fail → delay 200 (100 × 2^1)
    // attempt 2 fail → delay 400 (100 × 2^2)
    expect(delays[0]).toBe(100);
    expect(delays[1]).toBe(200);
    expect(delays[2]).toBe(400);
  });

  it('calls onRetry callback with attempt, error, delay', async () => {
    const policy = { ...DEFAULT_RETRY_POLICY, maxAttempts: 2, jitterFactor: 0 };
    const onRetry = vi.fn();
    const error = new HbcDataAccessError('boom', 'NETWORK_ERROR');

    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('ok');

    const promise = withRetry(fn, policy, onRetry);
    await vi.advanceTimersByTimeAsync(1000);
    await promise;

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith(1, error, 500);
  });

  it('uses DEFAULT_RETRY_POLICY when not provided', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'SERVER_ERROR'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'SERVER_ERROR'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail', 'SERVER_ERROR'));

    // DEFAULT has maxAttempts=3, so all 3 attempts fail → throws
    const promise = withRetry(fn);
    const caughtPromise = promise.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(60_000);
    const error = await caughtPromise as Error;
    expect(error).toBeInstanceOf(HbcDataAccessError);
    expect(error.message).toBe('fail');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects maxTotalDurationMs ceiling', async () => {
    const policy = {
      ...DEFAULT_RETRY_POLICY,
      maxAttempts: 10,
      initialDelayMs: 15_000,
      backoffFactor: 2.0,
      maxDelayMs: 50_000,
      maxTotalDurationMs: 20_000,
      jitterFactor: 0,
    };

    const fn = vi.fn()
      .mockRejectedValueOnce(new HbcDataAccessError('fail 1', 'TIMEOUT'))
      .mockRejectedValueOnce(new HbcDataAccessError('fail 2', 'TIMEOUT'))
      .mockResolvedValueOnce('never reached');

    const promise = withRetry(fn, policy);
    // Attach handler before advancing to prevent unhandled rejection
    const caughtPromise = promise.catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(30_000);
    const error = await caughtPromise as Error;
    expect(error).toBeInstanceOf(HbcDataAccessError);
    expect(error.message).toBe('fail 2');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
