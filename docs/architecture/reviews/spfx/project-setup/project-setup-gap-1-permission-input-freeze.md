# Gap 1 Permission Input Freeze — SPFx `webApiPermissionRequests` Values

> **Created:** 2026-04-01 (P9-G1-01)
> **Status:** Implemented (P9-G1-02)
> **Scope:** Determine the exact `resource` and `scope` values required for `solution.webApiPermissionRequests` in the Project Setup SPFx package.

## Executive Summary

The exact API permission request values for the Project Setup SPFx package are determined from repo-authoritative sources. The Entra ID app registration display name follows the pattern `hb-intel-api-{environment}` and the delegated scope is `access_as_user`. These values are fully supported by the IT setup guide, the token acquisition implementation, the backend validation logic, and Microsoft's SPFx documentation. No blockers remain for Prompt 2 to implement the manifest declaration.

**Frozen values:**

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-{environment}",
    "scope": "access_as_user"
  }
]
```

Where `{environment}` is `staging`, `production`, or `dev` depending on the target deployment.

---

## 1. Candidate `resource` Values Considered

The `resource` field in `webApiPermissionRequests` must identify the Entra ID app registration that protects the backend API. Microsoft documentation specifies that this must be the **display name** of the app registration (not `objectId`, `clientId`, or Application ID URI).

| Candidate | Format | Verdict | Reason |
|-----------|--------|---------|--------|
| App registration display name | `hb-intel-api-staging` | **Selected** | Microsoft-documented requirement; matches IT setup guide naming convention |
| Application (client) ID | GUID | Rejected | Microsoft explicitly states `resource` must be `displayName`, not `clientId` |
| Application ID URI | `api://func-hb-intel-staging` | Rejected | This is the audience/token endpoint, not the resource identifier for permission requests |
| Object ID | GUID | Rejected | Internal Entra identifier, not accepted by the SPFx permission request pipeline |

### Evidence for display name

**IT-Department-Setup-Guide.md** (line 491):
> **Name:** e.g., `hb-intel-api-staging`

The guide instructs IT administrators to register the backend API app with this naming pattern. The pattern is `hb-intel-api-{environment}`.

**Gap validation report** (§4.5):
> The `resource` must be the `displayName` of the Entra ID application (not `objectId` or `clientId`).

---

## 2. Candidate `scope` Values Considered

The `scope` field identifies the delegated permission to request on the "SharePoint Online Client Extensibility" service principal.

| Candidate | Verdict | Reason |
|-----------|---------|--------|
| `access_as_user` | **Selected** | Explicitly defined in IT setup guide as the exposed scope; matches the delegated access pattern |
| `.default` | Rejected | `.default` requests all granted scopes — appropriate for token acquisition but not for the permission request declaration, which should name the specific scope |
| `user_impersonation` | Rejected | Common Azure convention but not the scope name defined for this API; no repo evidence supports it |

### Evidence for `access_as_user`

**IT-Department-Setup-Guide.md** (lines 520–525):
> **Scope name:** `access_as_user` (or as directed by the architecture team)
> Record the full scope string: `api://func-hb-intel-staging/access_as_user`

The scope is created during app registration setup with admin consent display name "Access HB Intel API" and description "Allows the application to access the HB Intel backend API on behalf of the signed-in user."

---

## 3. Recommended Values

| Field | Value | Notes |
|-------|-------|-------|
| `resource` | `hb-intel-api-{environment}` | Entra app registration display name per IT setup guide |
| `scope` | `access_as_user` | Delegated scope per IT setup guide |

### Example for staging

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

---

## 4. Why These Values Are Correct

1. **`resource` is the app registration display name.** Microsoft's SPFx documentation (cited in gap validation §4.5) requires the `displayName`, not a GUID or URI. The IT setup guide defines the naming pattern as `hb-intel-api-{environment}`.

2. **`access_as_user` is the documented delegated scope.** The IT setup guide instructs administrators to expose this scope on the app registration. The full scope URI `api://func-hb-intel-{environment}/access_as_user` represents a user-delegated permission — consistent with SPFx's on-behalf-of token acquisition via `aadTokenProviderFactory`.

