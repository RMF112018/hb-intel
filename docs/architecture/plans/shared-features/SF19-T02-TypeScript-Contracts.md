# SF19-T02 - TypeScript Contracts: Score Benchmark Primitive + BD Adapter

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-19-Module-Feature-BD-Score-Benchmark.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.1 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan - SF19-T02 contracts task; sub-plan of `SF19-BD-Score-Benchmark.md`.

---

## Objective

Lock primitive-owned public contracts for criterion benchmarks, confidence/similarity/recommendation models, reviewer consensus, filter-governance, recalibration telemetry, and version metadata. SF19 BD contracts are adapter aliases/projections over primitive types.

---

## Primitive Contracts to Define (`@hbc/score-benchmark`)

```ts
import type { IVersionMetadata } from '@hbc/versioned-record';

export type BenchmarkConfidenceTier = 'high' | 'moderate' | 'low' | 'insufficient';
export type SimilarityStrengthBand = 'highly-similar' | 'moderately-similar' | 'loosely-similar';
export type BenchmarkRecommendationState =
  | 'pursue'
  | 'pursue-with-caution'
  | 'hold-for-review'
  | 'no-bid-recommended';

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
  factor:
    | 'projectType'
    | 'deliveryMethod'
    | 'procurementType'
    | 'valueRange'
    | 'geography'
    | 'ownerType'
    | 'incumbentRelationship'
    | 'competitorCount'
    | 'scheduleComplexity';
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
    role: 'business-development' | 'estimating' | 'operations' | 'executive';
    avgScore: number;
  }>;
  escalationRecommended: boolean;
}

export interface IBenchmarkExplainability {
  criterionId: string;
  reasonCodes: Array<
    | 'below-historical-win-average'
    | 'outside-predictive-band'
    | 'weak-benchmark-confidence'
    | 'owner-type-mismatch'
    | 'loss-risk-zone-overlap'
  >;
  narrative: string;
  relatedHistoricalExamples: Array<{ pursuitId: string; label: string }>;
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
```

---

## Adapter Contracts (`@hbc/features-business-development`)

- adapter contracts map primitive state into BD labels, badges, side-panel composition, and escalation actions
- adapter contracts must not redefine benchmark math, confidence/similarity calculations, recommendation policy semantics, or governance audit semantics
- adapter contracts must preserve primitive version metadata, filter-governance events, and sync status fields

---

## Constants to Lock

- `BENCHMARK_MIN_SAMPLE_SIZE = 5`
- `BENCHMARK_STALE_MS = 86_400_000`
- `BENCHMARK_SYNC_QUEUE_KEY = 'score-benchmark-sync-queue'`
- `BENCHMARK_STATUS_BANDS = ['loss-risk', 'below', 'borderline', 'win-zone']`
- `BENCHMARK_GOVERNANCE_WARNING_DELTA = 0.25`

---

## Verification Commands

```bash
pnpm --filter @hbc/score-benchmark check-types
pnpm --filter @hbc/score-benchmark test -- contracts
pnpm --filter @hbc/features-business-development check-types
```
