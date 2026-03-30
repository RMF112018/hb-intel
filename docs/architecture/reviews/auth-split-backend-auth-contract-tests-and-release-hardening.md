# Auth Split — Backend Auth Contract Tests & Release Hardening

> **Date**: 2026-03-30
> **Scope**: Verification and release-hardening of the auth/config split refactor

---

## 1. Final Auth/Config Contract

### Outbound Azure Resource Auth (Managed Identity)

| Setting | Purpose | Required |
|---------|---------|----------|
| `AZURE_CLIENT_ID` | User-assigned managed identity client ID; read by `DefaultAzureCredential` | Yes |
| `AZURE_TENANT_ID` | Entra ID tenant; used for token scope | Yes |

`DefaultAzureCredential` in `sharepoint-service.ts`, `project-requests-repository.ts`, and `msal-obo-service.ts` reads `AZURE_CLIENT_ID` from the environment to select the user-assigned managed identity.

### Inbound API Token Validation

| Setting | Purpose | Required |
|---------|---------|----------|
| `API_AUDIENCE` | Explicit JWT audience (e.g. `api://<app-reg-id>`) | No — falls back to `api://${AZURE_CLIENT_ID}` |
| `AZURE_TENANT_ID` | JWT issuer check | Yes |

`validateToken.ts` validates: `audience: process.env.API_AUDIENCE || \`api://${process.env.AZURE_CLIENT_ID}\``

### Startup Validation

`validateRequiredConfig()` runs when `HBC_ADAPTER_MODE=proxy` (not mock, not test). It checks only settings with `requiredInProd: true`.

---

## 2. Managed-Identity Mode — Required Settings (12)

These must be set for the backend to boot in `proxy` mode:

| Setting | Example Value |
|---------|---------------|
| `AZURE_TENANT_ID` | `<tenant-id>` |
| `AZURE_CLIENT_ID` | `<managed-identity-client-id>` (MI client ID) |
| `AZURE_TABLE_ENDPOINT` | `https://<cosmos-table-account>.table.cosmos.azure.com:443/` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | `InstrumentationKey=...` |
| `SHAREPOINT_TENANT_URL` | `<sharepoint-tenant-url>` |
| `SHAREPOINT_PROJECTS_SITE_URL` | `https://<sharepoint-site-url>` |
| `HBC_ADAPTER_MODE` | `proxy` |
| `NOTIFICATION_API_BASE_URL` | `<function-app-url>` |
| `EMAIL_FROM_ADDRESS` | `<operator-upn>` |
| `OPEX_MANAGER_UPN` | `<operator-upn>` |
| `CONTROLLER_UPNS` | `<operator-upn>` |
| `ADMIN_UPNS` | `<operator-upn>` |

**Not required for boot**: `AZURE_CLIENT_SECRET`, `AzureSignalRConnectionString`, `SHAREPOINT_HUB_SITE_ID`, `EMAIL_DELIVERY_API_KEY`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `GRAPH_GROUP_PERMISSION_CONFIRMED`, `API_AUDIENCE`

---

## 3. Secret-Based Mode (Local Dev)

For local development with client-secret auth:

| Setting | Required |
|---------|----------|
| All 12 managed-identity settings | Yes |
| `AZURE_CLIENT_SECRET` | Yes (for `ClientSecretCredential`) |
| `HBC_ADAPTER_MODE` | `mock` (bypasses startup validation and uses mock services) |

In mock mode, startup validation is skipped entirely. `DefaultAzureCredential` won't be called because mock services are used.

---

## 4. Files Changed

| File | Change |
|------|--------|
| `backend/functions/src/utils/validate-config.test.ts` | +3 tests: AZURE_CLIENT_SECRET not required, deferred provisioning settings not required, error message references docs |
| `backend/functions/src/config/wave0-env-registry.test.ts` | +2 tests: AZURE_CLIENT_ID description check, exact requiredInProd pinned contract |

---

## 5. Tests Added/Updated

### validate-config.test.ts (3 new)

| Test | Proves |
|------|--------|
| `does NOT require AZURE_CLIENT_SECRET in managed-identity mode` | Secret is optional — MI path works without it |
| `does NOT require deferred provisioning settings for initial boot` | All 8 saga-only settings are optional |
| `error message references config docs for operator guidance` | Failure message includes `wave-0-config-registry` path |

### wave0-env-registry.test.ts (2 new)

| Test | Proves |
|------|--------|
| `AZURE_CLIENT_ID description reflects managed-identity role` | Description mentions MI, DefaultAzureCredential, API_AUDIENCE |
| `exact requiredInProd=true set matches managed-identity boot contract` | Pinned list of exactly 12 required settings — any registry change breaks this test |

### Previously existing (from Prompt 02)

| Test | Proves |
|------|--------|
| `uses api://${AZURE_CLIENT_ID} as audience when API_AUDIENCE is not set` | Backward-compatible fallback |
| `uses explicit API_AUDIENCE when set` | Split-identity override works |
| `includes API_AUDIENCE as optional` | Registry has the setting as optional |

---

## 6. Verification Results

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/functions test` | 40 files, 440 passed, 3 skipped |
| `pnpm turbo run build --filter=@hbc/functions...` | 14/14 tasks successful |
| Auth contract: outbound MI path | `DefaultAzureCredential` reads `AZURE_CLIENT_ID` — unchanged, correct |
| Auth contract: inbound JWT | `API_AUDIENCE` with `api://${AZURE_CLIENT_ID}` fallback — correct |
| Auth contract: startup validation | Only 12 core settings required; 8 deferred; 1 secret optional — correct |
| Backward compat: single-identity | No `API_AUDIENCE` needed — fallback to `api://${AZURE_CLIENT_ID}` |

---

## 7. Remaining Risks / Open Items

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **`AZURE_CLIENT_ID` still dual-purpose** in single-identity deployments | Low | `API_AUDIENCE` override exists for split-identity; fallback documented |
| 2 | **App registration may differ from MI client ID** | Medium | If 401 audience mismatch after deploy, set `API_AUDIENCE=api://<app-reg-id>` |
| 3 | **No app registration exists yet for API audience** | Blocked on operator | If the MI *is* the app reg (Entra ID single-app pattern), no action needed |
| 4 | **Deployment artifact not yet published** | Blocked on deploy step | Artifact must be rebuilt with updated registry code |
| 5 | **Pipeline zip doesn't include node_modules** | CI/CD debt | Self-contained artifact required; pipeline fix deferred |

---

## 8. Deployment-Ready Assessment

### **The backend auth/config model IS deployment-ready.**

The auth contract is:
- **Explicit**: outbound MI vs inbound JWT audience are separated
- **Backward-compatible**: zero-config for single-identity deployments
- **Operator-friendly**: startup errors reference config docs; missing settings listed by name
- **Testable**: 5 new hardening tests pin the exact contract; 12 existing tests cover auth behavior
- **Documented**: design doc, refactor doc, and this hardening doc form a complete chain

The remaining deployment blockers are infrastructure/operational (artifact packaging, Azure CLI auth, app registration confirmation) — not auth/config model issues.
