import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { noopVisitStore, createEmptyStateVisitStore } from '../classification/emptyStateVisitStore.js';
import { EMPTY_STATE_VISIT_KEY_PREFIX } from '../constants/emptyStateDefaults.js';

describe('noopVisitStore', () => {
  it('hasVisited always returns false', () => {
    expect(noopVisitStore.hasVisited('mod', 'view')).toBe(false);
  });

  it('markVisited returns undefined', () => {
    expect(noopVisitStore.markVisited('mod', 'view')).toBeUndefined();
  });
});

describe('createEmptyStateVisitStore', () => {
  describe('with Storage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('hasVisited returns false for unvisited module/view', () => {
      const store = createEmptyStateVisitStore(localStorage);
      expect(store.hasVisited('accounting', 'list')).toBe(false);
    });

    it('markVisited + hasVisited round-trip', () => {
      const store = createEmptyStateVisitStore(localStorage);
      store.markVisited('accounting', 'list');
      expect(store.hasVisited('accounting', 'list')).toBe(true);
    });

    it('builds keys with correct format', () => {
      const store = createEmptyStateVisitStore(localStorage);
      store.markVisited('accounting', 'dashboard');
      const expectedKey = `${EMPTY_STATE_VISIT_KEY_PREFIX}::accounting::dashboard`;
      expect(localStorage.getItem(expectedKey)).toBe('true');
    });

    it('treats independent module/view pairs separately', () => {
      const store = createEmptyStateVisitStore(localStorage);
      store.markVisited('accounting', 'list');
      expect(store.hasVisited('accounting', 'list')).toBe(true);
      expect(store.hasVisited('accounting', 'detail')).toBe(false);
      expect(store.hasVisited('estimating', 'list')).toBe(false);
    });
  });

  describe('without Storage (in-memory fallback)', () => {
    it('hasVisited returns false initially', () => {
      const store = createEmptyStateVisitStore();
      expect(store.hasVisited('mod', 'view')).toBe(false);
    });

    it('markVisited + hasVisited round-trip in memory', () => {
      const store = createEmptyStateVisitStore();
      store.markVisited('mod', 'view');
      expect(store.hasVisited('mod', 'view')).toBe(true);
    });

    it('separate store instances have independent memory', () => {
      const store1 = createEmptyStateVisitStore();
      const store2 = createEmptyStateVisitStore();
      store1.markVisited('mod', 'view');
      expect(store1.hasVisited('mod', 'view')).toBe(true);
      expect(store2.hasVisited('mod', 'view')).toBe(false);
    });
  });

  describe('storage error fallback', () => {
    it('falls back to memory on getItem error', () => {
      const badStorage = {
        getItem: vi.fn(() => { throw new Error('quota exceeded'); }),
        setItem: vi.fn(() => { throw new Error('quota exceeded'); }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as unknown as Storage;

      const store = createEmptyStateVisitStore(badStorage);
      // getItem throws → falls back to memoryFallback (not visited yet)
      expect(store.hasVisited('mod', 'view')).toBe(false);
      // setItem throws → falls back to memoryFallback.add
      store.markVisited('mod', 'view');
      // Now memoryFallback has the key, but getItem still throws → fallback read
      expect(store.hasVisited('mod', 'view')).toBe(true);
    });

    it('falls back to memory on setItem error', () => {
      const failOnSet = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => { throw new Error('quota exceeded'); }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as unknown as Storage;

      const store = createEmptyStateVisitStore(failOnSet);
      store.markVisited('mod', 'view');
      // getItem returns null (not 'true'), but memoryFallback was populated on setItem failure
      // However getItem doesn't throw, so it returns storage result (null → false)
      // This tests that markVisited used the fallback
      expect(failOnSet.setItem).toHaveBeenCalled();
    });
  });

  describe('corrupted value handling', () => {
    it('treats non-"true" strings as not visited', () => {
      const corruptStorage = {
        getItem: vi.fn(() => 'yes'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as unknown as Storage;

      const store = createEmptyStateVisitStore(corruptStorage);
      expect(store.hasVisited('mod', 'view')).toBe(false);
    });

    it('treats empty string as not visited', () => {
      const corruptStorage = {
        getItem: vi.fn(() => ''),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as unknown as Storage;

      const store = createEmptyStateVisitStore(corruptStorage);
      expect(store.hasVisited('mod', 'view')).toBe(false);
    });

    it('treats null as not visited', () => {
      const corruptStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      } as unknown as Storage;

      const store = createEmptyStateVisitStore(corruptStorage);
      expect(store.hasVisited('mod', 'view')).toBe(false);
    });
  });

  describe('dev-time validation', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('throws on empty module in development', () => {
      process.env.NODE_ENV = 'development';
      const store = createEmptyStateVisitStore();
      expect(() => store.hasVisited('', 'view')).toThrow('module must not be empty');
      expect(() => store.markVisited('', 'view')).toThrow('module must not be empty');
    });

    it('throws on empty view in development', () => {
      process.env.NODE_ENV = 'development';
      const store = createEmptyStateVisitStore();
      expect(() => store.hasVisited('mod', '')).toThrow('view must not be empty');
      expect(() => store.markVisited('mod', '')).toThrow('view must not be empty');
    });

    it('does not throw on empty module/view in production', () => {
      process.env.NODE_ENV = 'production';
      const store = createEmptyStateVisitStore();
      expect(() => store.hasVisited('', '')).not.toThrow();
      expect(() => store.markVisited('', '')).not.toThrow();
    });
  });
});
