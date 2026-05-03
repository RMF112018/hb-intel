# PCC Unified Lifecycle Documentation Update — Combined Prompt Package



---

# PCC Unified Lifecycle Documentation Update Prompt Package

Date: 2026-05-03

## Purpose

This package instructs a local code agent working in `/Users/bobbyfetting/hb-intel` to make documentation-only updates that align the Project Control Center (PCC) architecture with the repo-truth audit findings.

The goal is to lock PCC as one unified, lifecycle-aware project operating layer, not a collection of departmental workspaces or siloed modules.

## Package Contents

1. `00_MASTER_INSTRUCTIONS.md` — governing instructions for the full documentation update sequence.
2. `01_REPO_TRUTH_REVALIDATION_PROMPT.md` — local repo-truth validation prompt.
3. `02_UNIFIED_OBJECTIVE_ARCHITECTURE_PROMPT.md` — creates the main unified lifecycle doctrine document.
4. `03_LIFECYCLE_MEMORY_LENS_DOCS_PROMPT.md` — creates the lifecycle spine, project memory, and role/stage lens docs.
5. `04_TRACEABILITY_SEARCH_KNOWLEDGE_DOCS_PROMPT.md` — creates traceability, warranty, knowledge reuse, and HBI grounding docs.
6. `05_EXISTING_DOC_ALIGNMENT_PROMPT.md` — amends existing PCC docs and registers to reference the new doctrine.
7. `06_VALIDATION_CLOSEOUT_PROMPT.md` — validates docs, proves no runtime/lockfile changes, and creates closeout.
8. `reference/REPO_AUDIT_FINDINGS_SUMMARY.md` — audit findings the agent must preserve.
9. `reference/DOCUMENT_UPDATE_TARGET_MAP.md` — new docs and existing docs to update.
10. `reference/LOCAL_VALIDATION_COMMANDS.md` — command checklist for proof.

## Execution Order

Run the prompts in numerical order. Do not skip Prompt 01. Do not proceed to Prompt 05 until the new doctrine documents from Prompts 02–04 are in place.

## Critical Scope Rule

This is a documentation-only package. The local code agent must not implement runtime source code, SPFx UI, backend routes, model contracts, fixtures, tests, or package/dependency changes unless a later authorized implementation package explicitly instructs that work.


---

# 00 — Master Instructions: PCC Unified Lifecycle Documentation Update

## Role

You are a local code agent operating in the live repo:

```text
/Users/bobbyfetting/hb-intel
```

You are supporting HB Intel / Project Control Center architecture documentation.

## Objective

Make documentation-only updates that lock the PCC target architecture as a unified, lifecycle-aware, companywide project operating layer.

The PCC must not evolve into disconnected departmental workspaces for Business Development, Estimating, Preconstruction, Operations, Accounting, Closeout, Warranty, Executive Oversight, or IT. It must remain one project-first operating layer where role, stage, and task context are expressed through lenses, views, source lineage, traceability, and governed permissions.

## Scope

Documentation only.

Allowed:
- Create new Markdown architecture docs under:
  - `docs/architecture/blueprint/sp-project-control-center/`
- Amend existing PCC architecture Markdown docs under:
  - `docs/architecture/blueprint/sp-project-control-center/`
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/`
  - existing Phase 3 wave folders, only where needed for cross-reference alignment
- Add a documentation closeout file under:
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/`

Not allowed:
- Runtime source-code changes.
- SPFx implementation changes.
- Backend function changes.
- Model/package TypeScript changes.
- Fixture changes.
- Test changes, except running existing doc validation if applicable.
- Package/dependency changes.
- Lockfile changes.
- Broad formatting sweeps.
- Tenant mutation.
- SharePoint/Graph/Procore/Sage/CRM writeback.
- New modules or feature implementations.

## Context Efficiency

Do not re-read files that are still within your current context or memory. Use the current context first. Re-open files only where repo truth must be verified, where the content may be stale, or where contradiction exists.

