# Admin SPFx IT Control Center — Phase 13 Environment, Identity, and Dependency Baseline

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-03 — Phase 13 Environment, Identity, and Dependency Baseline
**Scope:** Environment, identity, configuration, and dependency documentation
**Evidence base:** P13-01 production posture audit, P13-02 release readiness baseline

---

## 1. Purpose

This document records the production environment, identity, configuration, and major dependency posture required to support a real release of the Admin SPFx IT Control Center. It is factual and environment-oriented — it does not redesign the runtime.

Where an item cannot be verified from the repository, it is explicitly labeled as **[assumption]** or **[not verifiable from repo]**. All verifiable items are labeled **[repo fact]**.

---

## 2. Environment model

### 2.1 Local development

| Aspect | Detail | Source |
|--------|--------|--------|
| SPFx app dev server | Vite on `https://localhost:4006`, strict port, CORS enabled | [repo fact] `apps/admin/vite.config.ts` |
| Auth mode | `HBC_AUTH_MODE=mock` — mock personas via DevToolbar | [repo fact] `apps/admin/src/bootstrap.ts` |
| Adapter mode | `HBC_ADAPTER_MODE=mock` — no real backend required | [repo fact] `vite.config.ts` environment injection |
| Backend runtime | Azure Functions Core Tools v4, `func start` | [repo fact] `backend/functions/package.json` scripts |
| Backend auth | `AZURE_CLIENT_SECRET` for local service principal | [repo fact] `local.settings.example.json` — local dev only, never in production |
| Storage | `UseDevelopmentStorage=true` (Azurite) or remote table endpoint | [repo fact] `local.settings.example.json` |
| Node.js | Node 20 for workspace build; Node 18 for SPFx 1.18 shell | [repo fact] `spfx-build.yml` |
| Package manager | pnpm 9.x with workspace protocol | [repo fact] `package.json` workspace config |
| Config validation | Skipped when `HBC_ADAPTER_MODE=mock` or `NODE_ENV=test` | [repo fact] `validate-config.ts` — `shouldValidateConfig()` |
| SignalR | Not connected; mock environment | [repo fact] Phase 7 guide |
| Default mock project | `PRJ-001 Harbor View Medical Center` | [repo fact] `bootstrap.ts` |
| Feature flags | `provisioning-failures`, `error-log`, `system-settings` | [repo fact] `bootstrap.ts` |

### 2.2 Staging / preproduction

| Aspect | Detail | Source |
|--------|--------|--------|
| SPFx deployment | Auto-deployed on successful `main` build via `spfx-deploy.yml` staging job | [repo fact] `.github/workflows/spfx-deploy.yml` |
| SPFx App Catalog | Staging SharePoint App Catalog — .sppkg uploaded via PnP PowerShell | [repo fact] `spfx-deploy.yml` |
| Backend deployment | Azure Functions deployed via CD workflow | [repo fact] `docs/how-to/developer/phase-8-ci-cd-guide.md` |
| Auth mode | `HBC_ADAPTER_MODE=proxy`, `HBC_AUTH_MODE=spfx` | [assumption] Staging mirrors production adapter/auth modes |
| GitHub secrets | `SPFX_STAGING_CLIENT_ID`, `SPFX_STAGING_CLIENT_SECRET`, `STAGING_SITE_URL` | [repo fact] `spfx-deploy.yml` environment secrets |
| Azure resources | Separate resource group per environment | [repo fact] `IT-Department-Setup-Guide.md` Section 6 |
| Config validation | Active — `validateCoreConfig()` runs at startup | [assumption] Staging uses `proxy` mode which enables validation |
| Purpose | Verify deployment pipeline, SPFx rendering, backend connectivity, E2E flows | [repo fact] `phase-8-ci-cd-guide.md` |

### 2.3 Production

