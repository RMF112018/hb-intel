# Backend Deployment Validation & Target Confirmation

> **Date**: 2026-03-29
> **Target**: Azure Function App `<function-app-name>`
> **Host**: `<function-app-url>`
> **Resource Group**: `hb-intel`

---

## 1. Executive Summary

The deployable backend is `backend/functions/` — a Node 20 Azure Functions v4 project with 104 HTTP endpoints, 3 timer triggers, and 2 queue triggers. The project compiles to `dist/` via TypeScript and depends on 4 workspace packages (`@hbc/models`, `@hbc/provisioning`, `@hbc/acknowledgment`, `@hbc/notification-intelligence`).

**Critical blocker**: The existing CI pipeline packages `dist/`, `host.json`, `package.json` into a zip **without `node_modules`**, relying on Oryx server-side build. However, `workspace:*` dependencies cannot resolve on the server without the monorepo context. A self-contained deployment artifact (including `node_modules`) is required for reliable deployment.

---

## 2. Exact Deployable Backend Project

| Property | Value |
|----------|-------|
| Path | `backend/functions/` |
| Package name | `@hbc/functions` |
| Version | `0.0.60` |
| Runtime | Node.js 20, Azure Functions v4 |
| Entry point | `dist/src/index.js` |
| Module system | ESM (`"type": "module"`) |
| Config | `host.json` (Functions host config) |

### Workspace Dependencies (must be pre-built)

| Package | Path | Required By |
|---------|------|-------------|
| `@hbc/models` | `packages/models/` | Type definitions for all domain models |
| `@hbc/provisioning` | `packages/provisioning/` | Provisioning saga, API client types |
| `@hbc/acknowledgment` | `packages/acknowledgment/` | Acknowledgment event persistence |
| `@hbc/notification-intelligence` | `packages/notification-intelligence/` | Notification dispatch |

---

## 3. Build & Publish Commands

### Build (local)

```bash
# Install all monorepo dependencies
pnpm install

# Build workspace dependencies first, then functions
pnpm turbo run build --filter=@hbc/functions...

# Or explicitly:
pnpm turbo run build --filter=@hbc/models --filter=@hbc/provisioning
pnpm turbo run build --filter=@hbc/functions
```

### Run Tests (pre-deploy gate)

```bash
pnpm turbo run test --filter=@hbc/functions
```

### Create Self-Contained Deployment Artifact

The CI workflow's zip omits `node_modules`. For reliable first deployment, create a self-contained artifact:

```bash
cd backend/functions

# Build
pnpm run build

# Create deployment directory
mkdir -p .deploy
cp -r dist/ .deploy/dist/
cp host.json .deploy/
cp package.json .deploy/

# Resolve workspace dependencies into a flat node_modules
# Option A: Use pnpm deploy (creates isolated deployable)
pnpm deploy --filter=@hbc/functions --prod .deploy

# Option B: Manual — copy node_modules with workspace links resolved
cp -rL node_modules/ .deploy/node_modules/

# Create zip
cd .deploy && zip -r ../functions-artifact.zip . && cd ..
```

### Deploy via Azure Functions Core Tools

```bash
cd backend/functions/.deploy
func azure functionapp publish <function-app-name> --javascript
```

### Deploy via Azure CLI (zip deploy)

```bash
az functionapp deployment source config-zip \
  --resource-group hb-intel \
  --name <function-app-name> \
  --src functions-artifact.zip
```

### Deploy via GitHub Actions (existing pipeline)

Push to `main` or trigger `deploy-functions.yml` manually with `staging` target.
**Note**: The CI pipeline's zip artifact must be fixed to include `node_modules` for `workspace:*` dependencies to resolve.

---

## 4. Runtime Compatibility Assessment

| Requirement | Azure Target | Repo Expectation | Status |
|-------------|-------------|-------------------|--------|
| Runtime | Node.js | Node.js | Compatible |
| Node version | 20.x | `~20` (WEBSITE_NODE_DEFAULT_VERSION) | Compatible |
| Functions runtime | v4 | `@azure/functions` v4.6 | Compatible |
| Module system | ESM support | `"type": "module"` | Compatible (Node 20 supports ESM) |
| Host config | Functions v2.0 | `host.json` version 2.0 | Compatible |
| OS | Linux | No OS-specific code | Compatible |
| Plan | Flex Consumption | No cold-start-sensitive timers | Compatible |

