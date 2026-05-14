import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';
import { createDeterministicMockGrantStore } from './adobe-sign-grant-store.js';
import {
  createDeterministicMockRefreshClient,
  type AdobeSignRefreshResult,
} from './adobe-sign-refresh-client.js';
import {
  ADOBE_SIGN_ACCESS_TOKEN_REFRESH_MARGIN_MS,
  createAdobeSignTokenService,
  toAdobeSignTokenPublicDiagnostic,
  type AdobeSignAccessTokenAcquireResult,
} from './adobe-sign-token-service.js';
import type { AdobeSignRuntimeDiagnosticReporter } from './adobe-sign-runtime-diagnostics.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);

const SECRET_ACCESS = 'at-secret-do-not-echo';
const SECRET_NEW_ACCESS = 'at-secret-rotated';

const activeGrant = (overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord => ({
  actorTenantId: TENANT,
  actorOid: OID,
  actorKey: ACTOR_KEY,
  adobeApiAccessPoint: 'https://api.na1.adobesign.com',
  adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
  encryptedRefreshTokenRef: { storeKind: 'pending-selection', address: 'rt-ref-1' },
  grantedScopes: ['agreement_read', 'agreement_send'],
  grantedAtUtc: '2026-05-13T12:00:00.000Z',
  state: 'active',
  ...overrides,
});

const refreshOk = (
  overrides: Partial<Extract<AdobeSignRefreshResult, { status: 'ok' }>> = {},
): AdobeSignRefreshResult => ({
  status: 'ok',
  accessToken: SECRET_NEW_ACCESS,
  expiresAtUtc: '2026-05-13T13:00:00.000Z',
  updatedEncryptedRefreshTokenRef: { storeKind: 'pending-selection', address: 'rt-ref-2' },
  grantedScopes: ['agreement_read', 'agreement_send'],
  ...overrides,
});

const buildService = (
  grant: IAdobeSignGrantRecord | undefined,
  script: ReadonlyArray<AdobeSignRefreshResult>,
) => {
  const grantStore = createDeterministicMockGrantStore();
  if (grant) {
    // Seed via the test API rather than calling upsertGrant from production
    // path. We use the public upsertGrant so the store mirrors how the
    // OAuth callback (Prompt 03) writes grants.
    void grantStore.upsertGrant(grant);
  }
  const refreshClient = createDeterministicMockRefreshClient(script);
  const service = createAdobeSignTokenService({ grantStore, refreshClient });
  return { service, grantStore, refreshClient };
};

const NOW = new Date('2026-05-13T12:30:00.000Z');

function createReporterCapture() {
  const events: Array<{ name: string; properties: Record<string, unknown> }> = [];
  const reporter: AdobeSignRuntimeDiagnosticReporter = {
    trackAdobeSignRuntimeEvent(name, properties) {
      events.push({ name, properties });
    },
  };
  return { reporter, events };
}

describe('token service — active grant with valid cached token', () => {
  it('caches the refreshed access token and skips a second refresh while it is fresh', async () => {
    const grant = activeGrant();
    const { service, refreshClient } = buildService(grant, [
      refreshOk({ expiresAtUtc: '2026-05-13T13:30:00.000Z' }),
    ]);

    // First call mints + caches.
    const first = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(first.status).toBe('ok');
    if (first.status !== 'ok') return;
    expect(first.accessToken).toBe(SECRET_NEW_ACCESS);

    // Second call uses the cache — refresh client must not be called again.
    const second = await service.getAccessToken(ACTOR_KEY, new Date('2026-05-13T12:31:00.000Z'));
    expect(second.status).toBe('ok');
    expect(refreshClient.callCount()).toBe(1);
  });

  it('returns the apiAccessPoint from the grant on the success path', async () => {
    const { service } = buildService(activeGrant(), [refreshOk()]);
    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.apiAccessPoint).toBe('https://api.na1.adobesign.com');
  });
});

