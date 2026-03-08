import type { IOfflineQueueEntry, IOfflineQueueSummary } from '../types/index.js';
import { SIZE_OFFLINE_MAX } from '../constants/fileSizeLimits.js';
import { OFFLINE_QUEUE_TTL_HOURS } from '../constants/migrationSchedule.js';

/** Storage key for the queue in sessionStorage. */
const QUEUE_STORAGE_KEY = 'hbc_sharepoint_docs_upload_queue';

/**
 * Manages the offline upload queue (D-03).
 *
 * Architecture notes:
 *   - Queue entries are stored in sessionStorage (metadata only — not the file bytes).
 *   - The actual File objects are kept in an in-memory Map keyed by queueId.
 *   - This means the queue is lost if the browser tab is closed or refreshed.
 *   - The @hbc/session-state package (SF-12) provides more durable persistence
 *     for form draft state; this queue complements it for file uploads specifically.
 *   - 48-hour TTL is enforced at dequeue time and on each sync attempt.
 *
 * Browser storage limitation: File objects cannot be serialized to sessionStorage.
 * Only metadata (fileName, fileSize, contextId, expiresAt, status) is persisted.
 * The actual file bytes are held in memory. If the page is refreshed, queued files
 * that haven't uploaded yet are lost — this is a fundamental browser constraint.
 * The UI communicates this limitation clearly via the Informed Queue pattern (D-03).
 */
export class OfflineQueueManager {
  /** In-memory storage for File objects (cannot serialize to sessionStorage). */
  private fileStore = new Map<string, File>();
  /** In-memory queue state. */
  private queue: IOfflineQueueEntry[] = [];
  /** Listeners for queue state changes — used by useOfflineQueue hook. */
  private listeners = new Set<() => void>();
  /** Whether an automatic sync is currently in progress. */
  private isSyncing = false;

  constructor() {
    this.loadFromStorage();
    this.pruneExpired();
  }

  /**
   * Adds a file to the offline queue.
   * Throws if file exceeds SIZE_OFFLINE_MAX (50 MB) — caller must handle this.
   */
  async enqueue(params: {
    file: File;
    contextId: string;
    contextType: string;
    subFolder?: string;
  }): Promise<IOfflineQueueEntry> {
    if (params.file.size > SIZE_OFFLINE_MAX) {
      throw new Error(
        `Files larger than ${SIZE_OFFLINE_MAX / 1024 / 1024} MB cannot be queued for offline upload. ` +
        `Please upload this file when connected.`
      );
    }

    const queueId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OFFLINE_QUEUE_TTL_HOURS * 60 * 60 * 1000);

    const entry: IOfflineQueueEntry = {
      queueId,
      file: params.file,
      contextId: params.contextId,
      contextType: params.contextType,
      subFolder: params.subFolder,
      queuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'queued',
      attemptCount: 0,
      lastError: null,
    };

    this.fileStore.set(queueId, params.file);
    this.queue.push(entry);
    this.persistToStorage();
    this.notifyListeners();

