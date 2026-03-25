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
| Cross-lane contracts | §18.1 | 8 | Implemented — Evidence Pending | Architecture + Experience / Shell |
| Project activation | §18.2 | 4 | In Progress | Platform / Core Services |
| Home/canvas | §18.3 | 8 | In Progress | Experience / Shell + Project Hub |
| Shared spines | §18.4 | 6 | In Progress | Platform / Core Services + Project Hub |
| Core modules | §18.5 | 135 | In Progress | Architecture + Project Hub |
| Reporting | §18.6 | 20 | Not Started | Project Hub |
| Validation | §18.7 | 16 | Not Started | Architecture + Experience / Shell |
| **Total** | | **197** | | |

Status note: `Implemented — Evidence Pending` means repo-truth implementation exists, but H1 staging/evidence collection is still incomplete. `Complete` is reserved for rows backed by explicit acceptance-sweep or contract-complete repo truth.

---

## 2. Cross-Lane Contract Checklist (§18.1)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 2.1 | Same canonical project identity — PWA resolves from route, SPFx from siteUrl during web part initialization before any project content renders | Implemented — Evidence Pending | | Evidence must include SPFx initialization proof: `siteUrl -> registry -> projectId`, project-store seeding, and smart-empty-state fallback when the registry does not resolve. P3-B1 §2, P3-G3 §3.1 |
| 2.2 | Same membership validation — P3-A2 rules enforced in both lanes | Implemented — Evidence Pending | | P3-A2 §6, P3-G3 §3.2 |
| 2.3 | Project Hub root entry and smart project switching — multi-project `/project-hub` lands on portfolio root first, single-project `/project-hub` auto-routes to `/project-hub/{projectId}`, PWA switching uses same-section resolution with Control Center fallback, SPFx remains host-aware | Implemented — Evidence Pending | | Evidence must capture actual URL transitions, preserved `projectId`, and restored portfolio-root state after Back to Portfolio. P3-B1 §2, §5; P3-G3 §3.3 |
| 2.4 | Cross-lane handoff identity — projectId preserved during SPFx<->PWA | Implemented — Evidence Pending | | P3-G2 §5, P3-G3 §3.4 |
| 2.5 | No context loss during handoff — deep-link handler processes arrival and invalid or unauthorized targets remain in-shell | Implemented — Evidence Pending | | Evidence must show unauthorized or invalid deep links render in-shell `@hbc/smart-empty-state`, keep the browser location stable, and do not reroute to another project or workspace. P3-B1 §6.1, P3-G3 §3.5 |
| 2.6 | PER scope validation enforced — PER non-membership scoping applied in both lanes | Implemented — Evidence Pending | | P3-A2 §3.2, P3-G3 §3.6 |
| 2.7 | PER vs. membership distinction — review-layer access does not imply project membership in either lane | Implemented — Evidence Pending | | P3-A2 §6.4, P3-G3 §3.7 |
| 2.8 | projectId normalization in handoff — all outbound deep links use projectId; projectNumber inbound normalized via registry before any cross-lane handoff or return-link generation | Implemented — Evidence Pending | | P3-A1 §3.4, P3-G2 §5.1, P3-G3 §3.8 |

---

## 3. Project Activation Checklist (§18.2)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 3.1 | Valid activation transaction — setup/handoff creates valid project record | In Progress | | P3-A1, P3-G3 §4.1 |
| 3.2 | Routeable context — activated project has valid route in PWA and site in SPFx | In Progress | | P3-A1, P3-G3 §4.2 |
| 3.3 | No partial activation — incomplete activation rejected, no orphaned records | In Progress | | P3-A1, P3-G3 §4.3 |
| 3.4 | Department reclassification — department change triggers downstream visibility recalculation; authority scopes recalculated; active PER overrides suspended pending re-grant | Implemented — Evidence Pending | | P3-A1 §4.3, P3-A2 §4.3, P3-G3 §4.4 |

---

## 4. Home/Canvas Checklist (§18.3)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 4.1 | Canvas-first home — `@hbc/project-canvas` renders in both lanes on the project-scoped Control Center route | Implemented — Evidence Pending | | P3-C1, P3-C3, P3-G3 §5.1 |
| 4.2 | Mandatory operational core — all 5 surfaces present in both lanes | Implemented — Evidence Pending | | P3-C2, P3-G3 §5.2 |
| 4.3 | Governance tiers — locked/role-default/optional enforced | Implemented — Evidence Pending | | P3-C1, P3-G3 §5.3 |
| 4.4 | Personalization — governed adaptive composition works in both lanes | Implemented — Evidence Pending | | P3-C3, P3-G3 §5.4 |
| 4.5 | Persistence — PWA IndexedDB+server; SPFx localStorage+SharePoint | In Progress | | P3-C3 §6, P3-G3 §5.5 |
| 4.6 | Reset to role-default — works in both lanes; mandatory tiles preserved | Implemented — Evidence Pending | | P3-C1, P3-G3 §5.6 |
| 4.7 | Complexity tiers — essential/standard/expert render per preference | Implemented — Evidence Pending | | P3-C1, P3-G3 §5.7 |
| 4.8 | Role-based visibility — tiles hidden per P3-C2 §8 (no empty placeholders) | Implemented — Evidence Pending | | P3-C2 §8, P3-G3 §5.8 |