describe('token service — expired/near-expiry refresh success', () => {
  it('refreshes when the cached token is within the refresh margin', async () => {
    const firstExpiry = '2026-05-13T13:00:00.000Z'; // 30 min after NOW (12:30)
    const { service, refreshClient } = buildService(activeGrant(), [
      refreshOk({ expiresAtUtc: firstExpiry }),
      refreshOk({ accessToken: 'at-third', expiresAtUtc: '2026-05-13T14:00:00.000Z' }),
    ]);

    const first = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(first.status).toBe('ok');

    // Advance to 30 s before the cached token's expiry — inside the
    // ADOBE_SIGN_ACCESS_TOKEN_REFRESH_MARGIN_MS (60 s) margin, so the
    // service must refresh rather than reuse the cache.
    const nearExpiry = new Date(
      new Date(firstExpiry).getTime() - Math.floor(ADOBE_SIGN_ACCESS_TOKEN_REFRESH_MARGIN_MS / 2),
    );
    const second = await service.getAccessToken(ACTOR_KEY, nearExpiry);
    expect(second.status).toBe('ok');
    if (second.status !== 'ok') return;
    expect(second.accessToken).toBe('at-third');
    expect(refreshClient.callCount()).toBe(2);
  });

  it('persists rotated lifecycle metadata back to the grant store after a refresh', async () => {
    const grant = activeGrant();
    const { service, grantStore } = buildService(grant, [
      refreshOk({
        updatedEncryptedRefreshTokenRef: {
          storeKind: 'pending-selection',
          address: 'rt-ref-rotated',
        },
      }),
    ]);
    await service.getAccessToken(ACTOR_KEY, NOW);

    const stored = await grantStore.findGrant(ACTOR_KEY);
    expect(stored?.state).toBe('active');
    expect(stored?.encryptedRefreshTokenRef.address).toBe('rt-ref-rotated');
    expect(stored?.lastRefreshedAtUtc).toBe(NOW.toISOString());
    expect(stored?.expiresAtUtc).toBe('2026-05-13T13:00:00.000Z');
  });
});

describe('token service — refresh revoked / invalid → authorization-required', () => {
  it('transitions the grant to requires-reauth and returns authorization-required (refresh-invalid)', async () => {
    const grant = activeGrant();
    const { service, grantStore } = buildService(grant, [{ status: 'invalid-grant' }]);

    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('refresh-invalid');

    const stored = await grantStore.findGrant(ACTOR_KEY);
    expect(stored?.state).toBe('requires-reauth');
    expect(stored?.failureMetadata?.kind).toBe('refresh-failed');
    expect(stored?.failureMetadata?.observedAtUtc).toBe(NOW.toISOString());
  });

  it('returns authorization-required (grant-requires-reauth) on subsequent calls and does not refresh again', async () => {
    const grant = activeGrant({ state: 'requires-reauth' });
    const { service, refreshClient } = buildService(grant, []);
    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('grant-requires-reauth');
    expect(refreshClient.callCount()).toBe(0);
  });

  it('returns authorization-required (grant-revoked) for a revoked grant', async () => {
    const grant = activeGrant({ state: 'revoked' });
    const { service, refreshClient } = buildService(grant, []);
    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('grant-revoked');
    expect(refreshClient.callCount()).toBe(0);
  });

  it('returns authorization-required (no-grant-found) when there is no grant on file', async () => {
    const { service, refreshClient } = buildService(undefined, []);
    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('no-grant-found');
    expect(refreshClient.callCount()).toBe(0);
  });
});

describe('token service — provider/token endpoint unreachable → source-unavailable', () => {
  it('returns source-unavailable WITHOUT mutating the grant state when refresh is unreachable', async () => {
    const grant = activeGrant();
    const { service, grantStore } = buildService(grant, [
      { status: 'unreachable', reason: 'http-5xx' },
    ]);

    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('source-unavailable');
    if (result.status !== 'source-unavailable') return;
    expect(result.reason).toBe('adobe-unreachable');

    const stored = await grantStore.findGrant(ACTOR_KEY);
    expect(stored?.state).toBe('active'); // not touched
  });

  it('treats a thrown refresh-client exception as source-unavailable (no stack leak)', async () => {
    const grant = activeGrant();
    const grantStore = createDeterministicMockGrantStore();
    await grantStore.upsertGrant(grant);
    const service = createAdobeSignTokenService({
      grantStore,
      refreshClient: {
        async refresh() {
          throw new Error('TOP_SECRET vendor stack [accessToken=at-leaked-from-stack]');
        },
      },
    });

    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    expect(result.status).toBe('source-unavailable');
    expect(JSON.stringify(result)).not.toContain('at-leaked-from-stack');
    expect(JSON.stringify(result)).not.toContain('TOP_SECRET');
  });
});

