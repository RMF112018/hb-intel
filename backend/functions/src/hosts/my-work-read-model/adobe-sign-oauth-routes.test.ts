import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adobeSignActorKey } from './read-models/adobe-sign/adobe-sign-actor-normalizer.js';
import {
  createDeterministicMockGrantStore,
  type IAdobeSignGrantStore,
} from './read-models/adobe-sign/adobe-sign-grant-store.js';
import {
  createDeterministicMockOAuthStateStore,
  type IAdobeSignOAuthStateStore,
} from './read-models/adobe-sign/adobe-sign-oauth-state-store.js';
import type {
  IAdobeSignOAuthService,
  AdobeSignTokenExchangeResult,
} from './read-models/adobe-sign/adobe-sign-oauth-service.js';
import type { AdobeSignRefreshTokenCipher } from './read-models/adobe-sign/adobe-sign-refresh-token-crypto.js';
import {
  createDeterministicMockAdobeSignRefreshTokenStore,
  type IAdobeSignRefreshTokenStore,
} from './read-models/adobe-sign/adobe-sign-refresh-token-store.js';

// ---------------------------------------------------------------------------
// Mocks for app.http / withAuth / withTelemetry / request-id / logger so that
// importing the routes module captures registrations and exercises handlers
// without requiring the @azure/functions runtime.
// ---------------------------------------------------------------------------

const registrations: Array<{ name: string; config: any }> = [];

vi.mock('@azure/functions', () => ({
  app: {
    http: (name: string, config: any) => {
      registrations.push({ name, config });
    },
  },
}));

vi.mock('../../middleware/request-id.js', () => ({
  extractOrGenerateRequestId: vi.fn(() => 'req-oauth'),
}));

vi.mock('../../utils/withTelemetry.js', () => ({
  withTelemetry: (handler: any) => handler,
}));

let injectedAuth: { claims: any } = {
  claims: {
    upn: 'avery@hbc.test',
    oid: 'oid-avery',
    roles: [],
    displayName: 'Avery Lead',
  },
};

vi.mock('../../middleware/auth.js', () => ({
  withAuth: (handler: any) => {
    const wrapped = vi.fn((request: any, context: any) => handler(request, context, injectedAuth));
    (wrapped as any).__withAuth = true;
    return wrapped;
  },
}));

