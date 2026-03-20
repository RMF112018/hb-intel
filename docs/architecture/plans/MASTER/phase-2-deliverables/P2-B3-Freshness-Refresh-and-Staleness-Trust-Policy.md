# P2-B3: Freshness, Refresh, and Staleness Trust Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-B3 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Governance Policy |
| **Owner** | Platform / Core Services + Experience / Shell |
| **Update Authority** | Platform lead; changes require review by Experience lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §8](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); [interaction-contract §3](../../../reference/work-hub/interaction-contract.md); implementation touchpoints: `aggregateFeed.ts`, `projectFeed.ts`, `IMyWorkItem.ts`, `root-route.tsx`, `@hbc/session-state` |

---

## Policy Statement

Users must never be misled into thinking they are seeing live data when they are not. This policy converts that trust invariant into concrete timestamp rules, freshness thresholds, refresh intervals, stale-state display rules, degraded/offline UX expectations, local-change queue behavior, and cross-lane vocabulary requirements.

This document is **normative for target-state behavior**. It must not be read as claiming that every rule in this policy is already implemented in the current repo. Where current implementation is partial or provisional, this document states the required execution posture and the reconciliation needed before the trust-state gate can pass.

---

## Repo-Truth Reconciliation Notes

### Current repo-truth anchors

- The feed type system currently exposes `MyWorkSyncStatus = 'live' | 'cached' | 'partial' | 'queued'`.
- The current aggregation path emits `live`, `cached`, or `partial` freshness outcomes and stamps a single sync timestamp during aggregation.
- The PWA root shell already mounts connectivity UI at the application shell level via `HbcConnectivityBar` and consumes `@hbc/session-state` connectivity.
- The current lane model still contains provisional team/delegated remnants (`delegated-team`) in the shared feed types and normalization path.

### Required reconciliation to satisfy this policy

- `queued` must no longer be treated as canonical freshness. It must be modeled separately as a local-change queue state.
- User-facing trust timestamps must split `lastRefreshAttemptIso` from `lastTrustedDataIso` / `lastSuccessfulDataIso`.
- Connectivity truth must be delegated to the resolved `@hbc/session-state` signal, not a raw browser online/offline flag.
- Team/direct-report trust behavior remains **provisional** until future completion of org-chart and entitlement plumbing. Any team-visibility freshness UX must carry that dependency explicitly.

---

## Policy Scope

### This policy governs

- Feed-level freshness thresholds
- Refresh cadence and retry expectations
- User-facing freshness vocabulary
- User-facing local-change queue vocabulary
- Trusted-data timestamp behavior
- Refresh-attempt timestamp behavior
- Staleness display rules by complexity tier
- Degraded-state and offline-state UX behavior
- Partial-load behavior and source health visibility
- Ranking stability expectations for cached data
- Mutation reconciliation expectations on reconnect
- Cross-lane freshness vocabulary consistency
- Freshness-related telemetry events

### This policy does NOT govern

- Feed cache TTL, draft keys, or storage topology — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- State persistence and return-memory mechanics — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- Root routing and landing precedence — see [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)
- Ranking coefficients or scoring model — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Cross-device synchronization — see P2-B4
- Org-chart and entitlement completion for first-class team visibility — future dependency noted here but governed elsewhere

---

## Definitions

