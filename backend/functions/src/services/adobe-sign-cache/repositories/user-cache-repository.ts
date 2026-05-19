/**
 * My Dashboard | Adobe Sign cache — user-cache repository (B05.15 Prompt 04).
 *
 * Graph-backed CRUD for the `MyDashboardAdobeSignUserCache` SharePoint list.
 * Read path (used by `MyWorkAdobeSignCacheReadModelProvider.getMyWorkHome`)
 * resolves a single row by `AdobeActorKey`, deserializes the cached JSON
 * snapshots through `parseCachedJsonSnapshot`, and surfaces a discriminated
 * result so the provider can distinguish:
 *
 *   - row missing                   → render hydration-pending posture
 *   - row present, snapshots valid  → serve cached preview + summary + freshness
 *   - row present, snapshots invalid → render backend-unavailable
 *
 * Mirrors `services/my-projects-projection/registry/my-projects-registry-repository.ts`
 * for the Graph adapter pattern.
 *
 * @module services/adobe-sign-cache/repositories/user-cache-repository
 */

import type {
  MyWorkAdobeSignActionQueueItem,
  MyWorkAdobeSignActionQueueSummary,
  MyWorkAdobeSignRecentCompletionsItem,
  MyWorkAdobeSignRecentCompletionsSummary,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_CACHE_FRESHNESS_STATES,
  ADOBE_SIGN_CACHE_HYDRATION_STATES,
  ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
  type AdobeSignCacheFreshnessState,
  type AdobeSignCacheHydrationState,
  type AdobeSignCacheSyncOutcome,
  type AdobeSignCachedSourceStatus,
} from '../cache-list-descriptors.js';
import {
  ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
  parseCachedJsonSnapshot,
  stringifyCachedJsonSnapshot,
  type CachedSnapshotParseFailureReason,
} from './cache-snapshot-codec.js';

const READ_SELECT_FIELDS = [
  'AdobeActorKey',
  'UserPrincipalName',
  'UserPrincipalNameNormalized',
  'IsActive',
  'CacheHydrationState',
  'CachedSourceStatus',
  'FreshnessState',
  'ActionQueuePreviewJson',
  'ActionQueueSummaryJson',
  'ActionQueueWarningsJson',
  'RecentCompletionsPreviewJson',
  'RecentCompletionsSummaryJson',
  'RecentCompletionsWarningsJson',
  'PendingActionCount',
  'RecentCompletionCount',
  'LastSuccessfulAdobeRefreshUtc',
  'LastWebhookRefreshUtc',
  'LastManualRefreshUtc',
  'LastReconciliationRefreshUtc',
  'NextReconciliationDueUtc',
  'LastSyncOutcome',
  'LastSyncFailureCode',
  'LastSyncFailureSummary',
  'CacheSchemaVersion',
  'ProjectionRevision',
] as const;

export interface AdobeSignUserCacheSnapshotsPayload {
  readonly actionQueuePreview: readonly MyWorkAdobeSignActionQueueItem[];
  readonly actionQueueSummary: MyWorkAdobeSignActionQueueSummary;
  readonly actionQueueWarnings: readonly MyWorkReadModelWarning[];
  readonly recentCompletionsPreview: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly recentCompletionsSummary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly recentCompletionsWarnings: readonly MyWorkReadModelWarning[];
}

