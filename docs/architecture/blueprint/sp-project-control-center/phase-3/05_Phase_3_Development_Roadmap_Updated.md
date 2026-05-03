# Phase 3 Development Roadmap — Updated With Module Implementation Plan

Generated: 2026-04-28

## Objective

Update the Phase 3 roadmap to reflect the resolved planning decisions and the formal module-by-module implementation plan.

## Phase 3 Status

Phase 3 planning deliverables are locked. Implementation may proceed only after the implementation gate confirms that the required Phase 2 proof, mutation, validation, and closeout conditions are satisfied.

## Updated MVP Direction

The MVP is **Project Home + governed navigation hub + light operational workflows**.

## Phase 3 Implementation Thesis

Phase 3 code work builds the PCC application layer:

- PCC SPFx shell;
- backend-normalized read models;
- role-aware work centers;
- Priority Actions Rail;
- light operational workflow framework;
- structured Project Readiness workflow modules;
- Document Control Center access hub;
- External Systems launch hub;
- Site Health visibility and repair request intake;
- admin/control-plane review surfaces.

Phase 3 does not build the provisioning engine.

## Required Sequencing Rule

Do not begin with individual workflow modules.

Required order:

1. Wave 0 — implementation gate and repo-truth recheck.
2. Wave 1 — shared foundations.
3. Wave 2 — SPFx shell frame.
4. Wave 3 — backend read-model foundation.
5. Wave 4 — Project Home / Command Center.
6. Wave 4A — Controlled Non-Production Tenant SPPKG Visual Validation Gate (first eligible hosted validation point).
7. Wave 5 — Priority Actions Rail.
8. Wave 5A — Optional Controlled Tenant Revalidation After Priority Actions Rail.
9. Waves 6–19 — module-by-module implementation.
10. Wave 20 — hardening, doctrine validation, and non-production readiness.

## Wave Plan

| Wave | Module / Workstream                                                 | Primary Output                                                                                                     | Status                              |
| ---: | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
|    0 | Implementation Gate & Repo Truth Recheck                            | Gate review, allowed paths, blocked scope                                                                          | Required before code                |
|    1 | PCC Shared Foundations                                              | Shared models, enums, role model, fixtures                                                                         | Implementation wave                 |
|    2 | PCC SPFx Shell Frame                                                | Shell/routing/layout/state frame                                                                                   | Implementation wave                 |
|    3 | PCC Backend Read-Model Foundation                                   | Read-model endpoints/scaffolds                                                                                     | Complete                            |
|    4 | Project Home / Command Center                                       | Hybrid landing page                                                                                                | Module wave                         |
|   4A | Controlled Non-Production Tenant SPPKG Visual Validation Gate       | First eligible hosted validation after Wave 4 in controlled non-production tenant scope                            | Controlled validation gate          |
|    5 | Priority Actions Rail                                               | Four-category action rail                                                                                          | Module wave                         |
|   5A | Optional Controlled Tenant Revalidation After Priority Actions Rail | Optional hosted revalidation after Wave 5                                                                          | Optional controlled validation gate |
|    6 | Team & Access                                                       | Request + approval workflow                                                                                        | Module wave                         |
|    7 | HB Document Control Center                                          | Three-lane document architecture (Project Record, My Project Files, External Systems)                              | Module wave                         |
|    8 | Project Readiness Module Framework                                  | Shared item-level workflow framework                                                                               | Module wave                         |
|    9 | Project Lifecycle Readiness Center                                  | Lifecycle readiness module seeded by startup, safety, and closeout checklist definition files                      | Module wave                         |
|   10 | Permit & Inspection Control Center                                  | Unified permit/inspection command-center architecture using internal `permits` and `required-inspections` families | Module wave                         |
|   11 | Responsibility Matrix                                               | Item-level responsibility workflow with owner-contract mapping                                                     | Module wave                         |
|   12 | Constraints Log                                                     | Make-Ready Constraint & Risk Exposure Center (Project Readiness governance module)                                 | Module wave                         |
|   13 | Buyout Log                                                          | Item-level buyout/project-controls workflow                                                                        | Module wave                         |
|   14 | Approvals / Checkpoints                                             | Approval queue and authority logic                                                                                 | Module wave                         |
|   15 | External Systems                                                    | Launch hub for approved systems                                                                                    | Module wave                         |
|   16 | Control Center Settings                                             | Role-gated settings                                                                                                | Module wave                         |
|   17 | Site Health                                                         | Health visibility and repair request intake                                                                        | Module wave                         |
|   18 | Executive Oversight / Global Read-Only                              | Executive summary and governed drill-in                                                                            | Module wave                         |
|   19 | Admin / Control Plane Review Surfaces                               | Admin queues and review surfaces                                                                                   | Module wave                         |
|   20 | Hardening, Doctrine Validation, Non-Production Readiness            | Validation, accessibility, doctrine, closeout                                                                      | Closing wave                        |

