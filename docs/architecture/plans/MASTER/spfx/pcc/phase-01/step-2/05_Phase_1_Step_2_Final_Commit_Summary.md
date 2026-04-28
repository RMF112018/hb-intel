# Prompt 05 — Phase 1 Step 2 Final Commit Summary

Use this prompt after Prompt 01 and Prompt 04, and after Prompt 02 or Prompt 03 only if either was required.

## Objective

Produce the final commit summary and description for Phase 1 Step 2.

Do not modify files in this prompt unless the closeout report is missing its commit summary / description section.

## Required Output

Output only the commit summary and description.

Suggested summary:

```text
feat(project-site-template): extract enums and validation rules
```

Suggested description:

```text
Populate the Project Site Template enum and validation-rule schema families for Phase 1 Step 2.

Adds canonical enum definitions for ProjectType, ProjectStage, ProjectStatus, Decision Closure status, Site Health severity, Repair Automation tiers, validation rule categories, and enforcement layers. Populates the initial VR-01 through VR-30 validation-rule inventory with source traceability, enforcement-layer classification, MVP treatment, and generation-blocking flags.

Updates the root template-contract scaffold status and adds Phase 1 Step 2 notes and closeout documentation.

Schema-family extraction only: no backend, SPFx, provisioning, Procore integration, CI, generated files, dependencies, scripts, or deployment artifacts.
```

If Prompt 02 was required, include one sentence explaining the status-naming reconciliation.

If Prompt 03 was required, include one sentence explaining the architecture-gap escalation and whether Step 2 remains blocked.
