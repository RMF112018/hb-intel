# Startup Validation Refactor — Audit & Target-State Design

> **Date**: 2026-03-30
> **Scope**: Prove over-broad startup validation, classify settings, design scoped model
> **Status**: Design-only — implementation in Prompt 02

---

## 1. Executive Summary

The backend startup validation gate (`validateRequiredConfig()`) is a single monolithic check that blocks ALL endpoints when ANY `requiredInProd: true` setting is missing. For the current Project Setup-only deployment, this means settings needed only for notifications/email (`NOTIFICATION_API_BASE_URL`, `EMAIL_FROM_ADDRESS`), provisioning saga role config (`OPEX_MANAGER_UPN`), and business UPNs are treated as boot-blocking even though the Project Setup request lifecycle operates independently of those features.

The refactor should introduce **scoped validators** driven by deployment scope, so the backend can boot and serve Project Setup traffic as long as its actual runtime dependencies are satisfied.

---

## 2. Current Validation Model Inventory

### Entry Point

`createServiceFactory()` in `backend/functions/src/services/service-factory.ts:71-72`:
```typescript
let singletonContainer: IServiceContainer | null = null;
export function createServiceFactory(): IServiceContainer {
  if (singletonContainer) return singletonContainer;
  const adapterMode = assertAdapterModeValid();   // ← mode guard
  validateRequiredConfig();                         // ← monolithic gate
  // ... build services
```

### Trigger Timing

- **NOT at cold start** — triggered on first HTTP request that calls `createServiceFactory()`
- `/api/health` does NOT call `createServiceFactory()` → always works
- First call to any Project Setup, provisioning, CRUD, or notification endpoint triggers it
- Once triggered, the singleton is cached — subsequent requests skip validation

### Current `requiredInProd: true` Settings (12)

| Setting | Actual Consumer | Needed for Project Setup? |
|---------|----------------|--------------------------|
| `AZURE_TENANT_ID` | `validateToken.ts` (JWT issuer), `step6-permissions.ts` | **Yes** — JWT validation |
| `AZURE_CLIENT_ID` | `DefaultAzureCredential` (MI selector), `validateToken.ts` (audience fallback) | **Yes** — both auth paths |
| `AZURE_TABLE_ENDPOINT` | `RealTableStorageService` constructor | **Yes** — provisioning status storage |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Azure Functions host telemetry | **Yes** — operational observability |
| `SHAREPOINT_TENANT_URL` | `SharePointService`, `SharePointProjectRequestsAdapter` | **Yes** — SP connection |
| `SHAREPOINT_PROJECTS_SITE_URL` | `SharePointProjectRequestsAdapter` constructor | **Yes** — Projects list target |
| `HBC_ADAPTER_MODE` | `assertAdapterModeValid()` | **Yes** — mock vs proxy |
| `NOTIFICATION_API_BASE_URL` | `NotificationService` constructor (has localhost fallback) | **No** — notifications deferred |
| `EMAIL_FROM_ADDRESS` | Email sending code only | **No** — email deferred |
| `OPEX_MANAGER_UPN` | `step6-permissions.ts` (provisioning saga) | **No** — provisioning deferred |
| `CONTROLLER_UPNS` | `resolveRequestRole()` in state-machine.ts | **Degraded** — has empty fallback, but role resolution degrades to submitter-only |
| `ADMIN_UPNS` | `resolveRequestRole()` in state-machine.ts | **Degraded** — same as CONTROLLER_UPNS |

### Current `requiredInProd: false` Settings (Deferred)

Already correctly deferred: `AZURE_CLIENT_SECRET`, `AzureSignalRConnectionString`, `SHAREPOINT_HUB_SITE_ID`, `EMAIL_DELIVERY_API_KEY`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `GRAPH_GROUP_PERMISSION_CONFIRMED`, `DEPT_BACKGROUND_ACCESS_*`

---

## 3. Exact Blockers for Project Setup-Only Deployment

With the current 12 `requiredInProd: true` settings, the backend will fail on first request if ANY of these are missing:

| Setting | Current Behavior | Problem for Project Setup |
|---------|-----------------|--------------------------|
| `NOTIFICATION_API_BASE_URL` | **Blocks boot** | Not consumed by any Project Setup code path. `NotificationService` has a `localhost:7071` fallback. Boot-blocking is unnecessary. |
| `EMAIL_FROM_ADDRESS` | **Blocks boot** | Only used by email sending. Project Setup does not send email. |
| `OPEX_MANAGER_UPN` | **Blocks boot** | Only consumed by provisioning saga Step 6. Not in the request lifecycle path. |

These 3 settings are the unnecessary boot blockers. The remaining 9 are legitimately needed.

`CONTROLLER_UPNS` and `ADMIN_UPNS` are in a middle zone — they have empty-string fallbacks in `resolveRequestRole()` so the code won't crash, but without them the role-based authorization degrades to submitter-only (no controller/admin state transitions possible).

---

## 4. Settings Classification Matrix

| Setting | Current | Target | Scope |
|---------|---------|--------|-------|
| `AZURE_TENANT_ID` | Boot-blocking | Boot-blocking | Core |
| `AZURE_CLIENT_ID` | Boot-blocking | Boot-blocking | Core |
| `AZURE_TABLE_ENDPOINT` | Boot-blocking | Boot-blocking | Core |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Boot-blocking | Boot-blocking | Core |
| `HBC_ADAPTER_MODE` | Boot-blocking | Boot-blocking | Core |
| `SHAREPOINT_TENANT_URL` | Boot-blocking | Boot-blocking | Project Setup |
| `SHAREPOINT_PROJECTS_SITE_URL` | Boot-blocking | Boot-blocking | Project Setup |
| `CONTROLLER_UPNS` | Boot-blocking | **Warn-on-missing** | Project Setup (degraded without) |
| `ADMIN_UPNS` | Boot-blocking | **Warn-on-missing** | Project Setup (degraded without) |
| `NOTIFICATION_API_BASE_URL` | Boot-blocking | **Not boot-blocking** | Notifications (deferred) |
| `EMAIL_FROM_ADDRESS` | Boot-blocking | **Not boot-blocking** | Notifications (deferred) |
| `OPEX_MANAGER_UPN` | Boot-blocking | **Not boot-blocking** | Provisioning saga |
| `AZURE_CLIENT_SECRET` | Optional | Optional | Auth mode (secret-based dev) |
| `API_AUDIENCE` | Optional | Optional | Auth mode (split-identity) |
| `AzureSignalRConnectionString` | Optional | Optional | SignalR feature |
| `SHAREPOINT_HUB_SITE_ID` | Optional | Optional | Provisioning saga |
| `EMAIL_DELIVERY_API_KEY` | Optional | Optional | Notifications |
| `SHAREPOINT_APP_CATALOG_URL` | Optional | Optional | Provisioning saga |
| `HB_INTEL_SPFX_APP_ID` | Optional | Optional | Provisioning saga |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | Optional | Optional | Provisioning saga |
| `DEPT_BACKGROUND_ACCESS_*` | Optional | Optional | Provisioning saga |

---

## 5. Proposed Target-State Architecture

### Layer 1: Core Runtime Validation (blocks boot)

Settings required for the Azure Functions host to serve any HTTP traffic with auth:

```
AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_TABLE_ENDPOINT,
APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE
```

These 5 settings are truly infrastructure-level. Without them, no endpoint can function.

### Layer 2: Feature Scope Validation (blocks feature, not boot)

Validated on first use of the feature, not at startup.

**Project Setup scope**:
```
SHAREPOINT_TENANT_URL, SHAREPOINT_PROJECTS_SITE_URL
```
Validated when `SharePointProjectRequestsAdapter` is constructed (first Project Setup request).

**Provisioning saga scope**:
```
OPEX_MANAGER_UPN, SHAREPOINT_HUB_SITE_ID, SHAREPOINT_APP_CATALOG_URL,
HB_INTEL_SPFX_APP_ID, GRAPH_GROUP_PERMISSION_CONFIRMED
```
Already validated by `validateProvisioningPrerequisites()` at saga start.

**Notifications scope**:
```
NOTIFICATION_API_BASE_URL, EMAIL_FROM_ADDRESS, EMAIL_DELIVERY_API_KEY
```
Validated when notification service is first used.

### Layer 3: Warn-on-Missing (degraded mode)

Settings that have safe fallbacks but reduce functionality when absent:

```
CONTROLLER_UPNS, ADMIN_UPNS
```
Role resolution degrades to submitter-only. Log a warning at startup, don't block.

