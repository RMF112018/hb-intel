# P2-B2: Hub State Persistence and Return-Memory Contract

| Field | Value |
|---|---|
| **Doc ID** | P2-B2 |
| **Phase** | Phase 2 |
| **Workstream** | B — PWA Shell, Landing Transition, and Lane Ownership |
| **Document Type** | Specification |
| **Owner** | Experience / Shell + Platform / Core Services |
| **Update Authority** | Experience lead; changes require review by Platform lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md); [P2-B3](P2-B3-Freshness-and-Staleness-Trust-Policy.md); [interaction-contract](../../../reference/work-hub/interaction-contract.md); `@hbc/session-state`; `@hbc/my-work-feed`; TanStack Router search/state contract |

---

## Specification Statement

The Personal Work Hub must provide trustworthy continuity when users leave `/my-work` for an authoritative domain surface and later return. This specification locks the state-authority model, the persistence categories, the return-memory flow, the offline/degraded fallback behavior, and the cleanup rules required to restore the hub in a recognizable and trustworthy state.

**Repo-truth audit — 2026-03-20:** All `@hbc/session-state` primitives referenced in this specification were verified against live package code. `useDraft`, `useAutoSaveDraft`, and `useConnectivity` exist with the expected signatures; `ConnectivityStatus` union values (`'online' | 'offline' | 'degraded'`) match §8.1; IndexedDB backing (`SESSION_DB_NAME = 'hbc-session-state'`) and the queued operations API (`IQueuedOperation`, `enqueue`, `listPending`) are confirmed. TanStack Query is confirmed in `@hbc/my-work-feed`. The §9.1 / §10.2 claim that registry-driven bulk cleanup does not yet exist as a shared primitive is accurate — no `clearByPrefix`, `bulkClear`, `clearAll`, or equivalent was found anywhere in `packages/session-state/src/`. The specification's current-state / target-state separation is correct. One precision note: `AUTO_SAVE_DEBOUNCE_MS` defaults to 1,500 ms; the §4.2 example passes `500` explicitly, which is valid and intentional, but implementors must supply the third argument to get 500 ms rather than the default.

This specification intentionally separates:

- **route identity / query-driving state**, which is canonical in the URL when present
- **draft-seeded convenience state**, which may seed a bare `/my-work` entry and is then reflected back into the URL
- **return-memory UI state**, which restores the user’s immediate working context
- **durable offline fallback state**, which supports continuity when live fetch is unavailable

P2-B2 complements P2-B1. P2-B1 governs **where the user lands**. P2-B2 governs **what state the hub restores once the user is back**.

---

## Spec Scope

### This specification governs

- Canonical authority for query-driving hub state
- Which hub state is persisted, where, and for how long
- Query-seed draft behavior for bare `/my-work` entries
- Team mode persistence and role-gated normalization
- Scroll position and expansion state capture / restore
- Offline feed fallback strategy
- Return navigation flow
- State cleanup triggers and shared cleanup capability requirements

### This specification does NOT govern

- Post-auth routing and redirect memory — see [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md)
- Freshness indicator rendering and staleness UX details — see P2-B3
- Cross-device synchronization — see P2-B4
- Adaptive layout / card arrangement persistence — see P2-D2
- Personalization / saved-view product policy beyond immediate continuity — see P2-D5
- Ranking policy and lane semantics — see P2-A2
- Explainability / visibility constraints for elevated-role views — see P2-A3

---

## Definitions

| Term | Meaning |
|---|---|
| **Return memory** | Application-level state captured when the user leaves `/my-work` and restored when the user returns. Distinct from redirect memory, which governs post-auth routing. |
| **Query-driving state** | State that materially changes the feed identity or query: `teamMode`, project/module/lane/filter/search context, or other route-significant inputs. |
| **Canonical URL state** | Search-param state on `/my-work` that takes precedence over any persisted draft state when present. |
| **Query-seed draft** | Persisted last-known hub query state used only when the user enters a bare `/my-work` route with no canonical search params. |
| **Return UI state** | Immediate working context such as scroll position and expanded groups. |
| **Feed fallback cache** | Durable locally persisted copy of a recent successful feed result, used only for offline / degraded continuity. |
| **Role-gated normalization** | Validation and normalization of restored state against the user’s current entitlements before it is applied. |
| **Registry-driven cleanup** | Shared `@hbc/session-state` capability that clears a governed set of draft keys, or a namespaced prefix, on logout and similar lifecycle events. |

---

