# Wave 8 — Project Readiness Module Framework Scope Lock

Generated: 2026-05-01

## Objective

Lock Wave 8 as the reusable **Project Readiness Module Framework** and the **Project Readiness Center shell definition** for Phase 3 implementation sequencing.

Wave 8 defines shared module framework contracts and shell-level readiness composition only. It is a prerequisite layer for module-specific waves and is not itself a full workflow-runtime implementation wave.

## Current Repo-Truth Summary

- Wave 8 is already named **Project Readiness Module Framework** in current Phase 3 roadmap/implementation documents.
- Wave 9–14 are already sequenced as downstream modules after Wave 8.
- Existing docs already preserve the rule that `Archived` is a `ProjectStatus`, not a `ProjectStage`.
- This scope lock extends those definitions with explicit framework taxonomy, readiness item model, and blocker-first posture semantics.

## Target Module Name

- Technical wave/framework name: **Project Readiness Module Framework**.
- User-facing module/surface name: **Project Readiness Center**.

## Framework vs Surface Decision

- Wave 8 defines the reusable readiness framework.
- Project Readiness Center is the user-facing shell that presents normalized readiness posture.
- Wave 8 is not:
  - a static readiness dashboard;
  - a generic checklist page;
  - a duplicate of Priority Actions, Approvals, Site Health, Team & Access, or Document Control;
  - the Wave 9 Job Startup Checklist module.

## Wave Relationship (8 ↔ 9–14)

- Wave 8 provides the shared framework boundary and shell definition.
- Wave 9 implements Job Startup Checklist on the Wave 8 framework.
- Wave 10 implements Permit Log on the Wave 8 framework.
- Wave 11 implements Responsibility Matrix / RACI on the Wave 8 framework.
- Wave 12 implements Constraints Log on the Wave 8 framework.
- Wave 13 implements Buyout Log on the Wave 8 framework.
- Wave 14 implements Approvals / Checkpoints on the Wave 8 framework.

## Readiness Domains (MVP/Future-Aware Taxonomy)

1. Project Setup
2. Team & Access
3. Documents / Project Record
4. Startup / Mobilization
5. Safety / QAQC
6. Permits / Jurisdiction
7. Procurement / Buyout
8. Responsibility / RACI
9. Constraints
10. Schedule / Milestones
11. Financial / Accounting Setup
12. External Systems
13. Site Health
14. Closeout / Turnover

Wave 8 establishes domain taxonomy and framework posture. Later waves own module-specific operational detail.

## Lifecycle Gates

1. Lead / Pursuit
2. Estimating
3. Preconstruction
4. Turnover to Operations
5. Startup / Mobilization
6. Active Construction
7. Closeout Planning
8. Substantial Completion
9. Turnover / Warranty
10. Archived / Lessons Learned

### Gate Mapping to `PccProjectStage`

- `lead` → Lead / Pursuit
- `estimating` → Estimating
- `preconstruction` → Preconstruction and Turnover to Operations transition
- `active_construction` → Startup / Mobilization and Active Construction
- `closeout` → Closeout Planning and Substantial Completion transition
- `warranty` → Turnover / Warranty and Lessons Learned follow-through

`Archived` remains a `ProjectStatus` value and is not a lifecycle stage.

## Readiness Item Model (Intended Shape)

- `id`
- `domain`
- `lifecycleGate`
- `sourceModule`
- `title`
- `description`
- `ownerPersona`
- `assignedUser`
- `reviewerPersona`
- `dueDate`
- `status`
- `severity`
- `blockerState`
- `evidenceRequirement`
- `evidenceStatus`
- `sourceDocumentOrEvidenceLink`
- `dependencyReferences`
- `escalationPath`
- `approvalCheckpointRequirement`
- `auditHistoryRecords`
- `relatedPriorityActionReference`
- `confidenceSourceHealthPosture`

## Scoring/Posture Model

- Readiness posture is blocker-first.
- Domain posture is more important than one blended global score.
- Unresolved critical blockers override high completion percentages.
- Evidence-backed confidence is tracked separately from completion.
- Trend scoring is a future enhancement, not required in this documentation correction pass.

Suggested readiness posture values:

- `ready`
- `at-risk`
- `blocked`
- `not-started`
- `not-applicable`
- `unknown`

Suggested confidence values:

- `high`
- `medium`
- `low`
- `unknown`

## Role/Action Model Summary

Wave 8 does not bypass established PCC role/action authority. The framework defines posture visibility and workflow intent only; runtime authorization remains implementation-scoped to downstream waves.

### Can View Readiness Posture

- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Superintendent
- Project Accounting / Project Accountant
- Project Team Member
- Project Viewer
- Safety / QAQC
- Manager of Operational Excellence
- Estimating Coordinator
- Estimator
- Lead Estimator
- Chief Estimator
- Director of Preconstruction
- Project Coordinator
- external/deferred personas only where project access is explicitly granted

### Can Update Readiness Item Status

- Project Manager
- Project Executive
- Superintendent
- Project Coordinator
- assigned owner personas
- domain-specific internal roles where assigned
- PCC Admin for administrative correction

