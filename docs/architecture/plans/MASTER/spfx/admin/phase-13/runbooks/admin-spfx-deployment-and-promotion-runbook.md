# Admin SPFx IT Control Center — Deployment and Promotion Runbook

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-05 — Phase 13 Deployment and Rollback Runbooks
**Scope:** Production deployment and staging-to-production promotion procedures
**Owner:** T2 — Platform Engineering (see P13-04 support model)

---

## 1. Purpose

This runbook provides step-by-step procedures for deploying and promoting the Admin SPFx IT Control Center from staging to production. It covers both the SPFx frontend package and the Azure Functions backend, including coordination between them when API contracts change.

All steps are grounded in the actual CI/CD pipeline (`spfx-build.yml`, `spfx-deploy.yml`, `cd.yml`) and the environment model documented in P13-03.

---

## 2. Pre-deployment prerequisites

### 2.1 Release readiness

Before initiating any production deployment:

- [ ] All P13-02 blocker gates (B1–B5) are resolved or have approved exceptions
- [ ] All P13-02 warning items (W1–W8) have documented risk acceptance from product owner
- [ ] The version being deployed has passed the full CI pipeline on `main` (build, test, lint, bundle check, manifest validation)
- [ ] The staging deployment of this version has been verified (see Section 6)
- [ ] No unresolved Sev 1 or Sev 2 issues exist against the version being deployed

### 2.2 Access requirements

| Action | Required access | Who has it |
|--------|----------------|-----------|
| Trigger production SPFx deploy | GitHub repository write + Environment approval | T2 (Platform Engineering) |
| Approve GitHub Environment gate | GitHub Environment reviewer role for `spfx-production` | Designated approver(s) |
| Deploy Azure Functions to production | Azure Portal Contributor on Function App resource | T2 / T3 (IT) |
| Verify SharePoint App Catalog | SharePoint Admin or App Catalog site admin | T3 (IT) |
| Verify Azure Table Storage | Storage Account Contributor or Table Data Reader | T2 / T3 |

### 2.3 Coordination check

Before deploying, determine the deployment type:

| Deployment type | When | Procedure |
|----------------|------|-----------|
| **SPFx-only** | Frontend changes with no API contract changes | Deploy SPFx only (Section 5.1) |
| **Backend-only** | Backend changes with no SPFx dependency | Deploy backend only (Section 5.2) |
| **Coordinated** | API contract changes, new endpoints, or shared model changes | Deploy backend first, then SPFx (Section 5.3) |

**Rule:** When in doubt, treat as coordinated. Backend-first is always safe; SPFx-first with API changes will break.

---

## 3. Environment checks

Run these checks before initiating deployment.

### 3.1 Staging verification (must pass before production promotion)

| Check | How | Expected result |
|-------|-----|----------------|
| Staging SPFx loads | Navigate to staging SharePoint site → Admin WebPart page | WebPart renders, lane navigation works |
| Staging backend health | `curl https://<staging-func-url>/api/health` | `200 OK` with `{ "status": "healthy" }` |
| Staging alert polling | Open Health dashboard (`/health`) in staging | Alert dashboard loads, no polling errors in console |
| Staging probe health | Check probe dashboard in staging | At least azure-functions and sharepoint probes report status |
| Staging provisioning | If provisioning changes included: run a test provisioning in staging | Saga completes or fails with expected behavior |

### 3.2 Production environment readiness

| Check | How | Expected result |
|-------|-----|----------------|
| Production Function App running | Azure Portal → Function App → Overview → Status | Running |
| Production config entries populated | Azure Portal → Function App → Configuration → verify 9 core entries | All `wave0-env-registry.ts` core-tier entries present |
| Azure Table Storage accessible | Azure Portal → Storage Account → Tables → verify 6 tables exist | `AdminRuns`, `AdminAuditEvents`, `AdminEvidence`, `ObservabilityAlerts`, `ObservabilityProbeSnapshots`, `ObservabilityErrors` |
| App Catalog accessible | SharePoint Admin Center → Apps → App Catalog | App Catalog site accessible |
| GitHub Environment protection active | GitHub → Settings → Environments → `spfx-production` | Required reviewers configured |

---

## 4. Packaging / build verification expectations

### 4.1 CI pipeline verification

The `spfx-build.yml` pipeline runs automatically on push to `main`. Verify the following passed for the commit being deployed:

