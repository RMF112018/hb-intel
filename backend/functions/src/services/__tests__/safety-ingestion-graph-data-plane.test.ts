import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GraphBoundedQueryTruncatedError,
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

describe('SafetyIngestionGraphDataPlane bounded single-page queries', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makePlane() {
    return new SafetyIngestionGraphDataPlane({
      acquireAppToken: vi.fn().mockResolvedValue('token'),
      getSharePointToken: vi.fn(),
    });
  }

  it('returns rows from a single bounded page without following @odata.nextLink', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [
              { id: '1', fields: { ProjectNumber: '2026-100' } },
              { id: '2', fields: { ProjectNumber: '2026-100' } },
            ],
          }),
          { status: 200 },
        ),
      );

    const rows = await plane.listItemsBounded(
      'https://contoso.sharepoint.com/sites/Safety',
      'list-1',
      {
        filter: `fields/ReportingPeriodIdLookupId eq 14 and fields/ProjectNumber eq '2026-100'`,
        top: 500,
      },
      'duplicate-detection-inspections',
    );

    expect(rows).toHaveLength(2);
    // Exactly 2 graph calls: resolve-site + the single bounded page.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('throws GraphBoundedQueryTruncatedError when Graph returns @odata.nextLink', async () => {
    const plane = makePlane();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'site-1' }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            value: [{ id: '1', fields: {} }],
            '@odata.nextLink': 'https://graph.microsoft.com/v1.0/sites/site-1/lists/list-1/items?$skiptoken=x',
          }),
          { status: 200 },
        ),
      );

    const error = await plane
      .listItemsBounded(
        'https://contoso.sharepoint.com/sites/Safety',
        'list-1',
        { filter: `fields/ProjectNumber eq 'X'`, top: 500 },
        'duplicate-detection-inspections',
      )
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(GraphBoundedQueryTruncatedError);
    expect((error as GraphBoundedQueryTruncatedError).contractId).toBe('duplicate-detection-inspections');
    // Bounded query must not follow nextLink — one page request only.
    expect(fetchSpy).toHaveBeenCalledTimes(2);
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
