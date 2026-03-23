import { describe, expect, it } from 'vitest';

import {
  CAUSATION_APPLICABLE_RECORD_TYPES,
  CONFIDENCE_LABELS,
  DEFAULT_CAUSATION_ROOT_CATEGORIES,
  DEFAULT_CONFIDENCE_FACTORS,
  DEFAULT_GRADING_CONTROL_CODES,
  DEFAULT_NEAR_CRITICAL_FLOAT_HRS,
  RECOMMENDATION_DISPOSITIONS,
  RECOMMENDATION_PROMOTION_PATHS,
  RECOMMENDATION_TARGET_TYPES,
  RECOMMENDATION_TYPES,
  SCHEDULE_LETTER_GRADES,
} from '../constants/index.js';

describe('P3-E5-T07 contract stability', () => {
  describe('§11.1 grading', () => {
    it('has 5 letter grades', () => {
      expect(SCHEDULE_LETTER_GRADES).toHaveLength(5);
      expect(SCHEDULE_LETTER_GRADES).toEqual(['A', 'B', 'C', 'D', 'F']);
    });

    it('has 10 default grading control codes', () => {
      expect(DEFAULT_GRADING_CONTROL_CODES).toHaveLength(10);
    });
  });

  describe('§11.2 float path', () => {
    it('default near-critical float is 40 hours', () => {
      expect(DEFAULT_NEAR_CRITICAL_FLOAT_HRS).toBe(40);
    });
  });

  describe('§11.4 confidence', () => {
    it('has 4 confidence labels', () => {
      expect(CONFIDENCE_LABELS).toHaveLength(4);
      expect(CONFIDENCE_LABELS).toEqual(['High', 'Moderate', 'Low', 'VeryLow']);
    });

    it('has 8 default confidence factors', () => {
      expect(DEFAULT_CONFIDENCE_FACTORS).toHaveLength(8);
    });

    it('confidence factor weights sum to 1.0', () => {
      const totalWeight = DEFAULT_CONFIDENCE_FACTORS.reduce((sum, f) => sum + f.defaultWeight, 0);
      expect(Math.round(totalWeight * 100) / 100).toBe(1.0);
    });
  });

  describe('§12 recommendations', () => {
    it('has 9 target types', () => { expect(RECOMMENDATION_TARGET_TYPES).toHaveLength(9); });
    it('has 9 recommendation types', () => { expect(RECOMMENDATION_TYPES).toHaveLength(9); });
    it('has 6 dispositions', () => { expect(RECOMMENDATION_DISPOSITIONS).toHaveLength(6); });
    it('has 5 promotion paths', () => { expect(RECOMMENDATION_PROMOTION_PATHS).toHaveLength(5); });
  });

  describe('§13 causation', () => {
    it('has 9 applicable record types', () => {
      expect(CAUSATION_APPLICABLE_RECORD_TYPES).toHaveLength(9);
    });

    it('has 13 default root categories', () => {
      expect(DEFAULT_CAUSATION_ROOT_CATEGORIES).toHaveLength(13);
    });
  });
});
