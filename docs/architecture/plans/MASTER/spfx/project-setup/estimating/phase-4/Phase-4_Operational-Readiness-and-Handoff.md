# Phase 4 — Operational Readiness and Handoff

> Created: 2026-03-30
> Prompt: P4-05 Observability, Release Readiness, and Operational Guards

## Purpose

Operator-facing handoff documentation for the Project Setup deployment. Covers health interpretation, failure triage, telemetry events, release gates, and remaining operational blind spots.

---

## 1. Health Endpoint Interpretation Guide

**Endpoint:** `GET /api/health` (unauthenticated)

### Response Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `operationalReadiness` | `ready` / `degraded` / `blocked` | Overall infrastructure status |
| `configTiers.core` | `ready` / `missing` | Auth + Table Storage + telemetry |
| `configTiers.sharepoint` | `ready` / `missing` | SharePoint URLs |
| `configTiers.provisioning` | `ready` / `incomplete` | Saga prerequisites |
| `provisioningPrereqs.*` | `true` / `false` | Individual provisioning gate status |
| `integrations.signalR` | `ready` / `not-configured` | Real-time push availability |
| `integrations.email` | `ready` / `not-configured` | Email delivery (stub — always not-configured) |
| `roleConfig.*` | `configured` / `degraded` | RBAC UPN lists |

### Interpreting `operationalReadiness`

| Status | Meaning | Action |
|--------|---------|--------|
| `ready` | All tiers configured, all integrations available | Safe to deploy |
| `degraded` | Core works but some integrations missing | Functional with reduced capability (no real-time updates, limited provisioning) |
| `blocked` | Core config missing | **Do not deploy** — auth, storage, or adapter mode not configured |

---

## 2. Pre-Deployment Checklist

### Infrastructure (Must Be Complete)

- [ ] Azure Function App deployed with latest `@hbc/functions` version
- [ ] System-assigned Managed Identity enabled
- [ ] MI → Storage Table Data Contributor role assigned
- [ ] MI → Sites.FullControl.All (or Sites.Selected per-site) granted
- [ ] MI → Group.ReadWrite.All (application) granted
- [ ] `GET /api/health` returns `operationalReadiness: ready` or `degraded`

### Configuration (Must Be Set)

- [ ] `AZURE_TENANT_ID` — Entra ID tenant
- [ ] `AZURE_CLIENT_ID` — MI client ID
- [ ] `API_AUDIENCE` — App registration audience URI
- [ ] `AZURE_TABLE_ENDPOINT` — Table Storage endpoint
- [ ] `APPLICATIONINSIGHTS_CONNECTION_STRING` — App Insights
- [ ] `HBC_ADAPTER_MODE` — `proxy` for production
- [ ] `SHAREPOINT_TENANT_URL` — Root tenant URL
- [ ] `SHAREPOINT_PROJECTS_SITE_URL` — Projects list site

### Provisioning Gates (Required Before First Saga Run)

- [ ] `GRAPH_GROUP_PERMISSION_CONFIRMED=true` — IT has granted Graph permissions
- [ ] `SHAREPOINT_HUB_SITE_ID` — Valid hub site GUID
- [ ] `SHAREPOINT_APP_CATALOG_URL` — App catalog URL
- [ ] `HB_INTEL_SPFX_APP_ID` — SPFx package GUID
- [ ] `OPEX_MANAGER_UPN` — OpEx manager UPN

### Integrations (Optional — Degrades Gracefully)

- [ ] `AzureSignalRConnectionString` — Enables real-time provisioning progress
- [ ] `CONTROLLER_UPNS` — Enables controller role-based transitions
- [ ] `ADMIN_UPNS` — Enables admin role resolution

---

## 3. Release Go / No-Go Gates

| Gate | Criteria | Blocker? |
|------|----------|----------|
| Health probe | `GET /api/health` returns 200 | Yes |
| Operational readiness | `operationalReadiness !== 'blocked'` | Yes |
| Core config | `configTiers.core === 'ready'` | Yes |
| SharePoint config | `configTiers.sharepoint === 'ready'` | Yes (for any SP-dependent feature) |
| Type check | `pnpm --filter @hbc/functions check-types` passes | Yes |
| Unit tests | `pnpm --filter @hbc/functions test` — all pass | Yes |
| Lint | `pnpm --filter @hbc/functions lint` — 0 errors | Yes |
| CORS | `host.json` CORS matches production origins | Yes |
| Provisioning prereqs | All 5 gates pass (if saga will be used) | No — degrades to non-provisioning mode |

---

## 4. Failure Triage Runbook

