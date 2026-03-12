import type { IVersionMetadata } from '@hbc/versioned-record';
import type { IBicOwner as BicOwner } from '@hbc/bic-next-move';

export type BenchmarkConfidenceTier = 'high' | 'moderate' | 'low' | 'insufficient';

export type SimilarityStrengthBand = 'highly-similar' | 'moderately-similar' | 'loosely-similar';

export type BenchmarkRecommendationState =
  | 'pursue'
  | 'pursue-with-caution'
  | 'hold-for-review'
  | 'no-bid-recommended';

export type SimilarityFactor =
  | 'projectType'
  | 'deliveryMethod'
  | 'procurementType'
  | 'valueRange'
  | 'geography'
  | 'ownerType'
  | 'incumbentRelationship'
  | 'competitorCount'
  | 'scheduleComplexity';

export type ReviewerRole =
  | 'business-development'
  | 'estimating'
  | 'operations'
  | 'executive';

export type BenchmarkExplainabilityReasonCode =
  | 'below-historical-win-average'
  | 'outside-predictive-band'
  | 'weak-benchmark-confidence'
  | 'owner-type-mismatch'
  | 'loss-risk-zone-overlap';

export interface IBenchmarkConfidence {
  tier: BenchmarkConfidenceTier;
  sampleSizeScore: number;
  similarityScore: number;
  recencyScore: number;
  completenessScore: number;
  reasons: string[];
  caution: boolean;
}

export interface ISimilarityFactorContribution {
  factor: SimilarityFactor;
  weight: number;
  matchScore: number;
}

export interface ISimilarityModelResult {
  overallSimilarity: number;
  strengthBand: SimilarityStrengthBand;
  factorBreakdown: ISimilarityFactorContribution[];
  mostSimilarPursuits: Array<{
    pursuitId: string;
    pursuitLabel: string;
    similarity: number;
    outcome: 'won' | 'lost' | 'no-bid';
    closedAt: string;
  }>;
}

export interface IBenchmarkRecommendation {
  state: BenchmarkRecommendationState;
  rationaleCodes: string[];
  derivedFrom: {
    distanceToWinZone: number | null;
    lossRiskOverlap: boolean;
    confidenceTier: BenchmarkConfidenceTier;
    similarity: number;
    consensusStrength: number;
  };
  overriddenByReviewer?: {
    reviewerId: string;
    reason: string;
    overriddenAt: string;
  };
}

export interface IReviewerConsensus {
  variance: number;
  consensusStrength: number;
  largestDisagreements: Array<{
    criterionId: string;
    spread: number;
  }>;
  roleComparisons: Array<{
    role: ReviewerRole;
    avgScore: number;
  }>;
  escalationRecommended: boolean;
}

export interface IBenchmarkExplainability {
  criterionId: string;
  reasonCodes: BenchmarkExplainabilityReasonCode[];
  narrative: string;
  relatedHistoricalExamples: Array<{
    pursuitId: string;
    label: string;
  }>;
}

export interface IBenchmarkFilterContext {
  projectType?: string;
  deliveryMethod?: string;
  procurementType?: string;
  valueRange?: [number, number];
  geography?: string;
  ownerType?: string;
  incumbentRelationship?: 'incumbent' | 'new-client' | 'unknown';
  competitorCount?: number;
  scheduleComplexity?: 'low' | 'moderate' | 'high';
  cohortPolicy?: {
    defaultLocked: boolean;
    approvedCohortId?: string;
    auditRequired: boolean;
  };
}

export interface IFilterGovernanceEvent {
  eventType: 'filter-change' | 'cohort-reset' | 'cohort-override';
  actorUserId: string;
  fromContext: IBenchmarkFilterContext;
  toContext: IBenchmarkFilterContext;
  deltaImpact: {
    sampleSizeDeltaPct: number;
    similarityDeltaPct: number;
    winRateDeltaPct: number;
  };
  warningTriggered: boolean;
  approvedCohortId?: string;
  recordedAt: string;
}

export interface IScorecardBenchmark {
  criterionId: string;
  criterionLabel: string;
  winAvg: number | null;
  lossAvg: number | null;
  winZoneMin: number | null;
  winZoneMax: number | null;
  lossRiskZoneMin: number | null;
  lossRiskZoneMax: number | null;
  sampleSize: number;
  isStatisticallySignificant: boolean;
  confidence: IBenchmarkConfidence;
  similarity: ISimilarityModelResult;
  explainability: IBenchmarkExplainability;
  ownerBicId?: string;
  ownerAvatarUrl?: string;
}

export interface IRecalibrationSignal {
  signalId: string;
  criterionId?: string;
  predictiveDrift: number;
  triggeredBy: 'sf22-outcome' | 'scheduled-monitor' | 'admin-request';
  correlationKeys: string[];
  triggeredAt: string;
}

