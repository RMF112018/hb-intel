import type {
  SafetyBackendCommandOptions,
  SafetyBackendCommandResult,
  SafetyBackendErrorEnvelope,
  SafetyBackendFailureEnvelope,
  SafetyBackendIngestionRequest,
  SafetyBackendOperationResult,
  SafetyBackendPreviewOperationResult,
  SafetyBackendReplayRequest,
  SafetyBackendSuccessEnvelope,
} from './backendContracts.js';
import { SafetyBackendCommandError } from './errors.js';

export interface SafetyBackendCommandClientOptions {
  readonly baseUrl: string;
  readonly getApiToken?: () => Promise<string>;
  readonly fetchImpl?: typeof fetch;
  readonly defaultTimeoutMs?: number;
  readonly maxAttempts?: number;
}

export class SafetyBackendCommandClient {
  private readonly baseUrl: string;
  private readonly getApiToken?: () => Promise<string>;
  private readonly fetchImpl: typeof fetch;
  private readonly defaultTimeoutMs: number;
  private readonly maxAttempts: number;

  constructor(options: SafetyBackendCommandClientOptions) {
    this.baseUrl = trimTrailingSlash(options.baseUrl);
    this.getApiToken = options.getApiToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 20000;
    this.maxAttempts = Math.max(1, options.maxAttempts ?? 2);
  }

  async preview(
    request: SafetyBackendIngestionRequest,
    options?: SafetyBackendCommandOptions,
  ): Promise<SafetyBackendCommandResult<SafetyBackendPreviewOperationResult>> {
    return this.postOperation<SafetyBackendPreviewOperationResult>(
      '/api/safety-records/ingest/preview',
      request,
      options,
    );
  }

  async ingest(
    request: SafetyBackendIngestionRequest,
    options?: SafetyBackendCommandOptions,
  ): Promise<SafetyBackendCommandResult<SafetyBackendOperationResult>> {
    return this.postOperation<SafetyBackendOperationResult>('/api/safety-records/ingest', request, options);
  }

  async replay(
    request: SafetyBackendReplayRequest,
    options?: SafetyBackendCommandOptions,
  ): Promise<SafetyBackendCommandResult<SafetyBackendOperationResult>> {
    return this.postOperation<SafetyBackendOperationResult>('/api/safety-records/replay', request, options);
  }

  private async postOperation<TData>(
    path: string,
    body: unknown,
    options?: SafetyBackendCommandOptions,
  ): Promise<SafetyBackendCommandResult<TData>> {
    const endpoint = `${this.baseUrl}${path}`;
    const frontendRequestId = options?.requestId ?? createRequestId();
    const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;
    let token: string | undefined;
    try {
      token = this.getApiToken ? await this.getApiToken() : undefined;
    } catch (error) {
      throw new SafetyBackendCommandError({
        endpoint,
        httpStatus: 0,
        message: error instanceof Error ? error.message : 'Failed to acquire API token.',
        code: 'TOKEN_ACQUISITION_FAILED',
        errorKind: 'auth',
        frontendRequestId,
      });
    }

    let attempt = 0;
    let lastError: SafetyBackendCommandError | null = null;

    while (attempt < this.maxAttempts) {
      attempt += 1;
      try {
        const response = await this.executeAttempt<TData>({
          endpoint,
          body,
          token,
          frontendRequestId,
          timeoutMs,
          signal: options?.signal,
          attempt,
        });
        return response;
      } catch (error) {
        const commandError = toCommandError(
          error,
          endpoint,
          frontendRequestId,
          attempt,
          options?.signal?.aborted === true,
        );
        lastError = commandError;
        if (!commandError.retryable || attempt >= this.maxAttempts) {
          throw commandError;
        }
        await delay(150 * attempt);
      }
    }

    if (lastError) {
      throw lastError;
    }
    throw new SafetyBackendCommandError({
      endpoint,
      httpStatus: 0,
      message: 'Backend command failed before an attempt was executed.',
      errorKind: 'non-transient',
      frontendRequestId,
    });
  }

