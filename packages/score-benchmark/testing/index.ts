import type {
  IBenchmarkConfidence,
  IBenchmarkFilterContext,
  IBenchmarkRecommendation,
  IFilterGovernanceEvent,
  IReviewerConsensus,
  IScorecardBenchmark,
  IScoreGhostOverlayState,
  ISimilarityModelResult,
} from '../src/types/index.js';

const DEFAULT_ISO = '2026-03-12T00:00:00.000Z';

const mergeObject = <T extends object>(base: T, overrides?: Partial<T>): T =>
  ({ ...base, ...(overrides ?? {}) }) as T;

export const createMockBenchmarkConfidence = (
  overrides?: Partial<IBenchmarkConfidence>
): IBenchmarkConfidence =>
  mergeObject(
    {
      tier: 'high',
      sampleSizeScore: 0.9,
      similarityScore: 0.88,
      recencyScore: 0.85,
      completenessScore: 0.92,
      reasons: ['benchmark-confidence-high'],
      caution: false,
    },
    overrides
  );

export const createMockSimilarityResult = (
  overrides?: Partial<ISimilarityModelResult>
): ISimilarityModelResult =>
  mergeObject(
    {
      overallSimilarity: 0.82,
      strengthBand: 'highly-similar',
      factorBreakdown: [
        { factor: 'projectType', weight: 0.2, matchScore: 0.9 },
        { factor: 'deliveryMethod', weight: 0.1, matchScore: 0.85 },
        { factor: 'procurementType', weight: 0.1, matchScore: 0.8 },
        { factor: 'valueRange', weight: 0.1, matchScore: 0.84 },
        { factor: 'geography', weight: 0.1, matchScore: 0.83 },
        { factor: 'ownerType', weight: 0.1, matchScore: 0.82 },
        { factor: 'incumbentRelationship', weight: 0.1, matchScore: 0.8 },
        { factor: 'competitorCount', weight: 0.1, matchScore: 0.77 },
        { factor: 'scheduleComplexity', weight: 0.1, matchScore: 0.75 },
      ],
      mostSimilarPursuits: [
        {
          pursuitId: 'pursuit-1',
          pursuitLabel: 'Regional Office Retrofit',
          similarity: 0.82,
          outcome: 'won',
          closedAt: DEFAULT_ISO,
        },
      ],
    },
    overrides
  );

export const createMockBenchmarkRecommendation = (
  overrides?: Partial<IBenchmarkRecommendation>
): IBenchmarkRecommendation =>
  mergeObject(
    {
      state: 'pursue',
      rationaleCodes: ['distance-to-win-zone', 'no-loss-risk-overlap', 'confidence-high'],
      derivedFrom: {
        distanceToWinZone: 0,
        lossRiskOverlap: false,
        confidenceTier: 'high',
        similarity: 0.82,
        consensusStrength: 0.79,
      },
    },
    overrides
  );

export const createMockReviewerConsensus = (
  overrides?: Partial<IReviewerConsensus>
): IReviewerConsensus =>
  mergeObject(
    {
      variance: 0.14,
      consensusStrength: 0.79,
      largestDisagreements: [
        {
          criterionId: 'criterion-1',
          spread: 4,
        },
      ],
      roleComparisons: [
        {
          role: 'business-development',
          avgScore: 78,
        },
        {
          role: 'estimating',
          avgScore: 76,
        },
      ],
      escalationRecommended: false,
    },
    overrides
  );

export const createMockBenchmarkFilterContext = (
  overrides?: Partial<IBenchmarkFilterContext>
): IBenchmarkFilterContext =>
  mergeObject(
    {
      projectType: 'commercial-office',
      deliveryMethod: 'design-build',
      procurementType: 'negotiated',
      valueRange: [5_000_000, 25_000_000],
      geography: 'Southeast',
      ownerType: 'private',
      incumbentRelationship: 'new-client',
      competitorCount: 3,
      scheduleComplexity: 'moderate',
      cohortPolicy: {
        defaultLocked: true,
        approvedCohortId: 'default',
        auditRequired: true,
      },
    },
    overrides
  );

