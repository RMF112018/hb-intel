# Project Setup Tenant Prerequisites

## Executive Summary

This document defines every tenant-admin and platform-admin dependency required before the Project Setup / Accounting / provisioning solution can reach pilot or production. Each prerequisite identifies the responsible owner, the verification method, and the downstream impact if unresolved.

**Key facts:**

- 6 Entra ID / app registration prerequisites (IT / Identity team)
- 1 SharePoint admin API access approval (SharePoint admin)
- 3 managed identity permission prerequisites (IT / Identity team)
- 2 SharePoint / Sites.Selected grant prerequisites (IT / SharePoint admin)
- 5 Azure resource configuration prerequisites (DevOps)
- 1 CORS / origin configuration prerequisite (DevOps)

**Source authority:** This document is derived from:
- `docs/reference/configuration/project-setup-api-auth-contract.md`
- `docs/reference/configuration/project-setup-environment-readiness.md`
- `docs/reference/configuration/project-setup-connected-services-readiness.md`

**Created by:** Phase 7 Prompt-05 (P7-05), 2026-04-02

---

## Entra App Registration / API Audience Prerequisites

These prerequisites establish the inbound API auth contract. Without them, SPFx callers cannot acquire tokens for the protected API.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| A-1 | App registration `hb-intel-api-production` exists in Entra ID | IT / Identity | Azure portal > App registrations > search by name | SPFx cannot target API; token acquisition fails |
| A-2 | `accessTokenAcceptedVersion` is null or 1 in app registration manifest | IT / Identity | App registration > Manifest > check `accessTokenAcceptedVersion` | Tokens issued with bare GUID audience instead of `api://` URI; backend validation rejects with `invalid_audience` |
| A-3 | `access_as_user` delegated scope exposed under "Expose an API" | IT / Identity | App registration > Expose an API > verify scope listed | SPFx cannot request `access_as_user` scope; admin approval fails |
| A-4 | Application ID URI set to `api://<client-id>` | IT / Identity | App registration > Expose an API > verify Application ID URI | Audience mismatch between frontend and backend; 401 errors |
| A-5 | App roles configured in manifest: `Admin`, `HBIntelAdmin`, `Controller`, `HBIntelController`, `BreakGlass`, `Automation` | IT / Identity | App registration > App roles > verify all 6 roles | Role-based authorization fails; privileged operations return 403 |
| A-6 | `API_AUDIENCE` env var matches Application ID URI exactly | DevOps | Function App configuration > verify value matches A-4 | Backend rejects all tokens with `invalid_audience` |

---

## SharePoint Admin API Access Approval Prerequisites

These prerequisites enable SPFx web parts to acquire delegated tokens for the protected API.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| S-1 | SPFx solution deployed to tenant app catalog | DevOps | SharePoint admin center > Advanced > API access > pending requests visible | API access request not registered; admin cannot approve |
| S-2 | SharePoint admin approves `hb-intel-api-production` / `access_as_user` | SharePoint admin | SharePoint admin center > Advanced > API access > approved list | SPFx `getToken()` throws; web part cannot call protected API |

**Important:** Revoking S-2 affects ALL SPFx solutions using this permission, not just the Project Setup solution. Treat revocation as a breaking change.

---

## Managed Identity Assignment Prerequisites

These prerequisites enable the backend to authenticate to downstream services (SharePoint, Graph, Table Storage) using app-only tokens.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| M-1 | User-assigned Managed Identity created | DevOps | Azure portal > Managed Identities > resource exists | No identity available for downstream auth |
| M-2 | MI assigned to Function App | DevOps | Function App > Identity > User assigned > MI listed | `DefaultAzureCredential` cannot resolve identity; all downstream calls fail |
| M-3 | `AZURE_CLIENT_ID` set to MI's client ID | DevOps | Function App configuration > verify value matches MI client ID | `DefaultAzureCredential` resolves wrong identity or fails |

---

## Graph Permission Prerequisites

These prerequisites enable the backend to create security groups, resolve users, and grant site access.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| G-1 | `Group.ReadWrite.All` (application) granted to MI service principal | IT / Identity | Azure portal > Enterprise applications > MI > Permissions > verify grant | `createSecurityGroup`, `addGroupMembers` throw `GraphPermissionNotConfirmedError` |
| G-2 | `User.Read.All` (application) granted to MI service principal | IT / Identity | Azure portal > Enterprise applications > MI > Permissions > verify grant | `addGroupMembers` cannot resolve UPN → OID; 404 on user lookup |
| G-3 | `Sites.Selected` (application) granted to MI service principal | IT / Identity | Azure portal > Enterprise applications > MI > Permissions > verify grant | `grantSiteAccess` cannot assign per-site permissions |
| G-4 | `GRAPH_GROUP_PERMISSION_CONFIRMED` set to `true` | DevOps (after IT confirms G-1, G-2) | Function App configuration > verify value is `true` | All Graph group operations blocked by permission gate |

**Operational note:** `GRAPH_GROUP_PERMISSION_CONFIRMED` is a human-verified operational gate. Setting it to `true` without confirming G-1 and G-2 will result in runtime Graph API errors instead of the friendly `GraphPermissionNotConfirmedError`.

---

## SharePoint / Sites.Selected Grant Prerequisites

