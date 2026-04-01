# Gap 5 Entra App-Role and Scope Contract

> **Created:** 2026-04-01 (P9-G5-03)
> **Status:** Frozen
> **Scope:** Precise Entra app registration contract for the Project Setup API — delegated scopes, app roles, assignment model, token differentiation, and environment prerequisites

## Executive Summary

This document defines the identity contract between the HB Intel API app registration in Microsoft Entra ID and the Project Setup backend. It specifies the exact delegated scope for SPFx/browser callers, the complete app-role catalog for privileged users and workloads, the assignment model for each role, and the token-type differentiation rules the API must implement. It also separates repo-owned implementation work from environment-executed setup steps.

The contract is designed so that Prompts 1-04 through 1-11 can implement validation, policies, and runbooks without re-interpreting the identity model.

---

## 1. API App Registration Identity

The HB Intel backend API is protected by a single Entra ID app registration per environment.

| Property | Value | Source |
|----------|-------|--------|
| Display Name | `hb-intel-api-{environment}` (e.g., `hb-intel-api-staging`) | IT-Department-Setup-Guide naming convention; confirmed in Gap 1 (P9-G1-01) |
| Application ID URI | `api://{app-registration-client-id}` | Standard Entra convention; used as `API_AUDIENCE` backend env var |
| Supported Account Types | Single tenant (this organization only) | Microsoft guidance for line-of-business APIs |

**Confirmed repo fact:** The backend validates tokens against `API_AUDIENCE` env var via `resolveApiAudience()` in `validateToken.ts:74–94`. No implicit fallback in production — explicit config required.

---

## 2. Delegated Scope Contract

### 2.1 Exposed Scope

| Scope Value | Display Name | Who Can Consent | Description |
|-------------|-------------|----------------|-------------|
| `access_as_user` | Access HB Intel API as signed-in user | Admins and users | Allows SPFx and browser clients to call the Project Setup API on behalf of the signed-in user |

**Confirmed repo fact:** The SPFx package already declares this scope in `apps/estimating/config/package-solution.json` (lines 10–15):

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

### 2.2 Scope Enforcement (Repo-Owned — Prompt 1-04)

The API does **not** currently validate the `scp` claim. The target architecture (P9-G5-02) requires explicit scope enforcement:

- **Delegated tokens** must include `scp: "access_as_user"` — verified at Layer 2 of the authorization stack
- **App-only tokens** do not carry `scp` — they are authorized via app-roles at Layer 5
- The API distinguishes token type by checking for `scp` (delegated) vs `idtyp: "app"` (app-only)

**Implementation note for Prompt 1-04:** The `scp` claim is a space-delimited string in Entra v2 tokens (e.g., `"access_as_user"`) and may appear as an array in some configurations. The scope check helper must handle both formats.

### 2.3 SPFx Token Acquisition Chain

```
SharePoint page
  → SPFx shell webpart (ShellWebPart.ts:125-127)
    → injects apiAudience via __API_AUDIENCE__ build constant
  → mount.tsx (lines 59-62)
    → createSpfxApiTokenProvider(spfxContext, apiAudience)
  → SPFx aadTokenProviderFactory
    → acquires delegated token with audience = apiAudience, scope = access_as_user
  → API call with Bearer token
    → backend validateToken() validates aud against API_AUDIENCE
```

**Frontend/backend audience contract:**
- Frontend: `apiAudience` from shell config or `VITE_API_AUDIENCE` → resolved in `runtimeConfig.ts:161–174`
- Backend: `API_AUDIENCE` env var → resolved in `validateToken.ts:74–94`
- Both must resolve to the same `api://{app-registration-client-id}` URI

**Confirmed repo fact:** This chain is fully wired end-to-end (Gap 2 disproven, P9-G2-01).

---

## 3. App-Role Catalog

### 3.1 User-Assignable Roles

| App Role Value | Display Name | Allowed Member Types | Purpose | Replaces |
|---------------|-------------|---------------------|---------|----------|
| `Admin` | Admin | Users/Groups | Full administrative access — any state transition, all-request visibility, provisioning admin operations, break-glass equivalent | `ADMIN_UPNS` env var (authorization use) |
| `HBIntelAdmin` | HB Intel Admin | Users/Groups | Tenant-specific alias for Admin — both values accepted at code level | `ADMIN_UPNS` env var (authorization use) |
| `Controller` | Controller | Users/Groups | Financial oversight — controller-level state transitions, all-request visibility | `CONTROLLER_UPNS` env var (authorization use) |
| `HBIntelController` | HB Intel Controller | Users/Groups | Tenant-specific alias for Controller — both values accepted at code level | `CONTROLLER_UPNS` env var (authorization use) |
| `BreakGlass` | Break Glass | Users/Groups | Emergency audited override — equivalent to Admin for authorization, mandatory audit telemetry on every use | (new) |

