import { randomUUID } from 'node:crypto';
import {
  foleonApiConfigured,
  foleonGraphConfigured,
  readFoleonBackendConfig,
  type FoleonBackendConfig,
} from '../config/foleon-list-definitions.js';
import {
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import type {
  FoleonContentDetailDto,
  FoleonContentMutationRequest,
  FoleonContentSummaryDto,
  FoleonPlacementDto,
  FoleonPlacementMutationRequest,
  FoleonSyncRunDto,
  FoleonSyncStatusDto,
  FoleonValidationResult,
} from './foleon-types.js';

/** Normalized row produced from heterogeneous Foleon catalog payloads (docs/projects APIs). */
export interface NormalizedFoleonApiDocument {
  readonly foleonDocId: number;
  readonly title: string;
  readonly publishedUrl?: string;
  readonly embedUrl?: string;
  readonly foleonUid?: string;
  readonly identifier?: string;
}

export class FoleonServiceError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly details?: Record<string, unknown>;

  constructor(input: {
    readonly status: number;
    readonly code: string;
    readonly message: string;
    readonly retryable?: boolean;
    readonly details?: Record<string, unknown>;
  }) {
    super(input.message);
    this.name = 'FoleonServiceError';
    this.status = input.status;
    this.code = input.code;
    this.retryable = input.retryable ?? false;
    this.details = input.details;
  }
}

interface GraphListItem {
  readonly id: string;
  readonly eTag?: string;
  readonly fields?: Record<string, unknown>;
}

interface GraphListResponse {
  readonly value?: ReadonlyArray<GraphListItem>;
}

