# Phase 5 — Deployment Runbook

> Created: 2026-03-30
> Prompt: P5-04 Deployment Rehearsal, Rollback, and Recovery
> Closes P5-01 blockers A3 (deployment runbook) and A4 (rollback procedure)

---

## 1. Deployment Prerequisites

Complete **all** items before starting the deployment sequence.

### D0 — SharePoint Column Migration (P6-01, One-Time)

Migrate four JSON-serialized array columns from `Text` (255-char limit) to `Note` (MultiLineText) in the HBCentral **Projects** list. Required before deploying P6-01 backend changes to prevent JSON truncation on write.

| Column Internal Name | Current Type | Target Type |
|----------------------|-------------|-------------|
| `supportingEstimatorUpns` | Text | Note (MultiLineText) |
| `additionalTeamMemberUpns` | Text | Note (MultiLineText) |
| `sageAccessUpns` | Text | Note (MultiLineText) |
| `clarificationItems` | Text | Note (MultiLineText) |

- [ ] All four columns migrated in the HBCentral Projects list
- [ ] Verified: existing rows still readable after migration (SP preserves data on Text → Note conversion)

### Infrastructure (One-Time Setup)

- [ ] Azure Function App created with Node.js 20+ runtime
- [ ] System-assigned Managed Identity enabled on the Function App
- [ ] Azure Storage Account created for Table Storage
- [ ] Azure SignalR Service instance created (optional — degrades gracefully)
- [ ] Application Insights instance created

### Identity Grants (One-Time, IT-Approved)

- [ ] MI → `Storage Table Data Contributor` on the storage account
- [ ] MI → `Sites.FullControl.All` (or `Sites.Selected` per project) on SharePoint tenant
- [ ] MI → `Group.ReadWrite.All` (application permission) on Microsoft Graph
- [ ] Entra ID app registration created with Application ID URI (`api://<client-id>`)
- [ ] SPFx API access request approved in SharePoint admin center

### Environment Variables (Required)

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `AZURE_TENANT_ID` | `00000000-...` | Entra ID tenant |
| `AZURE_CLIENT_ID` | `00000000-...` | MI client ID |
| `API_AUDIENCE` | `api://00000000-...` | App registration audience URI |
| `AZURE_TABLE_ENDPOINT` | `https://account.table.cosmos.azure.com:443/` | Table Storage endpoint |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | `InstrumentationKey=...` | App Insights |
| `HBC_ADAPTER_MODE` | `proxy` | Must be `proxy` for production |
| `SHAREPOINT_TENANT_URL` | `https://hedrickbrotherscom.sharepoint.com` | Root tenant URL |
| `SHAREPOINT_PROJECTS_SITE_URL` | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` | Projects list site |

### Environment Variables (Provisioning — Set When Ready)

| Variable | Notes |
|----------|-------|
| `GRAPH_GROUP_PERMISSION_CONFIRMED` | Set to `true` only after IT confirms Graph grant |
| `SHAREPOINT_HUB_SITE_ID` | Hub site GUID for Step 7 |
| `SHAREPOINT_APP_CATALOG_URL` | App catalog URL for Step 5 |
| `HB_INTEL_SPFX_APP_ID` | SPFx package GUID for Step 5 |
| `OPEX_MANAGER_UPN` | OpEx manager UPN for Step 6 |
| `AzureSignalRConnectionString` | SignalR connection string (optional) |

---

## 2. Step-by-Step Release Sequence

### Phase A: Pre-Deploy Validation (Developer Machine or CI)

```bash
# A1. Type check
pnpm --filter @hbc/functions check-types
# Expected: EXIT 0

# A2. Unit tests (includes release gates, auth contract, infra readiness)
pnpm --filter @hbc/functions test
# Expected: All pass (50+ test files)

# A3. Lint
pnpm --filter @hbc/functions lint
# Expected: 0 errors

# A4. Frontend build
pnpm --filter @hbc/spfx-project-setup build
# Expected: EXIT 0

# A5. Frontend type check
cd apps/estimating && npx tsc --noEmit
# Expected: EXIT 0
```

**Decision point:** If any A-step fails → STOP. Fix before proceeding.

### Phase B: Deploy Backend (Azure Function App)

```bash
# B1. Build backend
cd backend/functions
pnpm build

