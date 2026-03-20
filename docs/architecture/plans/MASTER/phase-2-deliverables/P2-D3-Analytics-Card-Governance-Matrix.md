# P2-D3: Analytics Card Governance Matrix

| Field | Value |
|---|---|
| **Doc ID** | P2-D3 |
| **Phase** | Phase 2 |
| **Workstream** | D — Role Governance, Analytics Expansion, and Personalization |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell + Product |
| **Update Authority** | Experience lead; changes require review by Product and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §8, §10.4, §14, §16, §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-D1 §6](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-A1 §1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md); [leadership-visibility-model §3](../../../reference/work-hub/leadership-visibility-model.md); `@hbc/project-canvas`; `@hbc/ui-kit` |

---

## Policy Statement

Analytics cards in the Personal Work Hub expand by role elevation — more senior roles see more cards, governed by `@hbc/auth` role definitions. This policy defines the first-release card catalog, maps each card to its role eligibility and zone placement, and establishes the personalization constraints that prevent the hub from becoming an unconstrained analytics dashboard. The primary zone (personal work runway) is invariant and protected; analytics cards occupy the secondary and tertiary zones only.

---

## Policy Scope

### This policy governs

- First-release card type catalog
- Per-card governance (role eligibility, zone, surface visibility, locked/configurable status)
- Zone placement rules for cards
- Complexity-tier display variants per card
- SPFx companion card rules
- Personalization constraints for card arrangement

### This policy does NOT govern

- Adaptive layout zone composition mechanics — see P2-D2
- Role-to-hub entitlement matrix (card set eligibility by role) — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Personalization saved-view persistence — see P2-D5
- Ranking and scoring within cards — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)
- Final per-role card inventory for every auth role — deferred beyond first release (Phase 2 §17)

---

## Definitions

| Term | Meaning |
|---|---|
| **Analytics card** | A secondary or tertiary zone component that presents aggregated, summarized, or role-aware data (not a primary-zone work item) |
| **Card category** | A grouping of related card types: personal analytics, team portfolio, admin oversight, or utility |
| **Card governance** | The set of rules determining who sees a card, where it appears, and whether users can configure it |
| **Locked card** | A card that is always visible for its eligible role and cannot be removed by personalization |
| **Configurable card** | A card that users can show, hide, reorder, or resize within governed limits |

---

## 1. Card Type Catalog

The first-release card inventory is organized by category. This is the minimum viable set — expansion beyond first release is a carry-forward item (Phase 2 §17).

### 1.1 Personal Analytics Cards (All Roles)

| Card ID | Card Name | Data Source | Purpose |
|---|---|---|---|
| `pa-source-breakdown` | Source Module Breakdown | `IMyWorkFeedResult` counts by `sourceModule` | Shows work distribution across domains (Provisioning, Estimating, BD, etc.) |
| `pa-lane-summary` | Lane Summary | `IMyWorkCounts` (`nowCount`, `blockedCount`, `waitingCount`, `deferredCount`) | Shows work distribution across responsibility lanes |
| `pa-aging-indicator` | Aging Items | Feed items in `do-now` > 3 days | Highlights items that may need attention escalation |
| `pa-recent-activity` | Recent Activity | Items sorted by `updatedAtIso` descending | Shows what changed recently |

### 1.2 Team Portfolio Cards (Executive Only)

| Card ID | Card Name | Data Source | Purpose |
|---|---|---|---|
| `tp-team-workload` | Team Workload | `IMyWorkTeamFeedResult.totalCount` | Total active items across direct reports |
| `tp-aging-items` | Team Aging Items | `IMyWorkTeamFeedResult.agingCount` | Items exceeding expected resolution time across team |
| `tp-blocked-items` | Team Blocked Items | `IMyWorkTeamFeedResult.blockedCount` | Items requiring intervention or escalation |
| `tp-escalation-candidates` | Escalation Candidates | `IMyWorkTeamFeedResult.escalationCandidateCount` | Items flagged by ranking algorithm for leadership attention |

### 1.3 Admin Oversight Cards (Administrator Only)

| Card ID | Card Name | Data Source | Purpose |
|---|---|---|---|
| `ao-provisioning-health` | Provisioning Health | Provisioning BIC items in failed/blocked state | Shows provisioning failure and escalation status |

### 1.4 Utility Cards (All Roles)

| Card ID | Card Name | Data Source | Purpose |
|---|---|---|---|
| `ut-quick-actions` | Quick Actions | Role-eligible action shortcuts | Common actions: new request, recent projects, search |
| `ut-recent-context` | Recent Context | Recent items and navigation history | Quick return to recently viewed items |

---

## 2. Card Governance Matrix

