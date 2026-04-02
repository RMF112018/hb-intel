# Admin Control Plane — API Surface and Route Catalog

**Prompt:** P3-04 — Authenticated Admin API Surface and Route Registration  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Implement the generalized authenticated admin API surface and route-registration skeleton for the IT Control Center operator console.

---

## 1. Route table

All routes are registered in `backend/functions/src/functions/adminApi/index.ts` and use the `/api/admin/` prefix.

| # | Method | Route | Handler | Purpose | Status code |
|---|--------|-------|---------|---------|-------------|
| 1 | POST | `/api/admin/runs` | `adminLaunchRun` | Launch a new admin run | 202 |
| 2 | GET | `/api/admin/runs` | `adminListRuns` | List run history (paginated) | 200 |
| 3 | GET | `/api/admin/runs/{runId}` | `adminGetRun` | Get run status/detail | 200 |
| 4 | POST | `/api/admin/runs/{runId}/cancel` | `adminCancelRun` | Cancel an in-progress run | 200 |
| 5 | POST | `/api/admin/runs/{runId}/retry` | `adminRetryRun` | Retry a failed run | 202 |
| 6 | POST | `/api/admin/runs/{runId}/checkpoint` | `adminCheckpointDecision` | Record checkpoint decision | 200 |
| 7 | POST | `/api/admin/preflight` | `adminPreflight` | Run preflight validation | 200 |
| 8 | POST | `/api/admin/runs/preview` | `adminPreview` | Preview / dry-run | 200 |
| 9 | GET | `/api/admin/config/{scope}` | `adminGetConfig` | Get config state for scope | 200 |
| 10 | GET | `/api/admin/actions` | `adminListActions` | List available admin actions | 200 |

---

## 2. Auth requirement per route

| Route | Auth | Actor capture | Notes |
|-------|------|---------------|-------|
| POST `/admin/runs` | `withAuth()` | Yes — `IAdminActorContext` for audit | Operator must be authenticated |
| GET `/admin/runs` | `withAuth()` | No | Read-only list, no audit event |
| GET `/admin/runs/{runId}` | `withAuth()` | No | Read-only detail |
| POST `/admin/runs/{runId}/cancel` | `withAuth()` | Yes — actor recorded for audit | State-changing operation |
| POST `/admin/runs/{runId}/retry` | `withAuth()` | Yes — actor on new run | Creates new run linked to parent |
| POST `/admin/runs/{runId}/checkpoint` | `withAuth()` | Yes (deferred to P3-05) | Approval-tier operation |
| POST `/admin/preflight` | `withAuth()` | No | Validation-only, no state change |
| POST `/admin/runs/preview` | `withAuth()` | Yes — actor for audit trail | Preview produces evidence |
| GET `/admin/config/{scope}` | `withAuth()` | No | Read-only config |
| GET `/admin/actions` | `withAuth()` | No | Read-only metadata |

All routes use `withTelemetry()` for handler lifecycle telemetry with domain `'adminControlPlane'`.

---

## 3. Expected request/response DTOs

All DTOs are defined in `@hbc/models/admin-control-plane` (Phase 2).

| Endpoint | Request DTO | Response DTO |
|----------|-------------|--------------|
| Launch run | `IAdminRunLaunchRequest` | `IAdminRunLaunchResponse` |
| List runs | Query params: `domain?`, `status?`, `page?`, `pageSize?` | `IAdminApiListResponse<IAdminRunSummary>` |
| Get run | Route param: `runId` | `IAdminRunEnvelope` |
| Cancel run | `{ reason: string }` | `IAdminRunEnvelope` |
| Retry run | Route param: `runId` | `IAdminRunRetryResponse` |
| Checkpoint | `{ stepNumber, decision, comment? }` | `IAdminCheckpointDecisionResponse` |
| Preflight | `IAdminPreflightRequest` | `IAdminPreflightResponse` |
| Preview | `IAdminRunLaunchRequest` (dryRun forced) | `IAdminPreviewResponse` |
| Get config | Route param: `scope` | `IAdminConfigResponse` |
| List actions | Query param: `domain?` | `IAdminApiListResponse<IAdminActionMetadata>` |

---

## 4. Ownership notes

- **Route registration:** `backend/functions/src/functions/adminApi/index.ts`
- **Host composition root:** `backend/functions/src/hosts/admin-control-plane/index.ts` (imports `adminApi`)
- **Service resolution:** All handlers call `createAdminControlPlaneServiceFactory()` to access the scoped container
- **Auth middleware:** Shared `withAuth()` from `middleware/auth.ts` — no custom admin auth in route handlers
- **Response helpers:** Shared `successResponse()` / `errorResponse()` from `utils/response-helpers.ts`
- **Telemetry:** Shared `withTelemetry()` with domain `'adminControlPlane'` and operation-specific names

---

## 5. Route-to-service mapping

| Handler | Primary service | Secondary services |
|---------|----------------|-------------------|
| `adminLaunchRun` | `runService.launchRun()` | `actorContextResolver` |
| `adminListRuns` | `runService.listRuns()` | — |
| `adminGetRun` | `runService.getRun()` | — |
| `adminCancelRun` | `runService.cancelRun()` | `actorContextResolver` |
| `adminRetryRun` | `runService.retryRun()` | `actorContextResolver` |
| `adminCheckpointDecision` | Deferred to P3-05 | — |
| `adminPreflight` | `preflightService.validate()` | — |
| `adminPreview` | `runService.launchRun()` (dryRun) | `actorContextResolver` |
| `adminGetConfig` | `configService.getConfig()` | — |
| `adminListActions` | Deferred to P3-06 | — |

---

## 6. Existing provisioning route relationship

The admin API routes are **separate from** existing provisioning routes:

| Admin route | Provisioning equivalent | Relationship |
|-------------|------------------------|-------------|
| POST `/admin/runs` | POST `/project-setup-requests` + POST `/provision-project-site` | Admin is generalized; provisioning is domain-specific |
| GET `/admin/runs` | GET `/project-setup-requests` | Admin covers all domains; provisioning covers PS only |
| POST `/admin/runs/{id}/retry` | POST `/provision-project-site/retry` | Admin generalizes retry for all domains |

No existing provisioning routes are modified or removed. The admin API is additive. The orchestration bridge (P3-07) will connect admin runs to provisioning execution.

---

## Cross-references

### Phase 2 contracts
- [API contract catalog](../phase-02/admin-control-plane-api-contract-catalog.md)
- [Run model](../phase-02/admin-control-plane-run-model.md)

### Phase 3 context
- [Host and composition-root plan](./admin-control-plane-host-and-composition-root-plan.md)
- [Service factory and container plan](./admin-control-plane-service-factory-and-container-plan.md)
- [Phase 3 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md)

### Implementation files
- [Admin API route registration](../../../../../backend/functions/src/functions/adminApi/index.ts)
- [Admin host composition root](../../../../../backend/functions/src/hosts/admin-control-plane/index.ts)
- [RELEASE-SCOPE.md](../../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md)
- [Host boundary test](../../../../../backend/functions/src/test/admin-control-plane-host-boundary.test.ts)
