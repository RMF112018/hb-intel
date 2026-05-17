import type { TableClient } from '@azure/data-tables';
import { describe, expect, it } from 'vitest';
import {
  DeltaStateConcurrencyError,
  ProjectionDeltaStateRepository,
} from '../my-projects-projection/state/delta-state-repository.js';

interface FakeRow {
  partitionKey: string;
  rowKey: string;
  etag: string;
  data: Record<string, unknown>;
}

function createFakeTableClient(): {
  rows: Map<string, FakeRow>;
  client: TableClient;
} {
  const rows = new Map<string, FakeRow>();
  let etagSeq = 0;
  const key = (pk: string, rk: string) => `${pk}|${rk}`;
  const fake = {
    createTable: async () => undefined,
    createEntity: async (entity: Record<string, unknown>) => {
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
  };
  return { rows, client: fake as unknown as TableClient };
}

describe('ProjectionDeltaStateRepository.getWithEtag', () => {
  it('returns null when no entity exists for the source kind', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    expect(await repo.getWithEtag('Projects')).toBeNull();
  });

  it('returns { entity, etag } when the entity exists', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'https://graph/delta?token=latest',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const result = await repo.getWithEtag('Projects');
    expect(result).not.toBeNull();
    expect(result?.entity.DeltaLink).toBe('https://graph/delta?token=latest');
    expect(typeof result?.etag).toBe('string');
    expect((result?.etag ?? '').length).toBeGreaterThan(0);
  });

  it('round-trips through advanceCheckpoint with the returned ETag', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'https://graph/delta?token=latest',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const result = await repo.getWithEtag('Projects');
    expect(result).not.toBeNull();
    await repo.advanceCheckpoint({
      sourceListKind: 'Projects',
      deltaLink: 'https://graph/delta?token=NEXT',
      changedCount: 1,
      deletedCount: 0,
      batchId: 'inc-1',
      atUtc: '2026-05-17T00:01:00.000Z',
      expectedEtag: result!.etag,
    });
    const post = await repo.getWithEtag('Projects');
    expect(post?.entity.DeltaLink).toBe('https://graph/delta?token=NEXT');
  });

  it('a stale ETag from getWithEtag triggers DeltaStateConcurrencyError on advance', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionDeltaStateRepository({ client: fake.client });
    await repo.initializeBaseline({
      sourceListKind: 'Projects',
      deltaLink: 'link-a',
      batchId: 'seed-1',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const stale = await repo.getWithEtag('Projects');
    // Advance once (etag rotates)
    await repo.advanceCheckpoint({
      sourceListKind: 'Projects',
      deltaLink: 'link-b',
      changedCount: 0,
      deletedCount: 0,
      batchId: 'inc-1',
      atUtc: '2026-05-17T00:01:00.000Z',
      expectedEtag: stale!.etag,
    });
    // Now the stale etag is wrong.
    await expect(
      repo.advanceCheckpoint({
        sourceListKind: 'Projects',
        deltaLink: 'link-c',
        changedCount: 0,
        deletedCount: 0,
        batchId: 'inc-2',
        atUtc: '2026-05-17T00:02:00.000Z',
        expectedEtag: stale!.etag,
      }),
    ).rejects.toBeInstanceOf(DeltaStateConcurrencyError);
  });
});
