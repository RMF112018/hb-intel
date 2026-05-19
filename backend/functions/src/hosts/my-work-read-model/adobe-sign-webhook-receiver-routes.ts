/**
 * Adobe Sign public webhook receiver routes (B05.15 Prompt 06).
 *
 * Two anonymous endpoints front Adobe Sign's webhook delivery:
 *
 *   GET  /api/adobe-sign/webhooks/notifications/{receiverKey}   — URL verification
 *   POST /api/adobe-sign/webhooks/notifications/{receiverKey}   — Notification intake
 *
 * Adobe cannot present a user bearer when calling back, so both routes
 * are `authLevel: 'anonymous'`. Authentication is enforced through:
 *
 *   - `X-ADOBESIGN-CLIENTID` header == configured `ADOBE_SIGN_OAUTH_CLIENT_ID`;
 *   - opaque `receiverKey` route param (POST only — must match a row in
 *     the Prompt 04 webhook subscription registry).
 *
 * The POST handler is intentionally permissive about its response codes
 * for non-enqueue branches: malformed JSON, unsupported event family,
 * duplicate dedupe, and locally-ignored subscriptions all return 200
 * with the client-ID echo so Adobe's retry loop doesn't keep retrying a
 * payload we've already decided to drop. Only invalid client-ID and
 * missing receiverKey return non-2xx (Adobe should retry those — they
 * indicate a misconfigured webhook, not a poisoned payload).
 *
 * Raw payload bodies are NEVER logged. Telemetry property payloads
 * carry only sanitized booleans, closed-enum statuses, and prefix
 * substrings (first 8 chars of the body-hash) for opaque correlation.
 *
 * @module hosts/my-work-read-model/adobe-sign-webhook-receiver-routes
 */

import { createHash } from 'node:crypto';

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';

import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';

import { GraphListClient } from '../../services/legacy-fallback/graph-list-client.js';
import {
  getMyDashboardAdobeSignCacheListHostSiteUrl,
  type AdobeSignWebhookLocalProcessingState,
} from '../../services/adobe-sign-cache/cache-list-descriptors.js';
import { computeAdobeSignWebhookDedupeKey } from '../../services/adobe-sign-cache/dedupe-key.js';
import {
  composeAdobeSignCacheQueueEnqueuer,
  type AdobeSignCacheQueueEnqueuerComposition,
} from '../../services/adobe-sign-cache/queue-enqueuer.js';
import { buildAdobeSignCacheWorkItem } from '../../services/adobe-sign-cache/queue-work-item-contract.js';
import {
  composeAdobeSignWebhookEventDedupeRepository,
  type AdobeSignWebhookEventDedupeRepositoryComposition,
} from '../../services/adobe-sign-cache/webhook-event-dedupe-repository.js';
import {
  createGraphAdobeSignWebhookSubscriptionRegistryRepository,
  type AdobeSignWebhookSubscriptionRow,
  type IAdobeSignWebhookSubscriptionRegistryRepository,
} from '../../services/adobe-sign-cache/repositories/webhook-subscription-registry-repository.js';

export const ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_PATH =
  'adobe-sign/webhooks/notifications/{receiverKey}' as const;
export const ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_NAMES = {
  get: 'adobeSignWebhookReceiverVerification',
  post: 'adobeSignWebhookReceiverNotification',
} as const;

export const ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER = 'X-ADOBESIGN-CLIENTID';
const RECEIVER_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

// ─── Telemetry contract — sanitization-by-construction ─────────────────────

const ACTIVE_LOCAL_PROCESSING_STATE: AdobeSignWebhookLocalProcessingState = 'Active';

const LOCAL_IGNORE_STATES: ReadonlySet<AdobeSignWebhookLocalProcessingState> = new Set([
  'IgnoredAfterDisconnect',
  'RemoteDeactivationFailed',
  'Suspended',
  'Orphaned',
]);

// ─── Deps + composition root ───────────────────────────────────────────────

