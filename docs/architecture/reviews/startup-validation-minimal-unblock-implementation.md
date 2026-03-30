# Startup Validation — Minimal Unblock Implementation

> **Date**: 2026-03-30
> **Scope**: Demote 5 settings from boot-blocking to optional for Project Setup-only deployment
> **Predecessor**: `startup-validation-refactor-audit-and-target-design.md`

---

## 1. Executive Summary

Demoted 5 settings from `requiredInProd: true` to `false` so the backend can boot for Project Setup-only deployment without requiring notification, email, provisioning-role, or authorization UPN settings that aren't consumed by the request lifecycle. Added degraded-mode warnings for missing `CONTROLLER_UPNS`/`ADMIN_UPNS`.

**MINIMAL STARTUP VALIDATION UNBLOCK IMPLEMENTED**

---

## 2. Files Changed

| File | Change |
|------|--------|
| `backend/functions/src/config/wave0-env-registry.ts` | Demoted 5 settings from `requiredInProd: true` to `false` |
| `backend/functions/src/services/service-factory.ts` | Added degraded-mode warnings for missing CONTROLLER_UPNS/ADMIN_UPNS |
| `backend/functions/src/config/wave0-env-registry.test.ts` | Updated pinned required set (12 → 7), expanded deferred set |
| `backend/functions/src/utils/validate-config.test.ts` | Updated deferred-settings test to cover all 13 non-required settings |
| This document | Implementation record |

---

## 3. Settings Demoted

| Setting | Reason | Impact |
|---------|--------|--------|
| `NOTIFICATION_API_BASE_URL` | Has `localhost:7071` fallback in `notification-service.ts:20`; not consumed by Project Setup routes | Notifications degrade gracefully |
| `EMAIL_FROM_ADDRESS` | Only used by email sending code; no Project Setup path | Email notifications unavailable |
| `OPEX_MANAGER_UPN` | Only consumed by provisioning saga Step 6 (`step6-permissions.ts:12`) | Provisioning saga Step 6 blocked |
| `CONTROLLER_UPNS` | Has safe empty fallback in `resolveRequestRole()` (`state-machine.ts:40`) | Role resolution: no controller transitions |
| `ADMIN_UPNS` | Has safe empty fallback in `resolveRequestRole()` (`state-machine.ts:41`) | Role resolution: no admin transitions |

---

## 4. Test Changes

| Test | File | Change |
|------|------|--------|
| Core boot + Project Setup pinned set | `wave0-env-registry.test.ts` | Updated from 12 to 7 required settings |
| Deferred entries list | `wave0-env-registry.test.ts` | Expanded to include all 14 non-required settings |
| Deferred settings don't block boot | `validate-config.test.ts` | Updated to explicitly delete all 13 deferred settings |

---

## 5. Degraded-Mode Warnings

**Implemented** in `service-factory.ts`:

When `CONTROLLER_UPNS` is not set, logs:
```
[StartupWarning] CONTROLLER_UPNS not set — role-based state transitions disabled for controllers.
```

When `ADMIN_UPNS` is not set, logs:
```
[StartupWarning] ADMIN_UPNS not set — admin role resolution disabled.
```

Warnings only; no throw; no boot failure.

---

## 6. Test/Build Results

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/functions test` | 40 files, 440 passed, 3 skipped |
| `pnpm turbo run build --filter=@hbc/functions...` | 14/14 tasks clean |

### New Boot Contract (7 settings)

| Setting | Required? | Verified |
|---------|-----------|----------|
| `AZURE_TENANT_ID` | Yes — blocks boot | Pinned test + existing throw test |
| `AZURE_CLIENT_ID` | Yes — blocks boot | Pinned test + existing throw test |
| `AZURE_TABLE_ENDPOINT` | Yes — blocks boot | Pinned test |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Yes — blocks boot | Pinned test |
| `HBC_ADAPTER_MODE` | Yes — blocks boot | Pinned test + adapter-mode-guard tests |
| `SHAREPOINT_TENANT_URL` | Yes — blocks boot | Pinned test |
| `SHAREPOINT_PROJECTS_SITE_URL` | Yes — blocks boot | Pinned test |

---

## 7. Deployment Implication

The Azure Function App can now boot in `proxy` mode with only 7 environment variables set:

```bash
az functionapp config appsettings set \
  --name hb-intel-function-app --resource-group hb-intel \
  --settings \
    AZURE_TENANT_ID=91e238a3-4af4-42c0-9cb8-eb37861d82f3 \
    AZURE_CLIENT_ID=77ad3593-5414-4122-a649-74916f8c0d7a \
    AZURE_TABLE_ENDPOINT="https://hbintel-table-prod-01.table.cosmos.azure.com:443/" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=..." \
    HBC_ADAPTER_MODE=proxy \
    SHAREPOINT_TENANT_URL=https://hedrickbrotherscom.sharepoint.com \
    SHAREPOINT_PROJECTS_SITE_URL=https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

Optional but recommended for full functionality:
```
CONTROLLER_UPNS, ADMIN_UPNS, OPEX_MANAGER_UPN,
NOTIFICATION_API_BASE_URL, EMAIL_FROM_ADDRESS
```
