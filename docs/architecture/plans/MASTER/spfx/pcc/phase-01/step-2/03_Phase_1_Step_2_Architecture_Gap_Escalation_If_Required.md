# Prompt 03 — Phase 1 Step 2 Architecture Gap Escalation If Required

Use this prompt only if Phase 1 Step 2 exposes a true undecided architecture point that prevents enum or validation-rule extraction.

## Objective

Document architecture gaps found during enum and validation-rule extraction.

Do not resolve architecture gaps inside JSON schema output. Do not invent enum values, validation rules, enforcement layers, ownership rules, or Procore boundaries.

## Use This Prompt If

Use this prompt if any of the following occur:

- a required enum value conflicts between the Contract, Blueprint, and Phase 0 deliverables;
- a validation rule cannot be traced to a governing source;
- an enforcement layer classification requires a new policy decision;
- a Procore boundary rule conflicts between source documents;
- MVP / Deferred / Runtime Configuration / Proof-Gated treatment is unclear;
- status naming cannot be reconciled under Prompt 02;
- a rule would require changing backend/SPFx/provisioning behavior now;
- a secret-bearing field appears necessary to model an enum/rule;
- a source implies full Procore canonical modeling in Phase 1.

## Allowed Scope

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_2_Architecture_Gap_Escalation_Register.md
```

Do not modify package schemas while this escalation is unresolved.

## Required Deliverable

Required sections:

```markdown
# Phase 1 Step 2 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Enum Extraction
## Impact on Validation Rule Extraction
## Work Paused
## Work That Can Continue
## Recommended Decision Path
## Validation
```

Required table:

```markdown
| Gap ID | Severity | Source Section(s) | Gap / Conflict | Why It Blocks Phase 1 Step 2 | Required Decision Owner | Recommended Resolution Path | Blocks Step 2? | Notes |
```

Severity values:

```text
Critical
High
Medium
Low
Informational
```

Blocks Step 2 values:

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
docs(sp-project-control-center): record phase 1 enum extraction gaps
```
