import { beforeEach, describe, expect, it, vi } from 'vitest';

const jwtVerifyMock = vi.fn();

// P3-03: Mock jose error classes for structured error classification
class MockJWTExpired extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTExpired';
  }
}

class MockJWTClaimValidationFailed extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTClaimValidationFailed';
  }
}

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => ({ mocked: true })),
  jwtVerify: jwtVerifyMock,
  errors: {
    JWTExpired: MockJWTExpired,
    JWTClaimValidationFailed: MockJWTClaimValidationFailed,
  },
}));

/**
 * P3-03: Token validation tests covering dual-version support,
 * required API_AUDIENCE, structured errors, and claim extraction.
 */
describe('P3-03 validateToken middleware', () => {
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
    process.env.API_AUDIENCE = 'api://test-app-reg-id';
    process.env.NODE_ENV = 'test';
  });

  // --- Success paths ---

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
      tokenVersion: undefined,
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

  it('extracts tokenVersion from v1 token (ver: "1.0")', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        upn: 'user@hb.com',
        oid: 'oid-v1',
        roles: [],
        ver: '1.0',
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer v1-token'));

    expect(claims.tokenVersion).toBe('1.0');
  });

  it('extracts tokenVersion from v2 token (ver: "2.0")', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        preferred_username: 'user@hb.com',
        oid: 'oid-v2',
        roles: [],
        ver: '2.0',
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer v2-token'));

    expect(claims.tokenVersion).toBe('2.0');
    expect(claims.upn).toBe('user@hb.com');
  });

  it('uses preferred_username when upn is absent (v2 token pattern)', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        preferred_username: 'v2user@hb.com',
        oid: 'oid-v2-pref',
        roles: ['User'],
        name: 'V2 User',
        ver: '2.0',
      },
    });

    const { validateToken } = await import('./validateToken.js');
    const claims = await validateToken(makeRequest('Bearer v2-preferred-username'));

    expect(claims.upn).toBe('v2user@hb.com');
    expect(claims.displayName).toBe('V2 User');
  });

  // --- Failure paths ---

  it('throws TokenValidationError with reason "missing_header" when Authorization is absent', async () => {
    const { validateToken, TokenValidationError } = await import('./validateToken.js');

    await expect(validateToken(makeRequest())).rejects.toThrow(TokenValidationError);
    try {
      await validateToken(makeRequest());
    } catch (err: any) {
      expect(err.reason).toBe('missing_header');
    }
  });

  it('throws with reason "malformed_header" for non-Bearer scheme', async () => {
    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Basic user:pass'));
    } catch (err: any) {
      expect(err.reason).toBe('malformed_header');
    }
  });

  it('throws with reason "expired" when token is expired', async () => {
    jwtVerifyMock.mockRejectedValueOnce(new MockJWTExpired('token is expired'));

    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Bearer expired-token'));
    } catch (err: any) {
      expect(err.reason).toBe('expired');
      expect(err.message).toBe('Token is expired');
    }
  });

  it('throws with reason "invalid_issuer" when issuer claim fails', async () => {
    jwtVerifyMock.mockRejectedValueOnce(
      new MockJWTClaimValidationFailed('unexpected "iss" claim value'),
    );

    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Bearer wrong-issuer'));
    } catch (err: any) {
      expect(err.reason).toBe('invalid_issuer');
    }
  });

  it('throws with reason "invalid_audience" when audience claim fails', async () => {
    jwtVerifyMock.mockRejectedValueOnce(
      new MockJWTClaimValidationFailed('unexpected "aud" claim value'),
    );

    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Bearer wrong-audience'));
    } catch (err: any) {
      expect(err.reason).toBe('invalid_audience');
    }
  });

  it('throws with reason "missing_claims" when upn and oid are absent', async () => {
    jwtVerifyMock.mockResolvedValueOnce({ payload: { roles: ['Admin'] } });

    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Bearer missing-claims'));
    } catch (err: any) {
      expect(err.reason).toBe('missing_claims');
    }
  });

  it('throws with reason "validation_failed" for generic jose errors', async () => {
    jwtVerifyMock.mockRejectedValueOnce(new Error('JWK Set fetch failed'));

    const { validateToken } = await import('./validateToken.js');

    try {
      await validateToken(makeRequest('Bearer bad-token'));
    } catch (err: any) {
      expect(err.reason).toBe('validation_failed');
    }
  });

  // --- Audience configuration ---

  it('uses explicit API_AUDIENCE from env', async () => {
    process.env.API_AUDIENCE = 'api://explicit-app-reg-id';
    vi.resetModules();

    jwtVerifyMock.mockResolvedValueOnce({
      payload: { upn: 'user@hb.com', oid: 'oid-1', roles: [] },
    });

    const { validateToken } = await import('./validateToken.js');
    await validateToken(makeRequest('Bearer explicit-audience-token'));

    expect(jwtVerifyMock).toHaveBeenCalledWith(
      'explicit-audience-token',
      expect.anything(),
      expect.objectContaining({ audience: 'api://explicit-app-reg-id' }),
    );
  });

  it('falls back to api://${AZURE_CLIENT_ID} in test mode when API_AUDIENCE is not set', async () => {
    delete process.env.API_AUDIENCE;
    process.env.NODE_ENV = 'test';
    vi.resetModules();

    jwtVerifyMock.mockResolvedValueOnce({
      payload: { upn: 'user@hb.com', oid: 'oid-1', roles: [] },
    });

    const { validateToken } = await import('./validateToken.js');
    await validateToken(makeRequest('Bearer fallback-token'));

    expect(jwtVerifyMock).toHaveBeenCalledWith(
      'fallback-token',
      expect.anything(),
      expect.objectContaining({ audience: 'api://client-id' }),
    );
  });

  // --- Dual-issuer validation ---

  it('passes both v1 and v2 issuers to jose verifier', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: { upn: 'user@hb.com', oid: 'oid-1', roles: [] },
    });

    const { validateToken } = await import('./validateToken.js');
    await validateToken(makeRequest('Bearer dual-issuer-token'));

    expect(jwtVerifyMock).toHaveBeenCalledWith(
      'dual-issuer-token',
      expect.anything(),
      expect.objectContaining({
        issuer: [
          'https://sts.windows.net/tenant-id/',
          'https://login.microsoftonline.com/tenant-id/v2.0',
        ],
      }),
    );
  });
});
