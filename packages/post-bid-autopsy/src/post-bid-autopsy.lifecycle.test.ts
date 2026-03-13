import { describe, expect, it } from 'vitest';

import { PostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyTransitionCommand,
  createMockAutopsyTriggerInput,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy lifecycle', () => {
  it('supports valid transitions and rejects invalid ones deterministically', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());

    const toReview = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({ autopsyId: trigger.autopsyId, toStatus: 'review' })
    );
    const invalid = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'published',
        occurredAt: '2026-03-15T00:00:00.000Z',
      })
    );

    expect(toReview.ok).toBe(true);
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.reason).toBe('invalid-transition');
    }
  });

  it('supports reopen, supersession, archival, and overdue transitions', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(
      createMockAutopsyTriggerInput({
        triggeredAt: '2026-03-10T00:00:00.000Z',
      })
    );

    api.transitionAutopsy(
      createMockAutopsyTransitionCommand({ autopsyId: trigger.autopsyId, toStatus: 'review' })
    );
    const approved = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'approved',
        occurredAt: '2026-03-15T00:00:00.000Z',
      })
    );
    const reopened = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'review',
        occurredAt: '2026-03-16T00:00:00.000Z',
      })
    );

    expect(approved.ok).toBe(true);
    expect(reopened.ok).toBe(true);

    api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'approved',
        occurredAt: '2026-03-17T00:00:00.000Z',
      })
    );
    const publishableRecord = api.getRecord(trigger.autopsyId)!;
    publishableRecord.autopsy.reviewDecisions.push({
      stage: 'approver-review',
      decision: 'approved',
      reviewer: 'approver-1',
      decidedAt: '2026-03-17T00:00:00.000Z',
    });
    publishableRecord.autopsy.evidence = [
      {
        evidenceId: 'e-1',
        type: 'interview-note',
        sourceRef: 'src-1',
        capturedBy: 'actor-1',
        capturedAt: '2026-03-17T00:00:00.000Z',
        sensitivity: 'internal',
      },
      {
        evidenceId: 'e-2',
        type: 'field-observation',
        sourceRef: 'src-2',
        capturedBy: 'actor-1',
        capturedAt: '2026-03-17T00:00:00.000Z',
        sensitivity: 'internal',
      },
    ];
    publishableRecord.autopsy.publicationGate.publishable = true;
    publishableRecord.autopsy.publicationGate.blockers = [];
    api.setRecordForTesting(publishableRecord);
    api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'published',
        occurredAt: '2026-03-18T00:00:00.000Z',
      })
    );
    const superseded = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'superseded',
        occurredAt: '2026-03-19T00:00:00.000Z',
        relatedAutopsyId: 'autopsy:newer',
        reason: 'Newer validated autopsy published',
      })
    );
    const archived = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'archived',
        occurredAt: '2026-03-20T00:00:00.000Z',
        reason: 'Retention archived',
      })
    );

    const overdueTrigger = await api.processTrigger(
      createMockAutopsyTriggerInput({
        pursuitId: 'overdue-pursuit',
        scorecardId: 'overdue-scorecard',
        triggeredAt: '2026-03-03T00:00:00.000Z',
      })
    );
    const escalations = api.evaluateOverdueAutopsies('2026-03-11T00:00:00.000Z');

    expect(superseded.ok).toBe(true);
    expect(archived.ok).toBe(true);
    expect(escalations.some((event) => event.autopsyId === overdueTrigger.autopsyId)).toBe(true);
    expect(api.getRecord(overdueTrigger.autopsyId)?.autopsy.status).toBe('overdue');
  });
});
