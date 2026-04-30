# Prompt 02 — Wave 4 SPFx Read-Model Mode Contract and Client Factory Scaffold

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Create the SPFx-side read-model mode/config contract and client factory seam that keeps fixture mode as the default while making backend mode explicit and opt-in.

This prompt must not add an HTTP backend client yet. It establishes the controlled runtime seam that Prompt 03 will implement behind.

## Required Prerequisite

Verify Prompt 01 is complete and accepted.

Required files must exist:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Scope_Lock.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Open_Decisions.md`

The Wave 4 open-decision register must freeze:

- fixture default;
- explicit backend opt-in;
- backend HTTP client placement under `apps/project-control-center/src/api/`;
- narrow `fetch(` exception posture;
- no package/lockfile/version change by default.

If any prerequisite is missing or contradictory, stop and produce a blocking gap report.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/src/api/index.ts`
- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx`
- `apps/project-control-center/package.json`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Open_Decisions.md`

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Implement a source-level mode/config seam without wiring Project Home or any surface yet.

### Required SPFx API additions

Add an API config/factory module under `apps/project-control-center/src/api/`. Use repo-appropriate names, but the implementation must support these concepts:

- read-model mode union: `fixture | backend`;
- config interface with at least:
  - `readModelMode?: 'fixture' | 'backend'`;
  - `backendBaseUrl?: string` or equivalent injected base URL;
  - `simulateBackendUnavailable?: boolean` or test affordance retained for fixture fallback;
- normalized default config where omitted mode resolves to `fixture`;
- factory function such as `createPccReadModelClient(config)` that returns an `IPccReadModelClient`;
- in Prompt 02, backend mode must still return the fixture client or a deliberate `backend-unavailable` fallback until Prompt 03 supplies the real backend HTTP client;
- no `fetch(` anywhere in Prompt 02 source implementation.

### Required mount/app config extension

Prepare, but do not consume in UI yet, the app-level config shape:

- Extend `IPccMountConfig` only as needed to carry read-model config forward.
- Preserve current `previewLabel` compatibility.
- Preserve default `mount(el)` behavior as fixture mode.
- Do not render through the API seam yet; Prompt 05 owns Project Home wiring.

### Required guard replacement

Update the Wave 3 dormancy guard so it no longer blocks the approved future seam, but still prevents broad or silent API consumption.

Replace `tests/pcc-api-dormancy.test.ts` with a controlled-consumption guard that proves:

- approved API imports are limited to explicitly allowed files/seams;
- no surface imports directly from `src/api` yet;
- no `fetch(` appears outside tests and the future backend HTTP client allowlist;
- no forbidden runtime imports appear in `apps/project-control-center/src/**`.

Prompt 02 should still fail if Project Home or other surfaces import the API directly.

## Allowed Files

Modify only:

```text
apps/project-control-center/src/api/**
apps/project-control-center/src/tests/pcc-api-dormancy.test.ts
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_SPFX_Mode_Contract_Closeout.md
```

If repo truth shows existing test names or helper locations differ, use the nearest existing PCC app test location and document the path choice in closeout.

## Forbidden Work

Do not modify:

- Project Home card rendering files;
- `PccSurfaceRouter.tsx`;
- backend Functions files;
- `packages/models` source;
- package manifests;
- lockfiles;
- SPFx manifests;
- deployment/workflow files.

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

No `fetch(` is allowed in this prompt.

## Required Tests

Add or update tests to prove:

1. omitted config creates the fixture client;
2. `readModelMode: 'fixture'` creates the fixture client;
3. `readModelMode: 'backend'` does not silently cut over to a real HTTP client in Prompt 02;
4. missing backend config is safe and yields fixture or backend-unavailable fallback as defined in `W4-OD-007`;
5. `mount(el)` remains backward compatible;
6. Project Home and surfaces still do not import the API seam directly;
7. no `fetch(` appears outside the approved future allowlist.

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

If package manifests or `pnpm-lock.yaml` change, stop and report. They should not change in Prompt 02.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_SPFX_Mode_Contract_Closeout.md
```

Closeout must include:

- files changed;
- mode/config names implemented;
- default fixture behavior proof;
- backend mode non-cutover proof;
- controlled-consumption guard behavior;
- validation results;
- lockfile checksum before/after;
- confirmation that no backend HTTP client, tenant call, live external-system runtime, or deployment was introduced;
- recommended next prompt.

## Expected Commit Summary

```text
feat(spfx-pcc): add fixture-default read-model mode seam
```

## Expected Commit Description

```text
Adds the Wave 4 SPFx read-model mode/config seam for Project Control Center backend consumption hardening.

Defines a fixture-default read-model client factory and app/mount config shape while preserving backward-compatible fixture rendering. Replaces the Wave 3 API dormancy guard with a controlled-consumption guard that permits approved seams but blocks direct surface imports, broad API usage, fetch outside the future backend HTTP client allowlist, tenant runtime imports, package changes, lockfile changes, manifest changes, deployment, and app-catalog work.
```
