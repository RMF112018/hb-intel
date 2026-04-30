# Prompt 05 — Wave 6 Manager Execution Queue and Manual IT Posture

## Objective

Add the Team & Access manager execution queue visibility and manual IT/backend-gated execution posture without creating execution paths.

## Universal instructions for the code agent

- Do not re-read files that are still within your current context or memory.
- Do not implement future-wave work.
- Do not broaden scope to tenant mutation or permission execution.
- Do not modify package versions, manifests, workflows, lockfile, deployment files, or app-catalog artifacts unless this prompt explicitly authorizes it.
- Do not use capabilities/personas as real authorization unless the repo already implements the authoritative auth path and this prompt explicitly authorizes it.
- Do not create hidden write paths.
- Do not create Graph/PnP/SharePoint REST runtime.
- Do not introduce Procore, Document Crunch, or Adobe Sign runtime.
- Do not create automated Site Health repair or provisioning execution.
- Do not create automated SharePoint group updates.
- Do not create automated Teams membership updates.
- Do not create backend write routes.
- Do not create deployment, `.sppkg`, app-catalog, tenant, Azure, Graph, PnP, Procore, Document Crunch, or Adobe Sign commands.
- Keep fixture mode as the default.
- Keep backend mode explicit opt-in only.
- Preserve no-right-edge-overflow, host-aware SPFx behavior, and no fake SharePoint shell duplication.


## Repo files to inspect

Read only what is needed, and do not re-read files still in your current context.

Required:

- `docs/architecture/blueprint/sp-project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-5/Wave_5_Closeout.md`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/`
- `apps/project-control-center/src/api/`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `packages/models/src/pcc/TeamAccess.ts`
- `packages/models/src/pcc/fixtures/TeamAccessFixtures.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `backend/functions/src/hosts/pcc-read-model/`
- package files for touched packages.


## Allowed files to modify

- `apps/project-control-center/src/surfaces/teamAccess/PccAccessExecutionQueue.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessExecutionQueue.test.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccExecutionStatusPanel.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccExecutionStatusPanel.test.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.module.css`
- Team & Access adapter/view-model files as needed

## Forbidden files and paths

Do not modify:

- `pnpm-lock.yaml`
- root `package.json` unless explicitly authorized by a later user instruction
- any package version fields
- `.github/**`
- SPFx manifest files
- `config/package-solution.json` or equivalent SPFx packaging artifacts
- generated `dist/**`
- `.sppkg` files
- app catalog or deployment files
- tenant provisioning artifacts
- Procore, Document Crunch, Adobe Sign, Site Health repair, or provisioning executor code
- unrelated apps/packages


## Required implementation details

1. Render manager execution queue sections:
   - pending manual IT execution;
   - completed manual;
   - backend-gated later;
   - preview only.
2. Use existing execution statuses:
   - `preview-only`
   - `manual-it-handled`
   - `backend-gated-later`
3. Represent `approved-pending-execution` as pending manual IT action, not permission execution.
4. Required copy:
   - “Manual IT handled”
   - “Approved, pending execution”
   - “Backend-gated later”
   - “No permission change has been executed”
5. Show manager-persona chips using shared `TEAM_ACCESS_MANAGER_PERSONAS`.
6. Do not add any action that executes permission changes.
7. Do not introduce queue persistence or backend write-through.

## Guardrails



- Preserve fixture-default behavior.
- Preserve explicit backend opt-in only.
- Preserve read-only/read-model posture.
- Do not add write-method literals in backend/client read-model files.
- Do not introduce direct runtime imports for Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign.
- Do not imply that any permission change has been executed.

## Required tests

- Tests must prove all execution statuses render visible labels.
- Tests must prove approved-pending-execution rows show manual IT pending copy.
- Tests must prove no buttons/links execute permission or launch mutation.
- Tests must prove status is not color-only.
- Tests must prove manager persona display uses shared model values only.

## Required validation commands

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check

pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build

md5 pnpm-lock.yaml
git diff --check
git diff --stat HEAD
git diff --name-only HEAD
```

## Required closeout report

At the end, report:

- Files changed.
- What was implemented.
- What was intentionally not implemented.
- Tests run and results.
- `pnpm-lock.yaml` md5 before and after.
- Confirmation of no package/version/manifest/workflow/deployment changes.
- Confirmation of no tenant mutation, no Graph/PnP/SharePoint REST runtime, no Procore runtime, no Document Crunch runtime, no Adobe Sign runtime.
- Confirmation of no SharePoint group mutation, no Teams membership mutation, no backend write routes, no permission execution, no approval/workflow execution beyond preview/read-model UI.
- Any remaining blockers.
- Recommended next prompt.


## Expected commit summary

```text
feat(spfx-pcc): add team access execution queue preview
```

## Expected commit description

```text
Adds Team & Access manager execution queue and manual IT/backend-gated posture.

Execution queue remains visual/read-model only. No permission mutation, no SharePoint group mutation, no Teams membership mutation, no backend writes, no package/lockfile/manifest/workflow/deployment changes.

```
