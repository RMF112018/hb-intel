# Prompt 01 — Phase 1 Step 4 Execution Strategy

You are working in the GitHub repository:

```text
RMF112018/hb-intel
```

## Objective

Execute:

```text
Phase 1 Step 4 — Per-Family Schema Population
```

Populate the 12 remaining Project Site Template family schemas using the Phase 1 Step 3 field-consolidation artifacts.

This is a **schema population step only**. It converts field maps into JSON Schema definitions. It does not implement runtime behavior.

---

## Current State

Phase 1 Step 1 created the package scaffold.

Phase 1 Step 2 populated:

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
```

Phase 1 Step 3 created field maps for the remaining 12 families and confirmed:

- all 12 family field maps exist;
- all 18 Contract §4A Object Catalog rows are dispositioned;
- OC-17 and OC-18 remain placeholder-only / Deferred;
- the 12 family schema skeletons remain unpopulated;
- `enums.schema.json` and `validation-rules.schema.json` were not modified;
- only `enums` and `validation-rules` are marked populated;
- `fullExtractionComplete` remains false;
- Phase 1 Step 4 is ready.

---

## Required Source Files

Use these as source inputs:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
packages/project-site-template/fields/README.md
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
packages/project-site-template/fields/families/*.fields.json
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
```

Primary implementation input:

```text
packages/project-site-template/fields/
```

Primary architecture authority:

```text
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
```

Do not re-read files that are still within your current context or memory unless exact section anchors, exact field names, exact field types, or exact validation-rule mappings must be verified.

---

## Dependency-Ordered Waves

Execute Step 4 in these waves:

### Wave 1 — Core Families

```text
template-manifest
site
settings
permissions
```

### Wave 2 — Content and Experience Families

```text
libraries
lists
modules
pages
```

### Wave 3 — Workflow, Integration, and Operational Families

```text
workflows
integrations
provisioning-validation
site-health
```

Do not skip the order. It follows the Step 3 dependency map and reduces reference ambiguity.

---

## Allowed File Changes Across Step 4

You may modify:

```text
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/settings.schema.json
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/schemas/families/site.schema.json
packages/project-site-template/schemas/families/pages.schema.json
packages/project-site-template/schemas/families/libraries.schema.json
packages/project-site-template/schemas/families/lists.schema.json
packages/project-site-template/schemas/families/modules.schema.json
packages/project-site-template/schemas/families/workflows.schema.json
packages/project-site-template/schemas/families/integrations.schema.json
packages/project-site-template/schemas/families/site-health.schema.json
packages/project-site-template/schemas/families/provisioning-validation.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/README.md
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Per_Family_Schema_Population_Closeout.md
```

You may modify `template-contract.schema.json` only to reflect populated-family status, field-map references, or schema reference updates required by the 12 populated schemas.

Do **not** modify:

- `enums.schema.json`;
- `validation-rules.schema.json`;
- field map JSON files, unless a typo prevents schema population and the correction is purely mechanical and documented;
- backend files;
- SPFx files;
- provisioning files;
- manifests;
- tests;
- generated files;
- CI files;
- root workspace files;
- package dependencies;
- package scripts.

Do not add dependencies. Do not run build, lint, test, typecheck, package, deploy, provisioning, or CI commands.

---

## Required Schema Population Standards

Each populated family schema must:

1. Use JSON Schema Draft 2020-12.
2. Retain `$schema`, `$id`, `title`, `description`, `type`, `additionalProperties`, `properties`, `$defs`, and `required` where applicable.
3. Replace scaffold-local `mvp_status` shorthand with the canonical Decision Closure enum:
   - `Frozen for MVP`
   - `Runtime Configuration`
   - `Deferred`
   - `Proof-Gated`
4. Define fields from the matching `.fields.json` map.
5. Include traceability fields from `common-fields.json`.
6. Preserve field-level `sourceContractSection`, `sourceCatalogId`, `sourceDecisionRef`, and `validationRuleRefs` through descriptions, `$comment`, metadata properties, or family-level field catalog structures.
7. Use JSON Schema-compatible field definitions for:
   - string
   - number
   - integer
   - boolean
   - array
   - object
   - enum
   - date
   - datetime
   - url
   - person
   - lookup
   - guid
   - unknown
