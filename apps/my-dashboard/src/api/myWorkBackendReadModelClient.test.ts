import { describe, expect, it, vi } from 'vitest';

import {
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_PROJECT_LINKS_AVAILABLE,
  MY_WORK_HOME_AVAILABLE,
} from '@hbc/models/myWork/fixtures';

import {
  buildAdobeQueueQueryString,
  createMyWorkBackendReadModelClient,
  normalizeBackendApiBaseUrl,
  type MyWorkReadModelFetch,
} from './myWorkBackendReadModelClient.js';
import { createMyWorkFixtureReadModelClient } from './myWorkFixtureReadModelClient.js';
import type { GetApiToken } from './myWorkReadModelClient.js';

const makeJsonResponse = (body: unknown, init: { status?: number } = {}): Response =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  });

const makeBackendUnavailableFallback = () =>
  createMyWorkFixtureReadModelClient({ simulateBackendUnavailable: true });

describe('normalizeBackendApiBaseUrl', () => {
  it('appends /api to a bare host', () => {
    expect(normalizeBackendApiBaseUrl('https://example.invalid')).toBe(
      'https://example.invalid/api',
    );
  });

  it('does not double /api when input already ends with /api', () => {
    expect(normalizeBackendApiBaseUrl('https://example.invalid/api')).toBe(
      'https://example.invalid/api',
    );
  });

  it('strips trailing slashes', () => {
    expect(normalizeBackendApiBaseUrl('https://example.invalid/')).toBe(
      'https://example.invalid/api',
    );
    expect(normalizeBackendApiBaseUrl('https://example.invalid/api/')).toBe(
      'https://example.invalid/api',
    );
    expect(normalizeBackendApiBaseUrl('https://example.invalid/api///')).toBe(
      'https://example.invalid/api',
    );
  });

  it('returns an empty string for empty input', () => {
    expect(normalizeBackendApiBaseUrl('')).toBe('');
    expect(normalizeBackendApiBaseUrl('   ')).toBe('');
  });
});

describe('buildAdobeQueueQueryString', () => {
  it('returns empty string when no query supplied', () => {
    expect(buildAdobeQueueQueryString()).toBe('');
    expect(buildAdobeQueueQueryString({})).toBe('');
  });

  it('serializes pageSize and cursor', () => {
    expect(buildAdobeQueueQueryString({ pageSize: 25, cursor: 'abc' })).toBe(
      '?pageSize=25&cursor=abc',
    );
  });

  it('omits empty cursor and non-finite pageSize', () => {
    expect(buildAdobeQueueQueryString({ cursor: '' })).toBe('');
    expect(buildAdobeQueueQueryString({ pageSize: Number.NaN })).toBe('');
    expect(buildAdobeQueueQueryString({ pageSize: Number.POSITIVE_INFINITY })).toBe('');
  });
});

describe('My Work backend read-model client — happy path', () => {
  it('issues a GET to the canonical home route with bearer token and Accept header', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_WORK_HOME_AVAILABLE }));
    const getApiToken = vi.fn<GetApiToken>().mockResolvedValue('tok-home');
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken,
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });

    const envelope = await client.getMyWorkHome();

    expect(envelope).toEqual(MY_WORK_HOME_AVAILABLE);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://example.invalid/api/my-work/me/home');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer tok-home');
    expect(init.headers.Accept).toBe('application/json');
  });

  it('issues a GET to the canonical queue route with query string', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: ADOBE_SIGN_QUEUE_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok-queue',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });

    await client.getAdobeSignActionQueue({ pageSize: 25, cursor: 'abc' });

    const [url] = fetchSpy.mock.calls[0]!;
    expect(url).toBe(
      'https://example.invalid/api/my-work/me/adobe-sign/action-queue?pageSize=25&cursor=abc',
    );
  });

  it('does not include actor/user/principal/email/upn in the URL', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: ADOBE_SIGN_QUEUE_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    await client.getAdobeSignActionQueue({ pageSize: 10, cursor: 'c1' });
    const [url] = fetchSpy.mock.calls[0]!;
    for (const forbidden of ['actor', 'user', 'principal', 'email', 'upn']) {
      expect(String(url).toLowerCase()).not.toContain(forbidden);
    }
  });

  it('issues a GET to the canonical project-links route with no query string', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_PROJECT_LINKS_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok-project-links',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });

    await client.getMyProjectLinks();

    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://example.invalid/api/my-work/me/project-links');
    expect(url).not.toContain('?');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer tok-project-links');
  });

  it('does not include actor/user/principal/email/upn in the project-links URL', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_PROJECT_LINKS_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });

    await client.getMyProjectLinks();

    const [url] = fetchSpy.mock.calls[0]!;
    for (const forbidden of ['actor', 'user', 'principal', 'email', 'upn']) {
      expect(String(url).toLowerCase()).not.toContain(forbidden);
    }
  });

  it('acquires a fresh token per call', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_WORK_HOME_AVAILABLE }));
    const getApiToken = vi
      .fn<GetApiToken>()
      .mockResolvedValueOnce('tok-1')
      .mockResolvedValueOnce('tok-2');
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken,
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });

    await client.getMyWorkHome();
    await client.getMyWorkHome();

    expect(getApiToken).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0]![1].headers.Authorization).toBe('Bearer tok-1');
    expect(fetchSpy.mock.calls[1]![1].headers.Authorization).toBe('Bearer tok-2');
  });

  it('honors an input base URL that already ends with /api without doubling', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: MY_WORK_HOME_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid/api',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    await client.getMyWorkHome();
    const [url] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://example.invalid/api/my-work/me/home');
    expect(String(url)).not.toContain('/api/api');
  });
});

describe('My Work backend read-model client — fallback paths', () => {
  const assertBackendUnavailable = (envelope: {
    readonly sourceStatus: string;
    readonly mode: string;
    readonly warnings: readonly { readonly code: string }[];
  }) => {
    expect(envelope.sourceStatus).toBe('backend-unavailable');
    expect(envelope.mode).toBe('fixture');
    expect(envelope.warnings[0]?.code).toBe('backend-unavailable');
  };

  it('falls back when getApiToken rejects', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>();
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => {
        throw new Error('token error');
      },
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('falls back when getApiToken returns an empty string', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>();
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => '   ',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('falls back when fetch throws', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>().mockRejectedValue(new Error('network down'));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
  });

  it('falls back when the response is not 2xx', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(new Response('boom', { status: 500 }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
  });

  it('falls back when JSON parsing fails', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>().mockResolvedValue(
      new Response('not-json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
  });

  it('falls back when the response body is missing the data wrapper', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ envelope: MY_WORK_HOME_AVAILABLE }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
  });

  it('falls back when data is not envelope-shaped', async () => {
    const fetchSpy = vi
      .fn<MyWorkReadModelFetch>()
      .mockResolvedValue(makeJsonResponse({ data: { not: 'an envelope' } }));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyWorkHome();
    assertBackendUnavailable(envelope);
  });

  it('falls back for project-links when backend fetch throws', async () => {
    const fetchSpy = vi.fn<MyWorkReadModelFetch>().mockRejectedValue(new Error('network down'));
    const client = createMyWorkBackendReadModelClient({
      backendBaseUrl: 'https://example.invalid',
      getApiToken: async () => 'tok',
      fetch: fetchSpy,
      fallback: makeBackendUnavailableFallback(),
    });
    const envelope = await client.getMyProjectLinks();
    assertBackendUnavailable(envelope);
  });
});
