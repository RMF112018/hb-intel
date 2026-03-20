# P2-D4: Delegated and Team Lane Governance Note

| Field | Value |
|---|---|
| **Doc ID** | P2-D4 |
| **Phase** | Phase 2 |
| **Workstream** | D — Role Governance, Analytics Expansion, and Personalization |
| **Document Type** | Note |
| **Owner** | Product + Experience / Shell |
| **Update Authority** | Product lead; changes require review by Experience lead |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §10.4, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-A1 §5](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-A3 §3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md); [leadership-visibility-model](../../../reference/work-hub/leadership-visibility-model.md); `projectFeed.ts`; `useMyWorkTeamFeed.ts` |

---

## Note Statement

Delegated and team visibility is a governed view projection within the existing Personal Work Hub — not a separate team dashboard. This note locks the guardrails that prevent team-mode expansion from undermining the personal-first operating model. Team modes use the same feed infrastructure, the same ranking algorithm, the same canonical item model, and the same zone structure as personal mode. The difference is who the items belong to, not how the hub works.

---

## Note Scope

### This note covers

- Team mode eligibility by role
- Delegated-team lane membership criteria
- Team feed projection and counting rules
- Visibility and action constraints for non-owner viewers
- Anti-dashboard-drift guardrails
- Primary zone protection in team mode
- SPFx team visibility constraints

### This note does NOT cover

- Role-to-hub entitlement matrix — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Explainability field visibility by team mode — see [P2-A3 §3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md)
- Team portfolio card definitions — see [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md)
- Personalization rules for team-mode views — see P2-D5
- Multi-role context switching — see P2-E1

---

## Definitions

| Term | Meaning |
|---|---|
| **Team mode** | A feed query projection (`personal`, `delegated-by-me`, `my-team`) that filters which items the user sees based on ownership relationships |
| **Delegated-team lane** | The responsibility lane (`delegated-team`) assigned to items where `delegatedTo` or `delegatedBy` is present |
| **Delegation** | The act of assigning a work item to another user, creating a `delegatedTo`/`delegatedBy` relationship |
| **Team feed projection** | A filtered view of the feed showing items owned by the user's team members, with portfolio-level counts |
| **Read-only visibility** | The ability to see an item and its explainability data without the ability to perform feed mutations or domain actions |

---

## 1. Team Mode Eligibility

Per [P2-D1 §4](P2-D1-Role-to-Hub-Entitlement-Matrix.md):

| Team Mode | Eligibility | Default For | Gating |
|---|---|---|---|
| `personal` | All roles | `Member` | Always available |
| `delegated-by-me` | All roles with active delegations | None (toggle) | Data-gated: available only when user has delegated items |
| `my-team` | `Executive` role only | `Executive` | Role-gated: requires `resolvedRoles.includes('Executive')` |

### Eligibility Rules

- `my-team` is the only role-gated team mode. No other role may access team-mode visibility.
- `delegated-by-me` is data-gated, not role-gated — any user who has delegated work can see items they delegated, regardless of role.
- Team mode eligibility is checked against `resolvedRoles` from `@hbc/auth` — no parallel role logic.
- If an Executive user's role is revoked, `my-team` access is removed on the next session. The persisted team-mode draft (P2-B2) is validated against current role on restore.

---

## 2. Delegated-Team Lane Membership

The `delegated-team` lane is a responsibility lane within the existing 5-lane model.

**Reference implementation:** `packages/my-work-feed/src/normalization/projectFeed.ts::assignLane()`

### Lane Assignment Decision

The `delegated-team` lane is assigned when:
- `item.delegatedTo` is present, OR
- `item.delegatedBy` is present

And the item does not match a higher-priority lane rule:
- Blocked/waiting items go to `waiting-blocked` first (priority 1)
- `now`-priority active items go to `do-now` first (priority 2)
- Deferred items go to `deferred` first (priority 3)
- Delegated items go to `delegated-team` (priority 4)
- Default is `watch` (priority 5)

### Lane Membership Rules

- A blocked delegated item lands in `waiting-blocked`, not `delegated-team` — blocked status takes absolute precedence.
- A `now`-priority delegated item lands in `do-now`, not `delegated-team` — urgency takes precedence for the item owner.
- The `delegated-team` lane is visible only when the user is viewing `delegated-by-me` or `my-team` mode. In `personal` mode, the user sees only items they own directly.
- Delegated items retain the same `IMyWorkItem` model — no separate item type for delegated work.

