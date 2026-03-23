import { describe, expect, it, beforeEach } from 'vitest';
import { aggregateActivityFeed } from './aggregateActivityFeed.js';
import { ProjectActivityRegistry } from './ProjectActivityRegistry.js';
import type { IProjectActivityEvent, IActivitySourceAdapter } from '@hbc/models';

function createMockEvent(overrides?: Partial<IProjectActivityEvent>): IProjectActivityEvent {
  return {
    eventId: crypto.randomUUID(),
    projectId: 'proj-001',
    eventType: 'financial.forecast-updated',
    category: 'record-change',
    sourceModule: 'financial',
    sourceRecordType: 'forecast',
    sourceRecordId: 'fc-001',
    summary: 'Forecast updated.',
    detail: null,
    changedByUpn: 'pm@example.com',
    changedByName: 'Jane Smith',
    occurredAt: '2026-03-22T14:00:00.000Z',
    publishedAt: '2026-03-22T14:00:01.000Z',
    significance: 'routine',
    href: null,
    relatedEventIds: [],
    ...overrides,
  };
}

function createMockAdapter(moduleKey: string, events: IProjectActivityEvent[]): IActivitySourceAdapter {
  return {
    moduleKey,
    isEnabled: () => true,
    loadRecentActivity: async () => events,
    getEventTypeMetadata: () => null,
  };
}

describe('aggregateActivityFeed', () => {
  const context = { projectId: 'proj-001', userUpn: 'user@example.com' };
  const baseQuery = { projectId: 'proj-001' };

  beforeEach(() => {
    ProjectActivityRegistry._clearForTesting();
  });

  it('aggregates events from multiple adapters', async () => {
    const event1 = createMockEvent({ sourceModule: 'financial' });
    const event2 = createMockEvent({ sourceModule: 'schedule', eventType: 'schedule.milestone-completed' });

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: ['financial.forecast-updated'], adapter: createMockAdapter('financial', [event1]), enabledByDefault: true, significanceDefaults: {} },
      { moduleKey: 'schedule', supportedEventTypes: ['schedule.milestone-completed'], adapter: createMockAdapter('schedule', [event2]), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed(baseQuery, context);
    expect(result.events).toHaveLength(2);
    expect(result.totalCount).toBe(2);
  });

  it('deduplicates by eventId', async () => {
    const event = createMockEvent({ eventId: 'dup-001' });

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', [event, event]), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed(baseQuery, context);
    expect(result.events).toHaveLength(1);
  });

  it('sorts by occurredAt descending', async () => {
    const earlier = createMockEvent({ occurredAt: '2026-03-20T10:00:00.000Z' });
    const later = createMockEvent({ occurredAt: '2026-03-22T10:00:00.000Z' });

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', [earlier, later]), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed(baseQuery, context);
    expect(result.events[0].occurredAt).toBe('2026-03-22T10:00:00.000Z');
    expect(result.events[1].occurredAt).toBe('2026-03-20T10:00:00.000Z');
  });

  it('filters by category', async () => {
    const change = createMockEvent({ category: 'record-change' });
    const milestone = createMockEvent({ category: 'milestone' });

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', [change, milestone]), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed({ ...baseQuery, categories: ['milestone'] }, context);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].category).toBe('milestone');
  });

  it('filters by significance', async () => {
    const routine = createMockEvent({ significance: 'routine' });
    const critical = createMockEvent({ significance: 'critical' });

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', [routine, critical]), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed({ ...baseQuery, significance: ['critical'] }, context);
    expect(result.events).toHaveLength(1);
    expect(result.criticalCount).toBe(1);
  });

  it('computes significance counts', async () => {
    const events = [
      createMockEvent({ significance: 'critical' }),
      createMockEvent({ significance: 'notable' }),
      createMockEvent({ significance: 'notable' }),
      createMockEvent({ significance: 'routine' }),
    ];

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', events), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed(baseQuery, context);
    expect(result.totalCount).toBe(4);
    expect(result.criticalCount).toBe(1);
    expect(result.notableCount).toBe(2);
  });

  it('applies limit and sets hasMore', async () => {
    const events = Array.from({ length: 30 }, (_, i) =>
      createMockEvent({ occurredAt: `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00.000Z` }),
    );

    ProjectActivityRegistry.register([
      { moduleKey: 'financial', supportedEventTypes: [], adapter: createMockAdapter('financial', events), enabledByDefault: true, significanceDefaults: {} },
    ]);

    const result = await aggregateActivityFeed({ ...baseQuery, limit: 10 }, context);
    expect(result.events).toHaveLength(10);
    expect(result.hasMore).toBe(true);
    expect(result.totalCount).toBe(30);
  });

  it('returns empty result when no adapters registered', async () => {
    ProjectActivityRegistry.register([]);
    const result = await aggregateActivityFeed(baseQuery, context);
    expect(result.events).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.hasMore).toBe(false);
  });
});
