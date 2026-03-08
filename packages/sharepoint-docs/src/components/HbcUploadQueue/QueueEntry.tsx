import React from 'react';
import type { IOfflineQueueEntry } from '../../types/index.js';

interface QueueEntryProps {
  entry: IOfflineQueueEntry;
  onRemove?: (queueId: string) => void;
}

/**
 * Renders a single offline queue entry. Minimal stub — full implementation in SF01-T08.
 */
export const QueueEntry: React.FC<QueueEntryProps> = ({ entry, onRemove }) => {
  const sizeMB = (entry.file.size / 1024 / 1024).toFixed(1);

  return (
    <li className="hbc-queue-entry" aria-label={`Queued: ${entry.file.name}`}>
      <span className="hbc-queue-entry__filename">{entry.file.name}</span>
      <span className="hbc-queue-entry__size">{sizeMB} MB</span>
      <span className="hbc-queue-entry__status">{entry.status}</span>
      {onRemove && entry.status === 'queued' && (
        <button
          type="button"
          className="hbc-btn hbc-btn--ghost hbc-btn--small"
          onClick={() => onRemove(entry.queueId)}
          aria-label={`Remove ${entry.file.name} from queue`}
        >
          Remove
        </button>
      )}
    </li>
  );
};
