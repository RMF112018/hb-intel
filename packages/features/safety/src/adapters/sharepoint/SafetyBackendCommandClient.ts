import type {
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
}

export class SafetyBackendCommandClient {
  private readonly baseUrl: string;
  private readonly getApiToken?: () => Promise<string>;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SafetyBackendCommandClientOptions) {
    this.baseUrl = trimTrailingSlash(options.baseUrl);
    this.getApiToken = options.getApiToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async preview(request: SafetyBackendIngestionRequest): Promise<SafetyBackendPreviewOperationResult> {
    return this.postOperation<SafetyBackendPreviewOperationResult>(
      '/api/safety-records/ingest/preview',
      request,
    );
  }

  async ingest(request: SafetyBackendIngestionRequest): Promise<SafetyBackendOperationResult> {
    return this.postOperation<SafetyBackendOperationResult>('/api/safety-records/ingest', request);
  }

  async replay(request: SafetyBackendReplayRequest): Promise<SafetyBackendOperationResult> {
    return this.postOperation<SafetyBackendOperationResult>('/api/safety-records/replay', request);
  }

  private async postOperation<TData>(path: string, body: unknown): Promise<TData> {
    const endpoint = `${this.baseUrl}${path}`;
    let token: string | undefined;
    try {
      token = this.getApiToken ? await this.getApiToken() : undefined;
    } catch (error) {
      throw new SafetyBackendCommandError({
        endpoint,
        httpStatus: 0,
        message: error instanceof Error ? error.message : 'Failed to acquire API token.',
        code: 'TOKEN_ACQUISITION_FAILED',
      });
    }

    let response: Response;
    try {
      response = await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new SafetyBackendCommandError({
        endpoint,
        httpStatus: 0,
        message: error instanceof Error ? error.message : 'Backend command transport failed.',
        code: 'BACKEND_TRANSPORT_ERROR',
      });
    }
    const requestIdFromHeader = response.headers.get('X-Request-Id') ?? undefined;
    const payload = await safeJson(response);

    if (response.ok) {
      const envelope = payload as SafetyBackendSuccessEnvelope<TData> | null;
      if (!envelope?.data) {
        throw new SafetyBackendCommandError({
          endpoint,
          httpStatus: response.status,
          requestId: requestIdFromHeader,
          message: 'Backend success envelope missing data payload.',
        });
      }
      return envelope.data;
    }

    const failure = payload as SafetyBackendFailureEnvelope | null;
    const errorEnvelope = payload as SafetyBackendErrorEnvelope | null;
    throw new SafetyBackendCommandError({
      endpoint,
      httpStatus: response.status,
      requestId: requestIdFromHeader ?? failure?.requestId ?? errorEnvelope?.requestId,
      message: failure?.message ?? errorEnvelope?.message ?? `Backend command failed (${response.status}).`,
      code: failure?.code ?? errorEnvelope?.code,
      failureClass: failure?.failureClass,
      previewFailureClass: failure?.previewFailureClass,
      graphContext: failure?.graphContext,
      details: errorEnvelope?.details,
      operationData: failure?.data,
    });
  }
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
