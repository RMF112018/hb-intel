import { beforeEach, describe, expect, it } from 'vitest';
import {
  averageAcceptedPercent,
  partitionInspections,
  toPercent,
  totalNoAcrossAccepted,
} from '../inspectionFiltering.js';
import { makeInspection, resetCounters } from './fixtures.js';

describe('inspectionFiltering', () => {
  beforeEach(() => {
    resetCounters();
  });

  it('partitions inspections by ingestion status', () => {
    const events = [
      makeInspection({ status: 'accepted' }),
      makeInspection({ status: 'duplicate-suspected' }),
      makeInspection({ status: 'superseded' }),
      makeInspection({ status: 'review-required' }),
      makeInspection({ status: 'rejected' }),
    ];
    const partition = partitionInspections(events);
    expect(partition.accepted).toHaveLength(1);
    expect(partition.duplicateSuspected).toHaveLength(1);
    expect(partition.superseded).toHaveLength(1);
    expect(partition.reviewRequired).toHaveLength(1);
    expect(partition.rejected).toHaveLength(1);
  });

  it('converts fractional inspection score to percent', () => {
    expect(toPercent(0.92)).toBeCloseTo(92, 6);
    expect(toPercent(1)).toBe(100);
    expect(toPercent(0)).toBe(0);
  });

  it('averages accepted inspections in percent scale', () => {
    const accepted = [
      makeInspection({ status: 'accepted', scoreFraction: 1 }),
      makeInspection({ status: 'accepted', scoreFraction: 0.8 }),
    ];
    expect(averageAcceptedPercent(accepted)).toBeCloseTo(90, 6);
  });

  it('returns null average when no accepted inspections', () => {
    expect(averageAcceptedPercent([])).toBeNull();
  });

  it('does not include non-accepted inspections in score numerator', () => {
    const events = [
      makeInspection({ status: 'accepted', scoreFraction: 0.9 }),
      makeInspection({ status: 'duplicate-suspected', scoreFraction: 0.5 }),
      makeInspection({ status: 'superseded', scoreFraction: 0.4 }),
      makeInspection({ status: 'rejected', scoreFraction: 0.1 }),
      makeInspection({ status: 'review-required', scoreFraction: 0.2 }),
    ];
    const { accepted } = partitionInspections(events);
    expect(accepted).toHaveLength(1);
    expect(averageAcceptedPercent(accepted)).toBeCloseTo(90, 6);
  });

  it('totalNoAcrossAccepted sums totalNo for accepted only', () => {
    const accepted = [
      makeInspection({ status: 'accepted', totalNo: 0 }),
      makeInspection({ status: 'accepted', totalNo: 3 }),
    ];
    expect(totalNoAcrossAccepted(accepted)).toBe(3);
  });
});
