import { afterEach, describe, expect, it, vi } from 'vitest';
import { SafetyBackendCommandClient } from './SafetyBackendCommandClient.js';
import { SafetyBackendCommandError } from './errors.js';
import type {
  SafetyBackendFailureEnvelope,
  SafetyBackendIngestionRequest,
  SafetyBackendOperationResult,
  SafetyBackendPreviewOperationResult,
} from './backendContracts.js';

function okResponse(payload: unknown, requestId?: string): Response {
  return {
    ok: true,
    status: 200,
    headers: {
      get: (key: string) => (key === 'X-Request-Id' ? requestId ?? null : null),
    },
    json: async () => payload,
  } as Response;
}

function errorResponse(status: number, payload: unknown, requestId?: string): Response {
  return {
    ok: false,
    status,
    headers: {
      get: (key: string) => (key === 'X-Request-Id' ? requestId ?? null : null),
    },
    json: async () => payload,
  } as Response;
}

const ingestionRequest: SafetyBackendIngestionRequest = {
  fileName: 'checklist.xlsx',
  fileContentBase64: 'YWJj',
  context: {
    uploadedByUpn: 'operator@hb.com',
    uploadedAt: '2026-04-24T00:00:00.000Z',
    fileName: 'checklist.xlsx',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
  },
};

describe('SafetyBackendCommandClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses exact preview route/body and propagates auth + request id', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      okResponse({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          preview: { commitReadiness: true },
        } satisfies SafetyBackendPreviewOperationResult,
      }),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com/',
      getApiToken: async () => 'token-preview',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    const result = await client.preview(ingestionRequest, { requestId: 'frontend-preview-1' });

    expect(result.frontendRequestId).toBe('frontend-preview-1');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/ingest/preview');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer token-preview',
      'X-Request-Id': 'frontend-preview-1',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(init.body))).toEqual(ingestionRequest);
  });

  it('uses exact replay route/body and request-id contract', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      okResponse({
        data: {
          success: true,
          requestAccepted: true,
          diagnostics: [],
          result: { state: 'committed' },
        } satisfies SafetyBackendOperationResult,
      }, 'backend-replay-req'),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-replay',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    const result = await client.replay(
      { parentRunId: 'run-123', supersedePrior: true },
      { requestId: 'frontend-replay-1' },
    );

    expect(result.requestId).toBe('backend-replay-req');
    expect(fetchSpy.mock.calls[0]?.[0]).toBe('https://functions.example.com/api/safety-records/replay');
    expect(JSON.parse(String((fetchSpy.mock.calls[0]?.[1] as RequestInit).body))).toEqual({
      parentRunId: 'run-123',
      supersedePrior: true,
    });
  });

  it('retries only retryable statuses and reports final attempts', async () => {
    const transient = errorResponse(503, { message: 'temporarily unavailable', code: 'SERVICE_UNAVAILABLE' });
    const success = okResponse({
      data: {
        success: true,
        requestAccepted: true,
        diagnostics: [],
        result: { state: 'committed' },
      } satisfies SafetyBackendOperationResult,
    });
    const fetchSpy = vi.fn().mockResolvedValueOnce(transient).mockResolvedValueOnce(success);
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-ingest',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 2,
    });

    const result = await client.ingest(ingestionRequest);

    expect(result.attempts).toBe(2);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not retry contract errors and preserves envelope fields', async () => {
    const failureEnvelope: SafetyBackendFailureEnvelope = {
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
    };
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(422, failureEnvelope, 'backend-422'));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-ingest',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 3,
    });

    await expect(client.ingest(ingestionRequest, { requestId: 'frontend-422' })).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'contract',
      code: 'GRAPH_PERMISSION_DENIED',
      requestId: 'backend-422',
      backendRequestId: 'backend-422',
      frontendRequestId: 'frontend-422',
      failureClass: 'graph-permission',
      previewFailureClass: 'project-unresolved',
      graphContext: { statusCode: 403 },
      operationData: failureEnvelope.data,
      attempts: 1,
      retryable: false,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('classifies auth failures and does not retry', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(401, { message: 'unauthorized', code: 'UNAUTH' }));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'bad-token',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 2,
    });

    await expect(client.preview(ingestionRequest)).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'auth',
      retryable: false,
      attempts: 1,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('classifies 403 as auth and does not retry', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(403, { message: 'forbidden', code: 'FORBIDDEN' }));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-403',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 3,
    });

    await expect(client.ingest(ingestionRequest)).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'auth',
      retryable: false,
      attempts: 1,
      code: 'FORBIDDEN',
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('classifies 400 as contract and does not retry', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(400, { message: 'invalid body', code: 'VALIDATION_ERROR' }));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-400',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 3,
    });

    await expect(client.preview(ingestionRequest)).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'contract',
      retryable: false,
      attempts: 1,
      code: 'VALIDATION_ERROR',
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('surfaces token acquisition errors before transport', async () => {
    const fetchSpy = vi.fn();
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => {
        throw new Error('token provider unavailable');
      },
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(client.ingest(ingestionRequest)).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      code: 'TOKEN_ACQUISITION_FAILED',
      errorKind: 'auth',
      httpStatus: 0,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
