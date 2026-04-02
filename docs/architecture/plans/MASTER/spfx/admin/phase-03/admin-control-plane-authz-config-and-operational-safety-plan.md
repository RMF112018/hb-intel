# Admin Control Plane — Authorization, Configuration, and Operational Safety Plan

**Prompt:** P3-08 — Authorization, Configuration, and Operational Safety Wiring  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Wire the admin backend into the repo's authorization, configuration, and operational-safety posture.

---

## 1. Route-level authorization expectations

### Authorization model

All admin API routes use the shared `withAuth()` middleware for JWT authentication. Authorization is layered on top using the repo's existing role/scope helpers from `middleware/authorization.ts`.

### Route authorization matrix

| Route | Method | Auth level | Notes |
|-------|--------|-----------|-------|
| `/admin/runs` | POST | `requireDelegatedScope` + `requireAdmin` | State-changing: launch run |
| `/admin/runs` | GET | `requireDelegatedScope` | Read-only: list history |
| `/admin/runs/{runId}` | GET | `requireDelegatedScope` | Read-only: get detail |
| `/admin/runs/{runId}/cancel` | POST | `requireDelegatedScope` + `requireAdmin` | State-changing: cancel |
| `/admin/runs/{runId}/retry` | POST | `requireDelegatedScope` + `requireAdmin` | State-changing: retry |
| `/admin/runs/{runId}/checkpoint` | POST | `requireDelegatedScope` + `requireAdmin` | State-changing: approval |
| `/admin/preflight` | POST | `requireDelegatedScope` | Read-only: validation check |
| `/admin/runs/preview` | POST | `requireDelegatedScope` + `requireAdmin` | State-changing scope: creates preview run |
| `/admin/config/{scope}` | GET | `requireDelegatedScope` | Read-only: config |
| `/admin/actions` | GET | `requireDelegatedScope` | Read-only: metadata |

### Principles

- **All routes** require `withAuth()` for JWT validation
- **All routes** require `requireDelegatedScope` for interactive access (`access_as_user` scope)
- **Write operations** additionally require `requireAdmin` (Admin or HBIntelAdmin role)
- **App-only tokens** bypass delegated scope check (handled by `isAppOnlyToken` in the middleware)
- **No custom auth logic** in route handlers — all authorization uses shared middleware helpers

---

## 2. Configuration dependencies

### Startup config (core tier — blocking)

| Variable | Purpose | Required |
|----------|---------|----------|
| `AZURE_TENANT_ID` | Entra ID tenant for JWT validation | Yes |
| `AZURE_CLIENT_ID` | App registration client ID | Yes |
| `API_AUDIENCE` | JWT audience validation | Yes |
| `AZURE_TABLE_ENDPOINT` | Table Storage endpoint | Yes |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Telemetry | Yes |
| `HBC_ADAPTER_MODE` | Service mode (proxy/mock) | Yes |

### No new env vars introduced in P3-08

The admin control plane host reuses the core config tier validated by `validateAdminControlPlaneStartupConfig()`. No additional environment variables are required for Phase 3 authorization.

---

## 3. Startup validation expectations

The admin control plane host validates:
1. **Adapter mode** via `assertAdapterModeValid()` — rejects unknown modes, blocks mock in production
2. **Core config tier** via `validateAdminControlPlaneStartupConfig()` → `validateCoreConfig()` — fails startup if core variables are missing
3. **No provisioning-tier validation** — admin host does not validate provisioning prerequisites (owned by project-setup host)

---

## 4. Safety controls landed in Phase 3

| Control | Implementation | Status |
|---------|---------------|--------|
| JWT authentication on all routes | `withAuth()` middleware | Complete |
| Delegated scope enforcement | `requireDelegatedScope()` on all routes | Complete |
| Admin role enforcement on writes | `requireAdmin()` on state-changing routes | Complete |
| Actor context capture for audit | `AdminActorContextResolver` on all write routes | Complete |
| Run state validation | `cancelRun` / `retryRun` validate current status before acting | Complete |
| Normalized error envelopes | `errorResponse()` with machine-readable codes | Complete |
| Adapter invocation isolation | Handlers invoke adapters through registry, not platform services directly | Complete |
| Startup config validation | Core tier validated at factory initialization | Complete |
| Mock-in-production guard | `assertAdapterModeValid()` blocks mock mode in production | Complete |

---

## 5. Deferred controls for later phases

| Control | Target phase | Notes |
|---------|-------------|-------|
| Risk-level-based authorization (different roles for different risk tiers) | Phase 11 | Currently all admin writes require the same Admin role |
| Destructive-action preview mandatory enforcement | Phase 11 | Currently preview is optional; Phase 11 mandates it for Critical risk |
| Post-run validation enforcement | Phase 11 | Currently no post-run validation step |
| Audit evidence persistence | Phase 4 | Actor context is captured but not persisted to durable audit store |
| Config version snapshotting on run creation | Phase 10 | Currently `configSnapshotRef` is null |
| Break-glass authorization telemetry for admin runs | Phase 11 | `emitAuthorizationTelemetry()` exists but not called from admin handlers |
| Rate limiting on admin API | Phase 13 | No rate limiting in Phase 3 |

---

## Cross-references

- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)
- [Phase 3 decision register](./admin-control-plane-phase-3-decision-register.md)
- [API surface and route catalog](./admin-control-plane-api-surface-and-route-catalog.md)
- [Phase 2 action catalog](../phase-02/admin-control-plane-action-catalog.md)

### Implementation files
- [Admin API routes (with auth)](../../../../../backend/functions/src/functions/adminApi/index.ts)
- [Authorization middleware](../../../../../backend/functions/src/middleware/authorization.ts)
- [Actor context resolver](../../../../../backend/functions/src/services/admin-control-plane/actor-context-resolver.ts)
- [Service factory](../../../../../backend/functions/src/hosts/admin-control-plane/service-factory.ts)
