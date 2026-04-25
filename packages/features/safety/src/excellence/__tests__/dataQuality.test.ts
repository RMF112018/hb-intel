import { beforeEach, describe, expect, it } from 'vitest';
import { computeDataQualityScore } from '../dataQuality.js';
import { partitionInspections } from '../inspectionFiltering.js';
import { makeInspection, resetCounters } from './fixtures.js';

describe('dataQuality', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('returns 100 when nothing is wrong', () => {
    const events = [makeInspection({ status: 'accepted' })];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBe(100);
    expect(result.notes).toEqual([]);
    expect(result.hasReviewRequired).toBe(false);
    expect(result.hasDuplicateSuspected).toBe(false);
  });

  it('penalizes duplicate-suspected inspections', () => {
    const events = [
      makeInspection({ status: 'accepted' }),
      makeInspection({ status: 'duplicate-suspected' }),
    ];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBe(80);
    expect(result.hasDuplicateSuspected).toBe(true);
    expect(result.notes.some((note) => note.includes('duplicate-suspected'))).toBe(true);
  });

  it('penalizes review-required inspections and signals review state', () => {
    const events = [
      makeInspection({ status: 'accepted' }),
      makeInspection({ status: 'review-required' }),
    ];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBe(80);
    expect(result.hasReviewRequired).toBe(true);
  });

  it('penalizes missing parser/template metadata', () => {
    const events = [
      makeInspection({ status: 'accepted', parserVersion: '' }),
      makeInspection({ status: 'accepted', templateVersion: '' }),
    ];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBe(90);
  });

  it('penalizes missing source upload references on accepted inspections', () => {
    const events = [makeInspection({ status: 'accepted', sourceUploadItemId: 0 })];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBe(90);
  });

  it('floors at zero when all penalties apply', () => {
    const events = [
      makeInspection({ status: 'accepted', parserVersion: '', sourceUploadItemId: 0 }),
      makeInspection({ status: 'duplicate-suspected' }),
      makeInspection({ status: 'review-required' }),
    ];
    const result = computeDataQualityScore(events, partitionInspections(events));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