| Aspect | Detail | Source |
|--------|--------|--------|
| SPFx deployment | Manual promotion from staging via `spfx-deploy.yml` production job | [repo fact] `spfx-deploy.yml` — requires GitHub Environment protection rule approval |
| SPFx host | SharePoint Online, tenant-wide App Catalog | [repo fact] `AdminWebPart.manifest.json` — `supportedHosts: ["SharePointWebPart", "TeamsPersonalApp"]` |
| Backend runtime | Azure Functions v4, Node.js ~20 | [repo fact] `backend/functions/package.json`, `IT-Department-Setup-Guide.md` |
| Auth mode | `HBC_ADAPTER_MODE=proxy`, `HBC_AUTH_MODE=spfx` | [repo fact] `vite.config.ts` production injection |
| Identity | System-assigned Managed Identity on Function App | [repo fact] `IT-Department-Setup-Guide.md` Section 6, `wave0-env-registry.ts` |
| Storage | Azure Table Storage via `AZURE_TABLE_ENDPOINT` | [repo fact] `wave0-env-registry.ts` — core tier, required |
| Secrets | Azure Key Vault references — not inline app settings | [repo fact] `IT-Department-Setup-Guide.md` Section 8 |
| Config validation | Active — core tier validated at startup, provisioning tier at saga time | [repo fact] `validate-config.ts` |
| CORS | Locked to `https://hedrickbrotherscom.sharepoint.com` | [repo fact] `hosts/admin-control-plane/host.json` |
| Monitoring | Application Insights with sampling (20 items/sec, exceptions excluded) | [repo fact] `host.json` |
| GitHub secrets | `SPFX_PROD_CLIENT_ID`, `SPFX_PROD_CLIENT_SECRET`, `PROD_SITE_URL` | [repo fact] `spfx-deploy.yml` |

---

## 3. Identity posture

### 3.1 Managed Identity (backend)

| Aspect | Detail | Source |
|--------|--------|--------|
| Type | System-assigned Managed Identity on Azure Function App | [repo fact] `IT-Department-Setup-Guide.md` Section 6 |
| Purpose | Authenticate to Azure Table Storage, Key Vault, SharePoint (via Graph), and Entra ID without secrets | [repo fact] `IT-Department-Setup-Guide.md` |
| Credential model | `@azure/identity` DefaultAzureCredential chain — MI in production, service principal locally | [repo fact] `backend/functions/package.json` — `@azure/identity@^4.5.0` |
| Required roles | Table Data Contributor (Storage), Key Vault Secrets User (Key Vault), `Sites.Selected` per-site grants (SharePoint), `Group.ReadWrite.All` (Entra ID) | [repo fact] `IT-Department-Setup-Guide.md` Sections 7–9, `validate-config.ts` |
| Sites.Selected model | Per-site grants confirmed by `SITES_SELECTED_GRANT_CONFIRMED=true` gate | [repo fact] `validate-config.ts` — conditional on `SITES_PERMISSION_MODEL=sites-selected` (default) |
| Local dev fallback | Service principal via `AZURE_CLIENT_ID` + `AZURE_CLIENT_SECRET` in `local.settings.json` | [repo fact] `local.settings.example.json` |

### 3.2 App registrations / service principals

| Registration | Purpose | Scope | Source |
|-------------|---------|-------|--------|
| Backend API app registration | JWT audience for inbound API calls from SPFx | Application ID URI: `api://func-hb-intel-{env}` (NOT bare GUID) | [repo fact] `IT-Department-Setup-Guide.md` Section 9, `wave0-env-registry.ts` `API_AUDIENCE` |
| SPFx staging deployment | PnP PowerShell authentication for staging App Catalog upload | `SPFX_STAGING_CLIENT_ID` + `SPFX_STAGING_CLIENT_SECRET` | [repo fact] `spfx-deploy.yml` |
| SPFx production deployment | PnP PowerShell authentication for production App Catalog upload | `SPFX_PROD_CLIENT_ID` + `SPFX_PROD_CLIENT_SECRET` | [repo fact] `spfx-deploy.yml` |
| Local dev service principal | Backend development authentication | `AZURE_CLIENT_ID` + `AZURE_CLIENT_SECRET` in `local.settings.json` | [repo fact] `local.settings.example.json` |