---

## 5. Shared Spine Checklist (§18.4)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 5.1 | Health spine — PWA full detail + explainability; SPFx shared component | Implemented — Evidence Pending | | P3-D2, P3-G3 §6.1 |
| 5.2 | Activity spine — PWA full timeline; SPFx tile view | Implemented — Evidence Pending | | P3-D1, P3-G3 §6.2 |
| 5.3 | Work Queue spine — PWA full feed+panel+team; SPFx tile+panel | Implemented — Evidence Pending | | P3-D3, P3-G3 §6.3 |
| 5.4 | Related Items spine — PWA full panel+AI; SPFx compact panel | Implemented — Evidence Pending | | P3-D4, P3-G3 §6.4 |
| 5.5 | Spine data consistency — same data for same projectId in both lanes | Implemented — Evidence Pending | | P3-A3, P3-G3 §6.5 |
| 5.6 | Module publications flowing — all adapters registered and publishing | In Progress | | P3-A3 §7, P3-G3 §6.6 |

---

## 6. Core Module Checklist (§18.5)

### 6.1 Financial

For the full 48-item Financial acceptance gate, see **P3-E4-T09 §20**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E4-T09 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.1.1 | Budget CSV import — atomic validation, identity resolution, `canonicalBudgetLineId` stability across re-imports | Implemented — Evidence Pending | | P3-E4-T02 §2-§3; P3-G1 §4.1 |
| 6.1.2 | Separated cost model — `jobToDateActualCost`, `committedCosts`, `forecastToComplete` are always distinct; `costExposureToDate` = actuals + committed | Implemented — Evidence Pending | | P3-E4-T02 §3.2; P3-E2 §3.2 |
| 6.1.3 | Versioned forecast ledger — Working / ConfirmedInternal / PublishedMonthly / Superseded lifecycle; no unlock-in-place; derivation-based editing | Implemented — Evidence Pending | | P3-E4-T03 §3; P3-E2 §3.3 |
| 6.1.4 | Forecast checklist gate enforced — confirmation blocked when required items incomplete or `staleBudgetLineCount > 0` | Implemented — Evidence Pending | | P3-E4-T03 §4.3 |
| 6.1.5 | Financial Forecast Summary editing — PM-editable fields on working version only; all derived fields recompute correctly | In Progress | | P3-E4-T04 §5; P3-E2 §3.2 |
| 6.1.6 | GC/GR working model — version-scoped; editable on working version only; aggregate feeds Forecast Summary | In Progress | | P3-E4-T04 §6 |
| 6.1.7 | Cash Flow model — 13 actuals (read-only) + 18 forecast months; A/R aging read-only; cumulative chart with deficit shading | Implemented — Evidence Pending | | P3-E4-T05 §7 |
| 6.1.8 | Buyout sub-domain — dollar-weighted completion metric; `ContractExecuted` gate enforced via issued Subcontract Execution Readiness decision / gate projection per P3-E13; savings recognition and three-destination disposition workflow | Implemented — Evidence Pending | | P3-E4-T06 §8; P3-E13-T07 §1 |
| 6.1.9 | Report-candidate designation — at most one `isReportCandidate = true` per project; P3-F1 publication handoff handler implemented | In Progress | | P3-E4-T03 §3.6; P3-E4-T09 §16 |
| 6.1.10 | PER annotation on confirmed versions — working version not visible to PER; `canonicalBudgetLineId`-anchored; carry-forward on derivation | Implemented — Evidence Pending | | P3-E4-T08 §15; P3-E2 §3.5 |
| 6.1.11 | All Activity Spine events, Health Spine metrics, and Work Queue items implemented per P3-E4-T08 §14 | Implemented — Evidence Pending | | P3-E4-T08 §14 |
| 6.1.12 | Spreadsheet replacement notes verified | Not Started | | P3-E3 §2 |

### 6.2 Schedule

