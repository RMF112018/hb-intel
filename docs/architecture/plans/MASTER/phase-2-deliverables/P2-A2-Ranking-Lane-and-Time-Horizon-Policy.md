# P2-A2: Ranking, Lane, and Time-Horizon Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-A2 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell + Platform / Core Services |
| **Update Authority** | Experience lead; changes require review by Platform lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.1, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); `packages/my-work-feed/src/normalization/rankItems.ts`; `packages/my-work-feed/src/normalization/projectFeed.ts` |

---

## Policy Statement

Work-item ranking in the Personal Work Hub is deterministic, explainable, responsibility-first, and uniform across all governed surfaces. This policy locks the first-release scoring model, tie-breaking chain, source-trust hierarchy, lane assignment logic, time-horizon cue rules, user-driven ranking overrides, and role-context ranking behavior.

This document is also a **reconciliation policy**. Current repo truth still contains implementation details that do not fully match the refined Phase 2 target state — most notably delegated-team handling, source naming/weighting alignment, and some lane consequences for user actions. This policy defines the required first-release behavior and identifies where current implementation posture must be brought into compliance.

Changes to scoring coefficients, tie-break order, trust hierarchy, or lane assignment criteria require Experience-lead approval with Platform and Architecture review.

---

## Policy Scope

### This policy governs

- Scoring factors, coefficients, and additive scoring behavior
- Tie-breaking rules and deterministic ordering
- Source trust hierarchy and source weight values
- Lane assignment decision logic
- Time-horizon cue definitions and application rules
- User-driven ranking and lane movement actions
- Role-context ranking uniformity
- Blend-mode ranking behavior for personal and delegated/team work
- Aging and freshness attention rules
- Presentation-layer separation between urgent work and lower-priority watch work

### This policy does NOT govern

- Core Personal Work Hub operating-model doctrine and zone governance — see [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md)
- Work-item explainability display format — see P2-A3
- PWA/SPFx lane ownership and anti-drift — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Freshness thresholds and staleness trust semantics outside ranking/cue policy — see P2-B3
- Card layout, personalization, or adaptive zone composition — see P2-D2 and P2-D5

---

## Definitions

| Term | Meaning |
|---|---|
| **Scoring factor** | A measurable attribute of a work item that contributes to its ranking score |
| **Coefficient** | The numeric weight applied to a scoring factor |
| **Tie-breaking** | The deterministic comparison chain used when two items have equal scores |
| **Time-horizon cue** | A visual annotation overlaid on items within a lane to indicate temporal urgency (`overdue`, `today`, `this week`, `later`) |
| **Direct work signal** | A work item that directly represents personal or workflow responsibility, such as owned work, a workflow handoff, or an acknowledgment-required item |
| **Notification-only signal** | A signal that informs the user something changed but does not itself represent the primary responsibility record |
| **Blend mode** | An optional elevated-role view that combines personal and delegated/team items into one ranked list while still visually distinguishing direct work from delegated/team responsibility |
| **Projection mode** | A governed alternate view over the same canonical item model that does not create new primary runway lanes |
| **Pinning** | A user action (`pin-today`, `pin-week`) that raises attention priority for an item |
| **Deferral** | A user action (`defer`) that moves an item to the `deferred` lane until explicitly undeferred |
| **Material activity** | A meaningful update such as a new handoff, approval request, status change, or substantive workflow change; not every simple notification refresh qualifies as material activity |
| **Aging threshold** | A number of days beyond which an unactioned item qualifies for aging or escalation classification |
| **Current-state reconciliation** | The explicit identification of where current implementation posture differs from locked target-state policy |
| **Responsibility-bearing source** | A source whose item directly represents ownership, action, or acknowledgment responsibility rather than a secondary alert about that responsibility |

---

## 0. Current-State Reconciliation

### 0.1 Current Repo Truth Relevant to P2-A2

As of the last repo-truth review:

