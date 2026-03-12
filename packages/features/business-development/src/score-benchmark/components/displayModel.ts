import {
  BENCHMARK_MIN_SAMPLE_SIZE,
  type BenchmarkRecommendationState,
  type BenchmarkConfidenceTier,
  type IScoreGhostOverlayState,
  type IScorecardBenchmark,
  type IBicOwnershipProjection,
  type SimilarityStrengthBand,
} from '@hbc/score-benchmark';

export type ScoreBenchmarkComplexityMode = 'Essential' | 'Standard' | 'Expert';

export interface IComplexityFlags {
  readonly isEssential: boolean;
  readonly isStandard: boolean;
  readonly isExpert: boolean;
}

export const getComplexityFlags = (mode: ScoreBenchmarkComplexityMode): IComplexityFlags => ({
  isEssential: mode === 'Essential',
  isStandard: mode === 'Standard',
  isExpert: mode === 'Expert',
});

export const recommendationLabelMap: Record<BenchmarkRecommendationState, string> = {
  pursue: 'Pursue',
  'pursue-with-caution': 'Pursue with Caution',
  'hold-for-review': 'Hold for Review',
  'no-bid-recommended': 'No-Bid Recommended',
};

export const confidenceLabelMap: Record<BenchmarkConfidenceTier, string> = {
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
  insufficient: 'Insufficient Data',
};

export const similarityLabelMap: Record<SimilarityStrengthBand, string> = {
  'highly-similar': 'highly similar',
  'moderately-similar': 'moderately similar',
  'loosely-similar': 'loosely similar',
};

export const getCriterionCurrentScore = (
  benchmark: IScorecardBenchmark,
  criterionScores?: Readonly<Record<string, number>>
): number | null => {
  if (criterionScores && benchmark.criterionId in criterionScores) {
    return criterionScores[benchmark.criterionId] ?? null;
  }

  return benchmark.winAvg;
};

export const getInsufficientDataGap = (sampleSize: number): number =>
  Math.max(0, BENCHMARK_MIN_SAMPLE_SIZE - sampleSize);

export const getSimilaritySummary = (overlay: IScoreGhostOverlayState): string => {
  const values = overlay.benchmarks.map((item) => item.similarity.overallSimilarity);
  if (values.length === 0) {
    return 'No similarity context available';
  }

  const average = values.reduce((sum, item) => sum + item, 0) / values.length;
  return `Similarity context ${(average * 100).toFixed(0)}% across ${values.length} criteria`;
};

export const getSampleSummary = (overlay: IScoreGhostOverlayState): string => {
  const total = overlay.benchmarks.reduce((sum, item) => sum + item.sampleSize, 0);
  return `Sample context ${total} records`;
};

export const getSyncBadge = (
  syncStatus: IScoreGhostOverlayState['syncStatus']
): 'Saved locally' | 'Queued to sync' | null => {
  if (syncStatus === 'saved-locally') {
    return 'Saved locally';
  }

  if (syncStatus === 'queued-to-sync') {
    return 'Queued to sync';
  }

  return null;
};

export const getOwnershipProjection = (
  projections: readonly IBicOwnershipProjection[],
  criterionId: string
): IBicOwnershipProjection | null =>
  projections.find((entry) => entry.criterionId === criterionId) ?? null;

export const getCriterionTooltipCopy = (args: {
  benchmark: IScorecardBenchmark;
  criterionScore: number | null;
  overlap: boolean;
  ownership: IBicOwnershipProjection | null;
}): string => {
  if (args.benchmark.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE) {
    const gap = getInsufficientDataGap(args.benchmark.sampleSize);
    return `Insufficient data: ${gap} more record(s) needed to reach threshold.`;
  }

  if (args.overlap) {
    return 'Ambiguous benchmark overlap - review confidence and consensus';
  }

  const entry = args.benchmark.winZoneMin;
  if (entry !== null && args.criterionScore !== null && args.criterionScore >= entry) {
    return 'In Win Zone';
  }

  if (entry !== null && args.criterionScore !== null) {
    const delta = Math.max(0, entry - args.criterionScore);
    const owner = args.ownership?.owner?.displayName ?? 'Unassigned owner';
    return `${delta.toFixed(1)} points below win-zone entry. Owner: ${owner}.`; 
  }

  return 'Benchmark context available';
};