---

## 3. Team Feed Projection Rules

**Reference implementation:** `packages/my-work-feed/src/hooks/useMyWorkTeamFeed.ts::projectTeamFeed()`

### Projection by Mode

| Mode | Filter Logic | Items Shown |
|---|---|---|
| `delegated-by-me` | `items.filter(i => !!i.delegatedTo)` | Items the current user delegated to others |
| `my-team` | `items.filter(i => !!i.delegatedBy \|\| !!i.delegatedTo)` | Items owned by the user's direct reports (all delegated items visible) |
| `escalation-candidate` | Items matching escalation criteria | Subset flagged by ranking algorithm |

### Portfolio Counts

`IMyWorkTeamFeedResult` provides aggregated counts for team-mode views:

| Count | Meaning | Computed From |
|---|---|---|
| `totalCount` | Total items across the team view | `filteredItems.length` |
| `agingCount` | Items in `do-now` > 3 days without action | Per P2-A2 §8.2 aging thresholds |
| `blockedCount` | Items with `isBlocked: true` or `state === 'blocked'` | Item state |
| `escalationCandidateCount` | Items flagged for leadership attention | Escalation criteria (blocked + age, overdue + no action) |

### Projection Invariants

- Team feed projections use the **same ranking algorithm** as personal feed (P2-A2 §7.1 — uniform algorithm).
- Team feed projections use the **same source adapters** and aggregation pipeline — no separate team-only data path.
- All `IMyWorkItem` fields are present on team items — the model is identical.

---

## 4. Visibility and Action Constraints

### 4.1 Read-Only Default for Non-Owners

Per [P2-A3 §3](P2-A3-Work-Item-Explainability-and-Visibility-Rules.md) and [P2-D1 §2](P2-D1-Role-to-Hub-Entitlement-Matrix.md):

| Capability | Item Owner (Personal Mode) | Delegator (Delegated-By-Me Mode) | Manager (My-Team Mode) |
|---|---|---|---|
| See item in feed | ✅ | ✅ | ✅ |
| See ranking reason | ✅ Full | ✅ Full | ✅ `primaryReason` + `contributingReasons` |
| See lifecycle labels | ✅ | ✅ | ✅ |
| See permission state | ✅ | Read-only | Read-only |
| Feed mutations (mark-read, defer, pin) | ✅ if `canAct: true` | ❌ Read-only | ❌ Read-only |
| Navigate to source surface ("Open") | ✅ if `canOpen: true` | ✅ if `canOpen: true` | ✅ if `canOpen: true` |
| Domain mutations (at source) | Per domain permissions | Per domain permissions | Per domain permissions |

### 4.2 Action Constraint Rules

- **Delegators cannot act on delegated items.** The delegatee owns the action — the delegator has read-only visibility.
- **Managers cannot act on team items** unless they are also the item owner. `canAct` is determined by ownership, not by managerial relationship.
- **Navigation is always permitted** when `canOpen: true` — managers and delegators can click "Open" to view the source surface. Whether they can act at the source surface depends on the domain's own permission model.
- The numeric `score` from `rankingReason` remains internal-only regardless of team mode (P2-A3 §2.3).

---

## 5. No-Separate-Dashboard Guardrail

The central constraint of P2-D4: team visibility is a projection, not a separate product.

### 5.1 Anti-Dashboard-Drift Rules

| Rule | Specification |
|---|---|
| **Same hub structure** | Team mode uses the same primary/secondary/tertiary zone model as personal mode |
| **Same ranking algorithm** | Team items are ranked by the same scoring model — no "manager priority" overlay |
| **Same item model** | `IMyWorkItem` is identical for personal, delegated, and team items — no team-specific item types |
| **Same feed infrastructure** | Team feed is a projection over the same aggregation pipeline — no separate data source |
| **No team-only routes** | No `/my-team` or `/leadership-dashboard` route — team mode is a toggle within `/my-work` |
| **No team-only card types** | Team portfolio cards (P2-D3) are secondary-zone cards composed from `@hbc/ui-kit` primitives — no separate leadership component library |

