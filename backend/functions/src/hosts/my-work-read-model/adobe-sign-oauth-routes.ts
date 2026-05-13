/**
 * Adobe Sign OAuth routes — B05 Prompt 03.
 *
 * Two and only two routes are registered here:
 *
 *   POST /api/my-work/me/adobe-sign/oauth/start    (protected)
 *   GET  /api/my-work/adobe-sign/oauth/callback    (public)
 *
 * The callback intentionally lives **outside** `/me/...` because Adobe
 * cannot present the user's Entra bearer when redirecting back; the
 * route validates a single-use OAuth `state` parameter instead. The
 * start route stays under `/me/...` and is bound to the validated actor
 * via the existing auth middleware — no actor/user/principal override
 * is accepted from the request.
 *
 * Composition contract:
 *   - `withAuth(withTelemetry(...))` wraps the start handler exactly as
 *     B04 read-model routes do;
 *   - the callback handler is anonymous (no `withAuth`) and never logs
 *     the raw query string, `state`, or `code` values;
 *   - all store/service seams are injected through factory composition
 *     so this module remains test-friendly and so production-store
 *     selection can be added in B05/B06 without touching the routes.
 *
 * @module hosts/my-work-read-model/adobe-sign-oauth-routes
 */

import { randomBytes as nodeRandomBytes } from 'node:crypto';

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';

import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createLogger } from '../../utils/logger.js';
import { errorResponse, successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

import { normalizeAdobeSignActor } from './read-models/adobe-sign/adobe-sign-actor-normalizer.js';
import {
  isAdobeSignConfigReady,
  resolveAdobeSignOAuthConfigReadiness,
  parseAdobeSignScopes,
} from './read-models/adobe-sign/adobe-sign-config.js';
import {
  resolveAdobeSignGrantStore,
  type IAdobeSignGrantStore,
} from './read-models/adobe-sign/adobe-sign-grant-store.js';
import type {
  AdobeSignGrantState,
  IAdobeSignGrantRecord,
} from './read-models/adobe-sign/adobe-sign-grant-record.js';
import {
  buildAdobeSignAuthorizationUrl,
  type IAdobeSignOAuthService,
} from './read-models/adobe-sign/adobe-sign-oauth-service.js';
import {
  ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS,
  createAdobeSignOAuthState,
} from './read-models/adobe-sign/adobe-sign-oauth-state.js';
import {
  resolveAdobeSignOAuthStateStore,
  type IAdobeSignOAuthStateStore,
} from './read-models/adobe-sign/adobe-sign-oauth-state-store.js';
import {
  ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
  validateAdobeSignReturnPath,
} from './read-models/adobe-sign/adobe-sign-oauth-return-path.js';

// ---------------------------------------------------------------------------
// Locked route paths — also asserted from tests so accidental renames break
// CI rather than silently shipping with a wrong path.
// ---------------------------------------------------------------------------

export const ADOBE_SIGN_OAUTH_ROUTE_PATHS = {
  start: 'my-work/me/adobe-sign/oauth/start',
  callback: 'my-work/adobe-sign/oauth/callback',
} as const;

export const ADOBE_SIGN_OAUTH_ROUTE_NAMES = {
  start: 'startAdobeSignOAuth',
  callback: 'completeAdobeSignOAuthCallback',
} as const;

// ---------------------------------------------------------------------------
// Composition root — accepts injected seams so route tests can drive the
// handlers deterministically. The default factories read from process.env
// and produce the deterministic mock stores in test/mock mode.
// ---------------------------------------------------------------------------

export interface AdobeSignOAuthRouteDeps {
  readonly resolveTenantId: () => string | undefined;
  readonly resolveConfigEnv: () => Record<string, string | undefined>;
  readonly resolveStateStore: () =>
    | { readonly readiness: 'ready'; readonly store: IAdobeSignOAuthStateStore }
    | { readonly readiness: 'configuration-required'; readonly reason: string };
  readonly resolveGrantStore: () =>
    | { readonly readiness: 'ready'; readonly store: IAdobeSignGrantStore }
    | { readonly readiness: 'configuration-required'; readonly reason: string };
  readonly oauthService: IAdobeSignOAuthService;
  readonly now: () => Date;
  readonly randomBytes: (n: number) => Uint8Array;
}

const defaultRandomBytes = (n: number): Uint8Array => new Uint8Array(nodeRandomBytes(n));

const defaultDeps = (): AdobeSignOAuthRouteDeps => ({
  resolveTenantId: () => process.env.AZURE_TENANT_ID,
  resolveConfigEnv: () => process.env,
  resolveStateStore: () => resolveAdobeSignOAuthStateStore(process.env),
  resolveGrantStore: () => resolveAdobeSignGrantStore(process.env),
  oauthService: {
    async exchangeAuthorizationCode() {
      // Production token-exchange lands in a later B05 prompt. Until then,
      // any production reach into the service returns 'unreachable' so the
      // callback degrades to a configuration-required UX status rather
      // than silently appearing to succeed.
      return { status: 'unreachable', reason: 'service-not-wired' };
    },
  },
  now: () => new Date(),
  randomBytes: defaultRandomBytes,
});

// ---------------------------------------------------------------------------
// Start route
// ---------------------------------------------------------------------------

interface StartBody {
  readonly returnPath?: string;
}

const readStartBody = async (request: HttpRequest): Promise<StartBody> => {
  try {
    const text = await request.text();
    if (!text) return {};
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed === 'object' && parsed !== null && 'returnPath' in parsed) {
      const candidate = (parsed as { returnPath?: unknown }).returnPath;
      if (typeof candidate === 'string') return { returnPath: candidate };
    }
    return {};
  } catch {
    return {};
  }
};

