# Gap 5 Workload and Break-Glass Model

> **Created:** 2026-04-01 (P9-G5-08)
> **Status:** Implemented
> **Scope:** Workload/app-only authorization model and break-glass override mechanism for Project Setup

## Executive Summary

Project Setup has two workload execution paths: platform-triggered timers (`timerFullSpec`, `cleanupIdempotency`) that execute in-process without HTTP authentication, and the `triggerTimerManually` HTTP route for admin-initiated timer execution. Both paths are now explicitly classified and documented. Timer functions use host-level trust (no Bearer token required). The manual trigger route uses delegated admin authorization (L2 scope + L3 admin role). A `requireWorkloadRole()` policy helper is available for future HTTP-based workload paths. The `BreakGlass` app-role is defined for emergency audited override.

---

## 1. Execution Path Classification

### 1.1 Internal Timer Functions (Host-Level Trust)

| Function | Schedule | Auth Model | Identity Context |
|----------|----------|-----------|-----------------|
| `timerFullSpec` | `0 0 1 * * *` (1 AM ET) | Host-level trust — no HTTP, no Bearer token | None — `InvocationContext` from Azure Functions host |
| `cleanupIdempotency` | `0 0 3 * * *` (3 AM ET) | Host-level trust — no HTTP, no Bearer token | None — `InvocationContext` from Azure Functions host |

**Why no auth:** These functions are triggered by the Azure Functions timer infrastructure directly within the host process. They call service layer code via function invocations, not HTTP requests. They do not pass through `withAuth()`, do not acquire or validate Bearer tokens, and do not have user identity claims.

**User identity independence confirmed:**
- `runTimerFullSpec()` (`timerFullSpec/handler.ts`) takes `(context: InvocationContext, timer: ITimerExecutionInput)` — no auth claims
- `cleanupIdempotency` handler takes `(_timer: Timer, context: InvocationContext)` — no auth claims
- Neither function reads `ADMIN_UPNS`, `CONTROLLER_UPNS`, or any user identity field
- Both use `createProjectSetupServiceFactory()` for data access — same service layer as HTTP handlers but without auth context

### 1.2 Manual Timer Trigger (Delegated Admin)

| Route | Method | Surface Type | Policy Stack |
|-------|--------|-------------|-------------|
| `triggerTimerManually` | POST `/admin/trigger-timer` | Delegated-Privileged | L1 (token validation) → L2 (`requireDelegatedScope`) → L3 (`requireAdmin`) + production env guard |

**Current authorization stack:**
1. `withAuth()` — validates Bearer token against Entra ID JWKS
2. `requireDelegatedScope(auth.claims, requestId)` — enforces `access_as_user` scope (P9-G5-07)
3. `requireAdmin(auth.claims, requestId)` — enforces `Admin` or `HBIntelAdmin` app-role
4. Production safety guard — `AZURE_FUNCTIONS_ENVIRONMENT === 'Production'` → 403

**Note:** This route invokes the same `runTimerFullSpec()` handler as the platform timer. It provides admin users a manual trigger for non-production debugging.

### 1.3 Future Workload HTTP Path (Not Yet Implemented)

If a future refactoring routes timer work through the HTTP API (e.g., an Azure DevOps pipeline or external scheduler calling the API), the path would use:

1. `withAuth()` — validates app-only Bearer token
2. `requireWorkloadRole(auth.claims, requestId)` — enforces `isAppOnlyToken()` + `Automation` app-role

The `requireWorkloadRole()` helper is implemented in `middleware/authorization.ts` and tested. It is available for composition but not currently wired to any route.

---

## 2. App-Only Token Support

### 2.1 Token Validation

`validateToken()` in `middleware/validateToken.ts` supports app-only tokens as of P9-G5-04:
- `upn` is not required when `idtyp === 'app'` (app-only tokens have no user context)
- `oid` is always required (service principal object ID for app-only tokens)
- `roles` is extracted as `string[]` (must include `Automation` for workload authorization)
- `scp` and `idtyp` are extracted as optional fields for token-type differentiation

