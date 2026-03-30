# Auth Split — Startup Validation & Credential Refactor

> **Date**: 2026-03-30
> **Scope**: Separate outbound managed-identity auth from inbound API token validation
> **Predecessor**: `auth-split-validation-and-refactor-design.md`

---

## 1. Files Changed

| File | Change |
|------|--------|
| `backend/functions/src/middleware/validateToken.ts` | Read `API_AUDIENCE` with fallback to `api://${AZURE_CLIENT_ID}`; updated doc comments |
| `backend/functions/src/config/wave0-env-registry.ts` | Updated `AZURE_CLIENT_ID` description to reflect MI role; added `API_AUDIENCE` to optional config |
| `backend/functions/local.settings.example.json` | Added `API_AUDIENCE`; updated `AZURE_CLIENT_ID`/`AZURE_CLIENT_SECRET` descriptions |
| `backend/functions/src/middleware/validateToken.test.ts` | Added 2 tests: fallback audience and explicit API_AUDIENCE override |
| `backend/functions/src/config/wave0-env-registry.test.ts` | Added test: API_AUDIENCE present in optional config |

---

## 2. Old vs New Config Model

### Inbound JWT Audience

| | Old | New |
|-|-----|-----|
| Setting | `AZURE_CLIENT_ID` (overloaded) | `API_AUDIENCE` (explicit) with fallback to `api://${AZURE_CLIENT_ID}` |
| Semantic | Ambiguous — app reg or MI? | Clear — this IS the JWT audience value |
| Resolution | `api://${AZURE_CLIENT_ID}` hardcoded | `process.env.API_AUDIENCE \|\| \`api://${process.env.AZURE_CLIENT_ID}\`` |

### Outbound Azure Resource Auth

| | Old | New |
|-|-----|-----|
| Mechanism | `DefaultAzureCredential()` | `DefaultAzureCredential()` (unchanged) |
| MI selection | `AZURE_CLIENT_ID` env (SDK convention) | `AZURE_CLIENT_ID` env (unchanged) |

### Startup Validation

| Setting | Old `requiredInProd` | New `requiredInProd` |
|---------|---------------------|---------------------|
| `AZURE_CLIENT_ID` | `true` (described as "app registration") | `true` (described as "managed identity client ID") |
| `AZURE_CLIENT_SECRET` | `false` (demoted earlier) | `false` (unchanged) |
| `API_AUDIENCE` | Did not exist | `false` (optional, with fallback) |

---

## 3. Startup Validation Changes

The startup validation gate (`validateRequiredConfig()`) now only requires settings actually needed for the managed-identity runtime path:

**Still required**: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `SHAREPOINT_TENANT_URL`, `SHAREPOINT_PROJECTS_SITE_URL`, `HBC_ADAPTER_MODE`, `NOTIFICATION_API_BASE_URL`, `EMAIL_FROM_ADDRESS`, `OPEX_MANAGER_UPN`, `CONTROLLER_UPNS`, `ADMIN_UPNS`

**Optional**: `API_AUDIENCE`, `AZURE_CLIENT_SECRET`, `AzureSignalRConnectionString`, `SHAREPOINT_HUB_SITE_ID`, `EMAIL_DELIVERY_API_KEY`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `GRAPH_GROUP_PERMISSION_CONFIRMED`

---

## 4. Credential Resolution Changes

### Before

```
AZURE_CLIENT_ID ──→ validateToken.ts (audience: api://<value>)
                └──→ DefaultAzureCredential (MI selector)
```

Both consumers read the same value with different semantic needs.

### After

```
API_AUDIENCE ──────→ validateToken.ts (explicit audience)
  ↓ (fallback)
api://${AZURE_CLIENT_ID}

AZURE_CLIENT_ID ───→ DefaultAzureCredential (MI selector, unchanged)
```

The fallback preserves backward compatibility for single-identity deployments.

---

## 5. Backward Compatibility

| Scenario | Required Changes | Behavior |
|----------|-----------------|----------|
| Single identity (MI client ID = app reg client ID) | None | `API_AUDIENCE` not set → falls back to `api://${AZURE_CLIENT_ID}` |
| Split identity (MI ≠ app reg) | Set `API_AUDIENCE=api://<app-reg-id>` | Explicit audience, MI selection via `AZURE_CLIENT_ID` |
| Local dev with client secret | Set `AZURE_CLIENT_SECRET` + `AZURE_CLIENT_ID` | Works as before; `API_AUDIENCE` optional |

---

## 6. Deployment / Operator Implications

### Current Azure Function App (`hb-intel-function-app`)

`AZURE_CLIENT_ID=77ad3593-5414-4122-a649-74916f8c0d7a` (user-assigned MI)

- If the SPFx app registration uses the same client ID → no action needed
- If the SPFx app registration uses a different client ID → set `API_AUDIENCE=api://<spfx-app-reg-id>`
- If uncertain → deploy and check: 401 errors with "unexpected aud claim" = wrong audience → set `API_AUDIENCE`

### Diagnostic

If 401 errors occur after deployment, the error message from `jose` will say `unexpected "aud" claim value`. Fix:
```bash
az functionapp config appsettings set \
  --name hb-intel-function-app --resource-group hb-intel \
  --settings API_AUDIENCE="api://<correct-app-registration-client-id>"
```

---

## 7. Handoff to Prompt 03

1. Rebuild deployment artifact with updated code
2. Deploy to Azure Function App
3. Test `/api/health` endpoint
4. If 401 on authenticated endpoints, set `API_AUDIENCE` to the correct app registration value
5. Validate SPFx → Function App connectivity end-to-end
