import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyIngestionGraphDataPlane } from '../safety-ingestion-graph-data-plane.js';

describe('SafetyIngestionGraphDataPlane retry telemetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('emits structured retry telemetry with delay source metadata', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response('throttled', {
          status: 429,
          headers: { 'Retry-After': '1' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

    const plane = new SafetyIngestionGraphDataPlane({
      acquireAppToken: vi.fn().mockResolvedValue('token'),
      getSharePointToken: vi.fn(),
    });

    const promise = plane.resolveSiteId('https://contoso.sharepoint.com/sites/Safety');
    await vi.advanceTimersByTimeAsync(5000);
    await expect(promise).resolves.toBe('site-1');

    const retryEvent = logSpy.mock.calls
      .map((call) => JSON.parse(String(call[0])) as Record<string, unknown>)
      .find((payload) => payload.name === 'safety.ingestion.graph.retry');

    expect(retryEvent).toBeDefined();
    expect(['retry-after-seconds', 'exponential-backoff']).toContain(retryEvent?.delaySource);
    expect(retryEvent?.statusCode).toBe(429);
  });
});
