import { AUTOPSY_SYNC_QUEUE_KEY } from '../../constants/index.js';
import type {
  IAutopsyReplayResult,
  IAutopsyStorageMutation,
  IAutopsyQueueState,
} from '../../types/index.js';

const clone = <T>(value: T): T => structuredClone(value);

export const normalizeAutopsyMutationQueue = (
  queue: IAutopsyStorageMutation[]
): IAutopsyStorageMutation[] =>
  [...queue].sort((left, right) => {
    const sequenceDelta = left.sequence - right.sequence;
    if (sequenceDelta !== 0) {
      return sequenceDelta;
    }

    const timeDelta = new Date(left.queuedAt).getTime() - new Date(right.queuedAt).getTime();
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return left.mutationId.localeCompare(right.mutationId);
  });

export const queueAutopsyMutation = (
  queue: IAutopsyStorageMutation[],
  mutation: IAutopsyStorageMutation
): { queue: IAutopsyStorageMutation[]; queueState: IAutopsyQueueState } => {
  const nextQueue = normalizeAutopsyMutationQueue([...queue, clone(mutation)]);
  return {
    queue: nextQueue,
    queueState: {
      status: mutation.localStatus,
      pendingMutationCount: nextQueue.length,
      lastSyncedAt: null,
      syncQueueKey: AUTOPSY_SYNC_QUEUE_KEY,
    },
  };
};

export const consumeAutopsyReplayResult = (
  replayedMutationIds: string[],
  conflictsCreated: number,
  invalidatedQueryKeys: ReadonlyArray<readonly string[]>
): IAutopsyReplayResult => ({
  replayedMutationIds,
  conflictsCreated,
  resultingSyncStatus: 'synced',
  invalidatedQueryKeys,
});
