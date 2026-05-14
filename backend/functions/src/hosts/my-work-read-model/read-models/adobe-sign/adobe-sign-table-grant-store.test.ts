import { describe, expect, it } from 'vitest';

import { AdobeSignRuntimeDiagnosticError } from './adobe-sign-runtime-diagnostics.js';
import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';
import { TableAdobeSignGrantStore } from './adobe-sign-table-grant-store.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);

const baseGrant = (overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord => ({
  actorTenantId: TENANT,
  actorOid: OID,
  actorKey: ACTOR_KEY,
  upnSnapshot: 'user@example.com',
  displayNameSnapshot: 'User One',
  adobeApiAccessPoint: 'https://api.na1.adobesign.com',
  adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
  encryptedRefreshTokenRef: {
    storeKind: 'table-storage',
    address: ACTOR_KEY,
    lastPersistedAtUtc: '2026-05-13T12:00:00.000Z',
  },
  grantedScopes: ['agreement_read', 'agreement_send'],
  grantedAtUtc: '2026-05-13T12:00:00.000Z',
  state: 'active',
  ...overrides,
});

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  data: Record<string, unknown>;
}

function createFakeTableClient() {
  const rows = new Map<string, FakeRow>();
  return {
    rows,
    client: {
      createTable: async () => undefined,
      upsertEntity: async (entity: Record<string, unknown>) => {
        const key = `${entity.partitionKey as string}|${entity.rowKey as string}`;
        rows.set(key, {
          partitionKey: entity.partitionKey as string,
          rowKey: entity.rowKey as string,
          data: { ...entity },
        });
      },
      getEntity: async <T>(partitionKey: string, rowKey: string): Promise<T> => {
        const row = rows.get(`${partitionKey}|${rowKey}`);
        if (!row) {
          const err = new Error('not found') as Error & { statusCode: number };
          err.statusCode = 404;
          throw err;
        }
        return row.data as unknown as T;
      },
    } as unknown as ConstructorParameters<typeof TableAdobeSignGrantStore>[0],
  };
}

function createThrowingTableClient(options: {
  createTableError?: unknown;
  getEntityError?: unknown;
  upsertEntityError?: unknown;
}) {
  return {
    createTable: async () => {
      if (options.createTableError) throw options.createTableError;
    },
    upsertEntity: async () => {
      if (options.upsertEntityError) throw options.upsertEntityError;
    },
    getEntity: async () => {
      if (options.getEntityError) throw options.getEntityError;
      const err = new Error('not found') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    },
  } as unknown as ConstructorParameters<typeof TableAdobeSignGrantStore>[0];
}

