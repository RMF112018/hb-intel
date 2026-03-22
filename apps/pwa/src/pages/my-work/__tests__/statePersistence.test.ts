/**
 * State persistence and return-memory tests — P2-B2, STT-01, STT-02.
 *
 * Verifies:
 * - All hub draft keys and TTLs per P2-B2 §3
 * - Feed cache key (STT-01) added in remediation 1-B
 * - Route onLeave capture bridge (STT-02) from remediation 1-C
 * - Draft key completeness (no missing keys)
 */
import { describe, it, expect } from 'vitest';
import { HUB_DRAFT_KEYS, HUB_DRAFT_TTL } from '../hubStateTypes.js';
import type { IMyWorkFeedCacheDraft, IMyWorkQuerySeedDraft, IMyWorkReturnState, IMyWorkTeamModeDraft, IMyWorkCardArrangement } from '../hubStateTypes.js';
import { triggerOnLeaveCapture } from '../useHubReturnMemory.js';

describe('State persistence contract (P2-B2 §3–§6)', () => {
  describe('STT-01: Feed cache draft key', () => {
    it('feed cache key is hbc-my-work-feed-cache', () => {
      expect(HUB_DRAFT_KEYS.feedCache).toBe('hbc-my-work-feed-cache');
    });

    it('feed cache TTL is 4 hours per P2-B2 §6', () => {
      expect(HUB_DRAFT_TTL.feedCache).toBe(4);
    });

    it('IMyWorkFeedCacheDraft shape includes items and cachedAt', () => {
      const draft: IMyWorkFeedCacheDraft = {
        items: [],
        totalCount: 0,
        lastRefreshedIso: '2026-03-22T10:00:00.000Z',
        cachedAt: '2026-03-22T10:00:00.000Z',
      };
      expect(draft.items).toEqual([]);
      expect(draft.cachedAt).toBeTruthy();
    });
  });

  describe('Team mode draft key', () => {
    it('team mode key is hbc-my-work-team-mode', () => {
      expect(HUB_DRAFT_KEYS.teamMode).toBe('hbc-my-work-team-mode');
    });

    it('team mode TTL is 16 hours per P2-D5 §7', () => {
      expect(HUB_DRAFT_TTL.teamMode).toBe(16);
    });

    it('IMyWorkTeamModeDraft shape', () => {
      const draft: IMyWorkTeamModeDraft = {
        teamMode: 'my-team',
        savedAt: new Date().toISOString(),
      };
      expect(draft.teamMode).toBe('my-team');
    });
  });

  describe('Card arrangement draft key', () => {
    it('card arrangement key is hbc-my-work-card-arrangement', () => {
      expect(HUB_DRAFT_KEYS.cardArrangement).toBe('hbc-my-work-card-arrangement');
    });

    it('card arrangement TTL is 720 hours (30 days) per P2-D5 §4', () => {
      expect(HUB_DRAFT_TTL.cardArrangement).toBe(720);
    });

    it('IMyWorkCardArrangement shape includes zone slots', () => {
      const arrangement: IMyWorkCardArrangement = {
        secondaryZone: [{ cardId: 'hub:lane-summary', visible: true }],
        tertiaryZone: [{ cardId: 'hub:recent-context', visible: true }],
        savedAt: new Date().toISOString(),
      };
      expect(arrangement.secondaryZone).toHaveLength(1);
      expect(arrangement.tertiaryZone).toHaveLength(1);
    });
  });

  describe('Filter state draft key', () => {
    it('filter state key is hbc-my-work-filter-state', () => {
      expect(HUB_DRAFT_KEYS.filterState).toBe('hbc-my-work-filter-state');
    });

    it('filter state TTL is 8 hours per P2-D5 §8', () => {
      expect(HUB_DRAFT_TTL.filterState).toBe(8);
    });
  });

  describe('Draft key completeness', () => {
    it('HUB_DRAFT_KEYS has all 6 required keys', () => {
      const keys = Object.keys(HUB_DRAFT_KEYS);
      expect(keys).toContain('querySeed');
      expect(keys).toContain('returnState');
      expect(keys).toContain('teamMode');
      expect(keys).toContain('filterState');
      expect(keys).toContain('cardArrangement');
      expect(keys).toContain('feedCache');
      expect(keys).toHaveLength(6);
    });

    it('HUB_DRAFT_TTL has matching keys', () => {
      const draftKeys = Object.keys(HUB_DRAFT_KEYS);
      const ttlKeys = Object.keys(HUB_DRAFT_TTL);
      expect(ttlKeys.sort()).toEqual(draftKeys.sort());
    });
  });

  describe('STT-02: Route onLeave capture bridge', () => {
    it('triggerOnLeaveCapture is a callable function', () => {
      expect(typeof triggerOnLeaveCapture).toBe('function');
    });

    it('triggerOnLeaveCapture does not throw when no callback registered', () => {
      expect(() => triggerOnLeaveCapture()).not.toThrow();
    });
  });

  describe('Query seed shape', () => {
    it('IMyWorkQuerySeedDraft includes teamMode and savedAt', () => {
      const seed: IMyWorkQuerySeedDraft = {
        teamMode: 'delegated-by-me',
        savedAt: new Date().toISOString(),
      };
      expect(seed.teamMode).toBe('delegated-by-me');
      expect(seed.savedAt).toBeTruthy();
    });

    it('IMyWorkQuerySeedDraft lane is optional', () => {
      const seed: IMyWorkQuerySeedDraft = {
        lane: 'do-now',
        savedAt: new Date().toISOString(),
      };
      expect(seed.lane).toBe('do-now');
    });
  });
});
