# Wave 0 Configuration Registry

> **Doc Classification:** Living Reference (Diataxis) — Complete environment variable registry for Wave 0 backend functions with two-bucket governance model.

**Version:** 1.0
**Produced by:** W0-G1-T04
**Last Updated:** 2026-03-14

---

## 1. Governance Model

All Wave 0 environment configuration settings are classified into two governance buckets:

| Bucket | Label | Owner | Change Process | Examples |
|--------|-------|-------|---------------|----------|
| **A** | Infrastructure-Controlled | Platform / DevOps | Terraform, Key Vault, CI/CD pipeline | Tenant IDs, connection strings, client secrets |
| **B** | Business-Controlled | Product Owner / Admin | Application settings UI or manual config update | UPN lists, department access, email addresses |

**Key principle:** Infrastructure-Controlled settings (Bucket A) are never edited by business users. Business-Controlled settings (Bucket B) may be updated by administrators without a code deployment.

---

## 2. Configuration Registry

### 2.1 Infrastructure Connection Settings (Bucket A)

These settings establish connectivity to Azure services. All are required in production and managed through infrastructure-as-code or Key Vault references.

| Setting | Bucket | Required in Prod | Description | Key Vault? |
|---------|--------|-----------------|-------------|------------|
| `AZURE_TENANT_ID` | A | Yes | Entra ID tenant identifier | No (non-secret) |
| `AZURE_CLIENT_ID` | A | Yes | App registration client ID for backend identity | No (non-secret) |
| `AZURE_CLIENT_SECRET` | A | Yes | App registration client secret | **Yes** |
| `AZURE_STORAGE_CONNECTION_STRING` | A | Yes | Azure Storage connection string for table/blob/queue | **Yes** |
| `AzureSignalRConnectionString` | A | Yes | SignalR Service connection string for real-time push | **Yes** |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | A | Yes | Application Insights telemetry ingestion | **Yes** |
| `SHAREPOINT_TENANT_URL` | A | Yes | Root SharePoint tenant URL (e.g., `https://hbconstruction.sharepoint.com`) | No (non-secret) |
| `SHAREPOINT_HUB_SITE_ID` | A | Yes | Hub site GUID for site provisioning association | No (non-secret) |
| `EMAIL_DELIVERY_API_KEY` | A | Yes | SendGrid (or equivalent) API key for transactional email | **Yes** |
| `SHAREPOINT_APP_CATALOG_URL` | A | Yes | Tenant or site-collection app catalog URL for SPFx deployment | No (non-secret) |

### 2.2 Local Development Only Settings (Bucket A)

These settings exist only in `local.settings.json` and are not deployed to production environments.

| Setting | Bucket | Required in Prod | Description |
|---------|--------|-----------------|-------------|
| `AzureWebJobsStorage` | A | No (platform-managed) | Azure Functions host storage; `UseDevelopmentStorage=true` locally |
| `FUNCTIONS_WORKER_RUNTIME` | A | No (platform-managed) | Functions runtime identifier; always `node` |
| `WEBSITE_NODE_DEFAULT_VERSION` | A | No (platform-managed) | Node.js version hint; `~20` |

### 2.3 Infrastructure Behavioral Settings (Bucket A)

These settings control backend operational behavior and are managed by the platform team.

| Setting | Bucket | Required in Prod | Description |
|---------|--------|-----------------|-------------|
| `HBC_ADAPTER_MODE` | A | Yes | Adapter mode selector: `live` (production) or `mock` (local dev/test) |
| `PROVISIONING_STEP5_TIMEOUT_MS` | A | No | Step 5 timeout override in milliseconds; defaults to `90000` if absent |
| `HB_INTEL_SPFX_APP_ID` | A | Yes | SPFx app package GUID for tenant-scoped deployment verification |
| `NOTIFICATION_API_BASE_URL` | A | Yes | Base URL for notification dispatch endpoint (self-referential in single function app) |
| `EMAIL_FROM_ADDRESS` | A | Yes | Sender address for transactional emails; must match SendGrid verified sender |

