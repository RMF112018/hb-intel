# Prompt 03 — Wave 4 Backend HTTP Read-Model Client Opt-In Implementation

You are working in the live `RMF112018/hb-intel` repository on `main`.

## Objective

Implement the explicit opt-in backend HTTP read-model client behind the existing `IPccReadModelClient` seam.

The backend client must consume the seven Wave 3 read-only route envelopes and must never become the default. Fixture mode remains the default for all app entry points.

## Required Prerequisite

Verify Prompt 02 is complete and accepted.

Required files must exist:

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_SPFX_Mode_Contract_Closeout.md`
- the Prompt 02 read-model mode/config factory under `apps/project-control-center/src/api/**`
- the Prompt 02 controlled-consumption guard test.

If the Prompt 02 factory defaults to backend mode, stop and report. That is a blocker.

## Repo Files to Inspect

Inspect:

- `apps/project-control-center/src/api/pccReadModelClient.ts`
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts`
- the Prompt 02 client factory/config file
- `apps/project-control-center/src/api/index.ts`
- `apps/project-control-center/src/tests/pcc-api-dormancy.test.ts` or its Prompt 02 replacement
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts`
- `backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts`
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/index.ts`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-3/Wave_3_Closeout.md`
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Open_Decisions.md`

Do not repeatedly re-read unchanged files already in context.

## Required Implementation

Add a backend HTTP implementation under `apps/project-control-center/src/api/` behind `IPccReadModelClient`.

### Required behavior

- The backend client is selected only when config explicitly sets backend mode.
- Fixture mode remains default.
- The backend client builds URLs from injected `backendBaseUrl` plus the existing route templates.
- The backend client must request only these read-only routes:
  - `pcc/projects/{projectId}/profile`
  - `pcc/projects/{projectId}/modules`
  - `pcc/projects/{projectId}/home`
  - `pcc/projects/{projectId}/priority-actions`
  - `pcc/projects/{projectId}/document-control`
  - `pcc/projects/{projectId}/external-links`
  - `pcc/projects/{projectId}/site-health`
- Parse the backend response body convention `{ data: PccReadModelEnvelope<T> }`.
- If `backendBaseUrl` is missing, malformed, or empty while backend mode is requested, return `backend-unavailable` envelopes or fail into the approved fixture fallback per `W4-OD-007`; do not crash the app.
- If `fetch` rejects, returns non-2xx, or returns malformed JSON, return `backend-unavailable` envelopes or a documented safe fallback.
- Add request construction tests proving no write routes are generated.
- Add envelope parsing tests for success and failure states.

### Fetch restriction

`fetch(` may appear only in the backend HTTP client implementation file and its direct tests/mocks. Update the controlled-consumption guard allowlist accordingly.

### Auth / token posture

Do not implement auth token acquisition in Wave 4. The backend route family is already wrapped in backend `withAuth`, but SPFx auth runtime and token wiring are not in this wave unless separately approved. If the backend cannot be called without future auth wiring, represent the condition as `backend-unavailable` or missing-config fallback in tests. Do not introduce `@hbc/auth`, `@microsoft/sp-http`, MSGraph, or PnP imports.

## Allowed Files

Modify only:

```text
apps/project-control-center/src/api/**
apps/project-control-center/src/tests/**
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Backend_HTTP_Client_Closeout.md
```

Do not modify Project Home rendering, shell routing, backend Functions routes, models package, package manifests, lockfiles, workflows, deployment files, or SPFx manifests.

## Forbidden Work

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

Additionally forbidden in Prompt 03:

- default backend mode;
- auth token acquisition;
- SPFx context-dependent Graph/PnP calls;
- surface/UI wiring;
- mutation endpoints;
- route expansion beyond the seven Wave 3 GET routes.

## Required Tests

Add or update tests proving:

1. backend mode is selected only when explicitly requested;
2. fixture mode is selected by default;
3. backend URLs match the Wave 3 route namespace and seven route templates;
4. response parsing expects `{ data: envelope }`;
5. non-2xx, rejected fetch, malformed JSON, missing base URL, and unknown project cases result in safe `backend-unavailable` or approved fallback envelopes;
6. `fetch(` appears only in the approved backend HTTP client file and direct tests/mocks;
7. no API method attempts `POST`, `PUT`, `PATCH`, or `DELETE`.

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

The cross-package validation is required because Prompt 03 couples SPFx route consumption to Wave 3 backend route contracts and shared model envelopes.

If `pnpm-lock.yaml` changes, stop and report.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-4/Wave_4_Backend_HTTP_Client_Closeout.md
```

Closeout must include:

- files changed;
- backend client file path;
- route list consumed;
- response parsing convention;
- failure/fallback semantics;
- fetch allowlist proof;
- validation results;
- lockfile checksum before/after;
- default fixture confirmation;
- no tenant mutation / no live external-system runtime / no deployment confirmation;
- recommended next prompt.

## Expected Commit Summary

```text
feat(spfx-pcc): add opt-in backend read-model client
```

## Expected Commit Description

```text
Adds an explicit opt-in backend HTTP implementation behind the PCC `IPccReadModelClient` seam.

The client consumes the seven Wave 3 read-only PCC read-model routes using the `{ data: PccReadModelEnvelope<T> }` body convention and returns safe backend-unavailable/fallback envelopes for missing config, failed requests, non-2xx responses, and malformed payloads. Fixture mode remains the default. Fetch usage is narrowly allowed only in the backend read-model client and tests. No tenant mutation, write routes, Graph/PnP runtime, Procore runtime, Document Crunch runtime, Adobe Sign runtime, auth token wiring, package changes, lockfile changes, manifest changes, deployment, or app-catalog work is introduced.
```