### Startup Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Function App fails to start | Missing core config | Check `configTiers.core` via health probe. Set missing env vars. |
| `[StartupValidation:core] Missing N required` | Core-tier env vars absent | Set `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `API_AUDIENCE`, `AZURE_TABLE_ENDPOINT`, `APPLICATIONINSIGHTS_CONNECTION_STRING`, `HBC_ADAPTER_MODE` |
| `[StartupWarning] SharePoint config incomplete` | SharePoint URLs missing | Set `SHAREPOINT_TENANT_URL` and `SHAREPOINT_PROJECTS_SITE_URL`. App still boots. |

### Auth Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| 401 on all routes | Invalid/expired Bearer token | Check token audience matches `API_AUDIENCE`. Check issuer matches tenant. |
| 401 with `reason: config_error` | `API_AUDIENCE` not set | Set `API_AUDIENCE` to `api://<app-registration-client-id>` |
| 401 with `reason: invalid_audience` | Token scoped to wrong API | Verify SPFx `apiAudience` config matches backend `API_AUDIENCE` |
| 403 on admin routes | User lacks `Admin`/`HBIntelAdmin` role | Assign app role in Entra ID app registration |

### Provisioning Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Saga fails at Step 6 | `GRAPH_GROUP_PERMISSION_CONFIRMED !== 'true'` | Confirm IT has granted `Group.ReadWrite.All`, then set env var |
| Saga fails at Step 5 | App catalog unavailable or SPFx app not published | Verify `SHAREPOINT_APP_CATALOG_URL` and `HB_INTEL_SPFX_APP_ID` |
| Saga fails at Step 7 | Invalid hub site ID | Verify `SHAREPOINT_HUB_SITE_ID` matches a real hub site |
| Step 5 deferred to timer | Normal behavior | Timer retries at 1 AM EST; 3 failures → escalation |
| No real-time updates | `AzureSignalRConnectionString` not set | Set connection string or accept degraded mode (no push) |

### Storage Failures

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Table Storage errors | MI lacks `Storage Table Data Contributor` | Assign RBAC role on storage account |
| `AZURE_TABLE_ENDPOINT` connection failure | Endpoint URL wrong or network blocked | Verify endpoint URL and network/firewall rules |

---

## 5. Telemetry Event Catalog

### Startup Events

| Event | When | Properties |
|-------|------|------------|
| `startup.mode.resolved` | Service factory initialization | `adapterMode`, `environment`, `surface` |

### Auth Events

| Event | When | Properties |
|-------|------|------------|
| `auth.bearer.success` | Token validated | `correlationId`, `durationMs` |
| `auth.bearer.error` | Token rejected | `correlationId`, `reason` (structured: `missing_header`, `expired`, `invalid_issuer`, `invalid_audience`, `missing_claims`, `validation_failed`), `durationMs` |
| `auth.mi.start` | MI token acquisition started | `scope` |
| `auth.mi.success` | MI token acquired | `scope`, `durationMs` |
| `auth.mi.error` | MI token acquisition failed | `scope`, `durationMs`, `errorMessage` |

### Provisioning Events

| Event | When | Properties |
|-------|------|------------|
| `ProvisioningTimerStarted` | Timer job begins | `pendingJobCount` |
| `ProvisioningStepCompleted` | Saga step succeeds | `projectId`, `stepNumber`, `durationMs` |
| `ProvisioningStepFailed` | Saga step fails | `projectId`, `stepNumber`, `error`, `retryCount` |
| `ProvisioningStep5Deferred` | Step 5 deferred to timer | `projectId` |
| `ProvisioningTimerCompleted` | Timer job ends | `total`, `completed`, `deferred`, `failed` |

### Idempotency Events

| Event | When | Properties |
|-------|------|------------|
| `idempotency.cleanup.start` | Cleanup timer begins | — |
| `idempotency.cleanup.success` | Records pruned | `deletedCount` |
| `idempotency.cleanup.error` | Cleanup failed | `errorMessage` |

---

## 6. Recommended App Insights Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| Provisioning failure | `ProvisioningStepFailed` count > 0 in 15 min | Warning | Investigate failed project; check saga step logs |
| Auth MI failure spike | `auth.mi.error` count > 5 in 5 min | Critical | MI credential issue; check Entra ID and role assignments |
| Timer no completions | `ProvisioningTimerCompleted` with `completed: 0` and `total > 0` | Warning | All deferred jobs failing; check Step 5 prerequisites |
| Health blocked | `operationalReadiness: blocked` | Critical | Core config missing; immediate fix required |

---

## 7. Remaining Operational Blind Spots

| Blind Spot | Impact | Mitigation |
|------------|--------|------------|
| No automated alert rules deployed | Operators must check App Insights manually | Deploy alert rules via Terraform/Bicep (Phase 5+) |
| Email notifications are stub | Provisioning completion/failure not emailed | Monitor via App Insights events; email integration is future scope |
| SignalR no-op mode not surfaced to end users | Users see no real-time updates without explanation | Consider adding a "real-time updates unavailable" banner when SignalR is in no-op mode |
| No load testing baseline | Token validation and Table Storage performance under load unknown | Establish baseline before high-traffic deployment |
