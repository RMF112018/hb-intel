import { describe, it, expect } from 'vitest';
import {
  createMockMyWorkItem,
  createMockMyWorkQuery,
  createMockMyWorkFeedResult,
  mockItemClasses,
  mockPriorityLanes,
  mockStates,
  mockOwnerTypes,
  mockSources,
  mockSyncStatuses,
} from '@hbc/my-work-feed/testing';
import {
  MY_WORK_QUERY_KEY_PREFIX,
  MY_WORK_PRIORITY_LANES,
  MY_WORK_REPLAYABLE_ACTIONS,
  MY_WORK_SYNC_STATUSES,
} from '../constants/index.js';
import { buildReasoningPayload } from '../hooks/useMyWorkReasoning.js';

describe('contracts', () => {
  // ─── Factory completeness ────────────────────────────────────────────────

  describe('createMockMyWorkItem', () => {
    it('returns an object with all required fields defined', () => {
      const item = createMockMyWorkItem();

      expect(item.workItemId).toBeDefined();
      expect(item.canonicalKey).toBeDefined();
      expect(item.dedupeKey).toBeDefined();
      expect(item.class).toBeDefined();
      expect(item.priority).toBeDefined();
      expect(item.state).toBeDefined();
      expect(item.lane).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.summary).toBeDefined();
      expect(typeof item.isOverdue).toBe('boolean');
      expect(typeof item.isUnread).toBe('boolean');
      expect(typeof item.isBlocked).toBe('boolean');
      expect(item.owner).toBeDefined();
      expect(item.context).toBeDefined();
      expect(item.sourceMeta).toBeDefined();
      expect(item.permissionState).toBeDefined();
      expect(item.lifecycle).toBeDefined();
      expect(item.rankingReason).toBeDefined();
      expect(item.availableActions).toBeDefined();
      expect(typeof item.offlineCapable).toBe('boolean');
      expect(item.timestamps).toBeDefined();
      expect(item.timestamps.createdAtIso).toBeDefined();
      expect(item.timestamps.updatedAtIso).toBeDefined();
    });
  });

  // ─── Union exhaustiveness ────────────────────────────────────────────────

  describe('union exhaustiveness', () => {
    it('mockItemClasses has 6 members', () => {
      expect(mockItemClasses).toHaveLength(6);
      expect(mockItemClasses).toContain('owned-action');
      expect(mockItemClasses).toContain('contextual-signal');
    });

    it('mockPriorityLanes has 4 members', () => {
      expect(mockPriorityLanes).toHaveLength(4);
      expect(mockPriorityLanes).toEqual(['now', 'soon', 'watch', 'deferred']);
    });

    it('mockStates has 7 members', () => {
      expect(mockStates).toHaveLength(7);
      expect(mockStates).toContain('new');
      expect(mockStates).toContain('completed');
    });

    it('mockOwnerTypes has 4 members', () => {
      expect(mockOwnerTypes).toHaveLength(4);
      expect(mockOwnerTypes).toEqual(['user', 'role', 'company', 'system']);
    });

    it('mockSources has 6 members', () => {
      expect(mockSources).toHaveLength(6);
      expect(mockSources).toContain('bic-next-move');
      expect(mockSources).toContain('module');
    });

    it('mockSyncStatuses has 4 members', () => {
      expect(mockSyncStatuses).toHaveLength(4);
      expect(mockSyncStatuses).toEqual(['live', 'cached', 'partial', 'queued']);
    });
  });

  // ─── Constants lock ──────────────────────────────────────────────────────

  describe('constants lock', () => {
    it('MY_WORK_QUERY_KEY_PREFIX is "my-work"', () => {
      expect(MY_WORK_QUERY_KEY_PREFIX).toBe('my-work');
    });

    it('MY_WORK_PRIORITY_LANES has 4 values', () => {
      expect(MY_WORK_PRIORITY_LANES).toHaveLength(4);
      expect(MY_WORK_PRIORITY_LANES).toEqual(['now', 'soon', 'watch', 'deferred']);
    });

    it('MY_WORK_REPLAYABLE_ACTIONS has 6 values', () => {
      expect(MY_WORK_REPLAYABLE_ACTIONS).toHaveLength(6);
    });

    it('MY_WORK_SYNC_STATUSES has 4 values', () => {
      expect(MY_WORK_SYNC_STATUSES).toHaveLength(4);
      expect(MY_WORK_SYNC_STATUSES).toEqual(['live', 'cached', 'partial', 'queued']);
    });
  });

  // ─── Contract invariants ─────────────────────────────────────────────────

  describe('contract invariants', () => {
    it('mock item has non-empty sourceMeta array', () => {
      const item = createMockMyWorkItem();
      expect(item.sourceMeta.length).toBeGreaterThan(0);
    });

    it('mock item has non-empty primaryReason', () => {
      const item = createMockMyWorkItem();
      expect(item.rankingReason.primaryReason).toBeTruthy();
    });

    it('mock item has canAct as boolean', () => {
      const item = createMockMyWorkItem();
      expect(typeof item.permissionState.canAct).toBe('boolean');
    });

    it('feed result items contain IMyWorkItem[]', () => {
      const result = createMockMyWorkFeedResult();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items[0].workItemId).toBeDefined();
    });
  });

  // ─── Explainability payload construction ────────────────────────────────

  describe('explainability payload construction', () => {
    it('extracts workItemId, canonicalKey, title, rankingReason, lifecycle, permissionState, sourceMeta', () => {
      const item = createMockMyWorkItem();
      const payload = buildReasoningPayload(item);

      expect(payload.workItemId).toBe(item.workItemId);
      expect(payload.canonicalKey).toBe(item.canonicalKey);
      expect(payload.title).toBe(item.title);
      expect(payload.rankingReason).toEqual(item.rankingReason);
      expect(payload.lifecycle).toEqual(item.lifecycle);
      expect(payload.permissionState).toEqual(item.permissionState);
      expect(payload.sourceMeta).toEqual(item.sourceMeta);
    });

    it('includes dedupeInfo when item has dedupe metadata', () => {
      const dedupeData = {
        dedupeKey: 'dk-001',
        mergedSourceMeta: [{ source: 'notification-intelligence' as const, sourceItemId: 'src-2', sourceUpdatedAtIso: '2026-01-15T09:00:00.000Z' }],
        mergeReason: 'Same record',
      };
      const item = createMockMyWorkItem({ dedupe: dedupeData });
      const payload = buildReasoningPayload(item);

      expect(payload.dedupeInfo).toEqual(dedupeData);
    });

    it('includes supersessionInfo when item has supersession metadata', () => {
      const supersessionData = {
        supersededByWorkItemId: 'work-002',
        supersessionReason: 'Higher-truth source',
        originalRankingReason: { primaryReason: 'Old', contributingReasons: [] as string[], score: 0.3 },
      };
      const item = createMockMyWorkItem({ supersession: supersessionData });
      const payload = buildReasoningPayload(item);

      expect(payload.supersessionInfo).toEqual(supersessionData);
    });

    it('dedupeInfo is undefined when item has no dedupe', () => {
      const item = createMockMyWorkItem();
      const payload = buildReasoningPayload(item);

      expect(payload.dedupeInfo).toBeUndefined();
    });

    it('supersessionInfo is undefined when item has no supersession', () => {
      const item = createMockMyWorkItem();
      const payload = buildReasoningPayload(item);

      expect(payload.supersessionInfo).toBeUndefined();
    });
  });

  // ─── Factory override behavior ───────────────────────────────────────────

  describe('factory override behavior', () => {
    it('createMockMyWorkItem merges partial overrides', () => {
      const item = createMockMyWorkItem({
        workItemId: 'custom-id',
        title: 'Custom Title',
        priority: 'deferred',
      });
      expect(item.workItemId).toBe('custom-id');
      expect(item.title).toBe('Custom Title');
      expect(item.priority).toBe('deferred');
      // Non-overridden fields retain defaults
      expect(item.state).toBe('active');
    });

    it('createMockMyWorkQuery merges partial overrides', () => {
      const query = createMockMyWorkQuery({ projectId: 'proj-999', limit: 50 });
      expect(query.projectId).toBe('proj-999');
      expect(query.limit).toBe(50);
    });

    it('createMockMyWorkFeedResult merges partial overrides', () => {
      const result = createMockMyWorkFeedResult({ totalCount: 42, isStale: true });
      expect(result.totalCount).toBe(42);
      expect(result.isStale).toBe(true);
      // Non-overridden fields retain defaults
      expect(result.items).toHaveLength(1);
    });
  });
});
