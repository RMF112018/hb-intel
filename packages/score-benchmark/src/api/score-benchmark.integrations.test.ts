import { describe, expect, it } from 'vitest';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';
import { ScoreBenchmarkLifecycleApi } from './ScoreBenchmarkLifecycleApi.js';
import { mapPostBidLearningSignalToRecalibrationSignal } from './index.js';
import type { IScoreGhostOverlayState } from '../types/index.js';

const createOverlay = (): IScoreGhostOverlayState => ({
  benchmarks: [],
  overallWinAvg: 70,
  overallLossAvg: 55,
  overallWinZoneMin: 68,
  overallWinZoneMax: 84,
  distanceToWinZone: -2,
  lossRiskOverlap: false,
  filterContext: {},
  recommendation: {
    state: 'pursue-with-caution',
    rationaleCodes: ['outside-predictive-band'],
    derivedFrom: {
      distanceToWinZone: -2,
      lossRiskOverlap: false,
      confidenceTier: 'moderate',
      similarity: 0.71,
      consensusStrength: 0.62,
    },
  },
  consensus: {
    variance: 0.22,
    consensusStrength: 0.62,
    largestDisagreements: [],
    roleComparisons: [],
    escalationRecommended: false,
  },
  filterGovernanceEvents: [],
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
    changeSummary: 'integration seed',
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

const createSignal = (): PostBidLearningSignal => ({
  signalType: 'predictive-drift-input',
  signalId: 'signal-1',
  autopsyId: 'aut-1',
  pursuitId: 'pur-1',
  scorecardId: 'sc-1',
  status: 'published',
  outcome: 'lost',
  confidenceTier: 'moderate',
  confidenceScore: 0.67,
  evidenceCoverage: 0.85,
  sensitivityVisibility: 'internal',
  reasonCodes: ['outside-predictive-band'],
  publishedAt: '2026-03-12T00:00:00.000Z',
  monitorWindowDays: 30,
  driftIndicators: [
    {
      metric: 'winRateCorrelationLift',
      delta: -0.18,
    },
  ],
});

describe('score benchmark integration seams', () => {
  it('maps SF22 signals to primitive recalibration contracts without outcome writes', () => {
    const signal = createSignal();
    const mapped = mapPostBidLearningSignalToRecalibrationSignal(signal);

    expect(mapped.signalId).toBe('signal-1');
    expect(mapped.triggeredBy).toBe('sf22-outcome');
    expect(mapped.correlationKeys[0]).toBe('drift:winRateCorrelationLift');
    expect(Object.keys(mapped)).not.toContain('pursuitDetails');
  });

  it('consumes published learning signals via lifecycle API seam', () => {
    const lifecycleApi = new ScoreBenchmarkLifecycleApi([createOverlay()]);
    const result = lifecycleApi.consumePublishedLearningSignals([createSignal()]);

    expect(result.consumedSignals).toBe(1);
    expect(result.emittedSignals[0]?.triggeredBy).toBe('sf22-outcome');
  });
});
