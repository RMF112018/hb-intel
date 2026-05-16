import { afterEach, describe, expect, it, vi } from 'vitest';

import { GraphListClient } from '../legacy-fallback/graph-list-client.js';

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
const SITE_ID = 'site-id-1';

function makeClient(): GraphListClient {
  return new GraphListClient(SITE_URL, {
    getGraphAccessToken: async () => 'token',
  });
}

function jsonResponse(body: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GraphListClient cold-path metadata coalescing', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('coalesces concurrent resolveSiteId calls into one site fetch', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral')) {
        return jsonResponse({ id: SITE_ID });
      }
      return jsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    const [left, right] = await Promise.all([client.resolveSiteId(), client.resolveSiteId()]);

    expect(left).toBe(SITE_ID);
    expect(right).toBe(SITE_ID);
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).includes('/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral'),
      ),
    ).toHaveLength(1);
  });

  it('coalesces concurrent resolveListId calls into one list-catalog fetch when map is empty', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral')) {
        return jsonResponse({ id: SITE_ID });
      }
      if (url.includes(`/sites/${SITE_ID}/lists?$select=id,displayName,name&$top=200`)) {
        return jsonResponse({
          value: [
            { id: 'list-1', displayName: 'Projects', name: 'Projects' },
            {
              id: 'list-2',
              displayName: 'Legacy Project Fallback Registry',
              name: 'LegacyProjectFallbackRegistry',
            },
          ],
        });
      }
      return jsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    const [projectsId, registryId] = await Promise.all([
      client.resolveListId('Projects'),
      client.resolveListId('Legacy Project Fallback Registry'),
    ]);

    expect(projectsId).toBe('list-1');
    expect(registryId).toBe('list-2');
    expect(
      fetchMock.mock.calls.filter(([input]) =>
        String(input).includes(`/sites/${SITE_ID}/lists?$select=id,displayName,name&$top=200`),
      ),
    ).toHaveLength(1);
  });

  it('allows retry after a failed site resolution', async () => {
    let siteAttempts = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral')) {
        siteAttempts += 1;
        if (siteAttempts === 1) return jsonResponse({ error: 'boom' }, 500);
        return jsonResponse({ id: SITE_ID });
      }
      return jsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    await expect(client.resolveSiteId()).rejects.toThrow(/graph GET .* -> 500:/);
    await expect(client.resolveSiteId()).resolves.toBe(SITE_ID);
    expect(siteAttempts).toBe(2);
  });

  it('allows retry after a failed list-catalog resolution', async () => {
    let catalogAttempts = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/sites/hedrickbrotherscom.sharepoint.com:/sites/HBCentral')) {
        return jsonResponse({ id: SITE_ID });
      }
      if (url.includes(`/sites/${SITE_ID}/lists?$select=id,displayName,name&$top=200`)) {
        catalogAttempts += 1;
        if (catalogAttempts === 1) return jsonResponse({ error: 'catalog failed' }, 500);
        return jsonResponse({
          value: [{ id: 'list-1', displayName: 'Projects', name: 'Projects' }],
        });
      }
      return jsonResponse({}, 404);
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = makeClient();
    await expect(client.resolveListId('Projects')).rejects.toThrow(/graph GET .*\/lists\?.* -> 500:/);
    await expect(client.resolveListId('Projects')).resolves.toBe('list-1');
    expect(catalogAttempts).toBe(2);
  });
});
