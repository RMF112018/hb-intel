# Admin SPFx IT Control Center — Service Recovery Runbook

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-06 — Phase 13 Incident Triage, Recovery, and Break-Glass Runbooks
**Scope:** Common recovery procedures, validation, audit expectations
**Owner:** T2 (Platform Engineering) executes; T3 (IT) for infrastructure recovery

---

## 1. Purpose

This runbook provides recovery procedures for common failure scenarios affecting the Admin SPFx IT Control Center in production. It assumes the incident has been triaged (see Incident Triage Runbook) and a recovery action is needed.

For deployment rollback specifically, see the Rollback and Recovery Runbook.

---

## 2. Common recovery classes

### R1 — Backend restart / function app recovery

**When:** Backend health returns unhealthy, function invocations failing, timer functions not executing.

**Owner:** T2

**Steps:**
1. Check Azure Portal → Function App → Overview → confirm status
2. If status is "Stopped": Start the Function App
3. If status is "Running" but unhealthy:
   - Check Application Insights → Failures blade for error patterns
   - Check Function App → Diagnose and solve problems
   - Restart the Function App: Azure Portal → Function App → Overview → Restart
4. Wait 2 minutes for cold start
5. Verify: `curl https://<prod-func-url>/api/health` returns `200 OK`
6. Verify: Azure Portal → Functions list shows `timerFullSpec` and `cleanupIdempotency`
7. Monitor for 15 minutes to confirm stability

**When this is NOT safe without engineering:** If the restart does not resolve the issue after 2 attempts, or if App Insights shows a code-level error (not infrastructure), escalate to T2 senior / T4 for root cause analysis before further action.

### R2 — Configuration correction

**When:** Missing or incorrect environment variable causing runtime errors.

**Owner:** T2

**Steps:**
1. Identify the misconfigured variable from error logs or App Insights traces
2. Cross-reference against `wave0-env-registry.ts` for the expected value and tier
3. Azure Portal → Function App → Configuration → Application settings
4. Correct the value (do NOT add new settings not documented in the registry)
5. Save → Function App will restart automatically
6. Verify: `curl https://<prod-func-url>/api/health` returns `200 OK`
7. Verify: the specific operation that was failing now succeeds
8. Document the change in the incident log (old value → new value, reason)

**When this is NOT safe without engineering:** If the correct value is unknown, if the setting affects auth/identity (`AZURE_CLIENT_ID`, `API_AUDIENCE`, `AZURE_TENANT_ID`), or if the setting has never been configured before. Escalate to T2 senior / T3.

### R3 — Authentication / token recovery

**When:** Widespread 401 errors, token validation failures, auth bootstrap errors.

**Owner:** T2 → T3 if tenant-level

**Steps:**
1. Check if the issue is isolated (one user) or widespread (all users)
2. **Isolated:** Verify user's SharePoint group membership matches expected permission keys. Have user clear browser cache and re-authenticate.
3. **Widespread — check app registration:**
   - Azure Portal → Entra ID → App registrations → Backend API registration
   - Verify Application ID URI matches `api://func-hb-intel-{env}` (not bare GUID)
   - Verify admin consent is granted for required permissions
   - Verify client secret has not expired
4. **Widespread — check managed identity:**
   - Azure Portal → Function App → Identity → System assigned → verify "On"
   - Verify the managed identity object ID matches role assignments
5. After correction, test: make an authenticated API call from the SPFx app
6. Monitor for 15 minutes to confirm auth stability

**When this is NOT safe without engineering:** Any change to app registration permissions, Application ID URI, or managed identity assignments. These require T3 (IT) involvement with T2 verification.

### R4 — Storage recovery

**When:** Table Storage write/read failures, 404 on table operations, throttling (429).

**Owner:** T2 → T3 for access policy changes

**Steps:**
1. Check Azure Portal → Storage Account → Tables → verify 6 tables exist
2. If tables missing: create them (names from backend store implementations: `AdminRuns`, `AdminAuditEvents`, `AdminEvidence`, `ObservabilityAlerts`, `ObservabilityProbeSnapshots`, `ObservabilityErrors`)
3. If access denied: verify managed identity has "Storage Table Data Contributor" role on the storage account
4. If throttling (429): check Storage Account → Metrics for request rate; this is transient and self-resolving
5. Verify: an operation that writes to Table Storage succeeds (e.g., trigger a provisioning retry that will create an audit event)
6. If `AZURE_TABLE_ENDPOINT` is incorrect: correct via R2 (Configuration correction)

**When this is NOT safe without engineering:** If data in tables appears corrupted (malformed entities, wrong partition keys). Do NOT delete or modify table entities manually. Escalate to T2 senior.

### R5 — Provisioning saga recovery

**When:** Provisioning run stuck, saga step failed, compensation chain needed.

**Owner:** T1 initiates via UI; T2 if UI actions insufficient

**Steps:**
1. Open `/runs` → find the affected run
2. Check failure classification:
   - **Transient:** Retry via UI retry button (respects retry ceiling)
   - **Permissions:** Escalate to T2 → T3 for permission grant
   - **Structural:** Escalate to T2 for investigation (template issue, schema conflict)
   - **Repeated:** Escalate to T2 — retry ceiling likely reached
   - **Admin-class:** Escalate to T2 — requires expert-tier intervention
