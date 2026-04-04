# Backend Functions

This package hosts HB Intel Azure Functions for provisioning and integration endpoints. It serves as the **privileged control plane** for the IT Control Center — owning durable orchestration, retries, compensation, adapter invocation, run/audit persistence, and privileged execution via Managed Identity.

**Current foundations**: The provisioning saga orchestrator (`saga-orchestrator.ts`), service factory, Graph/SharePoint adapters, and Azure Table persistence are the original control-plane seed.

**Phase 2 contracts**: Shared contracts in `@hbc/models/admin-control-plane` (58 pure-type exports: action catalog, run model, API DTOs, checkpoint, audit/evidence, adapter registry). This package imports those contracts — it does not define them. See the [package placement map](../../docs/architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-package-placement-and-boundary-map.md).

**Phase 3 foundation (2026-04-02)**: The admin control plane host (`src/hosts/admin-control-plane/`) generalizes these patterns into a reusable backend substrate with 13 authenticated API endpoints under `/api/admin/`, adapter registry with 10 descriptors and a provisioning bridge invoker, orchestration bridge for provisioning-to-admin-run mapping, and `requireAdmin`/`requireDelegatedScope` authorization wiring. See the [Phase 3 plan library](../../docs/architecture/plans/MASTER/spfx/admin/phase-03/).

**Phase 4 durable persistence (2026-04-02)**: Replaces in-memory stores with Azure Table Storage-backed durable persistence for admin runs (`AdminRuns` table), audit events (`AdminAuditEvents` table), and evidence metadata (`AdminEvidence` table). Adds provisioning audit bridge for fire-and-forget spine writes, 3 audit/evidence retrieval API endpoints, and evidence inline/offload boundary logic (32 KB threshold). See the [Phase 4 plan library](../../docs/architecture/plans/MASTER/spfx/admin/phase-04/).

**Phase 9 hybrid identity services (2026-04-03)**: Adds three new service boundaries for Hybrid Identity Administration:
- **Graph service expansion** (`graph-service.ts`): User read/search, group read/search, sync-status visibility, cloud-only user lifecycle (create/update/disable/delete), group membership mutations. Original provisioning-era methods unchanged.
- **AD DS adapter** (`ad-directory-service.ts`): Interface and mock for on-prem AD DS operations (user CRUD, group membership, connection test). Real LDAPS connector wired in Prompt-05+.
- **Connection registry** (`connection-registry-service.ts`): UI-managed connector configuration with secure credential handling. Credentials are write-only (never returned in API responses). Supports test/health/rotate flows.
- **Typed error categories** (`hybrid-identity-errors.ts`): 13 error classes covering Graph permission, AD DS connectivity/auth/permission, authority mismatch, phase boundary, protected target, not-found, conflict, validation, sync-pending, and connection not-configured/unhealthy.

All three services follow the established interface + real + mock pattern and are wired into the admin control plane service factory.

**Phase 12 observability (2026-04-04)**: Adds the durable observability layer for admin operator visibility. Three new Azure Table Storage tables (`ObservabilityAlerts`, `ObservabilityProbeSnapshots`, `ObservabilityErrors`) with durable + mock adapter pairs following the Phase 4 pattern. 15 observability API endpoints under `/api/admin/observability/` covering alert CRUD (list, get, acknowledge, resolve, summary, ingest), probe snapshots (latest, submit, history, health summary), error events (list, get, ingest), dashboard summary, and correlated run timeline. Includes `observability-emitter.ts` for fire-and-forget error classification from route catch blocks (9 routes instrumented across provisioning, white-glove, and Entra control domains), `observability-telemetry-bridge.ts` for saga failure normalization, and `observability-dashboard-service.ts` / `observability-timeline-service.ts` for composite query assembly. All observability stores wired into the admin control plane service factory with mode-based resolution. See the [Phase 12 plan library](../../docs/architecture/plans/MASTER/spfx/admin/phase-12/).

**Phase 9 user lifecycle workflows (2026-04-03)**: Implements 12 user lifecycle workflow handlers covering search, read, create (AD DS + cloud), update, enable/disable, and delete with confirmation tokens. 7 API endpoints under `/api/admin/identity/users/`. Each workflow validates input, runs connector preflight, executes against the correct adapter (AD DS or Graph based on authority), captures sync-pending state for AD DS mutations, and produces normalized audit payloads.

### Domain Hosts

