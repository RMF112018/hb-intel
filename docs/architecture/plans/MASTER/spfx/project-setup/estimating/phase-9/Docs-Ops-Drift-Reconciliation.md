# Docs/Ops Drift Reconciliation — Config, Identity, and Role-Model Posture

**Date:** 2026-04-01
**Scope:** Table storage config, managed identity mode, controller/admin auth posture

## Drift Area 1: Table Storage Configuration

### Implementation Truth
- `AZURE_TABLE_ENDPOINT` is the sole env var consumed by live code
- `AZURE_STORAGE_CONNECTION_STRING` has zero references anywhere in the codebase
- Factory (`table-client-factory.ts`) auto-detects: HTTP(S) URLs → `DefaultAzureCredential`, connection strings → `fromConnectionString()` (local dev)

### Drift Found
None material. One historical reconciliation note references the old variable name as an artifact. No active docs, code, or tests use the stale name.

### Final Posture
`AZURE_TABLE_ENDPOINT` is the single authoritative table storage config. Production uses endpoint URL + managed identity. Local dev uses `UseDevelopmentStorage=true` via the same env var.

## Drift Area 2: Managed Identity Mode

### Implementation Truth
- `AZURE_CLIENT_ID` is required in production and documented in `wave0-env-registry.ts` as "User-assigned Managed Identity client ID in production"
- `DefaultAzureCredential` is used universally (13 instances across 12 files)
- When `AZURE_CLIENT_ID` is set, `DefaultAzureCredential` selects the user-assigned MI

### Drift Found
| File | Stale Text | Correction |
|------|-----------|------------|
| `backend/functions/README.md` line 34 | "system-assigned Managed Identity" | Changed to "user-assigned Managed Identity" |
| `backend/functions/.deploy/README.md` line 34 | Same | Same fix |

### Final Posture
Production uses **user-assigned Managed Identity** via `DefaultAzureCredential` with `AZURE_CLIENT_ID` set to the MI client ID. Local dev uses a developer service principal with `AZURE_CLIENT_SECRET`.

## Drift Area 3: Controller/Admin Authorization Posture

### Implementation Truth
- Authorization is governed entirely by **JWT app-role claims** (P9-G5 authorization convergence)
- `isAdmin()`, `isController()`, `resolveRequestRole()` all inspect `claims.roles` from the JWT — zero env-var lookups
- `CONTROLLER_UPNS` and `ADMIN_UPNS` are used **only** for provisioning notification recipient targeting (`notification-dispatch.ts`)
- 6 authz-release-gate tests prevent regression to env-var auth

### Drift Found
| File | Stale Text | Correction |
|------|-----------|------------|
| `service-factory.ts` lines 76-80 | Startup warnings said "role-based state transitions disabled" and "admin role resolution disabled" when env vars missing | Changed to describe notification targeting impact only |
| `health/index.ts` lines 76-79 | Health output labeled `roleConfig` with `degraded` status when env vars missing | Renamed to `notificationRecipients` with `not-configured` status — authorization is unaffected |
| `wave0-env-registry.ts` lines 162-172 | Descriptions said "degrades role resolution to submitter-only" | Updated to clarify these are notification-targeting config, not authorization config |

### Final Posture
- **Authorization:** JWT app-role claims only (Admin/HBIntelAdmin, Controller/HBIntelController)
- **CONTROLLER_UPNS:** Notification targeting for provisioning failure/escalation emails — not authorization
- **ADMIN_UPNS:** Notification targeting for provisioning escalation emails — not authorization
- **Health output:** Reports `notificationRecipients` status (informational), not `roleConfig` (which implied auth degradation)

## Impacted Files

| File | Change |
|------|--------|
| `backend/functions/README.md` | MI: system-assigned → user-assigned |
| `backend/functions/.deploy/README.md` | MI: system-assigned → user-assigned |
| `backend/functions/src/hosts/project-setup/service-factory.ts` | Startup warnings: auth language → notification language |
| `backend/functions/src/functions/health/index.ts` | Health output: `roleConfig`/`degraded` → `notificationRecipients`/`not-configured` |
| `backend/functions/src/config/wave0-env-registry.ts` | Registry descriptions: auth language → notification language |

## Retained Transitional Behavior
- `CONTROLLER_UPNS` and `ADMIN_UPNS` remain as valid env vars for notification targeting — they are not removed
- `DefaultAzureCredential` still supports the connection-string path for local dev via `AZURE_TABLE_ENDPOINT=UseDevelopmentStorage=true`
- `HBC_ADAPTER_MODE=real` is still accepted as a backward-compatible alias for `proxy` in code
