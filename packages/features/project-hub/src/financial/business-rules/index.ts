/**
 * P3-E4-T07 cross-cutting business rules, sign conventions, and calculation functions.
 * Single source of truth for sign convention across the Financial module.
 */

import type {
  FinancialAlertSeverity,
  FinancialDomain,
  IFinancialAlert,
  IForecastSummaryCalculations,
  IForecastToCompleteValidation,
  IGCGRVarianceResult,
  IProfitMarginAssessment,
  ISignConventionRule,
} from '../types/index.js';
import {
  FTC_OVER_BUDGET_WARNING_THRESHOLD,
  PROFIT_MARGIN_CRITICAL_THRESHOLD,
  PROFIT_MARGIN_WARNING_THRESHOLD,
  SIGN_CONVENTION_RULES,
} from '../constants/index.js';

export const FINANCIAL_BUSINESS_RULES_SCOPE = 'financial/business-rules';

// ── Sign Convention Helpers ───────────────────────────────────────────

/** Look up the sign convention rule for a financial domain (T07 §9). */
export const getSignConventionForDomain = (
  domain: FinancialDomain,
): ISignConventionRule | undefined =>
  SIGN_CONVENTION_RULES.find((r) => r.domain === domain);

/** Interpret a numeric value using a sign convention rule. */
export const interpretValue = (
  value: number,
  rule: ISignConventionRule,
): { interpretation: string; displayColor: 'green' | 'red' | 'neutral' } => {
  if (value === 0) return { interpretation: 'On target', displayColor: 'neutral' };
  if (value > 0) return { interpretation: rule.positiveInterpretation, displayColor: rule.positiveColor };
  return { interpretation: rule.negativeInterpretation, displayColor: rule.negativeColor };
};

// ── FTC Validation (§10.2) ────────────────────────────────────────────

/**
 * Validate forecastToComplete per T07 §10.2.
 * Must be >= 0. Warns if EAC > revisedBudget × 1.10.
 */
export const validateForecastToComplete = (
  forecastToComplete: number,
  revisedBudget: number,
  costExposureToDate: number,
): IForecastToCompleteValidation => {
  const alerts: IFinancialAlert[] = [];

  if (forecastToComplete < 0) {
    alerts.push({
      field: 'forecastToComplete',
      severity: 'critical',
      message: 'Forecast to complete must be >= 0',
    });
    return { isValid: false, alerts };
  }

  const eac = costExposureToDate + forecastToComplete;
  if (revisedBudget > 0 && eac > revisedBudget * FTC_OVER_BUDGET_WARNING_THRESHOLD) {
    alerts.push({
      field: 'forecastToComplete',
      severity: 'warning',
      message: `Estimated cost at completion ($${eac.toFixed(2)}) exceeds revised budget by more than 10%. Consider adding a note.`,
    });
  }

  return { isValid: true, alerts };
};

// ── Profit / Margin Assessment (§9.4, §10.3) ─────────────────────────

/** Compute current profit (T07 §10.3). */
export const computeCurrentProfit = (
  currentContractValue: number,
  estimatedCostAtCompletion: number,
): number => currentContractValue - estimatedCostAtCompletion;

/** Compute profit margin percentage (T07 §10.3). */
export const computeProfitMargin = (
  currentProfit: number,
  currentContractValue: number,
): number => currentContractValue === 0 ? 0 : (currentProfit / currentContractValue) * 100;

/** Assess profit margin severity per T07 §9.4. */
export const assessProfitMargin = (
  currentContractValue: number,
  estimatedCostAtCompletion: number,
): IProfitMarginAssessment => {
  const currentProfit = computeCurrentProfit(currentContractValue, estimatedCostAtCompletion);
  const profitMargin = computeProfitMargin(currentProfit, currentContractValue);

  let severity: FinancialAlertSeverity = 'none';
  let alert: IFinancialAlert | null = null;

  if (profitMargin < PROFIT_MARGIN_CRITICAL_THRESHOLD) {
    severity = 'critical';
    alert = {
      field: 'profitMargin',
      severity: 'critical',
      message: `Forecasting a loss (margin ${profitMargin.toFixed(2)}%). PE visibility required.`,
    };
  } else if (profitMargin < PROFIT_MARGIN_WARNING_THRESHOLD) {
    severity = 'warning';
    alert = {
      field: 'profitMargin',
      severity: 'warning',
      message: `Profit margin below ${PROFIT_MARGIN_WARNING_THRESHOLD}% (currently ${profitMargin.toFixed(2)}%).`,
    };
  }

  return { currentProfit, profitMargin, severity, alert };
};

// ── GC/GR Variance Calculations (§10.4) ──────────────────────────────

/** GC variance = gcEAC - originalGCBudget (positive = overrun) (T07 §10.4). */
export const computeGCVariance = (
  gcEstimateAtCompletion: number,
  originalGCBudget: number,
): number => gcEstimateAtCompletion - originalGCBudget;

/** GR variance = grEAC - originalGRBudget (T07 §10.4). */
export const computeGRVariance = (
  grEstimateAtCompletion: number,
  originalGRBudget: number,
): number => grEstimateAtCompletion - originalGRBudget;

/** Total GC/GR variance (T07 §10.4). */
export const computeTotalGCGRVariance = (
  gcVariance: number,
  grVariance: number,
): number => gcVariance + grVariance;

/** Compute all GC/GR variances in one call (T07 §10.4). */
export const computeGCGRVariances = (
  gcEAC: number,
  gcBudget: number,
  grEAC: number,
  grBudget: number,
): IGCGRVarianceResult => {
  const gcVariance = computeGCVariance(gcEAC, gcBudget);
  const grVariance = computeGRVariance(grEAC, grBudget);
  return { gcVariance, grVariance, totalVariance: computeTotalGCGRVariance(gcVariance, grVariance) };
};

// ── Forecast Summary Calculations (§10.3) ─────────────────────────────

/** Revised contract completion in calendar days (T07 §10.3). */
export const computeRevisedContractCompletion = (
  originalDays: number,
  approvedExtensionDays: number,
): number => originalDays + approvedExtensionDays;

/** Expected contingency use (T07 §10.3). */
export const computeExpectedContingencyUse = (
  originalContingency: number,
  expectedContingencyAtCompletion: number,
): number => originalContingency - expectedContingencyAtCompletion;

/** Compute all forecast summary calculations (T07 §10.3). */
export const computeForecastSummaryCalculations = (input: {
  readonly originalContractDays: number;
  readonly approvedExtensionDays: number;
  readonly budgetLineEACTotal: number;
  readonly gcEstimateAtCompletion: number;
  readonly currentContractValue: number;
  readonly originalContingency: number;
  readonly expectedContingencyAtCompletion: number;
}): IForecastSummaryCalculations => {
  const revisedContractCompletion = computeRevisedContractCompletion(input.originalContractDays, input.approvedExtensionDays);
  const estimatedCostAtCompletion = input.budgetLineEACTotal + input.gcEstimateAtCompletion;
  const currentProfit = computeCurrentProfit(input.currentContractValue, estimatedCostAtCompletion);
  const profitMargin = computeProfitMargin(currentProfit, input.currentContractValue);
  const expectedContingencyUse = computeExpectedContingencyUse(input.originalContingency, input.expectedContingencyAtCompletion);

  return { revisedContractCompletion, estimatedCostAtCompletion, currentProfit, profitMargin, expectedContingencyUse };
};
