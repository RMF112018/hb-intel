import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { EnvLike } from './adobe-sign-config.js';
import {
  createDeterministicMockGrantStore,
  type AdobeSignGrantStoreReadiness,
  type IAdobeSignGrantStore,
} from './adobe-sign-grant-store.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';
import type { MyWorkReadContext } from '../my-work-read-model-provider.js';

import { createAdobeSignPrincipalResolver } from './adobe-sign-principal-resolver.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);

const FULL_ENV: EnvLike = {
  ADOBE_SIGN_OAUTH_CLIENT_ID: 'client-id-value',
  ADOBE_SIGN_OAUTH_CLIENT_SECRET: 'super-secret-do-not-echo',
  ADOBE_SIGN_OAUTH_REDIRECT_URI: 'https://hb-intel.example.com/api/adobe/callback',
  ADOBE_SIGN_OAUTH_SCOPES: 'agreement_read:self',
  ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
  AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
  ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktdGVzdC0=',
};

const context = (overrides: Partial<MyWorkReadContext['actor']> = {}): MyWorkReadContext => ({
  actor: {
    displayName: 'Avery Operator',
    principalName: 'avery@hbc.test',
    hbcUserId: OID,
    ...overrides,
  },
  requestId: 'req-fixture',
});

const baseGrant = (overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord => ({
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
  grantedScopes: ['agreement_read:self'],
  grantedAtUtc: '2026-05-13T10:00:00.000Z',
  state: 'active',
  ...overrides,
});

function buildResolver(opts?: {
  tenantId?: string | undefined;
  env?: EnvLike;
  grantStore?: AdobeSignGrantStoreReadiness;
}) {
  // `'tenantId' in opts` lets callers distinguish "no override" (use TENANT)
  // from "explicitly undefined" (test the missing-tenant branch).
  const tenantId = opts && 'tenantId' in opts ? opts.tenantId : TENANT;
  return createAdobeSignPrincipalResolver({
    resolveTenantId: () => tenantId,
    resolveConfigEnv: () => opts?.env ?? FULL_ENV,
    resolveGrantStore: () =>
      opts?.grantStore ?? { readiness: 'ready', store: createDeterministicMockGrantStore() },
  });
}

describe('createAdobeSignPrincipalResolver — non-resolved branches', () => {
  it('returns principal-unresolved: missing-tenant when tenantId is empty', async () => {
    const resolve = buildResolver({ tenantId: undefined });
    const result = await resolve(context());
    expect(result).toEqual({ status: 'principal-unresolved', reason: 'missing-tenant' });
  });

  it('returns configuration-required when OAuth config is incomplete', async () => {
    const env: EnvLike = { ...FULL_ENV, ADOBE_SIGN_OAUTH_CLIENT_SECRET: undefined };
    const resolve = buildResolver({ env });
    const result = await resolve(context());
    expect(result.status).toBe('configuration-required');
    if (result.status !== 'configuration-required') return;
    expect(result.missingKeys).toEqual(['ADOBE_SIGN_OAUTH_CLIENT_SECRET']);
    expect(result.pendingStoreSelection).toBe(false);
  });

  it('returns configuration-required with pendingStoreSelection: true when only the store mode is unset', async () => {
    const env: EnvLike = { ...FULL_ENV, ADOBE_SIGN_TOKEN_STORE_MODE: undefined };
    const resolve = buildResolver({ env });
    const result = await resolve(context());
    expect(result.status).toBe('configuration-required');
    if (result.status !== 'configuration-required') return;
    expect(result.pendingStoreSelection).toBe(true);
  });

  it('returns principal-unresolved: missing-oid when actor has no hbcUserId', async () => {
    const resolve = buildResolver();
    const result = await resolve(context({ hbcUserId: undefined }));
    expect(result).toEqual({ status: 'principal-unresolved', reason: 'missing-oid' });
  });

  it('returns configuration-required with pendingStoreSelection: true when the grant store is not wired', async () => {
    const resolve = buildResolver({
      grantStore: { readiness: 'configuration-required', reason: 'production-store-not-selected' },
    });
    const result = await resolve(context());
    expect(result.status).toBe('configuration-required');
    if (result.status !== 'configuration-required') return;
    expect(result.pendingStoreSelection).toBe(true);
  });

  it('returns source-unavailable when grant store findGrant throws', async () => {
    const store: IAdobeSignGrantStore = {
      async upsertGrant() {},
      async findGrant() {
        throw new Error('table outage');
      },
      async markReauthorizationRequired() {},
      async markRevoked() {},
    };
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });
    const result = await resolve(context());
    expect(result).toEqual({ status: 'source-unavailable', reason: 'token-store-unavailable' });
  });
});

describe('createAdobeSignPrincipalResolver — grant-state branches', () => {
  it('no grant on file → authorization-required: no-grant-found', async () => {
    const resolve = buildResolver();
    const result = await resolve(context());
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('no-grant-found');
    expect(result.actor.actorKey).toBe(ACTOR_KEY);
  });

  it('grant.state === "revoked" → authorization-required: grant-revoked', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(
      baseGrant({ state: 'revoked', revokedAtUtc: '2026-05-13T11:00:00.000Z' }),
    );
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });
    const result = await resolve(context());
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('grant-revoked');
  });

  it('grant.state === "requires-reauth" → authorization-required: grant-requires-reauth', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant({ state: 'requires-reauth' }));
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });
    const result = await resolve(context());
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('grant-requires-reauth');
  });

  it('grant.state === "pending" → authorization-required: no-grant-found', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant({ state: 'pending' }));
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });
    const result = await resolve(context());
    expect(result.status).toBe('authorization-required');
    if (result.status !== 'authorization-required') return;
    expect(result.reason).toBe('no-grant-found');
  });

  it('grant.state === "active" → resolved with principal + grantPublic projection', async () => {
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant());
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });
    const result = await resolve(context());
    expect(result.status).toBe('resolved');
    if (result.status !== 'resolved') return;
    expect(result.principal.actor.actorKey).toBe(ACTOR_KEY);
    expect(result.principal.adobeApiAccessPoint).toBe('https://api.na1.adobesign.com');
    expect(result.principal.adobeWebAccessPoint).toBe('https://secure.na1.adobesign.com');
    expect(result.principal.grantedScopes).toEqual(['agreement_read:self']);
    expect(result.principal.grantState).toBe('active');
    // grantPublic projection strips secret material — never carries the
    // encryptedRefreshTokenRef.
    expect(result.grantPublic).not.toHaveProperty('encryptedRefreshTokenRef');
    expect(result.grantPublic.actorKey).toBe(ACTOR_KEY);
  });
});

describe('createAdobeSignPrincipalResolver — no shared-principal fallback', () => {
  it('two different actors against the same grant store get distinct outcomes', async () => {
    const otherOid = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';
    const store = createDeterministicMockGrantStore();
    await store.upsertGrant(baseGrant()); // grant for OID only
    const resolve = buildResolver({ grantStore: { readiness: 'ready', store } });

    const owner = await resolve(context());
    const stranger = await resolve(context({ hbcUserId: otherOid }));

    expect(owner.status).toBe('resolved');
    expect(stranger.status).toBe('authorization-required');
    if (stranger.status !== 'authorization-required') return;
    expect(stranger.reason).toBe('no-grant-found');
    expect(stranger.actor.actorKey).toBe(adobeSignActorKey(TENANT, otherOid));
  });
});