export interface AdobeSignWebhookReceiverRouteDeps {
  readonly resolveExpectedClientId: () => string | undefined;
  readonly resolveSubscriptionRegistry: () => IAdobeSignWebhookSubscriptionRegistryRepository;
  readonly resolveDedupeComposition: () => AdobeSignWebhookEventDedupeRepositoryComposition;
  readonly resolveEnqueuerComposition: () => AdobeSignCacheQueueEnqueuerComposition;
  readonly now: () => Date;
  readonly randomUUID: () => string;
}

function buildDefaultRouteDeps(): AdobeSignWebhookReceiverRouteDeps {
  return {
    resolveExpectedClientId: () => process.env.ADOBE_SIGN_OAUTH_CLIENT_ID,
    resolveSubscriptionRegistry: () =>
      createGraphAdobeSignWebhookSubscriptionRegistryRepository({
        graph: new GraphListClient(getMyDashboardAdobeSignCacheListHostSiteUrl()),
      }),
    resolveDedupeComposition: () => composeAdobeSignWebhookEventDedupeRepository(process.env),
    resolveEnqueuerComposition: () => composeAdobeSignCacheQueueEnqueuer(process.env),
    now: () => new Date(),
    randomUUID: () => globalThis.crypto.randomUUID(),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function isReceiverKeyFormatValid(value: unknown): value is string {
  return typeof value === 'string' && RECEIVER_KEY_PATTERN.test(value);
}

function safeString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

interface ParsedAdobePayload {
  readonly providerEventId?: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly providerEventOccurredAtUtc?: string;
}

/**
 * Schema-tolerant extraction of the four telemetry-safe fields from an
 * Adobe webhook payload. The extractor tries every documented historical
 * shape (camelCase, nested `event`, nested `agreement`, etc.) and
 * returns `undefined` for fields it cannot locate. Missing fields fall
 * through to the SHA-256 fallback dedupe-key path — no field is
 * load-bearing for receiver correctness.
 */
function extractAdobePayload(parsed: unknown): ParsedAdobePayload {
  if (typeof parsed !== 'object' || parsed === null) return {};
  const top = parsed as Record<string, unknown>;
  const event = typeof top.event === 'object' && top.event !== null
    ? (top.event as Record<string, unknown>)
    : undefined;
  const agreement = typeof top.agreement === 'object' && top.agreement !== null
    ? (top.agreement as Record<string, unknown>)
    : undefined;
  return {
    providerEventId:
      safeString(top.eventId) ?? safeString(event?.id) ?? safeString(top.id),
    providerEventType:
      safeString(typeof top.event === 'string' ? top.event : undefined) ??
      safeString(top.eventType) ??
      safeString(event?.type) ??
      safeString(event?.name),
    agreementId: safeString(agreement?.id) ?? safeString(top.agreementId),
    providerEventOccurredAtUtc: safeString(top.eventDate) ?? safeString(top.timestamp),
  };
}

function isAgreementEventFamily(providerEventType: string | undefined): boolean {
  if (providerEventType === undefined) return false;
  return providerEventType.startsWith('AGREEMENT_');
}

function buildAcceptedResponse(
  expectedClientId: string,
  body: Record<string, unknown>,
  statusCode = 200,
): HttpResponseInit {
  return {
    status: statusCode,
    headers: { [ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER]: expectedClientId },
    jsonBody: body,
  };
}

function buildRejectionResponse(statusCode: number, body: Record<string, unknown>): HttpResponseInit {
  return {
    status: statusCode,
    jsonBody: body,
  };
}

function headerSingleValue(request: HttpRequest, name: string): string | undefined {
  const headers = request.headers as unknown as { get?: (k: string) => string | null | undefined };
  const value = headers.get?.(name);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// ─── GET verification handler ──────────────────────────────────────────────

export function createAdobeSignWebhookReceiverGetHandler(deps: AdobeSignWebhookReceiverRouteDeps) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);
    const receiverKey = (request.params as Record<string, string | undefined>)?.receiverKey;
    const receiverKeyHasFormat = isReceiverKeyFormatValid(receiverKey);

    logger.trackEvent('adobeSign.webhook.verification.received', {
      correlationId: requestId,
      receiverKeyHasFormat,
    });

    const expectedClientId = deps.resolveExpectedClientId();
    if (typeof expectedClientId !== 'string' || expectedClientId.length === 0) {
      logger.trackEvent('adobeSign.webhook.verification.rejected', {
        correlationId: requestId,
        reason: 'oauth-client-id-not-configured',
      });
      return buildRejectionResponse(503, { error: 'configuration-required' });
    }

    if (!receiverKeyHasFormat) {
      logger.trackEvent('adobeSign.webhook.verification.rejected', {
        correlationId: requestId,
        reason: 'receiver-key-malformed',
      });
      return buildRejectionResponse(400, { error: 'receiver-key-malformed' });
    }

    const presentedClientId = headerSingleValue(request, ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER);
    if (presentedClientId === undefined || presentedClientId !== expectedClientId) {
      logger.trackEvent('adobeSign.webhook.verification.rejected', {
        correlationId: requestId,
        reason: presentedClientId === undefined ? 'client-id-missing' : 'client-id-mismatch',
      });
      return buildRejectionResponse(401, { error: 'client-id-rejected' });
    }

    logger.trackEvent('adobeSign.webhook.verification.accepted', {
      correlationId: requestId,
    });
    return buildAcceptedResponse(expectedClientId, { verified: true }, 200);
  };
}

