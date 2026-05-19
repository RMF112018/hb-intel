/**
 * Adobe Sign OAuth routes.
 *
 * Three routes are registered here:
 *
 *   POST /api/my-work/me/adobe-sign/oauth/start        (protected)
 *   GET  /api/my-work/adobe-sign/oauth/callback        (public)
 *   POST /api/my-work/me/adobe-sign/oauth/disconnect   (protected, idempotent)
 *
 * The callback intentionally lives **outside** `/me/...` because Adobe
 * cannot present the user's Entra bearer when redirecting back; the
 * route validates a single-use OAuth `state` parameter instead. The
 * start and disconnect routes stay under `/me/...` and are bound to the
 * validated actor via the existing auth middleware — no actor/user/
 * principal override is accepted from the request body.
 *
 * Operator note on scopes: the OAuth scope set is supplied by the env
 * `ADOBE_SIGN_OAUTH_SCOPES`. The exact scope strings required for
 * agreement search, agreement detail, and signing-URL/action-link
 * resolution are an Adobe configuration dependency that must be
 * verified against Adobe's published scope reference for the tenant.
 * If the resolver reports `scope-insufficient`, the user-facing
 * remediation is the Reconnect action on the Adobe Sign card, which
 * forces a fresh consent and re-issues the grant under the currently
 * configured env scope list.
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
import { buildAdobeScopeDiagnostics } from './read-models/adobe-sign/adobe-sign-scope-diagnostics.js';
import type {
  AdobeSignGrantState,
  IAdobeSignGrantRecord,
} from './read-models/adobe-sign/adobe-sign-grant-record.js';
import {
  createAdobeSignLiveOAuthService,
  isAllowedAdobeAccessPoint,
} from './read-models/adobe-sign/adobe-sign-live-oauth-service.js';
import {
  buildAdobeSignAuthorizationUrl,
  type IAdobeSignOAuthService,
} from './read-models/adobe-sign/adobe-sign-oauth-service.js';
import {
  createAdobeSignRefreshTokenCipher,
  resolveAdobeSignRefreshTokenCipherKey,
  type AdobeSignRefreshTokenCipher,
} from './read-models/adobe-sign/adobe-sign-refresh-token-crypto.js';
import {
  resolveAdobeSignRefreshTokenStore,
  type IAdobeSignRefreshTokenStore,
} from './read-models/adobe-sign/adobe-sign-refresh-token-store.js';
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
  buildAdobeSignCallbackRedirectLocation,
  resolveAdobeSignFrontendOrigin,
  validateAdobeSignReturnPath,
} from './read-models/adobe-sign/adobe-sign-oauth-return-path.js';

// ---------------------------------------------------------------------------
// Locked route paths — also asserted from tests so accidental renames break
// CI rather than silently shipping with a wrong path.
// ---------------------------------------------------------------------------

export const ADOBE_SIGN_OAUTH_ROUTE_PATHS = {
  start: 'my-work/me/adobe-sign/oauth/start',
  callback: 'my-work/adobe-sign/oauth/callback',
  disconnect: 'my-work/me/adobe-sign/oauth/disconnect',
} as const;

export const ADOBE_SIGN_OAUTH_ROUTE_NAMES = {
  start: 'startAdobeSignOAuth',
  callback: 'completeAdobeSignOAuthCallback',
  disconnect: 'disconnectAdobeSignOAuth',
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
  readonly resolveRefreshTokenStore: () =>
    | { readonly readiness: 'ready'; readonly store: IAdobeSignRefreshTokenStore }
    | { readonly readiness: 'configuration-required'; readonly reason: string };
  readonly resolveRefreshTokenCipher: () =>
    | { readonly readiness: 'ready'; readonly cipher: AdobeSignRefreshTokenCipher }
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
  resolveRefreshTokenStore: () => resolveAdobeSignRefreshTokenStore(process.env),
  resolveRefreshTokenCipher: () => {
    const keyResolution = resolveAdobeSignRefreshTokenCipherKey(process.env);
    if (keyResolution.status === 'ok') {
      return {
        readiness: 'ready',
        cipher: createAdobeSignRefreshTokenCipher(keyResolution.key),
      };
    }
    return {
      readiness: 'configuration-required',
      reason:
        keyResolution.status === 'configuration-required'
          ? 'missing-encryption-key'
          : `invalid-encryption-key:${keyResolution.reason}`,
    };
  },
  oauthService: createAdobeSignLiveOAuthService({
    governedScopes: parseAdobeSignScopes(process.env.ADOBE_SIGN_OAUTH_SCOPES),
  }),
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

const buildRedirect = (
  env: Record<string, string | undefined>,
  returnPath: string,
  status: CallbackUxStatus,
): HttpResponseInit => {
  const frontendOrigin = resolveAdobeSignFrontendOrigin(env);
  if (!frontendOrigin.ok) {
    return {
      status: 503,
      jsonBody: {
        code: 'CONFIGURATION_REQUIRED',
        message: 'Adobe Sign callback redirect origin is not configured.',
        details: {
          reason: frontendOrigin.reason,
        },
      },
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    };
  }

  const location = buildAdobeSignCallbackRedirectLocation({
    origin: frontendOrigin.origin,
    returnPath,
    status,
  });
  return {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-store, max-age=0',
    },
  };
};

const grantStateForExchange = (exchange: { readonly status: string }): AdobeSignGrantState =>
  exchange.status === 'ok' ? 'active' : 'pending';
const hasNonEmptyValue = (value: string): boolean => value.trim().length > 0;

/**
 * Closed-enum mapping of Adobe's `error` query parameter for the callback.
 * Adobe (and the OAuth 2.0 spec it follows) sends `error=…&state=…` with no
 * `code` when authorization fails — for example on user consent denial,
 * invalid scope, or temporary provider failure. Mapping the raw vendor
 * string to a closed enum keeps telemetry payloads diagnostic without
 * letting arbitrary vendor strings leak into logs.
 */
