# Prompt 02 — Optional Architecture Gap Escalation If Required

Run this prompt only if Prompt 01 discovers a true architecture decision that blocks Phase 0 Step 2 completion.

## Objective

Document any architecture gap that prevents a clean Schema Extraction Plan or Object Catalog Disposition from being completed.

This prompt must **not** resolve the architecture decision inside schema-planning output. It must escalate the issue back to architecture review.

## When to Use

Use this prompt only if one or more of the following occurs:

- an Object Catalog row cannot be assigned a schema family without inventing a new architecture decision;
- a required/optional field state cannot be determined and materially affects schema generation;
- MVP vs Future vs Deferred treatment is contradictory;
- a validation rule conflicts between the Contract and Blueprint;
- a Procore boundary conflicts between the Contract, Blueprint, and Procore model package;
- a Team & Access rule conflicts with the permission template model;
- a runtime configuration value is mistakenly treated as a frozen architecture value;
- a Proof-Gated item is being treated as implementable without proof.

If none of these occur, do not run this prompt.

---

## Allowed Scope

You may create or update only markdown files under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/
```

Do not modify:

- `Standard_Project_Site_Template_Contract.md`
- `HB_Project_Control_Center_Target_Architecture_Blueprint.md`
- code;
- schemas;
- SPFx files;
- backend files;
- manifests;
- tests;
- provisioning scripts;
- package versions;
- generated files.

Do not create `packages/project-site-template/`.

Do not create schema files.

Do not re-read files that are still within your current context or memory unless exact evidence is required.

---

## Required Deliverable

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-0/Phase_0_Step_2_Architecture_Gap_Escalation_Register.md
```

Required sections:

```markdown
# Phase 0 Step 2 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Schema Extraction Plan
## Impact on Object Catalog Disposition
## Recommended Architecture Decision Path
## Work That Must Stop Until Resolved
## Work That Can Continue
## Validation
```

### Required Gap Register Columns

Use this exact structure:

```markdown
| Gap ID | Severity | Source Section(s) | Gap / Conflict | Why It Blocks Extraction Planning | Required Decision Owner | Recommended Resolution Path | Blocks Phase 1? | Notes |
```

Severity values:

```text
Critical
High
Medium
Low
Informational
```

Blocks Phase 1 values:

```text
Yes
Partial
No
```

---

## Required Completion Summary

Provide:

```markdown
## Completion Summary

### Escalation Register Created / Updated
### Blocking Gaps
### Non-Blocking Gaps
### Work Paused
### Work That Can Continue
### Validation Performed
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): record phase 0 schema extraction gaps
```
