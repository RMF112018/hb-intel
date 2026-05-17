import { describe, expect, it, vi } from 'vitest';
import { createProjectionGraphSubscriptionClient } from '../my-projects-projection/subscriptions/projection-graph-subscription-client.js';
import type { IGraphAccessTokenProvider } from '../legacy-fallback/federated-graph-token-provider.js';

const FAKE_TOKEN = 'fake-bearer-token-for-test';
const FAKE_PROVIDER: IGraphAccessTokenProvider = {
  async getGraphAccessToken() {
    return FAKE_TOKEN;
  },
};

function makeFetch(responses: Array<{ status: number; body?: unknown; throws?: Error }>): {
  fetchImpl: typeof fetch;
  calls: Array<{ url: string; init: RequestInit | undefined }>;
} {
  const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
  let index = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    const planned = responses[index++];
    if (!planned) {
      throw new Error(`Unexpected fetch call ${index}`);
    }
    if (planned.throws) throw planned.throws;
    const status = planned.status;
    const allowsBody = status !== 204 && status !== 205 && status !== 304;
    const bodyText = !allowsBody || planned.body === undefined ? null : JSON.stringify(planned.body);
    return new Response(bodyText, { status });
  };
  return { fetchImpl, calls };
}

describe('ProjectionGraphSubscriptionClient.createSubscription', () => {
  it('builds a POST with the canonical Graph subscription body and parses the response', async () => {
    const { fetchImpl, calls } = makeFetch([
      {
        status: 201,
        body: {
          id: 'sub-abc',
          resource: 'sites/site/lists/list',
          notificationUrl: 'https://func/api/webhook',
          applicationId: 'app-123',
          expirationDateTime: '2026-06-13T00:00:00.000Z',
          changeType: 'updated',
        },
      },
    ]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: 'sites/site/lists/list',
      notificationUrl: 'https://func/api/webhook',
      clientState: 'secret',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.subscription.subscriptionId).toBe('sub-abc');
      expect(outcome.subscription.expirationDateTimeUtc).toBe('2026-06-13T00:00:00.000Z');
    }
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://graph.microsoft.com/v1.0/subscriptions');
    expect(calls[0].init?.method ?? 'GET').toBe('POST');
    const headers = new Headers(calls[0].init?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${FAKE_TOKEN}`);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('rejects malformed input without making a Graph call', async () => {
    const { fetchImpl, calls } = makeFetch([]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: '',
      notificationUrl: 'https://func',
      clientState: 'x',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe('invalid-payload');
    }
    expect(calls).toHaveLength(0);
  });

  it.each([
    [400, 'graph-400-bad-request'],
    [401, 'graph-401-unauthorized'],
    [403, 'graph-403-forbidden'],
    [409, 'graph-409-conflict'],
    [410, 'graph-410-gone'],
    [429, 'graph-429-throttled'],
    [500, 'graph-5xx'],
    [502, 'graph-5xx'],
  ] as const)('classifies HTTP %i as %s', async (status, expected) => {
    const { fetchImpl } = makeFetch([{ status, body: { error: { code: 'X' } } }]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: 'sites/site/lists/list',
      notificationUrl: 'https://func/api/webhook',
      clientState: 'secret',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe(expected);
    }
  });

  it('returns graph-network when fetch throws', async () => {
    const { fetchImpl } = makeFetch([{ status: 0, throws: new Error('amqp ECONNRESET') }]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: 'sites/site/lists/list',
      notificationUrl: 'https://func/api/webhook',
      clientState: 'secret',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe('graph-network');
    }
  });

  it('returns token-acquisition-failed when the token provider throws', async () => {
    const { fetchImpl } = makeFetch([]);
    const provider: IGraphAccessTokenProvider = {
      async getGraphAccessToken() {
        throw new Error('graph-token-failed: Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH');
      },
    };
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: provider,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: 'sites/site/lists/list',
      notificationUrl: 'https://func/api/webhook',
      clientState: 'secret',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe('token-acquisition-failed');
      expect(outcome.sanitizedReason).toContain('[REDACTED]');
      expect(outcome.sanitizedReason).not.toContain('eyJabcdef');
    }
  });
});

describe('ProjectionGraphSubscriptionClient.renewSubscription', () => {
  it('PATCHes the subscription with the new expiration', async () => {
    const { fetchImpl, calls } = makeFetch([
      {
        status: 200,
        body: {
          id: 'sub-abc',
          resource: 'sites/site/lists/list',
          expirationDateTime: '2026-07-10T00:00:00.000Z',
        },
      },
    ]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.renewSubscription({
      subscriptionId: 'sub-abc',
      expirationDateTimeUtc: '2026-07-10T00:00:00.000Z',
    });
    expect(outcome.ok).toBe(true);
    expect(calls[0].url).toBe('https://graph.microsoft.com/v1.0/subscriptions/sub-abc');
    expect(calls[0].init?.method ?? 'GET').toBe('PATCH');
  });

  it('rejects empty subscriptionId without calling Graph', async () => {
    const { fetchImpl, calls } = makeFetch([]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.renewSubscription({
      subscriptionId: '',
      expirationDateTimeUtc: '2026-07-10T00:00:00.000Z',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.failureCode).toBe('invalid-payload');
    }
    expect(calls).toHaveLength(0);
  });
});

describe('ProjectionGraphSubscriptionClient.deleteSubscription', () => {
  it('returns ok on 204', async () => {
    const { fetchImpl } = makeFetch([{ status: 204 }]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.deleteSubscription({ subscriptionId: 'sub-abc' });
    expect(outcome.ok).toBe(true);
  });

  it('classifies 404 and 410 as benign delete failures', async () => {
    const { fetchImpl: fetch404 } = makeFetch([{ status: 404 }]);
    const client404 = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl: fetch404,
    });
    const outcome404 = await client404.deleteSubscription({ subscriptionId: 'sub-abc' });
    expect(outcome404).toMatchObject({ ok: false, failureCode: 'graph-404-not-found' });

    const { fetchImpl: fetch410 } = makeFetch([{ status: 410 }]);
    const client410 = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl: fetch410,
    });
    const outcome410 = await client410.deleteSubscription({ subscriptionId: 'sub-abc' });
    expect(outcome410).toMatchObject({ ok: false, failureCode: 'graph-410-gone' });
  });
});

describe('ProjectionGraphSubscriptionClient.getSubscription', () => {
  it('returns the parsed record on 200', async () => {
    const { fetchImpl } = makeFetch([
      {
        status: 200,
        body: {
          id: 'sub-abc',
          resource: 'sites/site/lists/list',
          expirationDateTime: '2026-06-13T00:00:00.000Z',
        },
      },
    ]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.getSubscription({ subscriptionId: 'sub-abc' });
    expect(outcome.ok).toBe(true);
  });

  it('returns the explicit 404 failure on missing subscription', async () => {
    const { fetchImpl } = makeFetch([{ status: 404 }]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.getSubscription({ subscriptionId: 'sub-abc' });
    expect(outcome).toMatchObject({ ok: false, failureCode: 'graph-404-not-found' });
  });
});

describe('sanitization', () => {
  it('strips Bearer/JWT/long-base64 tokens from error reasons', async () => {
    const { fetchImpl } = makeFetch([
      {
        status: 500,
        body: {
          error: {
            code: 'X',
            message: 'Internal: Bearer eyJabcdefghijklmnopqrstu1234567890ABCDEFGH',
          },
        },
      },
    ]);
    const client = createProjectionGraphSubscriptionClient({
      tokenProvider: FAKE_PROVIDER,
      fetchImpl,
    });
    const outcome = await client.createSubscription({
      resource: 'sites/site/lists/list',
      notificationUrl: 'https://func/api/webhook',
      clientState: 'secret',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      changeType: 'updated',
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.sanitizedReason).toContain('[REDACTED]');
      expect(outcome.sanitizedReason).not.toContain('eyJabcdef');
    }
  });
});

// Sanity: spy ensures we exercised it
describe('module identity', () => {
  it('exports the factory', () => {
    expect(typeof createProjectionGraphSubscriptionClient).toBe('function');
    expect(vi.fn).toBeDefined();
  });
});
