import { describe, expect, it } from 'vitest';
import { activityTimelineKeys } from './queryKeys.js';
import type {
  UseActivityTimelineOptions,
  UseActivityTimelineResult,
  UseActivityFiltersResult,
  UseActivityEmitterResult,
  UseActivityDiffResult,
  UseActivitySourceHealthResult,
} from './index.js';

describe('SF28-T04 Hook Contracts', () => {
  describe('activityTimelineKeys', () => {
    it('generates timeline key with mode and projectId', () => {
      const key = activityTimelineKeys.timeline('workspace', 'proj-001');
      expect(key).toEqual(['activity-timeline', 'workspace', 'proj-001']);
    });

    it('generates filter key with scopeKey', () => {
      const key = activityTimelineKeys.filters('proj-001');
      expect(key).toEqual(['activity-timeline', 'filters', 'proj-001']);
    });

    it('generates source health key', () => {
      const key = activityTimelineKeys.sourceHealth('proj-001');
      expect(key).toEqual(['activity-timeline', 'source-health', 'proj-001']);
    });

    it('keys are distinct across modes', () => {
      const ws = activityTimelineKeys.timeline('workspace', 'p1');
      const rec = activityTimelineKeys.timeline('record', 'p1');
      const rel = activityTimelineKeys.timeline('related', 'p1');
      expect(ws[1]).not.toBe(rec[1]);
      expect(ws[1]).not.toBe(rel[1]);
    });
  });

  describe('UseActivityTimelineResult shape', () => {
    it('satisfies required fields', () => {
      const result: UseActivityTimelineResult = {
        events: [],
        isLoading: false,
        isError: false,
        error: null,
        hasMore: false,
        cursor: null,
        refetch: async () => {},
      };
      expect(result.events).toEqual([]);
      expect(result.isLoading).toBe(false);
    });
  });

  describe('UseActivityFiltersResult shape', () => {
    it('satisfies required fields', () => {
      const result: UseActivityFiltersResult = {
        filters: {
          selectedEventTypes: [],
          selectedActorUpns: [],
          timeframeStart: null,
          timeframeEnd: null,
          relatedRecordIds: [],
          moduleScopes: [],
          excludeSystemEvents: false,
        },
        setFilter: () => {},
        resetFilters: () => {},
        hasActiveFilters: false,
      };
      expect(result.hasActiveFilters).toBe(false);
    });
  });

  describe('UseActivityEmitterResult shape', () => {
    it('has emit function', () => {
      const result: UseActivityEmitterResult = {
        emit: () => { throw new Error('mock'); },
      };
      expect(typeof result.emit).toBe('function');
    });
  });

  describe('UseActivityDiffResult shape', () => {
    it('has toggle and expansion state', () => {
      const result: UseActivityDiffResult = {
        expandedDiffIds: new Set(),
        toggleDiff: () => {},
        isDiffExpanded: () => false,
        collapseAll: () => {},
      };
      expect(result.expandedDiffIds.size).toBe(0);
    });
  });

  describe('UseActivitySourceHealthResult shape', () => {
    it('has health and derived state', () => {
      const result: UseActivitySourceHealthResult = {
        health: {
          sourceIdentity: 'in-memory',
          lastSuccessfulLoad: null,
          consecutiveFailures: 0,
          degradationReason: null,
          confidence: 'trusted-authoritative',
        },
        isDegraded: false,
        degradationLabel: null,
        confidence: 'trusted-authoritative',
      };
      expect(result.isDegraded).toBe(false);
    });
  });
});
