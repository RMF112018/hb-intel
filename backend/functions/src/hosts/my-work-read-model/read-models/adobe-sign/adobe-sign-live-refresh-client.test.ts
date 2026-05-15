import { describe, expect, it, vi } from 'vitest';

import { adobeSignActorKey, type AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';
import {
  ADOBE_SIGN_OAUTH_REFRESH_PATH,
  createAdobeSignLiveRefreshClient,
  type AdobeSignLiveRefreshClientDeps,
} from './adobe-sign-live-refresh-client.js';
import type {
  AdobeSignRefreshTokenCipher,
  AdobeSignRefreshTokenCiphertextEnvelope,
} from './adobe-sign-refresh-token-crypto.js';
import type { IAdobeSignRefreshTokenStore } from './adobe-sign-refresh-token-store.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY: AdobeSignActorKey = adobeSignActorKey(TENANT, OID);
const NOW = new Date('2026-05-13T12:00:00.000Z');
const CLIENT_ID = 'client-id-fixture';
const CLIENT_SECRET = 'super-secret-do-not-leak';
const STORED_PLAINTEXT = 'rt-old-do-not-leak';
const NEW_PLAINTEXT = 'rt-new-do-not-leak';

const VALID_BODY = {
  access_token: 'at-fresh-do-not-leak',
  refresh_token: NEW_PLAINTEXT,
  expires_in: 3600,
  scope: 'agreement_read agreement_send',
};

function grantFixture(overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord {
  return {
    actorTenantId: TENANT,
    actorOid: OID,
    actorKey: ACTOR_KEY,
    adobeApiAccessPoint: 'https://api.na1.adobesign.com',
    adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
    encryptedRefreshTokenRef: {
      storeKind: 'table-storage',
      address: ACTOR_KEY,
      lastPersistedAtUtc: '2026-05-13T11:00:00.000Z',
    },
    grantedScopes: ['agreement_read', 'agreement_send'],
    grantedAtUtc: '2026-05-13T10:00:00.000Z',
    state: 'active',
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function expectedRefreshDiagnostics() {
  return {
    endpointHost: 'api.na1.adobesign.com',
    endpointPath: '/oauth/v2/refresh',
    endpointSelectionMode: 'grant-api-access-point',
    bodyFieldCount: 4,
    hasGrantTypeField: true,
    hasRefreshTokenField: true,
    hasClientIdField: true,
    hasClientSecretField: true,
  };
}

function expectedMalformedResponseDiagnostics(overrides?: {
  hasAccessToken?: boolean;
  hasRefreshToken?: boolean;
  hasExpiresIn?: boolean;
}) {
  return {
    hasAccessToken: false,
    hasRefreshToken: false,
    hasExpiresIn: false,
    ...overrides,
  };
}

interface FakeStore extends IAdobeSignRefreshTokenStore {
  readonly getCalls: AdobeSignRefreshTokenCiphertextEnvelope[];
  readonly putCalls: Array<{ actorKey: string; envelope: AdobeSignRefreshTokenCiphertextEnvelope }>;
}

function buildFakeStore(opts?: {
  getReturn?: AdobeSignRefreshTokenCiphertextEnvelope | undefined;
  getThrow?: Error;
  putThrow?: Error;
}): FakeStore {
  const stored: AdobeSignRefreshTokenCiphertextEnvelope =
    opts?.getReturn ??
    ({
      cipherVersion: 1,
      iv: 'iv-fixture',
      authTag: 'tag-fixture',
      ciphertext: `ct:${STORED_PLAINTEXT}`,
    } as AdobeSignRefreshTokenCiphertextEnvelope);
  const harness = {
    getCalls: [] as AdobeSignRefreshTokenCiphertextEnvelope[],
    putCalls: [] as Array<{
      actorKey: string;
      envelope: AdobeSignRefreshTokenCiphertextEnvelope;
    }>,
  };
  const store: IAdobeSignRefreshTokenStore = {
    async getCiphertext(ref) {
      if (opts?.getThrow) throw opts.getThrow;
      harness.getCalls.push(stored);
      if (opts?.getReturn === undefined && opts && 'getReturn' in opts) return undefined;
      return stored;
    },
    async putCiphertext(actorKey, envelope, _now) {
      if (opts?.putThrow) throw opts.putThrow;
      harness.putCalls.push({ actorKey, envelope });
      return {
        storeKind: 'table-storage',
        address: actorKey,
        lastPersistedAtUtc: _now.toISOString(),
      };
    },
    async deleteCiphertext() {},
  };
  return Object.assign(store, harness) as FakeStore;
}

interface FakeCipher extends AdobeSignRefreshTokenCipher {
  readonly encryptCalls: string[];
  readonly decryptCalls: AdobeSignRefreshTokenCiphertextEnvelope[];
}

function buildFakeCipher(opts?: { decryptThrow?: Error }): FakeCipher {
  const encryptCalls: string[] = [];
  const decryptCalls: AdobeSignRefreshTokenCiphertextEnvelope[] = [];
  const cipher: AdobeSignRefreshTokenCipher = {
    encrypt(plaintext) {
      encryptCalls.push(plaintext);
      return {
        cipherVersion: 1,
        iv: 'iv-new',
        authTag: 'tag-new',
        ciphertext: `ct:${plaintext}`,
      };
    },
    decrypt(envelope) {
      decryptCalls.push(envelope);
      if (opts?.decryptThrow) throw opts.decryptThrow;
      return envelope.ciphertext.startsWith('ct:') ? envelope.ciphertext.slice(3) : '';
    },
  };
  return Object.assign(cipher, { encryptCalls, decryptCalls }) as FakeCipher;
}

function buildDeps(overrides: Partial<AdobeSignLiveRefreshClientDeps> = {}) {
  const refreshTokenStore = buildFakeStore();
  const cipher = buildFakeCipher();
  const fetch = vi.fn(async () => jsonResponse(VALID_BODY));
  const deps: AdobeSignLiveRefreshClientDeps = {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshTokenStore,
    cipher,
    fetch: fetch as unknown as typeof globalThis.fetch,
    ...overrides,
  };
  return { deps, refreshTokenStore, cipher, fetch };
}

describe('createAdobeSignLiveRefreshClient — request shape', () => {
  it('targets {apiAccessPoint}/oauth/v2/refresh exactly', async () => {
    const { deps, fetch } = buildDeps();
    const client = createAdobeSignLiveRefreshClient(deps);
    await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl] = fetch.mock.calls[0]!;
    expect(calledUrl).toBe(`https://api.na1.adobesign.com${ADOBE_SIGN_OAUTH_REFRESH_PATH}`);
  });

  it('sends a form-urlencoded body with exactly the four refresh keys', async () => {
    const { deps, fetch } = buildDeps();
    const client = createAdobeSignLiveRefreshClient(deps);
    await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    const [, init] = fetch.mock.calls[0]!;
    const initObj = init as RequestInit;
    expect(initObj.method).toBe('POST');
    expect((initObj.headers as Record<string, string>)['content-type']).toBe(
      'application/x-www-form-urlencoded',
    );
    const body = initObj.body as URLSearchParams;
    expect([...body.keys()].sort()).toEqual(
      ['client_id', 'client_secret', 'grant_type', 'refresh_token'].sort(),
    );
    expect(body.get('grant_type')).toBe('refresh_token');
    expect(body.get('refresh_token')).toBe(STORED_PLAINTEXT);
    expect(body.get('client_id')).toBe(CLIENT_ID);
    expect(body.get('client_secret')).toBe(CLIENT_SECRET);
  });
});

describe('createAdobeSignLiveRefreshClient — happy path', () => {
  it('returns ok with rotated ref, computed expiresAtUtc, and parsed scopes', async () => {
    const { deps, refreshTokenStore, cipher } = buildDeps();
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.accessToken).toBe('at-fresh-do-not-leak');
    expect(result.expiresAtUtc).toBe('2026-05-13T13:00:00.000Z');
    expect(result.grantedScopes).toEqual(['agreement_read', 'agreement_send']);
    expect(result.updatedEncryptedRefreshTokenRef.storeKind).toBe('table-storage');
    expect(result.updatedEncryptedRefreshTokenRef.address).toBe(ACTOR_KEY);
    expect(result.updatedEncryptedRefreshTokenRef.lastPersistedAtUtc).toBe(NOW.toISOString());
    expect(cipher.encryptCalls).toEqual([NEW_PLAINTEXT]);
    expect(refreshTokenStore.putCalls).toHaveLength(1);
    expect(refreshTokenStore.putCalls[0]!.actorKey).toBe(ACTOR_KEY);
  });

  it('still persists when Adobe does NOT rotate the refresh token (idempotent re-encryption)', async () => {
    const { deps, refreshTokenStore, cipher, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ ...VALID_BODY, refresh_token: STORED_PLAINTEXT }));
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(cipher.encryptCalls).toEqual([STORED_PLAINTEXT]);
    expect(refreshTokenStore.putCalls).toHaveLength(1);
  });

  it('accepts success body without refresh_token and re-encrypts existing plaintext token', async () => {
    const { deps, refreshTokenStore, cipher, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ access_token: 'at-fresh-do-not-leak', expires_in: 3600 }));
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(cipher.encryptCalls).toEqual([STORED_PLAINTEXT]);
    expect(refreshTokenStore.putCalls).toHaveLength(1);
  });
});

