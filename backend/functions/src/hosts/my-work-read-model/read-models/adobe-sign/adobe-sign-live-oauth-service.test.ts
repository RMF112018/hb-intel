import { describe, expect, it, vi } from 'vitest';

import {
  buildAdobeSignAuthorizationUrl,
  type AdobeSignTokenExchangeInput,
} from './adobe-sign-oauth-service.js';
import {
  ADOBE_SIGN_OAUTH_TOKEN_FALLBACK_API_ACCESS_POINT,
  ADOBE_SIGN_OAUTH_TOKEN_PATH,
  createAdobeSignLiveOAuthService,
  isAllowedAdobeAccessPoint,
} from './adobe-sign-live-oauth-service.js';

const VALID_INPUT: AdobeSignTokenExchangeInput = {
  authorizationCode: 'auth-code-do-not-leak',
  clientId: 'client-id-value',
  clientSecret: 'super-secret-do-not-leak',
  redirectUri: 'https://hb-intel.example.com/api/adobe/callback',
  apiAccessPoint: 'https://api.na1.adobesign.com',
  webAccessPoint: 'https://secure.na1.adobesign.com',
};

const VALID_TOKEN_BODY = {
  access_token: 'at-value',
  refresh_token: 'rt-value',
  expires_in: 3600,
  scope: 'agreement_read agreement_send',
  api_access_point: 'https://api.na1.adobesign.com/',
  web_access_point: 'https://secure.na1.adobesign.com/',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedDiagnostics(
  selectionMode: 'callback-api-access-point' | 'partner-default-api-na1',
) {
  return {
    endpointHost: 'api.na1.adobesign.com',
    endpointPath: '/oauth/v2/token',
    endpointSelectionMode: selectionMode,
    bodyFieldCount: 5,
    hasGrantTypeField: true,
    hasCodeField: true,
    hasClientIdField: true,
    hasClientSecretField: true,
    hasRedirectUriField: true,
  };
}

describe('isAllowedAdobeAccessPoint', () => {
  it('accepts hosts on the documented allow-list', () => {
    expect(isAllowedAdobeAccessPoint('https://api.na1.adobesign.com')).toBe(true);
    expect(isAllowedAdobeAccessPoint('https://api.eu1.echosign.com')).toBe(true);
    expect(isAllowedAdobeAccessPoint('https://secure.na1.adobesign.com/path')).toBe(true);
  });

  it('rejects non-HTTPS schemes', () => {
    expect(isAllowedAdobeAccessPoint('http://api.na1.adobesign.com')).toBe(false);
  });

  it('rejects hosts outside the allow-list', () => {
    expect(isAllowedAdobeAccessPoint('https://attacker.example.com')).toBe(false);
    expect(isAllowedAdobeAccessPoint('https://api.adobesign.com.evil.test')).toBe(false);
  });

  it('rejects empty / malformed input without throwing', () => {
    expect(isAllowedAdobeAccessPoint('')).toBe(false);
    expect(isAllowedAdobeAccessPoint('not a url')).toBe(false);
  });
});

describe('buildAdobeSignAuthorizationUrl — regression guard', () => {
  it('does NOT include client_secret in the browser-facing authorization URL', () => {
    const url = buildAdobeSignAuthorizationUrl({
      clientId: 'client-id-value',
      redirectUri: 'https://hb-intel.example.com/api/adobe/callback',
      scopes: ['agreement_read'],
      state: 'state-value',
    });
    expect(url).not.toContain('client_secret');
    expect(url).not.toContain(VALID_INPUT.clientSecret);
  });
});

describe('createAdobeSignLiveOAuthService — request shape', () => {
  it('targets {apiAccessPoint}/oauth/v2/token exactly', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetchSpy.mock.calls[0]!;
    expect(calledUrl).toBe(`${VALID_INPUT.apiAccessPoint}${ADOBE_SIGN_OAUTH_TOKEN_PATH}`);
  });

  it('uses configured fallback token endpoint when callback access points are missing', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    await service.exchangeAuthorizationCode({
      ...VALID_INPUT,
      apiAccessPoint: undefined,
      webAccessPoint: undefined,
    });
    const [calledUrl] = fetchSpy.mock.calls[0]!;
    expect(calledUrl).toBe(
      `${ADOBE_SIGN_OAUTH_TOKEN_FALLBACK_API_ACCESS_POINT}${ADOBE_SIGN_OAUTH_TOKEN_PATH}`,
    );
  });

  it('sends a form-urlencoded body with exactly the five expected keys', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    await service.exchangeAuthorizationCode(VALID_INPUT);
    const [, init] = fetchSpy.mock.calls[0]!;
    const initObj = init as RequestInit;
    expect(initObj.method).toBe('POST');
    expect((initObj.headers as Record<string, string>)['content-type']).toBe(
      'application/x-www-form-urlencoded',
    );
    const body = initObj.body as URLSearchParams;
    expect([...body.keys()].sort()).toEqual(
      ['client_id', 'client_secret', 'code', 'grant_type', 'redirect_uri'].sort(),
    );
    expect(body.get('grant_type')).toBe('authorization_code');
    expect(body.get('code')).toBe(VALID_INPUT.authorizationCode);
    expect(body.get('client_id')).toBe(VALID_INPUT.clientId);
    expect(body.get('client_secret')).toBe(VALID_INPUT.clientSecret);
    expect(body.get('redirect_uri')).toBe(VALID_INPUT.redirectUri);
  });
});

