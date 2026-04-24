import { afterEach, describe, expect, it, vi } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';
import { SafetyBackendCommandError } from './errors.js';

describe('SharePointSafetyInspectionRepository backend ingestion path', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('routes workbook ingestion through backend endpoint when configured', async () => {
    const getSpy = vi.fn();
    const postSpy = vi.fn();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          result: {
            state: 'committed',
            run: {
              id: 'run-123',
              spItemId: 123,
              title: 'Ingestion test.xlsx — attempt 1',
              sourceUploadItemId: 99,
              uploadFileName: 'test.xlsx',
              checksum: 'abc',
              validationStatus: 'passed',
              parseStatus: 'passed',
              projectResolutionStatus: 'resolved',
              terminalStatus: 'committed',
              committedEntityIdsJson: '{}',
              runStartedAt: new Date().toISOString(),
              runCompletedAt: new Date().toISOString(),
              attemptNumber: 1,
              reportingPeriodId: 'period-1',
              reportingPeriodSpItemId: 1,
              reviewStatus: 'none',
            },
          },
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: {
        get: getSpy,
        post: postSpy,
      },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-1',
      },
    });

    const result = await repo.ingestWorkbook(new Blob(['hello']), {
      uploadedByUpn: 'user@hb.com',
      uploadedAt: '2026-04-22T10:00:00.000Z',
      fileName: 'test.xlsx',
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
    });

    expect(result.state).toBe('committed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-1',
      'Content-Type': 'application/json',
    });
    expect((init.headers as Record<string, string>)['X-Request-Id']).toMatch(/^[A-Za-z0-9-]{8,}$/);
    expect(JSON.parse(String(init.body))).toEqual({
      fileName: 'test.xlsx',
      fileContentBase64: 'aGVsbG8=',
      context: {
        uploadedByUpn: 'user@hb.com',
        uploadedAt: '2026-04-22T10:00:00.000Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
      },
    });
    expect(getSpy).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('routes replay through backend endpoint when configured', async () => {
    const getSpy = vi.fn();
    const postSpy = vi.fn();
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          result: {
            state: 'committed',
            run: {
              id: 'run-124',
              spItemId: 124,
              title: 'Replay test.xlsx — attempt 2',
              sourceUploadItemId: 99,
              uploadFileName: 'test.xlsx',
              checksum: 'abc',
              validationStatus: 'passed',
              parseStatus: 'passed',
              projectResolutionStatus: 'resolved',
              terminalStatus: 'committed',
              committedEntityIdsJson: '{}',
              runStartedAt: new Date().toISOString(),
              runCompletedAt: new Date().toISOString(),
              attemptNumber: 2,
              reportingPeriodId: 'period-1',
              reportingPeriodSpItemId: 1,
              reviewStatus: 'replayed-success',
              parentRunId: 'run-123',
              parentRunSpItemId: 123,
            },
          },
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: {
        get: getSpy,
        post: postSpy,
      },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-2',
      },
    });

    const result = await repo.replayIngestion('run-123', { supersedePrior: true });

    expect(result.state).toBe('committed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/replay');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-2',
      'Content-Type': 'application/json',
    });
    expect(String(init.body)).toContain('"parentRunId":"run-123"');
    expect(String(init.body)).toContain('"supersedePrior":true');
    expect(getSpy).not.toHaveBeenCalled();
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('routes preview through backend endpoint when configured', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => ({
        data: {
          success: true,
          requestAccepted: true,
          preview: {
            commitReadiness: true,
            template: { templateVersion: 'v1', parserContractVersion: 'p1', valid: true },
            projectResolution: { resolved: true, classification: 'project' },
            warnings: [],
            blockingErrors: [],
            diagnosticSummary: {
              commitReady: true,
              failureClass: 'none',
              blockingCodes: [],
              warningCodes: [],
              checks: {
                templateValid: true,
                parserContractMarkerState: 'markered-valid',
                parseSucceeded: true,
                reportingPeriodResolved: true,
                reportingPeriodDateInRange: true,
                projectResolved: true,
                duplicateConfidence: 'none',
              },
            },
          },
          diagnostics: [],
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-preview',
      },
    });

    const result = await repo.previewWorkbook(new Blob(['hello']), {
      uploadedByUpn: 'user@hb.com',
      uploadedAt: '2026-04-22T10:00:00.000Z',
      fileName: 'test.xlsx',
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
    });

    expect(result.commitReadiness).toBe(true);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest/preview');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-preview',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(init.body))).toEqual({
      fileName: 'test.xlsx',
      fileContentBase64: 'aGVsbG8=',
      context: {
        uploadedByUpn: 'user@hb.com',
        uploadedAt: '2026-04-22T10:00:00.000Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
      },
    });
  });

  it('preserves requestId and classified 422 failure envelope details', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      headers: { get: (key: string) => (key === 'X-Request-Id' ? 'req-422' : null) },
      json: async () => ({
        message: 'Safety ingestion failed before commit.',
        code: 'GRAPH_PERMISSION_DENIED',
        requestId: 'req-422',
        failureClass: 'graph-permission',
        previewFailureClass: 'project-unresolved',
        graphContext: {
          pathSummary: '/sites/HBCentral/_api/web/lists',
          statusCode: 403,
        },
        data: {
          success: false,
          requestAccepted: true,
          requestId: 'req-422',
          diagnostics: [
            {
              code: 'GRAPH_PERMISSION_DENIED',
              message: 'Graph call denied',
              failureClass: 'graph-permission',
              graphContext: { pathSummary: '/sites/HBCentral/_api/web/lists', statusCode: 403 },
            },
          ],
        },
      }),
    } as Response);
    vi.stubGlobal('fetch', fetchSpy);

    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-422',
      },
    });

    await expect(
      repo.ingestWorkbook(new Blob(['hello']), {
        uploadedByUpn: 'user@hb.com',
        uploadedAt: '2026-04-22T10:00:00.000Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
      }),
    ).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      httpStatus: 422,
      requestId: 'req-422',
      code: 'GRAPH_PERMISSION_DENIED',
      failureClass: 'graph-permission',
      previewFailureClass: 'project-unresolved',
      graphContext: {
        pathSummary: '/sites/HBCentral/_api/web/lists',
        statusCode: 403,
      },
    } satisfies Partial<SafetyBackendCommandError>);
  });

  it('returns typed token acquisition failures for auth propagation contract', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => {
          throw new Error('SPFx token provider unavailable');
        },
      },
    });

    await expect(
      repo.ingestWorkbook(new Blob(['hello']), {
        uploadedByUpn: 'user@hb.com',
        uploadedAt: '2026-04-22T10:00:00.000Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
      }),
    ).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      code: 'TOKEN_ACQUISITION_FAILED',
      httpStatus: 0,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('classifies timeout failures without retry loops', async () => {
    const fetchSpy = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal;
          if (signal) {
            signal.addEventListener('abort', () => reject(new Error('aborted by timeout')), { once: true });
          }
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-timeout',
      },
    });

    await expect(
      repo.ingestWorkbook(
        new Blob(['hello']),
        {
          uploadedByUpn: 'user@hb.com',
          uploadedAt: '2026-04-22T10:00:00.000Z',
          fileName: 'test.xlsx',
          reportingPeriodId: 'period-1',
          reportingPeriodSpItemId: 1,
        },
        { timeoutMs: 1 },
      ),
    ).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'timeout',
      code: 'BACKEND_TIMEOUT',
      retryable: false,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('classifies explicit abort failures', async () => {
    const fetchSpy = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted by user')), { once: true });
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-abort',
      },
    });
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 0);

    await expect(
      repo.replayIngestion('run-123', { supersedePrior: false, signal: controller.signal }),
    ).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'aborted',
      code: 'BACKEND_ABORTED',
      retryable: false,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('retries one transient transport failure and preserves request correlation headers', async () => {
    const fetchSpy = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: (key: string) => (key === 'X-Request-Id' ? 'backend-req-200' : null) },
        json: async () => ({
          data: {
            success: true,
            requestAccepted: true,
            requestId: 'backend-req-200',
            diagnostics: [],
            result: {
              state: 'committed',
              run: {
                id: 'run-200',
                spItemId: 200,
                title: 'Ingestion test.xlsx — attempt 1',
                sourceUploadItemId: 99,
                uploadFileName: 'test.xlsx',
                checksum: 'abc',
                validationStatus: 'passed',
                parseStatus: 'passed',
                projectResolutionStatus: 'resolved',
                terminalStatus: 'committed',
                committedEntityIdsJson: '{}',
                runStartedAt: new Date().toISOString(),
                runCompletedAt: new Date().toISOString(),
                attemptNumber: 1,
                reportingPeriodId: 'period-1',
                reportingPeriodSpItemId: 1,
                reviewStatus: 'none',
              },
            },
          },
        }),
      } as Response);
    vi.stubGlobal('fetch', fetchSpy);
    const repo = new SharePointSafetyInspectionRepository({
      client: { get: vi.fn(), post: vi.fn() },
      backendIngestion: {
        baseUrl: 'https://functions.example.com/',
        getApiToken: async () => 'token-retry',
      },
    });

    const result = await repo.ingestWorkbook(
      new Blob(['hello']),
      {
        uploadedByUpn: 'user@hb.com',
        uploadedAt: '2026-04-22T10:00:00.000Z',
        fileName: 'test.xlsx',
        reportingPeriodId: 'period-1',
        reportingPeriodSpItemId: 1,
      },
      { requestId: 'frontend-request-1' },
    );

    expect(result.state).toBe('committed');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const firstHeaders = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const secondHeaders = fetchSpy.mock.calls[1]?.[1] as RequestInit;
    expect(firstHeaders.headers).toMatchObject({ 'X-Request-Id': 'frontend-request-1' });
    expect(secondHeaders.headers).toMatchObject({ 'X-Request-Id': 'frontend-request-1' });
  });
});
