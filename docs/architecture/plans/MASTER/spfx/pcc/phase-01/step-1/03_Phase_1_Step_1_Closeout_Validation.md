# Prompt 03 — Phase 1 Step 1 Closeout Validation

Run this prompt after Prompt 01, and after Prompt 02 only if Prompt 02 was required.

## Objective

Validate the Phase 1 Step 1 scaffold and produce a closeout report.

This prompt confirms the machine-readable template contract scaffold exists, contains the expected family skeletons, preserves Phase 0 guardrails, and is ready for Phase 1 Step 2.

Do not perform full schema extraction in this prompt.

Do not implement backend provisioning, SPFx, Procore integration, Graph calls, SharePoint provisioning, CI, tests, deployment, or package publishing.

---

## Required Files to Validate

```text
packages/project-site-template/README.md
packages/project-site-template/template-contract.json
packages/project-site-template/schemas/template-contract.schema.json
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/enums.schema.json
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
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/docs/Phase_1_Step_1_Scaffold_Notes.md
```

If `package.json` was created, validate it is private and does not add runtime dependencies or build behavior unless repo convention required it.

---

## Required Validation Checks

Confirm:

1. All required scaffold files exist.
2. All 14 family schema skeletons exist.
3. Root `template-contract.json` references all 14 families.
4. `template-contract.schema.json` validates the scaffold shape only.
5. Each family schema includes common traceability properties.
6. Each family schema clearly states skeleton-only / not fully populated.
7. No full object extraction was performed.
8. No backend files changed.
9. No SPFx files changed.
10. No provisioning files changed.
11. No manifests changed.
12. No tests changed.
13. No generated files changed.
14. No CI files changed.
15. No root workspace files changed unless package convention required it and the reason is documented.
16. No secrets were introduced.
17. No direct-Procore runtime code was created.
18. No Procore canonical model was created.
19. Deprecated enum values appear only as forbidden / guardrail references, not valid values.
20. Rows 17 and 18 Procore future placeholders remain placeholder / future-reference only.
21. The next step is Phase 1 Step 2 — Enum and Validation Rule Extraction.

---

## Required Closeout Report

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Closeout_Report.md
```

Required sections:

```markdown
# Phase 1 Step 1 — Closeout Report

## Summary
## Files Created
## Files Modified
## Scaffold Validation
## Family Skeleton Validation
## Root Contract Skeleton Validation
## Package Metadata Validation
## Guardrail Validation
## Boundary Validation
## What Was Not Extracted
## Remaining Risks
## Phase 1 Step 2 Readiness Decision
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

Readiness decision values:

```text
Ready for Phase 1 Step 2
Ready for Phase 1 Step 2 with Notes
Not Ready for Phase 1 Step 2
```

Use `Ready for Phase 1 Step 2` only if all required scaffold files exist and no boundary violations occurred.

Recommended next prompt:

```text
Phase 1 Step 2 — Enum and Validation Rule Extraction
```

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Scaffold Validation Result
### Family Skeleton Validation Result
### Guardrail Validation Result
### Phase 1 Step 2 Readiness Decision
### Remaining Risks
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): scaffold machine-readable template contract
```
