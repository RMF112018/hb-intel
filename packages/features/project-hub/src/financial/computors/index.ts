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

// ── T04: Forecast Summary computors ──────────────────────────────────

/** revisedContractAmount = originalContractAmount + approvedChangeOrders (T04 §5). */
export const computeRevisedContractAmount = (
  originalContractAmount: number,
  approvedChangeOrders: number,
): number => originalContractAmount + approvedChangeOrders;

/** totalContractWithPending = revisedContractAmount + pendingChangeOrders (T04 §5). */
export const computeTotalContractWithPending = (
  revisedContractAmount: number,
  pendingChangeOrders: number,
): number => revisedContractAmount + pendingChangeOrders;

/** currentProfit = revisedContractAmount - estimatedCostAtCompletion (T04 §5, T07 §10.3). */
export const computeForecastSummaryProfit = (
  revisedContractAmount: number,
  estimatedCostAtCompletion: number,
): number => revisedContractAmount - estimatedCostAtCompletion;

/** profitMargin = currentProfit / revisedContractAmount * 100 (T04 §5, T07 §10.3). */
export const computeForecastSummaryProfitMargin = (
  currentProfit: number,
  revisedContractAmount: number,
): number => revisedContractAmount === 0 ? 0 : (currentProfit / revisedContractAmount) * 100;

/** contingencyRemaining = contingencyBudget - contingencyUsedToDate (T04 §5). */
export const computeContingencyRemaining = (
  contingencyBudget: number,
  contingencyUsedToDate: number,
): number => contingencyBudget - contingencyUsedToDate;

// ── T04: GC/GR computors ────────────────────────────────────────────

import type { IGCGRLine, IGCGRSummaryRollup } from '../types/index.js';

/** GC/GR line variance = forecastAmount - budgetAmount (T04 §6). */
export const computeGCGRLineVariance = (
  forecastAmount: number,
  budgetAmount: number,
): number => forecastAmount - budgetAmount;

/** GC/GR line variance percent = variance / budget * 100 (T04 §6). */
export const computeGCGRLineVariancePercent = (
  varianceAmount: number,
  budgetAmount: number,
): number => budgetAmount === 0 ? 0 : (varianceAmount / budgetAmount) * 100;

/** GC/GR summary rollup from line items (T04 §6.3). */
export const computeGCGRSummaryRollup = (
  lines: readonly IGCGRLine[],
): IGCGRSummaryRollup => {
  let totalBudget = 0;
  let totalForecast = 0;
  let totalAdjustment = 0;
  let overBudgetLineCount = 0;
  let gcSubtotal = 0;
  let grSubtotal = 0;

  for (const line of lines) {
    totalBudget += line.budgetAmount;
    totalForecast += line.forecastAmount;
    totalAdjustment += line.adjustmentAmount;
    if (line.isOverBudget) overBudgetLineCount++;
    if (line.category === 'GeneralConditions') gcSubtotal += line.varianceAmount;
    else if (line.category === 'GeneralRequirements') grSubtotal += line.varianceAmount;
  }

  return {
    totalBudget,
    totalForecast,
    totalVariance: totalForecast - totalBudget,
    totalAdjustment,
    lineCount: lines.length,
    overBudgetLineCount,
    gcSubtotal,
    grSubtotal,
  };
};
