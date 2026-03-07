# PH6.13 — Timer Trigger & Step 5 Bifurcation

**Version:** 2.0
**Purpose:** Harden the existing `timerFullSpec` Azure Function into a production-ready overnight job that processes all deferred Step 5 (SPFx web parts) installations. Specify the exact trigger schedule, the query to find deferred jobs, the execution flow, the completion notification, and error handling.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Every night at 1:00 AM EST, the timer trigger queries Azure Table Storage for all records where `step5DeferredToTimer = true` and `overallStatus = WebPartsPending`, attempts Step 5 for each, updates status on completion or failure, sends completion notifications to the project group, and logs all outcomes with correlation IDs.

---

## Prerequisites

- PH6.1–PH6.12 complete and passing.
- `WEBSITE_TIME_ZONE` set to `Eastern Standard Time` in Azure Function App settings to ensure the CRON schedule runs in EST.

---

## 6.13.1 — Azure Function App Timezone Configuration

Azure Functions timer triggers use UTC by default. Set the Function App timezone to Eastern Standard Time so the `0 0 1 * * *` CRON expression fires at 1:00 AM EST:

```bash
az functionapp config appsettings set \
  --name <FUNCTION_APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --settings WEBSITE_TIME_ZONE="Eastern Standard Time"
```

Document this setting in `backend/functions/README.md`.

---

## 6.13.2 — Full `timerFullSpec` Implementation

Replace `backend/functions/src/functions/timerFullSpec/index.ts`:

```typescript
import { app, type Timer, type InvocationContext } from '@azure/functions';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { executeStep5 } from '../provisioningSaga/steps/step5-web-parts.js';
import { NOTIFICATION_TEMPLATES } from '@hbc/provisioning';
import { randomUUID } from 'crypto';

/**
 * Timer trigger — runs at 1:00 AM EST every night.
 * Processes all provisioning runs where Step 5 (SPFx web parts) was deferred.
 */
app.timer('timerFullSpec', {
  // "0 0 1 * * *" = every day at 01:00:00
  // Requires WEBSITE_TIME_ZONE=Eastern Standard Time in App Settings
  schedule: '0 0 1 * * *',
  runOnStartup: false,
  handler: async (timer: Timer, context: InvocationContext) => {
    const logger = createLogger(context);
    const timerCorrelationId = randomUUID();

    logger.info('timerFullSpec started', {
      correlationId: timerCorrelationId,
      isPastDue: timer.isPastDue,
    });

    if (timer.isPastDue) {
      logger.warn('timerFullSpec is running late — isPastDue = true', {
        correlationId: timerCorrelationId,
      });
    }

    const services = createServiceFactory();
    let pendingJobs = await services.tableStorage.listPendingStep5Jobs();

    logger.info(`timerFullSpec found ${pendingJobs.length} deferred Step 5 job(s)`, {
      correlationId: timerCorrelationId,
      projectIds: pendingJobs.map((j) => j.projectId),
    });

    let completed = 0;
    let failed = 0;

    for (const status of pendingJobs) {
      const jobCorrelationId = randomUUID(); // New correlation ID for this timer run
      logger.info('Processing deferred Step 5', {
        correlationId: jobCorrelationId,
        parentCorrelationId: timerCorrelationId,
        projectId: status.projectId,
        projectNumber: status.projectNumber,
      });

      try {
        const result = await executeStep5(services, status, logger);

        const stepIdx = status.steps.findIndex((s) => s.stepNumber === 5);
        if (stepIdx !== -1) status.steps[stepIdx] = result;

        if (result.status === 'Completed') {
          status.overallStatus = 'Completed';
          status.step5DeferredToTimer = false;
          status.completedAt = new Date().toISOString();

          // Write to SharePoint audit log
          await services.sharePoint.writeAuditRecord({
            projectId: status.projectId,
            projectNumber: status.projectNumber,
            projectName: status.projectName,
            correlationId: jobCorrelationId,
            event: 'Completed',
            triggeredBy: 'timer',
            submittedBy: status.submittedBy,
            timestamp: status.completedAt,
            siteUrl: status.siteUrl,
          }).catch(() => {/* non-critical */});

          // Push SignalR completion notification to project group
          await services.signalR.pushProvisioningProgress({
            projectId: status.projectId,
            projectNumber: status.projectNumber,
            projectName: status.projectName,
            correlationId: jobCorrelationId,
            stepNumber: 5,
            stepName: 'Install Web Parts',
            status: 'Completed',
            overallStatus: 'Completed',
            timestamp: status.completedAt,
          }).catch(() => {/* non-critical */});

          completed++;
          logger.info('Step 5 completed by timer', {
            correlationId: jobCorrelationId,
            projectId: status.projectId,
          });
        } else if (result.status === 'DeferredToTimer') {
          // Still failing — keep as WebPartsPending for next night's run
          logger.warn('Step 5 still failing — will retry next night', {
            correlationId: jobCorrelationId,
            projectId: status.projectId,
            error: result.errorMessage,
          });
          failed++;
        }

        await services.tableStorage.upsertProvisioningStatus(status);
      } catch (err) {
        failed++;
        logger.error('Unexpected error processing deferred Step 5', {
          correlationId: jobCorrelationId,
          projectId: status.projectId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('timerFullSpec completed', {
      correlationId: timerCorrelationId,
      total: pendingJobs.length,
      completed,
      failed,
    });
  },
});
```