- `rankItems.ts` implements deterministic additive scoring with overdue, due-date proximity, blocked BIC treatment, unread freshness, dependency impact, project context, source weight, and offline-capable contributions.
- `projectFeed.ts` currently assigns `delegated-team` as a lane when delegation metadata is present.
- The canonical source enum currently uses:
  - `bic-next-move`
  - `workflow-handoff`
  - `acknowledgment`
  - `notification-intelligence`
  - `session-state`
  - `module`
- The current ranking implementation uses the first `sourceMeta` entry for weighting rather than a richer merged-provenance trust computation.

### 0.2 Target-State Reconciliation Rules

This policy locks the following target-state corrections:

1. **Delegated/team work is not a standing primary lane** in the first-release operating model.
2. A user may intentionally turn on **blend mode**, but that does not create a fifth canonical lane.
3. Source naming and weight policy MUST align to the canonical source enum actually used by the shared package.
4. Direct work signals MUST outrank notification-only signals for the same underlying responsibility.
5. `pin-week` MUST raise attention and ordering without automatically moving an item into the `do-now` lane.
6. Lower-priority/watch work MUST remain visible in a separate lower section, not hidden by default and not mixed indistinguishably into the urgent list.

### 0.3 Reconciliation Doctrine

Where current implementation and this policy differ:

- this policy governs the required first-release target state,
- implementation plans must explicitly note the delta,
- and no downstream plan may claim the reconciliation is complete until the shared package behavior and UI rendering both comply.

---

## 1. Scoring Model

The ranking system uses **additive scoring**. Each applicable factor contributes independently to the total score. Higher scores rank first.

The policy remains anchored to the current additive model, but is tightened to reflect the refined Phase 2 operating model: direct responsibility outranks notification-only signaling, user intent matters, and recent activity provides a moderate boost rather than overpowering deadlines or explicit user actions.

**Reference implementation anchor:** `packages/my-work-feed/src/normalization/rankItems.ts`

### 1.1 Scoring Factors and Coefficients

| # | Factor | Condition | Score Contribution | Primary Reason Label |
|---|---|---|---|---|
| 1 | **Overdue** | `isOverdue === true` and `dueDateIso` present | `+1000 + min(daysOverdue × 10, 500)` | `Overdue item` |
| 2 | **Approaching due** | `dueDateIso` present and not overdue | `+max(0, 500 − daysToDue × 20)` | `Has due date` |
| 3 | **Blocked BIC** | `isBlocked === true` and primary source is `bic-next-move` | `+400` | `Blocked BIC item` |
| 4 | **Unacknowledged direct work** | Class is `inbound-handoff` or `pending-approval`, and `isUnread === true` | `+300` | `Unacknowledged` |
| 5 | **Pin today** | User applied `pin-today` | `+250` | `Pinned for today` |
| 6 | **Pin week** | User applied `pin-week` | `+150` | `Pinned for this week` |
| 7 | **Unread freshness** | `isUnread === true` | `+max(0, 200 − daysSinceUpdate × 10)` | `Unread` |
| 8 | **Recent material activity** | Qualifying material activity in the last 5 days | `+max(0, 100 − daysSinceMaterialActivity × 20)` | `Recent change` |
| 9 | **Dependency impact** | `lifecycle.blockedDependencyLabel` is present | `+150` | `Dependency impact` |
| 10 | **Project context** | `context.projectId` is present | `+100` | `Project context` |
| 11 | **Source weight** | Always applied | `+50 × sourceWeight` | contributing factor only |
| 12 | **Offline capable** | `offlineCapable === true` | `+25` | `Offline capable` |

### 1.2 Scoring Behavior

