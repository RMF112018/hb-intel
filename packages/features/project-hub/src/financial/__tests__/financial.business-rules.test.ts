import { describe, expect, it } from 'vitest';

import {
  getSignConventionForDomain,
  interpretValue,
  validateForecastToComplete,
  assessProfitMargin,
  computeGCVariance,
  computeGRVariance,
  computeGCGRVariances,
  computeRevisedContractCompletion,
  computeCurrentProfit,
  computeProfitMargin,
  computeExpectedContingencyUse,
  computeForecastSummaryCalculations,
} from '../../index.js';
import { businessRuleScenarios } from '../../../testing/index.js';

describe('P3-E4-T07 business rules and calculations', () => {
  describe('getSignConventionForDomain', () => {
    it('returns the rule for budgetLine', () => {
      const rule = getSignConventionForDomain('budgetLine');
      expect(rule).toBeDefined();
      expect(rule!.direction).toBe('budget-minus-cost');
    });

    it('returns the rule for gcgr', () => {
      const rule = getSignConventionForDomain('gcgr');
      expect(rule).toBeDefined();
      expect(rule!.direction).toBe('cost-minus-budget');
    });

    it('returns undefined for unknown domain', () => {
      expect(getSignConventionForDomain('unknown' as never)).toBeUndefined();
    });
  });

  describe('interpretValue', () => {
    it('interprets positive budgetLine value as favorable/green', () => {
      const rule = getSignConventionForDomain('budgetLine')!;
      const result = interpretValue(10000, rule);
      expect(result.displayColor).toBe('green');
      expect(result.interpretation).toContain('favorable');
    });

    it('interprets negative budgetLine value as unfavorable/red', () => {
      const rule = getSignConventionForDomain('budgetLine')!;
      const result = interpretValue(-5000, rule);
      expect(result.displayColor).toBe('red');
    });

    it('interprets zero as neutral', () => {
      const rule = getSignConventionForDomain('budgetLine')!;
      const result = interpretValue(0, rule);
      expect(result.displayColor).toBe('neutral');
    });

    it('interprets positive gcgr value as unfavorable/red (cost overrun)', () => {
      const rule = getSignConventionForDomain('gcgr')!;
      const result = interpretValue(50000, rule);
      expect(result.displayColor).toBe('red');
    });
  });

  describe('validateForecastToComplete', () => {
    it('valid FTC with no warnings', () => {
      const { onBudget } = businessRuleScenarios;
      const result = validateForecastToComplete(onBudget.forecastToComplete, onBudget.revisedBudget, onBudget.costExposureToDate);
      expect(result.isValid).toBe(true);
      expect(result.alerts).toHaveLength(0);
    });

    it('invalid when FTC is negative', () => {
      const result = validateForecastToComplete(-1000, 100000, 60000);
      expect(result.isValid).toBe(false);
      expect(result.alerts[0].severity).toBe('critical');
    });

    it('warns when EAC exceeds revised budget by more than 10%', () => {
      const { overBudget } = businessRuleScenarios;
      const result = validateForecastToComplete(overBudget.forecastToComplete, overBudget.revisedBudget, overBudget.costExposureToDate);
      // EAC = 80000 + 35000 = 115000 > 100000 × 1.10 = 110000
      expect(result.isValid).toBe(true);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].severity).toBe('warning');
    });

    it('no warning when EAC is within 10% threshold', () => {
      const result = validateForecastToComplete(45000, 100000, 60000);
      // EAC = 60000 + 45000 = 105000 <= 110000
      expect(result.isValid).toBe(true);
      expect(result.alerts).toHaveLength(0);
    });
  });

  describe('assessProfitMargin', () => {
    it('healthy margin — no alert', () => {
      const { profitHealthy } = businessRuleScenarios;
      const result = assessProfitMargin(profitHealthy.currentContractValue, profitHealthy.estimatedCostAtCompletion);
      expect(result.severity).toBe('none');
      expect(result.alert).toBeNull();
      expect(result.profitMargin).toBe(15);
    });

    it('margin below 5% — warning', () => {
      const { profitWarning } = businessRuleScenarios;
      const result = assessProfitMargin(profitWarning.currentContractValue, profitWarning.estimatedCostAtCompletion);
      expect(result.severity).toBe('warning');
      expect(result.alert).not.toBeNull();
      expect(result.profitMargin).toBe(4);
    });

    it('margin below 0% — critical (loss)', () => {
      const { profitCritical } = businessRuleScenarios;
      const result = assessProfitMargin(profitCritical.currentContractValue, profitCritical.estimatedCostAtCompletion);
      expect(result.severity).toBe('critical');
      expect(result.currentProfit).toBeLessThan(0);
    });
  });

  describe('GC/GR variance calculations', () => {
    it('computeGCVariance — overrun is positive', () => {
      expect(computeGCVariance(550000, 500000)).toBe(50000);
    });

    it('computeGCVariance — savings is negative', () => {
      expect(computeGCVariance(450000, 500000)).toBe(-50000);
    });

    it('computeGRVariance', () => {
      expect(computeGRVariance(210000, 200000)).toBe(10000);
    });

    it('computeGCGRVariances — combined overrun', () => {
      const { gcOverrun } = businessRuleScenarios;
      const result = computeGCGRVariances(gcOverrun.gcEAC, gcOverrun.gcBudget, gcOverrun.grEAC, gcOverrun.grBudget);
      expect(result.gcVariance).toBe(50000);
      expect(result.grVariance).toBe(10000);
      expect(result.totalVariance).toBe(60000);
    });

    it('computeGCGRVariances — combined savings', () => {
      const { gcSavings } = businessRuleScenarios;
      const result = computeGCGRVariances(gcSavings.gcEAC, gcSavings.gcBudget, gcSavings.grEAC, gcSavings.grBudget);
      expect(result.totalVariance).toBe(-70000);
    });
  });

  describe('forecast summary calculations', () => {
    it('computeRevisedContractCompletion', () => {
      expect(computeRevisedContractCompletion(365, 30)).toBe(395);
    });

    it('computeCurrentProfit', () => {
      expect(computeCurrentProfit(1000000, 850000)).toBe(150000);
    });

    it('computeProfitMargin', () => {
      expect(computeProfitMargin(150000, 1000000)).toBe(15);
    });

    it('computeProfitMargin handles zero contract value', () => {
      expect(computeProfitMargin(0, 0)).toBe(0);
    });

    it('computeExpectedContingencyUse', () => {
      expect(computeExpectedContingencyUse(500000, 350000)).toBe(150000);
    });

    it('computeForecastSummaryCalculations — full integration', () => {
      const result = computeForecastSummaryCalculations({
        originalContractDays: 365,
        approvedExtensionDays: 30,
        budgetLineEACTotal: 8000000,
        gcEstimateAtCompletion: 500000,
        currentContractValue: 10000000,
        originalContingency: 500000,
        expectedContingencyAtCompletion: 350000,
      });

      expect(result.revisedContractCompletion).toBe(395);
      expect(result.estimatedCostAtCompletion).toBe(8500000);
      expect(result.currentProfit).toBe(1500000);
      expect(result.profitMargin).toBe(15);
      expect(result.expectedContingencyUse).toBe(150000);
    });
  });
});
