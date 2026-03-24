import { describe, expect, it } from 'vitest';

import {
  calculateSectionAverage,
  calculateOverallWeightedScore,
  calculateOverallFromSections,
  derivePerformanceRating,
  canSubmitScorecard,
  isFinalCloseoutDuplicate,
  canCreateFinalCloseoutAmendment,
  isInterimPublicationException,
} from '../../index.js';

import { createMockScorecardCriterionScores } from '../../../testing/createMockScorecardCriterion.js';

describe('P3-E10-T06 Closeout scorecard business rules', () => {
  // -- Section Average (§3.1) ------------------------------------------------

  describe('calculateSectionAverage', () => {
    it('calculates average of numeric scores', () => {
      expect(calculateSectionAverage([5, 4, 3, 4, 5])).toBe(4.20);
    });

    it('excludes NA from calculation', () => {
      expect(calculateSectionAverage([5, 'NA', 3, 'NA', 5])).toBeCloseTo(4.33, 2);
    });

    it('returns null when all NA', () => {
      expect(calculateSectionAverage(['NA', 'NA', 'NA'])).toBeNull();
    });

    it('rounds to 2 decimal places', () => {
      expect(calculateSectionAverage([3, 3, 4])).toBe(3.33);
    });
  });

  // -- Overall Weighted Score (§3.2) -----------------------------------------

  describe('calculateOverallWeightedScore', () => {
    it('calculates weighted sum of non-null sections', () => {
      const averages = [
        { sectionAvg: 4.0, sectionWeight: 0.20 },
        { sectionAvg: 3.5, sectionWeight: 0.20 },
        { sectionAvg: 4.5, sectionWeight: 0.20 },
        { sectionAvg: 3.0, sectionWeight: 0.15 },
        { sectionAvg: 4.0, sectionWeight: 0.15 },
        { sectionAvg: 3.5, sectionWeight: 0.10 },
      ];
      // (4*0.2)+(3.5*0.2)+(4.5*0.2)+(3*0.15)+(4*0.15)+(3.5*0.1) = 0.8+0.7+0.9+0.45+0.6+0.35 = 3.80
      expect(calculateOverallWeightedScore(averages)).toBe(3.80);
    });

    it('excludes null sections', () => {
      const averages = [
        { sectionAvg: 4.0, sectionWeight: 0.20 },
        { sectionAvg: null, sectionWeight: 0.20 },
        { sectionAvg: 3.0, sectionWeight: 0.20 },
      ];
      // (4*0.2)+(3*0.2) = 0.8+0.6 = 1.40
      expect(calculateOverallWeightedScore(averages)).toBe(1.40);
    });

    it('returns null when all sections are null', () => {
      const averages = [
        { sectionAvg: null, sectionWeight: 0.20 },
        { sectionAvg: null, sectionWeight: 0.20 },
      ];
      expect(calculateOverallWeightedScore(averages)).toBeNull();
    });
  });

  describe('calculateOverallFromSections', () => {
    it('combines section scores using defined weights', () => {
      const sections = [
        { sectionKey: 'Safety', scores: [4, 4, 4, 4, 4] as const },
        { sectionKey: 'Quality', scores: [3, 3, 3, 3, 3] as const },
        { sectionKey: 'Schedule', scores: [5, 5, 5, 5, 5] as const },
        { sectionKey: 'CostMgmt', scores: [4, 4, 4, 4, 4] as const },
        { sectionKey: 'Communication', scores: [3, 3, 3, 3, 3] as const },
        { sectionKey: 'Workforce', scores: [4, 4, 4, 4] as const },
      ];
      // Safety: 4*0.20=0.80, Quality: 3*0.20=0.60, Schedule: 5*0.20=1.00
      // CostMgmt: 4*0.15=0.60, Comm: 3*0.15=0.45, Workforce: 4*0.10=0.40
      // Total: 3.85
      expect(calculateOverallFromSections(sections)).toBe(3.85);
    });
  });

  // -- Performance Rating (§3.3) ---------------------------------------------

  describe('derivePerformanceRating', () => {
    it('4.50 → Exceptional', () => {
      expect(derivePerformanceRating(4.50)).toBe('Exceptional');
    });

    it('5.00 → Exceptional', () => {
      expect(derivePerformanceRating(5.00)).toBe('Exceptional');
    });

    it('3.50 → AboveAverage', () => {
      expect(derivePerformanceRating(3.50)).toBe('AboveAverage');
    });

    it('3.00 → Satisfactory', () => {
      expect(derivePerformanceRating(3.00)).toBe('Satisfactory');
    });

    it('2.00 → BelowAverage', () => {
      expect(derivePerformanceRating(2.00)).toBe('BelowAverage');
    });

    it('1.00 → Unsatisfactory', () => {
      expect(derivePerformanceRating(1.00)).toBe('Unsatisfactory');
    });

    it('null → null', () => {
      expect(derivePerformanceRating(null)).toBeNull();
    });
  });

  // -- Validation (§4) -------------------------------------------------------

  describe('canSubmitScorecard', () => {
    it('returns true when all criteria met', () => {
      expect(canSubmitScorecard(3.85, 'Yes', '2026-03-20')).toBe(true);
    });

    it('returns false when score is null', () => {
      expect(canSubmitScorecard(null, 'Yes', '2026-03-20')).toBe(false);
    });

    it('returns false when reBid is null', () => {
      expect(canSubmitScorecard(3.85, null, '2026-03-20')).toBe(false);
    });
  });

  describe('isFinalCloseoutDuplicate', () => {
    it('returns true when count > 0', () => {
      expect(isFinalCloseoutDuplicate(1)).toBe(true);
    });

    it('returns false when count = 0', () => {
      expect(isFinalCloseoutDuplicate(0)).toBe(false);
    });
  });

  // -- Amendment (§4.5) ------------------------------------------------------

  describe('canCreateFinalCloseoutAmendment', () => {
    it('returns true when existing approved and PE allows', () => {
      expect(canCreateFinalCloseoutAmendment(true, true)).toBe(true);
    });

    it('returns false when no existing approved', () => {
      expect(canCreateFinalCloseoutAmendment(false, true)).toBe(false);
    });

    it('returns false when PE does not allow', () => {
      expect(canCreateFinalCloseoutAmendment(true, false)).toBe(false);
    });
  });

  // -- Interim Publication Exception (§5.2) ----------------------------------

  describe('isInterimPublicationException', () => {
    it('returns true for eligible Interim', () => {
      expect(isInterimPublicationException(true, 'Interim')).toBe(true);
    });

    it('returns false for non-eligible Interim', () => {
      expect(isInterimPublicationException(false, 'Interim')).toBe(false);
    });

    it('returns false for FinalCloseout regardless of flag', () => {
      expect(isInterimPublicationException(true, 'FinalCloseout')).toBe(false);
    });
  });

  // -- Mock factory ----------------------------------------------------------

  describe('createMockScorecardCriterionScores', () => {
    it('creates default all-3 scores', () => {
      const scores = createMockScorecardCriterionScores();
      expect(scores).toHaveLength(5);
      expect(scores.every((s) => s === 3)).toBe(true);
    });

    it('accepts custom scores', () => {
      const scores = createMockScorecardCriterionScores([5, 4, 3, 2, 1]);
      expect(scores).toEqual([5, 4, 3, 2, 1]);
    });
  });
});
