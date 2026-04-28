# Prompt 01 — Phase 0 Step 1 Architecture Stabilization Audit

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute **Phase 0 Step 1 — Final Architecture Stabilization Audit and Schema-Extraction Readiness Review** for the Project Control Center architecture.

This is the first execution step in the path:

```text
stabilize architecture and schema extraction planning
```

Your objective is to audit the governing Project Control Center architecture documents and produce a precise, implementation-oriented stabilization package that prepares the architecture for machine-readable schema extraction.

This is a **documentation audit and planning task only**.

Do **not** modify code, schemas, SPFx packages, backend files, manifests, tests, provisioning scripts, package versions, build files, generated files, or app code.

Do **not** create `packages/project-site-template/` in this prompt.

Do **not** create schemas in this prompt.

Do **not** implement provisioning logic.

Do **not** implement SPFx surfaces.

Do **not** run builds, tests, lint, typecheck, packaging, or deployment unless there is a markdown-only validation command already present and clearly applicable.

Do **not** re-read files that are still within your current context or memory unless you need to verify exact edit locations, resolve a contradiction, or confirm repo truth.

---

## Primary Files to Audit

Audit these files as the governing source set:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/procore_hbintel_data_model_package/README.md
```

If `README.md` or `Project_Control_Center_Development_Roadmap.md` does not exist yet, note that as a blocker and continue auditing the two governing files plus the Procore package README.

Use targeted repo searches only where needed to validate references, paths, or governing standards.

---

## Context to Preserve

The Project Control Center is the standardized SharePoint project-site operating surface for Hedrick Brothers Construction.

The architecture currently defines:

- standardized project team sites;
- a Project Control Center full-page SPFx shell;
- a Standard Project Site Template Contract;
- Team & Access governance;
- Control Center Settings;
- list, library, page, module, and permission objects;
- Procore mapping and integration boundaries;
- MVP vs future scope;
- Decision Closure Register;
- schema extraction as the next architecture-to-implementation bridge.

The contract is the human-readable implementation source of truth. Future machine-readable schemas must derive from it.

The blueprint is the strategic architecture and north-star document. It should align to the contract, but implementation details should be derived from the contract.

---

## Required Audit Scope

Audit the governing files for all of the following:

1. Architecture completeness
2. Internal consistency
3. Implementation readiness
4. Missing dependencies
5. Ambiguous terminology
6. Duplicate or conflicting decisions
7. MVP vs future scope clarity
8. ProjectType / ProjectStage / ProjectStatus consistency
9. Procore integration consistency
10. Team & Access governance consistency
11. Control Center Settings requirements
12. Project site provisioning requirements
13. SharePoint list/library/page schema readiness
14. Backend/functions responsibilities
15. SPFx application boundaries
16. Data ownership and system-of-record boundaries
17. Site health / drift / repair requirements
18. Open proof-gated or deferred items that affect sequencing
19. Risks to implementation
20. Recommended stabilization work before schema extraction

---

## Mandatory Consistency Checks

Specifically verify and report whether the documents comply with these rules:

### ProjectType

ProjectType must use only:

```text
commercial
multifamily
municipal
luxury_residential
environmental
```

### ProjectStage

ProjectStage must use only:

```text
lead
estimating
preconstruction
active_construction
closeout
warranty
```

### ProjectStatus

ProjectStatus must use only:

```text
Active
On Hold
Closed
Archived
```

### Anti-Regression Checks

Confirm:

- `Archived` is not treated as ProjectStage.
- `preconstruction_only` is not used as an active architecture value.
- `warranty_closeout` is not used as an active architecture value.
- `active_construction` is not used as ProjectType.
- `active_construction` is only used as ProjectStage.
- ProjectType drives vertical / construction context.
- ProjectStage drives lifecycle, module visibility, and workflow activation.
- ProjectStatus drives operational state, archive behavior, read-only behavior, and rollup visibility.

### Procore Checks

Confirm:

- `ProcoreCompanyId = 5280` is documented as configuration, not a secret.
- Procore mapping owner is Project Manager.
- Fallback Procore mapping owner is Project Executive if no Project Manager is assigned.
- Project Accountant is not the Procore mapping owner.
- Procore remains backend-routed through `backend/functions/`.
- SPFx modules must not call Procore API directly.
- Procore secrets are not stored in SharePoint, SPFx, markdown, repo source, or client configuration.
- Sage Intacct remains the accounting book of record.
- Procore financial data is labeled operational/project-management financial state.
- Procore directory comparison does not auto-grant SharePoint access.
- SharePoint lists are not treated as a full mirror of Procore transactional data.
- PCC is not treated as a replacement for Procore.

### Team & Access Checks

Confirm:

- Team & Access remains governed through PCC UI.
- Normal users do not use native SharePoint permissions/settings/edit screens for normal workflows.
- Permission templates remain business-facing concepts mapped to implementation details behind the scenes.
- External users remain deferred from MVP.
- Procore directory comparison does not automatically grant SharePoint permissions.

### Decision Closure Register Checks

Confirm that Decision Closure Register statuses use only:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

Confirm MVP scope is not bloated beyond the contract.

---

## Required Deliverables

Create the following markdown files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

Create the `phase-0/` directory if it does not exist.

Do not create any non-markdown files.

---

## Deliverable 1 — Architecture Stabilization Audit

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
```

