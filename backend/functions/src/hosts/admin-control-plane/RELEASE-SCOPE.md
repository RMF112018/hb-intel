# Admin Control Plane Host — Release Scope Manifest

> **Machine-checkable:** The test file `src/test/admin-control-plane-host-boundary.test.ts` validates every claim in this manifest. If this document drifts from reality, tests fail.

**Phase:** Phase 3 (P3-02)
**Governing plan:** `docs/architecture/plans/MASTER/spfx/admin/phase-03/Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md`

## In-Scope Route Families (1 — foundation)

| Family | Directory | Purpose |
|--------|-----------|---------|
| health | `functions/health/` | Unauthenticated operational readiness probe |

> **Note:** This is the Phase 3 foundation scaffold. Later Phase 3 prompts (P3-04 through P3-08) will add admin API route families for launch, status, history, retry, repair, validate, and config. Each addition must update this manifest and the host boundary test.

## Deferred Route Families (Phase 3, later prompts)

| Family | Target prompt | Purpose |
|--------|--------------|---------|
| adminRuns | P3-04/P3-05 | Run launch, status, history, cancel, retry |
| adminRepair | P3-05 | Repair initiation |
| adminValidate | P3-04 | Preflight validation and preview |
| adminConfig | P3-04 | Configuration retrieval |
| adminAdapters | P3-06 | Adapter registry and execution routing |

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

**Includes (3 eager — foundation):** tableStorage, managedIdentity, graph

> **Note:** Later Phase 3 prompts will expand the service container as admin API routes, adapter registry, and orchestration bridge are introduced. Each expansion must update this manifest.

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