3. **The token acquisition chain confirms the audience.** The frontend calls `getToken(audience)` where `audience` is `api://func-hb-intel-{environment}` — the Application ID URI of the same app registration. The `webApiPermissionRequests` declaration requests permission on that app registration by display name, and the scope `access_as_user` matches the exposed scope.

4. **The backend validates the matching audience.** `validateToken.ts` (lines 87–93) checks that the JWT `aud` claim matches `API_AUDIENCE`, which is set to the Application ID URI. Tokens issued for this audience will carry the `access_as_user` scope claim.

5. **The values are self-consistent across the full chain:**
   - IT creates app registration `hb-intel-api-{env}` with URI `api://func-hb-intel-{env}` and scope `access_as_user`
   - Backend sets `API_AUDIENCE` = `api://func-hb-intel-{env}`
   - Build injects `__API_AUDIENCE__` = `api://func-hb-intel-{env}` via DefinePlugin
   - Shell passes `apiAudience` to the mounted app
   - Frontend calls `getToken(apiAudience)` → token with `aud: api://func-hb-intel-{env}`
   - SPFx manifest requests permission: `resource: hb-intel-api-{env}`, `scope: access_as_user`
   - SharePoint admin approves → service principal can acquire tokens for this audience

---

## 5. Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| App registration display name convention | `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` | 491 | Repo fact |
| Application ID URI convention | Same | 517 | Repo fact |
| Exposed scope `access_as_user` | Same | 520, 525 | Repo fact |
| Full scope string format | Same | 525 | Repo fact |
| `resource` must be `displayName` | `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md` | §4.5 (184–194) | MS-guidance fact |
| Token provider calls `getToken(audience)` | `packages/auth/src/spfx/apiTokenProvider.ts` | 30–40 | Repo fact |
| Backend validates `API_AUDIENCE` against JWT `aud` | `backend/functions/src/middleware/validateToken.ts` | 75, 87–93 | Repo fact |
| Shell injects `__API_AUDIENCE__` | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 25, 125–127 | Repo fact |
| Build orchestrator passes `API_AUDIENCE` env var | `tools/build-spfx-package.ts` | 547 | Repo fact |
| Mount resolves `apiAudience` from config | `apps/estimating/src/mount.tsx` | 42, 59–62 | Repo fact |
| Production readiness check for audience | `apps/estimating/src/config/runtimeConfig.ts` | 181–204 | Repo fact |
| Pre-fix baseline: no `webApiPermissionRequests` in config (resolved P9-G1-02) | `apps/estimating/config/package-solution.json` | 1–40 | Repo fact (historical) |
| SPFx API permission prerequisite #6 | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 446, 702 | Repo fact |
| External prerequisite: Entra app registration | `docs/reference/developer/project-setup-connected-service-posture.md` | 87 | Repo fact |
| External prerequisite: SPFx API permission approval | Same | 88 | Repo fact |

---

## 6. Unresolved Questions and Deferred Concerns

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Should `webApiPermissionRequests` values be parameterized at build time? | **Deferred** | The `resource` display name is environment-specific. Since `API_AUDIENCE` is already injected via env vars, the build orchestrator could similarly template the permission request values. Prompt 2 implemented the static staging default; build-time parameterization remains a follow-on enhancement. |
| 2 | Has any tenant already granted the permission out-of-band? | **Operator concern** | If a tenant admin previously granted the permission via another SPFx solution or direct Entra manipulation, `getToken(audience)` may already work. The `.sppkg` declaration remains necessary for standard deployment compliance regardless. |
| 3 | `isDomainIsolated` is `false` | **Confirmed non-issue** | Current config uses the shared tenant-wide service principal model. Isolated web parts (deprecated, retiring April 2026) are not relevant. |

---

## 7. Decision Freeze Statement

The following values were frozen in P9-G1-01 and implemented in P9-G1-02:

- **`resource`**: `hb-intel-api-{environment}` — the Entra ID app registration display name (staging default `hb-intel-api-staging` currently implemented)
- **`scope`**: `access_as_user` — the delegated scope exposed on the app registration

These values are determined from repo-authoritative sources and are consistent across the full token acquisition and validation chain. Implementation is complete. Build-time parameterization of the `resource` value for multi-environment builds remains a deferred follow-on enhancement.
