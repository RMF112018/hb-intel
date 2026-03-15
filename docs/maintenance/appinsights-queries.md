# AppInsights KQL Query Reference — HB Intel Provisioning

**Classification:** Living Reference (Diátaxis — Reference quadrant)
**Audience:** HB Intel operations, admin support
**Traceability:** W0-G6-T06; Operations-Ready gate canonical path
**Related:** `docs/maintenance/provisioning-observability-runbook.md` (alert rule definitions, operational context)

This file is the canonical location for AppInsights KQL query templates used to investigate
and monitor the HB Intel provisioning saga. Copy queries directly into the Azure Portal
Log Analytics workspace or Application Insights Logs blade. Queries work against any Log
Analytics workspace or Application Insights resource with access to the HB Intel Azure
Function App telemetry. Standard AppInsights ingestion latency applies (typically 2–5 minutes).

---

## Query 1 — Full timeline for one provisioning run

Use to trace a single provisioning request from submission to completion or failure.
Replace `<CORRELATION_ID>` with the `correlationId` from the admin oversight page or a failure alert.

```kusto
customEvents
| where customDimensions.correlationId == "<CORRELATION_ID>"
| order by timestamp asc
| project timestamp, name, customDimensions
```

---

## Query 2 — All failed runs in last 7 days

Use to build the failure backlog or confirm incident scope.

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

---

## Query 3 — Average step durations

Use to identify which saga step is the bottleneck when provisioning is slow.
Results are ordered by duration descending (slowest first).

```kusto
customMetrics
| where name == "ProvisioningStepDurationMs"
| summarize avg(value) by stepName=tostring(customDimensions.stepName)
| order by avg_value desc
```

---

## Query 4 — Provisioning success rate trend (daily)

Use to track pilot health over time and spot degradation.

```kusto
customEvents
| where name in ("ProvisioningSagaCompleted", "ProvisioningSagaFailed")
| summarize total=count(), failed=countif(name == "ProvisioningSagaFailed") by bin(timestamp, 1d)
| extend successRate = (total - failed) * 100.0 / total
```

---

## Query 5 — Step 5 deferral rate trend (weekly)

Use to monitor the timer-deferral pattern and confirm overnight retry cadence is healthy.
Results are expressed as percentages (0–100).

```kusto
customMetrics
| where name == "Step5DeferralRate"
| summarize deferralRate = avg(value) * 100 by bin(timestamp, 7d)
```

---

## Notes

- All queries require `APPLICATIONINSIGHTS_CONNECTION_STRING` configured in the Azure Function App settings.
- `correlationId` is the primary correlation key across saga status writes, SignalR events, and telemetry payloads. Obtain it from provisioning failure alerts, the admin failures inbox (`/provisioning-failures`), or request detail views in the provisioning status UI. Use it as the `<CORRELATION_ID>` placeholder in Query 1.
- Alert rule KQL (stuck workflow, timer completion missing) is in `docs/maintenance/provisioning-observability-runbook.md §Alert Rule Definitions`.