## Non-Negotiable Architecture Thesis

The documentation updates must state and enforce this thesis:

PCC is one unified project operating layer. Work centers organize governed capabilities. Workflow modules represent task/control patterns. Role and stage lenses change what a user sees and can act on, but they do not create separate departmental workspaces. Project memory, lifecycle events, source lineage, evidence links, and traceability connect information across the full project lifecycle.

## Required Guardrails to Embed

- No separate departmental PCC workspaces.
- No duplicate source-of-record claims.
- No source-system writeback without an explicit future gate.
- No Procore/Sage/CRM/Graph mutation from this package.
- No cross-project leakage of sensitive pursuit, executive, financial, warranty, HR, or privileged information.
- No treating HBI/AI answers as source truth without source citations.
- No warranty responsibility or obligation conclusions without evidence lineage.
- No hidden module-specific architecture that bypasses the unified shell.
- No production rollout or tenant mutation.
- No package/dependency/lockfile changes.

## Required Output Style

Write concise but complete architecture documentation.

Use the repository's existing tone:
- formal,
- operational,
- implementation-aware,
- source-of-record disciplined,
- clear about MVP vs later phases,
- explicit about guardrails.

Avoid aspirational marketing language. Make the docs useful to future implementers and reviewers.

## Commit Discipline

Do not commit until all prompts in the sequence are completed and the final validation prompt authorizes commit preparation.

When ready, use a documentation-only commit message similar to:

```text
docs(pcc): define unified lifecycle architecture
```

Commit body should summarize:
- new unified lifecycle doctrine docs,
- existing architecture doc alignment,
- no runtime code changes,
- validation commands run,
- lockfile unchanged.


---

# 01 — Repo-Truth Revalidation Prompt

## Objective

Perform a local repo-truth revalidation before any documentation edits. This prompt is read-only except for optional notes in your own scratch context.

## Required Commands

From `/Users/bobbyfetting/hb-intel`, run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required File Inspection

Inspect, but do not edit, the current PCC governing docs:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

