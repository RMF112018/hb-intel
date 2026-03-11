/**
 * SyncEngine — Online/offline sync orchestrator — SF12-T04, D-04
 */
import type {
  ISyncEngine,
  ISyncEngineOptions,
  OperationExecutor,
} from '../types/index.js';
import {
  SYNC_BACKOFF_BASE_MS,
  SYNC_BACKOFF_MAX_MS,
  SPFX_SYNC_POLL_INTERVAL_MS,
} from '../constants/index.js';
import { listPending, markAttempt, remove, markFailed } from '../db/index.js';
import {
  createConnectivityMonitor,
  type IConnectivityMonitor,
} from './connectivity.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SyncEngine implements ISyncEngine {
  private readonly executor: OperationExecutor;
  private readonly monitor: IConnectivityMonitor;
  private readonly unsubscribe: () => void;
  private processing = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: ISyncEngineOptions) {
    this.executor = options.executor;
    this.monitor = createConnectivityMonitor(options.probeUrl);

    let previousStatus = this.monitor.getStatus();
    this.unsubscribe = this.monitor.subscribe((status) => {
      if (previousStatus === 'offline' && status !== 'offline') {
        void this.triggerSync();
      }
      previousStatus = status;
    });

    if (options.pollIntervalMs !== undefined) {
      this.startPolling(options.pollIntervalMs);
    }
  }

  async triggerSync(): Promise<void> {
    const status = await this.monitor.probe();
    if (status === 'offline') return;
    await this.processQueue();
  }

  async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const pending = await listPending();
      for (const op of pending) {
        if (op.retryCount > 0) {
          const backoff = Math.min(
            SYNC_BACKOFF_BASE_MS * Math.pow(2, op.retryCount),
            SYNC_BACKOFF_MAX_MS,
          );
          await delay(backoff);
        }

        try {
          await this.executor(op);
          await remove(op.operationId);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          if (op.retryCount + 1 >= op.maxRetries) {
            await markFailed(op.operationId, errorMsg);
          } else {
            await markAttempt(op.operationId, errorMsg);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  async registerBackgroundSync(): Promise<void> {
    try {
      if (
        typeof navigator !== 'undefined' &&
        'serviceWorker' in navigator
      ) {
        const registration = await navigator.serviceWorker.ready;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sync = (registration as any).sync;
        if (sync) {
          await sync.register('hbc-session-sync');
        }
      }
    } catch {
      // Background Sync API unavailable — no-op
    }
  }

  startPolling(intervalMs?: number): void {
    this.stopPolling();
    const ms = intervalMs ?? SPFX_SYNC_POLL_INTERVAL_MS;
    this.pollTimer = setInterval(() => {
      void this.triggerSync();
    }, ms);
  }

  stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  dispose(): void {
    this.stopPolling();
    this.unsubscribe();
    this.monitor.dispose();
  }
}

export function createSyncEngine(options: ISyncEngineOptions): SyncEngine {
  return new SyncEngine(options);
}
