import { describe, expect, it } from 'vitest';
import { ScoreBenchmarkLifecycleApi } from '../api/ScoreBenchmarkLifecycleApi.js';
import type { IScoreGhostOverlayState } from '../types/index.js';

const overlayState: IScoreGhostOverlayState = {
  benchmarks: [
    {
      criterionId: 'c1',
      criterionLabel: 'Client Fit',
      winAvg: 80,
      lossAvg: 55,
      winZoneMin: 70,
      winZoneMax: 88,
      lossRiskZoneMin: 50,
      lossRiskZoneMax: 72,
      sampleSize: 4,
      isStatisticallySignificant: false,
      confidence: {
        tier: 'low',
        sampleSizeScore: 4,
        similarityScore: 0.52,
        recencyScore: 0.8,
        completenessScore: 0.9,
        reasons: ['insufficient-sample-size'],
        caution: true,
      },
      similarity: {
        overallSimilarity: 0.52,
        strengthBand: 'loosely-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [],
      },
      explainability: {
        criterionId: 'c1',
        reasonCodes: ['below-historical-win-average'],
        narrative: 'Below threshold',
        relatedHistoricalExamples: [],
      },
    },
  ],
  overallWinAvg: 80,
  overallLossAvg: 55,
  overallWinZoneMin: 70,
  overallWinZoneMax: 88,
  distanceToWinZone: 0,
  lossRiskOverlap: true,
  filterContext: {},
  recommendation: {
    state: 'pursue-with-caution',
    rationaleCodes: [],
    derivedFrom: {
      distanceToWinZone: 0,
      lossRiskOverlap: true,
      confidenceTier: 'low',
      similarity: 0.52,
      consensusStrength: 0.6,
    },
  },
  consensus: {
    variance: 0.3,
    consensusStrength: 0.6,
    largestDisagreements: [],
    roleComparisons: [],
    escalationRecommended: false,
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
    predictiveAccuracyByCriterion: 0.9,
    recommendationOverrideRate: null,
    noBidRationaleCompletionRate: null,
  },
  syncStatus: 'synced',
};

describe('ScoreBenchmarkLifecycleApi', () => {
  it('runs recompute and predictive drift monitor deterministically', () => {
    const lifecycle = new ScoreBenchmarkLifecycleApi([overlayState]);

    const scheduled = lifecycle.runScheduledRecompute();
    expect(scheduled.jobType).toBe('scheduled');
    expect(scheduled.processedEntities).toBe(1);

    const onDemand = lifecycle.runOnDemandRecompute({ projectType: 'Office' }, 'admin-1');
    expect(onDemand.jobType).toBe('on-demand');

    const drift = lifecycle.runPredictiveDriftMonitor({
      fromIso: new Date(0).toISOString(),
      toIso: new Date().toISOString(),
      driftThreshold: 0.5,
    });

    expect(drift.emittedSignals.length).toBeGreaterThan(0);
  });

  it('freezes snapshots with immutable version metadata context', () => {
    const lifecycle = new ScoreBenchmarkLifecycleApi([overlayState]);
    const frozen = lifecycle.freezeSnapshot('entity-1', 'go-no-go-submission');

    expect(frozen.entityId).toBe('entity-1');
    expect(frozen.snapshotReason).toBe('go-no-go-submission');
    expect(frozen.version.changeSummary).toContain('Snapshot frozen');
  });
});
