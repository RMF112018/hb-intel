import React from 'react';
import { createSuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import {
  BdHeritagePanel,
  IntelligenceExplainabilityDrawer,
  StrategicIntelligenceFeed,
} from './index.js';

const storyState = createMockStrategicIntelligenceState('story-strategic-intelligence');
storyState.livingEntries = [
  {
    ...storyState.livingEntries[0],
    entryId: 'story-entry-approved',
    lifecycleState: 'approved',
    sensitivity: 'public-internal',
  },
  {
    ...storyState.livingEntries[0],
    entryId: 'story-entry-pending',
    lifecycleState: 'pending-approval',
    sensitivity: 'restricted-project',
    trust: {
      ...storyState.livingEntries[0].trust,
      isStale: true,
      reliabilityTier: 'review-required',
    },
  },
];

const suggestions = [
  createSuggestedIntelligenceMatch({ suggestionId: 'story-heritage', reason: 'heritage snapshot match' }),
  createSuggestedIntelligenceMatch({ suggestionId: 'story-intelligence', reason: 'intelligence metadata match' }),
];

export const storybookMatrix = {
  complexityModes: ['Essential', 'Standard', 'Expert'],
  lifecycleStates: ['approved', 'pending-approval', 'rejected'],
  sensitivityStates: ['public-internal', 'restricted-project', 'confidential'],
  suggestionVariants: ['Suggested Heritage', 'Suggested Intelligence'],
  syncVariants: ['synced', 'saved-locally', 'queued-to-sync'],
} as const;

export default {
  title: 'Features/BusinessDevelopment/StrategicIntelligence/Matrix',
};

export const HeritagePanelStandard = () => (
  <BdHeritagePanel
    heritageSnapshot={storyState.heritageSnapshot}
    livingEntries={storyState.livingEntries}
    commitments={storyState.commitmentRegister}
    handoffReview={storyState.handoffReview}
    suggestions={suggestions}
    complexity="Standard"
    syncBadge="Saved locally"
  />
);

export const LivingFeedExpert = () => (
  <StrategicIntelligenceFeed
    entries={storyState.livingEntries}
    suggestions={suggestions}
    canViewNonApproved
  />
);

export const ExplainabilitySurface = () => (
  <IntelligenceExplainabilityDrawer
    suggestion={{
      suggestionId: 'story-heritage',
      reason: 'heritage snapshot match',
      matchedDimensions: ['client', 'sector'],
      reuseHistoryCount: 7,
    }}
  />
);