Inspect relevant model/code seams for orientation only. Do not edit:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/ConstraintsLog.ts
apps/project-control-center/src/shell/
apps/project-control-center/src/api/
backend/functions/src/hosts/pcc-read-model/
```

## Required Questions to Answer in Your Plan

Before editing, report:

1. Current branch.
2. Current HEAD.
3. Whether worktree is clean.
4. Baseline `pnpm-lock.yaml` MD5.
5. Whether any user-owned changes exist.
6. Whether governing docs still reflect the audit finding that PCC is one unified project operating layer.
7. Whether any doc status language is stale against the latest Phase 3 wave reality.
8. Whether the code/model seams still distinguish:
   - surfaces,
   - work centers,
   - workflow modules.
9. Whether Constraints Log and Buyout Log still show the governance-vs-affinity ambiguity observed in the audit.
10. Whether any new docs already exist for the unified lifecycle architecture.

## Proceed / Stop Rules

Stop and ask for direction only if:
- the worktree contains unrelated user-owned changes that overlap target docs;
- `pnpm-lock.yaml` already changed before you start;
- the target docs appear missing or moved;
- the repo is not on the expected branch and the user has not authorized proceeding.

Otherwise, proceed to Prompt 02.

## Deliverable

A short local plan summary with:
- baseline command results,
- local-risk notes,
- files to be created/edited in Prompts 02–06,
- confirmation that no runtime files have been edited.


---

# 02 — Create Unified PCC Objective Architecture Doctrine

## Objective

Create the primary doctrine document that states PCC's unified lifecycle target architecture and prevents future siloed departmental implementation.

## New File to Create

```text
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
```

## Required Purpose

This document must become the controlling architecture narrative for PCC lifecycle continuity.

It must define PCC as:

- one unified project operating layer;
- one canonical project context across all stages;
- work-center organized but not department-siloed;
- role-aware, stage-aware, and task-aware through lenses;
- source-of-record disciplined;
- lifecycle-continuity oriented;
- project-memory capable;
- traceability-ready;
- HBI-grounding-ready;
- closed-project knowledge-reuse ready.

## Required Sections

Create the document with these sections:

1. **Purpose**
2. **Architecture Thesis**
3. **Business Problem**
4. **Unified PCC Operating Model**
5. **What PCC Is**
6. **What PCC Is Not**
7. **Surfaces, Work Centers, Modules, and Lenses**
8. **Project Lifecycle Continuity**
9. **Project Memory and Source Lineage**
10. **Cross-Stage Traceability**
11. **Closed-Project Knowledge Reuse**
12. **Warranty and Obligation Traceability**
13. **Unified Search and HBI Grounding**
14. **Source-of-Record Boundaries**
15. **Security and Access Posture**
16. **MVP vs Later-Phase Posture**
17. **Guardrails**
18. **Required Future Documentation Alignment**

## Required Content Rules

### Surfaces

State that surfaces are shell-level navigation destinations, currently including:

- Project Home
- Team & Access
- Documents
- Project Readiness
- Approvals
- External Systems
- Control Center Settings
- Site Health

### Work Centers

State that work centers are governed capability domains. They are not separate apps, not separate departmental workspaces, and not independent source-of-record silos.

### Workflow Modules

State that workflow modules are structured control patterns hosted within the unified PCC context. A module may have a primary governance location and secondary affinity surfaces.

### Lenses

Define role/stage/task lenses as contextual views over the same project truth. Lenses may reorder, emphasize, filter, and permission information; they must not fork the project experience.

### Required Anti-Silo Language

Include clear statements that PCC must not create separate workspaces for:

- Business Development
- Estimating
- Preconstruction
- Operations
- Project Controls
- Accounting
- Closeout
- Warranty
- Executive Oversight
- IT/Admin

These groups may have lenses, dashboards, views, permissioned controls, and workflows, but the architecture remains one PCC project context.

### Required Examples

Include practical examples:

- Operations referencing estimating/preconstruction assumptions.
- Estimating referencing active or closed projects for new pursuits.
- Warranty tracing estimate/scope/vendor/product/submittal/commitment/field/closeout records.
- Executives viewing project continuity across lifecycle stages.
- HBI answering with citations and source lineage.

## Guardrails to Include

- No duplicate source-of-record claims.
- No source-system writeback without explicit gate.
- No direct production/tenant mutation.
- No HBI answer without cited source lineage.
- No warranty conclusions without evidence.
- No cross-project leakage.
- No module-specific architecture bypassing the unified shell.

## Validation

After creating the doc:

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
```

If it fails formatting, run Prettier only on this new file.

Do not run broad formatting.


---

# 03 — Create Lifecycle Spine, Project Memory, and Role/Stage Lens Docs

## Objective

Create the core architecture documents that convert the unified PCC doctrine into implementable lifecycle, memory, and lens models.

