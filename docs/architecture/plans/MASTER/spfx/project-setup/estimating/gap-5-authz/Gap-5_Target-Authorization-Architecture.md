# Gap 5 Target Authorization Architecture

> **Created:** 2026-04-01 (P9-G5-02)
> **Status:** Frozen
> **Scope:** Define the complete target authorization architecture for Project Setup — layered authorization model, claim requirements, ownership semantics, and workload authorization

## Executive Summary

The target architecture replaces the current dual authorization model with a five-layer claim-based authorization stack. Each layer has a single responsibility and a clear position in the request pipeline. Token validation (Layer 1) and delegated scope enforcement (Layer 2) apply to all interactive requests. Business-role authorization (Layer 3) gates privileged operations using JWT app-role claims. Resource ownership authorization (Layer 4) uses stable `oid`-based identity for request-scoped access. Workload authorization (Layer 5) provides app-only tokens for timer and internal execution paths. No layer depends on environment-variable UPN lists for authorization decisions.

---

## 1. Authorization Layers

### Layer 1 — Token Validation (Authentication)

**Responsibility:** Verify the caller possesses a valid Microsoft Entra ID JWT.

**Current implementation:** `validateToken()` in `backend/functions/src/middleware/validateToken.ts` (lines 184–261). Validates signature against JWKS, issuer, audience, and extracts `IValidatedClaims`.

**Target:** No changes required. The existing implementation is correct and already extracts all claims needed by downstream layers (`upn`, `oid`, `roles[]`).

**Applies to:** All HTTP routes wrapped with `withAuth()`.

### Layer 2 — Delegated Scope Enforcement

**Responsibility:** Verify the calling application has the correct delegated permission to act on behalf of the user.

**Current implementation:** Not explicitly enforced at the API layer. The SPFx permission declaration requests `access_as_user` (declared in `apps/estimating/config/package-solution.json`), and the backend validates the token audience. However, no handler explicitly checks the `scp` (scope) claim.

**Target:** Add explicit scope validation for interactive (delegated) requests. The API should verify that the token's `scp` claim includes `access_as_user` for all delegated calls. This prevents a token acquired for a different scope from being used against Project Setup endpoints.

**Implementation note:** Scope enforcement should distinguish between delegated tokens (which carry `scp`) and app-only tokens (which carry `roles` but no `scp`). App-only tokens from managed identities will not have a `scp` claim — they are authorized at Layer 5 instead.

**Applies to:** All interactive HTTP routes (SPFx/browser callers).

### Layer 3 — Business-Role Authorization

**Responsibility:** Gate privileged operations based on the caller's Entra ID app-role assignments.

**Current implementation (provisioning admin routes):** Inline `auth.claims.roles.some(role => role === 'Admin' || role === 'HBIntelAdmin')` checks in `provisioningSaga/index.ts` (lines 117, 135, 230, 255, 286, 321). This is the target pattern.

**Current implementation (request lifecycle routes):** `resolveRequestRole()` in `state-machine.ts` (lines 36–48) reads `ADMIN_UPNS`/`CONTROLLER_UPNS` from environment variables. This is the pattern to be replaced.

**Target:** All business-role authorization uses `auth.claims.roles` exclusively:

| App Role | Purpose | Replaces |
|----------|---------|----------|
| `Admin` or `HBIntelAdmin` | Full administrative access — any state transition, all-request visibility, provisioning admin operations | `ADMIN_UPNS` env var |
| `Controller` or `HBIntelController` | Financial oversight — controller-level state transitions, all-request visibility | `CONTROLLER_UPNS` env var |
| `BreakGlass` | Emergency override — audited, time-bounded, equivalent to admin for state transitions | (new — not present today) |
| `Automation` | Workload/app-only — timer execution, internal saga operations | (new — managed identity assignment) |

**Role resolution rewrite:**

```
resolveRequestRole(claims: IValidatedClaims, request: IProjectSetupRequest): RequestRole
  if claims.roles includes Admin or HBIntelAdmin → 'admin'
  if claims.roles includes Controller or HBIntelController → 'controller'
  if request.submittedByOid === claims.oid → 'submitter'
  else → 'system'
```

No environment variable is consulted. The transition matrix (`isAuthorizedTransition()`) is unchanged — only the role resolution input changes.

**Applies to:** All routes that gate access beyond simple authentication.

### Layer 4 — Resource Ownership Authorization

**Responsibility:** Determine whether the caller has a relationship to a specific resource (request, provisioning run) that grants access.

**Current implementation:** `resolveRequestRole()` compares `request.submittedBy.toLowerCase()` against `callerUpn.toLowerCase()` (state-machine.ts line 46). This is UPN-based and mutable.

**Target:** Ownership checks use `oid`-based comparison:

```
isOwner = request.submittedByOid === auth.claims.oid
```

**Fallback for pre-migration records:**

```
if request.submittedByOid exists → compare oid
else → compare UPN (legacy fallback, logged for migration tracking)
```

**Ownership semantics:**

