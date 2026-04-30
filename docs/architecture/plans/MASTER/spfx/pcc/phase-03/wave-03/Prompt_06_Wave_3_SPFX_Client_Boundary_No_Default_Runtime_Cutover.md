# Prompt 06 — Wave 3 SPFx Client Boundary, No Default Runtime Cutover

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Create the PCC SPFx client boundary for consuming Wave 3 backend read-model endpoints, while preserving the Wave 2 fixture-driven preview default.

This prompt must not convert the PCC shell into a live operational release. The client boundary may exist, be typed, and be tested, but fixture fallback remains the default unless repo truth and this prompt explicitly authorize otherwise.

## Required Prerequisite

Verify:

- `Wave_3_Read_Only_Routes_Closeout.md` exists.
- read-only route tests passed.
- route namespace and DTO contracts are stable.
- Wave 2 README still states the app is not a live operational PCC release unless updated by an approved later wave.

If missing or contradictory, stop and document the blocker.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/README.md`
- `apps/project-control-center/src/**`
- `packages/models/src/pcc/**`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Read_Only_Routes_Closeout.md`
- backend route contract files from Prompt 05

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Create an app-local PCC API client boundary that:

- uses shared `@hbc/models/pcc` read-model contracts;
- knows the approved route namespace;
- can request each read-only endpoint through a typed abstraction;
- supports backend unavailable state;
- supports fixture fallback;
- does not call Graph/PnP/SharePoint REST/Procore directly;
- does not add auth runtime unless explicitly required by existing app architecture and approved in Wave 3 scope;
- does not default the app to backend runtime mode.

## Suggested Source Placement

Use repo conventions. If not contradicted, use a structure similar to:

```text
apps/project-control-center/src/api/
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccReadModelClient.test.ts
```

## Allowed Files

Modify only:

```text
apps/project-control-center/src/**
apps/project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_SPFX_Client_Boundary_Closeout.md
```

Modify `packages/models/src/pcc/**` only if a minor type gap is discovered and no broader contract redesign is required. If models are touched, run model validation and document why.

## Forbidden Work

Do not add:

- Graph/PnP client imports;
- SharePoint REST calls;
- Procore runtime;
- Document Crunch runtime;
- Adobe Sign runtime;
- tenant mutation;
- backend write calls;
- upload/download/copy-link execution;
- approval execution;
- permission execution;
- repair execution;
- route navigation to live external systems;
- `window.open`;
- deployment/package/app-catalog changes.

Do not change the default app mode to live backend mode unless expressly approved by the scope lock and route closeout.

## Required UI / State Behavior

If a lightweight UI toggle or injection seam is needed for tests, it must be non-operational and development-safe.

The app must retain:

- fixture-driven Project Home and surfaces;
- existing eight preview/fallback states;
- backend-unavailable state;
- missing-config state;
- no-live-operation copy;
- no executable file/repair/approval/access actions.

## Required Tests

Add or update tests proving:

1. client boundary maps each backend read-model response type;
2. fixture fallback remains available;
3. backend-unavailable response maps to existing preview/fallback state;
4. app default remains fixture/preview unless explicitly configured;
5. source contains no Graph/PnP/SharePoint REST/Procore runtime imports;
6. source contains no mutation route calls;
7. existing Wave 2 PCC app tests still pass.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

If models are not touched, note whether model commands are confirmation-only.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_SPFX_Client_Boundary_Closeout.md
```

Closeout must include:

- files changed;
- client boundary structure;
- default data mode confirmation;
- fixture fallback confirmation;
- no direct Graph/PnP/Procore confirmation;
- no live operational release confirmation;
- validation results;
- package/lockfile status;
- recommended next prompt.

## Expected Commit Summary

```text
feat(spfx-project-control-center): add pcc read-model client boundary
```

## Expected Commit Description

```text
Adds a typed PCC SPFx client boundary for future consumption of Wave 3 backend read-model routes.

The app remains fixture-driven by default and preserves Wave 2 preview/fallback behavior. No direct Graph/PnP, SharePoint REST, Procore, Document Crunch, Adobe Sign, tenant mutation, write route execution, approval execution, permission execution, repair execution, deployment, `.sppkg`, app catalog, package/version bump, or live operational cutover is introduced.
```
