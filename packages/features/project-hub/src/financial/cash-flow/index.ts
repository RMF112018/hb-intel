/**
 * P3-E4-T05 pure computor functions for cash flow derived fields.
 * All functions are side-effect-free and deterministic.
 */

import type {
  ICashFlowActualRecord,
  ICashFlowForecastRecord,
  ICashFlowSummary,
} from '../types/index.js';

export const FINANCIAL_CASH_FLOW_SCOPE = 'financial/cash-flow';

/** totalInflows = inflowOwnerPayments + inflowOtherInflows (T05 §7.1). */
export const computeTotalInflows = (
  ownerPayments: number,
  otherInflows: number,
): number => ownerPayments + otherInflows;

/** totalOutflows = sum of all outflow fields (T05 §7.1). */
export const computeTotalOutflows = (
  subcontractorPayments: number,
  materialCosts: number,
  laborCosts: number,
  overhead: number,
  equipment: number,
): number => subcontractorPayments + materialCosts + laborCosts + overhead + equipment;

/** netCashFlow = totalInflows - totalOutflows. Positive = surplus (T05 §7.1). */
export const computeNetCashFlow = (
  totalInflows: number,
  totalOutflows: number,
): number => totalInflows - totalOutflows;

/** Compute running cumulative cash flow series from net cash flow values. */
export const computeCumulativeCashFlowSeries = (
  netCashFlows: readonly number[],
): number[] => {
  const result: number[] = [];
  let cumulative = 0;
  for (const net of netCashFlows) {
    cumulative += net;
    result.push(cumulative);
  }
  return result;
};

/**
 * Forecast accuracy for an actual record (T05 §7.1).
 * |actualNet - priorForecastNet| / |priorForecastNet| × 100.
 * Returns null if no prior forecast exists or prior forecast is zero.
 */
export const computeForecastAccuracy = (
  actualNet: number,
  priorForecastNet: number | null,
): number | null => {
  if (priorForecastNet === null || priorForecastNet === 0) return null;
  return (Math.abs(actualNet - priorForecastNet) / Math.abs(priorForecastNet)) * 100;
};

/** projectedNetCashFlow = projectedInflows - projectedOutflows (T05 §7.2). */
export const computeProjectedNetCashFlow = (
  projectedInflows: number,
  projectedOutflows: number,
): number => projectedInflows - projectedOutflows;

/** Compute projected cumulative series starting from the last actual cumulative value. */
export const computeProjectedCumulativeSeries = (
  lastActualCumulative: number,
  forecastNetCashFlows: readonly number[],
): number[] => {
  const result: number[] = [];
  let cumulative = lastActualCumulative;
  for (const net of forecastNetCashFlows) {
    cumulative += net;
    result.push(cumulative);
  }
  return result;
};

/**
 * Compute the full cash flow summary aggregate (T05 §7.3).
 * Aggregates actual and forecast records into a single summary.
 */
export const computeCashFlowSummary = (
  actuals: readonly ICashFlowActualRecord[],
  forecasts: readonly ICashFlowForecastRecord[],
  forecastVersionId: string,
  projectId: string,
): ICashFlowSummary => {
  const totalActualInflows = actuals.reduce((sum, r) => sum + r.totalInflows, 0);
  const totalActualOutflows = actuals.reduce((sum, r) => sum + r.totalOutflows, 0);
  const totalActualNetCashFlow = actuals.reduce((sum, r) => sum + r.netCashFlow, 0);

  const totalForecastedInflows = forecasts.reduce((sum, r) => sum + r.projectedInflows, 0);
  const totalForecastedOutflows = forecasts.reduce((sum, r) => sum + r.projectedOutflows, 0);
  const totalForecastedNetCashFlow = forecasts.reduce((sum, r) => sum + r.projectedNetCashFlow, 0);

  const combinedNetCashFlow = totalActualNetCashFlow + totalForecastedNetCashFlow;

  // Build full cumulative series across actuals + forecasts
  const actualNets = actuals.map((r) => r.netCashFlow);
  const forecastNets = forecasts.map((r) => r.projectedNetCashFlow);
  const allNets = [...actualNets, ...forecastNets];
  const cumulativeSeries = computeCumulativeCashFlowSeries(allNets);

  const peakCashRequirement = cumulativeSeries.length > 0
    ? Math.min(...cumulativeSeries)
    : 0;

  const cashFlowAtRisk = forecasts
    .filter((r) => r.projectedNetCashFlow < 0)
    .reduce((sum, r) => sum + r.projectedNetCashFlow, 0);

  const now = new Date().toISOString();

  return {
    summaryId: crypto.randomUUID(),
    forecastVersionId,
    projectId,
    totalActualInflows,
    totalActualOutflows,
    totalActualNetCashFlow,
    totalForecastedInflows,
    totalForecastedOutflows,
    totalForecastedNetCashFlow,
    combinedNetCashFlow,
    peakCashRequirement,
    cashFlowAtRisk,
    computedAt: now,
    lastUpdated: now,
  };
};

/** Compute monthly retention held (T05 §7.4). */
export const computeMonthlyRetention = (
  invoiceTotal: number,
  retainageRate: number,
  priorReleases: number,
): number => (invoiceTotal * retainageRate) - priorReleases;
