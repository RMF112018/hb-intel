# Prompt 01 — Phase 1 Step 3 Object Family Field Consolidation

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 1 Step 3 — Object Family Field Consolidation
```

Consolidate the object-family field maps required to populate the remaining Project Site Template schema families in Phase 1 Step 4.

This step translates the Standard Project Site Template Contract and Phase 0 / Phase 1 planning artifacts into structured field-consolidation artifacts. It must define which fields belong to each schema family, how those fields trace back to the contract, which fields are required/optional/deferred/proof-gated, and which validation rules apply.

This step must **not** populate the remaining 12 family schemas yet.

---

## Current State

Phase 1 Step 1 created the `@hbc/project-site-template` scaffold.

Phase 1 Step 2 populated only:

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

The Phase 1 Step 2 closeout confirmed:

- 8 canonical enum sets extracted.
- 30 validation rules (`VR-01` through `VR-30`) extracted.
- only `enums` and `validation-rules` are marked populated.
- the other 12 family skeletons remain skeleton-only.
- the 12 remaining skeletons retain temporary `mvp_status` shorthand that must be reconciled when each family is populated.
- no backend, SPFx, provisioning, manifest, test, generated, CI, root-workspace, dependency, or script changes were made.
- Phase 1 Step 3 is ready.

---

## Required Source Files

Use these files as source-of-truth inputs:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Architecture_Stabilization_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Consistency_Check_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_1_Schema_Extraction_Readiness_Backlog.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Extraction_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Object_Catalog_Disposition.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Schema_Family_Taxonomy.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Validation_Rule_Table_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Closeout_Report.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Scaffold_Closeout.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
```

Primary authority for field truth:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Use the blueprint for strategic alignment only.

Do not re-read files that are still within your current context or memory unless exact section anchors, exact table rows, exact field names, or exact validation-rule mappings must be verified.

---

## Allowed File Changes

You may create or modify only:

```text
packages/project-site-template/fields/
packages/project-site-template/fields/README.md
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/families/
packages/project-site-template/fields/families/template-manifest.fields.json
packages/project-site-template/fields/families/settings.fields.json
packages/project-site-template/fields/families/permissions.fields.json
packages/project-site-template/fields/families/site.fields.json
packages/project-site-template/fields/families/pages.fields.json
packages/project-site-template/fields/families/libraries.fields.json
packages/project-site-template/fields/families/lists.fields.json
packages/project-site-template/fields/families/modules.fields.json
packages/project-site-template/fields/families/workflows.fields.json
packages/project-site-template/fields/families/integrations.fields.json
packages/project-site-template/fields/families/site-health.fields.json
packages/project-site-template/fields/families/provisioning-validation.fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/docs/Phase_1_Step_3_Object_Family_Field_Consolidation_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
```

You may update `template-contract.json` only to record Phase 1 Step 3 status and point to the field-consolidation artifacts. Do **not** mark the 12 family schemas as populated.

You may update `README.md` only to add a brief Phase 1 Step 3 status line and field-map reference.

Do not modify:

- the 12 remaining family schema skeleton files;
- `enums.schema.json`;
- `validation-rules.schema.json`;
- `template-contract.schema.json`, unless strictly required to reference field maps and documented;
- backend files;
- SPFx files;
- provisioning files;
- manifests;
- generated files;
- CI files;
- tests;
- root workspace files;
- package dependency declarations;
- package scripts;
- unrelated documentation.

Do not add dependencies. Do not run build, lint, test, typecheck, package, deploy, provisioning, or CI commands.

---

## Required Field Families

Consolidate field maps for the 12 remaining schema families:

```text
template-manifest
settings
permissions
site
pages
libraries
lists
modules
workflows
integrations
site-health
provisioning-validation
```

Do not create new field maps for `enums` or `validation-rules` except references from dependency maps. Those two families were populated in Step 2.

---

## Required Common Field Map

Create:

```text
packages/project-site-template/fields/common-fields.json
```

It must define common fields used across families, including at minimum:

```text
id
kind
mvp_status
sourceContractSection
sourceCatalogId
sourceBlueprintSection
sourceDecisionRef
validationRuleRefs
ownerCategory
notes
```

Each common field record must include:

```json
{
  "fieldName": "",
  "fieldType": "",
  "requiredByDefault": false,
  "canonicalStatus": "",
  "source": "",
  "validationRuleRefs": [],
  "description": "",
  "notes": ""
}
```

`mvp_status` must reference the canonical Decision Closure status enum from Phase 1 Step 2:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

Do not preserve temporary scaffold shorthand as canonical.

---

## Required Family Field Map Shape

Each family `.fields.json` file must include:

```json
{
  "family": "",
  "phase": "Phase 1 Step 3 field consolidation",
  "source": {
    "contract": "",
    "phase0ObjectDisposition": "",
    "phase1Enums": "",
    "phase1ValidationRules": ""
  },
  "status": {
    "fieldConsolidationComplete": true,
    "schemaPopulationComplete": false,
    "containsNewArchitectureDecisions": false
  },
  "commonFields": [],
  "familyFields": [],
  "deferredFields": [],
  "proofGatedFields": [],
  "runtimeConfigurationFields": [],
  "validationRuleRefs": [],
  "dependencies": [],
  "notes": ""
}
```

Each `familyFields` item must include:

```json
{
  "fieldName": "",
  "fieldType": "",
  "required": false,
  "mvpStatus": "",
  "sourceContractSection": "",
  "sourceCatalogId": "",
  "sourceDecisionRef": "",
  "validationRuleRefs": [],
  "description": "",
  "notes": ""
}
```

