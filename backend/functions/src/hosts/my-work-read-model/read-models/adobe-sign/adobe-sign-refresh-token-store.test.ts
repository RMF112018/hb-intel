import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { AdobeSignRuntimeDiagnosticError } from './adobe-sign-runtime-diagnostics.js';
import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import { ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV } from './adobe-sign-refresh-token-crypto.js';
import {
  ADOBE_SIGN_REFRESH_TOKEN_PARTITION,
  createDeterministicMockAdobeSignRefreshTokenStore,
  resolveAdobeSignRefreshTokenStore,
  TableAdobeSignRefreshTokenStore,
} from './adobe-sign-refresh-token-store.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);
const NOW = new Date('2026-05-13T12:00:00.000Z');
const ENVELOPE = {
  cipherVersion: 1 as const,
  iv: Buffer.alloc(12, 1).toString('base64url'),
  authTag: Buffer.alloc(16, 2).toString('base64url'),
  ciphertext: Buffer.alloc(64, 3).toString('base64url'),
};
const VALID_KEY_B64 = Buffer.from(randomBytes(32)).toString('base64');

// Minimal in-memory TableClient stand-in covering the methods the store uses.
type Captured = Record<string, unknown> & { partitionKey: string; rowKey: string };
function createFakeTableClient(opts?: { getError?: unknown }) {
  const rows = new Map<string, Captured>();
  return {
    rows,
    createTable: async () => undefined,
    upsertEntity: async (entity: Captured) => {
      rows.set(`${entity.partitionKey}|${entity.rowKey}`, { ...entity });
    },
    getEntity: async <T>(partitionKey: string, rowKey: string): Promise<T> => {
      if (opts?.getError) throw opts.getError;
      const e = rows.get(`${partitionKey}|${rowKey}`);
      if (!e) {
        const err = new Error('not found') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }
      return e as unknown as T;
    },
    deleteEntity: async (partitionKey: string, rowKey: string) => {
      rows.delete(`${partitionKey}|${rowKey}`);
    },
  };
}

function createThrowingTableClient(opts: {
  createTableError?: unknown;
  getError?: unknown;
  upsertError?: unknown;
  deleteError?: unknown;
}) {
  return {
    createTable: async () => {
      if (opts.createTableError) throw opts.createTableError;
    },
    upsertEntity: async () => {
      if (opts.upsertError) throw opts.upsertError;
    },
    getEntity: async () => {
      if (opts.getError) throw opts.getError;
      const err = new Error('not found') as Error & { statusCode: number };
      err.statusCode = 404;
      throw err;
    },
    deleteEntity: async () => {
      if (opts.deleteError) throw opts.deleteError;
    },
  };
}

describe('createDeterministicMockAdobeSignRefreshTokenStore', () => {
  it('round-trips ciphertext keyed by actor', async () => {
    const store = createDeterministicMockAdobeSignRefreshTokenStore();
    const ref = await store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW);
    expect(ref.storeKind).toBe('table-storage');
    expect(ref.address).toBe(ACTOR_KEY);
    expect(ref.lastPersistedAtUtc).toBe(NOW.toISOString());

    const round = await store.getCiphertext(ref);
    expect(round).toEqual(ENVELOPE);
  });

  it('returns undefined for an unknown actor', async () => {
    const store = createDeterministicMockAdobeSignRefreshTokenStore();
    const result = await store.getCiphertext({ storeKind: 'table-storage', address: 'unknown' });
    expect(result).toBeUndefined();
  });

  it('deletes ciphertext idempotently', async () => {
    const store = createDeterministicMockAdobeSignRefreshTokenStore();
    const ref = await store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW);
    await store.deleteCiphertext(ref);
    await store.deleteCiphertext(ref); // second call is a no-op
    expect(await store.getCiphertext(ref)).toBeUndefined();
  });
});

