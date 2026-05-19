/**
 * My Dashboard | Adobe Sign cache — queue work-item contract (B05.15 Prompt 03).
 *
 * Internal-backend payload shape for the `adobe-sign-cache-work-items`
 * Azure Storage Queue. Matches `01_Final_Target_Architecture.md` §5.4
 * byte-for-byte. Never exposed to SPFx surfaces (the public, SPFx-visible
 * accepted-response shape lives in `packages/models/src/myWork/AdobeSignCacheControl.ts`
 * — Prompt 01).
 *
 * Validation enforces:
 *   - workItemType is in the closed seven-member tuple.
 *   - refreshScope is in the closed `ADOBE_SIGN_CACHE_REFRESH_SCOPES` tuple
 *     (source-of-truth in `cache-list-descriptors.ts`).
 *   - requestedBy (when present) is in the closed five-member tuple.
 *   - Required fields are non-empty strings.
 *   - `requestedAtUtc` (and `providerEventOccurredAtUtc` when present) parse
 *     as an ISO-8601 timestamp.
 *   - NO prohibited-field keys (`accessToken`, `refreshToken`, `authorizationCode`,
 *     `clientSecret`, `rawWebhookPayload`, `signingUrl`, `actionUrl`) are
 *     present on the parsed object — guards against accidental
 *     token/URL leakage into the queue payload.
 *
 * @module services/adobe-sign-cache/queue-work-item-contract
 */

import {
  ADOBE_SIGN_CACHE_REFRESH_SCOPES,
  type AdobeSignCacheRefreshScope,
} from './cache-list-descriptors.js';

export const ADOBE_SIGN_CACHE_WORK_ITEM_TYPES = [
  'InitialHydration',
  'EnsureUserWebhook',
  'VerifyUserWebhook',
  'WebhookAgreementRefresh',
  'ManualUserRefresh',
  'ReconciliationUserRefresh',
] as const;

export type AdobeSignCacheWorkItemType = (typeof ADOBE_SIGN_CACHE_WORK_ITEM_TYPES)[number];

export const ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS = [
  'oauth-callback',
  'webhook',
  'user',
  'timer',
  'repair-endpoint',
] as const;

export type AdobeSignCacheRequestedBy = (typeof ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS)[number];

/**
 * Prohibited field names. The validator rejects payloads carrying any of
 * these keys regardless of value, protecting the queue from accidental
 * token / signing-URL / action-URL leakage.
 */
export const ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS = [
  'accessToken',
  'refreshToken',
  'authorizationCode',
  'clientSecret',
  'rawWebhookPayload',
  'signingUrl',
  'actionUrl',
] as const;

export type AdobeSignCacheWorkItemProhibitedField =
  (typeof ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS)[number];

/**
 * Canonical queue payload. Mirrors `01_Final_Target_Architecture.md` §5.4.
 */
export interface AdobeSignCacheWorkItem {
  readonly workItemId: string;
  readonly workItemType: AdobeSignCacheWorkItemType;
  readonly correlationId: string;
  readonly requestedAtUtc: string;
  readonly adobeActorKey: string;
  readonly userPrincipalNameNormalized?: string;
  readonly subscriptionKey?: string;
  readonly adobeWebhookId?: string;
  readonly providerEventId?: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly providerEventOccurredAtUtc?: string;
  readonly bodyHashSha256?: string;
  readonly requestedBy?: AdobeSignCacheRequestedBy;
  readonly refreshScope: AdobeSignCacheRefreshScope;
}

export type AdobeSignCacheWorkItemValidationResult =
  | { readonly ok: true; readonly workItem: AdobeSignCacheWorkItem }
  | { readonly ok: false; readonly reason: string };

const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!ISO_8601_PATTERN.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isOptionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function isOptionalIsoTimestamp(value: unknown): value is string | undefined {
  return value === undefined || isIsoTimestamp(value);
}