Allowed `fieldType` values should use JSON Schema-compatible labels:

```text
string
number
integer
boolean
array
object
enum
date
datetime
url
person
lookup
guid
unknown
```

Use `unknown` only when the contract clearly requires the field concept but does not define the concrete type. Record the gap in notes and in the closeout.

---

## Required Object Catalog Field Disposition

Create:

```text
packages/project-site-template/fields/object-catalog-field-disposition.json
```

It must consolidate all 18 Contract §4A Object Catalog rows and map each row to:

- schema family;
- field map file;
- extraction treatment;
- MVP treatment;
- required field consolidation state;
- validation rule refs;
- Step 4 readiness;
- notes.

Required extraction treatment values:

```text
consolidated-for-step-4
placeholder-only
deferred
runtime-configuration-reference
proof-gated-reference
needs-architecture-review
```

Rows 17 and 18 — Procore Object Link Records and Procore Curated Summary Records — must remain placeholder / future-reference only. They must not become full Procore canonical models.

---

## Required Family Dependencies

Create:

```text
packages/project-site-template/fields/family-field-dependencies.json
```

It must describe dependencies between field families, including at minimum:

- settings before integrations;
- permissions before site / modules / workflows;
- site before pages / libraries / lists / modules;
- lists and libraries before workflows;
- modules before provisioning-validation;
- site-health depends on all provisioned object families;
- integrations depends on settings and site;
- validation-rules and enums already populated and referenced by all families.

Do not invent runtime dependency behavior. This is a field-consolidation dependency map only.

---

## Required Documentation

Create:

```text
packages/project-site-template/fields/README.md
```

Required sections:

```markdown
# Project Site Template Field Consolidation

## Purpose
## Phase 1 Step 3 Scope
## Source of Truth
## Field Map Files
## Common Fields
## Family Field Maps
## Object Catalog Field Disposition
## Family Dependencies
## What This Enables
## What This Does Not Do
## Guardrails
## Recommended Next Step
```

Create:

```text
packages/project-site-template/docs/Phase_1_Step_3_Object_Family_Field_Consolidation_Notes.md
```

Required sections:

```markdown
# Phase 1 Step 3 — Object Family Field Consolidation Notes

## Summary
## Files Created
## Files Modified
## Source Inputs
## Field Families Consolidated
## Common Field Map
## Object Catalog Field Disposition
## Family Dependency Map
## Status Shorthand Reconciliation Plan
## What Was Not Populated
## Guardrails Preserved
## Validation Performed
## Recommended Next Step
```

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 3 — Object Family Field Consolidation Closeout

## Summary
## Files Created
## Files Modified
## Field Family Consolidation Summary
## Object Catalog Disposition Summary
## Status Naming / mvp_status Summary
## Dependency Summary
## Boundary Validation
## Anti-Regression Validation
## Remaining Risks
## Phase 1 Step 4 Readiness Decision
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

Readiness decision values:

```text
Ready for Phase 1 Step 4
Ready for Phase 1 Step 4 with Notes
Not Ready for Phase 1 Step 4
```

Recommended next prompt:

```text
Phase 1 Step 4 — Per-Family Schema Population
```

---

## Required Guardrails

Preserve all of the following:

- no new architecture decisions;
- no full schema population of remaining families;
- no backend implementation;
- no SPFx implementation;
- no provisioning implementation;
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
- validation rules distinguish Schema, Provisioning, Backend, SPFx, Site Health, Governance, Documentation, and Cross-Layer enforcement.

---

## Required Validation

After edits, verify:

1. All `.json` files created or modified are valid JSON.
2. `common-fields.json` exists and includes the required common fields.
3. All 12 required family `.fields.json` files exist.
4. Object catalog disposition includes all 18 Contract §4A rows.
5. Rows 17 and 18 remain placeholder / future-reference only.
6. Family dependency map exists and includes required dependencies.
7. No remaining 12 family schema skeleton files were populated.
8. `enums.schema.json` was not modified.
9. `validation-rules.schema.json` was not modified.
10. `template-contract.json` does not mark the 12 families as populated.
11. `fullExtractionComplete` remains false.
12. No backend files changed.
13. No SPFx files changed.
14. No provisioning files changed.
15. No manifests changed.
16. No tests changed.
17. No generated files changed.
18. No CI files changed.
19. No root workspace files changed.
20. No dependencies were added.
21. No package scripts were added.
22. No secrets were introduced.
23. Deprecated enum tokens appear only in forbidden-value / anti-regression contexts, never as valid values.
24. Any unknown field types are explicitly documented and do not block Step 4 unless they require architecture decisions.

Do not run build/test/lint/typecheck/package/deploy commands.

---

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Field Families Consolidated
### Object Catalog Disposition Result
### Status Naming / mvp_status Result
### Guardrails Preserved
### Validation Performed
### What Was Not Populated
### Remaining Risks
### Recommended Next Step
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): consolidate object family fields
```

Suggested commit description:

```text
Add Phase 1 Step 3 field-consolidation artifacts for the Project Site Template contract.

Creates common field definitions, 12 family field maps, object catalog field disposition, family dependency mapping, package field-map README, Step 3 notes, and Step 3 closeout documentation. Keeps enums and validation-rules as the only populated schema families and prepares the remaining families for Phase 1 Step 4 schema population.

Field-consolidation only: no remaining family schema population, backend, SPFx, provisioning, Procore integration, CI, generated files, dependencies, scripts, or deployment artifacts.
```