| Term | Meaning |
|---|---|
| **Freshness window** | The maximum age of the **trusted feed snapshot** before it is considered stale. Measured from `lastTrustedDataIso`, not from the most recent refresh attempt. |
| **Staleness threshold** | The point at which the trusted feed transitions from fresh to stale, requiring a visible trust indicator. |
| **Freshness status** | Canonical data-state vocabulary: `live`, `cached`, or `partial`. |
| **Local change state** | Canonical mutation-queue vocabulary: `none` or `queued`. This is separate from freshness. |
| **Trusted data timestamp** | `lastTrustedDataIso` / `lastSuccessfulDataIso`: the last time the surface received a fully trusted feed snapshot that may be represented to the user as the last synced state. |
| **Refresh attempt timestamp** | `lastRefreshAttemptIso`: the most recent time a refresh was attempted, regardless of outcome. Operational and diagnostic; not the primary user-facing trust timestamp. |
| **Degraded state** | Connectivity is present but unstable according to the resolved `@hbc/session-state` signal. |
| **Feed refresh** | A recomputation of the feed via the aggregation pipeline, fetching from enabled source adapters. |
| **Partial load** | A refresh attempt where some sources succeeded and others failed, producing freshness `partial`. |
| **Optimistic update** | A mutation reflected locally before server confirmation, with later replay / reconciliation. |

---

## 1. Trust Invariant

Per Unified Blueprint §7.2 and P2-A1 §8.1:

> **Users must never be misled into thinking they are seeing live data when they are not.**

### Enforcement Rules

| Condition | Required Action |
|---|---|
| Freshness status is not `live` | Freshness indicator MUST be visible |
| Feed age exceeds the freshness window | Trusted timestamp MUST be visible |
| Connectivity resolves to `degraded` | Degraded indicator MUST be visible |
| Connectivity resolves to `offline` | Offline banner MUST be visible with trusted timestamp or explicit no-cache message |
| Cached feed shown as fallback | User-facing label MUST use the trusted/cached snapshot time, not the failed attempt time |
| Local change state is `queued` | Pending mutation indicator MUST be visible or directly accessible |
| Team/delegated feed is shown on provisional surfaces | Surface MUST NOT imply fully trusted first-release team semantics before org-chart / entitlement plumbing is complete |

### Trust Invariant Exceptions

- None. Silent serving of stale, partial, cached, or queued-change state as if it were live is always a policy violation.

---

## 2. Timestamp Model and Freshness Thresholds

### 2.1 Canonical Timestamp Model

| Field | Purpose | User-facing? |
|---|---|---|
| `lastTrustedDataIso` | Last fully trusted snapshot time | **Yes** — primary timestamp for “Last synced / Last updated” |
| `lastRefreshAttemptIso` | Most recent refresh attempt time | No by default; available for expert diagnostics and telemetry |
| `cachedAtIso` | Time the currently displayed fallback snapshot was written to cache | Yes when cached fallback is in use |

### 2.2 Timestamp Advancement Rules

| Refresh Outcome | Advance `lastRefreshAttemptIso` | Advance `lastTrustedDataIso` |
|---|---|---|
| `live` | Yes | Yes |
| `partial` | Yes | **No** |
| `cached` fallback after failed live refresh | Yes | **No** |
| Offline with no refresh attempt | No | No |
| Queue replay only, without successful feed refresh | Operational timestamp may advance separately; trusted feed timestamp does not | No |

### 2.3 Feed-Level Staleness

| Constant | Value | Meaning |
|---|---|---|
| `FEED_FRESHNESS_WINDOW_MS` | 300,000 (5 minutes) | Trusted feed data older than 5 minutes since `lastTrustedDataIso` is stale |

When the trusted feed age exceeds the freshness window:

- the surface is stale even if a more recent refresh attempt failed
- the UI must show the trusted timestamp
- auto-refresh should run when the hub is eligible to refresh

### 2.4 Per-Source Staleness

| Constant | Value | Meaning |
|---|---|---|
| `SOURCE_FRESHNESS_WINDOW_MS` | 600,000 (10 minutes) | A source older than 10 minutes is source-stale |

Per-source staleness is tracked in health metadata and surfaced according to complexity tier. A source may be stale while the aggregate feed remains usable.

### 2.5 Threshold Rationale

- **5-minute feed threshold** balances trust and cost for operational work-item surfaces.
- **10-minute source threshold** allows brief adapter instability without immediately overstating a full-surface failure.
- **Split timestamps** preserve operator observability without overstating freshness to end users.

---

## 3. Refresh Policy

### 3.1 Auto-Refresh Behavior

