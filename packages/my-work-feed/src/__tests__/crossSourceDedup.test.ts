/**
 * Cross-source deduplication integration test — P2-C5 Gate 5.
 *
 * Confirms that BIC items and Notification items sharing the same dedupeKey
 * are correctly merged by the live aggregateFeed pipeline end-to-end.
 * This exercises the full pipeline: registry → loadSources → assignLane →
 * dedupeItems → applySupersession → rankItems → projectFeedResult.
 *
 * The dedupeKey format is: '{moduleKey}::{recordType}::{recordId}'
 * Source priority: bic-next-move (0) > workflow-handoff (1) > acknowledgment (2) > notification-intelligence (3)
 */
import { describe, it, expect, afterEach } from 'vitest';
import { aggregateFeed } from '../api/aggregateFeed.js';
import { MyWorkRegistry } from '../registry/MyWorkRegistry.js';
import { FeedTelemetry } from '../telemetry/feedTelemetry.js';
import {
  createMockMyWorkItem,
  createMockRegistryEntry,
  createMockSourceAdapter,
  createMockRuntimeContext,
  createMockMyWorkQuery,
} from '@hbc/my-work-feed/testing';

const SHARED_DEDUPE_KEY = 'provisioning::request::req-001';
const NOW_ISO = '2026-03-20T10:00:00.000Z';

