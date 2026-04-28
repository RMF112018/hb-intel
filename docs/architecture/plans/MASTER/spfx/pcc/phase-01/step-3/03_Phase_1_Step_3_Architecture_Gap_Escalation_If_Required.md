# Prompt 03 — Phase 1 Step 3 Architecture Gap Escalation If Required

Use this prompt only if field consolidation exposes a true undecided architecture point that prevents clean Step 3 completion.

## Objective

Document architecture gaps found during object-family field consolidation.

Do not resolve architecture gaps inside field maps. Do not invent missing fields, field types, required/optional rules, owner categories, validation rules, or Procore boundaries.

## Use This Prompt If

Use this prompt if any of the following occur:

- a required field cannot be traced to the Contract, Phase 0 object disposition, or Phase 1 taxonomy;
- a field appears required but required/optional treatment is not defined;
- a field type cannot be determined and materially affects schema population;
- a field belongs to more than one family and the owning family is unclear;
- a validation rule required for the field is absent and cannot be added without a new decision;
- Procore placeholder rows require more than placeholder / future-reference treatment;
- the field map would imply backend/SPFx/provisioning implementation behavior now;
- a secret-bearing field appears necessary;
- a source implies full Procore canonical modeling in Phase 1.

## Allowed Scope

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_3_Architecture_Gap_Escalation_Register.md
```

Do not modify field maps while this escalation is unresolved.

## Required Deliverable

Required sections:

```markdown
# Phase 1 Step 3 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Field Consolidation
## Impact on Phase 1 Step 4
## Work Paused
## Work That Can Continue
## Recommended Decision Path
## Validation
```

Required table:

```markdown
| Gap ID | Severity | Source Section(s) | Gap / Conflict | Why It Blocks Field Consolidation | Required Decision Owner | Recommended Resolution Path | Blocks Step 3? | Notes |
```

Severity values:

```text
Critical
High
Medium
Low
Informational
```

Blocks Step 3 values:

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
docs(sp-project-control-center): record phase 1 field consolidation gaps
```
