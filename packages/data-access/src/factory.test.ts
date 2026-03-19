/**
 * P1-B1 Task 9: Factory integration test.
 *
 * Confirms the full chain: setProxyContext() → createAuthRepository('proxy')
 * → method call → correct HTTP method, path, and Authorization header with
 * the token from the per-request provider.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { setProxyContext, createAuthRepository } from './factory.js';

function mockFetch(response: { status?: number; jsonBody?: unknown }): void {
  const { jsonBody, status = 200 } = response;
  const resp = {
    ok: status < 400,
    status,
    json: vi.fn().mockResolvedValue(jsonBody ?? {}),
  } as unknown as Response;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(resp));
}

function lastFetchUrl(): string {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
}

function lastFetchInit(): RequestInit {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit;
}

function nthFetchInit(n: number): RequestInit {
  return (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[n][1] as RequestInit;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('P1-B1 Task 9: Factory integration — setProxyContext + proxy repository', () => {
  it('getCurrentUser sends GET /auth/me with Bearer token from provider', async () => {
    const user = { type: 'internal', id: 'u1', displayName: 'Test', email: 'u@hb.com', roles: [] };
    mockFetch({ jsonBody: { data: user } });

    setProxyContext('https://api.test.com/api', async () => 'msal-token-123');
    const repo = createAuthRepository('proxy');
    const result = await repo.getCurrentUser();

    expect(lastFetchUrl()).toContain('/auth/me');
    expect(lastFetchInit().method).toBe('GET');
    expect((lastFetchInit().headers as Record<string, string>)['Authorization']).toBe('Bearer msal-token-123');
    expect(result).toEqual(user);
  });

  it('token provider is called per-request, not cached', async () => {
    let callCount = 0;
    const getToken = vi.fn(async () => {
      callCount++;
      return `token-${callCount}`;
    });

    mockFetch({ jsonBody: { data: [] } });

    setProxyContext('https://api.test.com/api', getToken);
    const repo = createAuthRepository('proxy');

    await repo.getRoles();
    await repo.getRoles();

    expect(getToken).toHaveBeenCalledTimes(2);
    const firstHeaders = nthFetchInit(0).headers as Record<string, string>;
    const secondHeaders = nthFetchInit(1).headers as Record<string, string>;
    expect(firstHeaders['Authorization']).toBe('Bearer token-1');
    expect(secondHeaders['Authorization']).toBe('Bearer token-2');
  });

  it('setProxyContext resets singleton — new context takes effect', async () => {
    mockFetch({ jsonBody: { data: [] } });

    setProxyContext('https://api-a.test.com/api', async () => 'token-A');
    const repoA = createAuthRepository('proxy');
    await repoA.getRoles();
    expect((lastFetchInit().headers as Record<string, string>)['Authorization']).toBe('Bearer token-A');
    expect(lastFetchUrl()).toContain('api-a.test.com');

    // Reset with new context
    mockFetch({ jsonBody: { data: [] } });
    setProxyContext('https://api-b.test.com/api', async () => 'token-B');
    const repoB = createAuthRepository('proxy');
    await repoB.getRoles();
    expect((lastFetchInit().headers as Record<string, string>)['Authorization']).toBe('Bearer token-B');
    expect(lastFetchUrl()).toContain('api-b.test.com');
  });

  it('createAuthRepository("mock") returns without requiring setProxyContext', () => {
    const repo = createAuthRepository('mock');
    expect(repo).toBeDefined();
    expect(typeof repo.getCurrentUser).toBe('function');
  });

  it('POST request includes correct body and Authorization', async () => {
    const created = { id: 'r1', name: 'TestRole', grants: ['read:leads'] };
    mockFetch({ jsonBody: { data: created } });

    setProxyContext('https://api.test.com/api', async () => 'post-token');
    const repo = createAuthRepository('proxy');
    const result = await repo.createRole({ name: 'TestRole', grants: ['read:leads'] });

    expect(lastFetchUrl()).toContain('/auth/roles');
    expect(lastFetchInit().method).toBe('POST');
    expect((lastFetchInit().headers as Record<string, string>)['Authorization']).toBe('Bearer post-token');

    const sentBody = JSON.parse(lastFetchInit().body as string);
    expect(sentBody.name).toBe('TestRole');
    expect(sentBody.grants).toEqual(['read:leads']);
    expect(result).toEqual(created);
  });

  it('throws when proxy context is not initialized', async () => {
    vi.resetModules();
    const { createAuthRepository: freshCreate } = await import('./factory.js');
    expect(() => freshCreate('proxy')).toThrow('Proxy adapter context not initialized');
  });

  it('X-Request-Id header is present on every request', async () => {
    mockFetch({ jsonBody: { data: {} } });

    setProxyContext('https://api.test.com/api', async () => 'token');
    const repo = createAuthRepository('proxy');
    await repo.getCurrentUser();

    const headers = lastFetchInit().headers as Record<string, string>;
    expect(headers['X-Request-Id']).toBeDefined();
    expect(headers['X-Request-Id'].length).toBeGreaterThan(0);
  });
});
