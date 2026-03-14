# W0-G1-T04 — Environment Configuration and Operational Governance

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 1 task plan for environment configuration classification. Governs which settings are protected infrastructure configuration vs. business-controlled configuration, and how each bucket is managed across environments. Must be locked before G2.6 (production environment config validation) proceeds.

**Phase Reference:** Wave 0 Group 1 — Contracts and Configuration Plan
**Locked Decision Applied:** Decision 5 — centralized configuration with limited business-controlled items
**Estimated Decision Effort:** 1 working session with lead developer and IT/infrastructure owner
**Depends On:** None within Group 1 (may begin immediately)
**Unlocks:** G2.6 (production config validation), G6 (operational readiness), T05 (Sites.Selected environment settings)
**ADR Output:** Contributes to ADR-0114 (configuration governance section)

---

## Objective

Classify every environment configuration setting required for Wave 0 into its correct governance bucket, define the management mechanism for each bucket, specify environment separation requirements, and establish the change-control model that prevents config drift between environments.

The output of this task is a reference document (`docs/reference/configuration/wave-0-config-registry.md`) that G2.6 uses to validate production function app configuration and that G6 uses to document operational governance procedures.

---

## Why This Task Exists

The Wave 0 provisioning pipeline depends on a substantial set of environment configuration values. The current state:

**Confirmed via `local.settings.example.json` and codebase inspection:**
| Variable | Used In |
|----------|---------|
| `AZURE_TENANT_ID` | Local dev only — Managed Identity replaces in production |
| `AZURE_CLIENT_ID` | Local dev only — Managed Identity replaces in production |
| `AZURE_CLIENT_SECRET` | Local dev only — never in production |
| `AZURE_STORAGE_CONNECTION_STRING` | Table Storage for provisioning status and audit records |
| `AzureSignalRConnectionString` | SignalR Service connection |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | AppInsights telemetry |
| `SHAREPOINT_TENANT_URL` | PnPjs base URL for all SharePoint operations |
| `SHAREPOINT_HUB_SITE_ID` | Hub site association (Step 7) |
| `HBC_ADAPTER_MODE` | Switch between `real` and `mock` adapters |
| `PROVISIONING_STEP5_TIMEOUT_MS` | Step 5 (web parts install) timeout |
| `OPEX_MANAGER_UPN` | Step 6 — always-included structural owner |
| `HB_INTEL_SPFX_APP_ID` | SPFx app identity reference |
| `SHAREPOINT_APP_CATALOG_URL` | App catalog for web part deployment |

**Configuration values not yet in `local.settings.example.json` but required by Wave 0:**
- `CONTROLLER_UPNS` — comma-separated UPN list for controller recipients (T03)
- `ADMIN_UPNS` — comma-separated UPN list for admin notification recipients (T03)
- `OPEX_MANAGER_UPN` — already present; extend to `STRUCTURAL_OWNER_UPNS` per T06 spec
- `DEPT_BACKGROUND_ACCESS_COMMERCIAL` — Viewers group UPN list for commercial dept (T02); maps to `ProjectDepartment = 'commercial'`
- `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` — Viewers group UPN list for luxury residential (T02); maps to `ProjectDepartment = 'luxury-residential'`
- Email delivery service API key (SendGrid or equivalent) (T03)
- Email sender domain / "from" address (T03)

Without a classification system and documented management mechanism, these values drift: developers hardcode them in test scenarios, staging uses dev values, production is under-configured, and pilot deployments fail with unhelpful errors about missing environment variables.

---

## Scope

T04 covers:

1. Enumeration of all required Wave 0 configuration settings
2. Classification of each setting into a governance bucket
3. Definition of the two governance buckets and their management mechanisms
4. Environment separation requirements (local dev, staging, production)
5. Fail-fast validation requirement (function startup must fail with a clear error if required vars are missing)
6. Change-control rules per bucket
7. Local development setup requirements

T04 does not cover:

