import type { IBicOwner as BicOwner } from '@hbc/bic-next-move';
import type { IBicOwner as VersionOwner, IVersionMetadata, VersionTag } from '@hbc/versioned-record';
import {
  BENCHMARK_GOVERNANCE_WARNING_DELTA,
  BENCHMARK_MIN_SAMPLE_SIZE,
  BENCHMARK_SYNC_QUEUE_KEY,
} from '../constants/index.js';
import {
  computeDistanceToWinZone,
  computeZoneRange,
  deriveConfidence,
  deriveRecommendation,
  hasZoneOverlap,
} from '../model/lifecycle/index.js';
import type {
  BenchmarkRecommendationState,
  IBenchmarkExplainability,
  IBenchmarkFilterContext,
  IFilterGovernanceEvent,
  INoBidRationalePayload,
  INoBidRationaleRecord,
  IReviewerConsensus,
  IScoreBenchmarkApiState,
  IScoreBenchmarkMutation,
  IScoreBenchmarkOverallSummary,
  IScoreBenchmarkOverlayResponse,
  IScorecardBenchmark,
  IScoreGhostOverlayState,
  ISimilarityFactorContribution,
  ISimilarityModelResult,
  IBicOwnershipProjection,
} from '../types/index.js';

const DEFAULT_VERSION_OWNER: VersionOwner = {
  userId: 'score-benchmark-system',
  displayName: 'Score Benchmark System',
  role: 'system',
};

const DEFAULT_VERSION_METADATA = (entityId: string): IVersionMetadata => ({
  snapshotId: `${entityId}-snapshot`,
  version: 1,
  createdAt: new Date(0).toISOString(),
  createdBy: DEFAULT_VERSION_OWNER,
  changeSummary: 'Initial overlay snapshot',
  tag: 'draft' as VersionTag,
});

const freeze = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const defaultConsensus = (): IReviewerConsensus => ({
  variance: 0,
  consensusStrength: 0.8,
  largestDisagreements: [],
  roleComparisons: [],
  escalationRecommended: false,
});

const defaultSimilarity = (): ISimilarityModelResult => {
  const factorBreakdown: ISimilarityFactorContribution[] = [
    { factor: 'projectType', weight: 0.2, matchScore: 0.7 },
    { factor: 'deliveryMethod', weight: 0.1, matchScore: 0.7 },
    { factor: 'procurementType', weight: 0.1, matchScore: 0.65 },
    { factor: 'valueRange', weight: 0.1, matchScore: 0.75 },
    { factor: 'geography', weight: 0.1, matchScore: 0.8 },
    { factor: 'ownerType', weight: 0.1, matchScore: 0.7 },
    { factor: 'incumbentRelationship', weight: 0.1, matchScore: 0.6 },
    { factor: 'competitorCount', weight: 0.1, matchScore: 0.66 },
    { factor: 'scheduleComplexity', weight: 0.1, matchScore: 0.68 },
  ];

  return {
    overallSimilarity: factorBreakdown.reduce((total, factor) => total + factor.weight * factor.matchScore, 0),
    strengthBand: 'moderately-similar',
    factorBreakdown,
    mostSimilarPursuits: [
      {
        pursuitId: 'p-1',
        pursuitLabel: 'Comparable Pursuit',
        similarity: 0.71,
        outcome: 'won',
        closedAt: new Date(0).toISOString(),
      },
    ],
  };
};

const defaultExplainability = (criterionId: string): IBenchmarkExplainability => ({
  criterionId,
  reasonCodes: ['below-historical-win-average'],
  narrative: 'Criterion score remains below historical win average.',
  relatedHistoricalExamples: [{ pursuitId: 'p-1', label: 'Comparable Pursuit' }],
});

const defaultBenchmarks = (): IScorecardBenchmark[] => [
  {
    criterionId: 'criterion-1',
    criterionLabel: 'Client Fit',
    winAvg: 78,
    lossAvg: 59,
    winZoneMin: 72,
    winZoneMax: 88,
    lossRiskZoneMin: 45,
    lossRiskZoneMax: 70,
    sampleSize: 12,
    isStatisticallySignificant: true,
    confidence: deriveConfidence({
      sampleSize: 12,
      similarityScore: 0.71,
      recencyScore: 0.7,
      completenessScore: 0.84,
    }),
    similarity: defaultSimilarity(),
    explainability: defaultExplainability('criterion-1'),
  },
];