export interface IFoleonService {
  listContent(): Promise<ReadonlyArray<FoleonContentSummaryDto>>;
  getContent(id: string): Promise<FoleonContentDetailDto>;
  createContent(input: FoleonContentMutationRequest, correlationId: string): Promise<FoleonContentDetailDto>;
  updateContent(
    id: string,
    input: FoleonContentMutationRequest,
    correlationId: string,
  ): Promise<FoleonContentDetailDto>;
  validateContent(id: string, correlationId: string): Promise<FoleonValidationResult>;
  publishContent(id: string, correlationId: string): Promise<FoleonContentDetailDto>;
  suppressContent(id: string, correlationId: string): Promise<FoleonContentDetailDto>;
  listPlacements(): Promise<ReadonlyArray<FoleonPlacementDto>>;
  createPlacement(input: FoleonPlacementMutationRequest, correlationId: string): Promise<FoleonPlacementDto>;
  updatePlacement(
    id: string,
    input: FoleonPlacementMutationRequest,
    correlationId: string,
  ): Promise<FoleonPlacementDto>;
  deletePlacement(id: string, correlationId: string): Promise<FoleonPlacementDto>;
  syncDocs(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto>;
  syncProjects(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto>;
  getSyncStatus(): Promise<FoleonSyncStatusDto>;
  listSyncRuns(): Promise<ReadonlyArray<FoleonSyncRunDto>>;
  provisionSharePoint(correlationId: string): Promise<FoleonSyncRunDto>;
  validateSharePoint(correlationId: string): Promise<FoleonSyncRunDto>;
  getSafeConfig(): Promise<FoleonSyncStatusDto['config']>;
}

export class FoleonService implements IFoleonService {
  constructor(
    private readonly config: FoleonBackendConfig = readFoleonBackendConfig(),
    private readonly tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService(),
  ) {}

  async listContent(): Promise<ReadonlyArray<FoleonContentSummaryDto>> {
    const rows = await this.readList(this.requireContentListId(), 'fields');
    return rows.map((item) => toContentDetail(item));
  }

  async getContent(id: string): Promise<FoleonContentDetailDto> {
    return toContentDetail(await this.readItem(this.requireContentListId(), id));
  }

  async createContent(
    input: FoleonContentMutationRequest,
    correlationId: string,
  ): Promise<FoleonContentDetailDto> {
    const validation = validateContentMutation(input, correlationId);
    if (validation.status === 'blocked') {
      throw new FoleonServiceError({
        status: 422,
        code: 'FOLEON_PLACEMENT_INVALID',
        message: 'Foleon content failed validation.',
        details: { validation },
      });
    }
    const item = await this.createItem(this.requireContentListId(), contentFields(input, validation));
    return toContentDetail(item);
  }

  async updateContent(
    id: string,
    input: FoleonContentMutationRequest,
    correlationId: string,
  ): Promise<FoleonContentDetailDto> {
    const validation = validateContentMutation(input, correlationId);
    if (validation.status === 'blocked') {
      throw new FoleonServiceError({
        status: 422,
        code: 'FOLEON_PLACEMENT_INVALID',
        message: 'Foleon content failed validation.',
        details: { validation },
      });
    }
    const item = await this.updateItem(
      this.requireContentListId(),
      id,
      contentFields(input, validation),
      input.etag,
    );
    return toContentDetail(item);
  }

  async validateContent(id: string, correlationId: string): Promise<FoleonValidationResult> {
    const content = toContentDetail(await this.readItem(this.requireContentListId(), id));
    return validateContentMutation(contentToMutation(content), correlationId);
  }

  async publishContent(id: string, correlationId: string): Promise<FoleonContentDetailDto> {
    const content = await this.getContent(id);
    const input = contentToMutation({ ...content, publishStatus: 'Published', isVisible: true });
    const validation = validateContentMutation(input, correlationId);
    if (validation.status === 'blocked') {
      throw new FoleonServiceError({
        status: 422,
        code: 'FOLEON_PLACEMENT_INVALID',
        message: 'Published content must pass reader-gate validation.',
        details: { validation },
      });
    }
    const item = await this.updateItem(this.requireContentListId(), id, {
      PublishStatus: 'Published',
      IsVisible: true,
      PublishedOn: new Date().toISOString(),
      ValidationStatus: validation.status,
      BlockingReasons: validation.blockingReasons.join('; '),
    }, content.etag);
    return toContentDetail(item);
  }

  async suppressContent(id: string, _correlationId: string): Promise<FoleonContentDetailDto> {
    const content = await this.getContent(id);
    const item = await this.updateItem(this.requireContentListId(), id, {
      PublishStatus: 'Suppressed',
      IsVisible: false,
      IsHomepageEligible: false,
    }, content.etag);
    return toContentDetail(item);
  }

  async listPlacements(): Promise<ReadonlyArray<FoleonPlacementDto>> {
    const rows = await this.readList(this.requirePlacementsListId(), 'fields');
    return rows.map((item) => toPlacement(item));
  }

  async createPlacement(
    input: FoleonPlacementMutationRequest,
    correlationId: string,
  ): Promise<FoleonPlacementDto> {
    const content = await this.getContent(String(input.contentItemId));
    const validation = validatePlacementMutation(input, content, correlationId);
    if (validation.status === 'blocked') {
      throw new FoleonServiceError({
        status: 422,
        code: 'FOLEON_PLACEMENT_INVALID',
        message: 'Homepage placement failed validation.',
        details: { validation },
      });
    }
    const item = await this.createItem(this.requirePlacementsListId(), placementFields(input, content, validation));
    return toPlacement(item);
  }

  async updatePlacement(
    id: string,
    input: FoleonPlacementMutationRequest,
    correlationId: string,
  ): Promise<FoleonPlacementDto> {
    const content = await this.getContent(String(input.contentItemId));
    const validation = validatePlacementMutation(input, content, correlationId);
    if (validation.status === 'blocked') {
      throw new FoleonServiceError({
        status: 422,
        code: 'FOLEON_PLACEMENT_INVALID',
        message: 'Homepage placement failed validation.',
        details: { validation },
      });
    }
    const item = await this.updateItem(
      this.requirePlacementsListId(),
      id,
      placementFields(input, content, validation),
      input.etag,
    );
    return toPlacement(item);
  }

  async deletePlacement(id: string, correlationId: string): Promise<FoleonPlacementDto> {
    const placement = await this.readItem(this.requirePlacementsListId(), id);
    const item = await this.updateItem(this.requirePlacementsListId(), id, {
      IsActive: false,
      ValidationStatus: 'valid',
      BlockingReasons: '',
      LastValidationCorrelationId: correlationId,
    }, placement.eTag);
    return toPlacement(item);
  }

  async syncDocs(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto> {
    return this.syncFromFoleon('Docs', this.config.foleonDocsUrl, correlationId, requestedBy);
  }

  async syncProjects(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto> {
    return this.syncFromFoleon('Projects', this.config.foleonProjectsUrl, correlationId, requestedBy);
  }

  async getSyncStatus(): Promise<FoleonSyncStatusDto> {
    const runs = await this.listSyncRuns().catch(() => []);
    const config = await this.getSafeConfig();
    const lastRun = runs[0];
    return {
      health: !config.graphConfigured || !config.foleonApiConfigured
        ? 'not-configured'
        : lastRun?.status === 'Failed'
          ? 'degraded'
          : 'ready',
      lastRun,
      config,
    };
  }

  async listSyncRuns(): Promise<ReadonlyArray<FoleonSyncRunDto>> {
    if (!foleonGraphConfigured(this.config)) return [];
    const rows = await this.readList(this.requireSyncRunsListId(), 'fields');
    return rows.map((item) => toSyncRun(item)).sort((a, b) => b.startedAtUtc.localeCompare(a.startedAtUtc));
  }

  async provisionSharePoint(correlationId: string): Promise<FoleonSyncRunDto> {
    const run = makeRun('Provisioning', correlationId, undefined, {
      status: foleonGraphConfigured(this.config) ? 'Succeeded' : 'Failed',
      message: foleonGraphConfigured(this.config)
        ? 'Foleon SharePoint contract is configured for backend validation.'
        : 'Foleon SharePoint Graph configuration is incomplete.',
    });
    await this.writeSyncRun(run);
    return run;
  }

  async validateSharePoint(correlationId: string): Promise<FoleonSyncRunDto> {
    const configEntries: ReadonlyArray<readonly [string, string | undefined]> = [
      ['HB_FOLEON_SHAREPOINT_SITE_URL', this.config.sharePointSiteUrl],
      ['HB_FOLEON_GRAPH_SITE_ID', this.config.graphSiteId],
      ['HB_FOLEON_CONTENT_REGISTRY_LIST_ID', this.config.contentRegistryListId],
      ['HB_FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID', this.config.homepagePlacementsListId],
      ['HB_FOLEON_SYNC_RUNS_LIST_ID', this.config.syncRunsListId],
    ];
    const missing = configEntries.filter(([, value]) => !value).map(([key]) => key);
    const run = makeRun('Validation', correlationId, undefined, {
      status: missing.length === 0 ? 'Succeeded' : 'Failed',
      message: missing.length === 0
        ? 'Foleon SharePoint list contract configuration is complete.'
        : `Missing Foleon SharePoint configuration: ${missing.join(', ')}`,
      itemsFailed: missing.length,
      failedItems: missing.map((key) => ({ key, message: 'Required backend setting is missing.' })),
    });
    await this.writeSyncRun(run);
    return run;
  }

  async getSafeConfig(): Promise<FoleonSyncStatusDto['config']> {
    return {
      graphConfigured: foleonGraphConfigured(this.config),
      foleonApiConfigured: foleonApiConfigured(this.config),
      sharePointSiteConfigured: !!this.config.sharePointSiteUrl,
    };
  }

  private async syncFromFoleon(
    runType: 'Docs' | 'Projects',
    endpoint: string,
    correlationId: string,
    requestedBy?: string,
  ): Promise<FoleonSyncRunDto> {
    if (!foleonGraphConfigured(this.config) || !foleonApiConfigured(this.config)) {
      const run = makeRun(runType, correlationId, requestedBy, {
        status: 'Failed',
        message: 'Foleon sync requires Graph list IDs and backend-only Foleon OAuth settings.',
      });
      await this.writeSyncRun(run);
      return run;
    }
    try {
      const accessToken = await this.getFoleonAccessToken();
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new FoleonServiceError({
          status: 502,
          code: 'FOLEON_SYNC_FAILED',
          message: `Foleon ${runType} API returned ${response.status}.`,
          retryable: response.status >= 500,
          details: { body: errText.slice(0, 800) },
        });
      }
      const body = await response.json() as { data?: unknown[]; items?: unknown[] };
      const items = Array.isArray(body.data) ? body.data : Array.isArray(body.items) ? body.items : [];
      const normalized = items
        .map((raw) => normalizeFoleonApiDocument(raw))
        .filter((doc): doc is NormalizedFoleonApiDocument => doc !== null);
      const upsert =
        normalized.length > 0
          ? await this.upsertRegistryRowsFromNormalized(normalized, correlationId)
          : { created: 0, updated: 0, failed: 0, errors: [] as ReadonlyArray<{ readonly key: string; readonly message: string }> };
      const unrecognized = items.length - normalized.length;
      const partial =
        upsert.failed > 0 || (items.length > 0 && normalized.length === 0);
      const run = makeRun(runType, correlationId, requestedBy, {
        status: partial && upsert.created + upsert.updated === 0 ? 'Failed' : partial ? 'Partial' : 'Succeeded',
        message:
          normalized.length === 0 && items.length > 0
            ? `Foleon ${runType} payload contained ${items.length} entries but none matched the governed document shape.`
            : `Synced ${items.length} Foleon ${runType.toLowerCase()} through backend OAuth (${upsert.created} created, ${upsert.updated} updated, ${upsert.failed} failed${unrecognized ? `, ${unrecognized} unrecognized` : ''}).`,
        itemsScanned: items.length,
        itemsCreated: upsert.created,
        itemsUpdated: upsert.updated,
        itemsFailed: upsert.failed + unrecognized,
        failedItems: [
          ...upsert.errors,
          ...(unrecognized > 0
            ? [{ key: 'unrecognized', message: `${unrecognized} payload rows could not be mapped to Foleon Doc ID + title.` }]
            : []),
        ],
      });
      await this.writeSyncRun(run);
      return run;
    } catch (err) {
      const run = makeRun(runType, correlationId, requestedBy, {
        status: 'Failed',
        message: err instanceof Error ? err.message : String(err),
        itemsFailed: 1,
        failedItems: [{ key: runType, message: err instanceof Error ? err.message : String(err) }],
      });
      await this.writeSyncRun(run);
      return run;
    }
  }

  private async getFoleonAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.foleonClientId ?? '',
      client_secret: this.config.foleonClientSecret ?? '',
    });
    const response = await fetch(this.config.foleonTokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const raw = await response.text();
    if (!response.ok) {
      let oauthHint = raw.slice(0, 400);
      try {
        const errJson = JSON.parse(raw) as { error?: string; error_description?: string };
        oauthHint = errJson.error_description ?? errJson.error ?? oauthHint;
      } catch {
        // keep text slice
      }
      throw new FoleonServiceError({
        status: 502,
        code: 'FOLEON_SYNC_FAILED',
        message: `Foleon OAuth token request returned ${response.status}: ${oauthHint}`,
        retryable: response.status >= 500,
        details: { oauthStatus: response.status },
      });
    }
    let json: { access_token?: string };
    try {
      json = JSON.parse(raw) as { access_token?: string };
    } catch {
      throw new FoleonServiceError({
        status: 502,
        code: 'FOLEON_SYNC_FAILED',
        message: 'Foleon OAuth response was not valid JSON.',
      });
    }
    if (!json.access_token) {
      throw new FoleonServiceError({
        status: 502,
        code: 'FOLEON_SYNC_FAILED',
        message: 'Foleon OAuth response did not include an access token.',
      });
    }
    return json.access_token;
  }

  private async readList(listId: string, expand: string): Promise<ReadonlyArray<GraphListItem>> {
    const response = await this.graphFetch(
      `/sites/${encodeURIComponent(this.requireGraphSiteId())}/lists/${encodeURIComponent(listId)}/items?$expand=${expand}`,
    );
    const body = await response.json() as GraphListResponse;
    return body.value ?? [];
  }

  private async readItem(listId: string, itemId: string): Promise<GraphListItem> {
    const response = await this.graphFetch(
      `/sites/${encodeURIComponent(this.requireGraphSiteId())}/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}?$expand=fields`,
    );
    return await response.json() as GraphListItem;
  }

  private async createItem(listId: string, fields: Record<string, unknown>): Promise<GraphListItem> {
    const response = await this.graphFetch(
      `/sites/${encodeURIComponent(this.requireGraphSiteId())}/lists/${encodeURIComponent(listId)}/items`,
      { method: 'POST', body: JSON.stringify({ fields }) },
    );
    const item = await response.json() as GraphListItem;
    return this.readItem(listId, item.id);
  }

  private async updateItem(
    listId: string,
    itemId: string,
    fields: Record<string, unknown>,
    etag?: string,
  ): Promise<GraphListItem> {
    await this.graphFetch(
      `/sites/${encodeURIComponent(this.requireGraphSiteId())}/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}/fields`,
      {
        method: 'PATCH',
        body: JSON.stringify(fields),
        headers: etag ? { 'If-Match': etag } : undefined,
      },
    );
    return this.readItem(listId, itemId);
  }

  private async graphFetch(
    path: string,
    init?: { readonly method?: string; readonly body?: string; readonly headers?: Record<string, string> },
  ): Promise<Response> {
    if (!foleonGraphConfigured(this.config)) {
      throw new FoleonServiceError({
        status: 503,
        code: 'FOLEON_CONFIG_MISSING',
        message: 'Foleon Graph configuration is incomplete.',
        retryable: false,
      });
    }
    const token = await this.tokenService.acquireAppToken(['https://graph.microsoft.com/.default']);
    const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
      method: init?.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: init?.body,
    });
    if (!response.ok) {
      const graphBody = await response.text();
      const isConflict = response.status === 412 || response.status === 409;
      throw new FoleonServiceError({
        status: isConflict ? 409 : response.status >= 400 && response.status < 500 ? response.status : 502,
        code: isConflict ? 'FOLEON_GRAPH_CONFLICT' : 'FOLEON_GRAPH_WRITE_FAILED',
        message: `Microsoft Graph returned ${response.status} for Foleon list operation.`,
        retryable: response.status >= 500,
        details: { graphStatus: response.status, graphBody: graphBody.slice(0, 800) },
      });
    }
    return response;
  }

  private async writeSyncRun(run: FoleonSyncRunDto): Promise<void> {
    if (!foleonGraphConfigured(this.config)) return;
    try {
      await this.createItem(this.requireSyncRunsListId(), {
        Title: `${run.runType} ${run.status}`,
        RunId: run.id,
        RunType: run.runType,
        Status: run.status,
        StartedAtUtc: run.startedAtUtc,
        CompletedAtUtc: run.completedAtUtc,
        RequestedBy: run.requestedBy,
        CorrelationId: run.correlationId,
        ItemsScanned: run.itemsScanned,
        ItemsCreated: run.itemsCreated,
        ItemsUpdated: run.itemsUpdated,
        ItemsFailed: run.itemsFailed,
        Message: run.message,
        FailedItemsJson: JSON.stringify(run.failedItems),
      });
    } catch {
      // Sync-run writes are operational proof, but must not mask the primary operation result.
    }
  }

  private requireGraphSiteId(): string {
    if (!this.config.graphSiteId) throw missingConfig('HB_FOLEON_GRAPH_SITE_ID');
    return this.config.graphSiteId;
  }

  private requireContentListId(): string {
    if (!this.config.contentRegistryListId) {
      throw missingConfig('HB_FOLEON_CONTENT_REGISTRY_LIST_ID');
    }
    return this.config.contentRegistryListId;
  }

  private requirePlacementsListId(): string {
    if (!this.config.homepagePlacementsListId) {
      throw missingConfig('HB_FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID');
    }
    return this.config.homepagePlacementsListId;
  }

  private requireSyncRunsListId(): string {
    if (!this.config.syncRunsListId) throw missingConfig('HB_FOLEON_SYNC_RUNS_LIST_ID');
    return this.config.syncRunsListId;
  }

  private async upsertRegistryRowsFromNormalized(
    docs: ReadonlyArray<NormalizedFoleonApiDocument>,
    correlationId: string,
  ): Promise<{
    created: number;
    updated: number;
    failed: number;
    errors: ReadonlyArray<{ readonly key: string; readonly message: string }>;
  }> {
    const listId = this.requireContentListId();
    const existing = await this.readList(listId, 'fields');
    const byDocId = new Map<number, GraphListItem>();
    for (const row of existing) {
      const docId = readNumber(row.fields?.FoleonDocId);
      if (docId) byDocId.set(docId, row);
    }
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ key: string; message: string }> = [];
    for (const doc of docs) {
      try {
        const current = byDocId.get(doc.foleonDocId);
        const mutationRequest: FoleonContentMutationRequest = {
          title: doc.title,
          foleonDocId: doc.foleonDocId,
          contentTypeKey: 'Other',
          publishStatus: 'Draft',
          isVisible: false,
          isHomepageEligible: false,
          publishedUrl: doc.publishedUrl,
          embedUrl: doc.embedUrl ?? doc.publishedUrl,
          summary: `Imported from Foleon API sync (${correlationId}).`,
          openMode: 'Inline Reader',
          allowEmbed: true,
          requiresExternalOpen: false,
        };
        const validation = validateContentMutation(mutationRequest, correlationId);
        if (!current) {
          const fields = {
            ...contentFields(mutationRequest, validation),
            SyncSource: 'Foleon API',
            LastSynced: new Date().toISOString(),
            ...(doc.foleonUid ? { FoleonDocUid: doc.foleonUid } : {}),
            ...(doc.identifier ? { FoleonIdentifier: doc.identifier } : {}),
          };
          const item = await this.createItem(listId, fields);
          byDocId.set(doc.foleonDocId, item);
          created += 1;
        } else {
          const detail = toContentDetail(current);
          const patch: Record<string, unknown> = {
            Title: doc.title,
            LastSynced: new Date().toISOString(),
            SyncSource: 'Foleon API',
            ...(doc.publishedUrl ? { PublishedUrl: doc.publishedUrl } : {}),
            ...(doc.embedUrl ? { EmbedUrl: doc.embedUrl } : {}),
            ...(doc.foleonUid ? { FoleonDocUid: doc.foleonUid } : {}),
            ...(doc.identifier ? { FoleonIdentifier: doc.identifier } : {}),
          };
          const item = await this.updateItem(listId, current.id, patch, detail.etag);
          byDocId.set(doc.foleonDocId, item);
          updated += 1;
        }
      } catch (err) {
        failed += 1;
        errors.push({
          key: `doc:${doc.foleonDocId}`,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return { created, updated, failed, errors };
  }
}

export class MockFoleonService implements IFoleonService {
  private readonly content = new Map<string, FoleonContentDetailDto>();
  private readonly placements = new Map<string, FoleonPlacementDto>();
  private readonly syncRuns: FoleonSyncRunDto[] = [];

  constructor() {
    const seed: FoleonContentDetailDto = {
      id: '1',
      sharePointItemId: 1,
      etag: '"1"',
      title: 'Mock Project Highlight',
      foleonDocId: 1001,
      contentTypeKey: 'Project Highlight',
      readerKey: 'project-spotlight',
      cadence: 'Monthly',
      homepageSlot: 'Project Spotlight Reader',
      archiveGroup: '2026-04',
      activeEdition: true,
      primaryAudience: 'Companywide',
      lastEditorialUpdate: new Date(0).toISOString(),
      publishStatus: 'Published',
      isVisible: true,
      isHomepageEligible: true,
      publishedUrl: 'https://viewer.us.foleon.com/mock/doc',
      embedUrl: 'https://viewer.us.foleon.com/mock/doc',
      thumbnailUrl: undefined,
      summary: 'A governed mock Foleon record for local and test surfaces.',
      region: 'Palm Beach',
      sector: 'Commercial',
      validationStatus: 'valid',
      blockingReasons: [],
      tags: ['mock'],
      openMode: 'Inline Reader',
      allowEmbed: true,
      requiresExternalOpen: false,
      syncSource: 'Manual',
    };
    this.content.set(seed.id, seed);
  }

  async listContent(): Promise<ReadonlyArray<FoleonContentSummaryDto>> {
    return [...this.content.values()];
  }

  async getContent(id: string): Promise<FoleonContentDetailDto> {
    const record = this.content.get(id);
    if (!record) throw notFound('content', id);
    return record;
  }

  async createContent(input: FoleonContentMutationRequest, correlationId: string): Promise<FoleonContentDetailDto> {
    const id = String(this.content.size + 1);
    const validation = validateContentMutation(input, correlationId);
    const record = mutationToContent(id, input, validation);
    this.content.set(id, record);
    return record;
  }

  async updateContent(
    id: string,
    input: FoleonContentMutationRequest,
    correlationId: string,
  ): Promise<FoleonContentDetailDto> {
    await this.getContent(id);
    const validation = validateContentMutation(input, correlationId);
    const record = mutationToContent(id, input, validation);
    this.content.set(id, record);
    return record;
  }

  async validateContent(id: string, correlationId: string): Promise<FoleonValidationResult> {
    const record = await this.getContent(id);
    return validateContentMutation(contentToMutation(record), correlationId);
  }

  async publishContent(id: string, correlationId: string): Promise<FoleonContentDetailDto> {
    const record = await this.getContent(id);
    const next = await this.updateContent(
      id,
      contentToMutation({ ...record, publishStatus: 'Published', isVisible: true }),
      correlationId,
    );
    return { ...next, publishedOn: new Date().toISOString() };
  }

  async suppressContent(id: string, _correlationId: string): Promise<FoleonContentDetailDto> {
    const record = await this.getContent(id);
    const next = { ...record, publishStatus: 'Suppressed', isVisible: false, isHomepageEligible: false };
    this.content.set(id, next);
    return next;
  }

  async listPlacements(): Promise<ReadonlyArray<FoleonPlacementDto>> {
    return [...this.placements.values()];
  }

  async createPlacement(
    input: FoleonPlacementMutationRequest,
    correlationId: string,
  ): Promise<FoleonPlacementDto> {
    const id = String(this.placements.size + 1);
    const content = await this.getContent(String(input.contentItemId));
    const validation = validatePlacementMutation(input, content, correlationId);
    const placement = mutationToPlacement(id, input, content, validation);
    this.placements.set(id, placement);
    return placement;
  }

  async updatePlacement(
    id: string,
    input: FoleonPlacementMutationRequest,
    correlationId: string,
  ): Promise<FoleonPlacementDto> {
    if (!this.placements.has(id)) throw notFound('placement', id);
    const content = await this.getContent(String(input.contentItemId));
    const validation = validatePlacementMutation(input, content, correlationId);
    const placement = mutationToPlacement(id, input, content, validation);
    this.placements.set(id, placement);
    return placement;
  }

  async deletePlacement(id: string, _correlationId: string): Promise<FoleonPlacementDto> {
    const placement = this.placements.get(id);
    if (!placement) throw notFound('placement', id);
    const next = { ...placement, isActive: false };
    this.placements.set(id, next);
    return next;
  }

  async syncDocs(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto> {
    return this.pushMockRun('Docs', correlationId, requestedBy);
  }

  async syncProjects(correlationId: string, requestedBy?: string): Promise<FoleonSyncRunDto> {
    return this.pushMockRun('Projects', correlationId, requestedBy);
  }

  async getSyncStatus(): Promise<FoleonSyncStatusDto> {
    return {
      health: 'ready',
      lastRun: this.syncRuns[0],
      config: await this.getSafeConfig(),
    };
  }

  async listSyncRuns(): Promise<ReadonlyArray<FoleonSyncRunDto>> {
    return this.syncRuns;
  }

  async provisionSharePoint(correlationId: string): Promise<FoleonSyncRunDto> {
    return this.pushMockRun('Provisioning', correlationId);
  }

  async validateSharePoint(correlationId: string): Promise<FoleonSyncRunDto> {
    return this.pushMockRun('Validation', correlationId);
  }

  async getSafeConfig(): Promise<FoleonSyncStatusDto['config']> {
    return {
      graphConfigured: true,
      foleonApiConfigured: true,
      sharePointSiteConfigured: true,
    };
  }

  private pushMockRun(
    runType: FoleonSyncRunDto['runType'],
    correlationId: string,
    requestedBy?: string,
  ): FoleonSyncRunDto {
    const run = makeRun(runType, correlationId, requestedBy, {
      status: 'Succeeded',
      message: `Mock ${runType.toLowerCase()} run completed.`,
      itemsScanned: this.content.size,
    });
    this.syncRuns.unshift(run);
    return run;
  }
}

export function createFoleonService(): IFoleonService {
  if (process.env.NODE_ENV === 'test' || process.env.HB_BACKEND_ADAPTER_MODE === 'mock') {
    return new MockFoleonService();
  }
  return new FoleonService();
}

export function validateContentMutation(
  input: FoleonContentMutationRequest,
  correlationId: string,
): FoleonValidationResult {
  const blockingReasons: string[] = [];
  const warnings: string[] = [];
  if (!input.title.trim()) blockingReasons.push('Title is required.');
  if (!Number.isInteger(input.foleonDocId) || input.foleonDocId <= 0) {
    blockingReasons.push('Foleon Doc ID must be a positive integer.');
  }
  validateHttpsUrl(input.publishedUrl, 'Published URL', blockingReasons);
  validateHttpsUrl(input.embedUrl, 'Embed URL', blockingReasons);
  if (input.publishStatus === 'Published' && !input.isVisible) {
    blockingReasons.push('Published content must be visible before display.');
  }
  if (input.publishStatus === 'Published' && !input.publishedUrl && !input.embedUrl) {
    blockingReasons.push('Published content requires a Published URL or Embed URL.');
  }
  if (input.allowEmbed && input.requiresExternalOpen) {
    warnings.push('Content allows embed but is also marked for external open.');
  }
  if (input.openMode === 'New Tab Only' && input.allowEmbed) {
    warnings.push('New Tab Only content should not depend on iframe embed.');
  }
  if (input.displayFrom && input.displayThrough) {
    const from = Date.parse(input.displayFrom);
    const through = Date.parse(input.displayThrough);
    if (!Number.isNaN(from) && !Number.isNaN(through) && through < from) {
      blockingReasons.push('Display Through must be after Display From.');
    }
  }
  return {
    status: blockingReasons.length > 0 ? 'blocked' : warnings.length > 0 ? 'warning' : 'valid',
    blockingReasons,
    warnings,
    normalizedFields: {
      requiresExternalOpen: input.requiresExternalOpen ?? input.openMode === 'New Tab Only',
    },
    checkedAtUtc: new Date().toISOString(),
    correlationId,
  };
}

function validatePlacementMutation(
  input: FoleonPlacementMutationRequest,
  content: FoleonContentDetailDto,
  correlationId: string,
): FoleonValidationResult {
  const blockingReasons: string[] = [];
  if (!input.title.trim()) blockingReasons.push('Placement title is required.');
  if (input.isActive && (content.publishStatus !== 'Published' || !content.isVisible)) {
    blockingReasons.push('Active placement requires published, visible content.');
  }
  if (input.isActive && !content.isHomepageEligible) {
    blockingReasons.push('Active placement requires homepage-eligible content.');
  }
  if (input.displayFrom && input.displayThrough) {
    const from = Date.parse(input.displayFrom);
    const through = Date.parse(input.displayThrough);
    if (!Number.isNaN(from) && !Number.isNaN(through) && through < from) {
      blockingReasons.push('Placement Display Through must be after Display From.');
    }
  }
  return {
    status: blockingReasons.length > 0 ? 'blocked' : 'valid',
    blockingReasons,
    warnings: [],
    normalizedFields: {
      ContentLookupId: input.contentItemId,
      ContentIdCache: content.foleonDocId,
    },
    checkedAtUtc: new Date().toISOString(),
    correlationId,
  };
}

function validateHttpsUrl(value: string | undefined, label: string, blockingReasons: string[]): void {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') blockingReasons.push(`${label} must use HTTPS.`);
    if (url.href.toLowerCase().includes('preview')) {
      blockingReasons.push(`${label} cannot be a preview URL for publish-ready content.`);
    }
  } catch {
    blockingReasons.push(`${label} must be a valid URL.`);
  }
}

function contentFields(
  input: FoleonContentMutationRequest,
  validation: FoleonValidationResult,
): Record<string, unknown> {
  return {
    Title: input.title,
    FoleonDocId: input.foleonDocId,
    ContentTypeKey: input.contentTypeKey,
    ReaderKey: input.readerKey,
    Cadence: input.cadence,
    HomepageSlot: input.homepageSlot,
    ArchiveGroup: input.archiveGroup,
    ActiveEdition: input.activeEdition === true,
    PrimaryAudience: input.primaryAudience,
    LastEditorialUpdate: input.lastEditorialUpdate,
    PublishStatus: input.publishStatus,
    IsVisible: input.isVisible,
    IsHomepageEligible: input.isHomepageEligible === true,
    PublishedUrl: input.publishedUrl,
    EmbedUrl: input.embedUrl,
    ThumbnailUrl: input.thumbnailUrl,
    HeroImageUrl: input.heroImageUrl,
    Summary: input.summary,
    Region: input.region,
    Sector: input.sector,
    Tags: input.tags?.join('; '),
    DisplayFrom: input.displayFrom,
    DisplayThrough: input.displayThrough,
    OpenMode: input.openMode,
    AllowEmbed: input.allowEmbed,
    RequiresExternalOpen:
      input.requiresExternalOpen ?? input.openMode === 'New Tab Only',
    AdminNotes: input.adminNotes,
    SyncSource: 'Manual',
    ValidationStatus: validation.status,
    BlockingReasons: validation.blockingReasons.join('; '),
  };
}

function placementFields(
  input: FoleonPlacementMutationRequest,
  content: FoleonContentDetailDto,
  validation: FoleonValidationResult,
): Record<string, unknown> {
  return {
    Title: input.title,
    PlacementKey: input.placementKey,
    ContentLookupId: input.contentItemId,
    ContentIdCache: content.foleonDocId,
    IsActive: input.isActive,
    DisplayFrom: input.displayFrom,
    DisplayThrough: input.displayThrough,
    SortRank: input.sortRank,
    LayoutVariant: input.layoutVariant,
    AdminNotes: input.adminNotes,
    ValidationStatus: validation.status,
    BlockingReasons: validation.blockingReasons.join('; '),
  };
}

function toContentDetail(item: GraphListItem): FoleonContentDetailDto {
    const fields = item.fields ?? {};
  const id = String(item.id);
    const parsedItemId = Number.parseInt(id, 10) || 0;
  return {
    id,
    sharePointItemId: readNumber(fields.Id) ?? parsedItemId,
    etag: item.eTag ?? readString(fields['@odata.etag']) ?? '',
    title: readString(fields.Title) ?? '',
    foleonDocId: readNumber(fields.FoleonDocId) ?? 0,
    contentTypeKey: readString(fields.ContentTypeKey) ?? 'Other',
    readerKey: readReaderKey(fields.ReaderKey),
    cadence: readCadence(fields.Cadence),
    homepageSlot: readHomepageSlot(fields.HomepageSlot),
    archiveGroup: readString(fields.ArchiveGroup),
    activeEdition: readOptionalBoolean(fields.ActiveEdition),
    primaryAudience: readString(fields.PrimaryAudience),
    lastEditorialUpdate: readString(fields.LastEditorialUpdate),
    publishStatus: readString(fields.PublishStatus) ?? 'Draft',
    isVisible: readBoolean(fields.IsVisible),
    isHomepageEligible: readBoolean(fields.IsHomepageEligible),
    publishedUrl: readString(fields.PublishedUrl),
    embedUrl: readString(fields.EmbedUrl),
    thumbnailUrl: readString(fields.ThumbnailUrl),
    summary: readString(fields.Summary),
    region: readString(fields.Region),
    sector: readString(fields.Sector),
    publishedOn: readString(fields.PublishedOn),
    validationStatus: readValidationStatus(fields.ValidationStatus),
    blockingReasons: splitReasons(fields.BlockingReasons),
    previewUrl: readString(fields.PreviewUrl),
    heroImageUrl: readString(fields.HeroImageUrl),
    marketingOwner: readString(fields.MarketingOwner),
    issueDate: readString(fields.IssueDate),
    displayFrom: readString(fields.DisplayFrom),
    displayThrough: readString(fields.DisplayThrough),
    relatedProjectNumber: readString(fields.RelatedProjectNumber),
    relatedProjectName: readString(fields.RelatedProjectName),
    relatedProjectSiteUrl: readString(fields.RelatedProjectSiteUrl),
    tags: splitReasons(fields.Tags),
    openMode: readOpenMode(fields.OpenMode),
    allowEmbed: readBoolean(fields.AllowEmbed),
    requiresExternalOpen: readBoolean(fields.RequiresExternalOpen),
    syncSource: readSyncSource(fields.SyncSource),
    lastSynced: readString(fields.LastSynced),
    adminNotes: readString(fields.AdminNotes),
  };
}

function toPlacement(item: GraphListItem): FoleonPlacementDto {
  const fields = item.fields ?? {};
  const id = String(item.id);
  const parsedItemId = Number.parseInt(id, 10) || 0;
  const placementValidationStatus = readValidationStatus(fields.ValidationStatus);
  return {
    id,
    sharePointItemId: readNumber(fields.Id) ?? parsedItemId,
    etag: item.eTag ?? readString(fields['@odata.etag']) ?? '',
    title: readString(fields.Title) ?? '',
    placementKey: readPlacementKey(fields.PlacementKey),
    contentItemId: readNumber(fields.ContentLookupId) ?? 0,
    foleonDocId: readNumber(fields.ContentIdCache) ?? 0,
    isActive: readBoolean(fields.IsActive),
    displayFrom: readString(fields.DisplayFrom),
    displayThrough: readString(fields.DisplayThrough),
    sortRank: readNumber(fields.SortRank) ?? 0,
    layoutVariant: readLayoutVariant(fields.LayoutVariant),
    validationStatus: placementValidationStatus === 'unknown'
      ? 'warning'
      : placementValidationStatus,
    blockingReasons: splitReasons(fields.BlockingReasons),
  };
}

function toSyncRun(item: GraphListItem): FoleonSyncRunDto {
  const fields = item.fields ?? {};
  const failedItemsRaw = readString(fields.FailedItemsJson);
  return {
    id: readString(fields.RunId) ?? String(item.id),
    startedAtUtc: readString(fields.StartedAtUtc) ?? '',
    completedAtUtc: readString(fields.CompletedAtUtc),
    runType: readRunType(fields.RunType),
    status: readRunStatus(fields.Status),
    requestedBy: readString(fields.RequestedBy),
    correlationId: readString(fields.CorrelationId) ?? '',
    itemsScanned: readNumber(fields.ItemsScanned) ?? 0,
    itemsCreated: readNumber(fields.ItemsCreated) ?? 0,
    itemsUpdated: readNumber(fields.ItemsUpdated) ?? 0,
    itemsFailed: readNumber(fields.ItemsFailed) ?? 0,
    message: readString(fields.Message),
    failedItems: failedItemsRaw ? parseFailedItems(failedItemsRaw) : [],
  };
}

function contentToMutation(record: FoleonContentDetailDto): FoleonContentMutationRequest {
  return {
    etag: record.etag,
    title: record.title,
    foleonDocId: record.foleonDocId,
    contentTypeKey: record.contentTypeKey,
    readerKey: record.readerKey,
    cadence: record.cadence,
    homepageSlot: record.homepageSlot,
    archiveGroup: record.archiveGroup,
    activeEdition: record.activeEdition,
    primaryAudience: record.primaryAudience,
    lastEditorialUpdate: record.lastEditorialUpdate,
    publishStatus: record.publishStatus,
    isVisible: record.isVisible,
    isHomepageEligible: record.isHomepageEligible,
    publishedUrl: record.publishedUrl,
    embedUrl: record.embedUrl,
    thumbnailUrl: record.thumbnailUrl,
    heroImageUrl: record.heroImageUrl,
    summary: record.summary,
    region: record.region,
    sector: record.sector,
    tags: record.tags,
    displayFrom: record.displayFrom,
    displayThrough: record.displayThrough,
    openMode: record.openMode,
    allowEmbed: record.allowEmbed,
    requiresExternalOpen: record.requiresExternalOpen,
    adminNotes: record.adminNotes,
  };
}

function mutationToContent(
  id: string,
  input: FoleonContentMutationRequest,
  validation: FoleonValidationResult,
): FoleonContentDetailDto {
  return {
    id,
    sharePointItemId: Number.parseInt(id, 10),
    etag: `"${Date.now()}"`,
    title: input.title,
    foleonDocId: input.foleonDocId,
    contentTypeKey: input.contentTypeKey,
    readerKey: input.readerKey,
    cadence: input.cadence,
    homepageSlot: input.homepageSlot,
    archiveGroup: input.archiveGroup,
    activeEdition: input.activeEdition === true,
    primaryAudience: input.primaryAudience,
    lastEditorialUpdate: input.lastEditorialUpdate,
    publishStatus: input.publishStatus,
    isVisible: input.isVisible,
    isHomepageEligible: input.isHomepageEligible === true,
    publishedUrl: input.publishedUrl,
    embedUrl: input.embedUrl,
    thumbnailUrl: input.thumbnailUrl,
    heroImageUrl: input.heroImageUrl,
    summary: input.summary,
    region: input.region,
    sector: input.sector,
    validationStatus: validation.status,
    blockingReasons: validation.blockingReasons,
    tags: input.tags ?? [],
    displayFrom: input.displayFrom,
    displayThrough: input.displayThrough,
    openMode: input.openMode,
    allowEmbed: input.allowEmbed,
    requiresExternalOpen: input.requiresExternalOpen ?? input.openMode === 'New Tab Only',
    syncSource: 'Manual',
    adminNotes: input.adminNotes,
  };
}

function mutationToPlacement(
  id: string,
  input: FoleonPlacementMutationRequest,
  content: FoleonContentDetailDto,
  validation: FoleonValidationResult,
): FoleonPlacementDto {
  return {
    id,
    sharePointItemId: Number.parseInt(id, 10),
    etag: `"${Date.now()}"`,
    title: input.title,
    placementKey: input.placementKey,
    contentItemId: input.contentItemId,
    foleonDocId: content.foleonDocId,
    isActive: input.isActive,
    displayFrom: input.displayFrom,
    displayThrough: input.displayThrough,
    sortRank: input.sortRank,
    layoutVariant: input.layoutVariant,
    validationStatus: validation.status,
    blockingReasons: validation.blockingReasons,
  };
}

function makeRun(
  runType: FoleonSyncRunDto['runType'],
  correlationId: string,
  requestedBy?: string,
  overrides: Partial<FoleonSyncRunDto> = {},
): FoleonSyncRunDto {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    startedAtUtc: now,
    completedAtUtc: now,
    runType,
    status: 'Succeeded',
    requestedBy,
    correlationId,
    itemsScanned: 0,
    itemsCreated: 0,
    itemsUpdated: 0,
    itemsFailed: 0,
    failedItems: [],
    ...overrides,
  };
}

function missingConfig(key: string): FoleonServiceError {
  return new FoleonServiceError({
    status: 503,
    code: 'FOLEON_CONFIG_MISSING',
    message: `Missing required Foleon backend setting: ${key}.`,
  });
}

function notFound(kind: string, id: string): FoleonServiceError {
  return new FoleonServiceError({
    status: 404,
    code: 'FOLEON_DOC_NOT_FOUND',
    message: `Foleon ${kind} '${id}' was not found.`,
  });
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === 'true';
}

function readOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return readBoolean(value);
}

