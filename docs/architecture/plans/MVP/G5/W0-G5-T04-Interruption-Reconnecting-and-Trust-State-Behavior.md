# W0-G5-T04 — Interruption, Reconnecting, and Trust-State Behavior

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`

**Status:** Proposed
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-03, LD-08

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/session-state` | `packages/session-state/` | Connectivity status, operation queue, sync on reconnect | Assessed **ready**. `useConnectivity()` returns `ConnectivityStatus` (`'online' \| 'offline' \| 'degraded'`). `useSessionState()` provides `pendingOperations` count and queue management. `SessionStateProvider` manages sync. Consume these as-is. |
| `@hbc/app-shell` | `packages/app-shell/` | Mounting point for always-visible connectivity banner | **Requires gate check.** The app shell must provide a consistent location for trust signals that is visible across all PWA routes. Inspect `packages/app-shell/src/` to confirm the shell supports a persistent banner or status indicator slot. |

### Gate Outcome

If `@hbc/app-shell` does not provide a slot for persistent trust signals, T04 may implement the connectivity banner at the `apps/pwa/src/App.tsx` level as a direct child of the root layout. This is acceptable but should be noted as an architecture-level placement that may need to move when the app shell matures.

---

## Objective

Implement the interruption, reconnecting, and trust-state visibility layer for the hosted PWA requester surfaces. After this task:

1. Requesters always see a clear, unambiguous indicator of the current connectivity state
2. The connectivity indicator degrades gracefully across three states: online, offline, and degraded
3. Pending operations (queued actions awaiting connectivity) are surfaced at a glance
4. Deeper diagnostic detail is accessible but not displayed by default
5. Reconnect events trigger transparent sync without requiring requester action
6. The Wave 0 resilience boundary (what is and is not promised) is clearly communicated to requesters

---

## Scope

### Hybrid Resilience Posture

The hosted PWA is **primarily online**. Wave 0 does not promise full offline workflow completion. The resilience posture is:

- **Online:** All requester actions are available. Status is fetched live from the backend. Submissions and clarification responses are sent immediately.
- **Offline:** Draft field values are auto-saved to IndexedDB and protected. Pending submissions and API calls are queued via `@hbc/session-state`. The requester cannot successfully submit a new request or clarification response while offline — the action queues, but the requester must understand that it will execute when connectivity returns.
- **Degraded (intermittent / slow):** Same as online but with a visible degraded indicator. Submissions may take longer. The queue may grow. The requester is informed that the network is unreliable but not blocked.

### Connectivity Status Indicator — Always Visible

Implement a persistent connectivity indicator visible from all G5 routes. It must:

- Be always visible (not collapsed or hidden by default) when the status is `offline` or `degraded`
- Be dismissible or compact when `online` (the online state is the expected state — it need not dominate the UI)
- Show the state clearly using both color and text (not color alone — accessibility requirement)
- Source its state from `useConnectivity()` from `@hbc/session-state`

Recommended visual placement: top-of-page banner (below the app nav, above page content) or a persistent status chip in the app nav. The placement must be confirmed against `@hbc/ui-kit` and `@hbc/app-shell` capabilities.

### Pending Operations Count — Always Visible

When the `@hbc/session-state` operation queue is non-empty, surface a pending operations count as a secondary trust signal. Examples: "2 actions pending sync" or a badge count near the connectivity indicator. This count must be sourced from `useSessionState().pendingOperations.length`.

The requester must not be required to click anything to see that pending operations exist. The count itself is the signal. The detailed operation list is available on demand (see: layered visibility below).

### Layered Trust Signal Visibility

Follow LD-08: important signals always visible, deeper detail on demand.

| Signal | Visibility | Source |
|---|---|---|
| Online / Offline / Degraded label | Always visible when not `online`; compact when `online` | `useConnectivity()` |
| Pending operations count | Visible when queue is non-empty | `useSessionState().pendingOperations.length` |
| Draft saved indicator | Briefly visible after auto-save; not persistent | `useDraft().savedAt` |
| Last successful sync time | Available on demand (e.g., expand detail panel) | `useSessionState()` |
| Operation queue detail (type, target, retry count) | Available on demand only — not shown by default | `useSessionState().pendingOperations` |
| Specific API error messages | Available on demand or for failed operations | `pendingOperations[n].lastError` |

### Reconnect Behavior

When connectivity transitions from `offline` or `degraded` to `online`:

1. `@hbc/session-state`'s `SessionStateProvider` automatically executes the queued operation flush. No requester action is required.
2. The connectivity indicator transitions to `online`.
3. The pending operations count decreases as operations complete.
4. If a queued submission succeeds on reconnect, the requester sees the status update in the next status refresh.
5. If a queued submission fails after reconnect (e.g., the request was already submitted by another path, or a server error occurs), the operation moves to a failed state and the requester sees an actionable error.

### Interrupted-Session Recovery

When a requester returns to the PWA after a connectivity interruption:

1. The draft is intact (T03 owns this).
2. The connectivity indicator shows current state.
3. If there are pending operations from the previous session, the count is visible immediately on mount.
4. The PWA does not automatically resubmit queued operations from a previous session without the `SessionStateProvider` being mounted (the provider must be active for sync to occur).

### Wave 0 Resilience Boundary — What Is Not Promised

The following must be clearly documented in the implementation and, where appropriate, communicated to the requester:

