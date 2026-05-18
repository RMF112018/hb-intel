# Resource | App Insights KQL Query Pack

## Purpose

Starter KQL queries for operating the My Projects projection subsystem from Application Insights during MVP.

> Adjust `timestamp > ago(...)` windows as needed. Event names in this pack are reconciled against committed code per Prompt 10 — they match the canonical inventory exported from
> `backend/functions/src/services/my-projects-projection/telemetry/event-names.ts`.
> The lint test
> `backend/functions/src/services/__tests__/my-projects-projection-telemetry-inventory.test.ts`
> guards against drift between emitted strings and that inventory; this query pack is the operator-facing surface of the same source of truth.
>
> Sections marked **DEFERRED** below reference subsystems (drift-audit, purge, seed/rebuild telemetry) that do not yet emit `customEvents` from code. They are forward placeholders aligned to `08_Telemetry_Observability_And_Operational_Runbooks.md`; uncomment them once the emitting code lands in later prompts.

---

# 1. Notification Intake

```kusto
customEvents
| where name in (
    "myProjectsProjection.notification.validation.request",
    "myProjectsProjection.notification.validation.success",
    "myProjectsProjection.notification.payload.received",
    "myProjectsProjection.notification.clientState.invalid",
    "myProjectsProjection.notification.queue.accepted",
    "myProjectsProjection.notification.queue.failed",
    "myProjectsProjection.notification.duplicate.bucketed"
  )
| where timestamp > ago(24h)
| project timestamp,
          name,
          sourceListKind=tostring(customDimensions.sourceListKind),
          subscriptionId=tostring(customDimensions.subscriptionId),
          notificationBatchId=tostring(customDimensions.notificationBatchId),
          correlationId=tostring(customDimensions.correlationId),
          failureCode=tostring(customDimensions.failureCode)
| order by timestamp desc
```

---

# 2. Queue Sync Worker — Lease + Delta Pull Health

```kusto
customEvents
| where name in (
    "myProjectsProjection.worker.message.received",
    "myProjectsProjection.worker.message.completed",
    "myProjectsProjection.worker.lease.acquired",
    "myProjectsProjection.worker.lease.skipped",
    "myProjectsProjection.worker.delta.start",
    "myProjectsProjection.worker.delta.page",
    "myProjectsProjection.worker.delta.success",
    "myProjectsProjection.worker.delta.failure",
    "myProjectsProjection.worker.delta.resyncRequired"
  )
| where timestamp > ago(24h)
| project timestamp,
          name,
          sourceListKind=tostring(customDimensions.sourceListKind),
          runId=tostring(customDimensions.runId),
          correlationId=tostring(customDimensions.correlationId),
          changedItemCount=toint(customDimensions.changedItemCount),
          deletedItemCount=toint(customDimensions.deletedItemCount),
          deltaPageCount=toint(customDimensions.deltaPageCount),
          failureCode=tostring(customDimensions.failureCode),
          sanitizedReason=tostring(customDimensions.sanitizedReason),
          reason=tostring(customDimensions.reason),
          currentOwner=tostring(customDimensions.currentOwner)
| order by timestamp desc
```

---

# 3. Projection Write Results (Slice Recompute Outcome)

```kusto
customEvents
| where name in (
    "myProjectsProjection.worker.projection.write.success",
    "myProjectsProjection.worker.projection.write.failure"
  )
| where timestamp > ago(24h)
| project timestamp,
          name,
          sourceListKind=tostring(customDimensions.sourceListKind),
          runId=tostring(customDimensions.runId),
          correlationId=tostring(customDimensions.correlationId),
          helperRowsInserted=toint(customDimensions.helperRowsInserted),
          helperRowsUpdated=toint(customDimensions.helperRowsUpdated),
          helperRowsReactivated=toint(customDimensions.helperRowsReactivated),
          helperRowsDeactivated=toint(customDimensions.helperRowsDeactivated),
          helperRowsPurged=toint(customDimensions.helperRowsPurged),
          failureCode=tostring(customDimensions.failureCode),
          sanitizedReason=tostring(customDimensions.sanitizedReason)
| order by timestamp desc
```

---

# 4. Subscription Renewal Health

```kusto
customEvents
| where name in (
    "myProjectsProjection.subscription.create.start",
    "myProjectsProjection.subscription.create.success",
    "myProjectsProjection.subscription.create.failure",
    "myProjectsProjection.subscription.renew.start",
    "myProjectsProjection.subscription.renew.success",
    "myProjectsProjection.subscription.renew.failure",
    "myProjectsProjection.subscription.health.nearingExpiry",
    "myProjectsProjection.subscription.health.missing"
  )
| where timestamp > ago(14d)
| project timestamp,
          name,
          sourceListKind=tostring(customDimensions.sourceListKind),
          subscriptionId=tostring(customDimensions.subscriptionId),
          expirationDateTimeUtc=tostring(customDimensions.expirationDateTimeUtc),
          renewThresholdDays=toint(customDimensions.renewThresholdDays),
          minutesRemaining=toint(customDimensions.minutesRemaining),
          failureCode=tostring(customDimensions.failureCode),
          sanitizedReason=tostring(customDimensions.sanitizedReason)
| order by timestamp desc
```

---

# 5. My Project Links — Legacy Read-Path Health

Diagnoses the legacy aggregation read path (active when `readMode = legacy`).