function splitReasons(value: unknown): ReadonlyArray<string> {
  const text = readString(value);
  return text ? text.split(/[;,]/).map((part) => part.trim()).filter(Boolean) : [];
}

function readValidationStatus(value: unknown): FoleonContentDetailDto['validationStatus'] {
  return value === 'valid' || value === 'warning' || value === 'blocked' ? value : 'unknown';
}

function readOpenMode(value: unknown): FoleonContentDetailDto['openMode'] {
  return value === 'Fullscreen Reader' || value === 'New Tab Only' ? value : 'Inline Reader';
}

function readSyncSource(value: unknown): FoleonContentDetailDto['syncSource'] {
  return value === 'Foleon API' || value === 'Hybrid' ? value : 'Manual';
}

function readReaderKey(value: unknown): FoleonContentDetailDto['readerKey'] {
  if (value === 'project-spotlight' || value === 'company-pulse') return value;
  return undefined;
}

function readCadence(value: unknown): FoleonContentDetailDto['cadence'] {
  if (value === 'Monthly' || value === 'Weekly' || value === 'Frequent' || value === 'Ad Hoc') {
    return value;
  }
  return undefined;
}

function readHomepageSlot(value: unknown): FoleonContentDetailDto['homepageSlot'] {
  if (value === 'Project Spotlight Reader' || value === 'Company Pulse Reader') return value;
  return undefined;
}

