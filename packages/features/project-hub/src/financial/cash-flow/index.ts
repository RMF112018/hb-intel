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

// ── Variance and Watch Period Services ──────────────────────────────

/**
 * Variance of current cumulative vs prior version cumulative at each month.
 * Returns array of { month, variance, direction } entries.
 */
export interface CashFlowVarianceEntry {
  readonly month: string;
  readonly currentCumulative: number;
  readonly priorCumulative: number;
  readonly variance: number;
  readonly direction: 'better' | 'worse' | 'unchanged';
}

export const computeVarianceVsPrior = (
  currentCumulatives: readonly { month: string; cumulative: number }[],
  priorCumulatives: readonly { month: string; cumulative: number }[],
): CashFlowVarianceEntry[] => {
  const priorMap = new Map(priorCumulatives.map((p) => [p.month, p.cumulative]));
  return currentCumulatives.map((c) => {
    const prior = priorMap.get(c.month) ?? 0;
    const variance = c.cumulative - prior;
    return {
      month: c.month,
      currentCumulative: c.cumulative,
      priorCumulative: prior,
      variance,
      direction: variance > 0 ? 'better' as const : variance < 0 ? 'worse' as const : 'unchanged' as const,
    };
  });
};

/**
 * Watch period identification — months where cumulative goes negative
 * or where net cash flow indicates timing risk.
 */
export interface CashFlowWatchPeriod {
  readonly month: string;
  readonly reason: 'deficit' | 'near-deficit' | 'large-outflow' | 'low-confidence';
  readonly severity: 'critical' | 'high' | 'standard';
  readonly explanation: string;
}

export const identifyWatchPeriods = (
  months: readonly { month: string; netCashFlow: number; cumulativeCashFlow: number; confidenceScore: number | null }[],
): CashFlowWatchPeriod[] => {
  const result: CashFlowWatchPeriod[] = [];

  for (const m of months) {
    if (m.cumulativeCashFlow < 0) {
      result.push({
        month: m.month,
        reason: 'deficit',
        severity: 'critical',
        explanation: `Cumulative cash flow is negative ($${Math.abs(m.cumulativeCashFlow).toLocaleString()}) — project requires cash injection or timing adjustment`,
      });
    } else if (m.cumulativeCashFlow < 50000 && m.cumulativeCashFlow >= 0) {
      result.push({
        month: m.month,
        reason: 'near-deficit',
        severity: 'high',
        explanation: `Cumulative cash flow near zero ($${m.cumulativeCashFlow.toLocaleString()}) — limited margin before deficit`,
      });
    }

    if (m.netCashFlow < -200000) {
      result.push({
        month: m.month,
        reason: 'large-outflow',
        severity: 'high',
        explanation: `Large net outflow ($${Math.abs(m.netCashFlow).toLocaleString()}) — verify subcontractor payment timing`,
      });
    }

    if (m.confidenceScore !== null && m.confidenceScore < 60) {
      result.push({
        month: m.month,
        reason: 'low-confidence',
        severity: 'standard',
        explanation: `Forecast confidence below 60% (${m.confidenceScore}%) — projection may not be reliable`,
      });
    }
  }

  return result;
};

/**
 * Explanation payload for cash flow warning states.
 * Produces a human-readable explanation of why cash flow health metrics
 * are in a given state.
 */
export interface CashFlowWarningExplanation {
  readonly metric: string;
  readonly value: number;
  readonly severity: 'healthy' | 'watch' | 'at-risk' | 'critical';
  readonly explanation: string;
  readonly recommendation: string;
}

export const explainCashFlowWarnings = (
  summary: ICashFlowSummary,
): CashFlowWarningExplanation[] => {
  const warnings: CashFlowWarningExplanation[] = [];

  // Peak cash requirement
  if (summary.peakCashRequirement < 0) {
    warnings.push({
      metric: 'peakCashRequirement',
      value: summary.peakCashRequirement,
      severity: 'critical',
      explanation: `Project reaches a cash deficit of $${Math.abs(summary.peakCashRequirement).toLocaleString()} — working capital or financing required`,
      recommendation: 'Review payment timing and consider draw schedule acceleration',
    });
  } else if (summary.peakCashRequirement < 100000) {
    warnings.push({
      metric: 'peakCashRequirement',
      value: summary.peakCashRequirement,
      severity: 'watch',
      explanation: `Peak cash requirement is near break-even ($${summary.peakCashRequirement.toLocaleString()})`,
      recommendation: 'Monitor closely and prepare contingency cash plan',
    });
  }

  // Cash flow at risk
  if (summary.cashFlowAtRisk < -100000) {
    warnings.push({
      metric: 'cashFlowAtRisk',
      value: summary.cashFlowAtRisk,
      severity: 'at-risk',
      explanation: `Projected deficit months total $${Math.abs(summary.cashFlowAtRisk).toLocaleString()} in negative cash flow`,
      recommendation: 'Review outflow timing in deficit months',
    });
  } else if (summary.cashFlowAtRisk < 0) {
    warnings.push({
      metric: 'cashFlowAtRisk',
      value: summary.cashFlowAtRisk,
      severity: 'watch',
      explanation: `Some projected months show negative net cash flow totaling $${Math.abs(summary.cashFlowAtRisk).toLocaleString()}`,
      recommendation: 'Verify forecast assumptions for negative months',
    });
  }

  return warnings;
};

/**
 * Manual correction record type.
 * Tracks explicit governed corrections to cash flow values with
 * full audit trail. Corrections never overwrite evidence records —
 * they layer on top with explicit provenance.
 */
export interface ICashFlowManualCorrection {
  readonly correctionId: string;
  readonly forecastVersionId: string;
  readonly projectId: string;
  readonly targetMonthId: string;
  readonly targetMonth: string;
  readonly field: 'inflows' | 'outflows' | 'retentionHeld' | 'workingCapital';
  readonly originalValue: number;
  readonly correctedValue: number;
  readonly reason: string;
  readonly correctedBy: string;
  readonly correctedAt: string;
  readonly approvedBy: string | null;
  readonly approvedAt: string | null;
  readonly isActive: boolean;
}