describe('createAdobeSignLiveRefreshClient — error mappings', () => {
  it('HTTP 400 invalid_grant → invalid-grant; no putCiphertext', async () => {
    const { deps, refreshTokenStore, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'invalid_grant' }, 400));
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result).toEqual({ status: 'invalid-grant' });
    expect(refreshTokenStore.putCalls).toEqual([]);
  });

  it('HTTP 400 invalid_token → invalid-grant', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'invalid_token' }, 400));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'invalid-grant',
    });
  });

  it('HTTP 400 invalid_request → unreachable + http-4xx + diagnostics', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'invalid_request' }, 400));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      providerErrorCode: 'invalid_request',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('HTTP 400 with unsafe provider error value omits providerErrorCode', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'Client secret is invalid' }, 400));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'http-4xx',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('HTTP 500 → unreachable + http-5xx', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ error: 'server' }, 500));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'http-5xx',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('network throw → unreachable + network', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockRejectedValueOnce(new Error('network down'));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'network',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('AbortError throw → unreachable + timeout', async () => {
    const { deps, fetch } = buildDeps();
    const err = new Error('aborted') as Error & { name: string };
    err.name = 'AbortError';
    fetch.mockRejectedValueOnce(err);
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'timeout',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('Malformed (non-JSON) 200 body → unreachable + malformed-response', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(
      new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
    });
  });

  it('HTTP 200 missing required field → unreachable + malformed-response', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ expires_in: 3600 }));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
      malformedResponseDiagnostics: expectedMalformedResponseDiagnostics({ hasExpiresIn: true }),
    });
  });

  it('HTTP 200 with non-positive expires_in → unreachable + malformed-response', async () => {
    const { deps, fetch } = buildDeps();
    fetch.mockResolvedValueOnce(jsonResponse({ access_token: 'x', expires_in: 0, refresh_token: 'rt' }));
    const client = createAdobeSignLiveRefreshClient(deps);
    expect(await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW })).toEqual({
      status: 'unreachable',
      reason: 'malformed-response',
      refreshRequestDiagnostics: expectedRefreshDiagnostics(),
      malformedResponseDiagnostics: expectedMalformedResponseDiagnostics({
        hasAccessToken: true,
        hasRefreshToken: true,
      }),
    });
  });

  it('Decryption throw → invalid-grant; no fetch call', async () => {
    const refreshTokenStore = buildFakeStore();
    const cipher = buildFakeCipher({ decryptThrow: new Error('tamper') });
    const fetch = vi.fn(async () => jsonResponse(VALID_BODY));
    const client = createAdobeSignLiveRefreshClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshTokenStore,
      cipher,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result).toEqual({ status: 'invalid-grant' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('getCiphertext returns undefined → unreachable + store-unavailable; no fetch call', async () => {
    const refreshTokenStore = buildFakeStore({ getReturn: undefined });
    const cipher = buildFakeCipher();
    const fetch = vi.fn(async () => jsonResponse(VALID_BODY));
    const client = createAdobeSignLiveRefreshClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshTokenStore,
      cipher,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result).toEqual({ status: 'unreachable', reason: 'store-unavailable' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('getCiphertext throws → unreachable + store-unavailable; no fetch call', async () => {
    const refreshTokenStore = buildFakeStore({ getThrow: new Error('store down') });
    const cipher = buildFakeCipher();
    const fetch = vi.fn(async () => jsonResponse(VALID_BODY));
    const client = createAdobeSignLiveRefreshClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshTokenStore,
      cipher,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result).toEqual({ status: 'unreachable', reason: 'store-unavailable' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('putCiphertext throws after a successful exchange → unreachable + store-unavailable', async () => {
    const refreshTokenStore = buildFakeStore({ putThrow: new Error('write failed') });
    const cipher = buildFakeCipher();
    const fetch = vi.fn(async () => jsonResponse(VALID_BODY));
    const client = createAdobeSignLiveRefreshClient({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshTokenStore,
      cipher,
      fetch: fetch as unknown as typeof globalThis.fetch,
    });
    const result = await client.refresh({ actorKey: ACTOR_KEY, grant: grantFixture(), now: NOW });
    expect(result).toEqual({ status: 'unreachable', reason: 'store-unavailable' });
  });

  it('rejects a non-allow-listed adobeApiAccessPoint with unreachable + invalid-access-point; no decrypt or fetch', async () => {
    const { deps, refreshTokenStore, cipher, fetch } = buildDeps();
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({
      actorKey: ACTOR_KEY,
      grant: grantFixture({ adobeApiAccessPoint: 'https://attacker.example.com' }),
      now: NOW,
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(cipher.decryptCalls).toEqual([]);
    expect(refreshTokenStore.getCalls).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a non-HTTPS adobeApiAccessPoint with unreachable + invalid-access-point', async () => {
    const { deps, fetch } = buildDeps();
    const client = createAdobeSignLiveRefreshClient(deps);
    const result = await client.refresh({
      actorKey: ACTOR_KEY,
      grant: grantFixture({ adobeApiAccessPoint: 'http://api.na1.adobesign.com' }),
      now: NOW,
    });
    expect(result).toEqual({ status: 'unreachable', reason: 'invalid-access-point' });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('createAdobeSignLiveRefreshClient — no secret leak in failure outcomes', () => {
  it('does not echo refresh-token plaintext, client_secret, or access_token in any failure status', async () => {
    const failureScenarios: Array<() => Promise<Response>> = [
      async () => jsonResponse({ error: 'invalid_grant' }, 400),
      async () => jsonResponse({}, 200),
      async () => jsonResponse({}, 500),
      async () => {
        throw new Error('network');
      },
    ];
    for (const scenario of failureScenarios) {
      const fetch = vi.fn(scenario);
      const refreshTokenStore = buildFakeStore();
      const cipher = buildFakeCipher();
      const client = createAdobeSignLiveRefreshClient({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshTokenStore,
        cipher,
        fetch: fetch as unknown as typeof globalThis.fetch,
      });
      const result = await client.refresh({
        actorKey: ACTOR_KEY,
        grant: grantFixture(),
        now: NOW,
      });
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(CLIENT_SECRET);
      expect(serialized).not.toContain(STORED_PLAINTEXT);
      expect(serialized).not.toContain(NEW_PLAINTEXT);
      expect(serialized).not.toContain('at-fresh-do-not-leak');
    }
  });
});