- Azure infrastructure provisioning (creating the Function App, App Configuration resource, Key Vault)
- CI/CD pipeline configuration management (those are G8 concerns)
- SharePoint list-based config storage (not required for Wave 0; backend config management only)
- Per-user preference configuration (that is `@hbc/notification-intelligence`'s `PreferencesApi` concern)

---

## Governing Constraints

- **Locked Decision 5 (centralized config, limited business-controlled):** Technical and security-sensitive configuration is protected and infrastructure-controlled. A small, explicitly defined set of business-facing settings is adjustable by authorized business users without code changes.
- **CLAUDE.md §1.2 Zero-Deviation Rule:** Adding new required environment variables after G1 closure requires a documented amendment, not a silent addition.
- **Managed Identity posture (validated):** The production Function App uses Azure Managed Identity (`DefaultAzureCredential`). `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and related app registration credentials are local development only. They must not be present in production function app configuration.
- **Fail-fast principle:** Azure Functions must validate required environment variables at startup and fail with a descriptive error message if any required variable is absent. G2.6 implements this validation.

---

## Governance Bucket Model

All Wave 0 configuration settings are classified into one of two buckets.

### Bucket A: Infrastructure-Controlled (Protected)

**Definition:** Settings that contain connection strings, security credentials, tenant-specific identifiers, infrastructure endpoints, or behavioral switches that could affect security, data access, or production stability. These must NEVER be committed to source control, NEVER be adjustable by a business user, and MUST be managed via Azure infrastructure configuration (Key Vault references in Function App settings, or App Service configuration).

**Change control:** Changes require IT/infrastructure approval and must be applied through the configured deployment process. No business user may modify these settings.

**Local dev access:** Developers use `local.settings.json` (gitignored) to supply Bucket A values. The `local.settings.example.json` file is the template with placeholder values. Actual values for dev environments are shared via a secure channel (e.g., IT-managed secrets store, team password manager entry).

### Bucket B: Business-Controlled (Governed)

**Definition:** Settings that contain business-operational values — UPN lists, department configuration, operational thresholds — that authorized business users (IT admin or business owner) may need to update without a full code deployment. These are not sensitive in the security sense, but they affect business behavior and must be governed.

**Change control:** Changes require authorization from the defined setting owner (see per-setting ownership in the registry). Changes are applied through the Azure Function App configuration update process (no code change required). All changes are logged (Azure App Configuration audit log, or equivalent).

**Mechanism:** For Wave 0, Bucket B settings are managed via Azure Function App environment variables. If the number of business-controlled settings grows in future waves, Azure App Configuration with feature flags is the recommended future state — but it is not required for Wave 0 pilot.

---

## Complete Wave 0 Configuration Registry

The following table constitutes the Wave 0 configuration registry. G2.6 uses this as the canonical list of settings to validate at function startup.

### Infrastructure Connection Settings (Bucket A)

| Setting Name | Description | Env Scope | Required in Prod | Notes |
|-------------|-------------|-----------|-----------------|-------|
| `AzureWebJobsStorage` | Azure Storage connection for Functions host (job state, locks) | all | Yes | Use Azurite for local dev |
| `AZURE_STORAGE_CONNECTION_STRING` | Table Storage for provisioning status, audit records | all | Yes | Separate from `AzureWebJobsStorage`; Key Vault reference in prod |
| `AzureSignalRConnectionString` | Azure SignalR Service connection string | all | Yes | Serverless mode; Key Vault reference in prod |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | AppInsights telemetry ingestion | all | Yes | Required for telemetry; warn if absent in dev, fail if absent in prod |
| `SHAREPOINT_TENANT_URL` | Base URL for all SharePoint operations (e.g., `https://company.sharepoint.com`) | all | Yes | Must match the target tenant exactly |
| `SHAREPOINT_HUB_SITE_ID` | GUID of the SharePoint hub site that provisioned sites associate with (Step 7) | all | Yes | Obtain from IT; hub must exist before pilot |
| `SHAREPOINT_APP_CATALOG_URL` | URL of the tenant app catalog for SPFx app deployment | all | Conditional | Required only if Step 5 (web parts) is active; may be `null` if Step 5 deferred |
| `HB_INTEL_SPFX_APP_ID` | SPFx app package ID (GUID) for web part installation in Step 5 | all | Conditional | Required only if Step 5 is active |
| `EMAIL_DELIVERY_API_KEY` | SendGrid (or equivalent) API key for email delivery | all | Yes | Never commit; Key Vault reference in prod; required for immediate-tier notifications |
| `EMAIL_FROM_ADDRESS` | Sender address for all outbound notification emails | all | Yes | Must be a verified sender domain; e.g., `hb-intel@hbconstruction.com` |

### Local Development Only (Bucket A — Production Exclusions)

| Setting Name | Description | Local Dev Only | Notes |
|-------------|-------------|---------------|-------|
| `AZURE_TENANT_ID` | Tenant ID for local auth token acquisition | Yes | Replaced by Managed Identity in production; must not be set in prod Function App |
| `AZURE_CLIENT_ID` | App registration client ID for local auth | Yes | Same as above |
| `AZURE_CLIENT_SECRET` | App registration client secret for local auth | Yes | Never in production under any circumstances |

### Infrastructure Behavioral Settings (Bucket A)

| Setting Name | Description | Default | Notes |
|-------------|-------------|---------|-------|
| `FUNCTIONS_WORKER_RUNTIME` | Function worker runtime declaration | `node` | Do not change |
| `WEBSITE_NODE_DEFAULT_VERSION` | Node version pin | `~20` | Infrastructure sets this |
| `AZURE_FUNCTIONS_ENVIRONMENT` | Runtime environment label (`Development` / `Production`) | Set by platform | Read-only; used by app for environment detection |
| `HBC_ADAPTER_MODE` | Adapter switch: `real` (production) / `mock` (dev/test) | `real` in prod | Must be `real` in staging and production; `mock` in local dev and unit tests |
| `NODE_ENV` | Standard Node env flag | `production` in prod | Set by deployment pipeline |

### Business-Operational Settings (Bucket B)

| Setting Name | Description | Format | Owner | Notes |
|-------------|-------------|--------|-------|-------|
| `OPEX_MANAGER_UPN` | UPN of the OpEx manager — always-included structural owner for all project sites | Single UPN string | Business operations owner | Already present in current code |
| `STRUCTURAL_OWNER_UPNS` | Comma-separated UPNs of additional structural owners beyond OpEx manager | `upn1@co.com,upn2@co.com` | IT admin | May be empty string if only OpEx manager needed |
| `CONTROLLER_UPNS` | Comma-separated UPNs of users with Controller responsibility (receive `provisioning.request-submitted` and `provisioning.ready-to-provision` notifications) | `upn1@co.com,upn2@co.com` | Business operations owner | At least one UPN required; validated at startup |
| `ADMIN_UPNS` | Comma-separated UPNs of HB Intel platform admins (receive escalation notifications) | `upn1@co.com,upn2@co.com` | IT admin | At least one UPN required |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | Comma-separated UPNs or group email addresses for commercial dept Viewers group background access | `upn-or-dl@co.com,...` | Department head | May be empty string if no background access needed; maps to `ProjectDepartment = 'commercial'` |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | Same as above for luxury residential dept | `upn-or-dl@co.com,...` | Department head | May be empty string; maps to `ProjectDepartment = 'luxury-residential'` |
| `PROVISIONING_STEP5_TIMEOUT_MS` | Timeout in milliseconds for Step 5 (web parts installation) before deferring to overnight timer | `90000` | Lead developer | Adjust if Step 5 consistently times out in staging |

---

## Environment Separation Requirements

The following table defines what must be true for each environment.

| Requirement | Local Dev | Staging | Production |
|-------------|-----------|---------|------------|
| Managed Identity active | No — uses `AZURE_CLIENT_ID/SECRET` | Yes — system-assigned identity | Yes — system-assigned identity |
| `HBC_ADAPTER_MODE` | `mock` | `real` | `real` |
| `AzureSignalRConnectionString` | Local emulator or separate staging SignalR | Dedicated staging SignalR | Production SignalR |
| `SHAREPOINT_TENANT_URL` | Dev/test SharePoint tenant | Staging SharePoint tenant | Production SharePoint tenant |
| `EMAIL_DELIVERY_API_KEY` | Test API key (SendGrid sandbox) or omitted | Staging API key (low-volume) | Production API key |
| All Bucket B UPN lists | Developer UPNs for testing | Staging team UPNs | Production UPNs |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Separate dev AppInsights or omitted | Staging AppInsights workspace | Production AppInsights workspace |

**Critical rule:** Staging must use a **dedicated SharePoint tenant or site collection** that is separate from production. Running staging provisioning against the production SharePoint tenant risks creating test sites in production, polluting the hub association, and generating spurious notifications to production users.

---

## Fail-Fast Validation Requirement

G2.6 must implement startup validation that checks for all required Bucket A settings on function cold start. If any required setting is absent, the function must fail immediately with a descriptive error — not silently proceed and fail later with a cryptic error.

**Required validation behavior:**
```typescript
// backend/functions/src/utils/validate-config.ts  (G2.6 creates)
export function validateRequiredConfig(): void {
  const required = [
    'AZURE_STORAGE_CONNECTION_STRING',
    'AzureSignalRConnectionString',
    'SHAREPOINT_TENANT_URL',
    'SHAREPOINT_HUB_SITE_ID',
    'EMAIL_DELIVERY_API_KEY',
    'EMAIL_FROM_ADDRESS',
    'CONTROLLER_UPNS',
    'ADMIN_UPNS',
    'OPEX_MANAGER_UPN',
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[HB Intel] Required environment configuration missing: ${missing.join(', ')}. ` +
      'Check docs/reference/configuration/wave-0-config-registry.md for the full registry.'
    );
  }
}
```

This function must be called during the function app initialization path, before any handler is registered.

---

## Key Vault Reference Pattern (Production)

For all Bucket A settings containing connection strings or API keys, the production Function App must use Azure Key Vault references rather than direct values in the Function App configuration.

**Pattern:**
```
Setting name: AZURE_STORAGE_CONNECTION_STRING
Setting value: @Microsoft.KeyVault(SecretUri=https://hb-intel-kv.vault.azure.net/secrets/AzureStorageConnectionString/)
```

The Function App's Managed Identity must have `Get` and `List` access on the Key Vault secrets. This access grant is an IT/infrastructure task that must be confirmed before the staging environment is validated.

**Scope for Wave 0:** The following settings must use Key Vault references in production:
- `AZURE_STORAGE_CONNECTION_STRING`
- `AzureSignalRConnectionString`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`
- `EMAIL_DELIVERY_API_KEY`

`SHAREPOINT_TENANT_URL`, `SHAREPOINT_HUB_SITE_ID`, and Bucket B settings may be direct values in the Function App settings — they are not credentials.

---

## Reference Document Requirements

T04 must produce `docs/reference/configuration/wave-0-config-registry.md`. That document must include:

1. The two-bucket classification model definition
2. The complete Wave 0 configuration registry (all settings from this plan, in tabular format)
3. Environment separation requirements table
4. Fail-fast validation note (reference G2.6 for implementation)
5. Key Vault reference pattern for credential settings
6. Instructions for local development setup (fill in `local.settings.json` from `local.settings.example.json`)

---

## Acceptance Criteria

- [ ] All required Wave 0 configuration settings are enumerated
- [ ] Each setting is classified (Bucket A or Bucket B)
- [ ] Local-dev-only settings are clearly distinguished from production settings
- [ ] Environment separation requirements are documented (local, staging, production)
- [ ] Bucket B settings have named owners
- [ ] Fail-fast startup validation requirement is documented for G2.6 implementation
- [ ] Key Vault reference settings are identified
- [ ] `local.settings.example.json` update requirements are documented (add missing settings)
- [ ] Reference document (`docs/reference/configuration/wave-0-config-registry.md`) exists and is complete
- [ ] Reference document is added to `current-state-map.md §2` as "Reference"

---

## Known Risks and Pitfalls

**Risk T04-R1: Bucket B UPN lists hardcoded in testing.** During G2/G3 development, developers often hardcode UPN values in tests. These values must not bleed into production configuration. Unit tests that require UPN resolution must use a mock config provider, not `process.env` lookups.

**Risk T04-R2: `local.settings.example.json` not kept up to date.** As Wave 0 adds new required settings, `local.settings.example.json` must be updated to include them (with placeholder values). If it falls behind, new developers cannot set up their local environment. Each Group that adds required environment variables must update the example file as part of their acceptance criteria.

**Risk T04-R3: Staging and production use the same SharePoint tenant.** This is a critical risk — see Environment Separation Requirements. If staging provisioning creates real SharePoint sites in the production tenant, cleanup is difficult and trust-damaging. Confirm that a dedicated staging tenant or site collection is available before G2.2 begins.

**Risk T04-R4: Key Vault setup delayed.** If IT/infrastructure cannot set up Key Vault and grant Function App Managed Identity access before staging validation, Bucket A credential settings will be supplied as plaintext in Function App settings. This is acceptable for staging with low-sensitivity test credentials but must not reach production. Track Key Vault setup as a separate action item with a deadline.

---

## Follow-On Consumers

- **G2.6 (production config validation):** Implements the fail-fast startup validation function using T04's required settings list.
- **T05 (Sites.Selected validation):** Uses T04's environment separation requirements to confirm that staging validation uses the correct tenant.
- **G6 (operational readiness):** The admin runbook must include instructions for updating Bucket B settings (controller UPNs, department background access lists) as part of pilot onboarding.
- **G8 (CI/CD):** The deployment pipeline must confirm that all required Bucket A settings are present in the target environment before deploying. T04's registry is the checklist.

---

*End of W0-G1-T04 — Environment Configuration and Operational Governance v1.1 (Corrected 2026-03-14: `DEPT_BACKGROUND_ACCESS_MIXED_USE` removed — `mixed-use` is not a locked Wave 0 department value; dept config vars aligned to `commercial | luxury-residential` only per T01/MVP-T02 contract)*
