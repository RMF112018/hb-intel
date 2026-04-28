# Prompt 01 — Phase 1 Step 2 Enum and Validation Rule Extraction

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
```

Populate the `enums` and `validation-rules` schema families in the `@hbc/project-site-template` package.

This step extracts the fixed enum sets and the initial Validation Rule Table from the governing Project Control Center architecture documents and Phase 0 / Phase 1 planning deliverables.

This step must **not** perform full object-family extraction.

---

## Current State

Phase 1 Step 1 created the scaffold package:

```text
packages/project-site-template/
```

The scaffold includes:

```text
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md
```

Phase 1 Step 1 did **not** perform full schema extraction. It only created schema skeletons.

---

## Required Source Files

Use these files as source-of-truth inputs:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md
```

Primary authority for implementation truth:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Use the blueprint for strategic alignment and terminology only.

Do not re-read files that are still within your current context or memory unless exact section anchors, exact enum values, exact rule wording, or exact file paths must be verified.

---

## Allowed File Changes

You may modify:

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

You may modify this file only if needed to keep high-level references honest:

```text
packages/project-site-template/schemas/template-contract.schema.json
```

Do not modify the other 12 family skeleton files in this prompt unless a narrow status-reference correction is required and documented. If broad changes to all family skeletons appear necessary, stop and use Prompt 02.

Do not modify backend, SPFx, provisioning, manifests, generated files, CI, tests, root workspace files, package dependency declarations, package scripts, or unrelated documentation.

Do not add dependencies. Do not run build, lint, test, typecheck, package, deploy, provisioning, or CI commands.

---

## Critical Status-Naming Check

Before populating schemas, verify whether the scaffold's current `mvp_status` enum values align with the Phase 0 taxonomy.

Phase 0 established the Decision Closure status values:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

If current skeleton files use temporary values such as:

```text
mvp
deferred
placeholder
```

do **not** treat those temporary scaffold labels as architecture truth.

Preferred Phase 1 Step 2 outcome:

- `enums.schema.json` defines the canonical Decision Closure status enum as:
  - `Frozen for MVP`
  - `Runtime Configuration`
  - `Deferred`
  - `Proof-Gated`
- `validation-rules.schema.json` references the canonical status taxonomy.
- any scaffold-local shorthand is explicitly marked as temporary if left untouched.

If a narrow update to `enums.schema.json`, `validation-rules.schema.json`, and `template-contract.json` is sufficient, perform it and document it.

If this mismatch requires broad edits across all 14 family skeletons, stop and use Prompt 02 before making broad changes.

---

## Required Enum Extraction

Populate `packages/project-site-template/schemas/families/enums.schema.json` with a real schema for the enum family.

It must define, at minimum, these enum sets:

### ProjectType

Allowed values:

```text
commercial
multifamily
municipal
luxury_residential
environmental
```

Forbidden active values:

```text
preconstruction_only
warranty_closeout
active_construction
```

`active_construction` is forbidden only as ProjectType. It is valid as ProjectStage.

### ProjectStage

Allowed values:

```text
lead
estimating
preconstruction
active_construction
closeout
warranty
```

Forbidden active values:

```text
Archived
```

`Archived` is forbidden only as ProjectStage. It is valid as ProjectStatus.

### ProjectStatus

Allowed values:

```text
Active
On Hold
Closed
Archived
```

### Decision Closure Status / MVP Treatment

Canonical allowed values:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

If the package keeps a technical field named `mvp_status`, make it explicitly reference these canonical values or document a mapping with no architecture ambiguity.

### Site Health Severity

Allowed values:

```text
Info
Warning
Blocking
Repair Required
Security Risk
```

### Repair Automation Tier

Allowed values:

```text
T1 Auto
T2 Approval
T3 IT Security
T4 Manual Only
```

### Enforcement Layer

Allowed values:

```text
Schema
Provisioning
Backend
SPFx
Site Health
Governance
Documentation
Cross-Layer
```

### Validation Rule Category

Allowed values:

```text
Enum Binding
Conditional Visibility
Stage / Status Behavior
Runtime Configuration
Permission / Ownership
Procore Boundary
System of Record
No Secret
No Native SharePoint Admin
Referential Integrity
Site Health / Drift / Repair
Provisioning Validation
MVP / Deferred Scope
```

### Placeholder Enum Definitions

Add placeholder enum definitions only if traceable to Phase 0 Step 2 taxonomy.

Do not invent values. If values are not fully defined, use a placeholder structure with:

```json
{
  "status": "placeholder",
  "values": [],
  "source": "...",
  "phase1Step": "later extraction"
}
```

---

## Required Validation Rule Extraction

Populate `packages/project-site-template/schemas/families/validation-rules.schema.json` with:

1. The rule table schema structure.
2. The 13 rule categories.
3. The 8 enforcement layers.
4. The initial 30 rules (`VR-01` through `VR-30`) from Phase 0 Step 2 Validation Rule Table Plan.
5. Source traceability for every rule.
6. A `blocksGenerationIfMissing` field.
7. `mvpTreatment` using the canonical Decision Closure status taxonomy where applicable.
8. Notes for cross-layer rules clarifying that JSON Schema alone does not enforce runtime behavior.

The initial rule inventory must include at least:

