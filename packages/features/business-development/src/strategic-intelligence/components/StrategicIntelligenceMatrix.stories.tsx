import React from 'react';
import { createSuggestedIntelligenceMatch } from '@hbc/strategic-intelligence';
import {
  createMockStrategicIntelligenceState,
  mockStrategicIntelligenceStates,
} from '@hbc/strategic-intelligence/testing';
import {
  BdHeritagePanel,
  IntelligenceExplainabilityDrawer,
  StrategicIntelligenceFeed,
} from './index.js';

const storyState = createMockStrategicIntelligenceState('story-strategic-intelligence');
const queueState = mockStrategicIntelligenceStates.pendingRejectedRevisionQueue;
const trustState = mockStrategicIntelligenceStates.trustTierMatrix;
const redactedState = mockStrategicIntelligenceStates.sensitivityRedactedVsFull;

const suggestions = [
  createSuggestedIntelligenceMatch({ suggestionId: 'story-heritage', reason: 'heritage snapshot match' }),
  createSuggestedIntelligenceMatch({ suggestionId: 'story-intelligence', reason: 'intelligence metadata match' }),
];

export const storybookMatrix = {
  complexityModes: ['Essential', 'Standard', 'Expert'],
  lifecycleStates: ['inherited', 'approved', 'pending-approval', 'rejected', 'stale', 'conflicted'],
  trustTiers: ['high', 'moderate', 'low', 'review-required'],
  provenanceClasses: [
    'firsthand-observation',
    'meeting-summary',
    'project-outcome-learning',
    'inferred-observation',
    'ai-assisted-draft',
  ],
  visibilityStates: ['full', 'redacted'],
  suggestionVariants: ['Suggested Heritage', 'Suggested Intelligence'],
  syncVariants: ['synced', 'saved-locally', 'queued-to-sync'],
} as const;

export default {
  title: 'Features/BusinessDevelopment/StrategicIntelligence/Matrix',
};

export const HeritagePanelStandard = () => (
  <BdHeritagePanel
    heritageSnapshot={storyState.heritageSnapshot}
    livingEntries={queueState.livingEntries}
    commitments={storyState.commitmentRegister}
    handoffReview={mockStrategicIntelligenceStates.handoffAcknowledgmentIncomplete.handoffReview}
    suggestions={suggestions}
    complexity="Standard"
    syncBadge="Saved locally"
  />
);

export const LivingFeedExpert = () => (
  <StrategicIntelligenceFeed
    entries={trustState.livingEntries}
    suggestions={mockStrategicIntelligenceStates.suggestedHeritageAndIntelligence.livingEntries.flatMap(
      (entry) => entry.suggestedMatches
    )}
    canViewNonApproved
  />
);

export const RedactedFeedStandard = () => (
  <StrategicIntelligenceFeed
    entries={redactedState.livingEntries}
    suggestions={suggestions}
    canViewNonApproved
    canViewSensitiveContent={false}
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
