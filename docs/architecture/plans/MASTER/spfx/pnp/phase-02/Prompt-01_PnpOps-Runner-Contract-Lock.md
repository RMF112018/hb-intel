# Prompt-01 — PnP Ops Runner Contract Lock

## Canonical Execution Modes
- `local-runner` (preferred live path)
- `remote-runner` (self-hosted non-Azure fallback)
- `mock` (UI/dev mode)
- `legacy-admin-api` (deprecated migration-only compatibility)

## Canonical Runner HTTP Contract
Base URL: `runnerBaseUrl`

Required endpoints:
1. `GET /actions`
2. `POST /preflight`
3. `POST /runs`
4. `GET /runs/{id}`
5. `GET /runs/{id}/evidence`
6. `GET /runs/{id}/artifacts/{artifactId}/download`

Optional endpoints:
- `GET /health`
- `GET /capabilities`

## Frontend Runtime Config Lock
Prompt-02+ frontend model must support:
- `executionMode`
- `runnerBaseUrl`
- `defaultTargetSiteUrl`
- optional `legacyAdminApiBaseUrl` (deprecated compatibility only)
- optional `mockMode` alias for compatibility to be folded into `executionMode`

## Compatibility Mapping (Current DTOs)
Current PnP client DTO families remain baseline:
- run launch envelope (`runId`, `status`, `actionKey`)
- run envelope/status (`runId`, `status`, `steps`, timing fields)
- preflight (`ready`, `checks[]`)
- evidence manifest (`runId`, `evidenceRefs[]`, `total`)

Artifact evidence fields to preserve across local/remote runner:
- `evidenceId`, `label`, `fileName`, `contentType`, `sizeBytes`, `isBundle`, `bundleFormat`, `availability`, `downloadUrl`

## Deprecation Lock
`legacy-admin-api` remains allowed only as a migration bridge.
- It must be visibly marked deprecated in code/docs.
- It must not remain the required live execution path after phase-02 completion.

## Prompt-02..05 File-Level Implementation Map
## Prompt-02 (runner abstraction + frontend contract)
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts`
- `apps/hb-webparts/src/webparts/pnp/pnpOpsValidation.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json`

## Prompt-03 (local runner implementation)
- new local runner area (locked candidate): `tools/pnp-runner-local/`
- local runner setup docs under phase-02 docs
- Prompt-02 frontend mode wiring touchpoints for `local-runner`

## Prompt-04 (remote fallback implementation)
- shared contract reuse from local runner modules
- remote profile/auth/deployment docs under phase-02 docs
- Prompt-02 frontend mode wiring touchpoints for `remote-runner`

## Prompt-05 (closure)
- PnP UX mode-specific message cleanup in `PnpOps.tsx`
- packaging validation path for `hb-webparts.sppkg`
- final phase-02 closure report/docs