const createDefaultOverlay = (entityId: string): IScoreGhostOverlayState => {
  const benchmarks = defaultBenchmarks();
  const wonScores = benchmarks.map((benchmark) => benchmark.winAvg ?? 0);
  const lossScores = benchmarks.map((benchmark) => benchmark.lossAvg ?? 0);
  const winZone = computeZoneRange(wonScores);
  const lossRiskZone = computeZoneRange(lossScores);
  const overlap = hasZoneOverlap(winZone, lossRiskZone);
  const consensus = defaultConsensus();
  const recommendation = deriveRecommendation({
    distanceToWinZone: computeDistanceToWinZone(70, winZone.min),
    lossRiskOverlap: overlap,
    confidenceTier: benchmarks[0]?.confidence.tier ?? 'insufficient',
    similarityStrength: benchmarks[0]?.similarity.overallSimilarity ?? 0,
    consensus,
  });

  return {
    benchmarks,
    overallWinAvg: 78,
    overallLossAvg: 59,
    overallWinZoneMin: winZone.min,
    overallWinZoneMax: winZone.max,
    distanceToWinZone: computeDistanceToWinZone(70, winZone.min),
    lossRiskOverlap: overlap,
    filterContext: {},
    recommendation,
    consensus,
    filterGovernanceEvents: [],
    recalibrationSignals: [],
    benchmarkGeneratedAt: new Date(0).toISOString(),
    version: DEFAULT_VERSION_METADATA(entityId),
    telemetry: {
      timeToGoNoGoMs: null,
      gapClosureLatencyMs: null,
      pctScorecardsReachingWinZone: null,
      winRateCorrelationLift: null,
      benchmarkCes: null,
      benchmarkConsultationRate: null,
      decisionReversalRate: null,
      confidenceToOutcomeCorrelation: null,
      filterAdjustmentFrequency: null,
      predictiveAccuracyByCriterion: null,
      recommendationOverrideRate: null,
      noBidRationaleCompletionRate: null,
    },
    syncStatus: 'synced',
  };
};

export class ScoreBenchmarkApi {
  private readonly overlayState = new Map<string, IScoreGhostOverlayState>();
  private readonly queue: IScoreBenchmarkMutation[] = [];
  private readonly noBidRationales = new Map<string, INoBidRationaleRecord>();
  private readonly approvedCohorts: Set<string>;

  constructor(seedState?: Partial<IScoreBenchmarkApiState>) {
    this.approvedCohorts = new Set(seedState?.approvedCohorts ?? ['default']);

    for (const overlay of seedState?.overlays ?? []) {
      this.overlayState.set(overlay.version.snapshotId, freeze(overlay));
    }
  }

  getOverlayState(entityId: string, filterContext: IBenchmarkFilterContext): IScoreBenchmarkOverlayResponse {
    const current = this.overlayState.get(entityId) ?? createDefaultOverlay(entityId);

    const adjustedBenchmarks: IScorecardBenchmark[] = current.benchmarks.map((benchmark) => {
      if (benchmark.sampleSize < BENCHMARK_MIN_SAMPLE_SIZE) {
        return {
          ...benchmark,
          confidence: {
            ...benchmark.confidence,
            tier: 'insufficient' as const,
            caution: true,
          },
        };
      }

      return benchmark;
    });

    const currentScore = current.overallWinAvg;
    const distanceToWinZone = computeDistanceToWinZone(currentScore, current.overallWinZoneMin);
    const confidenceTier = adjustedBenchmarks[0]?.confidence.tier ?? 'insufficient';
    const similarityStrength = adjustedBenchmarks[0]?.similarity.overallSimilarity ?? 0;

    const recommendation = deriveRecommendation({
      distanceToWinZone,
      lossRiskOverlap: current.lossRiskOverlap,
      confidenceTier,
      similarityStrength,
      consensus: current.consensus,
    });

    const state: IScoreGhostOverlayState = {
      ...current,
      filterContext,
      benchmarks: adjustedBenchmarks,
      recommendation,
      distanceToWinZone,
      benchmarkGeneratedAt: new Date().toISOString(),
    };

    const bicOwnershipProjections = this.buildBicOwnershipProjections(state.benchmarks, recommendation.state);
    this.overlayState.set(entityId, freeze(state));

    return {
      state: freeze(state),
      bicOwnershipProjections,
    };
  }

  getCriterionBenchmarks(_filterContext: IBenchmarkFilterContext): IScorecardBenchmark[] {
    const first = this.overlayState.values().next().value as IScoreGhostOverlayState | undefined;
    return freeze(first?.benchmarks ?? defaultBenchmarks());
  }

  getOverallSummary(filterContext: IBenchmarkFilterContext): IScoreBenchmarkOverallSummary {
    const benchmarks = this.getCriterionBenchmarks(filterContext);

    const winValues = benchmarks.map((benchmark) => benchmark.winAvg).filter((value): value is number => value !== null);
    const lossValues = benchmarks.map((benchmark) => benchmark.lossAvg).filter((value): value is number => value !== null);

    const winZone = computeZoneRange(winValues);
    const lossZone = computeZoneRange(lossValues);

    return {
      criterionCount: benchmarks.length,
      overallWinAvg: winValues.length > 0 ? winValues.reduce((a, b) => a + b, 0) / winValues.length : null,
      overallLossAvg: lossValues.length > 0 ? lossValues.reduce((a, b) => a + b, 0) / lossValues.length : null,
      winZoneMin: winZone.min,
      winZoneMax: winZone.max,
      lossRiskZoneMin: lossZone.min,
      lossRiskZoneMax: lossZone.max,
      overlap: hasZoneOverlap(winZone, lossZone),
    };
  }

