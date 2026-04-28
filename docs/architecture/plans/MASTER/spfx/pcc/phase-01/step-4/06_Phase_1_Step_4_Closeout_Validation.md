# Prompt 06 — Phase 1 Step 4 Closeout Validation

Run this prompt after Waves 1, 2, and 3, and after Prompt 05 only if Prompt 05 was required.

## Objective

Validate Phase 1 Step 4 and create the closeout report.

Confirm the 12 remaining family schemas are populated, bounded, traceable, and ready for Phase 1 Step 5 — Schema Validation Harness and Contract Integrity Checks.

Do not implement validation tooling in this prompt.

Do not modify backend, SPFx, provisioning, manifests, generated files, CI, tests, root workspace files, package dependencies, or package scripts.

---

## Required Files to Validate

Validate these 12 populated family schemas:

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
```

Also validate:

```text
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/docs/Phase_1_Step_4_Per_Family_Schema_Population_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Per_Family_Schema_Population_Closeout.md
```

---

## Required Validation Checks

Confirm:

1. All 12 family schema files are valid JSON.
2. All 12 family schemas are populated beyond scaffold skeletons.
3. All 12 family schemas use canonical Decision Closure status values.
4. No 12-family schema uses `mvp`, `deferred`, or `placeholder` as canonical `mvp_status` enum values.
5. Field definitions trace to matching `.fields.json` maps.
6. Common traceability fields are preserved.
7. `enums.schema.json` was not modified.
8. `validation-rules.schema.json` was not modified.
9. `template-contract.json` marks all 14 families populated.
10. `fullExtractionComplete` remains false.
11. OC-17 and OC-18 remain placeholder-only / Deferred.
12. No full Procore canonical model was introduced.
13. No Procore secrets were introduced.
14. Direct SPFx-to-Procore calls remain prohibited.
15. External users, HBI Assistant, and Procore write-back remain Deferred.
16. Sage Intacct remains accounting book of record.
17. No backend files changed.
18. No SPFx files changed.
19. No provisioning files changed.
20. No manifests changed.
21. No tests changed.
22. No generated files changed.
23. No CI files changed.
24. No root workspace files changed.
25. No package dependencies added.
26. No package scripts added.
27. No build/test/lint/typecheck/package/deploy commands were run.
28. Phase 1 Step 5 is the next step.

---

## Required Closeout Report

Create or update:

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
## Field Map Traceability Summary
## Procore Boundary Validation
## Boundary Validation
## Anti-Regression Validation
## What Was Not Implemented
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

Use `Ready for Phase 1 Step 5` only if all required family schemas are populated and no architecture gaps remain.

Recommended next prompt:

```text
Phase 1 Step 5 — Schema Validation Harness and Contract Integrity Checks
```

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Modified
### Families Populated
### Wave Validation Results
### Root Contract Result
### Procore Boundary Result
### Guardrail Validation Result
### Phase 1 Step 5 Readiness Decision
### Remaining Risks
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): populate family schemas
```