// ─── POST notification handler ─────────────────────────────────────────────

interface PostOutcomeContext {
  readonly logger: ReturnType<typeof createLogger>;
  readonly requestId: string;
  readonly expectedClientId: string;
  readonly receiverKey: string;
  readonly subscription: AdobeSignWebhookSubscriptionRow;
  readonly bodyHashSha256: string;
}

export function createAdobeSignWebhookReceiverPostHandler(
  deps: AdobeSignWebhookReceiverRouteDeps,
) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);
    const receiverKey = (request.params as Record<string, string | undefined>)?.receiverKey;
    const receiverKeyHasFormat = isReceiverKeyFormatValid(receiverKey);

    logger.trackEvent('adobeSign.webhook.notification.received', {
      correlationId: requestId,
      receiverKeyHasFormat,
    });

    const expectedClientId = deps.resolveExpectedClientId();
    if (typeof expectedClientId !== 'string' || expectedClientId.length === 0) {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: 'oauth-client-id-not-configured',
      });
      return buildRejectionResponse(503, { error: 'configuration-required' });
    }

    if (!receiverKeyHasFormat) {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: 'receiver-key-malformed',
      });
      return buildRejectionResponse(400, { error: 'receiver-key-malformed' });
    }

    const presentedClientId = headerSingleValue(request, ADOBE_SIGN_WEBHOOK_RECEIVER_HEADER);
    if (presentedClientId === undefined || presentedClientId !== expectedClientId) {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: presentedClientId === undefined ? 'client-id-missing' : 'client-id-mismatch',
      });
      return buildRejectionResponse(401, { error: 'client-id-rejected' });
    }

    // From here on, every response carries 200 + echo so Adobe doesn't
    // retry a payload we've decided to drop. The 401/400/503 paths
    // above are the only non-echo responses.

    const registry = deps.resolveSubscriptionRegistry();
    const subscription = await registry.findBySubscriptionKey(receiverKey as string);
    if (subscription === null) {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: 'receiver-key-not-found',
      });
      return buildRejectionResponse(404, { error: 'receiver-key-not-found' });
    }

    const rawBody = await request.text().catch(() => '');
    const bodyHashSha256 = createHash('sha256').update(rawBody, 'utf8').digest('hex');
    const bodyHashSha256Prefix = bodyHashSha256.slice(0, 8);

    if (subscription.localProcessingState !== ACTIVE_LOCAL_PROCESSING_STATE) {
      const isIgnore = LOCAL_IGNORE_STATES.has(subscription.localProcessingState);
      logger.trackEvent('adobeSign.webhook.notification.ignored', {
        correlationId: requestId,
        subscriptionLocalProcessingState: subscription.localProcessingState,
        reason: isIgnore ? 'subscription-locally-ignored' : 'subscription-non-active',
        bodyHashSha256Prefix,
      });
      return buildAcceptedResponse(expectedClientId, { acknowledged: true }, 200);
    }

    let parsed: unknown;
    try {
      parsed = rawBody.length === 0 ? null : JSON.parse(rawBody);
    } catch {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: 'parse-error',
        bodyHashSha256Prefix,
      });
      return buildAcceptedResponse(expectedClientId, { acknowledged: true }, 200);
    }

    const extracted = extractAdobePayload(parsed);
    const isAgreementEvent = isAgreementEventFamily(extracted.providerEventType);
    if (!isAgreementEvent) {
      logger.trackEvent('adobeSign.webhook.notification.rejected', {
        correlationId: requestId,
        reason: 'unsupported-resource',
        hasProviderEventType: extracted.providerEventType !== undefined,
        providerEventTypePrefix: 'UNSUPPORTED',
        bodyHashSha256Prefix,
      });
      return buildAcceptedResponse(expectedClientId, { acknowledged: true }, 200);
    }

    const outcomeContext: PostOutcomeContext = {
      logger,
      requestId,
      expectedClientId,
      receiverKey: receiverKey as string,
      subscription,
      bodyHashSha256,
    };

    return handleAcceptedNotification(deps, outcomeContext, extracted);
  };
}

