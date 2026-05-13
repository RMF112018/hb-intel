import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';
import {
  createDeterministicMockGrantStore,
  resolveAdobeSignGrantStore,
} from './adobe-sign-grant-store.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);

const baseGrant = (overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord => ({
  actorTenantId: TENANT,
  actorOid: OID,
  actorKey: ACTOR_KEY,
  adobeApiAccessPoint: 'https://api.na1.adobesign.com',
  adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
  encryptedRefreshTokenRef: { storeKind: 'pending-selection', address: '' },
  grantedScopes: ['agreement_read', 'agreement_send'],
  grantedAtUtc: '2026-05-13T12:00:00.000Z',
  state: 'active',
  ...overrides,
});

describe('deterministic mock grant store — lifecycle', () => {
  it('upserts and retrieves a grant by actor key', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant());
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.state).toBe('active');
    expect(found?.actorOid).toBe(OID);
  });

  it('marks an existing grant as requires-reauth and records failure metadata', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant());
    await store.markReauthorizationRequired(ACTOR_KEY, {
      kind: 'refresh-failed',
      observedAtUtc: '2026-05-13T13:00:00.000Z',
    });
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.state).toBe('requires-reauth');
    expect(found?.failureMetadata?.kind).toBe('refresh-failed');
  });

  it('markReauthorizationRequired is a no-op when no grant is on file', async () => {
    const store = createDeterministicMockGrantStore();
    await store.markReauthorizationRequired(ACTOR_KEY);
    expect(await store.findGrant(ACTOR_KEY)).toBeUndefined();
  });

  it('marks an existing grant as revoked and stamps revokedAtUtc', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant());
    await store.markRevoked(ACTOR_KEY, '2026-05-13T14:00:00.000Z');
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.state).toBe('revoked');
    expect(found?.revokedAtUtc).toBe('2026-05-13T14:00:00.000Z');
  });

  it('markRevoked is a no-op when no grant is on file', async () => {
    const store = createDeterministicMockGrantStore();
    await store.markRevoked(ACTOR_KEY, '2026-05-13T14:00:00.000Z');
    expect(await store.findGrant(ACTOR_KEY)).toBeUndefined();
  });

  it('preserves the encrypted-refresh-token reference shape across state transitions', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant());
    await store.markReauthorizationRequired(ACTOR_KEY);
    const after = await store.findGrant(ACTOR_KEY);
    expect(Object.keys(after!.encryptedRefreshTokenRef)).toEqual(
      expect.arrayContaining(['storeKind', 'address']),
    );
  });
});

describe('resolveAdobeSignGrantStore — readiness gate', () => {
  it('returns ready in test mode (NODE_ENV=test)', () => {
    const result = resolveAdobeSignGrantStore({ NODE_ENV: 'test' });
    expect(result.readiness).toBe('ready');
  });

  it('returns configuration-required in production (no auto-fallback to in-memory)', () => {
    const result = resolveAdobeSignGrantStore({ NODE_ENV: 'production' });
    expect(result.readiness).toBe('configuration-required');
    if (result.readiness !== 'configuration-required') return;
    expect(result.reason).toBe('production-store-not-selected');
  });

  it('returns configuration-required when env is empty', () => {
    expect(resolveAdobeSignGrantStore({}).readiness).toBe('configuration-required');
  });
});