For the comprehensive 50-item Schedule acceptance gate, see **P3-E5-T11 §25**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E5-T11 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.2.1 | Schedule file ingestion (XER/XML/CSV) — PWA Required, SPFx Launch-to-PWA | Implemented — Evidence Pending | | P3-G1 §4.2; P3-E5-T01 §1 |
| 6.2.2 | Frozen import snapshots created on every ingestion — `ScheduleVersionRecord` + `ImportedActivitySnapshot` immutable | Implemented — Evidence Pending | | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.3 | Durable activity identity established (`externalActivityKey`) and maintained across versions via `ActivityContinuityLink` | Implemented — Evidence Pending | | P3-E5-T01 §1 |
| 6.2.4 | Canonical source designation — one `CanonicalScheduleSource` per project; secondary sources for comparison only | Implemented — Evidence Pending | | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.5 | Governed baseline management — `BaselineRecord` with PE approval gate | Implemented — Evidence Pending | | P3-E5-T01 §1 |
| 6.2.6 | Dual-truth commitment layer — `ManagedCommitmentRecord` with `reconciliationStatus` tracking alignment with source truth | Implemented — Evidence Pending | | P3-E5-T02 §2; P3-E2 §4.2 |
| 6.2.7 | Reconciliation audit trail (`ReconciliationRecord`) preserved | Implemented — Evidence Pending | | P3-E5-T02 §2 |
| 6.2.8 | Stage-gated publication lifecycle — `Draft -> ReadyForReview -> Published -> Superseded`; executive review and Health Spine consume Published layer only | Implemented — Evidence Pending | | P3-E5-T03 §3; P3-E2 §4.3 |
| 6.2.9 | Milestone records are view projections from Published layer; not an independent source of truth | Implemented — Evidence Pending | | P3-E5-T02 §4; P3-E2 §4.3 |
| 6.2.10 | Field work packages — `FieldWorkPackage` as child of imported activity by location/trade/time | Implemented — Evidence Pending | | P3-E5-T05 §6 |
| 6.2.11 | Commitment and blocker management — `CommitmentRecord`, `BlockerRecord`, `ReadinessRecord` | Implemented — Evidence Pending | | P3-E5-T05 §6 |
| 6.2.12 | Look-ahead planning with PPC — `LookAheadPlan`; PPC formula and window governed | Implemented — Evidence Pending | | P3-E5-T05 §6 |
| 6.2.13 | Three-tier progress verification — reported -> verified -> authoritative; `ProgressClaimRecord` + `ProgressVerificationRecord` | Implemented — Evidence Pending | | P3-E5-T05 §8 |
| 6.2.14 | Governed roll-up rules — work-package to activity to milestone; all methods configurable | Implemented — Evidence Pending | | P3-E5-T05 §9 |
| 6.2.15 | Scenario branch management — `ScenarioBranch` from specific version + baseline; promotion workflow | Implemented — Evidence Pending | | P3-E5-T04 §5 |
| 6.2.16 | Composite schedule grading — `ScheduleQualityGrade` with governed `GradingControlScore` array | Implemented — Evidence Pending | | P3-E5-T07 §11 |
| 6.2.17 | Multi-factor confidence scoring — `ConfidenceRecord` with 8 governed factor scores | Implemented — Evidence Pending | | P3-E5-T07 §11 |
| 6.2.18 | `RecommendationRecord` never silently mutates authoritative schedule truth; promotion creates draft records only | Implemented — Evidence Pending | | P3-E5-T07 §12 |
| 6.2.19 | Governed causation taxonomy — `CausationCode` records; applicable by record type | Implemented — Evidence Pending | | P3-E5-T07 §13 |
| 6.2.20 | Offline-first sync — `IntentRecord` durable intent log; sync state lifecycle; conflict routing for governed records | In Progress | | P3-E5-T08 §15 |
| 6.2.21 | `@hbc/field-annotations` scoped to Published layer only; no annotation on draft or managed commitment records | In Progress | | P3-E5-T09 §18; P3-E2 §4.6 |
| 6.2.22 | `@hbc/related-items` integration — 11 schedule object types; 11 relationship types | In Progress | | P3-E5-T09 §18 |
| 6.2.23 | `@hbc/my-work-feed` `ScheduleWorkAdapter` registered — 10 work item types | In Progress | | P3-E5-T09 §18 |
| 6.2.24 | All governed thresholds, grading rules, roll-up rules, and taxonomies configurable by Manager of Operational Excellence only | Implemented — Evidence Pending | | P3-E5-T09 §20; P3-E2 §4.4 |
| 6.2.25 | Package blockers B-SCH-01 through B-SCH-05 resolved or formally deferred with owner sign-off | In Progress | | P3-E5-T11 §26 |
| 6.2.26 | Full 50-item acceptance gate in P3-E5-T11 §25 passes | Partially Validated | | P3-E5-T11 §25 |

### 6.3 Constraints