- Factors are cumulative.
- Overdue status remains the strongest general urgency driver.
- Approaching due dates outrank simple recent activity.
- Explicit user intent (`pin-today`, `pin-week`) matters more than ordinary recent activity.
- Recent material activity matters, but it MUST count less than overdue status, due dates, or explicit user pinning.
- Notification refreshes alone MUST NOT be treated as material activity unless they reflect a meaningful underlying work-state change.
- The numeric score is recorded in `rankingReason.score`.
- The primary reason is the highest-impact applicable factor. If no named factor takes priority, the first meaningful contributing reason becomes primary.
- All contributing factors are recorded in `rankingReason.contributingReasons` for explainability.

### 1.3 Scoring Curves

**Overdue escalation curve**
- Base: +1000 at day 0 overdue
- Scaling: +10 per additional day overdue
- Cap: +500 additional at 50+ days overdue
- Maximum overdue contribution: +1500

**Approaching-due curve**
- Base: +500 when due date is today
- Decay: −20 per day until due date
- Floor: 0 at 25+ days until due

**Unread freshness curve**
- Base: +200 on the day of update
- Decay: −10 per day since last update
- Floor: 0 at 20+ days since update

**Recent-material-activity curve**
- Base: +100 on the day of qualifying activity
- Decay: −20 per day since the qualifying activity
- Floor: 0 at 5+ days
- This factor is intentionally weaker than due-date or user-intent factors

### 1.4 Scoring Doctrine

- No domain-specific scoring is allowed.
- No role-specific coefficient overrides are allowed.
- No machine-learning or opaque ranking layer is allowed in first release.
- Ranking remains deterministic, additive, and explainable.

---

## 2. Tie-Breaking Rules

When two items have equal scores, the following deterministic tie-break chain resolves ordering. Each level is applied in sequence; the first difference determines order.

### 2.1 Tie-Break Chain

| Level | Criterion | Direction | Rationale |
|---|---|---|---|
| 1 | Overdue severity | Overdue items first; more days overdue first | Urgency remains primary |
| 2 | Blocked status | Blocked items first | Stalled responsibility needs visibility |
| 3 | Direct-work source trust | Responsibility-bearing source first | Real work outranks notification-only signals |
| 4 | Source weight | Higher weight first | Stronger source authority breaks remaining ties |
| 5 | Freshness | Most recently updated first | More active relevant work surfaces first |
| 6 | Canonical key | Lexicographic ascending | Stable deterministic fallback |

### 2.2 Tie-Breaking Invariants

- Tie-breaking MUST be deterministic.
- The same inputs always produce the same order.
- Direct work and workflow responsibility MUST win over notification-only signaling when the underlying responsibility is the same.
- No randomization and no user-controlled sort order are allowed in the primary ranking experience.
- Canonical key remains the absolute deterministic fallback.

---

## 3. Lane Assignment Policy

Lane assignment determines which canonical responsibility lane an item occupies. It is evaluated at feed computation time and may change when item state changes.

This policy is intentionally aligned to the tightened P2-A1 model: four canonical lanes only, with team/delegated handled as optional projection behavior rather than as a fifth standing lane.

### 3.1 Canonical Lane Set

| Lane | Purpose |
|---|---|
| `do-now` | Immediate action or meaningful current attention |
| `waiting-blocked` | Waiting, stalled, or blocked work needing monitoring or escalation |
| `watch` | Relevant lower-priority work that should remain visible |
| `deferred` | Intentionally deferred work |

### 3.2 Lane Assignment Decision Table

The following decision table is evaluated in order — the first matching rule determines the lane:

| Priority | Condition | Assigned Lane |
|---|---|---|
| 1 | `isBlocked === true` OR `state === 'blocked'` OR `state === 'waiting'` | `waiting-blocked` |
| 2 | Explicit `defer` OR `priority === 'deferred'` OR `state === 'deferred'` | `deferred` |
| 3 | `priority === 'now'` AND (`state === 'active'` OR `state === 'new'`) | `do-now` |
| 4 | Inbound handoff awaiting acknowledgment | `do-now` |
| 5 | Default otherwise | `watch` |

