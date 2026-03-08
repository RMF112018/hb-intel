# SF04-T07 — Offline Queue Integration: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-02 (offline queue, client timestamp, pending sync indicator)
**Estimated Effort:** 0.25 sprint-weeks
**Wave:** 2

---

## Objective

Define how `@hbc/acknowledgment` integrates with `@hbc/session-state` to queue network-failed acknowledgment attempts, replay them on reconnect, display a "pending sync" indicator, and handle ordering guarantees for sequential mode.

---

## 3-Line Plan

1. Specify the offline queue entry schema and the `useSessionStateQueue('acknowledgments')` integration contract.
2. Define the replay-on-reconnect logic, including sequential ordering and deduplication.
3. Specify the "pending sync" indicator and the timestamp reconciliation behaviour on successful replay.

---

## Offline Queue Entry Schema

```typescript
// Written by useAcknowledgment.ts onError (network failure path — D-02)
interface AcknowledgmentQueueEntry {
  /** Queue namespace for acknowledgments. */
  queue: 'acknowledgments';
  endpoint: '/api/acknowledgments';
  method: 'POST';
  body: ISubmitAcknowledgmentRequest;
  /** Client-side ISO timestamp at the moment of the original submission attempt. */
  enqueuedAt: string;
  /** Unique key — prevents duplicate entries if network drops mid-flight. */
  idempotencyKey: string; // `${contextType}:${contextId}:${partyUserId}`
}
```

---

## Failure Detection (D-02)

The `isNetworkFailure()` utility (defined in T02) classifies errors as network failures — eligible for queuing — vs. logical failures — eligible for rollback:

```typescript
// Network failure conditions → queue:
//   TypeError: Failed to fetch  (offline / DNS failure)
//   HTTP 0     (CORS preflight blocked, no response)
//   HTTP 408   (Request Timeout)
//   HTTP 503   (Service Unavailable)
//   HTTP 504   (Gateway Timeout)

// Logical failure conditions → rollback + error toast:
//   HTTP 400   (Bad request — validation failure)
//   HTTP 403   (Sequential order violation, missing AcknowledgmentAdmin role)
//   HTTP 404   (Config not found)
//   HTTP 409   (Decline block — D-09)
//   HTTP 422   (Unprocessable entity)
```

---

## `useAcknowledgment` Integration (Network Failure Branch)

This is the network-failure path inside `onError` from T03, fully specified:

```typescript
// Inside useMutation onError:
if (isNetworkFailure(error)) {
  const idempotencyKey =
    `${body.contextType}:${body.contextId}:${body.partyUserId}`;

  // Check for duplicate — avoid double-queuing if onError fires twice
  const isDuplicate = await offlineQueue.has(idempotencyKey);
  if (!isDuplicate) {
    await offlineQueue.enqueue({
      queue: 'acknowledgments',
      endpoint: '/api/acknowledgments',
      method: 'POST',
      body,
      enqueuedAt: new Date().toISOString(),
      idempotencyKey,
    });
  }

  // Update query cache: mark this party's event as isPendingSync = true
  queryClient.setQueryData<IAcknowledgmentState>(queryKey, (prev) => {
    if (!prev) return prev;
    const updatedEvents = prev.events.map((e) =>
      e.partyUserId === currentUserId
        ? { ...e, isPendingSync: true, acknowledgedAt: body.acknowledgedAt }
        : e
    );
    return { ...prev, events: updatedEvents };
  });

  // Do NOT rollback — the optimistic update remains with isPendingSync=true
  // so the user sees their action as "in progress" rather than failed
}
```

---

## Replay on Reconnect

`@hbc/session-state` exposes a `useQueueReplay` hook that fires when connectivity is restored. `useAcknowledgment` does **not** need to implement replay logic directly — it registers its queue namespace and the replay handler:

```typescript
// src/hooks/useAcknowledgmentQueueReplay.ts
// Called once at app level (e.g., in ComplexityProvider or AppShell)

import { useQueueReplay } from '@hbc/session-state';

export function useAcknowledgmentQueueReplay() {
  useQueueReplay('acknowledgments', async (entry: AcknowledgmentQueueEntry) => {
    // Replay the queued POST
    const res = await fetch(entry.endpoint, {
      method: entry.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry.body),
    });

    if (!res.ok) {
      // Logical failure on replay (e.g., 403 sequential order changed while offline)
      // Remove from queue + show error notification to user
      return { success: false, remove: true, notifyUser: true };
    }

    // Success — remove from queue
    return { success: true, remove: true };
  });
}
```

### Replay Ordering for Sequential Mode

