# P2-C5: First-Release Pilot Publication and Rollout Readiness Register

| Field | Value |
|---|---|
| **Doc ID** | P2-C5 |
| **Phase** | Phase 2 |
| **Workstream** | C — Shared Work Sources, Signals, and Handoff Rules |
| **Document Type** | Active Reference |
| **Owner** | Platform / Core Services + Adoption / Product |
| **Update Authority** | Platform lead updates publication readiness; Product lead updates rollout posture; changes require mutual review |
| **Last Reviewed Against Repo Truth** | 2026-03-20 (Tier 7 governance update) |
| **References** | [Phase 2 Plan §7.1, §10.3, §14, §16, §19](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md); [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md); [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md); [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md); [P2-C4](P2-C4-Handoff-Criteria-Matrix.md); [P0-B1](../phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md) |

---

## Register Statement

This register is the canonical launch-readiness artifact for the Phase 2 first-release pilot. It tracks per-source publication readiness, maps all 13 acceptance gates to evidence, defines the pilot cohort, and provides the launch checklist that gates pilot approval. No pilot launch may proceed without Platform-lead and Product-lead sign-off on this register's readiness status.

---

## Register Scope

### This register governs

- Per-source publication readiness status and integration test tracking
- Acceptance gate evidence inventory (all 13 gates)
- Pilot cohort definition and selection criteria
- Pilot launch checklist
- Rollout posture (Wave 1 start gate, expansion criteria, rollback conditions)
- Named pilot-launch blockers with resolution owners

### This register does NOT govern

- Source classification and readiness gate definitions — see [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md)
- Notification mapping rules — see [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md)
- Navigation patterns — see [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md)
- Handoff criteria — see [P2-C4](P2-C4-Handoff-Criteria-Matrix.md)
- Success scorecard and KPI bands — see P2-E3
- Pilot cohort sequencing details — see P2-E5

---

## Definitions

| Term | Meaning |
|---|---|
| **Publication-ready** | Source has passed all 6 readiness gates (P2-C1 §4) and integration tests confirm correct publication into the hub |
| **Publication-blocked** | Source is required for pilot but has unmet readiness gates — listed as a pilot-launch blocker |
| **Publication-optional** | Source is beneficial but its absence does not block pilot launch |
| **Pilot cohort** | The targeted group of users who receive the `/my-work` Personal Work Hub as their default landing in the first-release rollout |
| **Acceptance gate** | One of 13 Phase 2 pass/fail criteria that must have clear evidence before pilot launch approval |

---

## 1. Publication Readiness Status

Inherited from [P2-C1 §1](P2-C1-First-Release-Source-Tranche-Register.md) with integration test status:

| Source | Module Key | Classification | Gate Status (P2-C1 §4) | Integration Tested | Publication Status |
|---|---|---|---|---|---|
| **Provisioning** | `provisioning` | Required | 6/6 ✅ | ❌ Pending | **Publication-ready** (gates met; integration test pending) |
| **Estimating Bid Readiness** | `estimating-bid-readiness` | Required | 3/6 ❌ | ❌ Blocked | **Publication-blocked** |
| **BD Score Benchmark** | `bd-score-benchmark` | Required | 3/6 ❌ | ❌ Blocked | **Publication-blocked** |
| **BD Strategic Intelligence** | `bd-strategic-intelligence` | Required | 3/6 ❌ | ❌ Blocked | **Publication-blocked** |
| **Project Hub Health Pulse** | `project-hub-health-pulse` | Required | 3/6 ❌ | ❌ Blocked | **Publication-blocked** |
| **Admin Escalations** | `admin` | Optional | Via Provisioning ✅ | ❌ Pending | **Publication-optional** |

### 1.1 Readiness Status Updates

This table is updated as sources progress through readiness gates. Updates require:
- Domain-owner confirmation that gates are met
- Platform-lead review of integration test evidence
- QA sign-off on cross-source deduplication and lane assignment

---

## 2. Integration Test Readiness by Gate

### Gate 5 — Publication