    return entry;
  }

  /** Removes a specific entry from the queue. */
  remove(queueId: string): void {
    this.queue = this.queue.filter(e => e.queueId !== queueId);
    this.fileStore.delete(queueId);
    this.persistToStorage();
    this.notifyListeners();
  }

  /** Returns all non-expired queue entries for a specific context. */
  getByContext(contextId: string): IOfflineQueueEntry[] {
    return this.queue.filter(e => e.contextId === contextId && e.status !== 'expired');
  }

  /** Returns a summary of the current queue state for the status indicator UI. */
  getSummary(): IOfflineQueueSummary {
    const active = this.queue.filter(e => e.status === 'queued' || e.status === 'uploading');
    const expired = this.queue.filter(e => e.status === 'expired');

    return {
      totalQueued: active.length,
      totalBytes: active.reduce((sum, e) => sum + e.file.size, 0),
      oldestEntryQueuedAt: active.length
        ? active.reduce((oldest, e) =>
            e.queuedAt < oldest ? e.queuedAt : oldest,
            active[0].queuedAt
          )
        : null,
      nextExpiresAt: active.length
        ? active.reduce((nearest, e) =>
            e.expiresAt < nearest ? e.expiresAt : nearest,
            active[0].expiresAt
          )
        : null,
      hasExpiredEntries: expired.length > 0,
    };
  }

  /**
   * Processes all queued entries when connectivity is restored.
   * Called by the connectivity listener when isOnline transitions from false to true.
   */
  async syncAll(
    uploadFn: (entry: IOfflineQueueEntry) => Promise<void>
  ): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    this.pruneExpired();

    const pending = this.queue.filter(e => e.status === 'queued');

    for (const entry of pending) {
      const file = this.fileStore.get(entry.queueId);
      if (!file) {
        // File reference lost (e.g., partial restore after page refresh)
        this.updateEntryStatus(entry.queueId, 'failed', 'File reference lost — please re-attach');
        continue;
      }

      this.updateEntryStatus(entry.queueId, 'uploading');

      try {
        await uploadFn({ ...entry, file });
        this.updateEntryStatus(entry.queueId, 'completed');
        // Remove completed entries from the queue
        this.remove(entry.queueId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        this.updateEntryStatus(entry.queueId, 'failed', message);
        // Increment attempt count — don't remove failed entries so user can retry manually
        const idx = this.queue.findIndex(e => e.queueId === entry.queueId);
        if (idx !== -1) {
          this.queue[idx] = { ...this.queue[idx], attemptCount: this.queue[idx].attemptCount + 1 };
        }
      }
    }

    this.isSyncing = false;
    this.persistToStorage();
    this.notifyListeners();
  }

  /** Manually retries a specific failed entry. */
  async retryEntry(
    queueId: string,
    uploadFn: (entry: IOfflineQueueEntry) => Promise<void>
  ): Promise<void> {
    const entry = this.queue.find(e => e.queueId === queueId);
    if (!entry) return;

    const file = this.fileStore.get(queueId);
    if (!file) {
      this.updateEntryStatus(queueId, 'failed', 'File reference lost — please re-attach');
      return;
    }

    this.updateEntryStatus(queueId, 'uploading');
    try {
      await uploadFn({ ...entry, file });
      this.remove(queueId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      this.updateEntryStatus(queueId, 'failed', message);
    }
  }

  /** Subscribe to queue state changes. Returns an unsubscribe function. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private updateEntryStatus(
    queueId: string,
    status: IOfflineQueueEntry['status'],
    error?: string
  ): void {
    const idx = this.queue.findIndex(e => e.queueId === queueId);
    if (idx !== -1) {
      this.queue[idx] = { ...this.queue[idx], status, lastError: error ?? null };
    }
    this.persistToStorage();
    this.notifyListeners();
  }

  /** Removes entries past their 48-hour TTL and marks them as expired. */
  private pruneExpired(): void {
    const now = new Date();
    let changed = false;

    this.queue = this.queue.map(entry => {
      if (entry.status === 'queued' && new Date(entry.expiresAt) < now) {
        changed = true;
        this.fileStore.delete(entry.queueId);
        return { ...entry, status: 'expired' as const };
      }
      return entry;
    });

    if (changed) {
      this.persistToStorage();
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(l => l());
  }

  /** Persists queue metadata (not file bytes) to sessionStorage. */
  private persistToStorage(): void {
    try {
      const serializable = this.queue.map(({ file: _file, ...rest }) => ({
        ...rest,
        // Store file metadata but not the bytes
        fileName: _file?.name ?? '',
        fileSize: _file?.size ?? 0,
      }));
      sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // sessionStorage may be full or unavailable — fail silently
    }
  }

  /** Loads queue metadata from sessionStorage on initialization. */
  private loadFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(QUEUE_STORAGE_KEY);
      if (!raw) return;
      // Restore metadata only — file references cannot be restored
      // Entries without file references will fail gracefully on sync attempt
      this.queue = JSON.parse(raw) as IOfflineQueueEntry[];
    } catch {
      this.queue = [];
    }
  }
}
