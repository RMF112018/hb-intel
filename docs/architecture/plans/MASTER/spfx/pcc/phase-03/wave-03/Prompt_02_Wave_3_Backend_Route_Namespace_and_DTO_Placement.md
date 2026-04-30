# Prompt 02 — Wave 3 Backend Route Namespace and DTO Placement

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Resolve and document the backend route namespace, DTO/model placement, backend source placement, and read-model envelope conventions for PCC Wave 3.

This is a documentation/planning prompt unless the Wave 3 scope lock explicitly authorizes source changes. Do not implement DTOs or routes in this prompt.

## Required Prerequisite

Before proceeding, verify:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Scope_Lock.md` exists.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md` exists.
- Prompt 01 classified unresolved decisions.

If missing, stop and produce a blocking gap report.

## Repo Files to Inspect

Inspect:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `backend/functions/README.md`
- `backend/functions/package.json`
- existing route / host patterns under `backend/functions/src/`
- `packages/models/src/pcc/index.ts`
- existing PCC model files under `packages/models/src/pcc/`

Do not repeatedly re-read unchanged files already in context.

## Proposed Decisions to Test Against Repo Truth

Adopt unless repo truth clearly contradicts:

1. Route namespace:
   - `/api/pcc/projects/{projectId}/profile`
   - `/api/pcc/projects/{projectId}/modules`
   - `/api/pcc/projects/{projectId}/home`
   - `/api/pcc/projects/{projectId}/priority-actions`
   - `/api/pcc/projects/{projectId}/document-control`
   - `/api/pcc/projects/{projectId}/external-links`
   - `/api/pcc/projects/{projectId}/site-health`

2. Shared DTO placement:
   - `packages/models/src/pcc/`

3. Backend source placement:
   - `backend/functions/src/`
   - Use existing backend route, auth, validation, response-helper, and request-id conventions.

4. Initial Wave 3 data mode:
   - mock/local provider only.

5. Initial route behavior:
   - `GET` only.
   - no writes.
   - no mutation.
   - no live Graph/PnP/SharePoint REST/Procore calls.

## Allowed Files

Create or update only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Route_and_DTO_Placement.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md
```

Do not touch source code.

## Forbidden Work

Do not modify:

- `backend/functions/src/**`
- `packages/models/src/pcc/**`
- `apps/project-control-center/src/**`
- package manifests
- lockfiles
- workflow files
- deployment files
- SPFx manifests

Do not add:

- routes
- DTO source files
- tests
- dependencies
- package exports
- runtime imports

## Required Output

Create `Wave_3_Backend_Route_and_DTO_Placement.md` with:

1. Executive summary.
2. Route namespace decision.
3. Initial route list.
4. Deferred route list.
5. DTO/model placement decision.
6. Backend source placement decision.
7. Mock provider posture.
8. Auth/response/helper conventions to reuse.
9. SPFx client-boundary assumptions.
10. Guardrails.
11. Prompt 03 readiness statement.

Update `Wave_3_Open_Decisions.md` by moving resolved items to:

- Frozen for MVP
- Proof-Gated
- Deferred

Do not leave decisions open if repo truth and this prompt resolve them.

## Validation

Run:

```bash
git status --short
```

If documentation formatting checks are available, run the narrowest applicable check.

## Closeout Requirements

At the bottom of `Wave_3_Backend_Route_and_DTO_Placement.md`, include:

- files changed;
- decisions resolved;
- decisions deferred;
- no-source-change confirmation;
- no package/lockfile change confirmation;
- recommended next prompt: Prompt 03 — PCC Read-Model Contracts.

## Expected Commit Summary

```text
docs(pcc): lock wave 3 backend route and dto placement
```

## Expected Commit Description

```text
Documents the Wave 3 PCC backend read-model route namespace, DTO/model placement, backend source placement, mock provider posture, and deferred runtime boundaries.

No backend source, SPFx source, shared model source, package, lockfile, workflow, deployment, Graph/PnP, Procore, provisioning, tenant mutation, or app catalog changes.
```
