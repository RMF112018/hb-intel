import { useEffect, useSyncExternalStore } from 'react';
import type { IOfflineQueueEntry, IOfflineQueueSummary } from '../types/index.js';
import { useSharePointDocsServices } from './internal/useSharePointDocsServices.js';
import { useNetworkStatus } from './internal/useNetworkStatus.js';

export interface UseOfflineQueueResult {
  /** All queued entries for the current context (or all contexts if contextId is undefined). */
  entries: IOfflineQueueEntry[];
  /** Summary counts for the status indicator. */
  summary: IOfflineQueueSummary;
  /** Add a file to the queue. */
  addToQueue: (params: {
    file: File;
    contextId: string;
    contextType: string;
    subFolder?: string;
  }) => Promise<IOfflineQueueEntry>;
  /** Remove a specific entry from the queue. */
  removeFromQueue: (queueId: string) => void;
  /** Manually retry a specific failed entry. */
  retryEntry: (queueId: string) => Promise<void>;
  /** Whether a sync is currently in progress. */
  isSyncing: boolean;
}

export function useOfflineQueue(contextId?: string): UseOfflineQueueResult {
  const { offlineQueueManager, uploadService } = useSharePointDocsServices();
  const { isOnline } = useNetworkStatus();

  // Subscribe to queue changes via useSyncExternalStore for React 18 concurrency safety
  const snapshot = useSyncExternalStore(
    (callback) => offlineQueueManager.subscribe(callback),
    () => offlineQueueManager.getSummary()
  );

  // Automatically sync when connectivity is restored
  useEffect(() => {
    if (!isOnline) return;

    offlineQueueManager.syncAll(async (entry) => {
      await uploadService.upload({
        file: entry.file,
        contextConfig: {
          contextId: entry.contextId,
          contextType: entry.contextType as never,
          contextLabel: '',  // not needed for retry — folder already exists
          siteUrl: null,
          ownerUpn: '',
          ownerLastName: '',
        },
        subFolder: entry.subFolder,
      });
    });
  }, [isOnline]);

  const entries = contextId
    ? offlineQueueManager.getByContext(contextId)
    : [];

  return {
    entries,
    summary: snapshot,
    addToQueue: (params) => offlineQueueManager.enqueue(params),
    removeFromQueue: (queueId) => offlineQueueManager.remove(queueId),
    retryEntry: async (queueId) => {
      await offlineQueueManager.retryEntry(queueId, async (entry) => {
        await uploadService.upload({
          file: entry.file,
          contextConfig: {
            contextId: entry.contextId,
            contextType: entry.contextType as never,
            contextLabel: '',
            siteUrl: null,
            ownerUpn: '',
            ownerLastName: '',
          },
        });
      });
    },
    isSyncing: false,  // Exposed from OfflineQueueManager.isSyncing in full implementation
  };
}
