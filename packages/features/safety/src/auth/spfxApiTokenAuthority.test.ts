import { describe, expect, it, vi } from 'vitest';
import {
  acquireSpfxApiTokenAuthority,
  type AadTokenProviderHost,
} from './spfxApiTokenAuthority.js';

const EXPECTED_AUDIENCE = 'api://08c399eb-a394-4087-b859-659d493f8dc7';

function base64Url(s: string): string {
  const b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(s, 'utf8').toString('base64')
    : btoa(s);
  return b64.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeToken(claims: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify(claims));
  // Signature segment is unused by the client-side decoder; backend validates real tokens.
  const signature = base64Url('test-signature-not-validated-client-side');
  return `${header}.${payload}.${signature}`;
}

function makeHost(token: string | (() => Promise<string>)): AadTokenProviderHost {
  const getToken = typeof token === 'function'
    ? vi.fn(token)
    : vi.fn(async () => token);
  return {
    aadTokenProviderFactory: {
      getTokenProvider: vi.fn(async () => ({ getToken })),
    },
  };
}

const futureExp = (): number => Math.floor(Date.now() / 1000) + 60 * 60;
const pastExp = (): number => Math.floor(Date.now() / 1000) - 60;

describe('acquireSpfxApiTokenAuthority', () => {
  it('returns ok with normalized role array for a valid Admin token', async () => {
    const token = makeToken({
      aud: EXPECTED_AUDIENCE,
      iss: 'https://sts.windows.net/0e834bd7-628b-42c8-b9ec-ecebc9719be4/',
      tid: '0e834bd7-628b-42c8-b9ec-ecebc9719be4',
      scp: 'access_as_user',
      roles: ['Admin'],
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.hasAccessAsUserScope).toBe(true);
    expect(result.decoded.roles).toEqual(['Admin']);
    expect(result.decoded.aud).toBe(EXPECTED_AUDIENCE);
    expect(result.decoded.tid).toBe('0e834bd7-628b-42c8-b9ec-ecebc9719be4');
  });

  it('normalizes a string roles claim into a one-element array', async () => {
    const token = makeToken({
      aud: EXPECTED_AUDIENCE,
      scp: 'access_as_user',
      roles: 'HBIntelSafetySubmitter',
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.decoded.roles).toEqual(['HBIntelSafetySubmitter']);
  });

  it('returns failed/missing-api-audience without calling the provider when audience is empty', async () => {
    const host = makeHost('unused');
    const result = await acquireSpfxApiTokenAuthority(host, '   ');
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('missing-api-audience');
    expect(host.aadTokenProviderFactory.getTokenProvider).not.toHaveBeenCalled();
  });

  it('returns failed/token-provider-unavailable when host is undefined', async () => {
    const result = await acquireSpfxApiTokenAuthority(undefined, EXPECTED_AUDIENCE);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('token-provider-unavailable');
  });

  it('returns failed/token-provider-unavailable when getTokenProvider rejects', async () => {
    const host: AadTokenProviderHost = {
      aadTokenProviderFactory: {
        getTokenProvider: vi.fn(() => Promise.reject(new Error('provider down'))),
      },
    };
    const result = await acquireSpfxApiTokenAuthority(host, EXPECTED_AUDIENCE);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('token-provider-unavailable');
    expect(result.errorMessage).toContain('provider down');
  });

  it('returns failed/token-acquisition-failed when getToken rejects', async () => {
    const host = makeHost(() => Promise.reject(new Error('access not granted')));
    const result = await acquireSpfxApiTokenAuthority(host, EXPECTED_AUDIENCE);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('token-acquisition-failed');
    expect(result.errorMessage).toContain('access not granted');
  });

  it('returns failed/token-decode-failed for malformed JWT', async () => {
    const result = await acquireSpfxApiTokenAuthority(makeHost('not.a.valid.jwt.too.many.segments'), EXPECTED_AUDIENCE);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('token-decode-failed');
  });

  it('returns audience-mismatch when token aud differs from expected', async () => {
    const token = makeToken({
      aud: 'api://something-else',
      scp: 'access_as_user',
      roles: ['Admin'],
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('audience-mismatch');
    if (result.status !== 'audience-mismatch') return;
    expect(result.expected).toBe(EXPECTED_AUDIENCE);
    expect(result.actual).toBe('api://something-else');
  });

  it('returns no-scope when scp lacks access_as_user', async () => {
    const token = makeToken({
      aud: EXPECTED_AUDIENCE,
      scp: 'some_other_scope',
      roles: ['Admin'],
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('no-scope');
    if (result.status !== 'no-scope') return;
    expect(result.errorClass).toBe('scope-missing');
  });

  it('returns no-scope when scp claim is absent', async () => {
    const token = makeToken({
      aud: EXPECTED_AUDIENCE,
      roles: ['Admin'],
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('no-scope');
  });

  it('returns expired when exp is in the past', async () => {
    const token = makeToken({
      aud: EXPECTED_AUDIENCE,
      scp: 'access_as_user',
      roles: ['Admin'],
      exp: pastExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(token), EXPECTED_AUDIENCE);
    expect(result.status).toBe('expired');
    if (result.status !== 'expired') return;
    expect(result.errorClass).toBe('token-expired');
  });

  it('treats an empty token string as token-acquisition-failed', async () => {
    const result = await acquireSpfxApiTokenAuthority(makeHost(''), EXPECTED_AUDIENCE);
    expect(result.status).toBe('failed');
    if (result.status !== 'failed') return;
    expect(result.errorClass).toBe('token-acquisition-failed');
  });

  it('does not return or expose the raw token in any field of the result', async () => {
    const rawToken = makeToken({
      aud: EXPECTED_AUDIENCE,
      scp: 'access_as_user',
      roles: ['Admin'],
      exp: futureExp(),
    });
    const result = await acquireSpfxApiTokenAuthority(makeHost(rawToken), EXPECTED_AUDIENCE);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(rawToken);
  });
});
