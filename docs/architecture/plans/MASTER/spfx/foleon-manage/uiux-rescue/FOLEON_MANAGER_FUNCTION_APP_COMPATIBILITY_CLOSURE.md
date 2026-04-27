# Foleon Manager Function App Compatibility Closure

## Issue Summary

After deploying `HB Intel Foleon Manager 1.0.30.0`, the SharePoint-hosted Manager failed before rendering the rebuilt admin workspace:

```text
Foleon Manager cannot load yet
Unable to verify backend safe configuration before loading Manager reads.
backend-safe-config-unavailable
```

Tenant console evidence showed the browser blocked `GET /api/foleon/config` because the frontend request used credentialed CORS:

```text
Access-Control-Allow-Credentials header ... must be 'true' when the request's credentials mode is 'include'.
```

## Root Cause

The frontend management API wrapper forced `credentials: 'include'` on all Function App calls even though the Foleon Function App routes authorize with `Authorization: Bearer <token>` and do not use cookies.

This made the browser require credentialed CORS (`Access-Control-Allow-Credentials: true`) for a route that should only require:

- an allowed SharePoint origin;
- allowed request headers including `authorization`;
- a valid Entra Bearer token for the API.

## Files Inspected

Frontend:
- `apps/hb-intel-foleon/src/services/FoleonManagementApi.ts`
- `apps/hb-intel-foleon/src/services/__tests__/FoleonManagementApi.test.ts`
- `apps/hb-intel-foleon/src/runtime/`
- `apps/hb-intel-foleon/src/webparts/foleon/`
- `apps/hb-intel-foleon/config/package-solution.json`

Backend:
- `backend/functions/src/functions/adminApi/foleon-routes.ts`
- `backend/functions/src/middleware/auth.ts`
- `backend/functions/src/middleware/validateToken.ts`
- `backend/functions/src/middleware/authorization.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/services/foleon-service.ts`
- `backend/functions/src/services/foleon-types.ts`
- `backend/functions/host.json`
- `backend/functions/package.json`

Registry / packaging:
- `tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1`
- `tools/spfx-shell/src/webparts/shell/`
- `tools/spfx-shell/config/package-solution.json`
- `docs/architecture/plans/MASTER/platform/config-registry/`

## Function App CORS Findings

Azure CORS configuration read from the Function App:

```json
{
  "allowedOrigins": [
    "https://portal.azure.com",
    "https://hedrickbrotherscom.sharepoint.com"
  ],
  "supportCredentials": false
}
```

This is compatible with non-cookie Bearer-token requests. It is not compatible with frontend requests that force `credentials: "include"`.

Preflight validation:

```text
OPTIONS /api/foleon/config
HTTP/1.1 204 No Content
Access-Control-Allow-Headers: authorization,content-type,accept
Access-Control-Allow-Methods: GET
Access-Control-Allow-Origin: https://hedrickbrotherscom.sharepoint.com
Vary: Origin
```

## Function App App-Settings Findings

App setting names were listed without values. Relevant inbound auth settings are present by name:

- `AZURE_TENANT_ID`
- `API_AUDIENCE`

The setting-name inventory did not show the expected `HB_FOLEON_*` backend configuration names from repo truth, including:

- `HB_FOLEON_SHAREPOINT_SITE_URL`
- `HB_FOLEON_GRAPH_SITE_ID`
- `HB_FOLEON_CONTENT_REGISTRY_LIST_ID`
- `HB_FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID`
- `HB_FOLEON_SYNC_RUNS_LIST_ID`
- `HB_FOLEON_CLIENT_ID`
- `HB_FOLEON_CLIENT_SECRET`

If the deployed app is not intentionally using alternate configuration names or mock mode, this is likely the next backend configuration blocker after CORS/request-mode remediation.

## SPFx Token / Audience Findings

Foleon Manager token acquisition uses `foleonApiResource` from registry or web part properties. That value must match the Entra exposed API Application ID URI accepted by the Function App as `API_AUDIENCE`.

Expected relationship:

```text
SPFx FoleonApiResource
= Entra exposed API Application ID URI
= Function App API_AUDIENCE
= aud claim accepted by validateToken()
```

The frontend still sends `Authorization: Bearer <token>` when `contract.getAccessToken()` returns a token. Missing or empty token acquisition does not add an `Authorization` header.

## Backend Route Compatibility Findings

The Function App has the Manager route surface expected by the frontend:

- `GET /api/foleon/config`
- `GET /api/foleon/content`
- `GET /api/foleon/content/{id}`
- `POST /api/foleon/content`
- `PATCH /api/foleon/content/{id}`
- `POST /api/foleon/content/{id}/validate`
- `POST /api/foleon/content/{id}/publish`
- `POST /api/foleon/content/{id}/suppress`
- `GET /api/foleon/placements`
- `POST /api/foleon/placements`
- `PATCH /api/foleon/placements/{id}`
- `DELETE /api/foleon/placements/{id}`
- `POST /api/foleon/sync/docs`
- `POST /api/foleon/sync/projects`
- `GET /api/foleon/sync/status`
- `GET /api/foleon/sync/runs`
- `POST /api/foleon/provision-sharepoint`
- `POST /api/foleon/validate-sharepoint`

All routes are registered with Azure Functions `authLevel: "anonymous"` and protected in code by `withAuth` and Foleon route authorization. The safe-config route uses the `view` action.

Cookies are not used for backend auth.

## Registry / List Relationship Findings

