/**
 * ProxyHttpClient — shared HTTP transport for B1 proxy adapters.
 *
 * Provides Bearer auth, timeout, X-Request-Id, and error normalization.
 * All responses are parsed through the locked envelope conventions (P1-E1).
 *
 * Hook points (onBeforeRequest, onAfterResponse) are exposed for future
 * D1 retry/recovery wiring but are not activated in this foundation.
 */

import type { ProxyConfig } from './types.js';
import { DEFAULT_TIMEOUT_MS } from './constants.js';
import { normalizeHttpError } from './errors.js';
import { HbcDataAccessError } from '../../errors/index.js';

/** Hook called before each request. Can be used for retry/telemetry wiring. */
export type BeforeRequestHook = (url: string, init: RequestInit) => void;

/** Hook called after each response. Can be used for retry/telemetry wiring. */
export type AfterResponseHook = (url: string, response: Response) => void;

export class ProxyHttpClient {
  private readonly baseUrl: string;
  private readonly getToken: (() => Promise<string>) | undefined;
  private readonly accessToken: string | undefined;
  private readonly timeout: number;

  /** D1 hook point: called before each fetch. Not wired in foundation. */
  onBeforeRequest?: BeforeRequestHook;

  /** D1 hook point: called after each fetch. Not wired in foundation. */
  onAfterResponse?: AfterResponseHook;

  constructor(config: ProxyConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.getToken = config.getToken;
    this.accessToken = config.accessToken;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  async delete(path: string): Promise<void> {
    await this.requestRaw('DELETE', path);
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>,
  ): Promise<T> {
    const response = await this.requestRaw(method, path, body, params);

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
  ): Promise<Response> {
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': crypto.randomUUID(),
    };

    // Per-request token acquisition: getToken() is called on every request
    // because MSAL tokens expire and must be refreshed via acquireTokenSilent().
    const token = this.getToken ? await this.getToken() : this.accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const init: RequestInit = {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };

    this.onBeforeRequest?.(url, init);

    let response: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
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

    this.onAfterResponse?.(url, response);

    if (!response.ok) {
      let errorBody: unknown = null;
      try {
        errorBody = await response.json();
      } catch {
        // Body may not be JSON — normalizeHttpError handles null body
      }
      throw normalizeHttpError(response.status, errorBody, url);
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