describe('no token strings in public error / diagnostic surfaces', () => {
  const cases: Array<{
    name: string;
    grant: IAdobeSignGrantRecord | undefined;
    script: ReadonlyArray<AdobeSignRefreshResult>;
  }> = [
    { name: 'authorization-required (no-grant-found)', grant: undefined, script: [] },
    {
      name: 'authorization-required (refresh-invalid)',
      grant: activeGrant(),
      script: [{ status: 'invalid-grant' }],
    },
    {
      name: 'source-unavailable (adobe-unreachable)',
      grant: activeGrant(),
      script: [{ status: 'unreachable', reason: 'network' }],
    },
  ];

  for (const { name, grant, script } of cases) {
    it(`${name}: result carries no token / vendor strings`, async () => {
      const { service } = buildService(grant, script);
      const result = await service.getAccessToken(ACTOR_KEY, NOW);
      const serialized = JSON.stringify(result);
      for (const needle of [
        SECRET_ACCESS,
        SECRET_NEW_ACCESS,
        'rt-ref',
        'refreshToken',
        'accessToken',
      ]) {
        expect(serialized).not.toContain(needle);
      }
    });
  }

  it('toAdobeSignTokenPublicDiagnostic strips accessToken / expiresAtUtc / apiAccessPoint from the ok branch', async () => {
    const { service } = buildService(activeGrant(), [refreshOk()]);
    const result = await service.getAccessToken(ACTOR_KEY, NOW);
    const diagnostic = toAdobeSignTokenPublicDiagnostic(result);
    expect(diagnostic).toEqual({ status: 'ok' });
    expect(JSON.stringify(diagnostic)).not.toContain(SECRET_NEW_ACCESS);
    expect(JSON.stringify(diagnostic)).not.toContain('api.na1.adobesign.com');
  });

  it('toAdobeSignTokenPublicDiagnostic preserves status + reason for failure branches', () => {
    const samples: AdobeSignAccessTokenAcquireResult[] = [
      { status: 'authorization-required', reason: 'no-grant-found' },
      { status: 'authorization-required', reason: 'refresh-invalid' },
      { status: 'source-unavailable', reason: 'adobe-unreachable' },
    ];
    for (const sample of samples) {
      const diag = toAdobeSignTokenPublicDiagnostic(sample);
      expect(diag.status).toBe(sample.status);
      expect(diag.reason).toBe(sample.reason);
    }
  });
});

describe('refresh-client contract: no raw Adobe payload passthrough', () => {
  it('the AdobeSignRefreshResult union has no field for raw response bodies', () => {
    // Spot-check the shape at runtime by enumerating the keys we DO accept.
    const okShape: AdobeSignRefreshResult = {
      status: 'ok',
      accessToken: 'a',
      expiresAtUtc: '2026-01-01T00:00:00.000Z',
      updatedEncryptedRefreshTokenRef: { storeKind: 'pending-selection', address: '' },
      grantedScopes: [],
    };
    const okKeys = Object.keys(okShape);
    expect(okKeys).not.toContain('rawResponseBody');
    expect(okKeys).not.toContain('vendorBody');
    expect(okKeys).not.toContain('refreshToken');
    expect(okKeys).not.toContain('refresh_token');

    const failureShape: AdobeSignRefreshResult = { status: 'unreachable', reason: 'network' };
    const failureKeys = Object.keys(failureShape);
    expect(failureKeys).not.toContain('rawResponseBody');
    expect(failureKeys).not.toContain('errorBody');
  });
});

describe('token service — runtime result telemetry', () => {
  it('emits tokenAcquisition + refresh result events for refresh unreachable', async () => {
    const { service } = buildService(activeGrant(), [{ status: 'unreachable', reason: 'http-5xx' }]);
    const { reporter, events } = createReporterCapture();

    const result = await service.getAccessToken(ACTOR_KEY, NOW, reporter);
    expect(result.status).toBe('source-unavailable');
    expect(events).toEqual([
      {
        name: 'adobeSign.read.refresh.result',
        properties: { status: 'unreachable', reason: 'http-5xx' },
      },
      {
        name: 'adobeSign.read.tokenAcquisition.result',
        properties: { status: 'source-unavailable', reason: 'adobe-unreachable' },
      },
    ]);
  });

  it('does not leak token material in runtime result telemetry', async () => {
    const { service } = buildService(activeGrant(), [refreshOk()]);
    const { reporter, events } = createReporterCapture();

    const result = await service.getAccessToken(ACTOR_KEY, NOW, reporter);
    expect(result.status).toBe('ok');
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(SECRET_NEW_ACCESS);
    expect(serialized).not.toContain('refresh_token');
    expect(serialized).not.toContain('client_secret');
    expect(serialized).not.toContain('oauth');
  });
});
