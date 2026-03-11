export type ConnectivityStatus = 'online' | 'offline' | 'degraded';

export type QueuedOperationType =
  | 'upload'
  | 'acknowledgment'
  | 'form-save'
  | 'api-mutation'
  | 'notification-action';

export interface IQueuedOperation {
  operationId: string;
  type: QueuedOperationType;
  target: string;
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt: string | null;
  lastError: string | null;
}

export interface IDraftEntry {
  draftKey: string;
  value: unknown;
  savedAt: string;
  ttlHours: number;
}

export interface ISessionStateContext {
  connectivity: ConnectivityStatus;
  queuedOperations: IQueuedOperation[];
  pendingCount: number;
  triggerSync: () => Promise<void>;
  saveDraft: (key: string, value: unknown, ttlHours?: number) => void;
  loadDraft: <T>(key: string) => T | null;
  clearDraft: (key: string) => void;
  queueOperation: (
    operation: Omit<
      IQueuedOperation,
      'operationId' | 'retryCount' | 'createdAt' | 'lastAttemptAt' | 'lastError'
    >
  ) => void;
}

export interface IUseDraftResult<T> {
  value: T | null;
  save: (value: T, ttlHours?: number) => void;
  clear: () => void;
}

export type OperationExecutor = (operation: IQueuedOperation) => Promise<void>;

export interface ISyncEngine {
  triggerSync(): Promise<void>;
  registerBackgroundSync?(): Promise<void>;
  processQueue(): Promise<void>;
  dispose(): void;
}

export interface ISyncEngineOptions {
  executor: OperationExecutor;
  probeUrl?: string;
  pollIntervalMs?: number;
}
