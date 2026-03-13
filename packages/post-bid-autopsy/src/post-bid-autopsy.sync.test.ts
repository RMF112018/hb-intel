import { describe, expect, it } from 'vitest';

import { PostBidAutopsyApi } from '@hbc/post-bid-autopsy';
import {
  createMockAutopsyStorageMutation,
  createMockAutopsyTriggerInput,
} from '@hbc/post-bid-autopsy/testing';

describe('post-bid autopsy sync', () => {
  it('queues offline mutations with deterministic ordering and replays them in sequence', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());

    const secondMutation = createMockAutopsyStorageMutation({
      mutationId: 'mutation-2',
      autopsyId: trigger.autopsyId,
      sequence: 2,
      queuedAt: '2026-03-15T00:00:00.000Z',
      baseVersion: 1,
      payload: {
        snapshot: {
          ...trigger.record,
          autopsy: {
            ...trigger.record.autopsy,
            evidence: [
              {
                evidenceId: 'e-2',
                type: 'field-observation',
                sourceRef: 'source-2',
                capturedBy: 'actor-2',
                capturedAt: '2026-03-15T00:00:00.000Z',
                sensitivity: 'internal',
              },
            ],
          },
        },
        actor: trigger.record.assignments.primaryAuthor,
      },
    });
    const firstMutation = createMockAutopsyStorageMutation({
      mutationId: 'mutation-1',
      autopsyId: trigger.autopsyId,
      sequence: 1,
      queuedAt: '2026-03-14T00:00:00.000Z',
      baseVersion: 1,
      payload: {
        snapshot: trigger.record,
        actor: trigger.record.assignments.primaryAuthor,
      },
    });

    const queued = await api.enqueueMutation(secondMutation);
    await api.enqueueMutation(firstMutation);
    const replayed = await api.replayQueuedMutations();

    expect(queued.queueStatus.status).toBe('queued-to-sync');
    expect(replayed.replayedMutationIds).toEqual(['mutation-1', 'mutation-2']);
    expect(replayed.invalidatedQueryKeys).toEqual(
      expect.arrayContaining([
        ['post-bid-autopsy', trigger.record.autopsy.pursuitId],
        ['post-bid-autopsy', trigger.record.autopsy.pursuitId, 'queue'],
      ])
    );
  });

  it('creates a new review-required version when replay finds a version conflict', async () => {
    const api = new PostBidAutopsyApi();
    const trigger = await api.processTrigger(createMockAutopsyTriggerInput());

    await api.persistDraft(
      trigger.autopsyId,
      trigger.record,
      trigger.record.assignments.primaryAuthor,
      '2026-03-14T00:00:00.000Z'
    );

    await api.enqueueMutation(
      createMockAutopsyStorageMutation({
        autopsyId: trigger.autopsyId,
        mutationId: 'conflict-mutation',
        baseVersion: 1,
        payload: {
          snapshot: trigger.record,
          actor: trigger.record.assignments.primaryAuthor,
        },
      })
    );
    const replayed = await api.replayQueuedMutations();

    expect(replayed.conflictsCreated).toBe(1);
    expect(api.getRecord(trigger.autopsyId)?.autopsy.status).toBe('review');
  });
});