| Ownership Type | Field | Identity Basis | Purpose |
|---------------|-------|---------------|---------|
| Request submitter | `submittedByOid` (new) + `submittedBy` (retained for display) | `oid` | View own request, resubmit from NeedsClarification |
| Provisioning trigger | `triggeredByOid` (new) + `triggeredBy` (retained for display) | `oid` | Audit trail |
| Escalation actor | `escalatedBy` (UPN retained) | UPN | Display/notification only — not an authorization input |

**Person-assignment fields** (`projectManagerUpn`, `groupMembers[]`, `groupLeaders[]`, etc.) remain UPN-based. These are SharePoint group membership inputs consumed by the provisioning saga, not authorization inputs for API access control.

**Applies to:** `getProjectSetupRequest`, `advanceRequestState`, `listProjectSetupRequests` (scoping).

### Layer 5 — Workload / App-Only Authorization

**Responsibility:** Authorize non-interactive execution paths (timers, internal saga operations) using app-only tokens with dedicated app-roles.

**Current implementation:** Timer functions (`timerFullSpec`, `cleanupIdempotency`) execute within the Azure Functions host without any authentication or authorization. They are triggered by the platform scheduler.

**Target:** Timer-triggered functions that call back into the API (e.g., `triggerTimerManually`) or perform privileged operations should use app-only tokens from the Function App's managed identity, with an `Automation` app-role assigned in Entra.

**App-only token characteristics:**
- No `scp` claim (not delegated)
- No `upn` / `oid` (no user context)
- `roles` claim contains assigned app-roles (e.g., `['Automation']`)
- `iss` and `aud` match the same validation config
- `idtyp` claim is `app` (distinguishes from delegated tokens)

**Implementation note:** Timer functions that run purely within the Azure Functions process (like the current `timerFullSpec` and `cleanupIdempotency`) do not make HTTP calls to the API — they invoke saga logic directly. These do not need Bearer tokens. Workload authorization applies when an internal process calls the API over HTTP or when the authorization layer needs to identify the caller as a trusted automation identity.

**Applies to:** `triggerTimerManually` (already JWT-role-gated), future internal API calls from automation.

---

## 2. Claim Requirements by Token Type

### Delegated Token (Interactive / SPFx)

| Claim | Required | Purpose |
|-------|----------|---------|
| `aud` | Yes | Must match `API_AUDIENCE` — audience validation |
| `iss` | Yes | Must match accepted Entra issuers — issuer validation |
| `upn` or `preferred_username` | Yes | Display, notification, legacy fallback |
| `oid` | Yes | Stable identity for ownership and audit |
| `roles` | Conditional | Present when user has app-role assignments; empty array otherwise |
| `scp` | Yes (target) | Must include `access_as_user` for delegated authorization |
| `name` | Optional | Display name |
| `ver` | Optional | Token version for diagnostics |

### App-Only Token (Managed Identity / Automation)

| Claim | Required | Purpose |
|-------|----------|---------|
| `aud` | Yes | Must match `API_AUDIENCE` |
| `iss` | Yes | Must match accepted Entra issuers |
| `roles` | Yes | Must include `Automation` (or appropriate workload role) |
| `idtyp` | Expected | Value `app` distinguishes from delegated tokens |
| `oid` | Yes | Object ID of the service principal (not a user) |
| `upn` | Absent | App-only tokens have no user context |

---

## 3. Authorization Decision Flow

```
Request arrives
  │
  ├─ Layer 1: validateToken()
  │   ├─ Valid → extract IValidatedClaims
  │   └─ Invalid → 401 Unauthorized
  │
  ├─ Layer 2: checkDelegatedScope() [new]
  │   ├─ Has scp claim with access_as_user → proceed as delegated
  │   ├─ Has idtyp=app (no scp) → proceed as app-only (skip to Layer 5)
  │   └─ Neither → 403 Forbidden (scope mismatch)
  │
  ├─ Layer 3: resolveBusinessRole()
  │   ├─ claims.roles includes Admin/HBIntelAdmin → role = admin
  │   ├─ claims.roles includes Controller/HBIntelController → role = controller
  │   └─ No privileged role → role = none (may still be owner)
  │
  ├─ Layer 4: checkResourceOwnership() [for resource-scoped routes]
  │   ├─ request.submittedByOid === claims.oid → role = submitter
  │   ├─ Fallback: request.submittedBy === claims.upn → role = submitter (legacy)
  │   └─ No ownership → role = system (denied for user-facing routes)
  │
  └─ Layer 5: checkWorkloadRole() [for app-only tokens]
      ├─ claims.roles includes Automation → authorized
      └─ No workload role → 403 Forbidden
```

**Layer composition per route type:**

| Route Type | L1 | L2 | L3 | L4 | L5 |
|-----------|----|----|----|----|-----|
| Open (any authenticated user) | ✓ | ✓ | — | — | — |
| Privileged (admin/controller) | ✓ | ✓ | ✓ | — | — |
| Owner-scoped (submitter access) | ✓ | ✓ | ✓* | ✓ | — |
| Workload (timer/automation) | ✓ | — | — | — | ✓ |

*Layer 3 checked first; if admin/controller, Layer 4 skipped (already authorized).

