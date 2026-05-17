/**
 * My Projects projection — Microsoft Graph `listItem/delta` REST client.
 *
 *   acquireInitialDeltaLink → GET /sites/{siteId}/lists/{listId}/items/delta?token=latest
 *   drainDelta              → GET <stored deltaLink>, then follow @odata.nextLink
 *                              pages until @odata.deltaLink is returned.
 *
 * Reuses the existing federated Graph token lane (legacy-fallback) and
 * supports fully-qualified `@odata.nextLink` URLs without rewriting (mirrors
 * `GraphListClient.graphFetch:73` pattern).
 *
 * Tombstone detection: a delta page entry with `@removed.reason === 'deleted'`
 * is surfaced via `deletedItemIds`, NOT `changedItems`, so the worker can
 * route to the projection deletion algorithm.
 *
 * Live POST/GET against Graph is gated by `Sites.Read.All` Application consent
 * (Runbook 03). The client passes calls through and classifies failures into
 * closed-set codes — the manager/worker decide.
 */

import { createDefaultFederatedGraphTokenProvider } from '../../legacy-fallback/federated-graph-token-provider.js';
import type { IGraphAccessTokenProvider } from '../../legacy-fallback/federated-graph-token-provider.js';
import { sanitizeProjectionRunNotes } from '../state/run-repository.js';

const GRAPH_DEFAULT_BASE = 'https://graph.microsoft.com/v1.0';

export type ProjectionGraphDeltaFailureCode =
  | 'graph-400-bad-request'
  | 'graph-401-unauthorized'
  | 'graph-403-forbidden'
  | 'graph-404-not-found'
  | 'graph-410-gone'
  | 'graph-429-throttled'
  | 'graph-5xx'
  | 'graph-network'
  | 'token-acquisition-failed'
  | 'invalid-payload'
  | 'page-budget-exceeded';

export interface IDeltaItem {
  readonly id: string;
  readonly fields?: Record<string, unknown>;
  readonly lastModifiedDateTime?: string;
}

export interface IDeltaDrainResult {
  readonly changedItems: readonly IDeltaItem[];
  readonly deletedItemIds: readonly string[];
  readonly finalDeltaLink: string;
  readonly pageCount: number;
}

export type IDeltaDrainOutcome =
  | { readonly ok: true; readonly result: IDeltaDrainResult }
  | {
      readonly ok: false;
      readonly failureCode: ProjectionGraphDeltaFailureCode;
      readonly status?: number;
      readonly sanitizedReason: string;
    };

export type IInitialDeltaLinkOutcome =
  | { readonly ok: true; readonly deltaLink: string }
  | {
      readonly ok: false;
      readonly failureCode: ProjectionGraphDeltaFailureCode;
      readonly status?: number;
      readonly sanitizedReason: string;
    };

export interface IProjectionGraphDeltaClient {
  acquireInitialDeltaLink(args: {
    siteId: string;
    listId: string;
  }): Promise<IInitialDeltaLinkOutcome>;
  drainDelta(args: { deltaLink: string; maxPages: number }): Promise<IDeltaDrainOutcome>;
}

export interface IProjectionGraphDeltaClientOptions {
  readonly tokenProvider?: IGraphAccessTokenProvider;
  readonly fetchImpl?: typeof fetch;
  readonly graphBaseUrl?: string;
}

interface IRawDeltaPage {
  readonly value?: ReadonlyArray<unknown>;
  readonly ['@odata.nextLink']?: unknown;
  readonly ['@odata.deltaLink']?: unknown;
}

interface IRawDeltaItem {
  readonly id?: unknown;
  readonly fields?: unknown;
  readonly lastModifiedDateTime?: unknown;
  readonly ['@removed']?: unknown;
}

