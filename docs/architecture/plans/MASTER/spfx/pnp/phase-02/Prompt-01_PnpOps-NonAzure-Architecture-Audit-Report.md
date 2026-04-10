# Prompt-01 — PnP Ops Non-Azure Architecture Audit Report

## Executive Summary
Prompt-01 locks the execution direction for PnP Ops to remove Azure as the required live extraction path while preserving existing behavior for compatibility during migration.

Locked direction:
- preferred live execution: `local-runner`
- fallback live execution: `remote-runner` (self-hosted, non-Azure)
- retained for UI/dev: `mock`
- optional temporary compatibility: `legacy-admin-api` (deprecated)

This prompt intentionally does not implement runner execution. It defines the architecture, contract, and migration boundaries for Prompts 02–05.

## Current Hard Couplings (Repo Truth)
1. Frontend transport coupling to admin API routes.
- `apps/hb-webparts/src/webparts/pnp/pnpOpsClient.ts` calls:
  - `GET /api/admin/actions`
  - `POST /api/admin/preflight`
  - `POST /api/admin/runs`
  - `GET /api/admin/runs/{id}`
  - `GET /api/admin/runs/{id}/evidence`

2. Frontend runtime config coupling to backend naming.
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx` reads `backendUrl` and emits backend-specific error copy.
- `apps/hb-webparts/src/webparts/pnp/PnpOpsWebPart.manifest.json` exposes `backendUrl` and `backendAudience` as first-class properties.

3. Token provider coupling to AAD backend audience.
- `apps/hb-webparts/src/mount.tsx` builds `getApiToken()` from `backendAudience` and SPFx `aadTokenProviderFactory`.

4. Backend action availability coupled to Azure env assumptions.
- `backend/functions/src/functions/adminApi/index.ts` derives action availability from `HBC_ADAPTER_MODE` and `AZURE_TABLE_ENDPOINT`.

5. Evidence/download URLs coupled to backend origin.
- `backend/functions/src/functions/adminApi/index.ts` computes download URLs from API request origin.

6. Extraction layer is synthetic/stubbed rather than live PnP.PowerShell.
- `backend/functions/src/services/admin-control-plane/pnp-extraction-workflows.ts` returns generated placeholder payloads (provider `admin-control-plane:pnp-extraction-workflows`) and not real SharePoint extraction.

## Browser and Runtime Constraints
1. SPFx browser context cannot run PowerShell/PnP cmdlets directly.
2. Live local execution requires a browser-safe bridge service.
3. SharePoint HTTPS pages require deliberate transport safety for loopback/remote endpoints:
- HTTPS endpoint
- explicit CORS allowlisting
- no broad wildcard exposure
4. Local runner should bind loopback by default; remote runner should use explicit host/TLS/auth controls.

## Architecture Decision (Prompt-01 Lock)
1. PnP Ops execution surface moves to a runner abstraction targeted by frontend:
- local companion runner (primary)
- remote self-hosted runner (fallback)
- mock mode
- optional deprecated legacy admin API mode only for migration continuity

2. Migration scope remains PnP-specific.
- No broad rewrite of unrelated admin-control-plane features.
- Legacy `/api/admin/*` may be kept temporarily while Prompt-02 migrates frontend transport.

3. Contract continuity rule.
- Preserve current run/preflight/evidence semantics where possible to minimize UI churn.
- Runner contract becomes deployment-neutral and transport-stable across local/remote.

## Non-Goals in Prompt-01
- No implementation of local runner service.
- No implementation of remote runner host/auth runtime.
- No replacement of extraction workflow internals yet.
- No packaging/runtime cutover yet.
