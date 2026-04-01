# SPFx Production Package Targeting Audit

**Date:** 2026-04-01
**Scope:** Rebuild and verify Project Setup `.sppkg` with production-target values

## Prior State

The `.sppkg` was staging-scoped with:
- `webApiPermissionRequests.resource`: `hb-intel-api-staging`
- `FUNCTION_APP_URL`: `https://func-hb-intel-staging.azurewebsites.net`
- `API_AUDIENCE`: `api://func-hb-intel-staging`
- Source config (`apps/estimating/config/package-solution.json`) defaulted to `hb-intel-api-staging`

## Production Values Used

| Variable | Value | Source |
|----------|-------|--------|
| `SPFX_API_RESOURCE` | `hb-intel-api-production` | `gap-1-final-signoff.md:37`, `gap-1-build-verification.md:117` |
| `FUNCTION_APP_URL` | `https://func-hb-intel.azurewebsites.net` | `data-access/proxy/types.ts:5`, prior audit doc |
| `API_AUDIENCE` | `api://func-hb-intel` | `P1-B1:235`, `IT-Department-Setup-Guide.md:642` |
| `BACKEND_MODE` | `production` | Intended runtime mode |
| `ALLOW_BACKEND_MODE_SWITCH` | `false` | Security hardened |

## Build Command

```bash
SPFX_API_RESOURCE=hb-intel-api-production \
FUNCTION_APP_URL=https://func-hb-intel.azurewebsites.net \
API_AUDIENCE=api://func-hb-intel \
BACKEND_MODE=production \
ALLOW_BACKEND_MODE_SWITCH=false \
npx tsx tools/build-spfx-package.ts --domain estimating
```

## Fresh Artifact

| Attribute | Value |
|-----------|-------|
| **File** | `dist/sppkg/hb-intel-project-setup.sppkg` |
| **Size** | 336 KB |
| **Version** | `001.000.020` |
| **Shell hash** | `f054fade95d27a82112d` |
| **Bundle hash** | `c24cc323` |

## Packaged Shell Asset Audit

**Shell JS:** `ClientSideAssets/shell-web-part_f054fade95d27a82112d.js`

| Check | Result | Evidence |
|-------|--------|----------|
| `FUNCTION_APP_URL` | **PASS** | `func-hb-intel.azurewebsites.net` (production, no `-staging`) |
| `API_AUDIENCE` | **PASS** | `api://func-hb-intel` (production, no `-staging`) |
| `BACKEND_MODE` | **PASS** | `"production"` |
| Staging residue | **PASS** | Zero occurrences of `func-hb-intel-staging` |
| Bundle reference | **PASS** | `estimating-app-c24cc323.js` |
| Global name | **PASS** | `__hbIntel_projectSetup` |

## AppManifest.xml Audit

| Check | Result |
|-------|--------|
| `Version` | `001.000.020` |
| `WebApiPermissionRequest ResourceId` | **`hb-intel-api-production`** |
| `Scope` | `access_as_user` |

## Source Config Changes

The source default for `webApiPermissionRequests.resource` has been changed from `hb-intel-api-staging` to `hb-intel-api-production` in `apps/estimating/config/package-solution.json`. This means:
- **Default builds** (no `SPFX_API_RESOURCE` env var) now produce production-targeted packages
- **Staging builds** must explicitly set `SPFX_API_RESOURCE=hb-intel-api-staging`

## Environment-Scope Conclusion

The `.sppkg` is **explicitly production-targeted**. All injected values target the production environment. Zero staging residue found in the packaged shell asset or manifest.

## Build Commands by Environment

| Environment | Command |
|-------------|---------|
| **Production** (default) | `FUNCTION_APP_URL=https://func-hb-intel.azurewebsites.net API_AUDIENCE=api://func-hb-intel BACKEND_MODE=production npx tsx tools/build-spfx-package.ts --domain estimating` |
| **Staging** | `SPFX_API_RESOURCE=hb-intel-api-staging FUNCTION_APP_URL=https://func-hb-intel-staging.azurewebsites.net API_AUDIENCE=api://func-hb-intel-staging BACKEND_MODE=production npx tsx tools/build-spfx-package.ts --domain estimating` |
