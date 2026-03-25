# P3-E1: Phase 3 Module Classification Matrix

| Field | Value |
|---|---|
| **Doc ID** | P3-E1 |
| **Phase** | Phase 3 |
| **Workstream** | E — Always-on core module delivery and PH7 reconciliation |
| **Document Type** | Specification |
| **Owner** | Architecture + Project Hub platform owner |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §11–§12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-A3 §7](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-G1 §4](P3-G1-Lane-Capability-Matrix.md); [PH7 Plans (ADR-0091)](../../ph7-project-hub/); [P3-D1](P3-D1-Project-Activity-Contract.md); [P3-D2](P3-D2-Project-Health-Contract.md); [P3-D3](P3-D3-Project-Work-Queue-Contract.md); [P3-D4](P3-D4-Related-Items-Registry-Presentation-Contract.md); [current-state-map](../../../blueprint/current-state-map.md) |

---

## Specification Statement

This specification classifies every Phase 3 module, reconciles the 16 PH7 feature plans into the Phase 3 module structure, locks module boundary definitions, defines depth classification rules, and aligns each module to its spine publication obligations.

Phase 3 Plan §11 defines two module tiers:

- **Always-on core modules** (11 modules): present on every activated project at day-one depth.
- **Baseline-visible lifecycle modules** (2 modules): architecturally placed with lifecycle continuity but deeper field-first definition deferred.

PH7 feature plans (16 files, ADR-0091 locked, classified as Deferred Scope pending Phase 3 formal kickoff) are implementation-shaping inputs to this phase. This specification reconciles, not ignores, those PH7 definitions.

**Repo-truth audit — 2026-03-21.** Four spine modules have mature implementations: Health (`@hbc/features-project-hub` health-pulse, SF21, ADR-0110), Work Queue (`@hbc/my-work-feed`, SF29, ADR-0115), Related Items (`@hbc/related-items`, SF14, ADR-0103), and Activity (contract locked in P3-D1, no implementation yet). Home/Canvas infrastructure (`@hbc/project-canvas`, SF13, ADR-0102) is mature. Six operational modules (Financial, Schedule, Constraints, Permits, Safety, Reports) have PH7 plans locked but no production implementation beyond reference examples. QC and Warranty have PH7 plans locked with deeper depth deferred. See §1 for full reconciliation.

---

## Specification Scope

### This specification governs

- Module classification (always-on core vs. baseline-visible lifecycle)
- Module boundary definitions per Phase 3 Plan §12
- PH7 reconciliation mapping (16 PH7 plans → Phase 3 modules)
- Depth classification rules (first-class working surface, governed report workspace, lifecycle-visible, spine owner, canvas-first surface)
- Spine publication alignment (which modules publish to which spines)
- Domain structure rules (Financial includes Buyout, QC/Warranty as lifecycle-visible)
- Executive review layer classification (which module surfaces are review-capable in Phase 3; annotation boundary rules)

### This specification does NOT govern

- Spine implementation details — see [P3-D1](P3-D1-Project-Activity-Contract.md), [P3-D2](P3-D2-Project-Health-Contract.md), [P3-D3](P3-D3-Project-Work-Queue-Contract.md), [P3-D4](P3-D4-Related-Items-Registry-Presentation-Contract.md)
- Mandatory tile definitions — see [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md)
- Per-capability lane depth — see [P3-G1 §4](P3-G1-Lane-Capability-Matrix.md)
- Module source-of-truth and action-boundary rules — see P3-E2
- Spreadsheet/document replacement reference — see P3-E3
- Individual module implementation plans — governed by PH7 plans and Phase 3 execution sequencing
- Executive review annotation layer implementation details — see [P3-D2 §2.5](P3-D2-Project-Health-Contract.md), [P3-F1](P3-F1-Reports-Workspace-Contract.md), [P3-A2 §3.2](P3-A2-Membership-Role-Authority-Contract.md)

---

## Definitions

| Term | Meaning |
|---|---|
| **Always-on core module** | A module present on every activated project at day-one depth; either owns a spine or provides a first-class working surface |
| **Baseline-visible lifecycle module** | A module with architectural placement and lifecycle continuity but deeper field-first definition deferred to a later phase |
| **First-class working surface** | An operational module providing full CRUD, editing, tracking, and export; intended to replace spreadsheet/document workflows |
| **Governed report workspace** | A module that auto-assembles reports from module snapshots with governed draft, refresh, generation, approval, and release cycles |
| **Spine owner** | A module that owns and implements one of the four shared project spines (Activity, Health, Work Queue, Related Items) |
| **Canvas-first surface** | The project home governed adaptive canvas that consumes all four spines for cross-module rollup visibility |
| **Hybrid spine** | The Phase 3 model where a central normalized contract owns canonical shape/scoring/semantics while modules retain local data authority and richer drill-down |
| **Operational surface** | A module that provides working-level project operational capability, distinct from system-of-record or full authoring behavior |
| **Module boundary** | The hard demarcation of what a module owns vs. what it consumes from other modules or upstream systems |
| **PH7 reconciliation** | The process of aligning PH7-planned detailed module behavior with the Phase 3 module structure and current repo truth |
| **Lifecycle-visible** | A module that retains navigation, basic state display, and architectural placement without full operational depth |
| **Review-capable surface** | A module surface on which Portfolio Executive Reviewer annotations may be placed via the executive review layer in Phase 3; classified per §9 |
| **Executive review annotation layer** | A separate artifact layer owned by `@hbc/field-annotations` carrying PER review annotations on module fields; never a mutation path for module source-of-truth records |

---

## 1. Current-State Reconciliation

### 1.1 Spine modules (mature implementations)

| Module | Package | Status | ADR |
|---|---|---|---|
| Project Health | `@hbc/features-project-hub` health-pulse | **Live** — mature (SF21) | ADR-0110 |
| Work Queue | `@hbc/my-work-feed` | **Live** — mature (SF29) | ADR-0115 |
| Related Items | `@hbc/related-items` | **Live** — mature (SF14) | ADR-0103 |
| Activity | (no implementation) | **Gap** — contract locked (P3-D1) | — |

### 1.2 Canvas module (mature infrastructure)

| Module | Package | Status | ADR |
|---|---|---|---|
| Home / Canvas | `@hbc/project-canvas` | **Live** — mature (SF13) | ADR-0102 |

### 1.3 Operational modules (PH7-planned, implementation deferred)

| Module | PH7 Plan | Current repo state | Status |
|---|---|---|---|
| Financial | PH7-9, PH7-11 | Reference examples in `docs/reference/example/`; no production module | **Controlled evolution** |
| Schedule | PH7-10 | Reference examples; no production module | **Controlled evolution** |
| Constraints | PH7-13 | Reference examples; no production module | **Controlled evolution** |
| Permits | PH7-12 | Reference examples; no production module | **Controlled evolution** |
| Safety | PH7-6 | Reference examples; no production module | **Controlled evolution** |
| Reports | PH7-14 | Reference examples; no production module | **Controlled evolution** |

### 1.4 Lifecycle modules (baseline-visible or governed lifecycle modules)

| Module | PH7 Plan | Current repo state | Status |
|---|---|---|---|
| Quality Control | P3-E15 (supersedes PH7-7 as Phase 3 authority) | Stage 3 record-families complete in `@hbc/features-project-hub` v0.1.93 — T03 record families, authority, data model: 17 field-level record interfaces, 5 supporting reference types, state transition matrices, identity rules, lineage contracts | **Controlled evolution** |
| Warranty | PH7-8 | No production implementation | **Controlled evolution** |

### 1.5 PH7 plan inventory

16 PH7 feature plans exist in `docs/architecture/plans/ph7-project-hub/`, canonically locked per ADR-0091 (satisfied 2026-03-09), classified as Deferred Scope pending Phase 3 formal kickoff per current-state-map.

**Classification:** Spine modules are production-mature. Canvas infrastructure is mature. Operational modules have locked PH7 plans but no production implementation. This specification classifies and organizes the work.

---

## 2. Module Classification Matrix

