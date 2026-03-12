import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import type { IRecalibrationSignal } from '../../types/index.js';
import type { RecalibrationAssessment } from '../../types/index.js';

export interface RecalibrationInput {
  predictiveValue: number;
  reviewedAtIso: string;
  telemetryWindow: string;
}

export const createRecalibrationAssessment = (
  input: RecalibrationInput
): RecalibrationAssessment => ({
  predictiveValue: input.predictiveValue,
  reviewedAtIso: input.reviewedAtIso,
  telemetryWindow: input.telemetryWindow,
});

export const mapPostBidLearningSignalToRecalibrationSignal = (
  signal: PostBidLearningSignal
): IRecalibrationSignal => {
  const correlationKeys =
    signal.signalType === 'recalibration-input'
      ? [...signal.correlationKeys]
      : signal.signalType === 'benchmark-dataset-enrichment'
        ? signal.benchmarkDimensionKeys.map((key) => `dimension:${key}`)
        : signal.driftIndicators.map((item) => `drift:${item.metric}`);

  const criterionId =
    signal.signalType === 'benchmark-dataset-enrichment'
      ? signal.criterionImpacts[0]?.criterionId
      : undefined;

  const predictiveDrift =
    signal.signalType === 'predictive-drift-input'
      ? signal.driftIndicators.reduce((max, item) => Math.max(max, Math.abs(item.delta)), 0)
      : signal.signalType === 'recalibration-input'
        ? Math.abs(signal.recommendedWeightShift)
        : 0;

  return {
    signalId: signal.signalId,
    criterionId,
    predictiveDrift,
    triggeredBy: 'sf22-outcome',
    correlationKeys,
    triggeredAt: signal.publishedAt,
  };
};