### 2.2 Token-Type Detection

`isAppOnlyToken()` in `middleware/authorization.ts`:
- Primary signal: `claims.idtyp === 'app'`
- Fallback: absence of both `scp` and `upn`

### 2.3 Delegated Scope Bypass

`requireDelegatedScope()` automatically bypasses the scope check for app-only tokens (`isAppOnlyToken(claims) → return null`). This ensures that workload tokens are not rejected by the delegated scope layer — they are authorized at the workload layer instead.

---

## 3. Break-Glass Model

### 3.1 Purpose

The `BreakGlass` app-role provides emergency override access equivalent to admin privileges, with mandatory audit telemetry on every use. It is designed for incident response scenarios where normal admin access is insufficient or unavailable.

### 3.2 Authorization Behavior

In `resolveRequestRole()` (`state-machine.ts`):
```
if (isAdmin(claims) || isBreakGlass(claims)) return 'admin';
```

`BreakGlass` resolves to the `admin` RequestRole, granting full state-transition authority. The distinction between `BreakGlass` and `Admin` is at the telemetry/audit layer (Prompt 1-10), not at the authorization decision layer.

### 3.3 Assignment Model

| Role | Assignment Target | Lifecycle |
|------|------------------|-----------|
| `BreakGlass` | Named users or dedicated break-glass Entra security group | Time-bounded via PIM or manual group membership; audited |

### 3.4 Audit Requirements (Deferred to Prompt 1-10)

Every operation performed under the `BreakGlass` role must emit a distinct telemetry event including:
- The fact that break-glass was used
- The caller's `oid` and `upn`
- The operation performed
- Timestamp

This telemetry is implemented in Prompt 1-10 (Telemetry, Break-Glass, and Auditability).

---

## 4. Workload Role Catalog

| App Role | Type | Purpose | Current Routes |
|----------|------|---------|---------------|
| `Automation` | Application (service principals only) | Workload/app-only execution for managed identities | None (available via `requireWorkloadRole()` for future use) |
| `BreakGlass` | User | Emergency audited override (resolves to admin) | All request lifecycle and provisioning admin routes (via `resolveRequestRole()`) |

---

## 5. Environment Prerequisites

| Prerequisite | Owner | Status |
|-------------|-------|--------|
| `Automation` app-role created in Entra app registration | IT / Entra admin | External — documented in Entra contract (P9-G5-03) |
| Function App managed identity assigned `Automation` role | IT / Azure admin | External — required when workload HTTP paths are activated |
| `BreakGlass` app-role created in Entra app registration | IT / Entra admin | External — documented in Entra contract (P9-G5-03) |
| Break-glass group created and time-bounded via PIM | IT / Security | External — operational setup |

---

## 6. Evidence Classification

### Confirmed Repo Facts
- `timerFullSpec` and `cleanupIdempotency` are Azure Functions timer triggers with no HTTP auth path (`timerFullSpec/index.ts`, `cleanupIdempotency/index.ts`)
- `runTimerFullSpec()` has no user identity dependencies (`timerFullSpec/handler.ts` — no auth claims parameter)
- `triggerTimerManually` is gated by `requireDelegatedScope()` + `requireAdmin()` + production env guard (`provisioningSaga/index.ts`)
- `requireWorkloadRole()` is implemented and tested in `authorization.ts`
- `isAppOnlyToken()` is implemented and tested in `authorization.ts`
- `validateToken()` supports app-only tokens (P9-G5-04)
- `isBreakGlass()` check is integrated into `resolveRequestRole()` (P9-G5-06)

### Design Decisions
- Timer functions remain at host-level trust (no change) — they don't use HTTP
- `triggerTimerManually` remains delegated admin only (not workload) — it's a debugging tool
- `requireWorkloadRole()` is available but not wired to routes — no current HTTP workload paths exist
- `BreakGlass` resolves to admin role equivalent — audit differentiation deferred to Prompt 1-10
