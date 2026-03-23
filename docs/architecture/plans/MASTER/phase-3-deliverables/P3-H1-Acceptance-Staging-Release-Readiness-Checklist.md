# P3-H1: Acceptance, Staging, and Release-Readiness Checklist

| Field | Value |
|---|---|
| **Doc ID** | P3-H1 |
| **Phase** | Phase 3 |
| **Workstream** | H — Validation, staging, and acceptance |
| **Document Type** | Active Reference |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; updated as implementation progresses and evidence is collected |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md); all Phase 3 deliverables (P3-A1 through P3-G3) |

---

## Checklist Statement

This is the **execution-ready acceptance checklist** for Phase 3 Project Hub. It operationalizes every acceptance gate from §18.1–§18.7 into trackable checklist items, defines staging scenarios for validation, establishes release-readiness criteria, and incorporates the explicit Phase 3 defer list from §22.

This is an **Active Reference** — a living document updated as implementation progresses and evidence is collected. Unlike the locked contracts and specifications in Workstreams A–G, this checklist evolves during Phase 3 execution.

Phase 3 is complete only when all §18 gates pass with evidence (Phase 3 plan §18). P3-G3 provides the lane-specific acceptance criteria that this checklist tracks.

---

## Scope

### This checklist governs

- Acceptance gate tracking (pass/fail status per criterion)
- Staging scenario definitions and execution tracking
- Release-readiness criteria
- Phase 3 defer list (explicit future-scope items)
- Evidence collection tracking

### This checklist does NOT govern

