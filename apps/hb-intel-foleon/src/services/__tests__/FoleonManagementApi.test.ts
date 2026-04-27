import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildApiUrl,
  createFoleonManagementApi,
  FoleonManagementApiError,
} from '../FoleonManagementApi.js';
import { createFoleonOriginPolicy } from '../FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

function contract(overrides: Partial<IFoleonRuntimeContract> = {}): IFoleonRuntimeContract {
  return {
    hostMode: 'mock',
    route: 'manage',
    docId: null,
    siteUrl: null,
    listIds: { contentRegistry: null, placements: null, events: null },
    originPolicy: createFoleonOriginPolicy(),
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected: true,
      packageVersionMatchesExpected: true,
    },
    readerRoutePath: null,
    apiBaseUrl: 'https://functions.example.com',
    apiResource: 'api://hb-intel-functions',
    telemetry: { correlationId: 'corr-test', sessionId: 'sess-test' },
    canInitialize: true,
    issues: [],
    blockingReasons: [],
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FoleonManagementApi', () => {
  it('builds same-origin and absolute backend URLs', () => {
    expect(buildApiUrl(null, '/foleon/content')).toBe('/api/foleon/content');
    expect(buildApiUrl('https://functions.example.com/', '/foleon/content'))
      .toBe('https://functions.example.com/api/foleon/content');
    expect(buildApiUrl('https://functions.example.com/api', '/foleon/content'))
      .toBe('https://functions.example.com/api/foleon/content');
    expect(buildApiUrl('https://functions.example.com/api/', '/foleon/content'))
      .toBe('https://functions.example.com/api/foleon/content');
    expect(buildApiUrl('https://functions.example.com', 'foleon/config'))
      .toBe('https://functions.example.com/api/foleon/config');
  });

  it('attaches SPFx-acquired bearer token without forcing credentialed CORS', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);
    const api = createFoleonManagementApi(contract({
      getAccessToken: async () => 'token-123',
    }));

    await api.listContent();

    const headers = fetchSpy.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-123');
    expect(fetchSpy.mock.calls[0]?.[1]?.credentials).toBeUndefined();
  });

  it('does not attach authorization when token acquisition is absent or empty', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await createFoleonManagementApi(contract({ getAccessToken: undefined })).listContent();
    await createFoleonManagementApi(contract({ getAccessToken: async () => '' })).listContent();

    const firstHeaders = fetchSpy.mock.calls[0]?.[1]?.headers as Headers;
    const secondHeaders = fetchSpy.mock.calls[1]?.[1]?.headers as Headers;
    expect(firstHeaders.has('Authorization')).toBe(false);
    expect(secondHeaders.has('Authorization')).toBe(false);
    expect(fetchSpy.mock.calls[0]?.[1]?.credentials).toBeUndefined();
    expect(fetchSpy.mock.calls[1]?.[1]?.credentials).toBeUndefined();
  });

  it('surfaces backend correlation IDs on Graph conflicts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: 'Conflict',
        code: 'FOLEON_GRAPH_CONFLICT',
        requestId: 'corr-409',
      }),
    } as Response);
    const api = createFoleonManagementApi(contract());

    try {
      await api.listContent();
      expect.fail('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(FoleonManagementApiError);
      expect((err as FoleonManagementApiError).isGraphConflict).toBe(true);
      expect((err as FoleonManagementApiError).requestId).toBe('corr-409');
    }
  });

  it('reads backend safe config before Manager readiness probes', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { graphConfigured: true, foleonApiConfigured: false, sharePointSiteConfigured: true },
      }),
    } as Response);
    const api = createFoleonManagementApi(contract());

    const config = await api.getSafeConfig();

    expect(config.foleonApiConfigured).toBe(false);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://functions.example.com/api/foleon/config');
  });
});