| Card ID | Category | Role Eligibility | Zone | PWA | SPFx | Locked? | Configurable? | Complexity Variants |
|---|---|---|---|---|---|---|---|---|
| `pa-source-breakdown` | Personal Analytics | All | Secondary | ✅ | ✅ (simplified) | No | Reorder, resize, hide | E: count only / S: bar chart / X: detailed breakdown |
| `pa-lane-summary` | Personal Analytics | All | Secondary | ✅ | ✅ (counts only) | Yes (default visible) | Reorder, resize | E: 4 counts / S: visual chart / X: + trend |
| `pa-aging-indicator` | Personal Analytics | All | Secondary | ✅ | ❌ | No | Show/hide, reorder | E: count / S: item list / X: + reasons |
| `pa-recent-activity` | Personal Analytics | All | Tertiary | ✅ | ❌ | No | Show/hide, reorder | E: 3 items / S: 5 items / X: 10 items |
| `tp-team-workload` | Team Portfolio | Executive | Secondary | ✅ | ✅ (count only) | Yes (when in team mode) | Reorder, resize | E: total count / S: per-member / X: + source breakdown |
| `tp-aging-items` | Team Portfolio | Executive | Secondary | ✅ | ❌ | No | Show/hide, reorder | E: count / S: item list / X: + owner + age |
| `tp-blocked-items` | Team Portfolio | Executive | Secondary | ✅ | ❌ | No | Show/hide, reorder | E: count / S: item list / X: + blocker detail |
| `tp-escalation-candidates` | Team Portfolio | Executive | Secondary | ✅ | ❌ | No | Show/hide, reorder | E: count / S: item list / X: + ranking reason |
| `ao-provisioning-health` | Admin Oversight | Administrator | Secondary | ✅ | ❌ | No | Show/hide, reorder | E: count / S: failure list / X: + saga detail |
| `ut-quick-actions` | Utility | All | Tertiary | ✅ | ❌ | Yes (always visible) | Reorder only | Same across tiers |
| `ut-recent-context` | Utility | All | Tertiary | ✅ | ❌ | No | Show/hide, reorder | E: 3 items / S: 5 items / X: 8 items |

---

## 3. Zone Placement Rules