This package uses scoped domain hosts (ADR-0124) for independent deployment of domain-specific route families.

| Host | Path | Purpose | Route families |
|------|------|---------|----------------|
| Monolithic | `src/index.ts` | All routes (backward compat) | 19 |
| Project Setup | `src/hosts/project-setup/` | Project Setup domain boundary | 8 |
| Admin Control Plane | `src/hosts/admin-control-plane/` | Generalized admin backend foundation | 2 (adminApi + health) |

Each host has its own composition root (`index.ts`), scoped service factory, `host.json`, and `RELEASE-SCOPE.md` boundary manifest validated by host-boundary tests.

### Admin Control Plane API Endpoints (P3-04)

All admin endpoints require `withAuth()` JWT authentication and are namespaced under `/api/admin/`.

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

Request/response DTOs are defined in `@hbc/models/admin-control-plane` (Phase 2 contracts). See the [API contract catalog](../../docs/architecture/plans/MASTER/spfx/admin/phase-02/admin-control-plane-api-contract-catalog.md) for full contract details.

### App-Binding API Endpoints (P6A-04)

Managed-app binding endpoints for publishing, resolving, verifying, and repairing backend-setup bindings for target SPFx apps. Backed by Azure Table Storage (`AdminAppBindings` table). The backend is the sole authority for binding writes — target apps and the Admin UX consume bindings but do not own the write path.

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| GET | `/api/admin/apps/{appId}/binding` | `adminGetAppBinding` | Get binding for a managed app |
| GET | `/api/admin/apps/bindings` | `adminListAppBindings` | List all app bindings |
| POST | `/api/admin/apps/{appId}/binding/publish` | `adminPublishAppBinding` | Publish or update binding |
| POST | `/api/admin/apps/{appId}/binding/verify` | `adminVerifyAppBinding` | Verify binding against live state |
| POST | `/api/admin/apps/{appId}/binding/repair` | `adminRepairAppBinding` | Repair a drifted binding |

Binding contracts are in `@hbc/models/admin-control-plane` (`IAppBinding.ts`). See the [binding store and API doc](../../docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-store-and-api.md) for persistence and keying details.

### Hybrid Identity API Endpoints (P9-06, P9-09)

User lifecycle and connection management endpoints for the Hybrid Identity control lane. All endpoints require admin + delegated scope authentication.

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| POST | `/api/admin/identity/users/search` | `identityUserSearch` | Search users |
| GET | `/api/admin/identity/users/{userId}` | `identityUserRead` | Read user profile |
| POST | `/api/admin/identity/users` | `identityUserCreate` | Create user (AD DS or cloud) |
| PATCH | `/api/admin/identity/users/{userId}` | `identityUserUpdate` | Update user properties |
| POST | `/api/admin/identity/users/{userId}/enable` | `identityUserEnable` | Enable user |
| POST | `/api/admin/identity/users/{userId}/disable` | `identityUserDisable` | Disable user |
| DELETE | `/api/admin/identity/users/{userId}` | `identityUserDelete` | Delete user (requires confirmationToken) |
| GET | `/api/admin/connections` | `adminListConnections` | List all connections with health status |
| POST | `/api/admin/connections` | `adminUpsertConnection` | Create or update a connection |
| POST | `/api/admin/connections/{connectorId}/test` | `adminTestConnection` | Test a connection |

All identity operations persist audit payloads to the admin audit store. See the [Phase 9 docs](../../docs/architecture/plans/MASTER/spfx/admin/phase-09/README.md) for action catalog, risk taxonomy, and operator guidance.

### Observability API Endpoints (P12-05)

Operator-facing observability endpoints for alert management, probe health, error log, dashboard summary, and correlated run timelines. All endpoints require admin + delegated scope authentication. Registered via side-effect import of `observability-routes.ts`.

