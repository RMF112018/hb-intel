# Backend Deployment — Azure Pre-Deploy Readiness (Updated)

> **Date**: 2026-03-29
> **Target**: `hb-intel-function-app` (`hb-intel` resource group)
> **Host**: `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`
> **Predecessor**: `backend-deployment-validation-and-target-confirmation.md`

---

## 1. Executive Summary

Three contradictions between the Prompt 01 report and the live Azure target have been reconciled through repo-truth analysis. The Azure CLI session expired during this prompt, so all Azure configuration commands are provided as exact executable scripts rather than applied directly. The repo is compatible with the Azure target as provisioned; no infrastructure reconfiguration is required.

---

## 2. Reconciliation Matrix

| # | Item | Report Assumption | Live Azure State | Resolution |
|---|------|-------------------|-----------------|------------|
| 1 | **Node version** | Node 20 (`~20`) | Node 22 | **Keep Node 22.** Root `package.json` requires `"node": ">=20"`. `@azure/functions@4.11.2` requires `"node": ">=20.0"`. Node 22 satisfies both. The `~20` in `local.settings.example.json` and `'20'` in CI are conventions, not hard constraints. |
| 2 | **Managed identity** | System-assigned required | User-assigned present | **Keep user-assigned.** `DefaultAzureCredential` supports user-assigned identity when `AZURE_CLIENT_ID` is set to the identity's client ID. No code path explicitly requires system-assigned. |
| 3 | **CORS** | Setup step needed | Already configured for `https://hedrickbrotherscom.sharepoint.com` | **Verified sufficient.** User marked as COMPLETE in deployment doc. SPFx browser calls require this origin. |
| 4 | **Public network access** | Not assessed | Needs validation | **Must be enabled.** SPFx browser calls come from user browsers, not Azure VNet. Function App must accept public HTTPS traffic. |

---

## 3. Runtime / Version Decision

**Decision: Keep Node 22**

Evidence:
- `package.json` (root): `"engines": { "node": ">=20" }` — Node 22 satisfies
- `@azure/functions@4.11.2`: `"engines": { "node": ">=20.0" }` — Node 22 satisfies
- `@pnp/sp@4.18.0`: No Node 22 incompatibility known
- `@azure/identity@4.5.0`: Supports Node 22
- `jose@5.9.6`: Supports Node 22
- `tsconfig.json`: `"lib": ["ES2022"]` — compatible with Node 22
- `"type": "module"` ESM — fully supported in Node 22

**Action**: Set `WEBSITE_NODE_DEFAULT_VERSION=~22` in app settings (not `~20`).

---

## 4. Identity Decision

**Decision: Keep user-assigned managed identity**

Evidence:
- All credential usage is `new DefaultAzureCredential()` (3 services: `sharepoint-service.ts`, `project-requests-repository.ts`, `msal-obo-service.ts`)
- `DefaultAzureCredential` chain: env vars → managed identity → CLI → etc.
- For user-assigned identity, set `AZURE_CLIENT_ID` to the identity's client ID in app settings
- No code path calls `ManagedIdentityCredential` directly with system-assigned semantics

**Action**: Ensure `AZURE_CLIENT_ID` in app settings points to the user-assigned identity's client ID (NOT the Entra ID app registration client ID). If the same client ID serves both purposes, no conflict. If different, two separate settings may be needed — see note in Section 6.

**Important**: `AZURE_CLIENT_ID` is used in two contexts in this codebase:
1. **Token validation** (`validateToken.ts`): Used as the `audience` parameter for JWT verification — this must be the app registration client ID
2. **Credential resolution** (`DefaultAzureCredential`): Used to select the user-assigned managed identity — this must be the identity's client ID

If these are different IDs, one possible solution:
- Use `AZURE_CLIENT_ID` for the managed identity (what `DefaultAzureCredential` reads)
- Add a separate `JWT_AUDIENCE` or use the existing app registration setup to match

This must be validated during configuration. See blocked items in Section 7.

---

## 5. CORS & Public Network Access

### CORS

**Status: Configured (user-confirmed COMPLETE)**

The SharePoint origin `https://hedrickbrotherscom.sharepoint.com` is already present. This is required because the SPFx-hosted Estimating app makes direct browser fetch calls to the Function App from SharePoint pages.

**Validate with:**
```bash
az functionapp cors show --name hb-intel-function-app --resource-group hb-intel
```

Expect to see `https://hedrickbrotherscom.sharepoint.com` in the allowed origins list.

### Public Network Access

**Required: Enabled**

