import type { IBicOwner } from '@hbc/bic-next-move';
import type {
  RecommendationSignal,
} from '@hbc/project-canvas';
import type { ComplexityTier } from '@hbc/complexity';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import type {
  BenchmarkRecommendationState,
  IBenchmarkExplainability,
  IFilterGovernanceEvent,
  IReviewerConsensus,
  IScoreBenchmarkDecisionSupportResult,
  IScoreBenchmarkStateResult,
  IScoreGhostOverlayState,
} from '@hbc/score-benchmark';
import {
  createScoreBenchmarkReferenceIntegrations,
  type IBdBicOwnershipAction,
  type IHbiActionProjection,
  type IScoreBenchmarkCanvasPlacement,
  type IScoreBenchmarkComplexityProjection,
  type IScoreBenchmarkHealthProjection,
  type IScoreBenchmarkLearningSignalProjection,
  type IScoreBenchmarkRelatedItemsProjection,
  type IScoreBenchmarkVersionedProjection,
  type IBdScoreBenchmarkNotificationProjection,
} from '../integrations/index.js';

export interface BdScoreBenchmarkViewModel {
  recommendationLabel: BenchmarkRecommendationState;
  recommendationCopy: string;
  confidenceTierLabel: IScoreGhostOverlayState['recommendation']['derivedFrom']['confidenceTier'];
  explainabilitySummary: string;
  version: IScoreGhostOverlayState['version'];
  syncStatus: IScoreGhostOverlayState['syncStatus'];
  syncBadgeLabel: IScoreBenchmarkStateResult['sync']['badgeLabel'];
  filterGovernanceEvents: IFilterGovernanceEvent[];
  governanceWarning: IScoreBenchmarkStateResult['governanceWarning'];
}

export interface ReviewerConsensusSummary {
  consensusLabel: string;
  disagreementCount: number;
  escalationRecommended: boolean;
}

export interface BdPanelRouteProjection {
  similarPursuitsHref: string;
  explainabilityHref: string;
  reviewerConsensusHref: string;
}

export interface BdMyWorkPlacementProjection {
  tileKey: 'bic-my-items';
  recommendationSignal: RecommendationSignal;
  routeHref: string;
  ownershipAvatars: Array<{
    criterionId: string;
    owner: IBicOwner | null;
  }>;
}

export interface BdReferenceIntegrationProjection {
  bicActions: IBdBicOwnershipAction[];
  complexity: IScoreBenchmarkComplexityProjection;
  versioned: IScoreBenchmarkVersionedProjection;
  relatedItems: IScoreBenchmarkRelatedItemsProjection;
  canvas: IScoreBenchmarkCanvasPlacement;
  notifications: IBdScoreBenchmarkNotificationProjection[];
  health: IScoreBenchmarkHealthProjection;
  hbiActions: IHbiActionProjection[];
  learningSignals: IScoreBenchmarkLearningSignalProjection;
}

const recommendationCopyByState: Record<BenchmarkRecommendationState, string> = {
  pursue: 'Historical benchmark alignment indicates this pursuit is in a pursue range.',
  'pursue-with-caution': 'Proceed with caution; benchmark overlap indicates elevated loss risk.',
  'hold-for-review': 'Hold for review until benchmark confidence and consensus improve.',
  'no-bid-recommended': 'No-bid is recommended; rationale and approval are required for finalization.',
};

export const mapScoreBenchmarkSnapshotToBdView = (
  overlay: IScoreGhostOverlayState,
  state: IScoreBenchmarkStateResult
): BdScoreBenchmarkViewModel => ({
  recommendationLabel: overlay.recommendation.state,
  recommendationCopy: recommendationCopyByState[overlay.recommendation.state],
  confidenceTierLabel: overlay.recommendation.derivedFrom.confidenceTier,
  explainabilitySummary: overlay.benchmarks[0]?.explainability.narrative ?? '',
  version: overlay.version,
  syncStatus: overlay.syncStatus,
  syncBadgeLabel: state.sync.badgeLabel,
  filterGovernanceEvents: overlay.filterGovernanceEvents,
  governanceWarning: state.governanceWarning,
});

export const createReviewerConsensusSummary = (
  consensus: IReviewerConsensus
): ReviewerConsensusSummary => ({
  consensusLabel: consensus.consensusStrength >= 0.75 ? 'Aligned' : 'Divergent',
  disagreementCount: consensus.largestDisagreements.length,
  escalationRecommended: consensus.escalationRecommended,
});

export const mapDecisionSupportToPanelRoutes = (
  decisionSupport: IScoreBenchmarkDecisionSupportResult,
  basePath: string
): BdPanelRouteProjection => ({
  similarPursuitsHref: `${basePath}${decisionSupport.actions.openPanel('similar-pursuits')}`,
  explainabilityHref: `${basePath}${decisionSupport.actions.openPanel('explainability')}`,
  reviewerConsensusHref: `${basePath}${decisionSupport.actions.openPanel('reviewer-consensus')}`,
});

export const mapStateToMyWorkPlacement = (
  state: IScoreBenchmarkStateResult,
  routeHref: string
): BdMyWorkPlacementProjection => ({
  tileKey: 'bic-my-items',
  recommendationSignal: 'usage-history',
  routeHref,
  ownershipAvatars: state.bicOwnershipProjections.map((projection) => ({
    criterionId: projection.criterionId,
    owner: projection.owner,
  })),
});

export interface MapScoreBenchmarkIntegrationsInput {
  overlay: IScoreGhostOverlayState;
  state: IScoreBenchmarkStateResult;
  decisionSupport: IScoreBenchmarkDecisionSupportResult;
  basePath: string;
  complexityTier: ComplexityTier;
  learningSignals?: readonly PostBidLearningSignal[];
}

export const mapScoreBenchmarkReferenceIntegrations = (
  input: MapScoreBenchmarkIntegrationsInput
): BdReferenceIntegrationProjection => {
  const integrations = createScoreBenchmarkReferenceIntegrations();
  const explainability: IBenchmarkExplainability[] = input.overlay.benchmarks.map((benchmark) => benchmark.explainability);

  return {
    bicActions: integrations.projectToBicActions(input.state, explainability),
    complexity: integrations.applyComplexityGating(input.complexityTier, input.state),
    versioned: integrations.createVersionedProjection(input.overlay),
    relatedItems: integrations.projectRelatedItems(input.overlay, input.decisionSupport, input.basePath),
    canvas: integrations.projectCanvasPlacement(input.state, input.basePath),
    notifications: integrations.resolveNotifications(input.overlay, input.overlay.consensus),
    health: integrations.mapToHealthIndicator(input.overlay),
    hbiActions: integrations.projectHbiActions(input.overlay),
    learningSignals: integrations.consumeLearningSignals(input.learningSignals ?? []),
  };
};
