import type { Meta, StoryObj } from '@storybook/react';
import { beforeEach } from 'storybook/internal/preview-api';
import { PostBidAutopsyApi, resetPostBidAutopsyStateStore, setPostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyRecordSnapshot,
  createMockPostBidAutopsyRecord,
} from '@hbc/post-bid-autopsy/testing';

import { AutopsyListView } from './AutopsyListView.js';

const seedStoryApi = () => {
  resetPostBidAutopsyStateStore();
  const api = new PostBidAutopsyApi();

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'story-1',
        pursuitId: 'story-pursuit-1',
        status: 'review',
        outcome: 'lost',
        confidence: {
          tier: 'low',
          score: 0.41,
          reasons: ['Needs corroboration'],
          evidenceCoverage: 0.5,
        },
        evidence: [],
        publicationGate: {
          publishable: false,
          blockers: ['needs-evidence'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
      }),
    })
  );

  api.setRecordForTesting(
    createMockAutopsyRecordSnapshot({
      autopsy: createMockPostBidAutopsyRecord({
        autopsyId: 'story-2',
        pursuitId: 'story-pursuit-2',
        status: 'superseded',
        outcome: 'lost',
        confidence: {
          tier: 'moderate',
          score: 0.72,
          reasons: ['Superseded'],
          evidenceCoverage: 1,
        },
        evidence: [
          { evidenceId: 'e-1', type: 'cost-artifact', sourceRef: 'pricing', capturedBy: 'u1', capturedAt: '2026-03-13T00:00:00.000Z', sensitivity: 'internal' },
          { evidenceId: 'e-2', type: 'field-observation', sourceRef: 'field', capturedBy: 'u1', capturedAt: '2026-03-13T00:00:00.000Z', sensitivity: 'internal' },
        ],
        disagreements: [
          {
            disagreementId: 'd-1',
            criterion: 'scope',
            participants: ['A'],
            summary: 'Conflict',
            escalationRequired: false,
            resolutionStatus: 'open',
          },
        ],
        supersession: {
          supersededByAutopsyId: 'story-3',
        },
        publicationGate: {
          publishable: false,
          blockers: ['conflict-review'],
          minimumConfidenceTier: 'moderate',
          requiredEvidenceCount: 2,
        },
        telemetry: {
          autopsyCompletionLatency: 4,
          repeatErrorReductionRate: 0.2,
          intelligenceSeedingConversionRate: 0.3,
          benchmarkAccuracyLift: 0.15,
          corroborationRate: 0.55,
          staleIntelligenceRate: 0.4,
          revalidationLatency: 2,
          reinsertionAdoptionRate: 0.1,
          autopsyCes: 0.5,
        },
      }),
    })
  );

  setPostBidAutopsyApi('estimating-story', api);
};

const meta: Meta<typeof AutopsyListView> = {
  title: 'Features/Estimating/PostBidLearning/AutopsyListView',
  component: AutopsyListView,
  args: {
    apiScope: 'estimating-story',
    viewerRole: 'chief-estimator',
    pursuitMetadata: [
      { pursuitId: 'story-pursuit-1', pursuitName: 'Low Confidence Pursuit', estimatorName: 'Morgan', projectType: 'Healthcare' },
      { pursuitId: 'story-pursuit-2', pursuitName: 'Conflict Pursuit', estimatorName: 'Riley', projectType: 'Commercial' },
    ],
  },
  decorators: [
    (Story) => {
      seedStoryApi();
      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof AutopsyListView>;

export const NeedsCorroboration: Story = {};

export const StaleConflict: Story = {
  play: async () => {
    beforeEach(() => {
      seedStoryApi();
    });
  },
};