### 3.3 Lane Assignment Rules

- Blocked/waiting state takes precedence over urgency.
- Deferred state takes precedence over ordinary active/watch placement.
- `pin-today` may raise an item into `do-now`.
- `pin-week` MUST NOT by itself move an item into `do-now`.
- Handoff age may affect ranking and explainability, but it MUST NOT create a separate lane rule.
- Delegation metadata (`delegatedTo`, `delegatedBy`) does not create a standing lane in target-state policy.
- Current implementation that still computes `delegated-team` internally must be treated as a reconciliation gap until the visible policy is aligned.

### 3.4 Source-to-Lane Mapping

Source adapters map their urgency/tier model to feed priority, which then determines lane assignment through the decision table above.

| Source | Source Urgency/Tier | Feed Priority | Resulting Lane |
|---|---|---|---|
| `bic-next-move` | `immediate` | `now` | `do-now` |
| `bic-next-move` | `watch` | `soon` | `watch` |
| `bic-next-move` | `upcoming` | `watch` | `watch` |
| `workflow-handoff` | acknowledgment pending | `now` | `do-now` |
| `workflow-handoff` | acknowledged but active | `soon` or `watch` | `watch` unless blocked |
| `notification-intelligence` | immediate signal with direct action already represented elsewhere | contextual | no automatic dominance over direct-work source |
| `notification-intelligence` | notification-only actionable signal | mapped to source-governed urgency | `do-now` or `watch` as published |
| `acknowledgment` | acknowledgment required | `now` | `do-now` |
| `session-state` | queued/pending local continuation | contextual | does not override stronger source-driven urgency |
| `module` | module-defined non-notification work signal | source-governed | `do-now` or `watch` as published |

### 3.5 Lane Invariants

- Every work item belongs to exactly one canonical lane.
- Users may not create custom lanes.
- Projection modes do not add new lanes.
- The urgent experience must remain task-first: `do-now` and `waiting-blocked` lead; `watch` remains visible but lower.

---

## 4. Source Trust and Weight Policy

Source trust governs both ranking contribution and deduplication survival when multiple channels describe the same responsibility.

### 4.1 Canonical Source Weight Table

| Source | Weight | Trust Class | Deduplication Priority | Rationale |
|---|---|---|---|---|
| `bic-next-move` | 1.0 | Direct work | Highest | Direct personal ownership |
| `workflow-handoff` | 0.8 | Direct work | High | Handoff/continuation responsibility |
| `acknowledgment` | 0.7 | Direct work | High | Direct acknowledgment-required responsibility |
| `notification-intelligence` | 0.5 | Notification signal | Medium | Alerting layer, not automatically the primary record |
| `session-state` | 0.4 | Continuation/session signal | Medium-low | Useful for continuity, not primary authority |
| `module` | 0.3 | Supplementary module-defined signal | Low | Supplemental unless module publishes a stronger direct-work record |

### 4.2 Trust Hierarchy Rules

- Direct work signals outrank notification-only signals for the same underlying responsibility.
- A notification MUST NOT outrank a real owned/handoff/acknowledgment work item simply because it was updated more recently.
- Session-state continuity signals may help preserve user flow, but do not become the highest-trust responsibility source.
- A module may publish a direct-work item, but if it also publishes a notification about the same record, the responsibility-bearing item survives deduplication.

### 4.3 Deduplication Doctrine

When the same record produces items through multiple channels:

1. The highest-trust responsibility-bearing source survives.
2. The lower-trust sources merge into `sourceMeta`.
3. Recency breaks ties only after responsibility class and source weight have been evaluated.
4. Canonical deduplication key format remains source-independent, for example:
   - `{moduleKey}::{recordType}::{recordId}`

### 4.4 Current-State Reconciliation

Any policy text or implementation artifact using `notification` instead of `notification-intelligence` is out of alignment and must be corrected.

---

## 5. Time-Horizon Cues

