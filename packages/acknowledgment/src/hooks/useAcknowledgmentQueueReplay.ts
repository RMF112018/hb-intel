import { useMemo } from 'react';
import { useSessionState } from '@hbc/session-state';

interface IAcknowledgmentQueueReplayReturn {
  isReplaying: boolean;
  replayCount: number;
}

export function useAcknowledgmentQueueReplay(): IAcknowledgmentQueueReplayReturn {
  const { queuedOperations, connectivity } = useSessionState();

  return useMemo(() => {
    const ackOps = queuedOperations.filter((op) => op.type === 'acknowledgment');
    return {
      isReplaying: connectivity === 'online' && ackOps.some((op) => op.retryCount > 0),
      replayCount: ackOps.length,
    };
  }, [queuedOperations, connectivity]);
}
