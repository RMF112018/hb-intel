# P2-B2: Hub State Persistence and Return-Memory Contract

| Field | Value |
|---|---|
| **Doc ID** | P2-B2 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Specification |
| **Owner** | Experience / Shell + Platform / Core Services |
| **Update Authority** | Experience lead; changes require review by Platform lead |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [interaction-contract](../../../reference/work-hub/interaction-contract.md); `@hbc/session-state`; `@hbc/my-work-feed` |

---

## Specification Statement

The Personal Work Hub must provide trustworthy return behavior — when users navigate to a domain surface and return, they must find the hub in a recognizable state rather than starting from scratch. This specification defines the state persistence contract, draft key registry, return navigation flow, offline/degraded behavior, and cleanup rules. It is built on `@hbc/session-state` IndexedDB-backed draft storage and complements P2-B1's redirect memory contract (which handles post-auth routing, not application state).

---

## Spec Scope

### This specification governs

- Which hub state is persisted on navigation away
- Draft key names, TTLs, and storage layer for each state category
- Team mode persistence and role-gated restoration
- Scroll position and expansion state capture/restore
- Filter and search context persistence
- Offline feed cache strategy
- Return navigation flow (step-by-step)
- State cleanup triggers (logout, role change, TTL expiry)

### This specification does NOT govern

- Post-auth routing and redirect memory — see [P2-B1 §5](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)
- Freshness indicators and staleness UX — see P2-B3
- Cross-device state synchronization — see P2-B4
- Adaptive layout and card arrangement persistence — see P2-D2
- Personalization and saved-view persistence — see P2-D5

---

## Definitions

| Term | Meaning |
|---|---|
| **Return memory** | Application-level state captured when the user navigates away from `/my-work`, restored when they return. Distinct from redirect memory (which handles auth-redirect routing) |
| **Draft persistence** | IndexedDB-backed key-value storage provided by `@hbc/session-state` via `useDraft()` and `useAutoSaveDraft()` hooks, with configurable TTL |
| **Return state** | The bundle of UI state (scroll position, expanded groups) captured at the moment of navigation away |
| **Feed cache** | A stored copy of the last-successful `IMyWorkFeedResult`, used as a fallback when the user returns offline or with degraded connectivity |
| **State cleanup** | The process of clearing persisted drafts on logout, auth state change, or TTL expiry |
| **Role-gated restoration** | Validation that restored state (e.g., team mode) is still valid for the user's current role before applying it |

---

## 1. State Persistence Contract

### 1.1 Persisted State Categories

| Category | What Is Saved | Draft Key | TTL | Storage Layer |
|---|---|---|---|---|
| **Team mode** | Last-selected `teamMode` value | `hbc-my-work-team-mode` | 16 hours | `@hbc/session-state` IndexedDB draft |
| **Return state** | Scroll position, expanded group keys | `hbc-my-work-return-state` | 1 hour | `@hbc/session-state` IndexedDB draft |
| **Filter context** | Active `IMyWorkQuery` filter parameters | `hbc-my-work-filter-state` | 8 hours | `@hbc/session-state` IndexedDB draft |
| **Feed cache** | Last-successful `IMyWorkFeedResult` | `hbc-my-work-feed-cache` | 4 hours | `@hbc/session-state` IndexedDB draft |

### 1.2 What Is NOT Persisted

- **Feed data** beyond the cache — live feed is always re-fetched on return when online
- **Reasoning drawer state** — whether the reasoning drawer was open for a specific item
- **Notification badge state** — derived from live feed computation, not stored
- **Domain surface state** — state of workspace pages visited from the hub is not the hub's concern
- **Redirect memory** — handled separately by `@hbc/shell` (P2-B1 §5)

### 1.3 Draft Key Invariants

- All draft keys use the `hbc-my-work-` prefix to namespace hub state and enable bulk cleanup.
- TTLs are chosen to balance usefulness (return within a work session) against staleness risk.
- Drafts are scoped to the current browser session via IndexedDB; they do not sync across devices.
- All drafts are cleared on logout (§8).

---

## 2. Team Mode Persistence

### 2.1 What Is Saved

```
IMyWorkTeamModeDraft {
  teamMode: 'personal' | 'my-team' | 'delegated-by-me'
  savedAt: string  // ISO timestamp
}
```

### 2.2 Save Trigger

Team mode is saved whenever the user changes the team-mode toggle in the feed header. Use `useAutoSaveDraft('hbc-my-work-team-mode', 16)` with debounce to avoid write storms during rapid toggling.

### 2.3 Restore Behavior

On return to `/my-work`:

| Condition | Behavior |
|---|---|
| Draft exists and user's current role supports the saved mode | Restore saved team mode |
| Draft exists but user's role no longer supports `my-team` (e.g., Executive role removed) | Discard draft; fall back to `personal` |
| Draft exists but user's role no longer supports `delegated-by-me` (no delegations) | Discard draft; fall back to `personal` |
| No draft exists | Use role-based default: Executive → `my-team`, all others → `personal` |
| Draft expired (TTL exceeded) | Use role-based default |

### 2.4 Role-Gated Restoration

Before applying a restored team mode, validate against the current user's resolved roles from `@hbc/auth`:
- `my-team` requires elevated role entitlement (per P2-A3 §5)
- `delegated-by-me` requires the user to have active delegations
- `personal` is always valid

---

## 3. Return State (Scroll and Expansion)

### 3.1 What Is Saved

```
IMyWorkReturnState {
  scrollPosition: number       // window.scrollY or virtualized list offset
  expandedGroupKeys: string[]  // serialized Set of expanded lane/group identifiers
  capturedAt: string           // ISO timestamp
}
```

### 3.2 Save Trigger

Return state is captured when the user navigates away from `/my-work`. Detection methods:

| Method | When It Fires |
|---|---|
| **Route change listener** | TanStack Router `beforeLoad` or `onLeave` hook on the `/my-work` route |
| **Visibility change** | `document.visibilitychange` event when tab is hidden (covers tab switching) |

Use `useDraft('hbc-my-work-return-state', 1)` — 1-hour TTL reflects the expectation that return state is only useful for near-term returns.

### 3.3 Restore Behavior

On return to `/my-work`:

| Condition | Behavior |
|---|---|
| Draft exists and feed data is available | Restore scroll position after feed renders; restore expanded groups |
| Draft exists but feed structure changed (different items, different lanes) | Restore expanded groups where keys still match; skip scroll restoration |
| Draft expired | Start at top of feed with default expansion state |
| No draft | Start at top of feed with default expansion state |

### 3.4 Scroll Restoration Timing

Scroll restoration MUST wait until the feed has rendered with data. Sequence:
1. Feed component mounts
2. Feed data loads (from cache or network)
3. Feed renders items
4. Apply saved scroll position via `window.scrollTo()` or virtualization API
5. Clear the return state draft (consumed)

---

## 4. Filter and Search Context

### 4.1 What Is Saved

```
IMyWorkFilterState {
  projectId?: string
  moduleKeys?: string[]
  priorities?: string[]      // MyWorkPriority values
  classes?: string[]         // MyWorkItemClass values
  states?: string[]          // MyWorkState values
  includeDeferred?: boolean
  lane?: string              // MyWorkLane value
  savedAt: string            // ISO timestamp
}
```

Note: `teamMode` is persisted separately (§2) because it has different TTL and restoration logic.

### 4.2 Save Trigger

Filter state is saved whenever the user changes any filter parameter. Use `useAutoSaveDraft('hbc-my-work-filter-state', 8, 500)` — 8-hour TTL, 500ms debounce.

### 4.3 Restore Behavior

On return to `/my-work`:

| Condition | Behavior |
|---|---|
| Draft exists | Restore all saved filters; apply to `IMyWorkQuery` |
| Draft expired | Use default query (no filters) |
| User explicitly clears filters | Clear the filter draft immediately |

### 4.4 Filter Validity

Restored filters are applied as-is. If a filter references a `projectId` that no longer exists or a `moduleKey` that's been removed, the feed query naturally returns no items for that filter — the user sees the result and can clear filters. No pre-validation of filter values is required.

---

## 5. Offline Feed Cache

### 5.1 What Is Saved

```
IMyWorkFeedCache {
  result: IMyWorkFeedResult   // Full feed result including items, counts, health
  cachedAt: string            // ISO timestamp
  sourceStates: Record<string, 'live' | 'cached' | 'partial'>
}
```

### 5.2 Save Trigger

The feed cache is saved whenever a successful feed computation completes with at least one `live` source. Use `useDraft('hbc-my-work-feed-cache', 4)` — 4-hour TTL.

### 5.3 Cache Usage

The feed cache is used ONLY as a fallback when the user returns to `/my-work` and the live feed fetch fails or is in progress:

| Connectivity State | Behavior |
|---|---|
| `online` | Fetch live feed; show loading state; ignore cache |
| `degraded` | Fetch live feed; if slow (>3s), show cached feed with "Refreshing..." indicator; replace with live data when available |
| `offline` | Show cached feed immediately with staleness indicator; queue any mutations for replay |

### 5.4 Cache Invariants

- The feed cache is a **fallback**, not a primary data source. Live data always takes precedence when available.
- The cached feed MUST display with a staleness indicator showing `cachedAt` timestamp (per P2-A1 §8.1 trust invariant).
- Cached items retain their `rankingReason` from the time of caching — ranking may differ from a live computation.
- The cache is invalidated (cleared) when the user logs out or when TTL expires.