export function createStartHandler(deps: AdobeSignOAuthRouteDeps) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
    auth: { claims: Parameters<typeof normalizeAdobeSignActor>[0]['claims'] },
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);

    const actorResult = normalizeAdobeSignActor({
      tenantId: deps.resolveTenantId(),
      claims: auth.claims,
    });
    if (!actorResult.ok) {
      logger.trackEvent('adobeSign.oauth.start.rejected', {
        correlationId: requestId,
        reason: actorResult.reason,
      });
      return errorResponse(
        actorResult.reason === 'app-only' ? 403 : 400,
        'PRINCIPAL_UNRESOLVED',
        'The signed-in identity is not eligible for personal Adobe Sign authorization.',
        requestId,
        { reason: actorResult.reason },
      );
    }

    const env = deps.resolveConfigEnv();
    const configReadiness = resolveAdobeSignOAuthConfigReadiness(env);
    if (!isAdobeSignConfigReady(configReadiness)) {
      logger.trackEvent('adobeSign.oauth.start.configuration-required', {
        correlationId: requestId,
        status: configReadiness.status,
        missingKeys: configReadiness.missingKeys,
      });
      return errorResponse(
        503,
        'CONFIGURATION_REQUIRED',
        'Adobe Sign OAuth configuration is incomplete.',
        requestId,
        {
          status: configReadiness.status,
          missingKeys: configReadiness.missingKeys,
        },
      );
    }

    const stateStore = deps.resolveStateStore();
    if (stateStore.readiness !== 'ready') {
      logger.trackEvent('adobeSign.oauth.start.state-store-unavailable', {
        correlationId: requestId,
        reason: stateStore.reason,
      });
      return errorResponse(
        503,
        'CONFIGURATION_REQUIRED',
        'Adobe Sign OAuth state store is not configured.',
        requestId,
        { reason: stateStore.reason },
      );
    }

    const body = await readStartBody(request);
    const returnPathResult = validateAdobeSignReturnPath(body.returnPath);
    if (!returnPathResult.ok) {
      logger.trackEvent('adobeSign.oauth.start.invalid-return-path', {
        correlationId: requestId,
        reason: returnPathResult.reason,
      });
      return errorResponse(400, 'INVALID_RETURN_PATH', 'Return path is not allowed.', requestId, {
        reason: returnPathResult.reason,
      });
    }

    const stateRecord = createAdobeSignOAuthState({
      actorKey: actorResult.actor.actorKey,
      returnPath: returnPathResult.path,
      now: deps.now,
      randomBytes: deps.randomBytes,
      ttlSeconds: ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS,
    });
    await stateStore.store.put(stateRecord);

    const authorizationUrl = buildAdobeSignAuthorizationUrl({
      clientId: env.ADOBE_SIGN_OAUTH_CLIENT_ID as string,
      redirectUri: env.ADOBE_SIGN_OAUTH_REDIRECT_URI as string,
      scopes: parseAdobeSignScopes(env.ADOBE_SIGN_OAUTH_SCOPES),
      state: stateRecord.stateValue,
    });

    logger.trackEvent('adobeSign.oauth.start.issued', {
      correlationId: requestId,
      // never log the stateValue itself
      stateExpiresAtUtc: stateRecord.expiresAtUtc,
    });

    return successResponse({
      authorizationUrl,
      stateExpiresAtUtc: stateRecord.expiresAtUtc,
    });
  };
}

// ---------------------------------------------------------------------------
// Callback route — anonymous, state-validated, no raw query logging.
// ---------------------------------------------------------------------------

const CALLBACK_UX_STATUS = {
  success: 'success',
  invalidState: 'invalid-state',
  expiredState: 'expired-state',
  consumedState: 'consumed-state',
  configurationRequired: 'configuration-required',
  sourceUnavailable: 'source-unavailable',
  invalidGrant: 'invalid-grant',
} as const;

type CallbackUxStatus = (typeof CALLBACK_UX_STATUS)[keyof typeof CALLBACK_UX_STATUS];

const buildRedirect = (returnPath: string, status: CallbackUxStatus): HttpResponseInit => {
  const sep = returnPath.includes('?') ? '&' : '?';
  return {
    status: 302,
    headers: {
      Location: `${returnPath}${sep}adobeSignAuthorization=${encodeURIComponent(status)}`,
      'Cache-Control': 'no-store, max-age=0',
    },
  };
};

const grantStateForExchange = (exchange: { readonly status: string }): AdobeSignGrantState =>
  exchange.status === 'ok' ? 'active' : 'pending';

