import { aggregateFeed, loadSources, buildQueueHealth } from '../api/aggregateFeed.js';
import { MyWorkRegistry } from '../registry/MyWorkRegistry.js';
import { FeedTelemetry } from '../telemetry/feedTelemetry.js';
import {
  createMockMyWorkItem,
  createMockRegistryEntry,
  createMockSourceAdapter,
  createMockRuntimeContext,
  createMockMyWorkQuery,
} from '@hbc/my-work-feed/testing';
import type { MyWorkTelemetryEvent } from '../telemetry/feedTelemetry.js';

describe('aggregateFeed', () => {
  afterEach(() => {
    MyWorkRegistry._clearForTesting();
    FeedTelemetry._clearForTesting();
  });

  it('runs full pipeline end-to-end', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([
            createMockMyWorkItem({ workItemId: 'w-1', priority: 'now', state: 'active' }),
          ]),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
    expect(result.lastRefreshedIso).toBe('2026-01-20T10:00:00.000Z');
    expect(result.healthState?.freshness).toBe('live');
  });

  it('isolates partial source failures', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([createMockMyWorkItem({ workItemId: 'w-1' })]),
        }),
      }),
      createMockRegistryEntry({
        source: 'workflow-handoff',
        adapter: createMockSourceAdapter({
          source: 'workflow-handoff',
          load: () => Promise.reject(new Error('Network error')),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(1);
    expect(result.healthState?.freshness).toBe('partial');
    expect(result.healthState?.degradedSourceCount).toBe(1);
  });

  it('computes accurate counts', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([
            createMockMyWorkItem({ workItemId: 'w-1', priority: 'now', isUnread: true }),
            createMockMyWorkItem({ workItemId: 'w-2', priority: 'soon', isUnread: false, dedupeKey: 'key-2' }),
          ]),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.totalCount).toBe(2);
    expect(result.unreadCount).toBe(1);
    expect(result.nowCount).toBe(1);
  });

  it('emits aggregation-complete telemetry', async () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([createMockMyWorkItem()]),
        }),
      }),
    ]);

    await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    const completeEvent = events.find((e) => e.type === 'aggregation-complete');
    expect(completeEvent).toBeDefined();
    if (completeEvent?.type === 'aggregation-complete') {
      expect(completeEvent.payload.totalItems).toBeGreaterThanOrEqual(0);
      expect(completeEvent.payload.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('emits dedupe and supersession events through pipeline', async () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([
            createMockMyWorkItem({
              workItemId: 'w-bic',
              dedupeKey: 'dup-key',
              context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
              sourceMeta: [{ source: 'bic-next-move', sourceItemId: 'src-1', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }],
            }),
          ]),
        }),
      }),
      createMockRegistryEntry({
        source: 'workflow-handoff',
        adapter: createMockSourceAdapter({
          source: 'workflow-handoff',
          load: () => Promise.resolve([
            createMockMyWorkItem({
              workItemId: 'w-handoff-dup',
              dedupeKey: 'dup-key',
              context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-002' },
              sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
            }),
            createMockMyWorkItem({
              workItemId: 'w-handoff-super',
              dedupeKey: 'unique-key',
              context: { moduleKey: 'bic', recordType: 'transfer', recordId: 'rec-001' },
              sourceMeta: [{ source: 'workflow-handoff', sourceItemId: 'src-3', sourceUpdatedAtIso: '2026-01-15T11:00:00.000Z' }],
            }),
          ]),
        }),
      }),
    ]);

    await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    const dedupeEvents = events.filter((e) => e.type === 'dedupe');
    const supersessionEvents = events.filter((e) => e.type === 'supersession');
    expect(dedupeEvents.length).toBeGreaterThanOrEqual(1);
    expect(supersessionEvents.length).toBeGreaterThanOrEqual(1);
  });

  it('applies query filtering', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([
            createMockMyWorkItem({ workItemId: 'w-1', priority: 'now', context: { moduleKey: 'bic', projectId: 'proj-1' } }),
            createMockMyWorkItem({ workItemId: 'w-2', priority: 'soon', dedupeKey: 'key-2', context: { moduleKey: 'handoff', projectId: 'proj-2' } }),
          ]),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery({ moduleKeys: ['bic'] }),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].context.moduleKey).toBe('bic');
  });

  it('handles all sources failing (cached health)', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.reject(new Error('Down')),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(0);
    expect(result.healthState?.freshness).toBe('cached');
    expect(result.isStale).toBe(true);
  });

  it('emits source-error telemetry on adapter failure', async () => {
    const events: MyWorkTelemetryEvent[] = [];
    FeedTelemetry.setSink((e) => events.push(e));

    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.reject(new Error('timeout')),
        }),
      }),
    ]);

    await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    const errorEvent = events.find((e) => e.type === 'source-error');
    expect(errorEvent).toBeDefined();
    if (errorEvent?.type === 'source-error') {
      expect(errorEvent.payload.source).toBe('bic-next-move');
      expect(errorEvent.payload.error).toBe('timeout');
    }
  });

  it('handles non-Error rejection in loadSources', async () => {
    MyWorkRegistry.register([
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.reject('string error'),
        }),
      }),
    ]);

    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.healthState?.freshness).toBe('cached');
  });

  it('returns empty result when no sources registered', async () => {
    const result = await aggregateFeed({
      query: createMockMyWorkQuery(),
      context: createMockRuntimeContext(),
      nowIso: '2026-01-20T10:00:00.000Z',
    });

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});

describe('loadSources', () => {
  it('loads items from multiple entries', async () => {
    const entries = [
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.resolve([createMockMyWorkItem()]),
        }),
      }),
    ];

    const outcomes = await loadSources(entries, createMockMyWorkQuery(), createMockRuntimeContext());
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].items).toHaveLength(1);
    expect(outcomes[0].freshness).toBe('live');
  });

  it('captures errors without crashing', async () => {
    FeedTelemetry._clearForTesting();
    const entries = [
      createMockRegistryEntry({
        source: 'bic-next-move',
        adapter: createMockSourceAdapter({
          source: 'bic-next-move',
          load: () => Promise.reject(new Error('timeout')),
        }),
      }),
    ];

    const outcomes = await loadSources(entries, createMockMyWorkQuery(), createMockRuntimeContext());
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].items).toHaveLength(0);
    expect(outcomes[0].error).toBe('timeout');
    expect(outcomes[0].freshness).toBe('partial');
  });
});

describe('buildQueueHealth', () => {
  it('returns live when all sources succeeded', () => {
    const health = buildQueueHealth(
      [{ source: 'bic-next-move', items: [], freshness: 'live' }],
      0,
    );
    expect(health.freshness).toBe('live');
    expect(health.degradedSourceCount).toBe(0);
  });

  it('returns partial when some sources failed', () => {
    const health = buildQueueHealth(
      [
        { source: 'bic-next-move', items: [], freshness: 'live' },
        { source: 'workflow-handoff', items: [], freshness: 'partial', error: 'fail' },
      ],
      0,
    );
    expect(health.freshness).toBe('partial');
    expect(health.degradedSourceCount).toBe(1);
    expect(health.warningMessage).toContain('1 source(s) failed');
  });

  it('returns cached when all sources failed', () => {
    const health = buildQueueHealth(
      [{ source: 'bic-next-move', items: [], freshness: 'partial', error: 'fail' }],
      0,
    );
    expect(health.freshness).toBe('cached');
  });

  it('includes superseded count', () => {
    const health = buildQueueHealth(
      [{ source: 'bic-next-move', items: [], freshness: 'live' }],
      5,
    );
    expect(health.hiddenSupersededCount).toBe(5);
  });
});