| Test Scenario | Source | Owner | Status | Evidence |
|---|---|---|---|---|
| BIC registration factory created | All 5 required | Domain leads | ✅ All 5 created | `*/bic-registration.ts` in provisioning, estimating, bd, project-hub |
| App bootstrap wires `registerBicModule()` | All 5 required | Domain leads | ✅ All 5 wired | `apps/pwa/src/sources/sourceAssembly.ts` |
| Notification registrations defined | All notification-publishing sources | Platform | ✅ All 5 defined (28 events total) | `*/notification-registrations.ts` in all feature packages |
| Deduplication key format validates | All sources | Platform | ✅ Defined in P2-C1 §5 | Canonical key registry |
| Cross-source dedup tested (BIC + Notification) | Provisioning | QA | ✅ Implemented | `crossSourceDedup.test.ts` — 5 tests: BIC+Notif merge, source priority, non-merge, blocked propagation, 3-way merge |
| Lane assignment correct per priority mapping | All sources | Platform | ✅ Implemented | `assignLane.test.ts` — 8 tests covering all lane types + `computeCounts` |

### Gate 6 — Signal

| Test Scenario | Owner | Status | Evidence |
|---|---|---|---|
| Notification tier-to-lane mapping correct | Platform | ✅ Implemented | `notificationAdapter.test.ts` (immediate→do-now, watch→watch, digest→watch) + `assignLane.test.ts` |
| Action URLs resolve on PWA | QA | ✅ Implemented | `buildActionUrl.test.ts` — relative-path contract validated (same paths resolve on PWA) |
| Action URLs resolve on SPFx | QA | ✅ Implemented | `buildActionUrl.test.ts` — same relative-path contract per P2-C2 §13 (SPFx supplies origin) |
| Badge shows immediate-only count | Experience | ✅ Implemented | `HbcNotificationBadge` uses `useNotificationBadge()` which queries `tier: 'immediate', unreadOnly: true` |

### Gate 10 — Continuity

| Test Scenario | Owner | Status | Evidence |
|---|---|---|---|
| Return memory restores hub state after domain navigation | Experience/Shell | ✅ Implemented | `useHubReturnMemory` — scroll restore, feed refresh on return, visibilitychange resilience |
| Redirect memory works after auth redirect | Experience/Shell | ✅ Implemented | `redirectMemory.ts` test suite |
| Team mode persists across navigation | Experience/Shell | ✅ Implemented | `useHubStatePersistence` — query-seed auto-save via `useAutoSaveDraft('hbc-my-work-query-seed', 8, 500)` |

### Gate 12 — Handoff

| Test Scenario | Owner | Status | Evidence |
|---|---|---|---|
| Provisioning completion handoff creates Project Hub seed | Platform + Project Hub | ✅ Implemented | `onAcknowledged` callback generates seed record ID; `handoff-config.test.ts` validates |
| Health pulse items navigate to Project Hub | Experience | ✅ Implemented | `resolveHealthPulseActionUrl()` produces `/project-hub?projectId=...&view=health`; `resolveHealthPulseActionUrl.test.ts` validates |
| Return from Project Hub restores hub state | Experience/Shell | ✅ Implemented | `useHubReturnMemory` captures scroll + groups on leave, restores on return, triggers feed refresh; `useHubReturnMemory.test.ts` validates |

---

## 3. Acceptance Gate Evidence Inventory

All 13 Phase 2 acceptance gates mapped to their evidence documents:

| # | Gate | Primary Evidence | Status |
|---|---|---|---|
| 1 | Default home | [P2-B1](P2-B1-Root-Routing-and-Landing-Precedence-Spec.md) (route/landing spec) + implementation + test | Spec ✅; Implementation ✅ (route, resolver, cohort gate complete; source publication pending) |
| 2 | Lane-boundary | [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md) + design review signoff | Spec ✅; Signoff ❌ |
| 3 | Work-surface | [P2-A1](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) + [P2-D2] (zone governance) + UX review | Spec ✅; Implementation ✅ (3-zone layout, role-aware composition, P2-D2 referenced); UX review ❌ |
| 4 | Low-work | [P2-A1 §4](P2-A1-Personal-Work-Hub-Operating-Model-Register.md) (empty-state rules) + UX proof | Spec ✅; Implementation ✅ (hub-level empty state, no redirect on empty queue); UX proof ❌ |
| 5 | Publication | [P2-C1](P2-C1-First-Release-Source-Tranche-Register.md) + **P2-C5** (this register) + integration validation | Spec ✅; Implementation ✅ (all 5 sources registered with BIC factories and notification registrations; MyWork adapter assembly wired); Validation ❌ |
| 6 | Signal | [P2-C2](P2-C2-Notification-to-Work-Mapping-Policy.md) + interaction review + launch checks | Spec ✅; Implementation ✅ (tier-to-lane mapping, action URL contract, badge immediate-only count); Review ❌ |
| 7 | Role-governance | [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md) (entitlement matrix) + role validation | P2-D1 ✅; Implementation ✅ (RoleGate-based card visibility per P2-D1 §6; team mode role-gated per P2-D4 §1); Role walkthrough ❌ |
| 8 | Personalization | [P2-D5] (personalization policy) + layout governance proof | P2-D5 ✅; Implementation ✅ (team mode toggle, card arrangement persistence, saved-view rules per P2-D5 §4/§7) |
| 9 | Delegated-visibility | [P2-D4] (delegated governance) + role walkthroughs | P2-D4 ✅; Implementation ✅ (delegated-by-me + escalation-candidate scopes via useMyWorkTeamFeed; my-team deferred per locked decision) |
| 10 | Continuity | [P2-B2](P2-B2-Hub-State-Persistence-and-Return-Memory-Contract.md) (persistence contract) + navigation test scenarios | Spec ✅; Implementation ✅ (draft persistence, return memory, feed refresh on return); Tests ❌ |
| 11 | Trust-state | [P2-B3](P2-B3-Freshness-Refresh-and-Staleness-Trust-Policy.md) (freshness policy) + state UX review + scenario tests | Spec ✅; Implementation ✅ (freshness indicator, stale-while-revalidate, connectivity display); Review ❌ |
| 12 | Handoff | [P2-C3](P2-C3-Work-Item-Navigation-Matrix.md) + [P2-C4](P2-C4-Handoff-Criteria-Matrix.md) + navigation review + scenario tests | Spec ✅; Implementation ✅ (seed creation, health pulse navigation, return restoration); Tests ✅ (scenario tests 2, 3, 5, 6, 7) |
| 13 | Cross-device | [P2-B4](P2-B4-Cross-Device-Shell-Behavior-Note.md) + test evidence | Spec ✅; Implementation ✅ (responsive zone layout at tablet/mobile breakpoints per HBC_BREAKPOINT_TABLET/MOBILE); Tests ❌ |
| 14 | Pilot-readiness | **P2-C5** (this register) + [P2-E3] (scorecard) + launch checklist | P2-C5 ✅; P2-E3 ❌ |

### Gate Status Summary

- **Spec complete:** 14 of 14 gates have locked specification documents (all P2-A through P2-E deliverables exist)
- **Implementation complete:** 12 of 14 gates have implementation evidence (Gates 1, 3–13)
- **Governance signoff pending:** Gates 2 (design review), 3/4 (UX review), 7 (role walkthrough), 14 (Product/Adoption approval)
- **Remaining blockers:** Cross-source dedup integration test, pilot cohort roster, success scorecard finalization

---

## 4. Pilot Cohort Definition

Per Phase 2 Plan §7.1 (Default release posture):

### 4.1 Selection Criteria

The pilot cohort SHOULD prioritize:

| Criterion | Rationale |
|---|---|
| Users whose workflows are tied to the first-release source tranche | They will have real work items in the hub from day one |
| Users who will benefit most from a credible daily work surface | Users currently reconstructing their workday across multiple tools |
| Elevated roles who need the hybrid personal + team/portfolio experience | Validates team-mode landing and delegated visibility |

### 4.2 Cohort Parameters

| Parameter | Value | Status |
|---|---|---|
| **Cohort size** | To be determined by Product/Adoption | ❌ Not yet defined |
| **Role mix** | Must include standard, elevated, and multi-role users | ❌ Roster pending |
| **Geographic scope** | To be determined | ❌ Not yet defined |
| **Pilot duration** | To be determined | ❌ Not yet defined |
| **Opt-out mechanism** | To be determined (revert to `/project-hub` landing) | ❌ Not yet defined |

