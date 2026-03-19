# P2-A2: Ranking, Lane, and Time-Horizon Policy

| Field | Value |
|---|---|
| **Doc ID** | P2-A2 |
| **Phase** | Phase 2 |
| **Workstream** | A — Personal Work Hub Operating Model |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell + Platform / Core Services |
| **Update Authority** | Experience lead; changes require review by Platform lead and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-19 |
| **References** | [Phase 2 Plan §10.1, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [interaction-contract](../../../reference/work-hub/interaction-contract.md); [publication-model](../../../reference/work-hub/publication-model.md); `rankItems.ts`; `projectFeed.ts` |

---

## Policy Statement

Work-item ranking in the Personal Work Hub is deterministic, explainable, and uniform across all surfaces and roles. This policy locks the scoring model, tie-breaking chain, lane assignment logic, time-horizon cue rules, and user-driven ranking overrides as implementation-governing policy. Changes to scoring coefficients, tie-break order, or lane assignment criteria require Experience-lead approval with Platform and Architecture review.

---

## Policy Scope

### This policy governs

- Scoring factors, coefficients, and the additive scoring formula
- Tie-breaking rules and deterministic ordering
- Lane assignment decision logic
- Source weight values
- Time-horizon cue definitions and application rules
- User-driven lane movement (defer, pin, waiting-on) and scoring impact
- Role-context ranking uniformity
- Aging and freshness scoring thresholds

### This policy does NOT govern

- Responsibility-lane definitions and invariants — see [P2-A1 §2](P2-A1-Personal-Work-Hub-Operating-Model-Register.md)
- Work-item explainability display format — see P2-A3
- PWA/SPFx lane ownership and anti-drift — see [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md)
- Freshness thresholds and staleness trust policy — see P2-B3
- Zone layout and card governance — see P2-D2

---

## Definitions

| Term | Meaning |
|---|---|
| **Scoring factor** | A measurable attribute of a work item that contributes to its ranking score (e.g., overdue status, blocked status, unread freshness) |
| **Coefficient** | The numeric weight applied to a scoring factor. Coefficients are additive — each factor contributes independently to the total score |
| **Tie-breaking** | The deterministic multi-level comparison used to order items when their scores are equal |
| **Time-horizon cue** | A visual annotation overlaid on items within a lane indicating temporal urgency (today, this week, later). Cues are presentation-layer labels, not new lanes |
| **Pinning** | A user action (`pin-today`, `pin-week`) that temporarily elevates an item's priority and may change its lane assignment |
| **Deferral** | A user action (`defer`) that moves an item to the `deferred` lane until explicitly undeferred |
| **Aging threshold** | The number of days after which an unactioned item triggers attention escalation scoring |

---

## 1. Scoring Model

The ranking system uses **additive scoring** — each applicable factor contributes independently to the total score. Higher scores rank first.

**Reference implementation:** `packages/my-work-feed/src/normalization/rankItems.ts`

### 1.1 Scoring Factors and Coefficients

| # | Factor | Condition | Score Contribution | Primary Reason Label |
|---|---|---|---|---|
| 1 | **Overdue** | `isOverdue === true` and `dueDateIso` present | +1000 + min(daysOverdue × 10, 500) | "Overdue item" |
| 2 | **Approaching due** | `dueDateIso` present and not overdue | +max(0, 500 − daysToDue × 20) | "Has due date" |
| 3 | **Blocked BIC** | `isBlocked === true` and source is `bic-next-move` | +400 | "Blocked BIC item" |
| 4 | **Unacknowledged** | Class is `inbound-handoff` or `pending-approval`, and `isUnread === true` | +300 | "Unacknowledged" |
| 5 | **Unread freshness** | `isUnread === true` | +max(0, 200 − daysSinceUpdate × 10) | "Unread" |
| 6 | **Dependency impact** | `lifecycle.blockedDependencyLabel` is present | +150 | "Dependency impact" |
| 7 | **Project context** | `context.projectId` is present | +100 | "Project context" |
| 8 | **Source weight** | Always applied | +50 × sourceWeight | (contributing factor) |
| 9 | **Offline capable** | `offlineCapable === true` | +25 | "Offline capable" |

### 1.2 Scoring Behavior

- Factors are **cumulative** — an overdue, blocked BIC item with a project context scores 1000+ 400 + 100 + source weight contribution.
- The **primary reason** is the highest-impact applicable factor. If no specific factor applies, the first contributing reason becomes primary.
- All contributing factors are recorded in `rankingReason.contributingReasons` for explainability (see P2-A3).
- The numeric score is recorded in `rankingReason.score`.

### 1.3 Scoring Curves

**Overdue escalation curve:**
- Base: +1000 at day 0 overdue
- Scaling: +10 per additional day overdue
- Cap: +500 additional (at 50+ days overdue)
- Maximum overdue score: 1500

**Approaching-due curve:**
- Base: +500 when due date is today
- Decay: −20 per day until due date
- Floor: 0 (at 25+ days until due)
- Items with no due date receive +0 from this factor

**Unread freshness decay:**
- Base: +200 on the day of update
- Decay: −10 per day since last update
- Floor: 0 (at 20+ days since update)
- Only applies to unread items

---

## 2. Tie-Breaking Rules

When two items have equal scores, the following 5-level deterministic tie-break chain resolves ordering. Each level is applied in sequence; the first difference determines order.

**Reference implementation:** `packages/my-work-feed/src/normalization/rankItems.ts::tieBreakCompare()`

| Level | Criterion | Direction | Rationale |
|---|---|---|---|
| 1 | Overdue severity | Overdue items first; more days overdue first | Most urgent items surface first |
| 2 | Blocked status | Blocked items first | Blocked items need attention or escalation |
| 3 | Source weight | Higher weight first | BIC ownership items outrank notifications |
| 4 | Freshness | Most recently updated first (`updatedAtIso` descending) | Recent activity indicates active relevance |
| 5 | Canonical key | Lexicographic ascending (`canonicalKey`) | Stable, deterministic fallback |

### 2.1 Tie-Breaking Invariants

- Tie-breaking MUST be deterministic — the same inputs always produce the same order.
- Level 5 (canonical key) guarantees absolute determinism since keys are unique.
- No randomization, no user-controlled sort order within the primary zone.
- Tie-breaking applies uniformly across all lanes and team modes.

---

## 3. Lane Assignment Policy

Lane assignment determines which responsibility lane an item occupies. This is evaluated at feed computation time and may change when item state changes.

**Reference implementation:** `packages/my-work-feed/src/normalization/projectFeed.ts::assignLane()`

### 3.1 Lane Assignment Decision Table

The following decision table is evaluated **in order** — the first matching rule determines the lane:

| Priority | Condition | Assigned Lane |
|---|---|---|
| 1 | `isBlocked === true` OR `state === 'blocked'` OR `state === 'waiting'` | `waiting-blocked` |
| 2 | `priority === 'now'` AND (`state === 'active'` OR `state === 'new'`) | `do-now` |
| 3 | `priority === 'deferred'` OR `state === 'deferred'` | `deferred` |
| 4 | `delegatedTo` is present OR `delegatedBy` is present | `delegated-team` |
| 5 | (default — no other rule matched) | `watch` |

### 3.2 Lane Assignment Rules

- Lane assignment is **deterministic** — the same item state always produces the same lane.
- Blocked/waiting status takes **absolute precedence** over priority (rule 1 always wins).
- Items with `priority === 'now'` that are also blocked land in `waiting-blocked`, not `do-now`.
- Delegated items only use `delegated-team` when not blocked, not `now`-priority, and not deferred.
- The `watch` lane is the default catch-all for items that don't match specific criteria.

### 3.3 Source-to-Lane Mapping

Source adapters map their urgency/tier model to feed priority, which then determines lane assignment via the decision table above:

| Source | Source Urgency/Tier | Feed Priority | Resulting Lane |
|---|---|---|---|
| BIC adapter | `immediate` | `now` | `do-now` |
| BIC adapter | `watch` | `soon` | `watch` |
| BIC adapter | `upcoming` | `watch` | `watch` |
| BIC adapter | any, `isBlocked: true` | (original) | `waiting-blocked` |
| Notification adapter | `immediate` | `now` | `do-now` |
| Notification adapter | `watch` | `soon` | `watch` |
| Notification adapter | `digest` | `watch` | `watch` |
| Handoff adapter | age > 48h | `now` | `do-now` |
| Handoff adapter | age > 24h | `soon` | `do-now` (via pin escalation) |
| Handoff adapter | age ≤ 24h | `watch` | `watch` |

See [publication-model §6](../../../reference/work-hub/publication-model.md) for the complete priority mapping reference.

---

## 4. Source Weight Policy

Source weights determine how much the "source weight" scoring factor contributes and which item survives deduplication.

| Source | Weight | Deduplication Priority | Rationale |
|---|---|---|---|
| `bic-next-move` | 1.0 | Highest | BIC ownership represents direct personal responsibility |
| `workflow-handoff` | 0.8 | High | Inbound handoffs require acknowledgment |
| `notification` | 0.5 | Medium | Notifications are informational signals |
| `module` (other) | 0.3 | Low | Supplementary module-generated items |

### 4.1 Deduplication and Weight

When the same record produces items through multiple channels (e.g., a BIC item AND a notification), the **higher-weight** source survives. The lower-weight item's `sourceMeta` is merged into the survivor. Canonical deduplication key format: `{moduleKey}::{recordType}::{recordId}`.

See [publication-model §5](../../../reference/work-hub/publication-model.md) for deduplication key examples.

---

## 5. Time-Horizon Cues

Time-horizon cues are **visual overlay annotations** applied within lanes to help users gauge temporal urgency. They are presentation-layer labels — NOT new lanes, NOT new scoring factors, and NOT user-configurable groupings.

### 5.1 Time-Horizon Buckets

| Cue | Criteria | Visual Intent |
|---|---|---|
| **Today** | Item has `dueDateIso` within the current calendar day, OR item has `priority === 'now'` | Immediate urgency signal |
| **This week** | Item has `dueDateIso` within the current calendar week (Mon–Sun), OR item was updated within the last 3 days | Near-term attention |
| **Later** | Item has `dueDateIso` beyond the current calendar week, OR item has no due date and was last updated > 3 days ago | Lower temporal urgency |
| **Overdue** | Item has `isOverdue === true` | Critical — always displayed with highest urgency treatment |

### 5.2 Cue Application Rules

- Time-horizon cues are applied **after** ranking and lane assignment — they do not affect score or lane.
- Cues are displayed as subtle visual annotations (e.g., date badges, section headers within a lane) — not as lane separators.
- In the `do-now` lane, "Overdue" and "Today" cues provide urgency differentiation within an already-urgent lane.
- In the `watch` lane, "This week" and "Later" cues help users triage monitoring attention.
- In the `waiting-blocked` lane, cues help users prioritize which blockers to escalate first.
- In the `deferred` lane, cues are optional and informational only.

### 5.3 Cue Invariants

- Time-horizon cues MUST NOT create visual lane boundaries or sub-groupings that users mistake for separate lanes.
- Cues MUST NOT override ranking order — items within a cue are still ordered by score.
- Items without due dates receive cues based on `updatedAtIso` recency only.
- The "Overdue" cue takes precedence over all other cues for the same item.

---

## 6. User-Driven Lane Movement and Ranking Overrides

Users can take feed-mutation actions that affect lane assignment and ranking. These are the only approved user-driven modifications to the ranking system.

### 6.1 Approved User Actions

| Action | Lane Effect | Scoring Effect | Persistence |
|---|---|---|---|
| `defer` | Moves item to `deferred` lane | Item excluded from primary ranking; ranked within `deferred` by original score | Persists until `undefer` |
| `undefer` | Returns item to source-driven lane | Re-scored with current factors | Immediate |
| `pin-today` | Elevates to `do-now` lane if not already there | Sets priority to `now`; score recalculated with `now` priority | Expires at end of calendar day |
| `pin-week` | Elevates to `do-now` lane if not already there | Sets priority to `soon`; score recalculated | Expires at end of calendar week |
| `waiting-on` | Moves item to `waiting-blocked` lane | Sets state to `waiting` with dependency label; +150 dependency impact score | Persists until dependency cleared |
| `mark-read` | No lane change | Removes unread freshness score contribution (factor 5) | Permanent |

### 6.2 Override Rules

- User actions MUST NOT bypass the deterministic ranking within a lane — pinning elevates priority but does not guarantee position #1 (an overdue item still outranks a pinned item).
- `pin-today` and `pin-week` are **temporary** — they expire automatically and the item reverts to its source-driven priority.
- `defer` is the only action that completely removes an item from active ranking.
- Users MUST NOT manually reorder items within the primary zone. Ranking order is always algorithm-driven.

---

## 7. Role-Context Ranking

### 7.1 Uniform Algorithm

The ranking algorithm is **uniform across all roles and team modes**:

- Standard users and elevated users use the same scoring factors and coefficients.
- Personal feed (`teamMode: 'personal'`) and team feed (`teamMode: 'my-team'`) use the same ranking algorithm.
- No role-specific scoring adjustments, coefficient overrides, or custom tie-break rules.

### 7.2 Team-Mode Feed Ranking

When an elevated-role user views the team feed:

- Items are ranked by the same 8-factor model applied from the team member's perspective.
- The manager sees items ranked as the assignee would see them — urgency, blocking, and aging drive order.
- No "manager priority" overlay — managers see the same ranking their team members see.
- Team feed result counts (`agingCount`, `blockedCount`, `escalationCandidateCount`) are aggregated post-ranking. See [leadership-visibility-model](../../../reference/work-hub/leadership-visibility-model.md).

### 7.3 Delegated Item Ranking

Delegated items (`delegatedBy` / `delegatedTo` present) are ranked within the `delegated-team` lane using the same scoring model. No special coefficient adjustments for delegation status.

---

## 8. Aging and Freshness Scoring

### 8.1 Unread Freshness Decay

Unread items receive a freshness bonus that decays over time:

| Days Since Update | Freshness Score |
|---|---|
| 0 (same day) | +200 |
| 5 | +150 |
| 10 | +100 |
| 15 | +50 |
| 20+ | +0 (floor) |

This curve ensures recently updated unread items surface higher, while old unread items gradually lose their freshness advantage.

### 8.2 Aging Attention Thresholds

Items that remain unactioned in the `do-now` lane beyond expected resolution time are candidates for attention escalation:

| Aging Threshold | Effect |
|---|---|
| Item in `do-now` for > 3 days without action | Eligible for "aging" classification in team feed counts |
| Item in `do-now` for > 7 days without action | Eligible for escalation candidacy (`escalationCandidateCount`) |
| Overdue item aging > 14 days | Considered high-severity overdue; maximum overdue scoring applies |

### 8.3 Aging Invariants

- Aging thresholds inform team-mode counts and escalation candidacy — they do NOT modify the individual item's ranking score.
- Individual scoring is governed by the overdue and freshness factors in §1 — aging thresholds provide an additional classification layer.
- Stale-item handling (whether stale items should drop in ranking) is deferred to P2-B3 (Freshness, Refresh, and Staleness Trust Policy).

---

## 9. Ranking Invariants

The following invariants are locked. Violations require Experience-lead exception approval with Architecture review.

| Invariant | Rule |
|---|---|
| **Deterministic** | The same item set with the same state always produces the same ordering |
| **Explainable** | Every item carries `rankingReason` with primary reason, contributing reasons, and numeric score |
| **Single algorithm** | One ranking algorithm across all lanes, surfaces (PWA/SPFx), team modes, and roles. No separate ranking per lane (P2-B0 Anti-Drift Rule 2) |
| **No domain-specific scoring** | Scoring factors are domain-neutral. No "Estimating items always rank above Provisioning items" rules |
| **No user-controlled sort** | Users cannot manually reorder items in the primary zone. Ranking is always algorithm-driven |
| **Additive model** | Scoring uses additive factors. No multiplicative, exponential, or ML-based scoring in first release |
| **Consistent across surfaces** | PWA full feed, PWA panel, PWA tile, SPFx companion — all use the same ranked order |

---

## 10. Acceptance Gate Reference

P2-A2 contributes evidence for the Work-surface gate:

| Field | Value |
|---|---|
| **Gate** | Work-surface gate |
| **Pass condition** | Hub remains task-first and responsibility-first, not a generic dashboard |
| **P2-A2 evidence** | Scoring model locks task urgency as the primary ranking driver; responsibility lanes organize work by action state, not domain |
| **Primary owner** | Product/Design + Experience |

---

## 11. Locked Decisions

The following decisions from Phase 2 §16 are locked and directly govern ranking policy:

| Decision | Locked Resolution | P2-A2 Consequence |
|---|---|---|
| Work ranking | Weighted mix of ownership, urgency, aging, project importance, blocking status, and role context | All six factors are present in the scoring model (§1) |
| Top-level organization | Responsibility lanes first, with time-horizon cues layered inside | Lanes are structural (§3); time-horizon cues are overlays (§5) |

Phase 2 §17 carry-forward item resolved:
> "exact ranking-factor coefficients and tie-break implementation details" — **Resolved by this document (§1, §2)**

---

## 12. Policy Precedence

| Deliverable | Relationship to P2-A2 |
|---|---|
| **P2-A1** — Operating Model Register | P2-A2 operates within P2-A1's lane structure and invariants. P2-A2 MUST NOT introduce new lanes or override lane-membership rules |
| **P2-A3** — Explainability and Visibility Rules | P2-A3 defines how to display the `rankingReason` data that P2-A2's scoring model produces |
| **P2-B0** — Lane Ownership and Coexistence Rules | P2-A2 confirms uniform ranking across PWA and SPFx per P2-B0 Anti-Drift Rule 2 |
| **P2-B3** — Freshness, Refresh, and Staleness Trust Policy | P2-B3 may define additional stale-item scoring rules; those must be additive to the model defined here |
| **P2-D2** — Adaptive Layout and Zone Governance | P2-D2 must respect ranking order when rendering items within zones |

If a downstream deliverable conflicts with this policy, this policy takes precedence for scoring, tie-breaking, and lane assignment logic.

---

**Last Updated:** 2026-03-19
**Governing Authority:** [Phase 2 Plan §10.1, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
