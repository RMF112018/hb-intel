import { describe, expect, it } from 'vitest';

import {
  computeFallbackCompositeMatchKey,
  computeRevisedBudget,
  computeProjectedBudget,
  computeCostExposureToDate,
  computeProjectedCosts,
  computeEstimatedCostAtCompletion,
  computeProjectedOverUnder,
  computeDefaultForecastToComplete,
  computeAllDerivedFields,
} from '../../index.js';

describe('P3-E4-T02 financial computors', () => {
  describe('computeFallbackCompositeMatchKey', () => {
    it('produces pipe-delimited lowercase trimmed key', () => {
      expect(computeFallbackCompositeMatchKey('03', 'Material', '0100.MAT')).toBe('03|material|0100.mat');
    });

    it('trims whitespace from all components', () => {
      expect(computeFallbackCompositeMatchKey('  03  ', '  Material  ', '  0100.MAT  ')).toBe('03|material|0100.mat');
    });

    it('lowercases all components', () => {
      expect(computeFallbackCompositeMatchKey('ABC', 'DEF', 'GHI')).toBe('abc|def|ghi');
    });
  });

  describe('computeRevisedBudget', () => {
    it('sums original + modifications + approved COs', () => {
      expect(computeRevisedBudget(100000, 5000, 2000)).toBe(107000);
    });

    it('handles negative modifications', () => {
      expect(computeRevisedBudget(100000, -5000, 0)).toBe(95000);
    });
  });

  describe('computeProjectedBudget', () => {
    it('adds pending changes to revised', () => {
      expect(computeProjectedBudget(107000, 1000)).toBe(108000);
    });
  });

  describe('computeCostExposureToDate', () => {
    it('sums actual cost and committed costs', () => {
      expect(computeCostExposureToDate(50000, 20000)).toBe(70000);
    });
  });

  describe('computeProjectedCosts', () => {
    it('adds pending cost changes to exposure', () => {
      expect(computeProjectedCosts(70000, 3000)).toBe(73000);
    });
  });

  describe('computeEstimatedCostAtCompletion', () => {
    it('sums exposure and forecast to complete', () => {
      expect(computeEstimatedCostAtCompletion(70000, 37000)).toBe(107000);
    });
  });

  describe('computeProjectedOverUnder', () => {
    it('positive value means under budget (favorable)', () => {
      expect(computeProjectedOverUnder(110000, 100000)).toBe(10000);
    });

    it('negative value means over budget (unfavorable)', () => {
      expect(computeProjectedOverUnder(90000, 100000)).toBe(-10000);
    });

    it('zero means on budget', () => {
      expect(computeProjectedOverUnder(107000, 107000)).toBe(0);
    });
  });

  describe('computeDefaultForecastToComplete', () => {
    it('returns revised minus exposure when positive', () => {
      expect(computeDefaultForecastToComplete(107000, 70000)).toBe(37000);
    });

    it('returns 0 when exposure exceeds revised (never negative)', () => {
      expect(computeDefaultForecastToComplete(50000, 70000)).toBe(0);
    });

    it('returns 0 when equal', () => {
      expect(computeDefaultForecastToComplete(70000, 70000)).toBe(0);
    });
  });

  describe('computeAllDerivedFields', () => {
    it('computes all derived fields consistently', () => {
      const result = computeAllDerivedFields({
        originalBudget: 100000,
        budgetModifications: 5000,
        approvedCOs: 2000,
        pendingBudgetChanges: 1000,
        jobToDateActualCost: 50000,
        committedCosts: 20000,
        pendingCostChanges: 3000,
        forecastToComplete: 37000,
      });

      expect(result.revisedBudget).toBe(107000);
      expect(result.projectedBudget).toBe(108000);
      expect(result.costExposureToDate).toBe(70000);
      expect(result.projectedCosts).toBe(73000);
      expect(result.estimatedCostAtCompletion).toBe(107000);
      expect(result.projectedOverUnder).toBe(0);
    });
  });
});