---

## 6. Return Navigation Flow

The following step-by-step flow specifies how state is captured and restored during a hub → domain → hub navigation cycle.

### 6.1 Outbound: Hub → Domain Surface

| Step | Action | Responsibility |
|---|---|---|
| 1 | User clicks a work item's "Open" action or navigates via deep link | Feed component |
| 2 | Capture return state (scroll position, expanded groups) | Route `onLeave` handler → `useDraft('hbc-my-work-return-state')` |
| 3 | Team mode and filter state are already auto-saved (§2, §4) | `useAutoSaveDraft` hooks |
| 4 | Router navigates to domain surface via `context.href` | TanStack Router |
| 5 | Shell preserves routing history for browser back | `@hbc/shell` |

### 6.2 At Domain Surface

| Step | Action | Responsibility |
|---|---|---|
| 6 | User performs domain actions (approve, reject, update) | Domain surface |
| 7 | If offline, mutations are queued in `@hbc/session-state` | Session-state queue |

### 6.3 Inbound: Domain Surface → Hub

| Step | Action | Responsibility |
|---|---|---|
| 8 | User navigates back (shell nav, browser back, "Back to My Work" link) | Router |
| 9 | `/my-work` route loads; `HbcMyWorkFeed` component mounts | Route component |
| 10 | Restore team mode from draft; validate against current role (§2.3) | Feed component |
| 11 | Restore filter context from draft (§4.3) | Feed component |
| 12 | Initiate live feed fetch with restored team mode and filters | TanStack Query |
| 13 | While fetching: show cached feed if available and connectivity is degraded/offline (§5.3) | Feed component |
| 14 | Live feed arrives → render with current data | Feed component |
| 15 | Restore scroll position and expanded groups from return state draft (§3.4) | Feed component (post-render) |
| 16 | Clear return state draft (consumed) | Feed component |

### 6.4 Flow Invariants

- Steps 10–11 (state restoration) happen synchronously before the feed fetch, so the query uses the correct team mode and filters.
- Step 15 (scroll restoration) happens after render, not before — the DOM must have the content to scroll to.
- If live data arrives quickly (before cached feed is shown), skip the cache and render live directly.
- Domain mutations made in step 6 are reflected in the live feed (step 14) because the feed re-fetches from source adapters.

---

## 7. Offline and Degraded Return Behavior

### 7.1 Connectivity States

Per `@hbc/session-state` connectivity detection:

| State | Detection | Hub Behavior |
|---|---|---|
| `online` | `navigator.onLine === true` + probe success | Normal operation: live fetch, no cache fallback |
| `degraded` | `navigator.onLine === true` + probe failure or high latency | Show cached feed if fetch exceeds 3s; refresh in background |
| `offline` | `navigator.onLine === false` | Show cached feed immediately; queue mutations; sync on reconnect |

### 7.2 Offline Return Behavior

When the user returns to `/my-work` while offline:

1. Show cached feed from `hbc-my-work-feed-cache` draft if available
2. Display staleness indicator: "Last updated [cachedAt timestamp] — you are offline"
3. Restore team mode, scroll position, and filters from drafts
4. Allow optimistic mutations: `mark-read`, `defer`, `undefer`, `pin-today`, `pin-week`, `waiting-on`
5. Queue mutations in `@hbc/session-state` operation queue for replay on reconnect
6. When connectivity restores: trigger live feed fetch, replay queued mutations, reconcile state

### 7.3 No-Cache Offline Return

If the user returns offline and no feed cache exists:

1. Show empty state with connectivity message: "You are offline. Your work feed will load when connectivity is restored."
2. The `@hbc/smart-empty-state` `loading-failed` classification applies
3. No redirect — the user stays on `/my-work` (per P2-A1 §1.2 no-redirect invariant)
4. Auto-retry when connectivity is detected

### 7.4 Mutation Reconciliation

When connectivity restores after offline mutations:

| Event | Behavior |
|---|---|
| Queue replay succeeds | Mutations applied; feed refreshes with server state |
| Queue replay partially fails | Successful mutations applied; failed mutations shown with error; feed refreshes |
| Conflict detected (item state changed since cache) | Server state wins; user sees updated item; no data loss (feed mutations are non-destructive) |

See [interaction-contract §5](../../../reference/work-hub/interaction-contract.md) for the full mutation vs navigation action taxonomy and offline-capable mutation list.

---

## 8. State Cleanup Rules

### 8.1 Cleanup Triggers

