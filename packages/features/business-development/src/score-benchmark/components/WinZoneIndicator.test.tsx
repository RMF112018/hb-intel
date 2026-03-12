import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { IScoreGhostOverlayState } from '@hbc/score-benchmark';
import { WinZoneIndicator } from './WinZoneIndicator.js';

const overlay = (): IScoreGhostOverlayState => ({
  benchmarks: [
    {
      criterionId: 'c1',
      criterionLabel: 'Client Fit',
      winAvg: 75,
      lossAvg: 60,
      winZoneMin: 72,
      winZoneMax: 88,
      lossRiskZoneMin: 58,
      lossRiskZoneMax: 76,
      sampleSize: 4,
      isStatisticallySignificant: false,
      confidence: {
        tier: 'low',
        sampleSizeScore: 0.4,
        similarityScore: 0.5,
        recencyScore: 0.6,
        completenessScore: 0.8,
        reasons: ['weak-benchmark-confidence'],
        caution: true,
      },
      similarity: {
        overallSimilarity: 0.66,
        strengthBand: 'moderately-similar',
        factorBreakdown: [],
        mostSimilarPursuits: [],
      },
      explainability: {
        criterionId: 'c1',
        reasonCodes: ['weak-benchmark-confidence'],
        narrative: 'Benchmark confidence is limited',
        relatedHistoricalExamples: [],
      },
    },
  ],
  overallWinAvg: 74,
  overallLossAvg: 60,
  overallWinZoneMin: 72,
  overallWinZoneMax: 88,
  distanceToWinZone: 3,
  lossRiskOverlap: true,
  filterContext: {},
  recommendation: {
    state: 'pursue-with-caution',
    rationaleCodes: ['loss-risk-zone-overlap'],
    derivedFrom: {
      distanceToWinZone: 3,
      lossRiskOverlap: true,
      confidenceTier: 'low',
      similarity: 0.66,
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

describe('WinZoneIndicator', () => {
  it('renders expert spectrum, markers, overlap status, and caution framing', () => {
    const onOpenNoBidRationale = vi.fn();
    render(
      <WinZoneIndicator
        overlay={overlay()}
        complexity="Expert"
        currentScore={69}
        onOpenNoBidRationale={onOpenNoBidRationale}
      />,
    );

    expect(screen.getByTestId('win-zone-spectrum')).toBeInTheDocument();
    expect(screen.getByTestId('win-zone-markers')).toHaveTextContent('Current score marker: 69');
    expect(screen.getByTestId('win-zone-overlap-status')).toBeInTheDocument();
    expect(screen.getByTestId('win-zone-caution-copy')).toHaveTextContent('Caution framing required');

    fireEvent.click(screen.getByText(/Generate governed no-bid rationale/));
    expect(onOpenNoBidRationale).toHaveBeenCalledTimes(1);
  });

  it('renders compact essential state only', () => {
    render(<WinZoneIndicator overlay={overlay()} complexity="Essential" />);
    expect(screen.getByTestId('win-zone-essential-copy')).toBeInTheDocument();
  });
});
