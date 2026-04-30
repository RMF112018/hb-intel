# Prompt 03 — Wave 3 PCC Read-Model Contracts

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Create the shared PCC backend read-model contracts in `@hbc/models/pcc`.

These contracts must allow the backend and SPFx shell to share stable DTO/read-model shapes before any read-only backend routes are implemented.

## Required Prerequisite

Verify these files exist and support moving into source work:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Route_and_DTO_Placement.md`

If missing or contradictory, stop and produce a blocking gap report.

## Repo Files to Inspect

Inspect:

- `packages/models/src/pcc/index.ts`
- all current `packages/models/src/pcc/*.ts`
- relevant PCC model tests
- `docs/architecture/blueprint/sp-project-control-center/phase-3/03_PCC_Backend_Service_Contract_Design.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Backend_Route_and_DTO_Placement.md`
- `apps/project-control-center/src/surfaces/**`

Do not repeatedly re-read unchanged files already in context.

## Required Contracts

Add additive contracts only. Do not break existing Wave 1/Wave 2 exports.

Create or extend PCC model files to support:

- `PccReadModelEnvelope<T>`
- `PccReadModelSourceStatus`
- `PccReadModelMode`
- `PccReadModelWarning`
- `PccProjectProfileReadModel`
- `PccWorkCenterRegistryReadModel`
- `PccProjectHomeReadModel`
- `PccPriorityActionsReadModel`
- `PccDocumentControlReadModel`
- `PccExternalLinksReadModel`
- `PccSiteHealthReadModel`
- `PccTeamAccessReadModel`
- `PccSettingsReadModel`
- `PccReadModelResponseMap`, if useful and type-safe

Use existing PCC types wherever possible:

- project profile / project placeholder types
- `PCC_MVP_SURFACES`
- priority actions
- document control model
- external systems model
- site health model
- team access model
- settings / readiness / approvals types if present

## Required Semantics

Contracts must support:

- fixture/mock/local data mode;
- backend-unavailable state;
- source-unavailable state;
- missing-config state;
- stale data state;
- unauthorized/forbidden state;
- role-aware shaping metadata;
- read-only response posture;
- no mutation semantics.

Do not add executable service functions to `@hbc/models`.

## Allowed Files

Modify only:

```text
packages/models/src/pcc/**
packages/models/src/pcc/index.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Model_Contracts_Closeout.md
```

If tests are elsewhere in the models package, modify only the relevant PCC model tests.

## Forbidden Work

Do not modify:

- backend route/source files;
- SPFx app files;
- provisioning packages;
- package manifests;
- lockfiles;
- workflows;
- deployment files.

Do not introduce:

- Graph/PnP imports;
- SharePoint REST imports;
- Procore SDK/runtime;
- Document Crunch runtime;
- Adobe Sign runtime;
- service clients;
- fetch/HTTP clients;
- mutation helpers;
- runtime adapters.

## Required Tests

Add or update tests to prove:

1. all new contracts export from `packages/models/src/pcc/index.ts`;
2. read-model envelopes can wrap each required model;
3. status/mode enums or unions reject invalid values at compile/test level where practical;
4. fixture/mock mode is represented without implying live runtime;
5. no contract includes mutation verbs such as apply, execute, repair, provision, sync, mirror, writeBack, upload, delete, permissionMutate;
6. existing Wave 1/Wave 2 model tests still pass.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If other packages are impacted by model exports, run the narrowest affected package checks and document why.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Model_Contracts_Closeout.md
```

Closeout must include:

- files changed;
- contracts added;
- existing contracts reused;
- no-runtime/no-mutation confirmation;
- validation results;
- lockfile/package confirmation;
- recommended next prompt.

## Expected Commit Summary

```text
feat(models-pcc): add pcc backend read-model contracts
```

## Expected Commit Description

```text
Adds shared PCC read-model contracts for Phase 3 Wave 3 backend read-model foundation.

Defines read-model envelopes and typed DTOs for project profile, work center registry, project home, priority actions, document control, external links, site health, team access, and settings. Preserves Wave 2 no-runtime posture by adding type-only model contracts with no backend routes, SPFx runtime changes, Graph/PnP calls, Procore runtime, provisioning, tenant mutation, package changes, lockfile changes, workflow changes, or deployment.
```
