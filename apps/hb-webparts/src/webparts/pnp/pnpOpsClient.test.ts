import { describe, expect, it, vi } from 'vitest';
import {
  fetchPnpActionMetadata,
  fetchPnpRunEvidence,
  launchPnpRun,
  runPnpPreflight,
  type PnpOpsClientConfig,
} from './pnpOpsClient.js';

function makeOkResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

const commandInput = {
  targetSiteUrl: 'https://tenant.sharepoint.com/sites/Test',
  listFilters: ['List A'],
  executionIntent: {
    mode: 'read-only-export' as const,
    source: 'spfx-webpart' as const,
    requestedAt: new Date().toISOString(),
  },
};

describe('pnpOpsClient mode routing', () => {
  it('uses neutral runner endpoints for local-runner mode', async () => {
    const config: PnpOpsClientConfig = {
      executionMode: 'local-runner',
      runnerBaseUrl: 'https://runner.internal',
    };
    const fetchMock = vi
      .fn(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(async () => makeOkResponse({ items: [] }))
      .mockImplementationOnce(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(async () => makeOkResponse({
        data: { runId: 'run-1', status: 'Pending', actionKey: 'sharepoint-control:extraction:list-schema' },
      }));

    await fetchPnpActionMetadata(config, undefined, fetchMock as unknown as typeof fetch);
    await runPnpPreflight(
      config,
      'sharepoint-control:extraction:list-schema',
      commandInput,
      undefined,
      fetchMock as unknown as typeof fetch,
    );
    await launchPnpRun(
      config,
      'sharepoint-control:extraction:list-schema',
      commandInput,
      undefined,
      fetchMock as unknown as typeof fetch,
    );

    const calledUrls = fetchMock.mock.calls.map((call) => String((call as unknown[])[0] ?? ''));
    expect(calledUrls[0]).toBe('https://runner.internal/actions');
    expect(calledUrls[1]).toBe('https://runner.internal/preflight');
    expect(calledUrls[2]).toBe('https://runner.internal/runs');

    for (const call of fetchMock.mock.calls) {
      const init = ((call as unknown as [string, RequestInit])[1] ?? {}) as RequestInit;
      const headers = (init.headers ?? {}) as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    }
  });

  it('uses legacy admin endpoints with bearer auth in legacy-admin-api mode', async () => {
    const config: PnpOpsClientConfig = {
      executionMode: 'legacy-admin-api',
      runnerBaseUrl: 'https://functions.example.com',
      legacyAdminApiBaseUrl: 'https://functions.example.com',
    };

    const fetchMock = vi
      .fn(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(async () => makeOkResponse({ items: [] }))
      .mockImplementationOnce(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(async () => makeOkResponse({
        data: { runId: 'run-1', status: 'Pending', actionKey: 'sharepoint-control:extraction:list-schema' },
      }))
      .mockImplementationOnce(async () => makeOkResponse({
        data: {
          runId: 'run-1',
          evidenceRefs: [{ label: 'artifact-bundle.zip', downloadUrl: 'https://functions.example.com/file.zip' }],
          total: 1,
        },
      }));

    await fetchPnpActionMetadata(config, async () => 'token-xyz', fetchMock as unknown as typeof fetch);
    await runPnpPreflight(
      config,
      'sharepoint-control:extraction:list-schema',
      commandInput,
      async () => 'token-xyz',
      fetchMock as unknown as typeof fetch,
    );
    await launchPnpRun(
      config,
      'sharepoint-control:extraction:list-schema',
      commandInput,
      async () => 'token-xyz',
      fetchMock as unknown as typeof fetch,
    );
    await fetchPnpRunEvidence(
      config,
      'run-1',
      async () => 'token-xyz',
      fetchMock as unknown as typeof fetch,
    );

    const calledUrls = fetchMock.mock.calls.map((call) => String((call as unknown[])[0] ?? ''));
    expect(calledUrls[0]).toBe('https://functions.example.com/api/admin/actions');
    expect(calledUrls[1]).toBe('https://functions.example.com/api/admin/preflight');
    expect(calledUrls[2]).toBe('https://functions.example.com/api/admin/runs');
    expect(calledUrls[3]).toBe('https://functions.example.com/api/admin/runs/run-1/evidence');

    for (const call of fetchMock.mock.calls) {
      const init = ((call as unknown as [string, RequestInit])[1] ?? {}) as RequestInit;
      const headers = (init.headers ?? {}) as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer token-xyz');
    }
  });

  it('returns local locked catalog when mode is mock', async () => {
    const config: PnpOpsClientConfig = {
      executionMode: 'mock',
      runnerBaseUrl: '',
    };

    const fetchMock = vi.fn();
    const metadata = await fetchPnpActionMetadata(config, undefined, fetchMock as unknown as typeof fetch);

    expect(metadata).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
