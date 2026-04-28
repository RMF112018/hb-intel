# Prompt 02 — Phase 1 Step 1 Architecture Gap Escalation If Required

Use this prompt only if Prompt 01 exposes an undecided architecture issue that prevents a clean scaffold.

## Objective

Document architecture gaps discovered while attempting to create the Phase 1 Step 1 scaffold.

Do **not** resolve the gap inside schema files. Do **not** invent missing architecture. Do **not** silently create fields, families, or rules that are not traceable to the Contract, Blueprint, Roadmap, Phase 0 Step 2 taxonomy, or Phase 0 Step 2 closeout.

## When to Use

Use this prompt only if one or more of these occurs:

- a required family name conflicts with repo/package conventions in a way that changes meaning;
- the scaffold cannot represent a Phase 0 Step 2 family without inventing a new architecture concept;
- a required traceability field conflicts with existing contract terminology;
- package scaffolding requires root workspace modifications that are not clearly safe;
- a schema skeleton would require a policy decision not already made;
- Procore placeholder treatment conflicts with a source document;
- MVP / Deferred / Runtime Configuration / Proof-Gated treatment is unclear;
- a no-secret / no-direct-Procore / no-full-Procore-mirror rule cannot be represented without a new decision.

## Allowed Scope

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Architecture_Gap_Escalation_Register.md
```

Do not modify:

- `packages/project-site-template/`
- code;
- schemas;
- backend files;
- SPFx files;
- provisioning files;
- manifests;
- tests;
- generated files;
- CI files;
- package versions.

If Prompt 01 already created partial scaffold files before the gap was identified, leave them unstaged and document the partial state. Do not continue generation until the gap is resolved.

## Required Deliverable

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/Phase_1_Step_1_Architecture_Gap_Escalation_Register.md
```

Required sections:

```markdown
# Phase 1 Step 1 — Architecture Gap Escalation Register

## Purpose
## Summary
## Gap Register
## Impact on Scaffold
## Impact on Phase 1
## Work Paused
## Work That Can Continue
## Recommended Decision Path
## Validation
```

Required table:

```markdown
| Gap ID | Severity | Source Section(s) | Gap / Conflict | Why It Blocks Scaffold | Required Decision Owner | Recommended Resolution Path | Blocks Phase 1? | Notes |
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

## Completion Summary

When complete, output:

```markdown
## Completion Summary

### Escalation Register Created
### Blocking Gaps
### Partial Scaffold State
### Work Paused
### Work That Can Continue
### Recommended Decision Path
### Suggested Commit Message
```

Suggested commit message:

```text
docs(sp-project-control-center): record phase 1 scaffold architecture gaps
```
