import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';

export interface IScoreBenchmarkLearningSignalProjection {
  consumedCount: number;
  enrichmentCount: number;
  recalibrationCount: number;
  driftCount: number;
  signalIds: string[];
}

export const projectSf22LearningSignals = (
  signals: readonly PostBidLearningSignal[]
): IScoreBenchmarkLearningSignalProjection => {
  let enrichmentCount = 0;
  let recalibrationCount = 0;
  let driftCount = 0;

  for (const signal of signals) {
    if (signal.signalType === 'benchmark-dataset-enrichment') {
      enrichmentCount += 1;
    } else if (signal.signalType === 'recalibration-input') {
      recalibrationCount += 1;
    } else {
      driftCount += 1;
    }
  }

  return {
    consumedCount: signals.length,
    enrichmentCount,
    recalibrationCount,
    driftCount,
    signalIds: signals.map((signal) => signal.signalId),
  };
};
