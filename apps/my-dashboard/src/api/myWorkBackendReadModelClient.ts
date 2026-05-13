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
  type GetApiToken,
  type IMyWorkReadModelClient,
  type MyWorkReadModelRouteId,
} from './myWorkReadModelClient.js';

export type MyWorkReadModelFetch = (
  input: string,
  init: { method: 'GET'; headers: Record<string, string> },
) => Promise<Response>;

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
}

export function createMyWorkBackendReadModelClient(
  options: MyWorkBackendReadModelClientOptions,
): IMyWorkReadModelClient {
  return new MyWorkBackendReadModelClient(options);
}
