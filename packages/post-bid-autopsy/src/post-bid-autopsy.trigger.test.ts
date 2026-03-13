import { describe, expect, it } from 'vitest';

import { PostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyTriggerInput,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy trigger', () => {
  it('creates autopsies for Won, Lost, and No-Bid terminal pursuit statuses', async () => {
    const api = new PostBidAutopsyApi();

    const won = await api.processTrigger(createMockAutopsyTriggerInput({ status: 'Won' }));
    const lost = await api.processTrigger(
      createMockAutopsyTriggerInput({ status: 'Lost', pursuitId: 'pursuit-lost', scorecardId: 'scorecard-lost' })
    );
    const noBid = await api.processTrigger(
      createMockAutopsyTriggerInput({
        status: 'No-Bid',
        pursuitId: 'pursuit-no-bid',
        scorecardId: 'scorecard-no-bid',
      })
    );

    expect(won.record.autopsy.outcome).toBe('won');
    expect(lost.record.autopsy.outcome).toBe('lost');
    expect(noBid.record.autopsy.outcome).toBe('no-bid');
  });

  it('creates section-level bic records, assignments, sla, and notifications in one deterministic trigger path', async () => {
    const api = new PostBidAutopsyApi();
    const result = await api.processTrigger(createMockAutopsyTriggerInput());

    expect(result.created).toBe(true);
    expect(result.record.sectionBicRecords).toHaveLength(2);
    expect(result.record.sectionBicRecords[0]?.bicRecordId).toBe(`bic:${result.autopsyId}:pricing`);
    expect(result.record.assignments.primaryAuthor.userId).toBe('primary-1');
    expect(result.record.assignments.coAuthors[0]?.userId).toBe('co-1');
    expect(result.record.sla.startedAt).toBe('2026-03-13T00:00:00.000Z');
    expect(result.record.sla.dueAt).toBe('2026-03-20T00:00:00.000Z');
    expect(result.notifications.map((notification) => notification.recipientUserId)).toEqual(
      expect.arrayContaining(['primary-1', 'co-1', 'chief-1'])
    );
  });

  it('is idempotent for duplicate terminal-status trigger processing', async () => {
    const api = new PostBidAutopsyApi();
    const input = createMockAutopsyTriggerInput();

    const first = await api.processTrigger(input);
    const second = await api.processTrigger(input);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.autopsyId).toBe(first.autopsyId);
    expect(api.listRecords()).toHaveLength(1);
  });
});