### Potential Compatibility Concern

The Function App was created as **Linux Flex Consumption**. Timer triggers (`timerFullSpec` at 1 AM, `SendDigestEmail` hourly, `cleanupIdempotency` at 3 AM) require the app to wake on schedule. Flex Consumption supports this but the `WEBSITE_TIME_ZONE` setting (expected: `Eastern Standard Time`) must be configured.

---

## 5. Required Endpoint Inventory (Estimating Project Setup Flow)

### Critical Path Endpoints

| Route | Method | Function | Purpose |
|-------|--------|----------|---------|
| `/api/project-setup-requests` | POST | `submitProjectSetupRequest` | Submit new request |
| `/api/project-setup-requests` | GET | `listProjectSetupRequests` | List requests (requester-scoped) |
| `/api/project-setup-requests/{requestId}` | GET | `getProjectSetupRequest` | Get single request |
| `/api/project-setup-requests/{requestId}/state` | PATCH | `advanceRequestState` | Advance lifecycle state |
| `/api/provisioning-status/{projectId}` | GET | `getProvisioningStatus` | Check provisioning status |
| `/api/provisioning-negotiate` | POST | `signalrNegotiate` | SignalR connection negotiate |
| `/api/provisioning-retry/{projectId}` | POST | `retryProvisioning` | Retry failed provisioning |
| `/api/provisioning-escalate/{projectId}` | POST | `escalateProvisioning` | Escalate to admin |
| `/api/health` | GET | `health` | Health check |

### Supporting Endpoints (Full Platform)

104 total HTTP endpoints across: projects, leads, estimating trackers/kickoffs, schedule, contracts, risk, compliance, buyout, scorecards, PMP, notifications, acknowledgments, provisioning admin.

---

## 6. Required App Settings Inventory

### Tier 1 — Mandatory for First Boot

These must be set before deployment or the startup validation gate will throw.

| Setting | Value / Source | Purpose |
|---------|---------------|---------|
| `FUNCTIONS_WORKER_RUNTIME` | `node` | Azure Functions runtime |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` | Node.js version |
| `AzureWebJobsStorage` | Storage account connection string | Functions host requirement |
| `HBC_ADAPTER_MODE` | `proxy` | Real services (NOT `mock`) |
| `AZURE_TENANT_ID` | Entra ID tenant GUID | Token validation issuer |
| `AZURE_CLIENT_ID` | App registration client ID | Token validation audience |
| `SHAREPOINT_TENANT_URL` | `<sharepoint-tenant-url>` | SP tenant root |
| `SHAREPOINT_PROJECTS_SITE_URL` | `https://<sharepoint-site-url>` | Projects list site |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights connection string | Telemetry |

### Tier 2 — Required for Provisioning Saga

| Setting | Value / Source | Purpose |
|---------|---------------|---------|
| `SHAREPOINT_HUB_SITE_ID` | Hub site GUID | Step 7 hub association |
| `SHAREPOINT_APP_CATALOG_URL` | App catalog URL | Step 5 SPFx install |
| `HB_INTEL_SPFX_APP_ID` | SPFx app GUID | Step 5 SPFx install |
| `OPEX_MANAGER_UPN` | OpEx manager email | Step 6 permissions |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | `true` | IT prerequisite gate |

### Tier 3 — Required for Authorization & Notifications

| Setting | Value / Source | Purpose |
|---------|---------------|---------|
| `CONTROLLER_UPNS` | Comma-separated UPNs | Role-based state transitions |
| `ADMIN_UPNS` | Comma-separated UPNs | Admin access scoping |
| `AzureSignalRConnectionString` | SignalR connection string | Real-time updates |
| `EMAIL_DELIVERY_API_KEY` | SendGrid API key | Email notifications |
| `EMAIL_FROM_ADDRESS` | Sender email | Email notifications |
| `NOTIFICATION_API_BASE_URL` | Function App URL | Self-referencing for notifications |
| `AZURE_TABLE_ENDPOINT` | Table Storage endpoint | Provisioning status persistence |

### Tier 4 — Optional / Environment-Specific

