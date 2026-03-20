# P2-B3: Freshness, Refresh, and Staleness Trust Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-B3 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Governance Policy |
| **Owner** | Platform / Core Services + Experience / Shell |
| **Update Authority** | Platform lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §8](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [interaction-contract §3](../../../reference/work-hub/interaction-contract.md); `aggregateFeed.ts`; `connectivity.ts`; `HbcConnectivityBar`; `HbcMyWorkSourceHealth` |

---

## Policy Statement

Users must never be misled into thinking they are seeing live data when they are not. This policy converts that trust invariant into concrete freshness thresholds, refresh intervals, staleness display rules, degraded/offline UX specifications, and cross-lane vocabulary consistency requirements. When the feed is stale, partially loaded, cached, or offline-queued, the hub MUST communicate that state clearly and calmly — without alarming users or undermining trust in the operating layer.

---

## Policy Scope

### This policy governs

- Freshness thresholds (when data becomes stale)
- Refresh intervals (how often the feed recomputes)
- Sync status vocabulary and user-facing labels
- Staleness display rules by complexity tier
- Degraded-state and offline-state UX behavior
- Partial-load behavior and source health visibility
- Ranking stability expectations for cached data
- Mutation reconciliation expectations on reconnect
- Cross-lane freshness vocabulary consistency
- Freshness-related telemetry events

### This policy does NOT govern

- Feed cache TTL or draft key management — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- State persistence and return-memory mechanics — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- Root routing and landing precedence — see [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)
- Ranking coefficients or scoring model — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Cross-device synchronization — see P2-B4

---

## Definitions

| Term | Meaning |
|---|---|
| **Freshness window** | The maximum age of feed data before it is considered stale. Measured from `lastRefreshedIso` |
| **Staleness threshold** | The point at which the feed transitions from fresh to stale, triggering `isStale: true` and requiring a visible indicator |
| **Sync status** | The current state of data freshness: `live`, `cached`, `partial`, or `queued`. Type: `MyWorkSyncStatus` |
| **Degraded state** | Connectivity is present but unreliable — probes succeed slowly or intermittently. Type: `ConnectivityStatus = 'degraded'` |
| **Feed refresh** | A recomputation of the feed via the aggregation pipeline, fetching from all enabled source adapters |
| **Partial load** | A feed computation where some sources succeeded and others failed, resulting in `freshness: 'partial'` |
| **Optimistic update** | A mutation applied to the local feed state immediately, before server confirmation, with reconciliation on sync |

---

## 1. Trust Invariant

Per Unified Blueprint §7.2 (locked Interview Decision 8) and P2-A1 §8.1:

> **"Users must never be misled into thinking they are seeing live data when they are not."**

### Enforcement Rules

| Condition | Required Action |
|---|---|
| Any source not in `live` state | Sync-state indicator MUST be visible |
| Feed `isStale === true` | Staleness label MUST be visible with timestamp |
| Connectivity is `degraded` | Degraded indicator MUST be visible |
| Connectivity is `offline` | Offline banner MUST be visible with last-cached timestamp |
| Cached feed shown as fallback | "Last updated [timestamp]" MUST be displayed |
| Mutations queued for replay | Pending mutation count MUST be accessible |

### Trust Invariant Exceptions

- None. There are no exceptions to the trust invariant. Silent serving of stale data is always a policy violation.

---

## 2. Freshness Thresholds

### 2.1 Feed-Level Staleness

| Constant | Value | Meaning |
|---|---|---|
| `FEED_FRESHNESS_WINDOW_MS` | 300,000 (5 minutes) | Feed data older than 5 minutes since `lastRefreshedIso` triggers `isStale: true` |

When the feed has not been refreshed within the freshness window:
- `isStale` transitions to `true`
- The staleness indicator appears (§5)
- Auto-refresh is triggered if the hub is visible (§3)

### 2.2 Per-Source Staleness

| Constant | Value | Meaning |
|---|---|---|
| `SOURCE_FRESHNESS_WINDOW_MS` | 600,000 (10 minutes) | Individual source data older than 10 minutes is considered source-stale |

Per-source staleness is tracked in `IMyWorkHealthState.freshness` and `degradedSourceCount`. A source may be individually stale while the aggregate feed is still within its freshness window (e.g., one adapter failed on the last refresh attempt).

### 2.3 Threshold Rationale

- **5-minute feed threshold** balances data currency against refresh cost. Most work-item state changes (approvals, handoffs, ownership transfers) are not sub-minute events — a 5-minute window captures meaningful changes without excessive polling.
- **10-minute source threshold** allows individual sources to be briefly unavailable without immediately degrading the feed's trust signal. If a source hasn't updated in 10 minutes, it's likely experiencing a real issue.

---

## 3. Refresh Intervals

### 3.1 Auto-Refresh

| Constant | Value | Meaning |
|---|---|---|
| `FEED_AUTO_REFRESH_INTERVAL_MS` | 180,000 (3 minutes) | Feed auto-refreshes every 3 minutes while the hub tab is visible |

Auto-refresh behavior:

| Condition | Behavior |
|---|---|
| Hub visible and `online` | Auto-refresh every 3 minutes |
| Hub visible and `degraded` | Auto-refresh every 3 minutes (may produce partial results) |
| Hub visible and `offline` | No auto-refresh; show cached feed |
| Hub not visible (tab hidden) | No auto-refresh; refresh on tab focus return |
| User triggers manual refresh | Immediate refresh; reset auto-refresh timer |

### 3.2 TanStack Query Configuration

| Config | Value | Rationale |
|---|---|---|
| `staleTime` | 180,000 (3 minutes) | Matches auto-refresh interval; prevents redundant fetches |
| `gcTime` (formerly `cacheTime`) | 600,000 (10 minutes) | Keep query cache for 10 minutes for tab-switch scenarios |
| `refetchOnWindowFocus` | `true` | Refresh when user returns to the tab |
| `refetchOnReconnect` | `true` | Refresh when connectivity restores |
| `retry` | 2 | Retry failed fetches twice with exponential backoff |

### 3.3 Refresh Throttling

- Consecutive manual refreshes MUST be throttled to at most one per 10 seconds to prevent refresh storms.
- Auto-refresh and manual refresh share the same query key — a manual refresh resets the auto-refresh timer.

---

## 4. Sync Status Vocabulary

The feed uses four sync status states. These are the canonical labels and visual treatments.

**Type:** `MyWorkSyncStatus` from `packages/my-work-feed/src/types/IMyWorkItem.ts`

| Status | User-Facing Label | Visual Variant | Meaning |
|---|---|---|---|
| `live` | "Up to date" | `success` (green) | All sources fetched successfully within the freshness window |
| `cached` | "Using saved data" | `info` (blue) | Data served from cache; live sources unreachable |
| `partial` | "Some data unavailable" | `warning` (amber) | Some sources loaded successfully, others failed |
| `queued` | "Changes saved locally" | `warning` (amber) | Offline; mutations queued for replay |

### 4.1 Connectivity Status Labels

| Status | User-Facing Label | Component |
|---|---|---|
| `online` | (no indicator — normal state) | — |
| `degraded` | "Connection unstable — changes will be saved locally" | `HbcConnectivityBar` (warning) |
| `offline` | "You are offline — N change(s) queued" | `HbcConnectivityBar` (error) |

### 4.2 Vocabulary Invariants

- These labels and meanings are the canonical vocabulary. All surfaces (PWA, SPFx) MUST use the same terminology per P2-B0 cross-lane consistency rule 5.
- Labels MUST be calm and informational, not alarming. "Some data unavailable" is preferred over "DATA SYNC ERROR."
- Labels MUST NOT include technical details (no "IndexedDB", no "TanStack Query", no "adapter timeout").

---

## 5. Staleness Display Rules

Staleness is displayed differently based on the user's complexity tier (per `@hbc/complexity` density context).

### 5.1 Display by Complexity Tier

| Tier | Staleness Display | Location |
|---|---|---|
| **Essential** | "Last synced [relative time]" timestamp in feed header | Feed header, always visible when `isStale` or not `live` |
| **Standard** | Essential display + "[N] source(s) updating" count when `partial` | Feed header with expandable detail |
| **Expert** | Standard display + per-source health badge via `HbcMyWorkSourceHealth` | Feed header + per-source detail panel |

### 5.2 Relative Time Labels

| Age | Display |
|---|---|
| < 1 minute | "Just now" |
| 1–4 minutes | "[N] min ago" |
| 5–59 minutes | "[N] min ago" (with staleness styling) |
| 1–4 hours | "[N] hr ago" (with staleness warning) |
| > 4 hours | "More than 4 hours ago" (with strong staleness warning) |

### 5.3 Staleness Display Invariants

- The staleness indicator MUST be visible at all complexity tiers when `isStale === true` or `freshness !== 'live'`.
- The indicator MUST NOT be hidden behind a click/tap — it must be visible in the feed header without user action.
- When the feed is `live` and fresh, no staleness indicator is shown — the absence of the indicator communicates freshness.
- The `HbcMyWorkSourceHealth` component (expert tier) already displays per-source health badges with variant/label mapping. P2-B3 endorses its current behavior for expert tier and requires Essential/Standard tiers to show the simpler indicators defined above.

---

## 6. Degraded-State UX

When connectivity is `degraded` (detected by `@hbc/session-state` probe):

### 6.1 Degraded-State Sequence

| Step | Timing | Behavior |
|---|---|---|
| 1 | 0s | Initiate live feed fetch; show loading indicator |
| 2 | 0–3s | Continue loading; `HbcConnectivityBar` shows "Connection unstable" (warning) |
| 3 | 3s (fetch not complete) | Show cached feed from `hbc-my-work-feed-cache` draft with "Refreshing..." overlay |
| 4 | Fetch completes | Replace cached feed with live data; remove "Refreshing..." overlay |
| 5 | Fetch fails entirely | Keep cached feed; show "Some data unavailable" with last-cached timestamp |

### 6.2 Degraded-State Rules

- Cached feed shown at step 3 MUST display "Last updated [cachedAt]" timestamp.
- Cached feed MUST NOT be silently shown as if it were live data.
- The 3-second threshold matches P2-B2 §5.3 degraded-state behavior.
- If no cached feed exists, continue showing loading indicator until fetch completes or fails.

---

## 7. Offline-State UX

When connectivity is `offline` (detected by `navigator.onLine === false`):

### 7.1 Offline Display

| Element | Behavior |
|---|---|
| **Connectivity bar** | `HbcConnectivityBar` shows "You are offline — N change(s) queued" (error variant) |
| **Feed display** | Show cached feed from `hbc-my-work-feed-cache` draft if available |
| **Staleness indicator** | "Last updated [cachedAt timestamp] — you are offline" |
| **Feed mutations** | Allowed for offline-capable actions: `mark-read`, `defer`, `undefer`, `pin-today`, `pin-week`, `waiting-on` |
| **Mutation indicator** | Pending mutation count visible in connectivity bar |
| **No-cache state** | If no cached feed: show empty state with "You are offline. Your work feed will load when connectivity is restored." |
| **No redirect** | User stays on `/my-work` regardless (per P2-A1 §1.2 no-redirect invariant) |

### 7.2 Reconnection Behavior

When connectivity transitions from `offline` to `online` or `degraded`:

| Step | Action |
|---|---|
| 1 | `HbcConnectivityBar` transitions to "Syncing..." |
| 2 | Replay queued mutations via `@hbc/session-state` operation queue |
| 3 | Trigger full feed refresh |
| 4 | On success: replace cached feed with live data; clear staleness indicator |
| 5 | On partial success: show live data for successful sources; mark failed sources as stale |
| 6 | Update connectivity bar to reflect new state |

---

## 8. Partial-Load Behavior

When a feed refresh produces `freshness: 'partial'` (some sources succeeded, others failed):

### 8.1 Partial-Load Display

| Tier | Display |
|---|---|
| Essential | "Last synced [time] — some data unavailable" |
| Standard | "Last synced [time] — [N] of [M] sources loaded" |
| Expert | Standard display + per-source health badges showing which sources failed |

### 8.2 Partial-Load Rules

- Available data from successful sources is shown normally — partial load does NOT hide successfully loaded items.
- Failed sources contribute 0 items to the feed computation. Their previous items (from cache or last successful load) are NOT mixed in.
- `degradedSourceCount` in `IMyWorkHealthState` tracks how many sources failed.
- `warningMessage` may contain a human-readable summary (e.g., "2 source(s) failed to load").
- Auto-refresh continues normally — the next refresh may succeed for previously failed sources.

---

## 9. Ranking and Cached Data

### 9.1 Cached Feed Ranking

When cached feed is displayed (offline or degraded fallback):

| Aspect | Behavior |
|---|---|
| **Ranking order** | Items retain their `rankingReason` and position from the time of caching |
| **Score accuracy** | Cached scores may not reflect current state (e.g., an item may have become overdue since caching) |
| **User notification** | No explicit notification that ranking may be stale — the staleness indicator communicates data age |
| **On live refresh** | Items may reorder. No transition animation or notification of reorder is required |

### 9.2 Ranking Consistency

- Cached feed and live feed use the same ranking algorithm (P2-A2 §9 ranking invariant).
- The difference is input freshness, not algorithm difference.
- Users may notice items "jumping" when live data arrives — this is expected and acceptable behavior.

---

## 10. Mutation Reconciliation on Reconnect

Per P2-B2 §7.4, when connectivity restores:

### 10.1 Reconciliation Rules

| Scenario | Behavior |
|---|---|
| **Queue replay succeeds** | Mutations applied server-side; feed refreshes to reflect server state |
| **Queue replay partially fails** | Successful mutations applied; failed mutations shown with inline error; feed refreshes |
| **Conflict detected** | Server state wins. Feed mutations are non-destructive (mark-read, defer, pin) — conflicts cannot cause data loss |
| **Item no longer exists** | Mutation silently discarded; item removed from feed on refresh |

### 10.2 Reconciliation Invariants

- Optimistic updates applied during offline mode are reconciled against server state, not assumed correct.
- If an item was deferred offline but completed by another user, the deferral is discarded and the item is removed from the feed.
- No user confirmation is required for reconciliation — it happens automatically on reconnect.

---

## 11. Cross-Lane Staleness Consistency

Per P2-B0 cross-lane consistency rule 5, freshness vocabulary must be identical across PWA and SPFx.

### 11.1 Cross-Lane Requirements

| Aspect | PWA | SPFx | Consistency Rule |
|---|---|---|---|
| **Status vocabulary** | `live`, `cached`, `partial`, `queued` | Same 4 states | Identical terminology |
| **Status meaning** | Per §4 definitions | Same definitions | Identical semantics |
| **Staleness indicator** | Full display per complexity tier (§5) | Simplified: "Last synced [time]" label on companion summary | Same meaning, simpler UI |
| **Offline indicator** | `HbcConnectivityBar` + cached feed | Status badge on companion card | Same meaning, surface-appropriate UI |
| **Refresh action** | Manual refresh available in feed header | Not applicable (SPFx companion is read-only summary) | PWA owns refresh |

### 11.2 Consistency Invariants

- The same feed data displayed in PWA and SPFx MUST show the same sync status.
- SPFx MUST NOT silently show stale data as if it were live.
- SPFx companion uses simpler UI (no connectivity bar, no reasoning drawer) but the same status vocabulary.

---

## 12. Telemetry Contract

The following telemetry events support freshness monitoring and trust-state verification.

### 12.1 Feed Freshness Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.freshness.stale` | Feed transitions from fresh to stale (`isStale` becomes `true`) | `{ feedAge: number, lastRefreshedIso: string }` |
| `feed.freshness.refresh.complete` | Feed refresh completes | `{ duration: number, freshness: MyWorkSyncStatus, sourceCount: number, degradedCount: number }` |
| `feed.freshness.refresh.failed` | Feed refresh fails entirely | `{ error: string, lastCachedIso?: string }` |

### 12.2 Connectivity Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.connectivity.offline-cache-shown` | Cached feed displayed due to offline state | `{ cachedAt: string, itemCount: number }` |
| `feed.connectivity.degraded-cache-shown` | Cached feed displayed due to degraded fetch (>3s) | `{ cachedAt: string, fetchDuration: number }` |
| `feed.connectivity.sync-complete` | Queued mutations replayed on reconnect | `{ mutationCount: number, successCount: number, failedCount: number }` |

### 12.3 Source Health Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.source.partial-load` | Feed computation completed with degraded sources | `{ totalSources: number, degradedSources: number, warningMessage?: string }` |
| `feed.source.recovered` | Previously degraded source returns to `live` | `{ source: string, degradedDuration: number }` |

---

## 13. Acceptance Gate Reference

P2-B3 is the primary evidence artifact for the Trust-state gate:

| Field | Value |
|---|---|
| **Gate** | Trust-state gate |
| **Pass condition** | Freshness, stale, syncing, degraded, and offline states are visible and coherent |
| **Evidence required** | Freshness policy (this document), state UX review, scenario tests |
| **Primary owner** | Platform + Experience |

### Scenario Test Requirements

The following scenarios must produce correct, visible trust-state behavior:

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | Feed is fresh and all sources live | No staleness indicator shown |
| 2 | Feed age exceeds 5 minutes without refresh | Staleness indicator appears with relative time |
| 3 | One of three sources fails during refresh | `partial` status shown; available data displayed normally |
| 4 | All sources fail during refresh | `cached` status shown with last-cached timestamp |
| 5 | User goes offline with cached feed | Offline banner + cached feed + pending mutation count |
| 6 | User goes offline without cached feed | Empty state with offline message |
| 7 | User returns online after offline mutations | Sync indicator → mutation replay → feed refresh → live state |
| 8 | Degraded connectivity; fetch exceeds 3s | Cached feed shown with "Refreshing..." overlay |
| 9 | Tab hidden then focused | Auto-refresh triggers on tab focus |
| 10 | Multiple rapid manual refreshes | Throttled to one per 10 seconds |

---

## 14. Locked Decisions

| Decision | Locked Resolution | P2-B3 Consequence |
|---|---|---|
| Freshness model | **Hybrid freshness/staleness trust model** | Feed tracks both live source freshness and cached fallback freshness; users see one coherent status |
| Offline/degraded behavior | **PWA owns primary trust model** | P2-B3 defines the PWA trust model; SPFx exposes consistent status cues but PWA is authoritative |
| Low-work default | **Stay on Personal Work Hub** | Offline/degraded state does not redirect users away from `/my-work` |
| Return behavior | **Strong context memory** | Feed cache (P2-B2) enables offline return with staleness indicators defined by P2-B3 |

---

## 15. Policy Precedence

| Deliverable | Relationship to P2-B3 |
|---|---|
| **P2-A1** — Operating Model Register | P2-B3 implements the trust invariant defined in P2-A1 §8.1 with concrete thresholds and display rules |
| **P2-B0** — Lane Ownership | P2-B3 enforces cross-lane consistency rule 5 for freshness/staleness/degraded/offline vocabulary |
| **P2-B2** — Hub State Persistence | P2-B2 defines the cache mechanism (draft keys, TTLs); P2-B3 defines how cached data is displayed and when staleness indicators appear |
| **P2-A2** — Ranking Policy | P2-B3 clarifies that cached feed retains P2-A2 ranking from cache time; no separate stale-item scoring |
| **P2-B4** — Cross-Device Shell Behavior | P2-B4 addresses whether freshness state syncs across devices; P2-B3 defines the per-device trust model |

If a downstream deliverable introduces freshness-related behavior, it must conform to the thresholds, vocabulary, and display rules defined here.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
