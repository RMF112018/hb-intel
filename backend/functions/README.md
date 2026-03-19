# Backend Functions

This package hosts HB Intel Azure Functions for provisioning and integration endpoints.

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
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
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

- Production uses system-assigned Managed Identity with `DefaultAzureCredential`.
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

- `AZURE_STORAGE_CONNECTION_STRING`: Required by `RealTableStorageService` for Azure Table access.
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

### Phase 6.13 Timer Trigger Configuration (D-PH6-13)

- Set `WEBSITE_TIME_ZONE=Eastern Standard Time` in Azure Function App settings.
- `timerFullSpec` uses CRON `0 0 1 * * *` and relies on the timezone setting above to execute at 1:00 AM EST.
- `POST /api/admin/trigger-timer` is admin-only and blocked when `AZURE_FUNCTIONS_ENVIRONMENT=Production`.
