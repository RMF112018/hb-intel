# P2-D5: Personalization Policy and Saved-View Rules

| Field | Value |
|---|---|
| **Doc ID** | P2-D5 |
| **Phase** | Phase 2 |
| **Workstream** | D — Role Governance, Analytics Expansion, and Personalization |
| **Document Type** | Governance Policy |
| **Owner** | Experience / Shell + Product |
| **Update Authority** | Experience lead; changes require review by Product and Architecture |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §8.2, §10.4, §14, §16](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-A1 §1.3](P2-A1-Personal-Work-Hub-Operating-Model-Register.md); [P2-D1 §9](P2-D1-Role-to-Hub-Entitlement-Matrix.md); [P2-D3 §7](P2-D3-Analytics-Card-Governance-Matrix.md); [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md); `@hbc/session-state` |

---

## Policy Statement

Personalization in the Personal Work Hub is moderately governed — useful for the user, but bounded to protect the task-first operating model. Users may adjust secondary and tertiary zone content within their role-eligible card set. They may not remove the primary zone, break the responsibility-first structure, or turn the hub into a freeform analytics dashboard. This policy consolidates all personalization rules and defines how user preferences are saved and restored.

---

## Policy Scope

### This policy governs

- What personalization actions are allowed and prohibited
- Per-zone personalization rules
- Card-level personalization (reorder, resize, show/hide, choose)
- Team mode and filter preference persistence
- Saved-view storage mechanism, TTLs, and cleanup
- SPFx personalization constraints
- First-release personalization scope

### This policy does NOT govern