# B2. Deploy to staging (or production)
# Using Azure Functions Core Tools:
func azure functionapp publish <FUNCTION_APP_NAME> --node

# Alternative: Deploy via CI/CD pipeline (GitHub Actions, Azure DevOps)
```

**Decision point:** If deployment fails → check Azure portal for error details.

### Phase C: Post-Deploy Validation

```bash
# C1. Health probe (unauthenticated)
curl -s https://<FUNCTION_APP_URL>/api/health | jq .

# Expected response includes:
# {
#   "status": "healthy",
#   "operationalReadiness": "ready" | "degraded",
#   "configTiers": { "core": "ready", "sharepoint": "ready", ... }
# }
```

**Decision points:**
- `operationalReadiness: blocked` → **ROLLBACK** — core config missing
- `operationalReadiness: degraded` → Check `configTiers` and `integrations` — may be acceptable
- `operationalReadiness: ready` → Proceed to C2

```bash
# C2. Auth enforcement check (expect 401)
curl -s -o /dev/null -w "%{http_code}" https://<FUNCTION_APP_URL>/api/project-setup-requests
# Expected: 401

# C3. Authenticated check (requires valid token)
TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
curl -s -H "Authorization: Bearer $TOKEN" https://<FUNCTION_APP_URL>/api/project-setup-requests | jq .
# Expected: 200 with { "items": [...] }
```

**Decision point:** If C2 returns non-401 or C3 returns 401 → **ROLLBACK** — auth misconfigured.

```bash
# C4. Run post-deploy smoke suite (if staging URL available)
export SMOKE_TEST_BASE_URL=https://<FUNCTION_APP_URL>
export AUTH_TOKEN=$TOKEN
pnpm --filter @hbc/functions test:contract-smoke
# Expected: All smoke checks pass
```

### Phase D: Deploy Frontend (SPFx Package)

```bash
# D1. Build SPFx bundle
pnpm --filter @hbc/spfx-project-setup build
# Output: dist/estimating-app.js

# D2. Package for SPFx shell
# The shell webpart loads the IIFE bundle via SPComponentLoader.
# Upload the built bundle to the configured hosting location
# (CDN, SharePoint assets library, or Azure Blob Storage).

# D3. Verify SPFx webpart renders in SharePoint
# Navigate to a SharePoint page with the Estimating webpart.
# Confirm it loads without console errors.
# Confirm backend mode indicator shows correctly.
```

### Phase E: Post-Release Monitoring (First 30 Minutes)

- [ ] Check App Insights for `auth.bearer.error` events (should be near-zero)
- [ ] Check App Insights for `auth.mi.error` events (should be zero)
- [ ] If provisioning is active: check `ProvisioningStepFailed` events
- [ ] Check health endpoint every 5 minutes for first 30 minutes
- [ ] Confirm no 5xx responses in App Insights request logs

---

## 3. Rollback Procedures

### Trigger: When to Rollback

| Signal | Severity | Action |
|--------|----------|--------|
| `operationalReadiness: blocked` after deploy | Critical | Immediate rollback |
| All requests return 401 | Critical | Rollback (auth misconfigured) |
| 5xx spike > 10% of requests | Critical | Rollback |
| `auth.mi.error` sustained > 5/min | High | Rollback (MI grant issue) |
| Table Storage errors on provisioning | High | Rollback if new code caused it |
| `operationalReadiness: degraded` | Medium | Investigate — may be pre-existing |

### Rollback Steps: Backend

```bash
# Option 1: Redeploy previous version
# If using CI/CD: trigger deployment of the last known-good commit.

# Option 2: Azure portal slot swap (if using deployment slots)
# Swap staging slot back to production in Azure Portal → Function App → Deployment slots

