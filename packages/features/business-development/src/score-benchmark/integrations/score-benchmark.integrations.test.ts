import { describe, expect, it } from 'vitest';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import { createScoreBenchmarkReferenceIntegrations } from './index.js';
import {
  useBenchmarkDecisionSupport,
  useScoreBenchmarkState,
  type IBenchmarkFilterContext,
  type IFilterGovernanceEvent,
  type IReviewerConsensus,
  type IScoreGhostOverlayState,
} from '@hbc/score-benchmark';

const defaultFilterContext: IBenchmarkFilterContext = {};
const defaultGovernanceEvent: IFilterGovernanceEvent = {
  eventType: 'filter-change',
  actorUserId: 'actor-1',
  fromContext: defaultFilterContext,
  toContext: defaultFilterContext,
  deltaImpact: {
    sampleSizeDeltaPct: 0.1,
    similarityDeltaPct: 0.05,
    winRateDeltaPct: 0.08,
  },
  warningTriggered: false,
  recordedAt: '2026-03-12T00:00:00.000Z',
};

const defaultConsensus: IReviewerConsensus = {
  variance: 0.45,
  consensusStrength: 0.41,
  largestDisagreements: [],
  roleComparisons: [],
  escalationRecommended: true,
};

const createOverlay = (): IScoreGhostOverlayState => ({
  benchmarks: [
    {
      criterionId: 'crit-1',
      criterionLabel: 'Client fit',
      winAvg: 72,
      lossAvg: 58,
      winZoneMin: 70,
      winZoneMax: 85,
      lossRiskZoneMin: 52,
      lossRiskZoneMax: 67,
      sampleSize: 8,
      isStatisticallySignificant: true,
      confidence: {
        tier: 'moderate',
        sampleSizeScore: 0.8,
        similarityScore: 0.74,
        recencyScore: 0.88,
        completenessScore: 0.9,
        reasons: ['moderate-similarity'],
        caution: false,
      },
      similarity: {
        overallSimilarity: 0.74,
        strengthBand: 'moderately-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [
          {
            pursuitId: 'p-1',
            pursuitLabel: 'Pursuit 1',
            similarity: 0.71,
            outcome: 'won',
            closedAt: '2026-03-12T00:00:00.000Z',
          },
        ],
      },
      explainability: {
        criterionId: 'crit-1',
        reasonCodes: ['outside-predictive-band'],
        narrative: 'Predictive range exceeded.',
        relatedHistoricalExamples: [],
      },
      ownerBicId: 'owner-1',
    },
  ],
  overallWinAvg: 72,
  overallLossAvg: 58,
  overallWinZoneMin: 70,
  overallWinZoneMax: 85,
  distanceToWinZone: -2,
  lossRiskOverlap: false,
  filterContext: defaultFilterContext,
  recommendation: {
    state: 'hold-for-review',
    rationaleCodes: ['outside-predictive-band'],
    derivedFrom: {
      distanceToWinZone: -2,
      lossRiskOverlap: false,
      confidenceTier: 'moderate',
      similarity: 0.74,
      consensusStrength: 0.41,
    },
  },
  consensus: defaultConsensus,
  filterGovernanceEvents: [defaultGovernanceEvent],
  recalibrationSignals: [],
  benchmarkGeneratedAt: '2026-03-12T00:00:00.000Z',
  version: {
    snapshotId: 'entity-1',
    version: 2,
    createdAt: '2026-03-12T00:00:00.000Z',
    createdBy: {
      userId: 'system',
      displayName: 'System',
      role: 'system',
    },
    changeSummary: 'integration test',
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

const createLearningSignal = (): PostBidLearningSignal => ({
  signalType: 'recalibration-input',
  signalId: 'sig-1',
  autopsyId: 'aut-1',
  pursuitId: 'pur-1',
  scorecardId: 'sc-1',
  status: 'published',
  outcome: 'lost',
  confidenceTier: 'moderate',
  confidenceScore: 0.66,
  evidenceCoverage: 0.9,
  sensitivityVisibility: 'internal',
  reasonCodes: ['outside-predictive-band'],
  publishedAt: '2026-03-12T00:00:00.000Z',
  correlationKeys: ['criterion:crit-1'],
  recommendedWeightShift: 0.09,
  triggeredBy: 'autopsy-pattern',
});

describe('score benchmark T07 integrations', () => {
  it('projects integration seams through public contracts only', () => {
    const integrations = createScoreBenchmarkReferenceIntegrations();

    const state = useScoreBenchmarkState({
      entityId: 'entity-1',
      filterContext: defaultFilterContext,
      reviewerContext: {
        reviewerId: 'reviewer-1',
        role: 'business-development',
      },
    });

    const decisionSupport = useBenchmarkDecisionSupport({
      entityId: 'entity-1',
      filterContext: defaultFilterContext,
      reviewerContext: {
        reviewerId: 'reviewer-1',
        role: 'business-development',
      },
      urlSearch: '?panel=similar-pursuits',
    });

    const overlay = createOverlay();

    const bicActions = integrations.projectToBicActions(state, overlay.benchmarks.map((item) => item.explainability));
    const complexity = integrations.applyComplexityGating('expert', state);
    const versioned = integrations.createVersionedProjection(overlay);
    const related = integrations.projectRelatedItems(overlay, decisionSupport, '/bd/score-benchmark');
    const canvas = integrations.projectCanvasPlacement(state, '/bd/score-benchmark');
    const notifications = integrations.resolveNotifications(overlay, defaultConsensus);
    const health = integrations.mapToHealthIndicator(overlay);
    const hbiActions = integrations.projectHbiActions(overlay);
    const learning = integrations.consumeLearningSignals([createLearningSignal()]);

    expect(bicActions.length).toBeGreaterThanOrEqual(1);
    expect(complexity.mode).toBe('expert');
    expect(versioned.replaySafe).toBe(true);
    expect(related.criterionLinks[0]?.relationship).toBe('references');
    expect(canvas.tileKey).toBe('bic-my-items');
    expect(notifications.some((item) => item.eventType === 'score-benchmark.consensus-escalation')).toBe(true);
    expect(['ready', 'nearly-ready', 'attention-needed', 'not-ready']).toContain(health.status);
    expect(hbiActions[0]?.requiresApproval).toBe(true);
    expect(learning.recalibrationCount).toBe(1);
  });
});
