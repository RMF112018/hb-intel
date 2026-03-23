import { describe, expect, it, beforeEach } from 'vitest';
import {
  saveReturnMemory,
  getReturnMemory,
  clearReturnMemory,
  pruneExpiredReturnMemory,
} from './projectReturnMemory.js';

// Mock localStorage
const storage = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (_i: number) => null,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('projectReturnMemory', () => {
  const now = new Date('2026-03-22T14:00:00.000Z');

  beforeEach(() => {
    storage.clear();
  });

  describe('saveReturnMemory + getReturnMemory', () => {
    it('saves and retrieves return memory', () => {
      saveReturnMemory('proj-001', '/financial', null, now);
      const memory = getReturnMemory('proj-001', now);
      expect(memory).not.toBeNull();
      expect(memory?.projectId).toBe('proj-001');
      expect(memory?.lastPath).toBe('/financial');
      expect(memory?.lastVisitedAt).toBe('2026-03-22T14:00:00.000Z');
    });

    it('stores query params', () => {
      saveReturnMemory('proj-001', '/schedule', { view: 'gantt' }, now);
      const memory = getReturnMemory('proj-001', now);
      expect(memory?.lastQueryParams).toEqual({ view: 'gantt' });
    });

    it('overwrites previous memory for same project', () => {
      saveReturnMemory('proj-001', '/financial', null, now);
      saveReturnMemory('proj-001', '/schedule', null, now);
      const memory = getReturnMemory('proj-001', now);
      expect(memory?.lastPath).toBe('/schedule');
    });
  });

  describe('TTL expiration', () => {
    it('returns null for expired entries', () => {
      saveReturnMemory('proj-001', '/financial', null, now);
      // 8 days later — past 7-day TTL
      const future = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      expect(getReturnMemory('proj-001', future)).toBeNull();
    });

    it('returns entry within TTL', () => {
      saveReturnMemory('proj-001', '/financial', null, now);
      // 6 days later — within TTL
      const future = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
      expect(getReturnMemory('proj-001', future)).not.toBeNull();
    });
  });

  describe('clearReturnMemory', () => {
    it('removes specific project entry', () => {
      saveReturnMemory('proj-001', '/financial', null, now);
      saveReturnMemory('proj-002', '/schedule', null, now);
      clearReturnMemory('proj-001');
      expect(getReturnMemory('proj-001', now)).toBeNull();
      expect(getReturnMemory('proj-002', now)).not.toBeNull();
    });
  });

  describe('pruneExpiredReturnMemory', () => {
    it('removes all expired entries', () => {
      saveReturnMemory('proj-old', '/financial', null, now);
      const future = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      saveReturnMemory('proj-new', '/schedule', null, future);

      pruneExpiredReturnMemory(future);

      expect(getReturnMemory('proj-old', future)).toBeNull();
      expect(getReturnMemory('proj-new', future)).not.toBeNull();
    });
  });

  describe('LRU pruning', () => {
    it('keeps only 50 most recent entries', () => {
      // Write 55 entries
      for (let i = 0; i < 55; i++) {
        const time = new Date(now.getTime() + i * 1000);
        saveReturnMemory(`proj-${String(i).padStart(3, '0')}`, '/page', null, time);
      }

      // Oldest 5 should be pruned
      expect(getReturnMemory('proj-000', now)).toBeNull();
      expect(getReturnMemory('proj-004', now)).toBeNull();
      // Recent should remain
      expect(getReturnMemory('proj-054', now)).not.toBeNull();
      expect(getReturnMemory('proj-050', now)).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for unknown projectId', () => {
      expect(getReturnMemory('unknown', now)).toBeNull();
    });

    it('handles empty projectId gracefully', () => {
      saveReturnMemory('', '/financial', null, now);
      expect(getReturnMemory('', now)).not.toBeNull();
    });
  });
});
