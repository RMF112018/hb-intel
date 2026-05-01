# Prompt 01 — Wave 10 Implementation Readiness Audit

## Objective

You are working in `/Users/bobbyfetting/hb-intel`.

Perform a read-only implementation readiness audit for Phase 3 / Wave 10 — Permit & Inspection Control Center. Do not edit files. Do not stage files. Do not commit.

The goal is to confirm the live local repo state, identify exact implementation targets, verify whether any Wave 10 runtime work already exists, and produce the exact allowed file list for Prompt 02.

## Context Discipline

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Required Repo-Truth Commands

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -8
md5 pnpm-lock.yaml
```

Stop and report before continuing if:

- the working tree is dirty with unrelated changes;
- the current branch is not the intended implementation branch;
- `pnpm-lock.yaml` has changed unexpectedly;
- existing Wave 10 runtime implementation already exists;
- package scripts differ from the expected validation commands.

## Repo-Truth Files to Inspect

Inspect only as needed:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Permit_Inspection_Control_Center_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `packages/models/src/pcc/WorkflowModules.ts`
- `packages/models/src/pcc/ProjectReadinessFramework.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/PriorityActions.ts`
- `packages/models/src/pcc/index.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccBackendReadModelClient.ts`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx`
- `apps/project-control-center/package.json`
- `packages/models/package.json`
- `backend/functions/package.json`
- `package.json`

## Review Questions

Answer:

1. Does local repo truth confirm Wave 10 is documentation-ready and implementation-not-started?
2. Does `WorkflowModules.ts` still expose `Permit Log` as a user-facing display name?
3. Does `ProjectReadinessFramework.ts` still use `permit-log` as the readiness source module?
4. Does any dedicated Wave 10 shared model already exist?
5. Does `PccReadModels.ts` already include a Wave 10 read-model key?
6. Does the backend provider already include a Wave 10 `getPermitInspectionControlCenter` or equivalent method?
7. Does the backend route family already include a GET route for Wave 10?
8. Does the SPFx read-model client already include a Wave 10 method and route path?
9. Should the Wave 10 surface plug into the existing Project Readiness surface shell, or should a new top-level surface be introduced?
10. What exact files should Prompt 02 be allowed to modify?

## Prohibited Scope

Do not edit any files.

Do not stage files.

Do not commit.

Do not run broad formatting.

Do not run package/dependency installation.

Do not edit:

- `docs/architecture/plans/**`
- package manifests
- lockfiles
- SPFx manifests
- CI/workflows
- deployment files

Do not introduce or test runtime behavior.

Do not call AHJ, Procore, Microsoft Graph, SharePoint REST, PnP, or external systems.

## Validation Commands

Because this is read-only, validation is:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
md5 pnpm-lock.yaml
```

Both diff commands must return no files.

## Commit Instructions

No commit is authorized for Prompt 01.

## Final Output Requirements

Return:

1. current branch;
2. HEAD;
3. last 8 commits;
4. lockfile hash;
5. implementation state classification;
6. contradictions/gaps found;
7. recommended Prompt 02 file list;
8. validation results;
9. confirmation that no files were modified, staged, or committed.
