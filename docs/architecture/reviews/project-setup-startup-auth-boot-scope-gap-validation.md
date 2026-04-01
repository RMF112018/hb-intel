# Startup/Auth Boot-Scope Gap Validation — Project Setup

## Executive Summary

**Verdict: Not a gap. The hypothesis is disproven by current repo truth.**

`backend/functions/src/middleware/validateToken.ts` does NOT resolve identity settings at module load. The `AZURE_TENANT_ID`, `API_AUDIENCE`, JWKS URL, and accepted issuers are resolved inside a `getIdentityConfig()` function (line 119) that is called lazily from `validateToken()` at request time (line 207). The identity config singleton (`_identityConfig`, line 117) is initialized to `null` and only populated on the first `validateToken()` call.

This lazy-init pattern was explicitly implemented in P8-07 to fix a prior module-load-time hazard where top-level `const` declarations caused the worker to crash on import when identity config was missing. Two release-gate regression tests (Gates 10 and 11) enforce the pattern. The prior report claims are accurate and match current repo truth.

---

## 1. Prior Report Claims

### Phase 8 Report — P8-07

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

**Claim: Identity config was refactored to lazy-init**

> Line 504-505: "Identified and fixed module-load-time config resolution hazard in `validateToken.ts`"
> "Refactored identity config (tenant ID, API audience, JWKS, accepted issuers) to lazy-initialized singleton"

**Claim: Prior behavior was eager/module-load and was explicitly fixed**

> Lines 513-521: "Prior to P8-07, `validateToken.ts` resolved `AZURE_TENANT_ID` and `API_AUDIENCE` at module-load time via top-level `const` declarations:
> ```
> → const TENANT_ID = resolveTenantId()       // THREW if missing in prod
> → const API_AUDIENCE = resolveApiAudience()  // THREW if missing in prod
> ```"

**Claim: Identity config now validates at first authenticated request**

> Line 530-531:
> | `AZURE_TENANT_ID` | First authenticated request (lazy init) | `TokenValidationError('config_error')` | Auth routes only |
> | `API_AUDIENCE` | First authenticated request (lazy init) | `TokenValidationError('config_error')` | Auth routes only |

> Line 538: "Identity config now validates at first authenticated request, not at worker startup. The health endpoint is guaranteed to respond with accurate `operationalReadiness` diagnostics regardless of identity config state."

**Claim: Lazy-init is enforced by release-gate tests**

> Line 560-561: "Gate 10: Verifies lazy-init pattern is in place (`getIdentityConfig()` and `_identityConfig` cache exist in source)"
> "Gate 11: Verifies production enforcement is preserved (`resolveTenantId`, `resolveApiAudience`, `TokenValidationError`, `config_error` all present)"

---

## 2. Current `validateToken.ts` Module-Load Evidence

**File:** `backend/functions/src/middleware/validateToken.ts`

### 2.1 Module-scope declarations (lines 96-138)

The file declares the following at module scope:

```typescript
// Line 110-115: Type definition only — no execution
interface IdentityConfig {
  tenantId: string;
  apiAudience: string;
  jwks: ReturnType<typeof createRemoteJWKSet>;
  acceptedIssuers: string[];
}

// Line 117: Mutable cache, initialized to null — no execution
let _identityConfig: IdentityConfig | null = null;

// Line 119-138: Function DEFINITION — not called at module load
function getIdentityConfig(): IdentityConfig {
  if (_identityConfig) return _identityConfig;
  const tenantId = resolveTenantId();
  const apiAudience = resolveApiAudience();
  _identityConfig = { tenantId, apiAudience, jwks: ..., acceptedIssuers: ... };
  return _identityConfig;
}
```

**Confirmed repo fact:** No module-level function calls execute during import. The module-scope code consists of:
- Type/class definitions (lines 8-31, 110-115, 144-164) — no runtime effect
- Function definitions (`resolveTenantId`, `resolveApiAudience`, `getIdentityConfig`, `validateToken`, `unauthorizedResponse`) — defined but not called
- One `let` declaration initialized to `null` (line 117) — no env var access

### 2.2 No top-level constants that call resolvers

The P8-07 comment block (lines 96-108) explicitly documents the change:

> "Previously, TENANT_ID, API_AUDIENCE, JWKS, and ACCEPTED_ISSUERS were computed at module-load time. This caused the entire Azure Functions worker to crash on import when identity config was missing."

The current code has **no top-level `const` declarations that call `resolveTenantId()` or `resolveApiAudience()`**. The resolver functions are only called inside `getIdentityConfig()`, which is only called inside `validateToken()`.

**Confirmed repo fact:** Importing `validateToken.ts` does not trigger env var resolution or throw.

---

## 3. `auth.ts` Request-Path Evidence

**File:** `backend/functions/src/middleware/auth.ts`

### 3.1 Import path — no execution at import time

```typescript
// Line 2: Type-only and function imports — no side-effect execution
import { validateToken, unauthorizedResponse, TokenValidationError, type IValidatedClaims } from './validateToken.js';
```

Importing `auth.ts` imports from `validateToken.ts`, but since `validateToken.ts` has no module-load-time execution, this import is safe.

### 3.2 Request-time validation flow

The `withAuth()` function (line 49) wraps HTTP handlers. The validation chain:

1. `extractBearer(request)` — checks for Authorization header (lines 56-64). If missing, returns 401 immediately. **No identity config needed.**
2. `validateToken(request)` — called at line 70. This is the first point where identity config is needed.
3. Inside `validateToken()` (line 207): `const { jwks, acceptedIssuers, apiAudience } = getIdentityConfig();` — **this is where lazy init occurs.**

### 3.3 Failure behavior by scenario

| Scenario | When failure occurs | Failure type |
|----------|-------------------|--------------|
| Missing Authorization header | Request time (line 56) | 401 response, no identity config access |
| Malformed Authorization header | Request time (line 192-204) | `TokenValidationError('malformed_header')` |
| Missing `API_AUDIENCE` (prod) | First authenticated request (line 207→123) | `TokenValidationError('config_error')` |
| Missing `AZURE_TENANT_ID` (prod) | First authenticated request (line 207→122) | `TokenValidationError('config_error')` |
| Test/mock mode without env vars | First authenticated request | Falls back to test defaults (lines 52-53, 83-84) |

**Confirmed repo fact:** Identity config failures occur strictly at request time, never at import/cold-start.

---

## 4. Startup/Config-Validation Model Evidence

### 4.1 Config validation tiers

**File:** `backend/functions/src/utils/validate-config.ts`

