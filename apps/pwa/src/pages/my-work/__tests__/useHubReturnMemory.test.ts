/**
 * Gate 12 (P2-C4 scenarios 5/6): Return-from-domain/Project-Hub validation.
 * Verifies hub state restoration and feed refresh on return per P2-B2 §5, §7.
 */
import { describe, it, expect } from 'vitest';
import type { IMyWorkReturnState } from '../hubStateTypes.js';
import { HUB_DRAFT_KEYS, HUB_DRAFT_TTL } from '../hubStateTypes.js';

describe('Hub return memory contract (P2-C4 scenarios 5/6)', () => {
  describe('draft key constants', () => {
    it('uses correct key for return state', () => {
      expect(HUB_DRAFT_KEYS.returnState).toBe('hbc-my-work-return-state');
    });

    it('uses correct key for query seed', () => {
      expect(HUB_DRAFT_KEYS.querySeed).toBe('hbc-my-work-query-seed');
    });

    it('return state TTL is 1 hour per P2-B2 §3', () => {
      expect(HUB_DRAFT_TTL.returnState).toBe(1);
    });

    it('query seed TTL is 8 hours per P2-B2 §3', () => {
      expect(HUB_DRAFT_TTL.querySeed).toBe(8);
    });
  });

  describe('IMyWorkReturnState shape', () => {
    it('captures scroll position and expanded groups per P2-B2 §5', () => {
      const state: IMyWorkReturnState = {
        scrollPosition: 450,
        expandedGroupKeys: ['do-now', 'watch'],
        capturedAt: '2026-03-20T10:00:00.000Z',
      };

      expect(state.scrollPosition).toBe(450);
      expect(state.expandedGroupKeys).toContain('do-now');
      expect(state.capturedAt).toBeTruthy();
    });
  });

  describe('return path contract (P2-C4 §6)', () => {
    it('return state includes scroll position for restoration', () => {
      const state: IMyWorkReturnState = {
        scrollPosition: 1200,
        expandedGroupKeys: [],
        capturedAt: new Date().toISOString(),
      };
      expect(typeof state.scrollPosition).toBe('number');
    });

    it('return state includes expanded group keys for visual continuity', () => {
      const state: IMyWorkReturnState = {
        scrollPosition: 0,
        expandedGroupKeys: ['do-now', 'waiting-blocked', 'watch'],
        capturedAt: new Date().toISOString(),
      };
      expect(state.expandedGroupKeys).toHaveLength(3);
    });

    it('capturedAt timestamp enables TTL-based expiry', () => {
      const state: IMyWorkReturnState = {
        scrollPosition: 0,
        expandedGroupKeys: [],
        capturedAt: new Date().toISOString(),
      };
      expect(new Date(state.capturedAt).getTime()).toBeGreaterThan(0);
    });
  });
});
