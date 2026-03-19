# P2-A1: Personal Work Hub Operating Model Register

| Field | Value |
|---|---|
| **Doc ID** | P2-A1 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Product/Design and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §7–§9, §10.1, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [runway-definition](../../../reference/work-hub/runway-definition.md); [interaction-contract](../../../reference/work-hub/interaction-contract.md); [publication-model](../../../reference/work-hub/publication-model.md); [leadership-visibility-model](../../../reference/work-hub/leadership-visibility-model.md); [ADR-0115](../../../architecture/adr/ADR-0115-my-work-feed-architecture.md) |

---

## Policy Statement

The Personal Work Hub is a task-first, personal-first operating layer — not a generic summary dashboard. This register establishes the invariant operating rules, responsibility-lane structure, work-item lifecycle, and state-stability guarantees that all downstream design, implementation, and personalization work must preserve. The hub must remain stable, trustworthy, and useful in all load states, and its core operating identity must not be degraded by configuration, personalization, or lane expansion.

---

## Policy Scope

### This policy governs

- Which hub behaviors are invariant (locked) vs configurable
- The responsibility-lane model and lane-membership criteria
- Work-item lifecycle, state transitions, and lane movement
- High-work and low-work state definitions and expected hub behavior
- Ownership identity rules and system-owned item exclusion
- Role-based visibility model (team modes)
- Publication and aggregation invariants
- Operating-level freshness and trust guarantees

### This policy does NOT govern

- Ranking coefficient weights, scoring formulas, or tie-break logic — see P2-A2
- Work-item explainability display rules — see P2-A3
- PWA/SPFx lane ownership and coexistence — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Root routing and landing precedence — see P2-B1
- Freshness thresholds, refresh intervals, and staleness trust details — see P2-B3
- Adaptive layout zone governance — see P2-D2
- Personalization policy and saved-view rules — see P2-D5
- First-release source tranche classification — see P2-C1
- Notification-to-work mapping rules — see P2-C2

---

## Definitions

| Term | Meaning |
|---|---|
| **Invariant rule** | A hub behavior that is locked and cannot be overridden by user configuration, personalization, or role context. Invariants define the hub's identity as an operating layer |
| **Configurable behavior** | A hub behavior that users may adjust within governed limits — e.g., reordering secondary cards, choosing from approved card sets, saving view preferences |
| **Responsibility lane** | A structural grouping of work items by their action state: `do-now`, `watch`, `waiting-blocked`, or `deferred`. Lanes define the user's relationship to the work, not the work's domain origin |
| **Lane membership** | The criteria that determine which responsibility lane a work item occupies, based on priority, ownership state, blocked status, and user actions |
| **Work-item lifecycle** | The sequence of states a work item passes through from creation to completion or supersession within the feed |
| **Ownership identity** | The type of entity that owns a work item: `user`, `role`, `company`, or `system`. See [interaction-contract §1](../../../reference/work-hub/interaction-contract.md) |
| **Low-work state** | A feed state where the user's active task queue is light — few or no items in the `do-now` lane |
| **High-work state** | A feed state where the user has a substantial active task queue with items across multiple responsibility lanes |
| **Primary zone** | The hub's core operating region: prioritized personal work, next moves, waiting/blocked items, and critical signals. This zone is invariant |
| **Secondary zone** | Analytics, exceptions, oversight, and role-aware visibility expansions. Configurable within governed limits |
| **Tertiary zone** | Quick actions, recent context, pinned tools, and lightweight utility components. Configurable within governed limits |

---

## 1. Invariant Operating Rules

The following rules are locked. No configuration, personalization, role context, or downstream deliverable may override them.

### 1.1 The Four Core Questions

In all states — high-work, low-work, degraded, or offline — the hub's primary zone MUST answer these four questions in a calm and trustworthy way:

1. **What needs my attention now?** — the `do-now` lane
2. **What is waiting on others?** — the `waiting-blocked` lane
3. **What changed that matters?** — attention items and notification-driven signals
4. **What project or context is most relevant right now?** — project-linked work and context anchoring

### 1.2 Hub Stability Invariants