| Method | Route | Handler | Purpose |
|--------|-------|---------|---------|
| GET | `/api/admin/observability/alerts` | `obsListAlerts` | List alerts with status/category/severity/domain/date filters |
| GET | `/api/admin/observability/alerts/{alertId}` | `obsGetAlert` | Get single alert |
| POST | `/api/admin/observability/alerts/{alertId}/acknowledge` | `obsAcknowledgeAlert` | Acknowledge alert (actor from JWT) |
| POST | `/api/admin/observability/alerts/{alertId}/resolve` | `obsResolveAlert` | Resolve alert (actor from JWT) |
| GET | `/api/admin/observability/alerts/summary` | `obsGetAlertSummary` | Aggregated active alert counts by severity |
| POST | `/api/admin/observability/alerts/ingest` | `obsIngestAlerts` | Ingest alert evaluations from monitors |
| GET | `/api/admin/observability/probes/latest` | `obsGetLatestProbeSnapshot` | Latest probe snapshot |
| POST | `/api/admin/observability/probes/snapshots` | `obsSubmitProbeSnapshot` | Persist client-triggered probe results |
| GET | `/api/admin/observability/probes/history` | `obsListProbeSnapshots` | Probe snapshot history |
| GET | `/api/admin/observability/probes/health` | `obsGetProbeHealthSummary` | Aggregated probe health with staleness |
| GET | `/api/admin/observability/errors` | `obsListErrors` | List/query error events with domain/source/classification filters |
| GET | `/api/admin/observability/errors/{errorId}` | `obsGetError` | Get single error event |
| POST | `/api/admin/observability/errors/ingest` | `obsIngestErrors` | Ingest error events |
| GET | `/api/admin/observability/dashboard` | `obsGetDashboardSummary` | Unified alert + probe + error summary |
| GET | `/api/admin/observability/timeline/{runId}` | `obsGetRunTimeline` | Correlated run timeline (audit + alert + error) |

Observability contracts are in `@hbc/models/admin-control-plane` (11 enums + 22 interfaces). See the [Phase 12 API map](../../docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-api-map.md) for full endpoint documentation.

## Local Development Setup

`local.settings.json` is gitignored and must be created per developer machine.

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_TENANT_ID": "<your-tenant-id>",
    "AZURE_CLIENT_ID": "<app-registration-client-id>",
    "AZURE_CLIENT_SECRET": "<dev-service-principal-secret>",
    "AzureSignalRConnectionString": "<signalr-connection-string>",
    "AZURE_TABLE_ENDPOINT": "UseDevelopmentStorage=true",
    "SHAREPOINT_TENANT_URL": "https://hbconstruction.sharepoint.com",
    "SHAREPOINT_APP_CATALOG_URL": "https://hbconstruction.sharepoint.com/sites/appcatalog",
    "HB_INTEL_SPFX_APP_ID": "<hb-intel-spfx-product-id-guid>",
    "SHAREPOINT_HUB_SITE_ID": "<hub-site-id>",
    "OPEX_MANAGER_UPN": "opex.manager@hbconstruction.com",
    "PROVISIONING_STEP5_TIMEOUT_MS": "90000",
    "HBC_ADAPTER_MODE": "mock",
    "ADMIN_SIGNALR_GROUP": "provisioning-admin"
  }
}
```

### Managed Identity vs Local Credentials

- Production uses a user-assigned Managed Identity with `DefaultAzureCredential`. `AZURE_CLIENT_ID` must be set to the user-assigned MI client ID so `DefaultAzureCredential` selects the correct identity.
- Local development uses a developer service principal (`AZURE_CLIENT_SECRET`) because IMDS is not available locally.
- Keep `HBC_ADAPTER_MODE=mock` for normal local development. Use `HBC_ADAPTER_MODE=proxy` for production-like testing with real services.

### Phase 6.5 Environment Variables

- `SHAREPOINT_APP_CATALOG_URL`: Tenant app catalog URL used for Step 5 SPFx installation flow.
- `HB_INTEL_SPFX_APP_ID`: Product ID GUID of the HB Intel SPFx package in the App Catalog.
- `SHAREPOINT_HUB_SITE_ID`: Hub site GUID required for Step 7 association.
- `OPEX_MANAGER_UPN`: UPN of the OpEx manager always included in Step 6 permission assignment.

### Phase 6.6 Dual Store Write Rules (D-PH6-06)

| Event | Azure Table (`ProvisioningStatus`) | SharePoint Audit (`ProvisioningAuditLog`) |
|---|---|---|
| Saga triggered | Upsert initial status row | Fire-and-forget `Started` write |
| Step progress | Upsert after each step completion/failure | No write |
| Step 5 deferred | Upsert with `step5DeferredToTimer=true`, `overallStatus=WebPartsPending` | No write |
| Saga completed | Upsert terminal completion state | Fire-and-forget `Completed` write |
| Saga failed | Upsert terminal failure state | Fire-and-forget `Failed` write |
| Timer resolves Step 5 | Upsert completion and clear deferral flag | Fire-and-forget `Completed` write |

SharePoint audit writes are intentionally non-blocking. They must always use `.catch(...)` and must never throw into saga execution flow.

### Phase 6.6 Environment Variables

- `AZURE_TABLE_ENDPOINT`: App-data Table Storage endpoint URL (production) or connection string (local dev). Used by all domain table services via `createAppTableClient()`.
- `SHAREPOINT_TENANT_URL`: Root site collection URL used for audit-list setup script and SharePoint service operations.
- `HBC_ADAPTER_MODE`: `mock` for local deterministic mode; `proxy` for production services (Managed Identity, SharePoint, Graph). Legacy value `real` is accepted as alias for `proxy`.

### Phase 6.8 Request Lifecycle Endpoints (D-PH6-08)

- `POST /api/project-setup-requests` (`submitProjectSetupRequest`)
  - Requires Bearer token.
  - Validates `projectName` and `groupMembers`.
  - Creates a new request in `Submitted` state.
- `GET /api/project-setup-requests` (`listProjectSetupRequests`)
  - Requires Bearer token.
  - Optional query: `state=<ProjectSetupRequestState>`.
  - Returns request inbox rows.
- `PATCH /api/project-setup-requests/{requestId}/state` (`advanceRequestState`)
  - Requires Bearer token.
  - Enforces transition rules via `isValidTransition`.
  - Enforces `projectNumber` format `##-###-##` when advancing to `ReadyToProvision`.