### 3.3 Operator identity / admin access

| Aspect | Detail | Source |
|--------|--------|--------|
| SPFx auth bootstrap | `bootstrapSpfxAuth(context, permissionKeys)` in `AdminWebPart.onInit()` | [repo fact] `AdminWebPart.tsx` |
| Permission resolution | SharePoint group membership → HB Intel permission keys (D-PH7-BW-7) | [repo fact] `AdminWebPart.tsx`, `routes.ts` |
| Route-level guard | `requireAdminAccessControl()` requiring `admin:access-control:view` | [repo fact] `routes.ts` — all routes except index |
| Component-level gates | `PermissionGate` on sensitive actions (retry, archive, escalate, force-state, approval manage) | [repo fact] Page components |
| Admin UPNs | `ADMIN_UPNS` environment variable — comma-separated admin user principal names | [repo fact] `local.settings.example.json`, `wave0-env-registry.ts` |
| Controller UPNs | `CONTROLLER_UPNS` — comma-separated controller user principal names | [repo fact] `local.settings.example.json` |
| OpEx Manager | `OPEX_MANAGER_UPN` — required for provisioning saga Step 6 (Leaders group) | [repo fact] `validate-config.ts` — provisioning prerequisite |
| Department visibility | `DEPT_BACKGROUND_ACCESS_COMMERCIAL`, `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | [repo fact] `local.settings.example.json` |

---

## 4. Configuration and secret posture

### 4.1 Configuration tiers (backend)

Source: `backend/functions/src/config/wave0-env-registry.ts`, `validate-config.ts`

#### Core tier — required for ANY request (validated at startup)

| Variable | Purpose | Sensitive | Owner |
|----------|---------|-----------|-------|
| `AZURE_TENANT_ID` | Entra ID tenant identifier | No | Platform/DevOps |
| `AZURE_CLIENT_ID` | User-assigned MI client ID (prod) or service principal (dev) | No | Platform/DevOps |
| `AZURE_TABLE_ENDPOINT` | App-data table storage endpoint | No | Platform/DevOps |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Telemetry ingestion connection | Yes — Key Vault reference | Platform/DevOps |
| `API_AUDIENCE` | Inbound API audience URI for JWT validation (`api://func-hb-intel-{env}`) | No | Platform/DevOps |
| `HBC_ADAPTER_MODE` | `mock` (dev) or `proxy` (production) | No | Platform/DevOps |
| `SHAREPOINT_TENANT_URL` | Root SharePoint tenant URL | No | Platform/DevOps |
| `SHAREPOINT_PROJECTS_SITE_URL` | Projects list site URL | No | Platform/DevOps |

#### SharePoint tier — required for SharePoint-dependent operations

| Variable | Purpose | Sensitive | Owner |
|----------|---------|-----------|-------|
| `SHAREPOINT_HUB_SITE_ID` | Hub site GUID for Step 7 hub association | No | IT/SharePoint Admin |
| `SHAREPOINT_APP_CATALOG_URL` | App catalog URL for Step 5 web part install | No | IT/SharePoint Admin |
| `HB_INTEL_SPFX_APP_ID` | SPFx app package GUID for Step 5 | No | Development |

#### Provisioning tier — validated at saga execution time

| Variable | Purpose | Sensitive | Owner |
|----------|---------|-----------|-------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | IT confirms `Group.ReadWrite.All` granted | No | IT |
| `SITES_SELECTED_GRANT_CONFIRMED` | IT confirms per-site grant workflow operational | No | IT |
| `SITES_PERMISSION_MODEL` | `sites-selected` (default, least privilege) | No | Architecture |
| `OPEX_MANAGER_UPN` | OpEx manager for Leaders group (Step 6) | No | Business |
| `CONTROLLER_UPNS` | Controller UPNs | No | Business |
| `ADMIN_UPNS` | Admin UPNs | No | Business |
| `STRUCTURAL_OWNER_UPNS` | Structural owner UPNs | No | Business |

