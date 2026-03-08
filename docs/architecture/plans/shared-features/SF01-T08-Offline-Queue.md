# SF01-T08: Offline Queue

**Package:** `@hbc/sharepoint-docs`
**Wave:** 2 — Migration & Offline
**Estimated effort:** 0.5 sprint-weeks
**Prerequisite tasks:** SF01-T01, SF01-T02, SF01-T04
**Unlocks:** SF01-T06 (useOfflineQueue hook consumed by components)
**Governed by:** CLAUDE.md v1.2 §3; Interview decision D-03

---

## 1. Objective

Implement the Informed Queue offline upload system (D-03):

- Files selected while offline are accepted and queued locally in the browser
- A persistent, transparent status indicator shows what is queued and when it expires
- The 50 MB cap is enforced at queue time (not just at validation)
- Queued entries expire after 48 hours and are discarded with a clear user notification
- When connectivity is restored, all queued uploads attempt automatically in FIFO order
- Users can remove individual entries from the queue at any time

---

## 2. `src/services/OfflineQueueManager.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import type { IOfflineQueueEntry, IOfflineQueueSummary } from '../types/index.js';
import { SIZE_OFFLINE_MAX, OFFLINE_QUEUE_TTL_HOURS } from '../constants/fileSizeLimits.js';
import { OFFLINE_QUEUE_TTL_HOURS as TTL } from '../constants/migrationSchedule.js';

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

    const queueId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TTL * 60 * 60 * 1000);

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
        fileName: rest.file?.name ?? '',
        fileSize: rest.file?.size ?? 0,
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
```

---

## 3. `src/hooks/useOfflineQueue.ts`

```typescript
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
```

---

## 4. `src/hooks/internal/useNetworkStatus.ts`

```typescript
import { useSyncExternalStore } from 'react';

/** Subscribes to browser online/offline events. */
function subscribeToOnlineStatus(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribeToOnlineStatus, getOnlineSnapshot);
  return { isOnline };
}
```

---

## 5. `src/components/HbcUploadQueue/HbcUploadQueue.tsx`

The persistent queue status indicator (D-03 — Informed Queue transparency requirement).

```typescript
import React, { useState } from 'react';
import { useOfflineQueue } from '../../hooks/useOfflineQueue.js';
import { useNetworkStatus } from '../../hooks/internal/useNetworkStatus.js';
import { QueueEntry } from './QueueEntry.js';

interface HbcUploadQueueProps {
  /** If provided, only shows entries for this context. */
  contextId?: string;
}

export const HbcUploadQueue: React.FC<HbcUploadQueueProps> = ({ contextId }) => {
  const { entries, summary, removeFromQueue, retryEntry, isSyncing } = useOfflineQueue(contextId);
  const { isOnline } = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  if (summary.totalQueued === 0 && !summary.hasExpiredEntries) {
    return null;
  }

  return (
    <div
      className={`hbc-upload-queue${isOnline ? ' hbc-upload-queue--syncing' : ' hbc-upload-queue--offline'}`}
      role="region"
      aria-label="Upload queue"
      aria-live="polite"
    >
      {/* Compact status bar — always visible when queue is non-empty */}
      <button
        type="button"
        className="hbc-upload-queue__status-bar"
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
        aria-controls="hbc-queue-panel"
      >
        <span className="hbc-upload-queue__indicator" aria-hidden="true">
          {isOnline && isSyncing ? '⟳' : isOnline ? '✓' : '○'}
        </span>
        <span className="hbc-upload-queue__label">
          {isOnline && isSyncing
            ? `Uploading ${summary.totalQueued} queued file${summary.totalQueued !== 1 ? 's' : ''}…`
            : isOnline
            ? `${summary.totalQueued} file${summary.totalQueued !== 1 ? 's' : ''} ready to upload`
            : `${summary.totalQueued} file${summary.totalQueued !== 1 ? 's' : ''} queued — will upload when connected`
          }
        </span>
        {summary.nextExpiresAt && (
          <span className="hbc-upload-queue__expiry">
            Expires {new Date(summary.nextExpiresAt).toLocaleString()}
          </span>
        )}
        <span className="hbc-upload-queue__toggle" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded queue panel */}
      {isExpanded && (
        <div id="hbc-queue-panel" className="hbc-upload-queue__panel">
          {summary.hasExpiredEntries && (
            <div className="hbc-upload-queue__expired-notice" role="alert">
              Some files expired after 48 hours without an internet connection and were removed.
              Please re-attach them when connected.
            </div>
          )}

          {entries.length === 0 ? (
            <p className="hbc-upload-queue__empty">No files in queue for this record.</p>
          ) : (
            <ul className="hbc-upload-queue__list" aria-label="Queued files">
              {entries.map(entry => (
                <QueueEntry
                  key={entry.queueId}
                  entry={entry}
                  isOnline={isOnline}
                  onRemove={() => removeFromQueue(entry.queueId)}
                  onRetry={() => retryEntry(entry.queueId)}
                />
              ))}
            </ul>
          )}

          <p className="hbc-upload-queue__disclaimer">
            Files stay queued for up to 48 hours. Files over 50 MB must be uploaded while connected.
            Closing this browser tab will clear the queue.
          </p>
        </div>
      )}
    </div>
  );
};
```

---

### `src/components/HbcUploadQueue/QueueEntry.tsx`

```typescript
import React from 'react';
import type { IOfflineQueueEntry } from '../../types/index.js';

