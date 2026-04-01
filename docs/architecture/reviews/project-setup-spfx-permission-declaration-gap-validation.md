# SPFx Permission Declaration Gap Validation — Project Setup Requests

## Executive Summary

**Verdict: Resolved (Phase 9, Gap 1) — source-config omission closed, documentation reconciled.**

~~`apps/estimating/config/package-solution.json` does not declare `solution.webApiPermissionRequests`.~~ **Resolved:** The authoritative estimating `package-solution.json` now declares `webApiPermissionRequests` with `resource: "hb-intel-api-staging"` and `scope: "access_as_user"` (P9-G1-02). The declaration propagates faithfully through the full packaging path — source config → shell copy → `.sppkg` `AppManifest.xml` — verified in P9-G1-03. Deploying the `.sppkg` to the app catalog will now surface a pending API permission request in the SharePoint admin center for admin approval.

The Phase 8 remediation report prerequisite #6 has been updated to describe the complete approval flow: the `.sppkg` declares the permission request, the admin approves it in the SharePoint admin center "API access" page after deployment, and `getToken(audience)` then succeeds.

The app's graceful degradation remains in place — if the permission is not yet approved, the frontend falls back to `ui-review` mode with a diagnostic banner. The difference is that the standard Microsoft-documented deployment flow now provides the admin with the supported path to approve the permission.

---

## 1. Repo Evidence

### 1.1 `package-solution.json` — current state

**File:** `apps/estimating/config/package-solution.json`

The solution block now includes a `webApiPermissionRequests` declaration (added in P9-G1-02):

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

The `resource` follows the pattern `hb-intel-api-{environment}` per the IT-Department-Setup-Guide.md naming convention. The `scope` is the delegated permission exposed on the Entra app registration. Values were frozen in P9-G1-01 and implemented in P9-G1-02.

**Fact type:** Confirmed repo fact (post-fix).

> **Pre-fix baseline (historical):** Prior to P9-G1-02, the solution block did not contain a `webApiPermissionRequests` array. The version was `1.0.0.0`. A repo-wide grep for `webApiPermissionRequests` returned zero matches in application source, configuration, build scripts, or documentation.

### 1.2 Repo-wide presence of `webApiPermissionRequests`

The `webApiPermissionRequests` declaration now appears in:
- `apps/estimating/config/package-solution.json` (authoritative source)
- `tools/spfx-shell/config/package-solution.json` (build-time copy)
- Multiple Gap 1 review and closure documents

**Fact type:** Confirmed repo fact (post-fix).

---

## 2. Packaging-Path Evidence

### 2.1 Build orchestrator copies source config faithfully

**File:** `tools/build-spfx-package.ts`

The orchestrator copies the domain-specific `package-solution.json` into the shell's config directory via shallow spread (lines 506–515). No transform adds, removes, or modifies `webApiPermissionRequests`. This means the source declaration propagates as-is to the shell and subsequently into the `.sppkg`.

**Fact type:** Confirmed build-path fact.

### 2.2 Shell `package-solution.json` receives the declaration

**File:** `tools/spfx-shell/config/package-solution.json`

This file is overwritten by the orchestrator during each build with the domain's `package-solution.json`. It now contains the `webApiPermissionRequests` declaration because the source does. Verified in P9-G1-03.

**Fact type:** Confirmed build-path fact (post-fix).

### 2.3 Gulp and CI/CD pipelines do not modify permissions

The gulpfile (`tools/spfx-shell/gulpfile.js`) injects compile-time constants via webpack DefinePlugin but does not modify `package-solution.json`. CI/CD pipelines (`.github/workflows/spfx-build.yml`, `.github/workflows/spfx-deploy.yml`) do not modify solution manifests. This is correct behavior — the declaration in the source config is the single source of truth.

**Fact type:** Confirmed build-path fact.

### 2.4 Conclusion

The `webApiPermissionRequests` declaration in the authoritative source config (`apps/estimating/config/package-solution.json`) propagates unchanged through the packaging pipeline into the final `.sppkg`. The SPFx packaging pipeline translates the JSON declaration into a `<WebApiPermissionRequests>` XML element in `AppManifest.xml`. Verified end-to-end in P9-G1-03.

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

### Classification: ~~Confirmed gap~~ → Resolved (P9-G1)

| Dimension | Pre-P9 Assessment | Post-P9 Status |
|-----------|-----------|-----------|
| Source-config omission | **Yes** — `package-solution.json` lacked `webApiPermissionRequests` | **Resolved** — declaration added (P9-G1-02) |
| Packaging-pipeline omission | **Yes** — source omission propagated to `.sppkg` | **Resolved** — declaration propagates to `.sppkg` `AppManifest.xml` (P9-G1-03) |
| Architectural ambiguity | **Partial** — code pipeline complete but manifest declaration missing | **Resolved** — full chain now complete: code + manifest + packaging |
| Documentation mismatch | **Yes** — Phase 8 prerequisite #6 lacked manifest context | **Resolved** — prerequisite #6 updated with approval flow (P9-G1-04) |
| Intentional but non-standard design | **No** — no evidence of deliberate omission | **Resolved** — standard SPFx pattern now implemented |

