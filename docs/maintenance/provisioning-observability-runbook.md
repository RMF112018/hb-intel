# Provisioning Observability Runbook

**Traceability:** D-PH6-14 (`docs/architecture/plans/PH6.14-Observability.md` §6.14)  
**Audience:** HB Intel operations/admin support

## Application Insights Query Reference Card

### Full timeline for one provisioning run (by `correlationId`)
```kusto
customEvents
| where customDimensions.correlationId == "<CORRELATION_ID>"
| order by timestamp asc
| project timestamp, name, customDimensions
```

### All failed runs in last 7 days
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

### Average step durations
```kusto
customMetrics
| where name == "ProvisioningStepDurationMs"
| summarize avg(value) by stepName=tostring(customDimensions.stepName)
| order by avg_value desc
```

### Provisioning success rate trend
```kusto
customEvents
| where name in ("ProvisioningSagaCompleted", "ProvisioningSagaFailed")
| summarize total=count(), failed=countif(name == "ProvisioningSagaFailed") by bin(timestamp, 1d)
| extend successRate = (total - failed) * 100.0 / total
```

### Step 5 deferral rate trend
```kusto
customMetrics
| where name == "Step5DeferralRate"
| summarize deferralRate = avg(value) * 100 by bin(timestamp, 7d)
```

## Alert Rule Definitions

### Alert Rule 1: Stuck Provisioning Run (>30m)
- **Alert name:** `HBIntel-ProvisioningStuck`
- **Signal:** Log Analytics custom query
- **Severity:** 2 (Warning)
- **Action group:** Email/Teams notification to HB Intel Admin team
- **Evaluation frequency:** Every 5 minutes
- **Period:** 35 minutes

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

### Alert Rule 2: Timer Completion Missing
- **Alert name:** `HBIntel-TimerFullSpecFailed`
- **Signal:** Log Analytics custom query
- **Severity:** 1 (Error)
- **Action group:** Email + SMS to HB Intel Admin team
- **Evaluation frequency:** Every 15 minutes between 1:00 AM and 6:00 AM EST

```kusto
customEvents
| where name == "ProvisioningTimerStarted"
| extend timerCorrelationId = customDimensions.timerCorrelationId
| join kind=leftanti (
    customEvents | where name == "ProvisioningTimerCompleted"
) on $left.customDimensions.timerCorrelationId == $right.customDimensions.timerCorrelationId
| where timestamp < ago(2h)
| summarize failedTimers = count()
| where failedTimers > 0
```

## Operational Notes
- Provisioning telemetry depends on `APPLICATIONINSIGHTS_CONNECTION_STRING` in Function App settings.
- Correlation continuity depends on preserving `correlationId` across saga status writes, SignalR events, and telemetry payloads.
- Azure alert rules are configured in the Azure Portal/ARM and are not directly created from this repository.
