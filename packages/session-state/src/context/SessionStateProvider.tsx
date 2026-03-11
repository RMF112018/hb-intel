/**
 * SessionStateProvider — Context provider component — SF12-T05, D-06
 */
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ISessionStateContext,
  IQueuedOperation,
  ConnectivityStatus,
  OperationExecutor,
} from '../types/index.js';
import { createSyncEngine, type SyncEngine } from '../sync/SyncEngine.js';
import {
  createConnectivityMonitor,
  type IConnectivityMonitor,
} from '../sync/connectivity.js';
import { saveDraft, clearDraft, purgeExpiredDrafts } from '../db/DraftStore.js';
import { enqueue, listPending } from '../db/QueueStore.js';
import { SessionStateContext } from './SessionStateContext.js';

export interface SessionStateProviderProps {
  children: ReactNode;
  executor: OperationExecutor;
  probeUrl?: string;
  pollIntervalMs?: number;
}

export function SessionStateProvider({
  children,
  executor,
  probeUrl,
  pollIntervalMs,
}: SessionStateProviderProps): JSX.Element {
  const [connectivity, setConnectivity] = useState<ConnectivityStatus>('online');
  const [queuedOperations, setQueuedOperations] = useState<IQueuedOperation[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const engineRef = useRef<SyncEngine | null>(null);
  const monitorRef = useRef<IConnectivityMonitor | null>(null);

  const refreshQueue = useCallback(async () => {
    const pending = await listPending();
    setQueuedOperations(pending);
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    const engine = createSyncEngine({ executor, probeUrl, pollIntervalMs });
    engineRef.current = engine;

    const monitor = createConnectivityMonitor(probeUrl);
    monitorRef.current = monitor;
    const unsubscribe = monitor.subscribe((status) => {
      setConnectivity(status);
    });

    // Purge expired drafts on mount (fire-and-forget)
    void purgeExpiredDrafts();

    // Initial queue state
    void refreshQueue();

    return () => {
      engine.dispose();
      unsubscribe();
      monitor.dispose();
      engineRef.current = null;
      monitorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo<ISessionStateContext>(() => ({
    connectivity,
    queuedOperations,
    pendingCount,

    triggerSync: async () => {
      if (engineRef.current) {
        await engineRef.current.triggerSync();
        await refreshQueue();
      }
    },

    saveDraft: (key: string, value: unknown, ttlHours?: number) => {
      void saveDraft(key, value, ttlHours);
    },

    loadDraft: <T,>(_key: string): T | null => {
      // Synchronous null — async load happens in useDraft hook
      return null;
    },

    clearDraft: (key: string) => {
      void clearDraft(key);
    },

    queueOperation: (
      operation: Omit<
        IQueuedOperation,
        'operationId' | 'retryCount' | 'createdAt' | 'lastAttemptAt' | 'lastError'
      >,
    ) => {
      void enqueue(operation).then(() => refreshQueue());
    },
  }), [connectivity, queuedOperations, pendingCount, refreshQueue]);

  return (
    <SessionStateContext.Provider value={contextValue}>
      {children}
    </SessionStateContext.Provider>
  );
}
