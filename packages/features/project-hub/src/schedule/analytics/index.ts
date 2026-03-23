import type {
  ConfidenceLabel,
  IRecommendationRecord,
  ScheduleLetterGrade,
} from '../types/index.js';

/**
 * P3-E5-T07 analytics intelligence and grading domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Criticality Index (§11.2.1) ──────────────────────────────────────

/**
 * Calculate criticality index for an activity (§11.2.1).
 * Formula: (1 - (totalFloatHrs / maxTotalFloat)) × 100, clamped to [0, 100].
 */
export const calculateCriticalityIndex = (
  totalFloatHrs: number,
  maxTotalFloatHrs: number,
): number => {
  if (maxTotalFloatHrs <= 0) {
    return 100;
  }

  const raw = (1 - totalFloatHrs / maxTotalFloatHrs) * 100;
  return Math.max(0, Math.min(100, Math.round(raw * 100) / 100));
};

// ── Overall Grade Mapping (§11.1) ────────────────────────────────────

/**
 * Map a composite score (0-100) to a letter grade.
 * Default thresholds: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F < 60.
 * Thresholds are governed; these are reference defaults.
 */
export const calculateOverallGrade = (
  score: number,
  thresholds?: { a: number; b: number; c: number; d: number },
): ScheduleLetterGrade => {
  const t = thresholds ?? { a: 90, b: 80, c: 70, d: 60 };

  if (score >= t.a) return 'A';
  if (score >= t.b) return 'B';
  if (score >= t.c) return 'C';
  if (score >= t.d) return 'D';
  return 'F';
};

// ── Confidence Label Mapping (§11.4) ─────────────────────────────────

/**
 * Map a confidence score (0-100) to a label.
 * Default thresholds: High ≥ 80, Moderate ≥ 60, Low ≥ 40, VeryLow < 40.
 * Governed.
 */
export const calculateConfidenceLabel = (
  score: number,
  thresholds?: { high: number; moderate: number; low: number },
): ConfidenceLabel => {
  const t = thresholds ?? { high: 80, moderate: 60, low: 40 };

  if (score >= t.high) return 'High';
  if (score >= t.moderate) return 'Moderate';
  if (score >= t.low) return 'Low';
  return 'VeryLow';
};

// ── Slippage Calculation (§11.3) ─────────────────────────────────────

/**
 * Calculate slippage between two version forecasts in days.
 * Positive = later (slipped). Negative = earlier (recovered).
 */
export const calculateSlippageSinceLastUpdate = (
  currentForecastDate: string,
  priorForecastDate: string,
): number => {
  const current = new Date(currentForecastDate);
  const prior = new Date(priorForecastDate);
  return Math.round((current.getTime() - prior.getTime()) / (1000 * 60 * 60 * 24));
};

// ── Recommendation Promotability (§12.1) ─────────────────────────────

/**
 * Check whether a recommendation is promotable.
 * Must be Accepted disposition with a valid promotionPath.
 */
export const isRecommendationPromotable = (
  rec: Pick<IRecommendationRecord, 'disposition' | 'promotionPath'>,
): boolean => {
  return rec.disposition === 'Accepted' && rec.promotionPath !== null;
};