async function handleAcceptedNotification(
  deps: AdobeSignWebhookReceiverRouteDeps,
  ctx: PostOutcomeContext,
  extracted: ParsedAdobePayload,
): Promise<HttpResponseInit> {
  const dedupeKey = computeAdobeSignWebhookDedupeKey({
    providerEventId: extracted.providerEventId,
    subscriptionKey: ctx.receiverKey,
    providerEventType: extracted.providerEventType,
    agreementId: extracted.agreementId,
    providerEventOccurredAtUtc: extracted.providerEventOccurredAtUtc,
    bodyHashSha256: ctx.bodyHashSha256,
  });
  const dedupeComposition = deps.resolveDedupeComposition();
  const bodyHashSha256Prefix = ctx.bodyHashSha256.slice(0, 8);

  if (dedupeComposition.status !== 'ready') {
    ctx.logger.trackEvent('adobeSign.webhook.workItem.enqueueFailed', {
      correlationId: ctx.requestId,
      reason: 'dedupe-not-configured',
      enqueueOutcome: 'skipped',
      bodyHashSha256Prefix,
    });
    return buildAcceptedResponse(ctx.expectedClientId, { acknowledged: true }, 200);
  }

  let dedupeOutcome: 'reserved' | 'duplicate';
  try {
    dedupeOutcome = await dedupeComposition.repository.tryReserve({
      subscriptionKey: ctx.receiverKey,
      dedupeKey,
      providerEventType: extracted.providerEventType,
      agreementId: extracted.agreementId,
      bodyHashSha256: ctx.bodyHashSha256,
      ttlDays: dedupeComposition.retentionDays,
    });
  } catch {
    ctx.logger.trackEvent('adobeSign.webhook.workItem.enqueueFailed', {
      correlationId: ctx.requestId,
      reason: 'dedupe-reservation-failed',
      enqueueOutcome: 'skipped',
      bodyHashSha256Prefix,
    });
    return buildAcceptedResponse(ctx.expectedClientId, { acknowledged: true }, 200);
  }

  if (dedupeOutcome === 'duplicate') {
    ctx.logger.trackEvent('adobeSign.webhook.notification.duplicate-suppressed', {
      correlationId: ctx.requestId,
      hasProviderEventId: extracted.providerEventId !== undefined,
      hasAgreementId: extracted.agreementId !== undefined,
      providerEventTypePrefix: 'AGREEMENT_',
      bodyHashSha256Prefix,
    });
    return buildAcceptedResponse(ctx.expectedClientId, { acknowledged: true }, 200);
  }

  ctx.logger.trackEvent('adobeSign.webhook.notification.accepted', {
    correlationId: ctx.requestId,
    hasProviderEventId: extracted.providerEventId !== undefined,
    hasAgreementId: extracted.agreementId !== undefined,
    providerEventTypePrefix: 'AGREEMENT_',
    bodyHashSha256Prefix,
    dedupeOutcome,
  });

  const enqueuerComposition = deps.resolveEnqueuerComposition();
  if (enqueuerComposition.status !== 'ready') {
    ctx.logger.trackEvent('adobeSign.webhook.workItem.enqueueFailed', {
      correlationId: ctx.requestId,
      reason: 'enqueuer-not-configured',
      enqueueOutcome: 'skipped',
      bodyHashSha256Prefix,
    });
    return buildAcceptedResponse(ctx.expectedClientId, { acknowledged: true }, 200);
  }

  const refreshScopeSelected: 'AgreementTargeted' | 'UserWide' =
    extracted.agreementId !== undefined ? 'AgreementTargeted' : 'UserWide';
  const workItem = buildAdobeSignCacheWorkItem(
    {
      workItemType: 'WebhookAgreementRefresh',
      correlationId: ctx.requestId,
      adobeActorKey: ctx.subscription.adobeActorKey,
      refreshScope: refreshScopeSelected,
      requestedBy: 'webhook',
      subscriptionKey: ctx.receiverKey,
      ...(ctx.subscription.adobeWebhookId !== undefined && {
        adobeWebhookId: ctx.subscription.adobeWebhookId,
      }),
      ...(ctx.subscription.userPrincipalNameNormalized !== undefined && {
        userPrincipalNameNormalized: ctx.subscription.userPrincipalNameNormalized,
      }),
      ...(extracted.providerEventId !== undefined && {
        providerEventId: extracted.providerEventId,
      }),
      ...(extracted.providerEventType !== undefined && {
        providerEventType: extracted.providerEventType,
      }),
      ...(extracted.agreementId !== undefined && { agreementId: extracted.agreementId }),
      ...(extracted.providerEventOccurredAtUtc !== undefined && {
        providerEventOccurredAtUtc: extracted.providerEventOccurredAtUtc,
      }),
      bodyHashSha256: ctx.bodyHashSha256,
    },
    { now: deps.now, randomUUID: deps.randomUUID },
  );

  try {
    await enqueuerComposition.enqueuer.enqueue(workItem);
  } catch {
    ctx.logger.trackEvent('adobeSign.webhook.workItem.enqueueFailed', {
      correlationId: ctx.requestId,
      reason: 'enqueue-throw',
      enqueueOutcome: 'failed',
      refreshScopeSelected,
      bodyHashSha256Prefix,
    });
    return buildAcceptedResponse(ctx.expectedClientId, { acknowledged: true }, 200);
  }

  ctx.logger.trackEvent('adobeSign.webhook.workItem.enqueued', {
    correlationId: ctx.requestId,
    workItemId: workItem.workItemId,
    refreshScopeSelected,
    enqueueOutcome: 'enqueued',
    bodyHashSha256Prefix,
  });

  return buildAcceptedResponse(
    ctx.expectedClientId,
    { acknowledged: true, correlationId: ctx.requestId, workItemId: workItem.workItemId },
    202,
  );
}

// ─── Registration ──────────────────────────────────────────────────────────

// Anonymous routes — Adobe cannot present a user bearer. Telemetry runs
// inside the handlers via `logger.trackEvent` (the `withTelemetry`
// middleware requires a 3-arg handler with `AuthContext`, which is not
// applicable here). This mirrors the OAuth callback registration shape.

const defaultDeps = buildDefaultRouteDeps();

app.http(ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_NAMES.get, {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_PATH,
  handler: createAdobeSignWebhookReceiverGetHandler(defaultDeps),
});

app.http(ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_NAMES.post, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_WEBHOOK_RECEIVER_ROUTE_PATH,
  handler: createAdobeSignWebhookReceiverPostHandler(defaultDeps),
});
