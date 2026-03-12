/**
 * Aggregate readiness summary payload for Signal and Dashboard surfaces.
 *
 * @design D-SF18-T02
 */
import type { IReadinessScore } from './IReadinessScore.js';
import type { ICompletenessMetadata } from './IReadinessCompletenessMetadata.js';
import type { IReadinessCategoryBreakdown } from './IReadinessCategoryBreakdown.js';
import type { IReadinessRecommendation } from './IReadinessRecommendation.js';
import type { IReadinessGovernanceMetadata } from './IReadinessGovernanceMetadata.js';

export interface IReadinessSummaryPayload {
  readonly score: IReadinessScore;
  readonly completeness: ICompletenessMetadata;
  readonly categoryBreakdown: readonly IReadinessCategoryBreakdown[];
  readonly recommendations: readonly IReadinessRecommendation[];
  readonly governance: IReadinessGovernanceMetadata;
}
