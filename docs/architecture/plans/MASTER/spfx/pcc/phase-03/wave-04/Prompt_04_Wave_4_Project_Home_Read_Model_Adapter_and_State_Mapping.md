# Prompt 04 — Wave 4 Project Home Read-Model Adapter and State Mapping

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Create a Project Home / Command Center adapter layer that converts PCC read-model envelopes into explicit Project Home view-model props and preview/fallback states.

This prompt must not wire the UI to backend mode yet. It prepares deterministic, test-covered mapping so Prompt 05 can cut Project Home over through the seam without changing default runtime behavior.

## Required Prerequisite

Verify Prompts 01–03 are complete and accepted.

Required files must exist:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Backend_HTTP_Client_Closeout.md`
- Prompt 03 backend HTTP client under `apps/project-control-center/src/api/**`
- Prompt 03 tests proving fixture default and backend opt-in behavior.

If backend mode is default anywhere, stop and report.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- all files under `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/api/pccReadModelStateMapping.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- relevant Wave 2 Project Home tests under `apps/project-control-center/src/tests/**`

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Add a Project Home adapter/view-model layer. Use repo-appropriate file names, but keep it near Project Home or the API boundary.

### Adapter responsibilities

The adapter must map `PccReadModelEnvelope<PccProjectHomeReadModel>` and any supporting envelopes needed by current Project Home cards into a stable Project Home view model.

At minimum, the view model must support:

- project intelligence/profile data;
- priority actions shown on Project Home;
- site health summary shown on Project Home;
- document-control summary/source-state data currently displayed by the Project Home card;
- external-system missing configuration state;
- card-level `PccPreviewStateKind` values using `mapPccSourceStatusToPreviewState()`;
- fallback behavior for `backend-unavailable`, `source-unavailable`, `missing-config`, `stale`, `unauthorized`, and `forbidden` statuses;
- preservation of the existing fixture visual data when the fixture client is used.

### Component prep

Update Project Home card prop types only as necessary so cards can accept view-model data in Prompt 05. Avoid broad UI rewrites in this prompt.

Acceptable changes:

- add optional props to Project Home cards while preserving default fixture behavior;
- add shared view-model types;
- add adapter tests;
- add state-mapping tests.

Unacceptable changes:

- importing the API client directly into individual cards;
- making cards perform async reads;
- adding backend mode as default;
- broad styling changes unrelated to data adaptation.

## Allowed Files

Modify only:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/api/pccReadModelStateMapping.ts
apps/project-control-center/src/api/**.test.ts
apps/project-control-center/src/tests/**
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Adapter_Closeout.md
```

If a shared type belongs outside `surfaces/projectHome/**`, use `apps/project-control-center/src/api/**` or `apps/project-control-center/src/state/**` only with a closeout explanation.

## Forbidden Work

Do not modify:

- `mount.tsx`;
- `PccApp.tsx`;
- `PccSurfaceRouter.tsx`;
- backend Functions files;
- `packages/models` source;
- package manifests;
- lockfiles;
- workflows;
- deployment files;
- SPFx manifests.

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

No additional `fetch(` usage is allowed beyond the Prompt 03 backend HTTP client allowlist.

## Required Tests

Add or update tests proving:

1. Project Home adapter maps available fixture envelopes to existing Project Home data;
2. `backend-unavailable` maps to the approved preview/fallback state;
3. `source-unavailable` maps to unavailable fixture state;
4. `missing-config` maps to missing-config state;
5. `stale` still renders with a clear stale/preview cue, without inventing a new unapproved preview state unless repo doctrine already supports it;
6. `unauthorized` and `forbidden` map to unauthorized-persona state;
7. individual cards remain fixture-compatible when no explicit view-model prop is supplied;
8. no individual Project Home card imports `src/api` directly.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changes, stop and report.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Adapter_Closeout.md
```

Closeout must include:

- files changed;
- adapter/view-model names and paths;
- status-to-preview mapping behavior;
- card prop compatibility confirmation;
- proof that no UI cutover or backend default was introduced;
- validation results;
- lockfile checksum before/after;
- no tenant mutation / no live external runtime / no deployment confirmation;
- recommended next prompt.

## Expected Commit Summary

```text
feat(spfx-pcc): add project home read-model adapter
```

## Expected Commit Description

```text
Adds the Project Home read-model adapter and state-mapping layer for Wave 4 backend consumption hardening.

The adapter converts PCC read-model envelopes into Project Home view-model data and maps source statuses through the existing preview/fallback state catalog. Cards remain fixture-compatible and no UI cutover, backend-default behavior, tenant mutation, write route, Graph/PnP runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, package change, lockfile change, manifest change, deployment, or app-catalog work is introduced.
```
