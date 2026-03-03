/**
 * Scorecard domain models — Go/No-Go evaluation and version history.
 *
 * @module scorecard
 */

export { type IGoNoGoScorecard, type IScorecardVersion } from './IScorecard.js';
export { type IScorecardFormData } from './IScorecardFormData.js';
export { ScorecardRecommendation } from './ScorecardEnums.js';
export { type ScorecardId, type ScorecardSearchCriteria } from './types.js';
export {
  SCORECARD_RECOMMENDATION_LABELS,
  SCORECARD_GO_THRESHOLD,
  SCORECARD_NOGO_THRESHOLD,
} from './constants.js';