Time-horizon cues are visual overlay annotations applied within lanes to help users gauge temporal urgency. They are presentation-layer cues — not new lanes and not user-created groupings.

### 5.1 Cue Set

| Cue | Criteria | Visual Intent |
|---|---|---|
| **Overdue** | `isOverdue === true` | Highest urgency |
| **Today** | Due today, or explicitly pinned for today | Immediate attention |
| **This week** | Due within the current calendar week, explicitly pinned for this week, or elevated by qualifying recent material activity | Near-term attention |
| **Later** | Not overdue, not today, not this week | Lower temporal urgency |

### 5.2 Cue Application Rules

- Cues are applied after ranking and lane assignment.
- Cues do not create lanes.
- `Overdue` always takes precedence over any other cue.
- `pin-week` contributes to the `this week` cue, but does not by itself force `do-now`.
- Recent activity may contribute to a `this week` cue, but it is a weaker basis than a due date or user pin.
- Items without due dates may still receive `this week` if there has been qualifying recent material activity.
- The cue system must remain calm and legible; it is there to explain temporal posture, not to create competing sorting systems.

### 5.3 Cue Invariants

- Cues MUST NOT be mistaken for new lanes.
- Cues MUST NOT override ranking order within a lane.
- Users MUST NOT manually invent new cue families in first release.
- `watch` items should still visibly indicate `this week` vs `later` so lower-priority work remains scannable without mixing into urgent work.

---

## 6. User-Driven Ranking Overrides and Lane Movement

Users may take governed feed actions that affect lane placement or score. These are the only approved user-driven modifications to ranking behavior.

### 6.1 Approved User Actions

| Action | Lane Effect | Ranking Effect | Persistence |
|---|---|---|---|
| `defer` | Moves item to `deferred` | Removed from active urgent/watch ranking | Persists until `undefer` |
| `undefer` | Returns item to source-driven lane | Re-scored using current factors | Immediate |
| `pin-today` | May elevate to `do-now` | Adds `pin-today` attention boost | Expires at end of day unless otherwise governed |
| `pin-week` | No automatic lane jump | Adds `pin-week` near-term boost | Expires at end of week unless otherwise governed |
| `waiting-on` | Moves item to `waiting-blocked` | Adds dependency-impact context | Persists until cleared |
| `mark-read` | No lane change | Removes unread freshness contribution | Persistent |
| `mark-unread` | No lane change | Re-enables unread freshness behavior | Persistent |
| `dismiss` / `acknowledge` | Source-governed | Removes or resolves source-specific attention where supported | Source-governed |
| `delegate` / `reassign` | Source-governed | Item re-evaluates under new owner/context when supported | Source-governed and capability-gated |

### 6.2 Override Rules

- User actions do not bypass deterministic ranking.
- `pin-today` raises attention strongly but does not guarantee top position over more severe overdue work.
- `pin-week` raises attention, but MUST NOT force `do-now`.
- `defer` is the only standard action that fully removes an item from active urgent/watch ranking.
- Delegation/reassignment is governed by source capability and user entitlement; it is not a universal hub-native right.
- If delegation/reassignment is unsupported by the source, the item may deep-link to the source workflow rather than performing the action inline.

### 6.3 Action Invariants

- No manual drag/drop reordering in the primary ranked experience.
- No hidden scoring side effects beyond the approved action model.
- No action may silently create a fifth visible lane or sub-lane.

---

## 7. Role Context, Team Views, and Blend Mode

### 7.1 Uniform Core Algorithm

The same ranking model applies across roles and modes:

- standard users,
- elevated users,
- personal view,
- team/delegated projection views,
- and blend mode.

No role-specific scoring coefficients are allowed.

### 7.2 Personal-First Default

The default home posture remains personal-first:

- direct personal work is the default ranked experience,
- delegated/team work is not a standing main lane,
- and team/delegated visibility appears only through governed projection behavior.