3. If run is stuck in InProgress > 2 hours: escalate to T2 for force-state assessment
4. If T2 determines force-state is needed: use expert-tier manual state override on `/runs` (requires `ADMIN_PROVISIONING_FORCE_STATE` permission)
5. After recovery: verify the run reaches a terminal state (completed or failed with classification)
6. Check that audit events were recorded for the recovery action

**When this is NOT safe without engineering:** Force-state override should only be used when the run is genuinely stuck and the target state is known to be correct. Never force a run to "completed" if the underlying steps did not actually complete.

### R6 — Notification / webhook recovery

**When:** Teams alert notifications not being delivered.

**Owner:** T2

**Steps:**
1. Check alert dashboard for delivery status — look for "failed" deliveries
2. Verify `VITE_TEAMS_WEBHOOK_URL` is configured and correct
3. Test the webhook directly: send a test payload to the webhook URL
4. If webhook URL is invalid or channel was deleted: update the URL in environment configuration (R2)
5. If webhook is valid but delivery fails: check for network/firewall issues between Function App and Teams
6. Verify: next alert cycle delivers successfully (wait for 30s polling cycle)

**When this is NOT safe without engineering:** If the Teams Workflow (Power Automate) backing the webhook needs reconfiguration. Escalate to T3 (IT).

### R7 — SharePoint App Catalog recovery

**When:** SPFx WebPart not loading, app not trusted, app removed from catalog.

**Owner:** T2 → T3 for App Catalog changes

**Steps:**
1. Check SharePoint Admin Center → Apps → verify `hb-intel-admin.sppkg` is present
2. If missing: re-deploy from last known-good artifact (see Deployment Runbook Section 5.1)
3. If present but not trusted: T3 must approve/trust the app in App Catalog
4. If present and trusted but not rendering: check browser console for load errors; may be a code issue → consider rollback
5. Verify: navigate to the admin page and confirm WebPart renders

**When this is NOT safe without engineering:** If the App Catalog itself is misconfigured or if tenant-level app policies have changed. Escalate to T3 (IT / SharePoint Admin).

---

## 3. Validation after recovery

After any recovery action, run these validation steps:

### 3.1 Minimum validation (all recovery classes)

| Check | How | Expected |
|-------|-----|----------|
| Backend health | `GET /api/health` | `200 OK`, `healthy` |
| Admin console loads | Navigate to production admin page | WebPart renders with lane navigation |
| No new errors in Error Log | Check `/errors` for errors with timestamps after recovery | No new errors related to the recovered issue |

### 3.2 Extended validation (within 1 hour)

| Check | How | Expected |
|-------|-----|----------|
| Alert polling functional | Check Health dashboard → alerts updating | 30s polling cycle active |
| Probe polling functional | Check probe dashboard → timestamps updating | Probes report status (not all `unknown`) |
| One successful operation | Perform a low-risk operation relevant to the recovered area | Operation completes without error |

### 3.3 Monitoring period

- After Sev 1 recovery: monitor for 2 hours
- After Sev 2 recovery: monitor for 1 hour
- After Sev 3 recovery: monitor for 30 minutes
- If the issue recurs during monitoring: escalate one severity level and re-investigate

---

## 4. Audit / evidence capture expectations

Every recovery action must produce an audit trail:

| Field | Required | Example |
|-------|----------|---------|
| Incident ID | Yes | INC-2026-0042 or informal reference |
| Recovery class | Yes | R1 through R7 |
| Recovery action taken | Yes | "Restarted Function App via Azure Portal" |
| Who performed the action | Yes | T2 engineer name |
| Time of action | Yes | 2026-04-04 14:32 UTC |
| Pre-recovery state | Yes | "Health endpoint returning 503" |
| Post-recovery state | Yes | "Health endpoint returning 200 OK" |
| Validation results | Yes | "Smoke checks passed, monitoring for 1 hour" |
| Root cause (if known) | If available | "Function App ran out of memory due to high alert volume" |
| Follow-up needed | Yes | "No" or description of remaining work |

**Where to record:** Incident log (issue tracker or shared document). If the recovery involved a provisioning run, the in-app audit store captures the action automatically.

---

## 5. When recovery is NOT safe without engineering involvement

**Escalate to T2 senior or T4 before attempting recovery when:**

1. The root cause is unknown and the recovery action could mask it
2. The issue involves data that appears corrupted or inconsistent
3. Recovery requires modifying auth/identity configuration (app registrations, managed identity roles, Graph permissions)
4. The same recovery has been attempted twice without success
5. Recovery requires Table Storage entity modification (delete, update partition keys)
6. The issue appeared without a deployment or configuration change (suggests infrastructure or external cause)
7. Multiple recovery classes are needed simultaneously (suggests systemic failure)

---

## Cross-references

| Document | Location |
|----------|----------|
| Incident Triage Runbook | `phase-13/runbooks/admin-spfx-incident-triage-runbook.md` |
| Break-Glass Guidance | `phase-13/runbooks/admin-spfx-break-glass-guidance.md` |
| Rollback and Recovery Runbook | `phase-13/runbooks/admin-spfx-rollback-and-recovery-runbook.md` |
| Deployment and Promotion Runbook | `phase-13/runbooks/admin-spfx-deployment-and-promotion-runbook.md` |
| Support Model and Escalation Matrix | `phase-13/admin-spfx-phase-13-support-model-and-escalation-matrix.md` |
| Platform Operational Runbook | `docs/how-to/developer/operational-runbook.md` |
| Environment Baseline | `phase-13/admin-spfx-phase-13-environment-identity-and-dependency-baseline.md` |
