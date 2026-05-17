import { describe, expect, it } from 'vitest';
import { createProjectionGraphDeltaClient } from '../my-projects-projection/delta/projection-graph-delta-client.js';
import type { IGraphAccessTokenProvider } from '../legacy-fallback/federated-graph-token-provider.js';

const FAKE_TOKEN = 'fake-bearer-token';
const FAKE_PROVIDER: IGraphAccessTokenProvider = {
  async getGraphAccessToken() {
    return FAKE_TOKEN;
  },
};

interface PlannedResponse {
  readonly status: number;
  readonly body?: unknown;
  readonly throws?: Error;
}

function makeFetch(responses: readonly PlannedResponse[]): {
  fetchImpl: typeof fetch;
  calls: Array<{ url: string; method: string }>;
} {
  const calls: Array<{ url: string; method: string }> = [];
  let index = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({
      url: String(input),
      method: typeof init?.method === 'string' ? init.method : 'GET',
    });
    const planned = responses[index++];
    if (!planned) throw new Error(`Unexpected fetch call ${index}`);
    if (planned.throws) throw planned.throws;
    const allowsBody = planned.status !== 204 && planned.status !== 205 && planned.status !== 304;
    const bodyText =
      !allowsBody || planned.body === undefined ? null : JSON.stringify(planned.body);
    return new Response(bodyText, { status: planned.status });
  };
  return { fetchImpl, calls };
}

describe('ProjectionGraphDeltaClient.acquireInitialDeltaLink', () => {
  it('builds the canonical ?token=latest URL and returns the deltaLink', async () => {
    const { fetchImpl, calls } = makeFetch([
      {
        status: 200,
        body: {
          value: [],
          '@odata.deltaLink': 'https://graph/delta/v1?token=ABC',
        },
      },
    ]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.acquireInitialDeltaLink({ siteId: 'site-1', listId: 'list-1' });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.deltaLink).toBe('https://graph/delta/v1?token=ABC');
    }
    expect(calls[0].url).toBe(
      'https://graph.microsoft.com/v1.0/sites/site-1/lists/list-1/items/delta?token=latest',
    );
    expect(calls[0].method).toBe('GET');
  });

  it('returns invalid-payload when the seed response is missing @odata.deltaLink', async () => {
    const { fetchImpl } = makeFetch([{ status: 200, body: { value: [] } }]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.acquireInitialDeltaLink({ siteId: 'site-1', listId: 'list-1' });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'invalid-payload' });
  });

  it('rejects empty siteId / listId without calling Graph', async () => {
    const { fetchImpl, calls } = makeFetch([]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.acquireInitialDeltaLink({ siteId: '', listId: 'list-1' });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'invalid-payload' });
    expect(calls).toHaveLength(0);
  });
});

