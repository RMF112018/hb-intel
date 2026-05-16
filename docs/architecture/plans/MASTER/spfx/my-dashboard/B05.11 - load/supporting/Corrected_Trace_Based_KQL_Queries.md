# Corrected Trace-Based KQL Queries

Live Azure Logs proved this repository emits telemetry through `traces` records whose `message` field contains JSON such as:

```json
{
  "_telemetryType": "customEvent",
  "name": "...",
  "correlationId": "..."
}
```

Use `traces | extend payload = parse_json(message)` rather than querying native `customEvents`.

---

## Query 1 — Handler duration summary

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

## Query 2 — Adobe stage pivot by correlation

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

## Query 3 — Project Links source timings

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

## Query 4 — Project Links source + reconcile joined

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
        sourceStatus = tostring(payload.sourceStatus),
        assignedProjectCount = toint(payload.assignedProjectCount),
        dualLaunchReadyCount = toint(payload.dualLaunchReadyCount),
        sharePointReadyCount = toint(payload.sharePointReadyCount),
        procoreReadyCount = toint(payload.procoreReadyCount);
reconcile
| join kind=leftouter sources on correlationId
| project
    timestamp,
    correlationId,
    projectsDurationMs,
    registryDurationMs,
    reconcileDurationMs,
    projectsRowCount,
    registryRowCount,
    registryCacheState,
    registryCacheAgeMs,
    registryServerFilterApplied,
    registryFilterMode,
    matchedItemCount,
    sourceStatus,
    assignedProjectCount,
    dualLaunchReadyCount,
    sharePointReadyCount,
    procoreReadyCount
| order by timestamp desc
```

---

## Query 5 — Registry cache state breakdown

```kusto
traces
| where timestamp > ago(4h)
| extend payload = parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "myProjectLinks.read.sources.result"
| summarize
    requests = count(),
    avgRegistryMs = avg(todouble(payload.registryDurationMs)),
    p95RegistryMs = percentile(todouble(payload.registryDurationMs), 95)
  by
    registryCacheState = tostring(payload.registryCacheState),
    registryFilterMode = tostring(payload.registryFilterMode),
    registryServerFilterApplied = tostring(payload.registryServerFilterApplied)
| order by requests desc
```
