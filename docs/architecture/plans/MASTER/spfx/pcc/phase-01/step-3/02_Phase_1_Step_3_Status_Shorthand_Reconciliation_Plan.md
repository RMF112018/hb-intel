# Prompt 02 — Phase 1 Step 3 Status Shorthand Reconciliation Plan

Use this prompt only if the local agent needs a dedicated pass to plan how the 12 remaining family skeletons will move from temporary scaffold shorthand to canonical Decision Closure status values during Step 4.

## Objective

Create a narrow plan for reconciling temporary `mvp_status` shorthand in the 12 remaining family skeletons.

Phase 1 Step 2 documented the temporary shorthand:

```text
mvp
deferred
placeholder
```

Canonical Decision Closure status values are:

```text
Frozen for MVP
Runtime Configuration
Deferred
Proof-Gated
```

This prompt does not update the 12 schema skeletons. It only creates a plan for Step 4.

## Allowed Scope

You may create or update only:

```text
packages/project-site-template/fields/status-shorthand-reconciliation-plan.json
packages/project-site-template/docs/Phase_1_Step_3_Status_Shorthand_Reconciliation_Plan.md
```

Do not modify schema files.

Do not modify backend, SPFx, provisioning, manifests, tests, generated files, CI files, root workspace files, or package dependencies.

## Required JSON Plan

Create:

```text
packages/project-site-template/fields/status-shorthand-reconciliation-plan.json
```

Required structure:

```json
{
  "phase": "Phase 1 Step 3 status shorthand reconciliation planning",
  "canonicalValues": [],
  "temporaryValues": [],
  "defaultMapping": [],
  "familySpecificNotes": [],
  "step4Instructions": [],
  "guardrails": []
}
```

For each remaining family, identify whether the default shorthand mapping is safe or whether Step 4 must make a family-specific decision.

## Required Markdown Notes

Create:

```text
packages/project-site-template/docs/Phase_1_Step_3_Status_Shorthand_Reconciliation_Plan.md
```

Required sections:

```markdown
# Phase 1 Step 3 — Status Shorthand Reconciliation Plan

## Summary
## Canonical Status Values
## Temporary Scaffold Values
## Default Mapping
## Family-Specific Notes
## Step 4 Instructions
## Guardrails
## Validation Performed
```

## Completion Summary

Output:

```markdown
## Completion Summary

### Files Created
### Status Mapping Result
### Families Requiring Step 4 Attention
### Guardrails Preserved
### Suggested Commit Message
```

Suggested commit message:

```text
docs(project-site-template): plan status shorthand reconciliation
```
