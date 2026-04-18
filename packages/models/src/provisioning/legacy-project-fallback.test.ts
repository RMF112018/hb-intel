import { describe, expect, it } from 'vitest';
import {
  createLegacyFallbackRecordKey,
  parseLegacyFallbackRecordKey,
  type LegacyFallbackMatchConfidence,
  type LegacyFallbackMatchMethod,
  type LegacyFallbackMatchStatus,
} from './ILegacyProjectFallback.js';

describe('legacy project fallback contracts', () => {
  it('supports the full match status contract', () => {
    const statuses: LegacyFallbackMatchStatus[] = [
      'matched',
      'unmatched',
      'review-required',
      'ignored',
      'disabled',
    ];

    expect(statuses).toHaveLength(5);
  });

  it('supports the full match confidence contract', () => {
    const confidences: LegacyFallbackMatchConfidence[] = ['high', 'medium', 'low', 'none'];

    expect(confidences).toHaveLength(4);
  });

  it('supports the full match method contract', () => {
    const methods: LegacyFallbackMatchMethod[] = [
      'project-number-exact',
      'normalized-title-year',
      'manual-bind',
      'manual-override',
      'no-match',
    ];

    expect(methods).toHaveLength(5);
  });

  it('builds and parses record keys from drive identity', () => {
    const driveId = 'drive-abc';
    const driveItemId = 'item-123';

    const recordKey = createLegacyFallbackRecordKey(driveId, driveItemId);
    expect(recordKey).toBe('drive-abc:item-123');

    const parsed = parseLegacyFallbackRecordKey(recordKey);
    expect(parsed).not.toBeNull();
    expect(parsed).toEqual({
      driveId,
      driveItemId,
      recordKey,
    });
  });

  it('returns null when parsing malformed record keys', () => {
    expect(parseLegacyFallbackRecordKey('')).toBeNull();
    expect(parseLegacyFallbackRecordKey('drive-only')).toBeNull();
    expect(parseLegacyFallbackRecordKey(':item-only')).toBeNull();
    expect(parseLegacyFallbackRecordKey('drive-only:')).toBeNull();
  });
});
