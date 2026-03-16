# P1-C1 — Phase 1 Observability and Instrumentation Specification

**Document ID:** P1-C1
**Phase:** 1 — Production Data-Plane and Integration Backbone
**Status:** Approved
**Date:** 2026-03-16
**Governing Plan:** docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md

---

## 1. Purpose
Define telemetry, health checks, monitoring, and alerting requirements for Phase 1 production data adapters.

## 2. Required Telemetry Events

### 2.1 Data Adapter Events
For each production SharePoint/Graph adapter:
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

## 3. Health Checks and Circuit Breakers

### 3.1 Health Check Endpoints
- `/api/health` — Azure Functions health probe (returns 200 if operational)
- SharePoint adapter health: PnPjs test query against known list (< 5s response = healthy)
- Graph adapter health: Graph /me endpoint probe

### 3.2 Circuit Breaker Strategy
- **Threshold:** 5 consecutive failures or 50% failure rate in 60-second window
- **Open duration:** 30 seconds before half-open probe
- **Half-open:** Single test request; success closes circuit, failure re-opens
- **Fallback:** Return cached data if available; otherwise graceful degradation with user-visible notice

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
| High adapter error rate | > 5% errors in 5-minute window | P2 | Teams webhook |
| Adapter latency spike | p95 > 10s for any domain | P3 | Teams webhook |
| Auth failure burst | > 3 auth failures in 1 minute | P1 | Teams webhook + on-call |
| Provisioning saga failure | Any compensation event | P2 | Teams webhook |
| Circuit breaker open | Any adapter circuit opens | P1 | Teams webhook + on-call |

## 5. MTTD Targets

| Issue Class | MTTD Target | Detection Method |
|---|---|---|
| Adapter unavailable (circuit open) | < 2 minutes | Circuit breaker state change alert |
| Elevated error rate (> 5%) | < 5 minutes | Sliding window error rate dashboard |
| Auth system failure | < 2 minutes | Token acquisition failure burst alert |
| Provisioning saga compensation | < 1 minute | Real-time saga event stream |
| Performance degradation (p95 > 10s) | < 10 minutes | Latency percentile dashboard |

## 6. Infrastructure Requirements

### 6.1 Logging
- **Local:** Console logger with structured JSON output
- **Staging:** Application Insights (Azure) with correlation IDs
- **Production:** Application Insights with sampling (50% for debug, 100% for warn/error)

### 6.2 Metrics
- Custom metrics via Application Insights trackMetric API
- OpenTelemetry-compatible span context for distributed tracing

### 6.3 Environment Parity
All three environments (local, staging, prod) must have:
- Structured logging with domain/operation/correlationId fields
- Health check endpoints responding to probes
- Error alerting configured (local: console, staging/prod: Teams webhook)

---

**Approved by:**
- Architecture Lead: Approved 2026-03-16
- DevSecOps Lead: Approved 2026-03-16
- Operations Lead: Approved 2026-03-16