describe('ProjectionGraphDeltaClient.drainDelta', () => {
  it('drains a single page of items + tombstones and returns the final deltaLink', async () => {
    const { fetchImpl, calls } = makeFetch([
      {
        status: 200,
        body: {
          value: [
            { id: '1', fields: { foo: 'bar' }, lastModifiedDateTime: '2026-05-17T12:00:00Z' },
            { id: '2', '@removed': { reason: 'deleted' } },
            { id: '3', fields: { baz: 'qux' } },
          ],
          '@odata.deltaLink': 'https://graph/delta/v1?token=NEXT',
        },
      },
    ]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=START',
      maxPages: 10,
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.changedItems.map((item) => item.id)).toEqual(['1', '3']);
      expect(outcome.result.deletedItemIds).toEqual(['2']);
      expect(outcome.result.finalDeltaLink).toBe('https://graph/delta/v1?token=NEXT');
      expect(outcome.result.pageCount).toBe(1);
    }
    expect(calls[0].url).toBe('https://graph/delta/v1?token=START');
  });

  it('follows @odata.nextLink across multiple pages and aggregates results', async () => {
    const { fetchImpl, calls } = makeFetch([
      {
        status: 200,
        body: {
          value: [{ id: 'a' }, { id: 'b', '@removed': { reason: 'deleted' } }],
          '@odata.nextLink': 'https://graph/delta/v1?skip=1',
        },
      },
      {
        status: 200,
        body: {
          value: [{ id: 'c' }],
          '@odata.nextLink': 'https://graph/delta/v1?skip=2',
        },
      },
      {
        status: 200,
        body: {
          value: [{ id: 'd' }],
          '@odata.deltaLink': 'https://graph/delta/v1?token=FINAL',
        },
      },
    ]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?skip=0',
      maxPages: 10,
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.result.changedItems.map((item) => item.id)).toEqual(['a', 'c', 'd']);
      expect(outcome.result.deletedItemIds).toEqual(['b']);
      expect(outcome.result.finalDeltaLink).toBe('https://graph/delta/v1?token=FINAL');
      expect(outcome.result.pageCount).toBe(3);
    }
    expect(calls).toHaveLength(3);
    expect(calls[1].url).toBe('https://graph/delta/v1?skip=1');
    expect(calls[2].url).toBe('https://graph/delta/v1?skip=2');
  });

  it('returns graph-410-gone when the deltaLink is no longer valid', async () => {
    const { fetchImpl } = makeFetch([{ status: 410, body: { error: { code: 'ResyncRequired' } } }]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=STALE',
      maxPages: 10,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'graph-410-gone' });
  });

  it('classifies 403 as graph-403-forbidden (Sites.Read.All consent gate)', async () => {
    const { fetchImpl } = makeFetch([{ status: 403, body: { error: { code: 'Forbidden' } } }]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=X',
      maxPages: 10,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'graph-403-forbidden' });
  });

  it('returns graph-network when fetch throws', async () => {
    const { fetchImpl } = makeFetch([{ status: 0, throws: new Error('ECONNRESET') }]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=X',
      maxPages: 10,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'graph-network' });
  });

  it('returns token-acquisition-failed with sanitized Bearer/JWT', async () => {
    const { fetchImpl } = makeFetch([]);
    const provider: IGraphAccessTokenProvider = {
      async getGraphAccessToken() {
        throw new Error('token-failed: Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH');
      },
    };
    const client = createProjectionGraphDeltaClient({
      tokenProvider: provider,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=X',
      maxPages: 10,
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe('token-acquisition-failed');
      expect(outcome.sanitizedReason).toContain('[REDACTED]');
      expect(outcome.sanitizedReason).not.toContain('eyJabcdef');
    }
  });

  it('returns page-budget-exceeded when nextLink chain exceeds maxPages', async () => {
    const { fetchImpl } = makeFetch([
      {
        status: 200,
        body: {
          value: [],
          '@odata.nextLink': 'https://graph/delta/v1?skip=1',
        },
      },
      {
        status: 200,
        body: {
          value: [],
          '@odata.nextLink': 'https://graph/delta/v1?skip=2',
        },
      },
    ]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?skip=0',
      maxPages: 2,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'page-budget-exceeded' });
  });

  it('returns invalid-payload when a page has neither nextLink nor deltaLink', async () => {
    const { fetchImpl } = makeFetch([{ status: 200, body: { value: [{ id: '1' }] } }]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=X',
      maxPages: 10,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'invalid-payload' });
  });

  it('rejects empty deltaLink without calling Graph', async () => {
    const { fetchImpl, calls } = makeFetch([]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({ deltaLink: '', maxPages: 10 });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'invalid-payload' });
    expect(calls).toHaveLength(0);
  });

  it('rejects non-positive maxPages without calling Graph', async () => {
    const { fetchImpl } = makeFetch([]);
    const client = createProjectionGraphDeltaClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.drainDelta({
      deltaLink: 'https://graph/delta/v1?token=X',
      maxPages: 0,
    });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'invalid-payload' });
  });
});
