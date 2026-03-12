import { describe, expect, it } from 'vitest';
import {
  mapScoreBenchmarkToHealthIndicator,
  projectInlineHbiActions,
  projectSf22LearningSignals,
  resolveScoreBenchmarkNotifications,
} from './index.js';
import {
  createMockBenchmarkRecommendation,
  createMockReviewerConsensus,
  createMockScoreGhostOverlayState,
} from '@hbc/score-benchmark/testing';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';

describe('score benchmark integration branch coverage', () => {
  it('maps health indicator states across ready/attention/not-ready conditions', () => {
    const ready = createMockScoreGhostOverlayState({
      recommendation: createMockBenchmarkRecommendation({ state: 'pursue' }),
      lossRiskOverlap: false,
    });
    expect(mapScoreBenchmarkToHealthIndicator(ready).status).toBe('ready');

    const attention = createMockScoreGhostOverlayState({
      recommendation: createMockBenchmarkRecommendation({ state: 'hold-for-review' }),
      lossRiskOverlap: true,
    });
    expect(mapScoreBenchmarkToHealthIndicator(attention).status).toBe('attention-needed');

    const noBid = createMockScoreGhostOverlayState({
      recommendation: createMockBenchmarkRecommendation({ state: 'no-bid-recommended' }),
    });
    expect(mapScoreBenchmarkToHealthIndicator(noBid).status).toBe('not-ready');
  });

  it('resolves notification payloads for overlap, disagreement, and no-bid approval', () => {
    const overlay = createMockScoreGhostOverlayState({
      lossRiskOverlap: true,
      recommendation: createMockBenchmarkRecommendation({ state: 'no-bid-recommended' }),
    });
    const consensus = createMockReviewerConsensus({ escalationRecommended: true });

    const notifications = resolveScoreBenchmarkNotifications(overlay, consensus);
    expect(notifications.map((item) => item.eventType)).toEqual([
      'score-benchmark.loss-risk-overlap',
      'score-benchmark.consensus-escalation',
      'score-benchmark.no-bid-approval-overdue',
    ]);
  });

  it('projects governed HBI actions with citation and approval requirements', () => {
    const overlay = createMockScoreGhostOverlayState();
    const actions = projectInlineHbiActions(overlay);

    expect(actions[0]?.requiresCitation).toBe(true);
    expect(actions[0]?.requiresApproval).toBe(true);
    const prompt = actions[0]?.action.buildPrompt({});
    expect(prompt?.contextData).toMatchObject({ citationRequired: true, approvalRequired: true });
    const parsed = actions[0]?.action.parseResponse('Mock rationale');
    expect(parsed?.confidenceDetails.modelDeploymentName).toBe('hbi-governed-reasoning');
  });

  it('consumes SF22 learning signals into deterministic summary counters', () => {
    const signals: PostBidLearningSignal[] = [
      {
        signalType: 'benchmark-dataset-enrichment',
        signalId: 's1',
        autopsyId: 'a1',
        pursuitId: 'p1',
        scorecardId: 'c1',
        status: 'published',
        outcome: 'won',
        confidenceTier: 'high',
        confidenceScore: 0.9,
        evidenceCoverage: 0.9,
        sensitivityVisibility: 'internal',
        reasonCodes: ['below-historical-win-average'],
        publishedAt: '2026-03-12T00:00:00.000Z',
        benchmarkDimensionKeys: ['projectType'],
        criterionImpacts: [{ criterionId: 'criterion-1', impactDirection: 'positive', weight: 0.4 }],
      },
      {
        signalType: 'recalibration-input',
        signalId: 's2',
        autopsyId: 'a2',
        pursuitId: 'p2',
        scorecardId: 'c2',
        status: 'published',
        outcome: 'lost',
        confidenceTier: 'moderate',
        confidenceScore: 0.65,
        evidenceCoverage: 0.88,
        sensitivityVisibility: 'restricted',
        reasonCodes: ['outside-predictive-band'],
        publishedAt: '2026-03-12T00:00:00.000Z',
        correlationKeys: ['criterion:criterion-2'],
        recommendedWeightShift: 0.12,
        triggeredBy: 'autopsy-pattern',
      },
      {
        signalType: 'predictive-drift-input',
        signalId: 's3',
        autopsyId: 'a3',
        pursuitId: 'p3',
        scorecardId: 'c3',
        status: 'approved',
        outcome: 'no-bid',
        confidenceTier: 'low',
        confidenceScore: 0.44,
        evidenceCoverage: 0.7,
        sensitivityVisibility: 'public-summary',
        reasonCodes: ['weak-benchmark-confidence'],
        publishedAt: '2026-03-12T00:00:00.000Z',
        monitorWindowDays: 14,
        driftIndicators: [{ metric: 'confidenceToOutcomeCorrelation', delta: -0.21 }],
      },
    ];

    const projection = projectSf22LearningSignals(signals);
    expect(projection.consumedCount).toBe(3);
    expect(projection.enrichmentCount).toBe(1);
    expect(projection.recalibrationCount).toBe(1);
    expect(projection.driftCount).toBe(1);
  });
});
