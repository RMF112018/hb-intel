# Project Setup Host — Release Scope Manifest

> **Machine-checkable:** The test file `src/test/project-setup-host-boundary.test.ts` validates every claim in this manifest. If this document drifts from reality, tests fail.

**ADR:** ADR-0124
**Boundary Plan:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-1/Phase-1_Backend-Boundary-Freeze.md`

## In-Scope Route Families (8)

| Family | Directory | Purpose |
|--------|-----------|---------|
| projectRequests | `functions/projectRequests/` | Project Setup request lifecycle (submit, list, get, advanceState) |
| provisioningSaga | `functions/provisioningSaga/` | Site provisioning orchestrator, status, retry, escalation |
| timerFullSpec | `functions/timerFullSpec/` | Deferred provisioning step 5 (web parts, 1:00 AM EST) |
| signalr | `functions/signalr/` | Real-time provisioning progress updates |
| acknowledgments | `functions/acknowledgments/` | Workflow handoff acknowledgments |
| notifications | `functions/notifications/` | Notification dispatch, preferences, digest |
| health | `functions/health/` | Unauthenticated operational readiness probe |
| cleanupIdempotency | `functions/cleanupIdempotency/` | Idempotency record cleanup timer |

## Excluded Route Families (11)

| Family | Reason |
|--------|--------|
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

**Includes (9 eager):** sharePoint, tableStorage, signalR, managedIdentity, projectRequests, acknowledgments, graph, notifications, idempotency

**Excludes (10 domain CRUD):** leads, projects, estimating, schedule, buyout, compliance, contracts, risk, scorecards, pmp

## Startup Config Requirements

| Tier | Variables | Behavior |
|------|-----------|----------|
| core (blocking) | AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE, API_AUDIENCE | Startup fails if missing |
| sharepoint (warning) | SHAREPOINT_TENANT_URL, SHAREPOINT_PROJECTS_SITE_URL | Warning logged, startup proceeds |
| provisioning | GRAPH_GROUP_PERMISSION_CONFIRMED, SHAREPOINT_HUB_SITE_ID, etc. | Validated at saga execution time only |

## CORS

- Allowed origin: `https://hedrickbrotherscom.sharepoint.com` (tenant-specific, no wildcards)
- Credentials: required (`supportCredentials: true`)

## Auth

- All HTTP routes use `withAuth()` middleware except health (unauthenticated) and timer triggers
- JWT validated against `API_AUDIENCE` env var via Entra ID JWKS
- No custom auth logic in the PS host — shared middleware only