vi.mock('../../utils/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: vi.fn(),
    trackMetric: vi.fn(),
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const OID = 'oid-avery';
const ACTOR_KEY = adobeSignActorKey(TENANT_ID, OID);

const FULL_CONFIG_ENV = {
  ADOBE_SIGN_OAUTH_CLIENT_ID: 'client-id-value',
  ADOBE_SIGN_OAUTH_CLIENT_SECRET: 'super-secret-do-not-echo',
  ADOBE_SIGN_OAUTH_REDIRECT_URI: 'https://hb-intel.example.com/api/adobe/callback',
  ADOBE_SIGN_OAUTH_SCOPES: 'agreement_read agreement_send',
  ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
  AZURE_TENANT_ID: TENANT_ID,
  // Prompt-02 storage prerequisites — needed for config readiness to report 'ready'
  // under table-storage mode. Tests inject store/cipher seams directly, so these
  // env values only need to be non-empty.
  AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
  ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'aGFybmVzcy1jaXBoZXItc2VlbS1zZWFtLW5ldmVyLXJlYWQ=',
  MY_DASHBOARD_PUBLIC_ORIGIN: 'https://hedrickbrotherscom.sharepoint.com',
};

const FIXED_NOW = new Date('2026-05-13T12:00:00.000Z');
const fixedDeterministicBytes = (n: number) =>
  Uint8Array.from({ length: n }, (_, i) => (0x10 + i) & 0xff);

interface SeamHandles {
  stateStore: IAdobeSignOAuthStateStore;
  grantStore: IAdobeSignGrantStore;
  refreshTokenStore: IAdobeSignRefreshTokenStore;
  cipher: AdobeSignRefreshTokenCipher & { encryptCalls: string[] };
  service: IAdobeSignOAuthService;
}

const buildRecordingCipher = (): AdobeSignRefreshTokenCipher & { encryptCalls: string[] } => {
  const encryptCalls: string[] = [];
  return {
    encryptCalls,
    encrypt(plaintext) {
      encryptCalls.push(plaintext);
      return {
        cipherVersion: 1,
        iv: 'iv-fixture',
        authTag: 'tag-fixture',
        ciphertext: `ct:${plaintext}`,
      };
    },
    decrypt(env) {
      return env.ciphertext.startsWith('ct:') ? env.ciphertext.slice(3) : '';
    },
  };
};

const buildDeps = (
  overrides: Partial<Awaited<ReturnType<typeof importModule>>['createStartHandler']> = {} as any,
): { deps: any; seams: SeamHandles } => {
  const stateStore = createDeterministicMockOAuthStateStore();
  const grantStore = createDeterministicMockGrantStore();
  const refreshTokenStore = createDeterministicMockAdobeSignRefreshTokenStore();
  const cipher = buildRecordingCipher();
  const exchangeResult: AdobeSignTokenExchangeResult = {
    status: 'ok',
    refreshToken: 'rt-secret',
    accessToken: 'at-secret',
    grantedScopes: ['agreement_read', 'agreement_send'],
    expiresInSeconds: 3600,
  };
  const service: IAdobeSignOAuthService = {
    exchangeAuthorizationCode: vi.fn(async () => exchangeResult),
  };
  return {
    deps: {
      resolveTenantId: () => TENANT_ID,
      resolveConfigEnv: () => FULL_CONFIG_ENV,
      resolveStateStore: () => ({ readiness: 'ready', store: stateStore }),
      resolveGrantStore: () => ({ readiness: 'ready', store: grantStore }),
      resolveRefreshTokenStore: () => ({ readiness: 'ready', store: refreshTokenStore }),
      resolveRefreshTokenCipher: () => ({ readiness: 'ready', cipher }),
      oauthService: service,
      now: () => FIXED_NOW,
      randomBytes: fixedDeterministicBytes,
      ...overrides,
    },
    seams: { stateStore, grantStore, refreshTokenStore, cipher, service },
  };
};

const importModule = async () => import('./adobe-sign-oauth-routes.js');

beforeEach(() => {
  registrations.length = 0;
  injectedAuth = {
    claims: {
      upn: 'avery@hbc.test',
      oid: OID,
      roles: [],
      displayName: 'Avery Lead',
    },
  };
  vi.resetModules();
});

// ---------------------------------------------------------------------------
// Registration shape — locks the exact paths, methods, auth posture
// ---------------------------------------------------------------------------

describe('adobe-sign-oauth-routes — registration shape', () => {
  it('registers exactly two routes — start (POST, /me/) and callback (GET, NOT /me/)', async () => {
    const mod = await importModule();
    expect(registrations).toHaveLength(2);
    const byName = Object.fromEntries(registrations.map((r) => [r.name, r.config]));

    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.start].route).toBe(
      'my-work/me/adobe-sign/oauth/start',
    );
    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.start].methods).toEqual(['POST']);
    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.start].authLevel).toBe('anonymous');
    expect((byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.start].handler as any).__withAuth).toBe(true);

    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.callback].route).toBe(
      'my-work/adobe-sign/oauth/callback',
    );
    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.callback].methods).toEqual(['GET']);
    expect(byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.callback].authLevel).toBe('anonymous');
    expect((byName[mod.ADOBE_SIGN_OAUTH_ROUTE_NAMES.callback].handler as any).__withAuth).toBe(
      undefined,
    );
  });

  it('callback route path is NOT nested under /me/', async () => {
    const mod = await importModule();
    expect(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS.callback).not.toContain('/me/');
    expect(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS.callback.startsWith('my-work/adobe-sign/')).toBe(true);
  });

  it('uses the locked "oauth/start" + "oauth/callback" route slugs (not /authorization/...)', async () => {
    const mod = await importModule();
    expect(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS.start.endsWith('/oauth/start')).toBe(true);
    expect(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS.callback.endsWith('/oauth/callback')).toBe(true);
    for (const path of Object.values(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS)) {
      expect(path).not.toContain('authorization/start');
      expect(path).not.toContain('authorization/callback');
    }
  });
});

// ---------------------------------------------------------------------------
// Start handler behavior
// ---------------------------------------------------------------------------

const startRequest = (body?: unknown) => ({
  method: 'POST',
  url: 'http://localhost/api/my-work/me/adobe-sign/oauth/start',
  query: new URLSearchParams(),
  headers: new Map(),
  text: async () => (body === undefined ? '' : JSON.stringify(body)),
});

