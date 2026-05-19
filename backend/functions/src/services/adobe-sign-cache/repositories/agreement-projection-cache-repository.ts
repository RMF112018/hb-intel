/**
 * My Dashboard | Adobe Sign cache — agreement projection cache repository
 * (B05.15 Prompt 04).
 *
 * Graph-backed CRUD for the `MyDashboardAdobeSignAgreementProjectionCache`
 * SharePoint list. Read path (used by
 * `MyWorkAdobeSignCacheReadModelProvider.getAdobeSignActionQueue` and
 * `getAdobeSignRecentCompletions`) lists rows by `(AdobeActorKey,
 * ProjectionBucket, IsActiveProjection=true)` with deterministic ordering.
 *
 * Cursor encoding for pagination: opaque base64 of
 * `{ lastSortDateUtc, lastListItemId }`. Callers treat the cursor as
 * opaque.
 *
 * @module services/adobe-sign-cache/repositories/agreement-projection-cache-repository
 */

import type { MyWorkAdobeSignActionQueueItem } from '@hbc/models/myWork';

import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_CACHE_ACTION_HANDOFF_POSTURES,
  ADOBE_SIGN_CACHE_FRESHNESS_STATES,
  ADOBE_SIGN_CACHE_PROJECTION_BUCKETS,
  ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
  type AdobeSignCacheActionHandoffPosture,
  type AdobeSignCacheFreshnessState,
  type AdobeSignCacheProjectionBucket,
  type AdobeSignCacheSyncOutcome,
} from '../cache-list-descriptors.js';
import {
  ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
  parseCachedJsonSnapshot,
  stringifyCachedJsonSnapshot,
  type CachedSnapshotParseFailureReason,
} from './cache-snapshot-codec.js';

const READ_SELECT_FIELDS = [
  'ProjectionKey',
  'AdobeActorKey',
  'UserPrincipalNameNormalized',
  'AgreementId',
  'RecipientActionKey',
  'ProjectionBucket',
  'AgreementName',
  'AgreementStatus',
  'RequiredAction',
  'AdobeRecipientStatus',
  'ActionHandoffPosture',
  'ActionHandoffReason',
  'SourceOpenUrl',
  'SenderDisplayName',
  'SenderEmail',
  'CreatedAtAdobeUtc',
  'ModifiedAtAdobeUtc',
  'ExpirationAtAdobeUtc',
  'CompletedAtAdobeUtc',
  'SortDateUtc',
  'SortPriority',
  'IsActiveProjection',
  'FreshnessState',
  'LastSuccessfulAdobeRefreshUtc',
  'LastWebhookEventUtc',
  'LastManualRefreshUtc',
  'LastReconciliationRefreshUtc',
  'LastSyncOutcome',
  'LastSyncFailureCode',
  'LastSyncFailureSummary',
  'PreviewItemJson',
  'AgreementSnapshotJson',
  'ParticipantsSnapshotJson',
  'DocumentsSnapshotJson',
  'WriteCapabilitySnapshotJson',
  'ProviderPayloadSchemaVersion',
  'CacheSchemaVersion',
] as const;

export interface AdobeSignAgreementProjectionRow {
  readonly listItemId: number;
  readonly projectionKey: string;
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly agreementId: string;
  readonly recipientActionKey: string;
  readonly projectionBucket: AdobeSignCacheProjectionBucket;
  readonly agreementName: string;
  readonly agreementStatus?: string;
  readonly requiredAction?: string;
  readonly adobeRecipientStatus?: string;
  readonly actionHandoffPosture?: AdobeSignCacheActionHandoffPosture;
  readonly actionHandoffReason?: string;
  readonly sourceOpenUrl?: string;
  readonly senderDisplayName?: string;
  readonly senderEmail?: string;
  readonly createdAtAdobeUtc?: string;
  readonly modifiedAtAdobeUtc?: string;
  readonly expirationAtAdobeUtc?: string;
  readonly completedAtAdobeUtc?: string;
  readonly sortDateUtc?: string;
  readonly sortPriority?: number;
  readonly isActiveProjection: boolean;
  readonly freshnessState?: AdobeSignCacheFreshnessState;
  readonly lastSuccessfulAdobeRefreshUtc?: string;
  readonly lastWebhookEventUtc?: string;
  readonly lastManualRefreshUtc?: string;
  readonly lastReconciliationRefreshUtc?: string;
  readonly lastSyncOutcome?: AdobeSignCacheSyncOutcome;
  readonly lastSyncFailureCode?: string;
  readonly lastSyncFailureSummary?: string;
  /** Pre-built UI row, opaque to the repository; provider returns it as-is. */
  readonly previewItem: MyWorkAdobeSignActionQueueItem | null;
  readonly previewItemMalformedReason?: CachedSnapshotParseFailureReason;
  readonly providerPayloadSchemaVersion?: number;
  readonly cacheSchemaVersion: number;
}

