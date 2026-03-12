import { describe, expect, it } from 'vitest';
import {
  createLivingStrategicIntelligenceEntry,
  createStrategicIntelligenceState,
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
} from '../index.js';
import { useStrategicIntelligenceApprovalQueue } from './useStrategicIntelligenceApprovalQueue.js';

describe('strategic intelligence approval hook', () => {
  it('submits entry for approval and inserts pending queue item', () => {
    const scorecardId = 'approval-hook-test';
    const api = new StrategicIntelligenceApi([createStrategicIntelligenceState({ scorecardId })]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const queue = useStrategicIntelligenceApprovalQueue(
      {
        projectId: scorecardId,
        actorUserId: 'approver-1',
      },
      {
        api,
        lifecycleApi,
        now: () => new Date('2026-03-12T00:00:00.000Z'),
      }
    );

    const draftEntry = createLivingStrategicIntelligenceEntry({
      entryId: 'entry-submit-1',
      title: 'Submitted draft',
      lifecycleState: 'submitted',
      trust: {
        ...createLivingStrategicIntelligenceEntry().trust,
        provenanceClass: 'meeting-summary',
        aiTrustDowngraded: false,
      },
    });

    const submitted = queue.actions.submitForApproval({
      entry: draftEntry,
      reviewNotes: 'Initial submission',
    });

    expect(submitted.queue.length).toBe(1);
    expect(submitted.queue[0]?.approvalStatus).toBe('pending');
    expect(submitted.queue[0]?.entryId).toBe('entry-submit-1');

    const latestEntry = api.getLivingEntries(scorecardId).find((entry) => entry.entryId === 'entry-submit-1');
    expect(latestEntry?.lifecycleState).toBe('pending-approval');
    expect(latestEntry?.trust.provenanceClass).toBe('ai-assisted-draft');
    expect(latestEntry?.trust.aiTrustDowngraded).toBe(true);
  });
});