## New Files to Create

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
```

## File 1: PCC_Project_Lifecycle_Spine.md

### Required Thesis

PCC should treat lifecycle continuity as a first-class architecture concept.

The lifecycle spine must connect:

```text
Lead / Pursuit
→ Estimating
→ Preconstruction
→ Setup / Mobilization
→ Active Construction
→ Closeout
→ Warranty
→ Archive
→ Future Reference
```

### Required Sections

1. Purpose
2. Relationship to Existing ProjectStage / ProjectStatus
3. Lifecycle Event Concept
4. Stage Transition Checkpoints
5. Lifecycle Timeline UX
6. Relationship to Project Readiness
7. Relationship to Workflow Modules
8. Relationship to Project Memory
9. Relationship to Closed-Project Knowledge Reuse
10. MVP vs Later-Phase Timing
11. Guardrails

### Required Record Concepts to Define

Define conceptual records only. Do not implement code.

- `ProjectLifecycleEvent`
- `ProjectStageTransitionCheckpoint`
- `LifecycleGateSignal`
- `LifecycleContextReference`

For each concept, state:
- owner,
- likely source,
- read/write posture,
- security class,
- relationship to current PCC models,
- phase timing.

## File 2: PCC_Project_Memory_Layer.md

### Required Thesis

Project Memory is the persistent context layer that prevents knowledge loss between departments and stages.

It must not be a second source of truth. It must summarize, index, connect, and cite source-owned and PCC-native records.

### Required Sections

1. Purpose
2. What Project Memory Solves
3. What Belongs in Project Memory
4. What Does Not Belong in Project Memory
5. Source-Owned vs PCC-Native vs PCC-Derived Memory
6. Decisions and Assumptions
7. Risks, Constraints, Obligations, Vendors, Products, and Lessons
8. Evidence Links and Source Lineage
9. HBI Grounding
10. Security Filtering
11. UX Patterns
12. MVP vs Later-Phase Timing
13. Guardrails

### Required Record Concepts to Define

Define conceptual records only. Do not implement code.

- `ProjectMemoryRecord`
- `ProjectDecisionRecord`
- `ProjectAssumptionRecord`
- `SourceLineageRecord`
- `EvidenceLinkRecord`

For each, state:
- owner,
- source,
- read/write posture,
- security class,
- phase timing,
- relationship to current PCC models.

## File 3: PCC_Role_And_Stage_Lens_Model.md

### Required Thesis

Lenses are contextual views over the same PCC project truth. They are not separate workspaces.

### Required Sections

1. Purpose
2. Lens Definition
3. Lens vs Surface
4. Lens vs Work Center
5. Lens vs Workflow Module
6. Role Lenses
7. Stage Lenses
8. Task Lenses
9. Lens Switching UX
10. Security and Permission Filtering
11. Default Lens by Role / Stage
12. Cross-Stage Historical Context
13. Guardrails

### Required Role Coverage

Include at minimum:

- Estimating Coordinator
- Lead Estimator
- Estimator
- Director of Preconstruction
- Marketing / Pursuits
- IDS
- Project Executive
- Project Manager
- Superintendent
- Project Accountant
- QAQC / Safety
- Warranty
- Executive Oversight
- IT / PCC Admin

For each role, include:
- primary lens,
- active work,
- historical context,
- restricted content,
- cross-stage use case.

## Validation

Run Prettier check only on the new files:

```bash
pnpm exec prettier --check \
  docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md
```

If formatting fails, run Prettier only on those files.


---

# 04 — Create Traceability, Knowledge Reuse, Warranty, Search, and HBI Grounding Docs

## Objective

Create the architecture documents that define cross-stage traceability, closed-project knowledge reuse, warranty traceability, and unified search/HBI grounding.

## New Files to Create

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
```

## File 1: PCC_Cross_Stage_Traceability_Model.md

### Required Thesis

PCC must eventually model relationships across estimate, scope, vendor, commitment, submittal, product, field execution, closeout, warranty, and lessons learned records.

Traceability records should connect records without taking ownership away from source systems.

### Required Relationship Examples

Include at minimum:

- estimate line item → scope package
- scope package → bid package
- bid package → subcontractor/vendor
- commitment → scope package
- submittal → approved product/material
- approved product/material → vendor/subcontractor
- RFI/ASI/CCD/change event → scope/commitment/schedule impact
- inspection/punch item → responsible scope/vendor
- closeout document → product/vendor/system
- warranty claim → approved product/vendor/commitment/closeout evidence
- lesson learned → future estimating reference

### Required Record Concepts

Define conceptual records only:

- `ProjectTraceabilityEdge`
- `TraceabilityRelationshipType`
- `TraceabilityConfidence`
- `TraceabilityEvidenceReference`

## File 2: PCC_Company_Knowledge_Reuse_Model.md

### Required Thesis

