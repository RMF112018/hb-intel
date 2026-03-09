import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStorage } from '../storage/getStorage';

describe('getStorage', () => {
  it('returns localStorage when isSpfx=false', () => {
    const storage = getStorage(false);
    expect(storage).toBe(window.localStorage);
  });

  it('returns sessionStorage when isSpfx=true', () => {
    const storage = getStorage(true);
    expect(storage).toBe(window.sessionStorage);
  });

  it('returns in-memory fallback when localStorage throws', () => {
    const originalLocalStorage = window.localStorage;

    // Create a mock that throws on setItem
    const throwingStorage = {
      ...originalLocalStorage,
      setItem: vi.fn(() => { throw new DOMException('quota exceeded'); }),
      getItem: vi.fn(() => null),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };

    Object.defineProperty(window, 'localStorage', {
      value: throwingStorage,
      configurable: true,
      writable: true,
    });

    const storage = getStorage(false);
    // Should be the in-memory fallback, not the original localStorage
    expect(storage).not.toBe(throwingStorage);

    // Verify in-memory storage works
    storage.setItem('test', 'value');
    expect(storage.getItem('test')).toBe('value');
    storage.removeItem('test');
    expect(storage.getItem('test')).toBeNull();
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    expect(storage.length).toBe(2);
    expect(storage.key(0)).toBe('a');
    storage.clear();
    expect(storage.length).toBe(0);
    expect(storage.key(0)).toBeNull();

    // Restore
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  it('returns in-memory fallback when sessionStorage throws', () => {
    const originalSessionStorage = window.sessionStorage;

    const throwingStorage = {
      ...originalSessionStorage,
      setItem: vi.fn(() => { throw new DOMException('quota exceeded'); }),
      getItem: vi.fn(() => null),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(() => null),
    };

    Object.defineProperty(window, 'sessionStorage', {
      value: throwingStorage,
      configurable: true,
      writable: true,
    });

    const storage = getStorage(true);
    expect(storage).not.toBe(throwingStorage);
    storage.setItem('test', 'value');
    expect(storage.getItem('test')).toBe('value');

    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      configurable: true,
      writable: true,
    });
  });
});