export interface IScoreBenchmarkTelemetryState {
  timeToGoNoGoMs: number | null;
  gapClosureLatencyMs: number | null;
  pctScorecardsReachingWinZone: number | null;
  winRateCorrelationLift: number | null;
  benchmarkCes: number | null;
  benchmarkConsultationRate: number | null;
  decisionReversalRate: number | null;
  confidenceToOutcomeCorrelation: number | null;
  filterAdjustmentFrequency: number | null;
  predictiveAccuracyByCriterion: number | null;
  recommendationOverrideRate: number | null;
  noBidRationaleCompletionRate: number | null;
}

export interface IScoreGhostOverlayState {
  benchmarks: IScorecardBenchmark[];
  overallWinAvg: number | null;
  overallLossAvg: number | null;
  overallWinZoneMin: number | null;
  overallWinZoneMax: number | null;
  distanceToWinZone: number | null;
  lossRiskOverlap: boolean;
  filterContext: IBenchmarkFilterContext;
  recommendation: IBenchmarkRecommendation;
  consensus: IReviewerConsensus;
  filterGovernanceEvents: IFilterGovernanceEvent[];
  recalibrationSignals: IRecalibrationSignal[];
  benchmarkGeneratedAt: string;
  version: IVersionMetadata;
  telemetry: IScoreBenchmarkTelemetryState;
  syncStatus: 'synced' | 'saved-locally' | 'queued-to-sync';
}

export type ScoreBenchmarkOutcome = 'won' | 'lost' | 'no-bid';

export interface IScoreBenchmarkMutation {
  mutationId: string;
  mutationType:
    | 'recompute-request'
    | 'filter-context-change'
    | 'governance-event'
    | 'no-bid-rationale'
    | 'recommendation-override';
  entityId?: string;
  payload: Record<string, unknown>;
  queuedAt: string;
  replaySafe: boolean;
}

export interface INoBidRationalePayload {
  artifactId: string;
  rationale: string;
  citations: string[];
  approvedAt: string;
}

export interface INoBidRationaleRecord {
  entityId: string;
  payload: INoBidRationalePayload;
  approvedBy: string;
  savedAt: string;
}

export interface IScoreBenchmarkOverallSummary {
  criterionCount: number;
  overallWinAvg: number | null;
  overallLossAvg: number | null;
  winZoneMin: number | null;
  winZoneMax: number | null;
  lossRiskZoneMin: number | null;
  lossRiskZoneMax: number | null;
  overlap: boolean;
}

export interface IBicOwnershipProjection {
  criterionId: string;
  criterionLabel: string;
  owner: BicOwner | null;
  distanceToWinZone: number;
}

export interface IScoreBenchmarkOverlayResponse {
  state: IScoreGhostOverlayState;
  bicOwnershipProjections: IBicOwnershipProjection[];
}

export interface IRecomputeResult {
  jobType: 'scheduled' | 'on-demand';
  processedEntities: number;
  updatedBenchmarks: number;
  emittedSignals: number;
  computedAt: string;
}

export interface IPredictiveDriftMonitorWindow {
  fromIso: string;
  toIso: string;
  driftThreshold: number;
}

export interface IPredictiveDriftMonitorResult {
  window: IPredictiveDriftMonitorWindow;
  emittedSignals: IRecalibrationSignal[];
}

export interface ISnapshotFreezeResult {
  entityId: string;
  snapshotReason: string;
  frozenAt: string;
  version: IVersionMetadata;
}

export interface IScoreBenchmarkApiState {
  overlays: IScoreGhostOverlayState[];
  criterionBenchmarks: IScorecardBenchmark[];
  approvedCohorts: string[];
}

export type ScoreBenchmarkSyncBadge = 'Synced' | 'Saved locally' | 'Queued to sync';

export type ScoreBenchmarkLoadStatus = 'loading' | 'success' | 'error';

export type ScoreBenchmarkPanelId =
  | 'similar-pursuits'
  | 'explainability'
  | 'reviewer-consensus';

export interface IScoreBenchmarkReviewerContext {
  reviewerId: string;
  role: ReviewerRole;
}

export interface IScoreBenchmarkPanelContext {
  panel: ScoreBenchmarkPanelId | null;
  pursuitId?: string;
  criterionId?: string;
}

export interface IScoreBenchmarkStateInput {
  entityId: string;
  filterContext: IBenchmarkFilterContext;
  reviewerContext: IScoreBenchmarkReviewerContext;
}

