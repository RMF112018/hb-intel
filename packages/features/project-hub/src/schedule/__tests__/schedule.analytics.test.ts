import { describe, expect, it } from 'vitest';

import {
  calculateConfidenceLabel,
  calculateCriticalityIndex,
  calculateOverallGrade,
  calculateSlippageSinceLastUpdate,
  isRecommendationPromotable,
} from '../analytics/index.js';

describe('P3-E5-T07 schedule analytics', () => {
  describe('calculateCriticalityIndex (§11.2.1)', () => {
    it('returns 100 for zero float (critical)', () => {
      expect(calculateCriticalityIndex(0, 200)).toBe(100);
    });

    it('returns 0 for max float', () => {
      expect(calculateCriticalityIndex(200, 200)).toBe(0);
    });

    it('returns 50 for half of max float', () => {
      expect(calculateCriticalityIndex(100, 200)).toBe(50);
    });

    it('clamps to 100 for negative float', () => {
      expect(calculateCriticalityIndex(-20, 200)).toBe(110 > 100 ? 100 : 110);
      // Negative float gives > 100, clamped to 100
      const result = calculateCriticalityIndex(-20, 200);
      expect(result).toBe(100);
    });

    it('returns 100 when maxTotalFloat is 0', () => {
      expect(calculateCriticalityIndex(0, 0)).toBe(100);
    });

    it('returns 75 for quarter of max float', () => {
      expect(calculateCriticalityIndex(50, 200)).toBe(75);
    });
  });

  describe('calculateOverallGrade (§11.1)', () => {
    it('returns A for score >= 90', () => {
      expect(calculateOverallGrade(95)).toBe('A');
      expect(calculateOverallGrade(90)).toBe('A');
    });

    it('returns B for 80-89', () => {
      expect(calculateOverallGrade(85)).toBe('B');
      expect(calculateOverallGrade(80)).toBe('B');
    });

    it('returns C for 70-79', () => {
      expect(calculateOverallGrade(75)).toBe('C');
    });

    it('returns D for 60-69', () => {
      expect(calculateOverallGrade(65)).toBe('D');
    });

    it('returns F for < 60', () => {
      expect(calculateOverallGrade(55)).toBe('F');
      expect(calculateOverallGrade(0)).toBe('F');
    });

    it('respects custom thresholds', () => {
      expect(calculateOverallGrade(85, { a: 95, b: 85, c: 75, d: 65 })).toBe('B');
      expect(calculateOverallGrade(90, { a: 95, b: 85, c: 75, d: 65 })).toBe('B');
    });
  });

  describe('calculateConfidenceLabel (§11.4)', () => {
    it('returns High for >= 80', () => {
      expect(calculateConfidenceLabel(85)).toBe('High');
      expect(calculateConfidenceLabel(80)).toBe('High');
    });

    it('returns Moderate for 60-79', () => {
      expect(calculateConfidenceLabel(70)).toBe('Moderate');
    });

    it('returns Low for 40-59', () => {
      expect(calculateConfidenceLabel(50)).toBe('Low');
    });

    it('returns VeryLow for < 40', () => {
      expect(calculateConfidenceLabel(30)).toBe('VeryLow');
      expect(calculateConfidenceLabel(0)).toBe('VeryLow');
    });
  });

  describe('calculateSlippageSinceLastUpdate (§11.3)', () => {
    it('returns positive days for slippage', () => {
      expect(calculateSlippageSinceLastUpdate('2026-04-15', '2026-04-01')).toBe(14);
    });

    it('returns negative days for recovery', () => {
      expect(calculateSlippageSinceLastUpdate('2026-03-25', '2026-04-01')).toBe(-7);
    });

    it('returns 0 for no change', () => {
      expect(calculateSlippageSinceLastUpdate('2026-04-01', '2026-04-01')).toBe(0);
    });
  });

  describe('isRecommendationPromotable (§12.1)', () => {
    it('returns true when Accepted with promotion path', () => {
      expect(isRecommendationPromotable({ disposition: 'Accepted', promotionPath: 'ToScenario' })).toBe(true);
    });

    it('returns false when Accepted without promotion path', () => {
      expect(isRecommendationPromotable({ disposition: 'Accepted', promotionPath: null })).toBe(false);
    });

    it('returns false when Pending', () => {
      expect(isRecommendationPromotable({ disposition: 'Pending', promotionPath: 'ToScenario' })).toBe(false);
    });

    it('returns false when Declined', () => {
      expect(isRecommendationPromotable({ disposition: 'Declined', promotionPath: 'ToBlocker' })).toBe(false);
    });
  });
});
