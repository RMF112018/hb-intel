# Prompt 01 — Wave 4 Repo Truth Gate and Project Home Scope Lock

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Open Phase 3 / Wave 4 planning in the repo without implementing source code.

Create the Wave 4 scope lock and open-decision record for **Project Home / Command Center backend integration and read-model consumption hardening**. Confirm the Wave 3 baseline from current repo truth, lock the Wave 4 default posture, and identify any true blockers before source implementation begins.

## Required Prerequisite

Verify that Wave 3 is complete and that the current branch is clean before writing documentation.

Required checks:

```bash
git status --short
```

If the working tree is not clean, stop and report the dirty files. Do not edit source or docs until the user authorizes how to handle the dirty state.

## Repo Files to Inspect

Inspect at minimum:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Open_Decisions.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-03/README.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `backend/functions/src/hosts/pcc-read-model/**`
- `packages/models/src/pcc/**`
- relevant UI doctrine, SPFx benchmark, or PCC architecture docs referenced by those files.

Do not repeatedly re-read unchanged files already in current context.

## Required Output

Create the Wave 4 documentation folder and records:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Open_Decisions.md
```

If the repo already contains equivalent Wave 4 files, update them only if they are incomplete, stale, or contradicted by current repo truth. Do not duplicate records.

### `Wave_4_Scope_Lock.md` must include

- Wave title: `Phase 3 / Wave 4 — Project Home / Command Center Backend Integration and Read-Model Consumption Hardening`.
- Current audited commit/HEAD.
- Wave 3 carry-forward facts.
- Exact Wave 4 objective.
- Exact Wave 4 allowed scope.
- Exact Wave 4 forbidden work.
- Default data mode: fixture.
- Backend data mode: explicit opt-in only.
- Project Home as the only initial surface to wire.
- No tenant mutation / no write route / no live external-system runtime confirmation.
- Expected implementation sequence for Prompts 02–07.
- Required validation pattern and lockfile checksum posture.
- Explicit statement that validation must assess both execution completion and architectural completeness.

### `Wave_4_Open_Decisions.md` must include

At minimum, create decision IDs for:

- `W4-OD-001` — SPFx read-model mode/config name and default.
- `W4-OD-002` — backend base URL/config source.
- `W4-OD-003` — backend HTTP client placement.
- `W4-OD-004` — `fetch(` source-scan exception scope.
- `W4-OD-005` — Project Home only as first wired consumer.
- `W4-OD-006` — API dormancy guard replacement with controlled-consumption guard.
- `W4-OD-007` — fallback behavior for missing backend config and backend-unavailable responses.
- `W4-OD-008` — package/lockfile/version posture.
- `W4-OD-009` — scoped-host ADR / architecture record disposition.
- `W4-OD-010` — Wave 5 readiness dependency.

Unless repo truth contradicts it, freeze these default positions:

- Fixture mode remains default.
- Backend mode is opt-in only.
- Backend base URL is injected through SPFx mount/config and never auto-discovered from tenant state in Wave 4.
- Backend HTTP client lives under `apps/project-control-center/src/api/`.
- `fetch(` is allowed only in the backend HTTP client implementation file and its tests/mocks.
- Project Home / Command Center is the only surface wired in Wave 4.
- Priority Actions Rail remains Wave 5 as a standalone module; Wave 4 may display priority actions only as part of Project Home's read model.
- No dependency addition, version bump, SPFx manifest change, deployment, or app-catalog work.

## Allowed Files

Modify only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Open_Decisions.md
```

If the executing repo requires a master plan index update to make Wave 4 discoverable, stop and ask for explicit authorization before editing any master index. Do not infer that permission.

## Forbidden Work

Do not modify source code, tests, package manifests, lockfiles, workflow files, SPFx manifests, provisioning files, deployment files, or Wave 3 closeout files.

Do not introduce:

- default backend cutover;
- tenant mutation;
- write routes (`POST`, `PUT`, `PATCH`, `DELETE`);
- Graph/PnP/SharePoint REST live operations;
- Procore runtime, SDK, secrets, sync, mirror, or write-back;
- Document Crunch runtime;
- Adobe Sign runtime;
- provisioning execution;
- Site Health scanner or repair execution;
- Team & Access permission execution;
- approval execution;
- package/version/manifest/deployment/app-catalog work unless this prompt explicitly authorizes it.

## Required Tests

Documentation-only prompt. No package tests are required.

Required command:

```bash
git status --short
```

## Validation

Validate that:

- only the Wave 4 documentation files changed;
- the scope lock accurately carries forward Wave 3 repo truth;
- the open-decision record freezes the fixture-default / backend-opt-in posture;
- no source, package, lockfile, manifest, workflow, or deployment files changed.

## Closeout

End the local-agent response with:

- files changed;
- decisions frozen;
- decisions deferred;
- blockers, if any;
- confirmation that no code was implemented;
- confirmation that Prompt 02 may proceed only after user approval.

## Expected Commit Summary

```text
docs(pcc): open wave 4 project home backend consumption planning
```

## Expected Commit Description

```text
Opens Phase 3 Wave 4 planning for Project Home / Command Center backend integration and read-model consumption hardening.

Adds the Wave 4 scope lock and open-decision register. Confirms Wave 3 read-model foundation carry-forward, freezes fixture mode as the default SPFx posture, requires backend read-model consumption to be explicit opt-in only, limits initial consumption to Project Home / Command Center, and preserves the no tenant mutation, no write route, no live external-system runtime, no provisioning executor, no deployment, and no package/version/manifest-change posture.
```
