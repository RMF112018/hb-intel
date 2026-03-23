/**
 * P3-E4-T02 pure deterministic computors for Financial module derived fields.
 * All functions are side-effect-free and depend only on their inputs.
 */

export const FINANCIAL_COMPUTORS_SCOPE = 'financial/computors';

/** Compute the fallback composite match key for identity resolution (T02 §2.2). */
export const computeFallbackCompositeMatchKey = (
  costCodeTier1: string,
  costType: string,
  budgetCode: string,
): string =>
  `${costCodeTier1.trim().toLowerCase()}|${costType.trim().toLowerCase()}|${budgetCode.trim().toLowerCase()}`;

/** revisedBudget = originalBudget + budgetModifications + approvedCOs (T02 §3.1). */
export const computeRevisedBudget = (
  originalBudget: number,
  budgetModifications: number,
  approvedCOs: number,
): number => originalBudget + budgetModifications + approvedCOs;

/** projectedBudget = revisedBudget + pendingBudgetChanges (T02 §3.1). */
export const computeProjectedBudget = (
  revisedBudget: number,
  pendingBudgetChanges: number,
): number => revisedBudget + pendingBudgetChanges;

/** costExposureToDate = jobToDateActualCost + committedCosts (T02 §3.1). */
export const computeCostExposureToDate = (
  jobToDateActualCost: number,
  committedCosts: number,
): number => jobToDateActualCost + committedCosts;

/** projectedCosts = costExposureToDate + pendingCostChanges (T02 §3.1). */
export const computeProjectedCosts = (
  costExposureToDate: number,
  pendingCostChanges: number,
): number => costExposureToDate + pendingCostChanges;

/** estimatedCostAtCompletion = costExposureToDate + forecastToComplete (T02 §3.1). */
export const computeEstimatedCostAtCompletion = (
  costExposureToDate: number,
  forecastToComplete: number,
): number => costExposureToDate + forecastToComplete;

/** projectedOverUnder = revisedBudget - estimatedCostAtCompletion. Positive = favorable (T02 §3.1, T07 §7.1). */
export const computeProjectedOverUnder = (
  revisedBudget: number,
  estimatedCostAtCompletion: number,
): number => revisedBudget - estimatedCostAtCompletion;

/** Default forecastToComplete = max(0, revisedBudget - costExposureToDate) (T02 §3.5 step 6). */
export const computeDefaultForecastToComplete = (
  revisedBudget: number,
  costExposureToDate: number,
): number => Math.max(0, revisedBudget - costExposureToDate);

/** Compute all derived fields from base input fields. */
export const computeAllDerivedFields = (line: {
  readonly originalBudget: number;
  readonly budgetModifications: number;
  readonly approvedCOs: number;
  readonly pendingBudgetChanges: number;
  readonly jobToDateActualCost: number;
  readonly committedCosts: number;
  readonly pendingCostChanges: number;
  readonly forecastToComplete: number;
}): {
  revisedBudget: number;
  projectedBudget: number;
  costExposureToDate: number;
  projectedCosts: number;
  estimatedCostAtCompletion: number;
  projectedOverUnder: number;
} => {
  const revisedBudget = computeRevisedBudget(line.originalBudget, line.budgetModifications, line.approvedCOs);
  const projectedBudget = computeProjectedBudget(revisedBudget, line.pendingBudgetChanges);
  const costExposureToDate = computeCostExposureToDate(line.jobToDateActualCost, line.committedCosts);
  const projectedCosts = computeProjectedCosts(costExposureToDate, line.pendingCostChanges);
  const estimatedCostAtCompletion = computeEstimatedCostAtCompletion(costExposureToDate, line.forecastToComplete);
  const projectedOverUnder = computeProjectedOverUnder(revisedBudget, estimatedCostAtCompletion);
  return { revisedBudget, projectedBudget, costExposureToDate, projectedCosts, estimatedCostAtCompletion, projectedOverUnder };
};