### 3.2 Application-Assignable Roles

| App Role Value | Display Name | Allowed Member Types | Purpose |
|---------------|-------------|---------------------|---------|
| `Automation` | Automation | Applications | Workload/app-only execution — timer functions, internal saga operations, managed identity callers |

### 3.3 Role Precedence in Code

When resolving a caller's business role, the code checks in this order:

1. `Admin` or `HBIntelAdmin` → role = `admin`
2. `Controller` or `HBIntelController` → role = `controller`
3. `BreakGlass` → role = `admin` (with mandatory audit telemetry)
4. `Automation` → workload authorization (app-only path only)
5. None of the above → no privileged role (may still be owner at Layer 4)

**Design note:** A user may hold multiple app-roles. The highest-privilege match wins. `BreakGlass` resolves to admin-equivalent but always emits an audit event regardless of the operation outcome.

### 3.4 Role Assignment Guidance

| Role | Assignment Target | Method | Lifecycle |
|------|------------------|--------|-----------|
| `Admin` / `HBIntelAdmin` | Named users or Entra security group | Entra ID → Enterprise Application → Users and groups | Persistent; managed by IT |
| `Controller` / `HBIntelController` | Named users or Entra security group | Same as above | Persistent; managed by IT |
| `BreakGlass` | Named users or dedicated break-glass group | Same as above; group membership time-bounded via PIM or manual | Time-bounded; audited |
| `Automation` | Function App managed identity service principal | Entra ID → App Registration → App Roles → Assign to service principal | Persistent; infrastructure-as-code |

**Microsoft-guidance fact:** App roles assigned to users appear in the `roles` claim of delegated tokens. App roles assigned to service principals appear in the `roles` claim of app-only tokens. Both use the same claim name and the same string array format.

---

## 4. Token-Type Differentiation

The API must distinguish delegated tokens (interactive users) from app-only tokens (managed identities / automation).

### 4.1 Differentiation Strategy

| Signal | Delegated Token | App-Only Token |
|--------|----------------|----------------|
| `scp` claim | Present (e.g., `"access_as_user"`) | Absent |
| `idtyp` claim | `"user"` or absent | `"app"` |
| `upn` / `preferred_username` | Present (user identity) | Absent |
| `oid` | User's object ID | Service principal's object ID |
| `roles` | User's assigned app-roles | Service principal's assigned app-roles |

**Recommended check (Prompt 1-04):**

```typescript
function isAppOnlyToken(claims: JWTPayload): boolean {
  // Primary: idtyp is the canonical signal in Entra v2 tokens
  if (claims.idtyp === 'app') return true;
  // Fallback: no scp and no upn indicates app-only
  if (!claims.scp && !claims.upn && !claims.preferred_username) return true;
  return false;
}
```

### 4.2 Validation Pipeline Changes (Repo-Owned — Prompt 1-04)

**Current state:** `validateToken()` requires `upn` and `oid` — it will reject app-only tokens because they lack `upn`.

**Target state:** `validateToken()` (or a new parallel path) must handle app-only tokens:
- If `idtyp === 'app'` or no `upn`/`preferred_username`: treat as app-only
  - `oid` is still required (service principal object ID)
  - `roles` is required (must include `Automation` or similar)
  - `upn` is not required
  - Return a distinct claims type or flag (`isAppOnly: true`)
- If `upn` present: treat as delegated (current behavior preserved)

**Implementation options for Prompt 1-04:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A — Extend `IValidatedClaims` | Add optional `scp`, `idtyp`, `isAppOnly` fields | Minimal disruption; backward compatible | Claims type becomes looser |
| B — Discriminated union | `DelegatedClaims | AppOnlyClaims` with type guard | Type-safe at every handler; compiler enforces | More refactoring in handlers |
| C — Separate middleware | `withWorkloadAuth()` alongside `withAuth()` | Clean separation; no change to existing handlers | Duplicates some validation logic |

**Recommendation:** Option A for the initial implementation (extend `IValidatedClaims` with optional fields), with a follow-on to Option B if type safety at the handler level proves important. The `upn` field becomes optional for app-only tokens; handlers that need UPN must check `isAppOnly` first.

---

## 5. Environment Configuration Matrix

