/**
 * My Dashboard | Adobe Sign cache — queue enqueuer abstraction (B05.15 Prompt 03).
 *
 * Defines the producer-side seam used by:
 *   - the manual-refresh route (Prompt 05)
 *   - the public webhook receiver (Prompt 06)
 *   - the OAuth callback initial-hydration enqueue (Prompt 05)
 *   - the reconciliation scheduler (Prompt 08)
 *
 * The concrete `@azure/storage-queue` (or raw-REST) adapter is intentionally
 * NOT authored in this prompt — that decision moves to Prompt 05 where the
 * first real enqueue lane lands. Tests and downstream code in this prompt
 * use `createInMemoryAdobeSignCacheQueueEnqueuer()`.
 *
 * @module services/adobe-sign-cache/queue-enqueuer
 */

import {
  validateAdobeSignCacheWorkItem,
  type AdobeSignCacheWorkItem,
} from './queue-work-item-contract.js';

export interface AdobeSignCacheQueueEnqueueResult {
  readonly messageId: string;
  readonly insertedAtUtc: string;
}

export interface AdobeSignCacheQueueHealth {
  readonly ready: boolean;
  readonly reason?: string;
}

export interface IAdobeSignCacheQueueEnqueuer {
  /**
   * Enqueue a work item onto the `adobe-sign-cache-work-items` queue.
   *
   * Implementations MUST run the payload through
   * `validateAdobeSignCacheWorkItem` before serialization to guard against
   * accidental token / signing-URL leakage and shape drift.
   */
  enqueue(workItem: AdobeSignCacheWorkItem): Promise<AdobeSignCacheQueueEnqueueResult>;

  /**
   * Lightweight readiness probe. Returns `ready: false` with a closed reason
   * when the underlying queue is not yet configured / reachable. Callers
   * decide whether to fail-soft (e.g. webhook receiver acknowledges Adobe
   * but skips enqueue) or fail-hard.
   */
  health(): Promise<AdobeSignCacheQueueHealth>;
}

export interface InMemoryAdobeSignCacheQueueEnqueuer extends IAdobeSignCacheQueueEnqueuer {
  /** Captured payloads in enqueue order. */
  readonly items: readonly AdobeSignCacheWorkItem[];
  /** Test helper — clear captured items. */
  reset(): void;
}

export interface CreateInMemoryAdobeSignCacheQueueEnqueuerDeps {
  readonly now?: () => Date;
  readonly randomUUID?: () => string;
}

/**
 * Test-only in-memory enqueuer. Captures every successfully validated work
 * item; rejects payloads that fail `validateAdobeSignCacheWorkItem`. Mirrors
 * the behavior contract of the real adapter (validate-before-send) so unit
 * tests catch shape drift early.
 */
export function createInMemoryAdobeSignCacheQueueEnqueuer(
  deps: CreateInMemoryAdobeSignCacheQueueEnqueuerDeps = {},
): InMemoryAdobeSignCacheQueueEnqueuer {
  const items: AdobeSignCacheWorkItem[] = [];
  const now = deps.now ?? (() => new Date());
  const randomUUID = deps.randomUUID ?? (() => globalThis.crypto.randomUUID());

  return {
    items,
    async enqueue(workItem: AdobeSignCacheWorkItem): Promise<AdobeSignCacheQueueEnqueueResult> {
      const validated = validateAdobeSignCacheWorkItem(workItem);
      if (!validated.ok) {
        throw new Error(
          `InMemoryAdobeSignCacheQueueEnqueuer.enqueue: invalid work item — ${validated.reason}`,
        );
      }
      items.push(validated.workItem);
      return {
        messageId: randomUUID(),
        insertedAtUtc: now().toISOString(),
      };
    },
    async health(): Promise<AdobeSignCacheQueueHealth> {
      return { ready: true };
    },
    reset(): void {
      items.length = 0;
    },
  };
}
