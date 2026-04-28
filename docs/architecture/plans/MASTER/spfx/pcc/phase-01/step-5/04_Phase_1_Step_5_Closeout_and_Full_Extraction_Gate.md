# Prompt 04 — Phase 1 Step 5 Closeout and Full Extraction Gate

## Objective

Close Phase 1 Step 5 and determine whether the machine-readable Project Site Template contract can be marked fully extracted.

Only set:

```json
"fullExtractionComplete": true
```

if all validation harness and integrity checks pass with no unresolved architecture gaps.

---

## Required Prerequisite

Prompt 02 and Prompt 03 must have completed successfully.

Required passing commands:

```text
node packages/project-site-template/validation/validate-template-contract.mjs
node packages/project-site-template/validation/contract-integrity-checks.mjs
```

If package scripts exist:

```text
<package manager> --filter @hbc/project-site-template validate:all
```

---

## Allowed File Changes

You may modify:

```text
packages/project-site-template/template-contract.json
packages/project-site-template/README.md
packages/project-site-template/docs/Phase_1_Step_5_Schema_Validation_Harness_Notes.md
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md
```

You may modify validation reports if deterministic and already committed.

Do not modify schemas in this prompt unless closeout validation reveals a purely mechanical typo. If that occurs, rerun Prompt 03 first.

Do not modify backend, SPFx, provisioning, manifests, generated files, CI, root workspace, deployment files, or runtime consumers.

---

## Full Extraction Gate

Set `template-contract.json`:

```json
"fullExtractionComplete": true
```

only if all are true:

1. All 14 schemas validate as JSON Schema Draft 2020-12.
2. `template-contract.json` validates against `template-contract.schema.json`.
3. All valid fixtures pass.
4. All invalid fixtures fail for expected reasons.
5. Integrity checks pass.
6. All 14 family entries are populated.
7. No scaffold shorthand remains as valid canonical status.
8. ProjectStage / ProjectType / ProjectStatus anti-regression checks pass.
9. Procore boundary const checks pass.
10. No Procore secrets are present.
11. OC-17 and OC-18 remain placeholder-only / Deferred.
12. Sage Intacct remains accounting book of record.
13. No architecture-gap escalation remains open.
14. No runtime implementation has been introduced.

If any gate item fails, keep `fullExtractionComplete: false` and set readiness decision to `Not Ready for Phase 2`.

---

## Required Closeout Report

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_5_Schema_Validation_Harness_Closeout.md
```

Required sections:

```markdown
# Phase 1 Step 5 — Schema Validation Harness Closeout

## Summary
## Files Created
## Files Modified
## Validation Harness Summary
## Fixture Coverage Summary
## Schema Validation Results
## Contract Integrity Results
## Full Extraction Gate
## Template Contract Status
## Procore Boundary Validation
## Anti-Regression Validation
## Boundary Validation
## What Was Not Implemented
## Remaining Risks
## Phase 1 Completion Decision
## Phase 2 Readiness Decision
## Recommended Next Prompt
## Commit Summary
## Commit Description
```

Decision values:

### Phase 1 Completion Decision

```text
Phase 1 Complete
Phase 1 Complete with Notes
Phase 1 Not Complete
```

### Phase 2 Readiness Decision

```text
Ready for Phase 2 Planning
Ready for Phase 2 Planning with Notes
Not Ready for Phase 2
```

Use `Phase 1 Complete` and `Ready for Phase 2 Planning` only if the full extraction gate passes.

Recommended next prompt if ready:

```text
Phase 2 Step 1 — Provisioning Foundation Planning and Template Consumer Boundary
```

Do not recommend starting provisioning implementation directly unless the roadmap says Phase 2 Step 1 is implementation. Prefer planning and consumer-boundary validation first.

---

## Required README Update

Update:

```text
packages/project-site-template/README.md
```

Add or update:

```markdown
### Phase 1 Step 5 Status
```

State:

- validation harness exists;
- representative fixtures exist;
- contract integrity checks exist;
- `fullExtractionComplete` status;
- next step.

---

## Required Completion Summary

Output:

```markdown
## Completion Summary

### Files Created
### Files Modified
### Validation Commands Run
### Full Extraction Gate Result
### fullExtractionComplete Status
### Phase 1 Completion Decision
### Phase 2 Readiness Decision
### Remaining Risks
### Recommended Next Step
### Suggested Commit Message
```

Suggested commit message if gate passes:

```text
test(project-site-template): close phase 1 schema validation
```

Suggested commit message if gate does not pass:

```text
test(project-site-template): record phase 1 schema validation gaps
```
