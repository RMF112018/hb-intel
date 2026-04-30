# Prompt 01 — Wave 3 Repo-Truth Gate and Backend Read-Model Scope Lock

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Open Phase 3 Wave 3 with a repo-truth gate and formal scope lock.

Wave 3 is the **PCC Backend Read-Model Foundation**. This prompt is documentation-only. It must confirm Wave 2 is closed, verify the correct Wave 3 starting posture, and lock the implementation boundaries before backend/model/source work begins.

## Operating Rules

- Treat the live repo as source of truth.
- Do not rely on prior chat context unless verified from repo files.
- Do not repeatedly re-read files that remain in your current context unless freshness is required.
- Do not modify source code.
- Do not create backend routes.
- Do not create model contracts.
- Do not touch SPFx source.
- Do not touch package manifests, lockfiles, workflows, manifests, deployment files, or app catalog assets.
- Work to closure.

## Required Starting Verification

Before creating Wave 3 files, verify:

1. `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md` exists.
2. `apps/project-control-center/README.md` states Wave 2 is complete.
3. Wave 2 closeout confirms no live backend, no tenant runtime, no Graph/PnP/SharePoint REST runtime, no Procore/Document Crunch/Adobe Sign runtime, no auth runtime, no scanner, no repair runner, no approval execution, no permission mutation, and no deployment artifact.
4. Wave 2 validation results are documented.
5. The Phase 3 roadmap still identifies Wave 3 as backend read-model foundation.

If any required condition fails, stop and produce a blocking gap report. Do not create Wave 3 scope-lock files.

## Repo Files to Inspect

Inspect:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Closeout.md`
- `apps/project-control-center/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md`
- `backend/functions/README.md`
- `backend/functions/package.json`
- `packages/models/src/pcc/`
- `apps/project-control-center/src/`

## Allowed Files

Create or update only:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/Prompt_01_Wave_3_Repo_Truth_Gate_and_Backend_Read_Model_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md
```

Create missing directories only as required.

## Forbidden Work

Do not modify:

- `backend/functions/src/**`
- `apps/project-control-center/src/**`
- `packages/models/src/pcc/**`
- `package.json`
- `pnpm-lock.yaml`
- SPFx manifests
- `package-solution.json`
- deployment workflows
- provisioning packages
- Azure Functions runtime files

Do not run or invoke:

- Graph
- PnP
- SharePoint REST
- Procore API
- Document Crunch API
- Adobe Sign API
- Azure tenant mutation
- provisioning executor
- app catalog upload
- `.sppkg` packaging
- deployment workflows

## Required Scope Lock Content

Create `Wave_3_Scope_Lock.md` with:

1. Wave title.
2. Wave objective.
3. Wave 2 readiness verification.
4. Wave 3 allowed work.
5. Wave 3 forbidden work.
6. Proposed route namespace.
7. Proposed DTO/model placement.
8. Proposed backend source placement.
9. Mock/local provider posture.
10. SPFx client-boundary posture.
11. Deferred work.
12. Human decisions.
13. Validation expectations.
14. Prompt sequence for Wave 3.
15. Exit criteria for Wave 3.

## Required Decision Register

Create `Wave_3_Open_Decisions.md` with a table using these statuses:

- Frozen for MVP
- Runtime Configuration
- Deferred
- Proof-Gated
- Human Decision Required

At minimum classify:

- route namespace;
- DTO/model placement;
- backend source placement;
- whether read-only routes may be implemented;
- whether write routes may be implemented;
- whether Graph/PnP may be called;
- whether Procore runtime may be introduced;
- whether Site Health repair may execute;
- whether Team & Access permission execution may occur;
- whether SPFx defaults to backend data;
- whether packaging/deployment may occur.

## Validation

Run:

```bash
git status --short
```

If the repo has a narrow documentation formatting command, run it. Do not run source build/test commands unless source files were accidentally touched.

## Closeout Requirements

The `Wave_3_Scope_Lock.md` file must state:

- Wave 3 planning is ready or blocked.
- Wave 2 Prompt 9 closeout was verified.
- Wave 3 can begin with Prompt 02.
- Wave 3 remains read-model-only and no-mutation.
- Prompt 02 should resolve route namespace and DTO placement.

## Expected Commit Summary

```text
docs(pcc): open wave 3 backend read-model planning
```

## Expected Commit Description

```text
Open Phase 3 Wave 3 planning for the PCC Backend Read-Model Foundation.

Adds the Wave 3 scope lock and open-decision register after verifying Wave 2 closeout. Establishes Wave 3 as read-model foundation work only, with no backend source, SPFx source, shared model source, package, lockfile, workflow, deployment, Graph/PnP, Procore, provisioning, tenant mutation, or app catalog changes.
```
