# P1-C3: Observability and Instrumentation Spec

| Field | Value |
|---|---|
| **Doc ID** | P1-C3 |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Instrumentation Specification |
| **Owner** | Backend Services Team / DevOps |
| **Update Authority** | C-workstream lead; changes require review by DevOps and B-workstream |
| **Status** | Draft — pending repo-truth alignment |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **References** | P1-B2 (Adapter Completion Backlog), P1-B3 (Mock Isolation Policy), P1-C1 (Backend Service Contract Catalog), P1-D1 (Write Safety) |

**Note:** This document was previously identified as P1-C1, which collided with the backend service contract catalog. Re-identified as P1-C3. Content sections below are carried forward from the original draft and require further alignment passes for health checks, circuit breakers, sampling, and telemetry events.

---

## 1. Purpose and Scope

Define telemetry, health checks, monitoring, and alerting requirements for Phase 1 production surfaces.

### This spec governs

- **Proxy adapter observability** — instrumentation for all 11 domain proxy adapters calling Azure Functions backend (`HBC_ADAPTER_MODE='proxy'`)
- **Backend route instrumentation** — all currently implemented route groups per C1 catalog (proxy, project setup requests, acknowledgments, notifications, provisioning saga, SignalR)
- **Auth/OBO token telemetry** — MSAL token acquisition in the PWA, Bearer validation and OBO exchange in the backend
- **Provisioning saga observability** — saga lifecycle, step completion, retry, and failure events
- **Notification system observability** — notification delivery, queue processing, and preference management
- **Adapter-mode startup assertion signals** — per B3 enforcement Layer 2, the startup guard must emit adapter mode and environment for observability

### This spec does NOT govern (future phase)

- SharePoint adapter observability (PnPjs calls, SPFx context) — deferred to future SharePoint engineering plan
- Direct API adapter observability (Azure SQL) — deferred to future API phase
- PWA client-side performance observability — separate concern from backend instrumentation

---

## 2. Required Telemetry Events

### 2.1 Data Adapter Events

For each proxy adapter domain and backend route group:

| Event | Trigger | Payload | Severity |
|---|---|---|---|
| adapter.request.start | Adapter method invoked | domain, operation, correlationId | info |
| adapter.request.success | Adapter returns data | domain, operation, durationMs, recordCount | info |
| adapter.request.error | Adapter throws/rejects | domain, operation, errorCode, errorMessage, durationMs | error |
| adapter.request.retry | Retry triggered | domain, operation, retryCount, retryReason | warn |
| adapter.cache.hit | Cache serves request | domain, operation, cacheAge | debug |
| adapter.cache.miss | Cache miss; live fetch needed | domain, operation | debug |

### 2.2 Auth Events

| Event | Trigger | Payload | Severity |
|---|---|---|---|
| auth.token.acquire | Token acquisition started | provider (msal/mock), scope | info |
| auth.token.success | Token acquired | provider, durationMs | info |
| auth.token.error | Token acquisition failed | provider, errorCode | error |
| auth.mode.switch | Auth mode changed | from, to | warn |

### 2.3 Provisioning Events

| Event | Trigger | Payload | Severity |
|---|---|---|---|
| provisioning.saga.start | Saga orchestrator begins | projectId, sagaId | info |
| provisioning.saga.step | Individual step completes | sagaId, stepName, status | info |
| provisioning.saga.complete | All steps finished | sagaId, durationMs, outcome | info |
| provisioning.saga.compensate | Compensation triggered | sagaId, failedStep, compensationSteps | error |

---

## 3. Health Checks and Circuit Breakers

### 3.1 Health Check Endpoints

- `/api/health` — Azure Functions health probe (returns 200 if operational). **Note:** Not currently verified in repo — see C1 catalog. Must be implemented or an alternative health signal defined.
- Proxy adapter health: test call to a known backend route
- Graph adapter health: scoped dependency probe (specific Graph endpoint TBD — `/me` is a delegated-user scenario and may not be appropriate for service health)

### 3.2 Circuit Breaker Strategy

**Note:** Retry and circuit-breaker policy are owned by P1-D1 (Write Safety, Retry, and Recovery). The parameters below are target behavior pending D1 delivery. Proxy adapters do not implement their own retry logic per B1.

- **Threshold:** 5 consecutive failures or 50% failure rate in 60-second window
- **Open duration:** 30 seconds before half-open probe
- **Half-open:** Single test request; success closes circuit, failure re-opens
- **Fallback:** Return cached data if available; otherwise graceful degradation with user-visible notice

---

## 4. Monitoring Dashboards

### 4.1 Required Dashboards

| Dashboard | Audience | Key Metrics |
|---|---|---|
| Adapter Health | DevOps | Request rate, error rate, p50/p95/p99 latency per domain |
| Auth & Token | Security | Token acquisition rate, failure rate, mode distribution |
| Provisioning | Operations | Saga success rate, step duration heatmap, compensation events |
| Error Budget | Leadership | Error rate vs SLO, burn rate, time-to-breach projection |

### 4.2 Alert Templates

| Alert | Condition | Severity | Notification |
|---|---|---|---|
| High adapter error rate | > 5% errors in 5-minute window | P2 | Teams webhook (see note below) |
| Adapter latency spike | p95 > 10s for any domain | P3 | Teams webhook |
| Auth failure burst | > 3 auth failures in 1 minute | P1 | Teams webhook + on-call |
| Provisioning saga failure | Any compensation event | P2 | Teams webhook |
| Circuit breaker open | Any adapter circuit opens | P1 | Teams webhook + on-call |

**Alert channel note:** "Teams webhook" refers to the supported alert delivery mechanism (Incoming Webhooks or Power Automate Workflows). The specific mechanism must be confirmed — Office 365 connectors are deprecated; Microsoft recommends Workflows for new integrations.

---

## 5. MTTD Targets

| Issue Class | MTTD Target | Detection Method |
|---|---|---|
| Adapter unavailable (circuit open) | < 2 minutes | Circuit breaker state change alert |
| Elevated error rate (> 5%) | < 5 minutes | Sliding window error rate dashboard |
| Auth system failure | < 2 minutes | Token acquisition failure burst alert |
| Provisioning saga compensation | < 1 minute | Real-time saga event stream |
| Performance degradation (p95 > 10s) | < 10 minutes | Latency percentile dashboard |

---

## 6. Infrastructure Requirements

### 6.1 Logging

- **Local:** Console logger with structured JSON output
- **Staging:** Application Insights (Azure) with correlation IDs
- **Production:** Application Insights with sampling — current repo: `host.json` sets `maxTelemetryItemsPerSecond: 20`; target sampling strategy (severity-based) requires further configuration

### 6.2 Metrics

- Custom metrics via Application Insights trackMetric API
- OpenTelemetry-compatible span context for distributed tracing — **target behavior**; current repo does not have OTel host enablement. Azure Functions now supports first-class OpenTelemetry; migration path should be defined as a follow-on.

### 6.3 Environment Parity

All environments (local, staging, production) must have:
- Structured logging with domain/operation/correlationId fields
- Health check endpoints or equivalent readiness signals
- Error alerting configured (local: console, staging/production: Teams webhook or equivalent)
