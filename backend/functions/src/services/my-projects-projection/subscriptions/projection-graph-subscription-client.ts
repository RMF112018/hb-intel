/**
 * My Projects projection — Microsoft Graph `/subscriptions` REST client.
 *
 * Owns POST / PATCH / DELETE / GET against `https://graph.microsoft.com/v1.0/subscriptions`
 * for the two projection source-list subscriptions. Reuses the existing
 * federated Graph token lane (`IGraphAccessTokenProvider` from
 * legacy-fallback/federated-graph-token-provider) so all Graph identity flows
 * through the same audited path.
 *
 * Returns typed outcomes — closed-set failure codes only — so the manager can
 * persist sanitized state without leaking raw Graph error bodies into
 * telemetry. Live invocation against the tenant is gated by `Sites.Read.All`
 * Application consent (Runbook 03); the client itself never short-circuits
 * for permission — it lets Graph return 403 and surfaces it as
 * `graph-403-forbidden`.
 */

import { createDefaultFederatedGraphTokenProvider } from '../../legacy-fallback/federated-graph-token-provider.js';
import type { IGraphAccessTokenProvider } from '../../legacy-fallback/federated-graph-token-provider.js';
import { sanitizeProjectionRunNotes } from '../state/run-repository.js';

const GRAPH_DEFAULT_BASE = 'https://graph.microsoft.com/v1.0';

export type ProjectionGraphSubscriptionFailureCode =
  | 'graph-400-bad-request'
  | 'graph-401-unauthorized'
  | 'graph-403-forbidden'
  | 'graph-404-not-found'
  | 'graph-410-gone'
  | 'graph-409-conflict'
  | 'graph-429-throttled'
  | 'graph-5xx'
  | 'graph-network'
  | 'token-acquisition-failed'
  | 'invalid-payload';

export interface IProjectionSubscriptionRecord {
  readonly subscriptionId: string;
  readonly resource: string;
  readonly notificationUrl?: string;
  readonly applicationId?: string;
  readonly expirationDateTimeUtc: string;
  readonly changeType?: string;
}

export type IProjectionGraphCreateOutcome =
  | { readonly ok: true; readonly subscription: IProjectionSubscriptionRecord }
  | {
      readonly ok: false;
      readonly failureCode: ProjectionGraphSubscriptionFailureCode;
      readonly status?: number;
      readonly sanitizedReason: string;
    };

export type IProjectionGraphRenewOutcome = IProjectionGraphCreateOutcome;

export type IProjectionGraphGetOutcome =
  | { readonly ok: true; readonly subscription: IProjectionSubscriptionRecord }
  | { readonly ok: false; readonly failureCode: 'graph-404-not-found' }
  | {
      readonly ok: false;
      readonly failureCode: Exclude<ProjectionGraphSubscriptionFailureCode, 'graph-404-not-found'>;
      readonly status?: number;
      readonly sanitizedReason: string;
    };

export type IProjectionGraphDeleteOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly failureCode: 'graph-404-not-found' | 'graph-410-gone' }
  | {
      readonly ok: false;
      readonly failureCode: Exclude<
        ProjectionGraphSubscriptionFailureCode,
        'graph-404-not-found' | 'graph-410-gone'
      >;
      readonly status?: number;
      readonly sanitizedReason: string;
    };

export interface IProjectionGraphSubscriptionClient {
  createSubscription(args: {
    resource: string;
    notificationUrl: string;
    clientState: string;
    expirationDateTimeUtc: string;
    changeType: 'updated' | 'created' | 'deleted' | 'updated,deleted' | string;
  }): Promise<IProjectionGraphCreateOutcome>;
  renewSubscription(args: {
    subscriptionId: string;
    expirationDateTimeUtc: string;
  }): Promise<IProjectionGraphRenewOutcome>;
  deleteSubscription(args: { subscriptionId: string }): Promise<IProjectionGraphDeleteOutcome>;
  getSubscription(args: { subscriptionId: string }): Promise<IProjectionGraphGetOutcome>;
}

