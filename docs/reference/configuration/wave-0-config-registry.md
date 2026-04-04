# Wave 0 Configuration Registry

> **Doc Classification:** Living Reference (Diataxis) — Complete environment variable registry for Wave 0 backend functions with two-bucket governance model.

**Version:** 2.0
**Produced by:** W0-G1-T04, reconciled by P10-09
**Last Updated:** 2026-04-04

---

## 1. Governance Model

All Wave 0 environment configuration settings are classified into two governance buckets:

| Bucket | Label | Owner | Change Process | Examples |
|--------|-------|-------|---------------|----------|
| **A** | Infrastructure-Controlled | Platform / DevOps | Terraform, Key Vault, CI/CD pipeline | Tenant IDs, connection strings, endpoints |
| **B** | Business-Controlled | Product Owner / Admin | Application settings UI or managed config update | UPN lists, department access |

**Key principle:** Infrastructure-Controlled settings (Bucket A) are never edited by business users. Business-Controlled settings (Bucket B) may be updated by administrators without a code deployment.

**Phase 10 extension:** Business-Controlled settings (Bucket B) are first-wave candidates for live admin-maintained governance through the Phase 10 hybrid config model. See the Phase 10 seeding doc for details.

---

## 2. Validation Tiers

The backend implements a three-tier validation model. Each config entry belongs to a validation tier that determines when it is validated:

| Tier | Validated At | Purpose | Examples |
|------|-------------|---------|----------|
| `core` | Startup (blocking) | Required for ANY request — auth, table storage, adapter mode | `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `API_AUDIENCE` |
| `sharepoint` | Startup (warning only) | Required for SharePoint-dependent operations | `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL` |
| `provisioning` | Saga execution time | Required only when provisioning runs | `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SHAREPOINT_HUB_SITE_ID` |
| (none) | Not validated at startup | Optional or conditionally required | `PROVISIONING_STEP5_TIMEOUT_MS`, `STRUCTURAL_OWNER_UPNS` |

**Code locations:**
- Registry: `backend/functions/src/config/wave0-env-registry.ts`
- Validation: `backend/functions/src/utils/validate-config.ts`
- Startup wiring: `createServiceFactory()` calls `validateCoreConfig()` (blocking) and `validateSharePointConfig()` (warning)

---

## 3. Configuration Registry

### 3.1 Infrastructure Connection Settings (Bucket A)

These settings establish connectivity to Azure services and are managed through infrastructure-as-code or Key Vault references.

| Setting | Bucket | Tier | Required in Prod | Description | Key Vault? |
|---------|--------|------|-----------------|-------------|------------|
| `AZURE_TENANT_ID` | A | core | Yes | Entra ID tenant identifier | No |
| `AZURE_CLIENT_ID` | A | core | Yes | User-assigned Managed Identity client ID (local dev: app registration ID). Note: NOT the same as API_AUDIENCE. | No |
| `AZURE_TABLE_ENDPOINT` | A | core | Yes | Cosmos DB Table API endpoint URL (production) or connection string (local dev) | No |
| `AzureSignalRConnectionString` | A | — | **No** | SignalR Service connection string for real-time push. Optional — backend degrades gracefully to `NoOpSignalRPushService` when absent. | **Yes** |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | A | core | Yes | Application Insights telemetry ingestion | **Yes** |
| `SHAREPOINT_TENANT_URL` | A | sharepoint | Yes | Root SharePoint tenant URL (e.g., `https://hbconstruction.sharepoint.com`) | No |
| `SHAREPOINT_PROJECTS_SITE_URL` | A | sharepoint | Yes | SharePoint site URL hosting the Projects list. Falls back to `SHAREPOINT_TENANT_URL` if not set. | No |
| `SHAREPOINT_HUB_SITE_ID` | A | — | **No** | Hub site GUID for site provisioning Step 7 association. Required at provisioning time, not at startup. | No |
| `EMAIL_DELIVERY_API_KEY` | A | — | **No** | SendGrid API key for transactional email. Currently stub/unused in Wave 0. | **Yes** |
| `SHAREPOINT_APP_CATALOG_URL` | A | — | **No** | Tenant app catalog URL for SPFx Step 5 deployment. Required at provisioning time, not at startup. | No |
| `API_AUDIENCE` | A | core | Yes | Inbound API audience URI for JWT validation (e.g., `api://<app-reg-client-id>`). | No |

### 3.2 Local Development Only Settings (Bucket A)

These settings exist only in `local.settings.json` and are not deployed to production environments.

| Setting | Bucket | Required in Prod | Description |
|---------|--------|-----------------|-------------|
| `AzureWebJobsStorage` | A | No (platform-managed) | Azure Functions host storage; `UseDevelopmentStorage=true` locally |
| `FUNCTIONS_WORKER_RUNTIME` | A | No (platform-managed) | Functions runtime identifier; always `node` |
| `WEBSITE_NODE_DEFAULT_VERSION` | A | No (platform-managed) | Node.js version hint; `~20` |

### 3.3 Infrastructure Behavioral Settings (Bucket A)

These settings control backend operational behavior and are managed by the platform team.