Required sections:

```markdown
# Phase 0 Step 1 — Architecture Stabilization Audit

## Executive Summary
## Scope and Source Files
## Architecture Baseline
## Key Findings
## Consistency Assessment
## Implementation Readiness Assessment
## MVP Boundary Assessment
## Procore Boundary Assessment
## Team & Access Assessment
## Control Center Settings Assessment
## Provisioning Readiness Assessment
## SharePoint Object Readiness Assessment
## Backend / Functions Boundary Assessment
## SPFx Boundary Assessment
## Data Ownership and System-of-Record Assessment
## Site Health / Drift / Repair Assessment
## Risks and Mitigations
## Required Stabilization Before Schema Extraction
## Recommended Next Step
```

For each finding, include:

- finding ID;
- severity: `Critical`, `High`, `Medium`, `Low`, or `Informational`;
- source file and section;
- issue;
- implementation impact;
- recommended resolution;
- whether it blocks schema extraction.

Do not use vague findings. Every finding must be tied to a source file/section or a specific absent dependency.

---

## Deliverable 2 — Consistency Check Register

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
```

Use a table with these columns:

```markdown
| Check ID | Category | Required Rule | Result | Evidence | Blocks Schema Extraction? | Recommended Action |
```

Required categories:

- ProjectType
- ProjectStage
- ProjectStatus
- Procore
- Team & Access
- Control Center Settings
- Provisioning
- SharePoint Objects
- Backend / Functions
- SPFx
- Systems of Record
- Site Health / Drift / Repair
- MVP Scope
- Decision Closure Register
- Deferred / Proof-Gated Items

Results must use only:

```text
Pass
Pass with Note
Fail
Not Verifiable
```

---

## Deliverable 3 — Schema Extraction Readiness Backlog

File:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
```

Required sections:

```markdown
# Phase 0 Step 1 — Schema Extraction Readiness Backlog

## Purpose
## Readiness Summary
## P0 Blockers
## P1 Required Before Schema Extraction
## P2 Can Proceed During Schema Extraction
## P3 Future / Post-Extraction
## Object Families Requiring Extraction
## Required Schema Families
## Recommended Extraction Order
## Validation Rules Required for Phase 1
## Open Questions
## Phase 1 Entry Criteria
```

The backlog must distinguish these work types:

- Documentation / Architecture
- Schema / Contract Extraction
- Backend Provisioning
- SPFx Experience
- Data / Integration
- Governance / Security
- Adoption / Operations

For every backlog item, include:

```markdown
| ID | Priority | Work Type | Item | Source / Trigger | Owner | Dependency | Blocks Phase 1? | Acceptance Criteria |
```

Priority values:

```text
P0
P1
P2
P3
```

---

## Required Output Quality

The output must be:

- precise;
- implementation-oriented;
- directly traceable to repo truth;
- plain professional language;
- explicit about uncertainty;
- explicit about MVP boundaries;
- explicit about deferred and proof-gated items;
- free of invented IDs, secrets, credentials, or unsupported assumptions.

Do not create speculative architecture. If something is not defined, mark it as a gap or dependency.

---

## Validation Requirements

Before completion, verify and document:

1. The three required markdown files exist.
2. No code files changed.
3. No schema files changed.
4. No SPFx files changed.
5. No backend files changed.
6. No manifests changed.
7. No tests changed.
8. No provisioning scripts changed.
9. No secrets were introduced.
10. Obsolete enum values were not reintroduced as active values:
   - `preconstruction_only`
   - `warranty_closeout`
11. `active_construction` is only used as ProjectStage, not ProjectType.
12. The audit references both:
   - `Standard_Project_Site_Template_Contract.md`
   - `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
13. The backlog explicitly prepares Phase 1 — Machine-Readable Template Contract.
14. The audit clearly states whether schema extraction can proceed immediately or requires documentation stabilization first.

---

## Required Completion Summary

When complete, provide:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Key Findings
### Schema Extraction Readiness Decision
### Blockers
### Risks
### Validation Performed
### Confirmation of No Code / Schema / SPFx / Backend Changes
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): add phase 0 architecture stabilization audit
```
