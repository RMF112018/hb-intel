/**
 * P3-E10-T06 Subcontractor Scorecard Model business rules.
 * Scoring formulas, performance rating derivation, validation, workflow.
 */

import type { PerformanceRating, ScorecardScoreValue } from './enums.js';
import type { CloseoutReBidRecommendation, CloseoutScorecardEvaluationType } from '../records/enums.js';
import { SCORECARD_SECTION_DEFINITIONS, SCORECARD_PERFORMANCE_RATING_RANGES } from './constants.js';

// -- Section Average (§3.1) -------------------------------------------------

/**
 * Calculates section average per T06 §3.1.
 * Weighted average of scored criteria excluding NA. Rounded to 2 decimal places.
 * Returns null if all criteria are NA.
 *
 * @param scores - array of criterion scores (1-5 or 'NA')
 * @param perCriterionWeight - weight per criterion within the section (equal weighting)
 */
export const calculateSectionAverage = (
  scores: ReadonlyArray<ScorecardScoreValue>,
): number | null => {
  const numericScores = scores.filter((s): s is 1 | 2 | 3 | 4 | 5 => typeof s === 'number');
  if (numericScores.length === 0) return null;
  const sum = numericScores.reduce<number>((acc, s) => acc + s, 0);
  return Math.round((sum / numericScores.length) * 100) / 100;
};

// -- Overall Weighted Score (§3.2) ------------------------------------------

/**
 * Calculates overall weighted score per T06 §3.2.
 * Sum of (sectionAvg × sectionWeight) for non-null sections. Rounded to 2 decimal places.
 * Returns null if no section yields a calculable average.
 */
export const calculateOverallWeightedScore = (
  sectionAverages: ReadonlyArray<{ sectionAvg: number | null; sectionWeight: number }>,
): number | null => {
  const computable = sectionAverages.filter(
    (s): s is { sectionAvg: number; sectionWeight: number } => s.sectionAvg !== null,
  );
  if (computable.length === 0) return null;
  const weightedSum = computable.reduce((acc, s) => acc + s.sectionAvg * s.sectionWeight, 0);
  return Math.round(weightedSum * 100) / 100;
};

/**
 * Convenience: calculates overall weighted score from raw section scores.
 * Uses section definitions for weights.
 */
export const calculateOverallFromSections = (
  sectionScores: ReadonlyArray<{
    sectionKey: string;
    scores: ReadonlyArray<ScorecardScoreValue>;
  }>,
): number | null => {
  const averages = sectionScores.map((section) => {
    const def = SCORECARD_SECTION_DEFINITIONS.find((d) => d.key === section.sectionKey);
    return {
      sectionAvg: calculateSectionAverage(section.scores),
      sectionWeight: def?.weight ?? 0,
    };
  });
  return calculateOverallWeightedScore(averages);
};

// -- Performance Rating Derivation (§3.3) -----------------------------------

/**
 * Derives performance rating from overall weighted score per T06 §3.3.
 * Returns null if score is null.
 */
export const derivePerformanceRating = (overallScore: number | null): PerformanceRating | null => {
  if (overallScore === null) return null;
  for (const range of SCORECARD_PERFORMANCE_RATING_RANGES) {
    if (overallScore >= range.minScore && overallScore <= range.maxScore) {
      return range.rating;
    }
  }
  return null;
};

// -- Validation (§4) --------------------------------------------------------

/**
 * Returns true if scorecard can be submitted per T06 §4.2.
 * Requires: non-null overall score, reBid set, evaluation date ≤ today.
 */
export const canSubmitScorecard = (
  overallWeightedScore: number | null,
  reBidRecommendation: CloseoutReBidRecommendation | null,
  evaluationDate: string,
): boolean => {
  if (overallWeightedScore === null) return false;
  if (reBidRecommendation === null) return false;
  const evalDate = new Date(evaluationDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return evalDate <= today;
};

/**
 * Returns true if a FinalCloseout already exists for this sub on this project per T06 §4.1.
 * API should return 409 Conflict.
 */
export const isFinalCloseoutDuplicate = (existingFinalCloseoutCount: number): boolean =>
  existingFinalCloseoutCount > 0;

// -- Amendment (§4.5) -------------------------------------------------------

/**
 * Returns true if a new FinalCloseout amendment can be created per T06 §4.5.
 * Requires existing approved scorecard AND PE allowAmendment flag.
 */
export const canCreateFinalCloseoutAmendment = (
  existingApproved: boolean,
  peAllowsAmendment: boolean,
): boolean => existingApproved && peAllowsAmendment;

// -- Interim Publication Exception (§5.2) -----------------------------------

/**
 * Returns true if an interim evaluation is eligible for org publication per T06 §5.2.
 * Requires PE to have explicitly set eligibleForPublication = true.
 */
export const isInterimPublicationException = (
  eligibleForPublication: boolean,
  evaluationType: CloseoutScorecardEvaluationType,
): boolean => evaluationType === 'Interim' && eligibleForPublication;
