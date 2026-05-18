import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import {
  MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS,
  type ResolveAdobeSignActionLinkRequest,
  type AdobeSignActionLinkResolveResult,
} from '@hbc/models/myWork';

import { withAuth, type AuthContext } from '../../middleware/auth.js';
import { withTelemetry } from '../../utils/withTelemetry.js';
import { createLogger } from '../../utils/logger.js';
import {
  createAdobeSignRefreshTokenCipher,
  resolveAdobeSignRefreshTokenCipherKey,
} from './read-models/adobe-sign/adobe-sign-refresh-token-crypto.js';
import { resolveAdobeSignRefreshTokenStore } from './read-models/adobe-sign/adobe-sign-refresh-token-store.js';
import { createAdobeSignLiveRefreshClient } from './read-models/adobe-sign/adobe-sign-live-refresh-client.js';
import { createAdobeSignTokenService } from './read-models/adobe-sign/adobe-sign-token-service.js';
import type { IAdobeSignTokenService } from './read-models/adobe-sign/adobe-sign-token-service.js';
import { normalizeAdobeSignActor } from './read-models/adobe-sign/adobe-sign-actor-normalizer.js';
import type { AdobeSignDelegatedActor } from './read-models/adobe-sign/adobe-sign-actor-normalizer.js';
import { resolveAdobeSignGrantStore } from './read-models/adobe-sign/adobe-sign-grant-store.js';
import {
  createAdobeSignLiveActionLinkClient,
  type AdobeSignLiveActionLinkClientDeps,
} from './read-models/adobe-sign/adobe-sign-live-action-link-client.js';
import { parseAdobeSignScopes } from './read-models/adobe-sign/adobe-sign-config.js';
import type {
  AdobeSignActionLinkClientResult,
  IAdobeSignActionLinkClient,
} from './read-models/adobe-sign/adobe-sign-action-link-client.js';
import { evaluateAdobeSignActionHandoff } from './read-models/adobe-sign/adobe-sign-action-handoff-policy.js';

export const ADOBE_SIGN_ACTION_LINK_ROUTE_PATH = 'my-work/me/adobe-sign/action-link/resolve' as const;
export const ADOBE_SIGN_ACTION_LINK_ROUTE_NAME = 'resolveAdobeSignActionLink' as const;

const REQUIRED_ACTIONS = new Set<string>(MY_WORK_ADOBE_SIGN_REQUIRED_ACTIONS);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function validateResolveRequest(value: unknown): value is ResolveAdobeSignActionLinkRequest {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== 'agreementId' ||
    keys[1] !== 'itemId' ||
    keys[2] !== 'requiredAction'
  ) {
    return false;
  }
  if (!isNonEmptyString(value.itemId) || !isNonEmptyString(value.agreementId)) {
    return false;
  }
  if (typeof value.requiredAction !== 'string') {
    return false;
  }
  return REQUIRED_ACTIONS.has(value.requiredAction);
}