These prerequisites enable the backend to access specific SharePoint sites using the least-privilege Sites.Selected model.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| SP-1 | `SITES_PERMISSION_MODEL` set (default: `sites-selected`) | DevOps | Function App configuration > verify value or confirm default | Permission model ambiguous |
| SP-2 | Per-site grants executed for Projects site | IT / SharePoint admin | Graph API: `GET /sites/{siteId}/permissions` shows MI grant; or `tools/grant-site-access.sh` output | SharePoint operations fail with 403 on Projects site |
| SP-3 | Per-site grants executed for each provisioned site | IT / SharePoint admin | Same as SP-2 for each new site | Provisioning saga fails at site-level operations |
| SP-4 | `SITES_SELECTED_GRANT_CONFIRMED` set to `true` | DevOps (after IT confirms SP-2) | Function App configuration > verify value is `true` | Provisioning prerequisites validation fails |

**Pilot model (Option A2):** For Wave 0 pilot with 3 or fewer sites, manual per-site grants via `tools/grant-site-access.sh` are acceptable. Reassess automation (Option A1) when the 4th project provisions.

**Fallback (Path B):** If Sites.Selected is not feasible, set `SITES_PERMISSION_MODEL=fullcontrol`. This requires an ADR with 90-day expiry and must satisfy conditions B-1, B-2, or B-3 as documented in `docs/reference/configuration/sites-selected-validation.md`.

---

## Azure Resource Configuration Prerequisites

These prerequisites ensure infrastructure resources exist and are properly configured.

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| R-1 | Azure Table Storage account provisioned with `Storage Table Data Contributor` role for MI | DevOps | Azure portal > Storage account > IAM > verify role assignment | Table operations fail; provisioning status cannot persist |
| R-2 | `AZURE_TABLE_ENDPOINT` set to storage account endpoint | DevOps | Function App configuration > verify URL resolves | Startup validation fails (core tier) |
| R-3 | Application Insights resource provisioned | DevOps | Azure portal > App Insights > resource exists | Startup validation fails (core tier); no telemetry |
| R-4 | `APPLICATIONINSIGHTS_CONNECTION_STRING` set | DevOps | Function App configuration > verify non-empty | Startup validation fails |
| R-5 | Azure SignalR Service provisioned (optional) | DevOps | Azure portal > SignalR Service > resource exists | NoOp fallback activates; real-time push disabled |

---

## CORS / Origin Configuration Prerequisites

| # | Prerequisite | Owner | How to Verify | Impact if Missing |
|---|-------------|-------|---------------|-------------------|
| CO-1 | Azure Function App CORS settings match or are more restrictive than repo `host.json` | DevOps | Azure portal > Function App > CORS > verify allowed origins include only `https://hedrickbrotherscom.sharepoint.com` | CORS preflight failures; browser blocks API calls from SPFx |

**Key rules:**
- No `*` wildcard in production CORS
- `Access-Control-Allow-Credentials` must be enabled
- Portal settings that are broader than repo intent weaken the security posture

---

## Operational Ownership Matrix

| Area | Owner | Prerequisites |
|------|-------|--------------|
| **Entra ID app registration** | IT / Identity team | A-1 through A-5 |
| **Graph API permissions** | IT / Identity team | G-1 through G-3 |
| **SharePoint admin API access** | SharePoint admin | S-1, S-2 |
| **SharePoint site grants** | IT / SharePoint admin | SP-2, SP-3 |
| **Managed Identity** | DevOps | M-1 through M-3 |
| **Azure resources** | DevOps | R-1 through R-5, CO-1 |
| **Environment variables** | DevOps | A-6, G-4, SP-1, SP-4, R-2, R-4 |
| **Code and tests** | Dev team | All C-* criteria |
| **SPFx deployment** | DevOps | S-1 |
| **Pilot validation** | Dev team + DevOps | End-to-end verification |

---

## Explicit External Blocker Register

| # | Blocker | Type | Owner | Impact | Resolution Path | Required Before |
|---|---------|------|-------|--------|-----------------|-----------------|
| B-1 | App registration not created | Tenant | IT / Identity | All inbound auth fails | Create app registration with correct audience, scopes, and roles | Pilot |
| B-2 | Graph permissions not granted | Tenant | IT / Identity | Provisioning saga cannot create groups or resolve users | Admin consent for Group.ReadWrite.All, User.Read.All, Sites.Selected | Pilot |
| B-3 | Per-site grants not executed | Tenant | IT / SharePoint admin | SharePoint operations fail on ungranted sites | Execute `tools/grant-site-access.sh` per site | Pilot |
| B-4 | SPFx API access not approved | Tenant | SharePoint admin | SPFx web parts cannot acquire tokens | Approve in SharePoint admin center | Pilot |
| B-5 | `GRAPH_GROUP_PERMISSION_CONFIRMED` not set | Configuration | DevOps | Graph operations blocked by permission gate | Set to `true` after IT confirms B-2 | Pilot |
| B-6 | `SITES_SELECTED_GRANT_CONFIRMED` not set | Configuration | DevOps | Provisioning prerequisites fail | Set to `true` after IT confirms B-3 | Pilot |
| B-7 | Email delivery is Phase 1 stub | Code | Dev team | Notifications log but do not send | Future phase implements delivery | N/A (does not block deployment) |
| B-8 | SignalR not provisioned | Infrastructure | DevOps | Real-time push disabled (NoOp fallback) | Provision SignalR Service resource | Optional |
