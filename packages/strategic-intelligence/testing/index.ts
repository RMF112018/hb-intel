import type { IStrategicIntelligenceState, StrategicIntelligenceProfile } from '../src/types/index.js';
import { createStrategicIntelligenceState } from '../src/api/index.js';
import { createMockHeritageSnapshot } from './createMockHeritageSnapshot.js';
import { createMockStrategicIntelligenceEntry } from './createMockStrategicIntelligenceEntry.js';
import { createMockCommitmentRegisterItem } from './createMockCommitmentRegisterItem.js';
import { createMockHandoffReviewState } from './createMockHandoffReviewState.js';
import { createMockIntelligenceApprovalItem } from './createMockIntelligenceApprovalItem.js';
import { createMockIntelligenceConflict } from './createMockIntelligenceConflict.js';
import { createMockSuggestedIntelligenceMatch } from './createMockSuggestedIntelligenceMatch.js';
import { mockStrategicIntelligenceStates } from './mockStrategicIntelligenceStates.js';

export const createMockStrategicIntelligenceProfile = (
  overrides?: Partial<StrategicIntelligenceProfile>
): StrategicIntelligenceProfile => ({
  profileId: 'strategic-intelligence-mock',
  reliabilityDefaults: {
    staleThresholdDays: 30,
    reviewWindowDays: 14,
  },
  sensitivityDefaults: {
    defaultLevel: 'public-internal',
    redactRestrictedByDefault: true,
  },
  ...overrides,
});

export const createMockStrategicIntelligenceState = (
  scorecardId = 'scorecard-mock'
): IStrategicIntelligenceState => {
  const state = createStrategicIntelligenceState({ scorecardId });
  const preset = mockStrategicIntelligenceStates.livingIntelligenceApprovedFeed;
  return {
    ...state,
    heritageSnapshot: createMockHeritageSnapshot({
      ...preset.heritageSnapshot,
      scorecardId,
      snapshotId: `${scorecardId}-snapshot`,
    }),
    commitmentRegister: preset.commitmentRegister.map((item, index) =>
      createMockCommitmentRegisterItem({
        ...item,
        commitmentId: `${scorecardId}-commitment-${index + 1}`,
      })
    ),
    livingEntries: preset.livingEntries.map((entry, index) =>
      createMockStrategicIntelligenceEntry(
        {
          ...entry,
          entryId: `${scorecardId}-entry-${index + 1}`,
        },
        {
          entryId: `${scorecardId}-entry-${index + 1}`,
          lifecycleState: entry.lifecycleState,
          reliabilityTier: entry.trust.reliabilityTier,
          provenanceClass: entry.trust.provenanceClass,
          sensitivity: entry.sensitivity,
          stale: entry.trust.isStale,
          withConflict: entry.conflicts.length > 0,
          withSuggestion: entry.suggestedMatches.length > 0,
        }
      )
    ),
    handoffReview: preset.handoffReview
      ? createMockHandoffReviewState({
          ...preset.handoffReview,
          scorecardId,
        })
      : null,
    approvalQueue: preset.approvalQueue.map((item, index) =>
      createMockIntelligenceApprovalItem({
        ...item,
        queueItemId: `${scorecardId}-approval-${index + 1}`,
      })
    ),
    syncStatus: preset.syncStatus,
  };
};

export {
  createMockHeritageSnapshot,
  createMockStrategicIntelligenceEntry,
  createMockCommitmentRegisterItem,
  createMockHandoffReviewState,
  createMockIntelligenceApprovalItem,
  createMockIntelligenceConflict,
  createMockSuggestedIntelligenceMatch,
  mockStrategicIntelligenceStates,
};
