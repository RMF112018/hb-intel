/**
 * My Work backend read-model client — bearer-token-protected GET seam.
 *
 * Calls `GET ${apiBaseUrl}/${MY_WORK_READ_MODEL_ROUTE_PATHS[routeId]}`
 * with an `Authorization: Bearer <token>` header. Token is acquired
 * fresh per request via the injected `getApiToken()` callback (no
 * caching). Expects the response body wrapped as `{ data: envelope }`.
 * Every failure mode (token reject, empty token, fetch reject, non-2xx,
 * malformed JSON, missing wrapper, non-envelope payload) routes to the
 * injected fixture fallback so React surfaces always receive a
 * type-valid envelope.
 *
 * @module api/myWorkBackendReadModelClient
 */

import type {
  MyProjectLinksReadModel,
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import {
  MY_WORK_READ_MODEL_ROUTE_PATHS,
  type AdobeSignOAuthStartInput,
  type AdobeSignOAuthStartResponse,
  type GetApiToken,
  type IMyWorkReadModelClient,
  type MyWorkReadModelRouteId,
} from './myWorkReadModelClient.js';

export type MyWorkReadModelFetch = (
  input: string,
  init: {
    method: 'GET' | 'POST';
    headers: Record<string, string>;
    body?: string;
  },
) => Promise<Response>;

const ADOBE_SIGN_OAUTH_START_ROUTE_PATH = 'my-work/me/adobe-sign/oauth/start' as const;

export interface MyWorkBackendReadModelClientOptions {
  readonly backendBaseUrl: string;
  readonly getApiToken: GetApiToken;
  readonly fallback: IMyWorkReadModelClient;
  readonly fetch?: MyWorkReadModelFetch;
}

export const normalizeBackendApiBaseUrl = (input: string): string => {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const buildAdobeQueueQueryString = (query?: MyWorkAdobeSignActionQueueQuery): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  if (typeof query.pageSize === 'number' && Number.isFinite(query.pageSize)) {
    params.set('pageSize', String(query.pageSize));
  }
  if (typeof query.cursor === 'string' && query.cursor.length > 0) {
    params.set('cursor', query.cursor);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const isEnvelopeShape = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.mode === 'string' &&
    typeof v.sourceStatus === 'string' &&
    v.readOnly === true &&
    Array.isArray(v.warnings) &&
    typeof v.generatedAtUtc === 'string' &&
    'data' in v
  );
};

const isWrappedEnvelope = <T>(value: unknown): value is { data: MyWorkReadModelEnvelope<T> } => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return 'data' in v && isEnvelopeShape(v.data);
};

class MyWorkBackendReadModelClient implements IMyWorkReadModelClient {
  private readonly apiBaseUrl: string;
  private readonly getApiToken: GetApiToken;
  private readonly fallback: IMyWorkReadModelClient;
  private readonly fetchImpl: MyWorkReadModelFetch;

  constructor(options: MyWorkBackendReadModelClientOptions) {
    this.apiBaseUrl = normalizeBackendApiBaseUrl(options.backendBaseUrl);
    this.getApiToken = options.getApiToken;
    this.fallback = options.fallback;
    this.fetchImpl =
      options.fetch ?? ((input, init) => globalThis.fetch(input, init as RequestInit));
  }

  private async callBackend<T>(
    routeId: MyWorkReadModelRouteId,
    fallback: () => Promise<MyWorkReadModelEnvelope<T>>,
    queryString = '',
  ): Promise<MyWorkReadModelEnvelope<T>> {
    let token: string;
    try {
      token = await this.getApiToken();
    } catch {
      return fallback();
    }
    if (!token || token.trim().length === 0) return fallback();

    const path = MY_WORK_READ_MODEL_ROUTE_PATHS[routeId];
    const url = `${this.apiBaseUrl}/${path}${queryString}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
    } catch {
      return fallback();
    }
    if (!response.ok) return fallback();

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return fallback();
    }
    if (!isWrappedEnvelope<T>(body)) return fallback();
    return body.data;
  }

  async getMyWorkHome(): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    return this.callBackend('home', () => this.fallback.getMyWorkHome());
  }

  async getAdobeSignActionQueue(
    query?: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    return this.callBackend(
      'adobe-sign-action-queue',
      () => this.fallback.getAdobeSignActionQueue(query),
      buildAdobeQueueQueryString(query),
    );
  }

  async getMyProjectLinks(): Promise<MyWorkReadModelEnvelope<MyProjectLinksReadModel>> {
    return this.callBackend('project-links', () => this.fallback.getMyProjectLinks());
  }

  async startAdobeSignOAuth(input: AdobeSignOAuthStartInput): Promise<AdobeSignOAuthStartResponse> {
    let token: string;
    try {
      token = await this.getApiToken();
    } catch {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }
    if (!token || token.trim().length === 0) {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }

    const url = `${this.apiBaseUrl}/${ADOBE_SIGN_OAUTH_START_ROUTE_PATH}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ returnPath: input.returnPath }),
      });
    } catch {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('adobe-sign-oauth-start-unauthorized');
    }
    if (response.status === 400) {
      throw new Error('adobe-sign-oauth-start-invalid-input');
    }
    if (response.status === 503) {
      throw new Error('adobe-sign-oauth-start-configuration-required');
    }
    if (!response.ok) {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }
    if (typeof body !== 'object' || body === null) {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }
    const data = (body as { data?: unknown }).data;
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as Record<string, unknown>).authorizationUrl !== 'string' ||
      typeof (data as Record<string, unknown>).stateExpiresAtUtc !== 'string'
    ) {
      throw new Error('adobe-sign-oauth-start-unreachable');
    }
    return {
      authorizationUrl: (data as Record<string, string>).authorizationUrl,
      stateExpiresAtUtc: (data as Record<string, string>).stateExpiresAtUtc,
    };
  }
}

export function createMyWorkBackendReadModelClient(
  options: MyWorkBackendReadModelClientOptions,
): IMyWorkReadModelClient {
  return new MyWorkBackendReadModelClient(options);
}
