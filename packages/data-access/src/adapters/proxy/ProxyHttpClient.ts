/**
 * ProxyHttpClient — shared HTTP transport for B1 proxy adapters.
 *
 * Provides Bearer auth, timeout, X-Request-Id, retry (D1), idempotency
 * header injection, and error normalization.
 * All responses are parsed through the locked envelope conventions (P1-E1).
 *
 * P1-C3: Emits proxy.request.start/success/error telemetry events.
 * P1-D1: Wraps requests with withRetry using READ/WRITE retry policies.
 */

import type { ProxyConfig } from './types.js';
import { DEFAULT_TIMEOUT_MS } from './constants.js';
import { normalizeHttpError } from './errors.js';
import { HbcDataAccessError } from '../../errors/index.js';
import {
  withRetry,
  READ_RETRY_POLICY,
  WRITE_RETRY_POLICY,
  type RetryPolicy,
} from '../../retry/retry-policy.js';
import type { IdempotencyContext } from '../../retry/idempotency.js';

/** Per-request metadata threaded from repositories for telemetry. */
export interface RequestMetadata {
  /** Domain area (e.g., 'leads', 'schedule', 'auth'). */
  domain: string;
  /** Operation name (e.g., 'getAll', 'create', 'fetchCollection'). */
  operation: string;
}

/** Hook called before each request. Can be used for retry/telemetry wiring. */
export type BeforeRequestHook = (url: string, init: RequestInit, metadata?: RequestMetadata) => void;

/** Hook called after each response. Can be used for retry/telemetry wiring. */
export type AfterResponseHook = (url: string, response: Response, metadata?: RequestMetadata) => void;

/**
 * Emit a structured telemetry event via console.log.
 * Phase 1 PWA = console-only telemetry (C3 §2.1.9).
 */
function emitTelemetry(name: string, properties: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    _telemetryType: 'customEvent',
    name,
    ...properties,
  }));
}

export class ProxyHttpClient {
  private readonly baseUrl: string;
  private readonly getToken: (() => Promise<string>) | undefined;
  private readonly accessToken: string | undefined;
  private readonly timeout: number;
  private readonly readPolicy: RetryPolicy;
  private readonly writePolicy: RetryPolicy;

  /** D1 hook point: called before each fetch. */
  onBeforeRequest?: BeforeRequestHook;

  /** D1 hook point: called after each fetch. */
  onAfterResponse?: AfterResponseHook;

  constructor(config: ProxyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.getToken = config.getToken;
    this.accessToken = config.accessToken;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
    this.readPolicy = config.readRetryPolicy ?? READ_RETRY_POLICY;
    this.writePolicy = config.writeRetryPolicy ?? WRITE_RETRY_POLICY;
  }

  async get<T>(path: string, params?: Record<string, string>, metadata?: RequestMetadata): Promise<T> {
    return withRetry(
      () => this.request<T>('GET', path, undefined, params, metadata),
      this.readPolicy,
    );
  }

  async post<T>(path: string, body: unknown, metadata?: RequestMetadata, idempotency?: IdempotencyContext): Promise<T> {
    return withRetry(
      () => this.request<T>('POST', path, body, undefined, metadata, idempotency),
      this.writePolicy,
    );
  }

  async put<T>(path: string, body: unknown, metadata?: RequestMetadata, idempotency?: IdempotencyContext): Promise<T> {
    return withRetry(
      () => this.request<T>('PUT', path, body, undefined, metadata, idempotency),
      this.writePolicy,
    );
  }

  async patch<T>(path: string, body: unknown, metadata?: RequestMetadata): Promise<T> {
    return withRetry(
      () => this.request<T>('PATCH', path, body, undefined, metadata),
      this.writePolicy,
    );
  }

  async delete(path: string, metadata?: RequestMetadata): Promise<void> {
    await withRetry(
      () => this.requestRaw('DELETE', path, undefined, undefined, metadata),
      this.writePolicy,
    );
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
    metadata?: RequestMetadata,
    idempotency?: IdempotencyContext,
  ): Promise<T> {
    const response = await this.requestRaw(method, path, body, params, metadata, idempotency);

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private async requestRaw(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
    metadata?: RequestMetadata,
    idempotency?: IdempotencyContext,
  ): Promise<Response> {
    const url = this.buildUrl(path, params);
    const correlationId = crypto.randomUUID();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': correlationId,
    };

    // Per-request token acquisition: getToken() is called on every request
    // because MSAL tokens expire and must be refreshed via acquireTokenSilent().
    const token = this.getToken ? await this.getToken() : this.accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // D1: Idempotency header injection for POST/PUT when context is provided
    if (idempotency) {
      headers['Idempotency-Key'] = idempotency.key;
      headers['X-Idempotency-Operation'] = idempotency.operation;
    }

    const init: RequestInit = {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };

    // P1-C3: proxy.request.start telemetry
    const telemetryBase = metadata
      ? { domain: metadata.domain, operation: metadata.operation, correlationId, method }
      : { correlationId, method };

    if (metadata) {
      emitTelemetry('proxy.request.start', telemetryBase);
    }

    this.onBeforeRequest?.(url, init, metadata);

    const startMs = Date.now();
    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (err) {
      const durationMs = Date.now() - startMs;
      const errorCode = err instanceof DOMException && err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR';

      if (metadata) {
        emitTelemetry('proxy.request.error', { ...telemetryBase, durationMs, errorCode });
      }

      if (errorCode === 'TIMEOUT') {
        throw new HbcDataAccessError(
          `Request timed out after ${this.timeout}ms: ${method} ${url}`,
          'TIMEOUT',
        );
      }
      throw new HbcDataAccessError(
        `Network error: ${method} ${url} — ${err instanceof Error ? err.message : String(err)}`,
        'NETWORK_ERROR',
        err,
      );
    }

    this.onAfterResponse?.(url, response, metadata);

    if (!response.ok) {
      const durationMs = Date.now() - startMs;
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        // Body may not be JSON — normalizeHttpError handles null body
      }

      if (metadata) {
        emitTelemetry('proxy.request.error', {
          ...telemetryBase,
          durationMs,
          statusCode: response.status,
          errorCode: `HTTP_${response.status}`,
        });
      }

      throw normalizeHttpError(response.status, errorBody, url);
    }

    // P1-C3: proxy.request.success telemetry
    if (metadata) {
      emitTelemetry('proxy.request.success', {
        ...telemetryBase,
        durationMs: Date.now() - startMs,
        statusCode: response.status,
      });
    }

    return response;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
