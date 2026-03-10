# PH7 Shared Features Evaluation
## Mold Breaker UX Innovation — Reusable Packages & Module-Specific Features

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-08
**Derived from:** Structured product-owner interview (2026-03-08); all decisions locked.
**Source documents:**
- `docs/explanation/design-decisions/con-tech-ux-study.md`
- `docs/explanation/design-decisions/procore-ux-study.md`
- `docs/explanation/design-decisions/ux-mold-breaker.md`
- `docs/architecture/plans/PH9b-UX-Enhancement-Plan.md`
- All `docs/architecture/plans/PH7-*.md` development plan files

---

## Executive Summary

This document is the master evaluation record for all Mold Breaker UX features identified, validated, and prioritized through a structured 26-question product-owner interview conducted March 8, 2026. It establishes the complete set of shared infrastructure packages and module-specific innovations to be built alongside the Phase 7 domain modules.

### Approach

The Mold Breaker methodology derives from a rigorous competitive analysis of seven leading construction technology platforms (Procore, Autodesk Construction Cloud, Trimble Viewpoint, CMiC, InEight, Oracle Primavera Cloud, Bluebeam Studio) documented in the attached UX study files. The analysis produced one governing strategic thesis:

> **Build the first construction platform that treats work, accountability, and context as first-class objects — then adapts complexity, UI, and system behavior to the user's role, device, and connectivity state.**

Every feature in this document traces directly to one of 16 Signature Solutions defined in `ux-mold-breaker.md`, to a specific enhancement recommendation in `PH9b-UX-Enhancement-Plan.md`, or to a pattern identified in the `con-tech-ux-study.md` / `procore-ux-study.md` competitive analysis.

### The Review Mode Model

The architectural pattern governing every shared package in this document is the `@hbc/review-mode` model already established in `docs/architecture/plans/PH7-RM-*.md`:

1. A package is scaffolded under `packages/` with its own `package.json` and TypeScript type contracts.
2. A generic configuration interface (e.g., `IReviewConfig<T>`) defines the contract consuming modules implement.
3. The package provides shared UI components, state management, and behavior.
4. Each consuming module opts in with a configuration object — zero duplicated infrastructure.
5. The package has zero domain module dependencies; it depends only on `@hbc/ui-kit`, `@hbc/auth`, `@hbc/models`, and `@hbc/data-access`.

All 16 new shared packages confirmed in this interview follow this exact model.

### Key Commonalities Discovered

Across the Estimating, Project Hub, Business Development, and Admin modules, five structural patterns repeat with sufficient consistency to warrant shared infrastructure:

| Pattern | Appears In | Package |
|---|---|---|
| Multi-party sign-off before workflow advances | PMP, SSSP, Turnover Meeting, BD dept sections | `@hbc/acknowledgment` |
| Multi-step guided form with validation gating | BD 5-step scorecard, PMP, SSSP, Kickoff | `@hbc/step-wizard` |
| Immutable versioning with change comments | BD scorecard, PMP, SSSP | `@hbc/versioned-record` |
| Field-level annotation by a reviewer | BD Director review, PMP review, QC | `@hbc/field-annotations` |
| Cross-module structured handoff on terminal state | BD→Estimating, Estimating→Project Hub | `@hbc/workflow-handoff` |
| Document storage before project provisioning | BD leads, Estimating pursuits | `@hbc/sharepoint-docs` |
| File upload → column map → preview → import | Financial Forecast, Buyout Log, Schedule | `@hbc/data-seeding` |
| "Who owns the next move?" on every item | All modules, all workflows | `@hbc/bic-next-move` |
| Interface complexity adaptive to user level | All modules, all roles | `@hbc/complexity` |

---

## Already-Planned Foundations (Not Re-Specified Here)

The following packages and features are fully specified in existing plan files. This document treats them as confirmed dependencies.

| Package / Feature | Source Plan | Role in This Document |
|---|---|---|
| `@hbc/review-mode` | `PH7-RM-*.md` | Template architectural model; already consuming in Estimating and BD |
| My Work Feed (`useMyWork`, `HbcMyWorkFeed`) | `PH9b-UX-Enhancement-Plan.md §A` | Cross-module action aggregation; consumes `@hbc/bic-next-move` feed |
| Progressive Coaching (`useCoaching`, `HbcCoachCard`) | `PH9b-UX-Enhancement-Plan.md §B` | Complements `@hbc/smart-empty-state`; role-aware guidance cards |
| Auto-Save Draft (`useFormDraft`, `HbcDraftRecoveryBanner`) | `PH9b-UX-Enhancement-Plan.md §C` | Foundation for `@hbc/session-state`; draft persistence layer |
| UX Instrumentation (`useUXInstrumentation`, `HbcCESPrompt`) | `PH9b-UX-Enhancement-Plan.md §D` | Telemetry consumed by Implementation Truth Layer (SF-17) |