### Can Assign Owners

- Project Manager
- Project Executive
- PCC Admin
- Manager of Operational Excellence where governance requires
- Director of Preconstruction / Chief Estimator for preconstruction gates where assigned

### Can Attach Evidence / Add Comments

- assigned owner
- Project Manager
- Project Executive
- Superintendent
- Project Coordinator
- Safety / QAQC for safety evidence
- Estimating / Preconstruction personas for estimating/preconstruction evidence
- external/deferred personas only when granted scoped evidence role in a later workflow

### Can Resolve Blockers

- assigned owner
- Project Manager
- Project Executive
- responsible domain lead
- PCC Admin for administrative correction

### Can Approve Readiness Gate

- Project Executive
- Project Manager for assigned business gates
- Director of Preconstruction / Chief Estimator for preconstruction/estimating gates
- Safety / QAQC for safety readiness gates where defined
- Manager of Operational Excellence for governance checkpoints where defined
- Executive Oversight for escalation review only, not routine updates

### Can Override Readiness Status

- PCC Admin
- Project Executive
- Executive Oversight only by explicit escalation
- Manager of Operational Excellence only where governance authorizes

### Can Configure Readiness Templates

- PCC Admin
- IT / Tenant Admin for technical/configuration posture
- Manager of Operational Excellence for business-governance templates
- Project Executive / Project Manager only for project-level allowed configuration, not global templates

### Can Export Readiness Evidence

- Project Executive
- Project Manager
- Executive Oversight
- PCC Admin
- Project Accounting where financial/accounting readiness applies
- limited viewer/export rules for project viewers as governed by document-control policy

### Can View Audit

- PCC Admin
- IT / Tenant Admin
- Executive Oversight
- Project Executive
- Project Manager
- Manager of Operational Excellence
- limited domain audit for assigned owners/reviewers

## Wave 8 Interfaces and Dependencies

Wave 8 depends on prior foundations:

- Wave 1 shared model vocabulary.
- Wave 2 SPFx shell frame posture.
- Wave 3 backend read-model foundation posture.
- Established Project Readiness and workflow terminology in Phase 3 blueprint docs.

Wave 8 provides to Waves 9–14:

- shared readiness module framework vocabulary;
- item-level workflow framework semantics;
- readiness shell definition for module composition;
- cross-module alignment for statuses, ownership, due-date, comment, and audit vocabulary.

## Integration Model (Normalization, Not Duplication)

Wave 8 aggregates and normalizes readiness signals from source modules:

- Wave 6 Team & Access
- Wave 7 HB Document Control Center
- Wave 9 Startup / Lifecycle Checklist
- Wave 10 Permit Log
- Wave 11 Responsibility Matrix / RACI
- Wave 12 Constraints Log
- Wave 13 Buyout Log
- Wave 14 Approvals / Checkpoints
- Wave 15 External Systems
- Wave 17 Site Health
- Future closeout workflows

Wave 8 must not duplicate source-module record ownership where a downstream module owns detail.

## Source-Of-Record Posture

- Source modules remain the source of operational detail.
- Wave 8 is the readiness normalization/operating framework and posture layer.
- Project Readiness Center surfaces normalized readiness posture, blockers, and evidence posture without replacing module-owned systems of record.

## Guardrails

- Do not duplicate future module data unnecessarily.
- Do not create competing workflows where later modules own detail.
- Do not let readiness scoring hide critical blockers.
- Do not make readiness purely manual where module signals can feed it.
- Do not imply runtime integrations unless implemented.
- Do not mutate external systems.
- Do not bypass role/action authority.
- Do not treat Project Readiness Center as the Wave 9 checklist.
- Do not implement tenant, Graph, Procore, Adobe, Document Crunch, Sage, or SharePoint mutations in Wave 8.

## Constraints and Exclusions

This Wave 8 scope lock does not authorize:

- readiness runtime implementation in SPFx;
- backend route creation;
- persistence model implementation;
- scoring engine implementation;
- approval execution runtime;
- external integration runtime behavior;
- tenant/deployment/package operations.

## Acceptance Criteria

This Prompt 02 documentation update passes when:

- Wave 8 is consistently defined as the shared Project Readiness Module Framework.
- Project Readiness Center is the documented user-facing name.
- Wave 9 remains a downstream checklist module, not the Wave 8 framework.
- Waves 10–14 are clearly downstream modules that plug into Wave 8.
- Priority Actions, Approvals, Site Health, Team & Access, and Document Control relationships are clear and non-duplicative.
- Guardrails are explicit.
- No runtime implementation is claimed.
- No edits are made under `docs/architecture/plans/**`.

## Recommended Implementation Sequence

1. Wave 8 framework contracts and normalization seams.
2. Wave 9 Job Startup Checklist module.
3. Wave 10 Permit Log module.
4. Wave 11 Responsibility Matrix / RACI module.
5. Wave 12 Constraints module.
6. Wave 13 Buyout module.
7. Wave 14 Approvals / Checkpoints linkage finalization.
8. Cross-module posture hardening and non-production validation.

## Validation Commands

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
```