export interface AdobeSignAgreementProjectionListPage {
  readonly rows: readonly AdobeSignAgreementProjectionRow[];
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}

export interface AdobeSignAgreementProjectionListInput {
  readonly adobeActorKey: string;
  readonly projectionBucket: AdobeSignCacheProjectionBucket;
  readonly pageSize: number;
  readonly cursor?: string;
}

export interface AdobeSignAgreementProjectionUpsertInput {
  readonly projectionKey: string;
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly agreementId: string;
  readonly recipientActionKey: string;
  readonly projectionBucket: AdobeSignCacheProjectionBucket;
  readonly agreementName: string;
  readonly agreementStatus?: string;
  readonly requiredAction?: string;
  readonly adobeRecipientStatus?: string;
  readonly actionHandoffPosture?: AdobeSignCacheActionHandoffPosture;
  readonly actionHandoffReason?: string;
  readonly sourceOpenUrl?: string;
  readonly senderDisplayName?: string;
  readonly senderEmail?: string;
  readonly createdAtAdobeUtc?: string;
  readonly modifiedAtAdobeUtc?: string;
  readonly expirationAtAdobeUtc?: string;
  readonly completedAtAdobeUtc?: string;
  readonly sortDateUtc?: string;
  readonly sortPriority?: number;
  readonly isActiveProjection: boolean;
  readonly freshnessState?: AdobeSignCacheFreshnessState;
  readonly lastSuccessfulAdobeRefreshUtc?: string;
  readonly lastWebhookEventUtc?: string;
  readonly lastManualRefreshUtc?: string;
  readonly lastReconciliationRefreshUtc?: string;
  readonly lastSyncOutcome?: AdobeSignCacheSyncOutcome;
  readonly lastSyncFailureCode?: string;
  readonly lastSyncFailureSummary?: string;
  readonly previewItem: MyWorkAdobeSignActionQueueItem;
  readonly providerPayloadSchemaVersion?: number;
  readonly cacheSchemaVersion: number;
}

export interface IAdobeSignAgreementProjectionCacheRepository {
  listActiveByActorAndBucket(
    input: AdobeSignAgreementProjectionListInput,
  ): Promise<AdobeSignAgreementProjectionListPage>;
  findByProjectionKey(projectionKey: string): Promise<AdobeSignAgreementProjectionRow | null>;
  upsert(input: AdobeSignAgreementProjectionUpsertInput): Promise<{ readonly listItemId: number }>;
  softDeactivate(
    projectionKey: string,
    asOfUtc: string,
  ): Promise<{ readonly deactivated: boolean }>;
}

export interface IGraphAdobeSignAgreementProjectionCacheRepositoryDeps {
  readonly graph: GraphListClient;
  readonly listTitle?: string;
}

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isInChoiceTuple<T extends readonly string[]>(
  value: unknown,
  tuple: T,
): value is T[number] {
  return typeof value === 'string' && (tuple as readonly string[]).includes(value);
}

function isBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

