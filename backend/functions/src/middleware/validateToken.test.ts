import { beforeEach, describe, expect, it, vi } from 'vitest';

const jwtVerifyMock = vi.fn();

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => ({ mocked: true })),
  jwtVerify: jwtVerifyMock,
}));

/**
 * D-PH6-15 Layer 1 tests for validateToken trust boundary behavior.
 * Coverage includes valid token, missing token, expired token failure, and wrong-audience failure.
 */
describe('D-PH6-15 validateToken middleware', () => {
  const makeRequest = (authorizationHeader?: string) =>
    ({
      headers: {
        get: (name: string) => (name === 'Authorization' ? authorizationHeader ?? null : null),
      },
    }) as any;

  beforeEach(() => {
    vi.resetModules();
    jwtVerifyMock.mockReset();
    process.env.AZURE_TENANT_ID = 'tenant-id';
    process.env.AZURE_CLIENT_ID = 'client-id';
  });

  it('returns validated claims for a valid bearer token', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        upn: 'valid.user@hb.com',
        oid: 'oid-1',
        roles: ['Admin'],
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer valid-token'));

    expect(claims).toEqual({
      upn: 'valid.user@hb.com',
      oid: 'oid-1',
      roles: ['Admin'],
      displayName: 'valid.user@hb.com',
      jobTitle: undefined,
    });
  });

  it('populates jobTitle when JWT contains the claim', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        upn: 'pm@hb.com',
        oid: 'oid-2',
        roles: ['ProjectManager'],
        name: 'PM User',
        jobTitle: 'Project Manager',
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer token-with-jobtitle'));

    expect(claims.jobTitle).toBe('Project Manager');
    expect(claims.displayName).toBe('PM User');
  });

  it('returns undefined jobTitle when JWT omits the claim', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        upn: 'user@hb.com',
        oid: 'oid-3',
        roles: [],
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer token-no-jobtitle'));

    expect(claims.jobTitle).toBeUndefined();
  });

  it('returns undefined jobTitle when claim is non-string', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        upn: 'user@hb.com',
        oid: 'oid-4',
        roles: [],
        jobTitle: 42,
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer token-bad-jobtitle'));

    expect(claims.jobTitle).toBeUndefined();
  });

  it('throws when Authorization header is missing', async () => {
    const { validateToken } = await import('./validateToken.js');

    await expect(validateToken(makeRequest())).rejects.toThrow(
      'Missing or malformed Authorization header'
    );
  });

  it('throws when token is expired', async () => {
    jwtVerifyMock.mockRejectedValueOnce(new Error('JWTExpired: token is expired'));

    const { validateToken } = await import('./validateToken.js');

    await expect(validateToken(makeRequest('Bearer expired-token'))).rejects.toThrow('JWTExpired');
  });

  it('throws when token audience is wrong', async () => {
    jwtVerifyMock.mockRejectedValueOnce(new Error('unexpected "aud" claim value'));

    const { validateToken } = await import('./validateToken.js');

    await expect(validateToken(makeRequest('Bearer wrong-audience-token'))).rejects.toThrow(
      'unexpected "aud" claim value'
    );
  });

  it('throws when required identity claims are absent', async () => {
    jwtVerifyMock.mockResolvedValueOnce({ payload: { roles: ['Admin'] } });

    const { validateToken } = await import('./validateToken.js');

    await expect(validateToken(makeRequest('Bearer missing-claims-token'))).rejects.toThrow(
      'Token missing required identity claims'
    );
  });
});