`@hbc/session-state` replays entries in `enqueuedAt` ascending order within a queue namespace. This ensures that if multiple sequential parties went offline and queued their acknowledgments, they replay in the chronological order the users clicked — preserving sequential intent.

If the server rejects a replayed sequential acknowledgment with 403 (order violation — because conditions changed while offline), the replay handler returns `{ success: false, remove: true, notifyUser: true }` and the user is shown:

> "Your offline acknowledgment for [record name] could not be submitted — the sign-off order changed while you were offline. Please review and re-acknowledge."

---

## "Pending Sync" Indicator

The `isPendingSync: true` flag on `IAcknowledgmentEvent` (T02) drives these visual indicators:

### In `StandardPartyList` / `ExpertAuditTrail` (T04)
```typescript
{event?.isPendingSync && (
  <span className="hbc-ack-party-row__pending-sync" role="status" aria-live="polite">
    ⏳ Pending sync
  </span>
)}
{!event?.isPendingSync && event?.acknowledgedAt && (
  <time dateTime={event.acknowledgedAt}>{formatDateTime(event.acknowledgedAt)}</time>
)}
```

### In `EssentialCTA` (T04)
```typescript
{isPendingSync && (
  <p className="hbc-ack-panel__pending-sync-msg" role="status">
    ⏳ Your acknowledgment will sync when you reconnect.
  </p>
)}
```

### In `HbcAcknowledgmentBadge` (T05)
The badge does not change its count for pending-sync events — the optimistic count is already reflected in the cache. The `isPendingSync` flag is purely for timestamp/indicator display in the panel.

---

## Timestamp Reconciliation

After successful replay:

1. Server writes the entry with `acknowledgedAt` = the client-submitted timestamp (D-02: client timestamp is accepted as authoritative for construction workflows).
2. TanStack Query invalidates on `onSettled` of the replayed mutation.
3. The refetch returns the server-confirmed event — `isPendingSync: false`, `acknowledgedAt` = the original client timestamp.
4. Panel re-renders with the actual timestamp in place of "⏳ Pending sync".

No timestamp correction is performed on the client. The server accepts the client's `acknowledgedAt` as-is and stores it in `AcknowledgedAt` on the SharePoint list.

---

## App-Level Registration

In `apps/pwa/src/main.tsx` or the Application Customizer root:

```typescript
import { useAcknowledgmentQueueReplay } from '@hbc/acknowledgment';

function App() {
  // Register replay handler once at app root
  useAcknowledgmentQueueReplay();

  return <RouterProvider router={router} />;
}
```

---

## Unit Tests

```typescript
// hooks/__tests__/useAcknowledgment.offline.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAcknowledgment } from '../useAcknowledgment';
import { createAckWrapper, createMockAckConfig, mockAckStates } from '@hbc/acknowledgment/testing';
import { mockSessionStateQueue } from '@hbc/session-state/testing';

describe('useAcknowledgment — offline queue (D-02)', () => {
  it('enqueues acknowledgment on network failure', async () => {
    const queue = mockSessionStateQueue('acknowledgments');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const config = createMockAckConfig({ mode: 'single' });
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper: createAckWrapper(mockAckStates.pending) }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    expect(queue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        queue: 'acknowledgments',
        endpoint: '/api/acknowledgments',
        method: 'POST',
      })
    );
  });

  it('marks optimistic event as isPendingSync=true on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const config = createMockAckConfig({ mode: 'single' });
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper: createAckWrapper(mockAckStates.pending) }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    const pendingEvent = result.current.state?.events.find(
      (e) => e.partyUserId === 'user-1'
    );
    expect(pendingEvent?.isPendingSync).toBe(true);
  });

  it('does NOT enqueue on logical failure (403)', async () => {
    const queue = mockSessionStateQueue('acknowledgments');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Forbidden', { status: 403 })
    ));
    const config = createMockAckConfig({ mode: 'sequential' });
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-2'),
      { wrapper: createAckWrapper(mockAckStates.pending) }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it('does not create duplicate queue entries on retry', async () => {
    const queue = mockSessionStateQueue('acknowledgments');
    queue.has.mockResolvedValue(true); // simulate existing entry
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const config = createMockAckConfig({ mode: 'single' });
    const { result } = renderHook(
      () => useAcknowledgment(config, 'ctx-001', 'user-1'),
      { wrapper: createAckWrapper(mockAckStates.pending) }
    );

    await act(async () => {
      await result.current.submit({ status: 'acknowledged' });
    });

    expect(queue.enqueue).not.toHaveBeenCalled();
  });
});
```

---

## Verification Commands

```bash
pnpm --filter @hbc/acknowledgment typecheck
pnpm --filter @hbc/acknowledgment test -- --reporter=verbose hooks/ --grep offline
```
