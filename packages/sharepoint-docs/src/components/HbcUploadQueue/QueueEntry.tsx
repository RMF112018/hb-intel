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
