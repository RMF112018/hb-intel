import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GraphConcurrencyError,
  GraphRequestError,
  SafetyIngestionGraphDataPlane,
  assertSafetyGraphEtag,
} from '../safety-ingestion-graph-data-plane.js';

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

describe('SafetyIngestionGraphDataPlane concurrency semantics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makePlane() {
    return new SafetyIngestionGraphDataPlane({
      acquireAppToken: vi.fn().mockResolvedValue('token'),
      getSharePointToken: vi.fn(),
    });
  }

  it('sends If-Match and succeeds when server accepts the PATCH', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await plane.updateItemWithConcurrency(
      'https://contoso.sharepoint.com/sites/Safety',
      'list-1',
      42,
      { Title: 'x' },
      '"etag-abc"',
    );

    const [, patchInit] = fetchSpy.mock.calls[1]!;
    expect((patchInit as RequestInit).method).toBe('PATCH');
    const headers = (patchInit as RequestInit).headers as Record<string, string>;
    expect(headers['If-Match']).toBe('"etag-abc"');
  });

  it('throws a typed GraphConcurrencyError on 412 responses', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('precondition failed', { status: 412 }));

    await expect(
      plane.updateItemWithConcurrency(
        'https://contoso.sharepoint.com/sites/Safety',
        'list-1',
        42,
        { Title: 'x' },
        '"etag-abc"',
      ),
    ).rejects.toBeInstanceOf(GraphConcurrencyError);
  });

  it('throws a typed GraphConcurrencyError on 409 responses', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('conflict', { status: 409 }));

    await expect(
      plane.updateItemWithConcurrency(
        'https://contoso.sharepoint.com/sites/Safety',
        'list-1',
        42,
        { Title: 'x' },
        '"etag-abc"',
      ),
    ).rejects.toBeInstanceOf(GraphConcurrencyError);
  });

  it('escalates non-concurrency failures as plain GraphRequestError', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('bad request', { status: 400 }));

    const error = await plane
      .updateItemWithConcurrency(
        'https://contoso.sharepoint.com/sites/Safety',
        'list-1',
        42,
        { Title: 'x' },
        '"etag-abc"',
      )
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GraphRequestError);
    expect(error).not.toBeInstanceOf(GraphConcurrencyError);
  });

  it('rejects blind PATCH via the concurrency API when ETag is missing', async () => {
    const plane = makePlane();
    await expect(
      plane.updateItemWithConcurrency(
        'https://contoso.sharepoint.com/sites/Safety',
        'list-1',
        42,
        { Title: 'x' },
        '' as string,
      ),
    ).rejects.toThrow(/missing or empty ETag/i);
  });
});

describe('assertSafetyGraphEtag invariant', () => {
  it('throws when etag is empty', () => {
    expect(() => assertSafetyGraphEtag('', 'ctx')).toThrow(/missing or empty ETag/i);
  });

  it('throws when etag is undefined', () => {
    expect(() => assertSafetyGraphEtag(undefined, 'ctx')).toThrow(/missing or empty ETag/i);
  });

  it('passes when etag is a non-empty string', () => {
    expect(() => assertSafetyGraphEtag('"etag"', 'ctx')).not.toThrow();
  });
});