| Constant | Value | Meaning |
|---|---|---|
| `FEED_AUTO_REFRESH_INTERVAL_MS` | 180,000 (3 minutes) | Target auto-refresh interval while the Personal Work Hub is visible and refresh-eligible |

| Condition | Behavior |
|---|---|
| Hub visible and connectivity `online` | Auto-refresh every 3 minutes |
| Hub visible and connectivity `degraded` | Auto-refresh every 3 minutes; may resolve to `partial` or `cached` |
| Hub visible and connectivity `offline` | No live refresh; show cached snapshot or offline empty state |
| Hub hidden | Pause interval refresh; refresh on focus return / reconnect according to query policy |
| Manual refresh | Immediate refresh attempt; reset interval clock |

### 3.2 Query / Hook Execution Target

This section is an **execution requirement**, not a claim that the current repo already uses these exact values.

| Config | Value | Rationale |
|---|---|---|
| `staleTime` | 180,000 (3 minutes) | Align query freshness with refresh interval |
| `gcTime` | 600,000 (10 minutes) | Preserve tab-switch and short-return cache usability |
| `refetchOnWindowFocus` | `true` | Revalidate on focus return |
| `refetchOnReconnect` | `true` | Revalidate when connectivity resolves from degraded/offline |
| `retry` | 2 | Limited retry with backoff |

### 3.3 Refresh Throttling

- Manual refresh must be throttled to at most one attempt per 10 seconds.
- Manual refresh and auto-refresh must share the same canonical feed query key.
- Refresh throttling must not suppress visibility of existing stale/cached/partial indicators.

---

## 4. Canonical Vocabulary

### 4.1 Freshness Status Vocabulary

| Status | User-Facing Label | Visual Variant | Meaning |
|---|---|---|---|
| `live` | Up to date | success | All required sources succeeded and the trusted snapshot is current |
| `cached` | Using saved data | info | Cached snapshot is being shown because a live refresh could not fully supply the surface |
| `partial` | Some data unavailable | warning | Some sources succeeded and some failed during the latest refresh attempt |

### 4.2 Local Change Queue Vocabulary

| State | User-Facing Label | Visual Variant | Meaning |
|---|---|---|---|
| `none` | — | — | No locally queued mutations |
| `queued` | Changes saved locally | warning | One or more offline/deferred mutations are waiting for replay |

### 4.3 Composition Rule

Freshness and queued-local-changes are separate signals and may coexist.

Valid examples:

- `cached` + `queued`
- `partial` + `none`
- `live` + `queued` (for a short period before replay completes)

Invalid example:

- Treating `queued` as the sole freshness state

### 4.4 Connectivity Vocabulary

| Connectivity | User-Facing Label | Component Guidance |
|---|---|---|
| `online` | none by default | No explicit banner required |
| `degraded` | Connection unstable — changes will be saved locally | `HbcConnectivityBar` warning treatment |
| `offline` | You are offline — changes will sync when connection returns | `HbcConnectivityBar` error/offline treatment |

### 4.5 Vocabulary Invariants

- PWA and SPFx must use the same **freshness** meanings.
- `queued` is a local-change indicator, not a synonym for stale/cached/partial.
- Labels must remain calm, brief, and non-technical.
- Raw implementation details must not appear in user-facing copy.

---

## 5. User-Facing Trust Composition

The UI must communicate the feed’s state by composing freshness, trusted timestamp, connectivity, and local queue state.

### 5.1 Header / Banner Composition Examples

| State | Required User-Facing Treatment |
|---|---|
| `live` + `none` | No stale banner required |
| `cached` + `none` | “Using saved data” + “Last updated [trusted/cached timestamp]” |
| `cached` + `queued` | “Using saved data” + “Last updated [trusted/cached timestamp]” + “Changes saved locally” |
| `partial` + `none` | “Some data unavailable” + trusted timestamp |
| `partial` + `queued` | “Some data unavailable” + trusted timestamp + “Changes saved locally” |
| `offline` with no cache | Offline empty state; do not imply a last synced value that does not exist |