The SPFx app runs in user browsers. API calls originate from the browser, not from Azure VNet. The Function App must accept public HTTPS traffic.

**Validate with:**
```bash
az functionapp show --name hb-intel-function-app --resource-group hb-intel \
  --query "publicNetworkAccess" -o tsv
```

Expected: `Enabled`. If `Disabled`, enable with:
```bash
az functionapp update --name hb-intel-function-app --resource-group hb-intel \
  --set publicNetworkAccess=Enabled
```

---

## 6. App Settings — Exact Configuration

### Azure CLI Login Required First

```bash
az login --tenant "91e238a3-4af4-42c0-9cb8-eb37861d82f3" \
  --scope "https://management.core.windows.net//.default"
```

### Step 1: Query current settings

```bash
az functionapp config appsettings list \
  --name hb-intel-function-app \
  --resource-group hb-intel \
  -o table
```

### Step 2: Apply Tier 1 mandatory settings

```bash
az functionapp config appsettings set \
  --name hb-intel-function-app \
  --resource-group hb-intel \
  --settings \
    FUNCTIONS_WORKER_RUNTIME=node \
    WEBSITE_NODE_DEFAULT_VERSION=~22 \
    HBC_ADAPTER_MODE=proxy \
    SHAREPOINT_TENANT_URL=https://hedrickbrotherscom.sharepoint.com \
    SHAREPOINT_PROJECTS_SITE_URL=https://hedrickbrotherscom.sharepoint.com/sites/HBCentral \
    NOTIFICATION_API_BASE_URL=https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net \
    WEBSITE_TIME_ZONE="Eastern Standard Time"
```

### Step 3: Apply settings that require known values

These require exact values from the Azure environment. Query and set:

```bash
# Get the user-assigned managed identity client ID
az functionapp identity show \
  --name hb-intel-function-app \
  --resource-group hb-intel \
  --query "userAssignedIdentities" -o json

# Get Application Insights connection string
az monitor app-insights component show \
  --resource-group hb-intel \
  --query "[0].connectionString" -o tsv

# Get Storage Account connection string
az storage account list --resource-group hb-intel \
  --query "[0].name" -o tsv
# Then:
az storage account show-connection-string \
  --name <storage-account-name> \
  --resource-group hb-intel \
  --query "connectionString" -o tsv

# Apply discovered values
az functionapp config appsettings set \
  --name hb-intel-function-app \
  --resource-group hb-intel \
  --settings \
    AZURE_TENANT_ID=91e238a3-4af4-42c0-9cb8-eb37861d82f3 \
    AZURE_CLIENT_ID=<user-assigned-identity-client-id-or-app-reg-client-id> \
    APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string> \
    AzureWebJobsStorage=<storage-connection-string> \
    AZURE_TABLE_ENDPOINT=<table-storage-endpoint>
```

### Step 4: Apply business/authorization settings

```bash
az functionapp config appsettings set \
  --name hb-intel-function-app \
  --resource-group hb-intel \
  --settings \
    CONTROLLER_UPNS="<controller1@hedrickbrothers.com,controller2@hedrickbrothers.com>" \
    ADMIN_UPNS="<admin1@hedrickbrothers.com>" \
    OPEX_MANAGER_UPN="<opex-manager@hedrickbrothers.com>" \
    EMAIL_FROM_ADDRESS="hb-intel@hedrickbrothers.com"
```

---

## 7. Settings Still Missing / Blocked

| Setting | Status | Blocker |
|---------|--------|---------|
| `AZURE_CLIENT_ID` | **BLOCKED** | Must determine: is the user-assigned identity client ID the same as the app registration client ID? If different, the dual-use conflict must be resolved. |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | **BLOCKED** | Requires querying App Insights resource (Azure CLI expired) |
| `AzureWebJobsStorage` | **BLOCKED** | Requires querying storage account (Azure CLI expired) |
| `AZURE_TABLE_ENDPOINT` | **BLOCKED** | Requires storage account endpoint |
| `AzureSignalRConnectionString` | **DEFERRED** | SignalR not required for initial Project Setup list/submit flow; needed for real-time provisioning updates |
| `EMAIL_DELIVERY_API_KEY` | **DEFERRED** | SendGrid key; needed for email notifications, not for core workflow |
| `SHAREPOINT_HUB_SITE_ID` | **DEFERRED** | Needed for provisioning saga Step 7, not for request submission |
| `SHAREPOINT_APP_CATALOG_URL` | **DEFERRED** | Needed for provisioning saga Step 5 |
| `HB_INTEL_SPFX_APP_ID` | **DEFERRED** | Needed for provisioning saga Step 5 |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | **DEFERRED** | IT prerequisite for provisioning |
| `CONTROLLER_UPNS` | **BLOCKED** | Requires confirmed UPN list from product owner |
| `ADMIN_UPNS` | **BLOCKED** | Requires confirmed UPN list from product owner |
| `OPEX_MANAGER_UPN` | **BLOCKED** | Requires confirmed UPN from product owner |