- Card type catalog and governance matrix — see [P2-D3](P2-D3-Analytics-Card-Governance-Matrix.md)
- Role-to-hub entitlement matrix — see [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md)
- Adaptive layout zone composition mechanics — see P2-D2
- State persistence infrastructure — see [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md)
- Ranking or scoring — see [P2-A2](P2-A2-Ranking-Lane-and-Time-Horizon-Policy.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Personalization** | User-controlled adjustment of hub layout, card visibility, or view preferences within governed limits |
| **Saved view** | A persisted set of user preferences (card arrangement, team mode, filters) restored on return to the hub |
| **Locked card** | A card that is always visible for its eligible role; cannot be hidden by personalization |
| **Configurable card** | A card that users can show, hide, reorder, or resize within governed limits |
| **Governed limit** | A boundary on personalization that protects the task-first operating model — users may operate within the limit but not beyond it |

---

## 1. Personalization Doctrine

Per Phase 2 Plan §8.2 and §16 locked decision:

> **Personalization: Moderately governed.**

### Doctrine Principles

| Principle | Rule |
|---|---|
| **Task-first protection** | The personal work runway (primary zone) is the hub's identity. Personalization MUST NOT degrade it |
| **Useful flexibility** | Users should feel ownership of their hub — card arrangement and view preferences make the hub feel like *their* workspace |
| **Role-aware boundaries** | Users customize within their role-eligible card set. They cannot surface content they are not entitled to |
| **Governed, not freeform** | The hub is a task-first operating layer, not a configurable analytics dashboard. Composition is moderated |

---

## 2. Allowed Personalization

| Action | Where | Persistence | Available To |
|---|---|---|---|
| **Reorder cards** | Secondary and tertiary zones | Saved view | All roles |
| **Resize cards** | Secondary zone (within governed min/max) | Saved view | All roles |
| **Show/hide configurable cards** | Secondary and tertiary zones | Saved view | All roles |
| **Choose from role-eligible card set** | Secondary and tertiary zones | Saved view | All roles |
| **Toggle team mode** | Feed header | Session draft (P2-B2 §2) | All eligible (Executive for `my-team`) |
| **Apply feed filters** | Feed controls | Session draft (P2-B2 §4) | All roles |
| **Select complexity tier** | User preferences | User preference storage | All roles |

---

## 3. Prohibited Personalization

| Action | Rule | Enforcement |
|---|---|---|
| **Remove or displace the primary zone** | The personal work runway MUST always be visible and dominant | Layout engine rejects primary zone removal |
| **Break responsibility-first ordering** | Responsibility lanes (`do-now` first) MUST NOT be reordered by users | Ranking and lane order are algorithm-driven (P2-A2) |
| **Surface cards outside entitlement** | Users MUST NOT see cards their role does not permit | Card registry checks `resolvedRoles` |
| **Turn hub into freeform dashboard** | Users MUST NOT have unconstrained card/widget addition | Card set is governed; no "add any widget" capability |
| **Override ranking order** | Users MUST NOT manually sort items in the primary zone | Ranking is always algorithm-driven (P2-A2 §9) |
| **Create custom lanes** | Users MUST NOT add, remove, or rename responsibility lanes | Lanes are locked (P2-A1 §2.3) |

---

## 4. Saved-View Persistence

### 4.1 What Is Saved

| Preference | Draft Key | TTL | Auto-Save |
|---|---|---|---|
| **Card arrangement** (order, visibility, sizes) | `hbc-my-work-card-arrangement` | 30 days | Yes (500ms debounce) |
| **Team mode** | `hbc-my-work-team-mode` | 16 hours | Yes (300ms debounce) |
| **Feed filters** | `hbc-my-work-filter-state` | 8 hours | Yes (500ms debounce) |
| **Complexity tier** | `hbc-my-work-complexity-tier` | 30 days | Yes (immediate) |

### 4.2 Storage Layer

All saved-view preferences use `@hbc/session-state` IndexedDB draft storage via `useDraft()` and `useAutoSaveDraft()` hooks (per P2-B2 §9).

### 4.3 Card Arrangement Schema

```
IMyWorkCardArrangement {
  secondaryZone: ICardSlot[]     // Ordered list of visible secondary cards
  tertiaryZone: ICardSlot[]      // Ordered list of visible tertiary cards
  savedAt: string                // ISO timestamp
}

ICardSlot {
  cardId: string                 // From P2-D3 card catalog
  visible: boolean               // Show/hide state
  width?: 'narrow' | 'standard' | 'wide'  // Resize within governed limits
}
```

### 4.4 Restore Behavior

On return to `/my-work`:

| Condition | Behavior |
|---|---|
| Saved arrangement exists | Restore card order and visibility; validate card IDs against current role eligibility |
| Card in saved arrangement no longer eligible (role changed) | Remove ineligible card silently; show remaining |
| New card added to role-eligible set since last save | Add to end of zone with default visibility |
| No saved arrangement | Use role-based defaults from `@hbc/project-canvas` tile registry |
| Draft expired | Use role-based defaults |

### 4.5 Cleanup

| Trigger | What Is Cleared |
|---|---|
| **Logout** | All `hbc-my-work-*` drafts (per P2-B2 §8) |
| **Role change** | Card arrangement re-validated; ineligible cards removed |
| **TTL expiry** | Individual drafts per their TTL |
| **Explicit reset** | User "Reset to defaults" action clears card arrangement draft |

---

## 5. Personalization by Zone

| Zone | Personalizable? | What Users Can Do | What Is Locked |
|---|---|---|---|
| **Primary** | ❌ Invariant | Nothing — the primary zone is protected | Lane order, ranking order, item display |
| **Secondary** | ✅ Governed | Reorder cards, resize cards, show/hide configurable cards, choose from role set | Locked cards remain visible; zone cannot be emptied entirely |
| **Tertiary** | ✅ Governed | Reorder cards, show/hide configurable cards | Locked cards (e.g., `ut-quick-actions`) remain visible |

### Zone Invariants

- The primary zone MUST be the dominant visual element at all times — secondary/tertiary zones do not expand to replace it.
- At least one card must remain visible in the secondary zone (if any are eligible) — users cannot hide all analytics.
- Card order within a zone is user-controlled; card assignment to a zone is governance-controlled (P2-D3 §3).

---

## 6. Card Personalization Rules

Consolidated from [P2-D3 §7](P2-D3-Analytics-Card-Governance-Matrix.md):

### 6.1 Locked Cards (Cannot Be Hidden)

| Card ID | Zone | Reason |
|---|---|---|
| `pa-lane-summary` | Secondary | Core operating metric — always needed |
| `tp-team-workload` | Secondary (team mode) | Core team metric when in `my-team` mode |
| `ut-quick-actions` | Tertiary | Baseline utility — always expected |

### 6.2 Configurable Cards

All other cards in the P2-D3 catalog are configurable — users can show, hide, reorder, and resize them within their zone.

### 6.3 Personalization Matrix

| Card ID | Reorder | Resize | Show/Hide | Choose |
|---|---|---|---|---|
| `pa-source-breakdown` | ✅ | ✅ | ✅ | ✅ (from role set) |
| `pa-lane-summary` | ✅ | ✅ | ❌ (locked) | — |
| `pa-aging-indicator` | ✅ | — | ✅ | ✅ |
| `pa-recent-activity` | ✅ | — | ✅ | ✅ |
| `tp-team-workload` | ✅ | ✅ | ❌ (locked in team mode) | — |
| `tp-aging-items` | ✅ | — | ✅ | ✅ |
| `tp-blocked-items` | ✅ | — | ✅ | ✅ |
| `tp-escalation-candidates` | ✅ | — | ✅ | ✅ |
| `ao-provisioning-health` | ✅ | — | ✅ | ✅ |
| `ut-quick-actions` | ✅ | — | ❌ (locked) | — |
| `ut-recent-context` | ✅ | — | ✅ | ✅ |

---

## 7. Team Mode Preference

Per [P2-B2 §2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md):

| Aspect | Rule |
|---|---|
| **Draft key** | `hbc-my-work-team-mode` |
| **TTL** | 16 hours |
| **Saved value** | `{ teamMode: 'personal' | 'my-team' | 'delegated-by-me', savedAt: string }` |
| **Restore** | Validate against current `resolvedRoles`; fall back to role default if ineligible |
| **Default** | Executive → `my-team`; all others → `personal` |

---

## 8. Filter Preference

Per [P2-B2 §4](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md):

| Aspect | Rule |
|---|---|
| **Draft key** | `hbc-my-work-filter-state` |
| **TTL** | 8 hours |
| **Saved value** | Active `IMyWorkQuery` filter parameters (excluding `teamMode`) |
| **Restore** | Apply saved filters on return; no pre-validation of filter values |
| **Clear** | User "Clear filters" action deletes the draft |

---

## 9. SPFx Personalization Constraints

Per [P2-B0 First-Release Lane Doctrine](P2-B0-Lane-Ownership-and-Coexistence-Rules.md):

| Constraint | Rule |
|---|---|
| **Composition model** | Curated composition only — no adaptive canvas, no user-driven arrangement |
| **Card selection** | Fixed set per role; not user-configurable |
| **Card order** | Fixed; not reorderable |
| **Personalization** | None in first release — SPFx companion shows role-default curated layout |
| **Saved views** | Not applicable — SPFx uses curated defaults |

### SPFx Invariant

SPFx companion has **zero user personalization** in the first release. All layout, card selection, and ordering is curated by governance. User personalization is a PWA-only feature.

---

## 10. First-Release Personalization Scope

### Available at Pilot Launch

| Feature | Status |
|---|---|
| Card reorder in secondary/tertiary zones | ✅ First release |
| Card show/hide for configurable cards | ✅ First release |
| Team mode toggle (Executive) | ✅ First release |
| Feed filter persistence | ✅ First release |
| Complexity tier selection | ✅ First release |
| Card arrangement persistence (30-day TTL) | ✅ First release |

### Deferred Beyond First Release

| Feature | Rationale |
|---|---|
| Card resize (width control) | Requires `@hbc/project-canvas` governance tier validation |
| Custom card pinning ("pin this card to top") | Requires governance rules for pinned vs ranked card ordering |
| Cross-device preference sync | Requires server-side preference storage; session-state is browser-local |
| SPFx personalization | Requires curated-composition-to-adaptive-composition migration |
| User-created saved views ("Save as...") | Requires view naming, sharing rules, and storage beyond session-state drafts |

---

## 11. Acceptance Gate Reference

| Field | Value |
|---|---|
| **Gate** | Personalization gate |
| **Pass condition** | Personalization is useful but bounded; primary work runway remains protected |
| **Evidence required** | Personalization policy (this document), layout governance proof (P2-D2), UX review |
| **Primary owner** | Experience / Shell |

### Gate Evidence

- Allowed and prohibited personalization explicitly defined ✓
- Primary zone protected; cannot be removed or displaced ✓
- Cards governed by role eligibility; no cards outside entitlement ✓
- No freeform dashboard composition ✓
- SPFx has zero personalization in first release ✓
- UX review: pending

---

## 12. Locked Decisions

| Decision | Locked Resolution | P2-D5 Consequence |
|---|---|---|
| Personalization | **Moderately governed** | Users can adjust secondary/tertiary zones within governed limits; primary zone invariant |
| Layout model | **Adaptive layout using `@hbc/project-canvas`, constrained by zone governance** | PWA uses project-canvas for adaptive composition; SPFx uses curated composition |
| Low-work default | **Stay on Personal Work Hub** | Personalization does not introduce conditional landing or redirect behavior |

---

## 13. Policy Precedence

| Deliverable | Relationship to P2-D5 |
|---|---|
| **P2-A1** — Operating Model Register | P2-D5 implements the personalization boundaries from P2-A1 §1.3 |
| **P2-D1** — Role-to-Hub Entitlement Matrix | P2-D5 personalization permissions match P2-D1 §9 (uniform across roles) |
| **P2-D3** — Analytics Card Governance | P2-D5 card personalization rules reference P2-D3 §7 locked/configurable status |
| **P2-D4** — Delegated/Team Governance | P2-D5 team mode preference is governed by P2-D4 eligibility rules |
| **P2-B2** — State Persistence | P2-D5 saved-view persistence uses P2-B2 draft storage pattern |
| **P2-D2** — Adaptive Layout | P2-D2 defines zone composition mechanics; P2-D5 defines what users may personalize within those zones |

If a downstream deliverable introduces personalization beyond the limits defined here, this policy takes precedence.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §8.2, §10.4](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
