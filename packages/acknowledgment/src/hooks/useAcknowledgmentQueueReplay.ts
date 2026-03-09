/**
 * Stub for acknowledgment queue replay on reconnect.
 *
 * TODO: Replace with @hbc/session-state useQueueReplay when that package is activated.
 *
 * Replay contract (to be implemented with real @hbc/session-state):
 * - Replays queued `POST /api/acknowledgments` entries in `enqueuedAt` ascending order.
 * - On success (2xx): removes entry from queue.
 * - On logical failure (4xx): removes entry from queue + shows error notification to user.
 * - Sequential ordering is preserved by replaying in chronological order.
 */

interface IAcknowledgmentQueueReplayReturn {
  /** True when replay is actively processing queued entries. */
  isReplaying: boolean;
  /** Number of entries remaining in the queue. */
  replayCount: number;
}

/**
 * Stub hook for replaying offline-queued acknowledgment submissions.
 * Returns inert values until @hbc/session-state is available.
 */
export function useAcknowledgmentQueueReplay(): IAcknowledgmentQueueReplayReturn {
  // TODO: Replace with @hbc/session-state useQueueReplay('acknowledgments', replayHandler)
  console.warn(
    '[@hbc/acknowledgment] useAcknowledgmentQueueReplay stub: replay requires @hbc/session-state.'
  );

  return {
    isReplaying: false,
    replayCount: 0,
  };
}
