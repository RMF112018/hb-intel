/**
 * P3-E10-T06 Subcontractor Scorecard testing fixture factory.
 */

import type { ScorecardScoreValue } from '../src/closeout/scorecard/enums.js';

/**
 * Creates a set of mock criterion scores for a section.
 * Default: 5 criteria all scored 3 (Satisfactory).
 */
export const createMockScorecardCriterionScores = (
  scores?: ReadonlyArray<ScorecardScoreValue>,
): ReadonlyArray<ScorecardScoreValue> =>
  scores ?? [3, 3, 3, 3, 3];