export interface IScoreBenchmarkStateResult {
  cacheKey: readonly ['score-benchmark', string, IBenchmarkFilterContext, IScoreBenchmarkReviewerContext];
  status: ScoreBenchmarkLoadStatus;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  overlay: IScoreGhostOverlayState | null;
  bicOwnershipProjections: IBicOwnershipProjection[];
  normalizedDistanceToWinZone: number | null;
  hasLossRiskOverlap: boolean;
  governanceWarning: {
    triggered: boolean;
    message: string | null;
  };
  stale: {
    isStale: boolean;
    staleMs: number;
  };
  sync: {
    status: IScoreGhostOverlayState['syncStatus'];
    badgeLabel: ScoreBenchmarkSyncBadge;
    queuedCount: number;
    lastReplayedAt: string | null;
  };
  actions: {
    refresh: () => IScoreBenchmarkStateResult;
    replayQueuedMutations: () => IScoreBenchmarkStateResult;
    queueLocalMutation: (
      mutationType: IScoreBenchmarkMutation['mutationType'],
      payload: Record<string, unknown>
    ) => IScoreBenchmarkStateResult;
  };
}

export interface IScoreBenchmarkFiltersInput {
  entityId: string;
  actorUserId: string;
  reviewerContext: IScoreBenchmarkReviewerContext;
  initialContext?: IBenchmarkFilterContext;
  approvedCohorts?: readonly string[];
  defaultCohortId?: string;
}

export interface IScoreBenchmarkFiltersResult {
  cacheKey: readonly ['score-benchmark', 'filters', string];
  filterContext: IBenchmarkFilterContext;
  invalidatedQueryKeys: ReadonlyArray<readonly unknown[]>;
  applyFilterContext: (nextContext: IBenchmarkFilterContext) => IScoreBenchmarkFiltersResult;
  resetToDefaultCohort: () => IScoreBenchmarkFiltersResult;
}

export interface IScoreBenchmarkDecisionSupportInput {
  entityId: string;
  filterContext: IBenchmarkFilterContext;
  reviewerContext: IScoreBenchmarkReviewerContext;
  urlSearch?: string;
}

export interface IScoreBenchmarkDecisionSupportResult {
  baseState: IScoreBenchmarkStateResult;
  confidenceReasons: string[];
  recommendationRationale: string[];
  noBidRationaleDraft: string;
  mostSimilarPursuits: ISimilarityModelResult['mostSimilarPursuits'];
  explainability: IBenchmarkExplainability[];
  recalibrationSummaries: IRecalibrationSignal[];
  panelContext: IScoreBenchmarkPanelContext;
  panelHydration: {
    baseHydrated: boolean;
    detailHydrated: boolean;
  };
  actions: {
    setNoBidRationaleDraft: (value: string) => void;
    queueRecommendationOverride: (reason: string) => IScoreBenchmarkStateResult;
    queueNoBidRationaleSave: (approvedBy: string) => INoBidRationaleRecord;
    openPanel: (
      panel: ScoreBenchmarkPanelId,
      meta?: {
        pursuitId?: string;
        criterionId?: string;
      }
    ) => string;
    closePanel: () => string;
  };
}

// T01 compatibility contracts retained for scaffold consumers.
export type ScoreBenchmarkRecommendationState =
  | 'Pursue'
  | 'Pursue with Caution'
  | 'Hold for Review'
  | 'No-Bid Recommended';

export interface ScoreBenchmarkItem {
  id: string;
  label: string;
  score: number;
}

export interface ConfidenceAssessment {
  tier: BenchmarkConfidenceTier;
  reasons: readonly string[];
  sampleSize: number;
}

export interface SimilarityAssessment {
  score: number;
  band: SimilarityStrengthBand;
  comparablePursuitCount: number;
}

export interface RecommendationAssessment {
  state: ScoreBenchmarkRecommendationState;
  rationale: readonly string[];
}

export interface GovernanceAssessment {
  defaultCohortLocked: boolean;
  approvedCohortApplied: boolean;
  filterChangeLogged: boolean;
  warningTriggered: boolean;
}

export interface RecalibrationAssessment {
  predictiveValue: number;
  reviewedAtIso: string;
  telemetryWindow: string;
}

export interface ExplainabilityAssessment {
  summary: string;
  reasonCodes: readonly string[];
}

export interface ScoreBenchmarkPrimitiveSnapshot {
  confidence: ConfidenceAssessment;
  similarity: SimilarityAssessment;
  recommendation: RecommendationAssessment;
  governance: GovernanceAssessment;
  recalibration: RecalibrationAssessment;
  explainability: ExplainabilityAssessment;
}

export interface ScoreBenchmarkProfile {
  profileId: string;
  recommendationCutoffs: {
    pursue: number;
    pursueWithCaution: number;
    holdForReview: number;
  };
  governancePolicy: {
    approvedCohorts: readonly string[];
    warningDeltaThreshold: number;
  };
}