- Gate definitions — see [Phase 3 Plan §18](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
- Lane-specific acceptance criteria — see [P3-G3](P3-G3-Lane-Specific-Acceptance-Matrix.md)
- Individual deliverable content — see respective deliverables

---

## 1. Acceptance Gate Checklist — Summary

| Gate | §18 ref | Items | Status | Owner |
|---|---|---|---|---|
| Cross-lane contracts | §18.1 | 8 | Not Started | Architecture + Experience / Shell |
| Project activation | §18.2 | 4 | Not Started | Platform / Core Services |
| Home/canvas | §18.3 | 8 | Not Started | Experience / Shell + Project Hub |
| Shared spines | §18.4 | 6 | Not Started | Platform / Core Services + Project Hub |
| Core modules | §18.5 | 41 | Not Started | Architecture + Project Hub |
| Reporting | §18.6 | 15 | Not Started | Project Hub |
| Validation | §18.7 | 13 | Not Started | Architecture + Experience / Shell |
| **Total** | | **95** | | |

---

## 2. Cross-Lane Contract Checklist (§18.1)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 2.1 | Same canonical project identity — PWA resolves from route, SPFx from siteUrl | Not Started | | P3-B1 §2, P3-G3 §3.1 |
| 2.2 | Same membership validation — P3-A2 rules enforced in both lanes | Not Started | | P3-A2 §6, P3-G3 §3.2 |
| 2.3 | Smart project switching — PWA in-app, SPFx host-aware fallbacks | Not Started | | P3-B1 §2, P3-G3 §3.3 |
| 2.4 | Cross-lane handoff identity — projectId preserved during SPFx↔PWA | Not Started | | P3-G2 §5, P3-G3 §3.4 |
| 2.5 | No context loss during handoff — deep-link handler processes arrival | Not Started | | P3-B1 §6.1, P3-G3 §3.5 |
| 2.6 | PER scope validation enforced — PER non-membership scoping applied in both lanes | Not Started | | P3-A2 §3.2, P3-G3 §3.6 |
| 2.7 | PER vs. membership distinction — review-layer access does not imply project membership in either lane | Not Started | | P3-A2 §6.4, P3-G3 §3.7 |
| 2.8 | projectId normalization in handoff — all outbound deep links use projectId; projectNumber inbound normalized via registry before any cross-lane handoff | Not Started | | P3-A1 §3.4, P3-G2 §5.1, P3-G3 §3.8 |

---

## 3. Project Activation Checklist (§18.2)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 3.1 | Valid activation transaction — setup/handoff creates valid project record | Not Started | | P3-A1, P3-G3 §4.1 |
| 3.2 | Routeable context — activated project has valid route in PWA and site in SPFx | Not Started | | P3-A1, P3-G3 §4.2 |
| 3.3 | No partial activation — incomplete activation rejected, no orphaned records | Not Started | | P3-A1, P3-G3 §4.3 |
| 3.4 | Department reclassification — department change triggers downstream visibility recalculation; authority scopes recalculated; active PER overrides suspended pending re-grant | Not Started | | P3-A1 §4.3, P3-A2 §4.3, P3-G3 §4.4 |

---

## 4. Home/Canvas Checklist (§18.3)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 4.1 | Canvas-first home — `@hbc/project-canvas` renders in both lanes | Not Started | | P3-C1, P3-C3, P3-G3 §5.1 |
| 4.2 | Mandatory operational core — all 5 surfaces present in both lanes | Not Started | | P3-C2, P3-G3 §5.2 |
| 4.3 | Governance tiers — locked/role-default/optional enforced | Not Started | | P3-C1, P3-G3 §5.3 |
| 4.4 | Personalization — governed adaptive composition works in both lanes | Not Started | | P3-C3, P3-G3 §5.4 |
| 4.5 | Persistence — PWA IndexedDB+server; SPFx localStorage+SharePoint | Not Started | | P3-C3 §6, P3-G3 §5.5 |
| 4.6 | Reset to role-default — works in both lanes; mandatory tiles preserved | Not Started | | P3-C1, P3-G3 §5.6 |
| 4.7 | Complexity tiers — essential/standard/expert render per preference | Not Started | | P3-C1, P3-G3 §5.7 |
| 4.8 | Role-based visibility — tiles hidden per P3-C2 §8 (no empty placeholders) | Not Started | | P3-C2 §8, P3-G3 §5.8 |

---

## 5. Shared Spine Checklist (§18.4)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 5.1 | Health spine — PWA full detail + explainability; SPFx shared component | Not Started | | P3-D2, P3-G3 §6.1 |
| 5.2 | Activity spine — PWA full timeline; SPFx tile view | Not Started | | P3-D1, P3-G3 §6.2 |
| 5.3 | Work Queue spine — PWA full feed+panel+team; SPFx tile+panel | Not Started | | P3-D3, P3-G3 §6.3 |
| 5.4 | Related Items spine — PWA full panel+AI; SPFx compact panel | Not Started | | P3-D4, P3-G3 §6.4 |
| 5.5 | Spine data consistency — same data for same projectId in both lanes | Not Started | | P3-A3, P3-G3 §6.5 |
| 5.6 | Module publications flowing — all adapters registered and publishing | Not Started | | P3-A3 §7, P3-G3 §6.6 |

---

## 6. Core Module Checklist (§18.5)

### 6.1 Financial

For the full 48-item Financial acceptance gate, see **P3-E4-T09 §20**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E4-T09 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.1.1 | Budget CSV import — atomic validation, identity resolution, `canonicalBudgetLineId` stability across re-imports | Not Started | | P3-E4-T02 §2–§3; P3-G1 §4.1 |
| 6.1.2 | Separated cost model — `jobToDateActualCost`, `committedCosts`, `forecastToComplete` are always distinct; `costExposureToDate` = actuals + committed | Not Started | | P3-E4-T02 §3.2; P3-E2 §3.2 |
| 6.1.3 | Versioned forecast ledger — Working / ConfirmedInternal / PublishedMonthly / Superseded lifecycle; no unlock-in-place; derivation-based editing | Not Started | | P3-E4-T03 §3; P3-E2 §3.3 |
| 6.1.4 | Forecast checklist gate enforced — confirmation blocked when required items incomplete or `staleBudgetLineCount > 0` | Not Started | | P3-E4-T03 §4.3 |
| 6.1.5 | Financial Forecast Summary editing — PM-editable fields on working version only; all derived fields recompute correctly | Not Started | | P3-E4-T04 §5; P3-E2 §3.2 |
| 6.1.6 | GC/GR working model — version-scoped; editable on working version only; aggregate feeds Forecast Summary | Not Started | | P3-E4-T04 §6 |
| 6.1.7 | Cash Flow model — 13 actuals (read-only) + 18 forecast months; A/R aging read-only; cumulative chart with deficit shading | Not Started | | P3-E4-T05 §7 |
| 6.1.8 | Buyout sub-domain — dollar-weighted completion metric; `ContractExecuted` gate enforced via P3-E12; savings recognition and three-destination disposition workflow | Not Started | | P3-E4-T06 §8; P3-E1 §4.1 |
| 6.1.9 | Report-candidate designation — at most one `isReportCandidate = true` per project; P3-F1 publication handoff handler implemented (B-FIN-03 stub) | Not Started | | P3-E4-T03 §3.6; P3-E4-T09 §16 |
| 6.1.10 | PER annotation on confirmed versions — working version not visible to PER; `canonicalBudgetLineId`-anchored; carry-forward on derivation | Not Started | | P3-E4-T08 §15; P3-E2 §3.5 |
| 6.1.11 | All activity spine events, health spine metrics, and work queue items implemented per P3-E4-T08 §14 | Not Started | | P3-E4-T08 §14 |
| 6.1.12 | Spreadsheet replacement notes verified | Not Started | | P3-E3 §2 |

### 6.2 Schedule

For the comprehensive 50-item schedule acceptance gate, see **P3-E5-T11 §25**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E5-T11 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.2.1 | Schedule file ingestion (XER/XML/CSV) — PWA Required, SPFx Launch-to-PWA | Not Started | | P3-G1 §4.2; P3-E5-T01 §1 |
| 6.2.2 | Frozen import snapshots created on every ingestion — `ScheduleVersionRecord` + `ImportedActivitySnapshot` immutable | Not Started | | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.3 | Durable activity identity established (`externalActivityKey`) and maintained across versions via `ActivityContinuityLink` | Not Started | | P3-E5-T01 §1 |
| 6.2.4 | Canonical source designation — one `CanonicalScheduleSource` per project; secondary sources for comparison only | Not Started | | P3-E5-T01 §1; P3-E2 §4.3 |
| 6.2.5 | Governed baseline management — `BaselineRecord` with PE approval gate | Not Started | | P3-E5-T01 §1 |
| 6.2.6 | Dual-truth commitment layer — `ManagedCommitmentRecord` with `reconciliationStatus` tracking alignment with source truth | Not Started | | P3-E5-T02 §2; P3-E2 §4.2 |
| 6.2.7 | Reconciliation audit trail (`ReconciliationRecord`) preserved | Not Started | | P3-E5-T02 §2 |
| 6.2.8 | Stage-gated publication lifecycle — `Draft → ReadyForReview → Published → Superseded`; executive review and health spine consume Published layer only | Not Started | | P3-E5-T03 §3; P3-E2 §4.3 |
| 6.2.9 | Milestone records are view projections from Published layer; not an independent source of truth | Not Started | | P3-E5-T02 §4; P3-E2 §4.3 |
| 6.2.10 | Field work packages — `FieldWorkPackage` as child of imported activity by location/trade/time | Not Started | | P3-E5-T05 §6 |
| 6.2.11 | Commitment and blocker management — `CommitmentRecord`, `BlockerRecord`, `ReadinessRecord` | Not Started | | P3-E5-T05 §6 |
| 6.2.12 | Look-ahead planning with PPC — `LookAheadPlan`; PPC formula and window governed | Not Started | | P3-E5-T05 §6 |
| 6.2.13 | Three-tier progress verification — reported → verified → authoritative; `ProgressClaimRecord` + `ProgressVerificationRecord` | Not Started | | P3-E5-T05 §8 |
| 6.2.14 | Governed roll-up rules — work-package to activity to milestone; all methods configurable | Not Started | | P3-E5-T05 §9 |
| 6.2.15 | Scenario branch management — `ScenarioBranch` from specific version + baseline; promotion workflow | Not Started | | P3-E5-T04 §5 |
| 6.2.16 | Composite schedule grading — `ScheduleQualityGrade` with governed `GradingControlScore` array | Not Started | | P3-E5-T07 §11 |
| 6.2.17 | Multi-factor confidence scoring — `ConfidenceRecord` with 8 governed factor scores | Not Started | | P3-E5-T07 §11 |
| 6.2.18 | `RecommendationRecord` never silently mutates authoritative schedule truth; promotion creates draft records only | Not Started | | P3-E5-T07 §12 |
| 6.2.19 | Governed causation taxonomy — `CausationCode` records; applicable by record type | Not Started | | P3-E5-T07 §13 |
| 6.2.20 | Offline-first sync — `IntentRecord` durable intent log; sync state lifecycle; conflict routing for governed records | Not Started | | P3-E5-T08 §15 |
| 6.2.21 | `@hbc/field-annotations` scoped to Published layer only; no annotation on draft or managed commitment records | Not Started | | P3-E5-T09 §18; P3-E2 §4.6 |
| 6.2.22 | `@hbc/related-items` integration — 11 schedule object types; 11 relationship types | Not Started | | P3-E5-T09 §18 |
| 6.2.23 | `@hbc/my-work-feed` `ScheduleWorkAdapter` registered — 10 work item types | Not Started | | P3-E5-T09 §18 |
| 6.2.24 | All governed thresholds, grading rules, roll-up rules, and taxonomies configurable by Manager of Operational Excellence only | Not Started | | P3-E5-T09 §20; P3-E2 §4.4 |
| 6.2.25 | Package blockers B-SCH-01 through B-SCH-05 resolved or formally deferred with owner sign-off | Not Started | | P3-E5-T11 §26 |
| 6.2.26 | Full 50-item acceptance gate in P3-E5-T11 §25 passes | Not Started | | P3-E5-T11 §25 |

### 6.3 Constraints

For the comprehensive 53-item acceptance gate, see **P3-E6-T08 §8.2**. The criteria below are the high-level module-level gates required for Phase 3 release readiness; all must pass before the P3-E6-T08 detailed gate is evaluated.

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.3.1 | Four-ledger workspace implemented: Risk, Constraint, Delay, and Change ledgers each with independent CRUD and lifecycle — both lanes | Not Started | | P3-E6-T01–T04 |
| 6.3.2 | No single-record-type model: all four are peer ledgers; Constraint is not parent of Delay or Change | Not Started | | P3-E6 master index |
| 6.3.3 | Risk probability/impact assessment and riskScore working — both lanes | Not Started | | P3-E6-T01 §1 |
| 6.3.4 | Constraint lifecycle enforced; overdue detection working — both lanes | Not Started | | P3-E6-T02 §2 |
| 6.3.5 | Delay: Integrated + ManualFallback schedule reference modes; ManualFallback self-contained without P3-E5 — both lanes | Not Started | | P3-E6-T03 §3.2 |
| 6.3.6 | Delay time/commercial impact separation enforced; `separationConfirmed` gate at Quantified transition | Not Started | | P3-E6-T03 §3.4 |
| 6.3.7 | Change Ledger ManualNative mode working; canonical HB Intel identity preserved; Procore schema defined (not wired) | Not Started | | P3-E6-T04 |
| 6.3.8 | Cross-ledger spawn lineage with immutable `LineageRecord`; lineage displayed on all detail views | Not Started | | P3-E6-T05 |
| 6.3.9 | No hard delete enforced across all four ledgers | Not Started | | P3-E6 master index |
| 6.3.10 | Published snapshots and review packages functional; PER annotation scoped to published state only | Not Started | | P3-E6-T06 |
| 6.3.11 | All governed taxonomies and thresholds sourced from configuration; not hard-coded | Not Started | | P3-E6-T06 §6.6 |
| 6.3.12 | Package blockers B-CON-01 through B-CON-03 resolved or deferred with sign-off | Not Started | | P3-E6-T08 §8.3 |
| 6.3.13 | Full 53-item acceptance gate in P3-E6-T08 §8.2 passes | Not Started | | P3-E6-T08 §8.2 |
| 6.3.14 | Spreadsheet replacement notes included | Not Started | | P3-E3 §4 |

### 6.4 Permits

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.4.1 | Permit log management — Required both lanes | Not Started | | P3-E1, P3-G3 §7.4 |
| 6.4.2 | Linked inspections — Required both lanes | Not Started | | P3-E2 §6 |
| 6.4.3 | Expiration tracking — Required both lanes | Not Started | | P3-E2 §6 |

### 6.5 Safety

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.5.1 | Safety plan state — Required both lanes | Not Started | | P3-E1, P3-G3 §7.5 |
| 6.5.2 | Orientations/acknowledgments — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.3 | Checklists/inspection aggregation — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.4 | JHA log records — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.5 | Incident reports with notifications — Required both lanes | Not Started | | P3-E2 §7 |
| 6.5.6 | SSSP replacement notes included | Not Started | | P3-E3 §6 |
| 6.5.7 | Future toolbox-talk note documented | Not Started | | P3-E3 §6.4 |

### 6.6 Source-of-Truth Compliance

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.6.1 | Modules respect P3-E2 authority boundaries | Not Started | | P3-E2 |
| 6.6.2 | All modules publish to all 4 spines per P3-A3 §7 | Not Started | | P3-A3 §7 |
| 6.6.3 | Executive review annotation isolation — PER review artifacts stored separately from module source-of-truth; annotations do not mutate PM-owned module records | Not Started | | P3-E2 §11.2, P3-G3 §7.6 |
| 6.6.4 | Safety executive review exclusion boundary — no review annotation layer on Safety in Phase 3; exclusion enforced in auth and UI | Not Started | | P3-E1 §9.3, P3-E2 §7.4, P3-G3 §7.6 |

### 6.7 UI Conformance (cross-cutting — all Phase 3 surfaces)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 6.7.1 | `WorkspacePageShell` used on every Project Hub page surface — canvas, all modules, all spines, reports, executive review views | Not Started | | P3-C1 §14.2, UI-Kit-Wave1-Page-Patterns.md |
| 6.7.2 | No hardcoded hex, rgb, or pixel values — `enforce-hbc-tokens` ESLint rule passes clean on all Phase 3 feature packages | Not Started | | P3-C1 §14.2, UI-Kit-Visual-Language-Guide.md |
| 6.7.3 | All Fluent UI primitives imported through `@hbc/ui-kit` — no direct `@fluentui/react-components` imports (D-10) | Not Started | | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.7.4 | Data surface type selected per T06 decision guide for each module list surface — selection documented per surface | Not Started | | P3-C1 §14.2, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.7.5 | Density system implemented via `useDensity()` — all Project Hub surfaces verified in compact, comfortable, and touch tiers | Not Started | | P3-C1 §14.2, UI-Kit-Field-Readability-Standards.md |
| 6.7.6 | Touch targets meet `HBC_DENSITY_TOKENS[tier].touchTargetMin` on all interactive elements in all three density tiers | Not Started | | P3-C1 §14.3 MB-07, UI-Kit-Field-Readability-Standards.md |
| 6.7.7 | Horizontal scroll prohibited — all module data tables operate without horizontal scroll at ≥1024px via adaptive column hiding and card fallback | Not Started | | P3-C1 §14.3 MB-04, UI-Kit-Adaptive-Data-Surface-Patterns.md |
| 6.7.8 | Card weight differentiation enforced — no equal-weight card grids on canvas tiles or module surfaces; `primary`/`standard`/`supporting` weights used per T04 | Not Started | | P3-C1 §14.2, UI-Kit-Usage-and-Composition-Guide.md |
| 6.7.9 | Every data-dependent zone uses `HbcSmartEmptyState` or `HbcEmptyState` — no blank areas | Not Started | | P3-C1 §14.2 MB-01, UI-Kit-Usage-and-Composition-Guide.md |
| 6.7.10 | No feature-local duplicate reusable visual primitives — all new reusable components contributed to `@hbc/ui-kit` with stories, ARIA review, and token-only styling | Not Started | | P3-C1 §14.2, Application Standards Conformance Report |
| 6.7.11 | Phase 2 UI precedents applied — `DashboardLayout` + `HbcKpiCard` for all KPI surfaces; two-column persistent layout for primary content + context panel surfaces; context-sensitive CTA labels | Not Started | | P3-C1 §14.4, P2-F1 |
| 6.7.12 | `hb-ui-ux-conformance-reviewer` conformance review passed on all Phase 3 surfaces — evidence recorded in §13 | Not Started | | P3-C1 §14.5 |

---

## 7. Reporting Checklist (§18.6)

| # | Criterion | Status | Evidence | Notes |
|---|---|---|---|---|
| 7.1 | PX Review family live — PWA full lifecycle, SPFx generate+approve | Not Started | | P3-F1, P3-G3 §8.1 |
| 7.2 | Owner Report family live — PWA full lifecycle, SPFx generate+release | Not Started | | P3-F1, P3-G3 §8.2 |
| 7.3 | Draft refresh — full handling PWA, refresh supported SPFx | Not Started | | P3-F1 §4, P3-G3 §8.3 |
| 7.4 | Staleness warning — shown before export in both lanes | Not Started | | P3-F1 §5, P3-G3 §8.4 |
| 7.5 | Queued generation — asynchronous pipeline works | Not Started | | P3-F1 §6, P3-G3 §8.5 |
| 7.6 | Run-ledger tracking — PWA full browsing, SPFx Launch-to-PWA | Not Started | | P3-F1 §7, P3-G3 §8.6 |
| 7.7 | PX Review approval gate enforced | Not Started | | P3-F1 §8.1, P3-G3 §8.7 |
| 7.8 | Owner Report non-gated release works | Not Started | | P3-F1 §8.2, P3-G3 §8.8 |
| 7.9 | PM narrative overrides with provenance | Not Started | | P3-F1 §11, P3-G3 §8.9 |
| 7.10 | Export produces PDF stored in SharePoint | Not Started | | P3-F1 §9, P3-G3 §8.10 |
| 7.11 | PER report permissions enforced — view/annotate/generate reviewer runs permitted; PM draft writes and source-of-truth mutations prohibited | Not Started | | P3-F1 §8.5, P3-G3 §8.11 |
| 7.12 | Reviewer-generated review runs — `runType: 'reviewer-generated'` uses only the latest confirmed PM snapshot; PM draft state untouched | Not Started | | P3-F1 §8.6, P3-G3 §8.12 |
| 7.13 | Central project-governance policy record enforced — report-family approval/release policy owned by policy record; Reports module enforces only (no ownership) | Not Started | | P3-F1 §14, P3-G3 §8.13 |
| 7.14 | PM↔PE internal review chain blocks PX Review release — when chain is configured at project level, PX Review release requires chain completion before advancing to PX Review stage | Not Started | | P3-F1 §14.5, P3-G3 §8.14 |
| 7.15 | PER release authority per report family — `perReleaseAuthority` field respected per family definition | Not Started | | P3-F1 §14.4, P3-G3 §8.15 |

---

## 8. Validation Checklist (§18.7)

| # | Scenario | Status | Evidence | Notes |
|---|---|---|---|---|
| 8.1 | Activation flow — full end-to-end in both lanes | Not Started | | §9.1 staging scenario |
| 8.2 | Project switching — PWA in-app, SPFx host-aware | Not Started | | §9.2 staging scenario |
| 8.3 | Stale draft handling — warning + refresh flow | Not Started | | §9.3 staging scenario |
| 8.4 | Cross-lane launch SPFx→PWA — deep link round-trip | Not Started | | §9.4 staging scenario |
| 8.5 | Cross-lane launch PWA→SPFx — siteUrl navigation | Not Started | | §9.5 staging scenario |
| 8.6 | Module spine publication — all modules contributing | Not Started | | §9.6 staging scenario |
| 8.7 | Canvas governance — edit-mode enforcement | Not Started | | §9.7 staging scenario |
| 8.8 | Report lifecycle — PX Review and Owner Report full cycle | Not Started | | §9.8 staging scenario |
| 8.9 | Push-to-Project-Team — structured tracked work item created; provenance preserved; closure loop requires PER confirmation | Not Started | | §9.9 staging scenario |
| 8.10 | Executive review loop — PER annotates surface, generates reviewer-generated run, pushes to team, team responds, PER confirms closure | Not Started | | §9.10 staging scenario |
| 8.11 | Executive review lane depth — PWA provides full executive review experience; SPFx provides broad interaction with escalation to PWA for depth | Not Started | | §9.10 staging scenario, P3-G1 §4.8 |
| 8.12 | Annotation isolation in review loop — PER review artifacts stored independently; no module source-of-truth mutations produced during review run | Not Started | | §9.10 staging scenario, P3-E2 §11.2 |
| 8.13 | UI conformance — all Phase 3 Project Hub surfaces pass mold-breaker conformance review; `enforce-hbc-tokens` ESLint clean; conformance evidence recorded in §13 | Not Started | | P3-C1 §14.5 |

---

## 9. Staging Scenario Definitions

### 9.1 Activation flow

| Aspect | Definition |
|---|---|
| **Preconditions** | Setup/handoff seam available; project data prepared |
| **Steps** | 1. Initiate project activation. 2. Verify registry entry created (P3-A1). 3. Navigate to project in PWA. 4. Navigate to project in SPFx. |
| **Expected outcome** | Valid project record with `projectId`, `siteUrl`, status `active`; routeable in both lanes |
| **Pass criteria** | Both lanes resolve the project; membership rules applied; no partial activation artifacts |

### 9.2 Project switching

| Aspect | Definition |
|---|---|
| **Preconditions** | Two or more activated projects accessible to the user |
| **Steps** | 1. Open Project A in PWA. 2. Switch to Project B via context header. 3. Verify context updates. 4. In SPFx, navigate to Project B site. |
| **Expected outcome** | PWA switches cleanly; return-memory preserved; SPFx resolves correct project |
| **Pass criteria** | No stale context; correct projectId after switch; module state reflects new project |

### 9.3 Stale draft handling

| Aspect | Definition |
|---|---|
| **Preconditions** | Report draft exists; draft age exceeds staleness threshold |
| **Steps** | 1. Open report draft. 2. Observe staleness warning. 3. Attempt export — verify warning gate. 4. Refresh draft. 5. Verify refreshed timestamp. |
| **Expected outcome** | Staleness cue visible; export gated until confirmed; refresh pulls latest data |
| **Pass criteria** | Warning shown in both lanes; export blocked on stale draft; refresh works |

### 9.4 Cross-lane launch SPFx→PWA

| Aspect | Definition |
|---|---|
| **Preconditions** | User in SPFx project site; interaction requires PWA escalation |
| **Steps** | 1. Trigger launch-to-PWA action (e.g., Schedule file ingestion). 2. Verify deep-link URL construction. 3. Land in PWA. 4. Verify project identity preserved. |
| **Expected outcome** | PWA opens with correct project, module, and context |
| **Pass criteria** | projectId matches; module page loads; no identity loss; returnTo parameter present if applicable |

### 9.5 Cross-lane launch PWA→SPFx

| Aspect | Definition |
|---|---|
| **Preconditions** | User in PWA; wants SharePoint context for the project |
| **Steps** | 1. Click "Open in SharePoint" or equivalent. 2. Verify siteUrl from registry used. 3. SPFx site opens in new tab. |
| **Expected outcome** | SPFx project site opens with correct project |
| **Pass criteria** | Correct siteUrl used; project resolves in SPFx; new tab opens |

### 9.6 Module spine publication

| Aspect | Definition |
|---|---|
| **Preconditions** | At least one module with data (e.g., Financial with budget imported) |
| **Steps** | 1. Perform module action (e.g., create constraint). 2. Verify Activity spine receives event. 3. Verify Health spine receives metric. 4. Verify Work Queue item created if applicable. 5. Verify Related Items relationship registered if applicable. |
| **Expected outcome** | Module publications flow to all 4 spines per P3-A3 §7 |
| **Pass criteria** | Spine data includes module contributions; canvas tiles reflect changes |

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
| **Expected outcome** | Full lifecycle works for both families; approval gated for PX Review; non-gated for Owner Report |
| **Pass criteria** | PDF artifacts produced; run-ledger tracks all runs; approval enforcement correct |

### 9.9 Push-to-Project-Team

| Aspect | Definition |
|---|---|
| **Preconditions** | PER user in scope for a project; actionable finding on a review-capable surface (Financial, Schedule, Constraints, or Permits) |
| **Steps** | 1. PER annotates a surface section or field with a finding. 2. PER invokes Push-to-Project-Team action. 3. Verify structured work item created in `@hbc/my-work-feed` with push provenance (originRole, originReviewRunId, originAnnotationId, pushTimestamp). 4. PM receives item in work queue. 5. PM resolves and marks responded. 6. Verify closure loop triggered — PER receives confirmation notification. 7. PER confirms closure. |
| **Expected outcome** | Tracked work item with full provenance created; closure loop completes; PER-confirmed closure recorded |
| **Pass criteria** | Work item has correct provenance fields; PM queue receives item; PER closure confirmation stored; annotation not mutated post-push |

### 9.10 Executive review loop

| Aspect | Definition |
|---|---|
| **Preconditions** | PER user scoped to a project; project has at least one confirmed PM report snapshot; review-capable module data available |
| **Steps** | 1. PER opens project in PWA (full executive review experience). 2. PER annotates sections on Financial, Schedule, Constraints, and Permits surfaces — verify Safety surface has no annotation affordance. 3. PER generates a reviewer-generated review run. 4. Verify run uses latest confirmed PM snapshot (not draft); `runType: 'reviewer-generated'` recorded in run ledger. 5. Verify PM-owned draft state unchanged. 6. PER pushes finding to project team (§9.9 flow). 7. From SPFx, PER accesses same surfaces — verify broad interaction available; verify thread management / multi-run comparison / history depth triggers Launch-to-PWA escalation. 8. Verify PER cannot write to module source-of-truth fields on any surface. |
| **Expected outcome** | Full executive review loop runs end-to-end; annotation isolation preserved; reviewer-generated run uses confirmed snapshot only; Safety exclusion enforced; lane depth doctrine observed |
| **Pass criteria** | Annotation isolation confirmed (no module record mutations); reviewer run `runType` correct; PM draft state unchanged; Safety shows no annotation affordance; SPFx lane escalation triggers on depth operations; PER source-of-truth write blocked |

---

## 10. Release-Readiness Criteria

Phase 3 is release-ready when:

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 10.1 | All §18.1–§18.7 gate items pass (§2–§8 above) | Not Started | Gate checklist complete |
| 10.2 | All 10 staging scenarios pass (§9) | Not Started | Staging scenario results |
| 10.3 | Defer list is explicit and documented (§11) | Not Started | §11 reviewed and confirmed |
| 10.4 | No hidden future scope inside Phase 3 acceptance | Not Started | Defer list review |
| 10.5 | Documentation current — all 19 deliverables reflect implementation state | Not Started | Deliverable review |
| 10.6 | Cross-lane evidence complete — shared, PWA-specific, and SPFx-specific (P3-G3 §10) | Not Started | Evidence matrix filled |
| 10.7 | Module source-of-truth boundaries respected (P3-E2) | Not Started | Authority boundary verification |
| 10.8 | Spreadsheet/document replacement notes aligned with implementation (P3-E3) | Not Started | Replacement verification |
| 10.9 | Central project-governance policy record deployed and enforced — approval/release policy drives report lifecycle; Records module enforces without owning policy | Not Started | Policy record verification |
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
| 11.7 | Deeper field-first execution depth for Quality Control | QC is baseline-visible lifecycle in Phase 3 (P3-E1 §3.7) | Phase 6 |
| 11.8 | Deeper field-first execution depth for Warranty | Warranty is baseline-visible lifecycle in Phase 3 (P3-E1 §3.8) | Phase 6 |
| 11.9 | Any field-first expansion exceeding baseline-visible lifecycle for QC/Warranty | Must not leak into Phase 3 acceptance | Future phase |

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
| P3-F1 | Reports Workspace / Definition / Run / Release Contract Package | F | Contract |
| P3-G1 | Lane Capability Matrix (PWA / SPFx) | G | Specification |
| P3-G2 | Cross-Lane Navigation and Handoff Map | G | Specification |
| P3-G3 | Lane-Specific Acceptance Matrix | G | Specification |
| **P3-H1** | **Acceptance, Staging, and Release-Readiness Checklist** | **H** | **Active Reference** |

**Total:** 19 deliverables. 18 locked (Contract/Specification/Note). 1 Active Reference (this document).

---

## 13. Evidence Collection Log

_This section is populated during Phase 3 implementation as evidence is collected._

| Date | Gate | Criterion # | Evidence artifact | Collector |
|---|---|---|---|---|
| — | — | — | — | — |

---

**Last Updated:** 2026-03-22 — Governance model updates applied (dual-key routing, PER authority, review layer, Push-to-Project-Team, Safety exclusion, policy record, PM↔PE chain); §6.7 UI Conformance gate added; §8.13 UI validation; §10.10 UI release criterion; staging scenarios §9.9–§9.10 added.
**Governing Authority:** [Phase 3 Plan §18, §22](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
