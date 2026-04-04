# Admin SPFx IT Control Center — Incident Triage Runbook

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-06 — Phase 13 Incident Triage, Recovery, and Break-Glass Runbooks
**Scope:** Symptom-based triage, first checks, evidence gathering, escalation
**Owner:** T1 (Operator) initiates; T2 (Platform Engineering) investigates

---

## 1. Purpose

This runbook guides the initial triage of incidents affecting the Admin SPFx IT Control Center in production. It helps the first responder (typically T1 Operator) categorize the symptom, perform first checks, assess severity, gather evidence, and escalate correctly.

This runbook does NOT contain fix procedures. For fixes, see:
- Service Recovery Runbook (`admin-spfx-service-recovery-runbook.md`)
- Rollback and Recovery Runbook (`admin-spfx-rollback-and-recovery-runbook.md`)
- Platform Operational Runbook (`docs/how-to/developer/operational-runbook.md`)

---

## 2. Symptom categories

When an incident is reported or detected, classify it into one of these categories:

| ID | Category | Typical symptoms | First responder |
|----|----------|-----------------|----------------|
| S1 | **Console unavailable** | WebPart blank/white screen, SharePoint page error, "Something went wrong" | T1 → immediate T2 escalation |
| S2 | **Authentication / permission failure** | 401 errors, redirect loops, "Access denied", routes inaccessible to authorized users | T1 → immediate T2 escalation |
| S3 | **Backend unreachable** | Polling errors in console, "Failed to fetch" in network tab, health endpoint non-responsive | T1 → T2 escalation |
| S4 | **Provisioning failure** | Run stuck in InProgress, repeated failures on retry, saga step error | T1 triages via `/runs` → escalate if retry fails |
| S5 | **Observability degradation** | Alert dashboard empty when alerts expected, probe status stale, error log not loading | T1 checks Health dashboard → escalate if persistent |
| S6 | **Data inconsistency** | Run status not updating, audit records missing, stale information displayed | T1 reports → T2 investigates |
| S7 | **Performance degradation** | Slow page loads, polling timeouts, delayed responses | T1 reports → T2 investigates |
| S8 | **Notification failure** | Expected Teams alerts not delivered, webhook errors in logs | T1 checks alert dashboard for delivery status → T2 if systematic |
| S9 | **Identity / Entra operation failure** | User lifecycle operations fail, group operations error, identity queries return errors | T1 reports from `/entra` → T2 → T3 if tenant-level |
| S10 | **SharePoint control failure** | Drift detection errors, repair operations fail, site posture queries fail | T1 reports from `/sharepoint` → T2 → T3 if tenant-level |

---

## 3. First checks

For every incident, perform these checks before escalating or investigating further.

### 3.1 Universal first checks (all categories)

| # | Check | How | What it tells you |
|---|-------|-----|-------------------|
| 1 | Is this a known issue? | Check Teams `#hb-intel-alerts` channel for recent alerts | May already be acknowledged or under investigation |
| 2 | Was there a recent deployment? | Check GitHub Actions → `spfx-deploy` and `cd` workflow runs in last 24 hours | Deployment-correlated issues → use rollback runbook |
| 3 | Is this isolated or widespread? | Ask another operator to reproduce; check if issue affects all projects or one | Widespread = higher severity; isolated = lower severity |
| 4 | Backend health | `curl https://<prod-func-url>/api/health` or check Health dashboard `/health` | 200 OK = backend up; non-200 = backend issue (S3) |

### 3.2 Category-specific first checks

| Category | Additional checks |
|----------|------------------|
| S1 (console unavailable) | Check SharePoint health (`https://portal.office.com/servicestatus`); try incognito window; check other SPFx apps on same site |
| S2 (auth failure) | Check if issue affects all users or one; verify user's SharePoint group membership; check for recent Entra ID changes |
| S3 (backend unreachable) | Check Azure Portal → Function App status; check App Insights Live Metrics for incoming requests |
| S4 (provisioning failure) | Open `/runs` → check failure classification (transient, permissions, structural, repeated, admin-class); check retry count vs ceiling |
| S5 (observability degradation) | Check browser console for polling errors; verify `VITE_FUNCTION_APP_URL` resolves; check App Insights for observability endpoint errors |
| S6 (data inconsistency) | Check Azure Table Storage tables directly (if access available); compare run state in UI vs backend response |
| S7 (performance) | Check App Insights → Performance blade for p95 latency; check Function App → Metrics for request duration |
| S8 (notification) | Check alert dashboard for delivery status column; verify Teams webhook URL is configured; check webhook channel for test messages |
| S9 (identity failure) | Check Azure Portal → Entra ID health; verify Graph API permissions on managed identity; check for recent Entra ID policy changes |
| S10 (SharePoint control) | Check SharePoint Admin health; verify `Sites.Selected` grants for affected site; check for recent SharePoint Admin Center changes |

---

## 4. Severity guidance

Use the severity definitions from the P13-04 support model:

