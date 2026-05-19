# App Insights KQL Query Pack | My Projects SharePoint Storage Redirection

> Canonical names must match `backend/functions/src/services/my-projects-projection/telemetry/event-names.ts`.
> Query surface is `customEvents` for projection runtime telemetry.

## 1. Recent webhook acceptance and invalid client-state notifications

```kql
customEvents
| where timestamp > ago(24h)
| where name startswith "myProjectsProjection.notification."
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 2. Pending Work ingestion outcomes

```kql
customEvents
| where timestamp > ago(24h)
| where name in (
  "myProjectsProjection.pendingWork.scan.start",
  "myProjectsProjection.pendingWork.scan.completed",
  "myProjectsProjection.pendingWork.claim.succeeded",
  "myProjectsProjection.pendingWork.claim.skipped",
  "myProjectsProjection.pendingWork.item.succeeded",
  "myProjectsProjection.pendingWork.retry.scheduled",
  "myProjectsProjection.pendingWork.deadLettered",
  "myProjectsProjection.pendingWork.persistence.failed"
)
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 3. Pending Work backlog / claim diagnostics

```kql
customEvents
| where timestamp > ago(24h)
| where name in (
  "myProjectsProjection.pendingWork.scan.completed",
  "myProjectsProjection.pendingWork.claim.succeeded",
  "myProjectsProjection.pendingWork.claim.skipped",
  "myProjectsProjection.pendingWork.retry.scheduled",
  "myProjectsProjection.pendingWork.deadLettered"
)
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 4. Delta resync-required events

```kql
customEvents
| where timestamp > ago(7d)
| where name == "myProjectsProjection.worker.delta.resyncRequired"
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 5. Subscription renewal health

```kql
customEvents
| where timestamp > ago(14d)
| where name startswith "myProjectsProjection.subscription."
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 6. Projection write failures

```kql
customEvents
| where timestamp > ago(7d)
| where name == "myProjectsProjection.worker.projection.write.failure"
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 7. Read-provider projection failures

```kql
customEvents
| where timestamp > ago(7d)
| where name in (
  "myProjectLinks.read.projection.failed",
  "myProjectLinks.read.projection.load.result"
)
| project timestamp, name, customDimensions
| order by timestamp desc
```

## 8. Cutover readiness inspection

```kql
customEvents
| where timestamp > ago(24h)
| where name in (
  "myProjectLinks.read.projection.load.result",
  "myProjectsProjection.pendingWork.scan.completed",
  "myProjectsProjection.subscription.health.nearingExpiry",
  "myProjectsProjection.subscription.health.missing",
  "myProjectsProjection.worker.delta.success"
)
| project timestamp, name, customDimensions
| order by timestamp desc
```
