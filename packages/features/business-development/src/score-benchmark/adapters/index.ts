import type { ScoreBenchmarkPrimitiveSnapshot } from '@hbc/score-benchmark';

export interface BdScoreBenchmarkViewModel {
  recommendationLabel: string;
  confidenceTierLabel: string;
  explainabilitySummary: string;
}

export interface ReviewerConsensusSummary {
  consensusLabel: string;
  disagreementCount: number;
}

export const mapScoreBenchmarkSnapshotToBdView = (
  snapshot: ScoreBenchmarkPrimitiveSnapshot
): BdScoreBenchmarkViewModel => ({
  recommendationLabel: snapshot.recommendation.state,
  confidenceTierLabel: snapshot.confidence.tier,
  explainabilitySummary: snapshot.explainability.summary,
});

export const createReviewerConsensusSummary = (
  disagreementCount: number
): ReviewerConsensusSummary => ({
  consensusLabel:
    disagreementCount === 0 ? 'Aligned' : disagreementCount <= 2 ? 'Partial Alignment' : 'Divergent',
  disagreementCount,
});
