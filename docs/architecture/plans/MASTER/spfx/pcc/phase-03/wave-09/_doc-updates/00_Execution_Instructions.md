# 00 — Execution Instructions

## Role

You are a local code agent working in the `hb-intel` repository. You are performing a documentation-only architecture update for Project Control Center Phase 3 / Wave 9.

## Repository

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Update Wave 9 planning / blueprint / roadmap documentation so Wave 9 is redefined from a narrow `Job Startup Checklist` implementation into the broader:

```text
Project Lifecycle Readiness Center
```

This module is a lifecycle readiness, risk, evidence, accountability, and action-control module seeded by the exact startup, safety, and closeout checklist items saved in:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

## Required Behavior

Do not re-read files that are still within your current context or memory. Read files only when needed to verify repo truth, check exact content, or inspect paths not already loaded.

## Mandatory First Steps

Run and record:

```bash
pwd
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git status --short
find docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files -maxdepth 2 -type f | sort
```

Then inspect, without modifying, the relevant docs listed in `02_Document_Update_Map.md`.

## Source Checklist Definition Files

Treat the files in this directory as the authoritative extracted item library for Wave 9 documentation updates:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

Expected file types may include Markdown, CSV, and JSON. Do not assume exact filenames until you list the directory.

You must verify that the definition files include all three checklist families:

1. Startup / Job Start up Checklist.
2. Safety / Jobsite Safety Checklist.
3. Closeout / Project Closeout & Pre Cert of Occupancy checklist.

## Scope

Documentation update only.

Primary allowed documentation targets:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
```

Plan-library paths may be read for source material and checklist definitions:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/
```

Do not edit `docs/architecture/plans/**` unless the user has explicitly authorized that path in the current local session and repo governance allows it. If a guard blocks plan-library writes, do not bypass it; update blueprint docs and report the proposed plan-library edits instead.

## Forbidden Changes

Do not:

- overwrite unrelated working-tree changes;
- introduce package dependencies;
- change `pnpm-lock.yaml`;
- run `pnpm install`, `pnpm add`, `npm install`, `yarn add`, or equivalents;
- package or deploy SPFx;
- mutate SharePoint, Entra, Microsoft 365, Procore, Sage, Document Crunch, Adobe Sign, safety systems, or other external systems;
- introduce secrets, app settings, tenant IDs, API keys, or credentials;
- implement live Graph, PnP, SharePoint REST, Procore, Document Crunch, Adobe Sign, Sage, or safety-platform operations;
- add backend write routes;
- create workflow execution paths;
- add app-catalog or `.sppkg` artifacts;
- perform production rollout or tenant validation;
- claim implementation exists when only documentation is updated.

## Required Guardrails to Preserve

- PCC is the SharePoint-hosted project operating surface; it is not a Procore clone.
- Procore may remain an external reference/deep-link/import lineage source, but Wave 9 checklist completion state belongs in PCC unless a later phase explicitly changes this.
- HB Document Control Center / SharePoint project records are the evidence/document source of record.
- Wave 8 remains the shared Project Readiness Module Framework dependency.
- Wave 9 should use the startup, safety, and closeout checklists as source-seeded item libraries, not as a static three-tab PDF replacement.
- Priority Actions, Approvals/Checkpoints, Responsibility Matrix, Team & Access, Documents, Site Health, and External Systems should be integrated at the architecture/read-model level only unless later authorized.

## Validation Commands

Use targeted validation. Recommended minimum:

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/**/*.md
md5 pnpm-lock.yaml
```

If Markdown glob expansion fails in your shell, use an equivalent targeted Prettier command for touched Markdown files only.

Do not run broad builds or tests unless touched files or repo standards require it.

## Closeout Requirements

Final response must include:

- starting branch and HEAD;
- starting working-tree status and whether unrelated changes existed;
- files inspected;
- files changed;
- summary of each documentation update;
- validation commands and outputs;
- `pnpm-lock.yaml` MD5 before and after;
- explicit confirmation of forbidden-scope exclusions;
- unresolved decisions or risks;
- commit hash if committed;
- commit summary and description.
