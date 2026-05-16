# Application Insights Validation Queries

## Purpose

Use these queries after Prompt 04 instrumentation is deployed to identify where My Dashboard backend time is being spent.

Adjust the time window as needed.

Telemetry note: these events are emitted as JSON envelopes in `traces.message`; parse with `payload = parse_json(message)` and filter to `_telemetryType == "customEvent"`.

---

# 1. Handler duration summary — My Work routes

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "handler.success"
| where tostring(payload.domain) == "my-work-read-model"
| project
    timestamp,
    operation = tostring(payload.operation),
    durationMs = todouble(payload.durationMs),
    statusCode = tostring(payload.statusCode),
    correlationId = tostring(payload.correlationId)
| order by timestamp desc
```

---

# 2. Slowest route instances

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "handler.success"
| where tostring(payload.domain) == "my-work-read-model"
| extend durationMs = todouble(payload.durationMs)
| top 50 by durationMs desc
| project
    timestamp,
    operation = tostring(payload.operation),
    durationMs,
    correlationId = tostring(payload.correlationId)
```

---

# 3. Auth duration against same correlation IDs

```kusto
let auth =
    traces
    | where timestamp > ago(4h)
    | extend payload = parse_json(message)
    | where tostring(payload._telemetryType) == "customEvent"
    | where tostring(payload.name) == "auth.bearer.success"
    | project
        correlationId = tostring(payload.correlationId),
        authDurationMs = todouble(payload.durationMs);
let handlers =
    traces
    | where timestamp > ago(4h)
    | extend payload = parse_json(message)
    | where tostring(payload._telemetryType) == "customEvent"
    | where tostring(payload.name) == "handler.success"
    | where tostring(payload.domain) == "my-work-read-model"
    | project
        timestamp,
        correlationId = tostring(payload.correlationId),
        operation = tostring(payload.operation),
        handlerDurationMs = todouble(payload.durationMs);
handlers
| join kind=leftouter auth on correlationId
| order by timestamp desc
```

---

# 4. Adobe stage durations

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) in (
    "adobeSign.read.principalResolution.result",
    "adobeSign.read.tokenAcquisition.result",
    "adobeSign.read.refresh.result",
    "adobeSign.read.search.result",
    "adobeSign.read.actionQueue.result"
)
| project
    timestamp,
    eventName = tostring(payload.name),
    correlationId = tostring(payload.correlationId),
    status = tostring(payload.status),
    sourceStatus = tostring(payload.sourceStatus),
    resultStage = tostring(payload.resultStage),
    durationMs = todouble(payload.durationMs)
| order by timestamp desc
```

---

# 5. Adobe stage duration pivot by correlation

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) in (
    "adobeSign.read.principalResolution.result",
    "adobeSign.read.tokenAcquisition.result",
    "adobeSign.read.refresh.result",
    "adobeSign.read.search.result",
    "adobeSign.read.actionQueue.result"
)
| extend
    eventName = tostring(payload.name),
    correlationId = tostring(payload.correlationId),
    durationMs = todouble(payload.durationMs)
| summarize
    principalMs = maxif(durationMs, eventName == "adobeSign.read.principalResolution.result"),
    tokenMs = maxif(durationMs, eventName == "adobeSign.read.tokenAcquisition.result"),
    refreshMs = maxif(durationMs, eventName == "adobeSign.read.refresh.result"),
    searchMs = maxif(durationMs, eventName == "adobeSign.read.search.result"),
    overallMs = maxif(durationMs, eventName == "adobeSign.read.actionQueue.result")
  by correlationId
| order by overallMs desc
```

---

# 6. Project Links source timings

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "myProjectLinks.read.sources.result"
| project
    timestamp,
    correlationId = tostring(payload.correlationId),
    projectsDurationMs = todouble(payload.projectsDurationMs),
    registryDurationMs = todouble(payload.registryDurationMs),
    projectsStatus = tostring(payload.projectsStatus),
    registryStatus = tostring(payload.registryStatus),
    projectsRowCount = toint(payload.projectsRowCount),
    registryRowCount = toint(payload.registryRowCount),
    projectsBounded = tostring(payload.projectsBounded),
    registryBounded = tostring(payload.registryBounded),
    registryCacheState = tostring(payload.registryCacheState),
    registryCacheAgeMs = todouble(payload.registryCacheAgeMs),
    registryServerFilterApplied = tostring(payload.registryServerFilterApplied),
    registryFilterMode = tostring(payload.registryFilterMode)
| order by timestamp desc
```

---

# 7. Project Links reconciliation timing

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "myProjectLinks.read.reconcile.result"
| project
    timestamp,
    correlationId = tostring(payload.correlationId),
    durationMs = todouble(payload.durationMs),
    matchedItemCount = toint(payload.matchedItemCount),
    sourceStatus = tostring(payload.sourceStatus)
| order by timestamp desc
```

---

# 8. Project Links source + reconcile joined

```kusto
let sources =
    traces
    | where timestamp > ago(4h)
    | extend payload = parse_json(message)
    | where tostring(payload._telemetryType) == "customEvent"
    | where tostring(payload.name) == "myProjectLinks.read.sources.result"
    | project
        correlationId = tostring(payload.correlationId),
        projectsDurationMs = todouble(payload.projectsDurationMs),
        registryDurationMs = todouble(payload.registryDurationMs),
        projectsRowCount = toint(payload.projectsRowCount),
        registryRowCount = toint(payload.registryRowCount),
        registryCacheState = tostring(payload.registryCacheState),
        registryCacheAgeMs = todouble(payload.registryCacheAgeMs),
        registryServerFilterApplied = tostring(payload.registryServerFilterApplied),
        registryFilterMode = tostring(payload.registryFilterMode);
let reconcile =
    traces
    | where timestamp > ago(4h)
    | extend payload = parse_json(message)
    | where tostring(payload._telemetryType) == "customEvent"
    | where tostring(payload.name) == "myProjectLinks.read.reconcile.result"
    | project
        timestamp,
        correlationId = tostring(payload.correlationId),
        reconcileDurationMs = todouble(payload.durationMs),
        matchedItemCount = toint(payload.matchedItemCount),
        sourceStatus = tostring(payload.sourceStatus);
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