### 5.2 Timestamp Rule

The default header timestamp must represent **trusted data age**, not simply the time of the most recent refresh attempt.

### 5.3 Expert Diagnostics

Expert surfaces may expose additional details such as:

- `lastRefreshAttemptIso`
- degraded source count
- per-source health badges
- queued mutation count / replay outcome

These expert diagnostics must not replace the user-facing trusted timestamp.

---

## 6. Staleness Display Rules by Complexity Tier

### 6.1 Display by Complexity Tier

| Tier | Staleness Display | Location |
|---|---|---|
| **Essential** | “Last synced [relative time]” or “Last updated [relative time]” when not live | Feed header |
| **Standard** | Essential display + freshness label + degraded-source summary when `partial` | Feed header with compact detail |
| **Expert** | Standard display + per-source health detail + optional last refresh attempt detail | Feed header + detail panel |

### 6.2 Relative Time Labels

| Age | Display |
|---|---|
| < 1 minute | Just now |
| 1–4 minutes | [N] min ago |
| 5–59 minutes | [N] min ago |
| 1–4 hours | [N] hr ago |
| > 4 hours | More than 4 hours ago |

### 6.3 Display Invariants

- Staleness or freshness indicators must be visible whenever freshness is not `live` or the trusted snapshot is stale.
- The indicator must not be hidden behind a click to reveal.
- A partial refresh must not replace the trusted timestamp with the attempt time.
- If the current visible surface has never achieved a trusted full sync, the UI must say so explicitly rather than fabricate a “Last synced” value.

---

## 7. Degraded-State UX

Connectivity status must come from the resolved `@hbc/session-state` signal. Raw `navigator.onLine` may contribute to that signal but is not the sole policy source of truth.

### 7.1 Degraded-State Sequence

| Step | Timing | Behavior |
|---|---|---|
| 1 | 0s | Start refresh attempt; show loading / progress affordance |
| 2 | 0–3s | `HbcConnectivityBar` may show degraded connection warning |
| 3 | ~3s (if live refresh has not resolved and cache exists) | Cached snapshot may be shown with “Refreshing…” overlay |
| 4 | Refresh resolves `live` | Replace snapshot with live result; advance trusted timestamp |
| 5 | Refresh resolves `partial` | Show partial result and freshness warning; do **not** advance trusted timestamp |
| 6 | Refresh resolves `cached` / full failure | Keep cached snapshot; show “Using saved data” with trusted/cached timestamp |

### 7.2 Degraded-State Rules

- Cached fallback must always show a trusted/cached timestamp.
- The degraded sequence must not silently replace trusted data with an unqualified partial result.
- If no cache exists, continue showing loading / degraded-state messaging until the attempt resolves or fails.

---

## 8. Offline-State UX

### 8.1 Offline Display

| Element | Behavior |
|---|---|
| **Connectivity bar** | Show offline state from `@hbc/session-state` |
| **Feed display** | Show cached snapshot if available |
| **Staleness indicator** | “Last updated [cachedAt / trusted timestamp] — you are offline” |
| **Feed mutations** | Allow only approved offline-capable actions |
| **Mutation indicator** | Queued mutation count visible or directly accessible |
| **No-cache state** | Empty state: “You are offline. Your work feed will load when connectivity is restored.” |
| **No redirect** | User remains on `/my-work` |

### 8.2 Reconnection Behavior

| Step | Action |
|---|---|
| 1 | Connectivity transitions from `offline` to `online` or `degraded` |
| 2 | Queue replay begins |
| 3 | Feed refresh begins |
| 4 | If refresh resolves `live`, advance trusted timestamp and clear stale indicators |
| 5 | If refresh resolves `partial`, keep warning state and preserve prior trusted timestamp |
| 6 | If refresh fails, keep cached state and preserve prior trusted timestamp |

---

## 9. Partial-Load Behavior