describe('start handler', () => {
  it('returns authorization URL and stateExpiresAtUtc on the happy path', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const handler = mod.createStartHandler(deps);

    const response = await handler(
      startRequest({ returnPath: '/SitePages/MyDashboard.aspx' }) as any,
      {} as any,
      injectedAuth as any,
    );

    expect(response.status).toBe(200);
    const body = response.jsonBody as {
      data: { authorizationUrl: string; stateExpiresAtUtc: string };
    };
    expect(
      body.data.authorizationUrl.startsWith('https://secure.adobesign.com/public/oauth/v2?'),
    ).toBe(true);
    // 600s default TTL
    expect(body.data.stateExpiresAtUtc).toBe('2026-05-13T12:10:00.000Z');

    // The state value is encoded into the authorization URL (Adobe needs it
    // to echo back on callback), but the OAuth client secret must never
    // appear anywhere in the response body — that's the actual leak boundary.
    expect(body.data.authorizationUrl).toContain('state=');
    expect(JSON.stringify(body.data)).not.toContain('super-secret-do-not-echo');
    // Response keys are exactly the documented contract — no token / scopes /
    // grant metadata leaks alongside.
    expect(Object.keys(body.data).sort()).toEqual(['authorizationUrl', 'stateExpiresAtUtc']);
    expect(seams.stateStore).toBeDefined();
  });

  it('rejects app-only callers with 403 PRINCIPAL_UNRESOLVED', async () => {
    const mod = await importModule();
    injectedAuth = {
      claims: { upn: '', oid: 'sp-oid', roles: [], idtyp: 'app' },
    };
    const { deps } = buildDeps();
    const handler = mod.createStartHandler(deps);
    const response = await handler(startRequest() as any, {} as any, injectedAuth as any);
    expect(response.status).toBe(403);
    expect((response.jsonBody as any).code).toBe('PRINCIPAL_UNRESOLVED');
    expect((response.jsonBody as any).details.reason).toBe('app-only');
  });

  it('returns 503 CONFIGURATION_REQUIRED when OAuth config is incomplete', async () => {
    const mod = await importModule();
    const { deps } = buildDeps();
    deps.resolveConfigEnv = () => ({});
    const handler = mod.createStartHandler(deps);
    const response = await handler(startRequest() as any, {} as any, injectedAuth as any);
    expect(response.status).toBe(503);
    expect((response.jsonBody as any).code).toBe('CONFIGURATION_REQUIRED');
    expect((response.jsonBody as any).details.missingKeys.length).toBeGreaterThan(0);
  });

  it('returns 503 CONFIGURATION_REQUIRED when the state store is not selected', async () => {
    const mod = await importModule();
    const { deps } = buildDeps();
    deps.resolveStateStore = () => ({
      readiness: 'configuration-required',
      reason: 'production-store-not-selected',
    });
    const handler = mod.createStartHandler(deps);
    const response = await handler(startRequest() as any, {} as any, injectedAuth as any);
    expect(response.status).toBe(503);
    expect((response.jsonBody as any).details.reason).toBe('production-store-not-selected');
  });

  it('rejects a non-allowlisted return path with 400 INVALID_RETURN_PATH', async () => {
    const mod = await importModule();
    const { deps } = buildDeps();
    const handler = mod.createStartHandler(deps);
    const response = await handler(
      startRequest({ returnPath: 'https://evil.example.com/' }) as any,
      {} as any,
      injectedAuth as any,
    );
    expect(response.status).toBe(400);
    expect((response.jsonBody as any).code).toBe('INVALID_RETURN_PATH');
  });

  it('binds the actor strictly to validated claims, ignoring any body-supplied override fields', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const startHandler = mod.createStartHandler(deps);
    const startResp = await startHandler(
      startRequest({
        returnPath: '/SitePages/MyDashboard.aspx',
        actorOid: 'other-user',
        principalName: 'other@example.com',
        oid: 'spoofed-oid',
      }) as any,
      {} as any,
      injectedAuth as any,
    );
    const state = new URL((startResp.jsonBody as any).data.authorizationUrl).searchParams.get(
      'state',
    )!;

    const callback = mod.createCallbackHandler(deps);
    await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );

    // The grant must be keyed to the claims-derived actor, not the body-supplied one.
    const grant = await seams.grantStore.findGrant(ACTOR_KEY);
    expect(grant).toBeDefined();
    expect(grant!.actorOid).toBe(OID);
    expect(
      await seams.grantStore.findGrant(adobeSignActorKey(TENANT_ID, 'other-user')),
    ).toBeUndefined();
    expect(
      await seams.grantStore.findGrant(adobeSignActorKey(TENANT_ID, 'spoofed-oid')),
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Callback handler behavior
// ---------------------------------------------------------------------------

const callbackRequest = (query: Record<string, string>) => ({
  method: 'GET',
  url: 'http://localhost/api/my-work/adobe-sign/oauth/callback',
  query: {
    get: (k: string) => (k in query ? query[k] : null),
  } as any,
  headers: new Map(),
  text: async () => '',
});

const issueState = async (
  mod: Awaited<ReturnType<typeof importModule>>,
  deps: any,
  seams: SeamHandles,
  overrides: Partial<{ returnPath: string }> = {},
) => {
  const startHandler = mod.createStartHandler(deps);
  const startResp = await startHandler(
    startRequest({ returnPath: overrides.returnPath ?? '/SitePages/MyDashboard.aspx' }) as any,
    {} as any,
    injectedAuth as any,
  );
  const url = (startResp.jsonBody as any).data.authorizationUrl as string;
  const state = new URL(url).searchParams.get('state');
  if (!state) throw new Error('expected start handler to issue a state');
  expect(state.length).toBeGreaterThanOrEqual(43);
  return { state, seams };
};

describe('callback handler', () => {
  it('happy path: validates state, exchanges code, persists grant, redirects with success status', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);

    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'auth-code-xyz',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );

    expect(response.status).toBe(302);
    const location = (response.headers as Record<string, string>).Location;
    expect(
      location.startsWith('https://hedrickbrotherscom.sharepoint.com/SitePages/MyDashboard.aspx?'),
    ).toBe(true);
    expect(location).toContain('adobeSignAuthorization=success');
    // No secret values anywhere in the redirect.
    expect(location).not.toContain(state);
    expect(location).not.toContain('auth-code-xyz');
    expect(location).not.toContain('super-secret-do-not-echo');

    const grant = await seams.grantStore.findGrant(ACTOR_KEY);
    expect(grant?.state).toBe('active');
    expect(grant?.grantedScopes).toEqual(['agreement_read', 'agreement_send']);
    expect(grant?.adobeApiAccessPoint).toBe('https://api.na1.adobesign.com');
    // Real encrypted-refresh-token reference replaces the legacy pending-selection placeholder.
    expect(grant?.encryptedRefreshTokenRef.storeKind).toBe('table-storage');
    expect(grant?.encryptedRefreshTokenRef.address.length).toBeGreaterThan(0);
    expect(grant?.encryptedRefreshTokenRef.lastPersistedAtUtc).toBeDefined();
    // The refresh-token plaintext from the exchange is encrypted (and never stored as plaintext).
    expect(seams.cipher.encryptCalls).toEqual(['rt-secret']);
    const persisted = await seams.refreshTokenStore.getCiphertext(grant!.encryptedRefreshTokenRef);
    expect(persisted?.ciphertext).toBe('ct:rt-secret');
  });

  it('rejects missing state with a redirect carrying invalid-state status (no exchange)', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(callbackRequest({ code: 'c' }) as any, {} as any);
    expect(response.status).toBe(302);
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=invalid-state',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('rejects unknown state with invalid-state and does not exchange', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({ state: 'never-issued', code: 'c' }) as any,
      {} as any,
    );
    expect(response.status).toBe(302);
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=invalid-state',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('rejects expired state with expired-state and does not exchange', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);
    // Advance the clock past expiry for the callback.
    deps.now = () => new Date('2026-05-13T12:30:00.000Z');
    const callback = mod.createCallbackHandler(deps);
    // Valid access points required to reach the state-validation branch — the
    // Prompt-03 access-point allow-list pre-empts state consumption when forged.
    const response = await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect(response.status).toBe(302);
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=expired-state',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('rejects re-use of a previously consumed state', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);

    const first = await callback(
      callbackRequest({
        state,
        code: 'c1',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((first.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=success',
    );

    const second = await callback(
      callbackRequest({
        state,
        code: 'c2',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((second.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=consumed-state',
    );
    // The exchange service must have been called exactly once.
    expect((seams.service.exchangeAuthorizationCode as any).mock.calls.length).toBe(1);
  });

  it('treats exchange unreachable as source-unavailable and does not store a grant', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    (seams.service.exchangeAuthorizationCode as any).mockResolvedValueOnce({
      status: 'unreachable',
      reason: 'connect-timeout',
    });
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=source-unavailable',
    );
    expect(await seams.grantStore.findGrant(ACTOR_KEY)).toBeUndefined();
  });

  it('never echoes raw query values into the redirect Location', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'sensitive-code-value',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    const location = (response.headers as Record<string, string>).Location;
    expect(location).not.toContain('sensitive-code-value');
    expect(location).not.toContain(state);
  });

  it('rejects a non-allow-listed api_access_point with invalid-state and never exchanges', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'https://attacker.example.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=invalid-state',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
    expect(await seams.grantStore.findGrant(ACTOR_KEY)).toBeUndefined();
    expect(seams.cipher.encryptCalls).toEqual([]);
  });

  it('rejects a non-HTTPS api_access_point with invalid-state and never exchanges', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'http://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=invalid-state',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('redirects configuration-required when the refresh-token store is not ready', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    deps.resolveRefreshTokenStore = () => ({
      readiness: 'configuration-required',
      reason: 'missing-table-endpoint',
    });
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state: 'state-arbitrary',
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=configuration-required',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('redirects configuration-required when the refresh-token cipher is not ready', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    deps.resolveRefreshTokenCipher = () => ({
      readiness: 'configuration-required',
      reason: 'missing-encryption-key',
    });
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state: 'state-arbitrary',
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=configuration-required',
    );
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('does not encrypt or persist anything when the code exchange fails', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    (seams.service.exchangeAuthorizationCode as any).mockResolvedValueOnce({
      status: 'invalid-code',
    });
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'bad-code',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect((response.headers as Record<string, string>).Location).toContain(
      'adobeSignAuthorization=invalid-grant',
    );
    expect(seams.cipher.encryptCalls).toEqual([]);
    expect(await seams.grantStore.findGrant(ACTOR_KEY)).toBeUndefined();
    expect(
      await seams.refreshTokenStore.getCiphertext({
        storeKind: 'table-storage',
        address: ACTOR_KEY,
      }),
    ).toBeUndefined();
  });

  it('returns CONFIGURATION_REQUIRED when MY_DASHBOARD_PUBLIC_ORIGIN is missing', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    deps.resolveConfigEnv = () => {
      const { MY_DASHBOARD_PUBLIC_ORIGIN: _, ...rest } = FULL_CONFIG_ENV;
      return rest;
    };
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(callbackRequest({ code: 'c' }) as any, {} as any);
    expect(response.status).toBe(503);
    expect((response.jsonBody as any).code).toBe('CONFIGURATION_REQUIRED');
    expect((response.jsonBody as any).details.reason).toBe('missing');
    expect((response.headers as Record<string, string>).Location).toBeUndefined();
    expect(seams.service.exchangeAuthorizationCode).not.toHaveBeenCalled();
  });

  it('returns CONFIGURATION_REQUIRED when MY_DASHBOARD_PUBLIC_ORIGIN is invalid', async () => {
    const mod = await importModule();
    const { deps, seams } = buildDeps();
    deps.resolveConfigEnv = () => ({
      ...FULL_CONFIG_ENV,
      MY_DASHBOARD_PUBLIC_ORIGIN: 'http://insecure.example.com/path',
    });
    const { state } = await issueState(mod, deps, seams);
    const callback = mod.createCallbackHandler(deps);
    const response = await callback(
      callbackRequest({
        state,
        code: 'c',
        api_access_point: 'https://api.na1.adobesign.com',
        web_access_point: 'https://secure.na1.adobesign.com',
      }) as any,
      {} as any,
    );
    expect(response.status).toBe(503);
    expect((response.jsonBody as any).code).toBe('CONFIGURATION_REQUIRED');
    expect((response.jsonBody as any).details.reason).toBe('not-https');
    expect((response.headers as Record<string, string>).Location).toBeUndefined();
    expect(seams.service.exchangeAuthorizationCode).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Documentation alignment: the constants exported here must equal the paths
// referenced in the OAuth posture (start under /me/, callback NOT under /me/).
// ---------------------------------------------------------------------------

describe('locked-path documentation alignment', () => {
  it('matches the locked B05 OAuth route contract', async () => {
    const mod = await importModule();
    expect(mod.ADOBE_SIGN_OAUTH_ROUTE_PATHS).toEqual({
      start: 'my-work/me/adobe-sign/oauth/start',
      callback: 'my-work/adobe-sign/oauth/callback',
    });
  });
});