---

## 4. Notification Recipient Resolution

### Problem

Notification dispatch (`notification-dispatch.ts:27–56`) currently resolves admin and controller recipients by reading `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables. This is a **directory lookup** (who are the admins?), not an **authorization check** (is this caller an admin?). JWT app-role claims solve the authorization problem but do not provide a recipient directory.

### Design Decision

**Chosen approach:** Retain `ADMIN_UPNS` and `CONTROLLER_UPNS` exclusively for notification recipient resolution. Reclassify the env vars from "authorization input" to "notification routing configuration."

**Rationale:**
1. Graph API queries to resolve app-role members require `AppRoleAssignment.ReadWrite.All` or `Directory.Read.All` — a significant permission escalation for the Function App managed identity.
2. The notification dispatch path is fire-and-forget and latency-tolerant — there is no authorization decision depending on correctness.
3. The env vars already exist, are operator-configured, and have safe empty fallbacks.
4. Decoupling notification routing from authorization removes the security concern (env vars no longer gate access) while preserving operational simplicity.

**Migration path:**
1. During Gap 5 convergence: remove env-var references from all authorization code paths.
2. Retain env vars in notification dispatch with updated documentation clarifying they are notification-only.
3. Update env registry descriptions and health endpoint to reflect reclassification.
4. Post-convergence follow-on: evaluate Graph API-based recipient resolution if operational burden of maintaining parallel UPN lists becomes excessive.

---

## 5. Submitter Ownership — `oid` vs UPN

### Design Decision

**Chosen approach:** Migrate ownership checks to `oid`-based comparison with UPN fallback for pre-migration records.

**Rationale:**
1. UPN is mutable — a user rename or domain change breaks ownership checks silently.
2. `oid` is immutable within a tenant and already extracted as a required claim.
3. Dual-write (`submittedByOid` + `submittedBy`) preserves backward compatibility during migration.
4. UPN is retained for display, notification, and SharePoint group operations where UPN is required by the platform.

**Backfill strategy:** Lazy backfill on next access. When a record is accessed and `submittedByOid` is absent, the ownership check falls back to UPN comparison and logs a migration-tracking telemetry event. A bulk backfill script is not required for correctness but may be desirable to eliminate fallback noise.

---

## 6. `Controller` App-Role Naming

### Design Decision

**Chosen approach:** Use the pair `Controller` / `HBIntelController` (same pattern as existing `Admin` / `HBIntelAdmin`).

**Rationale:**
1. Consistency with existing app-role naming convention in the Entra app registration.
2. Code already checks for both `Admin` and `HBIntelAdmin` in provisioning admin routes — the pattern extends naturally.
3. Both names accepted at code level to accommodate tenant-specific naming during rollout.

**Formal role set for Prompt 1-03:**

| App Role Value | Display Name | Type | Purpose |
|---------------|-------------|------|---------|
| `Admin` | Admin | User | Full administrative access |
| `HBIntelAdmin` | HB Intel Admin | User | Alias for Admin (tenant-specific) |
| `Controller` | Controller | User | Financial oversight / controller transitions |
| `HBIntelController` | HB Intel Controller | User | Alias for Controller (tenant-specific) |
| `BreakGlass` | Break Glass | User | Emergency audited override |
| `Automation` | Automation | Application | Workload/app-only execution |

---

## 7. Evidence Classification

### Confirmed Repo Facts
- `validateToken()` extracts `upn`, `oid`, `roles[]` as structured claims (validateToken.ts:144–164)
- `withAuth()` passes full `AuthContext` including `claims.roles` to every handler (auth.ts:49–95)
- Provisioning admin routes already use `auth.claims.roles` for authorization (provisioningSaga/index.ts:117,135,230,255,286,321)
- Request lifecycle routes use `resolveRequestRole()` with env-based UPN matching (state-machine.ts:36–48)
- `isAuthorizedTransition()` transition matrix is role-based, not identity-based (state-machine.ts:69–84)
- Notification dispatch reads `CONTROLLER_UPNS`/`ADMIN_UPNS` for recipient resolution (notification-dispatch.ts:27–56)
- No `scp` claim enforcement exists in any handler today
- Timer functions execute without authentication (internal platform trigger)

### Confirmed Microsoft-Guidance Facts
- Delegated tokens carry `scp` claim; app-only tokens carry `roles` and `idtyp=app`
- `oid` is immutable within a tenant; `upn` is mutable
- App roles are the recommended mechanism for workload authorization
- APIs should enforce delegated scope to prevent cross-scope token reuse

### Design Decisions (Frozen in This Document)
- Notification recipient resolution retains env vars, reclassified as notification-only configuration
- Submitter ownership migrates to `oid` with UPN fallback for pre-migration records
- Lazy backfill strategy for existing records (no bulk migration required)
- `Controller`/`HBIntelController` naming follows existing `Admin`/`HBIntelAdmin` pattern
- `BreakGlass` and `Automation` app-roles are new additions to the role set
- Delegated scope enforcement (`access_as_user`) is added as a new authorization layer
