import { withRetry } from '../utils/retry.js';
import type { IManagedIdentityTokenService } from './managed-identity-token-service.js';
import { emitSafetyIngestionEvent } from './safety-ingestion-telemetry.js';

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

export interface IGraphListItem {
  readonly id: string;
  readonly fields: Record<string, unknown>;
  readonly etag?: string;
}

export interface IGraphListQuery {
  readonly filter?: string;
  readonly select?: readonly string[];
  readonly orderBy?: string;
  readonly top?: number;
}

interface IGraphDriveUploadResponse {
  readonly id?: string;
  readonly webUrl?: string;
  readonly sharepointIds?: {
    readonly listItemId?: string;
  };
}

/**
 * Canonical failure classes for Safety Graph calls. Emitted via classified
 * telemetry so live 401/403/404 responses can be triaged without a code
 * round-trip. Operators map the live class directly to the remediation lane:
 * identity, per-site grant, wrong site/list binding, upstream rate limiting,
 * or transport.
 */
export type GraphFailureClass =
  | 'identity-not-acquired'
  | 'permission-denied-401'
  | 'permission-denied-403'
  | 'site-not-found'
  | 'list-not-found'
  | 'item-not-found'
  | 'transport-error'
  | 'rate-limited'
  | 'unknown';

/**
 * Best-effort shape check for the Graph error code embedded in response bodies.
 * Used by `classifyGraphFailure` to distinguish site/list/item "not found"
 * cases from generic 404s.
 */
interface IGraphErrorBody {
  error?: {
    code?: string;
    message?: string;
    innerError?: { 'request-id'?: string; requestId?: string; 'client-request-id'?: string };
  };
}

/**
 * Classify a Graph HTTP response + request path into a canonical failure
 * class. Pure: never throws, never reads the response body twice.
 *
 * Inputs:
 * - `status`: HTTP status from the Graph response
 * - `path`: request path (e.g. `/sites/<siteId>/lists/<listId>/items/<itemId>`)
 *   used to disambiguate 404s into site/list/item lanes.
 * - `bodySnippet`: best-effort truncated response body text. Optional — if
 *   absent, classification falls back to status-only heuristics.
 */
export function classifyGraphFailure(
  status: number,
  path: string,
  bodySnippet?: string,
): GraphFailureClass {
  if (status === 401) return 'permission-denied-401';
  if (status === 403) return 'permission-denied-403';
  if (status === 429) return 'rate-limited';

  if (status === 404) {
    const errorCode = extractGraphErrorCode(bodySnippet);
    const lane = pathLane(path);
    // Distinguish site/list/item by the deepest present segment in the path.
    // A 404 on a /sites/ resolution path (no /lists/ or /items/ segment)
    // is definitionally a site-binding miss.
    if (lane === 'site') return 'site-not-found';
    if (lane === 'list') return 'list-not-found';
    if (lane === 'item') return 'item-not-found';
    // Graph itemNotFound on an unrecognized path still lands in the
    // deepest-lane classification via the switch above; default to unknown.
    if (errorCode === 'itemNotFound') return 'item-not-found';
    return 'unknown';
  }

  if (status >= 500 && status <= 599) return 'transport-error';

  return 'unknown';
}

/**
 * Coerce an arbitrary thrown value into a canonical failure class. Used in
 * catch sites where we don't know whether the throw came from a Graph
 * response (classified via status) or from an earlier stage (token
 * acquisition, network error).
 */
export function classifyGraphThrown(err: unknown): GraphFailureClass {
  if (err instanceof GraphRequestError) return err.failureClass;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('failed to acquire') || msg.includes('managed identity token')) {
      return 'identity-not-acquired';
    }
    if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('econnrefused')) {
      return 'transport-error';
    }
  }
  return 'unknown';
}

