# 08 | Telemetry, Observability, and Operational Runbooks

## Objective

Define the Application Insights-first telemetry and day-2 operator posture for the My Projects projection subsystem.

The MVP alerting posture is intentionally:
- **App Insights custom events and traces**
- **documented KQL operator queries**
- **portal monitoring of Service Bus queue/DLQ state**

Teams/email alerting is staged later.

---

## 1. Telemetry Design Principles

1. Telemetry must be **operationally actionable**.
2. Telemetry must use **closed-set status/failure codes** where possible.
3. Telemetry must **never include**:
   - bearer tokens,
   - JWT fragments,
   - raw client-state secret,
   - Graph assertions,
   - full user/project payload dumps.
4. UPNs should be avoided in broad trace logs unless already consistent with existing repo posture and intentionally required. Prefer:
   - counts,
   - source IDs,
   - batch IDs,
   - correlation IDs.
5. Every long-running control-plane task should emit:
   - start event,
   - success/failure event,
   - duration,
   - counts.

---

## 2. Event Taxonomy

## 2.1 Notification ingress events

| Event | Meaning |
|---|---|
| `myProjectsProjection.notification.validation.request` | Graph validation-token request received |
| `myProjectsProjection.notification.validation.success` | Plain-text validation response returned |
| `myProjectsProjection.notification.payload.received` | Operational notification payload accepted for validation |
| `myProjectsProjection.notification.clientState.invalid` | Notification rejected due to client-state mismatch |
| `myProjectsProjection.notification.queue.accepted` | Queue send succeeded |
| `myProjectsProjection.notification.queue.failed` | Queue send failed; webhook returns 5xx |
| `myProjectsProjection.notification.duplicate.bucketed` | Queue message had deterministic debounce bucket/message ID |

### Recommended properties
- `correlationId`
- `notificationCount`
- `sourceListKind`
- `subscriptionId`
- `debounceBucketUtc`
- `queueMessageId`
- `durationMs`

---

## 2.2 Subscription management events

| Event | Meaning |
|---|---|
| `myProjectsProjection.subscription.create.start` | Create attempt begins |
| `myProjectsProjection.subscription.create.success` | Create succeeded |
| `myProjectsProjection.subscription.create.failure` | Create failed |
| `myProjectsProjection.subscription.renew.start` | Renewal begins |
| `myProjectsProjection.subscription.renew.success` | Renewal succeeded |
| `myProjectsProjection.subscription.renew.failure` | Renewal failed |
| `myProjectsProjection.subscription.health.nearingExpiry` | Expiration within configured threshold |
| `myProjectsProjection.subscription.health.missing` | Expected subscription absent |

### Recommended properties
- `sourceListKind`
- `subscriptionId`
- `expirationDateTimeUtc`
- `remainingDays`
- `status`
- `failureCode`
- `durationMs`

---

## 2.3 Queue sync worker events

| Event | Meaning |
|---|---|
| `myProjectsProjection.worker.message.received` | Queue worker received message |
| `myProjectsProjection.worker.lease.acquired` | Sync lease won |
| `myProjectsProjection.worker.lease.skipped` | Existing lease prevented duplicate concurrent processing |
| `myProjectsProjection.worker.delta.start` | Delta pull begins |
| `myProjectsProjection.worker.delta.page` | Optional verbose event when pages > 1 |
| `myProjectsProjection.worker.delta.success` | Delta pages drained |
| `myProjectsProjection.worker.delta.failure` | Delta pull failed |
| `myProjectsProjection.worker.delta.resyncRequired` | Graph returned 410/invalid token state |
| `myProjectsProjection.worker.projection.write.success` | Projection writes completed |
| `myProjectsProjection.worker.projection.write.failure` | Projection writes failed |
| `myProjectsProjection.worker.message.completed` | Worker finished successfully |

### Recommended properties
- `sourceListKind`
- `runId`
- `projectionBatchId`
- `changedItemCount`
- `deletedItemCount`
- `deltaPageCount`
- `helperRowsInserted`
- `helperRowsUpdated`
- `helperRowsReactivated`
- `helperRowsDeactivated`
- `durationMs`
- `failureCode`

