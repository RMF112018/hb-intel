import { describe, expect, it } from 'vitest';

import { PostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyOwner,
  createMockAutopsyRecordSnapshot,
  createMockAutopsyTriggerInput,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy storage', () => {
  it('persists drafts through append-only version snapshots and preserves immutable published history', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());
    const originalVersion = api.getVersionEnvelope(trigger.autopsyId)!;

    const persisted = await api.persistDraft(
      trigger.autopsyId,
      {
        ...createMockAutopsyRecordSnapshot({
          autopsy: {
            ...trigger.record.autopsy,
            evidence: [
              {
                evidenceId: 'e-1',
                type: 'interview-note',
                sourceRef: 'src-1',
                capturedBy: 'actor-1',
                capturedAt: '2026-03-14T00:00:00.000Z',
                sensitivity: 'internal',
              },
            ],
          },
          auditTrail: trigger.record.auditTrail,
          assignments: trigger.record.assignments,
          sectionBicRecords: trigger.record.sectionBicRecords,
          sla: trigger.record.sla,
          escalationEvents: trigger.record.escalationEvents,
          notifications: trigger.record.notifications,
        }),
      },
      createMockAutopsyOwner({ userId: 'actor-1', role: 'Reviewer' }),
      '2026-03-14T00:00:00.000Z'
    );

    expect(persisted.queueStatus.status).toBe('saved-locally');
    expect(persisted.version.currentVersion.version).toBe(originalVersion.currentVersion.version + 1);
    expect(originalVersion.snapshots[0]?.snapshot.autopsy.status).toBe('draft');
    expect(api.getVersionEnvelope(trigger.autopsyId)?.snapshots).toHaveLength(2);
  });

  it('flags stale published records and creates a new revalidation version', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());
    const current = api.getRecord(trigger.autopsyId)!;
    current.autopsy.status = 'published';
    current.autopsy.reviewDecisions.push({
      stage: 'approver-review',
      decision: 'approved',
      reviewer: 'approver-1',
      decidedAt: '2026-03-15T00:00:00.000Z',
    });
    current.autopsy.publicationGate.publishable = true;
    current.autopsy.publicationGate.blockers = [];
    current.auditTrail.push({
      auditId: `${trigger.autopsyId}:published:2026-03-15T00:00:00.000Z`,
      autopsyId: trigger.autopsyId,
      fromStatus: 'approved',
      toStatus: 'published',
      occurredAt: '2026-03-15T00:00:00.000Z',
      actor: trigger.record.assignments.primaryAuthor,
      reason: 'Published',
      changeSummary: 'Published',
    });
    api.setRecordForTesting(current);

    const stale = api.evaluateStaleness(trigger.autopsyId, '2026-04-20T00:00:00.000Z', 30);
    const revalidated = api.revalidatePublishedAutopsy(
      trigger.autopsyId,
      trigger.record.assignments.primaryAuthor,
      '2026-04-21T00:00:00.000Z'
    );

    expect(stale.isStale).toBe(true);
    expect(stale.requiresRevalidation).toBe(true);
    expect(revalidated.record.autopsy.status).toBe('review');
    expect(revalidated.version.currentVersion.version).toBeGreaterThan(1);
    expect(revalidated.version.snapshots[0]?.snapshot.autopsy.status).toBe('draft');
  });
});
