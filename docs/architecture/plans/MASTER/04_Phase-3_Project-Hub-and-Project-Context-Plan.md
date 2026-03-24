# Phase 3 — Project Hub and Project Context Plan

**Document ID:** 04
**Classification:** Phase Master Plan
**Status:** Refined / execution-hardened planning baseline
**Primary Role:** Make Project Hub the authoritative project-centered operating layer across the dual application lanes
**Application Lanes:** PWA lane and SPFx lane
**Primary Outcome:** Deliver a shared-canonical Project Hub model with a robust PWA product, a broad SPFx companion experience, and stable cross-lane project context continuity
**Read With:** [`00_HB-Intel_Master-Development-Summary-Plan.md`](00_HB-Intel_Master-Development-Summary-Plan.md)
**Last Reviewed Against Repo Truth:** 2026-03-24

---

## 1. Purpose

Phase 3 completes the project-centered half of HB Intel's operating model. The goal is to make Project Hub the place where a user can understand, operate, and move through project work without reconstructing project state, ownership, status, risk, documents, or workflow context manually.

This phase does **not** treat Project Hub as a simple dashboard, route shell, or widget landing page. It defines Project Hub as a governed project operating layer with explicit dual-lane behavior, shared contracts, and module boundaries that are concrete enough to guide implementation.

---

## 2. Planning Basis and Repo-Truth Starting Point

This plan does **not** assume Project Hub work begins from zero. Phase 3 must build from the current repo posture rather than re-planning foundations that already exist.

### 2.1 Required governing references

