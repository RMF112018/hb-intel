# Admin Control Plane Host — Release Scope Manifest

> **Machine-checkable:** The test file `src/test/admin-control-plane-host-boundary.test.ts` validates every claim in this manifest. If this document drifts from reality, tests fail.

**Phase:** Phase 3 (P3-02, P3-03, P3-04)
**Governing plan:** `docs/architecture/plans/MASTER/spfx/admin/phase-03/Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md`

## In-Scope Route Families (2)

| Family | Directory | Purpose | Endpoints |
|--------|-----------|---------|-----------|
| adminApi | `functions/adminApi/` | Authenticated admin control plane API (runs, preflight, config, actions) | 10 |
| health | `functions/health/` | Unauthenticated operational readiness probe | 1 |

### Admin API Endpoints (P3-04)

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| POST | `/api/admin/runs` | `adminLaunchRun` | Launch a new admin run |
| GET | `/api/admin/runs` | `adminListRuns` | List run history |
| GET | `/api/admin/runs/{runId}` | `adminGetRun` | Get run status/detail |
| POST | `/api/admin/runs/{runId}/cancel` | `adminCancelRun` | Cancel an in-progress run |
| POST | `/api/admin/runs/{runId}/retry` | `adminRetryRun` | Retry a failed run |
| POST | `/api/admin/runs/{runId}/checkpoint` | `adminCheckpointDecision` | Record checkpoint decision |
| POST | `/api/admin/preflight` | `adminPreflight` | Run preflight validation |
| POST | `/api/admin/runs/preview` | `adminPreview` | Preview / dry-run |
| GET | `/api/admin/config/{scope}` | `adminGetConfig` | Get config state |
| GET | `/api/admin/actions` | `adminListActions` | List action metadata |

## Deferred Route Families (later prompts)

| Concern | Target prompt | Notes |
|---------|--------------|-------|
| Repair initiation detail | P3-05 | Handler behavior behind existing cancel/retry routes |
| Adapter routing detail | P3-06 | Wired through adapter registry service behind existing launch/preview routes |

## Excluded Route Families

| Family | Reason |
|--------|--------|
| projectRequests | Project Setup domain — owned by project-setup host |
| provisioningSaga | Project Setup domain — owned by project-setup host |
| timerFullSpec | Project Setup domain — owned by project-setup host |
| signalr | Project Setup domain — owned by project-setup host |
| acknowledgments | Project Setup domain — owned by project-setup host |
| notifications | Project Setup domain — shared infrastructure (consumed by project-setup host) |
| cleanupIdempotency | Project Setup domain — owned by project-setup host |
| leads | Domain CRUD — future Leads host |
| projects | Domain CRUD — future Projects host |
| estimating | Domain CRUD — future Estimating host |
| schedule | Domain CRUD — future Schedule host |
| buyout | Domain CRUD — future Buyout host |
| compliance | Domain CRUD — future Compliance host |
| contracts | Domain CRUD — future Contracts host |
| risk | Domain CRUD — future Risk host |
| scorecards | Domain CRUD — future Scorecards host |
| pmp | Domain CRUD — future PMP host |
| proxy | Stub — not carried by any domain host; decision pending |

## Service Container

**Factory:** `createAdminControlPlaneServiceFactory()` — all admin control plane handlers resolve services through this scoped factory. Enforced by host boundary tests.

**Infrastructure (3 eager):** tableStorage, managedIdentity, graph

**Admin domain (6 eager — stub implementations, replaced in P3-04 through P3-08):**
- `runService` (`IAdminRunService`) — Run lifecycle: launch, status, history, cancel, retry
- `adapterRegistry` (`IAdminAdapterRegistry`) — Adapter discovery, capability check, invocation
- `configService` (`IAdminConfigService`) — Configuration/standards resolution by scope
- `auditService` (`IAdminAuditService`) — Audit event recording and evidence linkage
- `preflightService` (`IAdminPreflightService`) — Precondition validation before run launch
- `actorContextResolver` (`IAdminActorContextResolver`) — JWT claims → actor context mapping

**Service interface source:** `src/services/admin-control-plane/types.ts`
**Stub implementation source:** `src/services/admin-control-plane/stubs.ts`

**Excludes:** All Project Setup services (projectRequests, acknowledgments, signalR push), all domain CRUD services, provisioning-specific saga internals — excluded at compile time via `IAdminControlPlaneServiceContainer` type boundary.

## Startup Config Requirements

| Tier | Variables | Behavior |
|------|-----------|----------|
| core (blocking) | AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE, API_AUDIENCE | Startup fails if missing |

> **Note:** Admin-specific prerequisites (e.g., adapter config, domain permissions) will be validated at execution time as Phase 3 routes are added, not at startup.

## CORS

- Allowed origin: `https://hedrickbrotherscom.sharepoint.com` (tenant-specific, no wildcards)
- Credentials: required (`supportCredentials: true`)

## Auth

- All HTTP routes use `withAuth()` middleware except health (unauthenticated)
- JWT validated against `API_AUDIENCE` env var via Entra ID JWKS
- No custom auth logic in the admin control plane host — shared middleware only
- Admin-specific authorization wiring will be added in P3-08
