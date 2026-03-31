# Phase 5 — Release Gates and Diagnostics

> Created: 2026-03-30
> Prompt: P5-03 Operational Diagnostics and Release Gates

## Purpose

Defines the executable release gates, post-deploy smoke checks, and diagnostic interpretation guide for the Project Setup deployment.

---

## 1. Release Gates (Go / No-Go)

### Pre-Deploy Gates (Run Before Deployment)

| # | Gate | Test | Command | Pass Criteria |
|---|------|------|---------|---------------|
| G1 | Type check | Backend + Frontend | `pnpm --filter @hbc/functions check-types && cd apps/estimating && npx tsc --noEmit` | 0 errors |
| G2 | Unit tests | All packages | `pnpm --filter @hbc/functions test` | All pass |
| G3 | Lint | Backend | `pnpm --filter @hbc/functions lint` | 0 errors |
| G4 | Build | Frontend | `pnpm --filter @hbc/spfx-project-setup build` | Exit 0 |
| G5 | Release gate tests | Regression | `release-gates.test.ts` (runs with G2) | All 10 checks pass |
| G6 | Auth contract | Route scan | `auth-contract.test.ts` (runs with G2) | All HTTP routes use withAuth |
| G7 | Infra readiness | Config/CORS | `infra-readiness.test.ts` (runs with G2) | CORS configured, tiers present |

### Deploy Gates (During Deployment)

| # | Gate | Check | Method |
|---|------|-------|--------|
| D1 | Function App reachable | `GET /api/health` returns 200 | HTTP check |
| D2 | Core config ready | `configTiers.core === 'ready'` | Health response |
| D3 | SharePoint config ready | `configTiers.sharepoint === 'ready'` | Health response |
| D4 | Not blocked | `operationalReadiness !== 'blocked'` | Health response |

### Post-Deploy Gates (Run After Deployment)

| # | Gate | Test | Command |
|---|------|------|---------|
| P1 | Health smoke | Health returns operational readiness | `test:contract-smoke` |
| P2 | Auth rejection | Unauthenticated requests return 401 | `test:contract-smoke` |
| P3 | Auth acceptance | Valid token returns 200 on list endpoint | `test:contract-smoke` (requires AUTH_TOKEN) |
| P4 | Provisioning prereqs | Health reports individual gate status | `test:contract-smoke` |

### Running Post-Deploy Smoke Checks

```bash
# Against staging
export SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net
export AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
pnpm --filter @hbc/functions test:contract-smoke
```

---

## 2. Release Gate Test Inventory

### `release-gates.test.ts` (10 tests)

| Test | What It Proves |
|------|---------------|
| All requiredInProd entries have configTier | Config classification complete |
| Core tier ≥ 6 settings | Core validation not weakened |
| SharePoint tier ≥ 2 settings | SP validation not weakened |
| CORS no wildcard | No permissive origins |
| CORS supports credentials | Bearer tokens work cross-origin |
| Auth contract test exists | Route protection enforced |
| Tiered validation functions exist | Startup scoping preserved |
| Health includes operationalReadiness | Diagnostic endpoint works |
| AZURE_CLIENT_SECRET not in registry | Pure MI enforced |
| NoOpSignalRPushService exists | Graceful degradation preserved |
| Function timeout ≥ 10 min | Provisioning saga has enough time |
| Post-deploy smoke test exists | Smoke check file present |

### `post-deploy-smoke.test.ts` (7 tests, env-gated)

| Test | What It Proves |
|------|---------------|
| Health returns 200 with operationalReadiness | Service is running |
| Health reports tiered config | Config diagnostics work |
| Health reports provisioning prereqs | Prereq visibility works |
| project-setup-requests rejects unauth | Auth enforced |
| provisioning-status rejects unauth | Auth enforced |
| Authenticated list returns items | Full auth path works |
| Negotiate rejects without projectId | Validation works post-auth |

---

## 3. Diagnostic Interpretation (Quick Reference)

### `operationalReadiness` Values

| Value | Meaning | Action |
|-------|---------|--------|
| `ready` | All config tiers and integrations configured | Safe to serve traffic |
| `degraded` | Core works, some optional features unavailable | Check `configTiers` and `integrations` for specifics |
| `blocked` | Core config missing | **Stop** — fix config before serving traffic |

### `configTiers` Fields

| Field | `ready` means | `missing`/`incomplete` means |
|-------|---------------|------------------------------|
| `core` | Auth + storage + telemetry configured | Cannot process any authenticated request |
| `sharepoint` | SP tenant + projects site configured | SharePoint operations will fail |
| `provisioning` | All 5 saga prerequisites met | Provisioning saga will fail at execution |

### Common Failure → Resolution Map

| Diagnostic Signal | Root Cause | Fix |
|-------------------|------------|-----|
| `operationalReadiness: blocked` | Core env var missing | Set AZURE_TENANT_ID, AZURE_CLIENT_ID, API_AUDIENCE, AZURE_TABLE_ENDPOINT, APPLICATIONINSIGHTS_CONNECTION_STRING, HBC_ADAPTER_MODE |
| `configTiers.sharepoint: missing` | SP URLs not set | Set SHAREPOINT_TENANT_URL, SHAREPOINT_PROJECTS_SITE_URL |
| `provisioningPrereqs.graphPermission: false` | IT hasn't granted Graph access | IT grants Group.ReadWrite.All, then set GRAPH_GROUP_PERMISSION_CONFIRMED=true |
| `integrations.signalR: not-configured` | No SignalR connection string | Set AzureSignalRConnectionString or accept no-op mode |
| 401 on all routes | Token or audience mismatch | Verify API_AUDIENCE matches app registration; verify SPFx apiAudience config |

---

## 4. Remaining Observability Limitations

| Limitation | Impact | Future Mitigation |
|------------|--------|-------------------|
| No automated App Insights alert rules | Failures require manual dashboard check | Deploy via Terraform in infra-as-code pass |
| Email notifications are stub | Provisioning outcomes not emailed | Implement SendGrid integration |
| No frontend error reporting to App Insights | Client-side failures invisible to operators | Add frontend telemetry in Phase 6+ |
| No SLA / latency baseline | Cannot detect performance degradation | Establish baseline after first production traffic |