describe('resolveAdobeSignRefreshTokenStore', () => {
  it('returns the mock store in test mode', () => {
    const r = resolveAdobeSignRefreshTokenStore({ NODE_ENV: 'test' });
    expect(r.readiness).toBe('ready');
  });

  it('returns the mock store in mock-adapter mode', () => {
    const r = resolveAdobeSignRefreshTokenStore({ HBC_ADAPTER_MODE: 'mock' });
    expect(r.readiness).toBe('ready');
  });

  it('returns production-store-not-selected when no store mode is configured', () => {
    const r = resolveAdobeSignRefreshTokenStore({ NODE_ENV: 'production' });
    expect(r.readiness).toBe('configuration-required');
    if (r.readiness !== 'configuration-required') return;
    expect(r.reason).toBe('production-store-not-selected');
  });

  it('returns missing-table-endpoint when table-storage is selected but AZURE_TABLE_ENDPOINT is absent', () => {
    const r = resolveAdobeSignRefreshTokenStore({
      NODE_ENV: 'production',
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: VALID_KEY_B64,
    });
    expect(r.readiness).toBe('configuration-required');
    if (r.readiness !== 'configuration-required') return;
    expect(r.reason).toBe('missing-table-endpoint');
    expect(r.missing).toEqual(['AZURE_TABLE_ENDPOINT']);
  });

  it('returns missing-encryption-key when table-storage is selected but the cipher key is absent', () => {
    const r = resolveAdobeSignRefreshTokenStore({
      NODE_ENV: 'production',
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
    });
    expect(r.readiness).toBe('configuration-required');
    if (r.readiness !== 'configuration-required') return;
    expect(r.reason).toBe('missing-encryption-key');
    expect(r.missing).toEqual([ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]);
  });

  it('returns invalid-encryption-key when the cipher key decodes to the wrong length', () => {
    const r = resolveAdobeSignRefreshTokenStore({
      NODE_ENV: 'production',
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
      [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: Buffer.alloc(16).toString('base64'),
    });
    expect(r.readiness).toBe('configuration-required');
    if (r.readiness !== 'configuration-required') return;
    expect(r.reason).toBe('invalid-encryption-key');
  });

  it('returns ready when every prerequisite is satisfied', () => {
    // `createAppTableClient` reads `process.env.AZURE_TABLE_ENDPOINT` directly,
    // so we set it on process.env for this case and clean up after.
    const previous = process.env.AZURE_TABLE_ENDPOINT;
    process.env.AZURE_TABLE_ENDPOINT = 'https://example.table.core.windows.net';
    try {
      const r = resolveAdobeSignRefreshTokenStore({
        NODE_ENV: 'production',
        ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
        AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
        [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV]: VALID_KEY_B64,
      });
      expect(r.readiness).toBe('ready');
    } finally {
      if (previous === undefined) delete process.env.AZURE_TABLE_ENDPOINT;
      else process.env.AZURE_TABLE_ENDPOINT = previous;
    }
  });
});

describe('TableAdobeSignRefreshTokenStore', () => {
  it('persists the envelope under the canonical partition + actor row key', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignRefreshTokenStore(
      fake as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    const ref = await store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW);
    expect(ref.storeKind).toBe('table-storage');
    expect(ref.address).toBe(ACTOR_KEY);
    expect(ref.lastPersistedAtUtc).toBe(NOW.toISOString());

    const stored = fake.rows.get(`${ADOBE_SIGN_REFRESH_TOKEN_PARTITION}|${ACTOR_KEY}`);
    expect(stored?.iv).toBe(ENVELOPE.iv);
    expect(stored?.authTag).toBe(ENVELOPE.authTag);
    expect(stored?.ciphertext).toBe(ENVELOPE.ciphertext);
    expect(stored?.cipherVersion).toBe(1);
  });

  it('round-trips envelope fields via getCiphertext', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignRefreshTokenStore(
      fake as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    const ref = await store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW);
    const got = await store.getCiphertext(ref);
    expect(got).toEqual(ENVELOPE);
  });

  it('returns undefined when the entity does not exist (404)', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignRefreshTokenStore(
      fake as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    const got = await store.getCiphertext({
      storeKind: 'table-storage',
      address: 'never-written',
    });
    expect(got).toBeUndefined();
  });

  it('deleteCiphertext is idempotent against a missing row', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignRefreshTokenStore(
      fake as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    await expect(
      store.deleteCiphertext({ storeKind: 'table-storage', address: 'never-written' }),
    ).resolves.toBeUndefined();
  });

  it('does not persist the raw cipher key or actor-claim metadata', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignRefreshTokenStore(
      fake as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    await store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW);
    const stored = fake.rows.get(`${ADOBE_SIGN_REFRESH_TOKEN_PARTITION}|${ACTOR_KEY}`);
    expect(Object.keys(stored ?? {}).sort()).toEqual(
      [
        'authTag',
        'cipherVersion',
        'ciphertext',
        'iv',
        'lastPersistedAtUtc',
        'partitionKey',
        'rowKey',
      ].sort(),
    );
  });

  it('classifies createTable failures as diagnostic errors', async () => {
    const err = Object.assign(new Error('Forbidden'), { statusCode: 403, code: 'AuthorizationFailed' });
    const store = new TableAdobeSignRefreshTokenStore(
      createThrowingTableClient({ createTableError: err }) as unknown as ConstructorParameters<
        typeof TableAdobeSignRefreshTokenStore
      >[0],
    );
    await expect(store.getCiphertext({ storeKind: 'table-storage', address: ACTOR_KEY })).rejects.toBeInstanceOf(
      AdobeSignRuntimeDiagnosticError,
    );
    await expect(store.getCiphertext({ storeKind: 'table-storage', address: ACTOR_KEY })).rejects.toMatchObject({
      diagnostic: {
        operation: 'get-ciphertext',
        stage: 'create-table',
        errorClass: 'auth-forbidden',
      },
    });
  });

  it('classifies put failures as diagnostic errors', async () => {
    const store = new TableAdobeSignRefreshTokenStore(
      createThrowingTableClient({
        upsertError: Object.assign(new Error('request timed out'), { code: 'ETIMEDOUT' }),
      }) as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    await expect(store.putCiphertext(ACTOR_KEY, ENVELOPE, NOW)).rejects.toMatchObject({
      diagnostic: {
        operation: 'put-ciphertext',
        stage: 'upsert-entity',
        errorClass: 'timeout',
      },
    });
  });

  it('classifies get non-404 failures as diagnostic errors', async () => {
    const store = new TableAdobeSignRefreshTokenStore(
      createThrowingTableClient({
        getError: Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
      }) as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    await expect(store.getCiphertext({ storeKind: 'table-storage', address: ACTOR_KEY })).rejects.toMatchObject({
      diagnostic: {
        operation: 'get-ciphertext',
        stage: 'get-entity',
        errorClass: 'auth-unauthorized',
      },
    });
  });

  it('classifies delete non-404 failures as diagnostic errors', async () => {
    const store = new TableAdobeSignRefreshTokenStore(
      createThrowingTableClient({
        deleteError: Object.assign(new Error('invalid input payload')),
      }) as unknown as ConstructorParameters<typeof TableAdobeSignRefreshTokenStore>[0],
    );
    await expect(store.deleteCiphertext({ storeKind: 'table-storage', address: ACTOR_KEY })).rejects.toMatchObject({
      diagnostic: {
        operation: 'delete-ciphertext',
        stage: 'delete-entity',
        errorClass: 'invalid-input',
      },
    });
  });
});