### Auth Middleware Pattern (P1-C2)

All HTTP route handlers must use the `withAuth()` middleware wrapper for authentication enforcement. This replaces the previous per-handler inline `validateToken()` try-catch pattern.

**Files:**
- `src/middleware/auth.ts` — `withAuth()` wrapper, `extractBearer()`, `AuthContext` interface
- `src/middleware/validateToken.ts` — JWT validation core (unchanged, used internally by `withAuth`)

**Usage:**
```typescript
import { withAuth } from '../../middleware/auth.js';

app.http('myRoute', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'my-resource',
  handler: withAuth(async (request, context, auth) => {
    // auth.claims.upn — authenticated user's UPN
    // auth.claims.oid — user's Object ID
    // auth.claims.roles — JWT role claims
    // auth.claims.displayName — display name (falls back to UPN)
    // auth.claims.jobTitle — optional Entra ID job title claim
    // auth.userToken — raw Bearer token string
    return { status: 200, jsonBody: { user: auth.claims.upn } };
  }),
});
```

**Behavior:**
- Extracts and validates the `Authorization: Bearer <token>` header
- Validates the JWT against Azure Entra ID JWKS via `validateToken()`
- Returns standardized 401 if token is missing, malformed, or invalid
- Passes `AuthContext` (validated claims + raw token) to the handler
- Handler errors are NOT caught — they bubble to the Azure Functions runtime

**Migration:** Existing handlers using inline `validateToken()` try-catch should be migrated to `withAuth()`. The `projectRequests` routes are the first to adopt this pattern (P1-C2 Task 3). Remaining handlers will be migrated as C2 implementation proceeds.

### Request Validation Pattern (P1-C2)

Request body and query parameter validation uses Zod schemas with centralized parse helpers.

**Files:**
- `src/middleware/validate.ts` — `parseBody<T>()` and `parseQuery<T>()` helpers
- `src/validation/schemas/` — domain-specific Zod schemas (leads, projects, estimating, shared pagination)

**Usage:**
```typescript
import { parseBody, parseQuery } from '../../middleware/validate.js';
import { CreateLeadSchema, PaginationQuerySchema } from '../../validation/schemas/index.js';

// Body validation (POST/PUT/PATCH)
const result = await parseBody(request, CreateLeadSchema);
if (!result.ok) return result.response; // 422 with field-level errors
const lead = result.data; // typed as z.infer<typeof CreateLeadSchema>

// Query validation (GET with pagination)
const qResult = parseQuery(request, PaginationQuerySchema);
if (!qResult.ok) return qResult.response;
const { page, pageSize, search } = qResult.data;
```

**Schema Fidelity Rule:** All Zod schemas are derived from the canonical `@hbc/models` interfaces and their `FormData` types. Field names, types, and enum values must match the model source files exactly.

