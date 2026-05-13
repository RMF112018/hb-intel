import { describe, expect, it, vi } from 'vitest';

import {
  buildAdobeSignAuthorizationUrl,
  type AdobeSignTokenExchangeInput,
} from './adobe-sign-oauth-service.js';
import {
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
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
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
  it('maps HTTP 200 + valid body to status "ok" with the four success fields', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse(VALID_TOKEN_BODY));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    const result = await service.exchangeAuthorizationCode(VALID_INPUT);
    expect(result).toEqual({
      status: 'ok',
      accessToken: 'at-value',
      refreshToken: 'rt-value',
      grantedScopes: ['agreement_read', 'agreement_send'],
      expiresInSeconds: 3600,
    });
  });

  it('maps HTTP 200 + missing required field to "unreachable" + "malformed-response"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ access_token: 'a', expires_in: 3600 }));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
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
    });
  });

  it('maps HTTP 200 with granted scopes outside governedScopes to "scope-mismatch"', async () => {
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

  it('maps HTTP 400 + Adobe error invalid_grant to "invalid-code"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'invalid_grant' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'invalid-code',
    });
  });

  it('maps HTTP 400 + unknown Adobe error to "unreachable" + "http-4xx"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'unknown_error' }, 400));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
    });
  });

  it('maps HTTP 500 to "unreachable" + "http-5xx"', async () => {
    const fetchSpy = vi.fn(async () => jsonResponse({ error: 'server' }, 500));
    const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
    expect(await service.exchangeAuthorizationCode(VALID_INPUT)).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
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
    ];
    for (const handler of cases) {
      const fetchSpy = vi.fn(handler);
      const service = createAdobeSignLiveOAuthService({ fetch: fetchSpy });
      const result = await service.exchangeAuthorizationCode(VALID_INPUT);
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(VALID_INPUT.clientSecret);
      expect(serialized).not.toContain(VALID_INPUT.authorizationCode);
    }
  });
});