Closed and active projects should become governed company knowledge assets for future pursuits, estimating, operations, warranty, and executive learning.

### Required Sections

1. Purpose
2. Knowledge Reuse Use Cases
3. Comparable Project References
4. Estimating Historical References
5. Lessons Learned Feedback Loop
6. Subcontractor/Vendor Performance Feedback
7. Warranty Claim Pattern Feedback
8. Cross-Project Security Filtering
9. Closed-Project Reference Mode
10. MVP vs Later-Phase Timing
11. Guardrails

### Required Record Concepts

Define conceptual records only:

- `ProjectKnowledgeReference`
- `CrossProjectReference`
- `LessonLearnedReference`
- `ComparableProjectReference`

## File 3: PCC_Warranty_Traceability_Model.md

### Required Thesis

Warranty should be able to trace claims and obligations back to source evidence across estimate, scope, vendor, product, commitment, submittal, closeout, and field execution records.

### Required Sections

1. Purpose
2. Warranty Trace Mode
3. Obligation Traceability
4. Vendor/Subcontractor Traceability
5. Product/Material Traceability
6. Approved Submittal Traceability
7. Closeout Document Traceability
8. Field Execution / Inspection / Punch Traceability
9. Evidence Requirements
10. HBI Limitations
11. Security and Privacy
12. Guardrails

### Required Record Concepts

Define conceptual records only:

- `ObligationTraceRecord`
- `VendorProductTraceRecord`
- `WarrantyTraceRecord`
- `EstimateReferenceRecord`
- `CloseoutEvidenceReference`

## File 4: PCC_Unified_Search_And_HBI_Grounding_Model.md

### Required Thesis

PCC search and HBI must retrieve across lifecycle stages while respecting permissions, source-of-record boundaries, source lineage, and evidence requirements.

HBI may summarize and reason over grounded records, but it must not become the source of truth.

### Required Sections

1. Purpose
2. Unified Project Search
3. Cross-Project Search
4. HBI Grounding Requirements
5. Required Source Citations
6. Permission Filtering
7. Sensitive Content Handling
8. Refusal / Insufficient Evidence Behavior
9. Search Facets
10. Future Knowledge Graph Readiness
11. Guardrails

### Required User Questions to Support Eventually

Include these examples:

- What did estimating assume for this scope?
- Who installed this product?
- Which submittal approved this material?
- Was this warranty issue tied to a subcontractor scope?
- Have we done this detail before?
- What similar projects had this issue?
- Which lesson learned should apply to this pursuit?

## Validation

Run Prettier check only on the new files:

```bash
pnpm exec prettier --check \
  docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md \
  docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
```

If formatting fails, run Prettier only on those files.


---

# 05 — Align Existing PCC Documentation to Unified Lifecycle Doctrine

## Objective

Amend existing PCC architecture docs so the new unified lifecycle doctrine becomes visible and enforceable across the current documentation set.

Do not rewrite entire documents. Make targeted, surgical updates.

## Existing Docs to Update

At minimum, inspect and update these files where appropriate:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

