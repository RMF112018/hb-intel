# Prompt 04 — Wave 3 Backend Mock Read-Model Provider

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Create backend-side PCC mock/local read-model provider scaffolding using the shared PCC read-model contracts from Prompt 03.

This prompt must not register HTTP routes yet. It creates provider/service-level read-model assembly only.

## Required Prerequisite

Verify:

- `Wave_3_Read_Model_Contracts_Closeout.md` exists.
- `packages/models/src/pcc/index.ts` exports the read-model contracts.
- `pnpm --filter @hbc/models check-types` and `pnpm --filter @hbc/models test` passed in Prompt 03 closeout.

If not verified, stop and document the blocker.

## Repo Files to Inspect

Inspect:

- `backend/functions/README.md`
- `backend/functions/package.json`
- existing service/provider patterns under `backend/functions/src/`
- existing test patterns under `backend/functions/src/` or backend test directories
- `packages/models/src/pcc/**`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Model_Contracts_Closeout.md`

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Create a PCC backend read-model provider layer that:

- returns deterministic mock/local read models;
- uses `@hbc/models/pcc` contracts;
- assembles project profile, modules, project home, priority actions, document control, external links, site health, team access, and settings models;
- supports unknown project IDs;
- supports unavailable fixture/source state;
- supports backend-unavailable simulation if consistent with repo patterns;
- does not call external systems;
- does not mutate anything.

## Suggested Source Placement

Use the placement locked in Prompt 02. If not contradicted, use a structure similar to:

```text
backend/functions/src/pcc/
backend/functions/src/pcc/read-models/
backend/functions/src/pcc/read-models/pcc-read-model-provider.ts
backend/functions/src/pcc/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/pcc/read-models/pcc-read-model-provider.test.ts
```

Conform to existing backend source and test conventions.

## Allowed Files

Modify only:

```text
backend/functions/src/**
backend/functions/package.json only if strictly required and justified
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Mock_Provider_Closeout.md
```

Do not modify package manifests unless absolutely necessary. Do not modify `pnpm-lock.yaml` unless absolutely necessary; if it changes, document why.

## Forbidden Work

Do not add:

- HTTP route registration;
- POST/PATCH/DELETE handlers;
- Graph/PnP calls;
- SharePoint REST calls;
- Procore runtime;
- Document Crunch runtime;
- Adobe Sign runtime;
- provisioning executor calls;
- repair runner;
- scanner;
- permission mutation;
- approval execution;
- real persistence;
- deployment workflows;
- package/version bumps.

## Required Tests

Add tests proving:

1. provider returns valid read-model envelopes for known fixture project;
2. provider returns not-found or unavailable envelope for unknown project;
3. provider returns read-only metadata;
4. provider uses shared `@hbc/models/pcc` contracts;
5. provider does not expose mutation methods;
6. source code contains no forbidden runtime imports or mutation seams.

Static guard test should check the touched PCC backend provider area for absence of:

- `@pnp/sp`
- `@microsoft/microsoft-graph-client`
- `MSGraphClient`
- `GraphServiceClient`
- `sp.web`
- `_api/web`
- `ProcoreClient`
- `procore-sdk`
- `DocumentCrunchClient`
- `AdobeSignClient`
- `provision`
- `executeRepair`
- `permissionMutate`
- `writeBack`
- `mirror`

Use careful executable-code scanning to avoid false positives in comments if existing repo test utilities support that pattern.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
```

If backend package name differs, use actual repo package name and document the difference.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Mock_Provider_Closeout.md
```

Closeout must include:

- files changed;
- provider structure;
- data source posture;
- no-route confirmation;
- no-mutation/no-runtime confirmation;
- validation results;
- package/lockfile status;
- recommended next prompt.

## Expected Commit Summary

```text
feat(functions-pcc): add mock pcc read-model provider
```

## Expected Commit Description

```text
Adds the Phase 3 Wave 3 PCC mock read-model provider scaffold in the backend functions package.

The provider assembles deterministic PCC read-model envelopes from local/mock sources using shared `@hbc/models/pcc` contracts. No HTTP routes, Graph/PnP calls, SharePoint REST calls, Procore runtime, Document Crunch runtime, Adobe Sign runtime, provisioning executor, repair runner, scanner, permission mutation, approval execution, persistence, deployment, package/version bump, or app catalog work is introduced.
```
