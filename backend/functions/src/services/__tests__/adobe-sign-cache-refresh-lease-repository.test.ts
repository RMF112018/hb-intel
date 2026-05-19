import { describe, expect, it } from 'vitest';
import type { TableClient } from '@azure/data-tables';

import {
  ADOBE_SIGN_CACHE_LEASE_SCOPES,
  AdobeSignCacheRefreshLeaseRepository,
  composeAdobeSignCacheLeaseRowKey,
} from '../adobe-sign-cache/cache-refresh-lease-repository.js';

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
 * Same minimal in-memory ETag-aware fake TableClient as the dedupe-repo
 * test file; intentionally duplicated here so each test file is
 * self-contained and the harness doesn't accidentally become a shared
 * mutable singleton between unrelated suites.
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
      if (store.has(key)) throw new RestErrorLike(409, 'EntityAlreadyExists');
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
    async createTable(): Promise<unknown> {
      return {};
    },
  };
  return fake as unknown as TableClient;
}

describe('ADOBE_SIGN_CACHE_LEASE_SCOPES', () => {
  it('locks the three lease scopes in canonical order', () => {
    expect(ADOBE_SIGN_CACHE_LEASE_SCOPES).toEqual([
      'AgreementTargeted',
      'UserWide',
      'WebhookSubscription',
    ]);
  });
});

describe('composeAdobeSignCacheLeaseRowKey', () => {
  it('maps UserWide to __USER_WIDE__', () => {
    expect(composeAdobeSignCacheLeaseRowKey('UserWide')).toBe('__USER_WIDE__');
  });

  it('maps WebhookSubscription to __WEBHOOK_SUBSCRIPTION__', () => {
    expect(composeAdobeSignCacheLeaseRowKey('WebhookSubscription')).toBe('__WEBHOOK_SUBSCRIPTION__');
  });

  it('maps AgreementTargeted to the agreementId', () => {
    expect(composeAdobeSignCacheLeaseRowKey('AgreementTargeted', 'agr-1')).toBe('agr-1');
  });

  it('throws when AgreementTargeted is requested without an agreementId', () => {
    expect(() => composeAdobeSignCacheLeaseRowKey('AgreementTargeted')).toThrow(
      /AgreementTargeted lease requires a non-empty agreementId/,
    );
    expect(() => composeAdobeSignCacheLeaseRowKey('AgreementTargeted', '')).toThrow(
      /AgreementTargeted lease requires a non-empty agreementId/,
    );
  });
});

const FIXED_NOW = new Date('2026-05-19T12:00:00.000Z');
const TEN_MINUTES_MS = 10 * 60 * 1000;

