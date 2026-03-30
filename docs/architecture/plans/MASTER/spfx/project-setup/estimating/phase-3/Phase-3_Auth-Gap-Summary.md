# Phase 3 — Auth Gap Summary

> Created: 2026-03-30
> Prompt: P3-01 Repo Truth and Auth Surface Baseline
> Companion to: `Phase-3_Auth-Baseline-Matrix.md`

## Summary

The Project Setup backend has a consistent auth middleware pattern (`withAuth()` + `validateToken()`) across all primary routes, but the auth surface contains five categories of gaps that must be resolved before the production auth model can be considered trustworthy.

---

## Gap 1: Opaque Token Assumptions

**Severity:** High
**Affects:** All production-mode API calls from the frontend

### Findings

1. **Token captured once, never refreshed.**
   `resolveSessionToken(session)` is called inside a `useMemo` at render time (`ProjectSetupBackendContext.tsx:131`). The resulting `authToken` string is closed over by the `getToken` callback (`async () => authToken` — line 136). If the Entra ID access token expires during a user's session, all subsequent API calls will send the stale token and receive 401 responses with no automatic recovery.

2. **Hardcoded mock-token fallback.**
   The fallback chain in `resolveSessionToken()` terminates with the literal string `'mock-token'` (line 15). In any scenario where the session payload is empty or malformed, the frontend will silently send `Authorization: Bearer mock-token` to the production backend. The backend will reject this (JWT validation fails), but the failure mode is indistinguishable from a real expired-token error.

3. **No token audience targeting.**
   The frontend does not request a token scoped to the Project Setup API audience (`api://${CLIENT_ID}`). It extracts whatever token the auth session already holds. If the session token was acquired for a different resource (e.g., SharePoint or Graph), the backend audience check will fail.

### Resolution Direction

- Implement a `getToken()` factory that acquires a fresh token scoped to the API audience on each call.
- Remove the `'mock-token'` fallback from production code paths.
- In SPFx context, use `aadTokenProviderFactory.getTokenProvider()` to acquire API-scoped tokens.

---

## Gap 2: Validator Misalignment

**Severity:** High
**Affects:** Token validation correctness and long-term posture

### Findings

1. **Issuer format uses v1, JWKS uses v2.**
   The validator expects issuer `https://sts.windows.net/${TENANT_ID}/` (v1 issuer format, `validateToken.ts:56`) but fetches signing keys from the v2 JWKS endpoint (`login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`, line 22). This works today because v2 keys are a superset, but the issuer claim in a v2 token is `https://login.microsoftonline.com/${TENANT_ID}/v2.0`, which would fail validation. The system currently only works because the SPFx token provider issues v1-format tokens.

2. **Audience fallback conflates MI client ID with app registration.**
   `API_AUDIENCE` defaults to `api://${AZURE_CLIENT_ID}` (line 19). `AZURE_CLIENT_ID` is also consumed by `DefaultAzureCredential` for managed-identity selection. In split-identity deployments (where MI client ID differs from app registration client ID), the audience check will fail unless `API_AUDIENCE` is explicitly set. The code documents this risk (lines 10-15) but the default path is still unsafe.

3. **No token version assertion.**
   The validator does not check `ver` claim or enforce a specific token version contract. If the frontend switches to v2 tokens (e.g., by changing the app registration manifest), the issuer check will silently break.

### Resolution Direction

- Choose and document the API token-version contract (v1 or v2).
- Align issuer validation to the chosen version.
- Make `API_AUDIENCE` a required configuration in production mode, not an optional fallback.

---

## Gap 3: Ambiguous Mode Behavior

**Severity:** Medium
**Affects:** Production-mode activation safety

### Findings

1. **No production-mode prerequisite guard.**
   Production mode is the default (`runtimeConfig.ts` defaults to `'production'`). There is no runtime check that required auth prerequisites (valid session, API-scoped token, `functionAppUrl` config) are present before allowing API calls. If `functionAppUrl` is missing, `getFunctionAppUrl()` throws a `ConfigError` — but this only surfaces as an unhandled error during render.

2. **Mode switch has no auth re-validation.**
   When `setBackendMode('production')` is called, the provider resets provisioning state (`resetProvisioningRuntimeState()`) but does not verify that the session has a valid production-capable token. The next API call may fail silently.

3. **ui-review banner is informational only.**
   The `HbcBanner` in `root-route.tsx` tells the user that "backend connections are disabled," but there is no structural enforcement preventing production API calls from being initiated while the banner is displayed. The separation is entirely in the context provider's client selection.

### Resolution Direction

- Gate production-mode activation on presence of required config and a valid session token.
- Validate token freshness on mode switch.
- Consider making `ui-review` the default when auth prerequisites are not met.

---

## Gap 4: Missing Route Protections

**Severity:** High
**Affects:** Proxy routes, health probe

### Findings

