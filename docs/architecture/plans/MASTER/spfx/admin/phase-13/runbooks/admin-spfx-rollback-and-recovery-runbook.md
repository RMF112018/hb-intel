# Admin SPFx IT Control Center — Rollback and Recovery Runbook

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-05 — Phase 13 Deployment and Rollback Runbooks
**Scope:** Rollback triggers, decision tree, rollback procedures, recovery validation
**Owner:** T2 — Platform Engineering (see P13-04 support model)

---

## 1. Purpose

This runbook provides procedures for rolling back or recovering the Admin SPFx IT Control Center when a production deployment causes issues. It covers SPFx rollback, backend rollback, and coordinated rollback scenarios.

Rollback is always preferable to prolonged degraded operation. When in doubt, roll back first and investigate later.

---

## 2. Rollback triggers

### Immediate rollback (no delay for investigation)

| Trigger | Detection method | Severity |
|---------|-----------------|----------|
| Admin WebPart does not render after deployment | Post-deployment smoke check | Sev 1 |
| Backend health endpoint returns non-200 or unhealthy | `GET /api/health` check | Sev 1 |
| Widespread auth failures (401 burst) correlated with deployment | App Insights + operational runbook Alert 1 | Sev 1 |
| Data corruption or incorrect provisioning behavior | Operator report + T2 investigation | Sev 1 |

### Assessed rollback (investigate briefly before deciding)

| Trigger | Investigation window | Escalation if unresolved |
|---------|---------------------|------------------------|
| Single feature broken but core console functional | 30 minutes | Roll back if not fixable via hotfix |
| Elevated error rate (not total failure) | 1 hour | Roll back if error rate does not stabilize |
| Alert polling or probe polling failures | 1 hour | Roll back if monitoring is blind |
| Timer function registration missing | 2 hours | Roll back backend if timer is critical |
| Performance degradation (slow but functional) | 4 hours | Roll back if performance does not recover |

---

## 3. Decision tree: rollback vs hotfix vs degraded operation

```
Issue detected after deployment
│
├─ Is the admin console completely unusable (Sev 1)?
│  └─ YES → IMMEDIATE ROLLBACK (Section 4)
│
├─ Is core functionality working but a specific feature broken?
│  │
│  ├─ Can a hotfix be prepared and deployed within 1 hour?
│  │  └─ YES → HOTFIX path:
│  │     1. Prepare fix on a branch
│  │     2. Merge to main
│  │     3. CI pipeline runs
│  │     4. Deploy via normal promotion (Section 5 of deployment runbook)
│  │     5. If hotfix deploy fails → ROLLBACK
│  │
│  └─ NO → Is the broken feature critical to daily operations?
│     ├─ YES → ROLLBACK (Section 4)
│     └─ NO → DEGRADED OPERATION:
│        1. Document the degradation
│        2. Notify T1 operators of workaround
│        3. Schedule fix for next deployment
│        4. Set review checkpoint at 24 hours
│
└─ Is the issue infrastructure-related (not caused by code)?
   └─ YES → Do NOT roll back. Escalate to T3 (IT).
      Examples: Azure AD outage, SharePoint tenant issue,
      Storage Account access revoked, certificate expired
```

**Key principle:** Rollback reverses a code/config deployment. It does not fix infrastructure or tenant-level issues. If the issue existed before the deployment, rollback will not help.

---

## 4. Rollback steps

### 4.1 SPFx rollback

**Objective:** Re-deploy the previous known-good .sppkg to the production App Catalog.

**Prerequisites:**
- The previous .sppkg artifact is available (GitHub Actions artifacts, 30-day retention)
- Production App Catalog credentials are valid (`SPFX_PROD_CLIENT_ID` / `SPFX_PROD_CLIENT_SECRET`)

**Steps:**

1. **Identify the last known-good version**
   - Check GitHub Actions → `spfx-deploy` workflow → find the last successful production deployment before the problematic one
   - Record the commit SHA and workflow run ID

