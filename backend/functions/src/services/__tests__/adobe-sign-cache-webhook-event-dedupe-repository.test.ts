import { describe, expect, it, vi } from 'vitest';
import type { TableClient } from '@azure/data-tables';

import {
  AdobeSignWebhookEventDedupeRepository,
  composeAdobeSignWebhookEventDedupeRepository,
} from '../adobe-sign-cache/webhook-event-dedupe-repository.js';

interface FakeStoredRow {
  entity: Record<string, unknown>;
  etag: string;
}

class RestErrorLike extends Error {
  readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Minimal ETag-aware in-memory TableClient stand-in. Implements only the
 * subset of methods used by the dedupe + lease repositories:
 *   - createEntity (409 on key collision)
 *   - getEntity    (404 on miss; returns entity with .etag attached)
 *   - updateEntity ('Replace' with optional etag; 412 on mismatch)
 *   - deleteEntity (optional etag; 412 on mismatch; 404 on miss)
 *   - listEntities (filter-aware for `ExpiresUtc lt '<iso>'`)
 *
 * Not a full Azure SDK replica — just enough to verify repository logic.
 */
function createFakeTableClient(): TableClient {
  const store = new Map<string, FakeStoredRow>();
  let etagSeq = 0;
  const nextEtag = (): string => {
    etagSeq += 1;
    return `etag-${etagSeq}`;
  };
  const composeKey = (partitionKey: string, rowKey: string): string => `${partitionKey}::${rowKey}`;

  const fake = {
    async createEntity(entity: Record<string, unknown>): Promise<unknown> {
      const key = composeKey(String(entity.partitionKey), String(entity.rowKey));
      if (store.has(key)) {
        throw new RestErrorLike(409, 'EntityAlreadyExists');
      }
      store.set(key, { entity: { ...entity }, etag: nextEtag() });
      return {};
    },
    async getEntity<T>(partitionKey: string, rowKey: string): Promise<T> {
      const row = store.get(composeKey(partitionKey, rowKey));
      if (!row) throw new RestErrorLike(404, 'ResourceNotFound');
      return { ...row.entity, etag: row.etag } as T;
    },
    async updateEntity(
      entity: Record<string, unknown>,
      mode: 'Merge' | 'Replace',
      options?: { etag?: string },
    ): Promise<unknown> {
      const key = composeKey(String(entity.partitionKey), String(entity.rowKey));
      const row = store.get(key);
      if (!row) throw new RestErrorLike(404, 'ResourceNotFound');
      if (options?.etag !== undefined && options.etag !== row.etag) {
        throw new RestErrorLike(412, 'UpdateConditionNotSatisfied');
      }
      const merged = mode === 'Merge' ? { ...row.entity, ...entity } : { ...entity };
      store.set(key, { entity: merged, etag: nextEtag() });
      return {};
    },
    async deleteEntity(
      partitionKey: string,
      rowKey: string,
      options?: { etag?: string },
    ): Promise<unknown> {
      const key = composeKey(partitionKey, rowKey);
      const row = store.get(key);
      if (!row) throw new RestErrorLike(404, 'ResourceNotFound');
      if (options?.etag !== undefined && options.etag !== row.etag) {
        throw new RestErrorLike(412, 'UpdateConditionNotSatisfied');
      }
      store.delete(key);
      return {};
    },
    listEntities(options?: { queryOptions?: { filter?: string } }): AsyncIterableIterator<unknown> {
      const filter = options?.queryOptions?.filter ?? '';
      // Parse `<Property> lt '<iso>'`
      const ltMatch = filter.match(/^(\w+)\s+lt\s+'([^']+)'$/);
      const filtered: Record<string, unknown>[] = [];
      for (const { entity, etag } of store.values()) {
        if (ltMatch) {
          const [, propertyName, value] = ltMatch;
          const observed = entity[propertyName];
          if (typeof observed === 'string' && observed < value) {
            filtered.push({ ...entity, etag });
          }
          continue;
        }
        filtered.push({ ...entity, etag });
      }
      let i = 0;
      const iterator: AsyncIterableIterator<unknown> = {
        async next(): Promise<IteratorResult<unknown>> {
          if (i >= filtered.length) return { value: undefined, done: true };
          const value = filtered[i];
          i += 1;
          return { value, done: false };
        },
        [Symbol.asyncIterator](): AsyncIterableIterator<unknown> {
          return iterator;
        },
      };
      return iterator;
    },
    async createTable(): Promise<unknown> {
      return {};
    },
  };
  return fake as unknown as TableClient;
}

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');

describe('AdobeSignWebhookEventDedupeRepository.tryReserve', () => {
  it("returns 'reserved' on first write and writes the expected entity shape", async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    const outcome = await repo.tryReserve({
      subscriptionKey: 'sub-1',
      dedupeKey: 'evt-1',
      providerEventType: 'AGREEMENT_SIGNED',
      agreementId: 'agr-1',
      bodyHashSha256: 'abc',
      ttlDays: 14,
    });
    expect(outcome).toBe('reserved');

    const found = await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1' });
    expect(found).toMatchObject({
      subscriptionKey: 'sub-1',
      dedupeKey: 'evt-1',
      providerEventType: 'AGREEMENT_SIGNED',
      agreementId: 'agr-1',
      bodyHashSha256: 'abc',
    });
    // 14 days from FIXED_NOW
    const expectedExpiry = new Date(FIXED_NOW.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(found?.expiresUtc).toBe(expectedExpiry);
  });

  it("returns 'duplicate' on second tryReserve with the same key", async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    const reservation = { subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: 14 };
    expect(await repo.tryReserve(reservation)).toBe('reserved');
    expect(await repo.tryReserve(reservation)).toBe('duplicate');
  });

  it('persists optional fields as empty string when not supplied (round-trip null-vs-empty discipline)', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    await repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: 14 });
    const found = await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1' });
    expect(found?.providerEventType).toBeUndefined();
    expect(found?.agreementId).toBeUndefined();
    expect(found?.bodyHashSha256).toBeUndefined();
  });

  it('rejects non-positive ttlDays', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    await expect(
      repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: 0 }),
    ).rejects.toThrow(/ttlDays/);
    await expect(
      repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: -1 }),
    ).rejects.toThrow(/ttlDays/);
  });

  it('rejects empty subscriptionKey or dedupeKey', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    await expect(
      repo.tryReserve({ subscriptionKey: '', dedupeKey: 'evt-1', ttlDays: 14 }),
    ).rejects.toThrow(/must be non-empty/);
    await expect(
      repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: '', ttlDays: 14 }),
    ).rejects.toThrow(/must be non-empty/);
  });
});

