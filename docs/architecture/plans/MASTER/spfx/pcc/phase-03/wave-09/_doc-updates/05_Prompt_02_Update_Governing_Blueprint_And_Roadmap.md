# 05 — Prompt 02: Update Governing Blueprint and Roadmap Documentation

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. You have already completed Prompt 01 no-write audit and have current repo truth in context.

## Objective

Update governing PCC blueprint and roadmap documentation so Wave 9 is consistently redefined as:

```text
Project Lifecycle Readiness Center
```

## Instructions

Do not re-read files that are still within your current context or memory. Use the Prompt 01 audit and only reopen files you must edit or verify.

## Required Updates

Update applicable governing docs identified in Prompt 01, likely including:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
```

Only update files that actually contain stale or incomplete Wave 9 language.

## Required Terminology

Use:

```text
Wave 9 — Project Lifecycle Readiness Center
```

Use `Job Start up Checklist` only when referring to the source PDF/template family.

## Required Content Updates

Documentation must state:

- Wave 9 is seeded by startup, safety, and closeout checklist definition files.
- Wave 9 is not a static checklist, PDF replacement, Procore clone, or three-tab form dump.
- The module manages lifecycle readiness, risk, accountability, evidence, gate posture, and action signals.
- Startup, safety, and closeout are checklist families/source libraries within one lifecycle module.
- Wave 8 remains the shared Project Readiness Module Framework dependency.
- HB Document Control Center / SharePoint project record owns evidence/document links.
- Procore remains external reference/deep-link/import lineage only unless later approved.
- Priority Actions and Approvals/Checkpoints receive readiness blockers and gate prompts in read-model/planning posture.

## Consistency Rules

After edits:

- No roadmap table should define Wave 9 only as `Job Startup Checklist`.
- No implementation plan should describe Wave 9 only as an item-level startup workflow.
- Project Home rollups should be allowed to show lifecycle readiness, not only startup readiness.
- Safety and closeout checklist families should be visible in Wave 9 context.
- Do not move Wave 10 Permit Log, Wave 11 Responsibility Matrix, Wave 12 Constraints Log, Wave 13 Buyout Log, or Wave 14 Approvals/Checkpoints unless repo truth demands it.

## Validation

Run:

```bash
git diff --check
```

Then provide:

- files changed;
- exact Wave 9 naming decisions;
- any files intentionally not edited;
- remaining contradictions.

Do not commit yet unless the user/local workflow explicitly says to commit after each prompt.