/**
 * Validate an unknown value as a queue work item. On success returns the
 * narrowed payload; on failure returns a closed reason string.
 *
 * Rejects (in this order):
 *   1. non-object inputs
 *   2. payloads carrying any prohibited-field key (regardless of value)
 *   3. unknown workItemType / refreshScope / requestedBy
 *   4. missing or empty required fields
 *   5. non-ISO timestamps
 */
export function validateAdobeSignCacheWorkItem(
  value: unknown,
): AdobeSignCacheWorkItemValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ok: false, reason: 'not-an-object' };
  }
  const record = value as Record<string, unknown>;

  for (const prohibited of ADOBE_SIGN_CACHE_WORK_ITEM_PROHIBITED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(record, prohibited)) {
      return { ok: false, reason: `prohibited-field:${prohibited}` };
    }
  }

  if (
    !isNonEmptyString(record.workItemType) ||
    !(ADOBE_SIGN_CACHE_WORK_ITEM_TYPES as readonly string[]).includes(record.workItemType)
  ) {
    return { ok: false, reason: 'invalid-workItemType' };
  }
  if (
    !isNonEmptyString(record.refreshScope) ||
    !(ADOBE_SIGN_CACHE_REFRESH_SCOPES as readonly string[]).includes(record.refreshScope)
  ) {
    return { ok: false, reason: 'invalid-refreshScope' };
  }
  if (
    record.requestedBy !== undefined &&
    (!isNonEmptyString(record.requestedBy) ||
      !(ADOBE_SIGN_CACHE_REQUESTED_BY_REASONS as readonly string[]).includes(record.requestedBy))
  ) {
    return { ok: false, reason: 'invalid-requestedBy' };
  }

  if (!isNonEmptyString(record.workItemId)) return { ok: false, reason: 'missing-workItemId' };
  if (!isNonEmptyString(record.correlationId)) return { ok: false, reason: 'missing-correlationId' };
  if (!isNonEmptyString(record.adobeActorKey)) return { ok: false, reason: 'missing-adobeActorKey' };

  if (!isIsoTimestamp(record.requestedAtUtc)) {
    return { ok: false, reason: 'invalid-requestedAtUtc' };
  }
  if (!isOptionalIsoTimestamp(record.providerEventOccurredAtUtc)) {
    return { ok: false, reason: 'invalid-providerEventOccurredAtUtc' };
  }

  if (!isOptionalNonEmptyString(record.userPrincipalNameNormalized)) {
    return { ok: false, reason: 'invalid-userPrincipalNameNormalized' };
  }
  if (!isOptionalNonEmptyString(record.subscriptionKey)) {
    return { ok: false, reason: 'invalid-subscriptionKey' };
  }
  if (!isOptionalNonEmptyString(record.adobeWebhookId)) {
    return { ok: false, reason: 'invalid-adobeWebhookId' };
  }
  if (!isOptionalNonEmptyString(record.providerEventId)) {
    return { ok: false, reason: 'invalid-providerEventId' };
  }
  if (!isOptionalNonEmptyString(record.providerEventType)) {
    return { ok: false, reason: 'invalid-providerEventType' };
  }
  if (!isOptionalNonEmptyString(record.agreementId)) {
    return { ok: false, reason: 'invalid-agreementId' };
  }
  if (!isOptionalNonEmptyString(record.bodyHashSha256)) {
    return { ok: false, reason: 'invalid-bodyHashSha256' };
  }

  const workItem: AdobeSignCacheWorkItem = {
    workItemId: record.workItemId,
    workItemType: record.workItemType as AdobeSignCacheWorkItemType,
    correlationId: record.correlationId,
    requestedAtUtc: record.requestedAtUtc,
    adobeActorKey: record.adobeActorKey,
    refreshScope: record.refreshScope as AdobeSignCacheRefreshScope,
    ...(record.userPrincipalNameNormalized !== undefined && {
      userPrincipalNameNormalized: record.userPrincipalNameNormalized as string,
    }),
    ...(record.subscriptionKey !== undefined && {
      subscriptionKey: record.subscriptionKey as string,
    }),
    ...(record.adobeWebhookId !== undefined && {
      adobeWebhookId: record.adobeWebhookId as string,
    }),
    ...(record.providerEventId !== undefined && {
      providerEventId: record.providerEventId as string,
    }),
    ...(record.providerEventType !== undefined && {
      providerEventType: record.providerEventType as string,
    }),
    ...(record.agreementId !== undefined && { agreementId: record.agreementId as string }),
    ...(record.providerEventOccurredAtUtc !== undefined && {
      providerEventOccurredAtUtc: record.providerEventOccurredAtUtc as string,
    }),
    ...(record.bodyHashSha256 !== undefined && {
      bodyHashSha256: record.bodyHashSha256 as string,
    }),
    ...(record.requestedBy !== undefined && {
      requestedBy: record.requestedBy as AdobeSignCacheRequestedBy,
    }),
  };
  return { ok: true, workItem };
}