This plan is written to align with the following governing architecture references:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`
- `docs/architecture/blueprint/package-relationship-map.md`

### 2.2 Repo-truth foundations already present

Phase 3 planning must explicitly acknowledge the following current-state foundations (verified 2026-03-20 against current-state-map and live packages):

- A real **PWA application shell** already exists, including router, auth integration, workspace routing, and shell composition. Phase 2 locks the shell, landing, and lane-ownership foundations that Phase 3 inherits.
- A real **`/project-hub` route** already exists in the PWA (`apps/pwa/src/router/workspace-routes.ts`). The current `ProjectHubPage` is an **MVP-level scaffold** — a portfolio dashboard with summary cards and data table — not yet the robust operating layer this phase envisions.
- Supporting shared packages already exist at verified maturity levels:
  - `@hbc/project-canvas` (v0.0.1, mature — dist build, exports, storybook, tests; SF13, ADR-0102 locked)
  - `@hbc/features-project-hub` (v0.1.82, **active expansion** — SF21 health-pulse foundation plus contract-level implementations for Financial, Schedule, Constraints, Permits, Safety, Project Closeout, Project Startup, and Subcontract Execution Readiness are live; Project Warranty T10 Stage 1 foundation implemented)
  - `@hbc/related-items` (v0.0.2, mature — cross-module record relationship panel)
  - `@hbc/workflow-handoff` (v0.1.0, mature — platform workflow primitive)
  - `@hbc/session-state` (v0.0.1, mature — SF12, ADR-0101 locked; offline model ready)
  - `@hbc/my-work-feed` (v0.0.1, mature — SF29, ADR-0115 locked; cross-module aggregation)
  - `@hbc/shell` (v0.0.3, mature — app nav context, dev-toolbar)
  - `@hbc/app-shell` (v0.0.2, **partial** — zero consumers in the workspace; see Repo-Truth Reconciliation Notes)
  - `@hbc/auth` (v0.3.0, mature — auth orchestration with /dev and /spfx exports)
- **PH7 feature plans** are extensive (61 files across 4 task directories: ph7-project-hub, ph7-estimating, ph7-business-development, ph7-remediation) and canonically locked (ADR-0091 satisfied 2026-03-09). PH7 plans are currently classified as **Deferred Scope** pending Phase 3 formal kickoff per current-state-map.
- Reference example files exist in `docs/reference/example/` (130+ artifacts covering financial, constraints, safety, estimating, compliance, and project management baselines).

### 2.3 Planning consequence

Because these foundations already exist, Phase 3 must focus on:

- **binding** existing primitives into a coherent project-centered operating-layer model,
- **reconciling** PH7-planned module behavior with current repo truth and shared-package maturity,
- **upgrading** the current MVP project-hub scaffold into a robust dual-lane product,
- and **sequencing** module delivery, reporting, and acceptance in a credible way.

Phase 3 must **not** waste effort re-describing already-established shell, canvas, and relationship foundations as if they were still hypothetical.

---

## 3. Strategic Phase Objective

Phase 3 must deliver all of the following together:

1. A **shared-canonical Project Hub model** that works across both the PWA lane and the SPFx lane.
2. A **robust PWA Project Hub product** after this phase, not a minimum implementation.
3. A **broad SPFx project-site companion experience** that supports substantial direct working capability for per-project operations.
4. A **canonical project identity, membership, and context model** that remains consistent across routes, sessions, launches, handoffs, and project switching.
5. A **canvas-first project home experience** with governed flexibility and mandatory operational core surfaces.
6. A set of **first-class project operating modules** with clear source-of-truth and action-boundary rules.
7. A **governed reporting system** that begins with PX Review and Owner Report and is extensible by design.

---

## 4. Locked Phase Strategy

### 4.1 Dual-lane operating model

Phase 3 uses a **shared-canonical cross-lane model**:

- The **PWA** is a robust first-class Project Hub product by the end of the phase.
- The **SPFx lane** is a broad project-site companion, not a thin launcher shell.
- Both lanes must honor the same canonical rules for:
  - project identity
  - project context
  - membership and role
  - module visibility
  - activity / health / work / relationship semantics
  - report generation and run tracking
- The **PWA remains richer** for:
  - cross-project continuity
  - personal and workspace continuity
  - deeper workflow execution
  - broader recovery, persistence, and power-user patterns

### 4.2 Project context authority

Phase 3 uses a **hybrid project context model with hard rules**:

- The **URL/route is canonical** for addressable project identity.
- Shell, store, and session layers may carry enriched working context such as:
  - last valid page per project
  - filters / sort / view state
  - return-memory
  - draft/session recovery state
- Enriched context **cannot silently override** the route-carried project identity.
- On mismatch, the route/URL wins unless the user explicitly initiates a project switch.

### 4.3 Project switching behavior

Project switching uses a **smart same-page model**:

- When a user changes projects, the system should try to keep the user on the equivalent page/section in the target project.
- If the target page is unavailable, unauthorized, or invalid for that project, the system falls back to the target project's home page.
- Return-memory must be tracked **per project**, not as one global last page.

### 4.4 Project activation model

Project activation must use a **single Project Hub activation transaction**:

- Acknowledging setup/handoff must create or finalize the canonical project record.
- The same activation transaction must bind site association(s) and baseline routeable project context.
- Activation must leave the project in a valid state for both PWA and SPFx consumption.
- Partial activation is not an acceptable steady-state pattern.

---

## 5. Desired End State

At the end of Phase 3:

- Project Hub is a real operational destination in both lanes.
- The PWA is a strong project product, not a placeholder.
- The SPFx lane supports broad project-site operational work without forking canonical semantics.
- Users can move across project surfaces without reconstructing project identity, team context, activity, or ownership manually.
- Project home is canvas-first and governed, with mandatory operational core surfaces on every project.
- Module state can publish into shared project spines for:
  - health
  - activity
  - work queue / next actions
  - related items
  - reporting
- First-class project modules support meaningful in-app work instead of summary-only placeholders.
- PX Review and Owner Report run inside a governed reporting system with tracked drafts, exports, release state, and history.

---

## 6. Scope

### 6.1 In scope

- Project Hub dual-lane operating model
- Canonical project identity, project context, membership, and site association rules
- Project activation / handoff completion contract
- Canvas-first project home with governed tile policy
- Mandatory operational core for project home
- Shared project spines for:
  - health
  - activity
  - work queue
  - related-items relationships
- Always-on core module delivery and PH7 reconciliation
- Lifecycle-visible module positioning rules
- Project-to-domain navigation and cross-lane continuity
- Governed reporting workspace, report definitions, report runs, and export/release rules
- Review Mode phase assignment governance and kickoff reclassification note
- Document-enabling seams for project context: project-scoped launch and route contracts, project zone model, source/authority/restriction vocabulary, related-item document references, preview/adaptive contract, and publish/handoff intent seams (Workstream J — **enablement only**; full Documents product is Phase 5)

### 6.2 Out of scope

- Full replacement of all upstream systems of record
- Full CPM authoring inside Project Hub
- Full ERP/accounting system behavior inside Project Hub
- Full claims/legal/contract-administration platform inside Constraints
- Full jurisdiction-facing permitting platform
- Full enterprise EHS platform beyond the committed Project Hub safety operating model
- Full field-first execution depth for QC and Warranty; deeper definition is deferred to `07_Phase-6_Field-First-HB-Site-Control-Plan.md` (see Repo-Truth Reconciliation Note 3)
- Future direct Procore API replacement of interim budget file import (explicit future-state item)
- Future smart toolbox talk topic automation linked to schedule risk/activity triggers (explicit future-state item)
- Full unified Documents product: global Documents shell, My Files / Departments / Company roots, global smart views (Recent / Shared With Me / Pinned), platform-wide document search, cross-workspace document unification, desktop-sync orchestration — all Phase 5 scope (see `06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`)

---

## 7. Source-of-Truth Hierarchy for this Phase

Unless superseded by a later locked decision, Phase 3 implementation must follow this hierarchy:

1. This refined Phase 3 master plan
2. Locked Phase 3 deliverables and contracts produced from this plan
3. Governing architecture references
4. Current repo-truth shared packages and PH7 feature plans (classified Deferred Scope until Phase 3 kickoff)
5. External authoritative platform constraints and documentation

This plan is the controlling master-plan reference for Project Hub / Project Context work in this phase.

---

## 8. Core Architecture Decisions

### 8.1 Canonical project registry and baseline project context

Phase 3 uses a **hybrid registry model**:

- One **central canonical project registry** owns:
  - project ID
  - project number
  - project name
  - lifecycle classification
  - site association(s)
  - primary team / ownership anchors
  - baseline routeable context
- Project sites, project-local lists, and module records are subordinate project-linked surfaces, not the canonical source of project identity.

### 8.2 Role and project-membership authority

Phase 3 uses a **hybrid membership authority**:

- Central auth / registry contracts own canonical:
  - project access eligibility
  - effective Project Hub role context
  - module visibility / enablement
  - canvas defaults and locked tiles
  - lane access decisions
- Site-local or module-local membership data may exist as projection/cached/subordinate data but may not silently override canonical Project Hub access truth.

### 8.3 Activity spine

Phase 3 uses a **hybrid activity spine**:

- Modules publish normalized project activity into a central project activity contract.
- Project Hub consumes this central activity stream for:
  - home/canvas activity surfaces
  - project activity views
  - reporting inputs
  - cross-project continuity later
- Module-specific enrichment is fetched on demand.

### 8.4 Project Health model

Phase 3 uses a **hybrid health spine**:

- A central Project Health model owns:
  - project-level status/scoring
  - explainability / confidence outputs
  - top recommended actions / escalations
  - normalized module contributions
- Modules retain richer local detail, thresholds, and drill-down logic.

### 8.5 Related-items relationships

Phase 3 uses a **hybrid relationship model**:

- A central registry defines canonical relationship types, visibility rules, directionality, and resolution behavior.
- Modules remain responsible for local record linkage, local data authority, and richer drill-down behavior.

### 8.6 Work queue model

Phase 3 uses a **hybrid work spine**:

- A central normalized work contract owns:
  - queue item shape
  - priority/scoring
  - project filtering
  - visibility rules
  - queue count/badge semantics
- Modules retain authority over:
  - item origin
  - business rules
  - completion/update semantics
  - deeper module workflows

### 8.7 Reporting model

Phase 3 reporting uses all of the following:

- **Governed report workspace** as the Project Hub reporting surface
- **Hybrid report-definition model** with a central definition registry and module-supplied adapters/enrichment
- **Hybrid report-run ledger** for run metadata, status, artifact references, and release/distribution state
- **Hybrid generation model** with inline readiness/preview and queued governed generation
- **Hybrid draft model** with saved narrative overrides plus refreshable live snapshots
- **Hybrid stale-draft model** that warns on staleness before export and binds final output to a specific confirmed draft snapshot
- **Approval-governed publication/distribution model**

Report-family approval rules are explicitly different:

- **PX Review requires explicit approval** before it is treated as approved/released.
- **Owner Report does not require a separate explicit approval gate**, but still participates in governed run, export, storage, and distribution tracking.

---

## 9. Project Home and Canvas Model

### 9.1 Primary composition model

Project home is **canvas-first**.

- `@hbc/project-canvas` is a required foundation for Phase 3.
- The project home surface is not a fixed dashboard with optional personalization bolted on later.
- Canvas governance is part of the product definition, not a secondary enhancement.

### 9.2 Governance model

Phase 3 uses **governed flexibility**:

- every role gets a default canvas
- some tiles are mandatory and locked
- some tiles are role-default but adjustable
- some tiles are optional/user-managed

Required governance types:

- **Mandatory locked tiles**
- **Role-default recommended tiles**
- **User-managed optional tiles**

Tile governance must define at minimum:

- visibility by role
- lock state
- default position/size
- data-source expectations
- future/deferred status

### 9.3 Mandatory operational core on every home canvas

Every Project Hub home canvas must include:

- Project identity / context header
- Project Health visibility
- Next-action / Work Queue visibility
- Related-items visibility
- Recent project activity visibility

### 9.4 Next-action / Work Queue semantics

The mandatory next-action surface is **hybrid**:

- current-user project-filtered work first
- plus project-team operational items and escalations

It is user-centered first, but not user-exclusive.

---

## 10. Lane Capability Model

### 10.1 Canonical lane rule

Both lanes consume the same canonical shared contracts. Lane differences are about depth, continuity, and host behavior, not about inventing different project semantics.

### 10.2 Lane posture

#### PWA lane

The PWA must be the richer product for:

- cross-project continuity
- personal/workspace continuity
- advanced workflow depth
- richer recovery/session continuity
- deeper multi-surface navigation behavior

#### SPFx lane

The SPFx lane must be a **broad operational project-site companion**:

- strong project home/canvas experience
- substantial direct working capability across most always-on core modules
- meaningful site-native operational value
- launch into deeper PWA workflows only where the PWA remains intentionally richer

### 10.3 Cross-lane matrix

| Capability | Shared Canonical Contract | PWA | SPFx |
|---|---|---|---|
| Project identity | Route/URL canonical | Full | Full |
| Project switching | Smart same-page switching | Full | Full, with host-aware fallbacks |
| Home/canvas | Same governance and mandatory core | Richer continuity/customization | Broad site-native companion |
| Health/activity/work/related-items | Same normalized semantics | Full | Full |
| Financial / Schedule / Constraints / Permits / Safety / Project Startup | Same authority boundaries | First-class working surfaces | Broad operational surfaces |
| Reports | Same report definitions, runs, and release model | Richer history/continuity/recovery | Broad report interaction and launch |
| Cross-project continuity | Shared identity rules | Richest | Limited by host reality |
| Advanced workflow depth | Shared baseline contracts | Richest | Broad but not canonical owner of deepest flows |

---

## 11. Module Structure and Classification

### 11.1 Always-on core modules

The always-on core baseline for every activated project is:

- Home / Canvas
- Project Health
- Activity
- Related Items
- Work Queue
- Project Startup
- Financial
- Schedule
- Constraints
- Permits
- Reports
- Safety

### 11.2 Baseline-visible lifecycle modules

**Quality Control** is a baseline-visible lifecycle module rather than an equal-intensity always-on core surface at day-one depth. Its deeper field-first operating depth is deferred (see Repo-Truth Reconciliation Note 3 and §22).

**Warranty** has been elevated to a first-class Phase 3 operating surface. P3-E14 (Project Warranty Module Field Specification, T01–T10) governs the full Layer 1 scope: Coverage Registry, Warranty Case lifecycle (16 states), SLA escalation, Subcontractor Coordination, Owner Intake Log, spine publication, and canvas tile. Layer 2 (owner portal, direct subcontractor access, external collaborative workspace) and deeper field-first execution depth beyond the Layer 1 control surface remain explicitly deferred (see §22 and P3-E14 T08).

### 11.3 Financial domain structure

Buyout is not treated as a separate top-level baseline module in this refined plan.

- **Buyout is baseline as part of the Financial module/domain.**
- Financial owns the budget import dependency and working model that Buyout depends on.

### 11.4 Phase 3 depth classification

#### First-class working surfaces in the PWA

- Financial
- Schedule
- Constraints
- Work Queue
- Permits
- Safety
- Project Startup

#### Governed report workspace

- Reports
  - PX Review
  - Owner Report

#### Lifecycle-visible modules with later deeper field-first definition

- Quality Control

#### First-class lifecycle modules with governed Layer 1 scope and deferred external workspace

- Warranty (P3-E14 — coverage registry, case lifecycle, SLA, subcontractor coordination; Layer 2 external workspace deferred)

---

## 12. PH7-backed Module Boundary Rules

PH7 feature plans are canonically locked (ADR-0091) but classified as **Deferred Scope** pending Phase 3 formal kickoff. Where PH7 plans define detailed module behavior, they are implementation-shaping inputs to this master plan. The refined Phase 3 deliverables must reconcile, not ignore, those PH7 definitions.

**Reference examples:** during implementation and reconciliation, `docs/reference/example/` must be used for baseline examples and replacement alignment. This includes financial spreadsheet sets, constraints worksheets, safety checklists/safety-plan examples, and other artifacts referenced by PH7-planned replacement workflows.

### 12.1 Financial (including Buyout)

Phase 3 uses a **hybrid financial spine**:

- Upstream/source systems remain authoritative for certain baseline inputs.
- Project Hub owns the normalized operational forecasting ledger and working financial state.

Financial is an **operational financial surface** that replaces the current spreadsheet workflow for project-team use, while remaining distinct from ERP/accounting system-of-record behavior.

Phase 3 Financial must support:

- budget import
- editable Financial Summary working state
- editable GC/GR working model
- editable Cash Flow working model
- forecast checklist completion
- exposure tracking
- export
- baseline Buyout support within the Financial domain

**Implementation note:** the interim project-budget import path must support uploaded `budget_details (1).csv`, with future replacement by direct Procore API integration.

### 12.2 Schedule

Phase 3 uses a **hybrid schedule spine**:

- Upstream schedule systems remain authoritative for detailed baseline/update data and full CPM network logic.
- Project Hub owns normalized project schedule context for health, milestone visibility, constraint linkage, and cross-module schedule projections.

Schedule is an **operational schedule surface**, not full CPM authoring.

Phase 3 Schedule must support:

- schedule file ingestion
- milestone tracking
- manual milestone management
- governed forecast overrides
- upload history / restore
- schedule summary projections into home, health, financial, and reports

### 12.3 Constraints

Phase 3 uses a **hybrid constraints spine**:

- Project Hub owns the normalized operational ledger for:
  - Constraints
  - Change Tracking
  - Delay Log
- Supporting artifacts/documents may live in governed destinations with canonical references back to Project Hub.

Constraints is an **operational constraints surface** and is intended to replace and improve the current worksheet-based process.

Phase 3 Constraints must support:

- create / update / close constraints
- manage Change Tracking entries
- manage Delay Log entries
- manage due dates / BIC / responsibility / comments
- quantify delay impact
- export

### 12.4 Permits

Phase 3 uses a **hybrid permit spine**:

- Project Hub owns the normalized permit + inspection operational ledger.
- Jurisdictional artifacts/documents and governed storage locations may exist outside Project Hub with canonical references back to the permit ledger.

Permits is an **always-on first-class operational module**.

Phase 3 Permits must support:

- permit log management
- linked required inspections
- inspection results/status summaries
- expiration/status tracking
- comments/notes
- export

### 12.5 Safety

Phase 3 uses a **hybrid safety spine**:

- Project Hub owns normalized operational safety state.
- Governed safety artifacts/documents may live in destination libraries with canonical references back to Project Hub.

Safety is an **always-on baseline safety operating platform**.

Phase 3 Safety must support:

- structured project safety-plan state
- subcontractor acknowledgments
- subcontractor safety orientation records
- safety checklist / inspection aggregation
- JHA log records
- emergency-plan acknowledgment state
- incident-report working state and notification state
- linked safety follow-up actions

Safety is intended to replace the current **Site Specific Safety Plan** file-based workflow and to aggregate inspection/checklist points from the current weighted safety checklist baseline.

**Future-state note:** later development should support smart toolbox-talk topic generation linked to high-risk schedule activities surfaced about one week before the activity start.

### 12.5a Project Startup

Phase 3 uses a **governed startup readiness program** rather than a set of flat launch forms:

- Project Hub owns the readiness-program state machine, certification workflow, PE mobilization authorization, stabilization window, and immutable startup baseline continuity record.
- Adjacent modules remain authoritative for their live operational domains; Startup only cross-references them where the source-of-truth boundary explicitly allows it.

Project Startup is an **always-on first-class operational module** that begins at project creation, remains active through early execution stabilization, then persists as a read-only launch record after baseline lock.

Phase 3 Project Startup must support:

- six governed subordinate surfaces:
  - Startup Program Checklist
  - Startup Safety Readiness
  - Permit Posting Verification
  - Contract Obligations Register
  - Responsibility Routing Engine
  - Project Execution Baseline
- a four-tier record architecture:
  - Tier 1 program-core governance records
  - Tier 2 governed template/task-library records
  - Tier 3 project-scoped operational surface records
  - Tier 4 immutable continuity records
- split identity rules so org-governed `StartupTaskTemplate` remains outside project/baseline-lock scoping while operational records stay project-scoped and program-anchored
- a governed checklist-library model in which MOE maintains the `StartupTaskTemplate` catalog and each project receives 55 instantiated `StartupTaskInstance` records across Review Owner Contract, Job Start-Up, Order Services and Equipment, and Permit Posting
- per-task category, severity, gating impact, owner routing, due-trigger, dependency, and evidence metadata rather than a flat checklist form
- first-class `TaskBlocker` records for documented startup gaps, with task completion remaining distinct from PE readiness acceptance
- a 32-item, 2-section Startup Safety Readiness surface in which `Fail` creates a first-class `SafetyRemediationRecord` with remediation note, assignment, due-date, evidence, escalation thresholds, and optional `ProgramBlocker` elevation
- Safety Readiness certification rules that allow documented open remediations at submission when they are assigned and due-dated, while still blocking PX-escalated remediations or active blocker conditions unless formally waived
- Startup Safety remaining review-capable under the standard Startup annotation boundary even though the ongoing Safety module itself is excluded from executive-review annotations
- a Section 4 permit-posting verification model in which task-library-owned Section 4 `StartupTaskInstance` records gain one-to-one `PermitVerificationDetail` companion records for physical posting evidence, discrepancy reasons, and read-only cross-reference to Permit lifecycle context
- strict non-interference boundaries in which Startup Safety never writes Safety-module records and Permit Posting never writes Permits-module records
- a governed `ContractObligationsRegister` that remains project-scoped, captures extracted Owner contract obligations as monitored rows, and replaces the old one-time Owner Contract Review form
- obligation rows with canonical `OPEN` / `IN_PROGRESS` / `SATISFIED` / `WAIVED` / `NOT_APPLICABLE` lifecycle states, `flagForMonitoring`-driven monitoring priority, due-date and recurrence handling, and routed accountability by role/category
- Contract Obligations certification rules based on documented review, routing, and acknowledgment of monitored and near-due obligations rather than blanket obligation closure
- read-only advisory cross-reference to Financial and Schedule context, with `StartupBaseline` preserving contract-obligation counts for Closeout continuity
- a governed Responsibility Matrix overlay model in which immutable workbook-derived template rows are instantiated per project, with PM reminder-only rows preserved for display/reference but excluded from category-coverage and acknowledgment certification gates
- a workbook-grounded routing footprint of 7 PM assignment columns across 71 assignment-bearing rows plus 11 recurring reminder rows, and 5 Field assignment columns across 27 assignment-bearing rows
- category-level named-`Primary` assignment coverage plus critical-category `acknowledgedAt` completion as distinct Responsibility Matrix certification gates
- `responsibilityMatrixRef` read-through from PM Plan Section VII and `responsibilitySnapshotAtLock` continuity for Closeout staffing delta analysis
- a structured `ProjectExecutionBaseline` surface in which the PM Plan is captured as 11 typed sections rather than a narrative attachment, including explicit schedule, cost, safety, logistics, and attachment-state commitments
- categorized `ExecutionAssumption` records for launch assumptions and success criteria, with PM/PX signature plus PX approval gating before `EXECUTION_BASELINE` certification submission
- full `StartupBaseline.executionBaselineFieldsAtLock` continuity into Closeout so delta analysis reads the immutable snapshot rather than live PM Plan records
- shared-spine and canvas publication limited to Activity Spine events, Health Spine metrics, Work Queue items, Related Items registrations, and a project-canvas mobilization summary tile
- formal separation between non-blocking executive review annotations in `@hbc/field-annotations` and readiness certification, mobilization authorization, or baseline-lock gate actions
- no Reports publication role and no org-intelligence publication role for Startup in Phase 3; Startup publication stops at shared spines, canvas, and the read-only Closeout continuity API
- Closeout consumption limited to the immutable `StartupBaseline` snapshot via read-only API rather than live Startup operational records
- a T09-governed authority model in which PX exclusively accepts certifications, grants formal waivers, issues PE mobilization authorization, and locks the baseline while PM, Safety, QAQC, Field, Accounting, and read-only consumers operate within bounded edit/read scopes
- PWA-first lane ownership with broad SPFx direct-operational parity, but explicit Launch-to-PWA depth deferrals for state-history visualization, permit-posting photo upload, and advanced blocker-dependency visualization
- delivery through `@hbc/features-project-hub` as the canonical Project Startup feature owner, with no separate `@hbc/project-startup` package and no direct cross-feature imports
- shared-package reuse limited to the current repo-truth Startup integration set (`@hbc/field-annotations`, `@hbc/versioned-record`, `@hbc/project-canvas`, `@hbc/my-work-feed`, `@hbc/activity-timeline`, P3-D2 Health Spine publication contract, `@hbc/related-items`, `@hbc/notification-intelligence`, `@hbc/workflow-handoff`, `@hbc/session-state`, `@hbc/complexity`, and `@hbc/smart-empty-state`)
- explicit separation between sub-surface operational completeness and formal readiness certification
- six project-scoped `ReadinessCertification` records, each reviewable through PE `ReadinessGateRecord` / `ReadinessGateCriterion` evaluation
- `ExceptionWaiverRecord` and `ProgramBlocker` governance for unresolved readiness exceptions without collapsing them into task completion status
- project-scoped `PublicationState` governance on operational records only; certification and baseline lock do not apply to the org-level template family
- PE gate acceptance followed by separate PE mobilization authorization
- a configurable stabilization window before baseline lock
- immutable `StartupBaseline` continuity into Project Closeout / Autopsy for delta analysis
- full cross-lane canonical behavior, with lane differences limited to depth and host constraints rather than different startup semantics

### 12.6 Reports

Phase 3 Reports is a **governed report workspace**, not a simple launcher and not a full freeform authoring system.

Minimum governed report families for this phase are:

- PX Review
- Owner Report

Report-family behavior:

- auto-assembled from module snapshots
- PM narrative override
- governed draft refresh and staleness handling
- queued governed generation
- run-ledger tracking
- export and history
- release/distribution state tracking

### 12.7 Quality Control and Warranty

**Quality Control** remains a **baseline-visible lifecycle module** in Phase 3. Its deeper field-first tool definition is intentionally deferred (see Repo-Truth Reconciliation Note 3 and §22). QC retains lifecycle placement and architectural continuity but does not absorb full field-first depth in this phase.

**Warranty** has been elevated to a **first-class Phase 3 operating surface** by P3-E14 (Project Warranty Module Field Specification). Phase 3 delivers the full Layer 1 Warranty control surface:

- Coverage Registry: typed `WarrantyCoverageItem` records with three-layer taxonomy (Product / Labor / System), Closeout turnover linkage, Startup commissioning linkage, and daily expiration sweep
- Warranty Case Workspace: 16-state lifecycle, two-tier SLA model (Standard / Expedited), Next Move ownership, subcontractor acknowledgment and scope-dispute model, evidence chain, and immutable resolution records
- Owner Intake Log: PM-entered only in Phase 3; `sourceChannel` seam for Layer 2
- Subcontractor Coordination: PM-proxy model in Phase 3; `enteredBy` seam for direct sub access in Layer 2
- Spine publication: Activity (24 events), Health (leading / lagging / failure signals), Work Queue (20 rules), Related Items
- Canvas tile, saved views, and mold-breaking UX per P3-E14 T07

What remains deferred:
- **Layer 2** — owner-facing intake portal, direct subcontractor access, shared PM + owner + sub workspace; governed by P3-E14 T05 and T06 seam contracts
- **Deeper field-first execution** beyond the Layer 1 control surface model (see §22 and `07_Phase-6_Field-First-HB-Site-Control-Plan.md`)

Governing plan: P3-E14 T01–T10. Related contracts: P3-E1 §3.x, P3-E2 §17, P3-E4 (back-charge advisory), P3-E10 (Closeout seam), P3-E11 (Startup seam).

---

## 13. Review Mode Phase Assignment

Review Mode remains assigned to Phase 3, but this plan preserves the explicit governance note:

- Review Mode work is assigned to Phase 3 per decision direction.
- It is currently tracked as deferred scope and must be reclassified to Canonical Normative Plan at Phase 3 kickoff.
- The refined deliverables package must define its lane assignment, coexistence behavior, and Phase 3 sequencing clearly before kickoff.

---

## 14. Phase Workstreams

### Workstream A — Shared-canonical Project Hub contracts

**Goal:** establish the non-negotiable shared contracts that both lanes and all major modules consume.

**Activities**
- Lock the canonical project registry model
- Lock role/membership authority and reconciliation rules
- Lock project activation and handoff completion contract
- Define module publication expectations into activity, health, work, and related-items spines

**Deliverables**
- Project registry and activation contract
- Membership / role authority contract
- Shared spine publication contract set

### Workstream B — Project context continuity and switching

**Goal:** make project identity stable, portable, and predictable.

**Activities**
- Define URL-canonical project routing rules
- Define store/session enrichment rules
- Define project switching and per-project return-memory
- Define deep-link, refresh, reopen, and handoff launch behavior

**Deliverables**
- Project context model
- Project switching behavior note
- Context restoration and mismatch-reconciliation rules

### Workstream C — Canvas-first Project Home

**Goal:** deliver a governed canvas-first project home with mandatory operational core surfaces.

**Activities**
- Adopt project-canvas as required foundation
- Define mandatory locked tiles, role defaults, and optional tile catalog rules
- Define tile persistence rules and role/project scoping
- Define home-canvas behavior in both lanes

**Deliverables**
- Project canvas governance note
- Mandatory core tile family definition
- Lane-aware home/canvas capability matrix

### Workstream D — Shared project spines

**Goal:** make project rollups coherent across modules.

**Activities**
- Implement normalized activity spine
- Implement normalized health spine
- Implement normalized work queue / next-action spine
- Implement related-items registry and rendering rules

**Deliverables**
- Project activity contract
- Project Health contract
- Project work queue contract
- Related-items registry / presentation contract

### Workstream E — Always-on core module delivery and PH7 reconciliation

**Goal:** align the Phase 3 master plan with PH7-planned module behavior and hard module boundaries.

**Activities**
- Reconcile PH7 feature plans into the Phase 3 module structure
- Lock module source-of-truth and action boundaries
- Encode spreadsheet/document replacement notes and example-file references
- Define lane depth rules by module

**Deliverables**
- Phase 3 module classification matrix
- Module source-of-truth / action-boundary matrix
- Spreadsheet/document replacement reference note set

### Workstream F — Governed reporting system

**Goal:** deliver a real reporting system, not two one-off report pages.

**Activities**
- Define report-definition registry
- Define report draft/snapshot rules
- Define run-ledger and generation rules
- Define family-specific release/approval rules

**Deliverables**
- Report-definition registry contract
- Report draft/snapshot rules
- Report run-ledger contract
- Report publication/release rules

### Workstream G — Dual-lane capability and coexistence

**Goal:** ensure Project Hub works coherently across PWA and SPFx.

**Activities**
- Define lane-specific module depth and launch/escalation rules
- Define SPFx broad operational companion envelope
- Define PWA continuity / advanced-depth differentiation
- Define cross-lane navigation and context preservation rules

**Deliverables**
- PWA / SPFx capability matrix
- Cross-lane navigation and handoff map
- Lane-specific acceptance matrix

### Workstream H — Validation, staging, and acceptance

**Goal:** make the phase execution-ready and verifiable.

**Activities**
- Define acceptance gates per lane and per module group
- Define staging/test scenarios for activation, switching, stale drafts, and cross-lane continuity
- Define release-readiness criteria for the mandatory operational core

**Deliverables**
- Phase 3 acceptance checklist
- Staging and verification plan
- Release-readiness matrix

---

### Workstream J — Documents Enabling Seams

**Goal:** leave Phase 3 with the project-context seams, zone model, trust vocabulary, related-item contracts, preview/adaptive contract, and publish/handoff events that Phase 5 will need — without building the full Documents product.

**Activities**
- Define project-scoped document launch and route contracts
- Define project zone model and registry schema
- Design Project Hub contextual document entry surface
- Bind document references into the related-items model
- Establish source/authority/restriction state vocabulary
- Define publish/handoff intent event seams
- Define preview and adaptive tablet/field contract
- Execute readiness spikes and produce Phase 5 handoff package

**Deliverables**
- P3-J1: Documents Enabling Seams and Contracts (Specification)
- Route contract catalog and launch-state schema
- Project-zone registry schema
- Source/authority/restriction vocabulary and UI state matrix
- Related-document reference model
- Publish/handoff event contract catalog
- Preview shell contract and adaptive behavior matrix
- Contradiction register and Phase 5 handoff memo

**Non-scope boundary**
This workstream is enablement only. It does not build the full global Documents product, global navigation, smart views, or platform-wide search. Those remain Phase 5 scope per `06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md`.

---

## 15. Mandatory Deliverables

| Workstream | Deliverable |
|---|---|
| — | Refined Phase 3 master plan (this document) |
| A | Project registry and activation contract |
| A | Membership / role authority contract |
| A | Shared spine publication contract set |
| B | Project context continuity and switching contract |
| C | Lane capability matrix (PWA / SPFx) |
| C | Project canvas governance note |
| C | Mandatory home-canvas core specification |
| D | Activity spine contract |
| D | Project Health contract |
| D | Work queue / next-action contract |
| D | Related-items registry / presentation contract |
| E | Module classification and depth matrix |
| E | Module source-of-truth and action-boundary matrix |
| E | Spreadsheet/document replacement reference note set |
| F | Reports workspace / definition / run / release contract package |
| G | PWA / SPFx capability matrix |
| G | Cross-lane navigation and handoff map |
| G | Lane-specific acceptance matrix |
| H | Acceptance, staging, and release-readiness checklist |
| J | Documents enabling seams and contracts (P3-J1) |

---

## 16. Milestones

### M3.1 — Shared contracts locked

Project registry, activation, membership, context, and lane rules are decision-locked and documented.

### M3.2 — Project context continuity working

Route-canonical project identity, smart switching, per-project return-memory, and handoff landing behavior are working in both lanes.

### M3.3 — Canvas-first home live

Project home is live as a governed project-canvas surface with mandatory operational core tiles.

### M3.4 — Shared spines live

Health, activity, work queue, and related-items publication/consumption are operational.

### M3.5 — Always-on core module envelope live

Always-on core modules satisfy their locked source-of-truth and action-boundary rules.

### M3.6 — Governed reporting baseline live

PX Review and Owner Report run inside the governed reporting system with tracked drafts, exports, release state, and history.

### M3.7 — Acceptance and staging sign-off complete

Cross-lane acceptance gates and execution-readiness criteria are passed.

---

## 17. Dependencies

### 17.1 Incoming dependencies

- Phase 1 stable data backbone
- Phase 2 stable shell/auth/context behavior and locked lane-ownership doctrine (P2-B0)
- Working provisioning/handoff seams suitable for upgrade into Project Hub activation
- Shared package readiness for:
  - `@hbc/project-canvas` (mature)
  - `@hbc/features-project-hub` (active expansion — substantial Phase 3 module implementation already landed; Startup and later modules still require additional delivery)
  - `@hbc/related-items` (mature)
  - `@hbc/session-state` (mature)
  - `@hbc/my-work-feed` (mature)
  - `@hbc/workflow-handoff` (mature)
  - `@hbc/shell` (mature)
  - `@hbc/app-shell` (partial — zero consumers; see Repo-Truth Reconciliation Note 1)
  - `@hbc/auth` (mature)

### 17.2 Outgoing dependencies

Phase 3 enables:

- later field-first project execution depth (Phase 6)
- full unified Documents product and platform-wide document/search behavior (Phase 5) — Phase 3 Workstream J delivers the enabling seams; Phase 5 delivers the product
- cleaner cross-project continuity and operational rollups
- richer project-centered reporting, health, and escalation behavior

---

## 18. Acceptance Gates

Phase 3 is complete only when all of the following are true:

### 18.1 Cross-lane contract gates

- Both lanes consume the same canonical project identity, context, and membership rules.
- Smart project switching works consistently across both lanes.
- Cross-lane launches/handoffs do not lose project identity.

### 18.2 Project activation gates

- Setup/handoff acknowledgment performs a valid Project Hub activation transaction.
- Activated projects land with valid project record, site association, and routeable context.
- Partial activation is not accepted as steady state.

### 18.3 Home/canvas gates

- Project home is canvas-first.
- Mandatory operational core surfaces exist on every home canvas.
- Canvas governance supports locked, role-default, and optional tile classes.

### 18.4 Shared spine gates

- Health, activity, work queue, and related-items are fed by normalized project contracts.
- Home, module pages, and reports consume those shared spines coherently.

### 18.5 Core module gates

- Financial, Schedule, Constraints, Permits, Safety, Work Queue, and Reports meet their locked source-of-truth and action-boundary rules.
- Financial and Constraints include their spreadsheet-replacement notes.
- Safety includes its SSSP replacement, checklist/orientation aggregation, and future toolbox-talk note.

### 18.6 Reporting gates

- PX Review and Owner Report are live as governed report families.
- Draft refresh, staleness warning, queued generation, run tracking, and history work.
- PX Review explicit approval and Owner Report governed non-approval-gated release behavior are implemented correctly.

### 18.7 Validation gates

- Staging scenarios for activation, switching, stale drafts, cross-lane launches, and module publication all pass.
- The phase has a clear defer list and does not hide future-scope behavior inside Phase 3 acceptance.

---

## 19. Risks and Mitigations

### 19.1 Risks if under-executed

1. Project Hub collapses into a dashboard wrapper instead of an operating layer.
2. PWA and SPFx drift into separate products with inconsistent project semantics.
3. Project switching and deep-link behavior become unreliable.
4. Canvas flexibility fragments the home experience without governance.
5. Core modules behave as disconnected tools instead of project-published operating surfaces.
6. Reporting devolves into ad hoc export actions without draft/run/release governance.
7. Spreadsheet/document replacement intent remains implied instead of implementation-guiding.
8. Field-first future depth leaks into Phase 3 and blurs scope control.

### 19.2 Mitigations

- Lock cross-lane canonical contracts before module expansion.
- Treat route-carried project identity as non-negotiable.
- Use PH7 plans as concrete module boundary inputs instead of abstract module statements.
- Encode spreadsheet/document replacement notes directly in phase deliverables.
- Use explicit defer lists for future Procore API, deeper field-first QC/Warranty depth, future toolbox-talk intelligence, and full platform-scale workflow expansion.
- Require acceptance gates that test both lane behavior and shared publication behavior.

---

## 20. Execution Priorities

Recommended implementation-sequencing posture:

1. Lock shared-canonical contracts (registry, activation, membership, context, lane rules).
2. Lock canvas/home governance and mandatory operational core.
3. Stand up shared spines (health, activity, work, related items).
4. Reconcile and harden always-on core module boundaries.
5. Deliver governed reporting baseline.
6. Validate cross-lane continuity, activation, switching, and reporting release rules.
7. Reclassify Review Mode at kickoff only after lane/sequence/package alignment is complete.

### Recommended first actions

1. Convert this refined master plan into the locked Phase 3 deliverable package listed above.
2. Produce the lane capability matrix and module source-of-truth/action-boundary matrix before implementation begins.
3. Upgrade the current setup-to-project-hub handoff seam into the Project Hub activation transaction.
4. Formalize the project registry, membership authority, and route-canonical context contract early.
5. Treat spreadsheet/document replacement notes as implementation instructions, not commentary.
6. Keep QC/Warranty deeper field-first scope out of Phase 3 and point it explicitly to the appropriate later phase.

---

## 21. Team Ownership

### Primary owner

Project Hub / Project Operations platform owner

### Supporting owners

- Experience / Shell
- Shared platform contracts
- Business domain module owners
- Reporting / document workflow owner
- Architecture governance lead

### Required reviewers

- Architecture lead
- Product/design lead
- Project operations stakeholder
- Lane owners for PWA and SPFx

---

## 22. Carry-Forward and Deferred Items

The following are intentionally deferred or future-state items and must not be silently treated as committed Phase 3 implementation depth:

- Direct Procore API replacement of interim financial budget-file upload
- Smart toolbox-talk topic generation linked to high-risk schedule activities
- Full CPM authoring inside Project Hub
- Full ERP/accounting behavior inside Project Hub
- Full claims/legal/contract-admin behavior inside Constraints
- Full jurisdiction-facing permitting package/submission management
- Full deeper field-first execution depth for QC (see Repo-Truth Reconciliation Note 3)
- Warranty Layer 2: owner-facing intake portal, direct subcontractor access, shared PM + owner + sub collaborative workspace (governed by P3-E14 T05/T06 seam contracts; Layer 1 operating surface is Phase 3 scope)
- Any field-first expansion that exceeds the governed Phase 3 scope for QC (baseline-visible) or Warranty Layer 1 control surface (P3-E14)
- Full unified Documents product: global shell, My Files / Departments / Company roots, global smart views, platform-wide search, cross-workspace document unification, desktop-sync orchestration — Phase 5 scope; Phase 3 Workstream J delivers the enabling seams only (route contracts, zone schema, source/authority vocabulary, related-item document references, preview/adaptive contract, publish/handoff seams, and the Phase 5 handoff package)

These should be captured as controlled follow-on artifacts or implementation subtasks, not kept as hidden blockers inside the plan.

---

## 23. Repo-Truth Reconciliation Notes

The following reconciliations are locked for Phase 3 and MUST be honored in downstream design and implementation reviews:

1. **`@hbc/app-shell` posture reconciliation**
   `@hbc/app-shell` currently has **zero consumers** anywhere in the workspace — no app or package imports from it. The live SPFx extension imports `HbcAppShell` directly from `'@hbc/ui-kit/app-shell'`, not from `@hbc/app-shell`. The package's self-description is internally inconsistent: `src/index.ts` calls it a "PWA facade" while the README warns against PWA use. This plan lists `@hbc/app-shell` as an incoming dependency for potential SPFx / Project Hub convenience use, but current repo truth is that neither lane has adopted it. `@hbc/shell` remains canonical. The package's self-description should be aligned with intent before consumers are added.

2. **`@hbc/features-project-hub` maturity reconciliation**
   The plan envisions a robust module structure within Project Hub. Current repo truth: `@hbc/features-project-hub` (v0.1.82) already contains SF21 health-pulse plus contract-level implementations for Financial, Schedule, Constraints, Permits, Safety, Project Closeout, Project Startup (complete, 630 tests), and Subcontract Execution Readiness (complete, 410 tests, 16/16 acceptance criteria verified). Project Warranty T10 Stage 1 foundation implemented. This is still classified as **controlled evolution** — the plan remains slightly ahead of final module completion, but no longer assumes a health-pulse-only scaffold.

3. **QC/Warranty deferral target reconciliation**
   **Warranty Layer 1** (coverage registry, case lifecycle, SLA, subcontractor coordination, owner intake log, spine publication) is now Phase 3 scope, governed by P3-E14 T01–T10. This reconciliation note now applies specifically to: (a) QC deeper field-first depth, and (b) Warranty Layer 2 (owner portal, direct subcontractor access, external collaborative workspace) and Warranty's deeper field-first execution beyond the Layer 1 control surface. Those remain deferred to `07_Phase-6_Field-First-HB-Site-Control-Plan.md`. However, the Phase 6 plan is currently a draft that covers generic field-first UX, workflow selection, and offline sync — it does **not** explicitly accept QC or Warranty Layer 2/deeper depth in its current scope. This deferral target is **directional**: Phase 6 will need to be refined to absorb this scope when it is formally activated.

4. **PH7 deferred-scope reconciliation**
   PH7 feature plans (61 files, 4 task directories) are canonically locked (ADR-0091 satisfied 2026-03-09) and contain detailed module behavior definitions. Per current-state-map, PH7 plans are classified as **Deferred Scope** pending Phase 3 formal kickoff. At kickoff, PH7 plans must be formally reconciled into the Phase 3 deliverable package — they are implementation-shaping inputs, not background reference.

5. **Current ProjectHubPage is MVP scaffold — controlled evolution**
   The `ProjectHubPage` in `apps/pwa` is currently a portfolio-level dashboard with summary cards and a data table. The robust dual-lane project operating layer described in this plan is Phase 3 target-state work not yet built. Classified as **controlled evolution**.

6. **Current-state-map reconciliation requirement**
   Any implementation or design artifact claiming Phase 3 compliance MUST explicitly annotate where current implementation is:
   - compliant,
   - controlled evolution,
   - known constrained current state,
   - or superseded.

---

## 24. How to Use This Plan Now

| Goal | Start here |
|---|---|
| Understand the purpose and strategic target of Phase 3 | Sections 1–3 |
| See what exists in the repo today | Section 2 |
| See what is in and out of scope | Section 6 |
| Understand the dual-lane operating model | Sections 4, 10 |
| Understand project context and switching rules | Sections 4.2–4.4 |
| Understand the canvas-first project home | Section 9 |
| Understand core architecture decisions and spine models | Section 8 |
| Review module structure and PH7-backed boundary rules | Sections 11–12 |
| Review required workstreams and deliverables | Sections 14–15 |
| Review dependency posture and acceptance gates | Sections 17–18 |
| See deferred items and reconciliation notes | Sections 22–23 |
| Plan implementation sequencing | Section 20 |

---

## 25. Completion Standard

Phase 3 is successful only if Project Hub becomes a genuine project-centered operating layer with shared-canonical lane behavior, governed canvas-first home composition, durable project context continuity, clear module boundaries, and a credible governed reporting system — not merely a collection of project-themed screens.

---

## 26. Related Documents

- `00_HB-Intel_Master-Development-Summary-Plan.md`
- `01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`
- `02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md`
- `05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `06_Phase-5_Search-Connected-Records-and-Document-Access-Plan.md` *(deferred target for full Documents implementation)*
- `07_Phase-6_Field-First-HB-Site-Control-Plan.md`
- `phase-3-deliverables/04_Phase-3_Unified-Documents-Enabling-Plan.md` *(governing background plan for Workstream J)*
- `phase-3-deliverables/P3-J1-Documents-Enabling-Seams-and-Contracts.md` *(Workstream J deliverable)*
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`
- `docs/reference/example/` (baseline reference artifacts for spreadsheet/document replacement)
- `phase-2-deliverables/P2-B0-Lane-Ownership-and-Coexistence-Rules.md`
- `@hbc/project-canvas` package documentation
- `@hbc/features-project-hub` package documentation
- `@hbc/related-items` package documentation
- `@hbc/workflow-handoff` package documentation

---

**Last Updated:** 2026-03-24
**Governing Authority:** [Master Development Summary Plan](00_HB-Intel_Master-Development-Summary-Plan.md)
