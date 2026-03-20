# HB Intel Monitoring Queries (KQL)

**Classification:** Reference
**Audience:** Platform engineering, DevOps, on-call responders
**Last Updated:** 2026-03-20
**Usage:** Paste into Application Insights > Logs. All queries target the `traces` table where custom events land via Azure Functions host forwarding.

---

## Handler Success/Error Rates by Domain

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name in ("handler.success", "handler.error")
| extend domain = tostring(customDimensions.domain)
| summarize
    successes = countif(name == "handler.success"),
    errors = countif(name == "handler.error"),
    errorRate = round(100.0 * countif(name == "handler.error") / count(), 2)
  by domain, bin(timestamp, 5m)
| order by timestamp desc, domain asc
```

---

## Auth Failure Breakdown

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name == "auth.bearer.error"
| extend reason = tostring(customDimensions.reason)
| summarize count() by reason, bin(timestamp, 5m)
| order by timestamp desc
```

---

## Provisioning Saga Outcomes

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name in ("ProvisioningSagaCompleted", "ProvisioningSagaFailed")
| extend
    projectId = tostring(customDimensions.projectId),
    projectNumber = tostring(customDimensions.projectNumber),
    correlationId = tostring(customDimensions.correlationId),
    outcome = name
| project timestamp, projectId, projectNumber, correlationId, outcome
| order by timestamp desc
```

---

## Provisioning Step Durations

```kql
traces
| where customDimensions._telemetryType == "customMetric"
| where name == "ProvisioningStepDurationMs"
| extend
    stepName = tostring(customDimensions.stepName),
    stepNumber = tostring(customDimensions.stepNumber),
    projectId = tostring(customDimensions.projectId),
    durationMs = todouble(customDimensions.value)
| project timestamp, projectId, stepNumber, stepName, durationMs
| order by timestamp desc
```

---

## Timer Execution History

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name in ("ProvisioningTimerStarted", "ProvisioningTimerCompleted", "ProvisioningTimerJobFailed", "idempotency.cleanup.start", "idempotency.cleanup.success", "idempotency.cleanup.error")
| project timestamp, name, customDimensions
| order by timestamp desc
```

---

## Idempotency Cache Hit Rate

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name in ("idempotency.cache.hit", "idempotency.cache.error", "idempotency.record.error")
| summarize
    hits = countif(name == "idempotency.cache.hit"),
    cacheErrors = countif(name == "idempotency.cache.error"),
    recordErrors = countif(name == "idempotency.record.error")
  by bin(timestamp, 1h)
| order by timestamp desc
```

---

## Health Endpoint Status (last 24h)

```kql
requests
| where name == "health" or url has "/api/health"
| summarize
    total = count(),
    successes = countif(resultCode == "200"),
    failures = countif(resultCode != "200"),
    avgDurationMs = round(avg(duration), 2)
  by bin(timestamp, 1h)
| order by timestamp desc
```

---

## Notification Delivery Pipeline

```kql
traces
| where customDimensions._telemetryType == "customEvent"
| where name startswith "notification."
| summarize count() by name, bin(timestamp, 1h)
| order by timestamp desc, name asc
```