2. **Download the previous .sppkg artifact**
   - GitHub Actions → workflow run → Artifacts → download the `.sppkg` file for `hb-intel-admin`
   - Alternatively: re-run the `spfx-build` workflow for the known-good commit to regenerate artifacts

3. **Deploy previous version to production App Catalog**
   - Option A (preferred): Re-run the `spfx-deploy` production job for the known-good workflow run
   - Option B (manual): Use PnP PowerShell directly:
     ```powershell
     Connect-PnPOnline -Url $PROD_SITE_URL -ClientId $CLIENT_ID -ClientSecret $SECRET
     Add-PnPApp -Path ./hb-intel-admin.sppkg -Scope Tenant -Overwrite -Publish
     ```

4. **Verify rollback** (Section 5)

5. **Record evidence** (Section 6)

**Expected duration:** 5–15 minutes from decision to verification.

### 4.2 Backend rollback

**Objective:** Re-deploy the previous known-good Azure Functions build to the production Function App.

**Steps:**

1. **Identify the last known-good backend version**
   - Check GitHub Actions → `cd` workflow → find the last successful production deployment
   - Record the commit SHA

2. **Re-deploy previous backend version**
   - Option A (preferred): Re-run the `cd.yml` production deployment job for the known-good workflow run
   - Option B: Use Azure Portal → Function App → Deployment Center → redeploy previous deployment
   - Option C: If deployment slots are configured, swap staging slot back to production

3. **Verify backend health**
   ```
   curl https://<prod-func-url>/api/health
   ```
   Expected: `200 OK` with `{ "status": "healthy" }`

4. **Verify timer functions registered**
   - Azure Portal → Function App → Functions → confirm `timerFullSpec` and `cleanupIdempotency` present

5. **Verify rollback** (Section 5)

6. **Record evidence** (Section 6)

**Expected duration:** 5–20 minutes from decision to verification.

### 4.3 Coordinated rollback (backend + SPFx)

**When:** The deployment included both backend and SPFx changes with API contract dependencies.

**Critical rule:** Roll back in reverse deployment order — SPFx first, then backend. This ensures the SPFx package never depends on API endpoints that don't exist.

**Sequence:**
1. Roll back SPFx to previous version (Section 4.1)
2. Verify SPFx loads with the previous backend (may show errors if backend is still on new version)
3. Roll back backend to previous version (Section 4.2)
4. Verify full stack with both components on previous versions (Section 5)

**If only one component is problematic:**
- Backend broken but SPFx fine → Roll back backend only (Section 4.2). Previous backend is compatible with current SPFx as long as no endpoints were removed.
- SPFx broken but backend fine → Roll back SPFx only (Section 4.1). Previous SPFx should work with current backend if the backend maintained backward compatibility.

---

## 5. Post-rollback validation

Run immediately after rollback completes.

### 5.1 Smoke checks (must all pass)

| Check | How | Expected result | If failed |
|-------|-----|----------------|-----------|
| Admin WebPart renders | Navigate to production SharePoint → Admin page | Lane navigation visible, no blank page | Escalate — rollback did not restore previous state |
| Backend health | `GET /api/health` | `200 OK`, `healthy` | Escalate — backend rollback incomplete |
| Auth works | Log in as admin user → verify route access | Routes load without 401 | Escalate to T3 — may be infrastructure issue |
| Alert polling active | Open Health dashboard → check network tab | Polling requests succeeding | Investigate — may be config issue |
| Error Log accessible | Navigate to `/errors` | Page renders | Investigate — may be partial rollback |

### 5.2 Extended checks (within 1 hour)