describe('AdobeSignWebhookEventDedupeRepository.findActive', () => {
  it('returns null for a missing row', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    expect(await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'missing' })).toBeNull();
  });

  it('returns null for an expired row even if not yet purged', async () => {
    const client = createFakeTableClient();
    let now = new Date('2026-05-01T00:00:00.000Z');
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => now });
    await repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: 14 });
    // Advance the clock past expiry (14 days + 1 second).
    now = new Date('2026-05-15T00:00:01.000Z');
    expect(await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1' })).toBeNull();
  });
});

describe('AdobeSignWebhookEventDedupeRepository.deleteExpired', () => {
  it('deletes only expired rows; preserves active rows', async () => {
    const client = createFakeTableClient();
    let now = new Date('2026-05-01T00:00:00.000Z');
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => now });
    // Row A: expires in 14 days.
    await repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-A', ttlDays: 14 });
    // Advance clock; Row B: expires 14 days from new now.
    now = new Date('2026-05-20T00:00:00.000Z');
    await repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-B', ttlDays: 14 });
    // Advance clock to one second after Row A expired (Row A's expiry = 2026-05-15T00:00:00).
    now = new Date('2026-05-16T00:00:00.000Z');
    const { deleted } = await repo.deleteExpired(now);
    expect(deleted).toBe(1);
    expect(await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'evt-A' })).toBeNull();
    expect(await repo.findActive({ subscriptionKey: 'sub-1', dedupeKey: 'evt-B' })).not.toBeNull();
  });

  it('returns deleted=0 when no rows are expired', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignWebhookEventDedupeRepository({ client, now: () => FIXED_NOW });
    await repo.tryReserve({ subscriptionKey: 'sub-1', dedupeKey: 'evt-1', ttlDays: 14 });
    const { deleted } = await repo.deleteExpired(FIXED_NOW);
    expect(deleted).toBe(0);
  });
});

describe('composeAdobeSignWebhookEventDedupeRepository', () => {
  const FULL_CACHE_ENV = {
    ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME: 'AdobeSignWebhookEventDedupe',
    AZURE_TABLE_ENDPOINT: 'https://hbintelstorage.table.core.windows.net/',
  };

  it("returns 'configuration-required' when ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME is unset", () => {
    const composition = composeAdobeSignWebhookEventDedupeRepository({});
    expect(composition.status).toBe('configuration-required');
    if (composition.status === 'configuration-required') {
      expect(composition.reason).toBe('table-name-not-configured');
    }
  });

  it("returns 'configuration-required' when AZURE_TABLE_ENDPOINT is unset", () => {
    const composition = composeAdobeSignWebhookEventDedupeRepository({
      ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME: 'AdobeSignWebhookEventDedupe',
    });
    expect(composition.status).toBe('configuration-required');
    if (composition.status === 'configuration-required') {
      expect(composition.reason).toBe('table-endpoint-not-configured');
    }
  });

  it("returns 'ready' with the injected table client when buildTableClient is supplied", () => {
    const stub = createFakeTableClient();
    const composition = composeAdobeSignWebhookEventDedupeRepository(FULL_CACHE_ENV, {
      buildTableClient: () => stub,
    });
    expect(composition.status).toBe('ready');
    if (composition.status === 'ready') {
      expect(composition.tableName).toBe('AdobeSignWebhookEventDedupe');
      expect(composition.repository).toBeInstanceOf(AdobeSignWebhookEventDedupeRepository);
    }
  });

  it('carries the default retentionDays=14 when tuning env is unset', () => {
    const composition = composeAdobeSignWebhookEventDedupeRepository(FULL_CACHE_ENV, {
      buildTableClient: () => createFakeTableClient(),
    });
    expect(composition.status).toBe('ready');
    if (composition.status === 'ready') {
      expect(composition.retentionDays).toBe(14);
    }
  });

  it('honors the env override of ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS', () => {
    const composition = composeAdobeSignWebhookEventDedupeRepository(
      { ...FULL_CACHE_ENV, ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS: '30' },
      { buildTableClient: () => createFakeTableClient() },
    );
    expect(composition.status).toBe('ready');
    if (composition.status === 'ready') {
      expect(composition.retentionDays).toBe(30);
    }
  });

  it('passes the resolved tableName to the injected buildTableClient', () => {
    const factorySpy = vi.fn(() => createFakeTableClient());
    composeAdobeSignWebhookEventDedupeRepository(FULL_CACHE_ENV, { buildTableClient: factorySpy });
    expect(factorySpy).toHaveBeenCalledWith('AdobeSignWebhookEventDedupe');
  });
});