#### Optional / deferred

| Variable | Purpose | Sensitive | Status |
|----------|---------|-----------|--------|
| `AzureSignalRConnectionString` | Real-time updates | Yes — Key Vault reference | Deferred; mock in place |
| `EMAIL_DELIVERY_API_KEY` | SendGrid API key | Yes — Key Vault reference | Stub; console-logged only |
| `EMAIL_FROM_ADDRESS` | Verified sender domain | No | Stub; not consumed |
| `NOTIFICATION_API_BASE_URL` | Notification endpoint | No | Has localhost fallback |
| `DEPT_BACKGROUND_ACCESS_COMMERCIAL` | Viewer UPN for commercial | No | Business-owned |
| `DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL` | Viewer UPN for luxury residential | No | Business-owned |

### 4.2 Frontend environment variables

Source: `apps/admin/vite.config.ts`, `apps/admin/src/env.d.ts`

| Variable | Purpose | Injected by |
|----------|---------|------------|
| `VITE_MSAL_CLIENT_ID` | Azure AD app registration for SPFx auth | Build-time Vite injection |
| `VITE_MSAL_AUTHORITY` | Azure AD authority endpoint | Build-time Vite injection |
| `VITE_FUNCTION_APP_URL` | Backend Azure Functions base URL (triggers alert/probe polling) | Build-time Vite injection |
| `VITE_BACKEND_URL` | Backend service URL | Build-time Vite injection |
| `VITE_TEAMS_WEBHOOK_URL` | Teams notification webhook URI | Build-time Vite injection |
| `VITE_ALERT_EMAIL_RELAY` | Email relay address (console-logged in Wave 0) | Build-time Vite injection |
| `HBC_ADAPTER_MODE` | `mock` (dev) or `proxy` (prod) | Vite define injection |
| `HBC_AUTH_MODE` | `mock` (dev) or `spfx` (prod) | Vite define injection |

### 4.3 Secret storage and rotation

| Secret category | Storage | Rotation responsibility | Source |
|----------------|---------|------------------------|--------|
| Azure AD app registration secrets (staging/prod deploy) | GitHub Environment secrets | Platform/DevOps — rotate before expiry | [repo fact] `spfx-deploy.yml` |
| Application Insights connection string | Azure Key Vault | Platform/DevOps | [repo fact] `IT-Department-Setup-Guide.md` |
| SignalR connection string | Azure Key Vault | Platform/DevOps | [repo fact] `IT-Department-Setup-Guide.md` |
| SendGrid API key | Azure Key Vault | Platform/DevOps | [repo fact] `IT-Department-Setup-Guide.md` — stub, not consumed |
| Local dev service principal secret | Developer's `local.settings.json` (gitignored) | Developer — rotate per org policy | [repo fact] `local.settings.example.json` |
| Turborepo remote cache token | GitHub secret `TURBO_TOKEN` | Platform/DevOps | [repo fact] `phase-8-ci-cd-guide.md` |

**Rotation considerations:**
- Azure AD app registration secrets have configurable expiry (typically 1–2 years). **[recommendation]** Set calendar reminders for rotation before expiry to avoid deployment pipeline failures.
- Key Vault secret versions are immutable. Rotation creates a new version; Function App Key Vault references resolve to the latest version automatically if configured without version pinning. **[assumption]** Key Vault references use latest-version resolution.
- GitHub Environment secrets must be updated manually in repository settings when rotated. **[repo fact]** No automated rotation pipeline exists.

---

## 5. Critical external dependencies

### 5.1 SPFx package / runtime dependencies