### 4.3 Cohort Invariants

- The exact roster is an implementation-governance decision, not a planning blocker (Phase 2 Plan §7.1).
- Cohort selection MUST NOT delay locked specification work.
- Cohort finalization is gated on P2-E5 (Pilot Cohort Rollout and Adoption Sequencing Note).

---

## 5. Pilot Launch Checklist

This checklist must be fully satisfied before pilot launch approval:

### Pre-Launch: Specification Gates

- [x] P2-A1 — Operating Model Register locked
- [x] P2-A2 — Ranking Policy locked
- [x] P2-A3 — Explainability Rules locked
- [x] P2-B0 — Lane Ownership locked
- [x] P2-B1 — Root Routing Spec locked
- [x] P2-B2 — State Persistence Contract locked
- [x] P2-B3 — Freshness Trust Policy locked
- [x] P2-B4 — Cross-Device Note locked
- [x] P2-C1 — Source Tranche Register locked
- [x] P2-C2 — Notification Mapping Policy locked
- [x] P2-C3 — Navigation Matrix locked
- [x] P2-C4 — Handoff Criteria Matrix locked
- [x] P2-C5 — Readiness Register created (this document)
- [x] P2-D1 — Role-to-Hub Entitlement Matrix
- [x] P2-D2 — Adaptive Layout and Zone Governance Spec
- [x] P2-D3 — Analytics Card Governance Matrix
- [x] P2-D4 — Delegated and Team Lane Governance Note
- [x] P2-D5 — Personalization Policy and Saved-View Rules
- [x] P2-E1 — Multi-Role Context Policy
- [x] P2-E2 — Project Anchor and Context-Scope Policy
- [x] P2-E3 — First-Release Success Scorecard
- [x] P2-E4 — Open Decisions and Deferred Items Register
- [x] P2-E5 — Pilot Cohort Rollout and Adoption Sequencing Note

### Pre-Launch: Implementation Gates

- [x] `/my-work` route created and wired to `HbcMyWorkFeed`
- [x] `resolveRoleLandingPath()` updated to return `/my-work` (via shared `resolveLandingDecision()` resolver with cohort gate)
- [x] All 5 required sources registered with BIC factories and notification registrations (source assembly wired in `apps/pwa/src/sources/sourceAssembly.ts`)
- [ ] Cross-source deduplication tested (integration test pending)
- [x] Notification tier-to-lane mapping tested (`notificationAdapter.test.ts`, `assignLane.test.ts`)
- [x] Return memory and state persistence tested (`useHubReturnMemory`, `useHubStatePersistence`, draft contracts validated)
- [x] Freshness indicators visible at all complexity tiers (`HubFreshnessIndicator` with tier-aware display)
- [x] Handoff scenarios tested (`handoff-config.test.ts`, `resolveHealthPulseActionUrl.test.ts`, `useHubReturnMemory.test.ts`)
- [x] Cross-device stability verified (`HubZoneLayout` responsive at HBC_BREAKPOINT_TABLET/MOBILE)
- [ ] Pilot cohort roster finalized and approved (Product/Adoption decision pending)

### Pre-Launch: Governance Gates

- [ ] Design review signoff for lane-boundary gate — Evidence: P2-B0 lane model implemented; three-zone hub layout per P2-D2; primary zone protected; awaiting design review session
- [ ] UX review signoff for work-surface and low-work gates — Evidence: P2-D2 zone layout built with role-aware composition; `HubPageLevelEmptyState` ensures no redirect on empty queue per P2-A1 §4; awaiting UX review session
- [ ] Role validation signoff for role-governance gate — Evidence: `RoleGate` enforces P2-D1 §6 card visibility; team mode toggle role-gated per P2-D4 §1; Executive-only my-team mode; awaiting role walkthrough session
- [ ] Product/Adoption approval for pilot cohort and rollout plan — Evidence: P2-E5 rollout sequencing spec exists; P2-C5 §4 cohort definition template ready; awaiting Product/Adoption decision
- [ ] Success scorecard (P2-E3) finalized with measurable criteria — Evidence: P2-E3 spec exists; KPI bands and measurement plan require Product finalization