export interface IProjectionGraphSubscriptionClientOptions {
  readonly tokenProvider?: IGraphAccessTokenProvider;
  readonly fetchImpl?: typeof fetch;
  readonly graphBaseUrl?: string;
}

interface IRawSubscription {
  readonly id?: unknown;
  readonly resource?: unknown;
  readonly notificationUrl?: unknown;
  readonly applicationId?: unknown;
  readonly expirationDateTime?: unknown;
  readonly changeType?: unknown;
}

function classifyStatus(status: number): ProjectionGraphSubscriptionFailureCode {
  switch (status) {
    case 400:
      return 'graph-400-bad-request';
    case 401:
      return 'graph-401-unauthorized';
    case 403:
      return 'graph-403-forbidden';
    case 404:
      return 'graph-404-not-found';
    case 409:
      return 'graph-409-conflict';
    case 410:
      return 'graph-410-gone';
    case 429:
      return 'graph-429-throttled';
    default:
      if (status >= 500 && status <= 599) return 'graph-5xx';
      return 'graph-5xx';
  }
}

function parseSubscriptionResponse(body: unknown): IProjectionSubscriptionRecord | null {
  if (typeof body !== 'object' || body === null) return null;
  const raw = body as IRawSubscription;
  const subscriptionId = typeof raw.id === 'string' ? raw.id : '';
  const resource = typeof raw.resource === 'string' ? raw.resource : '';
  const expirationDateTimeUtc =
    typeof raw.expirationDateTime === 'string' ? raw.expirationDateTime : '';
  if (subscriptionId.length === 0 || expirationDateTimeUtc.length === 0) {
    return null;
  }
  return {
    subscriptionId,
    resource,
    notificationUrl: typeof raw.notificationUrl === 'string' ? raw.notificationUrl : undefined,
    applicationId: typeof raw.applicationId === 'string' ? raw.applicationId : undefined,
    expirationDateTimeUtc,
    changeType: typeof raw.changeType === 'string' ? raw.changeType : undefined,
  };
}

function isIsoDateTime(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  return !Number.isNaN(Date.parse(value));
}

class ProjectionGraphSubscriptionClient implements IProjectionGraphSubscriptionClient {
  private readonly tokenProvider: IGraphAccessTokenProvider;
  private readonly fetchImpl: typeof fetch;
  private readonly graphBaseUrl: string;

  constructor(opts: IProjectionGraphSubscriptionClientOptions = {}) {
    this.tokenProvider = opts.tokenProvider ?? createDefaultFederatedGraphTokenProvider();
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.graphBaseUrl = opts.graphBaseUrl ?? GRAPH_DEFAULT_BASE;
  }

