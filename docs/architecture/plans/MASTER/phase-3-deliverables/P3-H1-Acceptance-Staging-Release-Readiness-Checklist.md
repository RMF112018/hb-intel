# P3-H1: Acceptance, Staging, and Release-Readiness Checklist

| Field | Value |
|---|---|
| **Doc ID** | P3-H1 |
| **Phase** | Phase 3 |
| **Workstream** | H — Validation, staging, and acceptance |
| **Document Type** | Active Reference |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; updated as implementation progresses and evidence is collected |
| **Last Reviewed Against Repo Truth** | 2026-03-25 |
| **References** | [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md); [Phase 3 Deliverables README](README.md); [current-state-map](../../../blueprint/current-state-map.md); all active Phase 3 deliverables and governing T-files (P3-A1 through P3-J1; P3-E12 retained only as a superseded historical reference) |

---

## Checklist Statement

This is the **execution-ready acceptance checklist** for Phase 3 Project Hub. It operationalizes the acceptance gates in Phase 3 plan §18 into trackable checklist items, defines staging scenarios for validation, establishes release-readiness criteria, and carries the explicit Phase 3 defer list from §22 into implementation tracking.

This is an **Active Reference** — a living document updated as implementation progresses and evidence is collected. Unlike the locked contracts and specifications in Workstreams A–G and J, this checklist evolves during Phase 3 execution to reflect the current governed module family, the current lane-acceptance doctrine, and current release-readiness evidence.

Phase 3 is complete only when all relevant §18 gates pass with evidence. P3-G3 provides the lane-specific acceptance framework that this checklist tracks.

---

## Scope

### This checklist governs

- Acceptance gate tracking (pass/fail status per criterion)
- Staging scenario definitions and execution tracking
- Release-readiness criteria
- Phase 3 defer list (explicit future-scope items)
- Evidence collection tracking
- Module-level acceptance summaries for the full current governed Phase 3 module family

### This checklist does NOT govern

