/**
 * Stub for offline queue functionality.
 * TODO: Replace with @hbc/session-state import when that package is activated.
 */

import type { IAcknowledgmentQueueEntry } from '../types';

interface IOfflineQueue {
  enqueue: (item: IAcknowledgmentQueueEntry) => Promise<void>;
  /** Check whether an entry with this idempotency key is already queued. */
  has: (idempotencyKey: string) => Promise<boolean>;
}

/**
 * Stub implementation of useSessionStateQueue.
 * Logs queued items to console until @hbc/session-state is available.
 */
export function useOfflineQueue(_key: string): IOfflineQueue {
  return {
    enqueue: async (item: IAcknowledgmentQueueEntry): Promise<void> => {
      // TODO: Replace with @hbc/session-state offline queue
      console.warn(
        '[@hbc/acknowledgment] Offline queue stub: item queued locally but will not be replayed.',
        item
      );
    },
    has: async (_idempotencyKey: string): Promise<boolean> => {
      // TODO: Replace with @hbc/session-state persistence check
      console.warn(
        '[@hbc/acknowledgment] Offline queue stub: has() always returns false (no persistence).'
      );
      return false;
    },
  };
}