### Pre-Launch: Governance Review Schedule

The following governance reviews require human signoff. Implementation evidence exists for each; the sessions need to be scheduled.

#### Gate 2 — Design Review: Lane-Boundary (P2-B0)

| Field | Value |
|---|---|
| **Reviewer** | Design lead |
| **Gate** | Lane-boundary |
| **Pass condition** | Hub layout respects P2-B0 lane model; primary zone dominates; secondary/tertiary zones use governed card grid |
| **Evidence to review** | `apps/pwa/src/pages/my-work/HubZoneLayout.tsx` (12-column grid, primary/secondary/tertiary zones); `HubPrimaryZone.tsx` (feed rendered outside canvas, no EditMode); `HubSecondaryZone.tsx` + `HubTertiaryZone.tsx` (role-gated cards on 12-col sub-grid matching `CANVAS_GRID_COLUMNS`) |
| **Governing spec** | [P2-B0](P2-B0-Lane-Ownership-and-Coexistence-Rules.md), [P2-D2](P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md) |
| **Status** | Awaiting session scheduling |

#### Gates 3/4 — UX Review: Work-Surface and Low-Work (P2-A1, P2-D2)

| Field | Value |
|---|---|
| **Reviewer** | UX lead |
| **Gate** | Work-surface (Gate 3) + Low-work (Gate 4) |
| **Pass condition** | Hub provides a credible task-first work surface; empty/low-work states keep the hub useful and never redirect |
| **Evidence to review** | `HubZoneLayout.tsx` (three-zone adaptive layout); `HubPageLevelEmptyState.tsx` (loading-failed/permission-empty guard, never redirects on empty queue per P2-A1 §4); `HbcMyWorkFeed` (built-in truly-empty/filter-empty/first-use states); `HubFreshnessIndicator.tsx` + `HubConnectivityBanner.tsx` (trust-state and offline display); responsive breakpoints (12→6→1 column reflow) |
| **Governing spec** | [P2-A1 §4, §6](P2-A1-Personal-Work-Hub-Operating-Model-Register.md), [P2-D2](P2-D2-Adaptive-Layout-and-Zone-Governance-Spec.md) |
| **Status** | Awaiting session scheduling |

#### Gate 7 — Role Validation Walkthrough (P2-D1, P2-D4)

| Field | Value |
|---|---|
| **Reviewer** | Product lead + Experience lead |
| **Gate** | Role-governance |
| **Pass condition** | Role-gated surfaces correctly show/hide per entitlement matrix; team mode toggle restricted to eligible roles |
| **Evidence to review** | `RoleGate` usage in `TeamPortfolioCard.tsx` (Executive), `AgingBlockedCard.tsx` (Executive), `AdminOversightCard.tsx` (Administrator); `HubTeamModeSelector.tsx` (my-team tab Executive-only via `useAuthStore`); `useHubPersonalization.ts` (team mode draft persistence); `useMyWorkTeamFeed` (delegated-by-me + escalation-candidate scopes) |
| **Governing spec** | [P2-D1](P2-D1-Role-to-Hub-Entitlement-Matrix.md) §5–§6, [P2-D4](P2-D4-Delegated-and-Team-Lane-Governance-Note.md) §1 |
| **Walkthrough scenarios** | (1) Member user sees personal cards only, no team mode options beyond delegated-by-me; (2) Executive user sees team portfolio + aging/blocked cards + my-team tab; (3) Administrator sees admin oversight card; (4) Multi-role Administrator+Executive sees all |
| **Status** | Awaiting session scheduling |

#### Blocker 12 — Pilot Cohort Roster (Product/Adoption)

| Field | Value |
|---|---|
| **Decision owner** | Product lead + Adoption lead |
| **Blocker** | Pilot cohort roster not defined |
| **Decision required** | Cohort size, role mix, geographic scope, pilot duration, opt-out mechanism (per §4.2) |
| **Infrastructure ready** | `isMyWorkCohortEnabled()` in `@hbc/shell` reads `my-work-hub` feature flag; `resolveLandingDecision()` routes cohort users to `/my-work`; `DEFAULT_FEATURE_FLAGS` in `bootstrap.ts` enables flag in dev mode |
| **Governing spec** | [P2-E5](P2-E5-Pilot-Cohort-Rollout-and-Adoption-Sequencing-Note.md), P2-C5 §4 |
| **Status** | Awaiting Product/Adoption decision |

