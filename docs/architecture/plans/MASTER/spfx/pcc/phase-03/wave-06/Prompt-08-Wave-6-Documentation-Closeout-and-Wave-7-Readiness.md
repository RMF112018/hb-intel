# Prompt 08 — Wave 6 Documentation Closeout and Wave 7 Readiness

## Objective

Close Wave 6 with documentation-only updates that accurately reflect implemented repo truth and prepare Wave 7 Document Control Center planning.

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

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Wave_6_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-6/Wave_6_Closed_Decisions.md` only for final status updates
- `apps/project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/README.md` only if current phase/wave table must be corrected
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md` only if status truth requires a narrow docs-only update
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md` only if status truth requires a narrow docs-only update

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

1. Create a Wave 6 closeout record.
2. Summarize prompt-by-prompt commits.
3. Document final Team & Access runtime posture.
4. Document whether Prompt 06 optional backend opt-in was executed or deferred.
5. Document validation evidence.
6. Document lockfile md5 unchanged.
7. Document no package/version/manifest/workflow/deployment changes.
8. Document no tenant mutation, no permission execution, no backend writes, no Graph/PnP/SharePoint REST runtime.
9. State Wave 7 readiness and remaining blockers.
10. Do not modify source code in this prompt.

## Guardrails



- Preserve fixture-default behavior.
- Preserve explicit backend opt-in only.
- Preserve read-only/read-model posture.
- Do not add write-method literals in backend/client read-model files.
- Do not introduce direct runtime imports for Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign.
- Do not imply that any permission change has been executed.

## Required tests

- Docs-only validation:
  - `git status --short`
  - `md5 pnpm-lock.yaml`
  - `git diff --check`
  - `git diff --stat HEAD`
  - `git diff --name-only HEAD`
- If any source files are unexpectedly changed, stop and report before committing.

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
docs(pcc): close wave 6 team access
```

## Expected commit description

```text
Closes Phase 3 Wave 6 for Team & Access.

Documents implemented UI/read-model posture, optional backend opt-in disposition, validation evidence, guardrails, no-runtime/no-mutation confirmations, and Wave 7 readiness. Documentation-only closeout with no source/package/lockfile/manifest/workflow/deployment changes.

```
