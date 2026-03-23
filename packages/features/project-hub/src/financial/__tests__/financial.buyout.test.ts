import { describe, expect, it } from 'vitest';

import {
  computeBuyoutOverUnder,
  computeBuyoutSavingsAmount,
  computeBuyoutSummaryMetrics,
  validateContractExecutedGate,
  createSavingsDisposition,
  computeBuyoutReconciliation,
} from '../../index.js';
import { mixedBuyoutLines } from '../../../testing/index.js';

describe('P3-E4-T06 buyout computors and validation', () => {
  describe('computeBuyoutOverUnder', () => {
    it('returns positive when over budget (unfavorable)', () => {
      expect(computeBuyoutOverUnder(520000, 500000)).toBe(20000);
    });

    it('returns negative when under budget (favorable/savings)', () => {
      expect(computeBuyoutOverUnder(475000, 500000)).toBe(-25000);
    });

    it('returns null when contractAmount is null', () => {
      expect(computeBuyoutOverUnder(null, 500000)).toBeNull();
    });

    it('returns 0 when on budget', () => {
      expect(computeBuyoutOverUnder(500000, 500000)).toBe(0);
    });
  });

  describe('computeBuyoutSavingsAmount', () => {
    it('returns savings when contract is below budget', () => {
      expect(computeBuyoutSavingsAmount(475000, 500000)).toBe(25000);
    });

    it('returns 0 when contract is at or above budget', () => {
      expect(computeBuyoutSavingsAmount(520000, 500000)).toBe(0);
      expect(computeBuyoutSavingsAmount(500000, 500000)).toBe(0);
    });

    it('returns 0 when contractAmount is null', () => {
      expect(computeBuyoutSavingsAmount(null, 500000)).toBe(0);
    });
  });

  describe('computeBuyoutSummaryMetrics', () => {
    it('computes dollar-weighted metrics for mixed lines', () => {
      const metrics = computeBuyoutSummaryMetrics(mixedBuyoutLines);

      // Active lines: notStarted(500k) + savings(500k) + over(500k) + complete(200k) = 1.7M
      expect(metrics.totalBudget).toBe(1700000);

      // Executed+Complete: savings(475k) + over(520k) + complete(195k) = 1.19M
      expect(metrics.totalContractAmount).toBe(1190000);

      // Dollar-weighted: 1190000 / 1700000 × 100 = 70%
      expect(metrics.percentBuyoutCompleteDollarWeighted).toBeCloseTo(70, 0);

      expect(metrics.linesNotStarted).toBe(1);
      expect(metrics.linesVoid).toBe(1);
      expect(metrics.linesComplete).toBe(1);
      expect(metrics.totalLinesActive).toBe(4); // excludes void
    });

    it('excludes void lines from budget total', () => {
      const metrics = computeBuyoutSummaryMetrics(mixedBuyoutLines);
      // Void line has originalBudget=500000 — should NOT be in totalBudget
      expect(metrics.totalBudget).toBe(1700000); // not 2200000
    });

    it('handles empty lines', () => {
      const metrics = computeBuyoutSummaryMetrics([]);
      expect(metrics.totalBudget).toBe(0);
      expect(metrics.percentBuyoutCompleteDollarWeighted).toBe(0);
      expect(metrics.totalLinesActive).toBe(0);
    });
  });

  describe('validateContractExecutedGate', () => {
    it('passes when all conditions are met', () => {
      const result = validateContractExecutedGate('checklist-1', 'Complete', null);
      expect(result.canTransition).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it('passes with approved waiver', () => {
      const result = validateContractExecutedGate('checklist-1', 'Complete', 'Approved');
      expect(result.canTransition).toBe(true);
    });

    it('blocks when checklist is missing', () => {
      const result = validateContractExecutedGate(null, null, null);
      expect(result.canTransition).toBe(false);
      expect(result.blockers.some((b) => b.includes('not linked'))).toBe(true);
    });

    it('blocks when checklist is not Complete', () => {
      const result = validateContractExecutedGate('checklist-1', 'InProgress', null);
      expect(result.canTransition).toBe(false);
      expect(result.blockers.some((b) => b.includes('Complete'))).toBe(true);
    });

    it('blocks when waiver is not Approved', () => {
      const result = validateContractExecutedGate('checklist-1', 'Complete', 'Pending');
      expect(result.canTransition).toBe(false);
      expect(result.blockers.some((b) => b.includes('waiver'))).toBe(true);
    });

    it('reports multiple blockers', () => {
      const result = validateContractExecutedGate(null, 'InProgress', 'Pending');
      expect(result.canTransition).toBe(false);
      expect(result.blockers.length).toBe(3);
    });
  });

  describe('createSavingsDisposition', () => {
    it('creates disposition with full undispositioned amount', () => {
      const disp = createSavingsDisposition('buyout-1', 'proj-1', 25000);
      expect(disp.totalSavingsAmount).toBe(25000);
      expect(disp.dispositionedAmount).toBe(0);
      expect(disp.undispositionedAmount).toBe(25000);
      expect(disp.dispositionItems).toHaveLength(0);
      expect(disp.dispositionId).toBeTruthy();
    });
  });

  describe('computeBuyoutReconciliation', () => {
    it('within tolerance when variance is < 5%', () => {
      const result = computeBuyoutReconciliation(1000000, 1020000);
      expect(result.withinTolerance).toBe(true);
      expect(result.variancePercent).toBeLessThan(5);
    });

    it('outside tolerance when variance exceeds 5%', () => {
      const result = computeBuyoutReconciliation(1000000, 1100000);
      expect(result.withinTolerance).toBe(false);
      expect(result.variancePercent).toBeGreaterThan(5);
    });

    it('handles zero committed costs', () => {
      const result = computeBuyoutReconciliation(0, 0);
      expect(result.withinTolerance).toBe(true);
      expect(result.variancePercent).toBe(0);
    });
  });
});
