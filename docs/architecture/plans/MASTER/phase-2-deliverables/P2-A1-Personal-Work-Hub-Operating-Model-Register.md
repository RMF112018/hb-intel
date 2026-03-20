# P2-A1: Personal Work Hub Operating Model Register

| Field | Value |
|---|---|
| **Doc ID** | P2-A1 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell Team |
| **Update Authority** | Experience lead; changes require review by Product/Design and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 — Comprehensive audit completed; verified all package references against current-state-map and live repo. All shared packages (my-work-feed, notification-intelligence, session-state, project-canvas, smart-empty-state, auth) are mature/partial implementations (SF29, SF10, SF12, SF13, SF11, per current-state-map §2). ADR-0115 (my-work-feed) locked as of 2026-03-15. Plan accurately reflects target-state governance; no overclaiming of current implementation. |
| **References** | [Phase 2 Plan §7–§10, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [Current-State Map](../../../blueprint/current-state-map.md) §2 (shared-feature classification); [ADR-0115](../../../architecture/adr/ADR-0115-my-work-feed-architecture.md); [@hbc/my-work-feed README](../../../../packages/my-work-feed/README.md); [@hbc/session-state README](../../../../packages/session-state/README.md); [@hbc/smart-empty-state README](../../../../packages/smart-empty-state/README.md); [@hbc/notification-intelligence README](../../../../packages/notification-intelligence/README.md); [@hbc/project-canvas README](../../../../packages/project-canvas/README.md) |

---

## Policy Statement

The Personal Work Hub is the PWA’s task-first, personal-first operating home for eligible users in Phase 2 first release. It is not a generic dashboard, not a parallel analytics board, and not a thin notification center. This register establishes the invariant operating rules, protected runway, projection model, action vocabulary, source-admission rules, and trust guarantees that all downstream design, implementation, and review work must preserve.

The hub must remain stable, trustworthy, and useful in all states — high-work, low-work, degraded, cached, and queued. Configuration, personalization, or lane expansion must not erode that identity.

---

## Policy Scope

### This policy governs

- Current-state to target-state reconciliation for the Personal Work Hub cutover
- Which hub behaviors are invariant (locked) vs configurable
- The primary responsibility-lane model and projection-mode rules
- Work-item lifecycle, mutation rules, and lane movement
- High-work and low-work behavior, including smart empty states
- Zone governance for primary, secondary, and tertiary regions
- Role-based visibility and delegation / reassignment posture
- PWA vs SPFx surface behavior at the operating-model level
- Publication, aggregation, and source-admission invariants
- Operating-level freshness and user-trust guarantees
- Acceptance evidence for first-release cutover and operation

### This policy does NOT govern

- Ranking coefficient weights, scoring formulas, or tie-break logic — see P2-A2
- Explainability drawer copy and disclosure design — see P2-A3
- Root routing implementation detail, redirect-memory mechanics, and shell boot sequence — see P2-B1
- Detailed freshness thresholds, polling intervals, and stale timers — see P2-B3
- Full adaptive layout implementation detail — see P2-D2
- Full personalization persistence model and saved-view storage implementation — see P2-D5
- Source-by-source product rollout sequencing — see P2-C1
- Notification-to-work mapping detail — see P2-C2

---

## Definitions

| Term | Meaning |
|---|---|
| **Invariant rule** | A hub behavior that is locked and cannot be overridden by personalization, role context, or downstream implementation |
| **Protected runway** | The primary operating region of the hub containing prioritized personal work and essential status/trust cues; users cannot remove or displace it |
| **Responsibility lane** | One of the four canonical action-state groupings for first-release personal work: `do-now`, `watch`, `waiting-blocked`, or `deferred` |
| **Projection mode** | A governed alternate view or summary over the same canonical work-item model, such as `delegated-by-me` or `my-team`; projection modes are not additional primary runway lanes |
| **Primary zone** | The invariant task runway and supporting status cues that answer the hub’s core questions |
| **Secondary zone** | Configurable, work-adjacent oversight content only in first release; not a portfolio analytics board |
| **Tertiary zone** | Recent context, continue-working links, pinned tools, and lightweight utility components |
| **Light action** | A low-risk, single-step action allowed in the SPFx companion surface, such as mark read, acknowledge, or dismiss |
| **Source capability** | Per-item declaration that a published action is supported by the originating module and current user context |
| **Low-work state** | A state where the user has few or no items in the `do-now` lane |
| **High-work state** | A state where the user has active items across one or more responsibility lanes, including at least one `do-now` item |
| **Broad source tranche** | First-release admission posture allowing any module to publish into the hub only if it satisfies the shared publication and governance requirements defined in this register |
| **Cutover readiness** | The evidence threshold required to make Personal Work Hub the default landing surface for eligible cohorts |
| **Rollback** | Temporary operational reversion of default landing precedence away from Personal Work Hub when cutover-readiness or production trust criteria fail |

---

## 0. Current-State Reconciliation and Transition Status

### 0.1 Current Repo Truth vs Target-State Policy

This document is a **target-state first-release governance register**, but it is anchored to current repo truth.

As of the last repo-truth review:
- the PWA root route still redirects `/` to `/project-hub`,
- the active protected-feature registry does not yet establish a Personal Work Hub route as the default PWA home,
- and the target Personal Work Hub operating layer remains a planned Phase 2 cutover rather than already-live default behavior.

This register therefore does **not** assume the transition is already complete. It defines what must be true for first-release execution and what conditions must be satisfied before the route/default-home cutover is treated as accepted.

### 0.2 First-Release Transition Doctrine

First release adopts the following locked posture:

1. Personal Work Hub becomes the **immediate default** for all eligible cohorts in first release.
2. The current `/project-hub` default is treated as **current-state legacy behavior**, not the desired steady-state home model.
3. Cutover is permitted only when the acceptance evidence in §11 is satisfied.
4. If post-cutover trust, supportability, or correctness materially fail, operational rollback to `/project-hub` default is allowed as a documented exception until remediation is complete.

### 0.3 Shared-Package Readiness Status

P2-A1 depends on the following shared packages reaching a specified maturity level before this register can be fully operationalized.

| Package | Layer | Purpose in P2-A1 | Maturity (as of 2026-03-15) | Blocker Status |
|---------|-------|------------------|-------|---|
| `@hbc/my-work-feed` | 8 | Aggregation, canonical item model, adapter registry, counting | **Mature** (SF29 complete 2026-03-15, ADR-0115 locked) | **READY** — Implementation-safe; use as-is |
| `@hbc/notification-intelligence` | 6 | Signal-fed publication, cross-module notifications | **Mature** (SF10 complete 2026-03-10, ADR-0099 locked) | **READY** — Notification mapping into hub ready |
| `@hbc/session-state` | 2 | Offline queue, draft persistence, freshness/sync tracking | **Mature** (SF12 complete 2026-03-11, ADR-0101 locked) | **READY** — Offline trust states ready |
| `@hbc/smart-empty-state` | 4 | Low-work empty-state classification and guidance | **Mature** (SF11 complete 2026-03-11, ADR-0100 locked) | **READY** — Empty-state ruling ready |
| `@hbc/project-canvas` | 6 | Adaptive layout, zone governance, personalization composition | **Mature** (SF13 complete 2026-03-11, ADR-0102 locked) | **READY** — Adaptive composition ready; **P2-specific blocker below** |
| `@hbc/auth` | 3 | Role resolution, entitlement vocabulary, multi-role context | **Mature** (Auth baseline, PH5 complete, role definitions stable) | **READY** — Role governance ready |

**P2-A1-Specific Blocker for `@hbc/project-canvas` Usage:**

The Phase 2 plan (§8.3, P2-B) constrains `@hbc/project-canvas` use to secondary and tertiary zones + supported composition around the primary runway (protected primary may not become freeform canvas). This blocker is **resolved in the planning layer** — the constraint is written into P2-A1 and P2-B0. **Implementation blocker:** The PWA shell must enforce these zone governance constraints via zone-level EditMode gating before deploying full canvas capability to users. This is an implementation-time design review gate, not a blocking package gap.

### 0.4 Transition Invariants

- The plan must never imply that the cutover is already implemented when repo truth says otherwise.
- The hub may become the default home only when route registration, protected-feature wiring, action contracts, trust surfaces, and rollback procedures are ready.
- Until cutover is complete, downstream implementation artifacts must clearly distinguish **current state**, **in-progress state**, and **first-release target state**.

---

## 1. Invariant Operating Rules

### 1.0 Foundation: Shared-Package Guarantees

All invariant rules in this section are written with the assumption that the shared packages listed in §0.3 are available at stated maturity levels. If any package maturity regresses or a named blocker is not resolved during implementation setup, the corresponding invariant may require re-evaluation. Governance procedures for that situation are defined in P2-E4 (Open Decisions).

### 1.1 The Four Core Questions

In all states — high-work, low-work, degraded, cached, or queued (as per `@hbc/session-state` trust taxonomy in ADR-0101) — the hub’s primary zone MUST answer these four questions in a calm and trustworthy way:

1. **What needs my attention now?** — the `do-now` lane and pinned current priorities
2. **What is waiting, blocked, or aging?** — the `waiting-blocked` lane and aging signals
3. **What changed that matters?** — recent material changes and meaningful notification-fed signals
4. **What should I continue or reopen next?** — recent context and continue-working links when active work is light

### 1.2 Stability Invariants (with Package-Binding Annotations)

| Invariant | Rule | Package Binding |
|---|---|---|
| **No redirect on low-work** | Low-work states MUST NOT redirect the user away from the Personal Work Hub | `@hbc/smart-empty-state` (classification rules determine user guidance without redirect) |
| **Protected primary runway** | Users MUST NOT remove, disable, or displace the primary zone through personalization | `@hbc/project-canvas` (zone-level governance; EditMode restricted to secondary/tertiary) |
| **Task-first identity** | The hub MUST NOT become a generic analytics dashboard, freeform board, or second project home | `@hbc/project-canvas` (constrained composition by zone) |
| **Single canonical model** | All work items across all sources and surfaces MUST use the canonical `IMyWorkItem` model from `@hbc/my-work-feed` | `@hbc/my-work-feed` (ADR-0115 governs normalization contract) |
| **Deterministic ranking** | Primary-zone ordering MUST remain deterministic and explainable | `@hbc/my-work-feed` (adapter registry + ranking inputs) |
| **Projection-is-not-a-lane** | Team and delegated views are projection modes over the canonical model; they MUST NOT create new primary runway lanes | `@hbc/my-work-feed` (adapter-driven composition only) |
| **Source-of-truth separation** | The hub may initiate supported source-governed actions, but it does not become the authoritative store for domain records | All packages (adapters own domain data, hub owns composition) |
| **Consistent counts** | Badge, launcher, panel, and full-feed counts MUST be computed from the same normalized result set | `@hbc/my-work-feed` (registry ensures count consistency) |
| **Visible trust state** | Users MUST never be led to believe data is live when it is cached, partial, or queued | `@hbc/session-state` (ADR-0101 trust-state taxonomy) |
| **Immediate-default cutover discipline** | First-release default-home behavior MUST remain backed by cutover and rollback readiness evidence | P2-B1, P2-C5 (route registration, publication readiness) |

### 1.3 First-Release Home Identity

The first-release home identity is locked as follows:

- The PWA owns the **full Personal Work Hub**.
- The primary zone is always **personal work first**.
- The secondary zone is limited to **work-adjacent oversight only**.
- Broader portfolio analytics, KPI boards, and generalized dashboard content are **not** part of the first-release Personal Work Hub operating model.
- Low/no-work states still remain inside the hub rather than collapsing back to Project Hub.

---

## 2. Zone Governance

### 2.1 Zone Model

| Zone | Purpose | First-Release Governance |
|---|---|---|
| **Primary** | Personal work runway, blocked/waiting items, trust cues, critical next moves | Invariant and protected |
| **Secondary** | Work-adjacent oversight only | Configurable within governed limits |
| **Tertiary** | Recent context, continue-working links, pinned tools, lightweight utilities | Configurable within governed limits |

### 2.2 Primary Zone Rules

The primary zone is protected and invariant.

It MUST:
- show the personal-work runway first,
- preserve deterministic responsibility-first ordering,
- retain visible freshness / queued / degraded trust cues,
- support the chosen PWA action model where capability permits,
- and remain present in all saved views.

It MUST NOT:
- be user-removable,
- be replaced with analytics cards,
- be fully rearranged into arbitrary canvases,
- or be hidden by personalization.

### 2.3 Secondary Zone Rules

The secondary zone is intentionally constrained in first release.

It MAY contain:
- work-adjacent oversight summaries,
- aging / blocked / escalation candidate summaries,
- governed team/delegated projection summaries for eligible elevated roles,
- and exception-oriented support cards directly related to active work.

It MUST NOT contain in first release:
- broad portfolio analytics,
- generalized KPI dashboards,
- unrelated trend cards,
- or content whose primary purpose is passive information consumption rather than work oversight.

### 2.4 Tertiary Zone Rules

The tertiary zone MAY contain:
- recent context and continue-working links,
- pinned tools,
- quick-launch utilities,
- and lightweight navigation aids.

The tertiary zone exists to keep the hub useful when work volume is light without changing the hub into another kind of surface.

### 2.5 Personalization Boundaries

Users MAY:
- reorder approved secondary and tertiary cards,
- resize approved cards within governed limits,
- save views and filters where permitted,
- choose from approved role-allowed cards,
- and maintain moderate personal preferences.

Users MUST NOT:
- remove or displace the primary zone,
- introduce cards outside approved role/entitlement rules,
- turn the home into a freeform analytics board,
- suppress required trust-state indicators,
- or persist a view that breaks the responsibility-first operating model.

---

## 3. Responsibility-Lane Model

### 3.1 Lane Definitions

Work items are organized into four canonical responsibility lanes for first-release personal work.

| Lane | Purpose | Entry Criteria | User Posture |
|---|---|---|---|
| `do-now` | Immediate action or meaningful near-term action | Current owner, active action required, or explicitly pinned for current attention | Act first |
| `watch` | Monitorable items not requiring immediate action | Informational or upcoming signals that remain relevant | Stay aware |
| `waiting-blocked` | Items stalled on external dependency or user-marked waiting condition | Blocked dependency, waiting state, or escalation watch | Track and escalate as needed |
| `deferred` | Items the user explicitly deferred | User executed `defer` | Revisit later |

### 3.2 Lane Membership Rules

Lane membership is determined by source mapping plus governed user actions.

#### Source-driven assignment

| Source / Condition | Assigned Lane | Notes |
|---|---|---|
| Active owned work requiring action | `do-now` | Default for actionable current-owner work |
| Upcoming or informational-but-relevant signal | `watch` | Not immediate, but worth visibility |
| Any owned item with blocked or waiting condition | `waiting-blocked` | Blocked status overrides ordinary lane assignment |
| Explicitly deferred item | `deferred` | User-controlled lane |
| Inbound handoff awaiting acknowledgment | `do-now` | Handoff age affects ranking / explainability, not lane identity |

#### User-driven lane movement

| Action | Effect |
|---|---|
| `defer` | Moves item to `deferred` |
| `undefer` | Returns item to source-driven lane |
| `waiting-on` | Moves item to `waiting-blocked` with dependency context |
| `pin-today` | Elevates item to current attention and guarantees `do-now` visibility |
| `pin-week` | Raises near-term priority without creating a new lane |

### 3.3 Lane Invariants

- Every work item MUST belong to exactly one lane at any point in time.
- Lane assignment MUST be deterministic given the same inputs.
- The `do-now` lane MUST always appear first in the primary zone.
- Lanes are **not** domain-specific.
- Users MUST NOT create custom lanes or rename existing lanes.
- Projection modes such as `delegated-by-me` and `my-team` do not add or change primary lanes.

---

## 4. Projection Modes and Role-Based Visibility

### 4.1 Team Modes

The hub supports the following query projections:

| Team Mode | Who Sees It | Purpose | First-Release Posture |
|---|---|---|---|
| `personal` | All users | User’s own work | Default for all |
| `delegated-by-me` | Users who have successfully delegated supported work | Track delegated items and outcomes | Projection only; not a runway lane |
| `my-team` | Eligible elevated roles | Monitor direct-report or team-owned items | Projection only; not a runway lane |

### 4.2 Visibility Invariants

- All roles use the same canonical `IMyWorkItem` model.
- Team/delegated views are query projections, not separate item types.
- Role resolution and entitlement posture come from `@hbc/auth`; no parallel custom role logic is permitted.
- Projection modes must not create a separate dashboard or competing home inside the Personal Work Hub.

### 4.3 Home Model by Role

| User Type | First-Release Landing Behavior |
|---|---|
| Standard roles | Personal work first |
| Elevated roles | Personal work first, with governed work-adjacent oversight in the secondary zone |
| Multi-role users | Personal work within the active role context, with controlled role switching |
| Admin-only exception contexts | May retain admin-specific landing behavior where explicitly required outside the normal eligible-cohort path |

### 4.4 Elevated-Role Secondary-Zone Content

For eligible elevated roles, the secondary zone may include only:
- team aging summaries,
- blocked-item summaries,
- escalation candidate counts,
- delegated follow-up summaries,
- and closely related exception-oriented oversight.

It may not become a portfolio analytics board in first release.

---

## 5. Work-Item Lifecycle, Ownership, and Supersession

### 5.1 Item Entry

A work item enters the hub when an approved publication path reports one of the following:
1. owned actionable work,
2. inbound handoff or transfer context,
3. meaningful lifecycle signal,
4. or approved module-native work that satisfies the source-admission rules in §9.

All items must be normalized into the canonical `IMyWorkItem` model during aggregation.

### 5.2 Ownership Identity Rules

Every work item has `owner: IMyWorkOwner` with a type discriminant. These rules are locked.

| Owner Type | When Used | First-Release Rule |
|---|---|---|
| `user` | A specific person owns the item | Standard personal-work ownership case |
| `role` | A role-class owns the item | Allowed when any entitled role holder may act |
| `company` | Organization-level ownership | Allowed only when action semantics remain clear |
| `system` | System-owned process state | Does not create personal work unless and until a human owner/action requirement is established |

### 5.3 Ownership Invariants

1. **System-owned states do not automatically create personal work.**
2. **Ownership changes create new ownership context.** When ownership transfers, the prior item is superseded and the new owner receives the actionable item.
3. **`previousOwner`** may be shown for handoff context.
4. **`delegatedBy` / `delegatedTo`** enable projection views without creating a separate item type.

### 5.4 Deduplication

When the same record produces multiple feed candidates, deduplication must:
- use a canonical dedupe key,
- deterministically preserve the surviving item,
- merge lower-priority source metadata into the survivor,
- and persist merge reasoning via dedupe metadata.

Default precedence remains:
- authoritative owned work over
- handoff context over
- notification-only signal,

unless an approved source-admission rule defines a stricter case-specific precedence.

### 5.5 State Transitions

| From State | Trigger | To State | Result |
|---|---|---|---|
| `new` / `active` | Aggregated as actionable current-owner work | `active` | Source-driven lane |
| `active` | `defer` | `deferred` | Moves to `deferred` |
| `deferred` | `undefer` | `active` | Returns to source-driven lane |
| `active` | Waiting / blocked dependency set | `waiting` or `blocked` | Moves to `waiting-blocked` |
| `waiting` / `blocked` | Dependency resolved | `active` | Returns to source-driven lane |
| `active` | Ownership transfer / reassignment completes | `superseded` | Old item exits active runway; new owner item created |
| `active` | Source workflow completes work | `completed` / exits feed | Removed on refresh |
| any active state | Dismiss / acknowledge-only signal handling | source-governed update | May remain, downgrade, or exit depending on source semantics |

### 5.6 Supersession Invariant

Superseded items must remain explainable for audit/reasoning purposes but must not stay visible as active primary-runway work.

---

## 6. Low-Work and High-Work Behavior

### 6.1 High-Work State

**Criteria:** The user has one or more items in `do-now`.

**Expected behavior:**
- full primary runway is visible,
- responsibility lanes are clearly distinguished,
- deterministic ranking answers what to act on first,
- trust-state cues remain visible,
- and the secondary zone stays subordinate to the primary runway.

### 6.2 Low-Work State

**Criteria:** The user has few or no items in `do-now`.

**Expected behavior — the hub MUST NOT redirect.**

Instead, the hub remains stable and shows:
- smart empty-state guidance,
- recent context,
- continue-working links,
- relevant trust-state cues,
- and lightweight tertiary support.

Low-work behavior does **not** promote the hub into a dashboard substitute.

### 6.3 Empty-State Classification

Low-work empty states follow the `@hbc/smart-empty-state` precedence posture (ADR-0100, SF11). The five-classification model is binding and MUST be applied before any custom-logic or proprietary empty-state behavior.

| Classification | Meaning | Required Hub Response |
|---|---|---|
| `loading-failed` | Feed load failed | Visible error state with retry and trust labeling |
| `permission-empty` | No eligible sources or entitlements | Guidance to appropriate workspace or administrator path |
| `filter-empty` | Filters exclude all items | Clear-filter action and explanation |
| `first-use` | User’s first meaningful encounter with the hub | Onboarding guidance and simple next steps |
| `truly-empty` | No active work exists | Continue-working links, recent context, and lightweight support content |

### 6.4 Low-Work Stability Invariant

The hub’s credibility as a daily home depends on remaining useful even when active work is light. Redirecting low-work users elsewhere teaches them that the hub is optional. That is prohibited.

---

## 7. Action Model and Capability-Gated Mutations

### 7.1 Action Surface Doctrine

The hub supports actions, but action support is always:
- source-governed,
- capability-checked,
- entitlement-checked,
- explainable,
- and auditable.

The hub does not become the source of truth. It acts as an orchestrated action initiator over source-owned records.

### 7.2 PWA First-Release Action Set

The first-release PWA action set is locked as follows:

- `open`
- `mark-read`
- `mark-unread`
- `acknowledge`
- `dismiss`
- `defer`
- `undefer`
- `waiting-on`
- `pin-today`
- `pin-week`
- `delegate`
- `reassign`

This is the approved first-release action vocabulary for the PWA **subject to source capability and entitlement gating**.

### 7.3 SPFx Companion Action Set

The SPFx companion surface is restricted to:
- summary/list presentation,
- `open`,
- `mark-read`,
- `mark-unread`,
- `acknowledge`,
- and `dismiss`.

It must not support deeper queue management, waiting-state management, pinning, delegation, or reassignment in first release.

### 7.4 Action Capability Matrix

| Action | PWA | SPFx Companion | Gating Rule |
|---|---|---|---|
| `open` | Yes | Yes | Must resolve to valid destination/context |
| `mark-read` / `mark-unread` | Yes | Yes | Allowed when item state supports it |
| `acknowledge` / `dismiss` | Yes | Yes | Allowed only when source semantics support one-step handling |
| `defer` / `undefer` | Yes | No | Requires source-safe or hub-safe defer semantics |
| `waiting-on` | Yes | No | Requires dependency-context support |
| `pin-today` / `pin-week` | Yes | No | Changes ranking/time-horizon behavior, not lane model |
| `delegate` / `reassign` | Yes | No | Requires current-user authority, source support, explicit capability flag, and audit semantics |

### 7.5 Delegation / Reassignment Rules

Delegation and reassignment are allowed in first release only when all of the following are true:

1. the current item exposes the action as supported,
2. the source module permits delegation/reassignment for that record type and state,
3. the current user is an allowed actor for that item in the source context,
4. the item exposes permission/capability state indicating the action is allowed,
5. telemetry and audit information are emitted,
6. and the resulting ownership transition can be explained in the hub.

If any of those conditions fail, the hub must not offer the inline action and must instead provide an open/deep-link path to the source workflow when appropriate.

### 7.6 Action Invariants

- Unsupported actions must never appear as enabled UI.
- Action availability must be per-item, not assumed globally by source.
- Queueable offline actions may only be offered when the action is explicitly offline-safe.
- The hub must provide a visible reason when an action cannot be performed.

---

## 8. Cross-Lane Rendering Constraints (PWA vs SPFx)

This section summarizes the operating-model implications of lane ownership. P2-B0 remains the governing coexistence policy.

### 8.1 PWA Full-Home Rules

The PWA owns:
- the full Personal Work Hub,
- the protected primary runway,
- full filtering and projection logic,
- deeper queue-management actions,
- delegation / reassignment when supported,
- and moderated personalization.

### 8.2 SPFx Companion Rules

The SPFx lane may show:
- governed summary cards,
- limited item lists,
- and the restricted light-action subset defined in §7.3.

The SPFx lane must not:
- become a second full home,
- replicate the full runway with equivalent control depth,
- expose the broader PWA action set,
- or offer freeform layout control that would let it evolve into a competing home.

### 8.3 Shared Cross-Lane Invariants

Both lanes must share:
- the same canonical work-item model,
- the same trust-state vocabulary,
- the same deep-link and context semantics,
- the same entitlement vocabulary,
- and the same telemetry naming for hub-relevant events.

---

## 9. Publication, Aggregation, and Source Admission

### 9.1 Broad Source Tranche Rule

First release permits a **broad source tranche**: any module may publish into the Personal Work Hub **only if** it satisfies the shared publication and governance requirements in this section.

Broad admission does **not** mean unconstrained admission.

### 9.2 Publication Invariants

All publication must:
- flow through `@hbc/my-work-feed` shared contracts and registry-driven aggregation (ADR-0115, SF29),
- normalize into the canonical `IMyWorkItem` shape defined in `@hbc/my-work-feed` contracts,
- provide deterministic dedupe identity following `@hbc/my-work-feed` deduplication rules (§5.4),
- declare supported actions and permissions per item via capability flags in the item shape,
- provide trust/freshness semantics tied to `@hbc/session-state` trust taxonomy (ADR-0101),
- and avoid direct feature-to-hub coupling that bypasses the `@hbc/my-work-feed` adapter registry.

### 9.3 Approved Publication Paths

First-release publication may use:
1. owned-work / BIC-style publication,
2. workflow handoff publication,
3. notification-fed signal publication,
4. or approved module-native adapters registered through the shared registry when the above semantic paths are insufficient.

No module may publish into the hub by bypassing the shared aggregation contracts.

### 9.4 Source Admission Checklist

A source is eligible for first-release publication only when it provides:

| Requirement | Description |
|---|---|
| **Canonical shape** | Can emit or map into `IMyWorkItem` without field ambiguity |
| **Stable identity** | Provides durable record identity and dedupe key inputs |
| **Clear ownership semantics** | Current owner / actor semantics are explicit |
| **Actionability quality** | Published items represent meaningful work or material signals rather than noisy passive events |
| **Capability flags** | Supported actions are declared per item |
| **Trust semantics** | Live / cached / partial / queued state can be expressed accurately |
| **Deep-link target** | Valid destination exists for open/fallback workflows |
| **Error handling** | Source failures degrade cleanly and visibly |
| **Telemetry** | Publication, action, error, and handoff events are instrumented |
| **Auditability** | Sensitive state-changing actions can be audited where required |
| **Offline posture** | Source identifies which actions are replay-safe and which are not |
| **Review signoff** | Product/Architecture accept the source as first-release suitable |

### 9.5 Aggregation Invariants

- Deduplication must preserve explainability.
- Ranking inputs must remain deterministic.
- Counts must stay consistent across surfaces.
- Degraded source count and health state transitions must be observable.
- A weak or noisy source must not distort the task-first identity of the hub.

### 9.6 Publication Anti-Drift Rules

The following are prohibited:
- direct source-to-hub UI coupling outside shared contracts,
- source-specific lane models,
- source-specific alternate item types,
- hidden unsupported actions,
- or publication of weak-signal noise that materially erodes the runway.

---

## 10. Freshness and Trust Model (Operating Level)

**Binding Package References:** This section operationalizes the trust-state taxonomy from `@hbc/session-state` (ADR-0101, SF12) and the offline queue model defined there. Implementation of trust-state UI cues and freshness behavior must follow the definitions below and must not diverge from the session-state semantics without an explicit deviation ADR.

### 10.1 Operating-Level Trust Invariant

Users must never be misled into thinking they are seeing live data when they are not.

This invariant applies at all times.

### 10.2 Required Trust States

| Status | Meaning | Required User Signal |
|---|---|---|
| `live` | Data fetched successfully and is within the accepted freshness window | Normal state cue; no misleading stale language |
| `cached` | Data shown from cache because live refresh failed or source unreachable | Visible cached label and last-refresh context |
| `partial` | Some sources succeeded and others failed | Visible partial-data indication and source-health summary |
| `queued` | Offline or replay-deferred mutation state | Visible queued/syncing indication and clear expectation that changes are pending |

### 10.3 Trust-State Behavior Rules

| Trust State | Content Availability | Action Availability | Required Messaging |
|---|---|---|---|
| `live` | Full eligible content | Full eligible supported actions | Standard last-refresh wording |
| `cached` | Cached content may remain visible | Only safe actions; unsupported live-required actions must explain why unavailable | User must understand data is not fully current |
| `partial` | Successful-source content remains visible | Only actions backed by healthy sources or safe cached semantics | User must understand some sources are missing |
| `queued` | Prior content may remain visible with queued mutation status | Only offline-safe queueable actions may proceed | User must understand changes are pending replay |

### 10.4 Trust Invariants

- Required trust cues cannot be personalized away.
- The hub must not silently downgrade from live to cached/partial/queued.
- Last-refresh or sync state must be visible when the state is not live.
- Degraded operation should preserve usefulness without faking freshness.

---

## 11. Acceptance Gates and Evidence

P2-A1 is evidence for the following first-release acceptance gates.

### 11.1 Work-Surface Gate

| Field | Value |
|---|---|
| **Pass condition** | The hub remains task-first and responsibility-first; it does not become a generalized dashboard |
| **Required evidence** | This register, zone-governance implementation, UX review, saved-view protection proof |
| **Measurable checks** | Protected primary runway cannot be removed; secondary zone contains only approved work-adjacent oversight content |

### 11.2 Low-Work Gate

| Field | Value |
|---|---|
| **Pass condition** | Low-work states remain useful and do not redirect users away from the hub |
| **Required evidence** | Empty-state implementation, UX proof, route behavior validation |
| **Measurable checks** | No low-work redirect; recent context and continue-working support visible in low/no-work state |

### 11.3 Cutover Gate

| Field | Value |
|---|---|
| **Pass condition** | Personal Work Hub is ready to become the default landing for eligible cohorts |
| **Required evidence** | Route registration, feature wiring, support runbook, rollback procedure, cutover validation |
| **Measurable checks** | Default landing resolves to hub for eligible cohorts; rollback path documented and tested; no unresolved Sev-1/Sev-2 trust defects at cutover |

### 11.4 Action-Contract Gate

| Field | Value |
|---|---|
| **Pass condition** | The expanded PWA action vocabulary is contract-hardened and capability-gated |
| **Required evidence** | Action contract spec, source capability mapping, offline/replay rules, entitlement tests, audit/telemetry review |
| **Measurable checks** | Unsupported actions never render enabled; delegate/reassign appears only when capability and permission rules pass |

### 11.5 Source-Admission Gate

| Field | Value |
|---|---|
| **Pass condition** | Every first-release publishing source satisfies the admission checklist |
| **Required evidence** | Per-source checklist, Architecture/Product signoff, telemetry readiness |
| **Measurable checks** | Published sources declare canonical identity, trust state, deep-link target, capability flags, and error/degraded handling |

### 11.6 Count / Trust Consistency Gate

| Field | Value |
|---|---|
| **Pass condition** | Users see consistent counts and truthful freshness/sync cues across surfaces |
| **Required evidence** | Cross-surface validation, trust-state UX review, telemetry confirmation |
| **Measurable checks** | Badge/panel/feed counts reconcile against same result set; cached/partial/queued states are visibly labeled |

---

## 12. Locked Decisions Relevant to Operating Model

The following decisions are locked for first release and govern this register.

| Decision | Locked Resolution |
|---|---|
| Default home for eligible cohorts | Personal Work Hub immediate default at first-release cutover |
| Top-level organization | Responsibility lanes first, with ranking/time-horizon cues layered inside |
| Secondary-zone posture | Work-adjacent oversight only |
| Team/delegated behavior | Projection mode only; not a new primary lane |
| Low-work default | Stay on Personal Work Hub with smart empty state + recent context / continue-working links |
| SPFx posture | Companion surface with summary/list + very limited light actions |
| PWA action vocabulary | Open, mark read/unread, acknowledge, dismiss, defer/undefer, waiting-on, pin-today/pin-week, delegate/reassign |
| Delegate/reassign rule | Allowed only when current actor and source capability/entitlement rules permit it |
| Personalization | Moderately governed |
| Layout model | Protected primary runway + governed secondary/tertiary composition |
| Source tranche | Broad, but only through governed source admission |
| Notification relationship | Notifications feed the hub; the hub remains the main work surface |
| Trust model | Hybrid live/cached/partial/queued posture with visible trust cues |
| Multi-role default | Personal work within active role context |

---

## 13. Policy Precedence and Companion Document Alignment

This register establishes the operating-model foundation that downstream Phase 2 deliverables must conform to. It is the authoritative source for the hub's invariant behavior and the constraints within which zones, personalization, and actionability operate.

**Alignment with Phase 2 Plan (§03):**

The Phase 2 master plan (§6.1–6.4) defines lane ownership (PWA full home, SPFx companion). P2-A1 defines what happens **inside** the PWA Personal Work Hub. These are complementary: the plan frames scope and lane boundaries; P2-A1 frames operating invariants for the content and behavior **inside** those boundaries.

| Deliverable | Relationship to P2-A1 |
|---|---|
| **P2-A2** — Ranking, Lane, and Time-Horizon Policy | Must implement ranking within the lane and projection structure defined here |
| **P2-A3** — Work-Item Explainability and Visibility Rules | Must explain the lifecycle, lane placement, trust state, and action availability defined here |
| **P2-B0** — Lane Ownership and Coexistence Rules | Governs ownership across PWA/SPFx; this document governs the hub’s internal operating model and surface constraints |
| **P2-B1** — Root Routing and Landing Precedence | Must implement the cutover/rollback posture established here |
| **P2-B3** — Freshness, Refresh, and Staleness Trust Policy | Must implement detailed timing and stale behavior consistent with the trust invariants here |
| **P2-D2** — Adaptive Layout and Zone Governance | Must respect protected-primary and governed-secondary/tertiary rules |
| **P2-D5** — Personalization Policy and Saved-View Rules | Must operate within the personalization boundaries defined here |
| **P2-C1–C5** — Work Sources, Signals, and Handoff | Must publish through the shared publication and source-admission rules defined here |

If a downstream deliverable conflicts with this register, this register takes precedence unless the Experience lead approves a documented exception with Architecture review.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §7–§10, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
