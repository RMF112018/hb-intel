# Phase 3 — API Token Contract

> Created: 2026-03-30
> Prompt: P3-03 API Token Version and Validator Redesign
> Companion to: `Phase-3_Auth-Baseline-Matrix.md`, `Phase-3_Auth-Gap-Summary.md`, `Phase-3_Production-Mode-Contract.md`

## Purpose

Documents the chosen API token contract for the Project Setup backend, the validator behavior that enforces it, and the deployment prerequisites.

## Token Contract

### Token Versions

**Both v1 and v2 Entra ID access tokens are accepted.**

| Property | v1 Token | v2 Token |
|----------|----------|----------|
| Issuer | `https://sts.windows.net/{tenant-id}/` | `https://login.microsoftonline.com/{tenant-id}/v2.0` |
| `ver` claim | `1.0` | `2.0` |
| UPN claim | `upn` | `preferred_username` |
| Source | SPFx `aadTokenProviderFactory` | MSAL-based PWA clients |

Accepting both versions ensures that:
- SPFx-hosted surfaces (currently issuing v1 tokens) work without changes
- Future MSAL/PWA clients issuing v2 tokens will be accepted
- Changing `accessTokenAcceptedVersion` in the app registration manifest does not break the backend

### Audience

**Required:** `API_AUDIENCE` environment variable.

The audience must match the app registration's Application ID URI (e.g., `api://<app-registration-client-id>`).

The previous fallback to `api://${AZURE_CLIENT_ID}` has been removed. `AZURE_CLIENT_ID` is consumed by `DefaultAzureCredential` for managed-identity selection and may differ from the app registration client ID in split-identity deployments. Using it as an audience fallback was unsafe.

### Issuer Rules

The validator accepts tokens from either of these issuers for the configured tenant:

```
https://sts.windows.net/{AZURE_TENANT_ID}/
https://login.microsoftonline.com/{AZURE_TENANT_ID}/v2.0
```

Both issuers are passed to the `jose` `jwtVerify()` function, which checks the `iss` claim against the list.

### Tenant Rules

Tenant validation is implicit via issuer validation. A token from a different tenant will have a different `{tenant-id}` in the issuer claim and will be rejected.

### Required Claims

| Claim | Required | Fallback | Purpose |
|-------|----------|----------|---------|
| `upn` | Yes* | `preferred_username` | User principal name for identity tracking and RBAC |
| `oid` | Yes | — | Object ID for unique user identification |

*v2 tokens may use `preferred_username` instead of `upn`. The validator accepts either.

### Optional Claims

| Claim | Purpose | Notes |
|-------|---------|-------|
| `roles` | JWT role assignments for admin gating | Defaults to `[]` if absent |
| `name` | Display name | Falls back to UPN |
| `jobTitle` | Job title from optional claims config | Requires app registration optional claims setup |
| `ver` | Token version | Recorded for diagnostics, not enforced |

## Validator Behavior

### Structured Error Classification

The validator throws `TokenValidationError` with a machine-readable `reason` code:

| Reason | Condition | HTTP Response |
|--------|-----------|---------------|
| `missing_header` | No Authorization header | 401 |
| `malformed_header` | Non-Bearer scheme or empty token | 401 |
| `expired` | Token past expiry (`exp` claim) | 401 |
| `invalid_issuer` | Issuer not in accepted list | 401 |
| `invalid_audience` | Audience does not match `API_AUDIENCE` | 401 |
| `missing_claims` | `upn`/`preferred_username` or `oid` absent | 401 |
| `validation_failed` | Generic JWKS/signature error | 401 |
| `config_error` | `API_AUDIENCE` not configured | Startup failure |

The `reason` code is emitted in `auth.bearer.error` telemetry events for diagnostics. The 401 response body does not expose the reason to callers (security: no information leakage).

### JWKS Endpoint

```
https://login.microsoftonline.com/{AZURE_TENANT_ID}/discovery/v2.0/keys
```

The v2 JWKS endpoint provides signing keys for both v1 and v2 tokens (v2 is a superset of v1).

## Test Coverage

| Test Case | File | Status |
|-----------|------|--------|
| Valid token with all claims | `validateToken.test.ts` | Pass |
| jobTitle present / absent / non-string | `validateToken.test.ts` | Pass |
| v1 token version extraction (`ver: '1.0'`) | `validateToken.test.ts` | Pass |
| v2 token version extraction (`ver: '2.0'`) | `validateToken.test.ts` | Pass |
| `preferred_username` fallback (v2 pattern) | `validateToken.test.ts` | Pass |
| Missing Authorization header → `missing_header` | `validateToken.test.ts` | Pass |
| Non-Bearer scheme → `malformed_header` | `validateToken.test.ts` | Pass |
| Expired token → `expired` | `validateToken.test.ts` | Pass |
| Wrong issuer → `invalid_issuer` | `validateToken.test.ts` | Pass |
| Wrong audience → `invalid_audience` | `validateToken.test.ts` | Pass |
| Missing claims → `missing_claims` | `validateToken.test.ts` | Pass |
| Generic JWKS error → `validation_failed` | `validateToken.test.ts` | Pass |
| Explicit `API_AUDIENCE` from env | `validateToken.test.ts` | Pass |
| Test-mode fallback to `api://${AZURE_CLIENT_ID}` | `validateToken.test.ts` | Pass |
| Dual issuers (v1+v2) passed to jose | `validateToken.test.ts` | Pass |
| Structured reason in auth telemetry | `auth.test.ts` | Pass |
| `API_AUDIENCE` in required config | `wave0-env-registry.test.ts` | Pass |
| Boot config with `API_AUDIENCE` | `boot-behavior.test.ts` | Pass |

## Deployment Prerequisites

### Required Before Production Deployment

1. **Set `API_AUDIENCE` environment variable** in the Azure Function App configuration to the app registration's Application ID URI (e.g., `api://<app-registration-client-id>`).

2. **Approve API permission in SharePoint admin center** for the SPFx app to acquire tokens scoped to this audience.

3. **Configure `VITE_API_AUDIENCE`** (or shell mount config `apiAudience`) on the frontend to match.

### No Longer Required

- The `api://${AZURE_CLIENT_ID}` fallback path no longer works in production. Existing deployments that relied on this fallback must add `API_AUDIENCE` explicitly.

## Remaining Issues for Later Prompts

| Issue | Governing Prompt |
|-------|-----------------|
| Delegated vs app-only boundary enforcement | Prompt 04 |
| OBO abstraction rename and managed identity cleanup | Prompt 04 |
| CORS hardening | Prompt 05 |
| Route auth regression tests | Prompt 05 |
| Dual RBAC mechanism unification | Prompt 05 |
