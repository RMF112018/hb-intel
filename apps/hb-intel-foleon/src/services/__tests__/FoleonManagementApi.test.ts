import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApiUrl, createFoleonManagementApi } from '../FoleonManagementApi.js';
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
  });

  it('attaches SPFx-acquired bearer token when configured', async () => {
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
  });

  it('surfaces backend correlation IDs on API errors', async () => {
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

    await expect(api.listContent()).rejects.toMatchObject({
      code: 'FOLEON_GRAPH_CONFLICT',
      requestId: 'corr-409',
      status: 409,
    });
  });
});