| Invariant | Rule |
|---|---|
| **No redirect on low-work** | Low-work states MUST NOT redirect the user away from the Personal Work Hub. The hub remains the stable home surface regardless of task queue depth |
| **Primary zone is protected** | Users MUST NOT be able to remove, disable, or displace the primary zone through personalization |
| **Task-first identity** | The hub MUST NOT degrade into a generic analytics dashboard, summary page, or freeform composition surface |
| **Single canonical model** | All work items across all sources, lanes, and surfaces MUST use the same canonical `IMyWorkItem` model from `@hbc/my-work-feed` |
| **Deterministic ranking** | Work-item ordering MUST be deterministic and explainable — not random, not recency-only, not user-sorted in the primary zone |
| **Source-of-truth separation** | The hub is NOT the source of truth for domain data. Domain mutations happen at source surfaces; the hub reflects results on refresh. See [interaction-contract §4](../../../reference/work-hub/interaction-contract.md) |
| **Consistent counts** | Badge count, panel count, tile count, and full feed count MUST be consistent — all draw from the same `IMyWorkFeedResult` computation (ADR-0115 D-07) |

### 1.3 Personalization Boundaries

Users MAY:
- Reorder approved secondary/tertiary cards
- Resize approved cards within governed limits
- Choose from approved role-allowed cards
- Save limited view preferences where permitted

Users MUST NOT:
- Remove or displace the core personal-work runway (primary zone)
- Break the responsibility-first operating model
- Surface cards outside their entitlement rules
- Turn the home into a freeform analytics board

---

## 2. Responsibility-Lane Model

### 2.1 Lane Definitions

Work items are organized into four responsibility lanes. Lanes represent the user's relationship to the work, not the work's domain origin.

| Lane | Purpose | Entry Criteria | User Posture |
|---|---|---|---|
| `do-now` | Items requiring the user's immediate attention or action | BIC items with urgency `immediate` or `watch` where user is current owner; notification items with tier `immediate`; handoff items > 24 hours old | Act on these first |
| `watch` | Items the user should monitor but need not act on immediately | BIC items with urgency `upcoming`; notification items with tier `watch` or `digest` | Stay aware; act if escalated |
| `waiting-blocked` | Items the user owns that are blocked on external dependencies | BIC items where `isBlocked: true` regardless of original urgency | Monitor blockers; escalate if aging |
| `deferred` | Items the user has explicitly deferred | Any item where user executed the `defer` feed mutation | Review periodically; undefer when ready |

### 2.2 Lane Membership Rules

Lane membership is determined by a combination of source adapter mapping and user actions:

**Source-driven assignment** (at aggregation time):

| Source | Urgency/Tier | Assigned Lane |
|---|---|---|
| BIC adapter | `immediate` | `do-now` |
| BIC adapter | `watch` | `do-now` |
| BIC adapter | `upcoming` | `watch` |
| BIC adapter | any, with `isBlocked: true` | `waiting-blocked` |
| Notification adapter | `immediate` | `do-now` |
| Notification adapter | `watch` | `watch` |
| Notification adapter | `digest` | `watch` |
| Handoff adapter | age > 48h | `do-now` |
| Handoff adapter | age > 24h | `do-now` |
| Handoff adapter | age ≤ 24h | `do-now` |

See [publication-model §6](../../../reference/work-hub/publication-model.md) for the complete priority mapping reference.

**User-driven lane movement** (via feed mutations):

| Action | Effect on Lane |
|---|---|
| `defer` | Moves item to `deferred` lane |
| `undefer` | Returns item to its source-driven lane |
| `pin-today` | Elevates priority to `now`, moves to `do-now` if not already there |
| `pin-week` | Elevates priority to `soon`, moves to `do-now` if not already there |
| `waiting-on` | Sets state to `waiting` with dependency label, moves to `waiting-blocked` |

See [interaction-contract §5](../../../reference/work-hub/interaction-contract.md) for the full mutation vs navigation action taxonomy.

### 2.3 Lane Invariants

