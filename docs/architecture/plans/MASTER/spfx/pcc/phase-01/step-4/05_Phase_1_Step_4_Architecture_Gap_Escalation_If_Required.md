# Prompt 05 — Phase 1 Step 4 Architecture Gap Escalation If Required

Use this prompt only if per-family schema population exposes a true undecided architecture point that prevents clean Step 4 completion.

## Objective

Document architecture gaps found during per-family schema population.

Do not resolve architecture gaps inside schema files. Do not invent missing fields, field types, enum values, validation rules, Procore boundaries, ownership rules, access behavior, provisioning behavior, or runtime semantics.

## Use This Prompt If

Use this prompt if any of the following occur:

- a field map contradicts the governing Contract;
- a field exists in a field map but cannot be represented in JSON Schema without a new architecture decision;
- field ownership across families is unclear;
- required/optional treatment conflicts with source truth;
- an `unknown` field type cannot be safely represented without a decision;
- Procore placeholder rows require more than placeholder/future-reference treatment;
- a rule would require backend/SPFx/provisioning behavior now;
- secret-bearing fields appear necessary;
- Step 4 would require modifying `enums.schema.json` or `validation-rules.schema.json` beyond reference-only corrections;
- Step 4 would require package dependencies, scripts, CI, generated files, or runtime code.

## Allowed Scope

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_4_Architecture_Gap_Escalation_Register.md
```

Do not continue schema population while a blocking gap remains unresolved.

## Required Deliverable

Required sections:

```markdown
# Phase 1 Step 4 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Schema Population
## Impact on Phase 1 Step 5
## Work Paused
## Work That Can Continue
## Recommended Decision Path
## Validation
```

Required table:

```markdown
| Gap ID | Severity | Source Section(s) | Family | Field / Rule | Gap / Conflict | Why It Blocks Step 4 | Required Decision Owner | Recommended Resolution Path | Blocks Step 4? | Notes |
```

Severity values:

```text
Critical
High
Medium
Low
Informational
```

Blocks Step 4 values:

```text
Yes
Partial
No
```

## Completion Summary

When complete, output:

```markdown
## Completion Summary

### Escalation Register Created
### Blocking Gaps
### Partial Work State
### Work Paused
### Work That Can Continue
### Recommended Decision Path
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): record phase 1 schema population gaps
```
