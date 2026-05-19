import { describe, expect, it } from 'vitest';
import type { GraphListClient } from '../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
  stringifyCachedJsonSnapshot,
} from '../adobe-sign-cache/repositories/cache-snapshot-codec.js';
import { createGraphAdobeSignUserCacheRepository } from '../adobe-sign-cache/repositories/user-cache-repository.js';
import type { AdobeSignUserCacheUpsertInput } from '../adobe-sign-cache/repositories/user-cache-repository.js';
import { MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE } from '../adobe-sign-cache/cache-list-descriptors.js';

interface FakeRow {
  id: number;
  fields: Record<string, unknown>;
}

function makeFakeGraph(initialRows: FakeRow[] = []): {
  graph: GraphListClient;
  rows: FakeRow[];
  calls: { method: string; args: unknown[] }[];
} {
  const rows: FakeRow[] = initialRows.map((row) => ({ id: row.id, fields: { ...row.fields } }));
  const calls: { method: string; args: unknown[] }[] = [];
  let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const fake = {
    listItems: async (listTitle: string, opts: { filter?: string; top?: number }) => {
      calls.push({ method: 'listItems', args: [listTitle, opts] });
      const filter = opts.filter ?? '';
      // Parse `fields/AdobeActorKey eq '<key>'`
      const m = filter.match(/^fields\/(\w+) eq '(.+?)'$/);
      const filtered = m
        ? rows.filter((r) => String(r.fields[m[1]] ?? '') === m[2])
        : rows.slice();
      return filtered.slice(0, opts.top ?? filtered.length).map((r) => ({
        id: String(r.id),
        fields: r.fields,
      }));
    },
    addItem: async (listTitle: string, fields: Record<string, unknown>) => {
      calls.push({ method: 'addItem', args: [listTitle, fields] });
      const id = nextId++;
      rows.push({ id, fields: { ...fields } });
      return { id: String(id), fields };
    },
    updateItem: async (
      listTitle: string,
      itemId: string | number,
      fields: Record<string, unknown>,
    ) => {
      calls.push({ method: 'updateItem', args: [listTitle, itemId, fields] });
      const row = rows.find((r) => r.id === Number(itemId));
      if (!row) throw new Error('not found');
      Object.assign(row.fields, fields);
    },
  };
  return { graph: fake as unknown as GraphListClient, rows, calls };
}

function snapshotsFor(): AdobeSignUserCacheUpsertInput['snapshots'] {
  return {
    actionQueuePreview: [],
    actionQueueSummary: {
      countBasis: 'returned-items',
      totalActionItemCount: 0,
      signatureCount: 0,
      approvalCount: 0,
      acceptanceCount: 0,
      acknowledgementCount: 0,
      formFillingCount: 0,
      delegationCount: 0,
      expiringSoonCount: 0,
    },
    actionQueueWarnings: [],
    recentCompletionsPreview: [],
    recentCompletionsSummary: {
      countBasis: 'returned-items',
      completedAgreementCount: 0,
      windowDays: 30,
    },
    recentCompletionsWarnings: [],
  };
}

