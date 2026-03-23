import { describe, expect, it } from 'vitest';

import {
  computeTotalInflows,
  computeTotalOutflows,
  computeNetCashFlow,
  computeCumulativeCashFlowSeries,
  computeForecastAccuracy,
  computeProjectedNetCashFlow,
  computeProjectedCumulativeSeries,
  computeCashFlowSummary,
  computeMonthlyRetention,
} from '../../index.js';
import {
  surplusActualRecords,
  surplusForecastRecords,
  deficitForecastRecords,
} from '../../../testing/index.js';

describe('P3-E4-T05 cash flow computors', () => {
  describe('computeTotalInflows', () => {
    it('sums owner payments and other inflows', () => {
      expect(computeTotalInflows(500000, 25000)).toBe(525000);
    });

    it('handles zero values', () => {
      expect(computeTotalInflows(0, 0)).toBe(0);
    });
  });

  describe('computeTotalOutflows', () => {
    it('sums all outflow categories', () => {
      expect(computeTotalOutflows(200000, 100000, 80000, 30000, 15000)).toBe(425000);
    });
  });

  describe('computeNetCashFlow', () => {
    it('positive when inflows exceed outflows (surplus)', () => {
      expect(computeNetCashFlow(525000, 425000)).toBe(100000);
    });

    it('negative when outflows exceed inflows (deficit)', () => {
      expect(computeNetCashFlow(200000, 500000)).toBe(-300000);
    });
  });

  describe('computeCumulativeCashFlowSeries', () => {
    it('computes running sum', () => {
      expect(computeCumulativeCashFlowSeries([100000, 50000, 75000])).toEqual([100000, 150000, 225000]);
    });

    it('handles negative net flows', () => {
      expect(computeCumulativeCashFlowSeries([100000, -300000, 150000])).toEqual([100000, -200000, -50000]);
    });

    it('returns empty array for empty input', () => {
      expect(computeCumulativeCashFlowSeries([])).toEqual([]);
    });
  });

  describe('computeForecastAccuracy', () => {
    it('returns percentage deviation from forecast', () => {
      // |100000 - 80000| / |80000| × 100 = 25
      expect(computeForecastAccuracy(100000, 80000)).toBe(25);
    });

    it('returns null when no prior forecast', () => {
      expect(computeForecastAccuracy(100000, null)).toBeNull();
    });

    it('returns null when prior forecast is zero', () => {
      expect(computeForecastAccuracy(100000, 0)).toBeNull();
    });

    it('returns 0 when actual matches forecast exactly', () => {
      expect(computeForecastAccuracy(100000, 100000)).toBe(0);
    });
  });

  describe('computeProjectedNetCashFlow', () => {
    it('computes inflows minus outflows', () => {
      expect(computeProjectedNetCashFlow(450000, 400000)).toBe(50000);
    });
  });

  describe('computeProjectedCumulativeSeries', () => {
    it('starts from last actual cumulative and adds forecast nets', () => {
      expect(computeProjectedCumulativeSeries(225000, [60000, 50000, 40000])).toEqual([285000, 335000, 375000]);
    });

    it('handles negative forecast months', () => {
      expect(computeProjectedCumulativeSeries(225000, [-300000, -150000, 150000])).toEqual([-75000, -225000, -75000]);
    });
  });

  describe('computeCashFlowSummary', () => {
    it('aggregates surplus actuals and forecasts', () => {
      const summary = computeCashFlowSummary(surplusActualRecords, surplusForecastRecords, 'ver-1', 'proj-1');
      expect(summary.totalActualNetCashFlow).toBe(225000); // 100k + 50k + 75k
      expect(summary.totalForecastedNetCashFlow).toBe(150000); // 60k + 50k + 40k
      expect(summary.combinedNetCashFlow).toBe(375000);
      expect(summary.cashFlowAtRisk).toBe(0); // no negative forecast months
      expect(summary.forecastVersionId).toBe('ver-1');
      expect(summary.projectId).toBe('proj-1');
    });

    it('computes peakCashRequirement as minimum cumulative', () => {
      const summary = computeCashFlowSummary(surplusActualRecords, surplusForecastRecords, 'v', 'p');
      // All cumulative values are positive, so peak requirement is the smallest positive cumulative
      expect(summary.peakCashRequirement).toBeLessThanOrEqual(summary.combinedNetCashFlow);
    });

    it('computes cashFlowAtRisk for deficit scenario', () => {
      const summary = computeCashFlowSummary(surplusActualRecords, deficitForecastRecords, 'v', 'p');
      // Deficit months: -300000 + -150000 = -450000
      expect(summary.cashFlowAtRisk).toBe(-450000);
    });

    it('handles empty records', () => {
      const summary = computeCashFlowSummary([], [], 'v', 'p');
      expect(summary.totalActualNetCashFlow).toBe(0);
      expect(summary.totalForecastedNetCashFlow).toBe(0);
      expect(summary.combinedNetCashFlow).toBe(0);
      expect(summary.peakCashRequirement).toBe(0);
    });
  });

  describe('computeMonthlyRetention', () => {
    it('computes retention held minus prior releases', () => {
      // 5,250,000 invoiced × 10% rate - 100,000 released = 425,000
      expect(computeMonthlyRetention(5250000, 0.10, 100000)).toBe(425000);
    });

    it('returns negative when releases exceed retention', () => {
      expect(computeMonthlyRetention(100000, 0.10, 20000)).toBe(-10000);
    });

    it('returns zero with no invoices and no releases', () => {
      expect(computeMonthlyRetention(0, 0.10, 0)).toBe(0);
    });
  });
});
