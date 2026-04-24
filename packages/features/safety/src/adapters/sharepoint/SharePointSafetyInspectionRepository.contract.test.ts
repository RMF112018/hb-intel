import { afterEach, describe, expect, it, vi } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';
import type { SpHttpClient } from './spHttp.js';

function makeClientWithBackend(fetchSpy: ReturnType<typeof vi.fn>) {
  const client: SpHttpClient = {
    get: vi.fn(),
    post: vi.fn(),
  };
  vi.stubGlobal('fetch', fetchSpy);
  const repo = new SharePointSafetyInspectionRepository({
    client,
    backendIngestion: {
      baseUrl: 'https://functions.example.com/',
      getApiToken: async () => 'token-contract',
    },
  });
  return { repo, client };
}

describe('SharePoint adapter backend command contract (W1 G2)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('ingest sends exact command route/body and avoids SharePoint REST fallback', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          result: { state: 'committed' },
        },
      }),
    } as Response);
    const { repo, client } = makeClientWithBackend(fetchSpy);
    await repo.ingestWorkbook(new Blob(['hello']), {
      uploadedByUpn: 'coordinator@example.com',
      uploadedAt: '2026-04-24T00:00:00.000Z',
      fileName: 'contract.xlsx',
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
      projectNumber: 'P-1001',
      projectSourceClassification: 'project',
      projectLookupId: 2001,
      inspectionNumber: '3',
      inspectionDate: '2026-04-24',
    });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      fileName: 'contract.xlsx',
      fileContentBase64: 'aGVsbG8=',
      context: {
        uploadedByUpn: 'coordinator@example.com',
        uploadedAt: '2026-04-24T00:00:00.000Z',
        fileName: 'contract.xlsx',
        reportingPeriodId: 'period-1001',
        reportingPeriodSpItemId: 1001,
        projectNumber: 'P-1001',
        projectSourceClassification: 'project',
        projectLookupId: 2001,
        inspectionNumber: '3',
        inspectionDate: '2026-04-24',
      },
    });
    expect(client.get).not.toHaveBeenCalled();
    expect(client.post).not.toHaveBeenCalled();
  });

  it('preview sends exact command route/body and preserves token header', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          preview: { commitReadiness: true },
        },
      }),
    } as Response);
    const { repo } = makeClientWithBackend(fetchSpy);
    await repo.previewWorkbook(new Blob(['hello']), {
      uploadedByUpn: 'coordinator@example.com',
      uploadedAt: '2026-04-24T00:00:00.000Z',
      fileName: 'contract.xlsx',
      reportingPeriodId: 'period-1001',
      reportingPeriodSpItemId: 1001,
      projectNumber: 'P-1001',
      projectSourceClassification: 'project',
      projectLookupId: 2001,
      inspectionNumber: '3',
      inspectionDate: '2026-04-24',
    });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest/preview');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-contract',
      'Content-Type': 'application/json',
    });
  });

  it('replay sends exact command route/body and supersede flag', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          result: { state: 'committed' },
        },
      }),
    } as Response);
    const { repo } = makeClientWithBackend(fetchSpy);
    await repo.replayIngestion('run-123', { supersedePrior: true });

    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/replay');
    expect(JSON.parse(String((fetchSpy.mock.calls[0]?.[1] as RequestInit).body))).toEqual({
      parentRunId: 'run-123',
      supersedePrior: true,
    });
  });

  it('preserves request IDs and failure envelope fields for typed errors', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: (key: string) => (key === 'X-Request-Id' ? 'backend-422' : null) },
      json: async () => ({
        message: 'Safety ingestion failed before commit.',
        code: 'GRAPH_PERMISSION_DENIED',
        requestId: 'backend-422',
        failureClass: 'graph-permission',
        previewFailureClass: 'project-unresolved',
        graphContext: { statusCode: 403 },
        data: {
          success: false,
          requestAccepted: true,
          requestId: 'backend-422',
          diagnostics: [],
        },
      }),
    } as Response);
    const { repo } = makeClientWithBackend(fetchSpy);

    await expect(
      repo.ingestWorkbook(
        new Blob(['hello']),
        {
          uploadedByUpn: 'coordinator@example.com',
          uploadedAt: '2026-04-24T00:00:00.000Z',
          fileName: 'contract.xlsx',
          reportingPeriodId: 'period-1001',
          reportingPeriodSpItemId: 1001,
          projectNumber: 'P-1001',
          projectSourceClassification: 'project',
          projectLookupId: 2001,
          inspectionNumber: '3',
          inspectionDate: '2026-04-24',
        },
        { requestId: 'frontend-422' },
      ),
    ).rejects.toMatchObject({
      requestId: 'backend-422',
      backendRequestId: 'backend-422',
      frontendRequestId: 'frontend-422',
      failureClass: 'graph-permission',
      previewFailureClass: 'project-unresolved',
    });
  });
});
