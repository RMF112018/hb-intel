# Phase 10 — Seeding, Migration, and Wave-0 Reconciliation

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 09  
**Date:** 2026-04-04  
**Status:** Complete

---

## 1. What was seeded

### First-wave live-editable candidates

These Bucket B (business-controlled) items are the initial candidates for live admin-maintained governance through the Phase 10 hybrid config model. They are seeded into the config catalog with `liveEditable: true`:

| Config Entry | Domain | Default Value | Risk Tier | Rationale |
|-------------|--------|---------------|-----------|-----------|
| `OPEX_MANAGER_UPN` | access-control | `''` (empty) | medium | Personnel change; doesn't require deployment |
| `CONTROLLER_UPNS` | access-control | `''` (empty) | medium | Role assignment; operational change |
| `ADMIN_UPNS` | access-control | `''` (empty) | high | Affects admin console access targeting |
| `STRUCTURAL_OWNER_UPNS` | access-control | `''` (empty) | medium | Owner assignment; operational change |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | access-control | `''` (empty) | medium | Department-scoped access grant |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | access-control | `''` (empty) | medium | Department-scoped access grant |
| `PROVISIONING_STEP5_TIMEOUT_MS` | rollout | `90000` | low | Operational tuning; has code default fallback |

### Seeding behavior

- No override records are pre-populated in the live config store (`ConfigOverrides` table). Items start with code-default values until an admin explicitly publishes an override.
- The catalog entries define the schema, validation rules, editability flags, and domain classification. They are code-defined in the `backend/functions/src/config/catalog/` structure recommended by P10-03.
- Seeding is implicit — when the resolution engine resolves an item with no override, it returns the code default with `source: 'code-default'`.

---

## 2. What was intentionally NOT seeded

### Infrastructure-controlled settings (not live-editable)

| Config Entry | Domain | Reason |
|-------------|--------|--------|
| `AZURE_TENANT_ID` | identity | Infrastructure-coupled; changing live would break runtime |
| `AZURE_CLIENT_ID` | identity | Infrastructure-coupled; MI identity, not admin-editable |
| `AZURE_TABLE_ENDPOINT` | infrastructure | Infrastructure-coupled; storage endpoint |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | infrastructure | Secret; Key Vault-managed |
| `SHAREPOINT_TENANT_URL` | sharepoint | Infrastructure-coupled; deployment-bound |
| `SHAREPOINT_PROJECTS_SITE_URL` | sharepoint | Infrastructure-coupled; deployment-bound |
| `HBC_ADAPTER_MODE` | infrastructure | Changing adapter mode live would corrupt service behavior |
| `API_AUDIENCE` | identity | Infrastructure-coupled; JWT validation audience |
| `FUNCTIONS_WORKER_RUNTIME` | infrastructure | Platform-managed; no admin business need |
| `WEBSITE_NODE_DEFAULT_VERSION` | infrastructure | Platform-managed; no admin business need |
| `AzureWebJobsStorage` | infrastructure | Local dev only; not relevant to admin governance |

### Secret settings (never stored in live config store)

| Config Entry | Domain | Reason |
|-------------|--------|--------|
| `AzureSignalRConnectionString` | infrastructure | Secret; Key Vault-managed |
| `EMAIL_DELIVERY_API_KEY` | notification | Secret; Key Vault-managed |

### Permission gates (IT/Security-controlled, not admin-editable)

| Config Entry | Domain | Reason |
|-------------|--------|--------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | rollout | IT/Security gate; must not be toggleable by a business admin |
| `SITES_SELECTED_GRANT_CONFIRMED` | rollout | IT/Security gate; must not be toggleable by a business admin |
| `SITES_PERMISSION_MODEL` | identity | Architecture decision; requires ADR for Path B activation |

### Provisioning-time settings (not startup-validated, not live-editable in Phase 10)

| Config Entry | Domain | Reason |
|-------------|--------|--------|
| `SHAREPOINT_HUB_SITE_ID` | sharepoint | Required at provisioning time only; infrastructure-coupled |
| `SHAREPOINT_APP_CATALOG_URL` | sharepoint | Required at provisioning time only; infrastructure-coupled |
| `HB_INTEL_SPFX_APP_ID` | rollout | Required at provisioning time only; infrastructure-coupled |

### Stub/unused settings (deferred)

| Config Entry | Domain | Reason |
|-------------|--------|--------|
| `NOTIFICATION_API_BASE_URL` | notification | Has localhost fallback; becomes live-editable candidate when notification routing is active |
| `EMAIL_FROM_ADDRESS` | notification | Currently stub/unused; becomes candidate when email delivery is active |

---

## 3. Why those decisions were made

1. **Bucket boundary preserved.** Only Bucket B (business-controlled) items were made live-editable. This matches the Wave 0 governance model from W0-G1-T04 and the P10-02 baseline.

2. **Secrets excluded by design.** The P10-02 baseline explicitly prohibits secrets in the live config store. Secret items are consumed directly via `process.env` with Key Vault references.

3. **Infrastructure settings read from environment.** The resolution engine reads infrastructure-controlled items from `process.env` (source: `'infrastructure'`). They are visible in the admin UI as read-only with provenance but cannot be edited.

4. **Permission gates are IT/Security decisions.** `GRAPH_GROUP_PERMISSION_CONFIRMED` and `SITES_SELECTED_GRANT_CONFIRMED` are confirmation flags that require IT/Security engagement. Making them admin-editable would bypass the engagement process.

