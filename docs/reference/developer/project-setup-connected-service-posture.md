# Project Setup Connected-Service Posture

> **Created:** 2026-03-31 (P7-06)

This document defines the connected-service posture for the Project Setup backend, separating what is enforced in repo code from what must be configured at the Azure resource level.

## Identity model

All backend service operations use **user-assigned Managed Identity** (app-only) in production via `DefaultAzureCredential`. No On-Behalf-Of (OBO) or user-delegated flows are used for downstream service calls.

User-assigned MI is preferred over system-assigned MI for production because it offers:
- **Portability:** the identity survives resource re-creation (e.g., Function App redeployment or slot swap).
- **Explicit identity selection:** `AZURE_CLIENT_ID` must be set to the user-assigned MI's client ID, removing ambiguity when multiple identities are present.

| Service | Identity | Token Scope | Abstraction |
|---------|----------|-------------|-------------|
| SharePoint (Projects list) | Managed Identity | `https://{tenant}.sharepoint.com/.default` | `IProjectRequestsRepository` → `SharePointProjectRequestsAdapter` |
| SharePoint (site provisioning) | Managed Identity | `https://{tenant}.sharepoint.com/.default` | `ISharePointService` → `SharePointService` |
| Microsoft Graph (group provisioning) | Managed Identity | `https://graph.microsoft.com/.default` | `IGraphService` → `GraphService` |
| Azure Table Storage | Managed Identity | via `DefaultAzureCredential()` | `ITableStorageService` → `RealTableStorageService` |
| Azure SignalR | Connection string | `AzureSignalRConnectionString` | `ISignalRPushService` |

Token acquisition is centralized in `IManagedIdentityTokenService` (`backend/functions/src/services/managed-identity-token-service.ts`). This service was previously named `ManagedIdentityOboService` — renamed to accurately reflect app-only behavior (no delegation).

## CORS posture

### Project Setup host (production target)

Configured in `backend/functions/src/hosts/project-setup/host.json`:

```json
"cors": {
  "allowedOrigins": ["https://hedrickbrotherscom.sharepoint.com"],
  "supportCredentials": true
}
```

- **Single specific origin** — no wildcard patterns
- **`supportCredentials: true`** — required for Bearer token transport via `Authorization` header
- **No `*` wildcard** — enforced by release gate test (`release-gates.test.ts`)

### Shared host (broader scope, not used for Project Setup production)

The shared `backend/functions/host.json` includes `https://*.sharepoint.com` in addition to the specific tenant origin. This is wider than necessary for Project Setup but is explicitly locked (no `*` wildcard) and exists to support multi-tenant development scenarios. The Project Setup production deployment uses the domain-scoped host configuration.

### What CORS controls

CORS is configured at the **Azure Function App resource level** — the `host.json` file provides the declarative configuration that Azure applies at the platform layer. The backend application code does not implement custom CORS middleware.

## Config validation tiers

The backend validates configuration in three tiers to separate startup requirements from runtime prerequisites:

| Tier | When Validated | Failure Behavior | Variables |
|------|----------------|-----------------|-----------|
| **Core** | App startup | Blocks startup | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `API_AUDIENCE`, `APPLICATIONINSIGHTS_CONNECTION_STRING` |
| **SharePoint** | App startup | Warning (logged, not blocking) | `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL` |
| **Provisioning** | Saga execution time | Blocks saga only | `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SHAREPOINT_HUB_SITE_ID`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `OPEX_MANAGER_UPN` |

This tiered approach prevents premature failures — the app can serve request CRUD operations even if provisioning prerequisites are not yet configured.

## Permission gates

### Graph group provisioning

The `GRAPH_GROUP_PERMISSION_CONFIRMED` environment variable acts as a **human-verified permission gate**. It must be explicitly set to `'true'` by an administrator after confirming that the Managed Identity has been granted `Group.ReadWrite.All` on Microsoft Graph.

If not set, `GraphPermissionNotConfirmedError` is thrown at saga execution time — request submission and lifecycle management continue to work normally.

### SharePoint site provisioning

SharePoint site provisioning requires the Managed Identity to have either:
- `Sites.FullControl.All` (broad — grants access to all sites)
- `Sites.Selected` with per-site grants (preferred — scoped access)

This is configured at the Azure resource level, not in repo code.

## What must be configured externally (not in repo)

| Requirement | Where Configured | When Needed |
|-------------|-----------------|-------------|
| User-assigned Managed Identity created and assigned to Function App | Azure Portal → Managed Identities + Function App → Identity blade | Always |
| `AZURE_CLIENT_ID` set to user-assigned MI client ID | Azure Function App → Configuration | Always |
| MI → Storage Table Data Contributor | Azure Storage Account → IAM | Always |
| MI → SharePoint access | SharePoint admin center / Graph API grants | Request persistence + provisioning |
| MI → Group.ReadWrite.All | Azure Portal → Entra ID → App permissions | Provisioning saga only |
| Entra app registration + audience URI | Azure Portal → Entra ID → App registrations | JWT validation |
| SPFx API permission approval — `.sppkg` declares `webApiPermissionRequests` (`resource: "hb-intel-api-staging"`, `scope: "access_as_user"`); admin approves in SharePoint admin center API access page after deployment | SharePoint admin center → API access page | Frontend token acquisition via `aadTokenProviderFactory.getToken(audience)` |
| CORS origins | Azure Function App → CORS blade (or `host.json`) | Always |
| SignalR connection string | Azure Portal → SignalR Service | Real-time provisioning events |

## Service factory architecture

Two service factories enforce domain boundaries:

- **`createServiceFactory()`** (`backend/functions/src/services/service-factory.ts`) — shared infrastructure with lazy-initialized domain CRUD services
- **`createProjectSetupServiceFactory()`** (`backend/functions/src/hosts/project-setup/service-factory.ts`) — domain-scoped, excludes non-PS CRUD services per ADR-0124

The Project Setup production deployment uses `createProjectSetupServiceFactory()`. The shared factory exists for the broader platform runtime.