## 1. Current-State vs Target-State Reconciliation

| Concern | Current State (Repo Truth) | Phase 2 Target |
|---|---|---|
| **Session-state primitive** | `@hbc/session-state` provides IndexedDB-backed draft save/load/clear, TTL purge, connectivity state, and queued operations | P2-B2 uses these primitives and adds one new shared cleanup capability requirement |
| **Cleanup model** | Current inspected surface is still largely per-key plus TTL purge | Registry-driven bulk cleanup / clear-by-prefix is required shared capability |
| **My-work live cache** | `@hbc/my-work-feed` uses TanStack Query for live feed orchestration and reads cached query metadata from `QueryClient` | TanStack Query remains the primary live/cache authority; durable fallback cache is additive for continuity only |
| **Landing posture** | Legacy repo truth still routes Executive users to `/leadership` and others to `/project-hub` | Phase 2 `/my-work` restore posture must align to P2-B1’s locked **personal-first** home for cohort-enabled elevated roles |
| **State authority** | No locked `/my-work` route-search contract yet | Query-driving state is canonical in URL when present; draft may seed bare `/my-work` entries |

### Reconciliation Note

This is a **target-state execution specification**. Where it references capabilities not yet present in repo truth, those are implementation requirements and, where material, **shared dependency blockers**.

Verified against live code 2026-03-20:

- **Session-state primitive row** — confirmed. `useDraft` (`packages/session-state/src/hooks/useDraft.ts`), `useAutoSaveDraft` (`useAutoSaveDraft.ts`), and `useConnectivity` (`useConnectivity.ts`) all exported from `packages/session-state/src/index.ts` with matching signatures. `ConnectivityStatus = 'online' | 'offline' | 'degraded'` defined in `types/ISessionState.ts`.
- **Cleanup model row** — confirmed. No `clearByPrefix`, `bulkClear`, or equivalent registry cleanup function exists anywhere in `packages/session-state/src/`. Only per-key `clearDraft` and TTL purge via `purgeExpiredDrafts` are present. The shared cleanup capability remains an unbuilt requirement.
- **My-work live cache row** — confirmed. `@hbc/my-work-feed` uses `QueryClient` / `QueryClientProvider` from `@tanstack/react-query` (visible in `src/__tests__/hookTestUtils.tsx`).
- **Landing posture row** — confirmed. `apps/pwa/src/router/workspace-routes.ts` line 46 hard-codes `redirect({ to: '/project-hub' })`; `/my-work` has no entry in `WORKSPACE_IDS` (`packages/shell/src/types.ts`) and no PWA route implementation. Controlled evolution — target state is P2-B1 direction.
- **State authority row** — confirmed. No `/my-work` route-search contract is locked anywhere in current repo truth. Controlled evolution — required alongside implementation.

---

## 2. State Authority Model

### 2.1 Authority Rule

Query-driving hub state follows a **hybrid authority model**:

1. **URL/search params are canonical when present**
2. **Bare `/my-work` may be seeded from a persisted query-seed draft**
3. **Once seeded, the resolved query state is reflected into the URL**
4. **Return UI state is never route-canonical**
5. **Feed fallback cache is never route-canonical**

### 2.2 What Is Canonical in URL

The following categories are URL/search canonical when present:

- `teamMode`
- project / module / lane / class / priority / state filters
- include / exclude toggles that materially change feed membership
- shareable search/query context that changes the feed identity
- other future query-driving parameters approved for the `/my-work` route contract

### 2.3 What Is NOT Canonical in URL

The following remain non-canonical UI continuity state:

- scroll position
- expanded group keys
- transient drawer / panel open state
- ephemeral per-session convenience state that does not define the feed identity

### 2.4 Invariants

- Search params override drafts.
- Drafts do not silently override an explicit URL.
- A bare `/my-work` entry may restore the most recent valid working context, but once restored, that context becomes visible in URL/search state.
- Route identity and browser history must not depend on hidden IndexedDB-only query state.
- P2-B1 routing authority remains separate from P2-B2 state authority.

---

## 3. Persisted State Categories

### 3.1 Registry

| Category | What Is Saved | Draft Key | TTL | Storage Layer | Authority Role |
|---|---|---|---|---|---|
| **Query-seed state** | Last valid hub query-driving state used to seed bare `/my-work` entries | `hbc-my-work-query-seed` | 8 hours | `@hbc/session-state` draft | Convenience seed only |
| **Return UI state** | Scroll position, expanded group keys, and equivalent immediate working context | `hbc-my-work-return-state` | 1 hour | `@hbc/session-state` draft | Continuity only |
| **Feed fallback cache** | Last successful durable fallback payload for offline / degraded return | `hbc-my-work-feed-cache` | 4 hours | `@hbc/session-state` draft | Fallback only |