Per [P2-A1 §1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (Invariant Operating Rules):

| Zone | Content | Card Placement |
|---|---|---|
| **Primary** | Personal work runway — prioritized items, next moves, waiting/blocked, critical signals | **No analytics cards.** The primary zone is the invariant task-first operating region |
| **Secondary** | Analytics, exceptions, oversight, and role-aware visibility expansions | Personal analytics, team portfolio, and admin oversight cards |
| **Tertiary** | Quick actions, recent context, pinned tools, and lightweight utility components | Utility cards |

### Zone Placement Invariants

- Analytics cards MUST NOT appear in the primary zone. The primary zone is reserved for the personal work runway.
- Locked cards appear in their designated zone by default for eligible roles; users cannot remove them.
- Configurable cards can be shown, hidden, or reordered within their zone — they cannot move between zones.
- The secondary zone is the analytics zone — all analytics cards (personal, team, admin) live here.
- The tertiary zone is the utility zone — quick actions and recent context live here.

---

## 4. Role-Based Card Eligibility

Consolidated from [P2-D1 §6](P2-D1-Role-to-Hub-Entitlement-Matrix.md):

| Card Category | Administrator | Executive | Member |
|---|---|---|---|
| Personal analytics (4 cards) | ✅ All | ✅ All | ✅ All |
| Team portfolio (4 cards) | Available (if also Executive) | ✅ All | ❌ None |
| Admin oversight (1 card) | ✅ | ❌ | ❌ |
| Utility (2 cards) | ✅ All | ✅ All | ✅ All |
| **Total first-release cards** | Up to 11 | Up to 10 | 6 |

### Eligibility Invariants

- Card eligibility is checked at render time against `resolvedRoles` from `@hbc/auth`.
- Users MUST NOT see cards outside their role eligibility — the card registry rejects ineligible cards.
- Multi-role users get the union of their eligible card sets (P2-D1 §10 — entitlements are additive).

---

## 5. Complexity-Tier Display

Complexity tiers from `@hbc/complexity` affect card display density, not card availability:

| Tier | Effect on Cards |
|---|---|
| **Essential** | Minimal display: counts only, 3-item lists, no charts |
| **Standard** | Standard display: bar charts, 5-item lists, visual indicators |
| **Expert** | Full display: detailed breakdowns, 8–10 item lists, ranking reasons, per-source detail |

### Tier Rules

- Complexity tiers are **user-preference-driven**, not role-gated (per P2-D1 §7).
- All three tiers are available to all roles.
- Cards MUST provide tier-appropriate variants. A card that only has an Expert view is not acceptable for Essential users.
- The governance matrix (§2) specifies tier variants per card (E/S/X columns).

---

## 6. SPFx Companion Card Rules

Per [P2-B0 First-Release Lane Doctrine](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

### 6.1 SPFx Card Scope

| Rule | Specification |
|---|---|
| **Composition model** | Curated composition only — no adaptive canvas, no freeform arrangement |
| **Card selection** | Fixed set per role, determined by this governance matrix (§2 SPFx column) |
| **Visual subset** | SPFx shows a strict subset of what PWA shows — SPFx never shows more cards than PWA |
| **Complexity tier** | Simplified Essential-equivalent display on SPFx companion |

### 6.2 SPFx-Eligible Cards

Only cards marked ✅ in the SPFx column of the governance matrix (§2) appear on the SPFx companion:

| Card | SPFx Display |
|---|---|
| `pa-source-breakdown` | Simplified source count list |
| `pa-lane-summary` | Four lane counts |
| `tp-team-workload` | Team total count (Executive only) |

### 6.3 SPFx Card Invariants

- SPFx companion cards are read-only — no interactive filtering, no drill-down.
- SPFx cards use the same data as PWA cards — no separate data fetch.
- "Open in HB Intel" affordance available on each card to launch PWA for full interaction.

---

## 7. Personalization Constraints

Per [P2-A1 §1.3](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (Personalization Boundaries):

### 7.1 Allowed Personalization

| Action | Secondary Zone | Tertiary Zone |
|---|---|---|
| Reorder cards | ✅ Within zone | ✅ Within zone |
| Resize cards | ✅ Within governed limits | ✅ Within governed limits |
| Show/hide configurable cards | ✅ | ✅ |
| Choose from role-eligible card set | ✅ | ✅ |

### 7.2 Prohibited Personalization

| Action | Rule |
|---|---|
| Remove locked cards | ❌ Locked cards cannot be hidden |
| Move cards between zones | ❌ Cards are zone-bound |
| Add cards outside role eligibility | ❌ Card registry enforces entitlement |
| Replace primary zone with analytics | ❌ Primary zone is invariant |
| Create freeform analytics dashboards | ❌ Composition is governed, not freeform |

### 7.3 Personalization Persistence

Card arrangement preferences are persisted via `@hbc/session-state` draft storage (per P2-B2 pattern). Detailed saved-view rules are defined in P2-D5.

---

## 8. First-Release Minimum Viable Card Set

For pilot launch, the following cards MUST be implemented:

### Pilot-Required Cards

| Card ID | Rationale |
|---|---|
| `pa-lane-summary` | Core operating-layer metric — users need lane counts to understand workload |
| `pa-source-breakdown` | Source visibility — users need to see where work comes from |
| `tp-team-workload` | Executive pilot validation — team portfolio must be visible |
| `ut-quick-actions` | Utility baseline — quick actions are always expected |

### Pilot-Optional Cards

| Card ID | Rationale |
|---|---|
| `pa-aging-indicator` | Valuable but not essential for pilot launch |
| `pa-recent-activity` | Nice-to-have for pilot; validates recent context value |
| `tp-aging-items`, `tp-blocked-items`, `tp-escalation-candidates` | Executive depth — valuable but can follow pilot wave 1 |
| `ao-provisioning-health` | Admin-specific; can follow pilot wave 1 |
| `ut-recent-context` | Utility depth; can follow pilot wave 1 |

### Carry-Forward

Per Phase 2 §17: "final per-role permanent card inventory for every auth role" is a carry-forward item. The first-release set defined here is the minimum viable set; expansion happens post-pilot based on usage data and stakeholder feedback.

---

## 9. Acceptance Gate Reference

P2-D3 contributes evidence for the Personalization gate:

| Field | Value |
|---|---|
| **Gate** | Personalization gate |
| **Pass condition** | Personalization is useful but bounded; primary work runway remains protected |
| **P2-D3 evidence** | Card governance matrix (§2) confirms analytics in secondary/tertiary only; primary zone invariant; personalization constraints (§7) prevent freeform dashboards |
| **Primary owner** | Experience / Shell |

---

## 10. Locked Decisions

| Decision | Locked Resolution | P2-D3 Consequence |
|---|---|---|
| Analytics scope | **Expand by role elevation, governed by `@hbc/auth` role definitions** | Team portfolio cards are Executive-only; admin cards are Administrator-only; personal cards for all |
| Personalization | **Moderately governed** | Users can reorder/resize/show/hide within role-eligible sets; cannot break task-first model |
| Layout model | **Adaptive layout using `@hbc/project-canvas`, constrained by zone governance** | Cards use project-canvas tile registry for adaptive composition in PWA |
| SPFx posture | **Richer companion lane, not the full home** | SPFx gets curated card subset, not full analytics |

---

## 11. Policy Precedence

| Deliverable | Relationship to P2-D3 |
|---|---|
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D3 card eligibility must match P2-D1 §6 card set eligibility per role |
| **P2-A1** — Operating Model Register | P2-D3 zone placement respects P2-A1 invariants (primary zone protected) |
| **P2-D2** — Adaptive Layout and Zone Governance | P2-D2 defines the composition mechanics (project-canvas); P2-D3 defines what cards populate those zones |
| **P2-D5** — Personalization Policy | P2-D5 defines saved-view persistence and preference rules; P2-D3 defines what is personalizable |
| **P2-B0** — Lane Ownership | P2-D3 SPFx card rules conform to P2-B0 curated composition constraint |

If a downstream deliverable introduces card types that conflict with this governance matrix, this matrix takes precedence for card eligibility, zone placement, and SPFx visibility.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §8, §10.4](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
