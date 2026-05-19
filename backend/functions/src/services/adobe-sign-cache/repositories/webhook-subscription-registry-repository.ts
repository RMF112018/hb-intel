/**
 * My Dashboard | Adobe Sign cache — webhook subscription registry repository
 * (B05.15 Prompt 04).
 *
 * Graph-backed CRUD for the `MyDashboardAdobeSignWebhookSubscriptions`
 * SharePoint list. Not used by the routine read path in this prompt;
 * Prompts 06-07 (ensure/verify) consume this directly.
 *
 * Contract locked here so future prompts don't churn the shape.
 *
 * @module services/adobe-sign-cache/repositories/webhook-subscription-registry-repository
 */

import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES,
  ADOBE_SIGN_WEBHOOK_REMOTE_STATES,
  ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES,
  ADOBE_SIGN_WEBHOOK_SCOPES,
  ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
  type AdobeSignWebhookLocalProcessingState,
  type AdobeSignWebhookRemoteState,
  type AdobeSignWebhookResourceFamily,
  type AdobeSignWebhookScope,
  type AdobeSignWebhookVerificationOutcome,
} from '../cache-list-descriptors.js';

const READ_SELECT_FIELDS = [
  'SubscriptionKey',
  'AdobeActorKey',
  'UserPrincipalNameNormalized',
  'AdobeWebhookId',
  'WebhookScope',
  'ResourceFamily',
  'WebhookUrl',
  'ConfiguredEventFilterJson',
  'PayloadOptionsJson',
  'RemoteState',
  'LocalProcessingState',
  'LastEnsureUtc',
  'LastVerifiedUtc',
  'NextVerificationDueUtc',
  'LastVerificationOutcome',
  'LastFailureCode',
  'LastFailureSummary',
  'IsManagedByHbIntel',
  'CacheSchemaVersion',
] as const;

export interface AdobeSignWebhookSubscriptionRow {
  readonly listItemId: number;
  readonly subscriptionKey: string;
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly adobeWebhookId?: string;
  readonly webhookScope: AdobeSignWebhookScope;
  readonly resourceFamily: AdobeSignWebhookResourceFamily;
  readonly webhookUrl: string;
  readonly configuredEventFilterJson?: string;
  readonly payloadOptionsJson?: string;
  readonly remoteState: AdobeSignWebhookRemoteState;
  readonly localProcessingState: AdobeSignWebhookLocalProcessingState;
  readonly lastEnsureUtc?: string;
  readonly lastVerifiedUtc?: string;
  readonly nextVerificationDueUtc?: string;
  readonly lastVerificationOutcome?: AdobeSignWebhookVerificationOutcome;
  readonly lastFailureCode?: string;
  readonly lastFailureSummary?: string;
  readonly isManagedByHbIntel: boolean;
  readonly cacheSchemaVersion: number;
}

export interface AdobeSignWebhookSubscriptionUpsertInput {
  readonly subscriptionKey: string;
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly adobeWebhookId?: string;
  readonly webhookScope: AdobeSignWebhookScope;
  readonly resourceFamily: AdobeSignWebhookResourceFamily;
  readonly webhookUrl: string;
  readonly configuredEventFilterJson?: string;
  readonly payloadOptionsJson?: string;
  readonly remoteState: AdobeSignWebhookRemoteState;
  readonly localProcessingState: AdobeSignWebhookLocalProcessingState;
  readonly lastEnsureUtc?: string;
  readonly lastVerifiedUtc?: string;
  readonly nextVerificationDueUtc?: string;
  readonly lastVerificationOutcome?: AdobeSignWebhookVerificationOutcome;
  readonly lastFailureCode?: string;
  readonly lastFailureSummary?: string;
  readonly isManagedByHbIntel: boolean;
  readonly cacheSchemaVersion: number;
}

export interface IAdobeSignWebhookSubscriptionRegistryRepository {
  findByAdobeActorKey(adobeActorKey: string): Promise<AdobeSignWebhookSubscriptionRow | null>;
  findBySubscriptionKey(subscriptionKey: string): Promise<AdobeSignWebhookSubscriptionRow | null>;
  upsert(
    input: AdobeSignWebhookSubscriptionUpsertInput,
  ): Promise<{ readonly listItemId: number }>;
  softDeactivate(
    subscriptionKey: string,
    localProcessingState: AdobeSignWebhookLocalProcessingState,
  ): Promise<{ readonly deactivated: boolean }>;
}

export interface IGraphAdobeSignWebhookSubscriptionRegistryRepositoryDeps {
  readonly graph: GraphListClient;
  readonly listTitle?: string;
}

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
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

function numberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function mapToRow(entry: {
  id: string;
  fields: Record<string, unknown>;
}): AdobeSignWebhookSubscriptionRow | null {
  const fields = entry.fields;
  const subscriptionKey = stringOrUndefined(fields.SubscriptionKey);
  if (!subscriptionKey) return null;
  const adobeActorKey = stringOrUndefined(fields.AdobeActorKey) ?? '';
  const webhookScope = isInChoiceTuple(fields.WebhookScope, ADOBE_SIGN_WEBHOOK_SCOPES)
    ? fields.WebhookScope
    : 'USER';
  const resourceFamily = isInChoiceTuple(
    fields.ResourceFamily,
    ADOBE_SIGN_WEBHOOK_RESOURCE_FAMILIES,
  )
    ? fields.ResourceFamily
    : 'AGREEMENT';
  const remoteState = isInChoiceTuple(fields.RemoteState, ADOBE_SIGN_WEBHOOK_REMOTE_STATES)
    ? fields.RemoteState
    : 'Unknown';
  const localProcessingState = isInChoiceTuple(
    fields.LocalProcessingState,
    ADOBE_SIGN_WEBHOOK_LOCAL_PROCESSING_STATES,
  )
    ? fields.LocalProcessingState
    : 'Active';
  const lastVerificationOutcome = isInChoiceTuple(
    fields.LastVerificationOutcome,
    ADOBE_SIGN_WEBHOOK_VERIFICATION_OUTCOMES,
  )
    ? fields.LastVerificationOutcome
    : undefined;
  return {
    listItemId: Number(entry.id),
    subscriptionKey,
    adobeActorKey,
    userPrincipalNameNormalized: stringOrUndefined(fields.UserPrincipalNameNormalized),
    adobeWebhookId: stringOrUndefined(fields.AdobeWebhookId),
    webhookScope,
    resourceFamily,
    webhookUrl: stringOrUndefined(fields.WebhookUrl) ?? '',
    configuredEventFilterJson: stringOrUndefined(fields.ConfiguredEventFilterJson),
    payloadOptionsJson: stringOrUndefined(fields.PayloadOptionsJson),
    remoteState,
    localProcessingState,
    lastEnsureUtc: stringOrUndefined(fields.LastEnsureUtc),
    lastVerifiedUtc: stringOrUndefined(fields.LastVerifiedUtc),
    nextVerificationDueUtc: stringOrUndefined(fields.NextVerificationDueUtc),
    lastVerificationOutcome,
    lastFailureCode: stringOrUndefined(fields.LastFailureCode),
    lastFailureSummary: stringOrUndefined(fields.LastFailureSummary),
    isManagedByHbIntel: isBoolean(fields.IsManagedByHbIntel),
    cacheSchemaVersion: numberOrZero(fields.CacheSchemaVersion),
  };
}

function buildFieldsForWrite(
  input: AdobeSignWebhookSubscriptionUpsertInput,
): Record<string, unknown> {
  return {
    SubscriptionKey: input.subscriptionKey,
    AdobeActorKey: input.adobeActorKey,
    UserPrincipalNameNormalized: input.userPrincipalNameNormalized ?? '',
    AdobeWebhookId: input.adobeWebhookId ?? '',
    WebhookScope: input.webhookScope,
    ResourceFamily: input.resourceFamily,
    WebhookUrl: input.webhookUrl,
    ConfiguredEventFilterJson: input.configuredEventFilterJson ?? '',
    PayloadOptionsJson: input.payloadOptionsJson ?? '',
    RemoteState: input.remoteState,
    LocalProcessingState: input.localProcessingState,
    LastEnsureUtc: input.lastEnsureUtc ?? '',
    LastVerifiedUtc: input.lastVerifiedUtc ?? '',
    NextVerificationDueUtc: input.nextVerificationDueUtc ?? '',
    LastVerificationOutcome: input.lastVerificationOutcome ?? '',
    LastFailureCode: input.lastFailureCode ?? '',
    LastFailureSummary: input.lastFailureSummary ?? '',
    IsManagedByHbIntel: input.isManagedByHbIntel,
    CacheSchemaVersion: input.cacheSchemaVersion,
  };
}

export function createGraphAdobeSignWebhookSubscriptionRegistryRepository(
  deps: IGraphAdobeSignWebhookSubscriptionRegistryRepositoryDeps,
): IAdobeSignWebhookSubscriptionRegistryRepository {
  const listTitle =
    deps.listTitle ?? MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE;
  const graph = deps.graph;

  return {
    async findByAdobeActorKey(
      adobeActorKey: string,
    ): Promise<AdobeSignWebhookSubscriptionRow | null> {
      const escaped = escapeFilterValue(adobeActorKey);
      const rows = await graph.listItems(listTitle, {
        filter: `fields/AdobeActorKey eq '${escaped}'`,
        select: [...READ_SELECT_FIELDS],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapToRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async findBySubscriptionKey(
      subscriptionKey: string,
    ): Promise<AdobeSignWebhookSubscriptionRow | null> {
      const escaped = escapeFilterValue(subscriptionKey);
      const rows = await graph.listItems(listTitle, {
        filter: `fields/SubscriptionKey eq '${escaped}'`,
        select: [...READ_SELECT_FIELDS],
        top: 1,
      });
      if (rows.length === 0) return null;
      return mapToRow({ id: String(rows[0].id), fields: rows[0].fields });
    },
    async upsert(
      input: AdobeSignWebhookSubscriptionUpsertInput,
    ): Promise<{ readonly listItemId: number }> {
      const escaped = escapeFilterValue(input.subscriptionKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/SubscriptionKey eq '${escaped}'`,
        select: ['SubscriptionKey'],
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
      subscriptionKey: string,
      localProcessingState: AdobeSignWebhookLocalProcessingState,
    ): Promise<{ readonly deactivated: boolean }> {
      const escaped = escapeFilterValue(subscriptionKey);
      const existing = await graph.listItems(listTitle, {
        filter: `fields/SubscriptionKey eq '${escaped}'`,
        select: ['SubscriptionKey'],
        top: 1,
      });
      if (existing.length === 0) return { deactivated: false };
      await graph.updateItem(listTitle, Number(existing[0].id), {
        LocalProcessingState: localProcessingState,
      });
      return { deactivated: true };
    },
  };
}
