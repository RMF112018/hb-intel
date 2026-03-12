import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  IScoreBenchmarkDecisionSupportResult,
  IScoreBenchmarkStateResult,
} from '@hbc/score-benchmark';
import { BenchmarkSummaryPanel } from './BenchmarkSummaryPanel.js';

const createState = (syncStatus: IScoreBenchmarkStateResult['overlay'] extends null ? never : 'saved-locally' | 'queued-to-sync' | 'synced'): IScoreBenchmarkStateResult => ({
  cacheKey: ['score-benchmark', 'entity-1', {}, { reviewerId: 'r1', role: 'business-development' }],
  status: 'success',
  isLoading: false,
  isError: false,
  errorMessage: null,
  overlay: {
    benchmarks: [],
    overallWinAvg: 76,
    overallLossAvg: 60,
    overallWinZoneMin: 72,
    overallWinZoneMax: 88,
    distanceToWinZone: 3,
    lossRiskOverlap: true,
    filterContext: {},
    recommendation: {
      state: 'no-bid-recommended',
      rationaleCodes: [],
      derivedFrom: {
        distanceToWinZone: 3,
        lossRiskOverlap: true,
        confidenceTier: 'low',
        similarity: 0.6,
        consensusStrength: 0.4,
      },
    },
    consensus: {
      variance: 0.3,
      consensusStrength: 0.4,
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
    syncStatus,
  },
  bicOwnershipProjections: [],
  normalizedDistanceToWinZone: 0.04,
  hasLossRiskOverlap: true,
  governanceWarning: { triggered: false, message: null },
  stale: { isStale: false, staleMs: 0 },
  sync: { status: syncStatus, badgeLabel: syncStatus === 'saved-locally' ? 'Saved locally' : syncStatus === 'queued-to-sync' ? 'Queued to sync' : 'Synced', queuedCount: 0, lastReplayedAt: null },
  actions: {
    refresh: () => createState(syncStatus),
    replayQueuedMutations: () => createState('synced'),
    queueLocalMutation: () => createState('queued-to-sync'),
  },
});

const decisionSupport: IScoreBenchmarkDecisionSupportResult = {
  baseState: createState('synced'),
  confidenceReasons: [],
  recommendationRationale: [],
  noBidRationaleDraft: '',
  mostSimilarPursuits: [],
  explainability: [],
  recalibrationSummaries: [],
  panelContext: { panel: null },
  panelHydration: { baseHydrated: true, detailHydrated: true },
  actions: {
    setNoBidRationaleDraft: () => undefined,
    queueRecommendationOverride: () => createState('queued-to-sync'),
    queueNoBidRationaleSave: () => ({ entityId: 'e1', payload: { artifactId: 'a', rationale: 'r', citations: [], approvedAt: new Date().toISOString() }, approvedBy: 'r1', savedAt: new Date().toISOString() }),
    openPanel: () => '?sbPanel=similar-pursuits',
    closePanel: () => '',
  },
};

describe('BenchmarkSummaryPanel', () => {
  it('renders recommendation banner, win-zone summary, and sync badges', () => {
    render(<BenchmarkSummaryPanel state={createState('saved-locally')} decisionSupport={decisionSupport} complexity="Standard" />);

    expect(screen.getByTestId('summary-recommendation-banner')).toHaveTextContent('No-Bid Recommended');
    expect(screen.getByTestId('summary-win-zone-range')).toHaveTextContent('72 - 88');
    expect(screen.getByTestId('summary-sync-badge')).toHaveTextContent('Saved locally');
  });

  it('wires required actions and expert interactivity markers', () => {
    const onOpenFilterPanel = vi.fn();
    const onLaunchNoBidRationale = vi.fn();

    render(
      <BenchmarkSummaryPanel
        state={createState('queued-to-sync')}
        decisionSupport={decisionSupport}
        complexity="Expert"
        onOpenFilterPanel={onOpenFilterPanel}
        onLaunchNoBidRationale={onLaunchNoBidRationale}
      />,
    );

    fireEvent.click(screen.getByText('Open Filter Panel'));
    fireEvent.click(screen.getByTestId('summary-no-bid-action'));

    expect(onOpenFilterPanel).toHaveBeenCalledTimes(1);
    expect(onLaunchNoBidRationale).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('summary-sync-badge')).toHaveTextContent('Queued to sync');
    expect(screen.getByTestId('summary-expert-interactivity')).toBeInTheDocument();
  });
});
