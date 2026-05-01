# Prompt 02 — Wave 8 Documentation Target Definition

## Role

You are a senior software architecture, construction-operations, and workflow-design consultant implementing documentation updates in the local repo:

```text
/Users/bobbyfetting/hb-intel
```

## Critical instruction

Do not re-read files that are still within your current context or memory. Use the prior prompt’s audit results first, then inspect only the target files required for safe edits.

## Objective

Update the PCC architecture documentation so **Phase 3 / Wave 8** is clearly defined as the reusable **Project Readiness Module Framework**, with the user-facing module name **Project Readiness Center**.

This is documentation-first. Do not implement runtime workflow functionality.

## Target architecture language to establish

Use this distinction consistently:

```text
Technical wave / framework name:
Project Readiness Module Framework

User-facing surface name:
Project Readiness Center
```

The Wave 8 module must be defined as the readiness operating framework for PCC, not as:
- a static Project Readiness dashboard;
- a checklist page;
- a generic status card;
- a collection of links;
- a duplicate of Priority Actions, Approvals, Site Health, Team & Access, or Document Control;
- the Wave 9 Startup Checklist.

## Documentation files to update

Edit only the docs that are necessary and currently contain outdated/incomplete Wave 8 language:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
```

Create this folder/file if missing:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Framework_Scope_Lock.md
```

Do **not** edit:

```text
docs/architecture/plans/**
```

unless separately and explicitly authorized.

## Required Wave 8 definition

Add or refine documentation so Wave 8 is the shared framework that future structured workflow modules plug into.

Wave 8 should support:

- readiness domains;
- project lifecycle/stage gates;
- readiness items;
- readiness signals;
- blockers;
- evidence requirements;
- source-module references;
- owner/assignee/reviewer posture;
- role/action authority;
- readiness scoring/posture;
- blocker-first exception handling;
- escalation posture;
- audit/history posture;
- integration with Priority Actions, Document Control, Approvals/Checkpoints, Team & Access, External Systems, Site Health, and later structured modules.

## Recommended readiness domains

Document these as the target MVP/future-aware taxonomy:

1. Project Setup
2. Team & Access
3. Documents / Project Record
4. Startup / Mobilization
5. Safety / QAQC
6. Permits / Jurisdiction
7. Procurement / Buyout
8. Responsibility / RACI
9. Constraints
10. Schedule / Milestones
11. Financial / Accounting Setup
12. External Systems
13. Site Health
14. Closeout / Turnover

Clarify that Wave 8 establishes the taxonomy and framework. Later waves own module-specific detail.

## Recommended lifecycle gate model

Document these gates:

1. Lead / Pursuit
2. Estimating
3. Preconstruction
4. Turnover to Operations
5. Startup / Mobilization
6. Active Construction
7. Closeout Planning
8. Substantial Completion
9. Turnover / Warranty
10. Archived / Lessons Learned

Also document how these map to the existing PCC `PccProjectStage` values:
- `lead`
- `estimating`
- `preconstruction`
- `active_construction`
- `closeout`
- `warranty`

Clarify that `Archived` remains a `ProjectStatus`, not a lifecycle stage, unless current repo truth says otherwise.

## Required readiness item shape

Document the intended readiness item/checkpoint shape:

- id;
- domain;
- lifecycle gate;
- source module;
- title;
- description;
- owner persona;
- assigned user;
- reviewer persona;
- due date;
- status;
- severity;
- blocker state;
- evidence requirement;
- evidence status;
- source document/evidence link;
- dependency references;
- escalation path;
- approval/checkpoint requirement;
- audit/history records;
- related priority action reference;
- confidence/source-health posture.

## Required scoring/posture model

Document a conservative MVP approach:

- readiness status is blocker-first;
- domain posture is more important than one blended score;
- unresolved critical blockers override a high numeric score;
- evidence-backed confidence is tracked separately from completion;
- score trend is future enhancement, not required in the first documentation correction pass.

Suggested posture values:

```text
ready
at-risk
blocked
not-started
not-applicable
unknown
```

Suggested confidence values:

```text
high
medium
low
unknown
```

## Integration posture

Clearly document that Wave 8 aggregates and normalizes readiness signals from source modules. It must not duplicate future module detail.

Source modules:
- Wave 6 Team & Access
- Wave 7 HB Document Control Center
- Wave 9 Startup / Lifecycle Checklist
- Wave 10 Permit Log
- Wave 11 Responsibility Matrix / RACI
- Wave 12 Constraints Log
- Wave 13 Buyout Log
- Wave 14 Approvals / Checkpoints
- Wave 15 External Systems
- Wave 17 Site Health
- future closeout workflows

## Guardrails to document

Include these explicitly:

- Do not duplicate future module data unnecessarily.
- Do not create competing workflows where later modules own the detail.
- Do not allow readiness scoring to hide critical blockers.
- Do not make readiness purely manual where module signals can later feed it.
- Do not imply runtime integrations unless implemented.
- Do not mutate external systems.
- Do not bypass role/action authority.
- Do not treat Project Readiness Center as the Wave 9 checklist.
- Do not implement tenant, Graph, Procore, Adobe, Document Crunch, Sage, or SharePoint mutations in Wave 8.

## Scope-lock file contents

`Wave_8_Project_Readiness_Framework_Scope_Lock.md` must include:

- objective;
- current repo-truth summary;
- target module name;
- framework vs surface decision;
- readiness domains;
- lifecycle gates;
- readiness item model;
- scoring/posture model;
- role/action model summary;
- integration model;
- source-of-record posture;
- guardrails;
- acceptance criteria;
- explicit exclusions;
- recommended implementation sequence;
- validation commands.

## Acceptance criteria

The documentation update passes when:

- Wave 8 is consistently defined as the shared Project Readiness Module Framework.
- Project Readiness Center is the recommended user-facing name.
- Wave 9 remains a downstream checklist module, not the Wave 8 framework.
- Wave 10–14 are downstream modules that plug into Wave 8.
- Priority Actions, Approvals, Site Health, Team & Access, and Document Control relationships are clear and non-duplicative.
- Guardrails are explicit.
- No runtime implementation is claimed.
- No `docs/architecture/plans/**` edits are made.

## Validation commands

Run targeted checks:

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Framework_Scope_Lock.md
```

If Prettier check fails due to pre-existing formatting, do not mass-format the repo. Apply narrow markdown formatting fixes only to touched files.

## Commit format

Do not commit until Prompt 04 validation is complete. Suggested final commit will be provided in Prompt 04.
