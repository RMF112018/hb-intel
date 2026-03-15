# Degraded-State UX Standard

**Purpose:** Define the minimum UX requirements for offline and degraded-connectivity states across all HB Intel work surfaces.
**Date:** 2026-03-15
**Governing doctrine:** Unified Blueprint §7.2 (locked Interview Decision 8) — "Users must never be misled into thinking they are seeing live data when they are not."

---

## 1. Connectivity States

| State | Detection | UX Requirement |
|-------|-----------|---------------|
| `online` | `navigator.onLine` = true AND probe response < threshold | Normal operation. No connectivity indicator needed. |
| `degraded` | Probe response time > `PROBE_TIMEOUT_MS / 2` | Amber connectivity bar: "Connection unstable. Some actions may be delayed." |
| `offline` | `navigator.onLine` = false OR probe timeout | Red connectivity bar: "You are offline. Changes will sync when you reconnect." |

**Detection infrastructure:** `@hbc/session-state` provides `createConnectivityMonitor(probeUrl?)` with configurable probe URL and intervals. The `useConnectivity()` hook exposes the current state to React components.

---

## 2. Required UX for All Work Surfaces

These requirements apply to every user-facing surface that displays data or accepts actions.

| Requirement | Implementation | Owner Package |
|------------|---------------|---------------|
| **Connectivity indicator** | `HbcConnectivityBar` mounted above the shell in root-route | `@hbc/session-state` |
| **Queued operation count** | `HbcSyncStatusBadge` with expandable detail popover | `@hbc/session-state` |
| **Last-synced timestamp** | `lastRefreshedIso` on feed result; "Last synced [time]" text | `@hbc/my-work-feed` |
| **Stale data indicator** | `isStale` flag when data age exceeds freshness threshold | `@hbc/my-work-feed` |
| **Per-source health** | `healthState.freshness`: `live`, `cached`, `partial`, `queued` | `@hbc/my-work-feed` |
| **Offline action queue** | Items with `offlineCapable: true` queue via `queueOperation()` | `@hbc/session-state` |
| **Failed action visibility** | Operations exceeding max retries (5) marked `failed`, user-visible | `@hbc/session-state` |

---

## 3. Rules

### Rule 1: No silent data staleness
When any data source returns `cached`, `partial`, or `queued` status instead of `live`, the surface must display a sync-state indicator. Users must be able to distinguish live data from stale data at a glance.

### Rule 2: No silent action failures
Queued operations that exceed max retries (5, with exponential backoff up to 60s ceiling) must surface to the user. The `HbcSyncStatusBadge` shows failed operations. Users must not wonder why their action "disappeared."

### Rule 3: Loaded data stays visible
Losing connectivity does NOT blank the screen. Cached data remains displayed with a "last synced [time]" overlay. The user can continue reviewing information even when mutations are blocked.

### Rule 4: Unsupported offline actions fail clearly
Items without `offlineCapable: true` on their actions must show "Not available offline" or equivalent when connectivity is `offline`. The action control must be visually disabled with an explanation (per §7.2 — "the system must explain why an action is or is not available").

### Rule 5: Reconnection triggers sync
When transitioning from `offline` → `online`, queued operations replay automatically:
- **PWA:** Background Sync API triggers replay
- **SPFx:** Polling sync at 30s interval triggers replay
Optimistic updates applied during offline are reconciled after sync completes.

### Rule 6: No opaque recovery
When a queued operation succeeds after reconnection, the user must see a confirmation. When it fails permanently, the user must see the failure with context. Silent background sync that changes data without indication violates §7.2.

---

## 4. SPFx vs PWA Behavioral Differences

| Behavior | SPFx (SharePoint iframe) | PWA (standalone) |
|----------|--------------------------|-------------------|
| Connectivity detection | `createConnectivityMonitor()` — same API | Same |
| Connectivity bar | `HbcConnectivityBar` with inline CSS (SPFx-safe) | Same component |
| Sync badge | `HbcSyncStatusBadge` with inline CSS | Same component |
| Operation sync | Polling at `SPFX_SYNC_POLL_INTERVAL_MS` (30s) | Background Sync API |
| Service worker | Not available in iframe | `vite-plugin-pwa` with auto-update |
| Draft persistence | IndexedDB via `@hbc/session-state` | Same |
| Offline likelihood | Low (SharePoint = online context) | Higher (field use, mobile) |

---

## 5. Operation Queue Behavior

| Aspect | Value |
|--------|-------|
| Storage | IndexedDB `queue` store |
| Retry strategy | Exponential backoff, base 1s, ceiling 60s |
| Max retries | 5 per operation |
| Failure handling | Marked `failed`, surfaced in `HbcSyncStatusBadge` |
| Persistence | Survives page refresh and app restart |
| Supported types | `upload`, `acknowledgment`, `form-save`, `api-mutation`, `notification-action` |
| Replayable My Work actions | `mark-read`, `defer`, `undefer`, `pin-today`, `pin-week`, `waiting-on` |

---

## 6. Verification Checklist

When building or reviewing a Wave 1 surface, verify:

- [ ] `HbcConnectivityBar` is mounted above the shell in the root-route
- [ ] `HbcSyncStatusBadge` is visible when operations are queued
- [ ] Data surfaces show "last synced" when data is not `live`
- [ ] Offline-capable actions queue correctly and replay on reconnect
- [ ] Non-offline-capable actions show "Not available offline" when disconnected
- [ ] Failed queue operations are visible to the user with context
- [ ] Loaded data remains visible when connectivity drops
- [ ] Connectivity transitions (offline → online) trigger sync without user action

---

## Related Documents

- [Freshness Behavior](./freshness-behavior.md) — last-synced display, stale indicators, update handling
- [PWA Shell Baseline](./pwa-shell-baseline.md) — shell provider hierarchy, service worker, executor
- [Wave 1 Surface Readiness Rubric](./wave-1-surface-readiness-rubric.md) — per-stream readiness criteria
- [Work Hub Interaction Contract](../work-hub/interaction-contract.md) — mutation vs navigation actions, offline capabilities
