import { describe, expect, it } from 'vitest';
import {
  createMockCommitmentRegisterItem,
  createMockHandoffReviewState,
  createMockHeritageSnapshot,
  createMockIntelligenceApprovalItem,
  createMockIntelligenceConflict,
  createMockStrategicIntelligenceEntry,
  createMockStrategicIntelligenceProfile,
  createMockSuggestedIntelligenceMatch,
  mockStrategicIntelligenceStates,
} from '@hbc/strategic-intelligence/testing';

describe('strategic intelligence testing public exports', () => {
  it('resolves fixture factories from the public testing entrypoint', () => {
    expect(createMockStrategicIntelligenceProfile().profileId).toContain('strategic-intelligence');
    expect(createMockHeritageSnapshot().immutable).toBe(true);
    expect(createMockStrategicIntelligenceEntry().entryId).toContain('living-entry');
    expect(createMockCommitmentRegisterItem().commitmentId).toContain('commitment');
    expect(createMockHandoffReviewState().reviewId).toContain('handoff-review');
    expect(createMockIntelligenceApprovalItem().queueItemId).toContain('approval-item');
    expect(createMockIntelligenceConflict().conflictId).toContain('conflict');
    expect(createMockSuggestedIntelligenceMatch().suggestionId).toContain('suggestion');
    expect(mockStrategicIntelligenceStates.syncReplayReconciled.syncStatus).toBe('synced');
  });
});
