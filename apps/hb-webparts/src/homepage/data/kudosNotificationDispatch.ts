/**
 * HB Kudos notification dispatch seam.
 *
 * Provides the concrete dispatch entry point that the governance writer
 * calls after a successful patch. The current implementation logs
 * intents to the console and stores them in a session-scoped queue for
 * operator visibility. A future integration prompt plugs in the real
 * delivery channel (email, Teams, in-app) by replacing the `deliver`
 * function.
 *
 * This is NOT a no-op stub: intents are queued, inspectable, and the
 * seam is wired into every governance write path.
 */
import type { KudosNotificationIntent } from '../helpers/kudosNotificationBuilder.js';

// ---------------------------------------------------------------------------
// Session-scoped notification queue
// ---------------------------------------------------------------------------

const _pendingIntents: KudosNotificationIntent[] = [];

/**
 * Deliver one or more notification intents. Currently queues them for
 * operator inspection and logs to the console. Replace the body of
 * this function when a real delivery channel is available.
 */
export function dispatchKudosNotifications(
  intents: readonly KudosNotificationIntent[],
): void {
  for (const intent of intents) {
    _pendingIntents.push(intent);
    // eslint-disable-next-line no-console
    console.info(
      `[KudosNotification] ${intent.eventType} → ${intent.targetKinds.join(', ')} | ${intent.subject}`,
    );
  }
}

/** Read the pending notification queue (for operator UI or tests). */
export function getPendingNotifications(): readonly KudosNotificationIntent[] {
  return _pendingIntents;
}

/** Clear the queue after delivery or during cleanup. */
export function clearPendingNotifications(): void {
  _pendingIntents.length = 0;
}