Also inspect Phase 3 wave docs for Waves 8–13 and update only where the new doctrine must be referenced to avoid architectural drift:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/
```

## Required Alignment Updates

### 1. Add Doctrine References

Add cross-references to the new docs created in Prompts 02–04.

Primary reference:

```text
Unified_PCC_Lifecycle_Objective_Architecture.md
```

Supporting references:

```text
PCC_Project_Lifecycle_Spine.md
PCC_Project_Memory_Layer.md
PCC_Role_And_Stage_Lens_Model.md
PCC_Cross_Stage_Traceability_Model.md
PCC_Company_Knowledge_Reuse_Model.md
PCC_Warranty_Traceability_Model.md
PCC_Unified_Search_And_HBI_Grounding_Model.md
```

### 2. Refresh Stale Status Language

The audit found stale status posture in the target blueprint, where it still referenced Phase 3 Wave 2 as active/current even though later wave artifacts and commits exist.

Update status language carefully so the doc does not overstate or misstate current implementation. Prefer wording such as:

```text
Phase status is tracked in the Phase 3 roadmap and wave closeout artifacts. This blueprint governs the target architecture and must be read together with the latest phase/wave documentation.
```

Do not claim that runtime implementation is complete unless repo truth proves it.

### 3. Clarify Surfaces / Work Centers / Modules / Lenses

Ensure the docs define:

- Surfaces = shell-level navigable destinations.
- Work centers = governed capability domains.
- Workflow modules = structured control patterns.
- Lenses = role/stage/task-contextual views over the same project truth.

Make clear that none of these are departmental workspaces.

### 4. Clarify Project Readiness Aggregation

The audit found ambiguity where Project Readiness aggregates some workflow modules while Constraints Log and Buyout Log are also readiness source modules or readiness-affiliated controls.

Add doctrine language that:

- some modules have a primary governance location;
- some modules provide readiness signals;
- some modules have secondary surface affinity;
- readiness signals may roll into Project Readiness without moving source ownership.

### 5. Clarify Constraints Log and Buyout Log Posture

Add language to relevant docs/registers explaining:

- Constraints Log may be governed under risk/issues/decision affinity while contributing Project Readiness signals.
- Buyout Log may be governed under procurement/buyout affinity while contributing Project Readiness and startup/make-ready signals.
- This is not duplication; it is a source-lineage and signal-rollup pattern.

### 6. Strengthen Preconstruction Continuity

Add targeted references stating that:

- estimating assumptions, exclusions, inclusions, alternates, scope intent, pursuit context, pricing rationale, and handoff notes must remain accessible to authorized operations users;
- operations outcomes, cost/schedule variance, vendor performance, closeout issues, warranty issues, and lessons learned must become governed reference context for authorized future estimating/pursuit users.

### 7. Strengthen Warranty Traceability

Add targeted references stating that warranty workflows must be able to trace from a claim or issue back to:

- scope,
- estimate reference,
- vendor/subcontractor,
- commitment,
- submittal/product,
- inspection/punch/field evidence,
- closeout record,
- warranty obligation,
- lessons learned.

### 8. Strengthen HBI Grounding Guardrails

Add targeted references stating:

- HBI is not a source of truth.
- HBI answers must be grounded in source lineage and evidence links.
- HBI must refuse or qualify answers where evidence is insufficient.
- HBI must respect role, stage, and cross-project permission filtering.

## Do Not

- Do not introduce new runtime routes.
- Do not introduce new TypeScript models.
- Do not edit package files.
- Do not reformat entire folders.
- Do not update generated artifacts unless required and explicitly justified.
- Do not move docs.
- Do not delete existing wave docs.

## Validation

Run Prettier check only on files you created or modified.

Also run:

```bash
git diff --check
git status --short
md5 pnpm-lock.yaml
```

Confirm:
- no runtime files changed;
- no package files changed;
- `pnpm-lock.yaml` MD5 unchanged;
- Markdown formatting is valid for touched docs.


---

# 06 — Validation and Documentation Closeout Prompt

## Objective

Validate the documentation-only update package, create a closeout artifact, and prepare a commit summary. Do not commit unless instructed by the user.

## Required Validation Commands

From `/Users/bobbyfetting/hb-intel`, run:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
```

Run Prettier check on all created/modified Markdown files only. Do not run broad formatting unless the repo standard explicitly requires it and the user authorizes it.

Example pattern:

```bash
pnpm exec prettier --check <touched-doc-1> <touched-doc-2> ...
```

If any touched doc fails, run:

```bash
pnpm exec prettier --write <failing-docs-only>
pnpm exec prettier --check <same-docs>
```

Then rerun:

```bash
git diff --check
git status --short
md5 pnpm-lock.yaml
```