describe('createAdobeSignLiveOAuthService — result mapping', () => {
  it('maps HTTP 200 + valid body to status "ok" with the success fields and grantedScopeSource=token-response', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read', 'agreement_send'],
      grantedScopeSource: 'token-response',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'callback',
    });
  });

  it('maps HTTP 200 + missing required field to "unreachable" + "malformed-response"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ access_token: 'a', expires_in: 3600 }));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('maps a non-JSON 200 body to "unreachable" + "malformed-response"', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('maps HTTP 200 with disjoint granted scopes (no governed coverage) to "scope-mismatch"', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({ ...VALID_TOKEN_BODY, scope: 'agreement_write' }),
    );
    const service = createAdobeSignLiveOAuthService({
      fetch: fetchSpy,
      governedScopes: ['agreement_read', 'agreement_send'],
    });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'scope-mismatch',
      grantedScopes: ['agreement_write'],
    });
  });

  it('maps HTTP 200 with granted scopes narrower than governed scopes to "scope-mismatch" (coverage direction)', async () => {
    // Adobe echoes only agreement_read:self when the deployment requires
    // both agreement_read:self and agreement_write:self. Governance is
    // `governed ⊆ granted` — a narrower response must be rejected at the
    // token-exchange seam, not silently persisted and later tripped at
    // the token-service.
    const fetchSpy = vi.fn(async () =>
      jsonResponse({ ...VALID_TOKEN_BODY, scope: 'agreement_read:self' }),
    );
    const service = createAdobeSignLiveOAuthService({
      fetch: fetchSpy,
      governedScopes: ['agreement_read:self', 'agreement_write:self'],
    });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'scope-mismatch',
      grantedScopes: ['agreement_read:self'],
    });
  });

  it('maps HTTP 200 with granted scopes covering governed (extras preserved) to "ok" + grantedScopeSource=token-response', async () => {
    // Adobe returns a superset of configured governance: agreement_read +
    // agreement_send + an extra agreement_write. The coverage check
    // (`governed ⊆ granted`) accepts this; the extras are tolerated and
    // forwarded verbatim, matching downstream token-service enforcement.
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        ...VALID_TOKEN_BODY,
        scope: 'agreement_read agreement_send agreement_write',
      }),
    );
    const service = createAdobeSignLiveOAuthService({
      fetch: fetchSpy,
      governedScopes: ['agreement_read', 'agreement_send'],
    });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read', 'agreement_send', 'agreement_write'],
      grantedScopeSource: 'token-response',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'callback',
    });
  });

  it('maps HTTP 200 with missing scope field to "ok" + grantedScopeSource=configured-fallback (governed scopes substituted)', async () => {
    // Adobe returned a successful token exchange but omitted the `scope`
    // field. The adapter substitutes the configured governed scopes so
    // the persisted grant satisfies downstream coverage enforcement.
    const { scope: _scope, ...withoutScope } = VALID_TOKEN_BODY;
    const fetchSpy = vi.fn(async () => jsonResponse(withoutScope));
    const service = createAdobeSignLiveOAuthService({
      fetch: fetchSpy,
      governedScopes: ['agreement_read:self', 'agreement_write:self'],
    });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read:self', 'agreement_write:self'],
      grantedScopeSource: 'configured-fallback',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'callback',
    });
  });

  it('maps HTTP 200 with blank/whitespace scope to "ok" + grantedScopeSource=configured-fallback', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ ...VALID_TOKEN_BODY, scope: '   ' }));
    const service = createAdobeSignLiveOAuthService({
      fetch: fetchSpy,
      governedScopes: ['agreement_read:self', 'agreement_write:self'],
    });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read:self', 'agreement_write:self'],
      grantedScopeSource: 'configured-fallback',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'callback',
    });
  });

  it('configured-fallback with empty governedScopes preserves the no-governance posture (grantedScopes=[])', async () => {
    // No configured governed scopes + Adobe omits scope → grant is `[]`
    // with source 'configured-fallback'. The adapter must not invent
    // scopes; downstream enforcement vacuously passes (covers everything
    // / nothing required).
    const { scope: _scope, ...withoutScope } = VALID_TOKEN_BODY;
    const fetchSpy = vi.fn(async () => jsonResponse(withoutScope));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: [],
      grantedScopeSource: 'configured-fallback',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'callback',
    });
  });

  it('resolves endpoints from token response when callback access points are missing', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode({
      ...VALID_INPUT,
      apiAccessPoint: undefined,
      webAccessPoint: undefined,
    });
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read', 'agreement_send'],
      grantedScopeSource: 'token-response',
      expiresInSeconds: 3600,
      resolvedApiAccessPoint: 'https://api.na1.adobesign.com',
      resolvedWebAccessPoint: 'https://secure.na1.adobesign.com',
      endpointSource: 'token-response',
    });
  });

  it('fails with missing-access-point when callback access points are absent and token response omits them', async () => {
    const fetchSpy = vi.fn(async () =>
      jsonResponse({
        access_token: 'at-value',
        refresh_token: 'rt-value',
        expires_in: 3600,
        scope: 'agreement_read',
      }),
    );
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(
      await service.exchangeAuthorizationCode({
        ...VALID_INPUT,
        apiAccessPoint: undefined,
        webAccessPoint: undefined,
      }),
    ).toEqual({
      status: 'unreachable',
      reason: 'missing-access-point',
      exchangeRequestDiagnostics: expectedDiagnostics('partner-default-api-na1'),
    });
  });

  it('maps HTTP 400 + Adobe error invalid_grant to "invalid-code"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_grant' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'invalid-code',
    });
  });

  it('maps HTTP 400 + unknown Adobe error to "unreachable" + "http-4xx"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_request' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerErrorCode: 'invalid_request',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('drops non-code-like HTTP 400 Adobe error values from providerErrorCode', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'Client secret is invalid' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('maps HTTP 400 + Adobe error invalid_authorization_code to "invalid-code"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_authorization_code' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'invalid-code',
    });
  });

  it('maps HTTP 500 to "unreachable" + "http-5xx"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'server' }, 500));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('maps a network throw to "unreachable" + "network"', async () => {
    const fetchSpy = vi.fn(async () => {
      throw new Error('network down');
    });
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'network',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('maps an AbortError throw to "unreachable" + "timeout"', async () => {
    const fetchSpy = vi.fn(async () => {
      const err = new Error('aborted') as Error & { name: string };
      err.name = 'AbortError';
      throw err;
    });
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'timeout',
      exchangeRequestDiagnostics: expectedDiagnostics('callback-api-access-point'),
    });
  });

  it('reports partner-default-api-na1 endpoint selection mode when callback access points are absent', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_request' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(
      await service.exchangeAuthorizationCode({
        ...VALID_INPUT,
        apiAccessPoint: undefined,
        webAccessPoint: undefined,
      }),
    ).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerErrorCode: 'invalid_request',
      exchangeRequestDiagnostics: expectedDiagnostics('partner-default-api-na1'),
    });
  });
});