### 7.3 Blend Mode Policy

When an eligible user intentionally turns on blend mode:

- personal work and delegated/team work appear in **one combined ranked list**,
- the list still uses the same deterministic algorithm,
- and the UI MUST maintain a clear distinction between:
  - **your direct work**
  - **delegated/team work**

This distinction may be rendered through badges, chips, ownership labels, group markers, or equivalent governed cues.

### 7.4 Blend Mode Rules

- Blend mode is intentional and user-selected.
- Blend mode does not create a fifth lane.
- Delegated/team items in blend mode are still part of the manager’s broader responsibility, but they generally imply less direct immediate action than purely personal work.
- The policy does **not** impose a blanket delegation penalty or blanket promotion in scoring. Urgency, due dates, blocking, direct source trust, and user intent still drive ranking.
- The distinction between direct work and delegated/team work is primarily a visibility/explainability requirement, not a separate ranking algorithm.

### 7.5 Team Counts and Escalation Classifications

Team-feed classifications such as aging and escalation candidates remain governed first-release concepts, but they must not be described as fully implemented repo truth until the shared package actually computes them.

Policy requirements:

- `agingCount` and `escalationCandidateCount` must remain classification outputs, not hidden ranking overrides.
- Managers should be able to identify aging and escalation candidates without introducing a separate ranking engine.
- These counts may be aggregated post-ranking and displayed as oversight signals.

---

## 8. Aging, Freshness, and Activity Attention

### 8.1 Unread Freshness

Unread items receive a freshness bonus that decays over time as defined in §1.

### 8.2 Recent Material Activity

Recent material activity provides a moderate attention boost:

- enough to surface meaningful fresh change,
- not enough to outrank stronger due-date or overdue signals by default,
- and weaker than explicit user pinning.

This is deliberately narrower than “any recent update.” Activity must be meaningful enough to alter attention posture.

### 8.3 Aging Thresholds

Items that remain unactioned beyond expected resolution time may qualify for aging or escalation classification:

| Threshold | Classification Effect |
|---|---|
| > 3 days in `do-now` without meaningful action | Eligible for aging classification |
| > 7 days in `do-now` without meaningful action | Eligible for escalation candidacy |
| > 14 days overdue | High-severity overdue classification |

### 8.4 Aging Invariants

- Aging thresholds inform classification and oversight visibility.
- Aging thresholds MUST NOT silently modify ranking coefficients unless explicitly approved in a future revision.
- Staleness trust behavior beyond these attention rules belongs to P2-B3.

---

## 9. Presentation-Layer Ordering Doctrine

P2-A2 governs ranking, but it also locks one critical presentation consequence of that ranking so the hub remains task-first.

### 9.1 Urgent vs Lower-Priority Separation

- Higher-attention work should remain visually foremost.
- Lower-priority/watch work MUST remain visible.
- Lower-priority/watch work should appear in a **separate lower section** rather than being mixed indistinguishably into the urgent list.
- Lower-priority/watch work MUST NOT be hidden by default behind filters or secondary navigation.

### 9.2 Presentation Invariants

- The main urgent experience remains calm and scannable.
- Watch work remains accessible without competing visually with urgent work.
- Blend mode may still use one combined ranked list, but the UI must preserve visual cues for urgency, ownership type, and responsibility posture.

---

## 10. Ranking Invariants

The following invariants are locked. Violations require Experience-lead exception approval with Architecture review.

