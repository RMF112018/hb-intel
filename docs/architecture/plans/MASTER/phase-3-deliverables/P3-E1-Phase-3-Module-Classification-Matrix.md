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

### 1.4 Lifecycle modules (baseline-visible, deeper depth deferred)

| Module | PH7 Plan | Current repo state | Status |
|---|---|---|---|
| Quality Control | PH7-7 | No production implementation | **Controlled evolution** |
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
| 12 | Project Closeout | Always-on lifecycle | Hybrid — owns operational data; publishes snapshot to Reports | SOP: SubScorecard, LessonsLearned, Closeout Checklist | Publishes to all 4 spines |
| 13 | Project Startup | Always-on lifecycle | First-class working surface — active from project creation | Job Startup Checklist, Jobsite Safety Checklist, Responsibility Matrix, Owner Contract Review, PM Plan | Publishes to all 4 spines |
| 14 | Subcontract Compliance | Always-on core | First-class working surface — multi-record (one per subcontract) | Subcontract Checklist, Compliance Waiver | Publishes to all 4 spines; gates Buyout Log ContractExecuted (P3-E4 §6) |
| 15 | Quality Control | Baseline-visible lifecycle | Lifecycle-visible | PH7-7 | Deferred |
| 16 | Warranty | Baseline-visible lifecycle | Lifecycle-visible | PH7-8 | Deferred |

---

## 3. Module Boundary Rules

Each module operates as a **hybrid spine** — upstream/source systems remain authoritative for certain baseline inputs while Project Hub owns the normalized operational state.

### 3.1 Financial (including Buyout)

**Boundary:** Operational financial surface replacing spreadsheet workflow for project-team use, distinct from ERP/accounting system-of-record behavior.

**Must support:** Budget import, editable Financial Summary working state, editable GC/GR working model, editable Cash Flow working model, forecast checklist completion, exposure tracking, export, baseline Buyout support within the Financial domain.

**Implementation note:** Interim project-budget import must support uploaded CSV (`budget_details`), with future replacement by direct Procore API integration.

**Domain rule:** Buyout is baseline as part of the Financial module/domain (Phase 3 Plan §11.3). It is NOT a separate top-level module.

**Field-level specification:** [P3-E4 — Financial Module Field Specification](P3-E4-Financial-Module-Field-Specification.md)

### 3.2 Schedule

**Boundary:** Operational schedule surface, not full CPM authoring. Upstream schedule systems remain authoritative for detailed baseline/update data and full CPM network logic.

**Must support:** Schedule file ingestion (XER/XML/CSV), milestone tracking, manual milestone management, governed forecast overrides, upload history/restore, schedule summary projections into home, health, financial, and reports.

**Field-level specification:** [P3-E5 — Schedule Module Field Specification](P3-E5-Schedule-Module-Field-Specification.md)

### 3.3 Constraints

**Boundary:** Operational constraints surface replacing and improving worksheet-based process.

**Must support:** Create/update/close constraints, manage Change Tracking entries, manage Delay Log entries, manage due dates/BIC/responsibility/comments, quantify delay impact, export.

**Domain rule:** Constraints module owns the normalized operational ledger for Constraints, Change Tracking, and Delay Log.

**Field-level specification:** [P3-E6 — Constraints Module Field Specification](P3-E6-Constraints-Module-Field-Specification.md)

### 3.4 Permits

**Boundary:** Always-on first-class operational module. Jurisdictional artifacts/documents and governed storage locations may exist outside Project Hub with canonical references back to the permit ledger.

**Must support:** Permit log management, linked required inspections, inspection results/status summaries, expiration/status tracking, comments/notes, export.

**Field-level specification:** [P3-E7 — Permits Module Field Specification](P3-E7-Permits-Module-Field-Specification.md)

### 3.5 Safety

**Boundary:** Always-on baseline safety operating platform. Governed safety artifacts/documents may live in destination libraries with canonical references back to Project Hub.

**Must support:** Structured project safety-plan state, subcontractor acknowledgments, safety orientation records, checklist/inspection aggregation, JHA log records, emergency-plan acknowledgment state, incident-report working state and notification state, linked safety follow-up actions.

**Replaces:** Current Site Specific Safety Plan file-based workflow and weighted safety checklist baseline.

**Future-state note:** Later development should support smart toolbox-talk topic generation linked to high-risk schedule activities.

**Field-level specification:** [P3-E8 — Safety Module Field Specification](P3-E8-Safety-Module-Field-Specification.md)

### 3.6 Reports

**Boundary:** Governed report workspace — not a simple launcher and not a full freeform authoring system.

**Minimum governed report families:** PX Review, Owner Report.

**Must support per report family:** Auto-assembly from module snapshots, PM narrative override, governed draft refresh and staleness handling, queued governed generation, run-ledger tracking, export and history, release/distribution state tracking.

**Field-level specification:** [P3-E9 — Reports Module Field Specification](P3-E9-Reports-Module-Field-Specification.md)

### 3.7 Quality Control

**Boundary:** Baseline-visible lifecycle module. Architectural placement and lifecycle continuity retained. Deeper field-first tool definition intentionally deferred (Phase 3 Plan §11.2, Repo-Truth Reconciliation Note 3, §22).

### 3.8 Warranty

**Boundary:** Baseline-visible lifecycle module. Same as QC — deeper field-first definition deferred.

### 3.9 Project Closeout

