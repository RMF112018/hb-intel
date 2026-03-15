# Update and Freshness Behavior — Wave 1

**Purpose:** Define the minimum user-visible freshness behavior required for trusted PWA use.
**Date:** 2026-03-15
**Governing doctrine:** Unified Blueprint §7.2 — "Users must never be misled into thinking they are seeing live data when they are not."

---

## 1. Last-Synced Display

| Surface | How Last-Synced Is Shown | Data Source |
|---------|------------------------|------------|
| **Work Hub feed** | `lastRefreshedIso` on `IMyWorkFeedResult` | TanStack Query `dataUpdatedAt` from feed query |
| **Work Hub offline banner** | "Last synced [relative time]" (e.g., "Last synced 3 minutes ago") | `useMyWorkOfflineState().lastSuccessfulSyncIso` |
| **Connectivity bar** | "Reconnecting…" or "You are offline" | `useConnectivity()` state from `@hbc/session-state` |
| **Sync badge** | "[N] pending" with expandable queue detail | `useSessionState().pendingCount` |
| **Data query surfaces** | Per-query `dataUpdatedAt` from TanStack Query | Individual query cache entries |

### Display Rules

- **Live:** No freshness indicator needed (default state)
- **Cached (< 5 min):** No indicator (within acceptable freshness window)
- **Cached (> 5 min):** Show "Last synced [time]" in subtle text near the data surface
- **Degraded:** Show connectivity bar + "Last synced [time]" on data surfaces
- **Offline:** Show connectivity bar + "Last synced [time]" + "Changes will sync when you reconnect"

---

## 2. Stale-State Indicators

### Feed-level

| Field | Type | Purpose |
|-------|------|---------|
| `IMyWorkFeedResult.isStale` | `boolean` | True when feed data age exceeds TanStack Query `staleTime` |
| `IMyWorkFeedResult.lastRefreshedIso` | `string` | ISO timestamp of last successful feed computation |
| `IMyWorkFeedResult.healthState` | `IMyWorkHealthState` | Per-source freshness tracking |

### Per-source health

| Field | Type | Purpose |
|-------|------|---------|
| `healthState.freshness` | `'live' \| 'cached' \| 'partial' \| 'queued'` | Current freshness status |
| `healthState.degradedSourceCount` | `number` | Count of sources returning cached/partial data |
| `healthState.hiddenSupersededCount` | `number` | Count of items hidden by supersession |
| `healthState.warningMessage` | `string \| undefined` | Optional human-readable warning |

### Freshness status meanings

| Status | Meaning | UX |
|--------|---------|-----|
| `live` | All sources fetched successfully within freshness window | Normal — no indicator |
| `cached` | Data served from cache; at least one source unreachable | Show "Last synced [time]" |
| `partial` | Some sources loaded, others failed or timed out | Show "Some data may be incomplete" |
| `queued` | Offline; data from cache; mutations queued | Show offline banner with queue count |

---

## 3. Update Handling

### Service Worker Updates (PWA)

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Service worker updates apply automatically on next navigation
- No user-visible "update available" prompt — updates are silent
- If an update requires a full reload, it happens at next navigation boundary

### TanStack Query Cache Management

- Queries have configurable `staleTime` and `gcTime` (garbage collection time)
- Background refetch occurs automatically when a query becomes stale and the component is in view
- Manual refetch available via `queryClient.invalidateQueries()`
- Optimistic updates applied immediately for offline-capable mutations; reconciled on sync

### Feed Refresh Behavior

- Feed refreshes automatically when the user navigates to the Work Hub
- Feed refreshes after returning from a source workspace (to reflect any mutations made there)
- Manual "Refresh" affordance available in the feed UI
- Refresh does not discard cached data — it merges new results with existing cache

---

## 4. Safe Shell-Level Refresh

Browser-level refresh (F5 / pull-to-refresh) preserves:

| State | Persistence | Mechanism |
|-------|------------|-----------|
| Auth session | Survives refresh | MSAL token cache in localStorage |
| Pre-refresh route | Captured and restored | `captureIntendedDestination()` → redirect memory |
| Draft data | Survives refresh | IndexedDB via `@hbc/session-state` (TTL-governed, default 24h) |
| Queued operations | Survives refresh | IndexedDB `queue` store; replayed on reconnect |
| TanStack Query cache | Lost on refresh | Rebuilt from network on next query execution |
| Zustand store state | Lost on refresh | Rebuilt from auth bootstrap + query results |

### Startup Performance

Shell startup timing budget (`useStartupTimingCompletion`) validates bootstrap performance after refresh. Dev mode surfaces timing diagnostics for optimization.

---

## 5. Wave 1 Implementation Requirements

1. All data surfaces that show fetched data must respect the stale-state indicators
2. Work Hub feed must show `lastRefreshedIso` when `healthState.freshness !== 'live'`
3. Work Hub offline banner must show when `useMyWorkOfflineState().isOnline === false`
4. Draft forms must show "Draft saved [time]" after auto-save completes
5. Queued operations must show confirmation when they succeed after reconnection

---

## Related Documents

- [Degraded-State UX Standard](./degraded-state-ux-standard.md) — connectivity states and offline rules
- [PWA Shell Baseline](./pwa-shell-baseline.md) — service worker, executor, provider hierarchy
- [Work Hub Interaction Contract](../work-hub/interaction-contract.md) — stale-state labeling, source-of-truth links