---

## 2.4 Seed/rebuild events

| Event | Meaning |
|---|---|
| `myProjectsProjection.seed.start` | Initial seed starts |
| `myProjectsProjection.seed.success` | Initial seed completes |
| `myProjectsProjection.seed.failure` | Initial seed fails |
| `myProjectsProjection.rebuild.start` | Manual rebuild starts |
| `myProjectsProjection.rebuild.success` | Manual rebuild completes |
| `myProjectsProjection.rebuild.failure` | Manual rebuild fails |

### Recommended properties
- `runId`
- `projectionBatchId`
- `projectsSourceCount`
- `registrySourceCount`
- `expectedProjectionRowCount`
- `helperRowsInserted`
- `helperRowsUpdated`
- `helperRowsReactivated`
- `helperRowsDeactivated`
- `durationMs`
- `failureCode`

---

## 2.5 Drift audit and repair events

| Event | Meaning |
|---|---|
| `myProjectsProjection.driftAudit.start` | Audit begins |
| `myProjectsProjection.driftAudit.success` | Audit completes |
| `myProjectsProjection.driftAudit.failure` | Audit fails |
| `myProjectsProjection.driftAudit.detected` | Missing/extra/hash mismatch found |
| `myProjectsProjection.driftRepair.start` | Repair begins |
| `myProjectsProjection.driftRepair.success` | Repair completes |
| `myProjectsProjection.driftRepair.failure` | Repair fails |

### Recommended properties
- `runId`
- `expectedActiveRowCount`
- `actualActiveRowCount`
- `missingRowCount`
- `extraActiveRowCount`
- `contentMismatchCount`
- `repairedInsertCount`
- `repairedUpdateCount`
- `repairedDeactivateCount`
- `durationMs`

---

## 2.6 Purge events

| Event | Meaning |
|---|---|
| `myProjectsProjection.purge.start` | Purge begins |
| `myProjectsProjection.purge.success` | Purge completes |
| `myProjectsProjection.purge.failure` | Purge fails |

### Recommended properties
- `runId`
- `retentionDays`
- `rowsPurged`
- `durationMs`

---

## 2.7 Runtime read provider events

| Event | Meaning |
|---|---|
| `myProjectLinks.projection.read.start` | User read begins |
| `myProjectLinks.projection.read.success` | Read completed |
| `myProjectLinks.projection.read.failure` | Helper-list read failed |

### Recommended properties
- `correlationId`
- `rowsReturned`
- `assignedProjectCount`
- `sharePointReadyCount`
- `procoreReadyCount`
- `sourceStatus`
- `durationMs`

Do not emit actor UPN in this event unless existing telemetry governance explicitly permits it. Match current sanitized diagnostic posture.

---

## 3. KQL Operator Query Set

The package implementation should add a repo reference document with final KQL queries. The queries below define the intended monitoring questions.

## 3.1 Recent projection sync outcomes

```kusto
traces
| extend payload=parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) in (
    "myProjectsProjection.worker.message.completed",
    "myProjectsProjection.worker.delta.failure",
    "myProjectsProjection.worker.projection.write.failure"
)
| where timestamp > ago(24h)
| project
    timestamp,
    Event=tostring(payload.name),
    Source=tostring(payload.sourceListKind),
    RunId=tostring(payload.runId),
    BatchId=tostring(payload.projectionBatchId),
    Changed=toint(payload.changedItemCount),
    Deleted=toint(payload.deletedItemCount),
    Inserted=toint(payload.helperRowsInserted),
    Updated=toint(payload.helperRowsUpdated),
    Deactivated=toint(payload.helperRowsDeactivated),
    DurationMs=toint(payload.durationMs),
    Failure=tostring(payload.failureCode)
| order by timestamp desc
```

## 3.2 Subscription health

```kusto
traces
| extend payload=parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) startswith "myProjectsProjection.subscription."
| where timestamp > ago(14d)
| project
    timestamp,
    Event=tostring(payload.name),
    Source=tostring(payload.sourceListKind),
    SubscriptionId=tostring(payload.subscriptionId),
    Expiration=todatetime(payload.expirationDateTimeUtc),
    RemainingDays=todouble(payload.remainingDays),
    Failure=tostring(payload.failureCode)
| order by timestamp desc
```

