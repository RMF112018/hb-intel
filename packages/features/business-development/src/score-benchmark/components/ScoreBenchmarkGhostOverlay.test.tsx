import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { IScoreGhostOverlayState, IBicOwnershipProjection } from '@hbc/score-benchmark';
import { ScoreBenchmarkGhostOverlay } from './ScoreBenchmarkGhostOverlay.js';

const overlay = (): IScoreGhostOverlayState => ({
  benchmarks: [
    {
      criterionId: 'c1',
      criterionLabel: 'Client Fit',
      winAvg: 74,
      lossAvg: 61,
      winZoneMin: 72,
      winZoneMax: 88,
      lossRiskZoneMin: 58,
      lossRiskZoneMax: 76,
      sampleSize: 3,
      isStatisticallySignificant: false,
      confidence: {
        tier: 'insufficient',
        sampleSizeScore: 0.3,
        similarityScore: 0.4,
        recencyScore: 0.5,
        completenessScore: 0.8,
        reasons: ['insufficient-sample-size'],
        caution: true,
      },
      similarity: {
        overallSimilarity: 0.62,
        strengthBand: 'moderately-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [],
      },
      explainability: {
        criterionId: 'c1',
        reasonCodes: ['weak-benchmark-confidence'],
        narrative: 'Needs stronger comparable set.',
        relatedHistoricalExamples: [],
      },
      ownerBicId: 'u-1',
    },
  ],
  overallWinAvg: 70,
  overallLossAvg: 61,
  overallWinZoneMin: 72,
  overallWinZoneMax: 88,
  distanceToWinZone: 2,
  lossRiskOverlap: true,
  filterContext: {},
  recommendation: {
    state: 'hold-for-review',
    rationaleCodes: ['loss-risk-zone-overlap'],
    derivedFrom: {
      distanceToWinZone: 2,
      lossRiskOverlap: true,
      confidenceTier: 'insufficient',
      similarity: 0.62,
      consensusStrength: 0.5,
    },
  },
  consensus: {
    variance: 0.3,
    consensusStrength: 0.5,
    largestDisagreements: [],
    roleComparisons: [],
    escalationRecommended: true,
  },
  filterGovernanceEvents: [],
  recalibrationSignals: [],
  benchmarkGeneratedAt: new Date().toISOString(),
  version: {
    snapshotId: 'entity-1',
    version: 1,
    createdAt: new Date().toISOString(),
    createdBy: {
      userId: 'sys',
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

const projections: IBicOwnershipProjection[] = [
  {
    criterionId: 'c1',
    criterionLabel: 'Client Fit',
    owner: {
      userId: 'u-1',
      displayName: 'A. Owner',
      role: 'BD Manager',
    },
    distanceToWinZone: 4,
  },
];

describe('ScoreBenchmarkGhostOverlay', () => {
  it('renders overlap warning, insufficient-data warning, and confidence context in expert mode', () => {
    render(
      <ScoreBenchmarkGhostOverlay
        overlay={overlay()}
        bicOwnershipProjections={projections}
        complexity="Expert"
        criterionScores={{ c1: 68 }}
        onOpenDeepLink={(criterionId) => `/work/${criterionId}`}
      />,
    );

    expect(screen.getByTestId('overlay-win-zone-band')).toBeInTheDocument();
    expect(screen.getByTestId('overlay-overlap-warning')).toHaveTextContent('Ambiguous benchmark overlap');
    expect(screen.getByTestId('overlay-insufficient-data-c1')).toBeInTheDocument();
    expect(screen.getByTestId('overlay-owner-c1')).toHaveTextContent('A. Owner');
    expect(screen.getByTestId('overlay-hbi-actions-c1')).toHaveTextContent('citation required');
  });

  it('renders essential mode deterministic badges only', () => {
    render(
      <ScoreBenchmarkGhostOverlay
        overlay={overlay()}
        bicOwnershipProjections={projections}
        complexity="Essential"
      />,
    );

    expect(screen.getByTestId('overlay-essential-context-badge')).toHaveTextContent('Benchmark context available');
    expect(screen.getByTestId('overlay-essential-recommendation-badge')).toHaveTextContent('Hold for Review');
  });
});
