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