| CI step | What it validates | Where to check |
|---------|------------------|----------------|
| Shared package build | All workspace packages compile | GitHub Actions → `spfx-build` workflow → build job |
| SPFx app build | `apps/admin` builds without errors | Same workflow → build job |
| Unit tests | All 11 SPFx apps pass vitest | Same workflow → test step |
| Lint | No lint errors across workspace | Same workflow → lint-and-typecheck job |
| Type check | No TypeScript errors across workspace | Same workflow → lint-and-typecheck job |
| Bundle size | All bundles under 800 KB warning limit | Same workflow → bundle check step |
| Manifest validation | All WebPart GUIDs are unique | Same workflow → validate manifests step |
| .sppkg packaging | `hb-intel-admin.sppkg` produced | Same workflow → artifacts |

### 4.2 Artifact identification

| Artifact | Location | Retention |
|----------|----------|-----------|
| `.sppkg` files | GitHub Actions → workflow run → Artifacts | 30 days |
| Build commit SHA | Git log / GitHub Actions summary | Permanent |
| Version | `apps/admin/package.json` → `version` field | In repo |

Record the **commit SHA**, **workflow run ID**, and **package version** before proceeding to deployment.

---

## 5. Deployment / promotion sequence

### 5.1 SPFx-only deployment

**Staging (automatic):**
1. Push to `main` triggers `spfx-build.yml`
2. On success, `spfx-deploy.yml` staging job triggers automatically
3. PnP PowerShell uploads `.sppkg` to staging App Catalog with `Overwrite` + `Publish`
4. Verify staging (Section 3.1)

**Production (manual):**
1. Navigate to GitHub → Actions → `spfx-deploy` workflow → most recent successful staging run
2. Click "Review deployments" for the `spfx-production` environment
3. Verify the commit SHA matches the intended release
4. Approve the deployment
5. Monitor the production job:
   - Downloads .sppkg artifacts from the build
   - Authenticates via `SPFX_PROD_CLIENT_ID` / `SPFX_PROD_CLIENT_SECRET`
   - Uploads to production App Catalog with `Overwrite` + `Publish`
6. Proceed to post-deployment validation (Section 6)

### 5.2 Backend-only deployment

**Staging:**
1. Push to `main` triggers `cd.yml`
2. Azure Functions deployment job deploys to staging Function App
3. Verify staging backend health: `curl https://<staging-func-url>/api/health`

**Production:**
1. Trigger production Azure Functions deployment via `cd.yml` or Azure Portal
2. Monitor deployment progress in GitHub Actions or Azure Portal → Function App → Deployment Center
3. Verify production backend health: `curl https://<prod-func-url>/api/health`
4. Verify timer functions are registered: Azure Portal → Function App → Functions → verify `timerFullSpec` and `cleanupIdempotency` present
5. Proceed to post-deployment validation (Section 6)

### 5.3 Coordinated deployment (backend + SPFx)

**Critical rule:** Deploy backend first, then SPFx. Never deploy SPFx with new API dependencies before the backend supports them.

**Sequence:**
1. **Deploy backend to staging** (Section 5.2 staging steps)
2. **Verify staging backend** — confirm new endpoints respond correctly
3. **Deploy SPFx to staging** (automatic on same `main` push, or manual re-trigger)
4. **Verify staging end-to-end** (Section 3.1 — full staging verification)
5. **Deploy backend to production** (Section 5.2 production steps)
6. **Verify production backend health** before proceeding
7. **Deploy SPFx to production** (Section 5.1 production steps)
8. **Full post-deployment validation** (Section 6)

**If backend deployment fails:** Do NOT proceed with SPFx production deployment. The SPFx package on the existing backend remains functional.

---

## 6. Post-deployment validation

Run within 15 minutes of production deployment completing.

### 6.1 Smoke checks

| Check | How | Expected result | Severity if failed |
|-------|-----|----------------|-------------------|
| Admin WebPart loads | Navigate to production SharePoint → Admin page | WebPart renders with lane navigation | Sev 1 — initiate rollback |
| Backend health | `curl https://<prod-func-url>/api/health` | `200 OK` with `healthy` status | Sev 1 — initiate rollback |
| Alert polling active | Open Health dashboard → check browser network tab for polling requests | 30s polling cycle visible, no 401/500 errors | Sev 2 — investigate |
| Error Log loads | Navigate to `/errors` | Page renders, query executes (may return empty) | Sev 2 — investigate |
| Provisioning Oversight loads | Navigate to `/runs` | Page renders with run tabs | Sev 2 — investigate |
| Permission gate works | Non-admin user cannot access admin routes | Redirect to `/` | Sev 2 — investigate |