### 5.2 What Differs in Team Mode

Only these aspects differ when an Executive user views team mode:

| Aspect | Personal Mode | Team Mode |
|---|---|---|
| Feed filter | Items user owns | Items user's direct reports own |
| Default team-mode toggle | `personal` selected | `my-team` selected |
| Secondary zone cards | Personal analytics | Team portfolio cards (P2-D3) |
| Portfolio counts | N/A | `totalCount`, `agingCount`, `blockedCount`, `escalationCandidateCount` |
| Action availability | Full (if owner) | Read-only (unless also owner) |

Everything else — primary zone structure, ranking, lane model, responsibil​ity-lane ordering, freshness indicators, return memory, deep-link behavior — is identical.

---

## 6. Primary Zone Protection

Per [P2-A1 §1.2](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (Hub Stability Invariants):

| Rule | Effect in Team Mode |
|---|---|
| **Primary zone is protected** | Team mode does not replace or modify the primary zone — it shows team items IN the primary zone using the same structure |
| **Task-first identity** | Team view remains task-first (what needs attention from my team) — not a summary/analytics board |
| **No redirect** | Team mode never redirects to a separate team surface |
| **Consistent counts** | Badge, panel, and feed counts are consistent within team mode — same computation rule as personal |

---

## 7. SPFx Team Visibility

Per [P2-D1 §8](P2-D1-Role-to-Hub-Entitlement-Matrix.md) and [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

| Capability | SPFx Companion |
|---|---|
| Team portfolio summary (Executive only) | ✅ Count-only summary card |
| Team item list | ❌ Not on SPFx — requires PWA for full team feed |
| Team actions | ❌ Read-only even on PWA; no actions on SPFx |
| "Open in HB Intel" to team view | ✅ Launches PWA `/my-work` with `my-team` mode |

### SPFx Invariants

- SPFx team visibility MUST NOT exceed PWA entitlements — same role check, same data subset.
- SPFx shows at most a team-workload count card — full team feed requires PWA.
- Cross-lane consistency rule 6 (P2-B0): delegated/team visibility entitlement rules are identical across surfaces.

---

## 8. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Delegated-visibility gate |
| **Pass condition** | Elevated-role hybrid landing works without turning into a second team dashboard |
| **Evidence required** | Delegated/team governance note (this document), role walkthroughs |
| **Primary owner** | Product + Experience |

### Gate Evidence

- Team mode is a feed projection, not a separate surface ✓
- Anti-dashboard-drift rules locked (§5) ✓
- Same hub structure, ranking, item model, and feed infrastructure in both modes ✓
- Read-only defaults for non-owners enforced ✓
- Primary zone protection confirmed ✓
- Role walkthroughs: pending (require implementation + UX review)

---

## 9. Locked Decisions

| Decision | Locked Resolution | P2-D4 Consequence |
|---|---|---|
| Delegated/team lanes | **Limited and only for eligible elevated roles** | `my-team` restricted to Executive; no general team-mode access |
| Elevated-role landing | **Hybrid — personal work first, then team / delegated / portfolio attention** | Executive lands in team mode but personal is one toggle away |
| Multi-role governance source | **`@hbc/auth` role definitions** | Team mode eligibility uses `resolvedRoles` only |

---

## 10. Note Precedence

| Deliverable | Relationship to P2-D4 |
|---|---|
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D4 implements the team-mode eligibility and action constraints from P2-D1 |
| **P2-A1** — Operating Model Register | P2-D4 respects the hub stability invariants and visibility model from P2-A1 §5 |
| **P2-A3** — Explainability Rules | P2-D4 confirms the per-team-mode visibility rules from P2-A3 §3 |
| **P2-D3** — Analytics Card Governance | P2-D3 defines the team portfolio cards that appear in secondary zone during team mode |
| **P2-D5** — Personalization Policy | P2-D5 governs whether team-mode card arrangements are personalizable |
| **P2-E1** — Multi-Role Context Policy | P2-E1 defines how multi-role users switch between role contexts (affects team mode availability) |

If a downstream deliverable introduces team-mode behavior that creates a separate dashboard experience, this note's guardrails take precedence.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §10.4, §14](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