| # | Module | Classification | Depth | PH7 Source | Spine role |
|---|---|---|---|---|---|
| 1 | Home / Canvas | Always-on core | Canvas-first surface | PH7-3 | Consumes all 4 spines |
| 2 | Project Health | Always-on core | Spine owner | SF21 (ADR-0110) | **Owns** Health spine; publishes to Activity |
| 3 | Activity | Always-on core | Spine owner | New (P3-D1) | **Owns** Activity spine |
| 4 | Related Items | Always-on core | Spine owner | SF14 (ADR-0103) | **Owns** Related Items spine; publishes to Activity |
| 5 | Work Queue | Always-on core | Spine owner | SF29 (ADR-0115) | **Owns** Work Queue spine; publishes to Activity, Health (Office) |
| 6 | Financial | Always-on core | First-class working surface | PH7-9, PH7-11 | Publishes to all 4 spines |
| 7 | Schedule | Always-on core | First-class working surface | PH7-10 | Publishes to all 4 spines |
| 8 | Constraints | Always-on core | First-class working surface | PH7-13 | Publishes to all 4 spines |
| 9 | Permits | Always-on core | First-class working surface | PH7-12 | Publishes to all 4 spines |
| 10 | Safety | Always-on core | First-class working surface | PH7-6 | Publishes to all 4 spines |
| 11 | Reports | Always-on core | Governed report workspace | PH7-14 | Publishes to all 4 spines |
| 12 | Project Closeout | Always-on lifecycle | Hybrid — owns all operational closeout data; publishes PE-approved snapshots to Reports; derives org intelligence indexes on archive | Closeout Checklist, Subcontractor Scorecard, Lessons Learned, Project Autopsy & Learning Legacy | Publishes to all 4 spines |
| 13 | Project Startup | Always-on lifecycle | First-class working surface — active from project creation | Task Library, Safety Readiness, Contract Obligations Register, Responsibility Matrix, Project Execution Baseline (PM Plan), Permit Posting Verification | Publishes to all 4 spines |
| 14 | Subcontract Execution Readiness | Always-on core | First-class working surface — multi-record readiness case (one active case per project + subcontractor legal entity + governed award / buyout intent) | Subcontract Readiness Case, Requirement Profiles, Exception Packets, Readiness Decision | Publishes to all 4 spines; gates Buyout Log ContractExecuted (P3-E4 §6) |
| 15 | Quality Control | Baseline-visible lifecycle | First-class internal control surface — plans, reviews, issues, advisory, health, and turnover-quality readiness; deep field/mobile depth deferred | P3-E15 | Publishes to all 4 spines through governed projections |
| 16 | Warranty | Always-on lifecycle | First-class working surface — two-layer operating model (Layer 1 Phase 3, Layer 2 deferred) | PH7-8 | Publishes to all 4 spines |

---

## 3. Module Boundary Rules

Each module operates as a **hybrid spine** — upstream/source systems remain authoritative for certain baseline inputs while Project Hub owns the normalized operational state.

### 3.1 Financial (including Buyout)

**Boundary:** Governed project-financial operating surface replacing spreadsheet workflow for project-team use. Not an ERP mirror and not an accounting system of record. Budget baseline originates in Procore; actual cost data comes from Procore/ERP. Project Hub owns the normalized operational state built from those inputs.

**Operating model:** Versioned forecast ledger (Working / ConfirmedInternal / PublishedMonthly / Superseded version lifecycle; no unlock-in-place; derivation-based editing). Budget line identity is stable across re-imports via `canonicalBudgetLineId` and composite fallback matching; ambiguous matches held in reconciliation conditions requiring PM resolution. Separated cost model: `jobToDateActualCost` (actual spend), `committedCosts` (legal obligation not yet invoiced), and `forecastToComplete` (PM future estimate) are always distinct. PER annotation targets confirmed versions only — working version is never visible to PER.

**Must support:** Budget CSV import with stable identity resolution and reconciliation conditions; editable Financial Forecast Summary (working version only); editable GC/GR working model (version-scoped); editable Cash Flow working model (13 actuals + 18 forecast months; A/R aging read-only display); forecast checklist completion gate before confirmation; versioned forecast management (confirm, derive, designate report candidate); report-candidate → PublishedMonthly handoff via P3-F1 publication callback; Buyout sub-domain (procurement-control surface; dollar-weighted completion metric; savings tracking with explicit three-destination disposition workflow; `ContractExecuted` gate enforced via P3-E13 Subcontract Execution Readiness); field-level PER annotation on confirmed versions with version-aware `canonicalBudgetLineId`-anchored annotation carry-forward on version derivation; export.

**Implementation note:** Interim project-budget import must support uploaded CSV (`budget_details`), with future replacement by direct Procore API integration (`externalSourceLineId` field present in schema for forward compatibility).

**Domain rule:** Buyout is baseline as part of the Financial module/domain (Phase 3 Plan §11.3). It is NOT a separate top-level module.

**Field-level specification:** [P3-E4 — Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md) *(master index)* + T01–T09 detail files in the same directory

### 3.2 Schedule

**Boundary:** Governed schedule intelligence and collaborative execution operating model, not full CPM authoring. Upstream schedule systems remain the canonical source for CPM network logic and baseline data; HB Intel owns the commitment truth, publication lifecycle, and field execution layer on top of that source truth.

**Operating model layers:** Governed master-schedule layer (canonical source ingestion, frozen import snapshots, multi-baseline governance, dual-truth commitment reconciliation); published forecast layer (stage-gated publication lifecycle; the sole layer consumed by executive review and health spine); field execution layer (field work packages, commitment and blocker management, look-ahead planning with PPC, three-tier progress verification); plus analytics/intelligence, scenario branch, artifact/workflow, and policy/config layers.

**Must support:** Schedule file ingestion (XER/XML/CSV); durable activity identity and version reconciliation; governed baseline management; dual-truth commitment operating layer with reconciliation tracking; stage-gated publication workflow; milestone projections (view layer only, derived from published layer); field work packages, commitment management, blocker and readiness tracking; look-ahead planning with PPC; three-tier progress verification (reported → verified → authoritative); scenario branch management; composite schedule grading and multi-factor confidence scoring; governed causation taxonomy; offline-first sync with intent-log; cross-platform workflow integration; schedule summary projections into home, health, financial, and reports. All thresholds, grading rules, roll-up methods, and governed taxonomies configured exclusively by Manager of Operational Excellence.

**Field-level specification:** [P3-E5 — Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md) *(master index)* + T01–T11 detail files in the same directory

### 3.3 Constraints

**Boundary:** Governed project-controls workspace containing four peer operational ledgers. It is not a single-record constraint tracker and not a surface where risk, delay, and change are subordinate to a primary constraint record type. Each ledger is independently governed with its own lifecycle, field schema, and authority model.

**Ledger structure:** Four peer ledgers: (1) **Risk Ledger** — forward-looking risk identification, probability/impact assessment, and mitigation tracking; (2) **Constraint Ledger** — active blockers and issues requiring management action; (3) **Delay Ledger** — contemporaneous delay event records with claims-readiness orientation, schedule reference model, and time/commercial impact separation; (4) **Change Ledger** — change event management, manual-native in Phase 3, Procore-integration-ready data model with canonical HB Intel identity.

**Must support:** Risk CRUD with probability/impact assessment; constraint CRUD with spawn to delay and change; delay logging with schedule reference (integrated + manual fallback), evidence gates, and time/commercial impact separation; change event management with line items and canonical identity model; governed cross-ledger spawn/promotion lineage with immutable `LineageRecord`; published snapshot and review package model; live operational state for PM surfaces; published state for executive review. All taxonomies, thresholds, and BIC registries configurable by Manager of Operational Excellence.

**Domain rule:** Constraints module is the HB Intel-native operational workspace for risk, constraint, delay, and change management. No external system is authoritative for Risk, Constraint, or Delay records. The Change Ledger is HB Intel-native in Phase 3; in future Procore-integrated mode, HB Intel retains canonical identity and normalized status while Procore is the system of transaction for integrated change-event fields.

**Field-level specification:** [P3-E6 — Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md) *(master index)* + T01–T08 detail files in the same directory

### 3.4 Permits

**Boundary:** Always-on first-class operational module with a **multi-record governed ledger architecture**. Owns the full permit lifecycle from pre-application through post-closeout. Jurisdictional artifacts/documents and governed storage locations may exist outside Project Hub with canonical references back to the permit ledger via `PermitEvidenceRecord`.

**Must support:** Seven first-class record families — `PermitApplication`, `IssuedPermit`, `RequiredInspectionCheckpoint`, `InspectionVisit`, `InspectionDeficiency`, `PermitLifecycleAction`, `PermitEvidenceRecord`. Governed lifecycle via immutable `PermitLifecycleAction` records (no direct status mutation). Permit thread model connecting master permits, subpermits, phased releases, revisions, temporary approvals, and closeout paths. Governed required inspection checkpoint template library per permit type. **Derived compliance health only** — no manual compliance score field. Health derived from deficiencies, expiration proximity, and blocking inspection outcomes. Responsibility envelopes on `IssuedPermit` and `InspectionVisit`. Full Work Queue publication across lifecycle (15 rules). PER annotation scope on `IssuedPermit` and `InspectionVisit`. xlsx required inspections import. One-time migration from prior flat `IPermit` model.

**Locked decisions:** All 15 locked decisions from P3-E7 master index are binding. No `complianceScore` field may appear in any Permits record type.