---

## Shared Package Index — Implementation Priority Order

Priority is determined by dependency chain: packages that other packages depend on are built first. Packages within the same tier can be built in parallel.

### Tier 1 — Foundation (Build Before Any Domain Module)

These packages must exist before any Phase 7 domain module begins implementation. All domain modules depend on at least one of these.

| # | Package | Individual Spec | Mold Breaker Source |
|---|---|---|---|
| SF-01 | `@hbc/sharepoint-docs` | [PH7-SF-01](./PH7-SF-01-Shared-Feature-SharePoint-Docs.md) | UX-MB §5 (Offline-Safe); con-tech §10.4 (Form State Preservation) |
| SF-02 | `@hbc/bic-next-move` | [PH7-SF-02](./PH7-SF-02-Shared-Feature-BIC-Next-Move.md) | UX-MB §4 (Universal Next Move); con-tech §8.2 (Ball In Court) |
| SF-03 | `@hbc/complexity` | [PH7-SF-03](./PH7-SF-03-Shared-Feature-Complexity-Dial.md) | UX-MB §2 (Complexity Dial); con-tech §11 (Learnability) |
| SF-04 | `@hbc/acknowledgment` | [PH7-SF-04](./PH7-SF-04-Shared-Feature-Acknowledgment.md) | UX-MB §4 (Responsibility Attribution); con-tech §8 (Accountability) |
| SF-05 | `@hbc/step-wizard` | [PH7-SF-05](./PH7-SF-05-Shared-Feature-Step-Wizard.md) | UX-MB §10 (Workflow Composer); con-tech §5 (Progressive Disclosure) |
| SF-06 | `@hbc/versioned-record` | [PH7-SF-06](./PH7-SF-06-Shared-Feature-Versioned-Record.md) | UX-MB §3 (Work Graph); con-tech §9 (Asynchronous Collaboration) |
| SF-07 | `@hbc/field-annotations` | [PH7-SF-07](./PH7-SF-07-Shared-Feature-Field-Annotations.md) | UX-MB §3 (Unified Work Graph); procore §6.1 (Related Items) |
| SF-08 | `@hbc/workflow-handoff` | [PH7-SF-08](./PH7-SF-08-Shared-Feature-Workflow-Handoff.md) | UX-MB §4 (Next Move); con-tech §8 (Responsibility Attribution) |

### Tier 2 — Application Layer (Build Alongside Domain Modules)

These packages enhance the domain module experience and can be built concurrently with domain module development.

| # | Package | Individual Spec | Mold Breaker Source |
|---|---|---|---|
| SF-09 | `@hbc/data-seeding` | [PH7-SF-09](./PH7-SF-09-Shared-Feature-Data-Seeding.md) | UX-MB §5 (Offline-Safe); con-tech §10.4 (Form State Preservation) |
| SF-10 | `@hbc/notification-intelligence` | [PH7-SF-10](./PH7-SF-10-Shared-Feature-Notification-Intelligence.md) | UX-MB §9 (Notification Intelligence); con-tech §13 (Attention Management) |
| SF-11 | `@hbc/smart-empty-state` | [PH7-SF-11](./PH7-SF-11-Shared-Feature-Smart-Empty-State.md) | UX-MB §14 (Smart Empty States); con-tech §11 (Learnability) |
| SF-12 | `@hbc/session-state` | [PH7-SF-12](./PH7-SF-12-Shared-Feature-Session-State.md) | UX-MB §13 (Session Continuity); con-tech §11 (Onboarding) |
| SF-13 | `@hbc/project-canvas` | [PH7-SF-13](./PH7-SF-13-Shared-Feature-Project-Canvas.md) | UX-MB §1 (Role-Based Project Canvas); con-tech §3 (Cross-Project Awareness) |
| SF-14 | `@hbc/related-items` | [PH7-SF-14](./PH7-SF-14-Shared-Feature-Related-Items.md) | UX-MB §3 (Unified Work Graph); con-tech §6 (Cross-Module Linking) |

### Tier 3 — Intelligence Layer (Build After Core Modules Are Stable)

These packages require data from live domain modules to deliver their full value.

| # | Package | Individual Spec | Mold Breaker Source |
|---|---|---|---|
| SF-15 | `@hbc/ai-assist` | [PH7-SF-15](./PH7-SF-15-Shared-Feature-AI-Assist.md) | UX-MB §12 (AI Action Layer); con-tech §14 (AI-Augmented Decision Support) |
| SF-16 | `@hbc/search` | [PH7-SF-16](./PH7-SF-16-Shared-Feature-Search.md) | UX-MB §15 (Operations-Grade Search); con-tech §12 (Workflow Configurability) |

