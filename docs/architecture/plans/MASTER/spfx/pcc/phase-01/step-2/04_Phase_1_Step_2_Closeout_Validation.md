# Prompt 04 — Phase 1 Step 2 Closeout Validation

Run this prompt after Prompt 01, and after Prompt 02 or Prompt 03 only if either was required.

## Objective

Validate Phase 1 Step 2 and create the closeout report.

Confirm that enum and validation-rule extraction is complete, bounded, traceable, and ready for Phase 1 Step 3 — Object Family Field Consolidation.

Do not perform additional extraction except to correct missing or malformed Step 2 outputs.

Do not modify backend, SPFx, provisioning, manifests, generated files, CI, tests, root workspace files, package dependencies, or package scripts.

---

## Required Files to Validate

```text
packages/project-site-template/schemas/families/enums.schema.json
packages/project-site-template/schemas/families/validation-rules.schema.json
packages/project-site-template/template-contract.json
packages/project-site-template/docs/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

If status reconciliation was required, also validate:

```text
packages/project-site-template/docs/Phase_1_Step_2_Status_Naming_Reconciliation.md
```

---

## Required Validation Checks

Confirm:

1. `enums.schema.json` is valid JSON.
2. `validation-rules.schema.json` is valid JSON.
3. `template-contract.json` is valid JSON.
4. ProjectType values are exact.
5. ProjectType forbidden values are present only as forbidden values.
6. ProjectStage values are exact.
7. ProjectStatus values are exact.
8. Decision Closure status values are exact:
   - `Frozen for MVP`
   - `Runtime Configuration`
   - `Deferred`
   - `Proof-Gated`
9. Site Health severity values are exact.
10. Repair tier values are exact.
11. Enforcement Layer values are exact.
12. Validation Rule Category values are exact.
13. `VR-01` through `VR-30` exist.
14. Every validation rule has:
   - rule ID;
   - category;
   - source section;
   - applies-to target;
   - rule statement;
   - schema family;
   - enforcement layer;
   - MVP treatment / Decision Closure status;
   - blocks-generation flag;
   - notes.
15. Cross-layer behavior rules are not Schema-only.
16. No full object-family extraction occurred.
17. Other 12 family schemas remain skeleton-only.
18. `template-contract.json` marks only `enums` and `validation-rules` as populated or Step 2-complete.
19. `fullExtractionComplete` remains false.
20. No backend files changed.
21. No SPFx files changed.
22. No provisioning files changed.
23. No manifests changed.
24. No tests changed.
25. No generated files changed.
26. No CI files changed.
27. No package dependencies added.
28. No package scripts added.
29. No secrets introduced.
30. Procore canonical model remains out of scope.
31. Procore Object Link / Curated Summary records remain placeholder / future-reference only.
32. Recommended next prompt is Phase 1 Step 3.

---

## Required Closeout Report

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Enum_Validation_Rule_Extraction_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 2 — Enum and Validation Rule Extraction Closeout

## Summary
## Files Created
## Files Modified
## Enum Extraction Validation
## Validation Rule Extraction Validation
## Status Naming Validation
## Root Contract Update Validation
## Guardrail Validation
## Boundary Validation
## What Was Not Extracted
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

Use `Ready for Phase 1 Step 3` only if all required enum/rule extraction checks pass and no architecture gaps remain.

Recommended next prompt:

```text
Phase 1 Step 3 — Object Family Field Consolidation
```

## Required Completion Summary

When complete, output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Enum Extraction Result
### Validation Rule Extraction Result
### Status Naming Result
### Guardrail Validation Result
### Phase 1 Step 3 Readiness Decision
### Remaining Risks
### Suggested Commit Message
```

Suggested commit message:

```text
feat(project-site-template): extract enums and validation rules
```
