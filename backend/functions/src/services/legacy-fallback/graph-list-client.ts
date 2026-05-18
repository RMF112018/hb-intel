import {
  createDefaultFederatedGraphTokenProvider,
  type IGraphAccessTokenProvider,
} from './federated-graph-token-provider.js';

/**
 * Graph-backed SharePoint list client. Replaces the @pnp/sp call path which has
 * a v2/v4 package-version mismatch that prevents fetch registration in this
 * Node 22 ESM worker. Uses native fetch + Graph Sites app-only permissions
 * (already admin-consented on the SharePoint Creator app).
 *
 * Token acquisition runs through the federated HB SharePoint Creator path:
 * the Function App UAMI mints an `api://AzureADTokenExchange` assertion which
 * is exchanged for an HB SharePoint Creator app token via
 * `ClientAssertionCredential`. See `federated-graph-token-provider.ts`.
 */

export interface IGraphListItemsQuery {
  readonly filter?: string;
  readonly select?: readonly string[];
  readonly orderby?: string;
  readonly top?: number;
}

export interface IGraphListItem {
  readonly id: string;
  readonly fields: Record<string, unknown>;
}

interface ISiteInfo {
  readonly id: string;
}
interface IListInfo {
  readonly id: string;
  readonly title: string;
}

export class GraphListClient {
  private readonly injectedTokenProvider: IGraphAccessTokenProvider | null;
  private resolvedTokenProvider: IGraphAccessTokenProvider | null = null;
  private readonly siteUrl: string;
  private readonly graphBase = 'https://graph.microsoft.com/v1.0';
  private cachedSiteId: string | null = null;
  private inFlightSiteIdResolution: Promise<string> | null = null;
  private readonly listIdByTitle = new Map<string, string>();
  private inFlightListCatalogResolution: Promise<void> | null = null;
  private readonly columnsByListId = new Map<string, Set<string>>();

  constructor(siteUrl: string, tokenProvider?: IGraphAccessTokenProvider) {
    this.siteUrl = siteUrl;
    // Defer default-provider construction (which reads hosting config) to the
    // first Graph call so resolver/composition tests that never reach Graph
    // are not coupled to the legacy-fallback hosting env contract.
    this.injectedTokenProvider = tokenProvider ?? null;
  }

  private getTokenProvider(): IGraphAccessTokenProvider {
    if (this.injectedTokenProvider) return this.injectedTokenProvider;
    if (!this.resolvedTokenProvider) {
      this.resolvedTokenProvider = createDefaultFederatedGraphTokenProvider();
    }
    return this.resolvedTokenProvider;
  }

  private async getToken(): Promise<string> {
    const token = await this.getTokenProvider().getGraphAccessToken();
    if (!token) throw new Error('graph-list-client: token acquisition failed');
    return token;
  }

  private async graphFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken();
    const url = path.startsWith('http') ? path : `${this.graphBase}${path}`;
    const headers = new Headers(init?.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const res = await fetch(url, { ...init, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `graph ${init?.method ?? 'GET'} ${path} -> ${res.status}: ${text.slice(0, 500)}`,
      );
    }
    return res;
  }

  async resolveSiteId(): Promise<string> {
    if (this.cachedSiteId) return this.cachedSiteId;
    if (this.inFlightSiteIdResolution) return this.inFlightSiteIdResolution;
    const u = new URL(this.siteUrl);
    const hostname = u.hostname;
    const serverRelative = u.pathname.replace(/\/+$/, '');
    const inFlight = (async (): Promise<string> => {
      const res = await this.graphFetch(`/sites/${hostname}:${serverRelative}`);
      const info = (await res.json()) as ISiteInfo;
      this.cachedSiteId = info.id;
      return info.id;
    })();
    this.inFlightSiteIdResolution = inFlight;
    try {
      return await inFlight;
    } finally {
      this.inFlightSiteIdResolution = null;
    }
  }

  async resolveListId(title: string): Promise<string> {
    const cached = this.listIdByTitle.get(title);
    if (cached) return cached;
    if (!this.inFlightListCatalogResolution) {
      const catalogFetch = (async (): Promise<void> => {
        const siteId = await this.resolveSiteId();
        const res = await this.graphFetch(
          `/sites/${siteId}/lists?$select=id,displayName,name&$top=200`,
        );
        const body = (await res.json()) as {
          value: Array<{ id: string; displayName: string; name: string }>;
        };
        for (const l of body.value) {
          this.listIdByTitle.set(l.displayName, l.id);
          this.listIdByTitle.set(l.name, l.id);
        }
      })();
      this.inFlightListCatalogResolution = catalogFetch;
    }

    try {
      await this.inFlightListCatalogResolution;
    } finally {
      this.inFlightListCatalogResolution = null;
    }

    const resolved = this.listIdByTitle.get(title);
    if (resolved) return resolved;
    const siteId = await this.resolveSiteId();
    throw new Error(`graph-list-client: list '${title}' not found on site ${siteId}`);
  }

