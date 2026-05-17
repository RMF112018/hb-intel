import type { TableClient } from '@azure/data-tables';
import { describe, expect, it } from 'vitest';
import { ProjectionLeaseRepository } from '../my-projects-projection/state/lease-repository.js';

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  etag: string;
  data: Record<string, unknown>;
}

function createFakeTableClient(): {
  rows: Map<string, FakeRow>;
  client: TableClient;
  forceNextCreate409: () => void;
  forceNextUpdate412: () => void;
  forceNextDelete412: () => void;
} {
  const rows = new Map<string, FakeRow>();
  let etagSeq = 0;
  let nextCreate409 = false;
  let nextUpdate412 = false;
  let nextDelete412 = false;
  const key = (pk: string, rk: string) => `${pk}|${rk}`;
  const fake = {
    createTable: async () => undefined,
    createEntity: async (entity: Record<string, unknown>) => {
      if (nextCreate409) {
        nextCreate409 = false;
        const err = new Error('forced 409') as Error & { statusCode: number };
        err.statusCode = 409;
        throw err;
      }
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      if (rows.has(k)) {
        const err = new Error('conflict') as Error & { statusCode: number };
        err.statusCode = 409;
        throw err;
      }
      etagSeq += 1;
      rows.set(k, {
        partitionKey: entity.partitionKey as string,
        rowKey: entity.rowKey as string,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
    getEntity: async <T>(pk: string, rk: string): Promise<T> => {
      const row = rows.get(key(pk, rk));
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
      if (nextUpdate412) {
        nextUpdate412 = false;
        const err = new Error('forced 412') as Error & { statusCode: number };
        err.statusCode = 412;
        throw err;
      }
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      const existing = rows.get(k);
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
      etagSeq += 1;
      rows.set(k, {
        partitionKey: existing.partitionKey,
        rowKey: existing.rowKey,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
    deleteEntity: async (pk: string, rk: string, opts?: { etag?: string }) => {
      if (nextDelete412) {
        nextDelete412 = false;
        const err = new Error('forced 412') as Error & { statusCode: number };
        err.statusCode = 412;
        throw err;
      }
      const k = key(pk, rk);
      const existing = rows.get(k);
      if (!existing) return;
      if (opts?.etag !== undefined && opts.etag !== existing.etag) {
        const err = new Error('etag mismatch') as Error & { statusCode: number };
        err.statusCode = 412;
        throw err;
      }
      rows.delete(k);
    },
  };
  return {
    rows,
    client: fake as unknown as TableClient,
    forceNextCreate409: () => {
      nextCreate409 = true;
    },
    forceNextUpdate412: () => {
      nextUpdate412 = true;
    },
    forceNextDelete412: () => {
      nextDelete412 = true;
    },
  };
}

const NOW = new Date('2026-05-17T12:00:00.000Z');
const LATER = new Date('2026-05-17T12:05:00.000Z');

describe('ProjectionLeaseRepository.tryAcquire', () => {
  it('cold acquire creates the entity and returns acquired=true', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      sourceListKind: 'Projects',
      now: NOW,
    });
    expect(outcome.acquired).toBe(true);
    expect(fake.rows.get('MyProjectsProjection|Lease:Sync:Projects')?.data.LeaseOwner).toBe(
      'worker-1',
    );
  });

  it('cold acquire racing with another worker returns race-conflict on 409', async () => {
    const fake = createFakeTableClient();
    fake.forceNextCreate409();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    expect(outcome).toEqual({ acquired: false, reason: 'race-conflict' });
  });

  it('active lease by different owner returns reason=active', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-2',
      ttlMinutes: 10,
      now: LATER,
    });
    expect(outcome.acquired).toBe(false);
    if (outcome.acquired === false) {
      expect(outcome.reason).toBe('active');
      if (outcome.reason === 'active') {
        expect(outcome.currentOwner).toBe('worker-1');
      }
    }
  });

  it('expired lease can be acquired by a different owner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const after = new Date('2026-05-17T12:20:00.000Z');
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-2',
      ttlMinutes: 10,
      now: after,
    });
    expect(outcome.acquired).toBe(true);
    expect(fake.rows.get('MyProjectsProjection|Lease:Sync:Projects')?.data.LeaseOwner).toBe(
      'worker-2',
    );
  });

  it('same-owner reacquire extends the expiry', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: LATER,
    });
    expect(outcome.acquired).toBe(true);
    if (outcome.acquired === true) {
      expect(outcome.expiresAtUtc).toBe('2026-05-17T12:15:00.000Z');
    }
  });

  it('etag race on update returns race-conflict', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const past = new Date('2026-05-17T12:11:00.000Z');
    fake.forceNextUpdate412();
    const outcome = await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-3',
      ttlMinutes: 10,
      now: past,
    });
    expect(outcome).toEqual({ acquired: false, reason: 'race-conflict' });
  });

  it('rejects non-positive ttlMinutes', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await expect(
      repo.tryAcquire({
        rowKey: 'Lease:Sync:Projects',
        leaseType: 'sync',
        leaseOwner: 'worker-1',
        ttlMinutes: 0,
        now: NOW,
      }),
    ).rejects.toThrow(RangeError);
  });

  it('rejects empty leaseOwner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await expect(
      repo.tryAcquire({
        rowKey: 'Lease:Sync:Projects',
        leaseType: 'sync',
        leaseOwner: '',
        ttlMinutes: 10,
        now: NOW,
      }),
    ).rejects.toThrow(RangeError);
  });
});

describe('ProjectionLeaseRepository.renew', () => {
  it('renews when called by the lease owner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const result = await repo.renew({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-1',
      ttlMinutes: 15,
      now: LATER,
    });
    expect(result.renewed).toBe(true);
    expect(result.expiresAtUtc).toBe('2026-05-17T12:20:00.000Z');
  });

  it('refuses to renew for the wrong owner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const result = await repo.renew({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-2',
      ttlMinutes: 15,
      now: LATER,
    });
    expect(result.renewed).toBe(false);
  });

  it('returns renewed=false when lease does not exist', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    const result = await repo.renew({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    expect(result.renewed).toBe(false);
  });
});

describe('ProjectionLeaseRepository.release', () => {
  it('releases when called by the owner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const result = await repo.release({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-1',
    });
    expect(result.released).toBe(true);
    expect(fake.rows.has('MyProjectsProjection|Lease:Sync:Projects')).toBe(false);
  });

  it('refuses to release for the wrong owner', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    await repo.tryAcquire({
      rowKey: 'Lease:Sync:Projects',
      leaseType: 'sync',
      leaseOwner: 'worker-1',
      ttlMinutes: 10,
      now: NOW,
    });
    const result = await repo.release({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-2',
    });
    expect(result.released).toBe(false);
    expect(fake.rows.has('MyProjectsProjection|Lease:Sync:Projects')).toBe(true);
  });

  it('returns released=false when lease does not exist', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionLeaseRepository({ client: fake.client });
    const result = await repo.release({
      rowKey: 'Lease:Sync:Projects',
      leaseOwner: 'worker-1',
    });
    expect(result.released).toBe(false);
  });
});