function readPlacementKey(value: unknown): FoleonPlacementDto['placementKey'] {
  if (
    value === 'Hero' ||
    value === 'Primary Card' ||
    value === 'Secondary Card' ||
    value === 'Carousel' ||
    value === 'Archive Rail' ||
    value === 'Project Spotlight Active' ||
    value === 'Company Pulse Active'
  ) {
    return value;
  }
  return 'Secondary Card';
}

function readLayoutVariant(value: unknown): FoleonPlacementDto['layoutVariant'] {
  if (
    value === 'Large Feature' ||
    value === 'Compact Card' ||
    value === 'Square Tile' ||
    value === 'Text Rail'
  ) {
    return value;
  }
  return undefined;
}

function readRunType(value: unknown): FoleonSyncRunDto['runType'] {
  if (value === 'Projects' || value === 'Provisioning' || value === 'Validation') return value;
  return 'Docs';
}

function readRunStatus(value: unknown): FoleonSyncRunDto['status'] {
  if (value === 'Running' || value === 'Failed' || value === 'Partial') return value;
  return 'Succeeded';
}

function parseFailedItems(value: string): FoleonSyncRunDto['failedItems'] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { key: string; message: string } =>
        typeof item?.key === 'string' && typeof item?.message === 'string'
      );
  } catch {
    return [];
  }
}