export interface AdobeSignUserCacheRow {
  readonly listItemId: number;
  readonly adobeActorKey: string;
  readonly userPrincipalName?: string;
  readonly userPrincipalNameNormalized?: string;
  readonly isActive: boolean;
  readonly cacheHydrationState: AdobeSignCacheHydrationState;
  readonly cachedSourceStatus: MyWorkReadModelSourceStatus;
  readonly freshnessState: AdobeSignCacheFreshnessState;
  readonly pendingActionCount: number;
  readonly recentCompletionCount: number;
  readonly lastSuccessfulAdobeRefreshUtc?: string;
  readonly lastWebhookRefreshUtc?: string;
  readonly lastManualRefreshUtc?: string;
  readonly lastReconciliationRefreshUtc?: string;
  readonly nextReconciliationDueUtc?: string;
  readonly lastSyncOutcome?: AdobeSignCacheSyncOutcome;
  readonly lastSyncFailureCode?: string;
  readonly lastSyncFailureSummary?: string;
  readonly cacheSchemaVersion: number;
  readonly projectionRevision: number;
  readonly snapshots: AdobeSignUserCacheSnapshotsPayload;
}

export type AdobeSignUserCacheReadOutcome =
  | { readonly outcome: 'found'; readonly row: AdobeSignUserCacheRow }
  | { readonly outcome: 'missing' }
  | {
      readonly outcome: 'malformed';
      readonly column: keyof AdobeSignUserCacheSnapshotsPayload | 'envelope';
      readonly reason: CachedSnapshotParseFailureReason;
    };

export interface AdobeSignUserCacheUpsertInput {
  readonly adobeActorKey: string;
  readonly userPrincipalName?: string;
  readonly userPrincipalNameNormalized?: string;
  readonly isActive: boolean;
  readonly cacheHydrationState: AdobeSignCacheHydrationState;
  readonly cachedSourceStatus: MyWorkReadModelSourceStatus;
  readonly freshnessState: AdobeSignCacheFreshnessState;
  readonly pendingActionCount: number;
  readonly recentCompletionCount: number;
  readonly lastSuccessfulAdobeRefreshUtc?: string;
  readonly lastWebhookRefreshUtc?: string;
  readonly lastManualRefreshUtc?: string;
  readonly lastReconciliationRefreshUtc?: string;
  readonly nextReconciliationDueUtc?: string;
  readonly lastSyncOutcome?: AdobeSignCacheSyncOutcome;
  readonly lastSyncFailureCode?: string;
  readonly lastSyncFailureSummary?: string;
  readonly cacheSchemaVersion: number;
  readonly projectionRevision: number;
  readonly snapshots: AdobeSignUserCacheSnapshotsPayload;
}

export interface IAdobeSignUserCacheRepository {
  findByAdobeActorKey(adobeActorKey: string): Promise<AdobeSignUserCacheReadOutcome>;
  upsert(input: AdobeSignUserCacheUpsertInput): Promise<{ readonly listItemId: number }>;
  softDeactivateByAdobeActorKey(adobeActorKey: string): Promise<{ readonly deactivated: boolean }>;
}

export interface IGraphAdobeSignUserCacheRepositoryDeps {
  readonly graph: GraphListClient;
  readonly listTitle?: string;
}

function isBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function isInChoiceTuple<T extends readonly string[]>(
  value: unknown,
  tuple: T,
): value is T[number] {
  return typeof value === 'string' && (tuple as readonly string[]).includes(value);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}

function parseSnapshotsOrFailure(
  fields: Record<string, unknown>,
):
  | { readonly ok: true; readonly snapshots: AdobeSignUserCacheSnapshotsPayload }
  | { readonly ok: false; readonly column: keyof AdobeSignUserCacheSnapshotsPayload; readonly reason: CachedSnapshotParseFailureReason } {
  const columns: Array<{
    readonly raw: keyof AdobeSignUserCacheSnapshotsPayload;
    readonly column: string;
  }> = [
    { raw: 'actionQueuePreview', column: 'ActionQueuePreviewJson' },
    { raw: 'actionQueueSummary', column: 'ActionQueueSummaryJson' },
    { raw: 'actionQueueWarnings', column: 'ActionQueueWarningsJson' },
    { raw: 'recentCompletionsPreview', column: 'RecentCompletionsPreviewJson' },
    { raw: 'recentCompletionsSummary', column: 'RecentCompletionsSummaryJson' },
    { raw: 'recentCompletionsWarnings', column: 'RecentCompletionsWarningsJson' },
  ];
  const parsed: Partial<AdobeSignUserCacheSnapshotsPayload> = {};
  for (const { raw, column } of columns) {
    const value = typeof fields[column] === 'string' ? (fields[column] as string) : '';
    const result = parseCachedJsonSnapshot<unknown>(
      value,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    );
    if (!result.ok) {
      return { ok: false, column: raw, reason: result.reason };
    }
    (parsed as Record<string, unknown>)[raw] = result.payload;
  }
  return { ok: true, snapshots: parsed as AdobeSignUserCacheSnapshotsPayload };
}

