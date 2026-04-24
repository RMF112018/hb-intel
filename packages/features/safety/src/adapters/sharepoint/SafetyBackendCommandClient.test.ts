import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SafetyBackendCommandClient } from './SafetyBackendCommandClient.js';
import { SafetyBackendCommandError } from './errors.js';
import type {
  SafetyBackendFailureEnvelope,
  SafetyBackendIngestionRequest,
  SafetyBackendOperationResult,
  SafetyBackendPreviewOperationResult,
} from './backendContracts.js';
import {
  resetSafetyFrontendTelemetrySink,
  setSafetyFrontendTelemetrySink,
  type SafetyFrontendTelemetryEvent,
} from '../../telemetry/safetyFrontendTelemetry.js';

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
  beforeEach(() => {
    // Silence the default console sink during contract tests; the dedicated
    // telemetry-correlation block below installs its own capturing sink.
    setSafetyFrontendTelemetrySink(() => undefined);
  });

  afterEach(() => {
    resetSafetyFrontendTelemetrySink();
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

  it('classifies missing bearer token responses as auth instead of network', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(401, { message: 'missing bearer', code: 'MISSING_BEARER' }));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 2,
    });

    await expect(client.preview(ingestionRequest)).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'auth',
      code: 'MISSING_BEARER',
      retryable: false,
      attempts: 1,
      httpStatus: 401,
    } satisfies Partial<SafetyBackendCommandError>);
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).not.toHaveProperty('Authorization');
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

  it('fails closed when success envelope is missing data payload', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(okResponse({ success: true }));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-ingest',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(client.ingest(ingestionRequest, { requestId: 'frontend-success-missing-data' })).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'contract',
      frontendRequestId: 'frontend-success-missing-data',
      retryable: false,
    } satisfies Partial<SafetyBackendCommandError>);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('preserves failure classes and body request id on 422 while honoring response request header', async () => {
    const failureEnvelope: SafetyBackendFailureEnvelope = {
      message: 'Preview failed due to unresolved project scope.',
      code: 'PREVIEW_VALIDATION_FAILED',
      requestId: 'backend-422-body',
      failureClass: 'preview-validation',
      previewFailureClass: 'project-unresolved',
      data: {
        success: false,
        requestAccepted: true,
        requestId: 'backend-422-body',
        diagnostics: [],
      },
    };
    const fetchSpy = vi.fn().mockResolvedValue(errorResponse(422, failureEnvelope, 'backend-422-header'));
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-preview',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(client.preview(ingestionRequest, { requestId: 'frontend-422-proof' })).rejects.toMatchObject({
      name: 'SafetyBackendCommandError',
      errorKind: 'contract',
      requestId: 'backend-422-header',
      backendRequestId: 'backend-422-header',
      frontendRequestId: 'frontend-422-proof',
      failureClass: 'preview-validation',
      previewFailureClass: 'project-unresolved',
      operationData: {
        requestId: 'backend-422-body',
      },
    } satisfies Partial<SafetyBackendCommandError>);
  });

  it('promotes nested failure classification from backend error details', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      errorResponse(
        500,
        {
          message: 'internal error',
          code: 'INTERNAL_ERROR',
          details: {
            failureClass: 'commit-failed',
            previewFailureClass: 'project-unresolved',
          },
        },
        'backend-500',
      ),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-replay',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(client.replay({ parentRunId: 'run-500' })).rejects.toMatchObject({
      errorKind: 'non-transient',
      failureClass: 'commit-failed',
      previewFailureClass: 'project-unresolved',
      requestId: 'backend-500',
      backendRequestId: 'backend-500',
    } satisfies Partial<SafetyBackendCommandError>);
  });

  it('uses operation data requestId when success header omits requestId', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      okResponse({
        data: {
          success: true,
          requestAccepted: true,
          requestId: 'backend-success-body-id',
          diagnostics: [],
          result: { state: 'committed' },
        } satisfies SafetyBackendOperationResult,
      }),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-ingest',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    const result = await client.ingest(ingestionRequest, { requestId: 'frontend-success-id' });
    expect(result.requestId).toBe('backend-success-body-id');
    expect(result.frontendRequestId).toBe('frontend-success-id');
  });
});