| Dependency | Version | Purpose | Failure impact |
|-----------|---------|---------|---------------|
| SharePoint Online | Tenant service | SPFx host runtime, page rendering, auth context | **Total** — app does not render |
| SPFx Framework | 1.18 | WebPart lifecycle, property pane, theming | **Total** — app does not load |
| React | ^18.3.1 | UI rendering | **Total** — app does not render |
| TanStack Router | ^1.120.0 | Route-based code splitting, permission guards | **Total** — navigation broken |
| TanStack React Query | ^5.75.0 | Data fetching, cache, polling | **Degraded** — no data refresh; cached data may display |
| Fluent UI React Components | ^9.56.0 | Design system, tokens, layout | **Degraded** — visual inconsistency if CDN unavailable |
| Zustand | ^5.0.0 | Client state management | **Degraded** — state lost on reload |
| SharePoint App Catalog | Tenant App Catalog | .sppkg hosting and trust | **Total** — app not available to users |

### 5.2 Azure Functions runtime dependencies

| Dependency | Version | Purpose | Failure impact |
|-----------|---------|---------|---------------|
| Azure Functions Host | v4 | HTTP trigger routing, timer triggers, function lifecycle | **Total** — no API responses |
| Node.js | ~20 | Runtime execution | **Total** — functions do not start |
| @azure/data-tables | ^13.3.2 | Azure Table Storage client | **Total** — no durable persistence |
| @azure/identity | ^4.5.0 | Managed Identity credential chain | **Total** — cannot authenticate to Azure services |
| jose | ^5.9.6 | JWT validation for inbound API calls | **Total** — all authenticated requests rejected |
| zod | ^3.24.2 | Request/response schema validation | **Degraded** — invalid payloads may pass through |
| @pnp/sp + @pnp/graph | ^4.18.0 | SharePoint and Graph API client | **Degraded** — SharePoint/Graph operations fail; core admin API still responds |

### 5.3 Storage / persistence dependencies

| Dependency | Purpose | Failure impact | Source |
|-----------|---------|---------------|--------|
| Azure Table Storage | 6 tables: AdminRuns, AdminAuditEvents, AdminEvidence, ObservabilityAlerts, ObservabilityProbeSnapshots, ObservabilityErrors | **Degraded to severe** — no durable state; in-memory caches serve stale data until exhausted | [repo fact] Backend store implementations |
| Azure Storage Account (Functions host) | `AzureWebJobsStorage` — Functions runtime state, timer trigger leases, idempotency records | **Total** — Functions runtime cannot start | [repo fact] `local.settings.example.json` |

### 5.4 SharePoint tenant / App Catalog dependencies

| Dependency | Purpose | Failure impact | Source |
|-----------|---------|---------------|--------|
| SharePoint Online tenant | `hedrickbrotherscom.sharepoint.com` — SPFx host, project sites, hub site | **Total** — app and all SharePoint operations unavailable | [repo fact] `host.json` CORS, `wave0-env-registry.ts` |
| Tenant-wide App Catalog | .sppkg deployment target | **Deployment blocked** — cannot deploy or update SPFx package | [repo fact] `spfx-deploy.yml` |
| Hub site registration | Hub site with `SHAREPOINT_HUB_SITE_ID` | **Provisioning Step 7 blocked** — hub association fails | [repo fact] `validate-config.ts` |
| Projects site | `SHAREPOINT_PROJECTS_SITE_URL` — project list data | **Data access blocked** — provisioning list operations fail | [repo fact] `wave0-env-registry.ts` core tier |

### 5.5 Graph / Entra dependencies

