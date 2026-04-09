import { describe, expect, it, vi } from 'vitest';
import {
  fetchPnpActionMetadata,
  fetchPnpRunEvidence,
  launchPnpRun,
  runPnpPreflight,
} from './pnpOpsClient.js';

function makeOkResponse(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

describe('pnpOpsClient auth wiring', () => {
  it('sends bearer token for action metadata calls', async () => {
    const fetchMock = vi.fn(async () => makeOkResponse({ items: [] }));
    await fetchPnpActionMetadata(
      'https://functions.example.com',
      async () => 'token-123',
      fetchMock as unknown as typeof fetch,
    );
    const firstCall = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const init = firstCall[1];
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-123');
  });

  it('sends bearer token and payload for preflight and launch', async () => {
    const fetchMock = vi
      .fn(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(async () => makeOkResponse({ data: { ready: true, checks: [] } }))
      .mockImplementationOnce(
        async () => makeOkResponse({ data: { runId: 'run-1', status: 'Pending', actionKey: 'sharepoint-control:extraction:list-schema' } }),
      );

    const input = {
      targetSiteUrl: 'https://tenant.sharepoint.com/sites/Test',
      listFilters: ['List A'],
      executionIntent: {
        mode: 'read-only-export' as const,
        source: 'spfx-webpart' as const,
        requestedAt: new Date().toISOString(),
      },
    };

    await runPnpPreflight(
      'https://functions.example.com',
      'sharepoint-control:extraction:list-schema',
      input,
      async () => 'token-xyz',
      fetchMock as unknown as typeof fetch,
    );
    await launchPnpRun(
      'https://functions.example.com',
      'sharepoint-control:extraction:list-schema',
      input,
      async () => 'token-xyz',
      fetchMock as unknown as typeof fetch,
    );

    for (const call of fetchMock.mock.calls) {
      const init = ((call as unknown as [string, RequestInit])[1] ?? {}) as RequestInit;
      const headers = (init.headers ?? {}) as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer token-xyz');
    }
  });

  it('omits authorization header when token provider is missing', async () => {
    const fetchMock = vi.fn(async () =>
      makeOkResponse({
        data: {
          runId: 'run-1',
          evidenceRefs: [
            {
              label: 'artifact-bundle.zip',
              isBundle: true,
              bundleFormat: 'zip',
              contentType: 'application/zip',
              sizeBytes: 256,
              availability: 'available',
              downloadUrl: 'https://functions.example.com/api/admin/runs/run-1/artifacts/e1/download',
            },
          ],
          total: 1,
        },
      }),
    );
    const result = await fetchPnpRunEvidence(
      'https://functions.example.com',
      'run-1',
      undefined,
      fetchMock as unknown as typeof fetch,
    );
    expect(result.evidenceRefs[0]?.isBundle).toBe(true);
    const firstCall = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const init = (firstCall[1] ?? {}) as RequestInit;
    const headers = (init.headers ?? {}) as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});
