import React from 'react';

interface HbcUploadQueueProps {
  contextId: string;
}

/**
 * Displays the offline upload queue for a given context.
 * Minimal stub — full implementation in SF01-T08 (Offline Queue).
 */
export const HbcUploadQueue: React.FC<HbcUploadQueueProps> = ({ contextId }) => {
  // SF01-T08: Will use useOfflineQueue() to list and manage queued files
  return (
    <div className="hbc-upload-queue" aria-label="Offline upload queue">
      <p className="hbc-upload-queue__status">
        Files queued for upload will appear here when you are back online.
      </p>
    </div>
  );
};
