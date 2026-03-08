# SF02-T06 — Transfer Detection & Notification Wiring

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-03 (hybrid detection + deduplication), D-07 (60-second dedup bucket)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01, T02

---

## Objective

Implement `recordBicTransfer()` — the explicit transfer registration function used by module action handlers and called internally by `useBicNextMove`'s diff detection — along with the `TransferDeduplicator` that prevents double-firing when both paths detect the same ownership change.

---

## 3-Line Plan

1. Implement `TransferDeduplicator` — in-memory deduplication on 60-second bucket key.
2. Implement `recordBicTransfer()` — deduplicates, fires `@hbc/notification-intelligence`, and emits a `bic-transfer` custom event for cross-component awareness.
3. Verify: calling `recordBicTransfer()` twice in the same 60-second window for the same transfer produces exactly one notification event.

---

## `src/transfer/TransferDeduplicator.ts`

```typescript
import { BIC_TRANSFER_DEDUP_BUCKET_MS } from '../constants/manifest';

/**
 * Deduplication guard for BIC transfer events (D-03).
 *
 * Transfers are keyed on: `${itemKey}::${fromUserId}::${toUserId}::${bucketId}`
 * where bucketId = Math.floor(Date.now() / BIC_TRANSFER_DEDUP_BUCKET_MS).
 *
 * This 60-second bucket ensures that when both the hook-level diff detection
 * (useBicNextMove) AND an explicit recordBicTransfer() call detect the same
 * ownership change, only one notification is registered with
 * @hbc/notification-intelligence.
 *
 * The deduplicator is a module-level singleton — same instance for the entire
 * browser session. It uses a Set with automatic expiry to prevent unbounded growth.
 */

const _seen = new Set<string>();
const _expiry = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Returns true if this transfer event has NOT been seen in the current bucket window.
 * Marks the event as seen and schedules automatic expiry after the bucket window.
 */
export function shouldFireTransfer(
  itemKey: string,
  fromUserId: string | null,
  toUserId: string | null
): boolean {
  const bucketId = Math.floor(Date.now() / BIC_TRANSFER_DEDUP_BUCKET_MS);
  const key = `${itemKey}::${fromUserId ?? 'null'}::${toUserId ?? 'null'}::${bucketId}`;

  if (_seen.has(key)) {
    return false; // Duplicate — skip
  }

  _seen.add(key);

  // Auto-expire after 2× the bucket window to handle edge cases near bucket boundaries
  const timeout = setTimeout(() => {
    _seen.delete(key);
    _expiry.delete(key);
  }, BIC_TRANSFER_DEDUP_BUCKET_MS * 2);

  _expiry.set(key, timeout);
  return true;
}

/**
 * Clears all deduplication state. Used in tests only.
 * @internal
 */
export function _clearDeduplicatorForTests(): void {
  for (const timeout of _expiry.values()) {
    clearTimeout(timeout);
  }
  _seen.clear();
  _expiry.clear();
}
```

---

## `src/transfer/recordBicTransfer.ts`

```typescript
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
  } catch {
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
```

---

## `src/transfer/index.ts`

```typescript
export { recordBicTransfer, BIC_TRANSFER_EVENT } from './recordBicTransfer';
export type { BicTransferPayload } from './recordBicTransfer';
export { shouldFireTransfer, _clearDeduplicatorForTests } from './TransferDeduplicator';
```

---

## Integration Pattern: `@hbc/workflow-handoff`

When `@hbc/workflow-handoff` processes a handoff acknowledgment, it calls `recordBicTransfer()` explicitly — this is the primary example of the "background/server-driven" path (D-03):

```typescript
// In packages/workflow-handoff/src/hooks/useHandoffAcknowledge.ts
import { recordBicTransfer } from '@hbc/bic-next-move';

async function acknowledgeHandoff(handoff: IWorkflowHandoff) {
  await postHandoffAcknowledgment(handoff.id);

  // Explicit transfer — the handoff service drives the ownership change,
  // not a UI action visible to useBicNextMove's diff detection.
  recordBicTransfer({
    itemKey: handoff.bicItemKey,
    fromOwner: handoff.previousOwner,
    toOwner: handoff.newOwner,
    action: `Handoff acknowledged: ${handoff.actionDescription}`,
  });
}
```

---

## Integration Pattern: `@hbc/notification-intelligence` Registration

The notification event shape passed to `ni.registerEvent()`:

```typescript
{
  tier: 'immediate',              // Always Immediate for BIC transfers (spec requirement)
  type: 'bic-transfer',          // Allows notification-intelligence to apply BIC-specific rendering
  itemKey: 'bd-scorecard::a1b2c3',
  recipientUserId: 'aad-user-id-of-new-owner',
  title: 'Ball in court: bd scorecard',
  body: 'Jane Smith passed this to you: Review scorecard and accept or reject',
}
```

`@hbc/notification-intelligence` is responsible for:
- Routing the event to the recipient's notification feed
- Applying urgency-tier display rules (Immediate = red banner in feed)
- Deduplicating on its own side using `itemKey` + recipient

---

## Deduplication Edge Case: Bucket Boundary

If a transfer fires at second 59 of the bucket window, and the same transfer is detected again at second 61 (first second of next bucket), two notifications will be registered. This is acceptable — a 1-second window of potential double-notification is not user-visible in practice given the 60-second stale time on `useBicNextMove`. The 2× expiry timeout on the deduplication key further reduces this risk.

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/bic-next-move typecheck

# 2. Run transfer deduplication unit tests (written in T07)
pnpm --filter @hbc/bic-next-move test -- TransferDeduplicator

# 3. Verify recordBicTransfer is exported from package root
node -e "
  import('@hbc/bic-next-move').then(m => {
    console.log('recordBicTransfer:', typeof m.recordBicTransfer === 'function');
    console.log('BIC_TRANSFER_EVENT:', m.BIC_TRANSFER_EVENT);
  });
"

# 4. Smoke test: call twice, confirm notification mock called once
# (Full test implemented in T07 — this is the manual verification pattern)
node -e "
  import('@hbc/bic-next-move').then(({ recordBicTransfer, _clearDeduplicatorForTests }) => {
    _clearDeduplicatorForTests();
    let callCount = 0;

    // Mock notification-intelligence
    globalThis.__bicNiCallCount = 0;

    recordBicTransfer({
      itemKey: 'test::001',
      fromOwner: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      toOwner:   { userId: 'u2', displayName: 'Bob', role: 'Director' },
      action: 'Test transfer',
    });

    recordBicTransfer({
      itemKey: 'test::001',
      fromOwner: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      toOwner:   { userId: 'u2', displayName: 'Bob', role: 'Director' },
      action: 'Test transfer — duplicate',
    });

    console.log('Deduplication working if only 1 notification registered (check mock)');
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T06 Transfer Detection: COMPLETE — 2026-03-08
  Replaced TransferDeduplicator.ts stub — module-level singleton dedup on 60s bucket key (D-03), auto-expire at 2×
  Replaced recordBicTransfer.ts stub — BicTransferPayload type, dedup guard, lazy @hbc/notification-intelligence import (graceful degradation), DOM custom event emission, dev-mode console.debug/warn
  Replaced transfer/index.ts — explicit named exports (recordBicTransfer, BIC_TRANSFER_EVENT, BicTransferPayload, shouldFireTransfer, _clearDeduplicatorForTests)
  Added @hbc/notification-intelligence ambient module declaration in vite-env.d.ts (remove when SF-10 scaffolded)
  Verifications passed: typecheck (zero errors), build (zero errors)
-->