interface CursorPayload {
  readonly lastSortDateUtc: string;
  readonly lastListItemId: number;
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

function decodeCursor(cursor: string | undefined): CursorPayload | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) as CursorPayload;
    if (typeof parsed.lastSortDateUtc !== 'string') return null;
    if (typeof parsed.lastListItemId !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function mapToRow(entry: { id: string; fields: Record<string, unknown> }): AdobeSignAgreementProjectionRow | null {
  const fields = entry.fields;
  const projectionKey = stringOrUndefined(fields.ProjectionKey);
  if (!projectionKey) return null;
  const adobeActorKey = stringOrUndefined(fields.AdobeActorKey) ?? '';
  const agreementId = stringOrUndefined(fields.AgreementId) ?? '';
  const recipientActionKey = stringOrUndefined(fields.RecipientActionKey) ?? '__DEFAULT__';
  const projectionBucket = isInChoiceTuple(
    fields.ProjectionBucket,
    ADOBE_SIGN_CACHE_PROJECTION_BUCKETS,
  )
    ? fields.ProjectionBucket
    : 'Inactive';
  const agreementName = stringOrUndefined(fields.AgreementName) ?? '';
  const actionHandoffPosture = isInChoiceTuple(
    fields.ActionHandoffPosture,
    ADOBE_SIGN_CACHE_ACTION_HANDOFF_POSTURES,
  )
    ? fields.ActionHandoffPosture
    : undefined;
  const freshnessState = isInChoiceTuple(
    fields.FreshnessState,
    ADOBE_SIGN_CACHE_FRESHNESS_STATES,
  )
    ? fields.FreshnessState
    : undefined;
  const lastSyncOutcome = isInChoiceTuple(fields.LastSyncOutcome, ADOBE_SIGN_CACHE_SYNC_OUTCOMES)
    ? fields.LastSyncOutcome
    : undefined;

  const previewParse = parseCachedJsonSnapshot<MyWorkAdobeSignActionQueueItem>(
    typeof fields.PreviewItemJson === 'string' ? fields.PreviewItemJson : '',
    ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
  );
  const previewItem = previewParse.ok ? previewParse.payload : null;
  const previewItemMalformedReason = previewParse.ok ? undefined : previewParse.reason;

  return {
    listItemId: Number(entry.id),
    projectionKey,
    adobeActorKey,
    userPrincipalNameNormalized: stringOrUndefined(fields.UserPrincipalNameNormalized),
    agreementId,
    recipientActionKey,
    projectionBucket,
    agreementName,
    agreementStatus: stringOrUndefined(fields.AgreementStatus),
    requiredAction: stringOrUndefined(fields.RequiredAction),
    adobeRecipientStatus: stringOrUndefined(fields.AdobeRecipientStatus),
    actionHandoffPosture,
    actionHandoffReason: stringOrUndefined(fields.ActionHandoffReason),
    sourceOpenUrl: stringOrUndefined(fields.SourceOpenUrl),
    senderDisplayName: stringOrUndefined(fields.SenderDisplayName),
    senderEmail: stringOrUndefined(fields.SenderEmail),
    createdAtAdobeUtc: stringOrUndefined(fields.CreatedAtAdobeUtc),
    modifiedAtAdobeUtc: stringOrUndefined(fields.ModifiedAtAdobeUtc),
    expirationAtAdobeUtc: stringOrUndefined(fields.ExpirationAtAdobeUtc),
    completedAtAdobeUtc: stringOrUndefined(fields.CompletedAtAdobeUtc),
    sortDateUtc: stringOrUndefined(fields.SortDateUtc),
    sortPriority: numberOrUndefined(fields.SortPriority),
    isActiveProjection: isBoolean(fields.IsActiveProjection),
    freshnessState,
    lastSuccessfulAdobeRefreshUtc: stringOrUndefined(fields.LastSuccessfulAdobeRefreshUtc),
    lastWebhookEventUtc: stringOrUndefined(fields.LastWebhookEventUtc),
    lastManualRefreshUtc: stringOrUndefined(fields.LastManualRefreshUtc),
    lastReconciliationRefreshUtc: stringOrUndefined(fields.LastReconciliationRefreshUtc),
    lastSyncOutcome,
    lastSyncFailureCode: stringOrUndefined(fields.LastSyncFailureCode),
    lastSyncFailureSummary: stringOrUndefined(fields.LastSyncFailureSummary),
    previewItem,
    previewItemMalformedReason,
    providerPayloadSchemaVersion: numberOrUndefined(fields.ProviderPayloadSchemaVersion),
    cacheSchemaVersion:
      numberOrUndefined(fields.CacheSchemaVersion) ??
      ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
  };
}

function buildFieldsForWrite(
  input: AdobeSignAgreementProjectionUpsertInput,
): Record<string, unknown> {
  return {
    ProjectionKey: input.projectionKey,
    AdobeActorKey: input.adobeActorKey,
    UserPrincipalNameNormalized: input.userPrincipalNameNormalized ?? '',
    AgreementId: input.agreementId,
    RecipientActionKey: input.recipientActionKey,
    ProjectionBucket: input.projectionBucket,
    AgreementName: input.agreementName,
    AgreementStatus: input.agreementStatus ?? '',
    RequiredAction: input.requiredAction ?? '',
    AdobeRecipientStatus: input.adobeRecipientStatus ?? '',
    ActionHandoffPosture: input.actionHandoffPosture ?? '',
    ActionHandoffReason: input.actionHandoffReason ?? '',
    SourceOpenUrl: input.sourceOpenUrl ?? '',
    SenderDisplayName: input.senderDisplayName ?? '',
    SenderEmail: input.senderEmail ?? '',
    CreatedAtAdobeUtc: input.createdAtAdobeUtc ?? '',
    ModifiedAtAdobeUtc: input.modifiedAtAdobeUtc ?? '',
    ExpirationAtAdobeUtc: input.expirationAtAdobeUtc ?? '',
    CompletedAtAdobeUtc: input.completedAtAdobeUtc ?? '',
    SortDateUtc: input.sortDateUtc ?? '',
    SortPriority: input.sortPriority ?? 0,
    IsActiveProjection: input.isActiveProjection,
    FreshnessState: input.freshnessState ?? 'Unknown',
    LastSuccessfulAdobeRefreshUtc: input.lastSuccessfulAdobeRefreshUtc ?? '',
    LastWebhookEventUtc: input.lastWebhookEventUtc ?? '',
    LastManualRefreshUtc: input.lastManualRefreshUtc ?? '',
    LastReconciliationRefreshUtc: input.lastReconciliationRefreshUtc ?? '',
    LastSyncOutcome: input.lastSyncOutcome ?? '',
    LastSyncFailureCode: input.lastSyncFailureCode ?? '',
    LastSyncFailureSummary: input.lastSyncFailureSummary ?? '',
    PreviewItemJson: stringifyCachedJsonSnapshot(
      input.previewItem,
      ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
    ),
    ProviderPayloadSchemaVersion: input.providerPayloadSchemaVersion ?? 0,
    CacheSchemaVersion: input.cacheSchemaVersion,
  };
}

export function createGraphAdobeSignAgreementProjectionCacheRepository(
  deps: IGraphAdobeSignAgreementProjectionCacheRepositoryDeps,
): IAdobeSignAgreementProjectionCacheRepository {
  const listTitle =
    deps.listTitle ?? MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE;
  const graph = deps.graph;

  return {
    async listActiveByActorAndBucket(
      input: AdobeSignAgreementProjectionListInput,
    ): Promise<AdobeSignAgreementProjectionListPage> {
      if (!Number.isInteger(input.pageSize) || input.pageSize <= 0) {
        throw new RangeError(
          `listActiveByActorAndBucket: pageSize must be a positive integer (got ${input.pageSize}).`,
        );
      }
      const cursor = decodeCursor(input.cursor);
      const escapedActor = escapeFilterValue(input.adobeActorKey);
      const escapedBucket = escapeFilterValue(input.projectionBucket);
      const baseFilter = `fields/AdobeActorKey eq '${escapedActor}' and fields/ProjectionBucket eq '${escapedBucket}' and fields/IsActiveProjection eq true`;
      const filter = cursor
        ? `${baseFilter} and fields/SortDateUtc lt '${escapeFilterValue(cursor.lastSortDateUtc)}'`
        : baseFilter;
      // Fetch one extra to determine `hasMore`.
      const fetchSize = input.pageSize + 1;
      const fetched = await graph.listItems(listTitle, {
        filter,
        select: [...READ_SELECT_FIELDS],
        orderby: 'fields/SortDateUtc desc',
        top: fetchSize,
      });
      const trimmed = fetched.slice(0, input.pageSize);
      const hasMore = fetched.length > input.pageSize;
      const rows: AdobeSignAgreementProjectionRow[] = [];
      for (const entry of trimmed) {
        const mapped = mapToRow({ id: String(entry.id), fields: entry.fields });
        if (mapped) rows.push(mapped);
      }
      let nextCursor: string | undefined;
      if (hasMore && rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        if (lastRow.sortDateUtc) {
          nextCursor = encodeCursor({
            lastSortDateUtc: lastRow.sortDateUtc,
            lastListItemId: lastRow.listItemId,
          });
        }
      }
      return { rows, hasMore, nextCursor };
    },
    async findByProjectionKey(
      projectionKey: string,
    ): Promise<AdobeSignAgreementProjectionRow | null> {
      const escaped = escapeFilterValue(projectionKey);
      const rows = await graph.listItems(listTitle, {
        filter: `fields/ProjectionKey eq '${escaped}'`,
        select: [...READ_SELECT_FIELDS],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapToRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async upsert(
      input: AdobeSignAgreementProjectionUpsertInput,
    ): Promise<{ readonly listItemId: number }> {
      const escaped = escapeFilterValue(input.projectionKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/ProjectionKey eq '${escaped}'`,
        select: ['ProjectionKey'],
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
    async softDeactivate(
      projectionKey: string,
      asOfUtc: string,
    ): Promise<{ readonly deactivated: boolean }> {
      const escaped = escapeFilterValue(projectionKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/ProjectionKey eq '${escaped}'`,
        select: ['ProjectionKey'],
        top: 1,
      });
      if (existing.length === 0) return { deactivated: false };
      await graph.updateItem(listTitle, Number(existing[0].id), {
        IsActiveProjection: false,
        ProjectionBucket: 'Inactive',
        LastReconciliationRefreshUtc: asOfUtc,
      });
      return { deactivated: true };
    },
  };
}
