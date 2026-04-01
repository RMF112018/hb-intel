# Startup/Auth Boot-Scope — Canonical Repo-Truth Note

> **Created:** 2026-04-01 (P9-G4-00)
> **Status:** Disproven — not a current gap

## Corrected Verdict

**The startup/auth boot-scope gap is disproven by current repo truth.** `validateToken.ts` does NOT resolve identity settings at module load. The prior eager module-scope behavior was historical and was explicitly remediated in P8-07.

## Repo-Truth Explanation

`backend/functions/src/middleware/validateToken.ts` uses lazy initialization for identity config:

- `_identityConfig` (line 117): `let ... = null` — mutable cache, no execution at import
- `getIdentityConfig()` (line 119): function definition — resolves `AZURE_TENANT_ID` and `API_AUDIENCE` only when called
- `validateToken()` (line 207): calls `getIdentityConfig()` at request time — this is the first point where identity config is needed

**Result:** The Azure Functions worker starts successfully regardless of whether identity env vars are set. Missing identity config becomes a request-time auth failure (`TokenValidationError('config_error')`), not a startup crash.

## Historical Source of Confusion

Before P8-07, `validateToken.ts` had top-level `const` declarations that executed at module load:

```typescript
// HISTORICAL — removed in P8-07
const TENANT_ID = resolveTenantId();       // THREW if missing
const API_AUDIENCE = resolveApiAudience();  // THREW if missing
```

P8-07 replaced these with the lazy-init singleton pattern. The P8-07 comment block (lines 96–108) documents the change in-source. Two release-gate regression tests enforce the pattern:

- **Gate 10:** Verifies lazy-init pattern exists (`getIdentityConfig()`, `let _identityConfig`)
- **Gate 11:** Verifies production enforcement preserved (`resolveTenantId`, `resolveApiAudience`, `TokenValidationError`, `config_error`)

## Files That Prove the Correction

| File | Evidence |
|------|----------|
| `backend/functions/src/middleware/validateToken.ts:117` | `let _identityConfig: IdentityConfig \| null = null` |
| `backend/functions/src/middleware/validateToken.ts:119-138` | `getIdentityConfig()` function definition (not called at module scope) |
| `backend/functions/src/middleware/validateToken.ts:207` | `getIdentityConfig()` called inside `validateToken()` at request time |
| `backend/functions/src/middleware/validateToken.ts:96-108` | P8-07 comment documenting the fix |
| `backend/functions/src/test/release-gates.test.ts:135-164` | Gates 10 and 11 enforce lazy-init + production hardening |

## Authoritative Validation

See: `docs/architecture/reviews/project-setup-startup-auth-boot-scope-gap-validation.md`

## Guidance for Future Audits

**Do not reopen this issue unless new repo truth reintroduces eager module-load identity config resolution.** The lazy-init pattern is:
- Enforced by release-gate tests (Gates 10 and 11)
- Documented in-source (P8-07 comment block)
- Validated by fresh build/import evidence in the validation report

If a future audit suspects regression, verify:
1. `_identityConfig` is still initialized to `null` at module scope
2. No top-level `const` calls `resolveTenantId()` or `resolveApiAudience()`
3. Release-gate tests 10 and 11 still pass