| Severity | Criteria | Response target |
|----------|---------|-----------------|
| **Sev 1 — Critical** | Console unusable (S1), widespread auth failure (S2), total backend outage (S3), data corruption (S6) | Acknowledge 15 min, mitigate 1 hour |
| **Sev 2 — High** | Multiple provisioning failures (S4), all probes in error (S5), deployment pipeline broken, significant identity failures (S9) | Acknowledge 30 min, mitigate 4 hours |
| **Sev 3 — Medium** | Single provisioning failure (S4), single probe error (S5), notification failure (S8), single-site SharePoint issue (S10) | Acknowledge 2 hours, resolve 2 business days |
| **Sev 4 — Low** | Performance degradation (S7) without workflow impact, cosmetic issues, improvement requests | Acknowledge 1 business day, schedule |

**Severity escalation rules:**
- If a Sev 3 issue is not resolved within 4 hours and is worsening → escalate to Sev 2
- If a Sev 2 issue is not mitigated within 2 hours → escalate to Sev 1
- If the same issue recurs 3+ times within 7 days → escalate one level regardless of individual severity

---

## 5. Evidence gathering checklist

Before escalating from T1 to T2, collect as much of this evidence as the category allows:

| Evidence | How to collect | Applicable categories |
|----------|---------------|----------------------|
| Screenshot of the error/symptom | Browser screenshot | All |
| Browser console errors | F12 → Console tab → screenshot or copy | S1, S2, S3, S5, S7 |
| Network tab failures | F12 → Network tab → filter for failed requests (4xx, 5xx) | S2, S3, S5, S7, S8 |
| Backend health response | `curl https://<prod-func-url>/api/health` | S3, S4, S5 |
| Run detail from `/runs` | Run ID, failed step, failure classification, retry count | S4 |
| Alert dashboard state | Screenshot of Health dashboard showing alert/probe status | S5, S8 |
| Error Log entries | Screenshot or filter results from `/errors` | S4, S5, S6 |
| User identity and permissions | User UPN, SharePoint groups, permission keys displayed in UI | S2 |
| Timestamp of first occurrence | When the issue was first noticed | All |
| Is there a recent deployment? | GitHub Actions workflow run URL | All |
| Number of affected users/projects | Count or estimate | All |

---

## 6. Escalation triggers

### When to escalate immediately (do not wait for investigation window)

| Trigger | Escalate to | Why |
|---------|------------|-----|
| Console completely unavailable for all users | T2 immediately | Sev 1 — total loss of admin capability |
| Widespread 401 errors across multiple users | T2 immediately, T3 if Entra-related | Sev 1 — possible auth infrastructure issue |
| Backend health returns non-200 | T2 immediately | Sev 1 — backend outage |
| Data corruption suspected (wrong data displayed, incorrect run states) | T2 immediately | Sev 1 — potential data integrity issue |
| Multiple Sev 2 issues simultaneously | T2 immediately | Pattern suggests systemic failure |

### When to investigate briefly before escalating

| Trigger | Investigation window | Escalate if |
|---------|---------------------|-------------|
| Single provisioning failure | Check failure classification and retry once | Retry fails or classification is `admin-class` |
| Single probe in error state | Wait for next probe cycle (15 min) | Probe remains in error after 2 cycles |
| Notification not delivered | Check delivery status in alert dashboard | Systematic failure (multiple alerts not delivered) |
| Slow page loads | Check if isolated to one user/browser | Persists across users for > 30 minutes |

---

## 7. When to stop and escalate

**Stop investigating and escalate to T2 if:**

1. You have spent more than 15 minutes without identifying the symptom category
2. The issue requires access to Azure Portal, App Insights, or Function App logs (T1 scope ends at in-app surfaces)
3. The issue requires code changes, configuration changes, or deployment actions
4. The issue involves data that appears corrupted or inconsistent
5. You suspect the issue is related to a recent deployment
6. Multiple unrelated symptoms appear simultaneously (suggests systemic failure)
7. The issue affects a domain you are not trained on (e.g., Entra ID policy, Azure resource limits)

**Stop investigating and escalate to T3 (IT) via T2 if:**

1. The issue is confirmed as tenant-level (SharePoint, Entra ID, Azure AD outage)
2. Permission grants need to be modified (Sites.Selected, Graph permissions)
3. Azure resource needs to be reprovisioned or reconfigured
4. Certificate or secret has expired

**Never attempt:**
- Direct database/table modifications
- Manual Azure Portal configuration changes (unless you are T2/T3)
- Re-running deployment workflows
- Modifying app registration permissions

---

## Cross-references

| Document | Location |
|----------|----------|
| Service Recovery Runbook | `phase-13/runbooks/admin-spfx-service-recovery-runbook.md` |
| Rollback and Recovery Runbook | `phase-13/runbooks/admin-spfx-rollback-and-recovery-runbook.md` |
| Break-Glass Guidance | `phase-13/runbooks/admin-spfx-break-glass-guidance.md` |
| Support Model and Escalation Matrix | `phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` |
| Deployment and Promotion Runbook | `phase-13/runbooks/admin-spfx-deployment-and-promotion-runbook.md` |
