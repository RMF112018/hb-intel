# Application Insights Validation Queries

## Purpose

Use these queries after Prompt 04 instrumentation is deployed to identify where My Dashboard backend time is being spent.

Adjust the time window as needed.

---

# 1. Handler duration summary — My Work routes

```kusto
customEvents
| where timestamp > ago(4h)
| extend eventName = name
| where eventName == "handler.success"
| extend domain = tostring(customDimensions.domain)
| extend operation = tostring(customDimensions.operation)
| where domain == "my-work-read-model"
| project
    timestamp,
    operation,
    durationMs = todouble(customDimensions.durationMs),
    statusCode = tostring(customDimensions.statusCode),
    correlationId = tostring(customDimensions.correlationId)
| order by timestamp desc
```

---

# 2. Slowest route instances

```kusto
customEvents
| where timestamp > ago(4h)
| where name == "handler.success"
| where tostring(customDimensions.domain) == "my-work-read-model"
| extend durationMs = todouble(customDimensions.durationMs)
| top 50 by durationMs desc
| project
    timestamp,
    operation = tostring(customDimensions.operation),
    durationMs,
    correlationId = tostring(customDimensions.correlationId)
```

---

# 3. Auth duration against same correlation IDs

```kusto
let auth =
    customEvents
    | where timestamp > ago(4h)
    | where name == "auth.bearer.success"
    | project
        correlationId = tostring(customDimensions.correlationId),
        authDurationMs = todouble(customDimensions.durationMs);
let handlers =
    customEvents
    | where timestamp > ago(4h)
    | where name == "handler.success"
    | where tostring(customDimensions.domain) == "my-work-read-model"
    | project
        timestamp,
        correlationId = tostring(customDimensions.correlationId),
        operation = tostring(customDimensions.operation),
        handlerDurationMs = todouble(customDimensions.durationMs);
handlers
| join kind=leftouter auth on correlationId
| order by timestamp desc
```

---

# 4. Adobe stage durations

```kusto
customEvents
| where timestamp > ago(4h)
| where name in (
    "adobeSign.read.principalResolution.result",
    "adobeSign.read.tokenAcquisition.result",
    "adobeSign.read.refresh.result",
    "adobeSign.read.search.result",
    "adobeSign.read.actionQueue.result"
)
| project
    timestamp,
    eventName = name,
    correlationId = tostring(customDimensions.correlationId),
    status = tostring(customDimensions.status),
    sourceStatus = tostring(customDimensions.sourceStatus),
    resultStage = tostring(customDimensions.resultStage),
    durationMs = todouble(customDimensions.durationMs)
| order by timestamp desc
```

---

# 5. Adobe stage duration pivot by correlation

```kusto
customEvents
| where timestamp > ago(4h)
| where name in (
    "adobeSign.read.principalResolution.result",
    "adobeSign.read.tokenAcquisition.result",
    "adobeSign.read.refresh.result",
    "adobeSign.read.search.result",
    "adobeSign.read.actionQueue.result"
)
| extend
    correlationId = tostring(customDimensions.correlationId),
    durationMs = todouble(customDimensions.durationMs)
| summarize
    principalMs = maxif(durationMs, name == "adobeSign.read.principalResolution.result"),
    tokenMs = maxif(durationMs, name == "adobeSign.read.tokenAcquisition.result"),
    refreshMs = maxif(durationMs, name == "adobeSign.read.refresh.result"),
    searchMs = maxif(durationMs, name == "adobeSign.read.search.result"),
    overallMs = maxif(durationMs, name == "adobeSign.read.actionQueue.result")
  by correlationId
| order by overallMs desc
```

---

# 6. Project Links source timings

```kusto
customEvents
| where timestamp > ago(4h)
| where name == "myProjectLinks.read.sources.result"
| project
    timestamp,
    correlationId = tostring(customDimensions.correlationId),
    projectsDurationMs = todouble(customDimensions.projectsDurationMs),
    registryDurationMs = todouble(customDimensions.registryDurationMs),
    projectsStatus = tostring(customDimensions.projectsStatus),
    registryStatus = tostring(customDimensions.registryStatus),
    projectsRowCount = toint(customDimensions.projectsRowCount),
    registryRowCount = toint(customDimensions.registryRowCount),
    projectsBounded = tostring(customDimensions.projectsBounded),
    registryBounded = tostring(customDimensions.registryBounded)
| order by timestamp desc
```

---

# 7. Project Links reconciliation timing

```kusto
customEvents
| where timestamp > ago(4h)
| where name == "myProjectLinks.read.reconcile.result"
| project
    timestamp,
    correlationId = tostring(customDimensions.correlationId),
    durationMs = todouble(customDimensions.durationMs),
    matchedItemCount = toint(customDimensions.matchedItemCount),
    sourceStatus = tostring(customDimensions.sourceStatus)
| order by timestamp desc
```

---

# 8. Project Links source + reconcile joined

```kusto
let sources =
    customEvents
    | where timestamp > ago(4h)
    | where name == "myProjectLinks.read.sources.result"
    | project
        correlationId = tostring(customDimensions.correlationId),
        projectsDurationMs = todouble(customDimensions.projectsDurationMs),
        registryDurationMs = todouble(customDimensions.registryDurationMs),
        projectsRowCount = toint(customDimensions.projectsRowCount),
        registryRowCount = toint(customDimensions.registryRowCount);
let reconcile =
    customEvents
    | where timestamp > ago(4h)
    | where name == "myProjectLinks.read.reconcile.result"
    | project
        timestamp,
        correlationId = tostring(customDimensions.correlationId),
        reconcileDurationMs = todouble(customDimensions.durationMs),
        matchedItemCount = toint(customDimensions.matchedItemCount),
        sourceStatus = tostring(customDimensions.sourceStatus);
reconcile
| join kind=leftouter sources on correlationId
| order by timestamp desc
```

---

# 9. Cold-start suspicion triage

This does not prove cold start by itself. It helps detect requests whose total user-visible network duration is high while handler stage durations are relatively low.

Use this alongside:
- browser HAR/network timing,
- Azure function execution logs,
- platform scale/controller telemetry where available.

Start with the handler and stage queries above. If:
- frontend network duration is high,
- handler duration is much lower,
- and first-after-idle requests are consistently worse than warm repeats,

then Function hosting/cold-start analysis becomes justified.