### Proposed Validation Flow

```
Cold start → Azure Functions host boots (no app code validation)
     │
First request → createServiceFactory()
     │
     ├─ assertAdapterModeValid()     ← existing, unchanged
     ├─ validateCoreConfig()         ← NEW: 5 core settings only
     ├─ warnMissingRoleConfig()      ← NEW: log warning for CONTROLLER_UPNS/ADMIN_UPNS
     └─ build services
          │
          ├─ SharePointProjectRequestsAdapter() ← validates SP URLs at construction
          ├─ RealTableStorageService()           ← validates TABLE_ENDPOINT at construction
          └─ ...other services validate their own deps
```

---

## 6. Proposed Config Keys / Mode Drivers

### Existing (retained)

| Key | Purpose |
|-----|---------|
| `HBC_ADAPTER_MODE` | `proxy` (real services) or `mock` (dev/test) |
| `API_AUDIENCE` | Explicit JWT audience (split-identity) |

### New (proposed for future, NOT for Prompt 02)

| Key | Purpose | Default |
|-----|---------|---------|
| `DEPLOYMENT_SCOPE` | `full` or `project-setup` | `full` |

For the immediate refactor (Prompt 02), `DEPLOYMENT_SCOPE` is NOT needed because the fix is simply demoting 3 settings from `requiredInProd: true` to `false`. The scope-based validation is a future enhancement for when multiple deployment targets exist.

---

## 7. Boot / Degraded / Disabled Behavior Model

| State | Trigger | Behavior |
|-------|---------|----------|
| **Boot blocked** | Core setting missing (`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `HBC_ADAPTER_MODE`) | `createServiceFactory()` throws, request returns 500 |
| **Degraded** | `CONTROLLER_UPNS` or `ADMIN_UPNS` missing | Warning logged, role resolution returns `submitter`/`system` only — no controller/admin transitions possible |
| **Feature unavailable** | SP URLs missing | `SharePointProjectRequestsAdapter` throws at construction — Project Setup endpoints return 500, but other endpoints work |
| **Feature deferred** | Provisioning settings missing | `validateProvisioningPrerequisites()` throws when saga starts — saga blocked, request lifecycle still works |
| **Healthy** | All settings present | Full functionality |

### `/api/health` Behavior

Currently returns 200 regardless of config state (doesn't call `createServiceFactory()`). This is correct — health probes should succeed for deployment validation. Feature health could be surfaced as optional metadata in the response body without affecting the HTTP status.

---

## 8. File-Level Implementation Plan for Prompt 02

### Minimal Change (Recommended)

The simplest correct fix: demote 3 settings from `requiredInProd: true` to `false` in `wave0-env-registry.ts`:

| Setting | Change |
|---------|--------|
| `NOTIFICATION_API_BASE_URL` | `requiredInProd: true` → `false` |
| `EMAIL_FROM_ADDRESS` | `requiredInProd: true` → `false` |
| `OPEX_MANAGER_UPN` | `requiredInProd: true` → `false` |

### Files to Modify

| File | Change |
|------|--------|
| `backend/functions/src/config/wave0-env-registry.ts` | Demote 3 settings |
| `backend/functions/src/config/wave0-env-registry.test.ts` | Update pinned required set (12 → 9) |
| `backend/functions/src/utils/validate-config.test.ts` | Update test that counts required vars |

### Optional Enhancement (if time allows)

Add a startup warning for missing `CONTROLLER_UPNS`/`ADMIN_UPNS` in `service-factory.ts`:
```typescript
if (!process.env.CONTROLLER_UPNS) {
  console.warn('[StartupWarning] CONTROLLER_UPNS not set — role-based state transitions disabled for controllers');
}
```

---

## 9. Test Requirements for Prompt 02/03

| Test | File | Purpose |
|------|------|---------|
| Pinned required set updated to 9 | `wave0-env-registry.test.ts` | Lock the new boot contract |
| Demoted settings don't block boot | `validate-config.test.ts` | Prove NOTIFICATION_API_BASE_URL, EMAIL_FROM_ADDRESS, OPEX_MANAGER_UPN are optional |
| Missing CONTROLLER_UPNS produces warning not crash | New or existing | Prove degraded mode |
| Health endpoint still works with missing optional settings | Smoke test | Prove /api/health is isolated |
