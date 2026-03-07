# PH6.14 — Observability & Application Insights

**Version:** 2.0
**Purpose:** Implement correlation ID propagation across all provisioning events, define the Application Insights custom event schema, configure three custom metrics, and create two proactive alert rules (stuck run > 30 minutes, timer failure).
**Audience:** Implementation agent(s), Azure platform administrator, operations/support.
**Implementation Objective:** Every provisioning run is fully traceable from trigger to completion using a single `correlationId`. Operations can query Application Insights to reconstruct the complete timeline of any run. Two alert rules fire automatically to notify the team of stuck runs and timer failures without requiring anyone to check a dashboard.

---

## Prerequisites

- PH6.1–PH6.13 complete and passing.
- Application Insights resource linked to the Function App (standard Azure setup).
- `APPLICATIONINSIGHTS_CONNECTION_STRING` set in Function App App Settings.

---

## 6.14.1 — Structured Logger with Correlation ID

Update `backend/functions/src/utils/logger.ts` to always include the correlation ID as a structured property:

```typescript
import type { InvocationContext } from '@azure/functions';

export interface ILogger {
  info(message: string, properties?: Record<string, unknown>): void;
  warn(message: string, properties?: Record<string, unknown>): void;
  error(message: string, properties?: Record<string, unknown>): void;
  trackEvent(name: string, properties: Record<string, unknown>): void;
  trackMetric(name: string, value: number, properties?: Record<string, unknown>): void;
}

export function createLogger(context: InvocationContext): ILogger {
  return {
    info: (msg, props) => context.log(JSON.stringify({ level: 'info', message: msg, ...props })),
    warn: (msg, props) => context.warn(JSON.stringify({ level: 'warn', message: msg, ...props })),
    error: (msg, props) => context.error(JSON.stringify({ level: 'error', message: msg, ...props })),

    trackEvent: (name, props) => {
      // Application Insights custom event via structured log
      context.log(JSON.stringify({
        level: 'info',
        _telemetryType: 'customEvent',
        name,
        ...props,
      }));
    },

    trackMetric: (name, value, props) => {
      context.log(JSON.stringify({
        level: 'info',
        _telemetryType: 'customMetric',
        name,
        value,
        ...props,
      }));
    },
  };
}
```

---

## 6.14.2 — Custom Application Insights Events

Track the following named events throughout the saga. All events include `correlationId`, `projectId`, and `projectNumber` as minimum properties.

| Event Name | When Fired | Key Properties |
|---|---|---|
| `ProvisioningSagaStarted` | Saga `execute()` begins | `correlationId`, `projectId`, `projectNumber`, `triggeredBy`, `submittedBy` |
| `ProvisioningStepCompleted` | Each step completes | `correlationId`, `projectId`, `stepNumber`, `stepName`, `durationMs`, `idempotentSkip` |
| `ProvisioningStepFailed` | Each step fails | `correlationId`, `projectId`, `stepNumber`, `stepName`, `errorMessage`, `attempt` |
| `ProvisioningStep5Deferred` | Step 5 defers to timer | `correlationId`, `projectId`, `reason` |
| `ProvisioningSagaCompleted` | Saga finishes all steps | `correlationId`, `projectId`, `totalDurationMs`, `step5Deferred` |
| `ProvisioningSagaFailed` | Saga compensates after failure | `correlationId`, `projectId`, `failedAtStep`, `errorMessage` |
| `ProvisioningTimerStarted` | Timer trigger begins | `timerCorrelationId`, `pendingJobCount` |
| `ProvisioningTimerCompleted` | Timer trigger finishes | `timerCorrelationId`, `completed`, `failed`, `totalDurationMs` |
| `ProvisioningTimerJobFailed` | A single timer job fails | `timerCorrelationId`, `projectId`, `step5TimerRetryCount` |

Add `trackEvent` calls to `saga-orchestrator.ts` and `timerFullSpec/handler.ts` at each of these points. Use the `durationMs` pattern:

```typescript
const stepStartTime = Date.now();
const result = await executeStep1(this.services, status);
const durationMs = Date.now() - stepStartTime;

logger.trackEvent('ProvisioningStepCompleted', {
  correlationId: status.correlationId,
  projectId: status.projectId,
  projectNumber: status.projectNumber,
  stepNumber: 1,
  stepName: 'Create Site',
  durationMs,
  idempotentSkip: result.idempotentSkip ?? false,
});
```

---

## 6.14.3 — Custom Metrics

Three custom metrics are tracked in Application Insights:

**Metric 1 — Step Duration (histogram):**
```typescript
logger.trackMetric('ProvisioningStepDurationMs', durationMs, {
  stepNumber: String(stepDef.number),
  stepName: stepDef.name,
  projectId: status.projectId,
});
```