## Milestone Grouping

### Milestone 1 — Foundation

- Wave 0 — Implementation Gate
- Wave 1 — Shared Foundations
- Wave 2 — SPFx Shell Frame
- Wave 3 — Backend Read-Model Foundation

### Milestone 2 — Core PCC Experience

- Wave 4 — Project Home
- Wave 4A — Controlled Non-Production Tenant SPPKG Visual Validation Gate (first hosted validation point)
- Wave 5 — Priority Actions Rail
- Wave 5A — Optional Controlled Tenant Revalidation After Priority Actions Rail
- Wave 15 — External Systems
- Wave 16 — Control Center Settings

### Milestone 3 — Access, Documents, and Health

- Wave 6 — Team & Access
- Wave 7 — HB Document Control Center
- Wave 17 — Site Health
- Wave 19 — Admin Review Surfaces

### Milestone 4 — Structured Project Readiness

- Wave 8 — Project Readiness Module Framework
- Wave 9 — Project Lifecycle Readiness Center
- Wave 10 — Permit & Inspection Control Center
- Wave 11 — Responsibility Matrix
- Wave 12 — Constraints Log
- Wave 13 — Buyout Log
- Wave 14 — Approvals / Checkpoints

Wave relationship lock:

- Wave 8 defines the reusable Project Readiness Module Framework and Project Readiness Center shell definition.
- Waves 9–14 implement module-specific behavior on that shared framework (Wave 9 Project Lifecycle Readiness Center, Wave 10 Permit & Inspection Control Center, Responsibility Matrix / RACI, Constraints Log, Buyout Log, and Approvals / Checkpoints).
- Wave 10 target architecture authority path: `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`.
- Wave 9 is seeded by startup, safety, and closeout checklist-definition files in `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/`.
- Wave 9 surfaces lifecycle readiness signals and cross-module posture but does not assume implementation ownership of Waves 10–14 modules.
- Wave 8 documentation does not authorize readiness runtime execution, backend routes, persistence, scoring engines, approval execution, or external integrations.

Wave 11 clarification lock:

- Official module name is `Responsibility Matrix` (subtitle: `RACI + Owner-Contract Responsibility Control Center`).
- Wave 11 is one unified Project Readiness module, not two workbook launchers.
- Workbook-source counting posture: `109` workbook-derived task-row context (82 PM task-text rows plus 27 Field rows with assignment marks); strict marked assignment rows total `98`.
- Owner-contract workbook posture is template/schema-only in current sources (no populated default obligation descriptions).
- Wave 11 includes assignment lifecycle/handoffs, current action owner posture, workflow steps, decision-rights overlay, contract-party mapping + internal RACI separation, evidence references, exceptions, and Matrix Health Score planning posture.
- Wave 14 remains approval/checkpoint execution owner; Wave 11 does not claim approval runtime execution.
- HB Document Control Center remains evidence-binary owner; Team & Access remains roster/access owner.
- Documentation posture only: no legal advice, no automatic creation of legal obligations, and no external-system writeback/runtime mutation claim.

Wave 12 clarification lock:

- Official module name remains `Constraints Log` (subtitle: `Make-Ready Constraint & Risk Exposure Center`).
- Governing docs place Wave 12 under Project Readiness; current source-model mapping (`constraints-log`) to `risk-issues-decision` is an alignment item and is not changed in this prompt.
- Wave 12 governance posture distinguishes risk (uncertain future), constraint (known blocker), issue (active problem), delay exposure (schedule-impact condition for review), and change exposure (scope/cost/contract impact condition for review).
- Embedded risk/exposure posture does not replace claims handling, formal delay analysis, enterprise change-management systems, or enterprise risk systems.
- External-system posture remains launcher/reference-only; no writeback or runtime mutation is introduced.

Wave 13 clarification lock:

- Official module name remains `Buyout Log` (subtitle: `Buyout Control Center`).
- Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.

Wave 8 framework planning posture:

- Wave 8 establishes readiness domains, lifecycle gates, readiness item shape, posture/scoring semantics, and integration seams across source modules.
- Wave 8 does not duplicate module-owned details from Team & Access, Document Control, Project Lifecycle Readiness Center, Wave 10 Permit & Inspection Control Center, Responsibility Matrix, Constraints Log, Buyout Log, Approvals / Checkpoints, External Systems, or Site Health.
- Critical blocker posture overrides blended completion summaries; confidence posture remains separate from completion.

### Milestone 5 — Executive Experience and Hardening

- Wave 18 — Executive Oversight / Global Read-Only
- Wave 20 — Hardening, Doctrine Validation, and Non-Production Readiness

## Controlled Tenant Validation Gate Distinction

- **Wave 4A is the first eligible hosted validation point** and occurs only after Wave 4 Project Home / Command Center implementation.
- Wave 4A is the selected gate; a local/dev-harness-only validation gate is not used for this hosted validation decision.
- Wave 4A authorizes controlled non-production tenant-hosted visual validation activity only: `.sppkg` build, approved non-production app-catalog or site-collection app-catalog upload/install actions, and controlled validation-page rendering to verify SharePoint host behavior (canvas sizing, theme behavior, responsive layout, asset loading, and Project Home visual quality).
- No broad tenant mutation is authorized. Tenant activity is limited to approved non-production catalog/install and controlled validation-page actions required for visual validation.
- Wave 5A is optional, is not the first hosted validation point, and may be used to revalidate the hosted PCC experience after Wave 5 adds Priority Actions Rail.
- Wave 5A carries the same controlled non-production tenant limits as Wave 4A.
- Wave 20 remains the formal hardening and non-production readiness gate (doctrine, accessibility, responsive validation, guardrail regression, and documentation closeout).
- Production rollout remains separately approved and is not implied by Wave 4A, Wave 5A, or Wave 20.

## Phase 2 Dependency Map

| Phase 3 Item                           | Dependency                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| SPFx implementation                    | Prompt 06 gate review and Phase 2 proof/interface stability.                              |
| Backend implementation                 | Phase 2 Step 4/5/6 and Prompt 06 gate review.                                             |
| Automated access execution             | Backend security/provisioning gate; not included in MVP module wave.                      |
| Automated Site Health repair           | Phase 2 validation/repair posture and backend gate; not included in MVP Site Health wave. |
| Structured workflow storage/data model | Future backend/data-model decision.                                                       |
| Non-production execution               | Phase 2 closeout and explicit non-production authorization.                               |
| Production rollout                     | Non-production proof and production approvals.                                            |

## Per-Wave Closeout Requirement

Every implementation wave must close with:

- files changed;
- what was implemented;
- what was intentionally not implemented;
- validation results;
- no broad tenant mutation outside approved gate scope confirmation;
- no Procore runtime confirmation;
- no direct SPFx provisioning confirmation;
- remaining blockers;
- recommended next wave.

## Recommended Validation Pattern

Use repo-correct equivalents of:

```bash
git status --short
pnpm check-types
pnpm test --filter <touched package/app/backend target>
pnpm build --filter <touched package/app target>
```

## Recommended Commit Summary

```text
docs(pcc): add phase 3 module implementation plan
```

## Unified Lifecycle Doctrine Alignment (2026-05-03)

Roadmap execution should be interpreted with unified lifecycle doctrine authority:

- [`../Unified_PCC_Lifecycle_Objective_Architecture.md`](../Unified_PCC_Lifecycle_Objective_Architecture.md)
- [`../PCC_Project_Lifecycle_Spine.md`](../PCC_Project_Lifecycle_Spine.md)
- [`../PCC_Project_Memory_Layer.md`](../PCC_Project_Memory_Layer.md)
- [`../PCC_Role_And_Stage_Lens_Model.md`](../PCC_Role_And_Stage_Lens_Model.md)

Wave 12 baseline correction:

- Wave 12 Constraints Log has shared model contracts, backend read-model/provider route, and SPFx read-model client seam.
- Remaining implementation gap is end-user UI/surface integration into Project Readiness and/or the applicable PCC shell route/navigation pattern.

Readiness aggregation clarification:

- Constraints Log may retain risk/issues/decision governance affinity while rolling readiness signals.
- Buyout Log may retain procurement/buyout governance affinity while rolling readiness and startup/make-ready signals.
- This is a source-lineage rollup pattern, not duplicate ownership.