describe('TableAdobeSignGrantStore', () => {
  it('round-trips upsert → find with all required + optional fields preserved', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.upsertGrant(baseGrant());
    const found = await store.findGrant(ACTOR_KEY);
    expect(found).toBeDefined();
    if (!found) return;
    expect(found.actorTenantId).toBe(TENANT);
    expect(found.actorOid).toBe(OID);
    expect(found.actorKey).toBe(ACTOR_KEY);
    expect(found.state).toBe('active');
    expect(found.grantedScopes).toEqual(['agreement_read', 'agreement_send']);
    expect(found.encryptedRefreshTokenRef.storeKind).toBe('table-storage');
    expect(found.encryptedRefreshTokenRef.address).toBe(ACTOR_KEY);
    expect(found.encryptedRefreshTokenRef.lastPersistedAtUtc).toBe('2026-05-13T12:00:00.000Z');
    expect(found.upnSnapshot).toBe('user@example.com');
  });

  it('returns undefined for an unknown actor (404 tolerant)', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    const found = await store.findGrant(
      adobeSignActorKey(TENANT, 'no-such-oid-uuid-0000-000000000000'),
    );
    expect(found).toBeUndefined();
  });

  it('persists partition/row keys lowercased from the actor key', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.upsertGrant(baseGrant());
    // The actorKey is already lowercased by `adobeSignActorKey(...)`, so the
    // partition/row keys we wrote should match the tenant/oid pair.
    const key = `${TENANT.toLowerCase()}|${OID.toLowerCase()}`;
    expect(fake.rows.has(key)).toBe(true);
  });

  it('marks an existing grant as requires-reauth and records failure metadata', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.upsertGrant(baseGrant());
    await store.markReauthorizationRequired(ACTOR_KEY, {
      kind: 'refresh-failed',
      observedAtUtc: '2026-05-13T13:00:00.000Z',
      message: 'non-secret diagnostic',
    });
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.state).toBe('requires-reauth');
    expect(found?.failureMetadata?.kind).toBe('refresh-failed');
    expect(found?.failureMetadata?.observedAtUtc).toBe('2026-05-13T13:00:00.000Z');
    expect(found?.failureMetadata?.message).toBe('non-secret diagnostic');
  });

  it('markReauthorizationRequired is a no-op when no grant exists', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.markReauthorizationRequired(ACTOR_KEY);
    expect(fake.rows.size).toBe(0);
  });

  it('marks an existing grant as revoked and stamps revokedAtUtc', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.upsertGrant(baseGrant());
    await store.markRevoked(ACTOR_KEY, '2026-05-13T14:00:00.000Z');
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.state).toBe('revoked');
    expect(found?.revokedAtUtc).toBe('2026-05-13T14:00:00.000Z');
  });

  it('markRevoked is a no-op when no grant exists', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.markRevoked(ACTOR_KEY, '2026-05-13T14:00:00.000Z');
    expect(fake.rows.size).toBe(0);
  });

  it('writes columns only — no token plaintext or nested-object leakage', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    await store.upsertGrant(baseGrant());
    const stored = fake.rows.get(`${TENANT.toLowerCase()}|${OID.toLowerCase()}`)?.data;
    expect(stored).toBeDefined();
    if (!stored) return;
    // Closed column set — no nested `encryptedRefreshTokenRef` or `failureMetadata` objects.
    expect(stored).not.toHaveProperty('encryptedRefreshTokenRef');
    expect(stored).not.toHaveProperty('failureMetadata');
    expect(typeof stored.grantedScopesJson).toBe('string');
    expect(stored.encryptedRefreshTokenRefStoreKind).toBe('table-storage');
    expect(stored.encryptedRefreshTokenRefAddress).toBe(ACTOR_KEY);
  });

  it('rehydrates missing optional columns as absent on the record', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignGrantStore(fake.client);
    const minimal = baseGrant({
      upnSnapshot: undefined,
      displayNameSnapshot: undefined,
      encryptedRefreshTokenRef: { storeKind: 'pending-selection', address: '' },
    });
    await store.upsertGrant(minimal);
    const found = await store.findGrant(ACTOR_KEY);
    expect(found?.upnSnapshot).toBeUndefined();
    expect(found?.displayNameSnapshot).toBeUndefined();
    expect(found?.encryptedRefreshTokenRef.lastPersistedAtUtc).toBeUndefined();
  });

  it('classifies createTable failures as diagnostic errors', async () => {
    const err = Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'AuthorizationFailed' });
    const store = new TableAdobeSignGrantStore(
      createThrowingTableClient({
        createTableError: err,
      }),
    );
    await expect(store.findGrant(ACTOR_KEY)).rejects.toBeInstanceOf(AdobeSignRuntimeDiagnosticError);
    await expect(store.findGrant(ACTOR_KEY)).rejects.toMatchObject({
      diagnostic: {
        operation: 'find-grant',
        stage: 'create-table',
        errorClass: 'auth-forbidden',
      },
    });
  });

  it('classifies getEntity non-404 failures as diagnostic errors', async () => {
    const err = Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'Unauthorized' });
    const store = new TableAdobeSignGrantStore(
      createThrowingTableClient({
        getEntityError: err,
      }),
    );
    await expect(store.findGrant(ACTOR_KEY)).rejects.toMatchObject({
      diagnostic: {
        operation: 'find-grant',
        stage: 'get-entity',
        errorClass: 'auth-unauthorized',
      },
    });
  });

  it('classifies upsertEntity failures as diagnostic errors', async () => {
    const err = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' });
    const store = new TableAdobeSignGrantStore(
      createThrowingTableClient({
        upsertEntityError: err,
      }),
    );
    await expect(store.upsertGrant(baseGrant())).rejects.toMatchObject({
      diagnostic: {
        operation: 'upsert-grant',
        stage: 'upsert-entity',
        errorClass: 'network',
      },
    });
  });
});