| Invariant | Rule |
|---|---|
| **Deterministic** | Same inputs always produce the same ordering |
| **Explainable** | Every item carries `rankingReason` with primary reason, contributing reasons, and score |
| **Single algorithm** | One core algorithm across lanes, roles, and governed surfaces |
| **No separate delegation lane** | Team/delegated visibility is projection behavior, not a standing fifth lane |
| **Direct work outranks notifications** | Responsibility-bearing work signals beat notification-only signals for the same underlying responsibility |
| **No domain favoritism** | No domain-specific scoring privileges |
| **No manual ordering** | Users cannot drag-sort the primary ranked experience |
| **This-week is not do-now by default** | `pin-week` and near-term activity may raise visibility, but do not automatically create `do-now` membership |
| **Recent activity is moderate** | Recent material activity matters, but does not overpower due dates, overdue status, or explicit user intent |
| **Watch remains visible** | Lower-priority/watch work remains visible in a lower section, not hidden by default |
| **Cross-surface consistency** | PWA full feed, launcher/panel views, and SPFx companion views must consume the same underlying ranking order where the same items are shown |

---

## 11. Acceptance Gate Reference

P2-A2 contributes evidence to the Work-surface gate and target-state reconciliation gate.

| Field | Value |
|---|---|
| **Gate** | Work-surface gate |
| **Pass condition** | Ranking remains task-first, responsibility-first, and aligned with the refined P2-A1 operating model |
| **Primary owner** | Product/Design + Experience |
| **Required evidence** | Source enum alignment, direct-work-over-notification precedence, no visible delegated-team primary lane, `pin-week` non-`do-now` behavior, blend-mode distinction cues, visible lower-priority section, deterministic ranking tests |

### 11.1 Minimum Acceptance Evidence

The tightened P2-A2 policy is not considered fully implemented until all of the following are true:

1. Current source naming aligns with the canonical source enum.
2. Direct work wins over notification-only signals for the same responsibility in dedupe and ranking tie cases.
3. No first-release primary surface exposes `delegated-team` as a standing canonical lane.
4. Blend mode can show one combined list with clear distinction between direct work and delegated/team work.
5. `pin-week` raises ordering without automatically moving items into `do-now`.
6. Watch/lower-priority work remains visible in a separate lower section.
7. Recent material activity gives a moderate boost without overpowering due dates or explicit pins.
8. Deterministic ranking and tie-break behavior are covered by automated tests.

---

## 12. Locked Decisions

The following decisions are locked for first release and govern this policy:

| Decision | Locked Resolution | P2-A2 Consequence |
|---|---|---|
| Team/delegated posture | Not a standing main lane; separate by default; blendable by user choice | No fifth canonical lane in target-state policy |
| Blend-mode rendering | One combined ranked list with clear distinction between direct and delegated/team work | Single ranked experience with ownership cues |
| Pin-week behavior | Raises attention, but not automatic `do-now` | Ranking boost, not lane jump |
| Source trust | Real work items outrank notification-only signals | Direct-work trust hierarchy in dedupe and tie-breaking |
| Lower-priority work | Visible in separate lower section | Watch work stays visible but does not crowd urgent work |
| Recent activity | Moderate boost only | Activity matters, but not more than due dates or explicit user intent |

---

## 13. Policy Precedence

| Deliverable | Relationship to P2-A2 |
|---|---|
| **P2-A1** — Operating Model Register | P2-A2 must remain consistent with the tightened first-release operating model and may not create new standing primary lanes |
| **P2-A3** — Explainability and Visibility Rules | P2-A3 governs how the ranking reasons and responsibility distinctions are displayed |
| **P2-B0** — Lane Ownership and Coexistence Rules | P2-A2 supports cross-surface ranking consistency without allowing SPFx to invent its own alternate ranking logic |
| **P2-B3** — Freshness, Refresh, and Staleness Trust Policy | P2-B3 governs broader trust-state semantics beyond the ranking/cue rules locked here |
| **P2-D2 / P2-D5** — Zone Governance / Personalization | Must respect urgent-vs-watch ordering, protected primary behavior, and no hidden lane drift |

If a downstream deliverable conflicts with this policy on ranking, source trust, lane logic, or blend-mode semantics, this policy takes precedence.

---

**Last Updated:** 2026-03-20  
**Governing Authority:** [Phase 2 Plan §10.1, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
