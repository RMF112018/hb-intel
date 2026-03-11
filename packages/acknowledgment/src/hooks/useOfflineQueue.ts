import { useCallback, useMemo } from 'react';
import { useSessionState } from '@hbc/session-state';
import type { IAcknowledgmentQueueEntry } from '../types';

interface IOfflineQueue {
  enqueue: (item: IAcknowledgmentQueueEntry) => void;
  has: (idempotencyKey: string) => boolean;
}

export function useOfflineQueue(_key: string): IOfflineQueue {
  const { queueOperation, queuedOperations } = useSessionState();

  const enqueue = useCallback(
    (item: IAcknowledgmentQueueEntry) => {
      queueOperation({
        type: 'acknowledgment',
        target: item.endpoint,
        payload: {
          body: item.body,
          idempotencyKey: item.idempotencyKey,
          enqueuedAt: item.enqueuedAt,
        },
        maxRetries: 3,
      });
    },
    [queueOperation],
  );

  const has = useCallback(
    (idempotencyKey: string): boolean =>
      queuedOperations.some(
        (op) =>
          op.type === 'acknowledgment' &&
          (op.payload as Record<string, unknown>)?.idempotencyKey === idempotencyKey,
      ),
    [queuedOperations],
  );

  return useMemo(() => ({ enqueue, has }), [enqueue, has]);
}