**Available Schemas:**
- `CreateLeadSchema` / `UpdateLeadSchema` — from `ILeadFormData` + `LeadStage`
- `CreateProjectSchema` / `UpdateProjectSchema` / `ListProjectsQuerySchema` — from `IProjectFormData`
- `CreateTrackerSchema` / `UpdateTrackerSchema` — from `IEstimatingTrackerFormData` + `EstimatingStatus`
- `CreateKickoffSchema` — from `IEstimatingKickoffFormData`
- `PaginationQuerySchema` — shared pagination with defaults (page=1, pageSize=25)

### Response Helpers & Request ID (P1-C2)

All HTTP responses should use the standardized response helpers for consistent shapes, error codes, and request ID propagation.

**Files:**
- `src/utils/response-helpers.ts` — `errorResponse()`, `successResponse()`, `listResponse()`, `notFoundResponse()`, `unauthorizedResponse()`, `forbiddenResponse()`
- `src/middleware/request-id.ts` — `extractOrGenerateRequestId()` for X-Request-Id propagation

**Usage:**
```typescript
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { successResponse, errorResponse, listResponse, notFoundResponse } from '../../utils/response-helpers.js';

handler: withAuth(async (request, context, auth) => {
  const requestId = extractOrGenerateRequestId(request);

  // Single resource
  return successResponse(resource);            // 200, { data: resource }
  return successResponse(resource, 201);       // 201, { data: resource }

  // Paginated list
  return listResponse(items, total, page, pageSize, requestId);

  // Errors
  return errorResponse(400, 'VALIDATION_ERROR', 'Details here', requestId);
  return notFoundResponse('Lead', id, requestId);  // 404
})
```

**Response Shapes (D3 lock — `message` is primary error field):**
- Error: `{ message, code, requestId }` with `X-Request-Id` header
- Success: `{ data: T }`
- List: `{ items: T[], pagination: { total, page, pageSize, totalPages } }`

### Phase 6.8 State Machine Rules

Valid transitions:
- `Submitted -> UnderReview`
- `UnderReview -> NeedsClarification | AwaitingExternalSetup | ReadyToProvision`
- `NeedsClarification -> UnderReview`
- `AwaitingExternalSetup -> ReadyToProvision`
- `ReadyToProvision -> Provisioning`
- `Provisioning -> Completed | Failed`
- `Failed -> UnderReview`
- `Completed` is terminal

Notification targets:
- `NeedsClarification`: submitter
- `ReadyToProvision`: controller
- `Provisioning`: group
- `Completed`: group
- `Failed`: controller + submitter

### Phase 6.8 Projects List Setup

Use the one-time setup script to create/verify list schema:

```bash
pnpm exec tsx scripts/create-projects-list.ts
```

Administrator guide: `docs/how-to/administrator/create-projects-list.md`.

### Provisioning Staging Gates

The saga orchestrator validates all provisioning prerequisites at execution time via `validateProvisioningPrerequisites()`. The saga will fail fast with a clear aggregated error if any gate is unsatisfied. In mock/test mode, validation is skipped.

| Gate | Env Var | Status | Owner |
|---|---|---|---|
| Entra Group.ReadWrite.All | `GRAPH_GROUP_PERMISSION_CONFIRMED=true` | **Required** — Step 6 group creation, membership | IT Admin |
| Tenant ID | `AZURE_TENANT_ID` | **Required** — group-to-site permission claim identity | DevOps |
| SharePoint Tenant URL | `SHAREPOINT_TENANT_URL` | **Required** — all SharePoint operations | DevOps |
| Hub Site ID | `SHAREPOINT_HUB_SITE_ID` | **Required** — Step 7 hub association | DevOps |
| App Catalog URL | `SHAREPOINT_APP_CATALOG_URL` | **Required** — Step 5 SPFx install | DevOps |
| SPFx App Package ID | `HB_INTEL_SPFX_APP_ID` | **Required** — Step 5 SPFx install | DevOps |
| OpEx Manager UPN | `OPEX_MANAGER_UPN` | **Required** — Step 6 Leaders group membership | Business |
| Sites.Selected Grant Workflow | `SITES_SELECTED_GRANT_CONFIRMED=true` | **Required** (when Sites.Selected active) — per-site grant workflow (Option A2) confirmed | IT Admin |