For the comprehensive 53-item Constraints acceptance gate, see **P3-E6-T08 §8.2**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E6-T08 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.3.1 | Four-ledger workspace implemented: Risk, Constraint, Delay, and Change ledgers each with independent CRUD and lifecycle — both lanes | Implemented — Evidence Pending | | P3-E6-T01-T04 |
| 6.3.2 | No single-record-type model: all four are peer ledgers; Constraint is not parent of Delay or Change | Implemented — Evidence Pending | | P3-E6 master index |
| 6.3.3 | Risk probability/impact assessment and riskScore working — both lanes | Implemented — Evidence Pending | | P3-E6-T01 §1 |
| 6.3.4 | Constraint lifecycle enforced; overdue detection working — both lanes | Implemented — Evidence Pending | | P3-E6-T02 §2 |
| 6.3.5 | Delay: Integrated + ManualFallback schedule reference modes; ManualFallback self-contained without P3-E5 — both lanes | Implemented — Evidence Pending | | P3-E6-T03 §3.2 |
| 6.3.6 | Delay time/commercial impact separation enforced; `separationConfirmed` gate at Quantified transition | Implemented — Evidence Pending | | P3-E6-T03 §3.4 |
| 6.3.7 | Change Ledger ManualNative mode working; canonical HB Intel identity preserved; Procore schema defined (not wired) | Implemented — Evidence Pending | | P3-E6-T04 |
| 6.3.8 | Cross-ledger spawn lineage with immutable `LineageRecord`; lineage displayed on all detail views | Implemented — Evidence Pending | | P3-E6-T05 |
| 6.3.9 | No hard delete enforced across all four ledgers | Implemented — Evidence Pending | | P3-E6 master index |
| 6.3.10 | Published snapshots and review packages functional; PER annotation scoped to published state only | Implemented — Evidence Pending | | P3-E6-T06 |
| 6.3.11 | All governed taxonomies and thresholds sourced from configuration; not hard-coded | Implemented — Evidence Pending | | P3-E6-T06 §6.6 |
| 6.3.12 | Package blockers B-CON-01 through B-CON-03 resolved or deferred with sign-off | In Progress | | P3-E6-T08 §8.3 |
| 6.3.13 | Full 53-item acceptance gate in P3-E6-T08 §8.2 passes | Partially Validated | | P3-E6-T08 §8.2 |
| 6.3.14 | Spreadsheet replacement notes included | Not Started | | P3-E3 §4 |

### 6.4 Permits

See **P3-E7-T08 §4** for the full 52-item acceptance gate (AC-PRM-01 through AC-PRM-52). The high-level gates below are entry conditions; the T08 gate is the authoritative completion criterion.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.4.1 | All 7 first-class record types implemented with correct TypeScript interfaces and zero type errors | Implemented — Evidence Pending | | P3-E7-T02; AC-PRM-01 |
| 6.4.2 | No `complianceScore` field exists on any Permits record; derived health only | Implemented — Evidence Pending | | P3-E7-T04 §4; AC-PRM-05 |
| 6.4.3 | `IssuedPermit.currentStatus` only changes via `PermitLifecycleAction`; direct mutation rejected | Implemented — Evidence Pending | | P3-E7-T03 §4.2; AC-PRM-03 |
| 6.4.4 | All 20 lifecycle action types handled; invalid transitions rejected; terminal state guard active | Implemented — Evidence Pending | | P3-E7-T03 §3; AC-PRM-11-AC-PRM-13 |
| 6.4.5 | Required inspection checkpoint template library seeded; auto-generation on permit creation works | Implemented — Evidence Pending | | P3-E7-T04 §1; AC-PRM-21-AC-PRM-22 |
| 6.4.6 | Derived compliance health (`derivedHealthTier`) computed correctly for all health conditions | Implemented — Evidence Pending | | P3-E7-T04 §4; AC-PRM-33-AC-PRM-36 |
| 6.4.7 | All 15 Work Queue rules (WQ-PRM-01 through WQ-PRM-15) fire and resolve correctly | Implemented — Evidence Pending | | P3-E7-T05 §3; AC-PRM-39-AC-PRM-43 |
| 6.4.8 | PER annotation layer on IssuedPermit and InspectionVisit; read-only enforcement on PER surface | Implemented — Evidence Pending | | P3-E7-T05 §7; AC-PRM-49 |
| 6.4.9 | Data migration complete: all prior IPermit records migrated; no `complianceScore` in migrated data | In Progress | | P3-E7-T07 §1; AC-PRM-51-AC-PRM-52 |
| 6.4.10 | All 6 shared package blockers (B-PRM-01 through B-PRM-06) resolved | In Progress | | P3-E7-T08 §1 |

### 6.5 Safety