---

## Module-Specific Mold Breaker Index

These innovations are specific to one module's workflow. They do not generalize into shared packages but apply the Mold Breaker philosophy within a bounded domain.

| # | Feature | Module | Individual Spec | Mold Breaker Source |
|---|---|---|---|---|
| SF-17 | Admin Intelligence Layer | Admin | [PH7-SF-17](./PH7-SF-17-Module-Feature-Admin-Intelligence.md) | UX-MB §7 (Transparent); §11 (Implementation Truth) |
| SF-18 | Bid Readiness Signal | Estimating | [PH7-SF-18](./PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md) | UX-MB §4 (Next Move); con-tech §13 (Attention Management) |
| SF-19 | Score Benchmark Ghost Overlay | Business Development | [PH7-SF-19](./PH7-SF-19-Module-Feature-BD-Score-Benchmark.md) | UX-MB §12 (AI Action Layer); con-tech §14 (AI Decision Support) |
| SF-20 | BD Heritage Panel + Living Strategic Intelligence | Business Development | [PH7-SF-20](./PH7-SF-20-Module-Feature-BD-Heritage-Panel.md) | UX-MB §3 (Work Graph); §12 (AI Action Layer) |
| SF-21 | Project Health Pulse | Project Hub | [PH7-SF-21](./PH7-SF-21-Module-Feature-Project-Health-Pulse.md) | UX-MB §1 (Role-Based Canvas); §4 (Next Move) |
| SF-22 | Post-Bid Learning Loop | Estimating + BD | [PH7-SF-22](./PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md) | UX-MB §16 (UX Telemetry); con-tech §14 (AI Decision Support) |

---

## Deferred to Phase 2+

The following Signature Solutions from `ux-mold-breaker.md` are acknowledged as future roadmap items. They are not scoped for Phase 7 due to dependencies on modules not yet built (drawing viewer, full field execution module) or implementation complexity requiring Phase 7 stability first.

| Signature Solution | Reason for Deferral | Phase 2 Entry Point |
|---|---|---|
| §6 Tablet-Native Field UX | Design mandate for `@hbc/ui-kit`; requires field execution module not in Phase 7 scope | Phase 8 — Field Execution Module |
| §7 Drawing-Centric Command Layer | Requires native drawing viewer; not in Phase 7 scope | Phase 8 — Drawing Viewer Module |
| §10 Workflow Composer | High complexity; requires Phase 7 workflow patterns to be proven first | Phase 9 — Platform Configuration Layer |
| Full Unified Work Graph | Phase 7 version delivered via `@hbc/related-items` (SF-14); full graph requires all modules | Phase 9 — Cross-Module Graph Service |

---

## Package Dependency Graph

```
@hbc/ui-kit ──────────────────────────────────────────────────┐
@hbc/auth ─────────────────────────────────────────────────┐  │
@hbc/models ───────────────────────────────────────────┐   │  │
@hbc/data-access ──────────────────────────────────┐   │   │  │
                                                    ▼   ▼   ▼  ▼
SF-01  @hbc/sharepoint-docs ◄──────────────────────────────────┤
SF-02  @hbc/bic-next-move ◄─────────────────────────────────── ┤
SF-03  @hbc/complexity ◄────────────────────────────────────── ┤
SF-04  @hbc/acknowledgment ◄── SF-02 ──────────────────────── ┤
SF-05  @hbc/step-wizard ◄────── PH9b/useFormDraft ──────────── ┤
SF-06  @hbc/versioned-record ◄──────────────────────────────── ┤
SF-07  @hbc/field-annotations ◄─────────────────────────────── ┤
SF-08  @hbc/workflow-handoff ◄── SF-04 · SF-01 ──────────────── ┤
SF-09  @hbc/data-seeding ◄───── SF-01 ──────────────────────── ┤
SF-10  @hbc/notification-intelligence ◄── SF-02 · SF-08 ──────── ┤
SF-11  @hbc/smart-empty-state ◄── SF-03 ──────────────────────── ┤
SF-12  @hbc/session-state ◄──── PH9b/useFormDraft · SF-03 ───── ┤
SF-13  @hbc/project-canvas ◄─── SF-02 · SF-10 · SF-11 · SF-03 ─ ┤
SF-14  @hbc/related-items ◄──── SF-08 · SF-02 ─────────────────── ┤
SF-15  @hbc/ai-assist ◄──────── SF-06 · SF-02 · SF-07 ──────────── ┤
SF-16  @hbc/search ◄───────────── SF-15 (optional) ─────────────── ┘
```