| Trigger | What Is Cleared | Mechanism |
|---|---|---|
| **User logout** | All `hbc-my-work-*` drafts | Auth state change listener clears IndexedDB drafts by key prefix |
| **Auth state change** (role change, session refresh) | Team mode draft only (re-validate role eligibility) | Auth event listener checks team mode validity |
| **TTL expiry** | Individual drafts per their TTL | `@hbc/session-state` automatic TTL enforcement |
| **Explicit user action** | Filter state cleared on "Clear filters"; return state cleared on consumption | Component-level draft deletion |
| **New session** (browser restart) | IndexedDB persists across restarts; TTL-expired drafts are cleaned | TTL enforcement on read |

### 8.2 Cleanup Invariants

- Logout MUST clear all hub state drafts. Sensitive work-item data (cached feed) must not persist after authentication ends.
- Role changes MUST trigger team mode re-validation before the next restore.
- TTL expiry is enforced on read — expired drafts return null and are cleaned up lazily.
- The feed cache is NOT cleared on route change — it persists for offline fallback until TTL expires or logout.

---

## 9. Integration Points

### 9.1 Hooks and APIs

| Hook | Package | Used For |
|---|---|---|
| `useDraft<T>(key, ttlHours)` | `@hbc/session-state` | Return state (1h), feed cache (4h) |
| `useAutoSaveDraft<T>(key, ttlHours, debounceMs)` | `@hbc/session-state` | Team mode (16h, 300ms), filter context (8h, 500ms) |
| `useConnectivity()` | `@hbc/session-state` | Connectivity state for cache fallback decisions |
| `useQueryClient()` | TanStack Query | Feed query invalidation on return |
| `resolveRoleLandingPath()` | `@hbc/shell` | Default team mode by role (P2-B1 §3) |

### 9.2 Draft Key Registry

All hub state draft keys are registered here for lifecycle management:

| Key | Type | TTL | Auto-Save |
|---|---|---|---|
| `hbc-my-work-team-mode` | `IMyWorkTeamModeDraft` | 16h | Yes (300ms debounce) |
| `hbc-my-work-return-state` | `IMyWorkReturnState` | 1h | No (captured on nav away) |
| `hbc-my-work-filter-state` | `IMyWorkFilterState` | 8h | Yes (500ms debounce) |
| `hbc-my-work-feed-cache` | `IMyWorkFeedCache` | 4h | No (saved on successful fetch) |

### 9.3 TanStack Query Integration

- Feed query keys follow the existing `myWorkKeys` factory pattern.
- On return to `/my-work`, invalidate stale queries to trigger re-fetch.
- Feed cache (§5) is independent of TanStack Query's cache — it uses `@hbc/session-state` for IndexedDB persistence, while TanStack manages in-memory query state.

---

## 10. Acceptance Gate Reference

P2-B2 contributes evidence for the Continuity gate:

| Field | Value |
|---|---|
| **Gate** | Continuity gate |
| **Pass condition** | Redirect memory, return memory, and context restoration are trustworthy |
| **P2-B2 evidence** | State persistence contract (§1), return flow specification (§6), offline behavior (§7), cleanup rules (§8) |
| **Primary owner** | Experience / Shell |

Evidence requirements:
- Persistence contract defines what is saved and with what TTL ✓
- Return flow specifies step-by-step state capture and restoration ✓
- Offline behavior shows cached feed with staleness indicators ✓
- Cleanup rules ensure state is purged on logout ✓
- Navigation test scenarios can be derived from the return flow (§6) ✓

---

## 11. Locked Decisions

| Decision | Locked Resolution | P2-B2 Consequence |
|---|---|---|
| Return behavior | **Strong context memory** | Hub must persist and restore team mode, scroll position, filters, and provide offline feed cache |
| Freshness model | **Hybrid freshness/staleness trust model** | Feed cache must display with staleness indicators; trust invariant applies to cached data |
| Low-work default | **Stay on Personal Work Hub** | No-cache offline return stays on `/my-work` with connectivity message, never redirects |

---

## 12. Policy Precedence

| Deliverable | Relationship to P2-B2 |
|---|---|
| **P2-B1** — Root Routing and Landing Precedence | P2-B1 handles redirect memory (post-auth routing). P2-B2 handles return memory (application state). Together they provide the complete return experience |
| **P2-B3** — Freshness and Staleness Trust Policy | P2-B3 defines how staleness indicators appear. P2-B2 defines when cached data is shown (offline/degraded returns) |
| **P2-B4** — Cross-Device Shell Behavior | P2-B4 addresses whether state syncs across devices. P2-B2 scopes state to the current browser session |
| **P2-D2** — Adaptive Layout and Zone Governance | P2-D2 may define additional layout persistence (card arrangement). P2-D2 should use the same `@hbc/session-state` draft pattern with its own key prefix |
| **P2-D5** — Personalization Policy | P2-D5 governs what personalization is allowed. P2-B2 provides the persistence mechanism for approved personalization choices |

If a downstream deliverable needs additional hub state persistence, it should follow the draft key pattern established here (§9.2) and register its keys in the draft key registry.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