| Check | How | Expected result |
|-------|-----|----------------|
| Provisioning Oversight loads | Navigate to `/runs` | Existing runs visible with correct states |
| Timer functions present | Azure Portal → Function App → Functions | `timerFullSpec`, `cleanupIdempotency` listed |
| No new error burst | Check Error Log and App Insights | Error rate returned to pre-deployment baseline |
| Data integrity | Spot-check recent runs, alerts, and audit records | Records created during the failed deployment period are still present (Table Storage is append-only) |

---

## 6. Evidence / audit capture

Record the following for every rollback:

| Evidence | Where to record |
|----------|----------------|
| Rollback trigger (what went wrong) | Incident log |
| Severity and impact assessment | Incident log |
| Time of issue detection | Incident log |
| Time of rollback decision | Incident log |
| Time of rollback completion | Incident log |
| Version rolled back FROM (commit SHA, package version) | Incident log |
| Version rolled back TO (commit SHA, package version) | Incident log |
| Post-rollback validation results | Incident log |
| Who performed the rollback | Incident log |
| Who approved the rollback decision | Incident log |
| Root cause (if known at time of rollback) | Incident log — update when RCA complete |
| Remediation plan | Incident log — update after investigation |

---

## 7. Stakeholder notification expectations

### During rollback

| Stakeholder | When to notify | How | What to include |
|------------|---------------|-----|----------------|
| T1 (Operators) | Immediately when rollback decision is made | Direct message or Teams channel | Brief description of issue, expected downtime, workaround if any |
| T3 (IT) | If infrastructure action is needed during rollback | Direct message | Specific action needed |
| Product owner | After rollback is complete and validated | Written summary | Impact, duration, root cause (if known), remediation plan |

### After rollback

| Action | Timeline | Owner |
|--------|----------|-------|
| Post-incident summary to stakeholders | Within 4 hours of rollback | T2 |
| Root cause analysis | Within 2 business days | T2 (with T3/T4 if needed) |
| Remediation plan documented | Within 3 business days | T2 |
| Re-deployment of fixed version | After fix is verified in staging | T2 (normal deployment process) |

---

## 8. Residual risk handling

### Data created during failed deployment

- **Azure Table Storage is append-only.** Records created during the failed deployment period (runs, audit events, errors, alerts) are preserved after rollback. They are not deleted or corrupted by rolling back the code.
- **Potential concern:** If the failed deployment introduced a schema change to records, older code may not parse newer records correctly. **Mitigation:** Verify data integrity in the extended post-rollback checks (Section 5.2). If schema incompatibility is detected, flag for manual data review.

### Partial deployment state

- **If SPFx rolled back but backend kept on new version:** The backend should remain backward-compatible. Monitor for unexpected 404s on deprecated endpoints.
- **If backend rolled back but SPFx kept on new version:** The SPFx app may call endpoints that no longer exist. This scenario should be avoided (roll back SPFx first in coordinated rollback).

### Rollback window limitations

- **SPFx artifacts expire after 30 days.** If the last known-good version is older than 30 days, artifacts must be regenerated by re-running the `spfx-build` workflow for the target commit.
- **Azure Functions deployment history** varies by deployment method. If previous deployments are not available, the build must be re-triggered from the known-good commit.

### Recurring rollback pattern

- If the same deployment requires rollback twice, **do not attempt a third deployment** without a root cause analysis.
- Escalate to T4 (Architecture) if the rollback pattern suggests a systemic issue (environment mismatch, configuration drift, incompatible dependency).

---

## Cross-references

| Document | Location |
|----------|----------|
| Deployment and Promotion Runbook | `phase-13/runbooks/admin-spfx-deployment-and-promotion-runbook.md` |
| Release Readiness Baseline | `phase-13/admin-spfx-phase-13-release-readiness-baseline.md` |
| Environment Baseline | `phase-13/admin-spfx-phase-13-environment-identity-and-dependency-baseline.md` |
| Support Model | `phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` |
| Incident Triage and Recovery Runbook | `phase-13/runbooks/admin-spfx-incident-triage-and-recovery-runbook.md` (pending — P13-06) |
