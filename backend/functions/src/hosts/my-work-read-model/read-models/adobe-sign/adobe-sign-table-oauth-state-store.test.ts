import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { AdobeSignOAuthStateRecord } from './adobe-sign-oauth-state.js';
import {
  ADOBE_SIGN_OAUTH_STATE_PARTITION,
  TableAdobeSignOAuthStateStore,
} from './adobe-sign-table-oauth-state-store.js';

const ACTOR_KEY = adobeSignActorKey(
  '11111111-2222-3333-4444-555555555555',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
);
const RAW_STATE = 'opaque-state-value-do-not-persist';
const HASH = createHash('sha256').update(RAW_STATE, 'utf8').digest('base64url');

const recordFixture = (
  overrides: Partial<AdobeSignOAuthStateRecord> = {},
): AdobeSignOAuthStateRecord => ({
  stateValue: RAW_STATE,
  actorKey: ACTOR_KEY,
  returnPath: '/SitePages/MyDashboard.aspx',
  createdAtUtc: '2026-05-13T12:00:00.000Z',
  expiresAtUtc: '2026-05-13T12:10:00.000Z',
  ...overrides,
});

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  etag: string;
  data: Record<string, unknown>;
}

interface FakeHarness {
  rows: Map<string, FakeRow>;
  createCalls: Record<string, unknown>[];
  failNextUpdateWith: number | undefined;
  client: ConstructorParameters<typeof TableAdobeSignOAuthStateStore>[0];
}

function createFakeTableClient(): FakeHarness {
  const rows = new Map<string, FakeRow>();
  const createCalls: Record<string, unknown>[] = [];
  let etagSeq = 0;
  const harness: FakeHarness = {
    rows,
    createCalls,
    failNextUpdateWith: undefined,
    client: undefined as unknown as FakeHarness['client'],
  };
  const fake = {
    createTable: async () => undefined,
    createEntity: async (entity: Record<string, unknown>) => {
      createCalls.push({ ...entity });
      etagSeq++;
      const key = `${entity.partitionKey as string}|${entity.rowKey as string}`;
      rows.set(key, {
        partitionKey: entity.partitionKey as string,
        rowKey: entity.rowKey as string,
        etag: `W/"etag-${etagSeq}"`,
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
      return { ...row.data, etag: row.etag } as unknown as T;
    },
    updateEntity: async (
      entity: Record<string, unknown>,
      _mode: unknown,
      opts?: { etag?: string },
    ) => {
      if (harness.failNextUpdateWith !== undefined) {
        const status = harness.failNextUpdateWith;
        harness.failNextUpdateWith = undefined;
        const err = new Error('forced') as Error & { statusCode: number };
        err.statusCode = status;
        throw err;
      }
      const key = `${entity.partitionKey as string}|${entity.rowKey as string}`;
      const existing = rows.get(key);
      if (!existing) {
        const err = new Error('not found') as Error & { statusCode: number };
        err.statusCode = 404;
        throw err;
      }
      if (opts?.etag !== undefined && opts.etag !== existing.etag) {
        const err = new Error('etag mismatch') as Error & { statusCode: number };
        err.statusCode = 412;
        throw err;
      }
      etagSeq++;
      rows.set(key, {
        partitionKey: existing.partitionKey,
        rowKey: existing.rowKey,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
    deleteEntity: async (partitionKey: string, rowKey: string) => {
      rows.delete(`${partitionKey}|${rowKey}`);
    },
  };
  harness.client = fake as unknown as FakeHarness['client'];
  return harness;
}

describe('TableAdobeSignOAuthStateStore', () => {
  it('stores rows keyed by sha256(stateValue) and never persists the raw state value', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    const record = recordFixture();
    await store.put(record);

    expect(fake.rows.has(`${ADOBE_SIGN_OAUTH_STATE_PARTITION}|${HASH}`)).toBe(true);
    const stored = fake.rows.get(`${ADOBE_SIGN_OAUTH_STATE_PARTITION}|${HASH}`);
    expect(stored?.data.actorKey).toBe(ACTOR_KEY);
    expect(stored?.data.returnPath).toBe(record.returnPath);
    // Raw state must never appear in the persisted row.
    const serialized = JSON.stringify(stored);
    expect(serialized).not.toContain(RAW_STATE);
    // Same guard against the createEntity call payload.
    expect(JSON.stringify(fake.createCalls)).not.toContain(RAW_STATE);
  });

  it('round-trips put → take with a valid window', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    await store.put(recordFixture());
    const result = await store.take(RAW_STATE, new Date('2026-05-13T12:05:00.000Z'));
    expect(result.outcome).toBe('valid');
    if (result.outcome !== 'valid') return;
    expect(result.record.actorKey).toBe(ACTOR_KEY);
    expect(result.record.returnPath).toBe('/SitePages/MyDashboard.aspx');
    // Caller's stateValue is round-tripped, but the store never sourced it from a column.
    expect(result.record.stateValue).toBe(RAW_STATE);
  });

  it('returns "consumed" on a second take for the same state', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    await store.put(recordFixture());
    const first = await store.take(RAW_STATE, new Date('2026-05-13T12:05:00.000Z'));
    expect(first.outcome).toBe('valid');
    const second = await store.take(RAW_STATE, new Date('2026-05-13T12:05:30.000Z'));
    expect(second.outcome).toBe('consumed');
  });

  it('returns "expired" past the expiry window and removes the row', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    await store.put(recordFixture());
    const result = await store.take(RAW_STATE, new Date('2026-05-13T12:20:00.000Z'));
    expect(result.outcome).toBe('expired');
    expect(fake.rows.has(`${ADOBE_SIGN_OAUTH_STATE_PARTITION}|${HASH}`)).toBe(false);
  });

  it('returns "missing" for an unknown state', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    const result = await store.take('never-issued', new Date('2026-05-13T12:05:00.000Z'));
    expect(result.outcome).toBe('missing');
  });

  it('returns "consumed" when an ETag mismatch occurs during update (race lost)', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    await store.put(recordFixture());
    fake.failNextUpdateWith = 412;
    const result = await store.take(RAW_STATE, new Date('2026-05-13T12:05:00.000Z'));
    expect(result.outcome).toBe('consumed');
  });

  it('returns "store-unavailable" on a transient update failure', async () => {
    const fake = createFakeTableClient();
    const store = new TableAdobeSignOAuthStateStore(fake.client);
    await store.put(recordFixture());
    fake.failNextUpdateWith = 503;
    const result = await store.take(RAW_STATE, new Date('2026-05-13T12:05:00.000Z'));
    expect(result.outcome).toBe('store-unavailable');
    if (result.outcome !== 'store-unavailable') return;
    expect(result.reason).toBe('transient');
  });
});