export const createMockFilterGovernanceEvent = (
  overrides?: Partial<IFilterGovernanceEvent>
): IFilterGovernanceEvent =>
  mergeObject(
    {
      eventType: 'filter-change',
      actorUserId: 'user-1',
      fromContext: createMockBenchmarkFilterContext(),
      toContext: createMockBenchmarkFilterContext({ geography: 'Midwest' }),
      deltaImpact: {
        sampleSizeDeltaPct: 0.1,
        similarityDeltaPct: 0.07,
        winRateDeltaPct: 0.04,
      },
      warningTriggered: false,
      approvedCohortId: 'default',
      recordedAt: DEFAULT_ISO,
    },
    overrides
  );

export const createMockScorecardBenchmark = (
  overrides?: Partial<IScorecardBenchmark>
): IScorecardBenchmark =>
  mergeObject(
    {
      criterionId: 'criterion-1',
      criterionLabel: 'Client Fit',
      winAvg: 82,
      lossAvg: 58,
      winZoneMin: 74,
      winZoneMax: 90,
      lossRiskZoneMin: 46,
      lossRiskZoneMax: 69,
      sampleSize: 12,
      isStatisticallySignificant: true,
      confidence: createMockBenchmarkConfidence(),
      similarity: createMockSimilarityResult(),
      explainability: {
        criterionId: 'criterion-1',
        reasonCodes: ['below-historical-win-average'],
        narrative: 'Current criterion score trails historical winning average.',
        relatedHistoricalExamples: [{ pursuitId: 'pursuit-1', label: 'Regional Office Retrofit' }],
      },
      ownerBicId: 'owner-1',
      ownerAvatarUrl: 'https://example.com/avatar-owner-1.png',
    },
    overrides
  );

export const createMockScoreGhostOverlayState = (
  overrides?: Partial<IScoreGhostOverlayState>
): IScoreGhostOverlayState => {
  const benchmarks = overrides?.benchmarks ?? [createMockScorecardBenchmark()];
  return mergeObject(
    {
      benchmarks,
      overallWinAvg: 82,
      overallLossAvg: 58,
      overallWinZoneMin: 74,
      overallWinZoneMax: 90,
      distanceToWinZone: 0,
      lossRiskOverlap: false,
      filterContext: createMockBenchmarkFilterContext(),
      recommendation: createMockBenchmarkRecommendation(),
      consensus: createMockReviewerConsensus(),
      filterGovernanceEvents: [createMockFilterGovernanceEvent()],
      recalibrationSignals: [
        {
          signalId: 'signal-1',
          criterionId: 'criterion-1',
          predictiveDrift: 0.12,
          triggeredBy: 'sf22-outcome',
          correlationKeys: ['criterion:criterion-1'],
          triggeredAt: DEFAULT_ISO,
        },
      ],
      benchmarkGeneratedAt: DEFAULT_ISO,
      version: {
        snapshotId: 'entity-1',
        version: 2,
        createdAt: DEFAULT_ISO,
        createdBy: {
          userId: 'score-benchmark-system',
          displayName: 'Score Benchmark System',
          role: 'system',
        },
        changeSummary: 'Deterministic mock overlay.',
        tag: 'draft',
      },
      telemetry: {
        timeToGoNoGoMs: 800,
        gapClosureLatencyMs: 1800,
        pctScorecardsReachingWinZone: 0.7,
        winRateCorrelationLift: 0.14,
        benchmarkCes: 0.72,
        benchmarkConsultationRate: 0.64,
        decisionReversalRate: 0.11,
        confidenceToOutcomeCorrelation: 0.68,
        filterAdjustmentFrequency: 0.23,
        predictiveAccuracyByCriterion: 0.66,
        recommendationOverrideRate: 0.17,
        noBidRationaleCompletionRate: 0.94,
      },
      syncStatus: 'synced',
    },
    overrides
  );
};

