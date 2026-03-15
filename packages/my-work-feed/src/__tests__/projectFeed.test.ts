import { assignLane, computeCounts, projectFeedResult } from '../normalization/projectFeed.js';
import { createMockMyWorkItem, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

describe('assignLane', () => {
  it('returns waiting-blocked when isBlocked', () => {
    const item = createMockMyWorkItem({ isBlocked: true, state: 'active' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('returns waiting-blocked when state is blocked', () => {
    const item = createMockMyWorkItem({ isBlocked: false, state: 'blocked' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('returns waiting-blocked when state is waiting', () => {
    const item = createMockMyWorkItem({ isBlocked: false, state: 'waiting' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('returns do-now for priority now and state active', () => {
    const item = createMockMyWorkItem({ isBlocked: false, priority: 'now', state: 'active' });
    expect(assignLane(item)).toBe('do-now');
  });

  it('returns do-now for priority now and state new', () => {
    const item = createMockMyWorkItem({ isBlocked: false, priority: 'now', state: 'new' });
    expect(assignLane(item)).toBe('do-now');
  });

  it('returns deferred for priority deferred', () => {
    const item = createMockMyWorkItem({ isBlocked: false, priority: 'deferred', state: 'active' });
    expect(assignLane(item)).toBe('deferred');
  });

  it('returns deferred for state deferred', () => {
    const item = createMockMyWorkItem({ isBlocked: false, priority: 'soon', state: 'deferred' });
    expect(assignLane(item)).toBe('deferred');
  });

  it('returns delegated-team when delegatedTo is set', () => {
    const item = createMockMyWorkItem({
      isBlocked: false,
      priority: 'soon',
      state: 'active',
      delegatedTo: { type: 'user', id: 'u-2', label: 'Bob' },
    });
    expect(assignLane(item)).toBe('delegated-team');
  });

  it('returns delegated-team when delegatedBy is set', () => {
    const item = createMockMyWorkItem({
      isBlocked: false,
      priority: 'soon',
      state: 'active',
      delegatedBy: { type: 'user', id: 'u-3', label: 'Alice' },
    });
    expect(assignLane(item)).toBe('delegated-team');
  });

  it('returns watch as default', () => {
    const item = createMockMyWorkItem({
      isBlocked: false,
      priority: 'soon',
      state: 'active',
      delegatedTo: null,
      delegatedBy: null,
    });
    expect(assignLane(item)).toBe('watch');
  });
});

describe('computeCounts', () => {
  it('counts all categories correctly', () => {
    const items = [
      createMockMyWorkItem({ isUnread: true, priority: 'now', isBlocked: false, state: 'active' }),
      createMockMyWorkItem({ isUnread: false, priority: 'soon', isBlocked: true, state: 'active', workItemId: 'w-2', dedupeKey: 'k2' }),
      createMockMyWorkItem({ isUnread: true, priority: 'watch', state: 'waiting', isBlocked: false, workItemId: 'w-3', dedupeKey: 'k3' }),
      createMockMyWorkItem({ isUnread: false, priority: 'deferred', state: 'deferred', isBlocked: false, workItemId: 'w-4', dedupeKey: 'k4' }),
      createMockMyWorkItem({
        isUnread: false, priority: 'soon', state: 'active', isBlocked: false,
        delegatedTo: { type: 'user', id: 'u-2', label: 'Bob' },
        workItemId: 'w-5', dedupeKey: 'k5',
      }),
    ];

    const counts = computeCounts(items);
    expect(counts.totalCount).toBe(5);
    expect(counts.unreadCount).toBe(2);
    expect(counts.nowCount).toBe(1);
    expect(counts.blockedCount).toBe(1);
    expect(counts.waitingCount).toBe(1);
    expect(counts.deferredCount).toBe(1);
    expect(counts.teamCount).toBe(1);
  });

  it('returns zeros for empty input', () => {
    const counts = computeCounts([]);
    expect(counts.totalCount).toBe(0);
    expect(counts.unreadCount).toBe(0);
  });

  it('counts state blocked in blockedCount', () => {
    const items = [createMockMyWorkItem({ state: 'blocked', isBlocked: false })];
    const counts = computeCounts(items);
    expect(counts.blockedCount).toBe(1);
  });

  it('counts delegatedBy in teamCount', () => {
    const items = [createMockMyWorkItem({
      delegatedBy: { type: 'user', id: 'u-1', label: 'A' },
      delegatedTo: null,
    })];
    const counts = computeCounts(items);
    expect(counts.teamCount).toBe(1);
  });
});

describe('projectFeedResult', () => {
  it('filters by projectId', () => {
    const items = [
      createMockMyWorkItem({ context: { moduleKey: 'bic', projectId: 'p-1' } }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', context: { moduleKey: 'bic', projectId: 'p-2' } }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ projectId: 'p-1' }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].context.projectId).toBe('p-1');
  });

  it('filters by priorities', () => {
    const items = [
      createMockMyWorkItem({ priority: 'now' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', priority: 'soon' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ priorities: ['now'] }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('filters by classes', () => {
    const items = [
      createMockMyWorkItem({ class: 'owned-action' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', class: 'inbound-handoff' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ classes: ['inbound-handoff'] }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].class).toBe('inbound-handoff');
  });

  it('filters by states', () => {
    const items = [
      createMockMyWorkItem({ state: 'active' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', state: 'completed' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ states: ['active'] }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('filters by lane', () => {
    const items = [
      createMockMyWorkItem({ lane: 'do-now' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', lane: 'watch' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ lane: 'do-now' }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('filters by locationLabel', () => {
    const items = [
      createMockMyWorkItem({ locationLabel: 'NYC' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', locationLabel: 'LA' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ locationLabel: 'NYC' }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('excludes deferred by default', () => {
    const items = [
      createMockMyWorkItem({ state: 'active' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', state: 'deferred' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery(), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('includes deferred when includeDeferred is true', () => {
    const items = [
      createMockMyWorkItem({ state: 'active' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', state: 'deferred' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ includeDeferred: true }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(2);
  });

  it('excludes superseded by default', () => {
    const items = [
      createMockMyWorkItem({ state: 'active' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', state: 'superseded' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery(), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
  });

  it('includes superseded when includeSuperseded is true', () => {
    const items = [
      createMockMyWorkItem({ state: 'active' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', state: 'superseded' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ includeSuperseded: true }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(2);
  });

  it('applies limit', () => {
    const items = [
      createMockMyWorkItem({ workItemId: 'w-1', dedupeKey: 'k1' }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2' }),
      createMockMyWorkItem({ workItemId: 'w-3', dedupeKey: 'k3' }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ limit: 2 }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(2);
  });

  it('sets isStale true when freshness is cached', () => {
    const result = projectFeedResult(
      [],
      createMockMyWorkQuery(),
      { freshness: 'cached' },
      '2026-01-20T00:00:00Z',
    );
    expect(result.isStale).toBe(true);
  });

  it('sets isStale true when freshness is partial', () => {
    const result = projectFeedResult(
      [],
      createMockMyWorkQuery(),
      { freshness: 'partial' },
      '2026-01-20T00:00:00Z',
    );
    expect(result.isStale).toBe(true);
  });

  it('sets isStale false when freshness is live', () => {
    const result = projectFeedResult(
      [],
      createMockMyWorkQuery(),
      { freshness: 'live' },
      '2026-01-20T00:00:00Z',
    );
    expect(result.isStale).toBe(false);
  });

  it('sets isStale false when healthState is undefined', () => {
    const result = projectFeedResult(
      [],
      createMockMyWorkQuery(),
      undefined,
      '2026-01-20T00:00:00Z',
    );
    expect(result.isStale).toBe(false);
  });

  it('filters by moduleKeys', () => {
    const items = [
      createMockMyWorkItem({ context: { moduleKey: 'bic' } }),
      createMockMyWorkItem({ workItemId: 'w-2', dedupeKey: 'k2', context: { moduleKey: 'handoff' } }),
    ];
    const result = projectFeedResult(items, createMockMyWorkQuery({ moduleKeys: ['bic'] }), undefined, '2026-01-20T00:00:00Z');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].context.moduleKey).toBe('bic');
  });
});