  private async acquireToken(): Promise<{ token: string } | { error: string }> {
    try {
      const token = await this.tokenProvider.getGraphAccessToken();
      if (!token) {
        return { error: 'token provider returned an empty token' };
      }
      return { token };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: message };
    }
  }

  private async graphFetch(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<
    | { ok: true; status: number; body: unknown }
    | {
        ok: false;
        failureCode: ProjectionGraphSubscriptionFailureCode;
        status?: number;
        sanitizedReason: string;
      }
  > {
    const tokenResult = await this.acquireToken();
    if ('error' in tokenResult) {
      return {
        ok: false,
        failureCode: 'token-acquisition-failed',
        sanitizedReason:
          sanitizeProjectionRunNotes(tokenResult.error) ?? 'token acquisition failed',
      };
    }
    const url = `${this.graphBaseUrl}${path}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        failureCode: 'graph-network',
        sanitizedReason: sanitizeProjectionRunNotes(message) ?? 'graph network failure',
      };
    }
    if (response.ok) {
      const parsed = response.status === 204 ? null : await safeJson(response);
      return { ok: true, status: response.status, body: parsed };
    }
    const text = await response.text().catch(() => '');
    return {
      ok: false,
      failureCode: classifyStatus(response.status),
      status: response.status,
      sanitizedReason: sanitizeProjectionRunNotes(text) ?? `graph ${response.status}`,
    };
  }

  async createSubscription(args: {
    resource: string;
    notificationUrl: string;
    clientState: string;
    expirationDateTimeUtc: string;
    changeType: string;
  }): Promise<IProjectionGraphCreateOutcome> {
    if (
      typeof args.resource !== 'string' ||
      args.resource.length === 0 ||
      typeof args.notificationUrl !== 'string' ||
      args.notificationUrl.length === 0 ||
      typeof args.clientState !== 'string' ||
      args.clientState.length === 0 ||
      !isIsoDateTime(args.expirationDateTimeUtc) ||
      typeof args.changeType !== 'string' ||
      args.changeType.length === 0
    ) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'create subscription payload is missing required fields',
      };
    }
    const result = await this.graphFetch('POST', '/subscriptions', {
      changeType: args.changeType,
      notificationUrl: args.notificationUrl,
      resource: args.resource,
      expirationDateTime: args.expirationDateTimeUtc,
      clientState: args.clientState,
    });
    if (!result.ok) {
      return {
        ok: false,
        failureCode: result.failureCode,
        status: result.status,
        sanitizedReason: result.sanitizedReason,
      };
    }
    const parsed = parseSubscriptionResponse(result.body);
    if (parsed === null) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'graph create response missing required fields',
      };
    }
    return { ok: true, subscription: parsed };
  }

  async renewSubscription(args: {
    subscriptionId: string;
    expirationDateTimeUtc: string;
  }): Promise<IProjectionGraphRenewOutcome> {
    if (
      typeof args.subscriptionId !== 'string' ||
      args.subscriptionId.length === 0 ||
      !isIsoDateTime(args.expirationDateTimeUtc)
    ) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'renew subscription payload is missing required fields',
      };
    }
    const result = await this.graphFetch(
      'PATCH',
      `/subscriptions/${encodeURIComponent(args.subscriptionId)}`,
      { expirationDateTime: args.expirationDateTimeUtc },
    );
    if (!result.ok) {
      return {
        ok: false,
        failureCode: result.failureCode,
        status: result.status,
        sanitizedReason: result.sanitizedReason,
      };
    }
    const parsed = parseSubscriptionResponse(result.body);
    if (parsed === null) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'graph renew response missing required fields',
      };
    }
    return { ok: true, subscription: parsed };
  }

  async deleteSubscription(args: {
    subscriptionId: string;
  }): Promise<IProjectionGraphDeleteOutcome> {
    if (typeof args.subscriptionId !== 'string' || args.subscriptionId.length === 0) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'delete subscription payload is missing subscriptionId',
      };
    }
    const result = await this.graphFetch(
      'DELETE',
      `/subscriptions/${encodeURIComponent(args.subscriptionId)}`,
    );
    if (result.ok) return { ok: true };
    if (result.failureCode === 'graph-404-not-found' || result.failureCode === 'graph-410-gone') {
      return { ok: false, failureCode: result.failureCode };
    }
    return {
      ok: false,
      failureCode: result.failureCode,
      status: result.status,
      sanitizedReason: result.sanitizedReason,
    };
  }

  async getSubscription(args: { subscriptionId: string }): Promise<IProjectionGraphGetOutcome> {
    if (typeof args.subscriptionId !== 'string' || args.subscriptionId.length === 0) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'get subscription payload is missing subscriptionId',
      };
    }
    const result = await this.graphFetch(
      'GET',
      `/subscriptions/${encodeURIComponent(args.subscriptionId)}`,
    );
    if (!result.ok) {
      if (result.failureCode === 'graph-404-not-found') {
        return { ok: false, failureCode: 'graph-404-not-found' };
      }
      return {
        ok: false,
        failureCode: result.failureCode,
        status: result.status,
        sanitizedReason: result.sanitizedReason,
      };
    }
    const parsed = parseSubscriptionResponse(result.body);
    if (parsed === null) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'graph get response missing required fields',
      };
    }
    return { ok: true, subscription: parsed };
  }
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createProjectionGraphSubscriptionClient(
  opts: IProjectionGraphSubscriptionClientOptions = {},
): IProjectionGraphSubscriptionClient {
  return new ProjectionGraphSubscriptionClient(opts);
}