### 3.2 What Is Not Persisted Here

- Redirect memory
- Authoritative domain-surface state
- Long-term saved views / personalization catalogs
- Notification badge counts as a separate persisted truth
- Reasoning drawer open/closed state
- A second primary live cache that competes with TanStack Query

### 3.3 Draft Key Invariants

- All hub continuity keys use the `hbc-my-work-` namespace.
- All keys must be registered in a governed cleanup registry.
- TTLs are scoped to continuity usefulness, not indefinite personalization.
- IndexedDB persistence is **local browser persistence with TTL**, not true in-memory session state and not cross-device sync.

---

## 4. Query-Seed Draft Contract

### 4.1 What Is Saved

```ts
IMyWorkQuerySeedDraft {
  teamMode?: 'personal' | 'my-team' | 'delegated-by-me'
  projectId?: string
  moduleKeys?: string[]
  priorities?: string[]
  classes?: string[]
  states?: string[]
  includeDeferred?: boolean
  includeSuperseded?: boolean
  lane?: string
  locationLabel?: string
  searchText?: string
  savedAt: string
}
```

The exact field list may evolve with the route-search contract, but the rule is stable: the query-seed draft stores the **last valid route-significant hub query state**.

### 4.2 Save Trigger

The query-seed draft is updated whenever the effective canonical hub query changes.

Recommended integration pattern:

- resolve effective query from URL + normalization
- write debounced query-seed draft
- do **not** treat the draft as a second hidden authority while URL is present

`useAutoSaveDraft('hbc-my-work-query-seed', 8, 500)` is the preferred primitive.

### 4.3 Restore Behavior

When the user enters `/my-work`:

| Condition | Behavior |
|---|---|
| URL/search params are present | Use URL as canonical; ignore query-seed draft for state authority |
| URL/search params are absent and a valid query-seed draft exists | Seed effective query from draft, normalize it, then reflect it into URL |
| No draft exists | Use role-appropriate default query posture |
| Draft expired | Use role-appropriate default query posture |

### 4.4 Role-Gated Normalization

Before applying query-seed state:

- `personal` is always valid
- `my-team` must still be permitted by the current user’s entitlements and first-release visibility limits
- `delegated-by-me` must still be valid for the current user context
- invalid or unsupported values are normalized to the safe default: **`personal`**

### 4.5 Elevated-Role Default

Per locked P2-B1 direction:

- cohort-enabled elevated-role users default to **`personal`**, not `my-team`
- `my-team` remains a valid secondary restored mode only if still supported
- no restore path may reintroduce a team-first default through persistence

---

## 5. Return UI State Contract

### 5.1 What Is Saved

```ts
IMyWorkReturnState {
  scrollPosition: number
  expandedGroupKeys: string[]
  capturedAt: string
}
```

### 5.2 Save Trigger

Return UI state is captured when the user leaves `/my-work`.

Allowed capture mechanisms:

| Method | Role |
|---|---|
| **Route `onLeave`** | Primary route-level outbound capture hook |
| **`document.visibilitychange`** | Secondary resilience mechanism for tab hiding / abrupt tab transitions |

`beforeLoad` is not an outbound return-state capture hook and must not be used as the primary mechanism for this purpose.

Use `useDraft('hbc-my-work-return-state', 1)`.

### 5.3 Restore Behavior

| Condition | Behavior |
|---|---|
| Draft exists and rendered group structure still matches | Restore expanded groups and scroll |
| Draft exists but structure materially changed | Restore only valid group keys; skip or soften scroll restoration |
| Draft expired | Start at top with default expansion state |
| No draft | Start at top with default expansion state |

### 5.4 Restoration Timing

Return UI state restoration occurs only after the hub has enough rendered structure to apply it safely:

1. route resolves effective query state
2. feed fetch begins
3. fallback or live data renders
4. expanded groups are restored
5. scroll is restored
6. return-state draft is consumed and cleared

Return UI state is not applied before content exists.

---

## 6. Feed Fallback Cache Contract

### 6.1 Authority Relationship

- **TanStack Query** remains the primary live/cache authority for active hub rendering.
- The persisted feed fallback cache is a **durable continuity layer**, not a competing primary cache.
- The fallback cache exists to support offline / degraded returns and post-reload continuity only.