function rowFieldsForActor(adobeActorKey: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const snapshots = snapshotsFor();
  return {
    AdobeActorKey: adobeActorKey,
    UserPrincipalName: 'user@example.com',
    UserPrincipalNameNormalized: 'user@example.com',
    IsActive: true,
    CacheHydrationState: 'Ready',
    CachedSourceStatus: 'available',
    FreshnessState: 'Fresh',
    ActionQueuePreviewJson: stringifyCachedJsonSnapshot(
      snapshots.actionQueuePreview,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    ActionQueueSummaryJson: stringifyCachedJsonSnapshot(
      snapshots.actionQueueSummary,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    ActionQueueWarningsJson: stringifyCachedJsonSnapshot(
      snapshots.actionQueueWarnings,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsPreviewJson: stringifyCachedJsonSnapshot(
      snapshots.recentCompletionsPreview,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsSummaryJson: stringifyCachedJsonSnapshot(
      snapshots.recentCompletionsSummary,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    RecentCompletionsWarningsJson: stringifyCachedJsonSnapshot(
      snapshots.recentCompletionsWarnings,
      ADOBE_SIGN_CACHE_USER_CACHE_SCHEMA_VERSION,
    ),
    PendingActionCount: 0,
    RecentCompletionCount: 0,
    CacheSchemaVersion: 1,
    ProjectionRevision: 0,
    ...overrides,
  };
}

describe('AdobeSignUserCacheRepository — findByAdobeActorKey', () => {
  it("returns outcome='missing' when no row exists", async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    expect(await repo.findByAdobeActorKey('actor-1')).toEqual({ outcome: 'missing' });
  });

  it("returns outcome='missing' for empty key without hitting graph", async () => {
    const { graph, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    await repo.findByAdobeActorKey('');
    expect(calls).toHaveLength(0);
  });

  it("returns outcome='found' with a deserialized row when present", async () => {
    const { graph } = makeFakeGraph([{ id: 1, fields: rowFieldsForActor('actor-1') }]);
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    const result = await repo.findByAdobeActorKey('actor-1');
    expect(result.outcome).toBe('found');
    if (result.outcome === 'found') {
      expect(result.row.adobeActorKey).toBe('actor-1');
      expect(result.row.isActive).toBe(true);
      expect(result.row.cacheHydrationState).toBe('Ready');
      expect(result.row.freshnessState).toBe('Fresh');
      expect(result.row.snapshots.actionQueueSummary.totalActionItemCount).toBe(0);
    }
  });

  it("returns outcome='malformed' with the offending column when ActionQueuePreviewJson is corrupt", async () => {
    const { graph } = makeFakeGraph([
      {
        id: 1,
        fields: rowFieldsForActor('actor-1', { ActionQueuePreviewJson: '{not json' }),
      },
    ]);
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    const result = await repo.findByAdobeActorKey('actor-1');
    expect(result.outcome).toBe('malformed');
    if (result.outcome === 'malformed') {
      expect(result.column).toBe('actionQueuePreview');
      expect(result.reason).toBe('parse-error');
    }
  });

  it("returns outcome='malformed' on schema-version mismatch", async () => {
    const fields = rowFieldsForActor('actor-1', {
      ActionQueuePreviewJson: stringifyCachedJsonSnapshot([], 99),
    });
    const { graph } = makeFakeGraph([{ id: 1, fields }]);
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    const result = await repo.findByAdobeActorKey('actor-1');
    expect(result.outcome).toBe('malformed');
    if (result.outcome === 'malformed') {
      expect(result.reason).toBe('schema-version-mismatch');
    }
  });
});

describe('AdobeSignUserCacheRepository — upsert', () => {
  it('inserts when the row is absent', async () => {
    const { graph, rows, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    await repo.upsert({
      adobeActorKey: 'actor-1',
      isActive: true,
      cacheHydrationState: 'Ready',
      cachedSourceStatus: 'available',
      freshnessState: 'Fresh',
      pendingActionCount: 0,
      recentCompletionCount: 0,
      cacheSchemaVersion: 1,
      projectionRevision: 1,
      snapshots: snapshotsFor(),
    });
    expect(rows).toHaveLength(1);
    expect(calls.some((c) => c.method === 'addItem')).toBe(true);
  });

  it('updates the existing row by AdobeActorKey when present', async () => {
    const { graph, rows, calls } = makeFakeGraph([
      { id: 7, fields: rowFieldsForActor('actor-1') },
    ]);
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    const result = await repo.upsert({
      adobeActorKey: 'actor-1',
      isActive: true,
      cacheHydrationState: 'RefreshPending',
      cachedSourceStatus: 'partial',
      freshnessState: 'Aging',
      pendingActionCount: 3,
      recentCompletionCount: 1,
      cacheSchemaVersion: 1,
      projectionRevision: 2,
      snapshots: snapshotsFor(),
    });
    expect(result.listItemId).toBe(7);
    expect(rows).toHaveLength(1);
    expect(calls.some((c) => c.method === 'updateItem')).toBe(true);
    expect(rows[0].fields.PendingActionCount).toBe(3);
  });
});

describe('AdobeSignUserCacheRepository — softDeactivateByAdobeActorKey', () => {
  it('sets IsActive=false on the existing row', async () => {
    const { graph, rows } = makeFakeGraph([
      { id: 9, fields: rowFieldsForActor('actor-1', { IsActive: true }) },
    ]);
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    const result = await repo.softDeactivateByAdobeActorKey('actor-1');
    expect(result.deactivated).toBe(true);
    expect(rows[0].fields.IsActive).toBe(false);
  });

  it('returns deactivated=false when no row exists', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    expect(await repo.softDeactivateByAdobeActorKey('absent')).toEqual({ deactivated: false });
  });
});

describe('AdobeSignUserCacheRepository — list title default', () => {
  it('targets MyDashboardAdobeSignUserCache by default', async () => {
    const { graph, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignUserCacheRepository({ graph });
    await repo.findByAdobeActorKey('actor-1');
    expect(calls[0].args[0]).toBe(MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE);
  });
});