```kusto
customEvents
| where name in (
    "projects-loader.failed",
    "registry-loader.failed",
    "myProjectLinks.read.sources.result",
    "myProjectLinks.read.reconcile.result"
  )
| where timestamp > ago(24h)
| project timestamp,
          name,
          stage=tostring(customDimensions.stage),
          sanitizedMessage=tostring(customDimensions.sanitizedMessage),
          listName=tostring(customDimensions.listName),
          projectsDurationMs=toint(customDimensions.projectsDurationMs),
          registryDurationMs=toint(customDimensions.registryDurationMs),
          projectsStatus=tostring(customDimensions.projectsStatus),
          registryStatus=tostring(customDimensions.registryStatus),
          projectsRowCount=toint(customDimensions.projectsRowCount),
          registryRowCount=toint(customDimensions.registryRowCount),
          matchedItemCount=toint(customDimensions.matchedItemCount),
          sourceStatus=tostring(customDimensions.sourceStatus),
          assignedProjectCount=toint(customDimensions.assignedProjectCount),
          dualLaunchReadyCount=toint(customDimensions.dualLaunchReadyCount),
          sharePointReadyCount=toint(customDimensions.sharePointReadyCount),
          procoreReadyCount=toint(customDimensions.procoreReadyCount)
| order by timestamp desc
```

---

# 6. My Project Links — Projection Read-Path Freshness

Active when `readMode = projection`. Surfaces row count, freshness, and projection-mode failures (no automatic fallback per the locked decision).

```kusto
customEvents
| where name in (
    "myProjectLinks.read.projection.load.result",
    "myProjectLinks.read.projection.failed"
  )
| where timestamp > ago(24h)
| project timestamp,
          name,
          durationMs=toint(customDimensions.durationMs),
          projectionRowCount=toint(customDimensions.projectionRowCount),
          matchedItemCount=toint(customDimensions.matchedItemCount),
          sourceStatus=tostring(customDimensions.sourceStatus),
          projectionMaxLastProjectedAtUtc=tostring(customDimensions.projectionMaxLastProjectedAtUtc),
          projectionBatchId=tostring(customDimensions.projectionBatchId),
          assignedProjectCount=toint(customDimensions.assignedProjectCount),
          dualLaunchReadyCount=toint(customDimensions.dualLaunchReadyCount),
          sharePointReadyCount=toint(customDimensions.sharePointReadyCount),
          procoreReadyCount=toint(customDimensions.procoreReadyCount),
          stage=tostring(customDimensions.stage),
          sanitizedMessage=tostring(customDimensions.sanitizedMessage)
| order by timestamp desc
```

---

# 7. Projection Freshness Lag (Derived)

Computes minutes elapsed between `projectionMaxLastProjectedAtUtc` (the most recent helper-row write surfaced in a read) and the read response timestamp. Operators use this to confirm the projection store is keeping pace with source-side delta during stabilization.

```kusto
customEvents
| where name == "myProjectLinks.read.projection.load.result"
| where timestamp > ago(24h)
| extend lastProjectedAtUtc = todatetime(tostring(customDimensions.projectionMaxLastProjectedAtUtc))
| where isnotnull(lastProjectedAtUtc)
| extend freshnessLagMinutes = datetime_diff('minute', timestamp, lastProjectedAtUtc)
| summarize p50=percentile(freshnessLagMinutes, 50),
            p95=percentile(freshnessLagMinutes, 95),
            max=max(freshnessLagMinutes),
            samples=count()
            by bin(timestamp, 15m)
| order by timestamp desc
```

---

# 8. **DEFERRED** — Seed / Full Rebuild Telemetry

> Seed/rebuild runs are captured today in the `MyProjectsProjectionRuns` Azure Table via `ProjectionRunRepository`. Direct `customEvents` emission for seed/rebuild is deferred to a later prompt. When the seed service starts emitting `myProjectsProjection.seed.*` and `myProjectsProjection.rebuild.*` events per Doc 08 § 2.4, uncomment the block below.

```text
-- customEvents
-- | where name in (
--     "myProjectsProjection.seed.start",
--     "myProjectsProjection.seed.success",
--     "myProjectsProjection.seed.failure",
--     "myProjectsProjection.rebuild.start",
--     "myProjectsProjection.rebuild.success",
--     "myProjectsProjection.rebuild.failure"
--   )
-- | order by timestamp desc
```

---

# 9. **DEFERRED** — Drift Audit / Repair Telemetry

> Drift-audit and drift-repair jobs land in a later prompt (B05.13 Prompt 13+). Doc 08 § 2.5 defines the canonical event names. Placeholder retained so the operator runbook can adopt the query when emission lands.

```text
-- customEvents
-- | where name in (
--     "myProjectsProjection.driftAudit.start",
--     "myProjectsProjection.driftAudit.success",
--     "myProjectsProjection.driftAudit.failure",
--     "myProjectsProjection.driftAudit.detected",
--     "myProjectsProjection.driftRepair.start",
--     "myProjectsProjection.driftRepair.success",
--     "myProjectsProjection.driftRepair.failure"
--   )
-- | order by timestamp desc
```

---

# 10. **DEFERRED** — Inactive Row Purge Telemetry

> The 90-day inactive-row purge job (Doc 08 § 2.6) lands in a later prompt.

```text
-- customEvents
-- | where name in (
--     "myProjectsProjection.purge.start",
--     "myProjectsProjection.purge.success",
--     "myProjectsProjection.purge.failure"
--   )
-- | order by timestamp desc
```