**Field-level specification:** [P3-E7 — Permits Module Field Specification](P3-E7-Permits-Module-Field-Specification.md) *(master index + T01–T08 detail files)*

### 3.5 Safety

**Boundary:** Always-on governed safety operating platform. Manages the complete construction safety lifecycle for every active project — SSSP governance, inspection program, corrective action ledger, incident/case management, JHA and pre-task planning, toolbox talk program, worker orientation, subcontractor compliance submissions, certifications, HazCom/SDS, and competent-person designations. Publishes composite safety scorecard (inspection trend + corrective action health + readiness posture + blockers + compliance completion) to Project Hub. Publishes sanitized score band and anonymized incident counts to PER — no annotation layer, no push-to-team.

**Must support:** 15 first-class record families (SSSP Base Plan, SSSP Addendum, Inspection Checklist Template, Completed Inspection, Safety Corrective Action, Incident/Case, JHA, Daily Pre-Task Plan, Toolbox Talk Prompt, Weekly Toolbox Talk, Worker Orientation, Subcontractor Safety Submission, Certification/Qualification, HazCom/SDS, Competent-Person Designation). Governed multi-record workspace with Safety Manager authority split from project-instance content. Readiness decision surface at project/subcontractor/activity levels using governed blocker-and-exception matrix (not weighted score). 25 work queue rules. Composite safety scorecard for Project Hub and sanitized PER projection. 6 shared package blockers (B-SAF-01 through B-SAF-06) must be verified before feature implementation. Toolbox talk prompt intelligence driven by schedule activity reading (schedule-driven high-risk detection; governed mappings first; AI assistance for gaps requiring Safety Manager review).

**Replaces:** Current Site Specific Safety Plan file-based workflow, weighted safety checklist baseline, flat `ISafetyInspection` monolith, standalone `ICorrectiveAction` tied to inspections only, flat `IIncidentReport`, and basic `IJhaRecord`. `complianceScore` numeric field is dropped entirely — replaced by derived composite scorecard.

**Authority note:** Per Decisions 4–39 in P3-E8: governed sections of the SSSP are Safety Manager-only; weekly inspections are conducted by the Safety Manager, not the project team; corrective action ledger is centralized regardless of source workflow. Full decision register in master index.

