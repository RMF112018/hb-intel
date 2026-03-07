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
