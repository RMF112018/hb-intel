import type { IStrategicIntelligenceState } from '../src/types/index.js';
import { createMockHeritageSnapshot } from './createMockHeritageSnapshot.js';
import { createMockStrategicIntelligenceEntry } from './createMockStrategicIntelligenceEntry.js';
import { createMockCommitmentRegisterItem } from './createMockCommitmentRegisterItem.js';
import { createMockHandoffReviewState } from './createMockHandoffReviewState.js';
import { createMockIntelligenceApprovalItem } from './createMockIntelligenceApprovalItem.js';
import { createMockIntelligenceConflict } from './createMockIntelligenceConflict.js';
import { createMockSuggestedIntelligenceMatch } from './createMockSuggestedIntelligenceMatch.js';
import { createStrategicIntelligenceState } from '../src/api/index.js';

const createBaseState = (scorecardId: string): IStrategicIntelligenceState => {
  const base = createStrategicIntelligenceState({ scorecardId });
  return {
    ...base,
    heritageSnapshot: createMockHeritageSnapshot({ scorecardId, snapshotId: `${scorecardId}-snapshot` }),
  };
};

const withReplaySynced = (state: IStrategicIntelligenceState): IStrategicIntelligenceState => ({
  ...state,
  syncStatus: 'synced',
  version: {
    ...state.version,
    version: 3,
    changeSummary: 'Replay reconciled.',
    tag: 'approved',
  },
});

const heritageOnly = createBaseState('si-state-heritage-only');
heritageOnly.livingEntries = [];
heritageOnly.commitmentRegister = [];
heritageOnly.approvalQueue = [];
heritageOnly.handoffReview = null;

const approvedFeed = createBaseState('si-state-approved-feed');
approvedFeed.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-approved-1',
    lifecycleState: 'approved',
    reliabilityTier: 'high',
    provenanceClass: 'meeting-summary',
    withSuggestion: true,
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-approved-2',
    lifecycleState: 'approved',
    reliabilityTier: 'moderate',
    provenanceClass: 'project-outcome-learning',
  }),
];
approvedFeed.approvalQueue = [];

const queueStates = createBaseState('si-state-queue-states');
queueStates.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-pending',
    lifecycleState: 'pending-approval',
    provenanceClass: 'ai-assisted-draft',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-rejected',
    lifecycleState: 'rejected',
    reliabilityTier: 'low',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-revision',
    lifecycleState: 'revision-requested',
    reliabilityTier: 'review-required',
  }),
];
queueStates.approvalQueue = [
  createMockIntelligenceApprovalItem({ entryId: 'entry-pending', approvalStatus: 'pending' }),
  createMockIntelligenceApprovalItem({
    queueItemId: 'approval-item-rejected',
    entryId: 'entry-rejected',
    approvalStatus: 'rejected',
    reviewedBy: 'approver-1',
    reviewedAt: '2026-03-13T00:00:00.000Z',
    reviewNotes: 'Insufficient evidence.',
  }),
  createMockIntelligenceApprovalItem({
    queueItemId: 'approval-item-revision',
    entryId: 'entry-revision',
    approvalStatus: 'revision-requested',
    reviewedBy: 'approver-2',
    reviewedAt: '2026-03-13T00:00:00.000Z',
    reviewNotes: 'Clarify risk rationale.',
  }),
];

const trustTiers = createBaseState('si-state-trust-tiers');
trustTiers.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-trust-high',
    reliabilityTier: 'high',
    lifecycleState: 'approved',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-trust-moderate',
    reliabilityTier: 'moderate',
    lifecycleState: 'approved',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-trust-low',
    reliabilityTier: 'low',
    lifecycleState: 'approved',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-trust-review',
    reliabilityTier: 'review-required',
    lifecycleState: 'approved',
  }),
];

const provenanceClasses = createBaseState('si-state-provenance');
provenanceClasses.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-provenance-firsthand',
    provenanceClass: 'firsthand-observation',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-provenance-meeting',
    provenanceClass: 'meeting-summary',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-provenance-project',
    provenanceClass: 'project-outcome-learning',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-provenance-inferred',
    provenanceClass: 'inferred-observation',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-provenance-ai',
    provenanceClass: 'ai-assisted-draft',
    lifecycleState: 'pending-approval',
  }),
];

const staleReviewDue = createBaseState('si-state-stale-review-due');
staleReviewDue.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-stale',
    stale: true,
    lifecycleState: 'approved',
  }),
];