### Is this still a production blocker?

**No.** With `webApiPermissionRequests` in the `.sppkg`:

1. Deploying the package to the app catalog WILL surface a permission request in the SharePoint admin center.
2. An admin can approve the API permission through the standard SPFx workflow.
3. After approval, `aadTokenProviderFactory.getTokenProvider().getToken(audience)` will succeed at runtime.
4. Production mode will activate when the full prerequisite chain is satisfied.

The remaining dependency is an **operator-executed action** (admin approval in SharePoint admin center), not a code or manifest gap.

---

## 6. Why the Original Verdict Was Correct and How It Was Resolved

> This section preserves the reasoning behind the original "Confirmed gap" verdict for audit trail purposes. All items have been resolved in Phase 9.

1. **The code expects SPFx token acquisition.** The full injection chain (`API_AUDIENCE` env → DefinePlugin → shell → mount → `createSpfxApiTokenProvider`) was explicitly built and verified in Phase 8 (P8-02). This is not dormant scaffolding. **Status: unchanged — the code pipeline remains correctly wired.**

2. **The token acquisition mechanism requires admin-approved permissions.** `getToken(audience)` delegates to the "SharePoint Online Client Extensibility" service principal, which only has permissions that were granted through the `webApiPermissionRequests` approval flow or (unsupported) direct Entra ID manipulation. **Status: unchanged — this requirement is architectural.**

3. ~~**The manifest does not declare the permission.**~~ **Resolved (P9-G1-02).** `package-solution.json` now declares `webApiPermissionRequests` with `resource: "hb-intel-api-staging"` and `scope: "access_as_user"`. The `.sppkg` contains the declaration in `AppManifest.xml` (verified P9-G1-03).

4. ~~**The documentation gap compounds the config gap.**~~ **Resolved (P9-G1-04).** The Phase 8 report prerequisite #6 now references the `.sppkg` manifest declaration and describes the standard admin approval flow. The connected-service-posture doc has been updated with `webApiPermissionRequests` details.

5. ~~**There is no evidence of an intentional alternate design.**~~ **Resolved (P9-G1-02).** The standard SPFx `webApiPermissionRequests` pattern is now implemented.

---

## 7. Remediation Targets

The following remediation targets were identified during validation. All have been implemented in Phase 9, Gap 1.

### 7.1 Add `webApiPermissionRequests` to `package-solution.json` — **Done (P9-G1-02)**

**File:** `apps/estimating/config/package-solution.json`

Implemented:

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-staging",
    "scope": "access_as_user"
  }
]
```

Values determined from IT-Department-Setup-Guide.md (app registration display name convention, exposed delegated scope) and frozen in `project-setup-gap-1-permission-input-freeze.md` (P9-G1-01).

### 7.2 Update Phase 8 operator prerequisites — **Done (P9-G1-04)**

**File:** `docs/architecture/reviews/project-setup-phase-8-remediation-report.md`

Prerequisite #6 updated to describe the complete approval flow: `.sppkg` declares permission → deployed to app catalog → request surfaces in SharePoint admin center → admin approves → `getToken(audience)` succeeds.

### 7.3 Update connected-service-posture — **Done (P9-G1-04)**

**File:** `docs/reference/developer/project-setup-connected-service-posture.md`

Row added documenting the `webApiPermissionRequests` declaration, its relationship to the SPFx API permission approval prerequisite, and the operator approval sequence.

### 7.4 Build-time parameterization — **Deferred**

The `resource` value (`hb-intel-api-staging`) is environment-specific. If multi-environment builds require different app registration display names, the build orchestrator can be enhanced to template this value via environment variables, similar to `API_AUDIENCE`. This is not currently blocking — the default staging value is correct for the primary deployment target.

---

## 8. Unresolved Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| 1 | What is the Entra ID app registration `displayName` for the Project Setup API? | **Resolved (P9-G1-01)** | `hb-intel-api-{environment}` per IT-Department-Setup-Guide.md naming convention. Staging default: `hb-intel-api-staging`. |
| 2 | What scope should be requested? | **Resolved (P9-G1-01)** | `access_as_user` — the delegated scope exposed on the app registration per IT-Department-Setup-Guide.md. |
| 3 | Should `webApiPermissionRequests` values be environment-specific? | **Deferred** | Yes, the `resource` display name varies by environment. Build-time parameterization can be added if multi-environment builds are needed. Not currently blocking. |
| 4 | Has the tenant already granted the required permission through another mechanism? | **Operator concern** | The `.sppkg` now declares the permission correctly. Whether a tenant has pre-existing grants is an operational matter, not a code gap. |
| 5 | Does the tenant use isolated web parts? | **Closed — non-issue** | `isDomainIsolated: false` in config. Isolated web parts deprecated (retiring April 2026). |

---

## Appendix: Evidence Index

| Evidence | File | Lines | Type |
|----------|------|-------|------|
| `webApiPermissionRequests` declaration present (post P9-G1-02; absent pre-fix) | `apps/estimating/config/package-solution.json` | 10–15 | Repo fact |
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
