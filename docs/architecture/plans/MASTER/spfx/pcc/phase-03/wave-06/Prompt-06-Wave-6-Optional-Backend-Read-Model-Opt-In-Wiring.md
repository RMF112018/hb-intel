# Prompt 06 — Wave 6 Optional Backend Read-Model Opt-In Wiring

## Objective

Optionally wire Team & Access to the existing PCC read-model seam using a read-only GET route and explicit backend opt-in. Execute this prompt only after Prompts 02–05 are complete and local repo truth confirms the route/client are still missing.

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

Allowed only if still missing after local audit:

- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts` only if interface mismatch exists
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts` only if implementation mismatch exists
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- direct tests for the above api files
- `apps/project-control-center/src/surfaces/teamAccess/useTeamAccessReadModel.ts`
- `apps/project-control-center/src/surfaces/teamAccess/useTeamAccessReadModel.test.ts`
- `apps/project-control-center/src/surfaces/teamAccess/teamAccessAdapter.ts`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx`
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessSurface.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/tests/PccApp.optIn.test.tsx`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/README.md`

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

1. Add exactly one backend route if absent:
   - name: `getPccProjectTeamAccess`
   - method: `GET`
   - path: `pcc/projects/{projectId}/team-access`
   - handler delegates to `provider.getTeamAccess(projectId)`
2. Do not add POST/PUT/PATCH/DELETE routes.
3. Extend SPFx client route metadata and interface with `getTeamAccess(...)`.
4. Extend fixture and backend client implementations.
5. Use the existing backend client as the sole `fetch(` callsite.
6. Add Team & Access read-model hook/content using the Wave 4 Project Home pattern:
   - default no client: fixture/direct preview path;
   - explicit fixture mode: fixture envelope;
   - explicit backend mode with base URL: GET `/team-access`;
   - backend unavailable: safe state, no crash.
7. Update `PccSurfaceRouter` so `readModelClient` is threaded to exactly two surfaces: Project Home and Team & Access.
8. Update guardrail tests narrowly. Do not broaden exceptions beyond exact Team & Access needs.
9. Do not treat backend data as authorization.
10. Do not create writes or persistence.

## Guardrails

This prompt is optional. If local repo truth shows the `team-access` route/client already exist, do not duplicate them. If local repo truth shows guardrails cannot be updated safely without broadening runtime access, stop and report a blocker.

- Preserve fixture-default behavior.
- Preserve explicit backend opt-in only.
- Preserve read-only/read-model posture.
- Do not add write-method literals in backend/client read-model files.
- Do not introduce direct runtime imports for Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, or Adobe Sign.
- Do not imply that any permission change has been executed.

## Required tests

- Backend route tests must prove all registered PCC read-model routes are GET-only and include `team-access`.
- Backend no-runtime tests must continue to pass.
- SPFx backend client tests must prove `getTeamAccess` calls the canonical GET URL.
- Fixture client tests must prove `getTeamAccess` returns the existing Team & Access fixture envelope and backend-unavailable fallback.
- Opt-in integration tests must prove:
  - default mount: no fetch;
  - explicit fixture mode: no fetch;
  - backend mode on Team & Access: exactly one GET to `/team-access`;
  - Project Home still calls only its three expected GETs;
  - non-opted surfaces do not invoke client methods.
- Guardrail tests must prove `fetch(` callsite allowlist remains unchanged.
- Guardrail tests must prove write-method literals are absent from backend/client read-model files.

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
feat(spfx-pcc): wire team access read model opt-in
```

## Expected commit description

```text
Optionally wires Team & Access to the PCC read-model seam using a read-only GET route and explicit backend opt-in.

Adds no write routes, no permission execution, no Graph/PnP/SharePoint REST runtime, no package/lockfile/manifest/workflow/deployment changes. Fixture mode remains default.

```
