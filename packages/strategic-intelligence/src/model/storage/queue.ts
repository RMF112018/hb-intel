import type {
  IStrategicIntelligenceMutation,
  IStrategicIntelligenceReplayResult,
  StrategicIntelligenceSyncStatus,
} from '../../types/index.js';
import { STRATEGIC_INTELLIGENCE_SYNC_QUEUE_KEY } from '../../constants/index.js';

const clone = <T>(value: T): T => structuredClone(value);

export const normalizeMutationQueue = (
  queue: IStrategicIntelligenceMutation[]
): IStrategicIntelligenceMutation[] =>
  [...queue].sort((a, b) => {
    const timeDelta = new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    if (timeDelta !== 0) {
      return timeDelta;
    }

    return a.mutationId.localeCompare(b.mutationId);
  });

export const queueMutation = (
  queue: IStrategicIntelligenceMutation[],
  mutation: IStrategicIntelligenceMutation
): { queueKey: string; queuedCount: number; queue: IStrategicIntelligenceMutation[] } => {
  const next = normalizeMutationQueue([...queue, clone(mutation)]);
  return {
    queueKey: STRATEGIC_INTELLIGENCE_SYNC_QUEUE_KEY,
    queuedCount: next.length,
    queue: next,
  };
};

export const consumeReplayResult = (
  replayedMutationIds: string[],
  conflictsCreated: number,
  governanceEventsAppended: number,
  resultingSyncStatus: StrategicIntelligenceSyncStatus
): IStrategicIntelligenceReplayResult => ({
  replayedMutationIds,
  conflictsCreated,
  governanceEventsAppended,
  resultingSyncStatus,
});