| Setting | Bucket | Tier | Required in Prod | Description |
|---------|--------|------|-----------------|-------------|
| `HBC_ADAPTER_MODE` | A | core | Yes | Adapter mode selector: `proxy` (production) or `mock` (local dev/test). Legacy value `real` is aliased to `proxy`. |
| `PROVISIONING_STEP5_TIMEOUT_MS` | A | — | No | Step 5 timeout override in milliseconds; defaults to `90000` if absent |
| `HB_INTEL_SPFX_APP_ID` | A | — | **No** | SPFx app package GUID for tenant-scoped Step 5 deployment verification. Required at provisioning time, not at startup. |
| `NOTIFICATION_API_BASE_URL` | A | — | **No** | Base URL for notification dispatch endpoint. Has localhost fallback for local development. |
| `EMAIL_FROM_ADDRESS` | A | — | **No** | Sender address for transactional emails. Currently stub/unused in Wave 0. |
| `SITES_PERMISSION_MODEL` | A | — | No | Permission model for SharePoint site access: `sites-selected` (default, Path A) or `fullcontrol` (Path B fallback, requires ADR). See [Sites.Selected Validation](./sites-selected-validation.md) |

### 3.4 Permission and Prerequisite Gates (Bucket A)

These settings act as confirmation gates that must be explicitly set by IT before certain operations are allowed.

| Setting | Bucket | Required in Prod | Description |
|---------|--------|-----------------|-------------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | A | No | Must be `"true"` after IT grants `Group.ReadWrite.All` consent. Gates provisioning Step 6 group creation. |
| `SITES_SELECTED_GRANT_CONFIRMED` | A | No | Must be `"true"` when `SITES_PERMISSION_MODEL` is `sites-selected`. Gates Path A validation for per-site grants. |

### 3.5 Business-Operational Settings (Bucket B)

These settings are owned by business stakeholders. In Wave 0 they are environment-variable-based. In Phase 10, they become first-wave candidates for live admin-maintained governance.

| Setting | Bucket | Required in Prod | Description | Conditional On |
|---------|--------|-----------------|-------------|---------------|
| `OPEX_MANAGER_UPN` | B | **No** | UPN of the OpEx manager for provisioning Step 6 Leaders group membership | — |
| `CONTROLLER_UPNS` | B | **No** | Comma-separated UPNs of controllers for notification targeting (NOT authorization) | — |
| `ADMIN_UPNS` | B | **No** | Comma-separated UPNs of platform administrators for notification targeting (NOT authorization) | — |
| `STRUCTURAL_OWNER_UPNS` | B | No | Comma-separated UPNs of structural owners; empty string if none | — |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | B | **No** | UPN(s) granted background read access to Commercial department sites | Department = `commercial` |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | B | **No** | UPN(s) granted background read access to Luxury Residential department sites | Department = `luxury-residential` |

> **Note:** Bucket B items have `requiredInProd: false` in the code registry. The backend logs degraded-mode warnings when `CONTROLLER_UPNS` or `ADMIN_UPNS` are absent but does not block startup. Role-based state transitions and admin role resolution are disabled in degraded mode.

> **Department scope:** Wave 0 supports only `commercial` and `luxury-residential` departments. Additional department background access settings will be added as departments are onboarded.

---

## 4. Removed Settings

The following settings appeared in v1.0 of this document but have been removed because they are not consumed by the code registry:

| Setting | Reason |
|---------|--------|
| `AZURE_CLIENT_SECRET` | The backend uses Managed Identity (`DefaultAzureCredential`) instead of client secret authentication. The secret is not in the typed registry and is not read by application code. |

---

## 5. Environment Separation Matrix

| Setting | Local Dev | Staging | Production |
|---------|-----------|---------|------------|
| `AZURE_TENANT_ID` | Dev tenant ID | Staging tenant ID | Prod tenant ID |
| `AZURE_CLIENT_ID` | Dev app registration | Staging MI client ID | Prod MI client ID |
| `AZURE_TABLE_ENDPOINT` | `UseDevelopmentStorage=true` | Cosmos Table API endpoint | Cosmos Table API endpoint |
| `AzureSignalRConnectionString` | Optional (dev SignalR) | Key Vault reference | Key Vault reference |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Dev App Insights | Key Vault reference | Key Vault reference |
| `HBC_ADAPTER_MODE` | `mock` | `proxy` | `proxy` |
| `API_AUDIENCE` | Dev audience URI | Staging audience URI | Prod audience URI |
| `OPEX_MANAGER_UPN` | Test UPN | Staging UPN | Production UPN |
| `CONTROLLER_UPNS` | Test UPNs | Staging UPNs | Production UPNs |
| `ADMIN_UPNS` | Test UPNs | Staging UPNs | Production UPNs |

**Key Vault reference pattern:** In staging and production, secret settings use Azure Key Vault references in the format:
```
@Microsoft.KeyVault(SecretUri=https://<vault-name>.vault.azure.net/secrets/<secret-name>/)
```

---

## 6. Fail-Fast Validation

Configuration validation is implemented at `backend/functions/src/utils/validate-config.ts` and imports the typed registry from `backend/functions/src/config/wave0-env-registry.ts`.

**Current status:** Validation is wired into the startup path:
- `createServiceFactory()` calls `validateCoreConfig()` as a **blocking startup gate**.
- `createServiceFactory()` calls `validateSharePointConfig()` as a **non-blocking warning**.
- `validateProvisioningPrerequisites()` is called at saga execution time (not startup).
- Domain-specific validators exist for Project Setup and Admin Control Plane hosts.

---

## 7. Local Development Setup

To configure local development:

1. Copy the example settings file:
   ```bash
   cp backend/functions/local.settings.example.json backend/functions/local.settings.json
   ```

2. Replace all `<placeholder>` values with your development environment credentials.

3. Ensure `HBC_ADAPTER_MODE` is set to `mock` for local development.

4. Never commit `local.settings.json` to source control (it is `.gitignore`d).

---

## 8. Related Documents

- [Sites.Selected Validation](./sites-selected-validation.md) — Permission model validation, fallback path governance, and staging test cases
- Phase 10 seeding and reconciliation — `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-seeding-and-reconciliation.md`