  getMostSimilarPursuits(entityId: string, filterContext: IBenchmarkFilterContext): ISimilarityModelResult['mostSimilarPursuits'] {
    const overlay = this.getOverlayState(entityId, filterContext).state;
    return freeze(overlay.benchmarks.flatMap((benchmark) => benchmark.similarity.mostSimilarPursuits));
  }

  getExplainability(entityId: string, filterContext: IBenchmarkFilterContext): IBenchmarkExplainability[] {
    const overlay = this.getOverlayState(entityId, filterContext).state;
    return freeze(overlay.benchmarks.map((benchmark) => benchmark.explainability));
  }

  queueBenchmarkMutation(mutation: IScoreBenchmarkMutation): { queueKey: string; queuedCount: number } {
    this.queue.push(freeze(mutation));

    return {
      queueKey: BENCHMARK_SYNC_QUEUE_KEY,
      queuedCount: this.queue.length,
    };
  }

  appendFilterGovernanceEvent(event: IFilterGovernanceEvent): { totalEvents: number } {
    const highDelta =
      Math.abs(event.deltaImpact.sampleSizeDeltaPct) >= BENCHMARK_GOVERNANCE_WARNING_DELTA ||
      Math.abs(event.deltaImpact.similarityDeltaPct) >= BENCHMARK_GOVERNANCE_WARNING_DELTA ||
      Math.abs(event.deltaImpact.winRateDeltaPct) >= BENCHMARK_GOVERNANCE_WARNING_DELTA;

    if (highDelta && !event.warningTriggered) {
      throw new Error('High delta governance changes require warning confirmation.');
    }

    if (
      event.toContext.cohortPolicy?.approvedCohortId !== undefined &&
      !this.approvedCohorts.has(event.toContext.cohortPolicy.approvedCohortId)
    ) {
      throw new Error('Cohort override is not in the admin-approved cohort list.');
    }

    if (
      event.fromContext.cohortPolicy?.defaultLocked &&
      event.eventType === 'filter-change' &&
      event.toContext.cohortPolicy?.approvedCohortId === undefined
    ) {
      throw new Error('Default cohort lock prevents silent cohort change.');
    }

    const overlay = this.overlayState.get(event.actorUserId) ?? createDefaultOverlay(event.actorUserId);
    overlay.filterGovernanceEvents = [...overlay.filterGovernanceEvents, freeze(event)];
    overlay.syncStatus = 'queued-to-sync';
    this.overlayState.set(event.actorUserId, overlay);

    return { totalEvents: overlay.filterGovernanceEvents.length };
  }

  saveNoBidRationale(
    entityId: string,
    rationalePayload: INoBidRationalePayload,
    approvedBy: string
  ): INoBidRationaleRecord {
    if (rationalePayload.artifactId.trim().length === 0 || rationalePayload.rationale.trim().length === 0) {
      throw new Error('No-bid rationale requires a persisted artifact and rationale text.');
    }

    if (approvedBy.trim().length === 0 || rationalePayload.approvedAt.trim().length === 0) {
      throw new Error('No-bid rationale finalization requires approval metadata.');
    }

    const record: INoBidRationaleRecord = {
      entityId,
      payload: freeze(rationalePayload),
      approvedBy,
      savedAt: new Date().toISOString(),
    };

    this.noBidRationales.set(entityId, record);
    return freeze(record);
  }

  private buildBicOwnershipProjections(
    benchmarks: readonly IScorecardBenchmark[],
    recommendationState: BenchmarkRecommendationState
  ): IBicOwnershipProjection[] {
    return benchmarks
      .filter((benchmark) =>
        benchmark.explainability.reasonCodes.includes('below-historical-win-average') &&
        recommendationState !== 'pursue'
      )
      .map((benchmark) => {
        const owner: BicOwner | null = benchmark.ownerBicId
          ? {
              userId: benchmark.ownerBicId,
              displayName: benchmark.ownerBicId,
              role: 'criterion-owner',
            }
          : null;

        return {
          criterionId: benchmark.criterionId,
          criterionLabel: benchmark.criterionLabel,
          owner,
          distanceToWinZone: benchmark.winZoneMin === null || benchmark.winAvg === null
            ? 0
            : Math.max(0, benchmark.winZoneMin - benchmark.winAvg),
        };
      });
  }
}
