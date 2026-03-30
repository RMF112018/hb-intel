# Auth Split — Validation & Refactor Design

> **Date**: 2026-03-30
> **Scope**: Backend auth/config dual-use contradiction blocking deployment
> **Status**: Design-only — implementation in Prompt 02

---

## 1. Executive Summary

`AZURE_CLIENT_ID` is overloaded with two incompatible meanings: (1) `validateToken.ts` uses it as the **Entra ID app registration** client ID to validate inbound JWT `audience: api://<CLIENT_ID>`, and (2) `DefaultAzureCredential` reads it from the environment to select the **user-assigned managed identity** for outbound Azure resource calls. In the live Azure Function App, the value is `77ad3593-...` (the user-assigned managed identity client ID), which may or may not match the app registration used by the SPFx frontend to acquire tokens. The startup validation registry previously required `AZURE_CLIENT_SECRET` for production, which contradicts the managed-identity-only posture.

---

## 2. Files Inspected

| File | Role |
|------|------|
| `backend/functions/src/middleware/validateToken.ts` | Inbound JWT validation — reads `AZURE_CLIENT_ID` as audience |
| `backend/functions/src/middleware/auth.ts` | Auth wrapper — calls `validateToken()` |
| `backend/functions/src/services/sharepoint-service.ts` | Outbound SP auth — `new DefaultAzureCredential()` |
| `backend/functions/src/services/project-requests-repository.ts` | Outbound SP auth — `new DefaultAzureCredential()` |
| `backend/functions/src/services/msal-obo-service.ts` | Outbound token acquisition — `new DefaultAzureCredential()` |
| `backend/functions/src/config/wave0-env-registry.ts` | Startup env validation registry |
| `backend/functions/src/utils/validate-config.ts` | Startup validation gate |
| `backend/functions/src/utils/adapter-mode-guard.ts` | Mock/proxy mode guard |
| `backend/functions/local.settings.example.json` | Local dev config template |

---

## 3. Current-State Auth/Config Map

### 3.1 Inbound API Authentication

```
Browser (SPFx) → Bearer token → auth.ts → validateToken.ts
                                             ↓
                                   AZURE_TENANT_ID → issuer check
                                   AZURE_CLIENT_ID → audience check (api://<value>)
                                   JWKS endpoint   → signature check
```

**Code**: `validateToken.ts:41-44`
```typescript
const { payload } = await jwtVerify(token, JWKS, {
  issuer: `https://sts.windows.net/${TENANT_ID}/`,
  audience: `api://${CLIENT_ID}`,
});
```

**Requirement**: `AZURE_CLIENT_ID` must be the **Entra ID app registration** client ID that the SPFx app's token was issued for.

### 3.2 Outbound Azure Resource Authentication

```
Service code → DefaultAzureCredential() → token for SP/Graph/Table
                    ↓
        Reads AZURE_CLIENT_ID from env to select user-assigned MI
        Reads AZURE_TENANT_ID from env for tenant context
```

**Code**: Used in 3 services:
- `sharepoint-service.ts:87` — `private readonly credential = new DefaultAzureCredential();`
- `project-requests-repository.ts:37` — same
- `msal-obo-service.ts:29` — same

**Requirement**: When a user-assigned managed identity is present, `AZURE_CLIENT_ID` must be set to the **managed identity's** client ID for `DefaultAzureCredential` to select it.

### 3.3 Startup Validation

**Code**: `wave0-env-registry.ts`
- `AZURE_CLIENT_ID`: `requiredInProd: true` — required but semantically ambiguous
- `AZURE_CLIENT_SECRET`: `requiredInProd: false` — already demoted (managed identity path)

---

## 4. Contradiction Proof

### The Overload

| Consumer | Setting | Needs | Actual Azure Value |
|----------|---------|-------|-------------------|
| `validateToken.ts` (inbound) | `AZURE_CLIENT_ID` | App registration client ID | `77ad3593-...` (MI client ID) |
| `DefaultAzureCredential` (outbound) | `AZURE_CLIENT_ID` | Managed identity client ID | `77ad3593-...` (MI client ID) |

**If the app registration client ID ≠ the managed identity client ID** (the normal case for user-assigned MI), then:
- Setting `AZURE_CLIENT_ID` to the MI client ID → inbound JWT validation fails (`audience` mismatch)
- Setting `AZURE_CLIENT_ID` to the app registration client ID → `DefaultAzureCredential` fails to find the managed identity

**Current Azure state**: `AZURE_CLIENT_ID=<managed-identity-client-id>` (user-assigned MI). This means inbound JWT audience check will use `api://77ad3593-...`. If the SPFx app registration is different, all API calls will return 401.

### Contradiction Classification

**Validation + Runtime + Inbound Auth Contract** — all three layers are affected:
1. Startup validation doesn't distinguish between the two uses
2. Runtime credential resolution and JWT validation both read the same variable
3. The inbound auth audience may be wrong if MI client ID ≠ app registration client ID

---

## 5. Recommended Target-State Config Model

### New Settings