### 5.1 Repo-Owned Configuration

These values are consumed by backend code and must be set in each deployment environment:

| Config | Required In | Current Status | Gap 5 Change |
|--------|------------|---------------|-------------|
| `API_AUDIENCE` | Production | ✓ Exists, enforced | No change |
| `AZURE_TENANT_ID` | Production | ✓ Exists, enforced | No change |
| `AZURE_CLIENT_ID` | Test/mock only | ✓ Exists, test fallback | No change |
| `ADMIN_UPNS` | Optional | ✓ Exists, business bucket | Reclassify: notification-only (no longer authorization input) |
| `CONTROLLER_UPNS` | Optional | ✓ Exists, business bucket | Reclassify: notification-only (no longer authorization input) |

### 5.2 Environment-Executed Setup (IT/Entra Admin)

These must be configured in Entra ID before the code changes in Prompts 1-06+ can function:

| Setup Step | Owner | Prerequisite For | Verification |
|-----------|-------|-----------------|-------------|
| Create `access_as_user` scope on API app registration | IT / Entra admin | Already exists (Gap 1) | `package-solution.json` already declares it |
| Create `Controller` app-role on API app registration | IT / Entra admin | Prompt 1-06 (role resolution rewrite) | Check via Entra portal or Graph API |
| Create `HBIntelController` app-role (tenant alias) | IT / Entra admin | Prompt 1-06 | Same as above |
| Create `BreakGlass` app-role | IT / Entra admin | Prompt 1-10 (break-glass implementation) | Same as above |
| Create `Automation` app-role (application type) | IT / Entra admin | Prompt 1-08 (workload auth) | Same as above |
| Assign `Admin`/`HBIntelAdmin` to appropriate users/groups | IT / Entra admin | Prompt 1-06 cutover | Users must have role in token before env var removal |
| Assign `Controller`/`HBIntelController` to appropriate users/groups | IT / Entra admin | Prompt 1-06 cutover | Same as above |
| Assign `Automation` to Function App managed identity | IT / Azure admin | Prompt 1-08 | Service principal must hold role for app-only tokens |
| Approve `access_as_user` scope in SharePoint admin center | SharePoint admin | Already done (Gap 1) | SPFx token acquisition works |

### 5.3 SPFx / Frontend Configuration

| Config | Current Status | Gap 5 Change |
|--------|---------------|-------------|
| `webApiPermissionRequests` in `package-solution.json` | ✓ Declares `access_as_user` | No change |
| `__API_AUDIENCE__` build constant in shell webpart | ✓ Injected via DefinePlugin (`ShellWebPart.ts:125–127`) | No change |
| `VITE_API_AUDIENCE` in dev env | ✓ Supported as fallback (`runtimeConfig.ts:166–171`) | No change |

---

## 6. Token Claim Requirements — Complete Reference

### 6.1 Delegated Token (SPFx / Browser)

| Claim | Required | Validated By | Purpose |
|-------|----------|-------------|---------|
| `aud` | Yes | `validateToken()` → jose `audience` check | Audience — must match `API_AUDIENCE` |
| `iss` | Yes | `validateToken()` → jose `issuer` check | Issuer — must match accepted Entra issuers |
| `exp` | Yes | jose library (automatic) | Expiry — rejected if expired |
| `upn` or `preferred_username` | Yes | `validateToken()` lines 246–251 | User identity for display, notification, legacy fallback |
| `oid` | Yes | `validateToken()` lines 247–251 | Stable user identity for ownership checks |
| `roles` | Conditional | New policy engine (Prompt 1-04) | Present when user has app-role assignments; empty array default |
| `scp` | Yes (target) | New scope check (Prompt 1-04) | Must include `access_as_user` for delegated authorization |
| `name` | Optional | `validateToken()` line 258 | Display name; falls back to UPN |
| `jobTitle` | Optional | `validateToken()` line 259 | Optional claim; requires app registration config |
| `ver` | Optional | `validateToken()` line 260 | Token version (`1.0` or `2.0`) for diagnostics |

### 6.2 App-Only Token (Managed Identity / Automation)

| Claim | Required | Validated By | Purpose |
|-------|----------|-------------|---------|
| `aud` | Yes | `validateToken()` → jose `audience` check | Audience — same `API_AUDIENCE` |
| `iss` | Yes | `validateToken()` → jose `issuer` check | Issuer — same accepted issuers |
| `exp` | Yes | jose library (automatic) | Expiry |
| `oid` | Yes | Extended validation (Prompt 1-04) | Service principal object ID |
| `roles` | Yes | New workload policy (Prompt 1-04/1-08) | Must include `Automation` |
| `idtyp` | Expected | Token-type differentiation | Value `app` — primary signal for app-only |
| `upn` | Absent | — | Not present in app-only tokens |
| `scp` | Absent | — | Not present in app-only tokens |