**Boundary:** Always-on lifecycle module that activates when a project enters the closeout phase. Owns the operational state for all closeout execution: closeout checklist tracking, subcontractor performance evaluation, and lessons learned capture.

**Must support:** 70-item closeout checklist across 7 sections (Tasks, Document Tracking, Inspections, Turnover, Post Turnover, Closeout Documents for PX, Jurisdiction-specific requirements); subcontractor scorecard with weighted 6-section evaluation and aggregation dashboard; lessons learned structured form and organization-wide knowledge database.

**Hybrid model:** Project Closeout owns all operational closeout data. When Section 6 items (Subcontractor Evaluation Form, Lessons Learned) are completed, Project Closeout publishes a snapshot to the Reports module for assembly into release-ready artifacts. Reports does not own the closeout data — it consumes a Closeout-generated snapshot.

**Replaces:** `06 20260307_SOP_SubScorecard-DRAFT.xlsx`, `07 20260307_SOP_LessonsLearnedReport-DRAFT.xlsx`, and `Project_Closeout_Checklist.pdf` manual workflow.

**Field-level specification:** [P3-E10 — Project Closeout Module Field Specification](P3-E10-Project-Closeout-Module-Field-Specification.md)

### 3.10 Project Startup

**Boundary:** Always-on lifecycle module that is active from the moment a project is created in Project Hub. Owns the operational state for all project mobilization and startup-phase tracking.

**Must support:** 55-item Job Startup Checklist (4 sections: Owner's Contract Review, Job Start-Up, Order Services and Equipment, Permits Posted on Jobsite); 32-item Jobsite Safety Checklist for startup safety readiness (2 sections: Areas of Highest Risk, Other Risks — Pass/Fail/N/A); Responsibility Matrix (PM sheet: 84 tasks × 9 roles; Field sheet: 28 tasks × 8 roles); Owner Contract Review structured extraction; Project Management Plan (11-section structured document with both narrative and typed field capture).

**Startup Safety Checklist boundary:** The 32-item Jobsite Safety Checklist is distinct from the Safety module's (P3-E8) 93-item ongoing weighted inspection checklist. The Project Startup module owns startup safety readiness; the Safety module owns ongoing safety inspection operations. These two surfaces have no write relationship — they are parallel and complementary.

**Permits Section 4 boundary:** Job Startup Checklist Section 4 (Permits Posted on Jobsite) verifies that permits are displayed on the jobsite at startup. This has no write relationship to the Permits module (P3-E7), which manages the full permit lifecycle. The two surfaces are parallel and complementary.

**Replaces:** `Job Startup Checklist.pdf`, `Project_Startup_Checklist.pdf`, `Project_Safety_Checklist.pdf` (startup readiness portion), `Responsibility Matrix - Template.xlsx`, `Responsibility Matrix - Owner Contract Template.xlsx`, and `PROJECT MANAGEMENT PLAN 2019.docx` manual workflow. Also captures `Procore Startup Checklist Summary (1).pdf` as a Procore setup reference surface.

**Field-level specification:** [P3-E11 — Project Startup Module Field Specification](P3-E11-Project-Startup-Module-Field-Specification.md)

### 3.11 Subcontract Compliance

**Boundary:** Always-on core module with one record per subcontract per project (multi-record, like Permits). Owns the operational state for all subcontract package submission verification and compliance relief tracking. Active from the point a subcontract is being prepared for award.

**Must support:** Subcontract Checklist (12-item document package verification: Contract, Schedule A/B, Exhibit A/B, W-9, License, Insurance GL/Auto/Umbrella/Workers Comp, Compass SDI Prequalification) with budget over/under tracking and PM/APM sign-off; Compliance Waiver (optional, attached when a subcontractor does not qualify for SDI or does not meet insurance/licensing requirements) with Insurance Requirements and Licensing Requirements waiver sections and full three-party approval routing (Project Executive, CFO, Compliance Manager).

**Buyout gate rule:** A Buyout Log entry in the Financial module (P3-E4 §6) MUST NOT advance to `ContractExecuted` unless the linked Subcontract Checklist is `Complete` AND any attached Compliance Waiver is `Approved`. This gate is enforced at the API layer of the Financial module.

**Replaces:** `SUBCONTRACT CHECKLIST.xlsx` manual workflow (both worksheets: Subcontract Checklist and Compliance Waiver).

**Field-level specification:** [P3-E12 — Subcontract Compliance Module Field Specification](P3-E12-Subcontract-Compliance-Module-Field-Specification.md)

---

## 4. Domain Structure Rules

### 4.1 Financial domain includes Buyout

Buyout is NOT a separate top-level baseline module. Financial owns the budget import dependency and working model that Buyout depends on (Phase 3 Plan §11.3). PH7-11 (Buyout Log) maps to the Financial module's Buyout sub-domain.

### 4.2 QC and Warranty are baseline-visible, not equal-intensity

Quality Control and Warranty are baseline-visible lifecycle modules, not equal-intensity always-on core modules at day-one depth (Phase 3 Plan §11.2). They retain lifecycle placement and architectural continuity but do not absorb full later-phase field-first depth in Phase 3.

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
| PH7-7 Quality Control | `PH7-ProjectHub-7-QualityControl.md` | Quality Control | **Deferred** — baseline-visible lifecycle; deeper depth later |
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
| **Quality Control** | Deferred | Deferred | Deferred | Deferred |
| **Warranty** | Deferred | Deferred | Deferred | Deferred |

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

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §11–§12](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