Full 60-item acceptance gate: AC-SAF-01 through AC-SAF-60 in **P3-E8-T10 §4**. High-level gates listed here.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.5.1 | SSSP base plan lifecycle (DRAFT -> PENDING_APPROVAL -> APPROVED -> SUPERSEDED) with joint 3-party approval enforced | Implemented — Evidence Pending | | P3-E8-T03; AC-SAF-01 through AC-SAF-08 |
| 6.5.2 | Weekly inspection template governance, version pinning, and normalized scoring (applicable sections only) operational | Implemented — Evidence Pending | | P3-E8-T04; AC-SAF-09 through AC-SAF-14 |
| 6.5.3 | Centralized corrective action ledger accepts all source types; severity-based due dates; overdue computed; verification workflow via `@hbc/workflow-handoff` | Implemented — Evidence Pending | | P3-E8-T05; AC-SAF-15 through AC-SAF-21 |
| 6.5.4 | Incident tiered privacy model enforced (STANDARD/SENSITIVE/RESTRICTED); `personsInvolved` never exposed outside Safety Manager/Officer; LITIGATED state escalates evidence retention | In Progress | | P3-E8-T05; AC-SAF-22 through AC-SAF-27 |
| 6.5.5 | JHA competent-person pre-condition enforced; Daily Pre-Task Plan requires APPROVED JHA reference | Implemented — Evidence Pending | | P3-E8-T06; AC-SAF-28 through AC-SAF-33 |
| 6.5.6 | Toolbox talk program operational: governed prompt library, schedule-driven intelligence (Safety Manager review of AI suggestions required before governed), governed closure model | In Progress | | P3-E8-T06; AC-SAF-34 through AC-SAF-40 |
| 6.5.7 | Orientation, subcontractor submissions, certifications, HazCom/SDS, and competent-person designations operational with appropriate expiration sweeps and Work Queue generation | Implemented — Evidence Pending | | P3-E8-T07; AC-SAF-41 through AC-SAF-47 |
| 6.5.8 | Readiness evaluation engine operational at project/subcontractor/activity levels; HARD blocker cannot be excepted; exceptions and overrides require governed joint workflow | In Progress | | P3-E8-T08; AC-SAF-48 through AC-SAF-54 |
| 6.5.9 | Composite safety scorecard published to Project Hub; PER receives sanitized score band (not raw score) and anonymized incident counts only; no annotation affordance anywhere in Safety workspace | In Progress | | P3-E8-T09; AC-SAF-55 through AC-SAF-60 |
| 6.5.10 | All 25 Work Queue rules (WQ-SAF-01 through WQ-SAF-25) registered with `@hbc/my-work-feed` and firing correctly | In Progress | | P3-E8-T09 §4; AC-SAF-58 |

### 6.6 Project Closeout

Full acceptance gate: **P3-E10-T11**. The criteria below summarize the governing Closeout family; use T11 for the full staged implementation and acceptance matrix.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.6.1 | Closeout checklist foundation works — governed template instantiation, overlay bounds, completion percentage logic, and audit trail all behave per T03/T11 Stage 1 | Implemented — Evidence Pending | | P3-E10-T11 Stage 1 |
| 6.6.2 | Lifecycle state machine and milestones work — 9-state lifecycle, 13 milestones, 8-criterion Archive-Ready gate, and PE approval gating enforced | Implemented — Evidence Pending | | P3-E10-T11 Stage 2; P3-E10-T04 |
| 6.6.3 | Subcontractor Scorecard works — Interim/FinalCloseout model, scoring, approval flow, and PE-approved snapshot API behave per T06/T11 | Implemented — Evidence Pending | | P3-E10-T11 Stage 3 |
| 6.6.4 | Lessons Learned works — rolling lesson capture, impact magnitude derivation, recommendation validation, PE approval, and lessons snapshot API behave per T05/T11 | Implemented — Evidence Pending | | P3-E10-T11 Stage 4 |
| 6.6.5 | Project Autopsy and Learning Legacy work — pre-survey, pre-briefing pack, findings/actions, legacy outputs, and milestone/publication behavior match T07/T11 | Implemented — Evidence Pending | | P3-E10-T11 Stage 5 |
| 6.6.6 | Org intelligence and Project Hub consumption stay derived/read-only — LessonsIntelligence, SubIntelligence, and LearningLegacy feed do not mutate source records | Implemented — Evidence Pending | | P3-E10-T11 Stage 6; P3-E10-T08 |
| 6.6.7 | Shared spine publication and cross-module snapshot seams work — Activity, Health, Work Queue, Related Items, Reports snapshot ingestion, Startup baseline read, and QC continuity seams remain bounded | Implemented — Evidence Pending | | P3-E10-T08; P3-E10-T11 Stage 7 |
| 6.6.8 | Executive review annotation isolation holds across all Closeout sub-surfaces; PE approval remains distinct from PE/PER annotation | Implemented — Evidence Pending | | P3-E10-T09; P3-E10-T11 Stage 7 |

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
| 6.10.1 | All TypeScript interfaces (T02, T05, T06) compile; enums match canonical definitions; authority matrix gates correctly; Layer 2 seam fields present and optional | Complete | | P3-E14-T10 AC-WAR-01 through AC-WAR-06 |
| 6.10.2 | 16-state case machine fully implemented; invalid transitions return 409; SLA computation correct for Standard/Expedited; SLA pauses at AwaitingOwner; daily expiration sweep works; `businessDaysBetween` in shared package | Complete | | P3-E14-T10 AC-WAR-07 through AC-WAR-14 |
| 6.10.3 | All 24 Activity events, 20 Work Queue rules, Health metrics, system views, and downstream report/telemetry seams are registered with shared packages; no local substitutes | Complete | | P3-E14-T09; P3-E14-T10 AC-WAR-15 through AC-WAR-20 |
| 6.10.4 | PWA surfaces: Coverage Registry, Case Workspace (5 tabs), Next Move card, complexity dial, smart empty states, owner status summary, and communications tab | Complete | | P3-E14-T10 AC-WAR-21 through AC-WAR-30 |
| 6.10.5 | SPFx surfaces: read-only coverage/case lists, Launch-to-PWA for mutations, canvas tile, and deep-link context preservation | Complete | | P3-E14-T08; P3-E14-T10 AC-WAR-31 through AC-WAR-34 |
| 6.10.6 | Reports assembly, telemetry (no PII), sanitized PER-facing signals, and back-charge advisory to Financial work without Warranty writing Financial records | Complete | | P3-E14-T09; P3-E14-T10 AC-WAR-35 through AC-WAR-38 |
| 6.10.7 | No owner-facing routes/views/auth and no subcontractor direct-access surfaces exist in Phase 3; EXT_OWNER/EXT_SUB roles remain absent | Complete | | P3-E14-T08 §4; P3-E14-T10 AC-WAR-39 through AC-WAR-41 |
| 6.10.8 | Mold-breaker UX: PM can close case without leaving workspace; Next Move visible without scrolling; owner intake + SLA + responsible party visible in one working view | Complete | | P3-E14-T10 AC-WAR-42 through AC-WAR-46 |

