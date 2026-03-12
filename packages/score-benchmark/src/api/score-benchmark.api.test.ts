import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkApi } from './ScoreBenchmarkApi.js';
import type { IScoreGhostOverlayState } from '../types/index.js';

const createOverlay = (): IScoreGhostOverlayState => ({
  benchmarks: [
    {
      criterionId: 'c1',
      criterionLabel: 'Client Fit',
      winAvg: 62,
      lossAvg: 58,
      winZoneMin: 70,
      winZoneMax: 85,
      lossRiskZoneMin: 52,
      lossRiskZoneMax: 72,
      sampleSize: 3,
      isStatisticallySignificant: false,
      confidence: {
        tier: 'low',
        sampleSizeScore: 3,
        similarityScore: 0.5,
        recencyScore: 0.7,
        completenessScore: 0.8,
        reasons: ['insufficient-sample-size'],
        caution: true,
      },
      similarity: {
        overallSimilarity: 0.5,
        strengthBand: 'loosely-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [],
      },
      explainability: {
        criterionId: 'c1',
        reasonCodes: ['below-historical-win-average'],
        narrative: 'Below win-zone threshold.',
        relatedHistoricalExamples: [],
      },
      ownerBicId: 'u-1',
    },
  ],
  overallWinAvg: 62,
  overallLossAvg: 58,
  overallWinZoneMin: 70,
  overallWinZoneMax: 85,
  distanceToWinZone: 8,
  lossRiskOverlap: true,
  filterContext: {},
  recommendation: {
    state: 'pursue',
    rationaleCodes: [],
    derivedFrom: {
      distanceToWinZone: 8,
      lossRiskOverlap: true,
      confidenceTier: 'low',
      similarity: 0.5,
      consensusStrength: 0.4,
    },
  },
  consensus: {
    variance: 0.4,
    consensusStrength: 0.4,
    largestDisagreements: [],
    roleComparisons: [],
    escalationRecommended: true,
  },
  filterGovernanceEvents: [],
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

describe('ScoreBenchmarkApi', () => {
  it('returns overlay with recommendation caps and BIC projections', () => {
    const api = new ScoreBenchmarkApi({ overlays: [createOverlay()], approvedCohorts: ['default'] });

    const overlay = api.getOverlayState('entity-1', {});

    expect(overlay.state.benchmarks[0]?.confidence.tier).toBe('insufficient');
    expect(overlay.state.recommendation.state).toBe('hold-for-review');
    expect(overlay.bicOwnershipProjections.length).toBe(1);
  });

  it('enforces governance warnings and approval for no-bid rationale', () => {
    const api = new ScoreBenchmarkApi({ approvedCohorts: ['approved-cohort'] });

    expect(() =>
      api.appendFilterGovernanceEvent({
        eventType: 'filter-change',
        actorUserId: 'actor-1',
        fromContext: {
          cohortPolicy: {
            defaultLocked: true,
            auditRequired: true,
          },
        },
        toContext: {
          cohortPolicy: {
            defaultLocked: false,
            approvedCohortId: 'approved-cohort',
            auditRequired: true,
          },
        },
        deltaImpact: {
          sampleSizeDeltaPct: 0.26,
          similarityDeltaPct: 0.1,
          winRateDeltaPct: 0.2,
        },
        warningTriggered: false,
        approvedCohortId: 'approved-cohort',
        recordedAt: new Date().toISOString(),
      })
    ).toThrow(/warning confirmation/i);

    expect(() =>
      api.saveNoBidRationale(
        'entity-1',
        {
          artifactId: '',
          rationale: 'insufficient strategic fit',
          citations: [],
          approvedAt: new Date().toISOString(),
        },
        'reviewer-1'
      )
    ).toThrow(/persisted artifact/i);
  });
});
