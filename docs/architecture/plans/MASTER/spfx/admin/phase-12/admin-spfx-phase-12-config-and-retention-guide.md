# Admin SPFx IT Control Center — Phase 12 Configuration and Retention Guide

**Created:** 2026-04-04
**Prompt:** P12-10 — Testing, Docs, Runbooks, and Config Guidance

---

## 1. Purpose

This document explains the configuration, retention, and storage assumptions for the Phase 12 observability layer.

---

## 2. Storage tables

All observability data is stored in Azure Table Storage, managed via the backend service factory.

| Table | Partition key | Row key | Write mode | Purpose |
|-------|--------------|---------|------------|---------|
| `ObservabilityAlerts` | `category` | `alertId` (UUID) | Upsert (Replace) | Alert records with lifecycle state |
| `ObservabilityProbeSnapshots` | `__snapshot__` | `snapshotId` (UUID) | Upsert (Replace) | Append-only probe snapshots |
| `ObservabilityErrors` | `domain` | `errorId` (UUID) | Insert (append-only) | Error event records |
| `AdminAuditEvents` | `runId` | `auditId` (UUID) | Insert (append-only) | Admin audit trail (Phase 4, extended) |
| `AdminRuns` | `domain` | `runId` (UUID) | Upsert (Replace) | Admin run lifecycle (Phase 4, unchanged) |
| `AdminEvidence` | `runId` | `evidenceId` (UUID) | Insert (append-only) | Evidence metadata (Phase 4, unchanged) |

---

## 3. Retention targets

| Data category | Retention target | Notes |
|--------------|-----------------|-------|
| Active alerts | Indefinite while unresolved | Operators must see all unresolved alerts |
| Resolved alerts | 90 days | Sufficient for trend analysis |
| Probe snapshots | 90 days | Health trend window |
| Error events | 90 days | Diagnosis window |
| Audit events | 365 days | Compliance trail |
| Admin runs | 365 days | Operational record |
| Evidence | 365 days | Dispute resolution |

**Enforcement:** Retention cleanup is a backend timer concern (Azure Timer Trigger), not yet implemented. The retention targets above are design intent — records are not automatically purged in Phase 12. Manual cleanup via Azure Storage Explorer is possible if storage grows.

---

## 4. Polling intervals

| Service | Interval | Constant | Package |
|---------|----------|----------|---------|
| Alert monitoring | 30 seconds | `ADMIN_ALERTS_POLL_MS` | `@hbc/features-admin` |
| Probe execution | 15 minutes | `PROBE_SCHEDULER_DEFAULT_MS` | `@hbc/features-admin` |
| Error log refresh | 30 seconds | Query `refetchInterval` | `useObservabilityErrors` |
| Probe retry backoff | 100ms / 200ms / 400ms | Exponential, 3 attempts | `ProbeScheduler` |
| Notification cooldown | 5 minutes | `TeamsWebhookDispatchAdapter.COOLDOWN_MS` | `@hbc/features-admin` |

---

## 5. Environment variables

### Backend (`backend/functions`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `AZURE_TABLE_ENDPOINT` | Yes | Azure Table Storage endpoint or connection string for all observability tables |
| `ADAPTER_MODE` | Yes | `real` or `mock` — controls durable vs in-memory adapter resolution |
| `AZURE_FUNCTIONS_ENVIRONMENT` | No | Environment label for telemetry (default: `Development`) |
| `AzureSignalRConnectionString` | No | SignalR connection (optional, unrelated to observability) |

### Frontend (`apps/admin`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FUNCTION_APP_URL` | Yes | Backend Function App URL for all API calls |
| `VITE_TEAMS_WEBHOOK_URL` | No | Teams Incoming Webhook URL for immediate alert dispatch |
| `VITE_ALERT_EMAIL_RELAY` | No | Email relay address (console-logged only in Wave 0) |

---

## 6. What requires backend deployment

| Change | Requires backend deployment? |
|--------|------------------------------|
| New observability tables (first run) | Tables auto-created on first write via `ensureTable()` |
| Alert/probe/error API endpoints | Yes — new HTTP trigger functions in `observability-routes.ts` |
| Observability stores | Yes — new service implementations in `admin-control-plane/` |
| Dashboard summary API | Yes — assembles data from all 3 stores |
| Timeline API | Yes — joins audit events with alerts and errors |
| Telemetry bridge | Yes — normalizes saga failures into error records |
| Route error emitter | Yes — instruments catch blocks across admin routes |
| Frontend error log page | No — SPFx app only, no backend change |
| Lane registry update | No — SPFx app only |
| Alert resolve action (in-memory) | No — `@hbc/features-admin` package only |

---

## 7. Adapter mode behavior

| Mode | Observability stores | Use case |
|------|---------------------|----------|
| `real` | `DurableObservabilityAlertStore`, `DurableObservabilityProbeSnapshotStore`, `DurableObservabilityErrorStore` — Azure Table Storage | Production deployment |
| `mock` / `NODE_ENV=test` | `MockObservabilityAlertStore`, `MockObservabilityProbeSnapshotStore`, `MockObservabilityErrorStore` — in-memory arrays | Local development, automated tests |

Both modes implement the same interfaces (`IObservabilityAlertStore`, `IObservabilityProbeSnapshotStore`, `IObservabilityErrorStore`). The service factory resolves the correct implementation at startup based on `ADAPTER_MODE`.

---

## 8. Monitoring the observability layer itself

The observability layer emits structured telemetry to Application Insights via the `withTelemetry` wrapper on all API endpoints. Key events:

| Event | Domain | Meaning |
|-------|--------|---------|
| `handler.invoke` | `observability` | API endpoint called |
| `handler.success` | `observability` | API call completed successfully |
| `handler.error` | `observability` | API call failed |
| `startup.mode.resolved` | `admin-control-plane-host` | Service factory initialized with adapter mode |

**KQL query for observability API health:**
```kql
customEvents
| where name startswith "handler." and customDimensions.domain == "observability"
| summarize count() by name, bin(timestamp, 5m)
| order by timestamp desc
```
