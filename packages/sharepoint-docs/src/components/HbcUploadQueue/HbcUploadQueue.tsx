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
