# Prompt 05 — Phase 1 Step 3 Final Commit Summary

Use this prompt after Prompt 01 and Prompt 04, and after Prompt 02 or Prompt 03 only if either was required.

## Objective

Produce the final commit summary and description for Phase 1 Step 3.

Do not modify files in this prompt unless the closeout report is missing its commit summary / description section.

## Required Output

Output only the commit summary and description.

Suggested summary:

```text
feat(project-site-template): consolidate object family fields
```

Suggested description:

```text
Add Phase 1 Step 3 field-consolidation artifacts for the Project Site Template contract.

Creates common field definitions, 12 family field maps, object catalog field disposition, family dependency mapping, package field-map README, Step 3 notes, and Step 3 closeout documentation. Keeps enums and validation-rules as the only populated schema families and prepares the remaining families for Phase 1 Step 4 schema population.

Field-consolidation only: no remaining family schema population, backend, SPFx, provisioning, Procore integration, CI, generated files, dependencies, scripts, or deployment artifacts.
```

If Prompt 02 was required, include one sentence explaining the status shorthand reconciliation plan.

If Prompt 03 was required, include one sentence explaining the architecture-gap escalation and whether Step 3 remains blocked.