### 9.1 Partial-Load Display

| Tier | Display |
|---|---|
| Essential | “Some data unavailable” + trusted timestamp |
| Standard | Essential display + “[N] of [M] sources loaded” |
| Expert | Standard display + per-source health detail |

### 9.2 Partial-Load Rules

- Available data from successful sources may be shown.
- Failed sources may contribute zero items to the current attempt result.
- A partial load must not advance `lastTrustedDataIso`.
- `lastRefreshAttemptIso` may advance for telemetry / diagnostics.
- If there is no prior trusted snapshot and the first visible result is partial, the UI must say that the first trusted sync is still pending.

---

## 10. Ranking and Cached Data

### 10.1 Cached Feed Ranking

| Aspect | Behavior |
|---|---|
| Ranking order | Items retain their cached ranking order and reasoning metadata |
| Score accuracy | Cached scores may no longer reflect present-time urgency |
| User notification | No separate rank-staleness message is required beyond freshness / timestamp indicators |
| Live refresh behavior | Reordering on successful live refresh is acceptable |

### 10.2 Ranking Consistency

- Cached and live results must use the same ranking model.
- Staleness changes trust in the input data, not the scoring model identity.

---

## 11. Mutation Reconciliation on Reconnect

### 11.1 Reconciliation Rules

| Scenario | Behavior |
|---|---|
| Queue replay succeeds | Apply server-confirmed changes and refresh feed |
| Queue replay partially fails | Apply successful mutations, surface failures, refresh feed |
| Conflict detected | Server state wins for canonical feed state |
| Item no longer exists | Discard mutation and remove item on refresh |

### 11.2 Reconciliation Invariants

- Optimistic updates are provisional until replay / confirmation succeeds.
- Queued mutation state is independent from freshness state.
- Queue replay alone does not authorize advancing the trusted feed timestamp.

---

## 12. Cross-Lane Consistency

Per P2-B0, freshness vocabulary must remain consistent across PWA and SPFx.

### 12.1 Cross-Lane Requirements

| Aspect | PWA | SPFx | Consistency Rule |
|---|---|---|---|
| Freshness vocabulary | `live`, `cached`, `partial` | Same meanings | Identical semantics |
| Trusted timestamp meaning | Header / banner trust timestamp | Simplified summary timestamp | Same meaning |
| Local queue indicator | Required on mutation-capable surfaces | Optional on read-only summary surfaces | Same concept; only required where mutations can exist |
| Refresh authority | PWA owns active refresh | SPFx may mirror status from shared feed state | PWA is authoritative |
| Connectivity messaging | Full shell connectivity surface | Surface-appropriate simplified indication | Same trust posture |

### 12.2 Provisional Team / Delegated Note

The current shared feed model still contains provisional delegated/team remnants. P2-B3 therefore locks the following constraint:

- first-release Personal Work trust behavior may be executed for personal surfaces now
- any direct-report or team freshness surface remains provisional until future completion of org-chart and entitlement plumbing
- no team/delegated surface may imply final first-release trust completeness before that dependency is resolved

---

## 13. Telemetry Contract

### 13.1 Refresh and Trust Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.refresh.attempted` | A refresh attempt starts | `{ attemptIso, trigger }` |
| `feed.refresh.completed` | A refresh attempt resolves | `{ attemptIso, freshnessStatus, sourceCount, degradedCount, durationMs }` |
| `feed.trust.timestamp-advanced` | Trusted snapshot advances | `{ previousTrustedIso, newTrustedIso, freshnessStatus: 'live' }` |
| `feed.refresh.failed` | Attempt fails to produce live data | `{ attemptIso, freshnessStatus, cachedAtIso? }` |

### 13.2 Connectivity and Queue Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.connectivity.offline-cache-shown` | Cached snapshot shown during offline state | `{ cachedAtIso, itemCount }` |
| `feed.connectivity.degraded-cache-shown` | Cached snapshot shown during degraded fetch fallback | `{ cachedAtIso, attemptIso }` |
| `feed.queue.state-changed` | Queue count or queued state changes | `{ queuedCount, state }` |
| `feed.queue.replay-complete` | Replay finishes | `{ mutationCount, successCount, failedCount }` |