| Setting | Default | Purpose |
|---------|---------|---------|
| `PROVISIONING_STEP5_TIMEOUT_MS` | `90000` | Step 5 timeout override |
| `SITES_PERMISSION_MODEL` | `sites-selected` | SP permission model |
| `STRUCTURAL_OWNER_UPNS` | `""` | Structural owners |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | `""` | Dept viewer access |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | `""` | Dept viewer access |
| `WEBSITE_TIME_ZONE` | `Eastern Standard Time` | Timer trigger timezone |

### CORS Configuration

The SPFx-hosted frontend calls the Function App from SharePoint pages. CORS must allow:
- `<sharepoint-tenant-url>`

This is configured in Azure Portal → Function App → CORS, not via app settings.

### Managed Identity

The Function App needs a **system-assigned managed identity** for:
- SharePoint access via `DefaultAzureCredential` (PnPjs)
- Azure Table Storage access
- The identity must have `Sites.Selected` or appropriate SharePoint API permissions

---

## 7. Deployment Blockers & Prerequisites

### BLOCKER: Workspace Dependencies in Deployment Artifact

**Status**: BLOCKING first deployment

The CI workflow packages `dist/`, `host.json`, `package.json` into a zip without `node_modules`. The `package.json` declares `workspace:*` dependencies that cannot resolve via `npm install` on the server.

**Fix options**:
1. **Self-contained zip** (recommended for first deploy): Include `node_modules` with resolved workspace links in the artifact
2. **pnpm deploy**: Use `pnpm deploy --filter=@hbc/functions --prod` to create an isolated deployable directory
3. **Bundle**: Add a bundler (esbuild/rollup) to produce a single-file or flat output

### BLOCKER: App Settings Not Yet Configured

The Azure Function App needs Tier 1 settings before first request. Without them, the startup validation gate throws and all endpoints return 500.

### PREREQUISITE: Managed Identity

The Function App must have a system-assigned managed identity enabled, and that identity must be granted SharePoint API permissions for the HBCentral site.

### PREREQUISITE: CORS

The Function App must allow CORS from `<sharepoint-tenant-url>`. **COMPLETE**

### PREREQUISITE: Entra ID App Registration

`AZURE_CLIENT_ID` must point to an app registration configured to:
- Issue access tokens for the API
- Have the SPFx app as an authorized client
- Include `upn`, `oid`, `roles` claims

- `AZURE_CLIENT_ID` = 5720372f-1caa-4d1b-a965-dd5ec2652963
- 

---

## 8. Recommended Execution Order for Deployment

### Phase 1 — Infrastructure Setup (before code deploy)

1. Enable system-assigned managed identity on the Function App
2. Grant managed identity SharePoint API permissions (`Sites.Selected` for HBCentral)
3. Configure CORS: add `<sharepoint-tenant-url>`
4. Confirm/create Entra ID app registration
5. Set all Tier 1 app settings (see Section 6)
6. Set Tier 3 app settings (CONTROLLER_UPNS, ADMIN_UPNS, etc.)

### Phase 2 — Build & Deploy

1. Build: `pnpm turbo run build --filter=@hbc/functions...`
2. Create self-contained artifact with `node_modules`
3. Deploy via `func azure functionapp publish` or zip deploy
4. Verify `/api/health` returns 200

### Phase 3 — Smoke Validation

1. Call `GET /api/health` — expect 200
2. Call `GET /api/project-setup-requests` with valid Bearer token — expect 200 with empty/populated list
3. Verify no startup validation errors in Application Insights
4. Verify `HBC_ADAPTER_MODE=proxy` (not mock) in logs

### Phase 4 — Provisioning Prerequisites (when ready)

1. Set Tier 2 app settings (hub site ID, app catalog, SPFx app ID)
2. Set `GRAPH_GROUP_PERMISSION_CONFIRMED=true` after IT grants Graph permissions
3. Test a full provisioning saga end-to-end

---

## 9. Prompt 02 Handoff

The next prompt should:
1. Create a self-contained deployment artifact (resolving `workspace:*` deps)
2. Configure Tier 1 app settings on the Azure Function App
3. Deploy the artifact
4. Run health check and smoke validation
5. Configure CORS
6. Test the `/api/project-setup-requests` endpoint from the SPFx app