1. **Proxy routes bypass `withAuth()` and `validateToken()`.**
   `/api/proxy/{*path}` routes (`proxy/index.ts:6-26`) use a custom auth check in `handleProxyRequest()` that only verifies the Bearer header format (line 31), extracts the raw token (line 35), and passes it to `acquireTokenOnBehalfOf()` — which ignores it entirely (see Gap 5). The JWT is **never validated**: no issuer check, no audience check, no claims extraction, no expiry check. Any string after `Bearer ` is accepted.

2. **Proxy is a stub returning mock data.**
   `handleProxyRequest()` is documented as a Phase 1 stub (`proxy-handler.ts:1-8`). It returns `{ _mock: true }` responses. However, the route is registered and reachable in production. A caller can send any Bearer string and receive a 200 response.

3. **Health probe exposes config key names.**
   `GET /api/health` returns the presence/absence status of environment variable names without auth. While it does not expose values, the config key inventory could inform an attacker about the deployment's capabilities and integration points.

### Resolution Direction

- Either remove the proxy stub entirely, or wrap it with `withAuth()` before Phase 3 completes.
- Evaluate whether the health probe config inventory should be reduced or gated.

---

## Gap 5: Misleading OBO Abstractions

**Severity:** Medium
**Affects:** Code clarity, security audit trail, delegated-vs-app-only boundary

### Findings

1. **`ManagedIdentityOboService` is not OBO.**
   The class name (`msal-obo-service.ts:28`) and interface name (`IMsalOboService`) imply On-Behalf-Of token acquisition. The actual implementation uses `DefaultAzureCredential` (system-assigned Managed Identity) exclusively. The `acquireTokenOnBehalfOf(_userToken, scopes)` method signature accepts a user token parameter but ignores it (line 41: `_userToken`).

2. **Proxy handler calls OBO but gets MI.**
   `handleProxyRequest()` calls `services.msalObo.acquireTokenOnBehalfOf(userToken, [...])` (proxy-handler.ts:39), implying the user's delegated identity is being used for the downstream Graph call. In reality, the call runs as the Managed Identity. Any SharePoint/Graph operations made through this path have **app-level permissions**, not user-level permissions — regardless of what the calling code implies.

3. **Telemetry labels reinforce the confusion.**
   The telemetry events `auth.obo.start`, `auth.obo.success`, and `auth.obo.error` (msal-obo-service.ts:50-71) suggest OBO flow is in use. Operational dashboards or incident investigators would incorrectly conclude that delegated-user flows are active.

4. **No code path actually performs user-delegated token acquisition.**
   There is no `ConfidentialClientApplication`, no `acquireTokenOnBehalfOf` via MSAL, and no user-assertion grant anywhere in the backend. All backend-to-service calls run as the app identity.

### Resolution Direction

- Rename `ManagedIdentityOboService` to reflect its actual behavior (e.g., `ManagedIdentityTokenService`).
- Rename `acquireTokenOnBehalfOf()` to `acquireAppToken()` or similar.
- Update telemetry event names to `auth.mi.*` instead of `auth.obo.*`.
- Document explicitly which operations run as the app and which run as the user (currently: all backend-to-service operations are app-only).

---

## Gap 6: Dual RBAC Mechanism Inconsistency

**Severity:** Medium
**Affects:** Admin identity consistency across features

### Findings

1. **Project Setup routes use UPN-based RBAC.**
   `ADMIN_UPNS` and `CONTROLLER_UPNS` environment variables determine privileged access for project setup request listing and state transitions (`projectRequests/index.ts:141-157`). This is a flat-file approach with no connection to Entra ID role assignments.

2. **Provisioning admin routes use JWT role claims.**
   Routes like `/api/provisioning-failures`, `/api/provisioning-runs`, and the force-state endpoint check `auth.claims.roles` for `'Admin'` or `'HBIntelAdmin'` values. These come from Entra ID app registration role assignments.

3. **No unified admin identity.**
   A user listed in `ADMIN_UPNS` can manage project setup requests but cannot access provisioning admin routes unless they also have the `Admin` role claim in their JWT. Conversely, a user with the `Admin` JWT role can access provisioning admin routes but cannot see all project setup requests unless their UPN is in `ADMIN_UPNS`.

### Resolution Direction

- Converge on a single RBAC source (JWT role claims preferred for production).
- If env-var UPN lists are retained for bootstrapping, document the relationship and synchronization expectations.

---

## Unresolved Issues for Later Prompts

| Issue | Governing Prompt |
|-------|-----------------|
| SPFx-to-API token acquisition pattern | Prompt 02 |
| API token version contract (v1 vs v2) | Prompt 03 |
| Validator redesign for chosen contract | Prompt 03 |
| Delegated vs app-only boundary enforcement | Prompt 04 |
| OBO abstraction rename and cleanup | Prompt 04 |
| CORS hardening | Prompt 05 |
| Route auth regression tests | Prompt 05 |
| RBAC unification | Prompt 05 |
