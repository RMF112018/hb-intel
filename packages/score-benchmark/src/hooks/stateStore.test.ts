import { describe, expect, it } from 'vitest';
import {
  clearQueuedMutations,
  enqueueMutation,
  getFilterState,
  getLastReplayAt,
  getNoBidDraft,
  getQueuedMutations,
  setFilterState,
  setLastReplayAt,
  setNoBidDraft,
} from './stateStore.js';

describe('stateStore', () => {
  it('stores and clones filter state and queued mutations', () => {
    setFilterState('entity-store', {
      context: { geography: 'SE' },
      invalidatedQueryKeys: [['score-benchmark', 'entity-store']],
    });

    const filter = getFilterState('entity-store');
    expect(filter?.context.geography).toBe('SE');

    const queuedCount = enqueueMutation('entity-store', {
      mutationId: 'm1',
      mutationType: 'governance-event',
      entityId: 'entity-store',
      payload: { a: 1 },
      queuedAt: '2026-03-12T00:00:00.000Z',
      replaySafe: true,
    });

    expect(queuedCount).toBe(1);
    const queued = getQueuedMutations('entity-store');
    expect(queued[0]?.mutationId).toBe('m1');

    clearQueuedMutations('entity-store');
    expect(getQueuedMutations('entity-store')).toHaveLength(0);
  });

  it('tracks replay timestamps and no-bid drafts', () => {
    expect(getLastReplayAt('entity-meta')).toBeNull();
    setLastReplayAt('entity-meta', '2026-03-12T00:00:00.000Z');
    expect(getLastReplayAt('entity-meta')).toBe('2026-03-12T00:00:00.000Z');

    expect(getNoBidDraft('entity-meta')).toBe('');
    setNoBidDraft('entity-meta', 'Need strategic rationale.');
    expect(getNoBidDraft('entity-meta')).toBe('Need strategic rationale.');
  });
});
