/**
 * An entry in the local offline upload queue (D-03).
 * Stored in browser sessionStorage / IndexedDB via @hbc/session-state.
 */
export interface IOfflineQueueEntry {
  /** Client-generated GUID for this queue entry. */
  queueId: string;

  /** The file to upload (retained in memory as a Blob reference). */
  file: File;

  /** Context the file belongs to. */
  contextId: string;

  /** Type of the owning record. */
  contextType: string;

  /** Subfolder within the context folder (e.g., 'RFP', 'Bid Documents'). */
  subFolder?: string;

  /** UTC timestamp when the file was queued. */
  queuedAt: string;

  /**
   * Expiry timestamp. Entry is automatically discarded after 48 hours (D-03).
   * Computed as: queuedAt + 48 hours.
   */
  expiresAt: string;

  /** Current processing state. */
  status: 'queued' | 'uploading' | 'completed' | 'failed' | 'expired';

  /** Number of upload attempts made since queuing. */
  attemptCount: number;

  /** Error from the most recent failed upload attempt. */
  lastError: string | null;
}

/** Summary of the current offline queue state — used by HbcUploadQueue component. */
export interface IOfflineQueueSummary {
  totalQueued: number;
  totalBytes: number;
  oldestEntryQueuedAt: string | null;
  nextExpiresAt: string | null;
  hasExpiredEntries: boolean;
}
