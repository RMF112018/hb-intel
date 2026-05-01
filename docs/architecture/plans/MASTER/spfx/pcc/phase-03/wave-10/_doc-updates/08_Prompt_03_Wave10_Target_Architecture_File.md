# Prompt 03 — Create Wave 10 Target Architecture File

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to create the complete Wave 10 target architecture documentation.

## Global Guardrails

- Do not re-read files that are still within current context or memory.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package or deploy SPFx.
- Do not mutate tenant or external systems.
- Do not introduce secrets/app settings.
- Do not perform live AHJ, Procore, Microsoft Graph, Adobe, Document Crunch, Sage, Compass, or other external operations.
- Use targeted docs validation first.
- Keep AHJ interactions to launcher links only unless a later implementation phase explicitly authorizes more.
- Preserve workbook source traceability.
- Preserve Wave 10 relationship to Wave 8 Project Readiness and Wave 14 Approvals / Checkpoints.
- Preserve repo-truth citations and actual file paths.


## Primary Output File

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md
```

## Required Source

Use this package file as the source architecture:

```text
04_COMPLETE_Target_Architecture_Permit_Inspection_Control_Center.md
```

## Required Content

The target architecture file must include:

- official module identity
- legacy naming note
- module purpose
- product principles
- source-of-record posture
- command-center UX model
- permit lifecycle lane
- inspection readiness lane
- failed/reinspection queue
- AHJ launcher panel
- record detail drawer
- permit data model
- inspection data model
- AHJ/jurisdiction profile
- fee exposure record
- required chat fields:
  - `revision`
  - `applicationValue`
  - `permitFee`
  - `reInspectionFee`
- permit statuses
- inspection statuses
- fee statuses
- evidence statuses
- status transition rules
- role/action model
- Priority Actions generation rules
- Project Readiness integration
- Approvals / Checkpoints integration
- HB Document Control Center evidence integration
- template/configuration model
- reporting model
- audit model
- import/migration model
- guardrails
- acceptance criteria

## Supporting Files

Create or update if appropriate:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Permit_Inspection_Control_Center_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md
```

## Validation

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/*.md
md5 pnpm-lock.yaml
git status --short
```
