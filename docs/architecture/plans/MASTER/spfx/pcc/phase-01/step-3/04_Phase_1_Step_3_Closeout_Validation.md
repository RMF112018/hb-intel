# Prompt 04 — Phase 1 Step 3 Closeout Validation

Run this prompt after Prompt 01, and after Prompt 02 or Prompt 03 only if either was required.

## Objective

Validate Phase 1 Step 3 and create the closeout report.

Confirm object-family field consolidation is complete, bounded, traceable, and ready for Phase 1 Step 4 — Per-Family Schema Population.

Do not perform schema population in this prompt.

Do not modify backend, SPFx, provisioning, manifests, generated files, CI, tests, root workspace files, package dependencies, or package scripts.

---

## Required Files to Validate

```text
packages/project-site-template/fields/README.md
packages/project-site-template/fields/common-fields.json
packages/project-site-template/fields/object-catalog-field-disposition.json
packages/project-site-template/fields/family-field-dependencies.json
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
packages/project-site-template/docs/Phase_1_Step_3_Object_Family_Field_Consolidation_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
```

If status shorthand planning was required, also validate:

```text
packages/project-site-template/fields/status-shorthand-reconciliation-plan.json
packages/project-site-template/docs/Phase_1_Step_3_Status_Shorthand_Reconciliation_Plan.md
```

---

## Required Validation Checks

Confirm:

1. All field-consolidation files exist.
2. All JSON files are valid JSON.
3. Common fields include all required common fields.
4. All 12 family field maps exist.
5. Every family field map has the required structure.
6. Every family field map marks `fieldConsolidationComplete: true`.
7. Every family field map marks `schemaPopulationComplete: false`.
8. Every family field map marks `containsNewArchitectureDecisions: false`.
9. Object catalog disposition includes all 18 Contract §4A rows.
10. Rows 17 and 18 remain placeholder / future-reference only.
11. Family dependency map includes all required dependencies.
12. `template-contract.json` does not mark the 12 families as populated.
13. `fullExtractionComplete` remains false.
14. No remaining 12 family schema skeletons were populated.
15. `enums.schema.json` was not modified.
16. `validation-rules.schema.json` was not modified.
17. No backend files changed.
18. No SPFx files changed.
19. No provisioning files changed.
20. No manifests changed.
21. No tests changed.
22. No generated files changed.
23. No CI files changed.
24. No root workspace files changed.
25. No dependencies added.
26. No package scripts added.
27. No secrets introduced.
28. Deprecated enum tokens appear only in forbidden-value / anti-regression contexts.
29. Unknown field types, if any, are documented and either non-blocking or escalated.
30. Recommended next prompt is Phase 1 Step 4.

---

## Required Closeout Report

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Object_Family_Field_Consolidation_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 3 — Object Family Field Consolidation Closeout

## Summary
## Files Created
## Files Modified
## Field Family Consolidation Validation
## Object Catalog Disposition Validation
## Dependency Map Validation
## Status Naming / mvp_status Validation
## Guardrail Validation
## Boundary Validation
## What Was Not Populated
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

Use `Ready for Phase 1 Step 4` only if all required field-consolidation checks pass and no architecture gaps remain.

Recommended next prompt:

```text
Phase 1 Step 4 — Per-Family Schema Population
```

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Field Consolidation Result
### Object Catalog Disposition Result
### Dependency Map Result
### Status Naming Result
### Guardrail Validation Result
### Phase 1 Step 4 Readiness Decision
### Remaining Risks
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): consolidate object family fields
```