type AdobeCallbackErrorCode =
  | 'none'
  | 'access_denied'
  | 'invalid_scope'
  | 'invalid_request'
  | 'unauthorized_client'
  | 'unsupported_response_type'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'other';

const classifyAdobeCallbackError = (raw: string): AdobeCallbackErrorCode => {
  const value = raw.trim().toLowerCase();
  if (!value) return 'none';
  switch (value) {
    case 'access_denied':
    case 'invalid_scope':
    case 'invalid_request':
    case 'unauthorized_client':
    case 'unsupported_response_type':
    case 'server_error':
    case 'temporarily_unavailable':
      return value;
    default:
      return 'other';
  }
};

export function createCallbackHandler(deps: AdobeSignOAuthRouteDeps) {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);

    // IMPORTANT: do not log raw query strings.
    const state = request.query.get('state') ?? '';
    const code = request.query.get('code') ?? '';
    const apiAccessPoint = request.query.get('api_access_point') ?? '';
    const webAccessPoint = request.query.get('web_access_point') ?? '';
    const hasApiAccessPoint = hasNonEmptyValue(apiAccessPoint);
    const hasWebAccessPoint = hasNonEmptyValue(webAccessPoint);
    // Adobe's OAuth 2.0 contract returns `error=…&state=…` (no `code`) when
    // authorization fails. We capture the closed-enum classification but
    // never the raw `error_description` value, which is vendor-controlled.
    const rawErrorCode = request.query.get('error') ?? '';
    const errorCode = classifyAdobeCallbackError(rawErrorCode);
    const hasError = errorCode !== 'none';
    const hasErrorDescription = hasNonEmptyValue(request.query.get('error_description') ?? '');
    const env = deps.resolveConfigEnv();

    if (!state || !code) {
      logger.trackEvent('adobeSign.oauth.callback.invalid-input', {
        correlationId: requestId,
        hasState: Boolean(state),
        hasCode: Boolean(code),
        hasError,
        errorCode,
        hasErrorDescription,
      });
      return buildRedirect(
        env,
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.invalidState,
      );
    }

    const configReadiness = resolveAdobeSignOAuthConfigReadiness(env);
    if (!isAdobeSignConfigReady(configReadiness)) {
      logger.trackEvent('adobeSign.oauth.callback.configuration-required', {
        correlationId: requestId,
        status: configReadiness.status,
        missingKeys: configReadiness.missingKeys,
      });
      return buildRedirect(
        env,
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.configurationRequired,
      );
    }

    const stateStore = deps.resolveStateStore();
    const grantStore = deps.resolveGrantStore();
    const refreshTokenStore = deps.resolveRefreshTokenStore();
    const refreshTokenCipher = deps.resolveRefreshTokenCipher();
    if (
      stateStore.readiness !== 'ready' ||
      grantStore.readiness !== 'ready' ||
      refreshTokenStore.readiness !== 'ready' ||
      refreshTokenCipher.readiness !== 'ready'
    ) {
      logger.trackEvent('adobeSign.oauth.callback.store-unavailable', {
        correlationId: requestId,
        stateReady: stateStore.readiness === 'ready',
        grantReady: grantStore.readiness === 'ready',
        refreshTokenStoreReady: refreshTokenStore.readiness === 'ready',
        refreshTokenCipherReady: refreshTokenCipher.readiness === 'ready',
      });
      return buildRedirect(
        env,
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.configurationRequired,
      );
    }

    // Validate Adobe-supplied access points only when present. The live
    // callback contract can provide just code+state; in that case the exchange
    // layer uses a documented fallback endpoint and resolves authoritative
    // access points from the token response.
    const callbackAccessPointShapeInvalid =
      (hasApiAccessPoint && !hasWebAccessPoint) ||
      (!hasApiAccessPoint && hasWebAccessPoint) ||
      (hasApiAccessPoint && !isAllowedAdobeAccessPoint(apiAccessPoint)) ||
      (hasWebAccessPoint && !isAllowedAdobeAccessPoint(webAccessPoint));
    if (callbackAccessPointShapeInvalid) {
      logger.trackEvent('adobeSign.oauth.callback.invalid-access-point', {
        correlationId: requestId,
        callbackHasApiAccessPoint: hasApiAccessPoint,
        callbackHasWebAccessPoint: hasWebAccessPoint,
        apiAccessPointAllowed: hasApiAccessPoint
          ? isAllowedAdobeAccessPoint(apiAccessPoint)
          : false,
        webAccessPointAllowed: hasWebAccessPoint
          ? isAllowedAdobeAccessPoint(webAccessPoint)
          : false,
      });
      return buildRedirect(
        env,
        ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH,
        CALLBACK_UX_STATUS.invalidState,
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
      return buildRedirect(env, ADOBE_SIGN_OAUTH_DEFAULT_RETURN_PATH, mapped);
    }

    const stateRecord = takeResult.record;

    const exchange = await deps.oauthService.exchangeAuthorizationCode({
      authorizationCode: code,
      clientId: env.ADOBE_SIGN_OAUTH_CLIENT_ID as string,
      clientSecret: env.ADOBE_SIGN_OAUTH_CLIENT_SECRET as string,
      redirectUri: env.ADOBE_SIGN_OAUTH_REDIRECT_URI as string,
      ...(hasApiAccessPoint ? { apiAccessPoint: apiAccessPoint.trim() } : {}),
      ...(hasWebAccessPoint ? { webAccessPoint: webAccessPoint.trim() } : {}),
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
        ...(exchange.status === 'unreachable' && exchange.reason
          ? { reason: exchange.reason }
          : {}),
        ...(exchange.status === 'unreachable' && exchange.providerErrorCode
          ? { providerErrorCode: exchange.providerErrorCode }
          : {}),
        ...(exchange.status === 'unreachable' && exchange.exchangeRequestDiagnostics
          ? {
              exchangeEndpointHost: exchange.exchangeRequestDiagnostics.endpointHost,
              exchangeEndpointPath: exchange.exchangeRequestDiagnostics.endpointPath,
              exchangeEndpointSelectionMode:
                exchange.exchangeRequestDiagnostics.endpointSelectionMode,
              exchangeBodyFieldCount: exchange.exchangeRequestDiagnostics.bodyFieldCount,
              exchangeHasGrantTypeField: exchange.exchangeRequestDiagnostics.hasGrantTypeField,
              exchangeHasCodeField: exchange.exchangeRequestDiagnostics.hasCodeField,
              exchangeHasClientIdField: exchange.exchangeRequestDiagnostics.hasClientIdField,
              exchangeHasClientSecretField:
                exchange.exchangeRequestDiagnostics.hasClientSecretField,
              exchangeHasRedirectUriField: exchange.exchangeRequestDiagnostics.hasRedirectUriField,
            }
          : {}),
        callbackHasApiAccessPoint: hasApiAccessPoint,
        callbackHasWebAccessPoint: hasWebAccessPoint,
      });
      return buildRedirect(env, stateRecord.returnPath, mapped);
    }

    // Scope diagnostic — compare configured governed scopes against what
    // Adobe actually granted on this exchange. Safe-by-construction: the
    // helper sanitizes every scope value before emission, and computation
    // is non-throwing. Emitted before refresh-token encryption / grant
    // upsert so the diagnostic is captured even if a downstream store
    // write fails. No control-flow change.
    const scopeDiagnostics = buildAdobeScopeDiagnostics({
      configuredScopes: parseAdobeSignScopes(env.ADOBE_SIGN_OAUTH_SCOPES),
      grantedScopes: exchange.grantedScopes,
      grantedScopeSource: exchange.grantedScopeSource,
    });
    logger.trackEvent('adobeSign.oauth.callback.scope-diagnostics', {
      correlationId: requestId,
      ...scopeDiagnostics,
    });

    const [actorTenantId, actorOid] = stateRecord.actorKey.split('::');

    // Encrypt the refresh-token plaintext via the Prompt-02 AES-256-GCM
    // cipher, then persist the ciphertext envelope so the grant record
    // can reference it opaquely. The plaintext is never persisted nor
    // referenced again after the encrypt call.
    const envelope = refreshTokenCipher.cipher.encrypt(exchange.refreshToken);
    let encryptedRefreshTokenRef;
    try {
      encryptedRefreshTokenRef = await refreshTokenStore.store.putCiphertext(
        stateRecord.actorKey,
        envelope,
        deps.now(),
      );
    } catch {
      logger.trackEvent('adobeSign.oauth.callback.refresh-token-store-write-failed', {
        correlationId: requestId,
      });
      return buildRedirect(env, stateRecord.returnPath, CALLBACK_UX_STATUS.sourceUnavailable);
    }

    const grant: IAdobeSignGrantRecord = {
      actorTenantId,
      actorOid,
      actorKey: stateRecord.actorKey,
      adobeApiAccessPoint: exchange.resolvedApiAccessPoint,
      adobeWebAccessPoint: exchange.resolvedWebAccessPoint,
      encryptedRefreshTokenRef,
      grantedScopes: exchange.grantedScopes,
      grantedAtUtc: deps.now().toISOString(),
      state: grantStateForExchange(exchange),
    };
    try {
      await grantStore.store.upsertGrant(grant);
    } catch {
      logger.trackEvent('adobeSign.oauth.callback.grant-store-write-failed', {
        correlationId: requestId,
      });
      return buildRedirect(env, stateRecord.returnPath, CALLBACK_UX_STATUS.sourceUnavailable);
    }

    logger.trackEvent('adobeSign.oauth.callback.granted', {
      correlationId: requestId,
      grantState: grant.state,
      scopeCount: grant.grantedScopes.length,
      refreshTokenRefStoreKind: encryptedRefreshTokenRef.storeKind,
      endpointSource: exchange.endpointSource,
      callbackHasApiAccessPoint: hasApiAccessPoint,
      callbackHasWebAccessPoint: hasWebAccessPoint,
    });

    return buildRedirect(env, stateRecord.returnPath, CALLBACK_UX_STATUS.success);
  };
}

