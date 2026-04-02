# P10-04 — SPFx Package Permissions and Approval Path Alignment

> **Created:** 2026-04-02  
> **Phase:** 10 — Accounting SPFx Production Gap Closure  
> **Status:** Complete

## Objective

Align the Accounting SPFx package's SharePoint API permission declaration with the production auth model frozen in P10-03.

## Decision

**Accounting must declare `webApiPermissionRequests`.** Rationale:

- Accounting calls the same backend API endpoints as Project Setup (`/api/project-setup-requests`, `/api/provisioning-status/{projectId}`)
- Both surfaces share the same backend host (`backend/functions/src/hosts/project-setup/`)
- Backend token validation requires `API_AUDIENCE` and `access_as_user` delegated scope
- Frontend token acquisition via `createSpfxApiTokenProvider()` (P10-02/P10-03) acquires audience-scoped tokens that require the SharePoint admin to have approved the API permission
- Without the declaration, the `.sppkg` does not trigger the SharePoint admin approval flow and the SPFx `AadTokenProvider` cannot acquire tokens for the backend resource

## Package Config Change

Added to `apps/accounting/config/package-solution.json`:

```json
"webApiPermissionRequests": [
  {
    "resource": "hb-intel-api-production",
    "scope": "access_as_user"
  }
]
```

This matches `apps/estimating/config/package-solution.json` exactly:

| Field | Accounting | Project Setup |
|-------|-----------|---------------|
| `resource` | `hb-intel-api-production` | `hb-intel-api-production` |
| `scope` | `access_as_user` | `access_as_user` |

## Version Alignment

Fixed feature version drift — previous patch bumps only updated the solution version (trailing comma difference in `replace_all`). Both solution and feature versions now synchronized at `001.000.022`.

## Deployment and Approval Requirements

### Package-declared approvals (in `.sppkg`)

| Requirement | Declaration | Admin action |
|-------------|-------------|-------------|
| API permission for `hb-intel-api-production` | `webApiPermissionRequests` in `package-solution.json` | SharePoint admin center → API access → Approve pending request after `.sppkg` deployment |

### Entra app-registration requirements (Azure portal)

| Requirement | Configuration | Owner |
|-------------|---------------|-------|
| App registration with `api://<client-id>` audience | Must exist with `access_as_user` scope defined | Azure AD admin |
| App registration display name | `hb-intel-api-production` | Azure AD admin |

### Function App config requirements (Azure portal)

| Requirement | Configuration | Owner |
|-------------|---------------|-------|
| `API_AUDIENCE` | Must match `api://<client-id>` from app registration | DevOps / deployment |
| `AZURE_TENANT_ID` | Entra tenant GUID | DevOps / deployment |
| `AZURE_CLIENT_ID` | User-assigned Managed Identity client ID | DevOps / deployment |

### Tenant/admin actions outside the repo

| Action | When | Who |
|--------|------|-----|
| Deploy `.sppkg` to SharePoint app catalog | After package build | SharePoint admin |
| Approve API permission request | After `.sppkg` deployment | SharePoint admin |
| Verify approval in SharePoint admin center → API access | After approval | SharePoint admin |

### Build-time override for staging

The build orchestrator (`tools/build-spfx-package.ts`) supports `SPFX_API_RESOURCE` env var to override the resource name at build time (e.g., `hb-intel-api-staging` for staging builds). The `package-solution.json` default targets production.

## Verification

| Check | Result |
|-------|--------|
| `pnpm --filter @hbc/spfx-accounting lint` | 0 errors, 5 warnings (unchanged) |
| `pnpm --filter @hbc/spfx-accounting build` | Passed — 1,027 KB IIFE bundle |
| `pnpm --filter @hbc/spfx-accounting test` | 55 tests passed across 6 test files |

## Files Changed

| File | Action |
|------|--------|
| `apps/accounting/config/package-solution.json` | Added `webApiPermissionRequests`, bumped version to `001.000.022`, synchronized feature version |