---

## Prioritization & Roadmap Integration

### Recommended Build Sequence

**Phase 7A — Foundation Packages (before any domain module)**
Build SF-01 through SF-08 in parallel where dependency allows. These must be available before domain module implementation begins.

Parallel track 1: SF-01 (sharepoint-docs) → SF-09 (data-seeding)
Parallel track 2: SF-02 (bic-next-move) → SF-04 (acknowledgment) → SF-08 (workflow-handoff) → SF-10 (notification-intelligence)
Parallel track 3: SF-03 (complexity) → SF-11 (smart-empty-state) → SF-13 (project-canvas)
Parallel track 4: SF-05 (step-wizard) — depends on PH9b §C only
Parallel track 5: SF-06 (versioned-record) → SF-07 (field-annotations) → SF-14 (related-items)
Parallel track 6: SF-12 (session-state) — depends on PH9b §C only

**Phase 7B — Domain Modules (consume foundation packages)**
Build domain modules per `PH7-BD-*.md`, `PH7-Estimating-*.md`, `PH7-ProjectHub-*.md` in MVP order: BD → Estimating → Project Hub. Each module opts into the relevant shared packages via configuration.

**Phase 7B (concurrent) — Module-Specific Mold Breakers**
Build SF-17 through SF-22 concurrent with their respective domain modules. Each is a bounded enhancement to a specific module, not a cross-module dependency.

**Phase 7C — Intelligence Layer (after core modules stable)**
SF-15 (ai-assist) and SF-16 (search) require live data from domain modules. Build after at least one domain module is in QA.

### How These Features Accelerate the PH* Roadmap

Each shared package reduces per-module development time for every subsequent module. The return compounds:

- Building `@hbc/step-wizard` once saves approximately 3–4 sprint-weeks across BD, Project Hub (PMP), Project Hub (SSSP), and Estimating (Kickoff).
- Building `@hbc/acknowledgment` once saves approximately 4–5 sprint-weeks across Turnover Meeting, PMP, SSSP, Emergency Plans, and BD departmental sections.
- Building `@hbc/sharepoint-docs` once prevents a critical architectural gap (pre-provisioning document storage) from becoming a per-module workaround.
- Building `@hbc/bic-next-move` as a platform primitive means the My Work Feed, Project Canvas, and notification system all have a shared accountability data model from day one.

### Competitive Positioning Summary

| Competitor Weakness | HB Intel Response | Package(s) |
|---|---|---|
| 3–6 month learning curve | Complexity Dial + Smart Empty States + Progressive Coaching | SF-03, SF-11, PH9b §B |
| No field-level annotation | `@hbc/field-annotations` | SF-07 |
| BIC inconsistency across tools | Universal `@hbc/bic-next-move` on every item | SF-02 |
| Notification overload | Tiered notification intelligence | SF-10 |
| Lost work on connectivity failure | Session state + Auto-Save + Offline-safe | SF-12, PH9b §C |
| Opaque permissions | Admin governance layer + Permission fence (Admin) | SF-17 |
| Module-hunting cognitive load | Role-Based Project Canvas | SF-13 |
| No pre-bid strategic context | BD Heritage Panel | SF-20 |
| No post-bid intelligence loop | Post-Bid Learning Loop | SF-22 |
| AI as novelty interface | Embedded `@hbc/ai-assist` at friction points | SF-15 |
| Cross-module relationship opacity | `@hbc/related-items` work graph panel | SF-14 |

---
---

## Addendum A — Recommended Additional Shared Packages

**Addendum version:** 1.1  
**Date:** 2026-03-10  
**Status:** Recommended for formal evaluation and future PH7/PH8 planning; not yet locked in the March 8, 2026 interview record.

This addendum captures six additional shared packages identified during follow-on architecture review against the current `hb-intel` monorepo structure and the governing shared-package standard already established in this document. These recommendations follow the same core rule used throughout Phase 7:

> **A capability should become a shared package only when it is configuration-driven, reused by multiple domain modules, free of domain-specific dependencies, and materially reduces duplicate implementation effort.**

The following candidates satisfy that standard. They are appended here as recommended platform primitives to be converted into individual plan files if approved.

### Why These Six Were Elevated

Across the current and planned domain modules, six additional structural patterns repeat with sufficient consistency to justify shared infrastructure beyond SF-01 through SF-16:

| Pattern | Appears In | Recommended Package |
|---|---|---|
| Structured record creation with shared draft/save/submit lifecycle | BD forms, Estimating intake, Project Hub creation flows, Admin records | `@hbc/record-form` |
| Consistent export rendering of tables, reports, and branded outputs | Financial reports, scorecards, logs, schedules, executive reporting | `@hbc/export-runtime` |
| Governed publication/distribution of finalized outputs | SharePoint publication, PDF issue, downstream distribution, approvals | `@hbc/publish-workflow` |
| User-saved filters, layouts, and reusable data views | All data-heavy modules and tables | `@hbc/saved-views` |
| Multi-select actions against work queues and tabular data | Notifications, records, imports, logs, approvals | `@hbc/bulk-actions` |
| Cross-module record history, audit trail, and activity feed | All modules, all workflows | `@hbc/activity-timeline` |

### Important Boundary Decision — Not a Shared Package

The previously considered “full-screen-view” capability is **not** recommended as a standalone shared package. It is better implemented as a standardized shell / UI Kit surface (`HbcFullscreenSurface`, `HbcDataGridWorkspace`, `useFullscreenSurface`) because full-screen behavior is a presentation concern, not an independent business capability with its own cross-module contract.

---

## Recommended Shared Package Index — Candidate Extensions

If approved, these should be appended to the Shared Package Index as future shared-feature plan files.

### Tier 2A — Shared Record Lifecycle & Output Infrastructure

These packages sit above the existing Foundation tier and should be built once SF-01 through SF-08 are stable, but before large-scale implementation duplication begins inside domain modules.

| # | Package | Recommended Individual Spec | Strategic Source |
|---|---|---|---|
| SF-23 | `@hbc/record-form` | `PH7-SF-23-Shared-Feature-Record-Form.md` | UX-MB §10 (Workflow Composer); con-tech §5 (Progressive Disclosure) |
| SF-24 | `@hbc/export-runtime` | `PH7-SF-24-Shared-Feature-Export-Runtime.md` | UX-MB §3 (Work Graph); UX-MB §11 (Implementation Truth) |
| SF-25 | `@hbc/publish-workflow` | `PH7-SF-25-Shared-Feature-Publish-Workflow.md` | UX-MB §4 (Responsibility Attribution); con-tech §8 (Accountability) |

### Tier 2B — Shared Data Workspace Utilities

These packages should be implemented alongside modules with high table density and operational queue management.

| # | Package | Recommended Individual Spec | Strategic Source |
|---|---|---|---|
| SF-26 | `@hbc/saved-views` | `PH7-SF-26-Shared-Feature-Saved-Views.md` | UX-MB §1 (Role-Based Project Canvas); con-tech §12 (Workflow Configurability) |
| SF-27 | `@hbc/bulk-actions` | `PH7-SF-27-Shared-Feature-Bulk-Actions.md` | UX-MB §4 (Universal Next Move); con-tech §13 (Attention Management) |
| SF-28 | `@hbc/activity-timeline` | `PH7-SF-28-Shared-Feature-Activity-Timeline.md` | UX-MB §3 (Unified Work Graph); UX-MB §11 (Transparent Systems) |

---

## SF-23 — `@hbc/record-form`

### Recommendation

Build `@hbc/record-form` as a shared package.

### Why It Qualifies as Shared Infrastructure

The application will create new records across multiple domain modules. Although each module defines different fields and business rules, the structural workflow is consistent:

1. Render a configured form or multi-step creation flow.
2. Inject defaults and contextual metadata.
3. Validate required fields and business gates.
4. Persist draft state.
5. Submit to the module's backing store (SharePoint list in MVP; Azure data layer in future phases).
6. Return a normalized success / error / acknowledgment state.

This repeated lifecycle is too substantial to duplicate per module, but too generic to embed into a single domain module. It therefore fits the established shared package standard.

### Architectural Model

`@hbc/record-form` should follow the same Review Mode pattern used throughout this document:

1. Package scaffold under `packages/record-form/`
2. Generic configuration contract, e.g. `IRecordFormConfig<TRecord, TContext>`
3. Shared rendering, lifecycle state, validation orchestration, and submission adapter hooks
4. Per-module opt-in via configuration objects and module-owned schemas
5. Zero domain dependencies; depends only on `@hbc/ui-kit`, `@hbc/models`, `@hbc/data-access`, `@hbc/auth`, and existing shared packages where required

### Intended Scope

**Included**
- Schema-driven field rendering
- Step orchestration when paired with `@hbc/step-wizard`
- Draft persistence handoff to `@hbc/session-state`
- Shared validation lifecycle
- Standard submit / save-as-draft / cancel behaviors
- Metadata injection (project, user, role, timestamps, routing context)
- Adapter boundary for SharePoint today and Azure tomorrow

**Excluded**
- Module-specific field definitions
- Module-specific business rules beyond configurable hooks
- Custom calculations unique to one module
- Domain-specific post-submit automations

### Expected Consumers