| Setting | Purpose | Example Value |
|---------|---------|---------------|
| `API_AUDIENCE` | App registration client ID or App ID URI for inbound JWT audience validation | `api://<managed-identity-client-id>` or `api://<app-reg-client-id>` |
| `AZURE_CLIENT_ID` | **Retained** — user-assigned managed identity client ID (read by `DefaultAzureCredential`) | `<managed-identity-client-id>` |

### Why This Split

- `DefaultAzureCredential` is an Azure SDK convention — it reads `AZURE_CLIENT_ID` from env. Changing this would break the SDK contract.
- `API_AUDIENCE` is application-specific — it controls what audience the JWT validator accepts. This is the value that should be explicit and separate.
- If the MI client ID happens to equal the app registration client ID (single identity scenario), `API_AUDIENCE` can be set to `api://<same-id>` and everything works.
- If they differ, each setting carries its correct value.

### Backward Compatibility

`validateToken.ts` currently constructs `api://${AZURE_CLIENT_ID}`. After the split:
- If `API_AUDIENCE` is set → use it directly as the audience
- If `API_AUDIENCE` is NOT set → fall back to `api://${AZURE_CLIENT_ID}` (existing behavior)

This means the refactor is backward-compatible with zero Azure config changes for the single-identity case.

---

## 6. Recommended Target-State Validation Model

### wave0-env-registry.ts Changes

| Setting | Before | After |
|---------|--------|-------|
| `AZURE_CLIENT_ID` | `requiredInProd: true`, description says "app registration" | `requiredInProd: true`, description updated to "managed identity client ID (read by DefaultAzureCredential)" |
| `AZURE_CLIENT_SECRET` | `requiredInProd: false` (already demoted) | No change |
| `API_AUDIENCE` | Does not exist | Add as `requiredInProd: false` with fallback behavior documented |

### Startup Validation Behavior

1. `AZURE_CLIENT_ID` required → ensures managed identity can resolve
2. `API_AUDIENCE` optional → if absent, falls back to `api://${AZURE_CLIENT_ID}`
3. `AZURE_CLIENT_SECRET` optional → only needed for local dev with client-secret auth

---

## 7. Recommended Target-State Credential Resolution

### validateToken.ts (Inbound)

```typescript
// Before:
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
audience: `api://${CLIENT_ID}`

// After:
const API_AUDIENCE = process.env.API_AUDIENCE || `api://${process.env.AZURE_CLIENT_ID!}`;
audience: API_AUDIENCE
```

Changes: 2 lines. Fully backward-compatible.

### DefaultAzureCredential Usage (Outbound)

**No changes needed.** `DefaultAzureCredential` reads `AZURE_CLIENT_ID` from the environment automatically. The current user-assigned MI wiring is correct.

### Service Factory (adapter-mode-guard.ts)

**No changes needed.** Mock vs proxy selection is unrelated to the identity split.

---

## 8. Backward Compatibility / Migration

### Zero-Change Deployment (Single Identity)

If the app registration client ID is the same as the managed identity client ID:
- No new settings needed
- `API_AUDIENCE` is not set → falls back to `api://${AZURE_CLIENT_ID}`
- Everything works as before

### Split Identity Deployment

If the app registration client ID differs from the managed identity client ID:
1. Set `AZURE_CLIENT_ID` = managed identity client ID (for `DefaultAzureCredential`)
2. Set `API_AUDIENCE` = `api://<app-registration-client-id>` (for JWT validation)
3. Both work independently

### Migration Path

1. Deploy code with the `API_AUDIENCE` fallback (Prompt 02)
2. Verify with current settings (single-identity assumption)
3. If 401 errors occur on inbound auth, set `API_AUDIENCE` to the correct app registration value
4. No rollback risk — the fallback preserves current behavior

---

## 9. Implementation Handoff for Prompt 02

### Files to Modify

| File | Change |
|------|--------|
| `backend/functions/src/middleware/validateToken.ts` | Read `API_AUDIENCE` with fallback to `api://${AZURE_CLIENT_ID}` |
| `backend/functions/src/config/wave0-env-registry.ts` | Update `AZURE_CLIENT_ID` description; add `API_AUDIENCE` as optional |
| `backend/functions/local.settings.example.json` | Add `API_AUDIENCE` with comment |
| `backend/functions/src/middleware/validateToken.test.ts` | Add test for `API_AUDIENCE` override and fallback |

### Exact Code Changes

**validateToken.ts** — lines 4-5:
```typescript
// Before:
const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;

// After:
const TENANT_ID = process.env.AZURE_TENANT_ID!;
const API_AUDIENCE = process.env.API_AUDIENCE || `api://${process.env.AZURE_CLIENT_ID!}`;
```

**validateToken.ts** — line 43:
```typescript
// Before:
audience: `api://${CLIENT_ID}`,

// After:
audience: API_AUDIENCE,
```

### Test Changes

Add to `validateToken.test.ts`:
- Test: `API_AUDIENCE` set explicitly → used as audience
- Test: `API_AUDIENCE` not set → falls back to `api://${AZURE_CLIENT_ID}`

### Azure Config (When Ready)

If single-identity (MI client ID = app registration client ID):
```
No changes needed — current AZURE_CLIENT_ID works for both.
```

If split-identity:
```bash
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group hb-intel \
  --settings API_AUDIENCE="api://<app-registration-client-id>"
```