function mapToRow(entry: {
  id: string;
  fields: Record<string, unknown>;
}): AdobeSignUserCacheReadOutcome {
  const fields = entry.fields;
  const adobeActorKey = stringOrUndefined(fields.AdobeActorKey);
  if (!adobeActorKey) {
    return { outcome: 'malformed', column: 'envelope', reason: 'envelope-shape-invalid' };
  }
  const snapshots = parseSnapshotsOrFailure(fields);
  if (!snapshots.ok) {
    return { outcome: 'malformed', column: snapshots.column, reason: snapshots.reason };
  }
  const cacheHydrationState = isInChoiceTuple(
    fields.CacheHydrationState,
    ADOBE_SIGN_CACHE_HYDRATION_STATES,
  )
    ? fields.CacheHydrationState
    : 'NotStarted';
  const cachedSourceStatus =
    typeof fields.CachedSourceStatus === 'string'
      ? (fields.CachedSourceStatus as MyWorkReadModelSourceStatus)
      : 'backend-unavailable';
  const freshnessState = isInChoiceTuple(fields.FreshnessState, ADOBE_SIGN_CACHE_FRESHNESS_STATES)
    ? fields.FreshnessState
    : 'Unknown';
  const lastSyncOutcome = isInChoiceTuple(fields.LastSyncOutcome, ADOBE_SIGN_CACHE_SYNC_OUTCOMES)
    ? fields.LastSyncOutcome
    : undefined;
  const row: AdobeSignUserCacheRow = {
    listItemId: Number(entry.id),
    adobeActorKey,
    userPrincipalName: stringOrUndefined(fields.UserPrincipalName),
    userPrincipalNameNormalized: stringOrUndefined(fields.UserPrincipalNameNormalized),
    isActive: isBoolean(fields.IsActive),
    cacheHydrationState,
    cachedSourceStatus,
    freshnessState,
    pendingActionCount: numberOrZero(fields.PendingActionCount),
    recentCompletionCount: numberOrZero(fields.RecentCompletionCount),
    lastSuccessfulAdobeRefreshUtc: stringOrUndefined(fields.LastSuccessfulAdobeRefreshUtc),
    lastWebhookRefreshUtc: stringOrUndefined(fields.LastWebhookRefreshUtc),
    lastManualRefreshUtc: stringOrUndefined(fields.LastManualRefreshUtc),
    lastReconciliationRefreshUtc: stringOrUndefined(fields.LastReconciliationRefreshUtc),
    nextReconciliationDueUtc: stringOrUndefined(fields.NextReconciliationDueUtc),
    lastSyncOutcome,
    lastSyncFailureCode: stringOrUndefined(fields.LastSyncFailureCode),
    lastSyncFailureSummary: stringOrUndefined(fields.LastSyncFailureSummary),
    cacheSchemaVersion: numberOrZero(fields.CacheSchemaVersion),
    projectionRevision: numberOrZero(fields.ProjectionRevision),
    snapshots: snapshots.snapshots,
  };
  return { outcome: 'found', row };
}

