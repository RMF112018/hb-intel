import { ScorecardRecommendation } from './ScorecardEnums.js';

/**
 * Scorecard-specific constants.
 *
 * @module scorecard/constants
 */

/** Human-readable labels for scorecard recommendations. */
export const SCORECARD_RECOMMENDATION_LABELS: Record<ScorecardRecommendation, string> = {
  [ScorecardRecommendation.Go]: 'Go',
  [ScorecardRecommendation.NoGo]: 'No-Go',
  [ScorecardRecommendation.Conditional]: 'Conditional',
  [ScorecardRecommendation.Deferred]: 'Deferred',
};

/** Score threshold at or above which a "Go" recommendation is typical. */
export const SCORECARD_GO_THRESHOLD = 70;

/** Score threshold below which a "No-Go" recommendation is typical. */
export const SCORECARD_NOGO_THRESHOLD = 40;