## Required Closeout File

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Unified_Lifecycle_Documentation_Update_Closeout.md
```

## Required Closeout Sections

1. Objective
2. Scope
3. Baseline Repo State
4. Documents Created
5. Documents Modified
6. Architecture Decisions Captured
7. Guardrails Added
8. Source-of-Record Alignment
9. Runtime / Model / Backend / SPFx Non-Change Statement
10. Validation Commands and Results
11. Lockfile MD5 Before / After
12. Remaining Gaps
13. Recommended Next Documentation Package
14. Recommended Future Implementation Sequence
15. Commit Recommendation

## Required Remaining Gaps to Include

Unless your repo-truth inspection proves these were fully resolved elsewhere, include these as remaining or future-phase gaps:

- First-class TypeScript model contracts for lifecycle events, memory records, lenses, traceability, knowledge references, and warranty trace records are not implemented by this documentation-only package.
- Runtime PCC UI does not yet include project memory panels, lifecycle timelines, traceability views, warranty trace mode, closed-project reference mode, or unified HBI search.
- Backend read models do not yet expose lifecycle/memory/traceability/search endpoints.
- Constraints Log and Buyout Log implementation seams may still require later alignment between primary governance location, Project Readiness rollups, and surface affinity.
- Cross-project knowledge reuse requires additional security, retention, and permission modeling before implementation.
- Warranty traceability requires evidence requirements and source-system integrations before it can support production claims analysis.
- HBI grounding requires retrieval, citation, permission filtering, refusal, and audit rules before user-facing deployment.

## Commit Summary Draft

Prepare but do not run commit unless user instructs.

Recommended commit summary:

```text
docs(pcc): define unified lifecycle architecture
```

Recommended commit body:

```text
Defines the PCC unified lifecycle architecture as a documentation-only update.

- Adds governing doctrine for PCC as one project operating layer, not departmental workspaces.
- Adds lifecycle spine, project memory, role/stage lens, traceability, knowledge reuse, warranty traceability, and HBI grounding architecture docs.
- Aligns existing PCC architecture docs and Phase 3 registers to reference the unified lifecycle doctrine.
- Clarifies surfaces vs work centers vs workflow modules vs lenses.
- Clarifies readiness signal rollups for Constraints Log and Buyout Log without changing source ownership.
- Adds guardrails for source-of-record boundaries, HBI grounding, cross-project security, and warranty evidence.
- Adds documentation closeout with validation results.

