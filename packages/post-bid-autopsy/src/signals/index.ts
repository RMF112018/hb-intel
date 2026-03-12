export type PostBidLearningSignalStatus = 'approved' | 'published';

export type PostBidLearningOutcome = 'won' | 'lost' | 'no-bid';

export type PostBidLearningConfidenceTier =
  | 'high'
  | 'moderate'
  | 'low'
  | 'insufficient';

export type PostBidSignalSensitivityVisibility =
  | 'restricted'
  | 'internal'
  | 'public-summary';

export interface IPostBidLearningSignalBase {
  readonly signalId: string;
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly scorecardId: string;
  readonly status: PostBidLearningSignalStatus;
  readonly outcome: PostBidLearningOutcome;
  readonly confidenceTier: PostBidLearningConfidenceTier;
  readonly confidenceScore: number;
  readonly evidenceCoverage: number;
  readonly sensitivityVisibility: PostBidSignalSensitivityVisibility;
  readonly reasonCodes: readonly string[];
  readonly publishedAt: string;
}

export interface IBenchmarkDatasetEnrichmentSignal
  extends IPostBidLearningSignalBase {
  readonly signalType: 'benchmark-dataset-enrichment';
  readonly benchmarkDimensionKeys: readonly string[];
  readonly criterionImpacts: readonly {
    criterionId: string;
    impactDirection: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
}

export interface IRecalibrationInputSignal extends IPostBidLearningSignalBase {
  readonly signalType: 'recalibration-input';
  readonly correlationKeys: readonly string[];
  readonly recommendedWeightShift: number;
  readonly triggeredBy:
    | 'autopsy-pattern'
    | 'manual-review'
    | 'scheduled-monitor';
}

export interface IPredictiveDriftInputSignal
  extends IPostBidLearningSignalBase {
  readonly signalType: 'predictive-drift-input';
  readonly monitorWindowDays: number;
  readonly driftIndicators: readonly {
    metric: string;
    delta: number;
  }[];
}

export type PostBidLearningSignal =
  | IBenchmarkDatasetEnrichmentSignal
  | IRecalibrationInputSignal
  | IPredictiveDriftInputSignal;
