# Phase 9 Connection Topology and Configuration Gap Map

## Purpose

Map the current connection topology, configuration handling reality, and specific gaps that Phase 9 must close to deliver UI-managed connection setup, testing, rotation, and maintenance for hybrid identity administration.

This document is a companion to the Phase 9 repo-truth and hybrid gap map. It focuses specifically on the **connection and configuration substrate** that determines whether IT can operate the hybrid identity feature without code edits.

---

## Current connection topology

### Established connections

| Connection | Technology | Auth Model | Config Source | Status |
|------------|-----------|------------|---------------|--------|
| Microsoft Graph API | `@microsoft/microsoft-graph-client` | Managed Identity via `DefaultAzureCredential` + `AZURE_CLIENT_ID` | Environment variable | Working — provisioning-era group operations |
| SharePoint Online | PnPjs | Managed Identity token | Environment variable | Working — site provisioning and management |
| Azure Table Storage | `@azure/data-tables` | Managed Identity | Environment variable (`AzureWebJobsStorage` or connection string) | Working — provisioning status, admin runs, audit |
| Azure SignalR | Azure Functions SignalR binding | Managed Identity or connection string | Environment variable | Working — real-time progress push |
| Azure Key Vault | Not currently used directly | N/A | N/A | Not connected — no explicit Key Vault integration |

### Connection auth model detail

**Graph service** (`backend/functions/src/services/graph-service.ts`):
- Uses `DefaultAzureCredential` to obtain token for `https://graph.microsoft.com/.default`
- Managed Identity selected via `AZURE_CLIENT_ID` environment variable
- All operations additionally gated by `GRAPH_GROUP_PERMISSION_CONFIRMED=true` env var
- On gate failure: throws `GraphPermissionNotConfirmedError` referencing IT setup guide

**SharePoint service** (`backend/functions/src/services/sharepoint-service.ts`):
- PnPjs configured with Managed Identity token provider
- `DefaultAzureCredential` for app-only access
- Deterministic site URL construction from project metadata

**Table Storage** (`backend/functions/src/services/table-storage-service.ts`):
- Azure SDK `TableClient` with connection string or Managed Identity
- Tables: `ProvisioningStatus`, `AdminRuns`, `AdminAudit`, `AdminEvidence`

### Connections that do not exist

| Connection | Required for Phase 9 | Current state |
|------------|----------------------|---------------|
| AD DS / LDAP | Yes — authoritative user lifecycle | **Does not exist** — zero implementation |
| Connection registry store | Yes — UI-managed connection configs | **Does not exist** |
| Key Vault (for connection secrets) | Likely — secure credential resolution | **Not integrated** |
| On-prem network relay / hybrid agent | Possibly — depends on network topology | **Does not exist** |

---

## Current configuration handling reality

### How connections are configured today

| Setting | Location | Editable by IT via UI? | No-code handoff compliant? |
|---------|----------|------------------------|---------------------------|
| `AZURE_CLIENT_ID` (Managed Identity) | `local.settings.json` (dev) / App Settings (deployed) | No — deployment config | **Acceptable** — platform infrastructure, set at deployment time by developer |
| `AzureWebJobsStorage` | `local.settings.json` (dev) / App Settings (deployed) | No — deployment config | **Acceptable** — Azure platform plumbing |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | `local.settings.json` (dev) / App Settings (deployed) | No — requires config edit | **Not compliant** — IT cannot toggle this without editing deployment config |
| `SHAREPOINT_TENANT_URL` | Environment variable | No — deployment config | **Acceptable** — set once at deployment |
| `SIGNALR_CONNECTION_STRING` | Environment variable | No — deployment config | **Acceptable** — Azure platform plumbing |
| AD DS endpoint / credentials | Does not exist | N/A | **Not compliant** — no path at all |
| Connection registry entries | Does not exist | N/A | **Not compliant** — no path at all |

### Developer-time vs IT-time configuration

The current model is **developer-deploys-and-configures**:
1. Developer sets environment variables during deployment
2. Developer confirms Graph permissions by setting env var gate
3. IT approves Graph API consent in Entra admin portal
4. IT approves app in SharePoint app catalog
5. Feature works — but only because the developer configured the backend

**Phase 9 target model** is **developer-deploys, IT-configures**:
1. Developer deploys the Function App and SPFx package
2. IT installs the SPFx app via SharePoint admin center
3. IT configures hybrid identity connections through the admin UI
4. IT tests connections through the admin UI
5. IT approves Graph consent and any external prerequisites
6. Feature works — because IT configured it through the app

---

## Gap analysis

### Gap 1: No UI-managed connection configuration path

**Current state:** All backend connections are configured via environment variables or deployment templates. There is no API endpoint, service, or UI component that allows an administrator to enter, update, or view connection settings through the application.

**Required state:** A governed path from admin UI → backend API → secure storage → connection resolution, so IT can configure connectors without touching code or deployment config.

**What must be built:**
- Backend `IConnectionRegistry` service with Table Storage persistence
- API endpoints for connection CRUD (create, read, update, delete, test)
- Frontend connection management pages within the Hybrid Identity lane
- Secure handling of sensitive values (at minimum, encrypted-at-rest in Table Storage; ideally, Key Vault references)

### Gap 2: No secure backend storage for connection credentials

**Current state:** Sensitive values (Managed Identity client ID, connection strings) are stored as environment variables in Azure App Settings. There is no application-level credential store, and no integration with Azure Key Vault for runtime secret resolution.

**Required state:** Connection credentials entered via UI must be stored securely by the backend. SPFx must never hold or cache credentials.