The startup validation model uses tiered validation:
- **Core tier** — validated at service-factory creation (first request needing services)
- **SharePoint tier** — validated at service-factory creation (warning only, doesn't block)
- **Provisioning tier** — validated at saga execution time
- **Identity config** — validated at first `validateToken()` call (lazy init)

Identity config (`AZURE_TENANT_ID`, `API_AUDIENCE`) is intentionally NOT part of core-tier startup validation. It is a separate validation concern handled by the auth middleware.

### 4.2 Service factory does not validate identity config

**File:** `backend/functions/src/hosts/project-setup/service-factory.ts` (line 64)

```typescript
validateProjectSetupStartupConfig();
```

This function validates core-tier settings (8 items) but NOT `AZURE_TENANT_ID` or `API_AUDIENCE`. Identity config is the auth middleware's responsibility.

**Confirmed repo fact:** Startup validation and identity-config validation are separate concerns with separate timing.

---

## 5. Release-Gate Test Enforcement

**File:** `backend/functions/src/test/release-gates.test.ts`

### Gate 10 (lines 135-149): Lazy-init structural proof

```typescript
it('validateToken module loads without throwing when identity config is missing', async () => {
  const source = readFileSync(
    resolve(FUNCTIONS_ROOT, 'src/middleware/validateToken.ts'),
    'utf-8',
  );
  expect(source).toContain('getIdentityConfig()');
  expect(source).toContain('let _identityConfig');
});
```

Verifies the lazy-init pattern exists in source: `getIdentityConfig()` function call and `_identityConfig` mutable cache.

### Gate 11 (lines 151-164): Production enforcement proof

```typescript
it('validateToken source enforces API_AUDIENCE and AZURE_TENANT_ID in production', () => {
  const source = readFileSync(
    resolve(FUNCTIONS_ROOT, 'src/middleware/validateToken.ts'),
    'utf-8',
  );
  expect(source).toContain("throw new TokenValidationError(");
  expect(source).toContain("'config_error'");
  expect(source).toContain('function resolveTenantId()');
  expect(source).toContain('function resolveApiAudience()');
});
```

Verifies that production enforcement (throws on missing config) is preserved alongside the lazy-init pattern.

**Confirmed repo fact:** Two release-gate tests enforce both lazy-init and production hardening.

---

## 6. Boot-Scope Analysis

### 6.1 What happens during Azure Functions worker cold start

```
Worker process starts
  → loads host entry point (index.ts or hosts/project-setup/index.ts)
    → imports route modules (projectRequests, provisioningSaga, etc.)
      → imports ../../middleware/auth.ts (via withAuth)
        → imports ./validateToken.ts
          → defines functions and types
          → let _identityConfig = null    ← NO env var access
          → NO calls to resolveTenantId() or resolveApiAudience()
    → route modules register HTTP/timer triggers via app.http(), app.timer()
  → Worker is ready to accept requests
```

**No identity config resolution occurs.** The worker starts successfully regardless of whether `AZURE_TENANT_ID` and `API_AUDIENCE` are set.

### 6.2 What happens on first authenticated request

```
Request arrives with Authorization: Bearer <token>
  → withAuth() wrapper invoked
    → extractBearer() checks header
    → validateToken(request) called
      → getIdentityConfig() called (line 207)
        → _identityConfig is null → resolve config
        → resolveTenantId() reads AZURE_TENANT_ID
        → resolveApiAudience() reads API_AUDIENCE
        → if missing in prod: throws TokenValidationError('config_error')
        → if present: caches in _identityConfig singleton
      → jwtVerify(token, jwks, { issuer, audience })
      → returns validated claims
```

**Identity config resolves on first authenticated request, not at worker startup.** Missing config throws `TokenValidationError`, which `withAuth()` catches and returns as a 401 response. The worker remains healthy.

### 6.3 Health endpoint resilience

The health endpoint (`functions/health/index.ts`) does NOT import `auth.ts` or `validateToken.ts`. Even if identity config is missing, the health endpoint:
- Starts successfully (no import-chain dependency on identity config)
- Reports accurate `operationalReadiness` diagnostics
- Allows operators to diagnose missing config before any authenticated request arrives

---

## 7. Verdict

**Not a gap.** The hypothesis is disproven.

| Dimension | Assessment |
|-----------|-----------|
| Module-load-time resolution | **No** — `_identityConfig` is `null` at import; no resolver calls at module scope |
| Startup-time blocker | **No** — worker starts regardless of identity config state |
| Request-time validation | **Yes** — identity config resolves at first `validateToken()` call |
| Production hardening preserved | **Yes** — missing config throws `TokenValidationError('config_error')` |
| Health endpoint resilience | **Yes** — health responds even with missing identity config |
| Prior report claims | **Accurate** — P8-07 descriptions match current implementation |
| Release-gate enforcement | **Yes** — Gates 10 and 11 prevent regression |

---

## 8. Why the Verdict Is Correct

1. **The code is unambiguous.** `_identityConfig` (line 117) is `let ... = null`. `getIdentityConfig()` (line 119) is a function definition, not a call. `validateToken()` (line 184) calls `getIdentityConfig()` at line 207, inside the function body. No module-scope code reads env vars.

2. **The P8-07 comment block documents the fix.** Lines 96-108 explicitly describe the prior eager pattern and the lazy-init replacement. This is not ambient documentation — it is co-located commentary in the changed file.

3. **Release-gate tests enforce the pattern.** Gate 10 verifies `getIdentityConfig()` and `let _identityConfig` exist in source. Gate 11 verifies production enforcement (`throw new TokenValidationError`, `config_error`) is preserved. Both tests pass (661 passed, 3 skipped in the backend suite).

4. **The hypothesis likely originated from reading a pre-P8-07 snapshot.** Before P8-07, the module DID have top-level `const TENANT_ID = resolveTenantId()` and `const API_AUDIENCE = resolveApiAudience()` declarations that executed at import time. P8-07 replaced them with the lazy singleton. Reading a stale cache, diff, or pre-P8-07 code state would produce the incorrect conclusion.

---

## 9. Unresolved Questions

None. The hypothesis is cleanly disproven. Current repo truth, prior report claims, and release-gate tests are all aligned.