#### Blocker 13 — Success Scorecard (Product)

| Field | Value |
|---|---|
| **Decision owner** | Product lead |
| **Blocker** | Success scorecard not finalized |
| **Decision required** | Measurable KPI bands, measurement thresholds, monitoring cadence, success/failure criteria for Wave 1→Wave 2 expansion gate |
| **Spec ready** | [P2-E3](P2-E3-First-Release-Success-Scorecard-and-Validation-Plan.md) exists with framework; Product must finalize specific numeric thresholds |
| **Status** | Awaiting Product finalization |

---

## 6. Rollout Posture

Per Phase 2 Plan §16 locked decision: **Targeted pilot / phased rollout first.**

### 6.1 Wave 1: Pilot Launch

| Aspect | Specification |
|---|---|
| **Start gate** | All pilot launch checklist items (§5) are complete |
| **Scope** | Approved pilot cohort receives `/my-work` as default landing |
| **Duration** | Minimum 2 weeks for meaningful data collection |
| **Monitoring** | Success scorecard metrics tracked from day 1 (P2-E3) |

### 6.2 Wave 2: Broader Rollout

| Aspect | Specification |
|---|---|
| **Expansion gate** | Wave 1 success scorecard passes minimum thresholds |
| **Scope** | Expanded to additional user groups per P2-E5 sequencing |
| **Prerequisites** | All Wave 1 issues resolved; support/adoption team trained |

### 6.3 Rollback Criteria

| Condition | Action |
|---|---|
| Critical publication failure (source data not appearing) | Pause pilot; revert affected cohort to `/project-hub` landing |
| Trust-state failure (stale data served without indicator) | Pause pilot; fix staleness indicators; resume |
| Handoff failure (items routing to wrong surface) | Pause pilot; fix navigation routing; resume |
| Negative user feedback exceeding threshold (P2-E3) | Pause pilot; Product/Adoption review; decide continue/revert |

### 6.4 Rollout Invariants

- Rollback MUST NOT destroy user state — reverting to `/project-hub` landing preserves all feed data and session state.
- Pilot users who opt out MUST be able to return to `/project-hub` default without data loss.
- Rollout expansion requires explicit Product-lead approval — no automatic promotion.

---

## 7. Pilot-Launch Blockers

Named blockers that must be resolved before pilot launch:

