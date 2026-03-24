/**
 * P3-E8-T04 Inspection program business rules.
 * Score band, trend direction, CA due dates, template governance.
 */

import type { CorrectiveActionSeverity, TemplateStatus } from '../records/enums.js';
import type { ISectionScoringWeight } from '../records/types.js';
import type { InspectionScoreBand, InspectionTrendDirection } from './enums.js';
import type { IInspectionTrendDataPoint } from './types.js';
import {
  SCORE_BAND_THRESHOLDS,
  CA_DUE_DATE_RULES,
  MINIMUM_TREND_DATA_POINTS,
  TREND_DIRECTION_THRESHOLD,
} from './constants.js';

// -- Score Band Derivation (§5.2) -------------------------------------------

/**
 * §5.2: Derive PER score band from normalized score.
 * HIGH ≥ 90, MED 70–89, LOW < 70.
 * PER never receives raw normalizedScore — only the band.
 */
export const deriveScoreBand = (normalizedScore: number): InspectionScoreBand => {
  for (const threshold of SCORE_BAND_THRESHOLDS) {
    if (normalizedScore >= threshold.minScore) return threshold.band;
  }
  return 'LOW';
};

// -- Trend Direction Computation (§5.1) -------------------------------------

/**
 * §5.1: Compute trend direction from data points.
 * INSUFFICIENT_DATA: fewer than 2 inspections.
 * IMPROVING: recent 2 avg > prior avg by ≥ threshold.
 * DECLINING: recent 2 avg < prior avg by ≥ threshold.
 * STABLE: within ±threshold.
 */
export const computeTrendDirection = (
  dataPoints: readonly IInspectionTrendDataPoint[],
): InspectionTrendDirection => {
  if (dataPoints.length < MINIMUM_TREND_DATA_POINTS) return 'INSUFFICIENT_DATA';

  if (dataPoints.length === 2) {
    const diff = dataPoints[dataPoints.length - 1].normalizedScore - dataPoints[0].normalizedScore;
    if (diff >= TREND_DIRECTION_THRESHOLD) return 'IMPROVING';
    if (diff <= -TREND_DIRECTION_THRESHOLD) return 'DECLINING';
    return 'STABLE';
  }

  // Split: most recent 2 vs rest
  const recent = dataPoints.slice(-2);
  const prior = dataPoints.slice(0, -2);

  const recentAvg = recent.reduce((sum, p) => sum + p.normalizedScore, 0) / recent.length;
  const priorAvg = prior.reduce((sum, p) => sum + p.normalizedScore, 0) / prior.length;
  const diff = recentAvg - priorAvg;

  if (diff >= TREND_DIRECTION_THRESHOLD) return 'IMPROVING';
  if (diff <= -TREND_DIRECTION_THRESHOLD) return 'DECLINING';
  return 'STABLE';
};

// -- Corrective Action Due Date (§6) ----------------------------------------

/**
 * §6: Get CA due date in business days based on severity.
 * CRITICAL = 0 (same day), MAJOR = 3, MINOR = 7.
 */
export const getCADueDateDays = (severity: CorrectiveActionSeverity): number => {
  const rule = CA_DUE_DATE_RULES.find((r) => r.severity === severity);
  return rule?.businessDays ?? 7;
};

// -- Weight Validation (§2.2) -----------------------------------------------

/**
 * §2.2: Validate that scoring weights sum to exactly 100.
 */
export const validateWeightsSum = (weights: readonly ISectionScoringWeight[]): boolean => {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  return Math.abs(total - 100) < 0.01;
};

// -- Template Pinning (§2.4) ------------------------------------------------

/**
 * §2.4: Only ACTIVE templates can be pinned to new inspections.
 * DRAFT and RETIRED templates cannot be used for new inspections.
 */
export const isTemplatePinningValid = (templateStatus: TemplateStatus): boolean =>
  templateStatus === 'ACTIVE';
