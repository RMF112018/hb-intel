# Prompt 01 — Wave 6 Repo-Truth Gate and Scope Lock

## Objective

Conduct a local repo-truth gate for Wave 6 and create/confirm Wave 6 planning records. Do not implement source code in this prompt.

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

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Repo_Truth_Audit.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Wave_6_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Wave_6_Closed_Decisions.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Wave_6_Implementation_Sequence.md`

If these files already exist, update them only to align with live repo truth.

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

1. Confirm current branch, status, and HEAD.
2. Confirm Wave 5 closeout exists and marks Wave 5 complete.
3. Confirm Wave 5A posture: optional, controlled tenant revalidation, not a Wave 6 blocker.
4. Confirm current Team & Access shared models, fixtures, SPFx preview files, backend provider support, and missing HTTP/client route support.
5. Record final Wave 6 in-scope and out-of-scope boundaries.
6. Record closed decisions W6-OD-001 through W6-OD-010.
7. Do not modify source code.

## Guardrails



- Preserve fixture-default behavior.
- Preserve explicit backend opt-in only.
- Preserve read-only/read-model posture.
- Do not add write-method literals in backend/client read-model files.
- Do not introduce direct runtime imports for Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign.
- Do not imply that any permission change has been executed.

## Required tests

- `git status --short` must be captured before and after.
- `md5 pnpm-lock.yaml` must be captured before and after.
- `git diff --check` must pass.
- If only docs changed, do not run package tests unless local policy requires it.
- Confirm no source/package/lockfile/manifest/workflow/deployment files changed.

## Required validation commands

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
md5 pnpm-lock.yaml
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
docs(pcc): open wave 6 team access scope lock
```

## Expected commit description

```text
Opens Phase 3 Wave 6 planning for the PCC Team & Access module.

Documents repo-truth audit findings, the Wave 6 scope lock, closed decisions, implementation sequence, and guardrails. No source, package, lockfile, manifest, workflow, deployment, tenant, backend write, permission execution, or runtime integration changes.

```
