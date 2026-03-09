import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getStorage to return a storage that throws
vi.mock('../storage/getStorage', () => ({
  getStorage: vi.fn(() => ({
    getItem: () => { throw new Error('fail'); },
    setItem: () => { throw new Error('fail'); },
    removeItem: () => { throw new Error('fail'); },
    clear: () => {},
    length: 0,
    key: () => null,
  })),
}));

// Must import after vi.mock
const { readPreference, writePreference, clearPreference } = await import('../storage/complexityStorage');

describe('complexityStorage error paths', () => {
  it('writePreference handles storage error gracefully', () => {
    expect(() => writePreference({ tier: 'standard', showCoaching: false }, false)).not.toThrow();
  });

  it('clearPreference handles storage error gracefully', () => {
    expect(() => clearPreference(false)).not.toThrow();
  });

  it('readPreference returns null on storage error', () => {
    expect(readPreference(false)).toBeNull();
  });
});