- Business Development lead and pursuit forms
- Estimating intake / kickoff / bid-adjacent record creation
- Project Hub record creation flows (plans, logs, meeting records, safety forms)
- Admin-managed configuration records
- Future field execution and operations modules

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | `@hbc/ui-kit`, `@hbc/models`, `@hbc/data-access` |
| Strong integrations | SF-05 `@hbc/step-wizard`, SF-12 `@hbc/session-state`, SF-06 `@hbc/versioned-record` |
| Optional integrations | SF-04 `@hbc/acknowledgment`, SF-08 `@hbc/workflow-handoff`, SF-10 `@hbc/notification-intelligence` |

### Implementation Priority

**Recommended priority:** Early Tier 2A  
Build after SF-05 and SF-12 are stable, before multiple modules independently implement complex creation forms.

### Strategic Value

Building `@hbc/record-form` once prevents repeated creation-form drift, standardizes the SharePoint-to-Azure migration boundary, and ensures every record-creation workflow inherits the same draft, validation, and submission discipline.

---

## SF-24 — `@hbc/export-runtime`

### Recommendation

Build `@hbc/export-runtime` as a shared package.

### Why It Qualifies as Shared Infrastructure

Multiple feature packages will need to export data in a polished, branded, and structurally consistent manner. The rendering problem is shared even when the data source is not:

- Tables need CSV / XLSX export.
- Branded summaries need print / PDF export.
- Logs, scorecards, and reports need stable output formatting.
- Future intelligence modules will need shareable executive-ready output without re-authoring presentation logic each time.

Because export is an output-runtime concern rather than a module-specific workflow, it belongs in shared infrastructure.

### Architectural Model

`@hbc/export-runtime` should provide configuration-driven output adapters with reusable renderers and export contracts:

- `ITableExportConfig`
- `IReportExportConfig`
- `IExportAdapter`
- `IExportResult`

Each module provides data mapping and export intent; the package provides formatting, output generation, file naming standards, and delivery hooks.

### Intended Scope

**Included**
- CSV, XLSX, print, and PDF export orchestration
- Shared file naming conventions
- Branded page header / footer / watermark support
- Table-to-export mapping helpers
- Report composition primitives for polished output
- Export status and error handling model

**Excluded**
- Distribution approval workflows
- SharePoint publishing governance
- Module-specific report narratives unique to one feature package

### Expected Consumers

- Financial reporting and forecast modules
- Business Development scorecards and pursuit summaries
- Project Hub meeting records, logs, and status reports
- Scheduler, analytics, and executive dashboard outputs
- Future audit and compliance reporting tools

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | `@hbc/ui-kit`, `@hbc/models` |
| Strong integrations | SF-06 `@hbc/versioned-record` |
| Optional integrations | SF-25 `@hbc/publish-workflow`, SF-28 `@hbc/activity-timeline` |

### Implementation Priority

**Recommended priority:** Mid Tier 2A  
Build once there are at least two production-grade modules that need user-facing export consistency.

### Strategic Value

A shared export runtime protects output quality, reduces duplicated report logic, and makes “executive-ready” export a platform capability rather than a per-module customization effort.

---

## SF-25 — `@hbc/publish-workflow`

### Recommendation

Build `@hbc/publish-workflow` as a shared package.

### Why It Qualifies as Shared Infrastructure

Publishing is not the same as exporting. Export generates an artifact; publishing governs how finalized information is formally issued, versioned, stored, distributed, and acknowledged. That pattern repeats across multiple modules:

- Publish a finalized scorecard or review output.
- Issue a project report to SharePoint.
- Distribute an exported package to stakeholders.
- Capture who published it, when, under what version, and to whom.

Because this is a workflow/governance problem with repeated accountability patterns, it warrants shared infrastructure.

### Architectural Model

`@hbc/publish-workflow` should provide a generalized publication pipeline using configuration contracts such as:

- `IPublishConfig<TArtifact>`
- `IPublishTarget`
- `IPublishApprovalRule`
- `IPublishResult`

The package should orchestrate publication state, target resolution, version stamping, routing, and downstream notification without owning the module's business content.

### Intended Scope

**Included**
- Publish-state model (`draft`, `ready`, `published`, `superseded`, `revoked`)
- Publication target definitions (SharePoint, download, distribution list, future Teams/email)
- Version stamp and issue metadata
- Approval / acknowledgment hooks before or after publish
- Shared audit hooks and result surface

**Excluded**
- Low-level artifact rendering (belongs to `@hbc/export-runtime`)
- Module-specific approval logic beyond configurable rules
- Enterprise records-retention policy engine

### Expected Consumers

