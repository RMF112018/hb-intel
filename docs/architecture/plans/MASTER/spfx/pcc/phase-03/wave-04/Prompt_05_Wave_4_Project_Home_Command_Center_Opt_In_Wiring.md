# Prompt 05 — Wave 4 Project Home / Command Center Opt-In Wiring

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Wire Project Home / Command Center through the read-model client seam behind explicit opt-in mode while preserving fixture mode as the default.

This is the first Wave 4 prompt allowed to make Project Home consume the API seam. It must not wire other surfaces, enable backend by default, or introduce live operational behavior.

## Required Prerequisite

Verify Prompt 04 is complete and accepted.

Required files must exist:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Adapter_Closeout.md`
- Project Home adapter/view-model source and tests.

If Project Home adapter tests do not cover backend-unavailable and missing-config states, stop and add/require that coverage before wiring.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/src/mount.tsx`
- `apps/project-control-center/src/PccApp.tsx`
- `apps/project-control-center/src/shell/PccSurfaceRouter.tsx`
- `apps/project-control-center/src/state/usePccShellState.ts`
- `apps/project-control-center/src/preview/projectPlaceholder.ts`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/ui/PccPreviewState.tsx`
- `apps/project-control-center/src/tests/**`
- `apps/project-control-center/README.md`

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Wire only Project Home / Command Center through the read-model seam.

### Required behavior

- `mount(el)` and `mount(el, spfxContext, undefined)` remain fixture-driven.
- `mount(el, spfxContext, { readModelMode: 'fixture' })` remains fixture-driven.
- `mount(el, spfxContext, { readModelMode: 'backend', backendBaseUrl: '<explicit-url>' })` may use the backend HTTP client.
- Missing backend base URL in backend mode must produce the approved safe fallback; it must not crash.
- The Project Home view must render through the adapter/view-model from Prompt 04.
- Project Home must retain its existing 10-card bento structure and single active-surface-panel invariant.
- Project Home fixture mode should remain visually equivalent to the prior fixture rendering.
- Other surfaces must remain fixture/preview-driven and must not read through the backend client.
- Any async loading state must use the existing `PccPreviewState` catalog and avoid layout collapse.
- If the read-model client returns `backend-unavailable`, `source-unavailable`, `missing-config`, `stale`, `unauthorized`, or `forbidden`, card-level states must be rendered using the Prompt 04 adapter and existing preview catalog.

### Runtime posture

- Do not derive persona, role, permissions, or access from SPFx context in this prompt.
- Do not acquire tokens.
- Do not invoke Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign.
- Do not add write actions.
- Do not add route navigation beyond existing shell state.

## Allowed Files

Modify only:

```text
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/state/**
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/api/**
apps/project-control-center/src/tests/**
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Opt_In_Wiring_Closeout.md
```

Modify `README.md` only to update repo-truth documentation for Wave 4 opt-in behavior. Do not perform broad README rewrites.

## Forbidden Work

Do not modify:

- backend Functions source;
- `packages/models` source;
- package manifests;
- lockfiles;
- workflows;
- deployment files;
- SPFx manifests;
- non-Project Home surfaces except for router prop threading strictly required to keep existing behavior intact.

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

1. default mount/app render uses fixture client;
2. explicit fixture mode uses fixture client;
3. explicit backend mode with base URL uses backend client;
4. backend mode without base URL renders safe fallback and does not crash;
5. Project Home receives view-model data through the adapter seam;
6. Project Home still renders all 10 bento cards as direct children under the bento grid;
7. exactly one Project Home active surface panel marker exists;
8. other surfaces do not consume the backend client;
9. no default backend cutover is possible without explicit config;
10. no forbidden runtime imports or mutation tokens appear.

## Validation

Run:

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
```

Cross-package validation is required because this prompt connects the SPFx app to the Wave 3 backend route contract and shared model envelopes.

If `pnpm-lock.yaml` changes, stop and report.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Project_Home_Opt_In_Wiring_Closeout.md
```

Closeout must include:

- files changed;
- exact config shape needed to opt into backend reads;
- proof that default mount/app remains fixture mode;
- proof that explicit backend mode is required;
- Project Home wiring summary;
- other-surfaces-not-wired confirmation;
- validation results;
- lockfile checksum before/after;
- no tenant mutation / no write route / no live external-system runtime / no deployment confirmation;
- recommended next prompt.

## Expected Commit Summary

```text
feat(spfx-pcc): wire project home to opt-in read-model client
```

## Expected Commit Description

```text
Wires Project Home / Command Center through the PCC read-model client seam behind explicit opt-in backend mode.

Default mount and app behavior remains fixture-driven. Backend consumption requires explicit config and uses safe fallback for missing config or backend-unavailable envelopes. Project Home consumes adapter-backed view-model data while preserving the 10-card bento structure and single active-surface-panel invariant. Other surfaces remain fixture/preview-driven. No tenant mutation, write routes, Graph/PnP runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, auth token wiring, package changes, lockfile changes, manifest changes, deployment, or app-catalog work is introduced.
```