Repo-truth registry validation expects:

- `FoleonApiBaseUrl` or fallback `BackendFunctionAppUrl` as an HTTPS Function App origin without `/api`.
- `FoleonApiResource` as a bare `api://...` Application ID URI with no `/.default`.
- Foleon list GUID records for content registry, homepage placements, interaction events, and sync runs.
- No duplicate active registry keys.
- Secret-like values stored only as secret references, not inline SharePoint registry values.

Tenant registry validation was not run in this local pass. Use:

```powershell
pwsh tools/pnp-runner-local/scripts/validate-platform-configuration-registry.ps1 `
  -SiteUrl "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral" `
  -AppId "08c399eb-a394-4087-b859-659d493f8dc7" `
  -Tenant "hedrickbrothers.com" `
  -EnvironmentKey "Production"
```

## Changes Made

Frontend request-mode fix:
- Removed `credentials: "include"` from the shared Foleon management API request wrapper.
- Preserved `Authorization: Bearer <token>` for successful token acquisition.
- Preserved `buildApiUrl()` behavior for absolute Function App origins and same-origin `/api` paths.

Tests:
- Added coverage that Bearer auth remains present when a token exists.
- Added coverage that fetch options no longer force credentialed CORS.
- Added coverage that no Authorization header is sent when token acquisition is absent or empty.
- Added URL composition coverage for a path without a leading slash.

Version/package:
- Bumped Foleon SPFx governance from `1.0.30.0` to `1.0.31.0`.
- Packaged and proved `hb-intel-foleon.sppkg`.

## Version / Deployment Notes

Updated SPFx version: `1.0.31.0`.

Package proof:
- Package: `dist/sppkg/hb-intel-foleon.sppkg`
- SHA-256: `77473d127dcbfe633a7d689c0a4e3c453bb8ee933904bada9a7a513721d616da`
- Solution version: `1.0.31.0`
- Feature version: `1.0.31.0`
- Component ID: `2160edb3-675e-4451-92bb-8345f9d1c71e`
- Manager toolbox route: `foleonRoute=manage`

Packaged assets:
- App JS: `hb-intel-foleon-app-d8380e60.js`
- Shell entry JS: `shell-entry-2160edb3-675e-4451-92bb-8345f9d1c71e-69881dab.js`
- Canonical shell JS: `shell-web-part_b631fda0bc9a0d6aeb28.js`
- CSS: `spfx-hb-intel-foleon-f9137adf.css`

## Validation Commands And Results

- `git status --short`: completed; unrelated Project Spotlight phase-05 docs remain untracked and were not staged.
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint`: pass with existing non-fatal warnings.
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types`: pass.
- `pnpm --filter @hbc/spfx-hb-intel-foleon test`: pass, 30 files / 309 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon build`: pass.
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate`: pass, 498 checks.
- `npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon`: pass through Node `v18.20.8`.
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof`: pass.
- `az functionapp cors show --resource-group hb-intel --name hb-intel-function-app`: pass/read.
- `az functionapp config appsettings list --resource-group hb-intel --name hb-intel-function-app --query "[].name" -o tsv`: pass/read names only.
- `curl -i -X OPTIONS .../api/foleon/config`: pass, 204 with allowed SharePoint origin and allowed headers.
- `curl -i .../api/foleon/config -H "Origin: https://hedrickbrotherscom.sharepoint.com"`: returns controlled `401 Unauthorized` with `Access-Control-Allow-Origin`, proving the route returns a real API response instead of a CORS block when no token is sent.

## Hosted Network Proof

Local network proof before deployment:

```text
GET /api/foleon/config without token
HTTP/1.1 401 Unauthorized
Access-Control-Allow-Origin: https://hedrickbrotherscom.sharepoint.com
{"error":"Unauthorized","reason":"Missing or malformed Authorization header"}
```

This is successful evidence for the distinction required by the execution guardrail: a controlled `401` is a post-CORS authorization result, not the original credentialed CORS failure.

Required after deployment:
- Browser DevTools network proof for actual hosted `GET /api/foleon/config`.
- Acceptance condition: the browser no longer blocks the request due to credentialed CORS.
- If the deployed request returns `401`, `403`, or a backend diagnostic, record that separately under Auth/Audience/Role Authorization or backend configuration.

## Hosted Screenshot Notes

Screenshots were not captured in this local pass because the updated `1.0.31.0` package was built/proved but not deployed from this environment.

Required after deployment:
- 100% hosted Manager screenshot.
- Config tab screenshot if Manager loads.
- Browser console relevant Foleon lines.
- Loaded JS/CSS asset names showing `hb-intel-foleon-app-d8380e60.js` and `spfx-hb-intel-foleon-f9137adf.css`, or the deployed equivalent if repackaged.

## Remaining Risks / Manual Actions

- Deploy `hb-intel-foleon.sppkg` version `1.0.31.0` to the tenant.
- Validate the actual browser `GET /api/foleon/config` after deployment.
- If CORS is cleared but the response is `401`/`403`, investigate token acquisition, `FoleonApiResource`, `API_AUDIENCE`, `access_as_user`, and Foleon app roles.
- If CORS/auth is cleared but safe-config returns backend diagnostics, configure or validate the missing Foleon backend app settings and SharePoint list relationships.
- Run tenant registry validation for Production.
- If a Function App publish profile is used for deployment, rotate/reset it afterward.

## Commit Hash

Pending until commit creation.
