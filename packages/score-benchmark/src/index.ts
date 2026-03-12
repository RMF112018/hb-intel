export type {
  BenchmarkConfidenceTier,
  SimilarityStrengthBand,
  BenchmarkRecommendationState,
  SimilarityFactor,
  ReviewerRole,
  BenchmarkExplainabilityReasonCode,
  IBenchmarkConfidence,
  ISimilarityFactorContribution,
  ISimilarityModelResult,
  IBenchmarkRecommendation,
  IReviewerConsensus,
  IBenchmarkExplainability,
  IBenchmarkFilterContext,
  IFilterGovernanceEvent,
  IScorecardBenchmark,
  IRecalibrationSignal,
  IScoreBenchmarkTelemetryState,
  IScoreGhostOverlayState,
  ScoreBenchmarkOutcome,
  IScoreBenchmarkMutation,
  INoBidRationalePayload,
  INoBidRationaleRecord,
  IScoreBenchmarkOverallSummary,
  IBicOwnershipProjection,
  IScoreBenchmarkOverlayResponse,
  IRecomputeResult,
  IPredictiveDriftMonitorWindow,
  IPredictiveDriftMonitorResult,
  ISnapshotFreezeResult,
  IScoreBenchmarkApiState,
} from './types/index.js';

export {
  BENCHMARK_MIN_SAMPLE_SIZE,
  BENCHMARK_STALE_MS,
  BENCHMARK_SYNC_QUEUE_KEY,
  BENCHMARK_STATUS_BANDS,
  BENCHMARK_GOVERNANCE_WARNING_DELTA,
} from './constants/index.js';

// T01 compatibility exports
export type {
  ScoreBenchmarkRecommendationState,
  ScoreBenchmarkItem,
  ConfidenceAssessment,
  SimilarityAssessment,
  RecommendationAssessment,
  GovernanceAssessment,
  RecalibrationAssessment,
  ExplainabilityAssessment,
  ScoreBenchmarkPrimitiveSnapshot,
  ScoreBenchmarkProfile,
} from './types/index.js';

export {
  assessBenchmarkConfidence,
  assessSimilarity,
  deriveRecommendationState,
  evaluateFilterGovernance,
  createRecalibrationAssessment,
  buildExplainability,
} from './model/index.js';

export { createScoreBenchmarkSnapshot } from './api/index.js';
export type { ScoreBenchmarkRuntimeInput } from './api/index.js';
export { ScoreBenchmarkApi, ScoreBenchmarkLifecycleApi } from './api/index.js';

export { useScoreBenchmarkSnapshot } from './hooks/index.js';
export type { UseScoreBenchmarkSnapshotInput } from './hooks/index.js';

export { createScoreBenchmarkPanelModel } from './components/index.js';
export type { ScoreBenchmarkPanelModel } from './components/index.js';
