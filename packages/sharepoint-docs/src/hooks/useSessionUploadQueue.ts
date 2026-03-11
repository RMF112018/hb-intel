import { useCallback } from 'react';
import { useSessionState } from '@hbc/session-state';

export interface SessionUploadParams {
  documentId: string;
  listId: string;
  contentBase64: string;
}

export function useSessionUploadQueue() {
  const { queueOperation, connectivity, pendingCount } = useSessionState();

  const enqueueUpload = useCallback(
    (params: SessionUploadParams) => {
      queueOperation({
        type: 'upload',
        target: '/api/documents/upload',
        payload: params,
        maxRetries: 5,
      });
    },
    [queueOperation],
  );

  return { enqueueUpload, connectivity, pendingCount };
}
