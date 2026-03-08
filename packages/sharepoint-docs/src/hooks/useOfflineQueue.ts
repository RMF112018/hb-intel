import type { IOfflineQueueSummary } from '../types/index.js';

export interface OfflineQueueAddRequest {
  file: File;
  contextId: string;
  contextType: string;
  subFolder?: string;
}

export interface UseOfflineQueueResult {
  addToQueue: (request: OfflineQueueAddRequest) => Promise<void>;
  removeFromQueue: (queueId: string) => Promise<void>;
  summary: IOfflineQueueSummary;
}

/**
 * Placeholder hook for offline queue management.
 * Real implementation will be provided in SF01-T08 (Offline Queue).
 */
export function useOfflineQueue(): UseOfflineQueueResult {
  const emptySummary: IOfflineQueueSummary = {
    totalQueued: 0,
    totalBytes: 0,
    oldestEntryQueuedAt: null,
    nextExpiresAt: null,
    hasExpiredEntries: false,
  };

  return {
    addToQueue: async () => {
      // SF01-T08: Will integrate with OfflineQueueManager
    },
    removeFromQueue: async () => {
      // SF01-T08: Will integrate with OfflineQueueManager
    },
    summary: emptySummary,
  };
}
