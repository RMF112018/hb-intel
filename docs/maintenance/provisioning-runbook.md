# Provisioning System Operations Runbook

**Traceability:** D-PH6-16

## Daily Checks
- Verify the 1:00 AM timer trigger ran: Application Insights → Logs → query `customEvents | where name == "ProvisioningStep5TimerCompleted"`.
- Check for stuck runs (overall status `InProgress` for >30 minutes): the Application Insights alert "Provisioning Run Stuck >30min" fires automatically.

## How to Manually Retry a Failed Provisioning Run
1. Navigate to the Accounting app → Project Setup Requests → find the failed project.
2. Click the **Retry** button (requires Admin role).
3. Monitor progress in real time on the same page.

## How to Escalate a Stuck Run
1. An alert email is sent automatically when a run exceeds 30 minutes.
2. An Admin user can click **Escalate** in the Accounting app to mark the run as requiring manual intervention.
3. This sets `overallStatus = 'Failed'` and triggers the failure alert.

## How to Check Azure Table Storage State
1. Open Azure Portal → Storage Accounts → the production storage account.
2. Navigate to **Tables** → `ProvisioningJobs`.
3. Find the row with `PartitionKey = {projectId}` and `RowKey = {correlationId}`.
4. The `stepsJson` column contains the full step history as a JSON string.

## How to Re-run Step 5 Manually
If the timer trigger fails to install web parts:
1. Confirm the App Catalog has the correct `.sppkg` deployed.
2. Call `POST /api/provisioning-retry` with `{ "projectId": "..." }` using an Admin token.
3. The saga will resume from the last successful step (steps 1–4 and 6–7 already completed; only step 5 will run).

## Alert Thresholds
- **Stuck run:** Overall status `InProgress` for >30 minutes → Severity 2 alert.
- **Timer failure:** No `ProvisioningStep5TimerCompleted` event within 2 hours of midnight EST → Severity 1 alert.

## Timer Support

### Dev/Staging Manual Timer Trigger
1. Open Azure Portal → Function App → Functions → `ProvisioningStep5Timer`.
2. Click **Code + Test** → **Test/Run** → set body to `{}` → click **Run**.
3. Monitor the run in Application Insights custom events: `customEvents | where name startswith "ProvisioningTimer" | order by timestamp desc | take 10`.

### Timer Failure Diagnostics
1. Check Application Insights for recent timer events: `customEvents | where name == "ProvisioningTimerStarted" | order by timestamp desc | take 5`.
2. If no recent timer events, verify the Function App is running and the CRON schedule is correct in `function.json`.
3. Check Function App → Monitor → Invocations for the timer function to see if it was triggered but failed.
4. If the timer ran but web parts failed to install, see "How to Re-run Step 5 Manually" above.

---

## Supportability Verification (Wave 0 Closeout)

**Date:** 2026-03-15

This section confirms that common provisioning failure modes can be diagnosed and addressed through the UI and admin surface without requiring developer-only knowledge.

### Failure Mode Coverage

All 10 documented failure modes (FM-01 through FM-10 in `packages/provisioning/src/failure-modes.ts`) have recovery paths:

| Failure Mode | Diagnosable From UI | Recovery Action |
|-------------|-------------------|-----------------|
| FM-01 IndexedDB unavailable | Form continues; auto-save indicator absent | Re-enter data after navigation; no admin action needed |
| FM-02 BIC owner resolves null | Badge shows "In Progress" | System-owned state; no human action required |
| FM-03 Notification registration missing | Backend falls back to raw event type | Admin can verify via App Insights query |
| FM-04 Handoff validation fails | HbcHandoffComposer blocks with error | Fix prerequisite data; retry handoff |
| FM-05 API submission fails after wizard complete | Error shown; draft retained; retry available | User retries from Review step |
| FM-06 Clarification draft TTL expires | Falls back to server data | Re-enter in-progress responses |
| FM-07 BIC module query fails | Other modules continue; empty items returned | Check API health; module self-recovers on next poll |
| FM-08 Complexity tier cannot be derived | Falls back to Essential tier | User sees minimum info; can manually adjust |
| FM-09 SignalR disconnected | Falls back to 30s polling; "Live updates paused" shown | Automatic reconnect; no admin action needed |
| FM-10 Handoff recipient cannot be resolved | Handoff blocked with reason | Fix projectLeadId in request data |

### Escalation Path

1. **Self-service:** User retries the operation from the UI (wizard retry, re-enter data, reconnect)
2. **Admin oversight:** Admin uses the Provisioning Oversight page (force retry, archive, ack escalation, state override)
3. **Manual intervention:** Admin uses Azure Table Storage diagnostics (see "How to Check Azure Table Storage State" above)

### Cross-References

- **Observability:** See `docs/maintenance/provisioning-observability-runbook.md` for KQL query templates and alert rule definitions.
- **Verification evidence:** See `docs/reference/provisioning/verification-matrix.md` for the full pass/fail matrix.
- **Admin permissions:** See `packages/auth/README.md` § Provisioning Override Permissions for the 6 granular permission constants.
