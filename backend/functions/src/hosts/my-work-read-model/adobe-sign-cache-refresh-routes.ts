/**
 * Adobe Sign cache — manual-refresh route (B05.15 Prompt 05).
 *
 * Registers a single POST endpoint:
 *
 *   POST /api/my-work/me/adobe-sign/cache/refresh
 *
 * The handler authenticates the actor, confirms grant posture, and
 * enqueues a `ManualUserRefresh` work item via the composed Azure
 * Storage Queue enqueuer. NO synchronous Adobe Sign provider call;
 * NO SharePoint read; NO inline cache write. The response carries an
 * `MyWorkAdobeSignCacheWorkAcceptedResponse` envelope (Prompt 01
 * locked the shape).
 *
 * Composition mirrors the action-link route file's discipline
 * (`adobe-sign-action-link-routes.ts`).
 *
 * @module hosts/my-work-read-model/adobe-sign-cache-refresh-routes
 */

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';

import type { MyWorkAdobeSignCacheWorkAcceptedResponse } from '@hbc/models/myWork';

import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

import {
  composeAdobeSignCacheQueueEnqueuer,
  type AdobeSignCacheQueueEnqueuerComposition,
  type IAdobeSignCacheQueueEnqueuer,
} from '../../services/adobe-sign-cache/queue-enqueuer.js';
import { buildAdobeSignCacheWorkItem } from '../../services/adobe-sign-cache/queue-work-item-contract.js';
import { normalizeAdobeSignActor } from './read-models/adobe-sign/adobe-sign-actor-normalizer.js';
import { resolveAdobeSignGrantStore } from './read-models/adobe-sign/adobe-sign-grant-store.js';

export const ADOBE_SIGN_CACHE_REFRESH_ROUTE_PATH = 'my-work/me/adobe-sign/cache/refresh' as const;
export const ADOBE_SIGN_CACHE_REFRESH_ROUTE_NAME = 'enqueueAdobeSignCacheManualRefresh' as const;

/**
 * Non-accepted refresh outcomes shape — mirrors the action-link route's
 * closed-string DTO style. All non-success cases return HTTP 200 with a
 * `data.status` discriminant (clients dispatch on this string); enqueue
 * failure returns HTTP 503 because the request was never accepted.
 */
export type AdobeSignCacheRefreshFailureStatus =
  | 'authorization-required'
  | 'principal-unresolved'
  | 'configuration-required'
  | 'source-unavailable';

export type AdobeSignCacheRefreshFailureResponse = {
  readonly status: AdobeSignCacheRefreshFailureStatus;
  readonly reason?: string;
};

export interface AdobeSignCacheRefreshRouteDeps {
  readonly resolveTenantId: () => string | undefined;
  readonly resolveGrantStore: () => ReturnType<typeof resolveAdobeSignGrantStore>;
  readonly resolveEnqueuer: () => AdobeSignCacheQueueEnqueuerComposition;
  readonly now: () => Date;
  readonly randomUUID: () => string;
}

export function createAdobeSignCacheRefreshHandler(deps: AdobeSignCacheRefreshRouteDeps) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
    auth: AuthContext,
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);

    const actorResult = normalizeAdobeSignActor({
      tenantId: deps.resolveTenantId(),
      claims: auth.claims,
    });
    if (!actorResult.ok) {
      const failure: AdobeSignCacheRefreshFailureResponse = {
        status: 'principal-unresolved',
        reason: actorResult.reason,
      };
      logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
        correlationId: requestId,
        status: 'skipped',
        reason: actorResult.reason,
        resultStage: 'principal',
      });
      return { status: 200, jsonBody: { data: failure } };
    }

    const grantStoreResolution = deps.resolveGrantStore();
    if (grantStoreResolution.readiness !== 'ready') {
      const failure: AdobeSignCacheRefreshFailureResponse = {
        status: 'configuration-required',
        reason: grantStoreResolution.reason,
      };
      logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
        correlationId: requestId,
        status: 'skipped',
        reason: 'grant-store-not-ready',
        resultStage: 'grant-store',
      });
      return { status: 200, jsonBody: { data: failure } };
    }

    const grant = await grantStoreResolution.store.findGrant(actorResult.actor.actorKey);
    if (!grant || grant.state !== 'active') {
      const failure: AdobeSignCacheRefreshFailureResponse = {
        status: 'authorization-required',
        reason: grant ? `grant-${grant.state}` : 'no-grant-found',
      };
      logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
        correlationId: requestId,
        status: 'skipped',
        reason: failure.reason ?? 'authorization-required',
        resultStage: 'grant',
      });
      return { status: 200, jsonBody: { data: failure } };
    }

    const enqueuerComposition = deps.resolveEnqueuer();
    if (enqueuerComposition.status !== 'ready') {
      const failure: AdobeSignCacheRefreshFailureResponse = {
        status: 'configuration-required',
        reason: enqueuerComposition.reason,
      };
      logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
        correlationId: requestId,
        status: 'skipped',
        reason: enqueuerComposition.reason,
        resultStage: 'enqueuer',
      });
      return { status: 200, jsonBody: { data: failure } };
    }

    const workItem = buildAdobeSignCacheWorkItem(
      {
        workItemType: 'ManualUserRefresh',
        correlationId: requestId,
        adobeActorKey: actorResult.actor.actorKey,
        userPrincipalNameNormalized: actorResult.actor.upn?.toLowerCase(),
        refreshScope: 'UserWide',
        requestedBy: 'user',
      },
      { now: deps.now, randomUUID: deps.randomUUID },
    );

    try {
      await enqueuerComposition.enqueuer.enqueue(workItem);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
        correlationId: requestId,
        status: 'failed',
        reason: 'enqueue-throw',
        resultStage: 'enqueue',
        errorMessage: message.slice(0, 200),
      });
      const failure: AdobeSignCacheRefreshFailureResponse = {
        status: 'source-unavailable',
        reason: 'enqueue-failed',
      };
      return { status: 503, jsonBody: { data: failure } };
    }

    logger.trackEvent('adobeSign.cacheRefresh.manualRefresh.enqueue.result', {
      correlationId: requestId,
      status: 'enqueued',
      workItemId: workItem.workItemId,
      resultStage: 'enqueue',
    });

    const accepted: MyWorkAdobeSignCacheWorkAcceptedResponse = {
      status: 'accepted',
      workItemType: 'ManualUserRefresh',
      correlationId: requestId,
    };
    return { status: 202, jsonBody: { data: accepted } };
  };
}

function buildDefaultRouteDeps(): AdobeSignCacheRefreshRouteDeps {
  return {
    resolveTenantId: () => process.env.AZURE_TENANT_ID,
    resolveGrantStore: () => resolveAdobeSignGrantStore(process.env),
    resolveEnqueuer: () => composeAdobeSignCacheQueueEnqueuer(process.env),
    now: () => new Date(),
    randomUUID: () => globalThis.crypto.randomUUID(),
  };
}

app.http(ADOBE_SIGN_CACHE_REFRESH_ROUTE_NAME, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_CACHE_REFRESH_ROUTE_PATH,
  handler: withAuth(
    withTelemetry(createAdobeSignCacheRefreshHandler(buildDefaultRouteDeps()), {
      domain: 'my-work-adobe-sign-cache-refresh',
      operation: 'enqueueManualUserRefresh',
    }),
  ),
});