# Option 3: Redeploy from git
git checkout <LAST_KNOWN_GOOD_COMMIT>
cd backend/functions
pnpm build
func azure functionapp publish <FUNCTION_APP_NAME> --node
```

### Rollback Steps: Frontend (SPFx)

```bash
# Re-upload the previous bundle version to the hosting location.
# The SPFx shell webpart will load the restored bundle on next page load.
# No SharePoint admin action required — bundle is loaded dynamically.
```

### Post-Rollback Verification

```bash
# Repeat Phase C validation steps (C1–C4) against the rolled-back deployment.
# Confirm operationalReadiness returns to pre-deploy state.
```

---

## 4. Degraded-Mode and Recovery Guidance

### Degraded: SignalR Not Configured

**Symptom:** `integrations.signalR: not-configured` in health response
**Impact:** Provisioning works but users see no real-time progress updates
**Recovery:** Set `AzureSignalRConnectionString` in app settings → restart Function App
**Acceptable for launch:** Yes — provisioning still completes; users can refresh for status

### Degraded: Provisioning Prerequisites Incomplete

**Symptom:** `configTiers.provisioning: incomplete` and individual `provisioningPrereqs` show `false`
**Impact:** Provisioning saga will fail at the missing step (Step 5, 6, or 7)
**Recovery:** Complete IT prerequisites (Graph permission grant, hub site setup, app catalog publishing) → set corresponding env vars
**Acceptable for launch:** Yes for request lifecycle (submit, review, approve). No for actual provisioning execution.

### Degraded: Role Config Missing

**Symptom:** `roleConfig.controllers: degraded` or `roleConfig.admins: degraded`
**Impact:** State transitions limited to submitter resubmit only
**Recovery:** Set `CONTROLLER_UPNS` and/or `ADMIN_UPNS`
**Acceptable for launch:** Depends on business requirements — basic submit/review works

### Blocked: Core Config Missing

**Symptom:** `operationalReadiness: blocked`, `configTiers.core: missing`
**Impact:** No authenticated requests can succeed
**Recovery:** Set all 6 core env vars → restart Function App
**Acceptable for launch:** No — must fix before serving traffic

### Blocked: SharePoint Config Missing

**Symptom:** `configTiers.sharepoint: missing`
**Impact:** SharePoint-dependent operations fail (request persistence, provisioning)
**Recovery:** Set `SHAREPOINT_TENANT_URL` and `SHAREPOINT_PROJECTS_SITE_URL`
**Acceptable for launch:** No for production mode — yes for UI-review-only mode

---

## 5. Operator Decision Points and Escalation

| Decision Point | Who Decides | Escalation Path |
|---------------|-------------|-----------------|
| Pre-deploy gates fail | Developer / CI | Fix code, re-run gates |
| Health returns `blocked` after deploy | DevOps | Check env vars → fix or rollback |
| Auth fails (401 on valid token) | DevOps + Identity team | Check `API_AUDIENCE`, app registration, SPFx consent |
| Provisioning saga fails | DevOps + IT | Check `provisioningPrereqs` in health, verify Graph/SP grants |
| 5xx spike after deploy | DevOps | Rollback → investigate with App Insights traces |
| SignalR not connecting | DevOps | Check `AzureSignalRConnectionString` — acceptable to defer |
| Customer reports data not appearing | Support + DevOps | Check `configTiers.sharepoint`, verify Projects list accessible |

---

## 6. Release Execution Checklist (Print and Use)

```
RELEASE: Project Setup v__.__.__   DATE: ____-__-__   OPERATOR: ____________

PRE-DEPLOY
[ ] A1 check-types passed
[ ] A2 unit tests passed (___/___  test files)
[ ] A3 lint passed (0 errors)
[ ] A4 frontend build passed
[ ] A5 frontend type check passed

DEPLOY
[ ] B1 backend built
[ ] B2 backend deployed to ________________
[ ] B2 deployment version recorded: ________

POST-DEPLOY
[ ] C1 health returns 200 — operationalReadiness: ________
[ ] C2 unauthenticated GET returns 401
[ ] C3 authenticated GET returns 200
[ ] C4 smoke suite passed (if staging)

FRONTEND
[ ] D1 frontend built
[ ] D2 bundle uploaded to ________________
[ ] D3 SPFx webpart renders in SharePoint

MONITORING (30 min)
[ ] No auth.bearer.error spike
[ ] No auth.mi.error events
[ ] No 5xx spike
[ ] Health still operational after 30 min

SIGN-OFF
[ ] Release APPROVED / ROLLED BACK (circle one)
[ ] Signed: ________________  Date: ____-__-__
```