const handoffIncomplete = createBaseState('si-state-handoff-incomplete');
handoffIncomplete.handoffReview = createMockHandoffReviewState({
  scorecardId: handoffIncomplete.heritageSnapshot.scorecardId,
  participants: [
    {
      participantId: 'pm-1',
      displayName: 'Pat PM',
      role: 'PM',
      acknowledgedAt: '2026-03-12T00:30:00.000Z',
    },
    {
      participantId: 'px-1',
      displayName: 'Alex PX',
      role: 'PX',
      acknowledgedAt: null,
    },
  ],
  outstandingCommitmentIds: ['commitment-mock'],
});
handoffIncomplete.commitmentRegister = [
  createMockCommitmentRegisterItem({ commitmentId: 'commitment-mock', fulfillmentStatus: 'open' }),
];

const handoffComplete = createBaseState('si-state-handoff-complete');
handoffComplete.handoffReview = createMockHandoffReviewState({
  scorecardId: handoffComplete.heritageSnapshot.scorecardId,
  completionStatus: 'completed',
  participants: [
    {
      participantId: 'pm-1',
      displayName: 'Pat PM',
      role: 'PM',
      acknowledgedAt: '2026-03-12T00:30:00.000Z',
    },
    {
      participantId: 'px-1',
      displayName: 'Alex PX',
      role: 'PX',
      acknowledgedAt: '2026-03-12T00:40:00.000Z',
    },
  ],
  outstandingCommitmentIds: [],
});
handoffComplete.commitmentRegister = [
  createMockCommitmentRegisterItem({ commitmentId: 'commitment-mock', fulfillmentStatus: 'fulfilled' }),
];

const conflictResolution = createBaseState('si-state-conflict-resolution');
conflictResolution.livingEntries = [
  createMockStrategicIntelligenceEntry(
    {
      conflicts: [
        createMockIntelligenceConflict({
          conflictId: 'conflict-open',
          type: 'contradiction',
          relatedEntryIds: ['entry-conflict'],
          resolutionStatus: 'open',
        }),
        createMockIntelligenceConflict({
          conflictId: 'conflict-resolved',
          type: 'supersession',
          relatedEntryIds: ['entry-conflict'],
          resolutionStatus: 'resolved',
          resolutionNote: 'Superseded by approved entry.',
          resolvedAt: '2026-03-13T00:00:00.000Z',
          resolvedBy: 'approver-1',
        }),
      ],
    },
    {
      entryId: 'entry-conflict',
      lifecycleState: 'approved',
      withConflict: true,
    }
  ),
];

const redactedVsFull = createBaseState('si-state-redacted-full');
redactedVsFull.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-public',
    lifecycleState: 'approved',
    sensitivity: 'public-internal',
  }),
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-restricted',
    lifecycleState: 'approved',
    sensitivity: 'restricted-project',
  }),
];

const suggestionsExplainability = createBaseState('si-state-suggestions');
suggestionsExplainability.livingEntries = [
  createMockStrategicIntelligenceEntry(
    {
      suggestedMatches: [
        createMockSuggestedIntelligenceMatch({
          suggestionId: 'suggested-heritage',
          reason: 'heritage snapshot match',
          matchedDimensions: ['client', 'sector'],
          reuseHistoryCount: 7,
        }),
        createMockSuggestedIntelligenceMatch({
          suggestionId: 'suggested-intelligence',
          reason: 'living intelligence metadata match',
          matchedDimensions: ['deliveryMethod', 'geography'],
          reuseHistoryCount: 3,
        }),
      ],
    },
    {
      entryId: 'entry-suggestion',
      lifecycleState: 'approved',
      withSuggestion: true,
    }
  ),
];

const syncTransitions = createBaseState('si-state-sync-transitions');
syncTransitions.livingEntries = [
  createMockStrategicIntelligenceEntry(undefined, {
    entryId: 'entry-sync',
    lifecycleState: 'approved',
  }),
];
const savedLocally = {
  ...syncTransitions,
  syncStatus: 'saved-locally' as const,
};
const queuedToSync = {
  ...syncTransitions,
  syncStatus: 'queued-to-sync' as const,
};
const replayReconciled = withReplaySynced(syncTransitions);

export const mockStrategicIntelligenceStates: Readonly<
  Record<string, IStrategicIntelligenceState>
> = {
  heritageSnapshotOnly: heritageOnly,
  livingIntelligenceApprovedFeed: approvedFeed,
  pendingRejectedRevisionQueue: queueStates,
  trustTierMatrix: trustTiers,
  provenanceClassMatrix: provenanceClasses,
  staleReviewDue: staleReviewDue,
  handoffAcknowledgmentIncomplete: handoffIncomplete,
  handoffAcknowledgmentComplete: handoffComplete,
  contradictionSupersessionResolution: conflictResolution,
  sensitivityRedactedVsFull: redactedVsFull,
  suggestedHeritageAndIntelligence: suggestionsExplainability,
  syncSavedLocally: savedLocally,
  syncQueuedToSync: queuedToSync,
  syncReplayReconciled: replayReconciled,
};
