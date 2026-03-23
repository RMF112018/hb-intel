/** Pre-built scenarios for business rule testing (T07). */

export const businessRuleScenarios = {
  /** Budget line exactly on budget. */
  onBudget: { revisedBudget: 100000, costExposureToDate: 60000, forecastToComplete: 40000 },
  /** Budget line over budget (unfavorable). */
  overBudget: { revisedBudget: 100000, costExposureToDate: 80000, forecastToComplete: 35000 },
  /** Budget line under budget (favorable). */
  underBudget: { revisedBudget: 100000, costExposureToDate: 50000, forecastToComplete: 30000 },

  /** Profit margin below 5% — warning. */
  profitWarning: { currentContractValue: 1000000, estimatedCostAtCompletion: 960000 },
  /** Profit margin below 0% — critical (loss). */
  profitCritical: { currentContractValue: 1000000, estimatedCostAtCompletion: 1050000 },
  /** Healthy profit margin. */
  profitHealthy: { currentContractValue: 1000000, estimatedCostAtCompletion: 850000 },

  /** GC overrun. */
  gcOverrun: { gcEAC: 550000, gcBudget: 500000, grEAC: 210000, grBudget: 200000 },
  /** GC savings. */
  gcSavings: { gcEAC: 450000, gcBudget: 500000, grEAC: 180000, grBudget: 200000 },
} as const;
