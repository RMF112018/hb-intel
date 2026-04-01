# Authorization-Model Gap Validation — Project Setup

> **Resolution:** The dual authorization model identified in this report has been resolved by the Gap 5 authorization convergence package (Phase 9, Gap 5, Prompts 1-01 through 1-13). `resolveRequestRole()` no longer reads `ADMIN_UPNS`/`CONTROLLER_UPNS` env vars — it uses JWT app-role claims and oid-based ownership. See `Gap-5_Acceptance-and-Closure.md` for the final closure evidence.

## Executive Summary

**Verdict: Partially confirmed — the mixed authorization model is real, but it is intentionally documented as a transitional release posture with full RBAC convergence explicitly deferred to post-launch.**

The Project Setup backend uses two distinct authorization mechanisms:

1. **Request-state transitions** — env-based UPN authorization via `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables, resolved at request time through `resolveRequestRole()` in `state-machine.ts`.
2. **Provisioning admin routes** — JWT-role-based authorization via `auth.claims.roles` checks for `Admin` or `HBIntelAdmin` app-role claims.

This is not accidental. Multiple prior reports explicitly document the dual model as intentional (P6-03, P3-07, P7 production alignment), with full RBAC convergence to JWT app-roles deferred to post-launch. The practical impact for initial release is low: both mechanisms are authenticated via JWT, and the UPN-based model provides operator-configurable role assignment without requiring Entra ID app-role reconfiguration.

---

## 1. Request-Lifecycle Authorization Evidence

### 1.1 `resolveRequestRole()` — env-based UPN authorization

**File:** `backend/functions/src/state-machine.ts` (lines 36-48)

```typescript
export function resolveRequestRole(
  callerUpn: string,
  request: IProjectSetupRequest,
): RequestRole {
  const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
  const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
  const normalizedCaller = callerUpn.toLowerCase();

  if (adminUpns.includes(normalizedCaller)) return 'admin';
  if (controllerUpns.includes(normalizedCaller)) return 'controller';
  if (request.submittedBy.toLowerCase() === normalizedCaller) return 'submitter';
  return 'system';
}
```

**Authorization model:** Reads `ADMIN_UPNS` and `CONTROLLER_UPNS` from environment variables at every call. Compares the caller's UPN (extracted from JWT claims by `withAuth()`) against comma-separated UPN lists. Falls back to `submitter` (if caller matches `request.submittedBy`) or `system`.

**Confirmed repo fact:** Request-role resolution is env-based UPN matching. No JWT `roles` claims are consulted.

### 1.2 `isAuthorizedTransition()` — role-gated transition rules

**File:** `backend/functions/src/state-machine.ts` (lines 69-84)

```typescript
export function isAuthorizedTransition(
  role: RequestRole,
  from: ProjectSetupRequestState,
  to: ProjectSetupRequestState,
): boolean {
  if (role === 'admin') return true;
  if (role === 'controller') {
    return CONTROLLER_TRANSITIONS.some(([f, t]) => f === from && t === to);
  }
  if (role === 'submitter') {
    return from === 'NeedsClarification' && to === 'UnderReview';
  }
  return role === 'system' && (from === 'ReadyToProvision' || from === 'Provisioning');
}
```

**Confirmed repo fact:** Transition authorization depends on the `RequestRole` returned by `resolveRequestRole()`, which is entirely env-based.

### 1.3 Handler usage in `projectRequests/index.ts`

**File:** `backend/functions/src/functions/projectRequests/index.ts`

**`advanceRequestState` handler (lines 282-283):**
```typescript
const role = resolveRequestRole(auth.claims.upn, existing);
if (!isAuthorizedTransition(role, existing.state, body.newState)) {
  return errorResponse(403, 'FORBIDDEN', ...);
}
```

**`listProjectSetupRequests` handler (lines 197-200):**
```typescript
const adminUpns = (process.env.ADMIN_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
const controllerUpns = (process.env.CONTROLLER_UPNS ?? '').split(',').map((u) => u.trim().toLowerCase()).filter(Boolean);
const callerUpn = auth.claims.upn.toLowerCase();
const isPrivileged = adminUpns.includes(callerUpn) || controllerUpns.includes(callerUpn);
```

**`getProjectSetupRequest` handler (line 238):**
```typescript
const role = resolveRequestRole(auth.claims.upn, existing);
if (role === 'system') {
  return errorResponse(403, 'FORBIDDEN', ...);
}
```

**Confirmed repo fact:** All request-lifecycle authorization in `projectRequests` uses env-based UPN resolution, never JWT `roles`.

---

## 2. Provisioning/Admin-Route Authorization Evidence

### 2.1 JWT-role-based admin checks

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

Six provisioning routes use JWT-role-based authorization with an identical guard pattern:

| Route | Line | Guard |
|-------|------|-------|
| `listFailedRuns` | 117 | `auth.claims.roles.some(role => role === 'Admin' \|\| role === 'HBIntelAdmin')` |
| `triggerTimerManually` | 135 | Same pattern |
| `listProvisioningRuns` | 230 | Same pattern |
| `archiveFailure` | 255 | Same pattern |
| `acknowledgeEscalation` | 286 | Same pattern |
| `forceStateTransition` | 321 | Same pattern |

**Example (lines 116-119):**
```typescript
// D-PH6-12 admin-only visibility: failures inbox is restricted to Admin/HBIntelAdmin.
if (!auth.claims.roles.some((role) => role === 'Admin' || role === 'HBIntelAdmin')) {
  return forbiddenResponse('Admin role required', requestId);
}
```

**Confirmed repo fact:** All provisioning admin routes use JWT `roles` claims, never env-based UPN lists.

### 2.2 Routes without admin checks

Four provisioning routes use `withAuth()` (JWT authentication) but no additional authorization:

| Route | Purpose | Authorization |
|-------|---------|--------------|
| `provisionProjectSite` | Start provisioning saga | JWT authn only — any authenticated user |
| `getProvisioningStatus` | Read status | JWT authn only |
| `retryProvisioning` | Retry failed saga | JWT authn only |
| `escalateProvisioning` | Escalate stuck saga | JWT authn only |

These routes are authenticated but not role-gated. The saga start is typically triggered programmatically after a state transition to `ReadyToProvision`.

**Confirmed repo fact:** Provisioning operational routes (start, status, retry, escalate) are authn-only; admin routes (list failures, archive, force state, list runs, ack escalation, manual timer) are JWT-role-gated.

---

## 3. JWT Claim / Auth Middleware Evidence

### 3.1 Token validation extracts `roles` as first-class claim

**File:** `backend/functions/src/middleware/validateToken.ts` (lines 254-261)

```typescript
return {
  upn,
  oid: claims.oid,
  roles: claims.roles ?? [],
  displayName: claims.name ?? upn,
  jobTitle: typeof claims.jobTitle === 'string' ? claims.jobTitle : undefined,
  tokenVersion: typeof claims.ver === 'string' ? claims.ver : undefined,
};
```

**Confirmed repo fact:** JWT `roles` are extracted and available as `auth.claims.roles` (string array) in every handler wrapped with `withAuth()`. The system is technically capable of using JWT-role-based authorization consistently across the entire surface.

### 3.2 Both UPN and roles are available at every handler

`withAuth()` passes `AuthContext` with both `claims.upn` and `claims.roles` to every handler. The choice between env-based UPN matching and JWT-role checking is made per-handler, not per-middleware.

---

## 4. Prior Intended-Posture Evidence

### 4.1 Phase 7 report — dual model documented as intentional

**File:** `docs/architecture/reviews/project-setup-phase-7-production-alignment-remediation-report.md`

> Line 151: "**Role assignment**: `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables, resolved at runtime via `resolveRequestRole()`"

> Line 152: "**Future follow-on**: Full RBAC convergence to JWT app-roles is post-PS-launch"

> Line 497: "| RBAC | JWT + `ADMIN_UPNS` / `CONTROLLER_UPNS` env vars | P6-03 dual-model intentional |"

> Line 718: "**Post-production follow-on** — DevOps alerting/dashboard deployment (9 observability assets), email transport (SendGrid), and full RBAC convergence to JWT app-roles (post-launch)"

### 4.2 Phase 1-5 gap report — dual RBAC documented as known gap

**File:** `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

> Line 586: "Dual RBAC mechanisms remain split between JWT roles and UPN environment lists; even the Phase 3 handoff lists this as remaining follow-on work in `phase-3/Phase-3_Handoff.md`."

> Line 599: "RBAC convergence (JWT roles vs UPN lists) is a future follow-on, not a Phase 3 blocker."

### 4.3 Phase 8 report — role config documented as startup-tier concern

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

> Line 536: "| Role config (`CONTROLLER_UPNS`, `ADMIN_UPNS`) | Service factory creation | Warning logged, degraded transitions | State transitions |"

### 4.4 Startup validation docs — degraded-mode behavior documented

**File:** `docs/architecture/reviews/startup-validation-refactor-audit-and-target-design.md`

> Line 73: "`CONTROLLER_UPNS` and `ADMIN_UPNS` are in a middle zone — they have empty-string fallbacks in `resolveRequestRole()` so the code won't crash, but without them the role-based authorization degrades to submitter-only (no controller/admin state transitions possible)."

---

## 5. Mixed-Model Analysis

### 5.1 The two authorization mechanisms

| Concern | Mechanism | Input Source | Where Applied |
|---------|-----------|-------------|---------------|
| Request-state transitions | Env-based UPN matching | `ADMIN_UPNS`, `CONTROLLER_UPNS` env vars + `request.submittedBy` | `state-machine.ts` → `projectRequests/index.ts` |
| Request list scoping | Env-based UPN matching | Same env vars | `projectRequests/index.ts` line 197-200 |
| Provisioning admin routes | JWT app-role check | `auth.claims.roles` (`Admin`, `HBIntelAdmin`) | `provisioningSaga/index.ts` (6 routes) |
| All routes | JWT authentication | Bearer token → `validateToken()` | `auth.ts` → `withAuth()` |

### 5.2 Why the model is hybrid

The two mechanisms serve different authorization domains:

- **Request lifecycle**: Roles are relative to a specific request (submitter, controller reviewing the request, admin overriding). The env-based model resolves the caller's operational role by matching their UPN against operator-configured lists.
- **Provisioning admin**: Roles are absolute (platform admin regardless of which request). The JWT-role model checks Entra ID app-role assignments directly.

Both models are authenticated via the same JWT pipeline. The difference is in authorization: request-state roles derive from env config; provisioning-admin roles derive from JWT claims.

### 5.3 Is this accidental or intentional?

**Intentional.** Multiple independent documents explicitly name the dual model:
- P6-03 is cited as the design decision for the dual model (Phase 7 line 497)
- Phase 3 handoff explicitly defers RBAC convergence
- Phase 7 lists full JWT app-role convergence as a post-launch follow-on
- Phase 1-5 gap report acknowledges the split as a known gap

### 5.4 Impact assessment

| Dimension | Assessment |
|-----------|-----------|
| **Runtime security** | Low risk — both paths are behind JWT authentication; authorization is applied at handler level |
| **Operational burden** | Medium — operators must configure both `ADMIN_UPNS`/`CONTROLLER_UPNS` env vars AND Entra ID app-roles for full coverage |
| **Auditability** | Low risk — both mechanisms log the caller's UPN and role; telemetry includes structured reason codes |
| **Future drift** | Medium — new routes must know which model to use; no compile-time enforcement of which model applies where |
| **Production readiness** | Acceptable for initial release — the model is documented, tested, and both degradation paths are safe |
| **Governance** | The dual model is a known technical debt item with explicit deferral decisions |

---

## 6. Verdict

**Partially confirmed — the mixed authorization model exists and is real, but is intentionally documented as a transitional release posture.**

| Claim | Status |
|-------|--------|
| Request-state transitions use env-based UPN authorization | **Confirmed** |
| Provisioning admin routes use JWT-role authorization | **Confirmed** |
| The backend uses two different authorization models | **Confirmed** |
| The mixed model is an accidental inconsistency | **Not confirmed** — it is explicitly documented as intentional (P6-03) |
| The mixed model is a production-readiness blocker | **Not confirmed** — prior reports explicitly classify RBAC convergence as post-launch |
| Current repo truth contradicts prior closure claims | **No** — prior reports accurately describe the dual model and defer convergence |

---

## 7. Why the Verdict Is Correct

1. **The dual model is real in repo truth.** `resolveRequestRole()` reads `ADMIN_UPNS` / `CONTROLLER_UPNS` env vars (state-machine.ts lines 40-41). Provisioning admin routes check `auth.claims.roles` (provisioningSaga/index.ts lines 117, 135, 230, 255, 286, 321). These are distinct mechanisms operating on different authorization inputs.

2. **The dual model is explicitly documented.** Phase 7 line 497 cites "P6-03 dual-model intentional." Phase 1-5 line 599 states "RBAC convergence (JWT roles vs UPN lists) is a future follow-on." Phase 7 line 718 classifies "full RBAC convergence to JWT app-roles" as a post-production follow-on.

3. **Both paths are authenticated.** Every route uses `withAuth()`, which validates the JWT via `validateToken()`. The dual model is about authorization, not authentication. Neither path allows unauthenticated access.

4. **The env-based model degrades safely.** When `ADMIN_UPNS` / `CONTROLLER_UPNS` are empty, `resolveRequestRole()` returns `submitter` or `system`, limiting transitions to submitter-resubmit only. The service factory logs startup warnings (Phase 8 line 536). The system does not crash or silently grant unauthorized access.

5. **No prior report claims RBAC is converged.** Every report that mentions the authorization model explicitly notes the dual nature and defers convergence. The finding is not a contradiction of prior claims — it is a restatement of a known, accepted, and documented debt item.

---

## 8. Remediation Targets

The following changes would converge the authorization model. **Not implemented in this validation.**

### 8.1 Migrate request-state authorization to JWT app-roles

Replace `resolveRequestRole()` env-based UPN matching with JWT `roles` claim checks:

| Current env var | Target JWT app-role |
|----------------|-------------------|
| `ADMIN_UPNS` | `Admin` or `HBIntelAdmin` |
| `CONTROLLER_UPNS` | `Controller` or `HBIntelController` |
| `request.submittedBy` match | Keep as ownership check (not a role) |

**Files to change:**
- `backend/functions/src/state-machine.ts` — rewrite `resolveRequestRole()` to use `claims.roles` instead of env vars
- `backend/functions/src/functions/projectRequests/index.ts` — update `listProjectSetupRequests` privilege check (lines 197-200)
- Remove `ADMIN_UPNS` and `CONTROLLER_UPNS` from startup validation and degraded-mode warnings

### 8.2 Prerequisites

- Entra ID app registration must define `Controller` (or equivalent) app-role
- Users must be assigned to the appropriate app-role in Entra ID
- SPFx token acquisition must include app-role claims (requires correct `webApiPermissionRequests` scope)

### 8.3 Scope

This is a focused refactor of `resolveRequestRole()` and its call sites. The provisioning admin routes already use the target model and would not change.

---

## 9. Unresolved Questions

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | Does the Entra ID app registration currently define a `Controller` app-role? | If not, the migration requires app-registration changes before code changes |
| 2 | Do SPFx-acquired tokens include app-role claims? | If `webApiPermissionRequests` doesn't request role-capable scopes, JWT `roles` may be empty even for assigned users |
| 3 | Should submitter-ownership remain a separate check? | Submitter identity is request-relative, not an app-role. It may need to stay as a data-level ownership check rather than a role claim |
| 4 | Is there a migration path that preserves backward compatibility? | Operators may need time to assign Entra ID roles before env-var-based authorization is removed |

---

## Appendix: Route Authorization Inventory

### Request lifecycle routes (env-based UPN authorization)

| Route | Method | Authorization Check |
|-------|--------|-------------------|
| `submitProjectSetupRequest` | POST | `withAuth()` only — any authenticated user |
| `listProjectSetupRequests` | GET | Env-based UPN check for privilege scoping |
| `getProjectSetupRequest` | GET | `resolveRequestRole()` — excludes `system` role |
| `advanceRequestState` | PATCH | `resolveRequestRole()` + `isAuthorizedTransition()` |

### Provisioning routes (JWT-role authorization)

| Route | Method | Authorization Check |
|-------|--------|-------------------|
| `provisionProjectSite` | POST | `withAuth()` only |
| `getProvisioningStatus` | GET | `withAuth()` only |
| `retryProvisioning` | POST | `withAuth()` only |
| `escalateProvisioning` | POST | `withAuth()` only |
| `listFailedRuns` | GET | JWT `roles` includes `Admin` or `HBIntelAdmin` |
| `triggerTimerManually` | POST | JWT `roles` + production environment block |
| `listProvisioningRuns` | GET | JWT `roles` includes `Admin` or `HBIntelAdmin` |
| `archiveFailure` | POST | JWT `roles` includes `Admin` or `HBIntelAdmin` |
| `acknowledgeEscalation` | POST | JWT `roles` includes `Admin` or `HBIntelAdmin` |
| `forceStateTransition` | POST | JWT `roles` includes `Admin` or `HBIntelAdmin` |

## Appendix: Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| `resolveRequestRole()` env-based logic | `backend/functions/src/state-machine.ts` | 36-48 | Confirmed repo fact |
| `isAuthorizedTransition()` role-gated rules | `backend/functions/src/state-machine.ts` | 69-84 | Confirmed repo fact |
| `advanceRequestState` uses `resolveRequestRole` | `backend/functions/src/functions/projectRequests/index.ts` | 282-283 | Confirmed route-level authz fact |
| `listProjectSetupRequests` env-based privilege check | `backend/functions/src/functions/projectRequests/index.ts` | 197-200 | Confirmed route-level authz fact |
| 6 provisioning admin routes use JWT `roles` | `backend/functions/src/functions/provisioningSaga/index.ts` | 117, 135, 230, 255, 286, 321 | Confirmed route-level authz fact |
| JWT `roles` extracted by `validateToken()` | `backend/functions/src/middleware/validateToken.ts` | 257 | Confirmed repo fact |
| "P6-03 dual-model intentional" | Phase 7 report | 497 | Prior report claim |
| "Full RBAC convergence to JWT app-roles is post-PS-launch" | Phase 7 report | 152 | Prior report claim |
| "RBAC convergence ... is a future follow-on, not a Phase 3 blocker" | Phase 1-5 report | 599 | Prior report claim |
| "Dual RBAC mechanisms remain split between JWT roles and UPN environment lists" | Phase 1-5 report | 586 | Prior report claim |