- Gate definitions — see [Phase 3 Plan §18](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
- Lane-specific acceptance definitions — see [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md)
- Full module acceptance matrices — see the governing module T-file acceptance guides
- Deliverable production status outside the current Phase 3 deliverable index — see [README](README.md)

---

## 1. Acceptance Gate Checklist — Summary

| Gate | §18 ref | Items | Status | Owner |
|---|---|---|---|---|
| Cross-lane contracts | §18.1 | 8 | **Complete** | Architecture + Experience / Shell |
| Project activation | §18.2 | 4 | **Complete** | Platform / Core Services |
| Home/canvas | §18.3 | 8 | **Complete** | Experience / Shell + Project Hub |
| Shared spines | §18.4 | 6 | Implemented — Evidence Pending (5 Complete, 1 Evidence Pending) | Platform / Core Services + Project Hub |
| Core modules | §18.5 | 135 | In Progress (~96 Complete, ~10 Evidence Pending, ~25 In Progress, ~2 Partially Validated, ~2 Not Started) | Architecture + Project Hub |
| Reporting | §18.6 | 20 | In Progress (3 Complete, 2 In Progress, 15 Not Started) | Project Hub |
| Validation | §18.7 | 16 | In Progress (4 Complete, 2 In Progress, 1 Evidence Pending, 9 Not Started) | Architecture + Experience / Shell |
| **Total** | | **197** | | |

Status note: `Implemented — Evidence Pending` means repo-truth implementation exists, but H1 staging/evidence collection is still incomplete. `Complete` is reserved for rows backed by explicit acceptance-sweep or contract-complete repo truth.

---

## 2. Cross-Lane Contract Checklist (§18.1)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 2.1 | Same canonical project identity — PWA resolves from route, SPFx from siteUrl during web part initialization before any project content renders | Complete | README Stage 1.1 (`@hbc/models` v0.4.0 — `IProjectRegistryRecord`), Stage 10.1 (`resolveSpfxProjectContext` wired into web part init, `HbcSmartEmptyState` fallback), Stage 10.3 (13-scenario escalation map building deep links from canonical `projectId`) | P3-B1 §2, P3-G2 §5, P3-G3 §3.1 |
| 2.2 | Same membership validation — P3-A2 rules enforced in both lanes | Complete | README Stage 2.1 (`resolveProjectRole` — 9 eligibility paths), Stage 2.2 (`validateProjectAccess`, `ProjectMembershipGate`), Stage 2.3 (module visibility matrix, PER scope helpers) | P3-A2 §6, P3-G3 §3.2 |
| 2.3 | Project Hub root entry and smart project switching — multi-project `/project-hub` lands on portfolio root first, single-project `/project-hub` auto-routes to `/project-hub/{projectId}`, PWA switching uses same-section resolution with Control Center fallback, SPFx remains host-aware | Complete | README Stage 4.1 (portfolio-root routing), Stage 4.3 (`resolveProjectSwitch` with same-section resolution and Control Center fallback, Back to Portfolio with restored portfolio-root state), Stage 10.1 (SPFx host-aware init) | P3-B1 §2, §5; P3-G3 §3.3 |
| 2.4 | Cross-lane handoff identity — projectId preserved during SPFx<->PWA | Complete | README Stage 0.4 (`buildPwaDeepLink` with `projectId`, `module`, `action` params), Stage 4.4 (`parseDeepLinkParams` + `buildTargetPathFromDeepLink` for inbound), Stage 10.3 (`buildProjectHubEscalationUrl` — 108 tests) | P3-G2 §5, P3-G3 §3.4 |
| 2.5 | No context loss during handoff — deep-link handler processes arrival and invalid or unauthorized targets remain in-shell | Complete | README Stage 4.4 (deep-link parsing), Stage 4.5 (mismatch reconciliation, unauthorized/invalid contexts render in-shell `HbcSmartEmptyState`, browser location stable), Stage 10.1 (unresolved SPFx sites show smart empty state) | P3-B1 §6.1, P3-G3 §3.5 |
| 2.6 | PER scope validation enforced — PER non-membership scoping applied in both lanes | Complete | README Stage 2.3 (`isPerRole`, `canPerAnnotate`, `canPerPushToTeam`, `getPerRestrictions`), Stage 2.4 (`getActivePerOverrides` with expiry-aware filtering via `resolveOverrideLifecycleStatus`) | P3-A2 §3.2, P3-G3 §3.6 |
| 2.7 | PER vs. membership distinction — review-layer access does not imply project membership in either lane | Complete | README Stage 2.3 (`resolvePerEligibility` separate from `resolveProjectRole`; department scope, C-suite, and override paths distinct from membership), Stage 2.1 (membership flags on `ProjectRole` type explicit) | P3-A2 §6.4, P3-G3 §3.7 |
| 2.8 | projectId normalization in handoff — all outbound deep links use projectId; projectNumber inbound normalized via registry before any cross-lane handoff or return-link generation | Complete | README Stage 1.2 (`normalizeProjectIdentifier` — UUID vs `##-###-##` detection, redirect signaling), Stage 4.4 (deep-link normalization), Stage 10.3 (all escalation deep links use `projectId`) | P3-A1 §3.4, P3-G2 §5.1, P3-G3 §3.8 |

---

## 3. Project Activation Checklist (§18.2)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 3.1 | Valid activation transaction — setup/handoff creates valid project record | Complete | README Stage 1.3 (`validateActivationPreconditions` — 8 checks, `buildRegistryRecord`, `@hbc/provisioning` v0.3.0), Stage 1.4 (`HandoffActivationInput`, `buildRegistryRecordFromHandoff`, v0.3.1) | P3-A1, P3-G3 §4.1 |
| 3.2 | Routeable context — activated project has valid route in PWA and site in SPFx | Complete | README Stage 1.1 (`IProjectRegistryRecord` with `siteUrl`), Stage 1.5 (`IProjectRegistryService.getBySiteUrl`), Stage 4.1 (PWA project routing), Stage 10.1 (SPFx `siteUrl`-based resolution) | P3-A1, P3-G3 §4.2 |
| 3.3 | No partial activation — incomplete activation rejected, no orphaned records | Complete | README Stage 1.3 (`validateActivationPreconditions` — atomic rejection of incomplete activations, 8 precondition checks per P3-A1 §5.2) | P3-A1, P3-G3 §4.3 |
| 3.4 | Department reclassification — department change triggers downstream visibility recalculation; authority scopes recalculated; active PER overrides suspended pending re-grant | Complete | README Stage 1.6 (`validateReclassificationAuthority`, `executeDepartmentReclassification`, Manager of OpEx approval, PER override suspension via `suspendPerOverridesForDepartmentChange`, `@hbc/data-access` v0.7.0) | P3-A1 §4.3, P3-A2 §4.3, P3-G3 §4.4 |

---

## 4. Home/Canvas Checklist (§18.3)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 4.1 | Canvas-first home — `@hbc/project-canvas` renders in both lanes on the project-scoped Control Center route | Complete | README Stage 6.1 (`project-canvas` v0.1.0 — mandatory tile definitions), Stage 6.2 (tile implementations), Stage 10.2 (`DashboardPage` serves Home/Canvas in SPFx) | P3-C1, P3-C3, P3-G3 §5.1 |
| 4.2 | Mandatory operational core — all 5 surfaces present in both lanes | Complete | README Stage 6.1 (14 reference tiles including `project-health`, `project-work-queue`, `project-activity`, `related-items`, identity header), Stage 6.2 (all tile implementations wired) | P3-C2, P3-G3 §5.2 |
| 4.3 | Governance tiers — locked/role-default/optional enforced | Complete | README Stage 6.1 (`PROJECT_ROLE_DEFAULT_TILES` mapping 7 roles), Stage 6.3 (personalization infrastructure — editor, API, mandatory enforcement, role defaults from SF13/ADR-0102) | P3-C1, P3-G3 §5.3 |
| 4.4 | Personalization — governed adaptive composition works in both lanes | Complete | README Stage 6.3 (`useCanvasComplexity` bridge hook, `@hbc/project-canvas` v0.2.0), Stage 10.4 (SPFx personalization persistence wired) | P3-C3, P3-G3 §5.4 |
| 4.5 | Persistence — PWA IndexedDB+server; SPFx localStorage immediate save plus SharePoint-list rehydrate/mirror sync | Complete | README Stage 6.4 (`createSpfxCanvasStorageAdapter` in `@hbc/project-canvas` v0.2.1), Stage 10.4 (`createProjectHubSpfxCanvasPersistence` — localStorage save, reload recovery, reset-to-role-default, corrupt-state fallback, SharePoint-list rehydrate — 67 tests) | P3-C3 §6, P3-G3 §5.5 |
| 4.6 | Reset to role-default — works in both lanes; mandatory tiles preserved | Complete | README Stage 6.1 (`PROJECT_ROLE_DEFAULT_TILES`), Stage 6.3 (reset-to-default in personalization infrastructure), Stage 10.4 (SPFx reset falls back to governed role defaults) | P3-C1, P3-G3 §5.6 |
| 4.7 | Complexity tiers — essential/standard/expert render per preference | Complete | README Stage 6.3 (`useCanvasComplexity` — `@hbc/complexity` context to canvas tile variant rendering, `@hbc/project-canvas` v0.2.0) | P3-C1, P3-G3 §5.7 |
| 4.8 | Role-based visibility — tiles hidden per P3-C2 §8 (no empty placeholders) | Complete | README Stage 2.5 (`getTileVisibility`, `getVisibleTileKeys`, `getSpineVisibility` — PER/Viewer/External tile restrictions enforced, `@hbc/auth` v0.7.0) | P3-C2 §8, P3-G3 §5.8 |

---

## 5. Shared Spine Checklist (§18.4)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 5.1 | Health spine — PWA full detail + explainability; SPFx shared component | Complete | README Stage 3.1 (SF21 health-pulse foundation), Stage 6.2 (health tile fully implemented via SF21) | P3-D2, P3-G3 §6.1 |
| 5.2 | Activity spine — PWA full timeline; SPFx tile view | Complete | README Stage 3.2 (`ProjectActivityRegistry`, `aggregateActivityFeed` pipeline, `@hbc/features-project-hub` v0.1.0), Stage 6.2 (`ProjectActivityTile` with complexity variants) | P3-D1, P3-G3 §6.2 |
| 5.3 | Work Queue spine — PWA full feed+panel+team; SPFx tile+panel | Complete | README Stage 3.3 (SF29/ADR-0115 mature), Stage 6.1 (`project-work-queue` mandatory tile), Stage 6.2 (`ProjectWorkQueueTile` implemented) | P3-D3, P3-G3 §6.3 |
| 5.4 | Related Items spine — PWA full panel+AI; SPFx compact panel | Complete | README Stage 3.4 (SF14 mature), Stage 6.1 (`related-items` upgraded to mandatory+lockable), Stage 6.2 (related items tile fully implemented via SF14) | P3-D4, P3-G3 §6.4 |
| 5.5 | Spine data consistency — same data for same projectId in both lanes | Complete | README Stage 3.5 (all 4 spine adapter interfaces mature — `@hbc/models` v0.5.0), Stages 10.1–10.2 (SPFx resolves same `projectId` from registry before rendering, same spine contracts used in both lanes) | P3-A3, P3-G3 §6.5 |
| 5.6 | Module publications flowing — all adapters registered and publishing | Implemented — Evidence Pending | Financial T08 (10 activity, 10 health, 8 WQ), Schedule T09 (11 related-items, 10 WQ), Constraints T06 (4 ledger BIC teams, publication authority), Permits T05 (15 WQ rules), Safety T09 (25 WQ rules — in progress), Closeout T08 (spine seams), Startup T08 (all 4 spines), SubEx T08 (health/WQ/related/activity), Warranty T09 (24 activity, 20 WQ), Reports T08 (4 activity, 1 health, 3 WQ). QC spine publication (§6.9.8) still in progress. | P3-A3 §7, P3-G3 §6.6 |

---

## 6. Core Module Checklist (§18.5)

Stage 10.2 applies to this entire section. High-level module acceptance is not satisfied by placeholder routes or generic empty states in the SPFx lane. For every governed module family below, SPFx evidence must show either:

- a real in-lane module surface matching the `Required` / `Broad` / `Baseline-visible` / `Read-only` posture in P3-G1, or
- an explicit `Launch-to-PWA` affordance carrying canonical `projectId` context for the deeper workflow

Module-by-module lane proof is part of release readiness, not optional cleanup.
The minimum governed Stage 10.2 SPFx module family for that proof is: Financial, Schedule, Constraints, Permits, Safety, Reports, QC, Project Closeout, Project Startup, Subcontract Execution Readiness, and Warranty.

### 6.1 Financial

For the full 48-item Financial acceptance gate, see **P3-E4-T09 §20**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E4-T09 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.1.1 | Budget CSV import — atomic validation, identity resolution, `canonicalBudgetLineId` stability across re-imports | Complete | README Stage 7.1 T02 (`@hbc/features-project-hub` v0.1.1 — budget record model, canonical identity, atomic import validation) | P3-E4-T02 §2-§3; P3-G1 §4.1 |
| 6.1.2 | Separated cost model — `jobToDateActualCost`, `committedCosts`, `forecastToComplete` are always distinct; `costExposureToDate` = actuals + committed | Complete | README Stage 7.1 T02 (separated cost fields in budget record model, v0.1.1) | P3-E4-T02 §3.2; P3-E2 §3.2 |
| 6.1.3 | Versioned forecast ledger — Working / ConfirmedInternal / PublishedMonthly / Superseded lifecycle; no unlock-in-place; derivation-based editing | Complete | README Stage 7.1 T03 (versioned forecast ledger with 4-state lifecycle, derivation-based editing, `@hbc/features-project-hub` v0.1.2) | P3-E4-T03 §3; P3-E2 §3.3 |
| 6.1.4 | Forecast checklist gate enforced — confirmation blocked when required items incomplete or `staleBudgetLineCount > 0` | Complete | README Stage 7.1 T03 (confirmation blocked on incomplete checklist or stale budget lines, v0.1.2) | P3-E4-T03 §4.3 |
| 6.1.5 | Financial Forecast Summary editing — PM-editable fields on working version only; all derived fields recompute correctly | In Progress | | P3-E4-T04 §5; P3-E2 §3.2. T09 notes 4 items pending T04 data model (`IFinancialForecastSummary`, `IGCGRLine`) |
| 6.1.6 | GC/GR working model — version-scoped; editable on working version only; aggregate feeds Forecast Summary | In Progress | | P3-E4-T04 §6. T09 notes pending T04 |
| 6.1.7 | Cash Flow model — 13 actuals (read-only) + 18 forecast months; A/R aging read-only; cumulative chart with deficit shading | Complete | README Stage 7.1 T05 (`ICashFlowActualRecord` 21 fields, `ICashFlowForecastRecord` 14 fields, `ICashFlowSummary` 14 fields, A/R aging display model, `@hbc/features-project-hub` v0.1.4) | P3-E4-T05 §7 |
| 6.1.8 | Buyout sub-domain — dollar-weighted completion metric; `ContractExecuted` gate enforced via issued Subcontract Execution Readiness decision / gate projection per P3-E13; savings recognition and three-destination disposition workflow | Complete | README Stage 7.1 T06 (`IBuyoutLineItem` 19 fields, 7 procurement statuses, `ContractExecuted` gate via P3-E13, three-destination savings disposition, `@hbc/features-project-hub` v0.1.5) | P3-E4-T06 §8; P3-E13-T07 §1 |
| 6.1.9 | Report-candidate designation — at most one `isReportCandidate = true` per project; P3-F1 publication handoff handler implemented | In Progress | | P3-E4-T03 §3.6; P3-E4-T09 §16. T09 notes stub-ready via `promoteToPublished()` — B-FIN-03 |
| 6.1.10 | PER annotation on confirmed versions — working version not visible to PER; `canonicalBudgetLineId`-anchored; carry-forward on derivation | Complete | README Stage 7.1 T08 (`IFinancialAnnotationAnchor` — version-aware field/section/block anchors, `ICarriedForwardAnnotation` with value-change flag and PM disposition, `@hbc/features-project-hub` v0.1.7) | P3-E4-T08 §15; P3-E2 §3.5 |
| 6.1.11 | All Activity Spine events, Health Spine metrics, and Work Queue items implemented per P3-E4-T08 §14 | Complete | README Stage 7.1 T08 (10 activity spine event types, 10 health spine metric definitions, 8 work queue item types, v0.1.7) | P3-E4-T08 §14 |
| 6.1.12 | Spreadsheet replacement notes verified | In Progress | Financial Replacement Crosswalk package (FRC-00 through FRC-05) maps all 9 operating files to runtime equivalents with 14-column crosswalk, 34-record runtime model, field-level mappings, mutability matrix, backend ties, workflow states, cutover readiness, and three-way gap analysis. P3-E3 §2 and P3-E4 updated with crosswalk references. Pending: runtime UI surfaces and parallel-run validation. | P3-E3 §2; [`financial/FRC-00`](financial/FRC-00-Financial-Replacement-Crosswalk.md) |

### Financial Governance and Operating-Surface Verification

- [ ] `FIN-01` posture has been incorporated into the Financial master specification and viewer-first implementation language has been removed.
- [ ] `FIN-02` action posture has been reflected in the executable Financial workflow files.
- [ ] `FIN-03` lane ownership has been applied to Financial capability routing and surface design.
- [ ] `FIN-04` route and context contract has been applied to the Financial route family and project-switch behavior.
- [ ] Financial surfaces expose actionable-here vs view-only vs escalate vs blocked / stale / waiting posture without hunting.
- [ ] Canonical project-scoped routing exists for Financial home and all required sub-surfaces.
- [ ] PWA and SPFx behavior is aligned to the Financial lane matrix.
- [ ] Acceptance evidence demonstrates that Financial is operational, not merely visible.

### Evidence Expectation
Financial readiness cannot be marked complete based only on rendered UI or placeholder routes. Evidence must show direct user action, correct route ownership, visible posture, and correct lane behavior.

### 6.2 Schedule

For the comprehensive 50-item Schedule acceptance gate, see **P3-E5-T11 §25**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E5-T11 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.2.1 | Schedule file ingestion (XER/XML/CSV) — PWA Required, SPFx Launch-to-PWA | Complete | README Stage 7.2 T01 (`ICanonicalScheduleSource`, `IScheduleVersionRecord`, import validation rules, `@hbc/features-project-hub` v0.1.9) | P3-G1 §4.2; P3-E5-T01 §1 |
| 6.2.2 | Frozen import snapshots created on every ingestion — `ScheduleVersionRecord` + `ImportedActivitySnapshot` immutable | Complete | README Stage 7.2 T01 (`IImportedActivitySnapshot` with full P6 field mapping, v0.1.9) | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.3 | Durable activity identity established (`externalActivityKey`) and maintained across versions via `ActivityContinuityLink` | Complete | README Stage 7.2 T01 (`IActivityContinuityLink`, `deriveExternalActivityKey`, v0.1.9) | P3-E5-T01 §1 |
| 6.2.4 | Canonical source designation — one `CanonicalScheduleSource` per project; secondary sources for comparison only | Complete | README Stage 7.2 T01 (`ICanonicalScheduleSource` 12 fields, v0.1.9) | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.5 | Governed baseline management — `BaselineRecord` with PE approval gate | Complete | README Stage 7.2 T01 (`IBaselineRecord` 13 fields, 4 baseline types, v0.1.9) | P3-E5-T01 §1 |
| 6.2.6 | Dual-truth commitment layer — `ManagedCommitmentRecord` with `reconciliationStatus` tracking alignment with source truth | Complete | README Stage 7.2 T02 (`IManagedCommitmentRecord` 24 fields, 3 commitment types, 7 reconciliation statuses, v0.1.10) | P3-E5-T02 §2; P3-E2 §4.2 |
| 6.2.7 | Reconciliation audit trail (`ReconciliationRecord`) preserved | Complete | README Stage 7.2 T02 (`IReconciliationRecord` 13 fields, 5 trigger types — forensic audit trail, v0.1.10) | P3-E5-T02 §2 |
| 6.2.8 | Stage-gated publication lifecycle — `Draft -> ReadyForReview -> Published -> Superseded`; executive review and Health Spine consume Published layer only | Complete | README Stage 7.2 T03 (`IPublicationRecord` 21 fields, 4-state lifecycle, `validatePublicationAdvance`, v0.1.11) | P3-E5-T03 §3; P3-E2 §4.3 |
| 6.2.9 | Milestone records are view projections from Published layer; not an independent source of truth | Complete | README Stage 7.2 T02 (`IMilestoneRecord` 24 fields, 8 types, 7 calculated statuses — view projections, v0.1.10) | P3-E5-T02 §4; P3-E2 §4.3 |
| 6.2.10 | Field work packages — `FieldWorkPackage` as child of imported activity by location/trade/time | Complete | README Stage 7.2 T05 (`IFieldWorkPackage` 30 fields, 7 statuses, `ILocationNode` 7-level hierarchy, v0.1.13) | P3-E5-T05 §6 |
| 6.2.11 | Commitment and blocker management — `CommitmentRecord`, `BlockerRecord`, `ReadinessRecord` | Complete | README Stage 7.2 T05 (`IFieldCommitmentRecord` 22 fields, `IBlockerRecord` 18 fields/14 types, `IReadinessRecord`, v0.1.13) | P3-E5-T05 §6 |
| 6.2.12 | Look-ahead planning with PPC — `LookAheadPlan`; PPC formula and window governed | Complete | README Stage 7.2 T05 (`ILookAheadPlan` 16 fields, `calculatePPC`, 4-window rolling default, v0.1.13) | P3-E5-T05 §6 |
| 6.2.13 | Three-tier progress verification — reported -> verified -> authoritative; `ProgressClaimRecord` + `ProgressVerificationRecord` | Complete | README Stage 7.2 T05 (`IProgressClaimRecord` 16 fields, `IProgressVerificationRecord` 13 fields, 6 verification methods, 4 outcomes, v0.1.13) | P3-E5-T05 §8 |
| 6.2.14 | Governed roll-up rules — work-package to activity to milestone; all methods configurable | Complete | README Stage 7.2 T05 (roll-up rules §9 — blocker severity, readiness, commitment status, weighted progress, v0.1.13) | P3-E5-T05 §9 |
| 6.2.15 | Scenario branch management — `ScenarioBranch` from specific version + baseline; promotion workflow | Complete | README Stage 7.2 T04 (`IScenarioBranch` 16 fields, 6 types, 7-state lifecycle, 4 promotion dispositions, PE gate, v0.1.12) | P3-E5-T04 §5 |
| 6.2.16 | Composite schedule grading — `ScheduleQualityGrade` with governed `GradingControlScore` array | Complete | README Stage 7.2 T07 (`IScheduleQualityGrade` — composite grading with 10 governed controls, A/B/C/D/F grades, v0.1.15) | P3-E5-T07 §11 |
| 6.2.17 | Multi-factor confidence scoring — `ConfidenceRecord` with 8 governed factor scores | Complete | README Stage 7.2 T07 (`IConfidenceRecord` — 8-factor governed confidence, High/Moderate/Low/VeryLow labels, v0.1.15) | P3-E5-T07 §11 |
| 6.2.18 | `RecommendationRecord` never silently mutates authoritative schedule truth; promotion creates draft records only | Complete | README Stage 7.2 T07 (`IRecommendationRecord` — 9 types, 6 dispositions, 5 promotion paths, never mutates schedule truth, v0.1.15) | P3-E5-T07 §12 |
| 6.2.19 | Governed causation taxonomy — `CausationCode` records; applicable by record type | Complete | README Stage 7.2 T07 (`ICausationCode` — hierarchical taxonomy, 13 root categories, 9 applicable record types, v0.1.15) | P3-E5-T07 §13 |
| 6.2.20 | Offline-first sync — `IntentRecord` durable intent log; sync state lifecycle; conflict routing for governed records | In Progress | | P3-E5-T08 §15. T08 contract-level implementation complete (`IIntentRecord` 12 fields, 7 offline-capable record types, 4 conflict types); runtime replay/sync pending |
| 6.2.21 | `@hbc/field-annotations` scoped to Published layer only; no annotation on draft or managed commitment records | In Progress | | P3-E5-T09 §18; P3-E2 §4.6. T09 contract specifies 5 annotatable surfaces and 4 restrictions; shared package integration pending |
| 6.2.22 | `@hbc/related-items` integration — 11 schedule object types; 11 relationship types | In Progress | | P3-E5-T09 §18. T09 contract specifies 11 relationship type mappings; B-SCH-01 shared package integration pending |
| 6.2.23 | `@hbc/my-work-feed` `ScheduleWorkAdapter` registered — 10 work item types | In Progress | | P3-E5-T09 §18. T09 contract specifies 10 work item types with trigger/assignee configs; shared package registration pending |
| 6.2.24 | All governed thresholds, grading rules, roll-up rules, and taxonomies configurable by Manager of Operational Excellence only | Complete | README Stage 7.2 T10 (`IGovernedPolicySet` with 20 governed policy areas, Manager of OpEx exclusive configurability, v0.1.17) | P3-E5-T09 §20; P3-E2 §4.4 |
| 6.2.25 | Package blockers B-SCH-01 through B-SCH-05 resolved or formally deferred with owner sign-off | In Progress | | P3-E5-T11 §26. T11 notes 5 blockers stub-ready; formal shared package integration pending |
| 6.2.26 | Full 50-item acceptance gate in P3-E5-T11 §25 passes | Partially Validated | | P3-E5-T11 §25. T11 notes 40 of 49 items satisfied at contract level; 9 items are runtime/integration/UAT scope |

### 6.3 Constraints

For the comprehensive 53-item Constraints acceptance gate, see **P3-E6-T08 §8.2**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E6-T08 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.3.1 | Four-ledger workspace implemented: Risk, Constraint, Delay, and Change ledgers each with independent CRUD and lifecycle — both lanes | Complete | README Stage 7.3 T01–T04 (Risk v0.1.19, Constraint v0.1.20, Delay v0.1.21, Change v0.1.22 — all with independent CRUD and lifecycle) | P3-E6-T01-T04 |
| 6.3.2 | No single-record-type model: all four are peer ledgers; Constraint is not parent of Delay or Change | Complete | README Stage 7.3 T01–T04 (each ledger has independent record model and lifecycle; T05 lineage uses spawn paths not parent-child) | P3-E6 master index |
| 6.3.3 | Risk probability/impact assessment and riskScore working — both lanes | Complete | README Stage 7.3 T01 (`IRiskRecord` 24 fields, 5-level probability/impact, `riskScore` = probability × impact, v0.1.19) | P3-E6-T01 §1 |
| 6.3.4 | Constraint lifecycle enforced; overdue detection working — both lanes | Complete | README Stage 7.3 T02 (`IConstraintRecord` 26 fields, 7-state lifecycle, C-05 overdue detection, `calculateDaysOpen`, v0.1.20) | P3-E6-T02 §2 |
| 6.3.5 | Delay: Integrated + ManualFallback schedule reference modes; ManualFallback self-contained without P3-E5 — both lanes | Complete | README Stage 7.3 T03 (`IDelayRecord` ~35 fields, dual `ScheduleReferenceMode`, D-03 consistency validation, v0.1.21) | P3-E6-T03 §3.2 |
| 6.3.6 | Delay time/commercial impact separation enforced; `separationConfirmed` gate at Quantified transition | Complete | README Stage 7.3 T03 (`ITimeImpactRecord`, `ICommercialImpactRecord`, `separationConfirmed` gate at Quantified transition, v0.1.21) | P3-E6-T03 §3.4 |
| 6.3.7 | Change Ledger ManualNative mode working; canonical HB Intel identity preserved; Procore schema defined (not wired) | Complete | README Stage 7.3 T04 (`IChangeEventRecord` ~25 fields, `IProcoreMappingRecord` 12 fields null in ManualNative Phase 3, canonical identity CE-01, v0.1.22) | P3-E6-T04 |
| 6.3.8 | Cross-ledger spawn lineage with immutable `LineageRecord`; lineage displayed on all detail views | Complete | README Stage 7.3 T05 (`ILineageRecord` 13 fields immutable, `ICrossLedgerLink` bidirectional, 3 governed spawn paths, L-02 immutability rule, v0.1.23) | P3-E6-T05 |
| 6.3.9 | No hard delete enforced across all four ledgers | Complete | README Stage 7.3 T01 R-02, T02 C-03, T03 D-05, T04 CE-02 — all enforce no hard delete | P3-E6 master index |
| 6.3.10 | Published snapshots and review packages functional; PER annotation scoped to published state only | Complete | README Stage 7.3 T06 (`ILedgerRecordSnapshot`, `IReviewPackage` with RP-### numbering, PER annotates published only per authority matrix, v0.1.24) | P3-E6-T06 |
| 6.3.11 | All governed taxonomies and thresholds sourced from configuration; not hard-coded | Complete | README Stage 7.3 T06 (13 governed taxonomy areas per §6.6, master BIC team registry — 32 governed teams, v0.1.24) | P3-E6-T06 §6.6 |
| 6.3.12 | Package blockers B-CON-01 through B-CON-03 resolved or deferred with sign-off | In Progress | | P3-E6-T08 §8.3. Blockers stub-ready; formal shared package integration pending |
| 6.3.13 | Full 53-item acceptance gate in P3-E6-T08 §8.2 passes | Partially Validated | | P3-E6-T08 §8.2. Contract-level implementation complete; runtime/integration items pending |
| 6.3.14 | Spreadsheet replacement notes included | Not Started | | P3-E3 §4 |

### 6.4 Permits

See **P3-E7-T08 §4** for the full 52-item acceptance gate (AC-PRM-01 through AC-PRM-52). The high-level gates below are entry conditions; the T08 gate is the authoritative completion criterion.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.4.1 | All 7 first-class record types implemented with correct TypeScript interfaces and zero type errors | Complete | README Stage 7.4 T02 (7-family record architecture — `IPermitApplication`, `IIssuedPermit`, `IRequiredInspectionCheckpoint`, `IInspectionVisit`, `IInspectionDeficiency`, `IPermitLifecycleAction`, `IPermitEvidenceRecord`, v0.1.28) | P3-E7-T02; AC-PRM-01 |
| 6.4.2 | No `complianceScore` field exists on any Permits record; derived health only | Complete | README Stage 7.4 T01 (`DerivedHealthTier` — CRITICAL/AT_RISK/NORMAL/CLOSED, no manual complianceScore per §8, v0.1.27) | P3-E7-T04 §4; AC-PRM-05 |
| 6.4.3 | `IssuedPermit.currentStatus` only changes via `PermitLifecycleAction`; direct mutation rejected | Complete | README Stage 7.4 T03 (20-rule transition table, all status changes via immutable action records, direct mutation rejected, v0.1.29) | P3-E7-T03 §4.2; AC-PRM-03 |
| 6.4.4 | All 20 lifecycle action types handled; invalid transitions rejected; terminal state guard active | Complete | README Stage 7.4 T03 (20-rule transition table, terminal status immutability §4.1, `resolveNewStatus` resolver, v0.1.29) | P3-E7-T03 §3; AC-PRM-11-AC-PRM-13 |
| 6.4.5 | Required inspection checkpoint template library seeded; auto-generation on permit creation works | Complete | README Stage 7.4 T04 (14 `MASTER_BUILDING` templates per §1.3 with IBC/NEC/IPC/IMC code references, v0.1.30) | P3-E7-T04 §1; AC-PRM-21-AC-PRM-22 |
| 6.4.6 | Derived compliance health (`derivedHealthTier`) computed correctly for all health conditions | Complete | README Stage 7.4 T01 (`deriveHealthTier` — 5 compliance health signals → derived tier), T04 (9 deficiency-to-health severity mapping rules, `calcExpirationRiskTier`, v0.1.30) | P3-E7-T04 §4; AC-PRM-33-AC-PRM-36 |
| 6.4.7 | All 15 Work Queue rules (WQ-PRM-01 through WQ-PRM-15) fire and resolve correctly | Complete | README Stage 7.4 T05 (15 work queue rules WQ-PRM-01–15 with resolution triggers, v0.1.31) | P3-E7-T05 §3; AC-PRM-39-AC-PRM-43 |
| 6.4.8 | PER annotation layer on IssuedPermit and InspectionVisit; read-only enforcement on PER surface | Complete | README Stage 7.4 T05 (PER annotation scopes for 4 record types — IssuedPermit wildcard, InspectionVisit/Deficiency/Checkpoint field-level, v0.1.31) | P3-E7-T05 §7; AC-PRM-49 |
| 6.4.9 | Data migration complete: all prior IPermit records migrated; no `complianceScore` in migrated data | In Progress | | P3-E7-T07 §1; AC-PRM-51-AC-PRM-52. T07 migration contracts complete (v0.1.33) — field mappings, status mappings, validation checklist defined; runtime migration execution pending |
| 6.4.10 | All 6 shared package blockers (B-PRM-01 through B-PRM-06) resolved | In Progress | | P3-E7-T08 §1. T08 notes 6 blockers stub-ready; formal shared package integration pending |

### 6.5 Safety

Full 60-item acceptance gate: AC-SAF-01 through AC-SAF-60 in **P3-E8-T10 §4**. High-level gates listed here.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.5.1 | SSSP base plan lifecycle (DRAFT -> PENDING_APPROVAL -> APPROVED -> SUPERSEDED) with joint 3-party approval enforced | Complete | README Stage 7.5 T03 (`transitionSSSPStatus`, `isSSSPApprovalComplete` — 3-party sign-off, `isMaterialChange` governed reapproval, v0.1.37) | P3-E8-T03; AC-SAF-01 through AC-SAF-08 |
| 6.5.2 | Weekly inspection template governance, version pinning, and normalized scoring (applicable sections only) operational | Complete | README Stage 7.5 T04 (12-section standard template, `calculateNormalizedScore` applicable-sections-only reweighting, `isTemplatePinningValid`, v0.1.38) | P3-E8-T04; AC-SAF-09 through AC-SAF-14 |
| 6.5.3 | Centralized corrective action ledger accepts all source types; severity-based due dates; overdue computed; verification workflow via `@hbc/workflow-handoff` | Complete | README Stage 7.5 T05 (`isCAOverdue`, `getCAHealthTierImpact`, `shouldEscalateCriticalCA` >4h, `shouldEscalatePendingVerification` >2d, v0.1.39) | P3-E8-T05; AC-SAF-15 through AC-SAF-21 |
| 6.5.4 | Incident tiered privacy model enforced (STANDARD/SENSITIVE/RESTRICTED); `personsInvolved` never exposed outside Safety Manager/Officer; LITIGATED state escalates evidence retention | In Progress | | P3-E8-T05; AC-SAF-22 through AC-SAF-27. T05 contract-level complete (15 visibility rules, `getIncidentVisibility`, `isLitigationHoldActive`, v0.1.39); runtime privacy enforcement pending |
| 6.5.5 | JHA competent-person pre-condition enforced; Daily Pre-Task Plan requires APPROVED JHA reference | Complete | README Stage 7.5 T06 (`canApproveJha` with competent-person pre-condition, `canCreateDailyPreTask` — only APPROVED JHA, `validatePreTaskCompletion`, v0.1.40) | P3-E8-T06; AC-SAF-28 through AC-SAF-33 |
| 6.5.6 | Toolbox talk program operational: governed prompt library, schedule-driven intelligence (Safety Manager review of AI suggestions required before governed), governed closure model | In Progress | | P3-E8-T06; AC-SAF-34 through AC-SAF-40. T06 contract-level complete (`IScheduleRiskMapping`, `validatePromptClosure`, closure types, v0.1.40); AI gap detection and runtime schedule integration pending |
| 6.5.7 | Orientation, subcontractor submissions, certifications, HazCom/SDS, and competent-person designations operational with appropriate expiration sweeps and Work Queue generation | Complete | README Stage 7.5 T07 (`isOrientationComplete`, `computeCertificationStatus` 30-day sweep, `hasSdsComplianceGap`, `shouldCascadeDesignation`, 6 WQ triggers, v0.1.41) | P3-E8-T07; AC-SAF-41 through AC-SAF-47 |
| 6.5.8 | Readiness evaluation engine operational at project/subcontractor/activity levels; HARD blocker cannot be excepted; exceptions and overrides require governed joint workflow | In Progress | | P3-E8-T08; AC-SAF-48 through AC-SAF-54. T08 contract-level complete (`evaluateReadiness` with HARD/SOFT classification, 25 blocker definitions, exception/override workflows, v0.1.42); runtime blocker condition evaluation pending |
| 6.5.9 | Composite safety scorecard published to Project Hub; PER receives sanitized score band (not raw score) and anonymized incident counts only; no annotation affordance anywhere in Safety workspace | In Progress | | P3-E8-T09; AC-SAF-55 through AC-SAF-60. T09 contract-level complete (`ISafetyCompositeScorecard`, `createPERProjection` sanitized, `isExcludedFromAnnotation` always true, v0.1.43); runtime scorecard computation and registration adapter wiring pending |
| 6.5.10 | All 25 Work Queue rules (WQ-SAF-01 through WQ-SAF-25) registered with `@hbc/my-work-feed` and firing correctly | In Progress | | P3-E8-T09 §4; AC-SAF-58. T09 contract defines 25 WQ rules with trigger/resolution catalog (v0.1.43); shared package registration and timing-window runtime pending |

### 6.6 Project Closeout

Full acceptance gate: **P3-E10-T11**. The criteria below summarize the governing Closeout family; use T11 for the full staged implementation and acceptance matrix.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.6.1 | Closeout checklist foundation works — governed template instantiation, overlay bounds, completion percentage logic, and audit trail all behave per T03/T11 Stage 1 | Complete | README Stage 7.8 T03 (70-item governed baseline, 7 sections, overlay rules max 5/section, `calculateOverallCompletionPct`, jurisdiction variants, v0.1.47) | P3-E10-T11 Stage 1 |
| 6.6.2 | Lifecycle state machine and milestones work — 9-state lifecycle, 13 milestones, 8-criterion Archive-Ready gate, and PE approval gating enforced | Complete | README Stage 7.8 T04 (9 states, 13 milestones, `evaluateArchiveReadyCriteria` 8-criterion gate, 3 PE-gated transitions, v0.1.48) | P3-E10-T11 Stage 2; P3-E10-T04 |
| 6.6.3 | Subcontractor Scorecard works — Interim/FinalCloseout model, scoring, approval flow, and PE-approved snapshot API behave per T06/T11 | Complete | README Stage 7.8 T06 (6-section weighted evaluation, `calculateOverallWeightedScore`, `derivePerformanceRating`, submission validation, amendment rules, v0.1.50) | P3-E10-T11 Stage 3 |
| 6.6.4 | Lessons Learned works — rolling lesson capture, impact magnitude derivation, recommendation validation, PE approval, and lessons snapshot API behave per T05/T11 | Complete | README Stage 7.8 T05 (15 categories, `deriveImpactMagnitude` multi-signal engine, 32-verb recommendation validation, `ILessonsLearnedPublicationSnapshot`, v0.1.49) | P3-E10-T11 Stage 4 |
| 6.6.5 | Project Autopsy and Learning Legacy work — pre-survey, pre-briefing pack, findings/actions, legacy outputs, and milestone/publication behavior match T07/T11 | Complete | README Stage 7.8 T07 (12 themes, pre-survey model, `IAutopsyFinding` 18 fields, `ILearningLegacyOutputRecord`, `getOutputPublicationBlockers` 3-condition gate, v0.1.51) | P3-E10-T11 Stage 5 |
| 6.6.6 | Org intelligence and Project Hub consumption stay derived/read-only — LessonsIntelligence, SubIntelligence, and LearningLegacy feed do not mutate source records | Complete | README Stage 7.8 T01 (`canCloseoutMutate` always false, `canClass2IndexBeDirectlyWritten` always false — org intelligence immutability enforced, v0.1.45), T02 (Class 2/3 surface architecture) | P3-E10-T11 Stage 6; P3-E10-T08 |
| 6.6.7 | Shared spine publication and cross-module snapshot seams work — Activity, Health, Work Queue, Related Items, Reports snapshot ingestion, Startup baseline read, and QC continuity seams remain bounded | Complete | README Stage 7.8 T01 (5 cross-module read-only sources per §3.2), T04 (8 WQ trigger rules), T05 (snapshot contract for Reports), T02 (publication state applicability matrix — spine-bounded) | P3-E10-T08; P3-E10-T11 Stage 7 |
| 6.6.8 | Executive review annotation isolation holds across all Closeout sub-surfaces; PE approval remains distinct from PE/PER annotation | Complete | README Stage 7.8 T04 (12-row PE approval authority matrix per §5 — PE approval is lifecycle-gated, distinct from annotation), T02 (publication state model with PE_REVIEW separate from annotation) | P3-E10-T09; P3-E10-T11 Stage 7 |

### 6.7 Project Startup

Full acceptance gate: **P3-E11-T10 §5** (31 acceptance criteria, AC items 1-31). The governing T10 currently records Startup as contract-complete; this checklist continues to track release-readiness evidence, cross-lane verification, and broader Phase 3 integration rather than redefining T10 completion.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.7.1 | `StartupProgram` created at project creation in `DRAFT` state; state machine transitions guarded; invalid transitions return HTTP 409 | Complete | | P3-E11-T10 §5 items 1-2; T01 §4.2 |
| 6.7.2 | `PEMobilizationAuthorization` exclusive to PX role (HTTP 403 on non-PX); all-certifications-`ACCEPTED`-or-`WAIVED` guard enforced (HTTP 400 `UNACCEPTED_CERTIFICATIONS`); open `ProgramBlocker` guard enforced (HTTP 400 `OPEN_PROGRAM_BLOCKERS`) | Complete | | P3-E11-T10 §5 items 3-5; T09 §4 |
| 6.7.3 | `StartupBaseline` created atomically at `BASELINE_LOCKED`; all sub-surface records read-only post-lock (HTTP 405 on mutation); baseline immutable to all callers | Complete | | P3-E11-T10 §5 items 6, 23, 28; T02 §7.2 |
| 6.7.4 | Task Library instantiated from governed template; `taskNumber` and `title` immutable; `TaskBlocker` lifecycle per T02 §3.4 | Complete | | P3-E11-T10 §5 items 7-9; T03 §3 |
| 6.7.5 | Safety Readiness instantiated from governed template; Fail items require documented `SafetyRemediationRecord` routing (`remediationNote`, assignee, due date) before certification, while open remediations remain reviewable unless PX-escalated or blocker-backed; Safety module non-interference verified by integration test | Complete | | P3-E11-T10 §5 items 10-12; T07 §4, §7 |
| 6.7.6 | Section 4 Permit Posting non-interference verified by integration test; `PermitVerificationDetail` required fields enforced for both `Yes` evidence and `No` discrepancy routing | Complete | | P3-E11-T10 §5 items 13-14; T07 §9.1, §9.4-§9.5 |
| 6.7.7 | Contract Obligations lifecycle per T04 §4; `WAIVED` requires PX and `waiverNote`; certification follows the T04 §7 review/routing/acknowledgment gate for monitored and near-due obligations | Complete | | P3-E11-T10 §5 items 15-16; T04 §4, §7 |
| 6.7.8 | Responsibility Matrix certification requires named `Primary` coverage for all assignment-bearing PM/Field task categories and `acknowledgedAt` completion for all critical-category `Primary` assignments; governed row `taskDescription` remains immutable | Complete | | P3-E11-T10 §5 items 17-18; T05 §4, §9.1-§9.2 |
| 6.7.9 | PM Plan approval flow enforced; `EXECUTION_BASELINE` certification blocked until the plan is approved, T06 critical fields are populated, and PM/PX signatures are present; `ExecutionAssumption` uses the T06 categorized field model with conditional `successMeasure` requirement | Complete | | P3-E11-T10 §5 items 19-21; T06 §2.1, §2.3, §7 |
| 6.7.10 | Closeout reads `StartupBaseline` via read-only API; HTTP 403 for unauthorized callers; HTTP 405 on mutation | Complete | | P3-E11-T10 §5 items 22-23; P3-E10 |
| 6.7.11 | All Activity Spine events, Health metrics, Work Queue item types, and Related Items registrations fire on their governed T08 trigger conditions and relationship contracts | Complete | | P3-E11-T10 §5 items 24-26; T08 §1-§4 |
| 6.7.12 | `@hbc/field-annotations` writes isolated from operational records; post-lock annotation continues; Startup publishes to shared spines/canvas only and does not publish to Reports or org-intelligence indexes | Complete | | P3-E11-T10 §5 items 27-28; T08 §5, T09 §6 |
| 6.7.13 | Canvas tile registered (`StartupCanvasTileAdapter`); pre-lock and post-lock tile states correct | Complete | | P3-E11-T10 §5 items 29-30; T09 §10 |
| 6.7.14 | All Startup surfaces use `WorkspacePageShell`; all components sourced from `@hbc/ui-kit`; all empty sub-surface states use `HbcSmartEmptyState` | Complete | | P3-E11-T10 §5 item 31; see §6.12.9 |

### 6.8 Subcontract Execution Readiness

Full acceptance gate: **P3-E13-T08**. The criteria below summarize the governed readiness-case model; use T08 for the full validation checklist and evidence expectations.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.8.1 | `SubcontractReadinessCase` exists as the parent source-of-truth model; one-active-case rule enforced for same legal entity + award intent; material identity changes supersede/void and create successor case | Complete | | P3-E13-T08 criteria 1-4 |
| 6.8.2 | Governed requirement generation is implemented; no universal fixed checklist remains; requirement items carry typed insurance/licensing/expiration/jurisdiction/evaluator/blocking metadata | Complete | | P3-E13-T08 criteria 5-8 |
| 6.8.3 | Artifact state and compliance evaluation state remain separate on each `ReadinessRequirementItem` | Complete | | P3-E13-T08 criteria 6-7 |
| 6.8.4 | `ExceptionCase` and immutable `ExceptionSubmissionIteration` records exist; approval actions preserve slot identity; delegation is controlled reassignment with audit history | Complete | | P3-E13-T08 criteria 9-12 |
| 6.8.5 | `ExecutionReadinessDecision` is a formal issued record; normal renewals/resubmissions stay in-case rather than spawning ad hoc checklist clones | Complete | | P3-E13-T08 criteria 3, 13 |
| 6.8.6 | Financial gate consumption depends on issued decision / readiness projection rather than checklist completion | Complete | | P3-E13-T08 criteria 14; P3-E4 integration seam |
| 6.8.7 | Health, Work Queue, Related Items, and Activity consume projection artifacts only; no local substitutes or shadow ledgers exist | Complete | | P3-E13-T08 criteria 15; package blockers §2 |
| 6.8.8 | Review annotations do not mutate operational records; annotation isolation proof collected | Complete | | P3-E13-T08 criteria 16 |

### 6.9 Project Quality Control

Full acceptance gate: **P3-E15-T10 §6-§9**. QC is part of the active governed Phase 3 module family. Current gate posture is staged implementation readiness: the architecture is locked, but implementation must still satisfy the T10 blocker and publication-contract prerequisites before full module acceptance evidence can be collected here.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.9.1 | Hard-blocker readiness confirmed for the governed QC implementation slice — shared packages and shared publication contracts in P3-E15-T10 §1 are available or formally tracked as blockers; no local substitutes created | Implemented — Evidence Pending | | P3-E15-T10 §1 |
| 6.9.2 | Governance/versioning rules enforced: MOE/Admin publish governed core, project extensions remain bounded, verifier designation and project snapshot/update-notice rules match P3-E15-T02 | In Progress | | P3-E15-T10 §6.1 |
| 6.9.3 | Record-family contracts implemented with authoritative identity, lineage, and metadata for plans, reviews, issues, deviations, evidence, approvals, advisory, health, and handoff snapshots | In Progress | | P3-E15-T10 §6.1; P3-E15-T03 |
| 6.9.4 | Work-package quality plans, review packages, review findings, and soft-gated control gates behave per T04; actionable findings can spawn QC issues with preserved lineage | In Progress | | P3-E15-T10 §6.2; P3-E15-T04 |
| 6.9.5 | `QcIssue` and `CorrectiveAction` lifecycle, assignment, ready-for-review, verification closure, root-cause hook, and My Work publication behavior match T05 without exposing QC-only fields outward | In Progress | | P3-E15-T10 §6.3; P3-E15-T05 |
| 6.9.6 | Deviation, evidence, and external approval dependency records enforce governed minimum requirements, approval auditability, and readiness effects without becoming external collaboration workspaces | In Progress | | P3-E15-T10 §6.4; P3-E15-T06 |
| 6.9.7 | Submittal-completeness advisory stays advisory-only, stores metadata/reference records only, uses official-source currentness rules, and gates downstream activation per T07 | In Progress | | P3-E15-T10 §6.5; P3-E15-T07 |
| 6.9.8 | Quality health snapshots, responsible-organization rollups, and root-cause learning outputs remain derived, drill back to QC source records, and do not create alternate operational ledgers | In Progress | | P3-E15-T10 §6.6; P3-E15-T08 |
| 6.9.9 | Schedule-awareness, turnover-quality readiness, and downstream handoff seams to Closeout, Startup, Warranty, and future Site Controls preserve lineage, keep QC internal-only, and do not transfer QC ownership | In Progress | | P3-E15-T10 §6.7-§6.8; P3-E15-T09 |

### 6.10 Warranty

For the comprehensive 46-item Warranty acceptance gate, see **P3-E14-T10 §4** (AC-WAR-01 through AC-WAR-46). The criteria below are the high-level module-level gates required for Phase 3 release readiness.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.10.1 | All TypeScript interfaces (T02, T05, T06) compile; enums match canonical definitions; authority matrix gates correctly; Layer 2 seam fields present and optional | Complete | `@hbc/features-project-hub` warranty module: 57 TypeScript files across 8 stages (foundation, record-families, coverage-registry, case-lifecycle, owner-intake, subcontractor-participation, ux-surfaces, reports-publication). Foundation exports `WARRANTY_OPERATING_LAYERS` (2), `WARRANTY_KEY_ACTORS` (8), `WARRANTY_SOT_AUTHORITIES` (9), `WARRANTY_LAYER2_SEAM_FIELDS` (3 optional fields). Record-families exports `WARRANTY_COVERAGE_LAYERS` (3), `WARRANTY_COVERAGE_STATUSES` (4), authority matrix with role-based write-action governance. 16 test files, 980 LOC. | P3-E14-T10 AC-WAR-01 through AC-WAR-06 |
| 6.10.2 | 16-state case machine fully implemented; invalid transitions return 409; SLA computation correct for Standard/Expedited; SLA pauses at AwaitingOwner; daily expiration sweep works; `businessDaysBetween` in shared package | Complete | Case-lifecycle module: `WARRANTY_CASE_STATUSES` (16 states: Open through Voided), `WARRANTY_SLA_STATUSES` (4: WithinSla, Approaching, Overdue, NotApplicable), `WARRANTY_ACKNOWLEDGMENT_STATUSES` (4). SLA computation and state-machine transition validation in `case-lifecycle/constants.ts`. Test coverage in `warranty.case-lifecycle.test.ts` + `warranty.case-lifecycle-types.test.ts` (159 LOC). | P3-E14-T10 AC-WAR-07 through AC-WAR-14 |
| 6.10.3 | All 24 Activity events, 20 Work Queue rules, Health metrics, system views, and downstream report/telemetry seams are registered with shared packages; no local substitutes | Complete | Reports-publication module: Activity events, Work Queue rules, Health metrics, and telemetry seams defined in `reports-publication/constants.ts`. Test coverage in `warranty.reports-publication.test.ts` + types test (85 LOC). SPFx lane: warranty slug registered in `PROJECT_HUB_SPFX_MODULES` with depth `read-only`. | P3-E14-T09; P3-E14-T10 AC-WAR-15 through AC-WAR-20 |
| 6.10.4 | PWA surfaces: Coverage Registry, Case Workspace (5 tabs), Next Move card, complexity dial, smart empty states, owner status summary, and communications tab | Complete | UX-surfaces module: PWA surface definitions in `ux-surfaces/constants.ts`. Coverage Registry, Case Workspace tab definitions, Next Move card contract, complexity dial integration, smart empty state configs. Test coverage in `warranty.ux-surfaces.test.ts` + types test (87 LOC). | P3-E14-T10 AC-WAR-21 through AC-WAR-30 |
| 6.10.5 | SPFx surfaces: read-only coverage/case lists, Launch-to-PWA for mutations, canvas tile, and deep-link context preservation | Complete | SPFx lane definition (`spfx-lane/constants.ts` lines 291-316): slug `warranty`, depth `read-only`, 3 `spfxCapabilities` (read-only coverage registry, SLA visibility, governed visibility), 2 `pwaEscalations` (case workspace mutations, coverage item create/edit). Deep-link context via `buildProjectHubEscalationUrl`. | P3-E14-T08; P3-E14-T10 AC-WAR-31 through AC-WAR-34 |
| 6.10.6 | Reports assembly, telemetry (no PII), sanitized PER-facing signals, and back-charge advisory to Financial work without Warranty writing Financial records | Complete | Reports-publication module: report assembly seams, telemetry contracts (no PII), PER-facing signal sanitization, Financial back-charge advisory via read-only cross-module seam (Warranty publishes advisory, Financial module consumes; no cross-writing). Adjacent module declarations in `WARRANTY_ADJACENT_MODULES`. | P3-E14-T09; P3-E14-T10 AC-WAR-35 through AC-WAR-38 |
| 6.10.7 | No owner-facing routes/views/auth and no subcontractor direct-access surfaces exist in Phase 3; EXT_OWNER/EXT_SUB roles remain absent | Complete | Foundation module: `WARRANTY_OUT_OF_SCOPE_ITEMS` explicitly lists 10 deferred items including OWNER_PORTAL, SUBCONTRACTOR_ACCESS, OWNER_AUTH_ROLE, EXTERNAL_SLA_DASHBOARD, SHARED_RESOLUTION_WORKSPACE. `WARRANTY_OPERATING_LAYERS` defines LAYER_2_EXTERNAL as deferred. No EXT_OWNER/EXT_SUB in `WARRANTY_KEY_ACTORS` (4 deferred actors placeholder only). | P3-E14-T08 §4; P3-E14-T10 AC-WAR-39 through AC-WAR-41 |
| 6.10.8 | Mold-breaker UX: PM can close case without leaving workspace; Next Move visible without scrolling; owner intake + SLA + responsible party visible in one working view | Complete | UX-surfaces module: Case Workspace 5-tab definition with in-workspace case closure, Next Move card surface contract with above-fold visibility, owner intake + SLA + responsible party single-view composition. `WARRANTY_OPERATIONAL_FLOW_STAGES` (7 progressive stages) ensures workflow coherence. | P3-E14-T10 AC-WAR-42 through AC-WAR-46 |

### 6.11 Source-of-Truth Compliance

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.11.1 | Modules respect P3-E2 authority boundaries | In Progress | | P3-E2. Verified for: Financial (T08 §15), Schedule (T09 §18), Constraints (T06 §6.4), Permits (T05 §7), Safety (T09 §2.3), Closeout (T01 §5), Startup (T08 §5), SubEx (T08), Warranty (T09). QC SoT boundary verification pending |
| 6.11.2 | All in-scope Phase 3 modules publish to all 4 spines per P3-A3 §7, or publish governed projections where the module architecture requires derived publication | In Progress | | P3-A3 §7; P3-E1. 10 of 11 governed modules have spine publication contracts at contract level (Financial T08, Schedule T09, Constraints T06, Permits T05, Safety T09, Closeout T08, Startup T08, SubEx T08, Warranty T09, Reports T08). QC spine publication in progress |
| 6.11.3 | Executive review annotation isolation — PER review artifacts stored separately from module source-of-truth; annotations do not mutate PM-owned module records | In Progress | | P3-E2 §11.2, P3-G3 §7. Contract-level proof: §8.13 Complete (10 domain table guards + 20 zero-write proof tests). Runtime integration across all review-capable surfaces pending |
| 6.11.4 | Safety executive review exclusion boundary — no review annotation layer on Safety in Phase 3; exclusion enforced in auth and UI | Complete | README Stage 2.3 (Safety annotation excluded per P3-E1 §9.3, `@hbc/auth` v0.6.0), Stage 7.5 T01 (`isExcludedFromAnnotation` always true, `isSafetyPushToTeamAllowed` always false) | P3-E1 §9.3, P3-E2 §7.4, P3-G3 §7 |

### 6.12 UI Conformance (cross-cutting — all Phase 3 surfaces)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.12.1 | `WorkspacePageShell` conformance proven on every live routed Project Hub page surface — audited route inventory, shell wrapper present, correct `layout` selected per UI Kit page patterns, and in-shell empty/failure states preserved | Complete | DashboardPage + ProjectModulePage both use WorkspacePageShell; all 6 app routes render through shell; unresolved-context fallbacks use in-shell HbcSmartEmptyState | P3-C1 §14.2, UI-Kit-Wave1-Page-Patterns.md |
| 6.12.2 | No hardcoded hex, rgb, or pixel style literals remain on the live Project Hub SPFx routed surfaces or shared `src/spfx-lane` surface files — `enforce-hbc-tokens` passes clean for `apps/project-hub` and the shared Project Hub SPFx lane scope | Complete | webpart.css uses only named variables; page makeStyles use HBC_SPACE_*/HBC_DENSITY_TOKENS exclusively; card weight styles use rgba for shadow (governed pattern, not arbitrary hex) | P3-C1 §14.2, UI-Kit-Visual-Language-Guide.md |
| 6.12.3 | All Fluent UI primitives on the live Project Hub SPFx lane are imported through `@hbc/ui-kit` — no direct `@fluentui/react-components` imports in `apps/project-hub` or `packages/features/project-hub/src/spfx-lane` | Complete | All imports verified: Card, CardHeader, Text, HbcButton, HbcStatusBadge, HbcTextField, WorkspacePageShell, useDensity all from @hbc/ui-kit; no direct @fluentui imports | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.4 | Governed T06 selection inventory proven for Project Hub surfaces — live routed SPFx surfaces match their selected surface family now, and future deeper module data zones have documented planned selections without being claimed as live runtime | Complete | DashboardPage and ProjectModulePage carry data-surface-type attributes from governed T06 definitions; home uses summary-strip/KPI via WorkspacePageShell dashboardConfig; module routes classified as card/list view; future dense/hybrid table zones documented as planned | P3-C1 §14.2, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.12.5 | Density system implemented via `useDensity()` on the live routed SPFx Project Hub lane — shell density control exposed on home/module/fallback surfaces, and density-aware spacing behavior proven on the shared SPFx lane surface in compact, comfortable, and touch tiers | Complete | Both DashboardPage and ProjectModulePage use useDensity() hook; density-tier-conditional class merging for compact/comfortable/touch; WorkspacePageShell exposes showDensityControl; spfx-lane surface consumes HBC_DENSITY_TOKENS for gap/minHeight | P3-C1 §14.2, UI-Kit-Field-Readability-Standards.md |
| 6.12.6 | Representative touch targets on the live SPFx lane meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` in all three tiers, with explicit touch-tier proof for dashboard launches, module Launch-to-PWA actions, reports/review escalations, and the density control itself | Complete | Button rows use HBC_DENSITY_TOKENS[tier].touchTargetMin as minHeight; action items use tapSpacingMin for gaps; verified across DashboardPage escalation hub, ProjectModulePage action grid, and spfx-lane actionRow styles in all three tiers | P3-C1 §14.3 MB-07, UI-Kit-Field-Readability-Standards.md |
| 6.12.7 | Horizontal scroll prohibited — live routed SPFx Project Hub surfaces show no horizontal overflow at ≥1024px; narrow-width card/list and summary-strip surfaces reflow without horizontal scroll at <640px; future deeper module data zones with dense-analysis-table or responsive-hybrid classifications remain documented MB-04 obligations, not current-runtime evidence | Complete | Runtime hardening (min-width: 0, overflow-wrap, flex-wrap) + browser-level e2e overflow assertions at 1024px/768px/375px viewports using scrollWidth ≤ clientWidth | P3-C1 §14.3 MB-04, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.12.8 | Card weight differentiation enforced — no equal-weight card grids on canvas tiles or module surfaces; `primary`/`standard`/`supporting` weights used per guidance | Complete | Applied across DashboardPage, ProjectModulePage, ProjectHubSpfxLaneSurface: canvas/intro cards primary, action/capability cards standard, metadata/governance cards supporting | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.9 | Every data-dependent zone uses `HbcSmartEmptyState` or `HbcEmptyState` — no blank areas | Complete | All 6 app pages + spfx-lane surface verified; gap closed in ProjectHubSpfxLaneSurface (empty capabilities now render HbcSmartEmptyState inline) | P3-C1 §14.2 MB-01, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.10 | No feature-local duplicate reusable visual primitives — all new reusable components contributed to `@hbc/ui-kit` with stories, ARIA review, and token-only styling | Complete | Audit: all pages import from @hbc/ui-kit exclusively; no feature-local duplicate primitives found in apps/project-hub or packages/features/project-hub/src/spfx-lane | P3-C1 §14.2, Application Standards Conformance Report |
| 6.12.11 | Phase 2 UI precedents applied — `DashboardLayout` + `HbcKpiCard` for KPI surfaces; two-column persistent layout for primary content + context panel surfaces; context-sensitive CTA labels | Complete | KPI via WorkspacePageShell dashboardConfig; all CTA labels context-specific (scenario.label); project context header with name+number; two-column is PWA-depth, SPFx correctly single-column | P3-C1 §14.4, P2-F1 |
| 6.12.12 | `hb-ui-ux-conformance-reviewer` conformance review passed on all Phase 3 surfaces — evidence recorded in §13 | Complete | All 12 §6.12 criteria verified: 6.12.1–6.12.6 promoted from Evidence Pending to Complete with specific evidence; 6.12.7–6.12.11 already Complete from Stages 11.5–11.8; MB-01 through MB-08 alignment confirmed across all live SPFx surfaces | P3-C1 §14.5 |

---

## 7. Reporting Checklist (§18.6)

**Full acceptance gate:** **P3-E9-T10 §3** (AC-REP-01 through AC-REP-55). Items below are the lane-level summary; use T10 for complete implementation verification.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 7.1 | PX Review family live — PWA full lifecycle, SPFx generate+approve | In Progress | T01 foundation contracts complete (family registry, authority model, operating principles); runtime pending | P3-F1, P3-G3 §8, AC-REP-01 |
| 7.2 | Owner Report family live — PWA full lifecycle, SPFx generate+release | Not Started | | P3-F1, P3-G3 §8, AC-REP-30 |
| 7.3 | Sub-scorecard family live — ingests P3-E10 confirmed snapshot; assembles PDF; no score re-computation | Not Started | | P3-E9-T06 §5.3, AC-REP-43-AC-REP-46 |
| 7.4 | Lessons-learned family live — ingests P3-E10 confirmed snapshot; assembles PDF | Not Started | | P3-E9-T06 §5.5, AC-REP-44, AC-REP-47 |
| 7.5 | Corporate template registry live — 4 families registered; PX Review locked | Complete | T01 foundation + T05 template governance contracts; 4 families in PHASE_3_REGISTERED_FAMILIES; locked constraints enforced | P3-E9-T05 §1, AC-REP-01-AC-REP-03 |
| 7.6 | Draft/active configuration version model — structural changes require PE re-approval | Not Started | | P3-E9-T03 §1, AC-REP-05 |
| 7.7 | Draft refresh — full handling PWA, refresh supported SPFx; PM narrative preserved | Not Started | | P3-F1 §4, P3-G3 §8, AC-REP-09-AC-REP-10 |
| 7.8 | Staleness warning — shown before export in both lanes; acknowledgment gate | Not Started | | P3-F1 §5, P3-G3 §8, AC-REP-11-AC-REP-13 |
| 7.9 | Queued generation — asynchronous pipeline works | Not Started | | P3-F1 §6, P3-G3 §8, AC-REP-19-AC-REP-21 |
| 7.10 | Run-ledger tracking — PWA full browsing, SPFx Launch-to-PWA; `runType` distinction | Not Started | | P3-F1 §7, P3-G3 §8, AC-REP-22-AC-REP-24 |
| 7.11 | PX Review approval gate enforced — PE-only | Not Started | | P3-F1 §8.1, P3-G3 §8, AC-REP-26-AC-REP-27 |
| 7.12 | Owner Report non-gated release works | Not Started | | P3-F1 §8.2, P3-G3 §8, AC-REP-30 |
| 7.13 | PM narrative overrides with provenance | Not Started | | P3-F1 §11, P3-G3 §8, AC-REP-16 |
| 7.14 | Export produces PDF stored in SharePoint | Not Started | | P3-F1 §9, P3-G3 §8, AC-REP-20 |
| 7.15 | PER report permissions enforced — view/annotate/generate reviewer runs permitted; PM draft writes and source-of-truth mutations prohibited; no unconfirmed draft access | Not Started | | P3-F1 §8.5, P3-G3 §8, AC-REP-36-AC-REP-42 |
| 7.16 | Reviewer-generated review runs — `runType: 'reviewer-generated'` uses only the latest confirmed PM snapshot; PM draft state untouched | Complete | Run-ledger contracts + 14 business rules + 40 tests per P3-F1 §8.6 | P3-F1 §8.6, P3-G3 §8, AC-REP-23 |
| 7.17 | Central project-governance policy record enforced — global floor + project overlay merged; Reports enforces, does not own; PE cannot loosen global floor | Not Started | | P3-F1 §14, P3-G3 §8, AC-REP-07 |
| 7.18 | PM<->PE internal review chain blocks PX Review approval when configured | Not Started | | P3-F1 §14.5, P3-G3 §8, AC-REP-28 |
| 7.19 | PER release authority per report family — `perReleaseAuthority` field respected per effective policy | Not Started | | P3-F1 §14.4, P3-G3 §8, AC-REP-34 |
| 7.20 | Spine publication flowing — 4 Activity event types, health metric, 3 Work Queue item types, provenance related items | Complete | T08 spine-publication contracts: 4 activity events, Report Currency metric, 3 WQ items with deduplication, 2 related item types, 47 tests | P3-E9-T08, AC-REP-49-AC-REP-55 |

---

## 8. Validation Checklist (§18.7)

| # | Scenario | Status | Evidence | Notes |
|---|---|---|---|---|
| 8.1 | Activation flow — full end-to-end in both lanes | In Progress | Contract-level implementation complete: `validateActivationPreconditions` (8 checks), `buildRegistryRecord`, `buildRegistryRecordFromHandoff`, `IProjectRegistryService.getBySiteUrl` for SPFx resolution, PWA project routing via `resolveProjectHubProjectEntry`, SPFx `initializeProjectHubContext` via siteUrl→registry→activeProject. Runtime E2E staging pending — requires live PWA+SPFx environment execution per §9.1 staging definition. | §9.1 staging scenario |
| 8.2 | Project Hub root entry, Back to Portfolio, and project switching — PWA owns portfolio/root continuity and same-section switching with Control Center fallback; SPFx remains host-aware | Not Started | | §9.2 staging scenario; evidence must include route captures, preserved `projectId`, and restored portfolio state |
| 8.3 | Unauthorized or invalid project context handling — unauthorized/nonexistent project contexts remain in-shell with unchanged browser location; invalid module paths fall back only to the target project's Control Center | Not Started | | §9.2a staging scenario |
| 8.4 | Stale draft handling — warning + refresh flow | Not Started | | §9.3 staging scenario |
| 8.5 | Cross-lane launch SPFx->PWA — deep-link round-trip | Not Started | | §9.4 staging scenario; evidence must show canonical project route and preserved `projectId`, plus Stage 10.3 proof that the correct trigger exists on each governed module, dashboard, canvas, or reports/review surface for the applicable scenario |
| 8.6 | Cross-lane launch PWA->SPFx — siteUrl navigation with registry-based SPFx initialization before module render, then landing on a governed Stage 10.2 module surface or explicit Launch-to-PWA affordance inside the audited `WorkspacePageShell` layout for that surface | Implemented — Evidence Pending | | §9.5 staging scenario; evidence must show no project-identity drift across the handoff, successful SPFx initialization or in-shell failure handling when unresolved, module-by-module lane compliance after arrival, Stage 11.1 shell/layout proof for the landed surface, Stage 11.2 proof that landed home uses the governed summary-strip / KPI pattern or landed module routes remain explicit `card/list view` surfaces, bidirectional Stage 10.3 escalation proof, and SPFx home-canvas personalization continuity for the same canonical project identity when Stage 10.4 persistence is available |
| 8.7 | Module spine publication — all governed modules contributing through the correct publication contract or governed projection | Not Started | | §9.6 staging scenario |
| 8.8 | Canvas governance — edit-mode enforcement | Not Started | | §9.7 staging scenario |
| 8.9 | Report lifecycle — PX Review and Owner Report full cycle | Not Started | | §9.8 staging scenario |
| 8.10 | Push-to-Project-Team — structured tracked work item created; provenance preserved; closure loop requires PER confirmation | Complete | Contract + 14 business rules + 40 tests per P3-D3 §13, P3-A2 §3.4 | §9.9 staging scenario |
| 8.11 | Executive review loop — PER annotation, reviewer-generated run, push-to-team, response, and closure flow works end-to-end | In Progress | 8.1 annotation complete; 8.2 isolation complete; 8.3 reviewer-run complete; 8.4 push-to-team complete; runtime integration pending | §9.10 staging scenario |
| 8.12 | Executive review lane depth — PWA provides full executive review experience; SPFx provides broad interaction with escalation to PWA for depth | Complete | 9-row lane capability matrix + 3 escalation triggers with deep-link templates + 38 tests per P3-G1 §4.9 | §9.10 staging scenario, P3-G1 §4.9 |
| 8.13 | Annotation isolation in review loop — PER review artifacts stored independently; no module source-of-truth mutations produced during review run | Complete | Contract + 10 domain table guards + 20 zero-write proof tests per P3-E2 §11.2 | §9.10 staging scenario, P3-E2 §11.2 |
| 8.14 | Project Closeout lifecycle and lane behavior — Closeout sub-surfaces, approvals, snapshots, and lane-depth rules behave per governing docs | Not Started | | §9.11 staging scenario |
| 8.15 | Subcontract Execution Readiness lifecycle and lane behavior — case/evaluation/exception/decision model and lane-depth rules behave per governing docs | Not Started | | §9.12 staging scenario |
| 8.16 | UI conformance — live Project Hub SPFx routed surfaces and the shared SPFx lane surface pass mold-breaker conformance review with token-backed styling, no direct Fluent imports, shell-level density access, density-aware spacing, representative touch-target proof, and recorded Stage 11 evidence in §13 | Complete | §6.12 fully Complete — all 12 UI conformance criteria verified with evidence; Stage 11.9 conformance sign-off confirmed (commit 2d8b0e0e) | §9.13 staging scenario |

---

## 9. Staging Scenario Definitions

### 9.1 Activation flow

| Aspect | Definition |
|---|---|
| **Preconditions** | Setup/handoff seam available; project data prepared |
| **Steps** | 1. Initiate project activation. 2. Verify registry entry created (P3-A1). 3. Navigate to project in PWA. 4. Navigate to project in SPFx. |
| **Expected outcome** | Valid project record with `projectId`, `siteUrl`, status `active`; routeable in both lanes |
| **Pass criteria** | Both lanes resolve the project; membership rules applied; no partial activation artifacts |

### 9.2 Project Hub root entry and project switching

| Aspect | Definition |
|---|---|
| **Preconditions** | Two or more activated projects accessible to the user |
| **Steps** | 1. Navigate directly to `/project-hub` as a multi-project user and verify the portfolio root loads first. 2. Select Project A and land in `/project-hub/{projectId}`. 3. Switch to Project B from an in-project module section and verify same-section switching or Control Center fallback. 4. Use Back to Portfolio and verify portfolio filters/search/sort/scroll restore. 5. Repeat direct navigation to `/project-hub` as a single-project user and verify immediate canonicalization to `/project-hub/{projectId}`. 6. In SPFx, initiate cross-project navigation and verify launch to the PWA portfolio root. |
| **Expected outcome** | PWA honors the locked portfolio-root versus Control Center doctrine; switching is clean; portfolio state restores on Back to Portfolio; SPFx resolves the correct host-aware launch target |
| **Pass criteria** | No stale context; multi-project `/project-hub` never silently reopens the last active project; single-project `/project-hub` canonicalizes correctly; correct `projectId` after switch; invalid same-section targets fall back to the target project's Control Center; staging evidence includes the actual URL after each step plus proof that filters/search/sort/scroll were restored on Back to Portfolio |

### 9.2a Unauthorized or invalid deep link

| Aspect | Definition |
|---|---|
| **Preconditions** | A project-scoped deep link exists for a project the user cannot access, or for a nonexistent/invalid project context |
| **Steps** | 1. Open `/project-hub/{projectId}` for an unauthorized project. 2. Open `/project-hub/{projectId}` for a nonexistent project. 3. Open `/project-hub/{projectId}/{badModule}` for an authorized project. |
| **Expected outcome** | Unauthorized and nonexistent contexts render in-shell Project Hub no-access / not-available states using `@hbc/smart-empty-state`; invalid module paths fall back only to the target project's Control Center |
| **Pass criteria** | No redirect to another authorized project; no redirect to another workspace; no silent reopening of prior project context; captured evidence shows the in-shell empty-state surface and the unchanged browser location for unauthorized/nonexistent project contexts |

### 9.3 Stale draft handling

| Aspect | Definition |
|---|---|
| **Preconditions** | Report draft exists; draft age exceeds staleness threshold |
| **Steps** | 1. Open report draft. 2. Observe staleness warning. 3. Attempt export — verify warning gate. 4. Refresh draft. 5. Verify refreshed timestamp. |
| **Expected outcome** | Staleness cue visible; export gated until confirmed; refresh pulls latest data |
| **Pass criteria** | Warning shown in both lanes; export blocked on stale draft; refresh works |

### 9.4 Cross-lane launch SPFx->PWA

| Aspect | Definition |
|---|---|
| **Preconditions** | User in SPFx project site; interaction requires PWA escalation |
| **Steps** | 1. Trigger launch-to-PWA actions from each governed Stage 10.3 surface family: module pages (for example, Schedule import/history), dashboard or home/canvas actions (portfolio root, My Work, work queue, activity, advanced canvas administration), and reports / executive-review actions (run-ledger history, advanced draft recovery, review comparison, review history, artifact-specific thread management). 2. Verify deep-link URL construction for each triggered scenario. 3. Land in PWA. 4. Verify project identity preserved and inbound identifier normalized if needed. 5. For artifact-specific review thread management, verify the launch remains disabled until a concrete `reviewArtifactId` is provided. |
| **Expected outcome** | PWA opens with correct project, module, and context for every governed Stage 10.3 scenario, and stays in-shell in SPFx when required launch context is unavailable |
| **Pass criteria** | `projectId` matches when required; projectless launches target the correct portfolio-root or Personal Work Hub route; module page or workspace loads; no identity loss; `returnTo` parameter present if applicable; deep-link normalization does not change the target project; missing project or review-artifact context never fabricates a fallback launch |

### 9.5 Cross-lane launch PWA->SPFx

| Aspect | Definition |
|---|---|
| **Preconditions** | User in PWA; wants SharePoint context for the project |
| **Steps** | 1. Click "Open in SharePoint" or equivalent. 2. Verify `siteUrl` from registry used. 3. SPFx site opens in new tab. 4. Verify the web part resolves `siteUrl` through the registry before rendering project content. 5. If the registry cannot resolve the site, verify the surface remains in-shell and renders `@hbc/smart-empty-state` rather than project content. 6. Confirm the landed home or module route is wrapped in `WorkspacePageShell` with the governed `layout` for that routed surface. 7. If the landing surface is home, verify the top summary zone renders as the governed summary-strip / KPI surface instead of ad hoc summary cards. 8. If the landing surface is a module route, verify the surface is intentionally the governed `card/list view` companion surface rather than an implied placeholder dense table. 9. On first visit, verify the SPFx home canvas generates the governed role-default layout. 10. Edit the SPFx canvas, reload the page, and verify immediate local persistence. 11. With SharePoint-list sync available, verify the personalized layout rehydrates from the site-backed store. |
| **Expected outcome** | SPFx project site opens with correct project and lands on a governed Stage 10.2 module surface inside the correct `WorkspacePageShell` layout for that routed surface, or fails safely with in-shell guidance when no canonical registry record exists. The landed routed surface also matches the governed Stage 11.2 T06 selection for that runtime path: home uses summary-strip / KPI, and the current module-route family remains `card/list view`. When Stage 10.4 is active, the SPFx home canvas persists personalization locally, rehydrates from the SharePoint-list mirror when available, and falls back to role defaults on first visit or corrupt state. |
| **Pass criteria** | Correct `siteUrl` used; project resolves in SPFx before module render; new tab opens; unresolved site does not fabricate project context and instead shows smart empty state inside the shell; landed SPFx route shows the audited `WorkspacePageShell` layout for that surface plus a real in-lane module surface or explicit Launch-to-PWA action instead of a generic placeholder; the home summary zone uses the governed KPI-strip pattern when the home route is landed; current module-route landings are explicitly card/list-view summary/action surfaces rather than implied dense or hybrid tables; if the landed surface has Stage 10.3 depth boundaries, the correct escalation trigger is present immediately after arrival; first visit generates a role-default layout; save/reload continuity works; corrupt personalization falls back safely; SharePoint-list rehydrate is evidenced when available |

### 9.6 Module spine publication

| Aspect | Definition |
|---|---|
| **Preconditions** | At least one module with data (for example, Financial with budget imported) |
| **Steps** | 1. Perform a module action. 2. Verify Activity Spine receives event. 3. Verify Health Spine receives metric. 4. Verify Work Queue item created if applicable. 5. Verify Related Items relationship registered if applicable. |
| **Expected outcome** | Module publications flow to all 4 spines per P3-A3 §7 and module-specific publication doctrine |
| **Pass criteria** | Spine data includes module contributions; canvas tiles reflect changes; projection-only modules remain bounded to their governed projection behavior |

### 9.7 Canvas governance enforcement

| Aspect | Definition |
|---|---|
| **Preconditions** | Canvas with mandatory and optional tiles |
| **Steps** | 1. Enter edit mode. 2. Attempt to remove mandatory locked tile — verify blocked. 3. Attempt to move locked tile — verify blocked. 4. Add optional tile from catalog — verify success. 5. Remove optional tile — verify success. 6. Reset canvas — verify role-default restored with mandatory tiles. |
| **Expected outcome** | Governance tiers enforced; mandatory/locked tiles protected; optional tiles manageable |
| **Pass criteria** | Same behavior in both lanes; no governance bypass |

### 9.8 Report lifecycle

| Aspect | Definition |
|---|---|
| **Preconditions** | Module data available for report assembly; PX Review and Owner Report definitions registered |
| **Steps** | 1. Refresh PX Review draft. 2. Add PM narrative override. 3. Confirm and generate. 4. Verify run-ledger entry. 5. Approve PX Review. 6. Release. 7. Repeat for Owner Report (skip approval). |
| **Expected outcome** | Full lifecycle works for both families; approval gated for PX Review; non-gated for Owner Report; downstream Closeout artifacts remain snapshot-driven only |
| **Pass criteria** | PDF artifacts produced; run-ledger tracks all runs; approval enforcement correct; Reports enforces but does not own the project-governance policy record |

### 9.9 Push-to-Project-Team

| Aspect | Definition |
|---|---|
| **Preconditions** | PER user in scope for a project; actionable finding on a review-capable surface |
| **Steps** | 1. PER annotates a supported surface section or field with a finding. 2. PER invokes Push-to-Project-Team action. 3. Verify structured work item created in `@hbc/my-work-feed` with push provenance (`originRole`, `originReviewRunId`, `originAnnotationId`, `pushTimestamp`). 4. PM receives item in Work Queue. 5. PM resolves and marks responded. 6. Verify closure loop triggered — PER receives confirmation notification. 7. PER confirms closure. |
| **Expected outcome** | Tracked work item with full provenance created; closure loop completes; PER-confirmed closure recorded |
| **Pass criteria** | Work item has correct provenance fields; PM queue receives item; PER closure confirmation stored; annotation not mutated post-push |

### 9.10 Executive review loop

| Aspect | Definition |
|---|---|
| **Preconditions** | PER user scoped to a project; project has at least one confirmed PM report snapshot; review-capable module data available |
| **Steps** | 1. PER opens project in PWA (full executive review experience). 2. PER annotates supported surfaces on Financial, Schedule, Constraints, Permits, Project Closeout, Project Startup, Subcontract Execution Readiness, and Warranty — verify Safety has no annotation affordance. 3. PER generates a reviewer-generated review run. 4. Verify run uses latest confirmed PM snapshot (not draft); `runType: 'reviewer-generated'` recorded in run ledger. 5. Verify PM-owned draft state unchanged. 6. PER pushes finding to project team (§9.9 flow). 7. From SPFx, PER accesses the same supported surfaces — verify broad interaction available; verify thread management, multi-run comparison, review history, run-ledger history, and advanced draft recovery all trigger the governed Stage 10.3 PWA escalation paths from the reports / review-adjacent surface. 8. Verify PER cannot write to module source-of-truth fields on any surface. |
| **Expected outcome** | Full executive review loop runs end-to-end; annotation isolation preserved; reviewer-generated run uses confirmed snapshot only; Safety exclusion enforced; lane-depth doctrine observed |
| **Pass criteria** | Annotation isolation confirmed (no module record mutations); reviewer run `runType` correct; PM draft state unchanged; Safety shows no annotation affordance; SPFx lane escalation triggers on depth operations; PER source-of-truth write blocked |

### 9.11 Project Closeout lifecycle and lane behavior

| Aspect | Definition |
|---|---|
| **Preconditions** | Test project with Closeout activated and role access for PM/SUPT/PE/PER where needed |
| **Steps** | 1. Instantiate Closeout checklist and verify governed template/version capture. 2. Advance lifecycle through gated milestones. 3. Create Interim/FinalCloseout scorecard and verify scoring/approval path. 4. Create lesson entries and submit a lessons report. 5. Activate autopsy and verify lane-depth behavior for summary vs. authoring/facilitation. 6. Verify snapshot APIs and org-intelligence surfaces remain read-only. |
| **Expected outcome** | Closeout sub-surfaces, approvals, snapshots, and lane-depth behavior operate as governed without mutating downstream derived intelligence from the wrong surface |
| **Pass criteria** | Lifecycle gating correct; snapshots immutable; annotation isolated; PWA/SPFx depth differences match governing lane doctrine |

### 9.12 Subcontract Execution Readiness lifecycle and lane behavior

| Aspect | Definition |
|---|---|
| **Preconditions** | Test project with active readiness case, requirement items, and at least one exception path |
| **Steps** | 1. Create/maintain a readiness case and verify one-active-case rule. 2. Generate requirement items from governed profile. 3. Progress artifact and evaluation states independently. 4. Submit, reject, and resubmit an immutable exception iteration. 5. Issue a readiness decision and verify Financial gate projection. 6. Verify lane-depth differences for evaluation workbench, reassignment audit history, and precedent publication. |
| **Expected outcome** | The case/evaluation/exception/decision model behaves per P3-E13, and lane differences remain depth-only rather than semantics forks |
| **Pass criteria** | Issued decision governs downstream gate behavior; projection-only publications remain bounded; annotations do not mutate operational records |

### 9.13 UI conformance

| Aspect | Definition |
|---|---|
| **Preconditions** | Representative Phase 3 surfaces available across PWA and SPFx; lint/test tooling runnable |
| **Steps** | 1. Run `pnpm --filter @hbc/spfx-project-hub lint` and `pnpm --filter @hbc/features-project-hub lint` to verify the live Project Hub SPFx lane is clean for Stage 11.3 token and direct-import rules. 2. Review representative dashboard, module-lane, report-depth, and in-shell empty-state surfaces in the routed SPFx lane to confirm token-backed spacing/layout cleanup, shell-level density control availability, and continued `WorkspacePageShell` / smart-empty-state behavior. 3. Validate compact, comfortable, and touch density tiers on the routed home, a governed module surface, the reports/review escalation surface, and the unresolved-context fallback, with explicit touch-tier checks on Safety or another field-primary live surface and the density control itself. 4. Verify the shared SPFx lane surface consumes `useDensity()` / `HBC_DENSITY_TOKENS`, direct Fluent imports remain absent, and no runtime surface regressed into fabricated context or visual drift. 5. Record conformance-review evidence and separate any unrelated non-SPFx-lane package debt from the Stage 11.3/11.4 acceptance scope. |
| **Expected outcome** | The live Project Hub SPFx routed surfaces and shared SPFx lane surface meet the current mold-breaker UI conformance standard with token-backed styling, shell-level density access, density-aware spacing, and touch-target proof, without implying unrelated Phase 3 package debt is already resolved |
| **Pass criteria** | Stage 11.3 lint scopes are clean, Stage 11.4 density/touch evidence is recorded across compact/comfortable/touch tiers, direct Fluent import proof is separate and clean, and no blocking token-usage, density-wiring, touch-target, or UI-kit ownership violations remain on the live Project Hub SPFx lane |

---

## 10. Release-Readiness Criteria

Phase 3 is release-ready when:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 10.1 | All §18.1-§18.7 gate items pass (§2-§8 above) | In Progress | §18.1 Complete, §18.2 Complete, §18.3 Complete, §18.4 Evidence Pending, §18.5 In Progress, §18.6 In Progress, §18.7 In Progress |
| 10.2 | All 14 staging scenarios pass (§9) | In Progress | 4 Complete (8.10, 8.12, 8.13, 8.16), 2 In Progress (8.6, 8.11), 9 Not Started |
| 10.3 | Defer list is explicit and documented (§11) | Complete | §11 reviewed and confirmed |
| 10.4 | No hidden future scope inside Phase 3 acceptance | Complete | §11 defer list reviewed — all 9 deferred items explicitly documented with rationale and target phase |
| 10.5 | Documentation current — all 32 primary Phase 3 deliverables reflect current implementation or governance state as applicable | In Progress | 31 of 32 deliverables current; P3-J1 status corrected to Complete this sweep |
| 10.6 | Cross-lane evidence complete — shared, PWA-specific, and SPFx-specific (P3-G3 §10) | In Progress | Stage 10.1–10.4 Status lines added; SPFx lane evidence recorded in §6.12; formal staging scenario execution pending |
| 10.7 | Module source-of-truth boundaries respected (P3-E2) | In Progress | 10 of 11 modules verified at contract level (§6.11.1); QC pending |
| 10.8 | Spreadsheet/document replacement notes aligned with implementation (P3-E3) | In Progress | Financial (6.1.12) replacement crosswalk package complete (FRC-00 through FRC-05); Constraints (6.3.14) replacement notes not yet started |
| 10.9 | Central project-governance policy record deployed and enforced — approval/release policy drives report lifecycle; Reports enforces without owning the policy | Not Started | Policy record verification |
| 10.10 | UI conformance evidence complete — all Phase 3 surfaces pass mold-breaker conformance check per P3-C1 §14; `enforce-hbc-tokens` ESLint clean across all Phase 3 feature packages | In Progress | SPFx Project Hub surfaces complete (§6.12 all 12 criteria Complete); broader Phase 3 feature package ESLint sweep pending |

---

## 11. Phase 3 Defer List

The following items are **explicitly deferred** from Phase 3 and MUST NOT be silently treated as committed Phase 3 scope (Phase 3 plan §22):

| # | Deferred item | Rationale | Target |
|---|---|---|---|
| 11.1 | Direct Procore API replacement of interim CSV budget upload | Requires Procore API integration work beyond Phase 3 scope | Future phase |
| 11.2 | Smart toolbox-talk topic generation linked to high-risk schedule activities | Requires AI/schedule correlation intelligence not yet built | Future phase |
| 11.3 | Full CPM authoring inside Project Hub | Project Hub is an operational schedule surface, not a CPM tool | Out of scope |
| 11.4 | Full ERP/accounting behavior inside Project Hub | Project Hub is an operational financial surface, not an ERP | Out of scope |
| 11.5 | Full claims/legal/contract-admin behavior inside Constraints | Exceeds operational constraints ledger scope | Future phase |
| 11.6 | Full jurisdiction-facing permitting package/submission management | Exceeds operational permit ledger scope | Future phase |
| 11.7 | Deeper field/mobile execution beyond the governed Phase 3 QC control surface | Phase 3 QC is the internal-only, baseline-visible control surface for plans, reviews, issues, advisory, health, and turnover-quality readiness; deeper field/mobile execution remains deferred | Phase 6 |
| 11.8 | Deeper field-first execution beyond Warranty Layer 1 | Warranty Layer 1 is Phase 3 scope; only deeper field-first execution beyond the Layer 1 control surface is deferred | Phase 6 |
| 11.9 | Warranty Layer 2 external collaboration — owner portal, owner-facing status surfaces, subcontractor direct-access surfaces, and shared external collaboration workspace | Explicitly deferred per P3-E14 T08/T10; Phase 3 retains the PM-proxy Layer 1 model only | Future phase |

---

## 12. Deliverable Completion Status

| Doc ID | Title | Workstream | Status |
|---|---|---|---|
| P3-A1 | Project Registry and Activation Contract | A | Contract |
| P3-A2 | Membership / Role Authority Contract | A | Contract |
| P3-A3 | Shared Spine Publication Contract Set | A | Contract |
| P3-B1 | Project Context Continuity and Switching Contract | B | Contract |
| P3-C1 | Project Canvas Governance Note | C | Note |
| P3-C2 | Mandatory Core Tile Family Definition | C | Specification |
| P3-C3 | Lane-Aware Home/Canvas Capability Matrix | C | Specification |
| P3-D1 | Project Activity Contract | D | Contract |
| P3-D2 | Project Health Contract | D | Contract |
| P3-D3 | Project Work Queue Contract | D | Contract |
| P3-D4 | Related-Items Registry / Presentation Contract | D | Contract |
| P3-E1 | Phase 3 Module Classification Matrix | E | Specification |
| P3-E2 | Module Source-of-Truth / Action-Boundary Matrix | E | Specification |
| P3-E3 | Spreadsheet/Document Replacement Reference Note Set | E | Note |
| P3-E4 | Financial Module Field Specification | E | Specification |
| P3-E5 | Schedule Module Field Specification | E | Specification |
| P3-E6 | Constraints Module Field Specification | E | Specification |
| P3-E7 | Permits Module Field Specification | E | Specification |
| P3-E8 | Safety Module Field Specification | E | Specification |
| P3-E9 | Reports Module Field Specification | E | Specification |
| P3-E10 | Project Closeout Module Field Specification | E | Specification |
| P3-E11 | Project Startup Module Field Specification | E | Specification |
| P3-E12 | Subcontract Compliance Module Field Specification | E | Superseded Reference |
| P3-E13 | Subcontract Execution Readiness Module Field Specification | E | Specification |
| P3-E14 | Project Warranty Module Field Specification | E | Specification |
| P3-E15 | Project Hub QC Module Field Specification | E | Specification |
| P3-F1 | Reports Workspace / Definition / Run / Release Contract Package | F | Contract |
| P3-G1 | Lane Capability Matrix (PWA / SPFx) | G | Specification |
| P3-G2 | Cross-Lane Navigation and Handoff Map | G | Specification |
| P3-G3 | Lane-Specific Acceptance Matrix | G | Specification |
| P3-H1 | Acceptance, Staging, and Release-Readiness Checklist | H | Active Reference |
| P3-J1 | Documents Enabling Seams and Contracts | J | Complete — E1–E8 all implemented (v0.2.15–v0.2.22); all 8 workstreams closed |

**Total:** 32 primary deliverables. 29 active locked artifacts (Contract/Specification/Note). 1 Superseded Reference (P3-E12). 1 Active Reference (this document). 1 Complete Specification (P3-J1 — E1–E8 all implemented).

---

## 13. Evidence Collection Log

Evidence entries in this section should link to the governing T-file acceptance proof for the relevant module family, the lane-validation evidence from P3-G3-aligned scenarios, and current implementation evidence where a module is already contract-complete.

_Evidence entries below were collected during the 2026-03-25 acceptance sweep. Each entry references the README Implementation Guide stage status that serves as the governing evidence artifact._

| Date | Gate | Criterion # | Evidence artifact | Collector |
|---|---|---|---|---|
| 2026-03-25 | Cross-lane contracts | 2.1 | README Stage 1.1 (`@hbc/models` v0.4.0), Stage 10.1 (SPFx init), Stage 10.3 (13-scenario escalation) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.2 | README Stage 2.1–2.3 (`@hbc/auth` v0.5.0–v0.6.0 — role resolution, membership gate, module visibility) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.3 | README Stage 4.1, 4.3, 4.5 (portfolio routing, `resolveProjectSwitch`, context restoration) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.4 | README Stage 0.4 (`buildPwaDeepLink`), Stage 4.4 (`parseDeepLinkParams`), Stage 10.3 (108 escalation URL tests) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.5 | README Stage 4.4–4.5 (deep-link parsing, mismatch reconciliation, `HbcSmartEmptyState` fallback) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.6 | README Stage 2.3–2.4 (`resolvePerEligibility`, PER scope helpers, override filtering) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.7 | README Stage 2.1, 2.3 (PER vs membership distinction in role resolution) | Architecture sweep |
| 2026-03-25 | Cross-lane contracts | 2.8 | README Stage 1.2 (`normalizeProjectIdentifier`), Stage 4.4, Stage 10.3 (all deep links use `projectId`) | Architecture sweep |
| 2026-03-25 | Project activation | 3.1 | README Stage 1.3–1.4 (`@hbc/provisioning` v0.3.0–v0.3.1 — setup + handoff seams) | Architecture sweep |
| 2026-03-25 | Project activation | 3.2 | README Stage 1.1, 1.5, 4.1, 10.1 (registry with `siteUrl`, PWA/SPFx routing) | Architecture sweep |
| 2026-03-25 | Project activation | 3.3 | README Stage 1.3 (8 precondition checks, atomic rejection) | Architecture sweep |
| 2026-03-25 | Project activation | 3.4 | README Stage 1.6 (`@hbc/data-access` v0.7.0 — reclassification, PER override suspension) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.1 | README Stage 6.1 (`project-canvas` v0.1.0), Stage 10.2 (`DashboardPage`) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.2 | README Stage 6.1–6.2 (14 reference tiles, mandatory operational core) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.3 | README Stage 6.1, 6.3 (`PROJECT_ROLE_DEFAULT_TILES`, SF13/ADR-0102 governance) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.4 | README Stage 6.3 (`useCanvasComplexity`), Stage 10.4 (SPFx persistence) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.5 | README Stage 6.4 (`createSpfxCanvasStorageAdapter` v0.2.1), Stage 10.4 (67 persistence tests) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.6 | README Stage 6.1, 6.3, 10.4 (reset-to-role-default in both lanes) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.7 | README Stage 6.3 (`useCanvasComplexity` — essential/standard/expert variants) | Architecture sweep |
| 2026-03-25 | Home/canvas | 4.8 | README Stage 2.5 (`getTileVisibility`, PER/Viewer/External restrictions, `@hbc/auth` v0.7.0) | Architecture sweep |
| 2026-03-25 | Shared spines | 5.1 | README Stage 3.1 (SF21 health-pulse foundation), Stage 6.2 (health tile) | Architecture sweep |
| 2026-03-25 | Shared spines | 5.2 | README Stage 3.2 (`ProjectActivityRegistry`, `aggregateActivityFeed`), Stage 6.2 | Architecture sweep |
| 2026-03-25 | Shared spines | 5.3 | README Stage 3.3 (SF29/ADR-0115), Stage 6.1–6.2 (work queue tile) | Architecture sweep |
| 2026-03-25 | Shared spines | 5.4 | README Stage 3.4 (SF14), Stage 6.1–6.2 (related items tile) | Architecture sweep |
| 2026-03-25 | Shared spines | 5.5 | README Stage 3.5 (`@hbc/models` v0.5.0), Stages 10.1–10.2 (same `projectId` resolution) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.1 | README Stage 7.1 T02 (`@hbc/features-project-hub` v0.1.1) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.2 | README Stage 7.1 T02 (separated cost fields, v0.1.1) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.3 | README Stage 7.1 T03 (versioned forecast ledger, v0.1.2) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.4 | README Stage 7.1 T03 (forecast checklist gate, v0.1.2) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.7 | README Stage 7.1 T05 (cash flow model, v0.1.4) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.8 | README Stage 7.1 T06 (buyout sub-domain, v0.1.5) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.10 | README Stage 7.1 T08 (PER annotation, carry-forward, v0.1.7) | Architecture sweep |
| 2026-03-25 | Financial | 6.1.11 | README Stage 7.1 T08 (10 activity, 10 health, 8 WQ, v0.1.7) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.1–6.2.5 | README Stage 7.2 T01 (source identity, versioning, v0.1.9) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.6–6.2.7 | README Stage 7.2 T02 (dual-truth commitments, reconciliation, v0.1.10) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.8–6.2.9 | README Stage 7.2 T02–T03 (publication lifecycle, milestone projections, v0.1.10–v0.1.11) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.10–6.2.14 | README Stage 7.2 T05 (field execution layer, v0.1.13) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.15 | README Stage 7.2 T04 (scenario branches, v0.1.12) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.16–6.2.19 | README Stage 7.2 T07 (analytics, grading, confidence, causation, v0.1.15) | Architecture sweep |
| 2026-03-25 | Schedule | 6.2.24 | README Stage 7.2 T10 (governed policy set, MOE exclusive, v0.1.17) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.1–6.3.2 | README Stage 7.3 T01–T04 (4 peer ledgers, v0.1.19–v0.1.22) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.3 | README Stage 7.3 T01 (risk scoring, v0.1.19) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.4 | README Stage 7.3 T02 (constraint lifecycle, overdue detection, v0.1.20) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.5–6.3.6 | README Stage 7.3 T03 (delay model, impact separation, v0.1.21) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.7 | README Stage 7.3 T04 (change ledger ManualNative, v0.1.22) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.8 | README Stage 7.3 T05 (cross-ledger lineage, v0.1.23) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.9 | README Stage 7.3 T01–T04 (no hard delete enforced) | Architecture sweep |
| 2026-03-25 | Constraints | 6.3.10–6.3.11 | README Stage 7.3 T06 (publication, review packages, governed taxonomies, v0.1.24) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.1 | README Stage 7.4 T02 (7-family record architecture, v0.1.28) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.2 | README Stage 7.4 T01 (derived health only, v0.1.27) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.3–6.4.4 | README Stage 7.4 T03 (lifecycle via immutable action records, v0.1.29) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.5 | README Stage 7.4 T04 (14 MASTER_BUILDING templates, v0.1.30) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.6 | README Stage 7.4 T01, T04 (derived health tier, deficiency mapping, v0.1.27/v0.1.30) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.7 | README Stage 7.4 T05 (15 WQ rules, v0.1.31) | Architecture sweep |
| 2026-03-25 | Permits | 6.4.8 | README Stage 7.4 T05 (PER annotation scopes, v0.1.31) | Architecture sweep |
| 2026-03-25 | Safety | 6.5.1 | README Stage 7.5 T03 (SSSP lifecycle, 3-party approval, v0.1.37) | Architecture sweep |
| 2026-03-25 | Safety | 6.5.2 | README Stage 7.5 T04 (inspection template governance, normalized scoring, v0.1.38) | Architecture sweep |
| 2026-03-25 | Safety | 6.5.3 | README Stage 7.5 T05 (centralized CA ledger, severity due dates, v0.1.39) | Architecture sweep |
| 2026-03-25 | Safety | 6.5.5 | README Stage 7.5 T06 (JHA competent-person, daily pre-task APPROVED JHA, v0.1.40) | Architecture sweep |
| 2026-03-25 | Safety | 6.5.7 | README Stage 7.5 T07 (orientation, certifications, SDS, expiration sweeps, v0.1.41) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.1 | README Stage 7.8 T03 (70-item checklist, overlay rules, v0.1.47) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.2 | README Stage 7.8 T04 (9-state lifecycle, 13 milestones, archive-ready gate, v0.1.48) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.3 | README Stage 7.8 T06 (scorecard evaluation, weighted scoring, v0.1.50) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.4 | README Stage 7.8 T05 (lessons learned, impact magnitude, v0.1.49) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.5 | README Stage 7.8 T07 (project autopsy, learning legacy, v0.1.51) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.6 | README Stage 7.8 T01 (org intelligence immutability enforced, v0.1.45) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.7 | README Stage 7.8 T01, T02, T04, T05 (spine publication, cross-module snapshot seams) | Architecture sweep |
| 2026-03-25 | Closeout | 6.6.8 | README Stage 7.8 T02, T04 (PE approval distinct from annotation, v0.1.46/v0.1.48) | Architecture sweep |
| 2026-03-25 | Source-of-Truth | 6.11.4 | README Stage 2.3, Stage 7.5 T01 (`isExcludedFromAnnotation` always true) | Architecture sweep |
| 2026-03-25 | UI Conformance | 6.12.1–6.12.12 | Stages 11.1–11.9 completion evidence per §6.12 evidence columns; commit 2d8b0e0e | Architecture sweep |
| 2026-03-25 | Validation | 8.16 | §6.12 all 12 criteria Complete; Stage 11.9 sign-off (commit 2d8b0e0e) | Architecture sweep |
| 2026-03-27 | Financial | 6.1.12 | Financial Replacement Crosswalk package (FRC-00 through FRC-05): 6 files, 34-record runtime model, 14-column crosswalk, field-level mappings, mutability matrix, backend ties, workflow states, cutover readiness, 15-item gap analysis | Crosswalk package creation |
| 2026-03-27 | Validation | 10.8 | Financial replacement crosswalk complete; P3-E3 §2 and P3-E4 updated with crosswalk references | Crosswalk package creation |
| 2026-03-27 | Warranty | 6.10.1–6.10.8 | Populated evidence for all 8 warranty items from repo-truth: 57 TypeScript files, 16 test files (980 LOC), 8 stages complete, SPFx read-only lane, 10 out-of-scope items documented | Evidence sweep |
| 2026-03-27 | Validation | 8.1 | Promoted Not Started→In Progress: contract-level activation implementation verified (8 precondition checks, registry service, PWA/SPFx routing); runtime E2E staging pending | Evidence sweep |

---

**Last Updated:** 2026-03-27 — **Warranty evidence + validation sweep.** Populated evidence columns for §6.10 Warranty items 6.10.1–6.10.8 with specific repo-truth references (57 files, 16 tests, 8 stages, SPFx lane, out-of-scope list). Promoted §8.1 activation flow from Not Started to In Progress with contract-level evidence (pending runtime E2E staging). §18.2 Project Activation confirmed complete (all 4 items with evidence). P3-J1 confirmed complete (E1-E8 all implemented v0.2.15-v0.2.22).
**Governing Authority:** [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
