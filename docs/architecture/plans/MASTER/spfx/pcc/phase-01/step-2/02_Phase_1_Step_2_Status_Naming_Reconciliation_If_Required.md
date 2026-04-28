# Prompt 02 — Phase 1 Step 2 Status Naming Reconciliation If Required

Use this prompt only if Prompt 01 finds that the scaffold's temporary status naming conflicts with the Phase 0 Decision Closure status taxonomy and requires broader correction than the primary prompt permits.

## Objective

Resolve or escalate the status-naming mismatch between the Phase 1 Step 1 scaffold and the Phase 0 / Contract status taxonomy.

Phase 0 established canonical Decision Closure status values:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

If the scaffold currently uses shorthand values such as:

```text
mvp
deferred
placeholder
```

determine whether the mismatch can be corrected narrowly or whether it requires architecture review.

## Allowed Scope

You may modify only files under:

```text
packages/project-site-template/
docs/architecture/blueprint/sp-project-control-center/phase-1/
```

Allowed file types:

```text
.json
.md
```

Do not modify backend, SPFx, provisioning, manifests, tests, generated files, CI files, root workspace files, or package dependencies.

Do not run build/test/lint/typecheck/package/deploy commands.

## Required Decision Path

### Path A — Narrow Documentation / Schema Correction

Use this path only if repo truth clearly supports the correction.

Allowed corrections:

- Update `enums.schema.json` to define canonical Decision Closure statuses.
- Update `validation-rules.schema.json` to use canonical status values.
- Update `template-contract.json` to reference the canonical status enum.
- Add documentation explaining that any Phase 1 Step 1 shorthand was scaffold-local and non-authoritative.

Do not change all 14 family skeletons unless the change is strictly mechanical and already supported by Phase 0. If broad changes are needed, use Path B.

### Path B — Architecture Gap Escalation

Use this path if one of these is true:

- the correct field name is unclear;
- `mvp_status` should be renamed but no governing source defines the target field;
- canonical values and scaffold values cannot be reconciled without breaking existing scaffold assumptions;
- broad edits across all family skeletons would be required and are not strictly mechanical.

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Status_Naming_Escalation_Register.md
```

Do not continue extraction until the gap is resolved.

## Required Deliverable for Path A

Create or update:

```text
packages/project-site-template/docs/Phase_1_Step_2_Status_Naming_Reconciliation.md
```

Required sections:

```markdown
# Phase 1 Step 2 — Status Naming Reconciliation

## Summary
## Issue
## Governing Source
## Correction Made
## Files Modified
## Why This Is Not a New Architecture Decision
## Remaining Notes
```

## Required Deliverable for Path B

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Status_Naming_Escalation_Register.md
```

Required sections:

```markdown
# Phase 1 Step 2 — Status Naming Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Enum Extraction
## Work Paused
## Recommended Decision Path
```

Required table:

```markdown
| Gap ID | Severity | Source Section(s) | Gap / Conflict | Why It Blocks Extraction | Required Decision Owner | Recommended Resolution Path | Blocks Phase 1 Step 2? | Notes |
```

## Completion Summary

When complete, output:

```markdown
## Completion Summary

### Path Used
### Files Modified
### Status Naming Decision
### Extraction May Continue?
### Remaining Risks
### Suggested Commit Message
```

Suggested commit message for Path A:

```text
feat(project-site-template): reconcile phase 1 status taxonomy
```

Suggested commit message for Path B:

```text
docs(sp-project-control-center): escalate phase 1 status naming gap
```