### 6.11 Source-of-Truth Compliance

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.11.1 | Modules respect P3-E2 authority boundaries | In Progress | | P3-E2 |
| 6.11.2 | All in-scope Phase 3 modules publish to all 4 spines per P3-A3 §7, or publish governed projections where the module architecture requires derived publication | In Progress | | P3-A3 §7; P3-E1 |
| 6.11.3 | Executive review annotation isolation — PER review artifacts stored separately from module source-of-truth; annotations do not mutate PM-owned module records | In Progress | | P3-E2 §11.2, P3-G3 §7 |
| 6.11.4 | Safety executive review exclusion boundary — no review annotation layer on Safety in Phase 3; exclusion enforced in auth and UI | Implemented — Evidence Pending | | P3-E1 §9.3, P3-E2 §7.4, P3-G3 §7 |

### 6.12 UI Conformance (cross-cutting — all Phase 3 surfaces)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.12.1 | `WorkspacePageShell` used on every Project Hub page surface — canvas, all modules, all spines, reports, and executive review views | Not Started | | P3-C1 §14.2, UI-Kit-Wave1-Page-Patterns.md |
| 6.12.2 | No hardcoded hex, rgb, or pixel values — `enforce-hbc-tokens` ESLint rule passes clean on all Phase 3 feature packages | Not Started | | P3-C1 §14.2, UI-Kit-Visual-Language-Guide.md |
| 6.12.3 | All Fluent UI primitives imported through `@hbc/ui-kit` — no direct `@fluentui/react-components` imports | Not Started | | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.4 | Data surface type selected per decision guide for each module list surface — selection documented per surface | Not Started | | P3-C1 §14.2, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.12.5 | Density system implemented via `useDensity()` — all Project Hub surfaces verified in compact, comfortable, and touch tiers | Not Started | | P3-C1 §14.2, UI-Kit-Field-Readability-Standards.md |
| 6.12.6 | Touch targets meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` on all interactive elements in all three density tiers | Not Started | | P3-C1 §14.3 MB-07, UI-Kit-Field-Readability-Standards.md |
| 6.12.7 | Horizontal scroll prohibited — all module data tables operate without horizontal scroll at >=1024px via adaptive column hiding and card fallback | Not Started | | P3-C1 §14.3 MB-04, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.12.8 | Card weight differentiation enforced — no equal-weight card grids on canvas tiles or module surfaces; `primary`/`standard`/`supporting` weights used per guidance | Not Started | | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.9 | Every data-dependent zone uses `HbcSmartEmptyState` or `HbcEmptyState` — no blank areas | Not Started | | P3-C1 §14.2 MB-01, UI-Kit-Usage-and-Composition-Guide.md |
| 6.12.10 | No feature-local duplicate reusable visual primitives — all new reusable components contributed to `@hbc/ui-kit` with stories, ARIA review, and token-only styling | Not Started | | P3-C1 §14.2, Application Standards Conformance Report |
| 6.12.11 | Phase 2 UI precedents applied — `DashboardLayout` + `HbcKpiCard` for KPI surfaces; two-column persistent layout for primary content + context panel surfaces; context-sensitive CTA labels | Not Started | | P3-C1 §14.4, P2-F1 |
| 6.12.12 | `hb-ui-ux-conformance-reviewer` conformance review passed on all Phase 3 surfaces — evidence recorded in §13 | Not Started | | P3-C1 §14.5 |

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
| 8.1 | Activation flow — full end-to-end in both lanes | Not Started | | §9.1 staging scenario |
| 8.2 | Project Hub root entry, Back to Portfolio, and project switching — PWA owns portfolio/root continuity and same-section switching with Control Center fallback; SPFx remains host-aware | Not Started | | §9.2 staging scenario; evidence must include route captures, preserved `projectId`, and restored portfolio state |
| 8.3 | Unauthorized or invalid project context handling — unauthorized/nonexistent project contexts remain in-shell with unchanged browser location; invalid module paths fall back only to the target project's Control Center | Not Started | | §9.2a staging scenario |
| 8.4 | Stale draft handling — warning + refresh flow | Not Started | | §9.3 staging scenario |
| 8.5 | Cross-lane launch SPFx->PWA — deep-link round-trip | Not Started | | §9.4 staging scenario; evidence must show canonical project route and preserved `projectId` |
| 8.6 | Cross-lane launch PWA->SPFx — siteUrl navigation with registry-based SPFx initialization before module render | Not Started | | §9.5 staging scenario; evidence must show no project-identity drift across the handoff, plus successful SPFx initialization or in-shell failure handling when unresolved |
| 8.7 | Module spine publication — all governed modules contributing through the correct publication contract or governed projection | Not Started | | §9.6 staging scenario |
| 8.8 | Canvas governance — edit-mode enforcement | Not Started | | §9.7 staging scenario |
| 8.9 | Report lifecycle — PX Review and Owner Report full cycle | Not Started | | §9.8 staging scenario |
| 8.10 | Push-to-Project-Team — structured tracked work item created; provenance preserved; closure loop requires PER confirmation | Complete | Contract + 14 business rules + 40 tests per P3-D3 §13, P3-A2 §3.4 | §9.9 staging scenario |
| 8.11 | Executive review loop — PER annotation, reviewer-generated run, push-to-team, response, and closure flow works end-to-end | In Progress | 8.1 annotation complete; 8.2 isolation complete; 8.3 reviewer-run complete; 8.4 push-to-team complete; runtime integration pending | §9.10 staging scenario |
| 8.12 | Executive review lane depth — PWA provides full executive review experience; SPFx provides broad interaction with escalation to PWA for depth | Complete | 9-row lane capability matrix + 3 escalation triggers with deep-link templates + 38 tests per P3-G1 §4.9 | §9.10 staging scenario, P3-G1 §4.9 |
| 8.13 | Annotation isolation in review loop — PER review artifacts stored independently; no module source-of-truth mutations produced during review run | Complete | Contract + 10 domain table guards + 20 zero-write proof tests per P3-E2 §11.2 | §9.10 staging scenario, P3-E2 §11.2 |
| 8.14 | Project Closeout lifecycle and lane behavior — Closeout sub-surfaces, approvals, snapshots, and lane-depth rules behave per governing docs | Not Started | | §9.11 staging scenario |
| 8.15 | Subcontract Execution Readiness lifecycle and lane behavior — case/evaluation/exception/decision model and lane-depth rules behave per governing docs | Not Started | | §9.12 staging scenario |
| 8.16 | UI conformance — all Phase 3 Project Hub surfaces pass mold-breaker conformance review; `enforce-hbc-tokens` ESLint clean; conformance evidence recorded in §13 | Not Started | | §9.13 staging scenario |

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
| **Steps** | 1. Trigger launch-to-PWA action (for example, Schedule file ingestion or Warranty mutation). 2. Verify deep-link URL construction. 3. Land in PWA. 4. Verify project identity preserved and inbound identifier normalized if needed. |
| **Expected outcome** | PWA opens with correct project, module, and context |
| **Pass criteria** | `projectId` matches; module page loads; no identity loss; `returnTo` parameter present if applicable; deep-link normalization does not change the target project |

### 9.5 Cross-lane launch PWA->SPFx

| Aspect | Definition |
|---|---|
| **Preconditions** | User in PWA; wants SharePoint context for the project |
| **Steps** | 1. Click "Open in SharePoint" or equivalent. 2. Verify `siteUrl` from registry used. 3. SPFx site opens in new tab. 4. Verify the web part resolves `siteUrl` through the registry before rendering project content. 5. If the registry cannot resolve the site, verify the surface remains in-shell and renders `@hbc/smart-empty-state` rather than project content. |
| **Expected outcome** | SPFx project site opens with correct project, or fails safely with in-shell guidance when no canonical registry record exists |
| **Pass criteria** | Correct `siteUrl` used; project resolves in SPFx before module render; new tab opens; unresolved site does not fabricate project context and instead shows smart empty state |

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
| **Steps** | 1. PER opens project in PWA (full executive review experience). 2. PER annotates supported surfaces on Financial, Schedule, Constraints, Permits, Project Closeout, Project Startup, Subcontract Execution Readiness, and Warranty — verify Safety has no annotation affordance. 3. PER generates a reviewer-generated review run. 4. Verify run uses latest confirmed PM snapshot (not draft); `runType: 'reviewer-generated'` recorded in run ledger. 5. Verify PM-owned draft state unchanged. 6. PER pushes finding to project team (§9.9 flow). 7. From SPFx, PER accesses the same supported surfaces — verify broad interaction available; verify thread management / multi-run comparison / history depth triggers Launch-to-PWA escalation. 8. Verify PER cannot write to module source-of-truth fields on any surface. |
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
| **Steps** | 1. Run `enforce-hbc-tokens` validation on Phase 3 feature packages. 2. Review representative module, spine, report, and executive-review surfaces in compact/comfortable/touch density tiers. 3. Verify smart empty states, no horizontal scroll, token-only styling, and `@hbc/ui-kit` reuse expectations. 4. Record conformance-review evidence. |
| **Expected outcome** | All Phase 3 Project Hub surfaces meet the current mold-breaker UI conformance standard without feature-local visual drift |
| **Pass criteria** | ESLint clean, conformance review recorded, and no blocking UI-kit ownership or token-usage violations remain |

---

## 10. Release-Readiness Criteria

Phase 3 is release-ready when:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 10.1 | All §18.1-§18.7 gate items pass (§2-§8 above) | Not Started | Gate checklist complete |
| 10.2 | All 14 staging scenarios pass (§9) | Not Started | Staging scenario results |
| 10.3 | Defer list is explicit and documented (§11) | Complete | §11 reviewed and confirmed |
| 10.4 | No hidden future scope inside Phase 3 acceptance | Not Started | Defer list review |
| 10.5 | Documentation current — all 32 primary Phase 3 deliverables reflect current implementation or governance state as applicable | In Progress | Deliverable review |
| 10.6 | Cross-lane evidence complete — shared, PWA-specific, and SPFx-specific (P3-G3 §10) | Not Started | Evidence matrix filled |
| 10.7 | Module source-of-truth boundaries respected (P3-E2) | In Progress | Authority boundary verification |
| 10.8 | Spreadsheet/document replacement notes aligned with implementation (P3-E3) | In Progress | Replacement verification |
| 10.9 | Central project-governance policy record deployed and enforced — approval/release policy drives report lifecycle; Reports enforces without owning the policy | Not Started | Policy record verification |
| 10.10 | UI conformance evidence complete — all Phase 3 surfaces pass mold-breaker conformance check per P3-C1 §14; `enforce-hbc-tokens` ESLint clean across all Phase 3 feature packages | Not Started | Conformance review results |

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
| P3-J1 | Documents Enabling Seams and Contracts | J | In Progress — E1 route/launch v0.2.15; E2 zone model v0.2.16 |

**Total:** 32 primary deliverables. 29 active locked artifacts (Contract/Specification/Note). 1 Superseded Reference (P3-E12). 1 Active Reference (this document). 1 Not Started Specification (P3-J1).

---

## 13. Evidence Collection Log

Evidence entries in this section should link to the governing T-file acceptance proof for the relevant module family, the lane-validation evidence from P3-G3-aligned scenarios, and current implementation evidence where a module is already contract-complete.

_This section is populated during Phase 3 implementation as evidence is collected._

| Date | Gate | Criterion # | Evidence artifact | Collector |
|---|---|---|---|---|
| — | — | — | — | — |

---

**Last Updated:** 2026-03-25 — Updated P3-H1 to reflect the current governed Phase 3 module family, including QC as an active tracked module and explicit acceptance coverage for Project Closeout and Subcontract Execution Readiness. Corrected deliverable inventory and checklist totals to match current repo truth, tightened cross-lane/no-access and invalid-context doctrine language, aligned reporting policy language to Reports as enforcer-only, refreshed validation/staging coverage, and reconciled QC/Warranty defer language with the latest governed scope boundaries.
**Governing Authority:** [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
