# Project Setup Deployment Readiness Checklist

## Executive Summary

This checklist defines the go/no-go gates for staging, pilot, and production deployment of the Project Setup / Accounting / provisioning solution. It translates the Phase 7 security, CORS, environment, and connected-service findings into explicit deployment criteria with clear ownership boundaries between code owners and tenant/platform administrators.

**Readiness levels (in order):**

1. **Code-complete** — all required code is merged, tested, and verified
2. **Environment-ready** — all infrastructure resources and env vars are provisioned
3. **Tenant-ready** — all admin consents, permission grants, and API approvals are in place
4. **Production-approved** — all gates pass and stakeholders sign off

**Source authority:** This checklist is derived from:
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`
- `docs/architecture/reviews/project-setup-phase-7-security-and-connected-services-audit.md`

**Created by:** Phase 7 Prompt-05 (P7-05), 2026-04-02

---

## Code-Complete Criteria

All code-complete items are owned by the development team.

| # | Criterion | Verification | Status |
|---|----------|-------------|--------|
| C-1 | Auth middleware (`withAuth`, `validateToken`, `authorization`) merged and tested | Unit tests pass; release gate tests pass | Done |
| C-2 | Service factory (`createProjectSetupServiceFactory`) merged with tiered startup validation | Startup validation tests pass | Done |
| C-3 | All 9 service implementations have production and mock variants | Service factory instantiates all services in both modes | Done |
| C-4 | Adapter mode guard blocks mock in production | `assertAdapterModeValid()` tests pass | Done |
| C-5 | CORS config: Project Setup host restricts to single exact origin | Release gate test enforces no wildcard | Done |
| C-6 | Provisioning prerequisites validation (`validateProvisioningPrerequisites`) merged | Saga-time validation tests pass | Done |
| C-7 | Sites.Selected / fullcontrol permission model switching merged | `diagnosePermissionModel()` tests pass | Done |
| C-8 | SPFx permission request declared in estimating `package-solution.json` | `webApiPermissionRequests` present for `hb-intel-api-production` / `access_as_user` | Done |
| C-9 | Token acquisition via `createSpfxApiTokenProvider` merged | Auth package exports available | Done |
| C-10 | Accounting lint, typecheck, and build pass clean | `pnpm --filter @hbc/spfx-accounting lint && build` | Done |

---

## Environment-Ready Criteria

Environment items are owned by DevOps/platform team.

| # | Criterion | Owner | Verification |
|---|----------|-------|-------------|
| E-1 | Azure Function App resource provisioned | DevOps | Resource exists in target subscription |
| E-2 | `AZURE_TENANT_ID` set in Function App configuration | DevOps | Non-empty in app settings |
| E-3 | `AZURE_CLIENT_ID` set to user-assigned MI client ID | DevOps | Matches MI resource client ID |
| E-4 | `AZURE_TABLE_ENDPOINT` set to Table Storage endpoint | DevOps | Resolves to valid storage account |
| E-5 | `APPLICATIONINSIGHTS_CONNECTION_STRING` set | DevOps | App Insights resource receives telemetry |
| E-6 | `API_AUDIENCE` set to `api://<app-registration-client-id>` | DevOps | Matches app registration Application ID URI |
| E-7 | `HBC_ADAPTER_MODE` set to `proxy` | DevOps | Not `mock`; startup guard passes |
| E-8 | `SHAREPOINT_TENANT_URL` set | DevOps | Valid SharePoint tenant URL |
| E-9 | `SHAREPOINT_PROJECTS_SITE_URL` set | DevOps | Valid SharePoint site URL |
| E-10 | User-assigned Managed Identity created and assigned to Function App | DevOps | MI resource exists; assigned to Function App identity |
| E-11 | Storage account with Table Storage RBAC for MI | DevOps | `Storage Table Data Contributor` role assigned |
| E-12 | App Insights resource provisioned | DevOps | Connection string resolves |
| E-13 | Azure CORS settings match repo `host.json` intent | DevOps | Portal CORS matches or is more restrictive than `https://hedrickbrotherscom.sharepoint.com` |
| E-14 | `AzureSignalRConnectionString` set (optional) | DevOps | If set, SignalR resource exists; if absent, NoOp fallback activates |

---

## Tenant-Ready Criteria

Tenant items are owned by IT / Identity / SharePoint administration.