function classifyStatus(status: number): ProjectionGraphDeltaFailureCode {
  switch (status) {
    case 400:
      return 'graph-400-bad-request';
    case 401:
      return 'graph-401-unauthorized';
    case 403:
      return 'graph-403-forbidden';
    case 404:
      return 'graph-404-not-found';
    case 410:
      return 'graph-410-gone';
    case 429:
      return 'graph-429-throttled';
    default:
      return 'graph-5xx';
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDeletedTombstone(raw: IRawDeltaItem): boolean {
  const removed = raw['@removed'];
  if (!isPlainObject(removed)) return false;
  const reason = removed.reason;
  return reason === 'deleted';
}

function parseDeltaItem(raw: IRawDeltaItem): IDeltaItem | null {
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null;
  const item: IDeltaItem = {
    id: raw.id,
    fields: isPlainObject(raw.fields) ? raw.fields : undefined,
    lastModifiedDateTime:
      typeof raw.lastModifiedDateTime === 'string' ? raw.lastModifiedDateTime : undefined,
  };
  return item;
}

class ProjectionGraphDeltaClient implements IProjectionGraphDeltaClient {
  private readonly tokenProvider: IGraphAccessTokenProvider;
  private readonly fetchImpl: typeof fetch;
  private readonly graphBaseUrl: string;

  constructor(opts: IProjectionGraphDeltaClientOptions = {}) {
    this.tokenProvider = opts.tokenProvider ?? createDefaultFederatedGraphTokenProvider();
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.graphBaseUrl = opts.graphBaseUrl ?? GRAPH_DEFAULT_BASE;
  }

  private async acquireToken(): Promise<{ token: string } | { error: string }> {
    try {
      const token = await this.tokenProvider.getGraphAccessToken();
      if (!token) return { error: 'token provider returned an empty token' };
      return { token };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { error: message };
    }
  }

  private async graphFetch(urlOrPath: string): Promise<
    | { ok: true; status: number; body: unknown }
    | {
        ok: false;
        failureCode: ProjectionGraphDeltaFailureCode;
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
    const url = urlOrPath.startsWith('http') ? urlOrPath : `${this.graphBaseUrl}${urlOrPath}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          Accept: 'application/json',
        },
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
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }
      return { ok: true, status: response.status, body };
    }
    const text = await response.text().catch(() => '');
    return {
      ok: false,
      failureCode: classifyStatus(response.status),
      status: response.status,
      sanitizedReason: sanitizeProjectionRunNotes(text) ?? `graph ${response.status}`,
    };
  }

  async acquireInitialDeltaLink(args: {
    siteId: string;
    listId: string;
  }): Promise<IInitialDeltaLinkOutcome> {
    if (
      typeof args.siteId !== 'string' ||
      args.siteId.length === 0 ||
      typeof args.listId !== 'string' ||
      args.listId.length === 0
    ) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'acquireInitialDeltaLink requires non-empty siteId and listId',
      };
    }
    const path = `/sites/${encodeURIComponent(args.siteId)}/lists/${encodeURIComponent(args.listId)}/items/delta?token=latest`;
    const result = await this.graphFetch(path);
    if (!result.ok) {
      return {
        ok: false,
        failureCode: result.failureCode,
        status: result.status,
        sanitizedReason: result.sanitizedReason,
      };
    }
    const page = result.body as IRawDeltaPage;
    const deltaLink = typeof page['@odata.deltaLink'] === 'string' ? page['@odata.deltaLink'] : '';
    if (deltaLink.length === 0) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'graph delta seed response missing @odata.deltaLink',
      };
    }
    return { ok: true, deltaLink };
  }

  async drainDelta(args: { deltaLink: string; maxPages: number }): Promise<IDeltaDrainOutcome> {
    if (typeof args.deltaLink !== 'string' || args.deltaLink.length === 0) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'drainDelta requires a non-empty deltaLink',
      };
    }
    if (!Number.isInteger(args.maxPages) || args.maxPages <= 0) {
      return {
        ok: false,
        failureCode: 'invalid-payload',
        sanitizedReason: 'drainDelta requires maxPages > 0',
      };
    }
    const changedItems: IDeltaItem[] = [];
    const deletedItemIds: string[] = [];
    let nextUrl: string = args.deltaLink;
    let pageCount = 0;
    let finalDeltaLink = '';
    for (;;) {
      pageCount += 1;
      if (pageCount > args.maxPages) {
        return {
          ok: false,
          failureCode: 'page-budget-exceeded',
          sanitizedReason: `drainDelta exceeded max ${args.maxPages} pages`,
        };
      }
      const result = await this.graphFetch(nextUrl);
      if (!result.ok) {
        return {
          ok: false,
          failureCode: result.failureCode,
          status: result.status,
          sanitizedReason: result.sanitizedReason,
        };
      }
      const page = result.body as IRawDeltaPage;
      if (Array.isArray(page.value)) {
        for (const raw of page.value) {
          if (!isPlainObject(raw)) continue;
          const rawItem = raw as IRawDeltaItem;
          if (isDeletedTombstone(rawItem)) {
            if (typeof rawItem.id === 'string' && rawItem.id.length > 0) {
              deletedItemIds.push(rawItem.id);
            }
            continue;
          }
          const parsed = parseDeltaItem(rawItem);
          if (parsed !== null) changedItems.push(parsed);
        }
      }
      const odataDeltaLink =
        typeof page['@odata.deltaLink'] === 'string' ? page['@odata.deltaLink'] : '';
      const odataNextLink =
        typeof page['@odata.nextLink'] === 'string' ? page['@odata.nextLink'] : '';
      if (odataDeltaLink.length > 0) {
        finalDeltaLink = odataDeltaLink;
        break;
      }
      if (odataNextLink.length === 0) {
        return {
          ok: false,
          failureCode: 'invalid-payload',
          sanitizedReason: 'graph delta page missing both @odata.nextLink and @odata.deltaLink',
        };
      }
      nextUrl = odataNextLink;
    }
    return {
      ok: true,
      result: { changedItems, deletedItemIds, finalDeltaLink, pageCount },
    };
  }
}

export function createProjectionGraphDeltaClient(
  opts: IProjectionGraphDeltaClientOptions = {},
): IProjectionGraphDeltaClient {
  return new ProjectionGraphDeltaClient(opts);
}