**Staging workflow:**
1. Deploy the function app with `HBC_ADAPTER_MODE=proxy`.
2. Confirm IT has granted `Group.ReadWrite.All` to the Managed Identity (see IT-Department-Setup-Guide.md §8.4).
3. Set `GRAPH_GROUP_PERMISSION_CONFIRMED=true` in the Function App configuration.
4. If using Sites.Selected (default), confirm the per-site grant workflow (Option A2) is operational and set `SITES_SELECTED_GRANT_CONFIRMED=true`.
5. Verify all other staging gates via a test provisioning run.

### Phase 6.13 Timer Trigger Configuration (D-PH6-13)

- Set `WEBSITE_TIME_ZONE=Eastern Standard Time` in Azure Function App settings.
- `timerFullSpec` uses CRON `0 0 1 * * *` and relies on the timezone setting above to execute at 1:00 AM EST.
- `POST /api/admin/trigger-timer` is admin-only and blocked when `AZURE_FUNCTIONS_ENVIRONMENT=Production`.

### Phase 7 — Provisioning Saga Hardening

Phase 7 preserves the existing provisioning foundations and hardens them with failure classification, structured evidence, recovery guidance, and improved prelaunch validation.

#### Prelaunch validation (P7-03, P7-07)

`validatePrelaunchReadiness(request)` returns a typed `IPrelaunchValidationResult` with structured failures across 6 categories:

| Category | Checks |
|----------|--------|
| `environment` | Provisioning-specific env vars (Graph permission, SharePoint URLs, hub site, app catalog, SPFx app ID, OpEx manager) |
| `permission` | Graph Group.ReadWrite.All confirmation, Sites.Selected grant workflow |
| `bootstrap` | Install infrastructure (AZURE_TABLE_ENDPOINT, AZURE_CLIENT_ID, API_AUDIENCE, APPLICATIONINSIGHTS_CONNECTION_STRING) |
| `entra-readiness` | Department viewer UPN configuration when department is specified |
| `request-data` | Request completeness (projectId, projectNumber format, groupMembers non-empty) |
| `configuration` | Reserved for future runtime config checks |

The `POST /api/provision-project-site` endpoint performs synchronous preflight and returns HTTP 422 with structured failures when prerequisites are not satisfied.

#### Failure classification (P7-04)

Every saga failure is classified via `classifyFailure()` and persisted as `failureClass` on the durable status record:

| Class | Meaning | Signal |
|-------|---------|--------|
| `transient` | Temporary platform issue | 429, timeout, ECONNRESET, fetch failed |
| `permissions` | Missing or revoked permissions | 403, `GraphPermissionNotConfirmedError` |
| `structural` | Configuration or data issue | 400, 404, validation error |
| `repeated` | Same error class recurs on retry | HTTP status match or error prefix match across runs |
| `admin-class` | Unclassifiable failure | Fallback — requires admin investigation |

#### Step 6 compensation (P7-04)

The compensation chain now includes Entra ID group deletion. When a saga fails after Step 6, the three security groups (leaders, team, viewers) are deleted via `deleteSecurityGroup()` on `IGraphService`. Already-deleted groups (404) are handled silently.

#### Step 5 deferral deadline (P7-04)

Deferred Step 5 jobs older than 7 days are auto-escalated to Failed by the timer handler with a `ProvisioningDeferralDeadlineExceeded` telemetry event.

#### Recovery guidance (P7-05)

`GET /api/provisioning-recovery-guidance/{projectId}` returns structured `IRecoveryGuidance` with `retryAdvisable`, `recommendedAction`, `failureSummary`, `likelyCause`, `nextStep`, `escalationReason`, and `runbookRef` — conditioned on failure class, failed step, and retry count.

#### Retry audit trail (P7-05)

Every retry emits a `ProvisioningRetryInitiated` telemetry event with the initiator's UPN/OID, retry count, previous failure class, and previous failed step. The saga carries forward `previousErrorMessage` for repeated-failure detection.

#### Evidence payload (P7-06)

Structured `IProvisioningEvidence` is captured at saga terminal states and persisted as `evidenceJson`. Includes per-step timing and attempt counts, permission posture at saga start, failure classification, and parent correlation chain.

#### Phase 7 documentation

Detailed references in `docs/architecture/plans/MASTER/spfx/admin/phase-07/`:
- `provisioning-failure-classification-and-run-state-model.md`
- `provisioning-recovery-and-operator-guidance-contract.md`
- `provisioning-prelaunch-validation-model.md`
- `provisioning-diagnostics-and-evidence-guide.md`
- `provisioning-readiness-dependency-integration.md`