### 6.2 What Is Saved

```ts
IMyWorkFeedFallbackCache {
  result: IMyWorkFeedResult
  cachedAt: string
  freshness: 'live-derived' | 'partial-derived'
}
```

### 6.3 Save Trigger

The fallback cache is written after a successful feed computation that is trustworthy enough to seed continuity.

Recommended rule:

- save when a successful feed result is produced
- do not require a second independent ranking computation for the fallback cache
- allow the saved payload to carry its own health / freshness markers

Use `useDraft('hbc-my-work-feed-cache', 4)` or an equivalent explicit write path.

### 6.4 Usage Rules

| Connectivity State | Behavior |
|---|---|
| **online** | Use live fetch and normal TanStack Query behavior; fallback cache is not primary |
| **degraded** | Begin live fetch; if latency crosses the governed threshold, render fallback cache with refresh / staleness messaging |
| **offline** | Render fallback cache immediately if available; otherwise remain on `/my-work` with offline empty-state guidance |

### 6.5 Invariants

- The fallback cache is never treated as authoritative live truth.
- Cached payloads must display staleness / cached-at context per P2-B3 trust rules.
- Returning offline with no fallback cache must not redirect the user away from `/my-work`.
- The fallback cache is cleared on logout and governed cleanup events.

---

## 7. Return Navigation Flow

### 7.1 Outbound: Hub → Domain Surface

| Step | Action | Responsibility |
|---|---|---|
| 1 | User activates a work-item navigation action | Hub surface |
| 2 | Save return UI state | Route `onLeave` + `useDraft('hbc-my-work-return-state')` |
| 3 | Query-seed draft is already current through debounced persistence | Hub query-state layer |
| 4 | Router navigates to authoritative domain surface | Router |
| 5 | Browser history remains intact | Shell / router |

### 7.2 Inbound: Domain Surface → Hub

| Step | Action | Responsibility |
|---|---|---|
| 6 | User returns to `/my-work` | Router |
| 7 | Resolve landing path per P2-B1 if needed | Shared landing resolver |
| 8 | Resolve effective hub query state: URL first, else query-seed draft, else default | Hub route / page layer |
| 9 | Normalize query state against current entitlements | Hub route / page layer |
| 10 | Reflect seeded state into URL if entry was bare `/my-work` | Router |
| 11 | Start live feed fetch with effective query | Hub data layer |
| 12 | If needed, render fallback cache while live fetch is pending or unavailable | Hub surface |
| 13 | Restore return UI state after render | Hub surface |
| 14 | Clear consumed return-state draft | Hub surface |

### 7.3 Flow Invariants

- Effective query resolution happens before live fetch.
- Return UI state restoration happens after render.
- Seeded draft state becomes visible route state.
- Domain mutations are reflected through live re-fetch and normal hub refresh behavior.
- Persistence must not create a hidden alternate navigation model.

---

## 8. Offline and Degraded Return Behavior

### 8.1 Connectivity Model

Use the connectivity model provided by `@hbc/session-state`:

- `online`
- `degraded`
- `offline`

### 8.2 Offline Return with Fallback Cache

When returning offline and a fallback cache exists:

1. remain on `/my-work`
2. resolve effective query state
3. render fallback cache immediately
4. show staleness / offline messaging
5. restore return UI state where safe
6. allow only approved offline-capable mutations
7. replay queued operations and refresh when connectivity returns

### 8.3 Offline Return with No Fallback Cache

When returning offline and no fallback cache exists:

1. remain on `/my-work`
2. show governed offline empty-state guidance
3. do not redirect
4. retry automatically when connectivity improves

### 8.4 Mutation Reconciliation

On reconnect:

- queued offline-capable mutations replay through the existing queue model
- live feed refresh reconciles current authoritative state
- server truth wins where conflicts exist
- continuity is preserved without inventing destructive local ownership

---

## 9. Cleanup Rules

### 9.1 Shared Cleanup Requirement

P2-B2 requires a new shared `@hbc/session-state` capability for **registry-driven bulk cleanup / clear-by-prefix**.

This is a **required shared dependency** and must not be written as already available repo truth.

### 9.2 Cleanup Triggers