- Every work item MUST belong to exactly one lane at any point in time.
- Lane assignment MUST be deterministic given the same inputs.
- The `do-now` lane MUST always appear first in the primary zone.
- Lanes MUST NOT be domain-specific — all domains share the same four-lane structure.
- Users MUST NOT create custom lanes or rename existing lanes.

---

## 3. Work-Item Lifecycle and State Transitions

### 3.1 Item Entry

A work item enters the feed when:
1. A BIC adapter reports the user as the current owner of an active item
2. A handoff adapter reports an inbound work transfer requiring acknowledgment
3. A notification adapter reports a lifecycle signal (state change, completion, failure, escalation)

Items are normalized into the canonical `IMyWorkItem` model during aggregation. See [publication-model §1](../../../reference/work-hub/publication-model.md).

### 3.2 Deduplication

When the same record produces items through multiple channels, the higher-weight source survives:
- BIC adapter: weight 0.9 (highest)
- Handoff adapter: weight 0.8
- Notification adapter: weight 0.5

The surviving item's `dedupe: IMyWorkDedupeMetadata` records merge history. Canonical key format: `{moduleKey}::{recordType}::{recordId}`. See [publication-model §5](../../../reference/work-hub/publication-model.md).

### 3.3 State Transitions

| From State | Trigger | To State | Lane Effect |
|---|---|---|---|
| `active` / `new` | User is current BIC owner | (remains) | Source-driven lane |
| `active` | User executes `defer` | `deferred` | → `deferred` |
| `deferred` | User executes `undefer` | `active` | → source-driven lane |
| `active` | External dependency detected | `blocked` | → `waiting-blocked` |
| `blocked` | Dependency resolved | `active` | → source-driven lane |
| `active` | BIC ownership transfers | `superseded` | Item removed; new item created for new owner |
| `active` | Domain action completes the work | Item exits feed | On next refresh |
| `waiting` | Dependency label set by user | `waiting` | → `waiting-blocked` |

### 3.4 Supersession

When ownership changes, the old owner's item is marked `superseded` with a reference to the new item. The `supersession: IMyWorkSupersessionMetadata` field records the superseded-by reference and original ranking. See [interaction-contract §6](../../../reference/work-hub/interaction-contract.md).

---

## 4. High-Work and Low-Work State Definitions

### 4.1 High-Work State

**Criteria:** The user has items in the `do-now` lane.

**Expected behavior:**
- Primary zone shows the full task runway with deterministic priority ordering
- Responsibility lanes are populated and clearly distinguished
- Ranking provides clear signal about what to act on first
- No special empty-state treatment needed

### 4.2 Low-Work State

**Criteria:** The user has few or no items in the `do-now` lane.

**Expected behavior — the hub MUST NOT redirect.** Instead, the hub remains stable and shows:

| Content | Source | Purpose |
|---|---|---|
| Smart empty-state guidance | `@hbc/smart-empty-state` (D-01 precedence classification) | Context-aware coaching based on visit history and user state |
| Governed secondary cards | Secondary zone analytics, recent context | Keep the surface useful even without active tasks |
| Recent signals | Notification-driven items in `watch` lane | Surface what changed recently |
| Quick paths | Tertiary zone tools and shortcuts | Enable productive action without an active task queue |

**Why low-work stability matters:** The hub's credibility as a daily operating surface depends on remaining useful and stable in all states. If the hub redirects users elsewhere when their task queue is light, it teaches users that the hub is only relevant when busy — undermining the operating-layer identity and training users to bypass the hub entirely.

### 4.3 Empty-State Classification

Low-work empty states follow the `@hbc/smart-empty-state` D-01 precedence model:

| Classification | Meaning | Hub Response |
|---|---|---|
| `loading-failed` | Feed computation failed | Error state with retry affordance |
| `permission-empty` | User lacks entitlement to any sources | Guidance toward appropriate workspace |
| `filter-empty` | Active filters exclude all items | Clear-filter affordance |
| `first-use` | User has never seen the hub before | Onboarding guidance with complexity-tier coaching |
| `truly-empty` | No active work items exist | Governed fallback content (secondary cards, recent signals, quick paths) |

---

## 5. Role-Based Visibility Model

### 5.1 Team Modes

