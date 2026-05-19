import { describe, expect, it } from 'vitest';
import type { MyWorkAdobeSignActionQueueItem } from '@hbc/models/myWork';

import type { GraphListClient } from '../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
  stringifyCachedJsonSnapshot,
} from '../adobe-sign-cache/repositories/cache-snapshot-codec.js';
import {
  createGraphAdobeSignAgreementProjectionCacheRepository,
  type AdobeSignAgreementProjectionUpsertInput,
} from '../adobe-sign-cache/repositories/agreement-projection-cache-repository.js';
import { MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE } from '../adobe-sign-cache/cache-list-descriptors.js';

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
    listItems: async (
      listTitle: string,
      opts: { filter?: string; orderby?: string; top?: number },
    ) => {
      calls.push({ method: 'listItems', args: [listTitle, opts] });
      let filtered = rows.slice();
      const filter = opts.filter ?? '';
      // crude pattern matcher: split on " and ", each clause supports `fields/X eq '<v>'`,
      // `fields/X eq true`, or `fields/X lt '<v>'`
      const clauses = filter.split(' and ').filter(Boolean);
      for (const clause of clauses) {
        const eqStr = clause.match(/^fields\/(\w+) eq '(.+?)'$/);
        if (eqStr) {
          filtered = filtered.filter((r) => String(r.fields[eqStr[1]] ?? '') === eqStr[2]);
          continue;
        }
        const eqBool = clause.match(/^fields\/(\w+) eq (true|false)$/);
        if (eqBool) {
          const want = eqBool[2] === 'true';
          filtered = filtered.filter((r) => Boolean(r.fields[eqBool[1]]) === want);
          continue;
        }
        const ltStr = clause.match(/^fields\/(\w+) lt '(.+?)'$/);
        if (ltStr) {
          filtered = filtered.filter((r) => String(r.fields[ltStr[1]] ?? '') < ltStr[2]);
          continue;
        }
      }
      const orderby = opts.orderby ?? '';
      const orderbyMatch = orderby.match(/^fields\/(\w+) (asc|desc)$/);
      if (orderbyMatch) {
        const [, field, dir] = orderbyMatch;
        filtered.sort((a, b) => {
          const aV = String(a.fields[field] ?? '');
          const bV = String(b.fields[field] ?? '');
          return dir === 'desc' ? bV.localeCompare(aV) : aV.localeCompare(bV);
        });
      }
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

function previewItem(agreementId: string): MyWorkAdobeSignActionQueueItem {
  return {
    itemId: `adobe-sign:agreement-${agreementId}`,
    sourceSystem: 'adobe-sign',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    requiredAction: 'signature',
    actionHandoff: { posture: 'resolve-on-click', reason: 'eligible' },
    adobeRecipientStatus: 'WAITING_FOR_MY_SIGNATURE',
  };
}

function rowFields(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    ProjectionKey: 'actor-1::agr-1::__DEFAULT__',
    AdobeActorKey: 'actor-1',
    UserPrincipalNameNormalized: 'user@example.com',
    AgreementId: 'agr-1',
    RecipientActionKey: '__DEFAULT__',
    ProjectionBucket: 'PendingAction',
    AgreementName: 'Agreement 1',
    SortDateUtc: '2026-05-19T12:00:00.000Z',
    IsActiveProjection: true,
    FreshnessState: 'Fresh',
    PreviewItemJson: stringifyCachedJsonSnapshot(
      previewItem('agr-1'),
      ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
    ),
    CacheSchemaVersion: ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
    ...overrides,
  };
}