function pickNumber(...inputs: ReadonlyArray<unknown>): number | undefined {
  for (const raw of inputs) {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return Math.trunc(raw);
    if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) return Number.parseInt(raw, 10);
  }
  return undefined;
}

function pickString(...inputs: ReadonlyArray<unknown>): string | undefined {
  for (const raw of inputs) {
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return undefined;
}

function firstHttpsUrl(...inputs: ReadonlyArray<unknown>): string | undefined {
  for (const raw of inputs) {
    const s = pickString(raw);
    if (s?.startsWith('https://')) return s;
  }
  return undefined;
}

/**
 * Maps heterogeneous Foleon API rows to governed registry identifiers.
 * Exported for unit tests — production sync calls this internally.
 */
export function normalizeFoleonApiDocument(raw: unknown): NormalizedFoleonApiDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const nestedDoc =
    typeof o.document === 'object' && o.document !== null ? (o.document as Record<string, unknown>) : undefined;
  const docId = pickNumber(
    o.id,
    o.document_id,
    o.documentId,
    o.doc_id,
    o.docId,
    nestedDoc ? pickNumber(nestedDoc.id) : undefined,
  );
  const title =
    pickString(o.title, o.name, o.display_name, o.displayName, o.label, o.slug)
    ?? (docId ? `Foleon document ${docId}` : undefined);
  if (!docId || !title) return null;
  return {
    foleonDocId: docId,
    title,
    publishedUrl: firstHttpsUrl(o.url, o.public_url, o.published_url, o.share_url, o.canonical_url),
    embedUrl: firstHttpsUrl(o.embed_url, o.embedUrl, o.viewer_url),
    foleonUid: pickString(o.uid, o.uuid, o.document_uid, o.documentUid),
    identifier: pickString(o.identifier, o.slug),
  };
}
