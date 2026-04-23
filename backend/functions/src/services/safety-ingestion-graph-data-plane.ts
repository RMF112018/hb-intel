import { withRetry } from '../utils/retry.js';
import type { IManagedIdentityTokenService } from './managed-identity-token-service.js';
import { emitSafetyIngestionEvent } from './safety-ingestion-telemetry.js';

const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';

export interface IGraphListItem {
  readonly id: string;
  readonly fields: Record<string, unknown>;
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

class GraphRequestError extends Error {
  readonly status: number;
  readonly response: Response;

  constructor(operation: string, path: string, response: Response, bodySnippet: string) {
    super(`graph.${operation} ${path} failed (${response.status}): ${bodySnippet}`);
    this.name = 'GraphRequestError';
    this.status = response.status;
    this.response = response;
  }
}

class GraphTransientError extends GraphRequestError {
  constructor(operation: string, path: string, response: Response, bodySnippet: string) {
    super(operation, path, response, bodySnippet);
    this.name = 'GraphTransientError';
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
    const response = await this.graphFetchAllow404('get-item', path);
    if (!response) return null;
    const body = (await response.json()) as { id?: string; fields?: Record<string, unknown> };
    return {
      id: body.id ? String(body.id) : String(itemId),
      fields: body.fields ?? {},
    };
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
      const response = await this.graphFetch('list-items', nextPath, {
        headers: query.filter
          ? { Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly' }
          : undefined,
      });
      const body = (await response.json()) as {
        value?: Array<{ id?: string; fields?: Record<string, unknown> }>;
        '@odata.nextLink'?: string;
      };
      for (const row of body.value ?? []) {
        all.push({
          id: row.id ? String(row.id) : '',
          fields: row.fields ?? {},
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
    return withRetry(
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
