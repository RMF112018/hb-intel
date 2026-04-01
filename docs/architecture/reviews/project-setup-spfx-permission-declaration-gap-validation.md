# SPFx Permission Declaration Gap Validation — Project Setup Requests

## Executive Summary

**Verdict: Confirmed gap — source-config omission with documentation mismatch.**

`apps/estimating/config/package-solution.json` does not declare `solution.webApiPermissionRequests`, even though the Project Setup frontend is designed to acquire audience-scoped tokens via SPFx's `aadTokenProviderFactory.getToken(audience)`. No build step, packaging transform, or shell-side config injects the declaration into the final `.sppkg`. Microsoft documentation confirms that `webApiPermissionRequests` is the only supported mechanism for requesting admin approval of API permissions for the "SharePoint Online Client Extensibility" service principal. Without the declaration, deploying the `.sppkg` to the app catalog will not surface a pending permission request in the SharePoint admin center.

The Phase 8 remediation report correctly identifies "SPFx API permission approved" as an operator prerequisite (#6), but does not identify that the manifest declaration needed to trigger that approval through the standard SPFx flow is missing from the solution config. The term `webApiPermissionRequests` does not appear anywhere in repo-owned source code or documentation.

The gap is mitigated by the app's graceful degradation: when the token provider is unavailable, the app falls back to `ui-review` mode with a diagnostic banner. However, the omission means that the standard Microsoft-documented deployment flow cannot activate production mode without manual, out-of-band admin intervention.

---

## 1. Repo Evidence

### 1.1 `package-solution.json` — no `webApiPermissionRequests`

**File:** `apps/estimating/config/package-solution.json`

The solution block declares `name`, `id`, `version`, `includeClientSideAssets`, `skipFeatureDeployment`, `isDomainIsolated`, `developer`, `metadata`, and `features`. There is no `webApiPermissionRequests` array.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "hb-intel-project-setup",
    "id": "d01a9600-a68a-4afe-83a5-514339f47dbb",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": { ... },
    "metadata": { ... },
    "features": [ ... ]
  },
  "paths": {
    "zippedPackage": "solution/hb-intel-project-setup.sppkg"
  }
}
```

**Fact type:** Confirmed repo fact.

### 1.2 Repo-wide search for `webApiPermissionRequests`

A repo-wide grep for `webApiPermissionRequests` returns zero matches in application source, configuration, build scripts, or documentation. The term appears only in SPFx framework type definitions under `node_modules/`.

**Fact type:** Confirmed repo fact.

---

## 2. Packaging-Path Evidence

### 2.1 Build orchestrator does not inject permissions

**File:** `tools/build-spfx-package.ts`

The orchestrator copies the domain-specific `package-solution.json` into the shell's config directory as a straight file copy (lines 506–515). No transform adds, merges, or modifies `webApiPermissionRequests`.

**Fact type:** Confirmed build-path fact.

### 2.2 Shell `package-solution.json` has no permissions

**File:** `tools/spfx-shell/config/package-solution.json`

This file is overwritten by the orchestrator during each build with the domain's `package-solution.json`. It contains no `webApiPermissionRequests` because the source does not.

**Fact type:** Confirmed build-path fact.

### 2.3 Gulp pipeline does not inject permissions

**File:** `tools/spfx-shell/gulpfile.js`

The gulpfile injects compile-time constants via webpack DefinePlugin (line 32) but does not modify `package-solution.json` or inject permission declarations.

**Fact type:** Confirmed build-path fact.

### 2.4 CI/CD pipelines do not inject permissions

`.github/workflows/spfx-build.yml` and `.github/workflows/spfx-deploy.yml` do not modify solution manifests or inject `webApiPermissionRequests`.

**Fact type:** Confirmed build-path fact.

### 2.5 Conclusion

There is no mechanism in the packaging pipeline that adds `webApiPermissionRequests` to the final `.sppkg`. The omission in the source config propagates unchanged to the deployed package.

---

## 3. Frontend Auth/Token-Acquisition Evidence

### 3.1 Token acquisition code is implemented and active

**File:** `packages/auth/src/spfx/apiTokenProvider.ts` (lines 30–40)

```typescript
export function createSpfxApiTokenProvider(
  context: WebPartContext | null,
  audience: string,
): (() => Promise<string>) | undefined {
  if (!context || !audience) return undefined;

  return async (): Promise<string> => {
    const tokenProvider = await context.aadTokenProviderFactory.getTokenProvider();
    return tokenProvider.getToken(audience);
  };
}
```

This function calls `aadTokenProviderFactory.getTokenProvider()` and then `tokenProvider.getToken(audience)` — the standard SPFx API token acquisition pattern. It requires the "SharePoint Online Client Extensibility" service principal to have a delegated permission grant for the specified audience.

**Fact type:** Confirmed repo fact.

### 3.2 Shell injection chain is complete (P8-02)

The `apiAudience` value flows end-to-end through the build and runtime pipeline:

| Stage | File | Line(s) | Mechanism |
|-------|------|---------|-----------|
| CI/deployment | Environment variable | — | `API_AUDIENCE` env var |
| Orchestrator | `tools/build-spfx-package.ts` | 547 | `shellEnv.API_AUDIENCE = process.env.API_AUDIENCE ?? ''` |
| DefinePlugin | `tools/spfx-shell/gulpfile.js` | 32 | `__API_AUDIENCE__: JSON.stringify(process.env.API_AUDIENCE \|\| '')` |
| Shell declare | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 25 | `declare const __API_AUDIENCE__: string` |
| Shell inject | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 125–127 | `runtimeConfig.apiAudience = __API_AUDIENCE__` (conditional) |
| Mount config | `apps/estimating/src/mount.tsx` | 42, 59–62 | `setRuntimeConfig(config)` then `getApiAudience()` |
| Token provider | `apps/estimating/src/mount.tsx` | 61 | `createSpfxApiTokenProvider(spfxContext, apiAudience)` |

This chain was incomplete before P8-02 (the shell lacked `__API_AUDIENCE__`) and was closed as part of Phase 8. The code pipeline is now fully wired.

**Fact type:** Confirmed repo fact.

### 3.3 Production readiness gating

**File:** `apps/estimating/src/config/runtimeConfig.ts` (lines 181–204)

When `apiAudience` is absent or the token provider cannot be created, `checkProductionReadiness()` reports:

> "API token provider is not available. In SPFx runtime, ensure apiAudience is configured and the API permission is approved in SharePoint admin center."

The app falls back to `ui-review` mode with a console warning and diagnostic banner.

**Fact type:** Confirmed repo fact.

### 3.4 Backend token validation requires matching audience

**File:** `backend/functions/src/middleware/validateToken.ts` (lines 64–94)

The backend requires `API_AUDIENCE` to be explicitly configured and validates that inbound JWT `aud` claims match it. This confirms that the intended production path requires audience-scoped tokens flowing from the frontend.

**Fact type:** Confirmed repo fact.

---

## 4. Microsoft Guidance Summary

Sources consulted:

- [Connect to Entra ID-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient)
- [Consume enterprise APIs secured with Azure AD in SharePoint Framework](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient-enterpriseapi)
- [Manage access to Microsoft Entra ID-secured APIs](https://learn.microsoft.com/en-us/sharepoint/api-access)
- [AadTokenProvider API reference](https://learn.microsoft.com/en-us/javascript/api/sp-http-base/aadtokenprovider)

### 4.1 `webApiPermissionRequests` is the supported request mechanism

Microsoft documents that SPFx solutions calling Entra-secured APIs must declare required permissions in `config/package-solution.json` via the `webApiPermissionRequests` array. When the `.sppkg` is deployed to the app catalog, SharePoint creates pending permission requests that appear in the SharePoint admin center's "API access" page for admin approval.

### 4.2 Permissions are tenant-wide and granted to a shared service principal

Approved permissions are added as delegated grants on the "SharePoint Online Client Extensibility Web Application Principal" in Entra ID. Permissions are **tenant-wide** — once granted, they apply to all SPFx solutions in the tenant, not just the requesting solution. Removing a solution does not revoke the granted permission.

### 4.3 No supported alternate mechanism

Microsoft explicitly states that direct manipulation of the "SharePoint Online Client Extensibility" service principal in Entra ID "can result in unpredictable behaviors and is not supported." The `webApiPermissionRequests` pipeline (declaration → deployment → admin approval) is the only supported mechanism to request and grant API permissions.

### 4.4 `getToken(audience)` requires prior permission grant

`AadTokenProvider.getToken(resourceEndpoint)` operates through the "SharePoint Online Client Extensibility" service principal. If no permission for the requested audience has been granted to this principal, the token acquisition will fail. Without a `webApiPermissionRequests` declaration in the `.sppkg`, no pending approval request is created during deployment, meaning the admin has no supported path to grant the permission through the standard SPFx workflow.

### 4.5 Custom enterprise APIs follow the same pattern as Microsoft Graph

The mechanism is identical. For a custom enterprise API, the declaration takes the form:

```json
"webApiPermissionRequests": [
  {
    "resource": "<app-registration-display-name>",
    "scope": "<scope-name>"
  }
]
```

The `resource` must be the `displayName` of the Entra ID application (not `objectId` or `clientId`).

**Fact type:** Confirmed Microsoft-guidance fact.

---

## 5. Gap Verdict

### Classification: Confirmed gap

| Dimension | Assessment |
|-----------|-----------|
| Source-config omission | **Yes** — `package-solution.json` lacks `webApiPermissionRequests` |
| Packaging-pipeline omission | **Yes** — no transform injects it; source omission propagates to `.sppkg` |
| Architectural ambiguity | **Partial** — the code pipeline is complete and intentional, but the manifest declaration that completes the deployment flow was not included |
| Documentation mismatch | **Yes** — Phase 8 prerequisite #6 says "SPFx API permission approved" but does not identify the missing manifest declaration as the mechanism to trigger that approval |
| Intentional but non-standard design | **No** — there is no evidence of a deliberate decision to omit the declaration or use an alternate permission-granting mechanism |

### Is this a true production blocker?

**Yes, conditionally.** Without `webApiPermissionRequests` in the `.sppkg`:

1. Deploying the package to the app catalog will NOT surface a permission request in the SharePoint admin center.
2. An admin cannot approve the API permission through the standard SPFx workflow.
3. `aadTokenProviderFactory.getTokenProvider().getToken(audience)` will fail at runtime (unless the permission was previously granted by another solution or through unsupported direct manipulation).
4. The frontend will detect the failure and fall back to `ui-review` mode, preventing silent breakage but blocking production use.

The gap is **mitigated** by the app's graceful degradation but **not resolved** by it — production mode cannot activate through the standard deployment path.

---

## 6. Why the Verdict Is Correct

1. **The code expects SPFx token acquisition.** The full injection chain (`API_AUDIENCE` env → DefinePlugin → shell → mount → `createSpfxApiTokenProvider`) was explicitly built and verified in Phase 8 (P8-02). This is not dormant scaffolding.

2. **The token acquisition mechanism requires admin-approved permissions.** `getToken(audience)` delegates to the "SharePoint Online Client Extensibility" service principal, which only has permissions that were granted through the `webApiPermissionRequests` approval flow or (unsupported) direct Entra ID manipulation.

3. **The manifest does not declare the permission.** `package-solution.json` has no `webApiPermissionRequests` array. No build step injects one. The `.sppkg` will not contain a permission request.

4. **The documentation gap compounds the config gap.** The Phase 8 report correctly identifies that SPFx API permission approval is an operator prerequisite, but the operator has no standard path to fulfill it because the `.sppkg` does not request the permission. The documentation does not mention `webApiPermissionRequests` or identify the missing declaration.

5. **There is no evidence of an intentional alternate design.** No ADR, plan, or code comment explains why `webApiPermissionRequests` was omitted or describes an alternate permission-granting strategy.

---

## 7. Remediation Targets

The following changes would close the gap. **These are not implemented in this validation — they are identified for a follow-up implementation prompt.**

### 7.1 Add `webApiPermissionRequests` to `package-solution.json`

**File:** `apps/estimating/config/package-solution.json`

Add to the `solution` block:

```json
"webApiPermissionRequests": [
  {
    "resource": "<entra-app-registration-display-name>",
    "scope": "<scope-name>"
  }
]
```

**Blocking question:** The exact `resource` (Entra ID app registration display name) and `scope` values depend on the target environment's app registration configuration. These must be determined by the operator or documented in a deployment-specific config guide.

### 7.2 Update Phase 8 operator prerequisites

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

Prerequisite #6 should note that the `.sppkg` now declares the permission request and the admin must approve it in the SharePoint admin center "API access" page after deployment.

### 7.3 Update connected-service-posture

**File:** `docs/reference/developer/project-setup-connected-service-posture.md`

Add a row or note documenting the `webApiPermissionRequests` declaration and its relationship to the SPFx API permission approval prerequisite.

### 7.4 Consider build-time parameterization

The `resource` and `scope` values in `webApiPermissionRequests` may need to vary by deployment environment (dev, staging, production). If so, the build orchestrator (`tools/build-spfx-package.ts`) may need to template or inject these values, similar to how `API_AUDIENCE` is already injected via environment variables.

---

## 8. Unresolved Questions

| # | Question | Why It Matters |
|---|----------|---------------|
| 1 | What is the Entra ID app registration `displayName` for the Project Setup API? | Required as the `resource` value in `webApiPermissionRequests`. Using `objectId` or `clientId` will cause approval errors per Microsoft docs. |
| 2 | What scope should be requested (e.g., `user_impersonation`, `.default`, custom)? | Determines the delegated permission grant on the service principal. Must match what the backend validates. |
| 3 | Should `webApiPermissionRequests` values be environment-specific? | If the app registration differs between dev/staging/prod, the build pipeline may need to template the declaration, which is not a standard SPFx pattern. |
| 4 | Has the tenant already granted the required permission through another mechanism? | If a previous SPFx solution or manual admin action already granted the permission tenant-wide, `getToken(audience)` may already work. This would make the gap non-blocking for that specific tenant but the `.sppkg` would still be non-standard. |
| 5 | Does the tenant use isolated web parts? | Isolated web parts (deprecated, retiring April 2026) use per-solution service principals instead of the shared tenant-wide principal. If this deployment targets isolated mode, the permission model differs. Current config has `isDomainIsolated: false`, so this is unlikely. |

---

## Appendix: Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| No `webApiPermissionRequests` in solution config | `apps/estimating/config/package-solution.json` | 1–40 | Repo fact |
| Token provider implementation | `packages/auth/src/spfx/apiTokenProvider.ts` | 30–40 | Repo fact |
| Shell `__API_AUDIENCE__` declare and inject | `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts` | 25, 125–127 | Repo fact |
| Orchestrator `API_AUDIENCE` passthrough | `tools/build-spfx-package.ts` | 547 | Repo fact |
| Gulpfile DefinePlugin injection | `tools/spfx-shell/gulpfile.js` | 32 | Repo fact |
| Mount config audience resolution | `apps/estimating/src/mount.tsx` | 42, 59–62 | Repo fact |
| Runtime config `getApiAudience()` | `apps/estimating/src/config/runtimeConfig.ts` | 161–174 | Repo fact |
| Production readiness check | `apps/estimating/src/config/runtimeConfig.ts` | 181–204 | Repo fact |
| Backend audience validation | `backend/functions/src/middleware/validateToken.ts` | 64–94 | Repo fact |
| Phase 8 prerequisite #6 | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 446, 702 | Repo fact |
| P8-02 apiAudience injection closure | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | 180, 207, 257 | Repo fact |
| No build-time permission injection | `tools/build-spfx-package.ts` | 506–515 | Build-path fact |
| Microsoft: webApiPermissionRequests required | Microsoft Learn (see §4 citations) | — | MS-guidance fact |
| Microsoft: service principal is tenant-wide | Microsoft Learn (see §4 citations) | — | MS-guidance fact |
| Microsoft: direct Entra ID manipulation unsupported | Microsoft Learn (see §4 citations) | — | MS-guidance fact |
