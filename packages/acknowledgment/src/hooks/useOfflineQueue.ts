/**
 * Stub for offline queue functionality.
 * TODO: Replace with @hbc/session-state import in SF04-T07
 */

interface IQueueItem {
  endpoint: string;
  method: string;
  body: unknown;
}

interface IOfflineQueue {
  enqueue: (item: IQueueItem) => Promise<void>;
}

/**
 * Stub implementation of useSessionStateQueue.
 * Logs queued items to console until @hbc/session-state is available.
 */
export function useOfflineQueue(_key: string): IOfflineQueue {
  return {
    enqueue: async (item: IQueueItem): Promise<void> => {
      // TODO: Replace with @hbc/session-state offline queue in SF04-T07
      console.warn(
        '[@hbc/acknowledgment] Offline queue stub: item queued locally but will not be replayed.',
        item
      );
    },
  };
}