| Trigger | What Is Cleared | Mechanism |
|---|---|---|
| **User logout** | All registered `hbc-my-work-*` continuity drafts | Shared registry-driven bulk cleanup / clear-by-prefix |
| **Auth state change / role change** | Query-seed state may be retained, but restored values must be re-normalized; invalid return-state drafts may be dropped | Re-normalization + selective cleanup as needed |
| **TTL expiry** | Individual drafts per TTL | Existing draft TTL enforcement |
| **Explicit user action** | Relevant state category only | Component / route-level clear |
| **Provider mount / lifecycle sweep** | Expired drafts | Existing TTL purge behavior |

### 9.3 Cleanup Invariants

- Logout must clear all hub continuity drafts, including the feed fallback cache.
- Sensitive continuity state must not persist after auth ends.
- Expired drafts are treated as absent.
- Cleanup policy must not depend on hard-coded per-feature local deletion once the shared cleanup registry exists.
- Until the shared cleanup capability exists, implementation of P2-B2 is not complete.

---

## 10. Integration Requirements

### 10.1 Shared Packages / APIs

| Integration Point | Role |
|---|---|
| `@hbc/session-state/useDraft` | Return UI state + durable fallback cache |
| `@hbc/session-state/useAutoSaveDraft` | Query-seed draft persistence |
| `@hbc/session-state/useConnectivity` | Connectivity-aware return behavior |
| `@hbc/session-state` queued operations | Offline-capable mutation replay |
| TanStack Router search params | Canonical query-driving route state |
| TanStack Query / `QueryClient` | Primary live/cache authority |
| `@hbc/my-work-feed` query contracts | Effective query shape and feed behavior |
| P2-B1 shared landing resolver | Landing path only, not hub state authority |

### 10.2 Required Shared Dependency Blockers

| Dependency | Status in Repo Truth | P2-B2 Requirement |
|---|---|---|
| Registry-driven bulk cleanup / clear-by-prefix | Not yet confirmed as existing shared primitive | Required blocker |
| `/my-work` route search contract | Not yet locked in current repo truth | Must be defined alongside implementation |
| Seed-to-URL normalization flow | Not yet established as a locked hub pattern | Required implementation contract |

### 10.3 No-Go Rules

- Do not hide query-driving state exclusively in IndexedDB.
- Do not reintroduce Executive `my-team` as a default via persistence.
- Do not let durable fallback cache become a second primary cache authority.
- Do not describe future shared cleanup primitives as already-live repo truth.

---

## 11. Acceptance Gate References

P2-B2 contributes evidence for the **Continuity gate**.

| Field | Value |
|---|---|
| **Gate** | Continuity gate |
| **Pass condition** | Return memory and context restoration are trustworthy without obscuring route identity |
| **Primary evidence** | State-authority model, persistence registry, return flow, offline/degraded fallback, cleanup contract |
| **Primary owner** | Experience / Shell + Platform |

### Required Evidence

- canonical URL-vs-draft authority is explicitly defined
- bare-route seed behavior is defined and testable
- return UI restoration sequence is defined
- offline/degraded fallback is defined
- cleanup contract is defined, including the shared dependency blocker

---

## 12. Locked Decisions Applied

| Decision | Locked Resolution | Consequence in P2-B2 |
|---|---|---|
| **Executive / elevated-role landing** | Personal-first | Restored default posture is `personal`, not `my-team` |
| **State authority model** | URL canonical when present; bare route may seed from draft and then reflect to URL | Query-driving state is no longer IndexedDB-only |
| **Cleanup architecture** | Shared registry-driven bulk cleanup / clear-by-prefix | Prefix/registry language remains valid, but is now explicitly a shared dependency requirement |
| **Low-work default** | Stay on Personal Work Hub | Offline / no-cache return never redirects away from `/my-work` |
| **Continuity posture** | Strong context memory | Query seed, return UI state, and fallback cache are all governed continuity layers |

---

## 13. Policy Precedence

| Deliverable | Relationship to P2-B2 |
|---|---|
| **P2-B1** — Root Routing and Landing Precedence | Determines where the user lands; P2-B2 determines what hub state is restored |
| **P2-B3** — Freshness and Staleness Trust | Governs trust messaging for cached / stale hub data |
| **P2-B4** — Cross-Device Shell Behavior | Governs whether continuity crosses devices; P2-B2 is local-browser scoped |
| **P2-D2** — Adaptive Layout and Zone Governance | Separate layout persistence policy; not route-canonical hub query state |
| **P2-D5** — Personalization Policy | Long-term personalization must not overwrite this continuity contract |

If a downstream deliverable conflicts with this specification on state authority, return flow, or cleanup model, this specification takes precedence for `/my-work` continuity behavior.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §10.2, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
