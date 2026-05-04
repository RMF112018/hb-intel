# Prompt 01 — Repo Truth and Scope Lock

## Objective

Audit current repo truth and lock Phase 14 documentation scope before any edits.

## Required Commands

Run from `/Users/bobbyfetting/hb-intel`:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required File Inspection

Inspect, without editing:

- `packages/models/src/pcc/PccMvpSurfaces.ts`
- `packages/models/src/pcc/ApprovalCheckpoint.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccApprovalsCheckpointsCard.tsx`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/`

Do not re-read files already inspected in the current session unless repo state changed.

## Required Output

Create or update a documentation note under the Wave 14 planning path recording:

- branch;
- HEAD;
- last 12 commits;
- worktree state;
- lockfile MD5;
- current approvals surface/model status;
- current Wave 14 documentation status;
- Wave 13G verification status;
- hard scope lock.

## Scope Lock

Allowed:

- markdown documentation;
- JSON artifacts;
- cross-reference updates;
- closeout docs.

Blocked:

- runtime implementation
- source-code implementation outside documentation and JSON planning artifacts
- package.json or pnpm-lock.yaml mutation
- SPFx-to-Procore, SPFx-to-Sage, SPFx-to-Graph write execution
- Power Automate runtime dependency
- tenant/list/group/security mutation
- Procore write-back
- Sage write-back
- approval execution into external systems
- production rollout or deployment

## Validation

Run Prettier check against any touched markdown/json. Validate JSON if touched.

## Closeout

Return commit summary/description only after validation passes.
