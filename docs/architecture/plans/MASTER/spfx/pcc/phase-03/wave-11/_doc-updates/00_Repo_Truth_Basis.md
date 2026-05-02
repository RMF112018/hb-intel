# Repo-Truth Basis and Known Constraints

Generated: 2026-05-02

## Scope

This package is based on:

- the current chat session;
- prior workbook extraction of the Responsibility Matrix templates;
- prior repo-truth observations from the `RMF112018/hb-intel` GitHub connector;
- web research conducted for RACI/RAM, construction responsibility allocation, decision-rights, and construction workflow assignment patterns;
- the finalized target architecture direction provided in the conversation.

The local agent must still verify all repo truth in the local working tree before making documentation edits.

## Current Repo Truth Observed in Session

- Repository: `RMF112018/hb-intel`
- Default branch observed via GitHub connector: `main`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` identifies Wave 11 as `Responsibility Matrix`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md` identifies Wave 11 as `Responsibility Matrix`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md` identifies `Responsibility Matrix` as MVP priority under Project Readiness, with target product state: structured item-level in-app workflow including owner-contract responsibility mapping.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md` includes `Responsibility Matrix` in structured workflow target scope.
- `packages/models/src/pcc/WorkflowModules.ts` already includes the workflow module ID `responsibility-matrix` with display name `Responsibility Matrix`.
- The high-level target architecture blueprint already contains a Responsibility Matrix Center concept, including the need to separate contract-party classification from internal RACI assignment.

## Current Wave 11 Posture

Wave 11 has governing-plan recognition and model-registry presence, but the module still needs comprehensive Wave 11 documentation under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
```

## Required Local Repo Commands

The local agent must run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Known Constraints

- Do not assume the current chat repo observations are sufficient.
- Do not begin edits before confirming current branch, HEAD, working-tree state, and relevant Wave 11 file presence.
- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not change runtime code, packages, lockfiles, manifests, workflows, app settings, tenant configuration, or deployment artifacts.
- Do not imply that Wave 11 runtime implementation exists.
- Do not imply legal interpretation of contract documents.
- Do not imply external-system sync, writeback, or mutation.

## Governing Alignment Requirements

Wave 11 documentation must align with:

- Wave 8 Project Readiness Module Framework;
- Wave 9 Project Lifecycle Readiness Center;
- Wave 10 Permit & Inspection Control Center;
- Wave 14 Approvals / Checkpoints;
- Team & Access;
- HB Document Control Center;
- Priority Actions Rail;
- External Systems launcher/reference posture;
- Project Home / Matrix Health rollup posture.

## Likely Governing Docs to Update

Only update where repo truth confirms the need:

```text
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_MVP_Scope.md
```
