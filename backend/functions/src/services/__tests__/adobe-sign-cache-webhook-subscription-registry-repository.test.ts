import { describe, expect, it } from 'vitest';
import type { GraphListClient } from '../legacy-fallback/graph-list-client.js';

import { createGraphAdobeSignWebhookSubscriptionRegistryRepository } from '../adobe-sign-cache/repositories/webhook-subscription-registry-repository.js';
import { MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE } from '../adobe-sign-cache/cache-list-descriptors.js';

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
      const m = (opts.filter ?? '').match(/^fields\/(\w+) eq '(.+?)'$/);
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

function rowFields(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    SubscriptionKey: 'sub-1',
    AdobeActorKey: 'actor-1',
    UserPrincipalNameNormalized: 'user@example.com',
    AdobeWebhookId: 'adobe-wh-1',
    WebhookScope: 'USER',
    ResourceFamily: 'AGREEMENT',
    WebhookUrl: 'https://example.com/webhook/sub-1',
    RemoteState: 'Active',
    LocalProcessingState: 'Active',
    IsManagedByHbIntel: true,
    CacheSchemaVersion: 1,
    ...overrides,
  };
}

describe('AdobeSignWebhookSubscriptionRegistryRepository — read', () => {
  it('findByAdobeActorKey returns null when missing', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    expect(await repo.findByAdobeActorKey('actor-1')).toBeNull();
  });

  it('findByAdobeActorKey returns the row when present', async () => {
    const { graph } = makeFakeGraph([{ id: 1, fields: rowFields() }]);
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    const row = await repo.findByAdobeActorKey('actor-1');
    expect(row?.subscriptionKey).toBe('sub-1');
    expect(row?.webhookScope).toBe('USER');
    expect(row?.resourceFamily).toBe('AGREEMENT');
    expect(row?.isManagedByHbIntel).toBe(true);
  });

  it('findBySubscriptionKey returns null when missing', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    expect(await repo.findBySubscriptionKey('sub-1')).toBeNull();
  });

  it('findBySubscriptionKey returns the row when present', async () => {
    const { graph } = makeFakeGraph([{ id: 1, fields: rowFields() }]);
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    const row = await repo.findBySubscriptionKey('sub-1');
    expect(row?.subscriptionKey).toBe('sub-1');
  });
});

describe('AdobeSignWebhookSubscriptionRegistryRepository — upsert and softDeactivate', () => {
  it('inserts when subscription is absent', async () => {
    const { graph, rows } = makeFakeGraph();
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    await repo.upsert({
      subscriptionKey: 'sub-1',
      adobeActorKey: 'actor-1',
      webhookScope: 'USER',
      resourceFamily: 'AGREEMENT',
      webhookUrl: 'https://example.com/webhook/sub-1',
      remoteState: 'Active',
      localProcessingState: 'Active',
      isManagedByHbIntel: true,
      cacheSchemaVersion: 1,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].fields.SubscriptionKey).toBe('sub-1');
  });

  it('updates when subscription exists (by SubscriptionKey)', async () => {
    const { graph, rows } = makeFakeGraph([{ id: 4, fields: rowFields() }]);
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    const result = await repo.upsert({
      subscriptionKey: 'sub-1',
      adobeActorKey: 'actor-1',
      webhookScope: 'USER',
      resourceFamily: 'AGREEMENT',
      webhookUrl: 'https://example.com/webhook/sub-1',
      remoteState: 'Inactive',
      localProcessingState: 'IgnoredAfterDisconnect',
      isManagedByHbIntel: true,
      cacheSchemaVersion: 1,
    });
    expect(result.listItemId).toBe(4);
    expect(rows).toHaveLength(1);
    expect(rows[0].fields.RemoteState).toBe('Inactive');
    expect(rows[0].fields.LocalProcessingState).toBe('IgnoredAfterDisconnect');
  });

  it('softDeactivate flips LocalProcessingState only', async () => {
    const { graph, rows } = makeFakeGraph([{ id: 4, fields: rowFields() }]);
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    const out = await repo.softDeactivate('sub-1', 'IgnoredAfterDisconnect');
    expect(out.deactivated).toBe(true);
    expect(rows[0].fields.LocalProcessingState).toBe('IgnoredAfterDisconnect');
    // Other fields preserved
    expect(rows[0].fields.RemoteState).toBe('Active');
    expect(rows[0].fields.IsManagedByHbIntel).toBe(true);
  });

  it('softDeactivate returns deactivated=false for missing rows', async () => {
    const { graph } = makeFakeGraph();
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    expect(await repo.softDeactivate('absent', 'IgnoredAfterDisconnect')).toEqual({
      deactivated: false,
    });
  });
});

describe('AdobeSignWebhookSubscriptionRegistryRepository — list title default', () => {
  it('targets MyDashboardAdobeSignWebhookSubscriptions by default', async () => {
    const { graph, calls } = makeFakeGraph();
    const repo = createGraphAdobeSignWebhookSubscriptionRegistryRepository({ graph });
    await repo.findBySubscriptionKey('sub-1');
    expect(calls[0].args[0]).toBe(MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE);
  });
});
