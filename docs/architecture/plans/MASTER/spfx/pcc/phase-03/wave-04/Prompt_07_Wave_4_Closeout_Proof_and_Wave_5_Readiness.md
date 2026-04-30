# Prompt 07 — Wave 4 Closeout Proof and Wave 5 Readiness

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Close Phase 3 / Wave 4 with documentation-only proof. Summarize the implemented Project Home / Command Center backend integration posture, validation results, guardrails, non-claims, and Wave 5 readiness.

Do not implement code in this prompt.

## Required Prerequisite

Verify Prompts 01–06 are complete and accepted.

Required closeout files must exist:

- `Wave_4_Scope_Lock.md`
- `Wave_4_Open_Decisions.md`
- `Wave_4_SPFX_Mode_Contract_Closeout.md`
- `Wave_4_Backend_HTTP_Client_Closeout.md`
- `Wave_4_Project_Home_Adapter_Closeout.md`
- `Wave_4_Project_Home_Opt_In_Wiring_Closeout.md`
- `Wave_4_Guardrails_and_Fallback_Closeout.md`

All should live under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/
```

If any are missing, stop and report the missing records.

## Repo Files to Inspect

Inspect:

- all Wave 4 closeout files;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md`
- `apps/project-control-center/README.md`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/tests/**`
- `backend/functions/src/hosts/pcc-read-model/**`
- `packages/models/src/pcc/**`
- package manifests for `@hbc/models`, `@hbc/functions`, and `@hbc/spfx-project-control-center`.

Do not repeatedly re-read unchanged files already in context.

## Required Output

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Closeout.md
```

Optionally update a Wave 4 README/index only if one already exists and is clearly intended to summarize the wave. Do not edit master roadmap/status files unless explicitly authorized.

`Wave_4_Closeout.md` must include:

- Phase, wave, status, date, audited HEAD.
- Executive summary.
- Prompt-by-prompt closeout index.
- Implemented files grouped by package/app.
- Final Wave 4 runtime posture.
- Explicit default fixture behavior proof.
- Explicit backend opt-in behavior proof.
- Project Home / Command Center consumption summary.
- Backend HTTP client route list and response-body convention.
- Fallback/state mapping behavior.
- Guardrail/test inventory.
- Full validation command results.
- Package/version/lockfile/manifest/deployment posture.
- Deferred work.
- Explicit forbidden claims / non-claims.
- Wave 5 readiness recommendation.
- Final readiness statement.

## Required Closeout Truth

The closeout must not overclaim. It must state clearly:

- Project Home is now capable of opt-in backend read-model consumption only if the executed source work proves that.
- Fixture mode remains default.
- Backend mode is not a production rollout.
- Backend route family remains read-only.
- No tenant mutation occurred.
- No write routes were introduced.
- No Graph/PnP/SharePoint REST live operation was introduced.
- No Procore runtime was introduced.
- No Document Crunch or Adobe Sign runtime was introduced.
- No Site Health scanner/repair execution was introduced.
- No Team & Access permission execution was introduced.
- No approval execution was introduced.
- No provisioning executor was introduced.
- No `.sppkg`, app catalog upload, deployment, or production rollout occurred.

## Allowed Files

Modify only:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Closeout.md
```

If updating an existing Wave 4 README/index is necessary, stop and ask for explicit authorization before editing it.

## Forbidden Work

Do not modify source code, tests, package manifests, lockfiles, workflow files, SPFx manifests, deployment files, Wave 3 closeouts, master roadmaps, or app-catalog/deployment artifacts.

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

Documentation-only prompt, but run the full Wave 4 validation suite to capture final proof:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
git status --short
```

Do not run deployment, `.sppkg`, app catalog, tenant, Graph/PnP live operations, Procore, provisioning executor, repair runner, or tenant mutation commands.

## Validation

The closeout must evaluate both:

1. whether the execution completed; and
2. whether the executed work is architecturally complete against the Wave 4 target architecture and current repo truth.

Passing tests alone is not sufficient if the implementation silently changes default runtime behavior, weakens guardrails, wires extra surfaces, introduces runtime drift, or leaves the backend opt-in posture ambiguous.

## Closeout

End the local-agent response with:

- files changed;
- validation results;
- final fixture/default posture;
- final backend opt-in posture;
- deferred work;
- Wave 5 readiness recommendation;
- commit summary and description only after the commit lands.

## Expected Commit Summary

```text
docs(pcc): close wave 4 project home backend consumption hardening
```

## Expected Commit Description

```text
Closes Phase 3 Wave 4 for Project Home / Command Center backend integration and read-model consumption hardening.

Documents the fixture-default SPFx data-mode posture, explicit backend opt-in client path, Project Home read-model adapter and wiring, backend HTTP route consumption, fallback/state mapping behavior, guardrail coverage, validation proof, no-mutation posture, deferred live-operation work, and Wave 5 readiness recommendation.

No tenant mutation, write routes, Graph/PnP live operations, Procore runtime, Document Crunch runtime, Adobe Sign runtime, Site Health scanner or repair execution, Team & Access permission execution, approval execution, provisioning executor, deployment, .sppkg, app catalog upload, package/version bump, or production rollout is introduced.
```