| # | Criterion | Owner | Verification |
|---|----------|-------|-------------|
| T-1 | App registration `hb-intel-api-production` exists in Entra ID | IT / Identity | App registration visible in Azure portal |
| T-2 | `accessTokenAcceptedVersion` is null or 1 in app registration | IT / Identity | Token `aud` claim uses `api://` format |
| T-3 | `access_as_user` scope exposed in app registration | IT / Identity | Scope visible in app registration > Expose an API |
| T-4 | App roles configured: Admin, HBIntelAdmin, Controller, HBIntelController, BreakGlass, Automation | IT / Identity | Roles visible in app registration manifest |
| T-5 | `Group.ReadWrite.All` granted to MI service principal | IT / Identity | Admin consent granted in Azure portal |
| T-6 | `User.Read.All` granted to MI service principal | IT / Identity | Admin consent granted in Azure portal |
| T-7 | `Sites.Selected` granted to MI service principal | IT / Identity | Admin consent granted in Azure portal |
| T-8 | `GRAPH_GROUP_PERMISSION_CONFIRMED` set to `true` | DevOps (after IT confirms T-5/T-6) | Env var set in Function App configuration |
| T-9 | Per-site grants executed for Projects site (Sites.Selected path) | IT / SharePoint admin | `tools/grant-site-access.sh` executed or Graph API grant confirmed |
| T-10 | `SITES_SELECTED_GRANT_CONFIRMED` set to `true` (if sites-selected model) | DevOps (after IT confirms T-9) | Env var set in Function App configuration |
| T-11 | SPFx solution deployed to tenant app catalog | DevOps | Solution visible in app catalog |
| T-12 | SharePoint admin approves API access for `hb-intel-api-production` / `access_as_user` | SharePoint admin | Approval visible in SharePoint admin center > API access |
| T-13 | Provisioning prerequisites set: `SHAREPOINT_HUB_SITE_ID`, `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `OPEX_MANAGER_UPN` | DevOps | All non-empty in Function App configuration |

---

## Staging Go/No-Go Gates

Staging validates infrastructure and basic auth flow without tenant-admin dependencies.

| Gate | Required | Criterion IDs |
|------|----------|--------------|
| Code merged and passing | Yes | C-1 through C-10 |
| Function App deployed to staging | Yes | E-1 |
| Core env vars set | Yes | E-2 through E-7 |
| SharePoint env vars set | Yes | E-8, E-9 |
| MI assigned to Function App | Yes | E-10 |
| Storage account RBAC assigned | Yes | E-11 |
| App Insights connected | Yes | E-12 |
| CORS matches repo intent | Yes | E-13 |
| Health endpoint responds | Yes | GET `/api/health` returns 200 |
| Auth middleware rejects unauthenticated requests | Yes | GET `/api/project-setup/requests` returns 401 without Bearer |
| Startup validation passes (no missing core vars) | Yes | Function App logs show successful startup |

**Staging does NOT require:** Tenant-ready criteria (T-1 through T-13). Graph and SharePoint operations may fail at staging if tenant consents are not yet in place — this is expected.

---

## Pilot Go/No-Go Gates

Pilot validates end-to-end flow with real tenant dependencies for a limited number of projects.

| Gate | Required | Criterion IDs |
|------|----------|--------------|
| All staging gates pass | Yes | All staging gates |
| App registration exists with correct audience | Yes | T-1, T-2, T-3 |
| App roles configured | Yes | T-4 |
| Graph permissions granted and confirmed | Yes | T-5, T-6, T-7, T-8 |
| Sites.Selected grants confirmed (if sites-selected model) | Yes | T-9, T-10 |
| SPFx deployed and API access approved | Yes | T-11, T-12 |
| Provisioning prerequisites set | Yes | T-13 |
| SPFx web part acquires token successfully | Yes | Browser dev tools show valid Bearer token |
| Authenticated API call succeeds | Yes | SPFx web part loads project data |
| Provisioning saga completes for test project | Yes | All 7+ steps complete without error |
| SignalR push works (if configured) or NoOp logs (if not) | Yes | Real-time updates visible or NoOp logs confirmed |

**Pilot scope:** 1–3 projects maximum. Manual per-site grants acceptable (Option A2).

---

## Production Go/No-Go Gates

Production requires all pilot gates plus operational readiness.

| Gate | Required | Criterion IDs |
|------|----------|--------------|
| All pilot gates pass | Yes | All pilot gates |
| Pilot projects provisioned without errors | Yes | Provisioning status table shows `Completed` |
| No unresolved High-severity audit gaps | Yes | Phase 7 audit report shows all High gaps resolved |
| CORS verified in production Function App resource | Yes | E-13 verified in production subscription |
| Break-glass role tested | Yes | BreakGlass user can access admin endpoints |
| Telemetry flowing to App Insights | Yes | `auth.bearer.success`, `authz.decision` events visible |
| Rollback plan documented | Yes | SPFx solution can be retracted; Function App can be rolled back |
| Sites.Selected automation decision made (if >3 projects planned) | Conditional | Option A1 vs continued A2 assessed |

---

## Verification Steps

### Auth Verification

1. Deploy Function App to staging
2. Confirm health endpoint responds: `GET /api/health` → 200
3. Confirm unauthenticated request rejected: `GET /api/project-setup/requests` → 401
4. Acquire SPFx token via browser dev tools (F12 > Network > inspect Authorization header)
5. Confirm token `aud` matches `API_AUDIENCE` value
6. Confirm authenticated request succeeds: response includes project data

### CORS Verification

1. Open SPFx web part in SharePoint
2. Confirm no CORS errors in browser console
3. Confirm `Access-Control-Allow-Origin` header matches exact tenant origin
4. Confirm `Access-Control-Allow-Credentials: true` in response headers

### Provisioning Verification

1. Submit a test project request
2. Confirm provisioning saga starts (check `ProvisioningStatus` table)
3. Confirm each step completes (site creation, list creation, library, web parts, permissions, hub association)
4. Confirm SignalR push or NoOp fallback behavior
5. Confirm final status is `Completed`

### Permission Verification

1. Confirm non-admin user cannot access admin endpoints (403)
2. Confirm Controller role user can access controller endpoints
3. Confirm ownership check works (user can see own submissions)
4. Confirm BreakGlass role produces `authz.break_glass` telemetry event

---

## Evidence Required Before Signoff

| Evidence | Format | Owner |
|----------|--------|-------|
| Staging deployment logs (clean startup) | Function App logs / App Insights | DevOps |
| Auth flow screenshot (SPFx token acquisition) | Browser dev tools screenshot | Dev team |
| CORS headers screenshot | Browser dev tools screenshot | Dev team |
| Provisioning saga completion record | `ProvisioningStatus` table query | Dev team |
| Graph permission confirmation | Azure portal screenshot | IT / Identity |
| Sites.Selected grant confirmation | Graph API response or script output | IT / SharePoint admin |
| SPFx API access approval screenshot | SharePoint admin center screenshot | SharePoint admin |
| App Insights telemetry screenshot | App Insights query results | DevOps |
| Phase 7 audit report showing all gaps resolved | `project-setup-phase-7-security-and-connected-services-audit.md` | Dev team |

---

## Blockers That Must Be Closed Before Each Gate

### Before Staging

| Blocker | Type | Owner | Resolution |
|---------|------|-------|------------|
| Function App not provisioned | Infrastructure | DevOps | Provision via Terraform/Bicep |
| MI not assigned | Infrastructure | DevOps | Create and assign user-assigned MI |
| Core env vars missing | Infrastructure | DevOps | Set in Function App configuration |
| Storage account not provisioned | Infrastructure | DevOps | Provision with Table RBAC |

### Before Pilot

| Blocker | Type | Owner | Resolution |
|---------|------|-------|------------|
| App registration not created | Tenant | IT / Identity | Create in Entra ID with correct audience config |
| Graph permissions not granted | Tenant | IT / Identity | Admin consent for Group.ReadWrite.All, User.Read.All, Sites.Selected |
| `GRAPH_GROUP_PERMISSION_CONFIRMED` not set | Configuration | DevOps | Set to `true` after IT confirms |
| Per-site grants not executed | Tenant | IT / SharePoint admin | Execute `tools/grant-site-access.sh` |
| SPFx not deployed to app catalog | Deployment | DevOps | Deploy solution package |
| API access not approved | Tenant | SharePoint admin | Approve in admin center |

### Before Production

| Blocker | Type | Owner | Resolution |
|---------|------|-------|------------|
| Pilot not validated | Process | Dev team + DevOps | Complete pilot verification steps |
| Telemetry not flowing | Infrastructure | DevOps | Verify App Insights connection |
| Rollback plan not documented | Process | Dev team | Document retraction and rollback steps |
| Break-glass not tested | Process | Dev team | Test BreakGlass role access |