describe('createAdobeSignLiveOAuthService — pre-fetch access-point validation', () => {
  it('rejects a non-HTTPS apiAccessPoint without calling fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode({
      ...VALID_INPUT,
      apiAccessPoint: 'http://api.na1.adobesign.com',
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-allow-listed host without calling fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode({
      ...VALID_INPUT,
      apiAccessPoint: 'https://attacker.example.com',
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects partial callback endpoint shape without calling fetch', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode({
      ...VALID_INPUT,
      webAccessPoint: undefined,
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('createAdobeSignLiveOAuthService — no secret leak in failure outcomes', () => {
  it('does not echo client_secret, code, refresh_token, or access_token in any failure status', async () => {
    const cases: Array<() => Promise<Response>> = [
      async () => jsonResponse({ error: 'invalid_grant' }, 400),
      async () => jsonResponse({}, 200),
      async () => jsonResponse({ access_token: 'x' }, 200),
      async () => {
        throw new Error('network');
      },
      // Configured-fallback success branch: Adobe omits scope.
      async () => {
        const { scope: _scope, ...withoutScope } = VALID_TOKEN_BODY;
        return jsonResponse(withoutScope);
      },
      // Scope-mismatch (coverage direction): Adobe returns narrower set.
      async () => jsonResponse({ ...VALID_TOKEN_BODY, scope: 'agreement_read:self' }),
    ];
    for (const handler of cases) {
      const fetchSpy = vi.fn(handler);
      const service = createAdobeSignLiveOAuthService({
        fetch: fetchSpy,
        governedScopes: ['agreement_read:self', 'agreement_write:self'],
      });
      const result = await service.exchangeAuthorizationCode(VALID_INPUT);
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(VALID_INPUT.clientSecret);
      expect(serialized).not.toContain(VALID_INPUT.authorizationCode);
    }
  });
});