---

## 7. Repo-Owned Implementation Implications

### 7.1 Changes Required in `validateToken.ts`

| Change | Prompt | Description |
|--------|--------|-------------|
| Support app-only tokens | 1-04 | Relax `upn` requirement when `idtyp === 'app'`; add `scp` and `idtyp` to extracted claims |
| Extract `scp` claim | 1-04 | Add `scp` field to `IValidatedClaims` (or extended type) |
| No audience/issuer changes | — | Current `aud`/`iss` validation already correct for both token types |

### 7.2 Changes Required in `state-machine.ts`

| Change | Prompt | Description |
|--------|--------|-------------|
| Rewrite `resolveRequestRole()` | 1-06 | Use `claims.roles` instead of env vars; use `oid` for ownership |
| No transition matrix changes | — | `isAuthorizedTransition()` and `CONTROLLER_TRANSITIONS` unchanged |

### 7.3 Changes Required in Handlers

| Change | Prompt | Description |
|--------|--------|-------------|
| Add scope enforcement to all routes | 1-04/1-06/1-07 | Compose `checkDelegatedScope()` into handler pipeline |
| Replace inline env-var privilege check | 1-06 | `listProjectSetupRequests` lines 197–200 |
| Add `oid` capture at record creation | 1-05 | `submitProjectSetupRequest`, `provisionProjectSite` |
| Standardize admin guard pattern | 1-07 | Provisioning routes use shared policy helper instead of inline checks |

### 7.4 No Changes Required

| Component | Reason |
|-----------|--------|
| `package-solution.json` | `access_as_user` scope already declared |
| `ShellWebPart.ts` | `__API_AUDIENCE__` injection already wired |
| `runtimeConfig.ts` | `getApiAudience()` resolution already correct |
| `mount.tsx` | Token acquisition chain already correct |
| `resolveApiAudience()` in `validateToken.ts` | `API_AUDIENCE` env var handling already correct |
| `resolveTenantId()` in `validateToken.ts` | `AZURE_TENANT_ID` handling already correct |

---

## 8. Evidence Classification

### Confirmed Repo Facts
- `API_AUDIENCE` env var required in production, no implicit fallback (`validateToken.ts:74–94`)
- `AZURE_TENANT_ID` env var required in production (`validateToken.ts:44–62`)
- `access_as_user` scope declared in `package-solution.json` (lines 10–15)
- API audience injected end-to-end: shell → mount → token provider → backend (`ShellWebPart.ts:125–127`, `mount.tsx:59–62`, `runtimeConfig.ts:161–174`)
- `validateToken()` currently requires `upn` and `oid` — rejects app-only tokens (`validateToken.ts:247–251`)
- `roles` claim extracted as `string[]` with empty-array default (`validateToken.ts:257`)
- No `scp` claim validation exists anywhere in the codebase
- Provisioning admin routes check for `Admin` and `HBIntelAdmin` roles only (no `Controller` check exists today)

### Confirmed Microsoft-Guidance Facts
- Delegated tokens carry `scp`; app-only tokens carry `roles` with `idtyp=app`
- App roles assigned to users appear in delegated token `roles` claim
- App roles assigned to service principals appear in app-only token `roles` claim
- `oid` in delegated tokens is the user's object ID; in app-only tokens it is the service principal's object ID
- `scp` is a space-delimited string in v2 tokens
- `access_as_user` is a custom scope exposed by the API app registration, not a Microsoft Graph scope

### Design Decisions (Frozen in This Document)
- Single `access_as_user` scope covers all delegated access (no per-route scopes)
- Six app-roles defined: `Admin`, `HBIntelAdmin`, `Controller`, `HBIntelController`, `BreakGlass`, `Automation`
- Each functional role accepts two value names (e.g., `Admin` + `HBIntelAdmin`) for tenant flexibility
- `BreakGlass` resolves to admin-equivalent with mandatory audit telemetry
- `Automation` is application-only (not assignable to users)
- Token-type differentiation uses `idtyp` as primary signal, absence of `scp`/`upn` as fallback
- `validateToken.ts` will be extended to support app-only tokens (relaxed `upn` requirement)
- Frontend token acquisition chain requires no changes
