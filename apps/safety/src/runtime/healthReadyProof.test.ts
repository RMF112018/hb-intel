import { describe, expect, it, vi, afterEach } from 'vitest';
import { runHealthReadyNonAdminProof, shouldRunHealthReadyNonAdminProof } from './healthReadyProof.js';

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('healthReadyProof', () => {
  it('runs only when proof query flag and hosted config are present', () => {
    expect(shouldRunHealthReadyNonAdminProof(undefined, 'api://aud', 'https://functions', '?hbSafetyProof=healthReadyNonAdmin')).toBe(false);
    expect(shouldRunHealthReadyNonAdminProof({} as never, undefined, 'https://functions', '?hbSafetyProof=healthReadyNonAdmin')).toBe(false);
    expect(shouldRunHealthReadyNonAdminProof({} as never, 'api://aud', undefined, '?hbSafetyProof=healthReadyNonAdmin')).toBe(false);
    expect(shouldRunHealthReadyNonAdminProof({} as never, 'api://aud', 'https://functions', '?hbSafetyProof=other')).toBe(false);
    expect(shouldRunHealthReadyNonAdminProof({} as never, 'api://aud', 'https://functions', '?hbSafetyProof=healthReadyNonAdmin')).toBe(true);
  });

  it('classifies delegated non-admin token and captures 403 probe result', async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = makeJwt({
      aud: 'api://aud',
      nbf: now - 60,
      exp: now + 600,
      oid: 'user-oid',
      upn: 'user@example.com',
      roles: ['Reader'],
      scp: 'access_as_user',
      ver: '1.0',
    });
    const getToken = vi.fn().mockResolvedValue(token);
    const getTokenProvider = vi.fn().mockResolvedValue({
      getToken,
    });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: {
          'content-type': 'application/json',
          'x-request-id': 'req-123',
        },
      }),
    );

    const result = await runHealthReadyNonAdminProof(
      { aadTokenProviderFactory: { getTokenProvider } } as never,
      'api://aud',
      'https://functions.example.com/',
    );

    expect(result.acquisition.success).toBe(true);
    expect(result.tokenClassification?.audMatchesExpected).toBe(true);
    expect(result.tokenClassification?.identityShape.delegatedUserShape).toBe(true);
    expect(result.tokenClassification?.isNonAdmin).toBe(true);
    expect(result.probe?.status).toBe(403);
    expect(result.probe?.statusMatchesExpected).toBe(true);
    expect(result.probe?.requestId).toBe('req-123');
    expect(getTokenProvider).toHaveBeenCalledTimes(1);
    expect(getToken).toHaveBeenCalledWith('api://aud');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://functions.example.com/api/health/ready',
      expect.objectContaining({
        method: 'GET',
      }),
    );
  });

  it('flags admin token as not non-admin even when token is valid', async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = makeJwt({
      aud: 'api://aud',
      nbf: now - 60,
      exp: now + 600,
      oid: 'user-oid',
      preferred_username: 'admin@example.com',
      roles: ['Admin'],
      scp: 'access_as_user',
    });
    const getTokenProvider = vi.fn().mockResolvedValue({
      getToken: vi.fn().mockResolvedValue(token),
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const result = await runHealthReadyNonAdminProof(
      { aadTokenProviderFactory: { getTokenProvider } } as never,
      'api://aud',
      'https://functions.example.com',
    );

    expect(result.acquisition.success).toBe(true);
    expect(result.tokenClassification?.isNonAdmin).toBe(false);
    expect(result.probe?.status).toBe(200);
    expect(result.probe?.statusMatchesExpected).toBe(false);
  });
});