- BD scorecards and strategic summaries
- Project Hub reports, plans, meeting minutes, and turnover records
- Forecast / schedule / executive reporting outputs
- Future transmittal-style and compliance publication flows

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | SF-01 `@hbc/sharepoint-docs`, SF-06 `@hbc/versioned-record`, `@hbc/models` |
| Strong integrations | SF-04 `@hbc/acknowledgment`, SF-10 `@hbc/notification-intelligence`, SF-24 `@hbc/export-runtime` |
| Optional integrations | SF-28 `@hbc/activity-timeline`, SF-08 `@hbc/workflow-handoff` |

### Implementation Priority

**Recommended priority:** Late Tier 2A  
Build after export-runtime and versioned-record are stable enough to support governed issue workflows.

### Strategic Value

A shared publish workflow turns ad hoc output distribution into a controlled, auditable, reusable platform behavior — essential for records that carry accountability, downstream reliance, or formal issue status.

---

## SF-26 — `@hbc/saved-views`

### Recommendation

Build `@hbc/saved-views` as a shared package.

### Why It Qualifies as Shared Infrastructure

The platform is increasingly table- and queue-driven. Users will repeatedly need to preserve and recall how they work with data:

- column visibility and ordering
- filters and filter groups
- sorts and groupings
- density preferences
- personal versus shared team views

This problem will recur in nearly every operational grid. A shared saved-view layer prevents inconsistent table UX and aligns directly with the Mold Breaker goal of adapting complexity and context to the user.

### Architectural Model

`@hbc/saved-views` should provide a normalized view-definition contract decoupled from any one grid implementation:

- `ISavedViewDefinition`
- `ISavedViewScope` (`personal`, `team`, `role`, `system`)
- `ISavedViewStateMapper<T>`

The package stores, restores, and manages serialized view state while allowing each consuming module to define its own columns and filters.

### Intended Scope

**Included**
- Save / update / delete views
- Personal and shared view scopes
- Persisted table layout state
- Default system views and role-based starter views
- Reapply serialized filters, sorts, grouping, and density

**Excluded**
- Full-screen workspace behavior
- Domain-specific filter logic definitions
- BI-grade analytical bookmarking outside standard operational tables

### Expected Consumers

- My Work and action queues
- Estimating logs and pursuit lists
- Project Hub tables and registers
- Admin configuration / governance tables
- Future operations, procurement, and reporting workspaces

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | `@hbc/ui-kit`, `@hbc/models`, optional local storage / persistence adapter |
| Strong integrations | SF-03 `@hbc/complexity`, SF-13 `@hbc/project-canvas` |
| Optional integrations | SF-27 `@hbc/bulk-actions`, UI Kit table abstractions |

### Implementation Priority

**Recommended priority:** Early Tier 2B  
Build as soon as shared table patterns begin to stabilize across two or more major modules.

### Strategic Value

Saved views materially reduce cognitive load, improve repeatability for power users, and make large operational tables feel purpose-built to the user rather than generic.

---

## SF-27 — `@hbc/bulk-actions`

### Recommendation

Build `@hbc/bulk-actions` as a shared package.

### Why It Qualifies as Shared Infrastructure

As soon as the platform contains meaningful work queues and operational tables, users will expect to act on more than one item at a time. The interaction pattern is repeated and platform-wide:

- bulk publish
- bulk assign / reassign
- bulk acknowledge
- bulk status change
- bulk archive or close
- bulk export

The infrastructure for selection, action gating, progress feedback, result summaries, and partial-failure handling should be shared rather than reinvented per module.

### Architectural Model

`@hbc/bulk-actions` should expose generic action definitions and execution contracts:

- `IBulkAction<TItem>`
- `IBulkActionGuard<TItem>`
- `IBulkActionResult`
- `IBulkSelectionState`

Each module supplies the allowed actions and item-level eligibility rules; the package supplies the interaction model and execution lifecycle.

### Intended Scope

**Included**
- Shared multi-select state model
- Action menus and confirmation surfaces
- Guardrail messaging for mixed-eligibility selections
- Progress / completion / partial-failure UI
- Shared batch execution result summary

**Excluded**
- Module-specific batch business logic
- Long-running backend orchestration engine
- Domain-specific undo semantics beyond configurable hooks

### Expected Consumers

- Notification queues
- Record lists and logs
- Publishing and export workspaces
- Admin governance tables
- Future procurement, staffing, and operations queues

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | `@hbc/ui-kit`, `@hbc/models` |
| Strong integrations | SF-02 `@hbc/bic-next-move`, SF-10 `@hbc/notification-intelligence`, SF-26 `@hbc/saved-views` |
| Optional integrations | SF-25 `@hbc/publish-workflow`, SF-28 `@hbc/activity-timeline` |

### Implementation Priority