5. **Stub/unused items deferred.** `EMAIL_FROM_ADDRESS` and `NOTIFICATION_API_BASE_URL` are not yet active. They become live-editable candidates when their features are activated.

---

## 4. How to bootstrap a new environment

1. **Deploy infrastructure settings** via Terraform/CI/CD:
   - All Bucket A settings must be set in Azure App Settings
   - Secret settings must be Key Vault references
   - `HBC_ADAPTER_MODE` must be `proxy` in staging/production, `mock` for local dev

2. **Set Bucket B settings** in Azure App Settings (initial values):
   - `OPEX_MANAGER_UPN`, `CONTROLLER_UPNS`, `ADMIN_UPNS` — set to the appropriate UPNs for the environment
   - `STRUCTURAL_OWNER_UPNS`, `DEPT_BACKGROUND_ACCESS_*` — set if applicable, otherwise leave empty

3. **Start the admin app.** The resolution engine will read:
   - Infrastructure values from `process.env`
   - Code defaults for items with no override
   - Live overrides from the `ConfigOverrides` table (empty on first boot)

4. **Optionally publish overrides** via the Standards & Configuration lane:
   - Navigate to `/standards-config` in the admin console
   - Edit any Bucket B item to publish a live override
   - The override takes effect immediately and is versioned/audited

**No explicit seeding step is required.** The system starts with code defaults and env vars. Admins can publish overrides as needed.

---

## 5. How to reconcile an existing environment

For environments that were running before Phase 10:

1. **No action required for infrastructure settings.** They continue to work via `process.env` as before.

2. **No action required for Bucket B settings.** They continue to work via `process.env` as before. The resolution engine returns them with `source: 'code-default'` (since the env var reader for business items falls through to code default when no live override exists).

3. **Optional: Publish overrides for Bucket B items.** If the team wants to start governing Bucket B items through the admin console instead of environment variables:
   - Navigate to `/standards-config`
   - Review current effective values (shown with provenance)
   - Publish overrides for items that should be admin-maintained
   - Once overrides are published, they take precedence over code defaults

4. **No data migration is required.** The system is additive — live overrides supplement but don't require removing environment variables.

---

## 6. Residual manual steps

| Step | Required? | Description |
|------|-----------|-------------|
| Review effective values in admin console | Recommended | After Phase 10 deployment, verify that the Standards & Configuration lane shows correct effective values and provenance |
| Publish Bucket B overrides | Optional | Admin can publish overrides to move governance from env-var-based to live-admin-maintained |
| Remove stale environment variables | Optional, deferred | After live overrides are confirmed working, stale Bucket B env vars can be removed from App Settings. Not required immediately. |

---

## 7. Wave-0 documentation reconciliation

The following drift points from P10-01 §5 have been resolved in `docs/reference/configuration/wave-0-config-registry.md` v2.0:

| Drift ID | Issue | Resolution |
|----------|-------|------------|
| D1 | `HBC_ADAPTER_MODE` values: doc said `live\|mock` | Fixed to `proxy\|mock` with legacy `real` alias noted |
| D2 | `AzureSignalRConnectionString` requiredInProd mismatch | Fixed to `No` — backend degrades gracefully when absent |
| D3 | `EMAIL_DELIVERY_API_KEY` requiredInProd mismatch | Fixed to `No` — stub/unused in Wave 0 |
| D4 | `EMAIL_FROM_ADDRESS` requiredInProd mismatch | Fixed to `No` — stub/unused in Wave 0 |
| D5 | `NOTIFICATION_API_BASE_URL` requiredInProd mismatch | Fixed to `No` — has localhost fallback |
| D6 | `HB_INTEL_SPFX_APP_ID` requiredInProd mismatch | Fixed to `No` — required at provisioning time only |
| D7 | `SHAREPOINT_HUB_SITE_ID` requiredInProd mismatch | Fixed to `No` — required at provisioning time only |
| D8 | `SHAREPOINT_APP_CATALOG_URL` requiredInProd mismatch | Fixed to `No` — required at provisioning time only |
| D9 | `AZURE_CLIENT_SECRET` in doc but not in code | Moved to "Removed Settings" section — MI-based auth eliminates direct secret consumption |
| D10 | Config tier system not documented | Added §2 "Validation Tiers" documenting core/sharepoint/provisioning tiers |
| D11 | Validation wiring status stale | Fixed §6 to reflect that validation IS wired into startup via `createServiceFactory()` |
| D12 | `GRAPH_GROUP_PERMISSION_CONFIRMED` missing from doc | Added to new §3.4 "Permission and Prerequisite Gates" |
| D13 | `SITES_SELECTED_GRANT_CONFIRMED` missing from doc | Added to new §3.4 "Permission and Prerequisite Gates" |

Additional reconciliation:
- Added `API_AUDIENCE` (core tier, requiredInProd: true) — was in code registry but missing from doc
- Added `SHAREPOINT_PROJECTS_SITE_URL` (sharepoint tier, requiredInProd: true) — was in code registry but missing from doc
- Fixed Bucket B `requiredInProd` values to `No` — matches code registry where all Bucket B items have `requiredInProd: false`
- Updated environment separation matrix to use `proxy` instead of `live`, include `API_AUDIENCE`, and remove `AZURE_CLIENT_SECRET`
- Added Phase 10 reference in governance model section
- Added link to this seeding/reconciliation doc in related documents