The Personal Work Hub supports three team modes via `IMyWorkQuery.teamMode`:

| Team Mode | Who Sees It | What It Shows | Default For |
|---|---|---|---|
| `personal` | All users | Items the user personally owns or needs to act on | Standard roles |
| `delegated-by-me` | Any user who has delegated work | Items the user delegated to others | Available to all, not default |
| `my-team` | Executive role users | Items owned by the user's direct reports | Executive roles |

### 5.2 Home Model by Role

| User Type | First-Release Landing Behavior |
|---|---|
| Standard roles | Personal work first (`teamMode: 'personal'`) |
| Elevated roles | Hybrid landing: personal work first, then team / delegated / portfolio attention |
| Multi-role users | Personal work within the active role context, with controlled switching |
| Admin-only exception contexts | May still use admin-specific landing behavior where explicitly required |

### 5.3 Elevated-Role Hybrid Landing

Elevated-role users receive a hybrid experience:
- Primary zone: personal work runway (same invariant structure as all users)
- Secondary zone: team-mode summary cards with portfolio-level counts (aging, blocked, escalation candidates)
- Toggle between personal and team views

The hybrid landing MUST NOT create a separate dashboard experience. Team visibility is layered onto the same operating-layer structure. See [leadership-visibility-model](../../../reference/work-hub/leadership-visibility-model.md) for team feed implementation details.

### 5.4 Visibility Invariants

- All roles share the same canonical `IMyWorkItem` model — no role-specific item types
- No role-specific adapters — team modes are query projections over the same aggregation pipeline
- Role resolution comes from `@hbc/auth` — no parallel custom role logic
- Delegated/team visibility is limited to eligible elevated roles per P2-B0 lane ownership

---

## 6. Ownership Identity Rules

Every work item has an `owner: IMyWorkOwner` with a type discriminant. These rules are locked.

| Owner Type | When Used | Example |
|---|---|---|
| `user` | Specific person owns the item | Controller reviewing a request |
| `role` | A role-class owns the item (any holder can act) | "Admin" role owns a failed provisioning run |
| `company` | Company-level ownership | Organizational escalation |
| `system` | System-owned (no human owner) | Provisioning saga in progress |

### Ownership Rules

1. **System-owned items do NOT create personal work items.** When a record is in a system-owned state (e.g., provisioning request in `ReadyToProvision` or `Provisioning`), no human owns it and no feed item is created.
2. **Ownership changes create new items.** When BIC ownership transfers, a new item appears for the new owner. The old owner's item is marked `superseded`.
3. **`previousOwner`** is available for handoff context — the new owner can see who sent the work.
4. **`delegatedBy` / `delegatedTo`** support manager/team delegation views without creating a separate item type.

See [interaction-contract §1](../../../reference/work-hub/interaction-contract.md) for the full ownership identity specification.

---

## 7. Publication and Aggregation Invariants

### 7.1 Adapter Architecture

All first-release work publication MUST flow through the three existing `@hbc/my-work-feed` adapters. No parallel publication path is permitted.

| Channel | Adapter | Source Weight | What It Publishes |
|---|---|---|---|
| BIC ownership | `bicAdapter` | 0.9 (highest) | Active work items where user is current BIC owner |
| Workflow handoff | `handoffAdapter` | 0.8 | Inbound work transfers requiring acknowledgment |
| Notifications | `notificationAdapter` | 0.5 | Lifecycle signals — state changes, completions, failures, escalations |

### 7.2 Aggregation Invariants

- All items MUST be normalized into the canonical `IMyWorkItem` model
- Deduplication MUST use the canonical key format: `{moduleKey}::{recordType}::{recordId}`
- Higher-weight sources win deduplication; lower-weight source metadata is merged into the survivor
- Ranking MUST be deterministic and explainable via `rankingReason: IMyWorkRankingReason`
- The aggregation pipeline MUST emit telemetry for duration, degraded source count, deduplication events, and health state transitions

### 7.3 Domain Publication Contract

