import type {
  BenchmarkRecommendationState,
  IFilterGovernanceEvent,
  IReviewerConsensus,
  IScoreGhostOverlayState,
} from '@hbc/score-benchmark';

export interface BdScoreBenchmarkViewModel {
  recommendationLabel: BenchmarkRecommendationState;
  confidenceTierLabel: IScoreGhostOverlayState['recommendation']['derivedFrom']['confidenceTier'];
  explainabilitySummary: string;
  version: IScoreGhostOverlayState['version'];
  syncStatus: IScoreGhostOverlayState['syncStatus'];
  filterGovernanceEvents: IFilterGovernanceEvent[];
}

export interface ReviewerConsensusSummary {
  consensusLabel: string;
  disagreementCount: number;
  escalationRecommended: boolean;
}

export const mapScoreBenchmarkSnapshotToBdView = (
  overlay: IScoreGhostOverlayState
): BdScoreBenchmarkViewModel => ({
  recommendationLabel: overlay.recommendation.state,
  confidenceTierLabel: overlay.recommendation.derivedFrom.confidenceTier,
  explainabilitySummary: overlay.benchmarks[0]?.explainability.narrative ?? '',
  version: overlay.version,
  syncStatus: overlay.syncStatus,
  filterGovernanceEvents: overlay.filterGovernanceEvents,
});

export const createReviewerConsensusSummary = (
  consensus: IReviewerConsensus
): ReviewerConsensusSummary => ({
  consensusLabel: consensus.consensusStrength >= 0.75 ? 'Aligned' : 'Divergent',
  disagreementCount: consensus.largestDisagreements.length,
  escalationRecommended: consensus.escalationRecommended,
});