## 3.3 Webhook queue failures

```kusto
traces
| extend payload=parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "myProjectsProjection.notification.queue.failed"
| where timestamp > ago(7d)
| project
    timestamp,
    Source=tostring(payload.sourceListKind),
    SubscriptionId=tostring(payload.subscriptionId),
    Failure=tostring(payload.failureCode),
    CorrelationId=tostring(payload.correlationId)
| order by timestamp desc
```

## 3.4 Drift results

```kusto
traces
| extend payload=parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) in (
    "myProjectsProjection.driftAudit.success",
    "myProjectsProjection.driftAudit.detected",
    "myProjectsProjection.driftAudit.failure"
)
| where timestamp > ago(30d)
| project
    timestamp,
    Event=tostring(payload.name),
    Expected=toint(payload.expectedActiveRowCount),
    Actual=toint(payload.actualActiveRowCount),
    Missing=toint(payload.missingRowCount),
    Extra=toint(payload.extraActiveRowCount),
    Mismatch=toint(payload.contentMismatchCount),
    Failure=tostring(payload.failureCode)
| order by timestamp desc
```

## 3.5 Projection read timing

```kusto
traces
| extend payload=parse_json(message)
| where tostring(payload._telemetryType) == "customEvent"
| where tostring(payload.name) == "myProjectLinks.projection.read.success"
| where timestamp > ago(24h)
| summarize
    Reads=count(),
    AvgDurationMs=avg(todouble(payload.durationMs)),
    P95DurationMs=percentile(todouble(payload.durationMs), 95),
    AvgRows=avg(todouble(payload.rowsReturned))
```

---

## 4. Portal Monitoring

## 4.1 Service Bus queue

Operators should monitor:
- active message count,
- dead-letter message count,
- incoming/outgoing message counts,
- throttling/errors where visible.

### Immediate attention conditions
- DLQ count > 0,
- active message count remains nonzero for extended period,
- spike in queue messages with no corresponding worker completion events.

## 4.2 Azure Table Storage

Monitor:
- authorization errors,
- throttling,
- unusual latency where diagnostics are available.

## 4.3 Function App

Monitor:
- function failures,
- queue-trigger retries,
- timer failures,
- App Insights custom event absence where events are expected.

---

## 5. Day-2 Operator Cadence

## Daily during first 14 days after cutover
- Verify no subscription renewal failures.
- Verify no DLQ messages.
- Verify latest sync worker runs are succeeding.
- Review drift audit outcome.
- Review runtime projection read duration and failures.

## Weekly after stabilization
- Review subscription health.
- Review drift audit/repair counts.
- Review queue/DLQ metrics.
- Confirm purge job behavior monthly.

---

## 6. Future Alerting Stage

Out of MVP scope but documented for later:

### Stage 2 alerting candidates
- Azure Monitor alert on Service Bus DLQ count > 0.
- App Insights alert on:
  - subscription renewal failure,
  - delta resync required,
  - repeated worker projection write failure,
  - projection read failure rate threshold.

### Stage 3 operator notification channels
- Teams channel webhook / Power Automate
- email distribution
- admin UI health panel

---

## 7. Operational Failure Escalation Rules

| Condition | Action |
|---|---|
| One isolated delta sync failure | Let Service Bus retry; inspect if repeats |
| Repeated sync failures for same source | Pause cutover/repair, inspect App Insights and state tables |
| `delta.resyncRequired` | Run controlled rebuild/resync process |
| Subscription renewal failure | Manually reconcile subscription before expiration |
| DLQ > 0 | Inspect message reason, execute repair runbook |
| Drift detected but read path healthy | Diagnose; use manual rebuild if material |
| Projection read failure | Consider rollback to legacy read mode if user impact is immediate |

---

## 8. Required Documentation Artifacts from Implementation

The code agent must add/update repo docs for:
- event catalog,
- KQL operator queries,
- subscription health runbook,
- DLQ handling runbook,
- drift detection/repair runbook,
- purge runbook.