async function readResolveRequestBody(
  request: HttpRequest,
): Promise<ResolveAdobeSignActionLinkRequest | undefined> {
  try {
    const text = await request.text();
    if (text.trim().length === 0) {
      return undefined;
    }
    const parsed = JSON.parse(text) as unknown;
    if (!validateResolveRequest(parsed)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export interface AdobeSignActionLinkRouteDeps {
  readonly resolveTenantId: () => string | undefined;
  readonly tokenService: IAdobeSignTokenService;
  readonly actionLinkClient: IAdobeSignActionLinkClient;
  readonly now: () => Date;
  readonly trackEvent?: (name: string, properties: Record<string, unknown>) => void;
}

function mapProviderToRouteResult(result: AdobeSignActionLinkClientResult): AdobeSignActionLinkResolveResult {
  switch (result.status) {
    case 'ok':
      return { status: 'redirect-ready', redirectUrl: result.redirectUrl };
    case 'unauthorized':
      return { status: 'authorization-required' };
    case 'not-ready':
      return { status: 'not-ready' };
    case 'no-action-url':
      return { status: 'no-action-url' };
    case 'no-recipient-match':
      return { status: 'no-action-url' };
    case 'rate-limited':
      return { status: 'rate-limited' };
    case 'unreachable':
      return { status: 'source-unavailable' };
  }
}

type ResolveResultStage = 'invalid-input' | 'principal' | 'token' | 'provider' | 'policy' | 'completed';
type ResolveSelectedBy = 'actor-match' | 'single-candidate' | 'none';
type ResolvePolicyDecision = 'allowed' | 'rejected' | 'omitted';

function emitResolveResultTelemetry(input: {
  readonly trackEvent: (name: string, properties: Record<string, unknown>) => void;
  readonly result: AdobeSignActionLinkResolveResult;
  readonly resultStage: ResolveResultStage;
  readonly requiredAction: string;
  readonly hasAgreementId: boolean;
  readonly hasItemId: boolean;
  readonly startedAtMs: number;
  readonly providerStatusCode?: number;
  readonly urlCandidateCount?: number;
  readonly selectedBy?: ResolveSelectedBy;
  readonly policyDecision?: ResolvePolicyDecision;
  readonly failureReason?: string;
}): void {
  input.trackEvent('adobeSign.actionLink.resolve.result', {
    domain: 'my-work-adobe-sign-action-link',
    operation: 'resolve',
    status: input.result.status,
    resultStage: input.resultStage,
    requiredAction: input.requiredAction,
    hasAgreementId: input.hasAgreementId,
    hasItemId: input.hasItemId,
    ...(typeof input.providerStatusCode === 'number'
      ? { providerStatusCode: input.providerStatusCode }
      : {}),
    ...(typeof input.urlCandidateCount === 'number'
      ? { urlCandidateCount: input.urlCandidateCount }
      : {}),
    selectedBy: input.selectedBy ?? 'none',
    policyDecision: input.policyDecision ?? 'omitted',
    ...(input.failureReason ? { failureReason: input.failureReason } : {}),
    durationMs: Math.max(0, Date.now() - input.startedAtMs),
  });
}

export function createAdobeSignActionLinkResolveHandler(deps: AdobeSignActionLinkRouteDeps) {
  return async (
    request: HttpRequest,
    context: InvocationContext,
    auth: AuthContext,
  ): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const trackEvent =
      deps.trackEvent ??
      ((name: string, properties: Record<string, unknown>) => logger.trackEvent(name, properties));

    trackEvent('adobeSign.actionLink.resolve.attempt', {
      domain: 'my-work-adobe-sign-action-link',
      operation: 'resolve',
    });
    const startedAtMs = Date.now();

    const parsed = await readResolveRequestBody(request);
    if (!parsed) {
      const result = { status: 'invalid-input' } as const;
      trackEvent('adobeSign.actionLink.resolve.failure', {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      });
      emitResolveResultTelemetry({
        trackEvent,
        result,
        resultStage: 'invalid-input',
        requiredAction: 'unknown',
        hasAgreementId: false,
        hasItemId: false,
        startedAtMs,
        failureReason: 'invalid-input',
      });
      return { status: 400, jsonBody: { data: result } };
    }

    const actorResult = normalizeAdobeSignActor({
      tenantId: deps.resolveTenantId(),
      claims: auth.claims,
    });
    if (!actorResult.ok) {
      const result = { status: 'principal-unresolved' } as const;
      trackEvent('adobeSign.actionLink.resolve.failure', {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      });
      emitResolveResultTelemetry({
        trackEvent,
        result,
        resultStage: 'principal',
        requiredAction: parsed.requiredAction,
        hasAgreementId: true,
        hasItemId: true,
        startedAtMs,
        failureReason: actorResult.reason,
      });
      return { status: 200, jsonBody: { data: result } };
    }

    const actor: AdobeSignDelegatedActor = actorResult.actor;
    const token = await deps.tokenService.getAccessToken(actor.actorKey, deps.now());
    if (token.status === 'authorization-required') {
      const result = { status: 'authorization-required' } as const;
      trackEvent('adobeSign.actionLink.resolve.failure', {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      });
      emitResolveResultTelemetry({
        trackEvent,
        result,
        resultStage: 'token',
        requiredAction: parsed.requiredAction,
        hasAgreementId: true,
        hasItemId: true,
        startedAtMs,
        failureReason: token.reason,
      });
      return { status: 200, jsonBody: { data: result } };
    }
    if (token.status === 'scope-insufficient') {
      const result = { status: 'scope-insufficient' } as const;
      trackEvent('adobeSign.actionLink.resolve.failure', {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      });
      emitResolveResultTelemetry({
        trackEvent,
        result,
        resultStage: 'token',
        requiredAction: parsed.requiredAction,
        hasAgreementId: true,
        hasItemId: true,
        startedAtMs,
        failureReason: token.reason,
      });
      return { status: 200, jsonBody: { data: result } };
    }
    if (token.status === 'source-unavailable') {
      const result = { status: 'source-unavailable' } as const;
      trackEvent('adobeSign.actionLink.resolve.failure', {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      });
      emitResolveResultTelemetry({
        trackEvent,
        result,
        resultStage: 'token',
        requiredAction: parsed.requiredAction,
        hasAgreementId: true,
        hasItemId: true,
        startedAtMs,
        failureReason: token.reason,
      });
      return { status: 200, jsonBody: { data: result } };
    }

    const providerResult = await deps.actionLinkClient.resolveActionLink({
      actor,
      agreementId: parsed.agreementId,
      accessToken: token.accessToken,
      apiAccessPoint: token.apiAccessPoint,
    });

    let result = mapProviderToRouteResult(providerResult);
    let policyDecision: ResolvePolicyDecision = 'omitted';
    const selectedBy: ResolveSelectedBy =
      providerResult.status === 'ok' ? providerResult.selectedBy : 'none';
    const urlCandidateCount =
      providerResult.status === 'ok' ||
      providerResult.status === 'no-action-url' ||
      providerResult.status === 'no-recipient-match'
        ? providerResult.urlCandidateCount
        : undefined;
    const providerStatusCode =
      providerResult.status === 'unreachable' ? providerResult.providerStatusCode : undefined;
    const failureReason =
      providerResult.status === 'unreachable'
        ? providerResult.reason
        : providerResult.status === 'no-recipient-match'
          ? 'candidate-selection-failure'
          : providerResult.status === 'no-action-url'
            ? 'no-action-url'
            : providerResult.status === 'not-ready'
              ? 'not-ready'
              : providerResult.status === 'rate-limited'
                ? 'rate-limited'
                : providerResult.status === 'unauthorized'
                  ? 'authorization-required'
                  : undefined;
    if (result.status === 'redirect-ready') {
      const policy = evaluateAdobeSignActionHandoff(result.redirectUrl);
      if (policy.status === 'allowed') {
        result = { status: 'redirect-ready', redirectUrl: policy.redirectUrl };
        policyDecision = 'allowed';
      } else {
        result = { status: 'policy-rejected' };
        policyDecision = 'rejected';
      }
    }

    trackEvent(
      result.status === 'redirect-ready'
        ? 'adobeSign.actionLink.resolve.success'
        : 'adobeSign.actionLink.resolve.failure',
      {
        domain: 'my-work-adobe-sign-action-link',
        operation: 'resolve',
        status: result.status,
      },
    );
    emitResolveResultTelemetry({
      trackEvent,
      result,
      resultStage: result.status === 'policy-rejected' ? 'policy' : 'provider',
      requiredAction: parsed.requiredAction,
      hasAgreementId: true,
      hasItemId: true,
      startedAtMs,
      providerStatusCode,
      urlCandidateCount,
      selectedBy,
      policyDecision,
      failureReason: result.status === 'policy-rejected' ? 'policy-rejected' : failureReason,
    });

    return { status: 200, jsonBody: { data: result } };
  };
}

function buildDefaultTokenService(): IAdobeSignTokenService {
  const grantStoreReadiness = resolveAdobeSignGrantStore(process.env);
  const refreshStoreReadiness = resolveAdobeSignRefreshTokenStore(process.env);
  const keyResolution = resolveAdobeSignRefreshTokenCipherKey(process.env);

  if (
    grantStoreReadiness.readiness !== 'ready' ||
    refreshStoreReadiness.readiness !== 'ready' ||
    keyResolution.status !== 'ok' ||
    typeof process.env.ADOBE_SIGN_OAUTH_CLIENT_ID !== 'string' ||
    process.env.ADOBE_SIGN_OAUTH_CLIENT_ID.length === 0 ||
    typeof process.env.ADOBE_SIGN_OAUTH_CLIENT_SECRET !== 'string' ||
    process.env.ADOBE_SIGN_OAUTH_CLIENT_SECRET.length === 0
  ) {
    return {
      async getAccessToken() {
        return { status: 'authorization-required', reason: 'no-grant-found' } as const;
      },
    };
  }

  const refreshClient = createAdobeSignLiveRefreshClient({
    clientId: process.env.ADOBE_SIGN_OAUTH_CLIENT_ID,
    clientSecret: process.env.ADOBE_SIGN_OAUTH_CLIENT_SECRET,
    refreshTokenStore: refreshStoreReadiness.store,
    cipher: createAdobeSignRefreshTokenCipher(keyResolution.key),
  });

  return createAdobeSignTokenService({
    grantStore: grantStoreReadiness.store,
    refreshClient,
    governedScopes: parseAdobeSignScopes(process.env.ADOBE_SIGN_OAUTH_SCOPES),
  });
}

function buildDefaultRouteDeps(liveClientDeps?: AdobeSignLiveActionLinkClientDeps): AdobeSignActionLinkRouteDeps {
  return {
    resolveTenantId: () => process.env.AZURE_TENANT_ID,
    tokenService: buildDefaultTokenService(),
    actionLinkClient: createAdobeSignLiveActionLinkClient(liveClientDeps),
    now: () => new Date(),
  };
}

app.http(ADOBE_SIGN_ACTION_LINK_ROUTE_NAME, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_ACTION_LINK_ROUTE_PATH,
  handler: withAuth(
    withTelemetry(createAdobeSignActionLinkResolveHandler(buildDefaultRouteDeps()), {
      domain: 'my-work-adobe-sign-action-link',
      operation: 'resolve',
    }),
  ),
});
