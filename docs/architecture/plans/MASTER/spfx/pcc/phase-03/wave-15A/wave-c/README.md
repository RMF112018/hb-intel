# Wave C — Project Context and Surface Header Remediation Package

## Objective

Use this package to guide a local code agent through Wave C of the PCC Phase 3 Wave 15A UI Doctrine Remediation effort.

The target outcome is a consistent project context and surface header system across the Project Control Center without broad visual redesign or backend/API scope creep.

## Repo-truth summary

The audited repo already contains a first implementation of the Wave C pattern:

- `apps/project-control-center/src/surfaces/shared/PccSurfaceContextHeader.tsx`
- `apps/project-control-center/src/tests/PccSurfaceContextHeader.contract.test.tsx`
- surface integrations under:
  - `projectHome`
  - `teamAccess`
  - `documents`
  - `projectReadiness`
  - `approvals`
  - `externalSystems`
  - `controlCenterSettings`
  - `siteHealth`

The remaining remediation is primarily about hardening:

- stop hard-coded project labels such as `Project 26-000-00 · ...` from drifting across surfaces;
- connect shell selected project state to the header/context path where repo contracts allow it;
- make project number, project name, phase/status, read-only/degraded posture, next action, and freshness behavior explicit and testable;
- prevent duplicate hierarchy between `PccProjectIntelligenceHeader`, `PccSurfaceContextHeader`, and individual card titles;
- verify responsive and accessibility behavior across all eight surfaces.

## Recommended execution

Run prompts in order:

```text
prompts/Prompt_01_Project_Context_Scope_Lock_And_File_Map.md
prompts/Prompt_02_Shared_Project_Context_Model_And_Surface_Header_Component.md
prompts/Prompt_03_Apply_Surface_Header_To_All_Current_PCC_Surfaces.md
prompts/Prompt_04_Project_Context_State_Source_Confidence_And_Responsive_Behavior.md
prompts/Prompt_05_Cross_Surface_Context_Tests_And_Screenshot_Evidence.md
prompts/Prompt_06_Wave_C_Closeout_Evidence_And_Handoff.md
```

The first prompt is mandatory. It determines whether the branch already contains the Prompt 03 implementation and prevents the agent from rewriting functioning shared primitives.

## Scope boundaries

In scope:

- shared PCC project context model or view model;
- shared surface header primitive;
- surface-level header integration and consistency;
- source confidence and posture copy already exposed by existing models;
- tests and screenshot/evidence docs;
- responsive and accessibility hardening.

Out of scope:

- backend/API route creation;
- Graph/PnP/Procore live integration;
- app-catalog upload or `.sppkg` generation;
- broad page redesign;
- replacing the Wave B shell/nav system;
- changing `PCC_MVP_SURFACE_IDS` or router IDs unless repo truth proves a bug.

## First local-agent prompt

Execute:

```text
prompts/Prompt_01_Project_Context_Scope_Lock_And_File_Map.md
```

It must validate source ownership, current implementation state, tests/evidence requirements, and remediation order before code changes.