**Field-level specification:** [P3-E8 — Safety Module Field Specification](P3-E8-Safety-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

### 3.6 Reports

**Boundary:** Governed report-production and distribution architecture. Reports owns the corporate template library, project family registrations, draft/snapshot/narrative configuration layer, run ledger, artifact production pipeline, spine publication, and enforcement of the central project-governance policy record. Reports does NOT own source-of-truth data from originating modules.

**Native report families (Phase 3):** PX Review (locked corporate template; PE approval required), Owner Report (configurable corporate template; non-gated release).

**Integration-driven artifact families (Phase 3):** Sub-scorecard and lessons-learned. Source data is owned by P3-E10 (Project Closeout). Reports ingests P3-E10-confirmed snapshots and assembles governed PDF artifacts. Reports does not compute sub-scorecard scores or lessons-learned entries.

**Must support per report family:** Governed corporate template library with project-level configuration overlays within template bounds; draft/active configuration version model with PE re-approval for structural changes; PM narrative authoring (text only; no data bindings); draft refresh with staleness detection and acknowledgment gate; async generation pipeline with SharePoint artifact storage; run ledger with standard and reviewer-generated run distinction; PX Review approval gate (PE-only); governed release/distribution class enforcement; PER reviewer-generated runs against confirmed PM snapshots; central project-governance policy record enforcement.

**Review-capable surface:** Yes — PER may view, annotate, and generate reviewer-generated runs for all report families in governed scope (P3-E1 §9.1).

**Field-level specification:** [P3-E9 — Reports Module Field Specification](P3-E9-Reports-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

### 3.7 Quality Control

**Boundary:** Baseline-visible lifecycle/control surface governed by P3-E15. Project Hub owns the internal QC operating model for work-package quality plans, preconstruction/design-package reviews, review findings, QC issues and corrective actions, deviations, evidence references, external approval dependencies, submittal-completeness advisory, health/readiness projections, and lifecycle continuity through pre-punch and turnover-quality readiness. Deep field/mobile execution remains intentionally deferred to Phase 6.

**Must support:** Governed enterprise QC core with controlled project extensions; work-package quality plans and mandatory/high-risk coverage; review-package administration and review findings with preserved lineage into downstream `QcIssue` records; soft-gated hold points, mockups, tests, witness points, and preinstallation meetings; authoritative QC issue/corrective-action publication into My Work; first-class deviations, evidence references, and external approval dependency tracking; submittal-completeness advisory for package completeness and official-source currentness; governed quality health and responsible-organization rollups; schedule-aware readiness and downstream handoffs to Closeout, Startup, Warranty, and future Site Controls.

**Internal-only boundary:** QC remains internal-only in Phase 3. It is not a submittal routing engine, punch tool, startup/commissioning tool, warranty workspace, or field/mobile execution engine. Package files remain in the governed document or submittal system.

**Field-level specification:** [P3-E15 — Project Hub QC Module Field Specification](P3-E15-QC-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

### 3.8 Warranty

**Boundary:** Always-on lifecycle module that activates when warranty coverage items exist for a project and remains active through coverage expiration and case resolution. Owns the operational state for warranty coverage tracking, case management, subcontractor coordination, owner intake logging, and resolution records.

**Must support:** Coverage Registry (coverage items by scope, dates, responsible subcontractor, asset/system/location anchoring, daily expiration sweep); Case Workspace (16-state lifecycle with SLA timers, two-tier Standard/Expedited SLA, escalation routing, verification gate, re-open authority); Subcontractor Coordination (assignment with supersede model, acknowledgment state machine with scope dispute paths, resolution declarations with immutability); Owner Intake Log (PM-entered only — no owner-facing portal in Phase 3); Resolution Records with back-charge advisory publication to Financial; Communications timeline for owner-originated cases.

**Two-layer model:** Layer 1 (Phase 3 scope) delivers the internal PM/specialist control surface. Layer 2 (future scope) delivers external collaborative workspace seams for owner and subcontractor direct participation. Layer 2 seam fields (`sourceChannel`, `enteredBy`, `externalReferenceId`) are present as optional discriminators on Phase 3 records. Layer 2 must write to the Phase 3 record model without forking data schema.

**Replaces:** Manual warranty tracking workflows; no existing production module.

**Field-level specification:** [P3-E14 — Project Warranty Module Field Specification](P3-E14-Project-Warranty-Module-Field-Specification.md) *(master index + T01–T10 detail files)*

### 3.9 Project Closeout

**Boundary:** Always-on lifecycle module that activates when a project enters the closeout phase and remains active through archive. Owns the operational state for all five closeout sub-surfaces: checklist execution, subcontractor scorecard, lessons learned, project autopsy and learning legacy, and the executive review layer.

**Must support:** 70-item governed closeout checklist (MOE-controlled template library, project overlay model, 6 sections); subcontractor scorecard with weighted 6-section/28-criterion evaluation in Interim and FinalCloseout evaluation types; rolling lessons learned capture with PE-gated publication; project autopsy workshop model with pre-briefing pack, pre-survey, 12-section finding framework, and learning legacy feed-forward; PE/PER annotation layer across all sub-surfaces.

**Hybrid model:** Project Closeout owns all operational closeout data. On project archive, Closeout publishes PE-approved snapshots to the Reports module (for sub-scorecard and lessons-learned PDF artifacts) and publishes to three org-wide derived intelligence indexes (SubIntelligence, LessonsIntelligence, LearningLegacy feed). Reports does not own the closeout data — it consumes a PE-approved, immutable snapshot. Org intelligence indexes are derived read models; they are not editable ledgers within the module.

**Lifecycle governance:** A 9-state `CloseoutLifecycleState` machine governs project-level state transitions. Thirteen `CloseoutMilestone` records govern formal completion events. An 8-criterion Archive-Ready gate requires explicit PE approval before project archive.

**Replaces:** `06 20260307_SOP_SubScorecard-DRAFT.xlsx`, `07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`, and `Project_Closeout_Checklist.pdf` manual workflow.

**Field-level specification:** [P3-E10 — Project Closeout Module Field Specification](P3-E10-Project-Closeout-Module-Field-Specification.md) *(master index + T01–T11 detail files)*

### 3.10 Project Startup

**Boundary:** Always-on lifecycle module that is active from the moment a project is created in Project Hub. Owns the operational state for all project mobilization and startup-phase tracking.

**Must support:** Task Library (MOE-governed `StartupTaskTemplate` catalog plus project `StartupTaskInstance` set — Pass/Fail/N/A/Pending results with `TaskBlocker` lifecycle; Section 4 items include one-to-one `PermitVerificationDetail` companion records for permit posting verification); Safety Readiness (`JobsiteSafetyChecklist` / `SafetyReadinessItem` / `SafetyRemediationRecord` — startup safety assessment with remediation assignment, escalation, and blocker model; Safety Manager co-certification required); Contract Obligations Register (`ContractObligationsRegister` / `ContractObligation` — structured obligation tracking with `OPEN` / `IN_PROGRESS` / `SATISFIED` / `WAIVED` / `NOT_APPLICABLE` lifecycle); Responsibility Matrix (PM sheet: 7 assignment roles across 71 assignment-bearing rows plus 11 reminder-only rows; Field sheet: 5 assignment roles across 27 assignment-bearing rows; named-`Primary` coverage and critical-category `acknowledgedAt` gates for certification); Project Execution Baseline (`ProjectExecutionBaseline` — 11-section PM Plan with `ExecutionAssumption` authoring and PX approval gate); readiness certification lifecycle (`ReadinessCertification` across all 6 sub-surfaces), `PEMobilizationAuthorization` (PX exclusive), and `StartupBaseline` snapshot at `BASELINE_LOCKED`.

**Safety Readiness boundary:** The startup Safety Readiness surface is distinct from the Safety module's (P3-E8) 93-item ongoing weighted inspection checklist. The Project Startup module owns startup safety readiness; the Safety module owns ongoing safety inspection operations. These two surfaces have no write relationship — they are parallel and complementary.

**Permits Section 4 boundary:** Task Library Section 4 (Permit Posting Verification) verifies that permits are displayed on the jobsite at startup via `PermitVerificationDetail` records. This has no write relationship to the Permits module (P3-E7), which manages the full permit lifecycle. The two surfaces are parallel and complementary.

**Replaces:** `Job Startup Checklist.pdf`, `Project_Startup_Checklist.pdf`, `Project_Safety_Checklist.pdf` (startup readiness portion), `Responsibility Matrix - Template.xlsx`, `Responsibility Matrix - Owner Contract Template.xlsx`, and `PROJECT MANAGEMENT PLAN 2019.docx` manual workflow. Also captures `Procore Startup Checklist Summary (1).pdf` as a Procore setup reference surface.

**Field-level specification:** [P3-E11 — Project Startup Module Field Specification](P3-E11-Project-Startup-Module-Field-Specification.md)

### 3.11 Subcontract Execution Readiness

**Boundary:** Always-on core module with one active governed `SubcontractReadinessCase` per project + subcontractor legal entity + governed award / buyout intent. Owns the operational state for requirement-profile binding, requirement-item evaluation, exception handling, and readiness decision issuance from the point a subcontract package enters award preparation.

**Must support:** Governed requirement profiles that instantiate requirement items from award-path facts rather than from a universal checklist; requirement items with independent artifact state and compliance evaluation state; SDI / prequalification as a governed requirement family with multiple valid outcomes; immutable `ExceptionSubmissionIteration` submissions with governed approval slots and controlled reassignment; `GlobalPrecedentReference` publication without automatic approval reuse; a distinct `ExecutionReadinessDecision` issued by Compliance / Risk; and timer-driven reminder / escalation behavior through shared work-intelligence primitives.

**Buyout gate rule:** A Buyout Log entry in the Financial module (P3-E4 §6) MUST NOT advance to `ContractExecuted` unless the linked readiness gate projection is `READY` from an issued `ExecutionReadinessDecision`. This gate is enforced at the API layer of the Financial module.

**Replaces:** `SUBCONTRACT CHECKLIST.xlsx` manual workflow, specifically the flat Subcontract Checklist and mutable Compliance Waiver shape.

**Field-level specification:** [P3-E13 — Subcontract Execution Readiness Module Field Specification](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md)

---

## 4. Domain Structure Rules

### 4.1 Financial domain includes Buyout

Buyout is NOT a separate top-level baseline module. Financial owns the budget import dependency and working model that Buyout depends on (Phase 3 Plan §11.3). PH7-11 (Buyout Log) maps to the Financial module's Buyout sub-domain.

### 4.2 QC is baseline-visible; Warranty is promoted to always-on lifecycle

Quality Control remains baseline-visible rather than field-first in Phase 3, but it is no longer a placeholder-only lifecycle marker. P3-E15 defines a first-class internal Project Hub QC control surface with governed record families, readiness signals, and downstream handoff seams. Only deep field/mobile execution depth is deferred.

Warranty has been promoted to an always-on lifecycle module with a full Layer 1 Phase 3 operating surface governed by P3-E14 T01–T10. Warranty delivers coverage tracking, case management with SLA, subcontractor coordination, owner intake logging, and resolution records with back-charge advisory. Layer 2 external collaborative workspace is deferred. Deeper field-first Warranty execution beyond Layer 1 is not Phase 3 scope.

### 4.3 Spine-focused modules

Home/Canvas, Project Health, Activity, Related Items, and Work Queue are spine-focused modules. They either own a spine implementation or serve as the primary consumption surface for all spines. They do not replace document/spreadsheet workflows — they provide cross-module rollup and operational surfaces.

### 4.4 Cross-cutting concerns

PH7-1 (Foundation/Data Models), PH7-2 (Routes/Shell), PH7-5 (Project Management), PH7-15 (Backend/API), and PH7-16 (Testing/Documentation) are cross-cutting plans that map to shared infrastructure packages and platform concerns rather than individual modules. These are reconciled through existing shared packages and Phase 2/3 contracts.

---

## 5. PH7 Reconciliation Map

| PH7 Plan | File | Phase 3 Module | Reconciliation |
|---|---|---|---|
| PH7-1 Foundation / Data Models | `PH7-ProjectHub-1-Foundation-DataModels.md` | Cross-cutting | **Reconciled** — `@hbc/models`, `@hbc/data-access`, `@hbc/query-hooks` exist |
| PH7-2 Routes / Shell | `PH7-ProjectHub-2-Routes-Shell.md` | Cross-cutting | **Reconciled** — Phase 2 shell complete (`@hbc/shell`, `@hbc/app-shell`) |
| PH7-3 HomePage | `PH7-ProjectHub-3-HomePage.md` | Home / Canvas | **Reconciled** — P3-C1/C2/C3 govern canvas-first home |
| PH7-4 Preconstruction | `PH7-ProjectHub-4-Preconstruction.md` | Financial (partial) | **Reconciled** — preconstruction scoping within Financial domain |
| PH7-5 Project Management | `PH7-ProjectHub-5-ProjectManagement.md` | Cross-cutting | **Reconciled** — P3-A1 (registry), P3-A2 (membership) govern |
| PH7-6 Safety | `PH7-ProjectHub-6-Safety.md` | Safety | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-7 Quality Control | `PH7-ProjectHub-7-QualityControl.md` | Quality Control | **Superseded for Phase 3 authority** — historical input only; P3-E15 now governs the Phase 3 QC module family while deeper field/mobile execution remains deferred |
| PH7-8 Warranty | `PH7-ProjectHub-8-Warranty.md` | Warranty | **Deferred** — baseline-visible lifecycle; deeper depth later |
| PH7-9 Financial Forecasting | `PH7-ProjectHub-9-FinancialForecasting.md` | Financial | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-10 Schedule | `PH7-ProjectHub-10-Schedule.md` | Schedule | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-11 Buyout Log | `PH7-ProjectHub-11-BuyoutLog.md` | Financial (Buyout) | **Reconciled** — Buyout is within Financial domain (§4.1) |
| PH7-12 Permit Log | `PH7-ProjectHub-12-PermitLog.md` | Permits | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-13 Constraints Log | `PH7-ProjectHub-13-ConstraintsLog.md` | Constraints | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-14 PX Review / Owner Report | `PH7-ProjectHub-14-PXReview-OwnerReport.md` | Reports | **Implementation-ready** — PH7 plan locked; deferred scope |
| PH7-15 Backend / API | `PH7-ProjectHub-15-Backend-API.md` | Cross-cutting | **Reconciled** — API patterns established in shared packages |
| PH7-16 Testing / Documentation | `PH7-ProjectHub-16-Testing-Documentation.md` | Cross-cutting | **Reconciled** — testing patterns established (Vitest, Playwright) |

**Reconciliation summary:** All 16 PH7 plans are accounted for. 5 map to cross-cutting infrastructure (already reconciled through existing packages and Phase 2/3 contracts). 6 map to always-on operational modules (implementation-ready, deferred scope). 2 map to lifecycle-visible modules (deferred). 1 maps to Home/Canvas (governed by P3-C1/C2/C3). 1 maps to Financial sub-domain (Buyout within Financial). 1 maps to partial Financial scope (Preconstruction).

---

## 6. Depth Classification Rules

### 6.1 First-class working surface

| Attribute | Requirement |
|---|---|
| **CRUD operations** | Full create, read, update, delete for domain records |
| **Editing** | Working-state editing for forecasts, logs, checklists, entries |
| **Tracking** | Due dates, status, responsibility, BIC integration |
| **Export** | Data export capability |
| **Workflow replacement** | Intended to replace spreadsheet/document workflow |
| **Lane depth** | Required in both PWA and SPFx per P3-G1 §4 (with SPFx-specific exceptions for file ingestion and deep history) |
| **Spine publication** | MUST publish to all 4 spines per P3-A3 §7 |

**Modules:** Financial, Schedule, Constraints, Permits, Safety

### 6.2 Governed report workspace

| Attribute | Requirement |
|---|---|
| **Auto-assembly** | Reports assembled from module snapshots |
| **Governed lifecycle** | Draft refresh → staleness handling → generation → approval → release/distribution |
| **PM narrative** | PM narrative override capability |
| **Run ledger** | Report run history tracking |
| **Families** | PX Review, Owner Report (minimum) |
| **Lane depth** | Required in both PWA and SPFx per P3-G1 §4.6 |
| **Spine publication** | MUST publish to all 4 spines per P3-A3 §7 |

**Modules:** Reports

### 6.3 Lifecycle-visible

| Attribute | Requirement |
|---|---|
| **Navigation** | Module appears in navigation and project structure |
| **Basic display** | Basic state display and lifecycle placement |
| **Architectural continuity** | Module boundary reserved; package structure prepared |
| **Deeper depth** | Deferred to later phase (field-first definition) |
| **Spine publication** | Deferred |

**Modules:** Quality Control, Warranty

### 6.4 Spine owner

| Attribute | Requirement |
|---|---|
| **Implementation** | Module owns and implements the spine package |
| **Public contract** | Spine consumed through explicit public exports only |
| **Deterministic** | Computation is deterministic where applicable |
| **Adapter model** | Spine provides adapter/registration pattern for module contributions |
| **Lane depth** | Shared package consumed identically in both lanes |

**Modules:** Project Health (Health spine), Activity (Activity spine), Work Queue (Work Queue spine), Related Items (Related Items spine)

### 6.5 Canvas-first surface

| Attribute | Requirement |
|---|---|
| **Foundation** | `@hbc/project-canvas` governed adaptive composition |
| **Governance** | 3-tier model: mandatory locked, role-default, user-managed (P3-C1) |
| **Mandatory core** | Identity header + Health + Work Queue + Related Items + Activity tiles (P3-C2) |
| **Spine consumption** | Consumes all 4 spines through mandatory tiles |
| **Lane depth** | Both PWA and SPFx use governed adaptive composition (P3-C3) |

**Modules:** Home / Canvas

---

## 7. Spine Publication Alignment

This matrix reproduces P3-A3 §7 with governing contract annotations:

| Module | Activity (P3-D1) | Health (P3-D2) | Work Queue (P3-D3) | Related Items (P3-D4) |
|---|---|---|---|---|
| **Financial** | **Required** — P3-D1 §8.1 | **Required** — Cost dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Schedule** | **Required** — P3-D1 §8.2 | **Required** — Time dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Constraints** | **Required** — P3-D1 §8.3 | **Required** — Time + Office (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Permits** | **Required** — P3-D1 §8.4 | **Required** — Field + Office (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Safety** | **Required** — P3-D1 §8.5 | **Required** — Field dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Reports** | **Required** — P3-D1 §8.6 | **Required** — Office dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Home / Canvas** | Consumes | Consumes | Consumes | Consumes |
| **Project Health** | **Required** — P3-D1 §8.7 | **Owns** | Consumes | Consumes |
| **Activity** | **Owns** | Consumes | Consumes | Consumes |
| **Work Queue** | **Required** — P3-D1 §15.1 | **Required** — Office (P3-D2 §15.3) | **Owns** | Consumes |
| **Related Items** | **Required** — P3-D1 §7.3 | Consumes | Consumes | **Owns** |
| **Project Closeout** | **Required** — P3-D1 §8.8 | **Required** — Office dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Project Startup** | **Required** — P3-D1 §8.9 | **Required** — Office dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Subcontract Execution Readiness** | **Required** — P3-D1 §8.10 | **Required** — Office dimension (P3-D2 §11) | **Required** — P3-D3 §12 | **Required** — P3-D4 §9 |
| **Quality Control** | Deferred | Deferred | Deferred | Deferred |
| **Warranty** | Required | Required | Required | Required |

---

## 8. Lane Depth Summary

Per P3-G1 §4, the following summarizes lane depth by module:

| Module | PWA | SPFx | Notable exceptions |
|---|---|---|---|
| Financial | **Required** (all capabilities) | **Required** (all capabilities); Budget import **Broad** | Budget CSV upload supported in both lanes |
| Schedule | **Required** | **Required** (most capabilities); File ingestion and upload history **Launch-to-PWA** | XER/XML ingestion and history restore are PWA-only workflows |
| Constraints | **Required** | **Required** (all capabilities) | Full parity |
| Permits | **Required** | **Required** (all capabilities) | Full parity |
| Safety | **Required** | **Required** (all capabilities) | Full parity |
| Reports | **Required** | **Required** (most capabilities); Run-ledger history **Launch-to-PWA**; PM narrative **Broad** | Deep history browsing and advanced draft editing are PWA-depth |
| Home / Canvas | **Full** governed adaptive | **Broad** governed adaptive | PWA has richer admin, recovery, and continuity (P3-C3) |
| Project Health | **Full** | **Full** (shared package) | Both consume same deterministic computation |
| Work Queue | **Full** (panel, feed, team feed) | **Broad** (tile + panel) | Full feed and team feed are PWA-depth |
| Related Items | **Full** (panel, AI suggestions) | **Broad** (tile + compact panel) | AI suggestion management is PWA-depth |
| Activity | **Full** (page + filtering) | **Broad** (tile) | Full timeline page is PWA-depth |
| Project Closeout | **Required** (all capabilities; activates at closeout phase) | **Required** (all capabilities) | Full parity |
| Project Startup | **Required** (all capabilities; active from project creation) | **Required** (all capabilities) | Full parity |
| Subcontract Execution Readiness | **Required** (case management, evaluation, gate state) | **Required** (broad direct interaction; precedent publication and deep audit are PWA-depth) | Broad parity with governed PWA-depth exceptions |
| Quality Control | Lifecycle-visible | Lifecycle-visible | Deferred |
| Warranty | Lifecycle-visible | Lifecycle-visible | Deferred |

---

## 9. Executive Review Layer Classification

This section classifies which Phase 3 module surfaces support executive review annotations and governs the annotation layer boundary rules. It applies the locked authority model from P3-A2 §3.2 to module-level surfaces.

### 9.1 Phase 3 review-capable module surfaces

Executive review annotations (placed by Portfolio Executive Reviewers) are permitted only on the following surfaces in Phase 3:

| Module | Review-capable (Phase 3) | Annotation depth | Governing contract |
|---|---|---|---|
| Financial | **Yes** | Full field-level (not summary-only) | P3-E2 §3.4, P3-A2 §4.1 |
| Schedule | **Yes** | Full field-level | P3-E2 §4.4, P3-A2 §4.1 |
| Constraints | **Yes** | Full field-level | P3-E2 §5.4, P3-A2 §4.1 |
| Permits | **Yes** | Full field-level | P3-E2 §6.4, P3-A2 §4.1 |
| Safety | **No — excluded (Phase 3)** | Read-only access only; no review annotation layer | P3-A2 §4.1; see §9.3 |
| Reports | **Yes** | Governed by P3-F1; PER report permissions and review run rules apply | P3-F1 |
| Project Health | **Yes** | Full field-level; annotation isolation rules per P3-D2 §2.5 | P3-D2 §2.5 |
| Home / Canvas | **No** | Presentation surface; not a review target | — |
| Work Queue | **No** | Operational queue surface; not a review target | — |
| Activity | **No** | Immutable event log; not a review target | — |
| Related Items | **No** | Registry surface; not a review target | — |
| Project Closeout | **Yes** | Full field-level | P3-E2 §14.5, P3-A2 §4.1 |
| Project Startup | **Yes** | Full field-level | P3-E2 §15.4, P3-A2 §4.1 |
| Subcontract Execution Readiness | **Yes** | Case, requirement item, exception-packet, and decision fields | P3-E13, P3-A2 §4.1 |
| Quality Control | **No (deferred)** | Lifecycle-visible; review layer deferred | — |
| Warranty | **No (deferred)** | Lifecycle-visible; review layer deferred | — |

### 9.2 Executive review annotation layer boundary rules

All review-capable module implementations MUST enforce the following rules:

| Rule | Description |
|---|---|
| **Annotation isolation** | Review annotations MUST be stored in a separate review-layer artifact (`@hbc/field-annotations`). They MUST NOT be stored in or alongside module source-of-truth records. |
| **No mutation path** | Review annotations MUST NOT modify any module source-of-truth record. Annotations are read-layer overlays only. No annotation may trigger a write to the module's working state. |
| **Package ownership** | `@hbc/field-annotations` owns the annotation artifact. Module packages do not own or store review annotations. |
| **Visibility before push** | Review annotations are restricted to the review circle until the Portfolio Executive Reviewer explicitly pushes to the project team. |
| **Push creates structured work item** | Push-to-Project-Team creates a governed work queue item per P3-D3 §13, not an untracked notification. |
| **Full field-level anchor depth** | Phase 3 annotation anchors on review-capable surfaces are full field-level, not summary-level only. |
| **Blocker dependency** | Phase 3 executive review depends on `@hbc/field-annotations` supporting section/block anchors for non-classic anchor targets. **Evaluated 2026-03-22 — gap confirmed, remediation delivered in `@hbc/field-annotations` v0.2.0. `AnchorType` discriminator and `HbcAnnotationAnchor` component added. Stage 7 unblocked.** |

### 9.3 Safety exclusion rationale

Safety is explicitly excluded from Phase 3 executive review for the following reasons:

- Safety data is operationally sensitive and compliance-critical. An annotation layer introduces risk of misrepresentation without operational authority.
- Portfolio Executive Reviewer posture provides read-only access to Safety module data — there is no annotation capability and no push-to-team pathway from Safety in Phase 3.
- This exclusion may be revisited in a later phase with appropriate governance controls, including explicit safety-review authority definitions.

---

## 10. Repo-Truth Reconciliation Notes

1. **Project Health module — compliant**
   Fully implemented in `@hbc/features-project-hub` health-pulse (SF21, ADR-0110). Types, computors, components, hooks, integrations, governance all live and tested at ≥95% coverage. Classified as **compliant**.

2. **Work Queue module — compliant**
   Fully implemented in `@hbc/my-work-feed` (SF29, ADR-0115). Types, registry, adapters, normalization pipeline, hooks, components, telemetry all live. Classified as **compliant**.

3. **Related Items module — compliant**
   Fully implemented in `@hbc/related-items` (SF14, ADR-0103). Types, registry, API, hooks, components, governance stub, reference integrations all live. Classified as **compliant**.

4. **Activity module — controlled evolution**
   Contract locked (P3-D1) but no implementation exists. `IGovernanceTimelineEvent` in `@hbc/related-items` is a forward-looking placeholder. Classified as **controlled evolution — gap requiring new implementation**.

5. **Home / Canvas module — controlled evolution**
   `@hbc/project-canvas` (SF13, ADR-0102) is mature. PWA `ProjectHubPage` is MVP scaffold; SPFx `DashboardPage` has 1 of 11+ pages. Both must adopt canvas-first home. Classified as **controlled evolution**.

6. **Financial, Schedule, Constraints, Permits, Safety, Reports — controlled evolution**
   PH7 plans locked (ADR-0091), classified as Deferred Scope. Reference examples exist in `docs/reference/example/`. No production module implementations beyond shared infrastructure. Classified as **controlled evolution — implementation-ready, awaiting Phase 3 execution**.

7. **Quality Control, Warranty — controlled evolution (deferred depth)**
   PH7 plans locked. Baseline-visible lifecycle placement retained. Deeper field-first definition intentionally deferred per Phase 3 Plan §11.2 and §22. Classified as **controlled evolution — lifecycle-visible**.

8. **PH7 cross-cutting plans — reconciled**
   PH7-1 (Foundation), PH7-2 (Routes/Shell), PH7-5 (Project Management), PH7-15 (Backend/API), PH7-16 (Testing) are reconciled through existing shared packages, Phase 2 shell, and Phase 3 contracts (P3-A1, P3-A2). No open reconciliation items.

---

## 11. Acceptance Gate Reference

**Gate:** Module classification and boundary gates (Phase 3 plan §18.5)

| Field | Value |
|---|---|
| **Pass condition** | All modules classified, boundaries locked, PH7 reconciliation complete, spine publication obligations mapped, lane depth aligned with P3-G1 §4, executive review layer classified per §9 and annotation boundary rules locked per P3-E2 §3.4–§7.4 |
| **Evidence required** | P3-E1 (this document), module classification matrix (§2), boundary rules (§3), PH7 reconciliation map (§5), spine publication alignment (§7), lane depth summary (§8) |
| **Primary owner** | Architecture + Project Hub platform owner |

---

## 12. Policy Precedence

This specification establishes the **module classification and boundary definitions** that downstream work must conform to:

| Deliverable | Relationship to P3-E1 |
|---|---|
| **Phase 3 Plan §11–§12** | Provides the module structure, classification tiers, and boundary rules that this specification codifies |
| **PH7 Plans (ADR-0091)** | Provide the detailed module behavior definitions that this specification reconciles into the Phase 3 structure |
| **P3-A2 §3.2** — PER Governed Authority | Defines the Portfolio Executive Reviewer posture and review-layer rules that §9 applies to module surfaces |
| **P3-A3 §7** — Module Publication Matrix | Defines spine publication obligations that each module must satisfy per §7 |
| **P3-G1 §4** — Module Lane Depth Matrix | Defines per-capability lane depth that each module must satisfy per §8 |
| **P3-D1–D4** — Spine Contracts | Define the spine contracts that modules must publish into |
| **P3-C2** — Mandatory Core Tile Family | Defines mandatory tiles that spine and canvas modules must support |
| **P3-E2** — Module Source-of-Truth / Action-Boundary Matrix | Must align module boundaries with source-of-truth, action-boundary, and executive review annotation boundary rules |
| **P3-E3** — Spreadsheet/Document Replacement Reference | Must align replacement workflows with module boundary definitions |
| **P3-F1** — Reports Contract | Must implement the Reports module per the governed report workspace classification; governs PER report permissions |
| **Any module implementation** | Must respect the classification, boundary, spine publication, and executive review annotation boundary rules in this specification |

If a downstream deliverable conflicts with this specification, this specification takes precedence for module classification and boundary definitions unless the Architecture lead approves a documented exception.

---

## 13. Module-to-Shared-Package Integration Matrix

This section defines the shared package integration obligations for every always-on core module. Feature teams implementing each module MUST treat `Required` integrations as Phase 3 acceptance gates. `Optional` integrations are recommended for completeness but are not gate-blocking. `N/A` denotes that the package is not applicable to that module.

### 13.1 Summary matrix

| Module | `@hbc/field-annotations` | `@hbc/versioned-record` | `@hbc/my-work-feed` | `@hbc/notification-intelligence` | `@hbc/bic-next-move` | `@hbc/session-state` | `@hbc/complexity` | `@hbc/workflow-handoff` | `@hbc/smart-empty-state` | `@hbc/ui-kit` |
|---|---|---|---|---|---|---|---|---|---|---|
| Financial | **R** | **R** | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Schedule | **R** | **R** | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Constraints | **R** | O | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Permits | **R** | O | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Safety | N/A ¹ | O | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Reports | **R** | **R** | **R** | **R** | **R** | **R** | **R** | **R** | **R** | **R** |
| Project Closeout | **R** | **R** | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Project Startup | **R** | **R** | **R** | **R** | **R** | **R** | **R** | — | **R** | **R** |
| Subcontract Execution Readiness | **R** | **R** | **R** | **R** | **R** | **R** | **R** | **R** ² | **R** | **R** |

**R** = Required (Phase 3 acceptance gate) — **O** = Optional (recommended, not gate-blocking) — **—** = Not applicable

¹ Safety is excluded from the executive review annotation layer (§9.3). `@hbc/field-annotations` MUST NOT be integrated in the Safety module for Phase 3.

² Subcontract Execution Readiness requires `@hbc/workflow-handoff` for governed exception-packet approval-slot routing and controlled reassignment audit.

---

### 13.2 Per-module integration contracts

#### Financial

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on **confirmed versions only** — budget line field-level anchors (`forecastToComplete`, `estimatedCostAtCompletion`, `projectedOverUnder`); Forecast Summary section-level anchors; GC/GR and cash flow block-level anchors; buyout section anchors | Version-aware anchors: `{ forecastVersionId, canonicalBudgetLineId, fieldKey/sectionKey/blockKey }` per P3-E4-T08 §15.4; working version never annotated |
| `@hbc/versioned-record` | Field-level audit trail for PM-editable fields (`forecastToComplete`, GC/GR EAC fields, forecast summary PM fields); edit provenance per P3-E4-T07 §10.7 | Version lifecycle managed by Financial module's own `IForecastVersion` ledger — not delegated to `@hbc/versioned-record` |
| `@hbc/my-work-feed` | 8 work item types via `FinancialWorkAdapter`: `BudgetReconciliationRequired`, `ForecastChecklistIncomplete`, `BudgetLineOverbudget`, `NegativeProfitForecast`, `CashFlowDeficit`, `BuyoutOverbudget`, `UndispositionedBuyoutSavings`, `BuyoutComplianceGateBlocked` | Register `FinancialWorkAdapter` per P3-D3 §12; per P3-E4-T08 §14.3 |
| `@hbc/notification-intelligence` | Cost exposure threshold alerts; forecast confirmation events; buyout savings recognition; cash flow deficit | Register notification event types; per P3-E4-T08 §14.1 |
| `@hbc/bic-next-move` | Forecast confirmation ownership; budget reconciliation BIC | Register Financial ownership items |
| `@hbc/workflow-handoff` | P3-F1 publication callback (B-FIN-03): `ReportPublishedEvent` → `PublishedMonthly` promotion handoff | Event-driven stub in Phase 3; wires when P3-F1 defines handoff contract per P3-E4-T09 §18.1 |
| `@hbc/export-runtime` | Budget line CSV; Forecast Summary snapshot for P3-F1 report pull; GC/GR CSV; Cash Flow CSV; Buyout Log CSV | Per P3-E4-T08 §13.8 |
| `@hbc/session-state` | Offline draft persistence for working forecast; operation queue for checklist mutations | IndexedDB TTL per session-state contract |
| `@hbc/complexity` | Field density gating across Essential/Standard/Expert tiers | Budget line detail, GC/GR breakdowns, and buyout sub-domain are Standard/Expert depth |
| `@hbc/smart-empty-state` | Empty budget, no forecast working state, empty buyout log | Classify per 5-state model (first-use, filter, loading-failed, etc.) |

#### Schedule

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on **Published layer only** — published activity snapshots, published milestones, published forecast lines | Scoped to Published layer; no annotation on draft or managed commitment records per P3-E5-T09 §18 |
| `@hbc/my-work-feed` | 10 work item types via `ScheduleWorkAdapter`: commitment due, commitment overdue, blocker assigned, readiness gap, acknowledgement required, acknowledgement overdue, progress claim pending verification, look-ahead plan due, publication review requested, reconciliation conflict requiring review | Register `ScheduleWorkAdapter` per P3-E5-T09 §18 |
| `@hbc/notification-intelligence` | 6 notification types: milestone at-risk, milestone critical, schedule staleness warning, commitment overdue escalation, blocker unresolved escalation, publication workflow state change | Register notification event types per P3-E5-T09 §18 |
| `@hbc/workflow-handoff` | 5 handoff types: publication review request, scenario promotion to commitment, progress claim verification request, blocker escalation to management, baseline approval request | Per P3-E5-T09 §18 |
| `@hbc/related-items` | 11 schedule object types (version, activity, milestone, work package, commitment, blocker, look-ahead plan, scenario branch, publication, baseline, progress claim); 11 relationship types (RFI, submittal, permit, inspection, drawing, photo, meeting/action item, work item, change event, owner decision, HBI recommendation) | Per P3-E5-T09 §18 |
| `@hbc/session-state` | Offline persistence for `IntentRecord` log; operation queue for all governed mutations; IndexedDB TTL per session-state contract | Supports offline-first field execution layer per P3-E5-T08 §15 |
| `@hbc/complexity` | 3-tier progressive disclosure (Essential / Standard / Expert) across all 11 T-file surface areas: activity list, milestone view, work package execution, commitment management, scenario branch, analytics/grading, confidence, look-ahead/PPC, publication workflow, cross-platform workflow, executive review | Per P3-E5-T09 §18 |
| `@hbc/export-runtime` | Schedule data export: published activity snapshots, milestone report, look-ahead plan, PPC trend, grading report, confidence report, causation report | Per P3-E5-T09 §18 |
| `@hbc/saved-views` | Saved filter/sort/grouping for activity list, work package views, look-ahead plans, blocker logs, scenario branches | Per P3-E5-T09 §18 |
| `@hbc/smart-empty-state` | No canonical source configured, no schedule file ingested, no work packages created, no look-ahead plan, empty blocker log | Classify per 5-state model |

#### Constraints

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on **published snapshots and review packages only** — `LedgerRecordSnapshot` and `ReviewPackage` anchors; never on live ledger records | Per T06 §6.4; live ledger records have no annotation write path |
| `@hbc/related-items` | Cross-module relationships for all four ledger record types (Risk, Constraint, Delay, Change Event); 9+ relationship types to Schedule, Financial, Permits, RFIs, submittals, photos, meeting items, etc. | Per T05 §5.7; all four types registered as object types |
| `@hbc/acknowledgement` | Formal acknowledgement of escalations, disposition outcomes, and review package receipt | Per T07 §7.1 |
| `@hbc/workflow-handoff` | 5 handoff types: `ConstraintEscalationHandoff`, `DelayDispositionRequest`, `ChangeEventApprovalRequest`, `ReviewPackagePublicationHandoff`, `RiskMaterializationHandoff` | Per T07 §7.2 |
| `@hbc/notification-intelligence` | 8 notification types: risk overdue, high-risk alert, constraint overdue, constraint critical, delay notification reminder, delay quantified alert, change event approval pending, review package ready | Per T07 §7.3 |
| `@hbc/bic-next-move` | BIC ownership tracking across all four ledgers | Per T07 §7.1 |
| `@hbc/versioned-record` | Field-level audit trail for all four ledger record types (who changed what and when) | Per T07 §7.1; replaces simplistic edit log |
| `@hbc/my-work-feed` | 9 work item types via `ConstraintsWorkAdapter`: risk overdue, high-risk score, constraint overdue, constraint critical, delay notification due, delay disposition required, change event approval, change event closure, review package annotation response | Per T07 §7.4 |
| `@hbc/complexity` | 3-tier progressive disclosure (Essential / Standard / Expert) across all four ledger views; risk score detail = Expert; delay analysis method = Standard/Expert; basic status = Essential | Per T07 §7.1 |
| `@hbc/export-runtime` | Export for all four ledger types: risk register, constraint log, delay log, change event log, cross-ledger summary, review package PDF | Per T07 §7.1 |
| `@hbc/session-state` | Offline persistence for constraint and delay logging; IndexedDB operation queue | Per T07 §7.1 |
| `@hbc/smart-empty-state` | No risks logged, no constraints, no delays, no change events; empty per-ledger states | Classify per 5-state model |

#### Permits

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on `IssuedPermit` and `InspectionVisit` records; `IPermitAnnotationAnchor` struct | Per P3-E7-T05 §7; required for Phase 3 acceptance (B-PRM-03) |
| `@hbc/versioned-record` | Audit trail for `IssuedPermit` field changes (expirationDate, jurisdictionContact, fees, conditions, accountability) | Required for Phase 3 acceptance (B-PRM-04) |
| `@hbc/workflow-handoff` | Cross-party handoffs: GC→jurisdiction (submission), inspector→PM (deficiency), stop-work response | Required (B-PRM-01); governs 6 named handoff scenarios per P3-E7-T05 §5 |
| `@hbc/acknowledgment` | Deficiency resolution acknowledgment; stop-work lift acknowledgment; lifecycle actions with `requiresAcknowledgment = true` | Required (B-PRM-02) |
| `@hbc/bic-next-move` | Next-move prompts on permit detail and work queue for expiration, deficiency, inspection scheduling, closeout | Required (B-PRM-05); 7 prompt types per P3-E7-T05 §6 |
| `@hbc/related-items` | Permit-to-schedule-milestone, permit-to-constraint, permit-to-financial-line relationships | Required (B-PRM-06); 5 relationship types per P3-E7-T05 §4 |
| `@hbc/my-work-feed` | 15 work queue rules (WQ-PRM-01 through WQ-PRM-15): expiration, inspection, deficiency, lifecycle events | Register `PermitsWorkAdapter`; full rule set per P3-E7-T05 §3 |
| `@hbc/notification-intelligence` | Permit expiration warnings; inspection overdue alerts; stop-work notifications | |
| `@hbc/session-state` | Offline draft for permit application and inspection entry | |
| `@hbc/complexity` | Permit log density; inspection detail depth | |
| `@hbc/smart-empty-state` | No permits logged, no inspections recorded | |

#### Safety

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | **NOT INTEGRATED** — Safety excluded from Phase 3 PER review layer (§9.3) | Do not register annotation anchors; no annotation affordance anywhere in Safety workspace |
| `@hbc/acknowledgment` | Toolbox talk acknowledgment (high-risk governed talks); orientation acknowledgment; SSSP section acknowledgment | Required (B-SAF-01); three `IAcknowledgmentConfig<T>` contexts per P3-E8-T06 and T07 |
| `@hbc/workflow-handoff` | SSSP approval routing (joint 3-party); corrective action verification; readiness override workflow; JHA approval routing | Required (B-SAF-02); 6 handoff scenarios per P3-E8-T09 §7 |
| `@hbc/bic-next-move` | Safety workspace next-move prompts: no SSSP, inspection overdue, CRITICAL CA, readiness exceptions, subcontractor blocker | Required (B-SAF-03); 7 prompt types per P3-E8-T09 §8 |
| `@hbc/my-work-feed` | 25 work queue rules (WQ-SAF-01 through WQ-SAF-25): SSSP approval, inspections, corrective actions, incidents, toolbox talks, orientations, submissions, certifications, readiness blockers | Required (B-SAF-04); register `SafetyWorkAdapter`; full rule set per P3-E8-T09 §4 |
| `@hbc/related-items` | Safety record relationships: CA originated from inspection/incident/JHA; JHA governs pre-task plans; toolbox talk fulfills prompt; addendum amends SSSP | Required (B-SAF-05); 8 relationship types per P3-E8-T09 §5 |
| `@hbc/versioned-record` | Inspection records, SSSP versions, toolbox talk records, evidence audit trail; full mutation history for governed safety records | Required (B-SAF-06); per P3-E8-T02 §4.3 |
| `@hbc/notification-intelligence` | Incident reported alerts; CRITICAL CA alerts; certification expiration warnings; orientation overdue warnings; readiness blocker escalation | |
| `@hbc/session-state` | Offline draft for inspection entry and daily pre-task plan creation | |
| `@hbc/complexity` | Safety log density; JHA step-hazard depth; corrective action aging | |
| `@hbc/smart-empty-state` | No SSSP, no inspection started, no incidents logged, no orientations recorded | |

#### Reports

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on report runs and narrative sections | Governed by P3-F1; PER report permissions apply |
| `@hbc/versioned-record` | Module snapshot storage for report assembly; report run history | Reports assemble confirmed module snapshots via versioned-record |
| `@hbc/my-work-feed` | Push-to-Project-Team work items with `IMyWorkSourceMeta` PER provenance | Per P3-D3 §5 and P3-F1 §8.5 |
| `@hbc/notification-intelligence` | Stale draft warnings; PX Review approval notifications; release notifications | |
| `@hbc/bic-next-move` | Report approval ownership (PM → PX → release) | |
| `@hbc/session-state` | Offline draft state for PM narrative | |
| `@hbc/complexity` | Report workspace density; run-ledger history depth | |
| `@hbc/workflow-handoff` | PX Review approval handoff — draft → pending approval → approved → released | |
| `@hbc/smart-empty-state` | No reports generated, no run history | |

#### Project Closeout

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PE/PER annotation layer across all five sub-surfaces (checklist, scorecard, lessons, autopsy, legacy outputs) | Per P3-E2 §14.4; annotations stored in annotation layer only — zero writes to operational records |
| `@hbc/versioned-record` | Audit trail for item results, scorecard scoring history, lessons publication lifecycle, autopsy record changes, template version capture | Required for checklist, scorecard, lessons, autopsy, and template records |
| `@hbc/workflow-handoff` | PE approval routing for all 5 gated handoffs: scorecard submission, lessons report submission, autopsy submission, OWNER_ACCEPTANCE evidence, Archive-Ready gate | Required; Closeout does not implement its own approval routing |
| `@hbc/acknowledgment` | Named-party sign-off for FinalCloseout scorecard (PM + SUPT co-signature) | Required for scorecard submission |
| `@hbc/related-items` | Cross-module record readiness signals: closeout item → permit, closeout item → financial variance, closeout item → schedule milestone, autopsy finding → lesson entry | Read-only signals; must not trigger auto-writes to item results |
| `@hbc/bic-next-move` | Next-action prompts for PM and PE: permit readiness, overdue scorecard, overdue lessons, open autopsy actions, archive approval needed | Register Closeout prompt types at module initialization |
| `@hbc/notification-intelligence` | PE review request notifications; lien deadline warnings (14-day + missed); autopsy action reminders; archive-ready PE notification | Closeout generates payloads; package handles delivery |
| `@hbc/my-work-feed` | Pending closeout items; incomplete scorecard and lessons submissions | Register `CloseoutWorkAdapter` |
| `@hbc/session-state` | Offline draft for checklist items and scorecard | |
| `@hbc/complexity` | Checklist density; scorecard scoring detail depth | |
| `@hbc/smart-empty-state` | Closeout not yet activated; no scorecard entries; no lessons entries | |

#### Project Startup

Hard-blocker packages (required before any Startup UI ships):

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PE/PER annotation layer on all six sub-surface fields | Per P3-E2 §15.4; T09 §9.1 |
| `@hbc/versioned-record` | Version-on-write for `obligationStatus`, assignment changes, task results, `BaselineSectionField.value`, `SafetyReadinessItem.result`, `ReadinessCertification.certStatus` | T09 §9.1 |
| `@hbc/project-canvas` | `StartupCanvasTileAdapter` — readiness tile from project creation through post-lock summary | T09 §9.1 |
| `@hbc/my-work-feed` | `StartupWorkAdapter` — all Work Queue items across program lifecycle, task library, obligations, safety, matrix, PM Plan, and permit posting | T09 §9.1 |
| `@hbc/activity-spine` | Activity event publication for all Startup lifecycle events | T09 §9.1 |
| `@hbc/health-spine` | Health metric publication for all 11 Startup metrics | T09 §9.1 |

High-value integrations (required, not blocking core implementation):

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/related-items` | Cross-module record relationships: permit verification → permit, obligation → schedule milestone, baseline → closeout | T09 §9.2 |
| `@hbc/notification-intelligence` | Startup readiness alerts; overdue obligation and remediation notifications | T09 §9.2 |
| `@hbc/workflow-handoff` | Safety co-certification workflow (PM submits, Safety Manager acknowledges) | Required before Safety Readiness certification is production-ready; T09 §9.2 |
| `@hbc/session-state` | Offline draft support for Task Library item entry and PM Plan section authoring | PWA offline capability; T09 §9.2 |

Evaluate-not-assume:

| Package | Evaluation question | Notes |
|---|---|---|
| `@hbc/complexity` | Does Startup need a complexity indicator beyond Health spine metrics? | Evaluate before adding; T09 §9.3 |
| `@hbc/smart-empty-state` | Empty sub-surface states | Required for UI conformance per P3-H1 §6.7.9; T09 §9.3 |

#### Subcontract Execution Readiness

| Package | Integration point | Notes |
|---|---|---|
| `@hbc/field-annotations` | PER annotation layer on readiness case, requirement items, exception packets, and decisions | Per P3-E13 |
| `@hbc/versioned-record` | Required audit trail for case mutations, evaluations, decisions, and packet iterations | |
| `@hbc/my-work-feed` | Profile bind due, artifact response overdue, approval pending, readiness decision due, execution blocked | Register `SubcontractExecutionReadinessWorkAdapter` |
| `@hbc/notification-intelligence` | Timer-driven reminder and escalation notifications for evaluator / approver work | |
| `@hbc/bic-next-move` | Blocked execution and overdue approval prompts | |
| `@hbc/session-state` | Offline draft for PM artifact intake only | Never authoritative for approval or decision actions |
| `@hbc/complexity` | Requirement-density and packet-history disclosure depth | |
| `@hbc/workflow-handoff` | Governed exception-packet approval-slot routing and controlled reassignment callbacks | |
| `@hbc/publish-workflow` | Governed precedent-publication lifecycle for `GlobalPrecedentReference` outputs | |
| `@hbc/smart-empty-state` | No readiness case, no active exceptions, no precedent references | |

---

**Last Updated:** 2026-03-24 — Updated §3.11 and related classification matrices to replace the old P3-E12 Subcontract Compliance checklist-and-waiver model with the P3-E13 Subcontract Execution Readiness case model, including Buyout gate wording, lane-depth posture, review-capable scope, and shared-package integration contracts. Prior: 2026-03-24 — Updated §3.9 Project Closeout boundary to reflect 5 sub-surfaces, Autopsy, derived intelligence model, and PE-approval-gated publication; updated module table row; updated §13 Closeout shared-package integration table to reflect all 7 required packages (workflow-handoff, acknowledgment, related-items added; versioned-record and field-annotations notes corrected). Prior: 2026-03-23 — Added §7 spine rows, §8 lane rows, §9.1 review-capable entries for Project Closeout, Project Startup, and Subcontract Compliance; added §13 Module-to-Shared-Package Integration Matrix
**Governing Authority:** [Phase 3 Plan §11–§12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