| Dependency | Purpose | Failure impact | Source |
|-----------|---------|---------------|--------|
| Microsoft Graph API | Security group CRUD (`Group.ReadWrite.All`), user lifecycle, identity queries | **Provisioning/identity degraded** — cannot create groups, manage users | [repo fact] `IT-Department-Setup-Guide.md` Section 9 |
| Entra ID (Azure AD) | Token issuance, managed identity authentication, JWT validation | **Total** — no authentication possible | [repo fact] Auth middleware, `jose` validation |
| `Sites.Selected` per-site grants | Least-privilege SharePoint access per project site | **Per-site operations blocked** if grant missing | [repo fact] `validate-config.ts` — gated by `SITES_SELECTED_GRANT_CONFIRMED` |

### 5.6 Monitoring / notification dependencies

| Dependency | Purpose | Failure impact | Source |
|-----------|---------|---------------|--------|
| Application Insights | Telemetry ingestion, KQL queries, alert data source | **Observability blind** — no telemetry, KQL queries return nothing | [repo fact] `host.json`, `IT-Department-Setup-Guide.md` |
| Azure Monitor (alert rules) | Alert rule evaluation and action group triggering | **Alert-blind** — defined but NOT deployed (P13-01 gap G1) | [repo fact] `backend/functions/observability/README.md` |
| Teams Webhooks | Alert notification delivery to `#hb-intel-alerts` channel | **Notification-blind** — alerts fire but no human notification | [repo fact] `TeamsWebhookDispatchAdapter` |
| Azure SignalR Service | Real-time update push to SPFx clients | **Degraded** — no real-time updates; polling compensates | [repo fact] Deferred; mock in place |

---

## 6. Dependency failure considerations

### 6.1 Cascading failure paths

| Trigger | Immediate impact | Cascade | Mitigation in place |
|---------|-----------------|---------|-------------------|
| Entra ID outage | JWT validation fails → all authenticated API calls return 401 | SPFx app shows auth errors; polling stops fetching new data | Alert: Auth Failure Burst (Sev 1) in operational runbook; cached data remains in UI |
| Azure Table Storage unavailable | All durable writes fail → runs, audits, evidence, observability records not persisted | Provisioning saga fails at status persistence; alert/error stores fail to ingest | Idempotency records use fail-open semantics; fire-and-forget emitters do not cascade to request handling |
| SharePoint Online outage | SPFx app does not render; SharePoint API calls fail | Provisioning saga site-creation steps fail; project data inaccessible | Saga compensation chain rolls back failed steps; hub association deferred to Step 7 |
| Graph API unavailable | Security group operations fail; user lifecycle queries fail | Provisioning saga Step 6 (permissions) fails; identity operations blocked | Saga step-level retry with exponential backoff; failure classification guides operator action |
| Application Insights unavailable | Telemetry ingestion fails silently | KQL queries return stale data; alert rules (when deployed) stop evaluating | Application Insights uses sampling and buffering; short outages are transparent |
| Teams Webhook unavailable | Alert notifications not delivered | Operators unaware of new alerts until they check the Health dashboard | Delivery tracking (P12-09) records failure; 5-min cooldown prevents storm; alerts visible in-app |

### 6.2 Graceful degradation patterns

| Pattern | Implementation | Source |
|---------|---------------|--------|
| Alert polling skip | `useAlertPolling` skips cycle if `VITE_FUNCTION_APP_URL` not configured | [repo fact] `apps/admin` README |
| Probe polling graceful failure | `useProbePolling` catches errors with `console.error`, does not crash app | [repo fact] `apps/admin` README |
| Fire-and-forget emitters | Observability error emitter and audit bridge do not cascade failures to request handlers | [repo fact] `observability-emitter.ts`, `provisioning-audit-bridge.ts` |
| Config validation bypass in mock mode | `shouldValidateConfig()` returns false for mock/test | [repo fact] `validate-config.ts` |
| Idempotency fail-open | If idempotency check fails, request proceeds rather than rejecting | [repo fact] `backend/functions/README.md` |
| Deferred probes return `unknown` | Not `healthy` — prevents misleading status when endpoint unavailable | [repo fact] P12-06 correction |

---

## 7. Least-privilege and approval-sensitive areas

### 7.1 Least-privilege model