/**
 * Narrow-type assertion form. Throws when the value isn't a valid work item.
 */
export function assertAdobeSignCacheWorkItem(value: unknown): asserts value is AdobeSignCacheWorkItem {
  const result = validateAdobeSignCacheWorkItem(value);
  if (!result.ok) {
    throw new Error(`invalid AdobeSignCacheWorkItem: ${result.reason}`);
  }
}

export interface BuildAdobeSignCacheWorkItemInput {
  readonly workItemType: AdobeSignCacheWorkItemType;
  readonly correlationId: string;
  readonly adobeActorKey: string;
  readonly refreshScope: AdobeSignCacheRefreshScope;
  readonly userPrincipalNameNormalized?: string;
  readonly subscriptionKey?: string;
  readonly adobeWebhookId?: string;
  readonly providerEventId?: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly providerEventOccurredAtUtc?: string;
  readonly bodyHashSha256?: string;
  readonly requestedBy?: AdobeSignCacheRequestedBy;
}

export interface BuildAdobeSignCacheWorkItemDeps {
  readonly now: () => Date;
  readonly randomUUID: () => string;
}

/**
 * Build a fully-validated work item. Fills `workItemId` via `deps.randomUUID()`
 * and `requestedAtUtc` via `deps.now().toISOString()`. The result is run
 * through `validateAdobeSignCacheWorkItem` so callers can rely on the
 * runtime shape; a malformed input throws.
 */
export function buildAdobeSignCacheWorkItem(
  input: BuildAdobeSignCacheWorkItemInput,
  deps: BuildAdobeSignCacheWorkItemDeps,
): AdobeSignCacheWorkItem {
  const candidate: Record<string, unknown> = {
    workItemId: deps.randomUUID(),
    workItemType: input.workItemType,
    correlationId: input.correlationId,
    requestedAtUtc: deps.now().toISOString(),
    adobeActorKey: input.adobeActorKey,
    refreshScope: input.refreshScope,
  };
  if (input.userPrincipalNameNormalized !== undefined) {
    candidate.userPrincipalNameNormalized = input.userPrincipalNameNormalized;
  }
  if (input.subscriptionKey !== undefined) candidate.subscriptionKey = input.subscriptionKey;
  if (input.adobeWebhookId !== undefined) candidate.adobeWebhookId = input.adobeWebhookId;
  if (input.providerEventId !== undefined) candidate.providerEventId = input.providerEventId;
  if (input.providerEventType !== undefined) candidate.providerEventType = input.providerEventType;
  if (input.agreementId !== undefined) candidate.agreementId = input.agreementId;
  if (input.providerEventOccurredAtUtc !== undefined) {
    candidate.providerEventOccurredAtUtc = input.providerEventOccurredAtUtc;
  }
  if (input.bodyHashSha256 !== undefined) candidate.bodyHashSha256 = input.bodyHashSha256;
  if (input.requestedBy !== undefined) candidate.requestedBy = input.requestedBy;

  const result = validateAdobeSignCacheWorkItem(candidate);
  if (!result.ok) {
    throw new Error(`buildAdobeSignCacheWorkItem: ${result.reason}`);
  }
  return result.workItem;
}
