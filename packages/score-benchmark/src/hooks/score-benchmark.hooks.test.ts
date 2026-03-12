import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import {
  useBenchmarkDecisionSupport,
  useScoreBenchmarkFilters,
  useScoreBenchmarkState,
} from './index.js';
import {
  parseScoreBenchmarkPanelContext,
  serializeScoreBenchmarkPanelContext,
} from './panelUrlState.js';
import type {
  IScoreGhostOverlayState,
  IScoreBenchmarkReviewerContext,
} from '../types/index.js';

const reviewerContext: IScoreBenchmarkReviewerContext = {
  reviewerId: 'rev-1',
  role: 'business-development',
};

const createOverlay = (): IScoreGhostOverlayState => ({
  benchmarks: [
    {
      criterionId: 'criterion-1',
      criterionLabel: 'Client Fit',
      winAvg: 72,
      lossAvg: 61,
      winZoneMin: 74,
      winZoneMax: 85,
      lossRiskZoneMin: 60,
      lossRiskZoneMax: 73,
      sampleSize: 10,
      isStatisticallySignificant: true,
      confidence: {
        tier: 'moderate',
        sampleSizeScore: 0.8,
        similarityScore: 0.7,
        recencyScore: 0.7,
        completenessScore: 0.9,
        reasons: ['benchmark-recency-ok'],
        caution: false,
      },
      similarity: {
        overallSimilarity: 0.72,
        strengthBand: 'moderately-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [
          {
            pursuitId: 'p-100',
            pursuitLabel: 'Comparable Bid 100',
            similarity: 0.72,
            outcome: 'won',
            closedAt: new Date(0).toISOString(),
          },
        ],
      },
      explainability: {
        criterionId: 'criterion-1',
        reasonCodes: ['below-historical-win-average'],
        narrative: 'Gap remains below the win-zone threshold.',
        relatedHistoricalExamples: [],
      },
      ownerBicId: 'owner-1',
    },
  ],
  overallWinAvg: 72,
  overallLossAvg: 61,
  overallWinZoneMin: 74,
  overallWinZoneMax: 85,
  distanceToWinZone: 2,
  lossRiskOverlap: true,
  filterContext: {},
  recommendation: {
    state: 'pursue-with-caution',
    rationaleCodes: ['loss-risk-zone-overlap'],
    derivedFrom: {
      distanceToWinZone: 2,
      lossRiskOverlap: true,
      confidenceTier: 'moderate',
      similarity: 0.72,
      consensusStrength: 0.7,
    },
  },
  consensus: {
    variance: 0.2,
    consensusStrength: 0.8,
    largestDisagreements: [],
    roleComparisons: [],
    escalationRecommended: false,
  },
  filterGovernanceEvents: [
    {
      eventType: 'filter-change',
      actorUserId: 'rev-1',
      fromContext: {},
      toContext: { geography: 'SE' },
      deltaImpact: {
        sampleSizeDeltaPct: 0.1,
        similarityDeltaPct: 0.1,
        winRateDeltaPct: 0.1,
      },
      warningTriggered: true,
      recordedAt: new Date().toISOString(),
    },
  ],
  recalibrationSignals: [],
  benchmarkGeneratedAt: new Date(0).toISOString(),
  version: {
    snapshotId: 'entity-1',
    version: 1,
    createdAt: new Date(0).toISOString(),
    createdBy: {
      userId: 'system',
      displayName: 'System',
      role: 'system',
    },
    changeSummary: 'seed',
    tag: 'draft',
  },
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
});

describe('score benchmark hooks', () => {
  it('projects stable state contract with stale/warning and sync metadata', () => {
    const api = new ScoreBenchmarkApi({ overlays: [createOverlay()], approvedCohorts: ['default', 'cohort-1'] });

    const state = useScoreBenchmarkState(
      {
        entityId: 'entity-1',
        filterContext: {},
        reviewerContext,
      },
      {
        api,
      }
    );

    expect(state.cacheKey[0]).toBe('score-benchmark');
    expect(state.status).toBe('success');
    expect(state.governanceWarning.triggered).toBe(true);
    expect(state.stale.isStale).toBe(true);
  });

  it('normalizes filters, appends governance, and invalidates benchmark query keys', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['default', 'cohort-1'] });

    const filters = useScoreBenchmarkFilters(
      {
        entityId: 'entity-1',
        actorUserId: 'rev-1',
        reviewerContext,
        initialContext: {
          cohortPolicy: {
            defaultLocked: false,
            approvedCohortId: 'default',
            auditRequired: true,
          },
        },
        approvedCohorts: ['default', 'cohort-1'],
        defaultCohortId: 'default',
      },
      {
        api,
      }
    );

    const next = filters.applyFilterContext({
      valueRange: [500, 100],
      cohortPolicy: {
        defaultLocked: false,
        approvedCohortId: 'cohort-1',
        auditRequired: true,
      },
    });

    expect(next.filterContext.valueRange).toEqual([100, 500]);
    expect(next.invalidatedQueryKeys.length).toBe(1);
    expect(next.invalidatedQueryKeys[0]?.[0]).toBe('score-benchmark');
  });

  it('preserves url panel context and gates panel detail hydration on base state', () => {
    const api = new ScoreBenchmarkApi({ overlays: [createOverlay()], approvedCohorts: ['default'] });

    const initialSearch = '?a=1';
    const opened = serializeScoreBenchmarkPanelContext(initialSearch, {
      panel: 'similar-pursuits',
      pursuitId: 'p-100',
    });

    const parsed = parseScoreBenchmarkPanelContext(opened);
    expect(parsed.panel).toBe('similar-pursuits');
    expect(parsed.pursuitId).toBe('p-100');

    const decisionSupport = useBenchmarkDecisionSupport(
      {
        entityId: 'entity-1',
        filterContext: {},
        reviewerContext,
        urlSearch: opened,
      },
      {
        api,
      }
    );

    expect(decisionSupport.panelHydration.baseHydrated).toBe(true);
    expect(decisionSupport.panelHydration.detailHydrated).toBe(true);
    expect(decisionSupport.mostSimilarPursuits.length).toBeGreaterThan(0);
  });

  it('queues recommendation override and replays queued mutations to synced state', () => {
    const api = new ScoreBenchmarkApi({ overlays: [createOverlay()], approvedCohorts: ['default'] });

    const decisionSupport = useBenchmarkDecisionSupport(
      {
        entityId: 'entity-1',
        filterContext: {},
        reviewerContext,
      },
      {
        api,
      }
    );

    const queuedState = decisionSupport.actions.queueRecommendationOverride('Escalate to executive review');
    expect(queuedState.sync.badgeLabel).toBe('Queued to sync');

    const replayed = queuedState.actions.replayQueuedMutations();
    expect(replayed.sync.badgeLabel).toBe('Synced');
  });
});