- ProjectType enum allowed values.
- ProjectStage enum allowed values.
- ProjectStatus enum allowed values.
- Archive is ProjectStatus, not ProjectStage.
- `active_construction` is ProjectStage, not ProjectType.
- Deprecated ProjectType values are forbidden as active values.
- Module visibility is keyed on ProjectStage.
- Vertical seeding is keyed on ProjectType.
- Archive/read-only behavior is keyed on ProjectStatus.
- `ProcoreCompanyId = 5280` is configuration, not secret.
- Procore mapping owner is Project Manager with Project Executive fallback.
- Project Accountant is not Procore mapping owner.
- SPFx must not call Procore directly.
- Procore secrets must not appear in schema, SharePoint, SPFx, markdown, repo source, or client config.
- Sage Intacct is accounting book of record.
- Procore financial data is operational / project-management state.
- Procore directory comparison does not grant SharePoint access.
- Normal users do not use native SharePoint admin/edit screens.
- External users deferred from MVP.
- HBI Assistant deferred from MVP.
- Procore write-back deferred from MVP.
- Site Health severity values.
- Repair tiers T1–T4.
- Decision Closure Register statuses.
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only.
- SharePoint is not a full Procore mirror.
- Procore canonical model remains out of Phase 1.
- No new architecture decisions inside schema output.
- True undecided architecture points return to Phase 0 review.

Use the `VR-01` through `VR-30` IDs from Phase 0 Step 2 unless repo truth proves a correction is required.

Do not add new rule IDs beyond `VR-30` unless a rule is explicitly required by a source document and missing from the Step 2 plan. If adding a rule beyond `VR-30`, document why.

---

## Required JSON Shape Guidance

You may choose the exact JSON Schema structure, but it must support:

- family identity;
- enum definitions;
- enum allowed values;
- forbidden values;
- source references;
- validation rule records;
- enforcement layers;
- MVP treatment / Decision Closure status;
- cross-layer notes;
- generation-blocking flags.

Use JSON Schema Draft 2020-12.

All JSON must be valid and formatted consistently. No comments in JSON.

---

## Required Root Contract Update

Update `packages/project-site-template/template-contract.json` to mark:

```text
enums
validation-rules
```

as populated through Phase 1 Step 2.

Do not mark the other 12 families as populated.

The root contract status must still indicate:

```text
fullExtractionComplete: false
```

Include a clear status such as:

```text
phase: "Phase 1 Step 2 enum and validation-rule extraction"
```

Do not imply Phase 1 is complete.

---

## Required Documentation

Create:

```text
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
```

Required sections:

```markdown
# Phase 1 Step 2 — Enum and Validation Rule Extraction Notes

## Summary
## Files Modified
## Source Inputs
## Enums Extracted
## Validation Rules Extracted
## Status Naming Reconciliation
## Cross-Layer Enforcement Notes
## What Was Not Extracted
## Guardrails Preserved
## Validation Performed
## Recommended Next Step
```

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 2 — Enum and Validation Rule Extraction Closeout

## Summary
## Files Modified
## Enum Extraction Summary
## Validation Rule Extraction Summary
## Status Naming Decision
## Boundary Validation
## Anti-Regression Validation
## Remaining Risks
## Phase 1 Step 3 Readiness Decision
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

Readiness decision values:

```text
Ready for Phase 1 Step 3
Ready for Phase 1 Step 3 with Notes
Not Ready for Phase 1 Step 3
```

Recommended next prompt:

```text
Phase 1 Step 3 — Object Family Field Consolidation
```

---

## Required Guardrails

Preserve all of the following:

- no new architecture decisions;
- no full schema extraction beyond `enums` and `validation-rules`;
- no direct SPFx-to-Procore calls;
- no Procore secrets;
- ProcoreCompanyId = 5280 as configuration, not secret;
- Procore Object Link Records and Procore Curated Summary Records remain placeholder / future-reference only;
- no full Procore canonical model;
- no full Procore mirror;
- Sage Intacct remains accounting book of record;
- external users remain deferred from MVP;
- HBI Assistant remains deferred from MVP;
- Procore write-back remains deferred from MVP;
- deprecated ProjectType values are forbidden only and not valid:
  - `preconstruction_only`
  - `warranty_closeout`
  - `active_construction` as ProjectType;
- `Archived` remains ProjectStatus only, not ProjectStage;
- `active_construction` remains ProjectStage only, not ProjectType;
- validation rules distinguish schema-enforceable, backend-enforced, SPFx-enforced, provisioning-enforced, Site Health, governance, documentation, and cross-layer rules.

---

## Required Validation

After edits, verify:

1. `enums.schema.json` is valid JSON.
2. `validation-rules.schema.json` is valid JSON.
3. `template-contract.json` is valid JSON.
4. ProjectType values are exact.
5. ProjectStage values are exact.
6. ProjectStatus values are exact.
7. Decision Closure status values are exact.
8. Site Health severity values are exact.
9. Repair tier values are exact.
10. Enforcement Layer values are exact.
11. Validation Rule Category values are exact.
12. `VR-01` through `VR-30` exist.
13. Cross-layer rules are not classified as Schema-only.
14. No full object-family extraction occurred.
15. No other 12 family schemas were populated.
16. No backend files changed.
17. No SPFx files changed.
18. No provisioning files changed.
19. No manifests changed.
20. No tests changed.
21. No generated files changed.
22. No CI files changed.
23. No dependencies were added.
24. No package scripts were added.
25. No secrets were introduced.
26. Deprecated enum tokens appear only in forbidden-value / anti-regression contexts, never as valid values.

Do not run build/test/lint/typecheck/package/deploy commands.

---

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Modified
### Files Created
### Enums Extracted
### Validation Rules Extracted
### Status Naming Reconciliation
### Guardrails Preserved
### Validation Performed
### What Was Not Extracted
### Remaining Risks
### Recommended Next Step
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): extract enums and validation rules
```