  async listExists(title: string): Promise<boolean> {
    try {
      await this.resolveListId(title);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("list '") && message.includes("' not found")) {
        return false;
      }
      throw err;
    }
  }

  async getWritableColumnNames(listTitle: string): Promise<Set<string>> {
    const listId = await this.resolveListId(listTitle);
    const names = await this.getColumnNames(listId);
    return new Set(names);
  }

  async listItems(
    listTitle: string,
    query: IGraphListItemsQuery = {},
  ): Promise<readonly IGraphListItem[]> {
    const siteId = await this.resolveSiteId();
    const listId = await this.resolveListId(listTitle);
    const params = new URLSearchParams();
    const expand = query.select?.length ? `fields($select=${query.select.join(',')})` : 'fields';
    params.set('$expand', expand);
    if (query.filter) params.set('$filter', query.filter);
    if (query.orderby) params.set('$orderby', query.orderby);
    if (query.top) params.set('$top', String(query.top));
    const all: IGraphListItem[] = [];
    let url: string | null = `/sites/${siteId}/lists/${listId}/items?${params.toString()}`;
    while (url) {
      const headers: Record<string, string> = {};
      if (query.filter) headers['Prefer'] = 'HonorNonIndexedQueriesWarningMayFailRandomly';
      const res: Response = await this.graphFetch(url, { headers });
      const body = (await res.json()) as { value: IGraphListItem[]; ['@odata.nextLink']?: string };
      for (const item of body.value) all.push({ id: String(item.id), fields: item.fields ?? {} });
      if (query.top && all.length >= query.top) break;
      url = body['@odata.nextLink'] ?? null;
    }
    return query.top ? all.slice(0, query.top) : all;
  }

  private async getColumnNames(listId: string): Promise<Set<string>> {
    const cached = this.columnsByListId.get(listId);
    if (cached) return cached;
    const siteId = await this.resolveSiteId();
    const res = await this.graphFetch(
      `/sites/${siteId}/lists/${listId}/columns?$select=name,readOnly&$top=200`,
    );
    const body = (await res.json()) as { value: Array<{ name: string; readOnly?: boolean }> };
    const names = new Set(body.value.filter((c) => !c.readOnly).map((c) => c.name));
    this.columnsByListId.set(listId, names);
    return names;
  }

  private async filterFields(
    listId: string,
    fields: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const names = await this.getColumnNames(listId);
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (names.has(k) && v !== undefined && v !== null) out[k] = v;
    }
    return out;
  }

  async addItem(listTitle: string, fields: Record<string, unknown>): Promise<IGraphListItem> {
    const siteId = await this.resolveSiteId();
    const listId = await this.resolveListId(listTitle);
    const safeFields = await this.filterFields(listId, fields);
    const res = await this.graphFetch(`/sites/${siteId}/lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ fields: safeFields }),
    });
    const body = (await res.json()) as { id: string; fields: Record<string, unknown> };
    return { id: String(body.id), fields: body.fields ?? {} };
  }

  async updateItem(
    listTitle: string,
    itemId: string | number,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const siteId = await this.resolveSiteId();
    const listId = await this.resolveListId(listTitle);
    const safeFields = await this.filterFields(listId, fields);
    await this.graphFetch(`/sites/${siteId}/lists/${listId}/items/${itemId}/fields`, {
      method: 'PATCH',
      body: JSON.stringify(safeFields),
    });
  }

  /**
   * Same as `updateItem` but preserves `null` field values so callers can clear
   * SharePoint columns (e.g., clearing `DeactivatedAtUtc` on reactivation).
   * `undefined` properties are still dropped. Writable-column filtering still
   * applies.
   */
  async updateItemAllowNulls(
    listTitle: string,
    itemId: string | number,
    fields: Record<string, unknown>,
  ): Promise<void> {
    const siteId = await this.resolveSiteId();
    const listId = await this.resolveListId(listTitle);
    const writable = await this.getColumnNames(listId);
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v === undefined) continue;
      if (!writable.has(k)) continue;
      payload[k] = v;
    }
    await this.graphFetch(`/sites/${siteId}/lists/${listId}/items/${itemId}/fields`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }
}
