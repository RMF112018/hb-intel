# Repo Truth Findings to Verify Locally

## Purpose

These findings were used to frame the package and must be verified in the local repo before edits.

## Expected Current State

- `packages/models/src/pcc/PccMvpSurfaces.ts` includes `approvals` in `PCC_MVP_SURFACE_IDS`.
- `PCC_MVP_SURFACES.approvals` uses display name `Approvals` and primary work center `action-center`.
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` is a preview surface and states no approve/reject execution is enabled.
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx` renders fixture-driven approval/checkpoint status.
- `packages/models/src/pcc/ApprovalCheckpoint.ts` has limited states such as `pending`, `approved`, `rejected`, `waived` and states that routing, notifications, and persistence are out of scope.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` identifies Wave 14 as `Approvals / Checkpoints`.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md` shows Wave 14 depends on Waves 6 and 8-13.
- Wave 13G authority path should exist locally if already saved by the user.

## Required Local Verification

The local agent must verify:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Hard Stop

If the local repo contradicts these findings in a way that changes the target architecture, stop and report before editing.