- Full offline workflow completion is not supported in Wave 0. A requester cannot start a request, save it, and submit it without ever having connectivity. At minimum, the final submission requires connectivity.
- Connectivity-queued submissions are best-effort. If the operation fails after reconnect and exhausts retries, the requester must manually re-attempt.
- Status information (the `/projects` list and provisioning progress) is not available offline beyond what was last cached. The PWA does not promise a live offline status view.
- The `degraded` state does not guarantee that operations will succeed. It only means connectivity is present but unreliable.

Where the requester takes an action while offline (e.g., attempts to submit), the UI must immediately communicate: "You're offline. Your action has been saved and will be submitted automatically when you reconnect." Do not silently queue actions with no user feedback.

---

## Exclusions / Non-Goals

- Do not implement a full offline-capable workflow. LD-03 explicitly scopes Wave 0 as primarily online.
- Do not implement a custom connectivity detection mechanism. `@hbc/session-state` owns that concern.
- Do not implement background sync via Service Worker in this task. That belongs to T06 (install/mobile posture).
- Do not implement the completion summary trust signals. That belongs to T05.
- Do not implement coordinator-visibility states. LD-09 prohibits coordinator-specific Wave 0 behavior.

---

## Governing Constraints

- All connectivity state must come from `@hbc/session-state` — no `navigator.onLine` checks or custom WebSocket pings in the feature module
- Trust signals must be visible via color AND text (accessibility, LD-08)
- Layered visibility: do not surface operation queue detail by default (LD-08)
- The Wave 0 resilience boundary must be honest — do not promise behaviors the implementation cannot deliver

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/session-state` | Required | `useConnectivity`, `useSessionState`, `useDraft` (draft-saved indicator) |
| `@hbc/app-shell` | Required (or fallback) | Mounting point for connectivity banner |
| `@hbc/ui-kit` | Required | Visual components for connectivity banner, pending badge |
| T03 draft behavior | Predecessor | Draft-saved indicator depends on T03 `useDraft` integration |

---

## Acceptance Criteria

1. **Connectivity indicator is always visible when offline or degraded.** Simulate offline in DevTools; the connectivity banner/chip is visible without any user action.

2. **Connectivity indicator is accurate.** The indicator reflects the real `ConnectivityStatus` from `@hbc/session-state` — not a custom `navigator.onLine` check.

3. **Pending operations count is visible when non-zero.** Queue two operations while offline; the pending count shows "2" immediately; the count decreases as operations complete on reconnect.

4. **Reconnect triggers transparent sync.** Simulate offline, queue an operation, go back online — the operation executes automatically within `@hbc/session-state`'s executor timing; no requester action required.

5. **Offline action produces honest feedback.** If the requester attempts to submit while offline, the UI informs them that the action is queued (not silently queued and not blocked with a hard error).

6. **Deeper detail is accessible but not displayed by default.** Operation queue detail requires an explicit tap/click to reveal.

7. **Trust signals use color AND text.** No indicator is color-only.

8. **No custom connectivity logic in the feature module.** No direct `navigator.onLine` references or custom WebSocket/polling code in the PWA feature implementation.

---

## Validation / Readiness Criteria

Before T04 is closed:

- DevTools offline simulation test completed in Chrome and Safari (mobile emulation)
- Reconnect sync test: queue two operations while offline, go online, verify both execute and count goes to zero
- Accessibility review: run axe or equivalent on the connectivity banner — no color-contrast or label violations
- TypeScript compilation clean

---

## Known Risks / Pitfalls

**App shell mounting point uncertainty:** If `@hbc/app-shell` does not provide a reliable banner slot, the connectivity indicator placement may be awkward at the `App.tsx` level. This should be resolved during the gate check before implementation begins.

**Operation executor configuration:** `@hbc/session-state`'s `SessionStateProvider` requires an `executor` function that processes queued operations. The PWA must configure this executor with the correct `@hbc/provisioning` API calls. If the executor is not configured, queued operations will never execute. Verify the executor integration as part of T04.

**Degraded vs. offline distinction:** Some network conditions (e.g., behind a captive portal, or very high latency) may register as `online` in `navigator.onLine` but effectively prevent API calls. The `degraded` state detection in `@hbc/session-state` should be verified to catch these cases. If it does not, document the gap.

**Stale pending operations from previous sessions:** If a requester left pending operations from a previous PWA session, they may not be immediately visible on a new load until the `SessionStateProvider` mounts and reads the IndexedDB queue. Confirm this is handled gracefully.

---

## Progress Documentation Requirements

During active T04 work:

- Record the `@hbc/app-shell` gate check outcome and chosen connectivity indicator placement
- Record the executor configuration approach (how the provisioning API client is wired to the `SessionStateProvider` executor)
- Document any gaps found in `@hbc/session-state`'s degraded-state detection and the mitigation chosen

---

## Closure Documentation Requirements

Before T04 can be closed:

- The connectivity indicator component is documented in `apps/pwa/README.md` or the relevant feature README: what it shows, where it mounts, and what package drives it
- The executor configuration is documented (either inline in code or in the PWA README)
- The Wave 0 resilience boundary (what is not promised) is documented as a user-facing note in the relevant UI surface (tooltip, help text, or footer note on the status list)
- All acceptance criteria verified and checked off
- Accessibility check result recorded