describe('cross-source deduplication integration (P2-C5 Gate 5)', () => {
  afterEach(() => {
    MyWorkRegistry._clearForTesting();
    FeedTelemetry._clearForTesting();
  });

  it('merges BIC and Notification items with the same dedupeKey into one canonical item', async () => {
    const bicItem = createMockMyWorkItem({
      workItemId: 'bic::req-001',
      dedupeKey: SHARED_DEDUPE_KEY,
      class: 'owned-action',
      priority: 'now',
      state: 'active',
      title: 'Review project setup request',
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'bic-item-001', sourceUpdatedAtIso: NOW_ISO }],
      permissionState: { canOpen: true, canAct: true },
    });

    const notifItem = createMockMyWorkItem({
      workItemId: 'notif::req-001',
      dedupeKey: SHARED_DEDUPE_KEY,
      class: 'attention-item',
      priority: 'now',
      state: 'new',
      title: 'New request submitted — review required',
      sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'notif-item-001', sourceUpdatedAtIso: NOW_ISO }],
      permissionState: { canOpen: true, canAct: false, cannotActReason: 'Notification items are view-only' },
    });

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        rankingWeight: 0.9,
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([bicItem]),
        }),
      }),
      createMockRegistryEntry({
        source: 'notification-intelligence',
        rankingWeight: 0.5,
        adapter: createMockSourceAdapter({
          source: 'notification-intelligence',
          load: () => Promise.resolve([notifItem]),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: NOW_ISO,
    });

    // Only 1 item should survive dedup (2 inputs → 1 canonical)
    expect(result.items).toHaveLength(1);

    const survivor = result.items[0];

    // BIC wins because it has higher source priority
    expect(survivor.workItemId).toBe('bic::req-001');
    expect(survivor.class).toBe('owned-action');

    // sourceMeta merged from both sources
    expect(survivor.sourceMeta).toHaveLength(2);
    const sourceNames = survivor.sourceMeta.map((sm) => sm.source);
    expect(sourceNames).toContain('bic-next-move');
    expect(sourceNames).toContain('notification-intelligence');

    // Permission: canAct any-true-wins (BIC has canAct: true)
    expect(survivor.permissionState.canAct).toBe(true);

    // Dedupe metadata present
    expect(survivor.dedupe).toBeDefined();
    expect(survivor.dedupe?.dedupeKey).toBe(SHARED_DEDUPE_KEY);
  });

  it('BIC item wins over Notification item when both have same dedupeKey', async () => {
    const bicItem = createMockMyWorkItem({
      workItemId: 'bic::item-x',
      dedupeKey: 'estimating::pursuit::p-100',
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'bic-x', sourceUpdatedAtIso: NOW_ISO }],
    });

    const notifItem = createMockMyWorkItem({
      workItemId: 'notif::item-x',
      dedupeKey: 'estimating::pursuit::p-100',
      sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'notif-x', sourceUpdatedAtIso: NOW_ISO }],
    });

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({ source: 'bic-next-move', load: () => Promise.resolve([bicItem]) }),
      }),
      createMockRegistryEntry({
        source: 'notification-intelligence',
        adapter: createMockSourceAdapter({ source: 'notification-intelligence', load: () => Promise.resolve([notifItem]) }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: NOW_ISO,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].workItemId).toBe('bic::item-x');
  });

  it('items with different dedupeKeys are not merged', async () => {
    const bicItem = createMockMyWorkItem({
      workItemId: 'bic::a',
      dedupeKey: 'provisioning::request::req-A',
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'bic-a', sourceUpdatedAtIso: NOW_ISO }],
    });

    const notifItem = createMockMyWorkItem({
      workItemId: 'notif::b',
      dedupeKey: 'provisioning::request::req-B',
      sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'notif-b', sourceUpdatedAtIso: NOW_ISO }],
    });

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({ source: 'bic-next-move', load: () => Promise.resolve([bicItem]) }),
      }),
      createMockRegistryEntry({
        source: 'notification-intelligence',
        adapter: createMockSourceAdapter({ source: 'notification-intelligence', load: () => Promise.resolve([notifItem]) }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: NOW_ISO,
    });

    expect(result.items).toHaveLength(2);
  });

  it('blocked status propagates through dedup (any-true-wins)', async () => {
    const bicItem = createMockMyWorkItem({
      workItemId: 'bic::blocked',
      dedupeKey: 'test::record::blocked-001',
      isBlocked: false,
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'bic-b', sourceUpdatedAtIso: NOW_ISO }],
    });

    const notifItem = createMockMyWorkItem({
      workItemId: 'notif::blocked',
      dedupeKey: 'test::record::blocked-001',
      isBlocked: true,
      sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'notif-b', sourceUpdatedAtIso: NOW_ISO }],
    });

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({ source: 'bic-next-move', load: () => Promise.resolve([bicItem]) }),
      }),
      createMockRegistryEntry({
        source: 'notification-intelligence',
        adapter: createMockSourceAdapter({ source: 'notification-intelligence', load: () => Promise.resolve([notifItem]) }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: NOW_ISO,
    });

    expect(result.items).toHaveLength(1);
    // Blocked from notification propagates to survivor
    expect(result.items[0].isBlocked).toBe(true);
  });

  it('three-way merge across BIC, handoff, and notification sources', async () => {
    const sharedKey = 'provisioning::request::req-multi';

    const bicItem = createMockMyWorkItem({
      workItemId: 'bic::multi',
      dedupeKey: sharedKey,
      sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'bic-m', sourceUpdatedAtIso: NOW_ISO }],
    });

    const handoffItem = createMockMyWorkItem({
      workItemId: 'handoff::multi',
      dedupeKey: sharedKey,
      sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'ho-m', sourceUpdatedAtIso: NOW_ISO }],
    });

    const notifItem = createMockMyWorkItem({
      workItemId: 'notif::multi',
      dedupeKey: sharedKey,
      sourceMeta: [{ source: 'notification-intelligence', sourceItemId: 'ni-m', sourceUpdatedAtIso: NOW_ISO }],
    });

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({ source: 'bic-next-move', load: () => Promise.resolve([bicItem]) }),
      }),
      createMockRegistryEntry({
        source: 'workflow-handoff',
        adapter: createMockSourceAdapter({ source: 'workflow-handoff', load: () => Promise.resolve([handoffItem]) }),
      }),
      createMockRegistryEntry({
        source: 'notification-intelligence',
        adapter: createMockSourceAdapter({ source: 'notification-intelligence', load: () => Promise.resolve([notifItem]) }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: NOW_ISO,
    });

    // 3 items → 1 canonical (all share same dedupeKey)
    expect(result.items).toHaveLength(1);

    // BIC wins (highest source priority)
    expect(result.items[0].workItemId).toBe('bic::multi');

    // All 3 sourceMeta entries merged
    expect(result.items[0].sourceMeta).toHaveLength(3);
  });
});