### Startup Validation Impact

The `validateRequiredConfig()` function runs when `HBC_ADAPTER_MODE=proxy`. It checks all entries in `WAVE0_REQUIRED_CONFIG` with `requiredInProd: true`. If any are missing, it throws and all endpoints return 500.

**Critical**: The following settings with `requiredInProd: true` must ALL be present for the app to start in proxy mode:
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET` (or managed identity must be configured to skip this)
- `AZURE_TABLE_ENDPOINT`
- `AzureSignalRConnectionString`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`
- `SHAREPOINT_TENANT_URL`
- `SHAREPOINT_PROJECTS_SITE_URL`
- `SHAREPOINT_HUB_SITE_ID`
- `EMAIL_DELIVERY_API_KEY`
- `SHAREPOINT_APP_CATALOG_URL`
- `HB_INTEL_SPFX_APP_ID`
- `NOTIFICATION_API_BASE_URL`
- `EMAIL_FROM_ADDRESS`
- `OPEX_MANAGER_UPN`
- `CONTROLLER_UPNS`
- `ADMIN_UPNS`
- `HBC_ADAPTER_MODE`
- `GRAPH_GROUP_PERMISSION_CONFIRMED` (via provisioning prerequisites)

**This is a significant blocker**: Many Tier 2/3 settings that are "deferred" for the provisioning saga are still `requiredInProd: true` in the env registry, meaning the startup gate will reject boot even if only the Project Setup endpoints are needed.

**Workaround options**:
1. Set all required settings to placeholder values (risky — may produce confusing errors)
2. Temporarily deploy with `HBC_ADAPTER_MODE=mock` to verify basic connectivity, then switch to `proxy` when all settings are ready
3. Relax the startup validation to allow missing provisioning-only settings when only request lifecycle endpoints are needed

---

## 8. Deployment Blockers

| # | Blocker | Severity | Status |
|---|---------|----------|--------|
| B1 | **Azure CLI session expired** | Blocking | User must re-authenticate: `az login` |
| B2 | **Deployment artifact needs node_modules** | Blocking | Self-contained zip with resolved workspace deps required |
| B3 | **Startup validation requires ALL requiredInProd settings** | Blocking | Many deferred settings (SignalR, SendGrid, Hub Site, App Catalog, Graph) are required for boot |
| B4 | **AZURE_CLIENT_ID dual-use ambiguity** | Blocking | Must confirm whether managed identity client ID = app registration client ID |
| B5 | **Business UPNs not confirmed** | Blocking | CONTROLLER_UPNS, ADMIN_UPNS, OPEX_MANAGER_UPN need product owner input |

---

## 9. Readiness Statement

### **NOT READY FOR PUBLISH**

Five blockers remain (see Section 8). The most impactful is B3 (startup validation gate) — the backend will not boot in `proxy` mode until all `requiredInProd` settings are configured, including several that are not needed for the initial Project Setup workflow.

---

## 10. Handoff to Prompt 03

Before the next prompt can publish:

1. **User must re-authenticate Azure CLI**: `az login --tenant 91e238a3-4af4-42c0-9cb8-eb37861d82f3`
2. **User must provide or confirm**:
   - `AZURE_CLIENT_ID` (app registration and/or managed identity)
   - `CONTROLLER_UPNS`, `ADMIN_UPNS`, `OPEX_MANAGER_UPN` values
   - Whether to use placeholder values for deferred settings or relax the startup gate
3. **Prompt 03 should**:
   - Query all Azure resource values (App Insights, Storage, identity)
   - Apply all app settings
   - Build the self-contained deployment artifact
   - Deploy and run health check
   - Retest SPFx → Function App connectivity

### Recommended Fastest Path

If the goal is to validate end-to-end connectivity first:
1. Deploy with `HBC_ADAPTER_MODE=mock` — bypasses startup validation and all real service deps
2. Verify SPFx → `/api/health` and `/api/project-setup-requests` work (mock data)
3. Then switch to `proxy` mode after all settings are configured

This gives a deployment proof-of-concept without requiring all production settings upfront.