### 6.2 Extended checks (within 1 hour)

| Check | How | Expected result |
|-------|-----|----------------|
| Timer functions registered | Azure Portal → Function App → Functions list | `timerFullSpec` and `cleanupIdempotency` present |
| Application Insights receiving data | Azure Portal → Application Insights → Live Metrics | Incoming requests visible |
| Teams webhook (if configured) | Trigger a test alert or wait for next polling cycle | Alert appears in `#hb-intel-alerts` (or confirm webhook URL is configured) |
| Probe polling | Wait for 15-minute probe cycle | Probe dashboard shows updated timestamps |

---

## 7. Evidence capture

Record the following for every production deployment:

| Evidence | Where to record | Retention |
|----------|----------------|-----------|
| Commit SHA deployed | Deployment log / release notes | Permanent |
| GitHub Actions workflow run URL (build) | Deployment log | 30 days (artifact) / permanent (log) |
| GitHub Actions workflow run URL (deploy) | Deployment log | Permanent |
| Package version (`apps/admin/package.json`) | Deployment log / git tag | Permanent |
| Backend version (`backend/functions/package.json`) | Deployment log / git tag | Permanent |
| Pre-deployment staging verification results | Deployment log | 90 days |
| Post-deployment smoke check results | Deployment log | 90 days |
| GitHub Environment approval (who approved, when) | GitHub audit log | Per GitHub retention |
| Any deployment anomalies or warnings | Deployment log | 90 days |

---

## 8. Abort conditions

**Abort the deployment and initiate rollback (see rollback runbook) if any of these occur:**

| Condition | When detected | Action |
|-----------|--------------|--------|
| CI pipeline fails for the target commit | Before deployment | Do not deploy. Fix the issue and re-run CI. |
| Staging verification fails | Before production promotion | Do not promote. Investigate staging failure. |
| Production SPFx WebPart does not render after deployment | Post-deployment smoke check | Initiate SPFx rollback immediately. |
| Production backend health returns non-200 or unhealthy | Post-deployment smoke check | Initiate backend rollback immediately. |
| Widespread auth failures (401 burst) after deployment | Post-deployment monitoring | Initiate coordinated rollback. Escalate to T3 if auth issue is tenant-level. |
| GitHub Environment approval denied | During production promotion | Deployment blocked. Address reviewer concerns before re-requesting. |
| Deployment script error (PnP PowerShell failure, Azure deploy failure) | During deployment | Retry once. If retry fails, investigate credentials and network. Do not force. |

**Rule:** When in doubt, roll back. A brief rollback is less disruptive than a prolonged degraded state.

---

## 9. Hand-off / sign-off expectations

### Pre-deployment sign-off

| Role | Responsibility | Sign-off method |
|------|---------------|----------------|
| T2 (Platform Engineering) | Confirms CI passed, staging verified, coordination type determined | Verbal or written confirmation |
| GitHub Environment reviewer | Approves production deployment | GitHub Environment approval UI |

### Post-deployment sign-off

| Role | Responsibility | Sign-off method |
|------|---------------|----------------|
| T2 (Platform Engineering) | Confirms smoke checks passed, evidence captured | Deployment log entry |
| T1 (Operator) | Confirms admin console functional from operator perspective | Verbal or written confirmation within 1 hour |

### Deployment ownership

- T2 owns the deployment process from start to completion.
- T1 is notified before production deployment begins and after it completes.
- T3 is engaged only if infrastructure issues arise during deployment.
- If deployment occurs outside business hours, T2 must still complete smoke checks before considering the deployment complete.

---

## Cross-references

| Document | Location |
|----------|----------|
| Rollback and Recovery Runbook | `phase-13/runbooks/admin-spfx-rollback-and-recovery-runbook.md` |
| Release Readiness Baseline | `phase-13/admin-spfx-phase-13-release-readiness-baseline.md` |
| Environment Baseline | `phase-13/admin-spfx-phase-13-environment-identity-and-dependency-baseline.md` |
| Support Model | `phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| CI/CD Guide | `docs/how-to/developer/phase-8-ci-cd-guide.md` |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` |
| IT Department Setup Guide | `docs/how-to/administrator/setup/backend/IT-Department-Setup-Guide.md` |
