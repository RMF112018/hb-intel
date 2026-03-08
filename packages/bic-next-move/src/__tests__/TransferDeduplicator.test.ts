import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shouldFireTransfer, _clearDeduplicatorForTests } from '../transfer/TransferDeduplicator';

describe('TransferDeduplicator (D-03)', () => {
  beforeEach(() => _clearDeduplicatorForTests());
  afterEach(() => _clearDeduplicatorForTests());

  it('returns true on first call for a unique transfer', () => {
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-bob')).toBe(true);
  });

  it('returns false on second call for the same transfer in the same bucket', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-bob')).toBe(false);
  });

  it('returns true for different itemKeys', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-002', 'u-alice', 'u-bob')).toBe(true);
  });

  it('returns true for same item but different toUser', () => {
    shouldFireTransfer('item-001', 'u-alice', 'u-bob');
    expect(shouldFireTransfer('item-001', 'u-alice', 'u-carol')).toBe(true);
  });

  it('handles null fromOwner correctly', () => {
    expect(shouldFireTransfer('item-001', null, 'u-bob')).toBe(true);
    expect(shouldFireTransfer('item-001', null, 'u-bob')).toBe(false);
  });

  it('handles null toOwner correctly', () => {
    expect(shouldFireTransfer('item-001', 'u-alice', null)).toBe(true);
    expect(shouldFireTransfer('item-001', 'u-alice', null)).toBe(false);
  });
});