### 13.3 Source Health Events

| Event | Trigger | Payload |
|---|---|---|
| `feed.source.partial-load` | Partial refresh result produced | `{ totalSources, degradedSources, warningMessage? }` |
| `feed.source.recovered` | Previously degraded source returns live | `{ source, degradedDurationMs }` |

---

## 14. Acceptance Gate Reference

P2-B3 is the primary evidence artifact for the trust-state gate.

| Field | Value |
|---|---|
| **Gate** | Trust-state gate |
| **Pass condition** | Freshness, stale, syncing, degraded, offline, and queued-change states are visible and coherent |
| **Evidence required** | Freshness policy, UX review, scenario tests, implementation reconciliation |
| **Primary owner** | Platform + Experience |

### Scenario Test Requirements

| # | Scenario | Expected Behavior |
|---|---|---|
| 1 | Feed is fresh and all sources live | No stale indicator required |
| 2 | Trusted snapshot age exceeds 5 minutes | Trusted timestamp appears |
| 3 | One source fails during refresh | `partial` shown; trusted timestamp does not advance |
| 4 | All sources fail during refresh and cache exists | `cached` shown with trusted/cached timestamp |
| 5 | User goes offline with cached feed | Offline state + cached feed + queued indicator when applicable |
| 6 | User goes offline without cached feed | Offline empty state |
| 7 | User returns online after offline mutations | Queue replay + refresh + coherent freshness / queue messaging |
| 8 | Degraded connectivity causes fallback before refresh completes | Cached snapshot shown with refresh-in-progress treatment |
| 9 | Refresh attempt occurs but resolves `partial` | `lastRefreshAttemptIso` may advance; user-facing trusted timestamp does not |
| 10 | Multiple rapid manual refreshes | Attempts are throttled |
| 11 | `cached` and `queued` coexist | Both signals are visible without semantic collision |
| 12 | Team/delegated prototype surface is shown | Surface does not imply final org-chart/entitlement-complete trust behavior |

---

## 15. Locked Decisions

| Decision | Locked Resolution | P2-B3 Consequence |
|---|---|---|
| Freshness vocabulary | `live`, `cached`, `partial` | Canonical freshness excludes `queued` |
| Local mutation signal | Separate queue state | `queued` is modeled independently from freshness |
| Trust timestamp | Split trusted-data vs refresh-attempt timestamps | User-facing trust uses `lastTrustedDataIso`; diagnostics may use `lastRefreshAttemptIso` |
| Offline/degraded ownership | PWA owns primary trust model | SPFx mirrors trust semantics with lighter UI |
| Team/direct-report dependency | Org-chart and entitlement plumbing not complete | Team freshness remains provisional until that dependency is closed |
| Low-work default | Stay on Personal Work Hub | Trust state does not redirect users away from `/my-work` |

---

## 16. Policy Precedence

| Deliverable | Relationship to P2-B3 |
|---|---|
| **P2-A1** — Operating Model Register | P2-B3 operationalizes the trust invariant with concrete timestamp and visibility rules |
| **P2-B0** — Lane Ownership | P2-B3 enforces cross-lane terminology consistency for freshness and trust messaging |
| **P2-B2** — Hub State Persistence | P2-B2 defines storage / cache mechanics; P2-B3 defines trust semantics for displaying cached state |
| **P2-A2** — Ranking Policy | P2-B3 clarifies that ranking identity is stable while data freshness changes |
| **P2-B4** — Cross-Device Shell Behavior | P2-B4 may govern multi-device propagation; P2-B3 governs per-surface trust semantics |

If a downstream deliverable introduces freshness-related behavior, it must conform to the timestamp model, vocabulary, and visibility rules defined here.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §10.2, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
