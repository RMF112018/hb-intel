# P2-E4: Phase 2 Open Decisions and Deferred Items Register

| Field | Value |
|---|---|
| **Doc ID** | P2-E4 |
| **Phase** | Phase 2 |
| **Workstream** | E — Multi-Role Context, Rollout, and Validation |
| **Document Type** | Active Reference |
| **Owner** | Architecture + Product |
| **Update Authority** | Architecture lead; items resolved or promoted require Product review |
| **Last Reviewed Against Repo Truth** | 2026-03-20 |
| **References** | [Phase 2 Plan §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); all P2-series deliverables |

---

## Register Statement

This register consolidates all open decisions and explicitly deferred items from Phase 2 planning into a single tracking artifact. Every item is classified by type, rationale, ownership, and target resolution timeline. Items are closed when they are resolved, promoted to a future phase, or determined to be no longer relevant. No deferred item may silently become a hidden blocker — if it affects pilot launch, it must be tracked here.

---

## Register Scope

### This register governs

- Carry-forward items from Phase 2 Plan §17
- Items explicitly deferred by individual P2 deliverables
- Open decisions requiring resolution before or during pilot
- Classification and tracking of each item

### This register does NOT govern

- Locked decisions (those are final — see §5)
- Implementation task tracking (that's P2-C5 launch checklist scope)
- Success measurement (that's P2-E3 scope)

---

## Definitions

| Term | Meaning |
|---|---|
| **Deferred item** | A requirement or design decision explicitly postponed beyond Phase 2 first release, with documented rationale |
| **Open decision** | A decision that must be made before or during pilot but does not yet have a locked resolution |
| **Blocked item** | A deferred item that cannot be resolved until a named prerequisite is satisfied |
| **Carry-forward** | An item named in Phase 2 Plan §17 as useful follow-on work that does not block the enhanced Phase 2 plan |

---

## 1. Carry-Forward Items from Phase 2 §17

These 7 items are explicitly named in the Phase 2 Plan as carry-forward:

| # | Item | Source | Rationale | Owner | Target |
|---|---|---|---|---|---|
| CF-1 | **Exact ranking-factor coefficients and tie-break implementation details** | §17 | Resolved by P2-A2 — scoring model locked with exact coefficients from `rankItems.ts` | Experience/Shell | **Resolved** (P2-A2) |
| CF-2 | **Final per-role card inventory by every auth role** | §17 | First-release minimum viable set defined in P2-D3 §8; full inventory requires post-pilot usage data | Experience/Product | Post-pilot |
| CF-3 | **Exact launch KPIs and red/green thresholds** | §17 | Scorecard structure defined in P2-E3; threshold bands require pilot baseline data | Product/Adoption | During pilot (Week 1 baseline) |
| CF-4 | **Exact inline action entitlement tables by domain and host** | §17 | First-release action set defined in P2-A1 §7; per-domain entitlement detail requires source-by-source implementation | Platform + Domain | Post-pilot |
| CF-5 | **Final project-anchor inference scoring logic** | §17 | Policy framework defined in P2-E2; simple heuristic (count × recency) for first release; detailed scoring requires usage data | Product | Post-pilot |
| CF-6 | **Host-proven expansion of curated SPFx companion actions** | §17 | First-release SPFx restricted to mark-read + launch-to-PWA (P2-B0); expansion requires host suitability proof | Experience/Architecture | Post-pilot |
| CF-7 | **Final visual component inventory and Storybook composition catalog for all hub surfaces** | §17 | First-release uses existing `@hbc/ui-kit` components; full catalog requires implementation completion | Experience/UI | Post-pilot |

### Resolution Status

- **CF-1:** Fully resolved by P2-A2 — can be closed
- **CF-2 through CF-7:** Remain open carry-forward items

---

## 2. Deferred Items from Deliverables

Items each deliverable explicitly deferred beyond first release:

### From P2-A2 (Ranking Policy)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-A2-1 | Role-specific ranking coefficient overrides | Ranking is uniform across roles in first release (P2-A2 §7.1) | Post-pilot evaluation |

### From P2-B3 (Freshness Trust Policy)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-B3-1 | Stale-item scoring demotion | Whether stale items should drop in ranking; deferred to freshness policy refinement | Post-pilot |

### From P2-B4 (Cross-Device)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-B4-1 | Mobile-first workflow optimization | Explicitly out of Phase 2 scope (§5); mobile receives responsive layout only | Future phase |

### From P2-C1 (Source Tranche)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-C1-1 | Estimating BIC registration factory | Adapter exists; registration not wired — pilot-launch blocker | Pre-pilot (Wave 1) |
| D-C1-2 | BD Score BIC registration factory | Same pattern | Pre-pilot (Wave 1) |
| D-C1-3 | BD Strategic BIC registration factory | Same pattern | Pre-pilot (Wave 1) |
| D-C1-4 | Project Hub Health BIC registration factory | Same pattern | Pre-pilot (Wave 1) |
| D-C1-5 | Notification registrations for Estimating, BD, Project Hub | "To be defined in Wave 1" per publication-model.md | Pre-pilot (Wave 1) |

### From P2-D3 (Analytics Cards)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-D3-1 | Card resize (width control) | Requires `@hbc/project-canvas` governance tier validation | Post-pilot |

### From P2-D5 (Personalization)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-D5-1 | Cross-device preference sync | Requires server-side preference storage; session-state is browser-local | Future phase |
| D-D5-2 | SPFx personalization | Requires curated-to-adaptive composition migration | Future phase |
| D-D5-3 | User-created saved views ("Save as...") | Requires view naming, sharing rules, storage beyond session-state | Post-pilot |
| D-D5-4 | Custom card pinning ("pin card to top") | Requires governance rules for pinned vs ranked card ordering | Post-pilot |

### From P2-E2 (Project Anchor)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-E2-1 | Detailed project-anchor inference scoring | Simple heuristic (count × recency) for first release; detailed scoring needs usage data | Post-pilot |
| D-E2-2 | Project importance as a ranking factor | Requires project-level metadata not yet in feed | Future phase |
| D-E2-3 | Multi-project dashboard view | Requires `@hbc/project-canvas` readiness for project-grouped composition | Future phase |

### From P2-E3 (Success Scorecard)

| # | Item | Rationale | Target |
|---|---|---|---|
| D-E3-1 | KPI threshold band calibration | Requires pilot Week 1 baseline data | During pilot |

---

## 3. Open Decisions Requiring Resolution

These decisions must be made before or during pilot but do not yet have locked resolutions:

| # | Decision | Context | Blocking? | Owner | Expected Resolution |
|---|---|---|---|---|---|
| OD-1 | **Pilot cohort roster** | P2-C5 §4 — selection criteria defined; roster not finalized | Yes — blocks pilot launch | Product/Adoption | Pre-pilot |
| OD-2 | **KPI threshold bands** | P2-E3 §8.3 — scorecard structure defined; exact pass/fail numbers pending | No — can be set during pilot Week 1 | Product/Adoption | Pilot Week 1 |
| OD-3 | ~~**P2-D2 Adaptive Layout and Zone Governance Spec**~~ | **Resolved 2026-03-20** — spec created; defines `@hbc/project-canvas` composition mechanics, zone-bounded EditMode gating, tile registry binding, role-default layouts, and 5 implementation gates | **Closed** | Experience/Shell | **Done** |
| OD-4 | **Pilot duration** | P2-C5 §4 — minimum 2 weeks; exact duration not set | No — can be decided at launch | Product/Adoption | Pre-pilot |
| OD-5 | **Opt-out mechanism** | P2-C5 §4 — whether pilot users can revert to `/project-hub` | No — recommended but not required for pilot start | Experience/Shell | Pre-pilot |

---

## 4. Classification Matrix

### Summary by Status

| Status | Count | Items |
|---|---|---|
| **Resolved** | 2 | CF-1 (ranking coefficients — resolved by P2-A2); OD-3 (P2-D2 — locked 2026-03-20) |
| **Pilot-launch blocker** | 6 | D-C1-1 through D-C1-5 (source wiring), OD-1 (cohort roster) |
| **Open decision (pre-pilot)** | 2 | OD-4 (duration), OD-5 (opt-out) |
| **Open decision (during pilot)** | 2 | OD-2 (threshold bands), D-E3-1 (KPI calibration) |
| **Deferred to post-pilot** | 9 | CF-2, CF-3 partial, CF-4, D-A2-1, D-B3-1, D-D3-1, D-D5-3, D-D5-4, D-E2-1 |
| **Deferred to future phase** | 6 | CF-5 partial, CF-6, CF-7, D-B4-1, D-D5-1, D-D5-2, D-E2-2, D-E2-3 |

### Full Classification Table

| Item | Type | Blocks Pilot? | Owner | Target |
|---|---|---|---|---|
| CF-1 | ~~Carry-forward~~ | No — **Resolved** | — | Closed |
| CF-2 | Carry-forward | No | Experience/Product | Post-pilot |
| CF-3 | Carry-forward | Partially — structure done, bands open | Product/Adoption | During pilot |
| CF-4 | Carry-forward | No | Platform + Domain | Post-pilot |
| CF-5 | Carry-forward | No | Product | Post-pilot |
| CF-6 | Carry-forward | No | Experience/Architecture | Post-pilot |
| CF-7 | Carry-forward | No | Experience/UI | Post-pilot |
| D-C1-1..5 | Blocker | **Yes** | Domain leads + Platform | Pre-pilot |
| OD-1 | Open decision | **Yes** | Product/Adoption | Pre-pilot |
| OD-3 | ~~Open decision~~ **Resolved** | **No — Closed** | Experience/Shell | Done (2026-03-20) |
| All others | Deferred | No | Various | Post-pilot or future |

---

## 5. Items That Are NOT Deferred

The following are **locked decisions** from Phase 2 §16. They are final and not open for deferral:

| Decision | Status |
|---|---|
| Full Personal Work Hub ownership: PWA first | **Locked** |
| SPFx posture: Richer companion lane, not the full home | **Locked** |
| Elevated-role landing: Hybrid | **Locked** |
| Personalization: Moderately governed | **Locked** |
| Low-work default: Stay on hub | **Locked** |
| Work ranking: Weighted additive mix | **Locked** |
| Top-level organization: Responsibility lanes first | **Locked** |
| Notification relationship: Feed the hub | **Locked** |
| Freshness model: Hybrid trust | **Locked** |
| Rollout posture: Targeted pilot first | **Locked** |
| Multi-role governance: `@hbc/auth` | **Locked** |
| Project anchor rule: Hybrid | **Locked** |
| First-release source scope: Wave 1 business-core | **Locked** |
| Project Hub handoff: Project significance rule | **Locked** |
| First-release success model: Balanced scorecard | **Locked** |

These decisions may only be revisited via ADR if material evidence warrants a reversal.

---

## 6. Register Maintenance

### Resolution Process

| Action | When | Who |
|---|---|---|
| **Resolve** | Item is implemented or decision is made | Owner updates status; Architecture reviews |
| **Promote** | Deferred item moves to a specific phase plan | Architecture assigns to target phase plan |
| **Close** | Item is no longer relevant or was superseded | Architecture closes with rationale |
| **Escalate** | Deferred item discovered to be a hidden blocker | Owner escalates; register updated to "blocker" |

### Update Cadence

- Register is reviewed at each P2-C5 readiness check-in
- Blocker items are reviewed weekly until resolved
- Deferred items are reviewed at pilot end to determine post-pilot prioritization

---

## 7. Acceptance Gate Reference

P2-E4 contributes to the Pilot-readiness gate:

| Field | Value |
|---|---|
| **Gate** | Pilot-readiness gate |
| **P2-E4 contribution** | Confirms that all open decisions and deferred items are tracked; no hidden blockers; pilot-blocking items have resolution owners and timelines |
| **Primary owner** | Architecture + Product |

### Gate Evidence

- All 7 carry-forward items from §17 tracked with status ✓
- All deliverable-specific deferrals collected ✓
- 5 open decisions identified with owners (OD-3 resolved 2026-03-20; 4 remain) ✓
- 6 pilot-launch blockers identified with owners (OD-3 closed; 5 active blockers remain: D-C1-1..5, OD-1) ✓
- No hidden blockers — all items classified ✓

---

## 8. Package-Maturity Regression Governance

### Purpose

Phase 2 planning depends on six shared packages being at a specified maturity level (P2-A1 §0.3). This section defines the standing governance procedure that applies when any of those packages regresses — loses capabilities, breaks API contracts, or has a locked ADR reversed — after Phase 2 planning committed to their readiness. This procedure is not a one-time item; it is a living rule that governs the full Phase 2 implementation and pilot lifecycle.

---

### 8.1 Protected Package Set

The following packages are protected by this procedure. Their maturity status is declared in P2-A1 §0.3 and must remain stable for Phase 2 implementation to proceed on the committed basis.

| Package | ADR / Lock Date | Primary P2 Commitments |
|---|---|---|
| `@hbc/my-work-feed` | ADR-0115 locked 2026-03-15 | Primary zone aggregation; canonical item model; adapter registry; P2-A1, P2-A2, P2-D4 |
| `@hbc/notification-intelligence` | ADR-0099 locked 2026-03-10 | Notification-to-work signal layer; P2-C2 |
| `@hbc/session-state` | ADR-0101 locked 2026-03-11 | Draft persistence; offline/sync trust model; P2-B2, P2-B3, P2-D5 |
| `@hbc/smart-empty-state` | ADR-0100 locked 2026-03-11 | Low-work empty-state classification; P2-A1 §4 |
| `@hbc/project-canvas` | ADR-0102 locked 2026-03-11 | Adaptive layout; zone EditMode; tile registry; P2-D2 Gates 1–5 |
| `@hbc/auth` | Auth baseline / PH5 complete | Role resolution; entitlement vocabulary; P2-D1 and all role-gated behavior |

---

### 8.2 Regression Triggers

This procedure is invoked when any of the following occurs for a protected package:

| Trigger | Examples |
|---|---|
| **API surface break** | A previously exported hook, type, or component is removed or signature-changed in a way that breaks a P2-plan–dependent consumer |
| **ADR reversal or material amendment** | The governing ADR for a locked package is reversed, suspended, or amended in a way that changes the capability P2 planning relied on |
| **Maturity demotion** | The package's status in `current-state-map.md` drops from its locked level (e.g., "Mature" → "In Progress" or "Partial") |
| **Critical test coverage loss** | The package's test suite is materially degraded such that production confidence in its P2-relevant behavior is no longer warranted |
| **Behavioral contract violation** | The package is found to behave differently than the P2 plan assumed — e.g., `useCanvasEditor.removeTile()` no longer respects `isMandatory`, or `@hbc/auth` `resolvedRoles` changes its resolution model |
| **Unplanned breaking dependency change** | A transitive dependency change causes the protected package to lose or alter a capability P2 relies on |

A team member, code reviewer, or automated signal (failing CI for a P2-dependent package) may invoke this procedure. Architecture lead confirms whether a trigger condition is met.

---

### 8.3 Package-to-Plan Impact Map

When a regression is confirmed, consult this map to identify which P2 plan commitments and implementation gates are affected.

| Package | Affected P2 Documents | Affected Gates |
|---|---|---|
| `@hbc/my-work-feed` | P2-A1 (primary zone), P2-A2 (ranking contract), P2-D4 (team feed projection) | P2-C5 publication gate; work-surface gate |
| `@hbc/notification-intelligence` | P2-C2 (notification-to-work mapping) | Signal gate |
| `@hbc/session-state` | P2-B2 (persistence contract), P2-B3 (freshness trust), P2-D5 (saved-view storage) | Continuity gate; trust-state gate; personalization gate |
| `@hbc/smart-empty-state` | P2-A1 §4 (low-work behavior) | Work-surface gate; low-work gate |
| `@hbc/project-canvas` | P2-D2 (all zones and gates) | P2-D2 Gates 1–5 (primary zone isolation, mandatory enforcement, zone boundary, role eligibility, config restore); personalization gate; work-surface gate |
| `@hbc/auth` | P2-D1 (entitlement matrix), P2-B1 (landing precedence), all role-gated behavior | Role-governance gate; all gates with role-conditional behavior |

---

### 8.4 Response Procedure

When a regression trigger is confirmed, execute the following steps in order:

**Step 1 — Declare and classify (Architecture lead, within 1 business day)**

- Confirm the trigger condition against §8.2.
- Classify severity:

| Severity | Criteria |
|---|---|
| **Critical** | Regression breaks a P2-D2 implementation gate, removes a primary-zone contract, or causes a pilot-launch–blocking capability gap |
| **High** | Regression affects a non-gate P2 contract that will require rework before pilot but does not itself block launch |
| **Low** | Regression affects a deferred or post-pilot capability; no immediate impact on first-release implementation |

- Add a new entry to §1, §2, or a new regression log in this register (see §8.5).
- Notify: Experience/Shell lead, Architecture lead, and the owner of the affected P2 documents.

**Step 2 — Impact assessment (Architecture + affected team lead, within 2 business days of declaration)**

- Using the impact map in §8.3, identify every P2 document and implementation gate affected.
- For each affected gate: determine whether the gate can still be passed with a workaround, requires a plan amendment, or is now blocked until the package is restored.
- For each affected P2 document: determine whether the document remains accurate or requires an update.

**Step 3 — Resolution path selection (Architecture lead)**

Choose one of the following resolution paths:

| Path | Criteria | Action |
|---|---|---|
| **Restore** | The package regression is unintended and will be fixed by the package owner | Block implementation work that depends on the regressed capability; track fix as a new pilot-launch blocker in §2 |
| **Adapt** | The regression is intentional (e.g., the package's design evolved) and the P2 plan can be updated to remain valid | Update the affected P2 documents and gate evidence; re-verify affected gates |
| **Defer** | The regression affects a post-pilot capability only; first-release work is unaffected | Log in §2 as a deferred item with rationale; no immediate action required |
| **Escalate to ADR** | The regression represents a durable architectural change that requires a new or amended ADR | Architecture lead initiates ADR process; P2 documents are updated to reference the new ADR once locked |

**Step 4 — Register update (Architecture lead)**

- Add or update the regression entry in §8.5.
- Update P2-A1 §0.3 if the package's maturity classification has changed.
- Update affected P2 documents per the chosen resolution path.
- Update the Classification Matrix in §4 if the regression introduced a new blocker.

**Step 5 — Re-verification (Experience/Shell + Architecture)**

After the regression is resolved or the plan is adapted:
- Re-run the verification steps for all affected P2-D2 gates.
- Update gate evidence in the affected specifications.
- Confirm no other protected packages were affected by the same underlying change.

---

### 8.5 Regression Log

Active and resolved package-maturity regressions are recorded here. The log starts empty; entries are added as regressions occur.

| Entry | Package | Detected | Trigger | Severity | Resolution Path | Status |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No regressions recorded as of 2026-03-20 |

---

### 8.6 Governance Rules

| Rule | Specification |
|---|---|
| **No silent regressions** | Any discovered regression in a protected package must be logged here within 1 business day of discovery |
| **No proceeding through a blocked gate** | If a regression blocks a P2-D2 implementation gate, implementation work that depends on that gate must pause until the gate is unblocked |
| **No self-certification** | The team implementing a feature that depends on a regressed package may not self-certify that the regression is acceptable; Architecture lead must confirm the resolution path |
| **No plan divergence without documentation** | If a P2 plan document is updated to adapt to a regression, the update must reference this register entry and the resolution path chosen |
| **Post-pilot review** | At pilot completion, this log is reviewed to determine whether any low-severity regressions should be promoted to post-pilot resolution items |

---

**Last Updated:** 2026-03-20 — OD-3 closed; P2-D2 locked; §8 package-maturity regression governance procedure added
**Governing Authority:** [Phase 2 Plan §17](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
