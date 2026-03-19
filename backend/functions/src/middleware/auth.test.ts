import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

const validateTokenMock = vi.fn();

vi.mock('./validateToken.js', () => ({
  validateToken: (...args: unknown[]) => validateTokenMock(...args),
  unauthorizedResponse: (reason: string): HttpResponseInit => ({
    status: 401,
    jsonBody: { error: 'Unauthorized', reason },
  }),
}));

const trackedEvents: Array<{ name: string; properties: Record<string, unknown> }> = [];

vi.mock('../utils/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trackEvent: (name: string, properties: Record<string, unknown>) => {
      trackedEvents.push({ name, properties });
    },
    trackMetric: vi.fn(),
  }),
}));

vi.mock('./request-id.js', () => ({
  extractOrGenerateRequestId: () => 'test-correlation-id',
}));

import { extractBearer, withAuth, type AuthContext } from './auth.js';

const makeRequest = (authorizationHeader?: string): HttpRequest =>
  ({
    headers: {
      get: (name: string) => (name === 'Authorization' ? authorizationHeader ?? null : null),
    },
  }) as unknown as HttpRequest;

const makeContext = (): InvocationContext => ({}) as unknown as InvocationContext;

describe('P1-C2 extractBearer', () => {
  it('returns 401 when Authorization header is missing', () => {
    const result = extractBearer(makeRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it('returns 401 when Authorization header uses Basic prefix', () => {
    const result = extractBearer(makeRequest('Basic dXNlcjpwYXNz'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it('returns 401 when Bearer token is empty', () => {
    const result = extractBearer(makeRequest('Bearer '));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it('extracts token from valid Bearer header', () => {
    const result = extractBearer(makeRequest('Bearer abc123def456'));
    expect(result).toEqual({ ok: true, token: 'abc123def456' });
  });
});

describe('P1-C2 withAuth', () => {
  beforeEach(() => {
    validateTokenMock.mockReset();
    trackedEvents.length = 0;
  });

  it('returns 401 before handler executes when request is unauthenticated', async () => {
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const result = await wrapped(makeRequest(), makeContext());

    expect(result.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns 401 when validateToken throws', async () => {
    validateTokenMock.mockRejectedValueOnce(new Error('JWTExpired'));
    const handler = vi.fn();
    const wrapped = withAuth(handler);

    const result = await wrapped(makeRequest('Bearer expired-token'), makeContext());

    expect(result.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('passes AuthContext with claims and userToken to handler', async () => {
    const mockClaims = {
      upn: 'test.user@hb.com',
      oid: 'oid-123',
      roles: ['Admin'],
      displayName: 'Test User',
      jobTitle: undefined,
    };
    validateTokenMock.mockResolvedValueOnce(mockClaims);

    const handler = vi.fn().mockResolvedValueOnce({ status: 200, jsonBody: { ok: true } });
    const wrapped = withAuth(handler);

    const request = makeRequest('Bearer valid-token-xyz');
    const context = makeContext();
    const result = await wrapped(request, context);

    expect(result).toEqual({ status: 200, jsonBody: { ok: true } });
    expect(handler).toHaveBeenCalledOnce();

    const authArg: AuthContext = handler.mock.calls[0][2];
    expect(authArg.userToken).toBe('valid-token-xyz');
    expect(authArg.claims).toEqual(mockClaims);
  });

  it('lets handler errors bubble without catching', async () => {
    const mockClaims = {
      upn: 'user@hb.com',
      oid: 'oid-1',
      roles: [],
      displayName: 'user@hb.com',
      jobTitle: undefined,
    };
    validateTokenMock.mockResolvedValueOnce(mockClaims);

    const handler = vi.fn().mockRejectedValueOnce(new Error('Handler blew up'));
    const wrapped = withAuth(handler);

    await expect(wrapped(makeRequest('Bearer valid-token'), makeContext())).rejects.toThrow(
      'Handler blew up',
    );
  });
});

describe('P1-C3 auth.bearer.* telemetry', () => {
  beforeEach(() => {
    validateTokenMock.mockReset();
    trackedEvents.length = 0;
  });

  it('emits auth.bearer.error when bearer header is missing', async () => {
    const wrapped = withAuth(vi.fn());
    await wrapped(makeRequest(), makeContext());

    const event = trackedEvents.find((e) => e.name === 'auth.bearer.error');
    expect(event).toBeDefined();
    expect(event!.properties.reason).toBe('missing_or_malformed');
    expect(event!.properties.correlationId).toBe('test-correlation-id');
  });

  it('emits auth.bearer.error when token validation fails', async () => {
    validateTokenMock.mockRejectedValueOnce(new Error('JWTExpired'));
    const wrapped = withAuth(vi.fn());
    await wrapped(makeRequest('Bearer bad-token'), makeContext());

    const event = trackedEvents.find((e) => e.name === 'auth.bearer.error');
    expect(event).toBeDefined();
    expect(event!.properties.reason).toBe('invalid_token');
    expect(typeof event!.properties.durationMs).toBe('number');
  });

  it('emits auth.bearer.success when token validates', async () => {
    validateTokenMock.mockResolvedValueOnce({
      upn: 'user@hb.com', oid: 'oid-1', roles: [], displayName: 'User', jobTitle: undefined,
    });
    const handler = vi.fn().mockResolvedValueOnce({ status: 200 });
    const wrapped = withAuth(handler);
    await wrapped(makeRequest('Bearer valid-token'), makeContext());

    const event = trackedEvents.find((e) => e.name === 'auth.bearer.success');
    expect(event).toBeDefined();
    expect(typeof event!.properties.durationMs).toBe('number');
    expect(event!.properties.correlationId).toBe('test-correlation-id');
  });
});
