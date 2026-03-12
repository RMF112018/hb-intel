import React from 'react';
import {
  type IScoreBenchmarkDecisionSupportResult,
  type IScoreBenchmarkStateResult,
  ScoreBenchmarkApi,
  useBenchmarkDecisionSupport,
  useScoreBenchmarkFilters,
  useScoreBenchmarkState,
} from '@hbc/score-benchmark';
import {
  createMockBenchmarkFilterContext,
  createMockScoreGhostOverlayState,
  mockScoreBenchmarkStates,
} from '@hbc/score-benchmark/testing';
import { createMockBdScoreBenchmarkView } from '@hbc/features-business-development/testing';
import {
  BenchmarkFilterPanel,
  BenchmarkSummaryPanel,
  ScoreBenchmarkGhostOverlay,
  WinZoneIndicator,
} from './index.js';

const reviewerContext = {
  reviewerId: 'story-reviewer',
  role: 'business-development' as const,
};

const createStoryState = (overlayKey: keyof typeof mockScoreBenchmarkStates): IScoreBenchmarkStateResult => {
  const api = new ScoreBenchmarkApi({
    overlays: [
      {
        ...mockScoreBenchmarkStates[overlayKey],
        version: {
          ...mockScoreBenchmarkStates[overlayKey].version,
          snapshotId: 'story-entity',
        },
      },
    ],
    approvedCohorts: ['default', 'custom'],
  });

  return useScoreBenchmarkState({
    entityId: 'story-entity',
    filterContext: createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });
};

const createStoryDecisionSupport = (state: IScoreBenchmarkStateResult): IScoreBenchmarkDecisionSupportResult => {
  const api = new ScoreBenchmarkApi({
    overlays: state.overlay ? [state.overlay] : [createMockScoreGhostOverlayState()],
    approvedCohorts: ['default', 'custom'],
  });

  return useBenchmarkDecisionSupport({
    entityId: state.overlay?.version.snapshotId ?? 'story-entity',
    filterContext: state.overlay?.filterContext ?? createMockBenchmarkFilterContext(),
    reviewerContext,
  }, { api });
};

export const storybookMatrix = {
  recommendationByComplexity: [
    { recommendation: 'pursue', complexity: 'essential' },
    { recommendation: 'pursue-with-caution', complexity: 'standard' },
    { recommendation: 'hold-for-review', complexity: 'expert' },
    { recommendation: 'no-bid-recommended', complexity: 'expert' },
  ],
  confidenceTiers: ['high', 'moderate', 'low', 'insufficient'],
  similarityStrengths: ['highly-similar', 'moderately-similar', 'loosely-similar'],
  sampleDataStates: ['sufficient', 'insufficient'],
  overlapStates: ['overlap', 'no-overlap'],
  filterContexts: ['default', 'custom', 'guardrail-warning'],
  syncVariants: ['synced', 'saved-locally', 'queued-to-sync'],
} as const;

const defaultState = createStoryState('inWinZoneHighConfidence');
const cautionState = createStoryState('belowWinZoneModerateConfidence');
const overlapState = createStoryState('lossRiskOverlapActive');
const insufficientState = createStoryState('insufficientDataCaution');
const queuedState = createStoryState('queuedToSync');

const defaultDecisionSupport = createStoryDecisionSupport(defaultState);

const defaultFilters = useScoreBenchmarkFilters({
  entityId: 'story-entity',
  actorUserId: 'story-user',
  reviewerContext,
  initialContext: createMockBenchmarkFilterContext(),
  approvedCohorts: ['default', 'custom'],
  defaultCohortId: 'default',
});

const metadata = createMockBdScoreBenchmarkView();

export default {
  title: 'Features/BusinessDevelopment/ScoreBenchmark/Matrix',
};

export const SummaryRecommendationStandard = () => (
  <BenchmarkSummaryPanel
    state={cautionState}
    decisionSupport={defaultDecisionSupport}
    complexity="Standard"
  />
);

export const OverlayInsufficientExpert = () => (
  <ScoreBenchmarkGhostOverlay
    overlay={insufficientState.overlay}
    bicOwnershipProjections={insufficientState.bicOwnershipProjections}
    complexity="Expert"
    criterionScores={{ 'criterion-1': 48 }}
  />
);

export const IndicatorOverlapQueuedSync = () => (
  <WinZoneIndicator overlay={overlapState.overlay} complexity="Expert" currentScore={queuedState.overlay?.overallWinAvg} />
);

export const FilterPanelGuardrail = () => (
  <BenchmarkFilterPanel complexity="Expert" filters={defaultFilters} />
);

export const MetadataSmoke = () => (
  <section>
    <h4>{metadata.viewModel.recommendationCopy}</h4>
    <p>{metadata.reviewerConsensus.consensusLabel}</p>
  </section>
);