export function createCallbackHandler(deps: AdobeSignOAuthRouteDeps) {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);

    // IMPORTANT: do not log raw query strings.
    const state = request.query.get('state') ?? '';
    const code = request.query.get('code') ?? '';
    const apiAccessPoint = request.query.get('api_access_point') ?? '';
    const webAccessPoint = request.query.get('web_access_point') ?? '';

    if (!state || !code) {
      logger.trackEvent('adobeSign.oauth.callback.invalid-input', {
        correlationId: requestId,
        hasState: Boolean(state),
        hasCode: Boolean(code),
      });
      return buildRedirect(ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH, CALLBACK_UX_STATUS.invalidState);
    }

    const env = deps.resolveConfigEnv();
    const configReadiness = resolveAdobeSignOAuthConfigReadiness(env);
    if (!isAdobeSignConfigReady(configReadiness)) {
      logger.trackEvent('adobeSign.oauth.callback.configuration-required', {
        correlationId: requestId,
        status: configReadiness.status,
        missingKeys: configReadiness.missingKeys,
      });
      return buildRedirect(
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.configurationRequired,
      );
    }

    const stateStore = deps.resolveStateStore();
    const grantStore = deps.resolveGrantStore();
    if (stateStore.readiness !== 'ready' || grantStore.readiness !== 'ready') {
      logger.trackEvent('adobeSign.oauth.callback.store-unavailable', {
        correlationId: requestId,
        stateReady: stateStore.readiness === 'ready',
        grantReady: grantStore.readiness === 'ready',
      });
      return buildRedirect(
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.configurationRequired,
      );
    }

    const takeResult = await stateStore.store.take(state, deps.now());

    if (takeResult.outcome !== 'valid') {
      const mapped: CallbackUxStatus =
        takeResult.outcome === 'expired'
          ? CALLBACK_UX_STATUS.expiredState
          : takeResult.outcome === 'consumed'
            ? CALLBACK_UX_STATUS.consumedState
            : takeResult.outcome === 'missing'
              ? CALLBACK_UX_STATUS.invalidState
              : CALLBACK_UX_STATUS.configurationRequired;
      logger.trackEvent('adobeSign.oauth.callback.state-rejected', {
        correlationId: requestId,
        outcome: takeResult.outcome,
      });
      return buildRedirect(ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH, mapped);
    }

    const stateRecord = takeResult.record;

    const exchange = await deps.oauthService.exchangeAuthorizationCode({
      authorizationCode: code,
      clientId: env.ADOBE_SIGN_OAUTH_CLIENT_ID as string,
      clientSecret: env.ADOBE_SIGN_OAUTH_CLIENT_SECRET as string,
      redirectUri: env.ADOBE_SIGN_OAUTH_REDIRECT_URI as string,
      apiAccessPoint,
      webAccessPoint,
    });

    if (exchange.status !== 'ok') {
      const mapped: CallbackUxStatus =
        exchange.status === 'unreachable'
          ? CALLBACK_UX_STATUS.sourceUnavailable
          : exchange.status === 'scope-mismatch'
            ? CALLBACK_UX_STATUS.invalidGrant
            : CALLBACK_UX_STATUS.invalidGrant;
      logger.trackEvent('adobeSign.oauth.callback.exchange-failed', {
        correlationId: requestId,
        status: exchange.status,
      });
      return buildRedirect(stateRecord.returnPath, mapped);
    }

    const [actorTenantId, actorOid] = stateRecord.actorKey.split('::');
    const grant: IAdobeSignGrantRecord = {
      actorTenantId,
      actorOid,
      actorKey: stateRecord.actorKey,
      adobeApiAccessPoint: apiAccessPoint,
      adobeWebAccessPoint: webAccessPoint,
      encryptedRefreshTokenRef: {
        storeKind: 'pending-selection',
        address: '',
      },
      grantedScopes: exchange.grantedScopes,
      grantedAtUtc: deps.now().toISOString(),
      state: grantStateForExchange(exchange),
    };
    await grantStore.store.upsertGrant(grant);

    logger.trackEvent('adobeSign.oauth.callback.granted', {
      correlationId: requestId,
      grantState: grant.state,
      scopeCount: grant.grantedScopes.length,
    });

    return buildRedirect(stateRecord.returnPath, CALLBACK_UX_STATUS.success);
  };
}

// ---------------------------------------------------------------------------
// Function-host registration. Default deps are used in production; tests
// import the handler factories directly and inject their own deps.
// ---------------------------------------------------------------------------

const deps = defaultDeps();

app.http(ADOBE_SIGN_OAUTH_ROUTE_NAMES.start, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_OAUTH_ROUTE_PATHS.start,
  handler: withAuth(
    withTelemetry(createStartHandler(deps), {
      domain: 'my-work-adobe-sign-oauth',
      operation: ADOBE_SIGN_OAUTH_ROUTE_NAMES.start,
    }),
  ),
});

app.http(ADOBE_SIGN_OAUTH_ROUTE_NAMES.callback, {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_OAUTH_ROUTE_PATHS.callback,
  handler: createCallbackHandler(deps),
});