| Area | Privilege model | Source |
|------|----------------|--------|
| SharePoint site access | `Sites.Selected` — per-site grants, not tenant-wide | [repo fact] `validate-config.ts`, `IT-Department-Setup-Guide.md` |
| Security group management | `Group.ReadWrite.All` — required for provisioning saga | [repo fact] `IT-Department-Setup-Guide.md` Section 9 |
| Key Vault access | Managed Identity with Key Vault Secrets User role | [repo fact] `IT-Department-Setup-Guide.md` Section 8 |
| Table Storage access | Managed Identity with Table Data Contributor role | [repo fact] `IT-Department-Setup-Guide.md` Section 7 |
| SPFx deployment (staging) | Dedicated app registration with App Catalog write scope | [repo fact] `spfx-deploy.yml` |
| SPFx deployment (production) | Separate app registration + GitHub Environment approval | [repo fact] `spfx-deploy.yml` |
| Operator route access | `admin:access-control:view` permission key from SP group membership | [repo fact] `routes.ts` |
| Sensitive admin actions | Component-level `PermissionGate` per action type | [repo fact] Page components |

### 7.2 Approval-sensitive areas

| Area | Why sensitive | Current control | Source |
|------|-------------|----------------|--------|
| Production SPFx deployment | Pushes code to tenant-wide App Catalog | GitHub Environment protection rule (manual approval) | [repo fact] `spfx-deploy.yml` |
| Provisioning saga execution | Creates SharePoint sites, security groups, sets permissions | 7-gate prerequisite validation at execution time | [repo fact] `validate-config.ts` |
| Force-state override on provisioning runs | Manually sets run state (expert tier only) | `ADMIN_PROVISIONING_FORCE_STATE` permission + complexity gate | [repo fact] `ProvisioningOversightPage.tsx` |
| Approval authority rule changes | Governs who can approve high-risk actions | `ADMIN_APPROVAL_MANAGE` permission gate | [repo fact] `SystemSettingsPage.tsx` — Wave 0: not persisted |
| Per-site grant workflow | Grants managed identity access to individual SharePoint sites | Manual IT confirmation via `SITES_SELECTED_GRANT_CONFIRMED` | [repo fact] `validate-config.ts` |
| Graph permission confirmation | Enables security group CRUD | Manual IT confirmation via `GRAPH_GROUP_PERMISSION_CONFIRMED` | [repo fact] `validate-config.ts` |

---

## 8. Known environment risks

| Risk | Severity | Evidence | Mitigation | Source |
|------|----------|----------|------------|--------|
| Production config entries not populated | High | P13-01 residual unknown — cannot verify from repo | `validateCoreConfig()` will fail at startup; IT-Department-Setup-Guide verification checklist | [inferred risk] |
| Azure Table Storage tables not created in production | High | P13-01 residual unknown | First write will fail with 404; IT-Department-Setup-Guide covers table creation | [inferred risk] |
| GitHub Environment protection rule not configured | High | P13-01 residual unknown | Production deploy would proceed without review | [inferred risk] |
| App registration secret expiry | Medium | Secrets have configurable expiry; no automated rotation monitoring | Deployment pipeline fails on expiry; manual rotation required | [inferred risk] |
| `WEBSITE_TIME_ZONE` not set in production | Medium | Timer functions run at UTC times instead of EST | `timerFullSpec` (Step 5 deferred jobs) and `cleanupIdempotency` run 5 hours early | [inferred risk] |
| Per-site grant not applied to new project sites | Medium | Each new site requires manual or automated per-site grant | Provisioning saga fails at SharePoint operations for ungrated sites | [inferred risk] |
| CORS origin mismatch | Low | `host.json` hardcodes `hedrickbrotherscom.sharepoint.com` | If tenant URL changes or vanity domain is used, API calls fail with CORS error | [inferred risk] |
| Alert rules not deployed to Azure Monitor | Medium | P13-01 gap G1 — defined but unchecked DevOps checklist | No automated alerting even with Application Insights data flowing | [repo fact] |
| Teams webhook URL not configured in production | Medium | P13-01 residual unknown | Alert dispatch code runs but webhook is `undefined` — no notifications delivered | [inferred risk] |
| SignalR not connected in any deployed environment | Low | Mock implementation; no real Azure SignalR provisioned | No real-time push; 30s/15min polling compensates | [repo fact] Deferred |