**Metric 2 — Provisioning Success/Failure Rate:**
Tracked as binary events — `ProvisioningSagaCompleted` vs `ProvisioningSagaFailed` events. Query in Application Insights:
```kusto
customEvents
| where name in ("ProvisioningSagaCompleted", "ProvisioningSagaFailed")
| summarize total=count(), failed=countif(name == "ProvisioningSagaFailed") by bin(timestamp, 1d)
| extend successRate = (total - failed) * 100.0 / total
```

**Metric 3 — Step 5 Deferral Rate:**
```typescript
logger.trackMetric('Step5DeferralRate', status.step5DeferredToTimer ? 1 : 0, {
  projectId: status.projectId,
});
```
Query:
```kusto
customMetrics
| where name == "Step5DeferralRate"
| summarize deferralRate = avg(value) * 100 by bin(timestamp, 7d)
```

---

## 6.14.4 — Alert Rule 1: Stuck Run (> 30 Minutes)

Create an Application Insights alert rule in the Azure Portal or via ARM template:

**Alert name:** `HBIntel-ProvisioningStuck`
**Signal:** Custom log query (Log Analytics)
**Query:**
```kusto
customEvents
| where name == "ProvisioningSagaStarted"
| extend startTime = timestamp
| join kind=leftanti (
    customEvents | where name in ("ProvisioningSagaCompleted", "ProvisioningSagaFailed")
) on $left.customDimensions.correlationId == $right.customDimensions.correlationId
| where startTime < ago(30m)
| summarize stuckCount = count()
| where stuckCount > 0
```
**Severity:** 2 (Warning)
**Action group:** Email / Teams notification to HB Intel Admin team
**Evaluation frequency:** Every 5 minutes
**Period:** 35 minutes

Document the ARM template in `docs/architecture/provisioning/alert-rules.json`.

---

## 6.14.5 — Alert Rule 2: Timer Failure

**Alert name:** `HBIntel-TimerFullSpecFailed`
**Signal:** Custom log query
**Query:**
```kusto
customEvents
| where name == "ProvisioningTimerStarted"
| extend timerCorrelationId = customDimensions.timerCorrelationId
| join kind=leftanti (
    customEvents | where name == "ProvisioningTimerCompleted"
) on $left.customDimensions.timerCorrelationId == $right.customDimensions.timerCorrelationId
| where timestamp < ago(2h) // Timer should complete within 2 hours
| summarize failedTimers = count()
| where failedTimers > 0
```
**Severity:** 1 (Error)
**Action group:** Email + SMS to HB Intel Admin team
**Evaluation frequency:** Every 15 minutes between 1:00 AM and 6:00 AM EST

---

## 6.14.6 — Log Query Reference Card

Save the following queries in `docs/maintenance/provisioning-observability-runbook.md`:

**Full timeline for a provisioning run (given correlationId):**
```kusto
customEvents
| where customDimensions.correlationId == "<CORRELATION_ID>"
| order by timestamp asc
| project timestamp, name, customDimensions
```

**All failed runs in last 7 days:**
```kusto
customEvents
| where name == "ProvisioningSagaFailed"
| where timestamp > ago(7d)
| project timestamp, projectId=customDimensions.projectId,
          projectNumber=customDimensions.projectNumber,
          failedAtStep=customDimensions.failedAtStep,
          error=customDimensions.errorMessage
| order by timestamp desc
```

**Average step durations:**
```kusto
customMetrics
| where name == "ProvisioningStepDurationMs"
| summarize avg(value) by stepName=tostring(customDimensions.stepName)
| order by avg_value desc
```

---

## 6.14 Success Criteria Checklist

- [ ] 6.14.1 `createLogger` updated with `trackEvent` and `trackMetric` methods.
- [ ] 6.14.2 All 9 custom events fired at the correct points in the saga and timer.
- [ ] 6.14.3 `durationMs` tracked for every step.
- [ ] 6.14.4 `Step5DeferralRate` custom metric fires on every saga completion.
- [ ] 6.14.5 Alert Rule 1 (stuck run) created in Application Insights; tested with a manual delay.
- [ ] 6.14.6 Alert Rule 2 (timer failure) created; tested by not completing `ProvisioningTimerCompleted` event.
- [ ] 6.14.7 Log query reference card committed to `docs/maintenance/provisioning-observability-runbook.md`.
- [ ] 6.14.8 `pnpm turbo run build --filter=backend-functions` passes.

## PH6.14 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- Trigger a test provisioning run → `ProvisioningSagaStarted` appears in Application Insights within 60s — PASS / FAIL
- Each step completion → `ProvisioningStepCompleted` event with `durationMs` — PASS / FAIL
- Simulate stuck run (pause after trigger) → stuck-run alert fires within 35 minutes — PASS / FAIL
- Full timeline query using `correlationId` → returns all events in correct order — PASS / FAIL
