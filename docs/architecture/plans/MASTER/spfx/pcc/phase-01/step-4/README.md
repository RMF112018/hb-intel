# PCC Phase 1 Step 4 Prompt Package

## Purpose

This package instructs a local code agent to execute:

```text
Phase 1 Step 4 — Per-Family Schema Population
```

Phase 1 Step 3 created field-consolidation artifacts for the 12 remaining Project Site Template schema families. Phase 1 Step 4 uses those field maps to populate the 12 remaining family schemas under:

```text
packages/project-site-template/schemas/families/
```

This package is split into dependency-ordered waves to reduce risk.

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_1_Step_4_Execution_Strategy.md` | Read first. Defines scope, sequence, guardrails, and validation expectations. |
| `02_Phase_1_Step_4_Wave_1_Core_Families.md` | Populate `template-manifest`, `site`, `settings`, and `permissions`. |
| `03_Phase_1_Step_4_Wave_2_Content_and_Experience_Families.md` | Populate `libraries`, `lists`, `modules`, and `pages`. |
| `04_Phase_1_Step_4_Wave_3_Workflow_Integration_Operational_Families.md` | Populate `workflows`, `integrations`, `provisioning-validation`, and `site-health`. |
| `05_Phase_1_Step_4_Architecture_Gap_Escalation_If_Required.md` | Optional gap escalation if any family cannot be populated from field maps without a new architecture decision. |
| `06_Phase_1_Step_4_Closeout_Validation.md` | Validate all populated family schemas and create closeout. |
| `07_Phase_1_Step_4_Final_Commit_Summary.md` | Final commit-summary helper. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Expected Output

Step 4 should populate the 12 remaining schema family files:

```text
packages/project-site-template/schemas/families/template-manifest.schema.json
packages/project-site-template/schemas/families/settings.schema.json
packages/project-site-template/schemas/families/permissions.schema.json
packages/project-site-template/schemas/families/site.schema.json
packages/project-site-template/schemas/families/pages.schema.json
packages/project-site-template/schemas/families/libraries.schema.json
packages/project-site-template/schemas/families/lists.schema.json
packages/project-site-template/schemas/families/modules.schema.json
packages/project-site-template/schemas/families/workflows.schema.json
packages/project-site-template/schemas/families/integrations.schema.json
packages/project-site-template/schemas/families/site-health.schema.json
packages/project-site-template/schemas/families/provisioning-validation.schema.json
```

It may also update package documentation, root contract status, and closeout documentation.

## Non-Negotiable Guardrail

Step 4 is schema population only. It must not implement backend provisioning, SPFx, SharePoint/Graph calls, Procore integration, CI, tests, generated artifacts, package publishing, or deployment.
