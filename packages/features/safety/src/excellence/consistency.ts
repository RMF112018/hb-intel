/**
 * Consistency / trend score for Safety Field Excellence.
 *
 * Compares the current-window average accepted score to the rolling-history
 * average. A flat trend at the rolling baseline scores 50; +20 percentage
 * points or better caps at 100; -20 or worse caps at 0.
 */

import { averageAcceptedPercent, partitionInspections } from './inspectionFiltering.js';
import type { SafetyInspectionEvent } from '../domain/types.js';

export interface ConsistencyResult {
  readonly score: number;
  readonly averageInspectionScoreWindow: number | null;
  readonly averageInspectionScoreRolling: number | null;
  readonly inspectionTrendPct: number | null;
}

const TREND_CLAMP = 20;
const TREND_TO_SCORE = 2.5; // 20-point clamp × 2.5 = 50 → maps ±20 to 0..100 around the 50 baseline.

export function computeConsistencyTrendScore(
  windowAccepted: ReadonlyArray<SafetyInspectionEvent>,
  priorInspections: ReadonlyArray<SafetyInspectionEvent>,
): ConsistencyResult {
  const averageInspectionScoreWindow = averageAcceptedPercent(windowAccepted);
  const priorAccepted = partitionInspections(priorInspections).accepted;
  const averageInspectionScoreRolling = averageAcceptedPercent(priorAccepted);

  if (windowAccepted.length === 0) {
    return {
      score: 0,
      averageInspectionScoreWindow,
      averageInspectionScoreRolling,
      inspectionTrendPct: null,
    };
  }

  if (
    averageInspectionScoreWindow === null ||
    averageInspectionScoreRolling === null ||
    averageInspectionScoreRolling === 0
  ) {
    return {
      score: 50,
      averageInspectionScoreWindow,
      averageInspectionScoreRolling,
      inspectionTrendPct: null,
    };
  }

  const delta = averageInspectionScoreWindow - averageInspectionScoreRolling;
  const clamped = Math.max(-TREND_CLAMP, Math.min(TREND_CLAMP, delta));
  const score = 50 + clamped * TREND_TO_SCORE;

  const inspectionTrendPct =
    ((averageInspectionScoreWindow - averageInspectionScoreRolling) /
      averageInspectionScoreRolling) *
    100;

  return {
    score: Math.max(0, Math.min(100, score)),
    averageInspectionScoreWindow,
    averageInspectionScoreRolling,
    inspectionTrendPct,
  };
}
