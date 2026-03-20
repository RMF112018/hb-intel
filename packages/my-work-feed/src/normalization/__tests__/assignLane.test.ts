/**
 * Gate 6 (P2-C2 §3): Lane assignment validation.
 * Verifies that assignLane() routes items to correct feed lanes
 * based on priority, state, and blocking conditions.
 */
import { describe, it, expect } from 'vitest';
import { assignLane, computeCounts } from '../projectFeed.js';
import type { IMyWorkItem } from '../../types/index.js';

function createStubItem(overrides: Partial<IMyWorkItem> = {}): IMyWorkItem {
  return {
    workItemId: 'test-001',
    canonicalKey: 'test::item::001',
    dedupeKey: 'test::item::001',
    class: 'owned-action',
    priority: 'watch',
    state: 'active',
    lane: 'watch',
    title: 'Test item',
    summary: 'Test',
    isOverdue: false,
    isUnread: false,
    isBlocked: false,
    blockedReason: null,
    changeSummary: null,
    whyThisMatters: null,
    supersededByWorkItemId: null,
    owner: { type: 'user', id: 'u1', label: 'User' },
    previousOwner: null,
    context: { moduleKey: 'test' },
    sourceMeta: [],
    permissionState: { canOpen: true, canAct: true },
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: null,
      nextStepLabel: null,
      blockedDependencyLabel: null,
      impactedRecordLabel: null,
    },
    rankingReason: { primaryReason: 'test', contributingReasons: [] },
    availableActions: [],
    offlineCapable: false,
    timestamps: { createdAtIso: '2026-03-20T10:00:00Z', updatedAtIso: '2026-03-20T10:00:00Z' },
    delegatedBy: null,
    delegatedTo: null,
    locationLabel: null,
    userNote: null,
    ...overrides,
  } as IMyWorkItem;
}

describe('assignLane (P2-C2 §3 lane assignment)', () => {
  it('assigns do-now for priority now + state new', () => {
    const item = createStubItem({ priority: 'now', state: 'new' });
    expect(assignLane(item)).toBe('do-now');
  });

  it('assigns do-now for priority now + state active', () => {
    const item = createStubItem({ priority: 'now', state: 'active' });
    expect(assignLane(item)).toBe('do-now');
  });

  it('assigns waiting-blocked for blocked items', () => {
    const item = createStubItem({ isBlocked: true, priority: 'now' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('assigns waiting-blocked for state blocked', () => {
    const item = createStubItem({ state: 'blocked' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('assigns waiting-blocked for state waiting', () => {
    const item = createStubItem({ state: 'waiting' });
    expect(assignLane(item)).toBe('waiting-blocked');
  });

  it('assigns deferred for priority deferred', () => {
    const item = createStubItem({ priority: 'deferred' });
    expect(assignLane(item)).toBe('deferred');
  });

  it('assigns deferred for state deferred', () => {
    const item = createStubItem({ state: 'deferred' });
    expect(assignLane(item)).toBe('deferred');
  });

  it('assigns watch as default fallback', () => {
    const item = createStubItem({ priority: 'soon', state: 'active' });
    expect(assignLane(item)).toBe('watch');
  });
});

describe('computeCounts', () => {
  it('counts nowCount for priority now items', () => {
    const items = [
      createStubItem({ priority: 'now', state: 'new', isUnread: true }),
      createStubItem({ priority: 'soon', state: 'active' }),
    ];
    const counts = computeCounts(items);
    expect(counts.nowCount).toBe(1);
    expect(counts.totalCount).toBe(2);
    expect(counts.unreadCount).toBe(1);
  });
});