No runtime source, model, backend, SPFx, package, dependency, or lockfile changes.
```

## Final Response to User

Return:

- concise summary of work completed;
- list of files created;
- list of files modified;
- validation results;
- lockfile MD5 before/after;
- any remaining gaps;
- commit recommendation.


---

# Repo Audit Findings Summary

This file summarizes the audit findings that the local code agent must preserve when making documentation updates.

## Core Finding

PCC is already directionally defined as a unified project operating layer, but the architecture documentation needs stronger doctrine to prevent future drift into department-specific workspaces or siloed module apps.

## Findings to Preserve

1. PCC should be one unified project shell.
2. Work centers should organize governed capabilities, not create departmental apps.
3. Workflow modules should be structured task/control patterns within PCC.
4. Role, stage, and task lenses should change user context without forking the project experience.
5. Source-of-record boundaries are strong and must be preserved.
6. Source lineage and evidence links are foundational.
7. Project lifecycle stages and readiness gates exist, but a first-class lifecycle spine should be documented.
8. Project memory, decision lineage, assumption lineage, and company knowledge reuse are not yet explicit enough.
9. Cross-stage traceability is not yet first-class but is required for warranty, estimating feedback, and lessons learned.
10. Closed-project knowledge reuse must be governed, permissioned, and searchable in later phases.
11. HBI must be grounded in evidence and must not become a source of truth.
12. Constraints Log and Buyout Log need clarified doctrine for primary governance vs Project Readiness signal rollup.
13. The target architecture blueprint contains stale phase-status posture and should defer status truth to roadmap/closeout docs.
14. Preconstruction continuity should preserve estimating assumptions, exclusions, inclusions, pricing rationale, bid strategy, and handoff context for operations.
15. Operations, closeout, warranty, and lessons learned should feed authorized future estimating and pursuit reference workflows.

## Patterns to Preserve

- One governed PCC shell.
- Project-first navigation and identity.
- Strict system-of-record boundaries.
- Source lineage and evidence-link discipline.
- Backend-mediated integrations.
- Launch-before-sync posture for external systems.
- No direct SPFx-to-Procore.
- No uncontrolled SharePoint edit dependency.
- Work center / surface / workflow module separation.
- ProjectStage and ProjectStatus separation.
- Anti-fork template rule.

## Patterns to Revise

- Make role/stage lenses first-class architecture.
- Make lifecycle spine first-class architecture.
- Make project memory first-class architecture.
- Define cross-stage traceability.
- Define closed-project knowledge reuse.
- Define warranty traceability.
- Define unified search and HBI grounding.
- Refresh stale blueprint status language.
- Clarify Project Readiness signal rollups for modules governed elsewhere.

## Do Not Change in This Package

- Runtime code.
- Model code.
- SPFx components.
- Backend routes.
- Fixtures.
- Package manifests.
- Lockfile.
- Tests, except running validation.


---

# Document Update Target Map

## New Governing Docs

Create these under:

```text
docs/architecture/blueprint/sp-project-control-center/
```

1. `Unified_PCC_Lifecycle_Objective_Architecture.md`
2. `PCC_Project_Lifecycle_Spine.md`
3. `PCC_Project_Memory_Layer.md`
4. `PCC_Role_And_Stage_Lens_Model.md`
5. `PCC_Cross_Stage_Traceability_Model.md`
6. `PCC_Company_Knowledge_Reuse_Model.md`
7. `PCC_Warranty_Traceability_Model.md`
8. `PCC_Unified_Search_And_HBI_Grounding_Model.md`

## New Closeout Doc

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Unified_Lifecycle_Documentation_Update_Closeout.md
```

## Existing Docs to Amend

At minimum:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/02_PCC_SPFx_Shell_Design_Spec.md
docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Wave Docs to Inspect for Targeted Cross-References

Inspect and update only if needed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/
```

## Local Code/Model Seams to Inspect Only

Do not edit:

```text
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccWorkCenters.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/LifecycleReadiness.ts
packages/models/src/pcc/ConstraintsLog.ts
apps/project-control-center/src/shell/
apps/project-control-center/src/api/
backend/functions/src/hosts/pcc-read-model/
```

## Alignment Themes

Every amended doc should support these themes:

- PCC is one unified project operating layer.
- Work centers are governed domains, not departmental apps.
- Workflow modules are control patterns, not separate workspaces.
- Lenses are role/stage/task views over the same project truth.
- Project memory and lifecycle continuity prevent institutional knowledge loss.
- Traceability connects estimate/scope/vendor/product/commitment/submittal/field/closeout/warranty/lessons.
- HBI answers require source evidence.
- Closed-project knowledge reuse must be governed and permission filtered.


---

# Local Validation Commands

Run from:

```text
/Users/bobbyfetting/hb-intel
```

## Baseline

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## During Work

After creating or modifying docs:

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

Run Prettier check only on touched Markdown files:

```bash
pnpm exec prettier --check <touched-markdown-files>
```

If needed, write only touched/failing Markdown files:

```bash
pnpm exec prettier --write <failing-markdown-files>
pnpm exec prettier --check <same-markdown-files>
```

## Final

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

Confirm:

- No runtime source files changed.
- No TypeScript model files changed.
- No SPFx app source files changed.
- No backend files changed.
- No package manifests changed.
- `pnpm-lock.yaml` MD5 unchanged from baseline.
- All touched Markdown files pass Prettier.