interface QueueEntryProps {
  entry: IOfflineQueueEntry;
  isOnline: boolean;
  onRemove: () => void;
  onRetry: () => void;
}

export const QueueEntry: React.FC<QueueEntryProps> = ({
  entry, isOnline, onRemove, onRetry,
}) => {
  const sizeMB = (entry.file.size / 1024 / 1024).toFixed(1);
  const statusLabel =
    entry.status === 'uploading' ? 'Uploading…' :
    entry.status === 'failed' ? `Failed — ${entry.lastError}` :
    entry.status === 'expired' ? 'Expired — please re-attach' :
    'Queued';

  return (
    <li className={`hbc-queue-entry hbc-queue-entry--${entry.status}`}
        aria-label={`${entry.file.name}: ${statusLabel}`}>
      <div className="hbc-queue-entry__name">{entry.file.name}</div>
      <div className="hbc-queue-entry__meta">{sizeMB} MB · {statusLabel}</div>
      <div className="hbc-queue-entry__actions">
        {entry.status === 'failed' && isOnline && (
          <button
            type="button"
            className="hbc-btn hbc-btn--ghost hbc-btn--small"
            onClick={onRetry}
            aria-label={`Retry upload for ${entry.file.name}`}
          >
            Retry
          </button>
        )}
        {entry.status !== 'uploading' && (
          <button
            type="button"
            className="hbc-btn hbc-btn--ghost hbc-btn--small hbc-btn--danger"
            onClick={onRemove}
            aria-label={`Remove ${entry.file.name} from queue`}
          >
            Remove
          </button>
        )}
      </div>
    </li>
  );
};
```

---

## 6. Connectivity Detection Edge Cases

| Scenario | Behavior |
|---|---|
| Browser reports online but SharePoint is unreachable (corporate network issues) | First upload attempt will fail; entry marked `failed`; user can manually retry |
| User goes offline mid-upload (file > 50 MB, no queue) | Upload fails with error; user must re-attach when reconnected |
| User goes offline mid-upload (file ≤ 50 MB, was uploading) | Current upload fails; entry is NOT auto-queued (it was online when started); user must re-attach |
| Queue has 5 files, user reconnects | All 5 files attempt upload in FIFO order; any failures are marked and shown individually |
| sessionStorage is full | `persistToStorage()` fails silently; queue continues in memory; no UI degradation |
| User closes tab with queued files | Queue is lost; on next tab open, no queued files exist; clean slate |

---

## 7. Verification Commands

```bash
# Build offline queue
pnpm --filter @hbc/sharepoint-docs build

# Run unit tests
pnpm --filter @hbc/sharepoint-docs test

# Key test scenarios:
#   OfflineQueueManager.enqueue — throws for files > 50 MB
#   OfflineQueueManager.enqueue — creates entry with correct 48-hr expiresAt
#   OfflineQueueManager.pruneExpired — marks entries as 'expired' after TTL
#   OfflineQueueManager.syncAll — skips expired entries, uploads pending entries in order
#   useNetworkStatus — returns correct isOnline value from navigator.onLine
#   HbcUploadQueue — renders null when queue is empty
#   HbcUploadQueue — shows expiry notice when hasExpiredEntries = true
#   QueueEntry — shows Retry button only when status = 'failed' and isOnline = true

# To manually test offline behavior in browser:
#   Chrome DevTools → Network tab → set "Offline" throttle profile
#   Attach a file ≤ 50 MB → confirm queue indicator appears
#   Set throttle back to "No throttling" → confirm file uploads automatically
```