### 2.4 Business-Operational Settings (Bucket B)

These settings are owned by business stakeholders and may be updated without code changes.

| Setting | Bucket | Required in Prod | Description | Conditional On |
|---------|--------|-----------------|-------------|---------------|
| `OPEX_MANAGER_UPN` | B | Yes | UPN of the OpEx manager who receives provisioning completion notifications | — |
| `CONTROLLER_UPNS` | B | Yes | Comma-separated UPNs of controllers for financial oversight notifications | — |
| `ADMIN_UPNS` | B | Yes | Comma-separated UPNs of platform administrators | — |
| `STRUCTURAL_OWNER_UPNS` | B | No | Comma-separated UPNs of structural owners; empty string if none | — |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | B | Yes | UPN(s) granted background read access to Commercial department sites | Department = `commercial` |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | B | Yes | UPN(s) granted background read access to Luxury Residential department sites | Department = `luxury-residential` |

> **Department scope:** Wave 0 supports only `commercial` and `luxury-residential` departments. Additional department background access settings will be added as departments are onboarded.

---

## 3. Environment Separation Matrix

| Setting | Local Dev | Staging | Production |
|---------|-----------|---------|------------|
| `AZURE_TENANT_ID` | Dev tenant ID | Staging tenant ID | Prod tenant ID |
| `AZURE_CLIENT_ID` | Dev app registration | Staging app registration | Prod app registration |
| `AZURE_CLIENT_SECRET` | `.local.settings.json` | Key Vault reference | Key Vault reference |
| `AZURE_STORAGE_CONNECTION_STRING` | `UseDevelopmentStorage=true` | Key Vault reference | Key Vault reference |
| `AzureSignalRConnectionString` | Dev SignalR instance | Key Vault reference | Key Vault reference |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Dev App Insights | Key Vault reference | Key Vault reference |
| `EMAIL_DELIVERY_API_KEY` | Test/sandbox key | Key Vault reference | Key Vault reference |
| `HBC_ADAPTER_MODE` | `mock` | `live` | `live` |
| `OPEX_MANAGER_UPN` | Test UPN | Staging UPN | Production UPN |
| `CONTROLLER_UPNS` | Test UPNs | Staging UPNs | Production UPNs |
| `ADMIN_UPNS` | Test UPNs | Staging UPNs | Production UPNs |

**Key Vault reference pattern:** In staging and production, secret settings use Azure Key Vault references in the format:
```
@Microsoft.KeyVault(SecretUri=https://<vault-name>.vault.azure.net/secrets/<secret-name>/)
```

---

## 4. Fail-Fast Validation

A configuration validation scaffold exists at `backend/functions/src/utils/validate-config.ts`. This function imports the typed registry from `backend/functions/src/config/wave0-env-registry.ts` and checks all `requiredInProd` settings at startup.

**Current status:** The validation function is exported but **not wired into the startup path**. G2.6 (Startup Validation Gate) will integrate it into the function app initialization sequence.

---

## 5. Local Development Setup

To configure local development:

1. Copy the example settings file:
   ```bash
   cp backend/functions/local.settings.example.json backend/functions/local.settings.json
   ```

2. Replace all `<placeholder>` values with your development environment credentials.

3. Ensure `HBC_ADAPTER_MODE` is set to `mock` for local development.

4. Never commit `local.settings.json` to source control (it is `.gitignore`d).

---

## 6. Related Documents

- [Site Template Specification](../provisioning/site-template.md) — Template and library definitions consuming these settings
- [Entra ID Group Model](../provisioning/entra-id-group-model.md) — Group lifecycle using `AZURE_*` credentials
- [Notification Event Matrix](../provisioning/notification-event-matrix.md) — Notification dispatch using `EMAIL_*` and `NOTIFICATION_*` settings