**Recommended priority:** Mid Tier 2B  
Build after at least one queue-heavy module demonstrates repeated need for shared batch interaction.

### Strategic Value

Bulk actions are a force multiplier for operational efficiency and become essential once the platform is trusted for real work at scale.

---

## SF-28 — `@hbc/activity-timeline`

### Recommendation

Build `@hbc/activity-timeline` as a shared package.

### Why It Qualifies as Shared Infrastructure

The Mold Breaker strategy repeatedly emphasizes accountability, context, and transparent systems. A shared activity timeline operationalizes that thesis by giving every significant record a consistent history surface:

- who created it
- who changed it
- who published it
- who acknowledged it
- what moved next
- when key milestones occurred

That pattern is cross-module and foundational to trust. It should not be reconstructed differently in each module.

### Architectural Model

`@hbc/activity-timeline` should provide a normalized event-feed contract such as:

- `IActivityEvent`
- `IActivityActor`
- `IActivityTarget`
- `IActivityTimelineConfig`

The package should render and manage timeline presentation while allowing modules to register their own event producers.

### Intended Scope

**Included**
- Standardized activity event model
- Timeline rendering components
- Event grouping, labeling, and actor attribution
- Configurable filtering of activity types
- Support for cross-linked events from other shared packages

**Excluded**
- Full enterprise observability / telemetry system
- Domain-specific narrative generation
- Immutable legal records system

### Expected Consumers

- Versioned forms and records
- Published artifacts
- Workflow handoffs
- Acknowledgment-driven records
- Admin governance surfaces
- Future cross-module record pages and project canvases

### Dependencies

| Type | Packages |
|---|---|
| Hard dependencies | `@hbc/models`, `@hbc/ui-kit` |
| Strong integrations | SF-06 `@hbc/versioned-record`, SF-08 `@hbc/workflow-handoff`, SF-25 `@hbc/publish-workflow` |
| Optional integrations | SF-02 `@hbc/bic-next-move`, SF-04 `@hbc/acknowledgment`, SF-10 `@hbc/notification-intelligence` |

### Implementation Priority

**Recommended priority:** Late Tier 2B / Early Tier 3  
Build once at least two shared packages are emitting stable event metadata worth surfacing in a user-facing timeline.

### Strategic Value

`@hbc/activity-timeline` makes accountability visible, preserves operational context, and reinforces the platform’s differentiator: work is never separated from the history and responsibility chain that gives it meaning.

---

## Addendum Dependency Notes

These candidate packages extend — but do not alter — the original dependency graph.

```
SF-23  @hbc/record-form ◄──── SF-05 · SF-12 · SF-06 ───────────────┐
SF-24  @hbc/export-runtime ◄─ SF-06 ───────────────────────────────┤
SF-25  @hbc/publish-workflow ◄ SF-01 · SF-04 · SF-06 · SF-10 · SF-24 ┤
SF-26  @hbc/saved-views ◄──── SF-03 · SF-13 ───────────────────────┤
SF-27  @hbc/bulk-actions ◄─── SF-02 · SF-10 · SF-26 ───────────────┤
SF-28  @hbc/activity-timeline ◄ SF-06 · SF-08 · SF-25 ──────────────┘
```

### Recommended Build Sequence for the Addendum Packages

1. **SF-23 `@hbc/record-form`** — implement before creation logic proliferates across modules.
2. **SF-24 `@hbc/export-runtime`** — implement before polished output patterns diverge module by module.
3. **SF-25 `@hbc/publish-workflow`** — implement once export/runtime and version discipline are established.
4. **SF-26 `@hbc/saved-views`** — implement when shared table patterns solidify.
5. **SF-27 `@hbc/bulk-actions`** — implement when queue-heavy operational tables are active.
6. **SF-28 `@hbc/activity-timeline`** — implement once the platform emits enough stable event metadata to justify a unified history surface.

### Net Effect on the PH7 / PH8 Roadmap

These six packages extend the original SF-01 through SF-16 platform into three additional capability bands:

- **Shared record lifecycle infrastructure** (`@hbc/record-form`)
- **Shared output governance infrastructure** (`@hbc/export-runtime`, `@hbc/publish-workflow`)
- **Shared operational data workspace infrastructure** (`@hbc/saved-views`, `@hbc/bulk-actions`, `@hbc/activity-timeline`)

Together they strengthen the same Mold Breaker thesis already driving this document: users should not experience HB Intel as a collection of disconnected modules, but as a coherent operational system where creation, action, output, and context behave consistently everywhere.

---

*End of Addendum A — Recommended Additional Shared Packages*


*End of PH7-Shared-Features-Evaluation.md*
*Individual feature specifications: see PH7-SF-01 through PH7-SF-28 in this directory.*