describe('AdobeSignCacheRefreshLeaseRepository.tryAcquire', () => {
  it('acquires a cold (absent) lease and returns the expected leaseExpiresUtc', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    const outcome = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(outcome.status).toBe('acquired');
    if (outcome.status === 'acquired') {
      expect(outcome.leaseExpiresUtc).toBe(
        new Date(FIXED_NOW.getTime() + TEN_MINUTES_MS).toISOString(),
      );
    }
    const stored = await repo.get({ adobeActorKey: 'actor-1', leaseScope: 'UserWide' });
    expect(stored?.leaseOwnerWorkItemId).toBe('wi-1');
    expect(stored?.rowKey).toBe('__USER_WIDE__');
  });

  it('renews when the same owner re-acquires before expiry', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const second = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(second.status).toBe('acquired');
  });

  it('reports conflict with the active-owner workItemId when a different owner re-acquires before expiry', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const conflict = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-2',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(conflict.status).toBe('conflict');
    if (conflict.status === 'conflict') {
      expect(conflict.reason).toBe('active-other-owner');
      expect(conflict.activeLeaseOwnerWorkItemId).toBe('wi-1');
      expect(conflict.leaseExpiresUtc).toBeDefined();
    }
  });

  it('allows a different owner to acquire after expiry has passed', async () => {
    const client = createFakeTableClient();
    let now = new Date('2026-05-19T12:00:00.000Z');
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => now });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    // Advance the clock past lease expiry (10 minutes + 1 second).
    now = new Date(now.getTime() + TEN_MINUTES_MS + 1000);
    const second = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-2',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(second.status).toBe('acquired');
  });

  it('addresses AgreementTargeted leases per-agreement (independent rows)', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    const a = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'AgreementTargeted',
      agreementId: 'agr-A',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const b = await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'AgreementTargeted',
      agreementId: 'agr-B',
      workItemId: 'wi-2',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(a.status).toBe('acquired');
    expect(b.status).toBe('acquired');
    const storedA = await repo.get({
      adobeActorKey: 'actor-1',
      leaseScope: 'AgreementTargeted',
      agreementId: 'agr-A',
    });
    expect(storedA?.rowKey).toBe('agr-A');
  });

  it('rejects non-positive ttlMs', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await expect(
      repo.tryAcquire({
        adobeActorKey: 'actor-1',
        leaseScope: 'UserWide',
        workItemId: 'wi-1',
        ttlMs: 0,
      }),
    ).rejects.toThrow(/ttlMs/);
  });

  it('rejects empty adobeActorKey or workItemId', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await expect(
      repo.tryAcquire({
        adobeActorKey: '',
        leaseScope: 'UserWide',
        workItemId: 'wi-1',
        ttlMs: TEN_MINUTES_MS,
      }),
    ).rejects.toThrow(/adobeActorKey/);
    await expect(
      repo.tryAcquire({
        adobeActorKey: 'actor-1',
        leaseScope: 'UserWide',
        workItemId: '',
        ttlMs: TEN_MINUTES_MS,
      }),
    ).rejects.toThrow(/workItemId/);
  });
});

describe('AdobeSignCacheRefreshLeaseRepository.renew', () => {
  it('renews when the same owner calls; extends leaseExpiresUtc', async () => {
    const client = createFakeTableClient();
    let now = new Date('2026-05-19T12:00:00.000Z');
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => now });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    now = new Date(now.getTime() + 60_000); // 1 minute later
    const renewed = await repo.renew({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(renewed.status).toBe('renewed');
    if (renewed.status === 'renewed') {
      expect(renewed.leaseExpiresUtc).toBe(new Date(now.getTime() + TEN_MINUTES_MS).toISOString());
    }
  });

  it('returns not-renewed/other-owner when a different owner attempts renewal', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const renewed = await repo.renew({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-2',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(renewed.status).toBe('not-renewed');
    if (renewed.status === 'not-renewed') {
      expect(renewed.reason).toBe('other-owner');
    }
  });

  it('returns not-renewed/missing when no lease exists', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    const renewed = await repo.renew({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    expect(renewed.status).toBe('not-renewed');
    if (renewed.status === 'not-renewed') {
      expect(renewed.reason).toBe('missing');
    }
  });
});

describe('AdobeSignCacheRefreshLeaseRepository.release', () => {
  it('deletes the lease when the same owner releases', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const out = await repo.release({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
    });
    expect(out.released).toBe(true);
    expect(await repo.get({ adobeActorKey: 'actor-1', leaseScope: 'UserWide' })).toBeNull();
  });

  it('no-ops when a different owner attempts release', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    await repo.tryAcquire({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
      ttlMs: TEN_MINUTES_MS,
    });
    const out = await repo.release({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-2',
    });
    expect(out.released).toBe(false);
    expect(await repo.get({ adobeActorKey: 'actor-1', leaseScope: 'UserWide' })).not.toBeNull();
  });

  it('returns released=false when the lease is already gone', async () => {
    const client = createFakeTableClient();
    const repo = new AdobeSignCacheRefreshLeaseRepository({ client, now: () => FIXED_NOW });
    const out = await repo.release({
      adobeActorKey: 'actor-1',
      leaseScope: 'UserWide',
      workItemId: 'wi-1',
    });
    expect(out.released).toBe(false);
  });
});
