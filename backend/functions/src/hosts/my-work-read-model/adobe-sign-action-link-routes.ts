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
import type {
  AdobeSignActionLinkClientResult,
  IAdobeSignActionLinkClient,
} from './read-models/adobe-sign/adobe-sign-action-link-client.js';

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

export function createAdobeSignActionLinkResolveHandler(deps: AdobeSignActionLinkRouteDeps) {
  return async (
    request: HttpRequest,
    _context: InvocationContext,
    auth: AuthContext,
  ): Promise<HttpResponseInit> => {
    const parsed = await readResolveRequestBody(request);
    if (!parsed) {
      return { status: 400, jsonBody: { data: { status: 'invalid-input' satisfies AdobeSignActionLinkResolveResult['status'] } } };
    }

    const actorResult = normalizeAdobeSignActor({
      tenantId: deps.resolveTenantId(),
      claims: auth.claims,
    });
    if (!actorResult.ok) {
      return { status: 200, jsonBody: { data: { status: 'principal-unresolved' } } };
    }

    const actor: AdobeSignDelegatedActor = actorResult.actor;
    const token = await deps.tokenService.getAccessToken(actor.actorKey, deps.now());
    if (token.status === 'authorization-required') {
      return { status: 200, jsonBody: { data: { status: 'authorization-required' } } };
    }
    if (token.status === 'source-unavailable') {
      return { status: 200, jsonBody: { data: { status: 'source-unavailable' } } };
    }

    const providerResult = await deps.actionLinkClient.resolveActionLink({
      actor,
      agreementId: parsed.agreementId,
      accessToken: token.accessToken,
      apiAccessPoint: token.apiAccessPoint,
    });

    return { status: 200, jsonBody: { data: mapProviderToRouteResult(providerResult) } };
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