Domain teams publish work into the hub through shared contracts, not direct hub integration:
- BIC publication: register via `IBicModuleRegistration` pattern. See [publication-model §3](../../../reference/work-hub/publication-model.md)
- Notification publication: register via `@hbc/notification-intelligence`. See [publication-model §4](../../../reference/work-hub/publication-model.md)
- Bypassing `@hbc/my-work-feed` for first-release publication is prohibited per [P2-B0 Anti-Drift Rule 5](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)

---

## 8. Freshness and Trust Model (Operating Level)

### 8.1 Operating-Level Trust Invariant

Per Unified Blueprint §7.2: "Users must never be misled into thinking they are seeing live data when they are not."

This invariant applies to the hub at all times. When any data source is not `live`, the hub MUST display a sync-state indicator.

### 8.2 Per-Source Freshness States

| Source Status | Meaning |
|---|---|
| `live` | Data fetched successfully within freshness window |
| `cached` | Data served from cache; source unreachable |
| `partial` | Some sources loaded, others failed |
| `queued` | Offline; mutations queued for replay |

### 8.3 Scope Boundary

This section establishes the operating-level trust invariant only. Detailed freshness thresholds, refresh intervals, staleness trust rules, and degraded-state UX are governed by P2-B3 (Freshness, Refresh, and Staleness Trust Policy).

See [interaction-contract §3](../../../reference/work-hub/interaction-contract.md) for the full stale-state labeling specification.

---

## 9. Acceptance Gate References

P2-A1 is evidence for two Phase 2 acceptance gates:

### Work-Surface Gate

| Field | Value |
|---|---|
| **Pass condition** | Hub remains task-first and responsibility-first, not a generic dashboard |
| **Evidence required** | Operating model register (this document), zone governance spec (P2-D2), UX review |
| **Primary owner** | Product/Design + Experience |

### Low-Work Gate

| Field | Value |
|---|---|
| **Pass condition** | Low-work states remain useful without redirecting users away from the hub |
| **Evidence required** | Empty-state rules (this document §4), UX proof, acceptance review |
| **Primary owner** | Product/Design |

---

## 10. Locked Decisions Relevant to Operating Model

The following decisions from Phase 2 §16 are locked and directly govern the operating model:

| Decision | Locked Resolution |
|---|---|
| Top-level organization | Responsibility lanes first, with time-horizon cues layered inside |
| Work ranking | Weighted mix of ownership, urgency, aging, project importance, blocking status, and role context |
| Low-work default | Stay on Personal Work Hub with smart empty-state + governed fallback content |
| Notification relationship | Notifications feed the hub via `@hbc/notification-intelligence`; hub remains the main work surface |
| Freshness model | Hybrid freshness/staleness trust model |
| Multi-role default | Primary active role context |
| Elevated-role landing | Hybrid — personal work first, then team / delegated / portfolio attention |
| Personalization | Moderately governed |
| Layout model | Adaptive layout using `@hbc/project-canvas`, constrained by zone governance |
| Delegated/team lanes | Limited and only for eligible elevated roles |

---

## 11. Policy Precedence

This register establishes the **operating model foundation** that downstream Phase 2 deliverables must conform to:

| Deliverable | Relationship to P2-A1 |
|---|---|
| **P2-A2** — Ranking, Lane, and Time-Horizon Policy | Must implement ranking within the responsibility-lane structure defined here; must not introduce new lanes or override lane-membership rules |
| **P2-A3** — Work-Item Explainability and Visibility Rules | Must provide explainability for the ranking and lifecycle defined here |
| **P2-B0** — Lane Ownership and Coexistence Rules | Peer policy — P2-B0 governs lane *ownership* (PWA vs SPFx); P2-A1 governs the hub's *internal* operating model |
| **P2-D2** — Adaptive Layout and Zone Governance | Must respect the primary/secondary/tertiary zone model and invariant rules defined here |
| **P2-D5** — Personalization Policy and Saved-View Rules | Must operate within the personalization boundaries defined in §1.3 |
| **P2-C1–C5** — Work Sources, Signals, Handoff | Must publish through the adapter architecture and aggregation invariants defined in §7 |

If a downstream deliverable conflicts with this register, this register takes precedence unless the Experience lead approves a documented exception with Architecture review.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §7–§9, §10.1](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