**What must be built:**
- Secure storage model for connection details (Table Storage with encryption, or Key Vault-backed references)
- Resolution service that loads connection details at execution time without exposing secrets to the frontend
- Credential rotation support without downtime

### Gap 3: No connection health / test / verification capability

**Current state:** No endpoint or service validates whether a configured connection is functional. The Graph permission env-var gate is a static boolean, not a runtime connectivity check.

**Required state:** IT must be able to test connections after configuration, see last-verified timestamps, and receive clear error messages when connections fail.

**What must be built:**
- `testConnection(connectorId)` capability in the connection registry
- Health check metadata (last-tested, last-succeeded, error detail)
- Frontend display of connection health status
- Preflight integration so hybrid identity workflows refuse to execute with unhealthy connections

### Gap 4: No AD DS connection path

**Current state:** The repo contains zero AD DS, LDAP, or on-prem directory connectivity. The adapter registry has a descriptor for `identity-provisioning:ad-ds` but no invoker.

**Required state:** If AD DS is authoritative for user lifecycle, there must be a secure, tested, UI-configured connection from the backend to the on-prem directory.

**What must be built:**
- AD DS connector interface and implementation (technology choice TBD in Prompt-02)
- Connection model for AD DS (endpoint, port, base DN, service account, auth method)
- Network reachability validation
- Credential management (service account password or certificate)
- Integration with the connection registry

### Gap 5: Graph permission gate requires code edit

**Current state:** `GRAPH_GROUP_PERMISSION_CONFIRMED=true` must be set as an environment variable. Without it, all Graph operations throw `GraphPermissionNotConfirmedError`.

**Required state:** Graph permission confirmation should be part of the UI-managed connection configuration or preflight check flow, not a code-edit gate.

**What must be built:**
- Migrate the Graph permission gate from env-var to connection-registry-managed state
- Allow IT to confirm Graph permissions through the UI after completing consent in Entra admin portal
- Retain the safety gate behavior (do not remove the check — relocate it to the governed path)

---

## Required Phase 9 connection topology

```
┌──────────────────────────────────────────────────────────────┐
│  Admin SPFx App (operator console)                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Connection Management Pages                           │  │
│  │  - Configure connectors (AD DS, Graph confirmation)    │  │
│  │  - Test connections                                    │  │
│  │  - View health / last-verified                         │  │
│  │  - Rotate credentials                                  │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│                         │ Bearer token (session token factory)│
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┼────────────────────────────────────┐
│  Backend (privileged control plane)                           │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │  Connection Management API                              │  │
│  │  POST /api/admin/connections                            │  │
│  │  GET  /api/admin/connections                            │  │
│  │  PUT  /api/admin/connections/{id}                       │  │
│  │  POST /api/admin/connections/{id}/test                  │  │
│  │  DELETE /api/admin/connections/{id}                     │  │
│  └──────────────────────┬─────────────────────────────────┘  │
│  ┌──────────────────────▼─────────────────────────────────┐  │
│  │  Connection Registry Service                            │  │
│  │  - CRUD for connector configurations                    │  │
│  │  - Secure credential storage / resolution               │  │
│  │  - Health metadata tracking                             │  │
│  │  - Connection test execution                            │  │
│  └──┬───────────────────────────────────────────┬─────────┘  │
│     │                                           │            │
│  ┌──▼──────────────────┐  ┌─────────────────────▼─────────┐  │
│  │  Table Storage       │  │  Key Vault (optional/future)  │  │
│  │  ConnectionRegistry  │  │  Secret resolution            │  │
│  │  table               │  │                               │  │
│  └──────────────────────┘  └───────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Hybrid Identity Services (resolve connections at exec) │   │
│  │  ┌──────────────┐  ┌──────────────┐                    │   │
│  │  │  AD DS        │  │  Graph        │                   │   │
│  │  │  Adapter      │  │  Service      │                   │   │
│  │  │  (new)        │  │  (expanded)   │                   │   │
│  │  └──────┬───────┘  └──────┬───────┘                    │   │
│  └─────────┼─────────────────┼────────────────────────────┘   │
│            │                 │                                 │
└────────────┼─────────────────┼─────────────────────────────────┘
             │                 │
    ┌────────▼────────┐  ┌────▼──────────────┐
    │  AD DS           │  │  Microsoft Graph   │
    │  (on-prem)       │  │  (cloud)           │
    │  LDAP / hybrid   │  │  v1.0 API          │
    └─────────────────┘  └────────────────────┘
```

---

## Classification of configuration items

### Deployment-time (developer sets, acceptable)

These are Azure platform infrastructure settings that are set once during deployment and do not need IT-facing UI:

- `AZURE_CLIENT_ID` (Managed Identity)
- `AzureWebJobsStorage` (Table Storage connection)
- `SHAREPOINT_TENANT_URL`
- `SIGNALR_CONNECTION_STRING`
- Function App host configuration

### IT-time (must be UI-manageable)

These must be configurable through the admin app UI after deployment:

- AD DS connector endpoint, port, base DN
- AD DS service account credentials or certificate reference
- Graph permission confirmation status
- Connection health/test results
- Credential rotation for connectors

### External admin-page steps (acceptable)

These are standard Microsoft admin actions that IT performs outside the app:

- Graph API consent in Entra admin portal
- SharePoint app catalog approval
- Tenant-level permission grants
- Entra app registration configuration (if needed)

### External infrastructure prerequisites (acceptable)

These are pre-existing infrastructure requirements:

- AD DS domain controllers must be reachable from the Azure Function
- Network connectivity (VPN, ExpressRoute, or hybrid agent) must be established
- Service account with appropriate AD DS permissions must exist
