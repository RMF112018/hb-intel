import type { IBicOwner } from '../types/IBicNextMove';
import { shouldFireTransfer } from './TransferDeduplicator';

// ─────────────────────────────────────────────────────────────────────────────
// Lazy import for @hbc/notification-intelligence
// Avoids hard dependency — package works even if notification-intelligence
// is not yet initialized (gracefully degrades to event emission only).
// ─────────────────────────────────────────────────────────────────────────────

async function getNotificationIntelligence(): Promise<{
  registerEvent: (event: BicNotificationEvent) => void;
} | null> {
  try {
    const mod = await import('@hbc/notification-intelligence');
    return mod.notificationIntelligence ?? null;
  } catch /* c8 ignore next */ {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BicTransferPayload {
  /** Globally unique item key, e.g. "bd-scorecard::a1b2c3" */
  itemKey: string;
  fromOwner: IBicOwner | null;
  toOwner: IBicOwner | null;
  /**
   * Plain-language action that triggered the transfer.
   * e.g. "Submitted for Director Review"
   * Used as notification body text.
   */
  action: string;
}

interface BicNotificationEvent {
  /** Notification tier — always 'immediate' for BIC transfers */
  tier: 'immediate';
  type: 'bic-transfer';
  itemKey: string;
  recipientUserId: string;
  title: string;
  body: string;
  href?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom DOM event for cross-component awareness
// ─────────────────────────────────────────────────────────────────────────────

export const BIC_TRANSFER_EVENT = 'hbc:bic-transfer' as const;

declare global {
  interface WindowEventMap {
    [BIC_TRANSFER_EVENT]: CustomEvent<BicTransferPayload>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Records a BIC ownership transfer event. Performs deduplication (D-03),
 * registers an Immediate-tier notification with @hbc/notification-intelligence,
 * and emits a 'hbc:bic-transfer' DOM custom event for cross-component awareness.
 *
 * Called in two contexts:
 * 1. Automatically by useBicNextMove when hook-level diff detection fires.
 * 2. Explicitly by module action handlers for background/server-driven transfers.
 *
 * Safe to call multiple times — deduplication prevents double-notification
 * within the 60-second bucket window (BIC_TRANSFER_DEDUP_BUCKET_MS).
 *
 * @example — Explicit call in a workflow action handler
 * import { recordBicTransfer } from '@hbc/bic-next-move';
 *
 * async function handleScorecardSubmit(scorecard: IGoNoGoScorecard) {
 *   await submitScorecardToDirector(scorecard);
 *   recordBicTransfer({
 *     itemKey: `bd-scorecard::${scorecard.id}`,
 *     fromOwner: { userId: scorecard.bdManagerId, displayName: scorecard.bdManagerName, role: 'BD Manager' },
 *     toOwner: { userId: scorecard.directorId, displayName: scorecard.directorName, role: 'Director of Preconstruction' },
 *     action: 'Submitted for Director Review',
 *   });
 * }
 */
export function recordBicTransfer(payload: BicTransferPayload): void {
  const fromUserId = payload.fromOwner?.userId ?? null;
  const toUserId = payload.toOwner?.userId ?? null;

  // D-03: Deduplication guard — skip if same transfer already fired in this bucket
  if (!shouldFireTransfer(payload.itemKey, fromUserId, toUserId)) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `[bic-next-move] recordBicTransfer deduplicated for ${payload.itemKey}` +
        ` (${fromUserId} → ${toUserId})`
      );
    }
    return;
  }

  // ── 1. Register with @hbc/notification-intelligence (async, non-blocking) ─
  if (payload.toOwner) {
    void registerNotification(payload);
  }

  // ── 2. Emit DOM custom event for cross-component awareness ────────────────
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(BIC_TRANSFER_EVENT, { detail: payload, bubbles: false })
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: notification registration
// ─────────────────────────────────────────────────────────────────────────────

async function registerNotification(payload: BicTransferPayload): Promise<void> {
  const ni = await getNotificationIntelligence();
  if (!ni || !payload.toOwner) return;

  const title = buildNotificationTitle(payload);
  const body = buildNotificationBody(payload);

  try {
    ni.registerEvent({
      tier: 'immediate',
      type: 'bic-transfer',
      itemKey: payload.itemKey,
      recipientUserId: payload.toOwner.userId,
      title,
      body,
    });
  } catch (err) {
    // Never throw — notification failure must not break the workflow
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[bic-next-move] Failed to register BIC transfer notification:', err);
    }
  }
}

function buildNotificationTitle(payload: BicTransferPayload): string {
  const [moduleKey] = payload.itemKey.split('::');
  return `Ball in court: ${moduleKey.replace(/-/g, ' ')}`;
}

function buildNotificationBody(payload: BicTransferPayload): string {
  const from = payload.fromOwner?.displayName ?? 'the system';
  return `${from} passed this to you: ${payload.action}`;
}