8. Treat `unknown` field types as strings or objects only with explicit documentation that the type requires Step 5 or later refinement; do not invent implementation semantics.
9. Use `$defs` for shared reusable field types inside each family where appropriate.
10. Reference enum and validation-rule concepts consistently.
11. Clearly state in schema descriptions that the schema is populated for Phase 1 Step 4 but still not wired into provisioning/runtime consumers.
12. Avoid new architecture decisions.

---

## Required Root Contract Updates

Update:

```text
packages/project-site-template/template-contract.json
```

After all three waves pass validation:

- advance `phase` to:
  - `Phase 1 Step 4 per-family schema population`
- mark all 12 remaining family entries as populated;
- keep `enums` and `validation-rules` populated;
- keep `fullExtractionComplete: false` until Step 5 validation harness / final closeout;
- add or update references to Step 4 notes and closeout;
- do not imply provisioning, backend, or SPFx readiness.

---

## Required Documentation

Create:

```text
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
```

Required sections:

```markdown
# Phase 1 Step 4 — Per-Family Schema Population Notes

## Summary
## Files Modified
## Source Inputs
## Population Waves
## Families Populated
## Status Shorthand Reconciliation
## Field Map Traceability
## Procore Placeholder Treatment
## What Was Not Implemented
## Guardrails Preserved
## Validation Performed
## Recommended Next Step
```

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Per_Family_Schema_Population_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 4 — Per-Family Schema Population Closeout

## Summary
## Files Modified
## Wave 1 Validation
## Wave 2 Validation
## Wave 3 Validation
## Family Schema Population Summary
## Root Contract Update Summary
## Status Naming / mvp_status Summary
## Procore Boundary Validation
## Boundary Validation
## Anti-Regression Validation
## Remaining Risks
## Phase 1 Step 5 Readiness Decision
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

Readiness decision values:

```text
Ready for Phase 1 Step 5
Ready for Phase 1 Step 5 with Notes
Not Ready for Phase 1 Step 5
```

Recommended next prompt:

```text
Phase 1 Step 5 — Schema Validation Harness and Contract Integrity Checks
```

---

## Required Guardrails

Preserve all of the following:

- no backend implementation;
- no SPFx implementation;
- no provisioning implementation;
- no direct SPFx-to-Procore calls;
- no Procore secrets;
- no full Procore canonical model;
- no full Procore mirror;
- OC-17 and OC-18 remain placeholder-only / Deferred;
- ProcoreCompanyId = 5280 remains configuration, not secret;
- Sage Intacct remains accounting book of record;
- Procore remains operational/project-management state;
- external users remain deferred from MVP;
- HBI Assistant remains deferred from MVP;
- Procore write-back remains deferred from MVP;
- deprecated tokens appear only in forbidden/anti-regression contexts:
  - `preconstruction_only`
  - `warranty_closeout`
  - `active_construction` as ProjectType
  - `Archived` as ProjectStage
- cross-layer rules are not treated as Schema-only enforcement.

---

## Required Validation

After each wave, verify:

1. The wave's family schema files are valid JSON.
2. The wave's family schemas use canonical `mvp_status` values.
3. The wave's family schemas no longer contain scaffold-local status shorthand as canonical enum values.
4. Fields trace to the appropriate `.fields.json` inputs.
5. No forbidden values are promoted to valid values.
6. No Procore placeholder family becomes a canonical Procore model.
7. No backend, SPFx, provisioning, manifest, test, generated, CI, root-workspace, dependency, or script changes occurred.

At final closeout, verify:

1. All 12 family schemas are populated.
2. `enums.schema.json` and `validation-rules.schema.json` were not modified.
3. `template-contract.json` marks all 14 families populated.
4. `fullExtractionComplete` remains false.
5. All JSON files modified in Step 4 parse cleanly.
6. No secrets were introduced.
7. Phase 1 Step 5 is the next step.

---

## Required Completion Summary

After all waves and closeout are complete, output:

```markdown
## Completion Summary

### Files Modified
### Families Populated
### Wave Validation Results
### Root Contract Update
### Status Naming / mvp_status Result
### Procore Placeholder Result
### Guardrails Preserved
### Validation Performed
### What Was Not Implemented
### Remaining Risks
### Recommended Next Step
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): populate family schemas
```