| # | Blocker | Blocked Gate | Resolution Owner | Target | Status |
|---|---|---|---|---|---|
| 1 | Estimating BIC registration not created | 5 — Publication | Estimating domain lead | Wave 1 | ✅ Resolved — `createEstimatingBidReadinessBicRegistration()` factory created and wired in `sourceAssembly.ts` |
| 2 | BD Score BIC registration not created | 5 — Publication | BD domain lead | Wave 1 | ✅ Resolved — `createBdScoreBenchmarkBicRegistration()` factory created and wired in `sourceAssembly.ts` |
| 3 | BD Strategic BIC registration not created | 5 — Publication | BD domain lead | Wave 1 | ✅ Resolved — `createBdStrategicIntelligenceBicRegistration()` factory created and wired in `sourceAssembly.ts` |
| 4 | Project Hub Health BIC registration not created | 5 — Publication | Project Hub lead | Wave 1 | ✅ Resolved — `createProjectHealthPulseBicRegistration()` factory created and wired in `sourceAssembly.ts` |
| 5 | Estimating notification registrations not defined | 6 — Signal | Platform + Estimating | Wave 1 | ✅ Resolved — `ESTIMATING_NOTIFICATION_REGISTRATIONS` (3 events) defined and registered |
| 6 | BD notification registrations not defined | 6 — Signal | Platform + BD | Wave 1 | ✅ Resolved — `BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS` (3 events) + `BD_STRATEGIC_INTELLIGENCE_NOTIFICATION_REGISTRATIONS` (3 events) defined and registered |
| 7 | Project Hub notification registrations not defined | 6 — Signal | Platform + Project Hub | Wave 1 | ✅ Resolved — `PROJECT_HEALTH_PULSE_NOTIFICATION_REGISTRATIONS` (4 events) defined and registered |
| 8 | `/my-work` route not implemented | 1 — Default home | Experience/Shell | Wave 1 | ✅ Resolved — route created, `HbcMyWorkFeed` wired, `MyWorkProvider` mounted |
| 9 | `resolveRoleLandingPath()` not updated | 1 — Default home | Experience/Shell | Wave 1 | ✅ Resolved — refactored to delegate to `resolveLandingDecision()` with cohort gate via `isMyWorkCohortEnabled()` |
| 10 | Workstream D deliverables not complete | 7, 8, 9 — Role/Personalization | Experience + Product | Wave 1 | ✅ Resolved — P2-D1–D5 specs all exist; Gate 7 (RoleGate-based visibility), Gate 8 (team mode + card arrangement), Gate 9 (delegated-by-me + escalation-candidate scopes) implementation complete |
| 11 | Workstream E deliverables not complete | 14 — Pilot-readiness | Adoption + Product | Wave 1 | ✅ Resolved — P2-E1–E5 specs all exist (Multi-Role Context, Project Anchor, Success Scorecard, Open Decisions, Pilot Cohort Sequencing) |
| 12 | Pilot cohort roster not defined | 14 — Pilot-readiness | Product/Adoption | Pre-launch | ❌ Open — awaiting Product/Adoption decision per P2-E5; implementation infrastructure ready (`isMyWorkCohortEnabled()` feature flag gate) |
| 13 | Success scorecard not finalized | 14 — Pilot-readiness | Product/Adoption | Pre-launch | ❌ Open — P2-E3 spec exists; KPI bands and measurement thresholds require Product finalization |

### Blocker Resolution Process

- Domain owners update blocker status when gates are met
- Platform lead verifies integration test evidence
- Product lead approves governance and rollout gate resolution
- This register is updated to reflect current status

---

## 8. Acceptance Gate Reference

P2-C5 is primary evidence for two gates:

### Publication Gate

| Field | Value |
|---|---|
| **Gate** | Publication gate |
| **Pass condition** | First-release required sources are classified and launch-critical sources publish correctly |
| **P2-C5 evidence** | Publication readiness status (§1), integration test results (§2) |
| **Primary owner** | Platform + Domain owners |

### Pilot-Readiness Gate

| Field | Value |
|---|---|
| **Gate** | Pilot-readiness gate |
| **Pass condition** | Pilot cohort has defined rollout path and measurable success scorecard |
| **P2-C5 evidence** | Pilot cohort definition (§4), launch checklist (§5), rollout posture (§6), blocker status (§7) |
| **Primary owner** | Adoption / Product |

---

## 9. Locked Decisions

| Decision | Locked Resolution | P2-C5 Consequence |
|---|---|---|
| Rollout posture | **Targeted pilot / phased rollout first** | No company-wide switch on day one; pilot validates before expansion |
| First-release source scope | **Wave 1 business-core scope** | All 5 named sources must pass publication gates before pilot launch |

---

## 10. Register Precedence

| Deliverable | Relationship to P2-C5 |
|---|---|
| **P2-C1** — Source Tranche Register | P2-C5 inherits source classification and gate status from P2-C1 |
| **P2-C2** — Notification Mapping | P2-C5 tracks notification integration test readiness per P2-C2 |
| **P2-C3** — Navigation Matrix | P2-C5 validates navigation scenarios from P2-C3 |
| **P2-C4** — Handoff Criteria | P2-C5 validates handoff scenarios from P2-C4 |
| **P2-E3** — Success Scorecard | P2-E3 defines the success metrics P2-C5 requires for pilot-readiness gate |
| **P2-E5** — Pilot Cohort Sequencing | P2-E5 defines the detailed rollout sequencing that P2-C5's rollout posture summarizes |

This register is updated as blockers are resolved and sources achieve publication-ready status. All updates require Platform-lead approval.

---

**Last Updated:** 2026-03-20
**Governing Authority:** [Phase 2 Plan §7.1, §10.3, §14, §19](../03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md)
