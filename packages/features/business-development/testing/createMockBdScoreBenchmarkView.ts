import type {
  BdScoreBenchmarkViewModel,
  ReviewerConsensusSummary,
} from '../src/score-benchmark/adapters/index.js';

export interface MockBdScoreBenchmarkView {
  viewModel: BdScoreBenchmarkViewModel;
  reviewerConsensus: ReviewerConsensusSummary;
}

export const createMockBdScoreBenchmarkView = (
  overrides?: Partial<MockBdScoreBenchmarkView>
): MockBdScoreBenchmarkView => ({
  viewModel: {
    recommendationLabel: 'pursue-with-caution',
    recommendationCopy: 'Proceed with caution; benchmark overlap indicates elevated loss risk.',
    confidenceTierLabel: 'moderate',
    explainabilitySummary: 'Win-zone gap remains across client-fit criterion.',
    version: {
      snapshotId: 'entity-1',
      version: 1,
      createdAt: '2026-03-12T00:00:00.000Z',
      createdBy: {
        userId: 'score-benchmark-system',
        displayName: 'Score Benchmark System',
        role: 'system',
      },
      changeSummary: 'Mock score benchmark view.',
      tag: 'draft',
    },
    syncStatus: 'queued-to-sync',
    syncBadgeLabel: 'Queued to sync',
    filterGovernanceEvents: [],
    governanceWarning: {
      triggered: true,
      message: 'Filter change requires governance confirmation.',
    },
  },
  reviewerConsensus: {
    consensusLabel: 'Divergent',
    disagreementCount: 2,
    escalationRecommended: true,
  },
  ...overrides,
});
