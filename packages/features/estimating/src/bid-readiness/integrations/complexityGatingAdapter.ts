/**
 * SF18-T07 complexity gating reference integration adapter.
 *
 * Applies deterministic visibility rules for criteria and recommendations based
 * on complexity tier and governance audience expectations.
 *
 * @design D-SF18-T07
 */
import type { IBidReadinessViewState } from '../../types/index.js';

export type BidReadinessComplexityTier = 'Essential' | 'Standard' | 'Expert';
export type BidReadinessGovernanceAudience = 'canvas' | 'governance' | 'admin';

export interface IBidReadinessComplexityGatedView {
  readonly criteria: IBidReadinessViewState['criteria'];
  readonly recommendations: IBidReadinessViewState['summary']['recommendations'];
  readonly hiddenCriteriaCount: number;
  readonly hiddenRecommendationCount: number;
  readonly governanceFiltered: boolean;
}

/**
 * Applies deterministic complexity + governance gating to readiness outputs.
 *
 * @design D-SF18-T07
 */
export function gateBidReadinessByComplexity(params: {
  readonly viewState: IBidReadinessViewState | null;
  readonly complexity: BidReadinessComplexityTier;
  readonly audience?: BidReadinessGovernanceAudience;
}): IBidReadinessComplexityGatedView {
  const { viewState, complexity, audience = 'canvas' } = params;

  if (!viewState) {
    return {
      criteria: [],
      recommendations: [],
      hiddenCriteriaCount: 0,
      hiddenRecommendationCount: 0,
      governanceFiltered: false,
    };
  }

  const allCriteria = [...viewState.criteria];
  const allRecommendations = [...viewState.summary.recommendations];

  let visibleCriteria = allCriteria;
  let visibleRecommendations = allRecommendations;

  if (complexity === 'Essential') {
    visibleCriteria = [];
    visibleRecommendations = [];
  } else if (complexity === 'Standard') {
    visibleCriteria = allCriteria.filter((entry) => entry.criterion.isBlocker || !entry.isComplete);
    visibleRecommendations = allRecommendations.slice(0, 3);
  }

  const governanceFiltered = viewState.summary.governance.governanceState === 'draft' && audience !== 'admin';
  if (governanceFiltered) {
    visibleRecommendations = [];
  }

  return {
    criteria: visibleCriteria,
    recommendations: visibleRecommendations,
    hiddenCriteriaCount: allCriteria.length - visibleCriteria.length,
    hiddenRecommendationCount: allRecommendations.length - visibleRecommendations.length,
    governanceFiltered,
  };
}
