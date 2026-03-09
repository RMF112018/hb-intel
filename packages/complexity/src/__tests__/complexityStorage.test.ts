import { describe, it, expect, beforeEach } from 'vitest';
import { readPreference, writePreference, clearPreference } from '../storage/complexityStorage';

describe('complexityStorage (D-01)', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when no preference stored', () => {
    expect(readPreference(false)).toBeNull();
  });

  it('writes and reads preference round-trip', () => {
    const pref = { tier: 'expert' as const, showCoaching: false };
    writePreference(pref, false);
    expect(readPreference(false)).toEqual(pref);
  });

  it('returns null for corrupt storage value', () => {
    localStorage.setItem('hbc::complexity::v1', 'not-json');
    expect(readPreference(false)).toBeNull();
  });

  it('returns null for invalid tier value', () => {
    localStorage.setItem('hbc::complexity::v1', '{"tier":"invalid","showCoaching":false}');
    expect(readPreference(false)).toBeNull();
  });

  it('clearPreference removes the key', () => {
    writePreference({ tier: 'standard', showCoaching: false }, false);
    clearPreference(false);
    expect(readPreference(false)).toBeNull();
  });

  it('uses sessionStorage when isSpfx=true', () => {
    writePreference({ tier: 'standard', showCoaching: false }, true);
    expect(sessionStorage.getItem('hbc::complexity::v1')).not.toBeNull();
    expect(localStorage.getItem('hbc::complexity::v1')).toBeNull();
  });

  it('writePreference handles storage errors gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => { throw new DOMException('quota exceeded'); });

    // Should not throw
    expect(() => writePreference({ tier: 'standard', showCoaching: false }, false)).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it('clearPreference handles storage errors gracefully', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => { throw new DOMException('not allowed'); });

    // Should not throw
    expect(() => clearPreference(false)).not.toThrow();

    localStorage.removeItem = originalRemoveItem;
  });
});