export const mockScoreBenchmarkStates: Readonly<Record<string, IScoreGhostOverlayState>> = {
  inWinZoneHighConfidence: createMockScoreGhostOverlayState(),
  belowWinZoneModerateConfidence: createMockScoreGhostOverlayState({
    overallWinAvg: 68,
    distanceToWinZone: 6,
    recommendation: createMockBenchmarkRecommendation({
      state: 'pursue-with-caution',
      derivedFrom: {
        distanceToWinZone: 6,
        lossRiskOverlap: false,
        confidenceTier: 'moderate',
        similarity: 0.7,
        consensusStrength: 0.69,
      },
    }),
    benchmarks: [
      createMockScorecardBenchmark({
        confidence: createMockBenchmarkConfidence({ tier: 'moderate' }),
      }),
    ],
  }),
  aboveWinZone: createMockScoreGhostOverlayState({ overallWinAvg: 95, distanceToWinZone: 0 }),
  insufficientDataCaution: createMockScoreGhostOverlayState({
    benchmarks: [
      createMockScorecardBenchmark({
        sampleSize: 3,
        confidence: createMockBenchmarkConfidence({
          tier: 'insufficient',
          reasons: ['insufficient-sample-size'],
          caution: true,
        }),
      }),
    ],
    recommendation: createMockBenchmarkRecommendation({
      state: 'hold-for-review',
      derivedFrom: {
        distanceToWinZone: 8,
        lossRiskOverlap: false,
        confidenceTier: 'insufficient',
        similarity: 0.45,
        consensusStrength: 0.6,
      },
    }),
  }),
  lossRiskOverlapActive: createMockScoreGhostOverlayState({
    lossRiskOverlap: true,
    recommendation: createMockBenchmarkRecommendation({ state: 'hold-for-review' }),
  }),
  weakSimilarityCohort: createMockScoreGhostOverlayState({
    benchmarks: [
      createMockScorecardBenchmark({
        similarity: createMockSimilarityResult({
          overallSimilarity: 0.41,
          strengthBand: 'loosely-similar',
        }),
      }),
    ],
  }),
  recommendationPursue: createMockScoreGhostOverlayState({
    recommendation: createMockBenchmarkRecommendation({ state: 'pursue' }),
  }),
  recommendationPursueWithCaution: createMockScoreGhostOverlayState({
    recommendation: createMockBenchmarkRecommendation({ state: 'pursue-with-caution' }),
  }),
  recommendationHoldForReview: createMockScoreGhostOverlayState({
    recommendation: createMockBenchmarkRecommendation({ state: 'hold-for-review' }),
  }),
  recommendationNoBid: createMockScoreGhostOverlayState({
    recommendation: createMockBenchmarkRecommendation({ state: 'no-bid-recommended' }),
  }),
  reviewerDisagreementHighVariance: createMockScoreGhostOverlayState({
    consensus: createMockReviewerConsensus({ variance: 0.78, escalationRecommended: true }),
  }),
  filterGovernanceWarningTriggered: createMockScoreGhostOverlayState({
    filterGovernanceEvents: [
      createMockFilterGovernanceEvent({
        warningTriggered: true,
        deltaImpact: {
          sampleSizeDeltaPct: 0.3,
          similarityDeltaPct: 0.28,
          winRateDeltaPct: 0.27,
        },
      }),
    ],
  }),
  staleBenchmarkTimestamp: createMockScoreGhostOverlayState({ benchmarkGeneratedAt: '2024-01-01T00:00:00.000Z' }),
  savedLocally: createMockScoreGhostOverlayState({ syncStatus: 'saved-locally' }),
  queuedToSync: createMockScoreGhostOverlayState({ syncStatus: 'queued-to-sync' }),
  syncReplayResolved: createMockScoreGhostOverlayState({
    syncStatus: 'synced',
    version: {
      snapshotId: 'entity-1',
      version: 3,
      createdAt: '2026-03-12T01:00:00.000Z',
      createdBy: {
        userId: 'score-benchmark-system',
        displayName: 'Score Benchmark System',
        role: 'system',
      },
      changeSummary: 'Replay resolved.',
      tag: 'approved',
    },
  }),
  recalibrationSignalEmitted: createMockScoreGhostOverlayState({
    recalibrationSignals: [
      {
        signalId: 'signal-recal-1',
        criterionId: 'criterion-1',
        predictiveDrift: 0.29,
        triggeredBy: 'sf22-outcome',
        correlationKeys: ['drift:winRateCorrelationLift'],
        triggeredAt: DEFAULT_ISO,
      },
    ],
  }),
};
