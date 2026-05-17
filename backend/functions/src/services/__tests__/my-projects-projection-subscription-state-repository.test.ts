import type { TableClient } from '@azure/data-tables';
import { describe, expect, it } from 'vitest';
import { ProjectionSubscriptionStateRepository } from '../my-projects-projection/state/subscription-state-repository.js';
import type { IProjectionSubscriptionEntity } from '../my-projects-projection/projection-state-entities.js';

interface FakeRow {
  readonly partitionKey: string;
  readonly rowKey: string;
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
    upsertEntity: async (entity: Record<string, unknown>) => {
      const k = key(entity.partitionKey as string, entity.rowKey as string);
      etagSeq += 1;
      rows.set(k, {
        partitionKey: entity.partitionKey as string,
        rowKey: entity.rowKey as string,
        etag: `W/"etag-${etagSeq}"`,
        data: { ...entity },
      });
    },
    listEntities: <T>() => {
      const snapshot = [...rows.values()].map((row) => ({ ...row.data, etag: row.etag }));
      return {
        async *[Symbol.asyncIterator]() {
          for (const entry of snapshot) yield entry as T;
        },
      } as unknown as AsyncIterableIterator<T>;
    },
  };
  return { rows, client: fake as unknown as TableClient };
}

describe('ProjectionSubscriptionStateRepository', () => {
  it('get returns null when no entity exists', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    expect(await repo.get('Projects')).toBeNull();
  });

  it('upsert + get round-trips an entity with all fields', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    const entity: IProjectionSubscriptionEntity = {
      partitionKey: 'MyProjectsProjection',
      rowKey: 'Subscription:Projects',
      SourceListKind: 'Projects',
      SourceSiteId: 'site-id',
      SourceListId: 'list-id',
      SubscriptionId: 'sub-1',
      Resource: '/sites/site-id/lists/list-id',
      NotificationUrl: 'https://example/api/webhooks/x',
      ExpirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      Status: 'healthy',
      LastCreateAttemptUtc: '2026-05-17T00:00:00.000Z',
      LastRenewalSuccessUtc: '2026-05-17T00:00:00.000Z',
    };
    await repo.upsert(entity);
    const got = await repo.get('Projects');
    expect(got).not.toBeNull();
    expect(got?.SubscriptionId).toBe('sub-1');
    expect(got?.Status).toBe('healthy');
    expect(got?.ExpirationDateTimeUtc).toBe('2026-06-13T00:00:00.000Z');
  });

  it('serializer converts optional fields to undefined on deserialize', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    await repo.upsert({
      partitionKey: 'MyProjectsProjection',
      rowKey: 'Subscription:LegacyRegistry',
      SourceListKind: 'LegacyRegistry',
      SourceSiteId: 'site',
      SourceListId: 'list',
      Status: 'missing',
    });
    const got = await repo.get('LegacyRegistry');
    expect(got?.SubscriptionId).toBeUndefined();
    expect(got?.LastFailureCode).toBeUndefined();
    expect(got?.LastFailureAtUtc).toBeUndefined();
  });

  it('recordSuccessfulCreate writes Status=healthy with create + renewal stamps', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    await repo.recordSuccessfulCreate({
      sourceListKind: 'Projects',
      sourceSiteId: 'site',
      sourceListId: 'list',
      subscriptionId: 'sub-1',
      resource: '/sites/site/lists/list',
      notificationUrl: 'https://example/webhook',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const got = await repo.get('Projects');
    expect(got?.Status).toBe('healthy');
    expect(got?.LastCreateAttemptUtc).toBe('2026-05-17T00:00:00.000Z');
    expect(got?.LastRenewalSuccessUtc).toBe('2026-05-17T00:00:00.000Z');
  });

  it('recordSuccessfulRenewal preserves existing identity fields', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    await repo.recordSuccessfulCreate({
      sourceListKind: 'Projects',
      sourceSiteId: 'site',
      sourceListId: 'list',
      subscriptionId: 'sub-1',
      resource: '/sites/site/lists/list',
      notificationUrl: 'https://example/webhook',
      expirationDateTimeUtc: '2026-06-13T00:00:00.000Z',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    await repo.recordSuccessfulRenewal({
      sourceListKind: 'Projects',
      expirationDateTimeUtc: '2026-07-10T00:00:00.000Z',
      atUtc: '2026-06-12T23:00:00.000Z',
    });
    const got = await repo.get('Projects');
    expect(got?.SubscriptionId).toBe('sub-1');
    expect(got?.ExpirationDateTimeUtc).toBe('2026-07-10T00:00:00.000Z');
    expect(got?.LastRenewalAttemptUtc).toBe('2026-06-12T23:00:00.000Z');
    expect(got?.LastRenewalSuccessUtc).toBe('2026-06-12T23:00:00.000Z');
    expect(got?.LastFailureCode).toBeUndefined();
  });

  it('recordSuccessfulRenewal throws when the subscription has not been created', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    await expect(
      repo.recordSuccessfulRenewal({
        sourceListKind: 'Projects',
        expirationDateTimeUtc: '2026-07-10T00:00:00.000Z',
        atUtc: '2026-06-12T23:00:00.000Z',
      }),
    ).rejects.toThrow(/not found/);
  });

  it('recordFailure stamps failure code and transitions Status', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    await repo.recordFailure({
      sourceListKind: 'Projects',
      failureCode: 'create-failed',
      atUtc: '2026-05-17T00:00:00.000Z',
    });
    const got = await repo.get('Projects');
    expect(got?.Status).toBe('failed');
    expect(got?.LastFailureCode).toBe('create-failed');
    expect(got?.LastFailureAtUtc).toBe('2026-05-17T00:00:00.000Z');
    expect(got?.LastRenewalAttemptUtc).toBe('2026-05-17T00:00:00.000Z');
  });

  it('list returns both source subscriptions', async () => {
    const fake = createFakeTableClient();
    const repo = new ProjectionSubscriptionStateRepository({ client: fake.client });
    for (const kind of ['Projects', 'LegacyRegistry'] as const) {
      await repo.upsert({
        partitionKey: 'MyProjectsProjection',
        rowKey: `Subscription:${kind}`,
        SourceListKind: kind,
        SourceSiteId: 'site',
        SourceListId: 'list',
        Status: 'healthy',
      });
    }
    const list = await repo.list();
    expect(list.map((entry) => entry.SourceListKind).sort()).toEqual([
      'LegacyRegistry',
      'Projects',
    ]);
  });
});
