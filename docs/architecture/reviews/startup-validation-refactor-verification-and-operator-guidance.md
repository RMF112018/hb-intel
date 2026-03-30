# Startup Validation Refactor — Verification & Operator Guidance

> **Date**: 2026-03-30
> **Scope**: Boot behavior, health diagnostics, operator config guidance

---

## 1. Verification Summary

| Area | Tests | Result |
|------|-------|--------|
| Boot behavior (Project Setup posture) | 22 tests in `boot-behavior.test.ts` | All pass |
| Health diagnostics | 6 tests in `health.test.ts` | All pass |
| Startup validation | 10 tests in `validate-config.test.ts` | All pass |
| Registry contract | 12 tests in `wave0-env-registry.test.ts` | All pass |
| **Total** | **42 files, 468 tests** | **All pass** |

**STARTUP VALIDATION REFACTOR VERIFIED**

---

## 2. Boot Behavior Matrix

| Config Combination | Boots? | Behavior |
|-------------------|--------|----------|
| 7 core settings only | Yes | Full Project Setup lifecycle; no notifications, provisioning, or role-based transitions |
| 7 core + CONTROLLER_UPNS + ADMIN_UPNS | Yes | Full Project Setup with controller/admin state transitions |
| 7 core + all optional | Yes | Full platform functionality |
| Missing any 1 of 7 core | No | Throws `[StartupValidation] Missing N required` with setting names |
| Mock mode (HBC_ADAPTER_MODE=mock) | Yes | Bypasses all validation; uses mock services |
| All settings missing + mock mode | Yes | Mock mode does not validate |

---

## 3. Route Capability Matrix

| Route | Required Config | Available in Project Setup Deployment |
|-------|----------------|--------------------------------------|
| `GET /api/health` | None | Always |
| `POST /api/project-setup-requests` | 7 core | Yes |
| `GET /api/project-setup-requests` | 7 core | Yes |
| `GET /api/project-setup-requests/{id}` | 7 core | Yes |
| `PATCH /api/project-setup-requests/{id}/state` | 7 core (+ CONTROLLER_UPNS for controller transitions) | Yes (degraded without role UPNs) |
| `POST /api/provision-project-site` | 7 core + provisioning settings | No — provisioning prerequisites block |
| `POST /api/notifications/send` | NOTIFICATION_API_BASE_URL + EMAIL_* | No — deferred |
| `POST /api/provisioning-negotiate` | AzureSignalRConnectionString | No — SignalR deferred |

---

## 4. Health Behavior Summary

`GET /api/health` returns HTTP 200 always with diagnostic body:

```json
{
  "status": "healthy",
  "environment": "Production",
  "adapterMode": "proxy",
  "coreConfigReady": true,
  "integrations": {
    "signalR": "not-configured",
    "email": "not-configured",
    "notifications": "not-configured",
    "provisioning": "not-configured",
    "graphPermissions": "not-configured"
  },
  "roleConfig": {
    "controllers": "configured",
    "admins": "configured"
  },
  "timestamp": "2026-03-30T..."
}
```

- `coreConfigReady: true` means 7 required settings are present
- `integrations` shows which optional features are configured
- `roleConfig` shows whether role-based transitions are available
- HTTP status is always 200 — Azure health probes succeed regardless

---

## 5. Required Environment Variables

### Core (7 — blocks boot if missing)

| Setting | Example |
|---------|---------|
| `AZURE_TENANT_ID` | `91e238a3-4af4-42c0-9cb8-eb37861d82f3` |
| `AZURE_CLIENT_ID` | `77ad3593-5414-4122-a649-74916f8c0d7a` |
| `AZURE_TABLE_ENDPOINT` | `https://hbintel-table-prod-01.table.cosmos.azure.com:443/` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | `InstrumentationKey=...` |
| `HBC_ADAPTER_MODE` | `proxy` |
| `SHAREPOINT_TENANT_URL` | `https://hedrickbrotherscom.sharepoint.com` |
| `SHAREPOINT_PROJECTS_SITE_URL` | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` |

### Project Setup Enhancement (recommended, degrades without)

| Setting | Impact When Missing |
|---------|-------------------|
| `CONTROLLER_UPNS` | No controller state transitions; warning logged |
| `ADMIN_UPNS` | No admin state transitions; warning logged |

### Optional Integrations (do not block boot)

| Setting | Feature |
|---------|---------|
| `AzureSignalRConnectionString` | SignalR real-time provisioning updates |
| `NOTIFICATION_API_BASE_URL` | Notification dispatch |
| `EMAIL_FROM_ADDRESS` | Email sender address |
| `EMAIL_DELIVERY_API_KEY` | Email delivery (SendGrid) |
| `OPEX_MANAGER_UPN` | Provisioning saga Step 6 |
| `SHAREPOINT_HUB_SITE_ID` | Provisioning saga Step 7 |
| `SHAREPOINT_APP_CATALOG_URL` | Provisioning saga Step 5 |
| `HB_INTEL_SPFX_APP_ID` | Provisioning saga Step 5 |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | Graph group permission gate |

### Auth Mode

| Setting | When Needed |
|---------|------------|
| `API_AUDIENCE` | When MI client ID differs from app registration client ID |
| `AZURE_CLIENT_SECRET` | Local dev with client-secret auth only |

---

## 6. Manual Validation Checklist for Operators

### After Deployment

- [ ] `GET /api/health` returns 200
- [ ] Response body shows `coreConfigReady: true`
- [ ] Response body shows `adapterMode: "proxy"`
- [ ] If CONTROLLER_UPNS/ADMIN_UPNS are set: `roleConfig.controllers: "configured"`
- [ ] Application Insights shows `startup.mode.resolved` event with `adapterMode: "proxy"`
- [ ] No `[StartupValidation]` errors in Application Insights
- [ ] `[StartupWarning]` messages present for any missing optional settings (expected)

### API Verification

- [ ] `GET /api/project-setup-requests` with valid Bearer token returns 200
- [ ] `POST /api/project-setup-requests` with valid body returns 201
- [ ] Response contains correct SP-derived fields

### If 401 Errors

- Check `API_AUDIENCE` — may need to be set if MI client ID ≠ app registration client ID
- Check `AZURE_CLIENT_ID` — must match the managed identity's client ID
- Check SPFx app registration token audience matches `api://<AZURE_CLIENT_ID>` or `API_AUDIENCE`

---

## 7. Files Changed

| File | Change |
|------|--------|
| `backend/functions/src/functions/health/index.ts` | Enhanced health endpoint with config diagnostics |
| `backend/functions/src/functions/health/__tests__/health.test.ts` | **NEW** — 6 health diagnostic tests |
| `backend/functions/src/test/boot-behavior.test.ts` | **NEW** — 22 boot behavior tests |
| `backend/functions/vitest.config.ts` | Added test patterns for new test locations |
