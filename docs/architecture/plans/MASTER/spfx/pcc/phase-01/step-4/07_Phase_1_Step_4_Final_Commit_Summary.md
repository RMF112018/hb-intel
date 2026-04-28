# Prompt 07 — Phase 1 Step 4 Final Commit Summary

Use this prompt after all Step 4 waves and closeout validation are complete.

## Objective

Produce the final commit summary and description for Phase 1 Step 4.

Do not modify files in this prompt unless the closeout report is missing its commit summary / description section.

## Required Output

Output only the commit summary and description.

Suggested summary:

```text
feat(project-site-template): populate family schemas
```

Suggested description:

```text
Populate the 12 remaining Project Site Template family schemas for Phase 1 Step 4.

Uses the Phase 1 Step 3 field-consolidation artifacts to populate template-manifest, site, settings, permissions, libraries, lists, modules, pages, workflows, integrations, provisioning-validation, and site-health schema families. Reconciles scaffold-local mvp_status shorthand to the canonical Decision Closure status taxonomy and updates the root template contract to mark all 14 families populated while keeping fullExtractionComplete false pending the Phase 1 Step 5 validation harness.

Schema population only: no backend, SPFx, provisioning, Procore integration, CI, generated files, dependencies, scripts, deployment artifacts, or runtime consumers.
```

If Prompt 05 was required, include one sentence explaining the architecture-gap escalation and whether Step 4 remains blocked.