---

## 9. Operational ownership notes

### 9.1 Configuration ownership matrix

| Ownership tier | Variables | Responsible party |
|---------------|----------|-------------------|
| **Infrastructure** (14 entries) | Azure tenant, client ID, table endpoint, App Insights, SignalR, Key Vault references, adapter mode, API audience | Platform / DevOps |
| **SharePoint** (3 entries) | Hub site ID, app catalog URL, SPFx app ID | IT / SharePoint Admin |
| **Provisioning gates** (3 entries) | Graph permission confirmed, Sites.Selected grant confirmed, sites permission model | IT (confirmation) / Architecture (model) |
| **Business** (5+ entries) | OpEx manager UPN, controller UPNs, admin UPNs, structural owner UPNs, department visibility | Product Owner / Business Admin |
| **Email** (2 entries) | SendGrid API key, sender address | Platform / DevOps — currently stub |

Source: `wave0-env-registry.ts` governance buckets (P4-02)

### 9.2 Deployment ownership

| Action | Owner | Trigger | Approval required |
|--------|-------|---------|------------------|
| CI build and test | Automated | Push to main/develop, PR to main | None — automated |
| Staging SPFx deployment | Automated | Successful main build | None — auto-deploy |
| Production SPFx deployment | Platform / DevOps | Manual trigger after staging verification | GitHub Environment approval |
| Backend Azure Functions deployment | Platform / DevOps | CD workflow on main | Vercel/Azure deployment — see `phase-8-ci-cd-guide.md` |
| Azure Monitor alert rule deployment | Platform / DevOps | Manual — DevOps setup checklist | DevOps review |
| Azure resource provisioning | IT / Platform | IT-Department-Setup-Guide | IT approval per Section 5 |
| SharePoint App Catalog trust | IT / SharePoint Admin | After .sppkg upload | SharePoint Admin approval |

### 9.3 Incident ownership

| Domain | First responder | Escalation | Source |
|--------|----------------|-----------|--------|
| Auth failures | On-call responder | Platform engineering → IT | [repo fact] `operational-runbook.md` — Alert 1 |
| Handler error rate | On-call responder | Platform engineering | [repo fact] `operational-runbook.md` — Alert 2 |
| Provisioning saga failure | On-call responder | Platform engineering → IT | [repo fact] `operational-runbook.md` — Alert 3 |
| Timer function failure | On-call responder | Platform engineering | [repo fact] `operational-runbook.md` — Alert 4 |
| Identity operations | On-call responder | IT (Entra ID/Graph permissions) | [repo fact] `operational-runbook.md` escalation path |
| SharePoint tenant issues | IT / SharePoint Admin | Microsoft support | [assumption] Standard tenant support path |

**Note:** The 4-tier escalation path (on-call → platform engineering → IT → architecture) is documented in `operational-runbook.md` but lacks formal SLA expectations, on-call rotation structure, and contact details. This is P13-01 gap G10, targeted for closure in P13-04 (support model and escalation matrix).

---

## Validation checklist

- [x] No unavailable environment details presented as facts — assumptions labeled
- [x] All configuration tiers documented with ownership
- [x] All external dependencies listed with failure impact
- [x] Dependency failure cascade paths documented with existing mitigations
- [x] Least-privilege model documented for each access boundary
- [x] Known environment risks include severity and mitigation
- [x] Secret rotation considerations documented
- [x] Document is specific enough to support runbooks (P13-05, P13-06) and production gates (P13-02)