describe('SafetyBackendCommandClient — frontend telemetry correlation', () => {
  let captured: SafetyFrontendTelemetryEvent[];

  function captureEvents(): void {
    captured = [];
    setSafetyFrontendTelemetrySink((event) => captured.push(event));
  }

  afterEach(() => {
    resetSafetyFrontendTelemetrySink();
    vi.restoreAllMocks();
  });

  it('emits command.start then command.complete with frontend + backend request IDs on a happy preview', async () => {
    captureEvents();
    const fetchSpy = vi.fn().mockResolvedValue(
      okResponse(
        {
          data: {
            success: true,
            requestAccepted: true,
            diagnostics: [],
            preview: { commitReadiness: true },
          } satisfies SafetyBackendPreviewOperationResult,
        },
        'backend-preview-99',
      ),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com/',
      getApiToken: async () => 'token-preview',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await client.preview(ingestionRequest, { requestId: 'frontend-preview-tlm' });

    const names = captured.map((event) => event.name);
    expect(names).toEqual([
      'safety.frontend.command.start',
      'safety.frontend.command.complete',
    ]);
    const start = captured[0];
    expect(start.operation).toBe('preview');
    expect(start.lifecycle).toBe('start');
    expect(start.frontendRequestId).toBe('frontend-preview-tlm');
    expect(start.requestId).toBeUndefined();

    const complete = captured[1];
    expect(complete.operation).toBe('preview');
    expect(complete.lifecycle).toBe('complete');
    expect(complete.frontendRequestId).toBe('frontend-preview-tlm');
    expect(complete.requestId).toBe('backend-preview-99');
    expect(complete.properties).toMatchObject({
      route: '/api/safety-records/ingest/preview',
      attempts: 1,
      httpStatus: 200,
    });
    expect(typeof complete.properties?.durationMs).toBe('number');
  });

  it('emits command.attempt between transient failure and successful retry', async () => {
    captureEvents();
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(
        errorResponse(
          503,
          {
            data: { success: false, requestAccepted: true, diagnostics: [] },
            message: 'transient',
            code: 'BACKEND_UPSTREAM',
          } satisfies SafetyBackendFailureEnvelope,
          'backend-attempt-1',
        ),
      )
      .mockResolvedValueOnce(
        okResponse(
          {
            data: {
              success: true,
              requestAccepted: true,
              diagnostics: [],
              result: { state: 'committed' },
            } satisfies SafetyBackendOperationResult,
          },
          'backend-attempt-2',
        ),
      );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-ingest',
      fetchImpl: fetchSpy as unknown as typeof fetch,
      maxAttempts: 2,
    });

    await client.ingest(ingestionRequest, { requestId: 'frontend-ingest-tlm' });

    const names = captured.map((event) => event.name);
    expect(names).toEqual([
      'safety.frontend.command.start',
      'safety.frontend.command.attempt',
      'safety.frontend.command.complete',
    ]);
    const attemptEvent = captured[1];
    expect(attemptEvent.operation).toBe('ingest');
    expect(attemptEvent.lifecycle).toBe('attempt');
    expect(attemptEvent.properties).toMatchObject({
      attempt: 1,
      errorKind: 'transient',
      httpStatus: 503,
    });
    const completeEvent = captured[2];
    expect(completeEvent.requestId).toBe('backend-attempt-2');
    expect(completeEvent.properties?.attempts).toBe(2);
  });

  it('emits command.failed with backend correlation IDs and failure class on a 422 replay', async () => {
    captureEvents();
    const fetchSpy = vi.fn().mockResolvedValue(
      errorResponse(
        422,
        {
          data: { success: false, requestAccepted: true, diagnostics: [] },
          message: 'preview-rejected',
          code: 'PREVIEW_BLOCKED',
          failureClass: 'duplicate-suspected',
          previewFailureClass: 'duplicate-suspected',
          requestId: 'backend-replay-422',
        } satisfies SafetyBackendFailureEnvelope,
        'backend-replay-422',
      ),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-replay',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(
      client.replay(
        { parentRunId: 'run-7', supersedePrior: false },
        { requestId: 'frontend-replay-tlm' },
      ),
    ).rejects.toBeInstanceOf(SafetyBackendCommandError);

    const names = captured.map((event) => event.name);
    expect(names).toEqual([
      'safety.frontend.command.start',
      'safety.frontend.command.failed',
    ]);
    const failed = captured[1];
    expect(failed.operation).toBe('replay');
    expect(failed.lifecycle).toBe('failed');
    expect(failed.frontendRequestId).toBe('frontend-replay-tlm');
    expect(failed.requestId).toBe('backend-replay-422');
    expect(failed.properties).toMatchObject({
      httpStatus: 422,
      code: 'PREVIEW_BLOCKED',
      errorKind: 'contract',
      failureClass: 'duplicate-suspected',
      previewFailureClass: 'duplicate-suspected',
      attempts: 1,
    });
  });

  it('emits command.cancelled when the caller aborts mid-flight', async () => {
    captureEvents();
    const controller = new AbortController();
    const fetchSpy = vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
      // Trigger user-initiated abort once fetch is invoked; the client must
      // surface this as a cancellation, not a transient transport failure.
      controller.abort();
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';
      // Mirror the signal state the runtime would expose.
      Object.defineProperty(init.signal ?? {}, 'aborted', { value: true });
      throw abortError;
    });
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'token-abort',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await expect(
      client.preview(ingestionRequest, {
        requestId: 'frontend-abort-tlm',
        signal: controller.signal,
      }),
    ).rejects.toBeInstanceOf(SafetyBackendCommandError);

    const cancelled = captured.find((event) => event.lifecycle === 'cancelled');
    expect(cancelled).toBeDefined();
    expect(cancelled?.name).toBe('safety.frontend.command.cancelled');
    expect(cancelled?.operation).toBe('preview');
    expect(cancelled?.frontendRequestId).toBe('frontend-abort-tlm');
    expect(cancelled?.properties?.errorKind).toBe('aborted');
  });

  it('does not emit token, file content, or workbook bytes in any property', async () => {
    captureEvents();
    const fetchSpy = vi.fn().mockResolvedValue(
      okResponse(
        {
          data: {
            success: true,
            requestAccepted: true,
            diagnostics: [],
            preview: { commitReadiness: true },
          } satisfies SafetyBackendPreviewOperationResult,
        },
        'backend-redact',
      ),
    );
    const client = new SafetyBackendCommandClient({
      baseUrl: 'https://functions.example.com',
      getApiToken: async () => 'never-leak-this-token',
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    await client.preview(ingestionRequest, { requestId: 'frontend-redact-tlm' });

    const serialized = JSON.stringify(captured);
    expect(serialized).not.toContain('never-leak-this-token');
    expect(serialized).not.toContain(ingestionRequest.fileContentBase64);
    expect(serialized).not.toContain('Bearer ');
  });
});
