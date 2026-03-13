import { describe, expect, it } from 'vitest';

import { PostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyTransitionCommand,
  createMockAutopsyTriggerInput,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy governance', () => {
  it('blocks review to approved when disagreements remain open', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());

    const review = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({ autopsyId: trigger.autopsyId, toStatus: 'review' })
    );
    expect(review.ok).toBe(true);

    const current = api.getRecord(trigger.autopsyId)!;
    current.autopsy.disagreements.push({
      disagreementId: 'disagreement-1',
      criterion: 'confidence',
      participants: ['a', 'b'],
      summary: 'Need more evidence',
      escalationRequired: true,
      resolutionStatus: 'open',
    });
    api.setRecordForTesting(current);

    const approved = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'approved',
        occurredAt: '2026-03-15T00:00:00.000Z',
      })
    );

    expect(approved.ok).toBe(false);
    if (!approved.ok) {
      expect(approved.reason).toBe('open-disagreements');
    }
  });

  it('enforces override approval metadata and preserves disagreement deadlock escalation', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());
    api.transitionAutopsy(
      createMockAutopsyTransitionCommand({ autopsyId: trigger.autopsyId, toStatus: 'review' })
    );

    const failedOverride = api.transitionAutopsy(
      createMockAutopsyTransitionCommand({
        autopsyId: trigger.autopsyId,
        toStatus: 'approved',
        occurredAt: '2026-03-15T00:00:00.000Z',
        overrideGovernance: {
          overrideReason: 'Policy exception',
          overriddenBy: 'actor-1',
          overriddenAt: '2026-03-15T00:00:00.000Z',
          approvalRequired: true,
          approvedBy: null,
          approvedAt: null,
        },
      })
    );

    const event = api.escalateDisagreementDeadlock(
      trigger.autopsyId,
      '2026-03-16T00:00:00.000Z',
      'Cross-functional disagreement remains unresolved.'
    );

    expect(failedOverride.ok).toBe(false);
    if (!failedOverride.ok) {
      expect(failedOverride.reason).toBe('override-approval-required');
    }
    expect(event.eventType).toBe('disagreement-deadlock');
    expect(api.getRecord(trigger.autopsyId)?.escalationEvents).toHaveLength(1);
  });
});
