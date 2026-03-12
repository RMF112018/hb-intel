import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import type { IStrategicIntelligenceState } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceLearningSignalProjection {
  consumedCount: number;
  approvedSignalCount: number;
  signalIds: string[];
}

const buildSignal = (
  state: IStrategicIntelligenceState,
  entryId: string,
  index: number
): PostBidLearningSignal => ({
  signalType: 'benchmark-dataset-enrichment',
  signalId: `${state.heritageSnapshot.scorecardId}-sf22-${index + 1}`,
  autopsyId: `${state.heritageSnapshot.scorecardId}-autopsy`,
  pursuitId: `${state.heritageSnapshot.scorecardId}-pursuit`,
  scorecardId: state.heritageSnapshot.scorecardId,
  status: 'published',
  outcome: 'won',
  confidenceTier: 'moderate',
  confidenceScore: 0.7,
  evidenceCoverage: 0.75,
  sensitivityVisibility: 'internal',
  reasonCodes: ['below-historical-win-average'],
  publishedAt: state.heritageSnapshot.capturedAt,
  benchmarkDimensionKeys: [entryId],
  criterionImpacts: [
    {
      criterionId: entryId,
      impactDirection: 'positive',
      weight: 0.1,
    },
  ],
});

export const projectStrategicIntelligenceToPostBidLearning = (
  state: IStrategicIntelligenceState
): IStrategicIntelligenceLearningSignalProjection => {
  const approvedEntries = state.livingEntries.filter((entry) => entry.lifecycleState === 'approved');
  const signals = approvedEntries.map((entry, index) => buildSignal(state, entry.entryId, index));

  return {
    consumedCount: signals.length,
    approvedSignalCount: signals.length,
    signalIds: signals.map((signal) => signal.signalId),
  };
};