function buildFieldsForWrite(input: AdobeSignUserCacheUpsertInput): Record<string, unknown> {
  return {
    AdobeActorKey: input.adobeActorKey,
    UserPrincipalName: input.userPrincipalName ?? '',
    UserPrincipalNameNormalized: input.userPrincipalNameNormalized ?? '',
    IsActive: input.isActive,
    CacheHydrationState: input.cacheHydrationState,
    CachedSourceStatus: input.cachedSourceStatus,
    FreshnessState: input.freshnessState,
    ActionQueuePreviewJson: stringifyCachedJsonSnapshot(
      input.snapshots.actionQueuePreview,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    ActionQueueSummaryJson: stringifyCachedJsonSnapshot(
      input.snapshots.actionQueueSummary,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    ActionQueueWarningsJson: stringifyCachedJsonSnapshot(
      input.snapshots.actionQueueWarnings,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsPreviewJson: stringifyCachedJsonSnapshot(
      input.snapshots.recentCompletionsPreview,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsSummaryJson: stringifyCachedJsonSnapshot(
      input.snapshots.recentCompletionsSummary,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsWarningsJson: stringifyCachedJsonSnapshot(
      input.snapshots.recentCompletionsWarnings,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    PendingActionCount: input.pendingActionCount,
    RecentCompletionCount: input.recentCompletionCount,
    LastSuccessfulAdobeRefreshUtc: input.lastSuccessfulAdobeRefreshUtc ?? '',
    LastWebhookRefreshUtc: input.lastWebhookRefreshUtc ?? '',
    LastManualRefreshUtc: input.lastManualRefreshUtc ?? '',
    LastReconciliationRefreshUtc: input.lastReconciliationRefreshUtc ?? '',
    NextReconciliationDueUtc: input.nextReconciliationDueUtc ?? '',
    LastSyncOutcome: input.lastSyncOutcome ?? '',
    LastSyncFailureCode: input.lastSyncFailureCode ?? '',
    LastSyncFailureSummary: input.lastSyncFailureSummary ?? '',
    CacheSchemaVersion: input.cacheSchemaVersion,
    ProjectionRevision: input.projectionRevision,
  };
}

export function createGraphAdobeSignUserCacheRepository(
  deps: IGraphAdobeSignUserCacheRepositoryDeps,
): IAdobeSignUserCacheRepository {
  const listTitle = deps.listTitle ?? MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE;
  const graph = deps.graph;

  return {
    async findByAdobeActorKey(adobeActorKey: string): Promise<AdobeSignUserCacheReadOutcome> {
      if (adobeActorKey.length === 0) return { outcome: 'missing' };
      const escaped = escapeFilterValue(adobeActorKey);
      const rows = await graph.listItems(listTitle, {
        filter: `fields/AdobeActorKey eq '${escaped}'`,
        select: [...READ_SELECT_FIELDS],
        top: 1,
      });
      if (rows.length === 0) return { outcome: 'missing' };
      return mapToRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async upsert(input: AdobeSignUserCacheUpsertInput): Promise<{ readonly listItemId: number }> {
      const escaped = escapeFilterValue(input.adobeActorKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/AdobeActorKey eq '${escaped}'`,
        select: ['AdobeActorKey'],
        top: 1,
      });
      const fields = buildFieldsForWrite(input);
      if (existing.length === 0) {
        const created = await graph.addItem(listTitle, fields);
        return { listItemId: Number(created.id) };
      }
      const itemId = Number(existing[0].id);
      await graph.updateItem(listTitle, itemId, fields);
      return { listItemId: itemId };
    },
    async softDeactivateByAdobeActorKey(
      adobeActorKey: string,
    ): Promise<{ readonly deactivated: boolean }> {
      const escaped = escapeFilterValue(adobeActorKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/AdobeActorKey eq '${escaped}'`,
        select: ['AdobeActorKey'],
        top: 1,
      });
      if (existing.length === 0) return { deactivated: false };
      await graph.updateItem(listTitle, Number(existing[0].id), { IsActive: false });
      return { deactivated: true };
    },
  };
}
