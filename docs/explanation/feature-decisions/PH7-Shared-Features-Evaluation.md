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

*End of PH7-Shared-Features-Evaluation.md*
*Individual feature specifications: see PH7-SF-01 through PH7-SF-22 in this directory.*