describe('AdobeSignAgreementProjectionCacheRepository — listActiveByActorAndBucket', () => {
  it("returns only rows matching actor + bucket + IsActiveProjection=true", async () => {
    const { graph } = makeFakeGraph([
      { id: 1, fields: rowFields({ AgreementId: 'agr-1' }) },
      {
        id: 2,
        fields: rowFields({ AgreementId: 'agr-2', ProjectionBucket: 'RecentCompletion' }),
      },
      {
        id: 3,
        fields: rowFields({ AgreementId: 'agr-3', IsActiveProjection: false }),
      },
      { id: 4, fields: rowFields({ AgreementId: 'agr-4', AdobeActorKey: 'other' }) },
    ]);
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const page = await repo.listActiveByActorAndBucket({
      adobeActorKey: 'actor-1',
      projectionBucket: 'PendingAction',
      pageSize: 10,
    });
    expect(page.rows).toHaveLength(1);
    expect(page.rows[0].agreementId).toBe('agr-1');
    expect(page.hasMore).toBe(false);
  });

  it('emits a nextCursor when hasMore is true', async () => {
    const rows: FakeRow[] = [];
    for (let i = 0; i < 5; i++) {
      const sortDate = `2026-05-${(20 - i).toString().padStart(2, '0')}T12:00:00.000Z`;
      rows.push({
        id: i + 1,
        fields: rowFields({ AgreementId: `agr-${i + 1}`, SortDateUtc: sortDate }),
      });
    }
    const { graph } = makeFakeGraph(rows);
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const page = await repo.listActiveByActorAndBucket({
      adobeActorKey: 'actor-1',
      projectionBucket: 'PendingAction',
      pageSize: 2,
    });
    expect(page.rows).toHaveLength(2);
    expect(page.hasMore).toBe(true);
    expect(typeof page.nextCursor).toBe('string');
    // Cursor is opaque; decoding should be a JSON object after base64 decode.
    const decoded = JSON.parse(Buffer.from(page.nextCursor!, 'base64').toString('utf8'));
    expect(decoded.lastSortDateUtc).toBeDefined();
    expect(decoded.lastListItemId).toBeDefined();
  });

  it('handles a per-row codec failure without bringing down the page', async () => {
    const { graph } = makeFakeGraph([
      { id: 1, fields: rowFields({ AgreementId: 'agr-1' }) },
      {
        id: 2,
        fields: rowFields({ AgreementId: 'agr-2', PreviewItemJson: 'not json' }),
      },
    ]);
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const page = await repo.listActiveByActorAndBucket({
      adobeActorKey: 'actor-1',
      projectionBucket: 'PendingAction',
      pageSize: 10,
    });
    expect(page.rows).toHaveLength(2);
    const bad = page.rows.find((r) => r.agreementId === 'agr-2');
    expect(bad?.previewItem).toBeNull();
    expect(bad?.previewItemMalformedReason).toBe('parse-error');
    const good = page.rows.find((r) => r.agreementId === 'agr-1');
    expect(good?.previewItem).not.toBeNull();
  });

  it('throws RangeError for non-positive pageSize', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    await expect(
      repo.listActiveByActorAndBucket({
        adobeActorKey: 'a',
        projectionBucket: 'PendingAction',
        pageSize: 0,
      }),
    ).rejects.toThrow(RangeError);
  });
});

describe('AdobeSignAgreementProjectionCacheRepository — upsert and softDeactivate', () => {
  it('inserts then updates by ProjectionKey idempotently', async () => {
    const { graph, rows } = makeFakeGraph();
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const upsertInput: AdobeSignAgreementProjectionUpsertInput = {
      projectionKey: 'actor-1::agr-1::__DEFAULT__',
      adobeActorKey: 'actor-1',
      agreementId: 'agr-1',
      recipientActionKey: '__DEFAULT__',
      projectionBucket: 'PendingAction',
      agreementName: 'Agreement 1',
      isActiveProjection: true,
      previewItem: previewItem('agr-1'),
      cacheSchemaVersion: ADOBE_SIGN_CACHE_AGREEMENT_PROJECTION_SCHEMA_VERSION,
    };
    const first = await repo.upsert(upsertInput);
    expect(rows).toHaveLength(1);
    const second = await repo.upsert(upsertInput);
    expect(second.listItemId).toBe(first.listItemId);
    expect(rows).toHaveLength(1);
  });

  it('softDeactivate flips IsActiveProjection + ProjectionBucket and stamps timestamp', async () => {
    const { graph, rows } = makeFakeGraph([
      { id: 5, fields: rowFields({ ProjectionKey: 'k1', IsActiveProjection: true }) },
    ]);
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const out = await repo.softDeactivate('k1', '2026-05-19T13:00:00.000Z');
    expect(out.deactivated).toBe(true);
    expect(rows[0].fields.IsActiveProjection).toBe(false);
    expect(rows[0].fields.ProjectionBucket).toBe('Inactive');
    expect(rows[0].fields.LastReconciliationRefreshUtc).toBe('2026-05-19T13:00:00.000Z');
  });

  it('softDeactivate returns deactivated=false when row is absent', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    const out = await repo.softDeactivate('missing-key', '2026-05-19T13:00:00.000Z');
    expect(out.deactivated).toBe(false);
  });
});

describe('AdobeSignAgreementProjectionCacheRepository — list title default', () => {
  it('targets MyDashboardAdobeSignAgreementProjectionCache by default', async () => {
    const { graph, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignAgreementProjectionCacheRepository({ graph });
    await repo.listActiveByActorAndBucket({
      adobeActorKey: 'a',
      projectionBucket: 'PendingAction',
      pageSize: 1,
    });
    expect(calls[0].args[0]).toBe(MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE);
  });
});