---

## 6.13.3 — Manual Timer Trigger for Testing

Add an HTTP endpoint to manually trigger the timer logic during development and staging testing:

```typescript
app.http('triggerTimerManually', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/trigger-timer',
  handler: async (request, context) => {
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }
    if (!claims.roles.some((r) => ['Admin', 'HBIntelAdmin'].includes(r))) {
      return { status: 403, jsonBody: { error: 'Admin role required' } };
    }

    // Only available in non-production environments
    if (process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Production') {
      return { status: 403, jsonBody: { error: 'Manual trigger not available in production' } };
    }

    // Fire the timer logic directly
    const fakeTimer = { isPastDue: false, scheduleStatus: null };
    await context.extraOutputs; // no-op but keeps TypeScript happy
    // Invoke the same handler logic via a direct import
    const { runTimerFullSpec } = await import('../timerFullSpec/handler.js');
    await runTimerFullSpec(context);

    return { status: 200, jsonBody: { message: 'Timer logic executed manually' } };
  },
});
```

Refactor `timerFullSpec/index.ts` to extract the handler logic into `timerFullSpec/handler.ts` so it can be imported for both the timer trigger and the manual HTTP trigger.

---

## 6.13.4 — Step 5 Deferred Notification

When Step 5 is deferred during the immediate saga execution (not the timer), the project group receives a special notification:

```typescript
// In saga-orchestrator.ts, after detecting step5DeferredToTimer = true:
await this.services.signalR.pushProvisioningProgress({
  projectId: status.projectId,
  projectNumber: status.projectNumber,
  projectName: status.projectName,
  correlationId: status.correlationId,
  stepNumber: 5,
  stepName: 'Install Web Parts',
  status: 'DeferredToTimer',
  overallStatus: 'WebPartsPending',
  timestamp: new Date().toISOString(),
});
```

The start/finish notification text for the deferred case uses the same `ProvisioningCompleted` template — the "Web Parts Scheduled Overnight" state is an internal state not surfaced in the notification banner. The banner text reads:

*"{projectNumber} - {projectName}'s SharePoint Site is up and running! Let's get to work!"*

The `DeferredToTimer` state for Step 5 is shown only in the full checklist (Estimating Coordinator / Admin view).

---

## 6.13.5 — Failure Escalation for Persistent Step 5 Failures

If Step 5 fails on both the immediate attempt AND the first overnight timer run, it will retry the following night. After **3 consecutive overnight failures** (tracked by a `step5TimerRetryCount` field added to `IProvisioningStatus`), the timer trigger should:

1. Set `overallStatus = 'Failed'`.
2. Push a failed SignalR event to the Admin group.
3. Log an Application Insights alert event (see PH6.14).

Add `step5TimerRetryCount` to `IProvisioningStatus` type and to the Azure Table schema.

---

## 6.13 Success Criteria Checklist

- [x] 6.13.1 `WEBSITE_TIME_ZONE=Eastern Standard Time` documented and set in Function App.
- [x] 6.13.2 Timer CRON expression `0 0 1 * * *` set correctly.
- [x] 6.13.3 Timer queries `listPendingStep5Jobs()` — returns only `WebPartsPending` records.
- [x] 6.13.4 Successful timer completion sets `overallStatus = Completed`, `step5DeferredToTimer = false`.
- [x] 6.13.5 Timer completion pushes SignalR event to project group.
- [x] 6.13.6 Timer completion writes `Completed` audit record to SharePoint (fire-and-forget).
- [x] 6.13.7 Persistent Step 5 failures (3 timer retries) escalate to `Failed` status and Admin alert.
- [x] 6.13.8 Manual trigger HTTP endpoint blocked in production environment.
- [x] 6.13.9 `pnpm turbo run build --filter=backend-functions` passes.

## PH6.13 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- Set `PROVISIONING_STEP5_TIMEOUT_MS=100` → Step 5 defers during saga — PASS / FAIL
- Run manual timer trigger endpoint → deferred job processed — PASS / FAIL
- Timer completion → `overallStatus = Completed` in Azure Table — PASS / FAIL
- Timer completion → SignalR event received in connected browser — PASS / FAIL
- Timer completion after 3 failures → `overallStatus = Failed`, Application Insights alert fired — PASS / FAIL

<!-- PROGRESS: 2026-03-07 PH6.13 completed. Implemented D-PH6-13 timer bifurcation by extracting `runTimerFullSpec` shared logic, scheduling `timerFullSpec` at `0 0 1 * * *` (EST via WEBSITE_TIME_ZONE), processing deferred Step 5 jobs with correlation IDs, completion audit write (fire-and-forget), and SignalR pushes for completed/deferred/failed outcomes; added admin-only non-production manual trigger endpoint (`POST /api/admin/trigger-timer`); emitted immediate deferred Step 5 progress from saga orchestration; added `step5TimerRetryCount` model/schema support; and updated backend README + Phase 6 checklist evidence. -->