function pathLane(path: string): 'site' | 'list' | 'item' | 'other' {
  // Ordered deepest-first so `/items/` wins over `/lists/` wins over `/sites/`.
  if (/\/items\/[^/]+(?:\/|\?|$)/.test(path) || /\/items\?/.test(path) || /\/items$/.test(path)) {
    return 'item';
  }
  if (/\/lists\/[^/]+(?:\/|\?|$)/.test(path) || /\/lists\?/.test(path) || /\/lists$/.test(path)) {
    return 'list';
  }
  if (/\/sites\//.test(path)) return 'site';
  return 'other';
}

function extractGraphErrorCode(bodySnippet: string | undefined): string | undefined {
  if (!bodySnippet) return undefined;
  try {
    const parsed = JSON.parse(bodySnippet) as IGraphErrorBody;
    return parsed.error?.code;
  } catch {
    return undefined;
  }
}

export class GraphRequestError extends Error {
  readonly status: number;
  readonly response: Response;
  readonly failureClass: GraphFailureClass;
  readonly path: string;
  readonly bodySnippet: string;

  constructor(operation: string, path: string, response: Response, bodySnippet: string) {
    super(`graph.${operation} ${path} failed (${response.status}): ${bodySnippet}`);
    this.name = 'GraphRequestError';
    this.status = response.status;
    this.response = response;
    this.path = path;
    this.bodySnippet = bodySnippet;
    this.failureClass = classifyGraphFailure(response.status, path, bodySnippet);
  }
}

export class GraphTransientError extends GraphRequestError {
  constructor(operation: string, path: string, response: Response, bodySnippet: string) {
    super(operation, path, response, bodySnippet);
    this.name = 'GraphTransientError';
  }
}

export class GraphConcurrencyError extends GraphRequestError {
  constructor(operation: string, path: string, response: Response, bodySnippet: string) {
    super(operation, path, response, bodySnippet);
    this.name = 'GraphConcurrencyError';
  }
}

/**
 * Raised when a bounded single-page Graph list query returns `@odata.nextLink`.
 *
 * Safety's compound `$filter` call sites (duplicate-detection-inspections,
 * project-week-lookup) are contractually single-page: the filter narrows to a
 * natural-key tuple that must fit in one page of matches. If Graph paginates,
 * it signals either (a) a lost/weakened index, (b) unexpected data volume, or
 * (c) a natural-key violation — all of which must surface loudly rather than
 * silently widen into tenant-paging territory.
 */
export class GraphBoundedQueryTruncatedError extends Error {
  readonly contractId: string;
  readonly listId: string;

  constructor(contractId: string, listId: string, returned: number, top: number | undefined) {
    super(
      `graph.list-items-bounded truncated: contract "${contractId}" on list ${listId} returned @odata.nextLink ` +
      `after ${returned} row(s) (top=${top ?? 'unset'}). Bounded queries cannot silently follow nextLink — ` +
      `verify the indexed-column contract and natural-key assumptions.`,
    );
    this.name = 'GraphBoundedQueryTruncatedError';
    this.contractId = contractId;
    this.listId = listId;
  }
}

export class SafetyIngestionGraphDataPlane {
  private readonly tokenService: IManagedIdentityTokenService;
  private readonly siteIdCache = new Map<string, string>();

  constructor(tokenService: IManagedIdentityTokenService) {
    this.tokenService = tokenService;
  }

  async resolveSiteId(siteUrl: string): Promise<string> {
    const normalized = normalizeSiteUrl(siteUrl);
    const cached = this.siteIdCache.get(normalized);
    if (cached) return cached;

    const parsed = new URL(normalized);
    const path = `/sites/${parsed.hostname}:${parsed.pathname}`;
    const response = await this.graphFetch('resolve-site-id', path);
    const body = (await response.json()) as { id?: string };
    if (!body.id) {
      throw new Error(`graph.resolve-site-id returned no site id for ${normalized}`);
    }
    this.siteIdCache.set(normalized, body.id);
    this.log('safety.ingestion.graph.site.resolved', {
      siteUrl: normalized,
      siteId: body.id,
    });
    return body.id;
  }

  async getItemById(
    siteUrl: string,
    listId: string,
    itemId: number,
    select: readonly string[] = [],
  ): Promise<IGraphListItem | null> {
    const siteId = await this.resolveSiteId(siteUrl);
    const expand = select.length > 0 ? `fields($select=${select.join(',')})` : 'fields';
    const path = `/sites/${siteId}/lists/${listId}/items/${itemId}?$expand=${encodeURIComponent(expand)}`;
    try {
      const response = await this.graphFetchAllow404('get-item', path);
      if (!response) return null;
      const body = (await response.json()) as {
        id?: string;
        fields?: Record<string, unknown>;
        ['@odata.etag']?: string;
      };
      return {
        id: body.id ? String(body.id) : String(itemId),
        fields: body.fields ?? {},
        etag: body['@odata.etag'],
      };
    } catch (err) {
      const failureClass = classifyGraphThrown(err);
      const statusCode = err instanceof GraphRequestError ? err.status : undefined;
      const graphErrorCode = err instanceof GraphRequestError
        ? safeExtractGraphErrorCode(err.bodySnippet)
        : undefined;
      this.log('safety.ingestion.graph.get-item.failed', {
        identityLane: 'managed-identity-app-only',
        operation: 'get-item',
        siteUrl: normalizeSiteUrl(siteUrl),
        siteId,
        listId,
        itemId,
        pathSummary: `/sites/${siteId}/lists/${listId}/items/${itemId}`,
        statusCode,
        graphErrorCode,
        failureClass,
        authLane: authLaneFromGraphFailureClass(failureClass),
      });
      throw err;
    }
  }

  /**
   * Bounded single-page variant of {@link listItems} used by Safety's compound
   * `$filter` call sites. Issues exactly one page against Graph and throws
   * {@link GraphBoundedQueryTruncatedError} if the response contains
   * `@odata.nextLink`. Callers are expected to size `$top` to encompass the
   * full legitimate result set — truncation means the contract is violated,
   * not that the caller should paginate.
   */
  async listItemsBounded(
    siteUrl: string,
    listId: string,
    query: IGraphListQuery,
    contractId: string,
  ): Promise<ReadonlyArray<IGraphListItem>> {
    const siteId = await this.resolveSiteId(siteUrl);
    const params = new URLSearchParams();
    const expand = query.select && query.select.length > 0
      ? `fields($select=${query.select.join(',')})`
      : 'fields';
    params.set('$expand', expand);
    if (query.filter) params.set('$filter', query.filter);
    if (query.orderBy) params.set('$orderby', query.orderBy);
    if (query.top) params.set('$top', String(query.top));

    const path = `/sites/${siteId}/lists/${listId}/items?${params.toString()}`;
    const response = await this.graphFetch('list-items-bounded', path);
    const body = (await response.json()) as {
      value?: Array<{ id?: string; fields?: Record<string, unknown>; ['@odata.etag']?: string }>;
      '@odata.nextLink'?: string;
    };
    const rows: IGraphListItem[] = (body.value ?? []).map((row) => ({
      id: row.id ? String(row.id) : '',
      fields: row.fields ?? {},
      etag: row['@odata.etag'],
    }));

    if (body['@odata.nextLink']) {
      this.log('safety.ingestion.graph.query.bounded.truncated', {
        siteId,
        listId,
        contractId,
        returned: rows.length,
        top: query.top,
        filter: query.filter,
      });
      throw new GraphBoundedQueryTruncatedError(contractId, listId, rows.length, query.top);
    }

    this.log('safety.ingestion.graph.query.bounded', {
      siteId,
      listId,
      contractId,
      returned: rows.length,
      top: query.top,
      filter: query.filter,
    });
    return rows;
  }

  async listItems(
    siteUrl: string,
    listId: string,
    query: IGraphListQuery = {},
  ): Promise<ReadonlyArray<IGraphListItem>> {
    const siteId = await this.resolveSiteId(siteUrl);
    const params = new URLSearchParams();
    const expand = query.select && query.select.length > 0
      ? `fields($select=${query.select.join(',')})`
      : 'fields';
    params.set('$expand', expand);
    if (query.filter) params.set('$filter', query.filter);
    if (query.orderBy) params.set('$orderby', query.orderBy);
    if (query.top) params.set('$top', String(query.top));

    const all: IGraphListItem[] = [];
    let nextPath: string | null = `/sites/${siteId}/lists/${listId}/items?${params.toString()}`;
    while (nextPath) {
      const response = await this.graphFetch('list-items', nextPath);
      const body = (await response.json()) as {
        value?: Array<{ id?: string; fields?: Record<string, unknown>; ['@odata.etag']?: string }>;
        '@odata.nextLink'?: string;
      };
      for (const row of body.value ?? []) {
        all.push({
          id: row.id ? String(row.id) : '',
          fields: row.fields ?? {},
          etag: row['@odata.etag'],
        });
      }
      if (query.top && all.length >= query.top) {
        break;
      }
      nextPath = body['@odata.nextLink']
        ? body['@odata.nextLink'].replace(GRAPH_BASE_URL, '')
        : null;
    }

    const result = query.top ? all.slice(0, query.top) : all;
    this.log('safety.ingestion.graph.items.listed', {
      siteId,
      listId,
      count: result.length,
      filter: query.filter,
      orderBy: query.orderBy,
      top: query.top,
    });
    return result;
  }

  async createItem(
    siteUrl: string,
    listId: string,
    fields: Record<string, unknown>,
  ): Promise<IGraphListItem> {
    const siteId = await this.resolveSiteId(siteUrl);
    const path = `/sites/${siteId}/lists/${listId}/items`;
    const response = await this.graphFetch('create-item', path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    const body = (await response.json()) as { id?: string; fields?: Record<string, unknown> };
    if (!body.id) {
      throw new Error(`graph.create-item returned no item id for list ${listId}`);
    }
    this.log('safety.ingestion.graph.item.created', {
      siteId,
      listId,
      itemId: body.id,
      fieldCount: Object.keys(fields).length,
    });
    return {
      id: String(body.id),
      fields: body.fields ?? {},
    };
  }

  /**
   * Blind PATCH — does not send `If-Match` and cannot detect lost updates.
   *
   * @deprecated FORBIDDEN for Safety ingestion mutations. Safety callers must
   * use `updateItemWithConcurrency()`; the Safety repository enforces this via
   * the `assertSafetyGraphEtag` invariant and a guard test. This method exists
   * only to support historical non-Safety call sites and must not be wired
   * into any new Safety code path.
   */
  async updateItem(
    siteUrl: string,
    listId: string,
    itemId: number,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const siteId = await this.resolveSiteId(siteUrl);
    const path = `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`;
    await this.graphFetch('update-item', path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    this.log('safety.ingestion.graph.item.updated', {
      siteId,
      listId,
      itemId,
      fieldCount: Object.keys(fields).length,
      concurrencyProtected: false,
    });
  }

  /**
   * Concurrency-safe PATCH: sends `If-Match: <etag>` and surfaces 409/412 as a
   * typed `GraphConcurrencyError`. Callers must pass a non-empty etag (enforced
   * by `assertSafetyGraphEtag`) and pair this with a read-before-write step.
   */
  async updateItemWithConcurrency(
    siteUrl: string,
    listId: string,
    itemId: number,
    fields: Record<string, unknown>,
    etag: string,
  ): Promise<void> {
    assertSafetyGraphEtag(etag, `${listId}/${itemId}`);
    const siteId = await this.resolveSiteId(siteUrl);
    const path = `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`;
    const token = await this.tokenService.acquireAppToken([GRAPH_SCOPE]).catch((err) => {
      this.emitClassifiedFailure('update-item-with-concurrency', path, err);
      throw err;
    });
    const response = await fetch(toAbsoluteGraphUrl(path), {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'If-Match': etag,
      },
      body: JSON.stringify(fields),
    });
    if (response.status === 409 || response.status === 412) {
      const err = new GraphConcurrencyError(
        'update-item-with-concurrency',
        path,
        response,
        await readBodySnippet(response),
      );
      this.emitClassifiedFailure('update-item-with-concurrency', path, err);
      throw err;
    }
    if (!response.ok) {
      const err = new GraphRequestError(
        'update-item-with-concurrency',
        path,
        response,
        await readBodySnippet(response),
      );
      this.emitClassifiedFailure('update-item-with-concurrency', path, err);
      throw err;
    }
    this.log('safety.ingestion.graph.item.updated', {
      siteId,
      listId,
      itemId,
      fieldCount: Object.keys(fields).length,
      concurrencyProtected: true,
    });
  }

  async uploadFileToLibrary(input: {
    siteUrl: string;
    listId: string;
    fileName: string;
    bytes: ArrayBuffer;
  }): Promise<{ listItemId: number; webUrl: string }> {
    const siteId = await this.resolveSiteId(input.siteUrl);
    const safeName = encodeURIComponent(input.fileName);
    const uploadPath = `/sites/${siteId}/lists/${input.listId}/drive/root:/${safeName}:/content`;
    const uploadResponse = await this.graphFetch('upload-file', uploadPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: input.bytes,
    });
    const uploadBody = (await uploadResponse.json()) as IGraphDriveUploadResponse;
    const directListItemId = Number(uploadBody.sharepointIds?.listItemId ?? '0');
    if (Number.isFinite(directListItemId) && directListItemId > 0 && uploadBody.webUrl) {
      this.log('safety.ingestion.graph.file.uploaded', {
        siteId,
        listId: input.listId,
        fileName: input.fileName,
        listItemId: directListItemId,
      });
      return { listItemId: directListItemId, webUrl: uploadBody.webUrl };
    }

    const escaped = escapeODataLiteral(input.fileName);
    const rows = await this.listItems(input.siteUrl, input.listId, {
      filter: `fields/FileLeafRef eq '${escaped}'`,
      select: ['FileLeafRef'],
      orderBy: 'lastModifiedDateTime desc',
      top: 1,
    });
    const fallbackId = Number(rows[0]?.id ?? '0');
    if (!Number.isFinite(fallbackId) || fallbackId <= 0) {
      throw new Error(`graph.upload-file could not resolve list item id for ${input.fileName}`);
    }

    this.log('safety.ingestion.graph.file.uploaded', {
      siteId,
      listId: input.listId,
      fileName: input.fileName,
      listItemId: fallbackId,
      usedFallbackLookup: true,
    });

    return {
      listItemId: fallbackId,
      webUrl: uploadBody.webUrl ?? `${normalizeSiteUrl(input.siteUrl)}/${encodeURIComponent(input.fileName)}`,
    };
  }

  async downloadFileByListItemId(input: {
    siteUrl: string;
    listId: string;
    itemId: number;
  }): Promise<ArrayBuffer> {
    const siteId = await this.resolveSiteId(input.siteUrl);
    const path = `/sites/${siteId}/lists/${input.listId}/items/${input.itemId}/driveItem/content`;
    const response = await this.graphFetch('download-file', path, {
      headers: {
        Accept: '*/*',
      },
    });
    this.log('safety.ingestion.graph.file.downloaded', {
      siteId,
      listId: input.listId,
      itemId: input.itemId,
    });
    return response.arrayBuffer();
  }

  private async graphFetch(
    operation: string,
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    try {
      return await withRetry(
        async () => {
          const token = await this.tokenService.acquireAppToken([GRAPH_SCOPE]);
          const response = await fetch(toAbsoluteGraphUrl(path), {
            ...init,
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              ...(init?.headers ?? {}),
            },
          });

          if (response.status === 429 || response.status >= 500) {
            throw new GraphTransientError(
              operation,
              path,
              response,
              await readBodySnippet(response),
            );
          }
          if (!response.ok) {
            throw new GraphRequestError(
              operation,
              path,
              response,
              await readBodySnippet(response),
            );
          }
          return response;
        },
        {
          maxAttempts: 4,
          baseDelayMs: 1000,
          isTransient: (error) => error instanceof GraphTransientError,
          onRetry: (error, attempt, delayMs, metadata) => {
            this.log('safety.ingestion.graph.retry', {
              operation,
              path,
              attempt,
              delayMs,
              delaySource: metadata.source,
              statusCode: metadata.statusCode,
              retryAfterMs: metadata.retryAfterMs,
              baseBackoffMs: metadata.baseBackoffMs,
              jitterMs: metadata.jitterMs,
              message: error instanceof Error ? error.message : String(error),
            });
          },
        },
      );
    } catch (err) {
      // Classify and emit final failure telemetry BEFORE rethrowing. This is
      // the single seam every Safety Graph call flows through, so every live
      // 4xx/5xx / network / identity failure is reported with its canonical
      // class — directly enabling operator triage of reporting-period 401s.
      this.emitClassifiedFailure(operation, path, err);
      throw err;
    }
  }

  private emitClassifiedFailure(operation: string, path: string, err: unknown): void {
    const failureClass = classifyGraphThrown(err);
    const status = err instanceof GraphRequestError ? err.status : undefined;
    const graphErrorCode = err instanceof GraphRequestError
      ? safeExtractGraphErrorCode(err.bodySnippet)
      : undefined;
    this.log('safety.ingestion.graph.failure.classified', {
      operation,
      path,
      failureClass,
      statusCode: status,
      graphErrorCode,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  private async graphFetchAllow404(
    operation: string,
    path: string,
    init?: RequestInit,
  ): Promise<Response | null> {
    try {
      return await this.graphFetch(operation, path, init);
    } catch (error) {
      if (error instanceof GraphRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private log(event: string, properties: Record<string, unknown>): void {
    emitSafetyIngestionEvent(event, { operation: 'ingest' }, properties);
  }
}

function safeExtractGraphErrorCode(bodySnippet: string | undefined): string | undefined {
  if (!bodySnippet) return undefined;
  try {
    const parsed = JSON.parse(bodySnippet) as { error?: { code?: string } };
    return parsed.error?.code;
  } catch {
    return undefined;
  }
}

function authLaneFromGraphFailureClass(
  failureClass: GraphFailureClass,
): 'identity' | 'permission' | 'binding' | 'throttle' | 'transport' | 'none' {
  if (failureClass === 'identity-not-acquired') return 'identity';
  if (failureClass === 'permission-denied-401' || failureClass === 'permission-denied-403') return 'permission';
  if (failureClass === 'site-not-found' || failureClass === 'list-not-found' || failureClass === 'item-not-found') {
    return 'binding';
  }
  if (failureClass === 'rate-limited') return 'throttle';
  if (failureClass === 'transport-error') return 'transport';
  return 'none';
}

async function readBodySnippet(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return '';
    return text.length > 240 ? `${text.slice(0, 240)}...` : text;
  } catch {
    return '';
  }
}

function toAbsoluteGraphUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${GRAPH_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

function escapeODataLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Safety ETag invariant: blind PATCH is forbidden for Safety mutations. All
 * Safety update paths must read-before-write and pass the returned `@odata.etag`
 * through to `updateItemWithConcurrency()`. This guard catches accidental
 * regression (for example if a future refactor drops the read step).
 */
export function assertSafetyGraphEtag(etag: unknown, context: string): asserts etag is string {
  if (typeof etag !== 'string' || etag.length === 0) {
    throw new Error(
      `Safety Graph update blocked: missing or empty ETag for ${context}. Read the item before writing and pass @odata.etag to updateItemWithConcurrency.`,
    );
  }
}