// ---------------------------------------------------------------------------
// Disconnect route — idempotent soft-deactivate of the authenticated actor's
// stored Adobe Sign grant. Removing the local grant forces a fresh OAuth
// start on the next user interaction and refreshes the scope set against
// the currently configured env scope list. No remote Adobe revocation is
// performed here; only the local grant record is marked `revoked`.
// ---------------------------------------------------------------------------

type DisconnectResultStatus =
  | 'disconnected'
  | 'principal-unresolved'
  | 'source-unavailable'
  | 'configuration-required';

type DisconnectResultStage = 'principal' | 'token-store' | 'complete';

export function createDisconnectHandler(deps: AdobeSignOAuthRouteDeps) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
    auth: { claims: Parameters<typeof normalizeAdobeSignActor>[0]['claims'] },
  ): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);
    const logger = createLogger(context);
    const startedAt = deps.now().getTime();

    const emit = (payload: {
      readonly status: DisconnectResultStatus;
      readonly resultStage: DisconnectResultStage;
      readonly hadExistingGrant?: boolean;
      readonly failureReason?: string;
    }): void => {
      logger.trackEvent('adobeSign.oauth.disconnect.result', {
        correlationId: requestId,
        status: payload.status,
        resultStage: payload.resultStage,
        ...(payload.hadExistingGrant !== undefined
          ? { hadExistingGrant: payload.hadExistingGrant }
          : {}),
        ...(payload.failureReason ? { failureReason: payload.failureReason } : {}),
        durationMs: Math.max(0, deps.now().getTime() - startedAt),
      });
    };

    const actorResult = normalizeAdobeSignActor({
      tenantId: deps.resolveTenantId(),
      claims: auth.claims,
    });
    if (!actorResult.ok) {
      emit({
        status: 'principal-unresolved',
        resultStage: 'principal',
        failureReason: actorResult.reason,
      });
      return errorResponse(
        actorResult.reason === 'app-only' ? 403 : 400,
        'PRINCIPAL_UNRESOLVED',
        'The signed-in identity is not eligible for personal Adobe Sign disconnect.',
        requestId,
        { reason: actorResult.reason },
      );
    }

    const grantStoreResult = deps.resolveGrantStore();
    if (grantStoreResult.readiness !== 'ready') {
      emit({
        status: 'configuration-required',
        resultStage: 'token-store',
        failureReason: grantStoreResult.reason,
      });
      return errorResponse(
        503,
        'CONFIGURATION_REQUIRED',
        'Adobe Sign grant store is not configured.',
        requestId,
        { reason: grantStoreResult.reason },
      );
    }

    let hadExistingGrant = false;
    try {
      const existing = await grantStoreResult.store.findGrant(actorResult.actor.actorKey);
      hadExistingGrant = existing !== undefined && existing.state !== 'revoked';
      if (existing !== undefined) {
        await grantStoreResult.store.markRevoked(
          actorResult.actor.actorKey,
          deps.now().toISOString(),
        );
      }
    } catch {
      emit({
        status: 'source-unavailable',
        resultStage: 'token-store',
        hadExistingGrant,
        failureReason: 'grant-store-write-failed',
      });
      return errorResponse(
        503,
        'SOURCE_UNAVAILABLE',
        'Adobe Sign grant store is temporarily unavailable.',
        requestId,
      );
    }

    emit({
      status: 'disconnected',
      resultStage: 'complete',
      hadExistingGrant,
    });
    return successResponse({ status: 'disconnected' as const });
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

app.http(ADOBE_SIGN_OAUTH_ROUTE_NAMES.disconnect, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_OAUTH_ROUTE_PATHS.disconnect,
  handler: withAuth(
    withTelemetry(createDisconnectHandler(deps), {
      domain: 'my-work-adobe-sign-oauth',
      operation: ADOBE_SIGN_OAUTH_ROUTE_NAMES.disconnect,
    }),
  ),
});