  private async executeAttempt<TData>(input: {
    endpoint: string;
    body: unknown;
    token?: string;
    frontendRequestId: string;
    timeoutMs: number;
    signal?: AbortSignal;
    attempt: number;
  }): Promise<SafetyBackendCommandResult<TData>> {
    const { signal, timeoutMs, endpoint, frontendRequestId } = input;
    const timeoutController = new AbortController();
    const timeoutHandle = setTimeout(() => timeoutController.abort('timeout'), timeoutMs);
    const attemptSignal = composeSignals(signal, timeoutController.signal);
    try {
      const response = await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': frontendRequestId,
          ...(input.token ? { Authorization: `Bearer ${input.token}` } : {}),
        },
        body: JSON.stringify(input.body),
        signal: attemptSignal,
      });

      const requestIdFromHeader = response.headers.get('X-Request-Id') ?? undefined;
      const payload = await safeJson(response);

      if (response.ok) {
        const envelope = payload as SafetyBackendSuccessEnvelope<TData> | null;
        if (!envelope?.data) {
          throw new SafetyBackendCommandError({
            endpoint,
            httpStatus: response.status,
            requestId: requestIdFromHeader,
            backendRequestId: requestIdFromHeader,
            message: 'Backend success envelope missing data payload.',
            errorKind: 'contract',
            retryable: false,
            attempts: input.attempt,
            frontendRequestId,
          });
        }
        return {
          data: envelope.data,
          requestId: requestIdFromHeader,
          frontendRequestId,
          attempts: input.attempt,
        };
      }

      const failure = payload as SafetyBackendFailureEnvelope | null;
      const errorEnvelope = payload as SafetyBackendErrorEnvelope | null;
      const requestId = requestIdFromHeader ?? failure?.requestId ?? errorEnvelope?.requestId;
      const httpStatus = response.status;
      const errorKind = classifyStatus(httpStatus);
      throw new SafetyBackendCommandError({
        endpoint,
        httpStatus,
        requestId,
        backendRequestId: requestId,
        frontendRequestId,
        message: failure?.message ?? errorEnvelope?.message ?? `Backend command failed (${httpStatus}).`,
        code: failure?.code ?? errorEnvelope?.code,
        failureClass: failure?.failureClass,
        previewFailureClass: failure?.previewFailureClass,
        graphContext: failure?.graphContext,
        details: errorEnvelope?.details,
        operationData: failure?.data,
        errorKind,
        retryable: isRetryableStatus(httpStatus),
        attempts: input.attempt,
      });
    } catch (error) {
      const isTimeoutAbort = timeoutController.signal.aborted && !(signal?.aborted ?? false);
      if (error instanceof SafetyBackendCommandError) {
        throw error;
      }
      if (attemptSignal?.aborted) {
        throw new SafetyBackendCommandError({
          endpoint,
          httpStatus: 0,
          message: isTimeoutAbort
            ? `Safety backend command timed out after ${timeoutMs}ms.`
            : 'Safety backend command was cancelled.',
          code: isTimeoutAbort ? 'BACKEND_TIMEOUT' : 'BACKEND_ABORTED',
          errorKind: isTimeoutAbort ? 'timeout' : 'aborted',
          retryable: false,
          attempts: input.attempt,
          frontendRequestId,
        });
      }
      throw new SafetyBackendCommandError({
        endpoint,
        httpStatus: 0,
        message: error instanceof Error ? error.message : 'Backend command transport failed.',
        code: 'BACKEND_TRANSPORT_ERROR',
        errorKind: 'transient',
        retryable: true,
        attempts: input.attempt,
        frontendRequestId,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }
  }
}

function toCommandError(
  error: unknown,
  endpoint: string,
  frontendRequestId: string,
  attempts: number,
  userAborted: boolean,
): SafetyBackendCommandError {
  if (error instanceof SafetyBackendCommandError) {
    return new SafetyBackendCommandError({
      endpoint: error.endpoint,
      httpStatus: error.httpStatus,
      message: error.message,
      requestId: error.requestId,
      backendRequestId: error.backendRequestId,
      code: error.code,
      failureClass: error.failureClass,
      previewFailureClass: error.previewFailureClass,
      graphContext: error.graphContext,
      details: error.details,
      operationData: error.operationData,
      errorKind: error.errorKind,
      retryable: error.retryable,
      attempts,
      frontendRequestId,
    });
  }
  return new SafetyBackendCommandError({
    endpoint,
    httpStatus: 0,
    message: error instanceof Error ? error.message : 'Backend command failed.',
    code: userAborted ? 'BACKEND_ABORTED' : 'BACKEND_TRANSPORT_ERROR',
    errorKind: userAborted ? 'aborted' : 'transient',
    retryable: false,
    attempts,
    frontendRequestId,
  });
}

function classifyStatus(httpStatus: number):
  | 'transient'
  | 'non-transient'
  | 'auth'
  | 'contract' {
  if (httpStatus === 401 || httpStatus === 403) return 'auth';
  if (httpStatus === 400 || httpStatus === 404 || httpStatus === 422) return 'contract';
  if (isRetryableStatus(httpStatus)) return 'transient';
  return 'non-transient';
}

function isRetryableStatus(httpStatus: number): boolean {
  return httpStatus === 408 || httpStatus === 429 || httpStatus === 502 || httpStatus === 503 || httpStatus === 504;
}

function composeSignals(...signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter((signal): signal is AbortSignal => !!signal);
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of active) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `safety-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function safeJson(response: Response): Promise<unknown | null> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
