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

## Part 1: Current Observability State

Verified against live repo as of 2026-03-18. This inventory establishes the baseline for gap analysis in Part 3.

### Backend Application Insights

Configured via `host.json`:
- `samplingSettings.isEnabled: true`, `maxTelemetryItemsPerSecond: 20`
- Connection string injected via `APPLICATIONINSIGHTS_CONNECTION_STRING` app setting

### Structured Logger

Custom `createLogger()` in `backend/functions/src/utils/logger.ts`:
- Emits structured JSON with `trackEvent()` and `trackMetric()` markers
- Used across 22 handler files

### Provisioning Telemetry

- **9 named events** (via `trackEvent`): ProvisioningSagaStarted, ProvisioningStepCompleted, ProvisioningStepFailed, ProvisioningStep5Deferred, ProvisioningSagaCompleted, ProvisioningSagaFailed, ProvisioningTimerStarted, ProvisioningTimerCompleted, ProvisioningTimerJobFailed
- **3 custom metrics** (via `trackMetric`): ProvisioningStepDurationMs, Step5DeferralRate, ProvisioningSagaSuccessRate
- **Correlation IDs** propagated via saga orchestrator (`correlationId` per saga run, `timerCorrelationId` per timer run)

### PWA Telemetry

None. No Application Insights SDK, no OpenTelemetry, no monitoring packages installed.

### OpenTelemetry

Not implemented on either surface. Azure Functions supports first-class OTel host enablement, but it has not been adopted.

### Health Endpoint

None verified. Not present in C1 implemented route inventory.

### Alert Rules

2 alert rules documented in PH6.14 plan (stuck provisioning run > 30 min, timer job failure). Deployment status unverified.

---

## Part 2: Target Phase 1 Instrumentation

The sections below define target instrumentation requirements for Phase 1. Items that overlap with current state (Part 1) are noted; all others represent the implementation gap to be closed.

### 2.1 Required Telemetry Events

Events are organized by Phase 1 runtime surface. Each table specifies event name, trigger condition, required payload fields, and severity. All events use the existing `ILogger.trackEvent()` contract; metrics use `ILogger.trackMetric()`. Payloads are flat `Record<string, unknown>` merged into Application Insights `customEvents` / `customMetrics` tables.

**Naming convention:** Existing provisioning events (2.1.4) retain their PascalCase names for backward compatibility. All new events use dot-separated lowercase convention (e.g., `proxy.request.start`).

#### 2.1.1 Proxy Adapter Request Lifecycle

**Scope:** Proxy route group (`proxyGet`, `proxyMutate`) and future domain adapters that call through the proxy backend. Instruments the data-access path from adapter invocation through Graph API response.

**Status:** NOT IMPLEMENTED — proxy handler currently uses `logger.info` / `logger.error` with unstructured payloads; no `trackEvent` calls exist.

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `proxy.request.start` | Proxy handler begins processing | `domain`, `routeGroup`, `operation`, `httpMethod`, `correlationId`, `requestId`, `adapterMode`, `environment` | info |
| `proxy.request.success` | Proxy handler returns 2xx | `domain`, `routeGroup`, `operation`, `correlationId`, `requestId`, `durationMs`, `statusCode`, `recordCount` | info |
| `proxy.request.error` | Proxy handler returns 4xx/5xx or throws | `domain`, `routeGroup`, `operation`, `correlationId`, `requestId`, `durationMs`, `statusCode`, `errorCode`, `failureReason` | error |
| `proxy.request.retry` | Retry triggered (when D1 retry policy is active) | `domain`, `routeGroup`, `operation`, `correlationId`, `requestId`, `retryCount`, `retryReason` | warn |
| `proxy.cache.hit` | Redis cache serves GET request | `domain`, `routeGroup`, `operation`, `correlationId`, `cacheAge`, `adapterMode` | debug |
| `proxy.cache.miss` | Cache miss; live Graph fetch needed | `domain`, `routeGroup`, `operation`, `correlationId`, `adapterMode` | debug |

**Payload field definitions:**
- `domain` — logical domain being accessed (e.g., `lead`, `project`, `estimating`); extracted from proxy path
- `routeGroup` — always `proxy` for this surface
- `operation` — specific operation (e.g., `getAll`, `getById`, `create`, `update`, `delete`)
- `adapterMode` — resolved `HBC_ADAPTER_MODE` value (`proxy`, `mock`)
- `environment` — runtime environment (`local`, `staging`, `production`)
- `recordCount` — number of records returned (list operations on success)

#### 2.1.2 Backend Route Handler Lifecycle

**Scope:** Cross-cutting handler instrumentation for ALL backend Azure Functions HTTP handlers. Provides a uniform handler-level observability envelope across all route groups: proxy, project setup requests, acknowledgments, notifications, provisioning saga admin routes, and SignalR negotiate.

**Status:** NOT IMPLEMENTED — handlers currently use ad-hoc `logger.info`/`logger.error` calls without a consistent lifecycle event envelope.

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `handler.invoke` | Azure Function handler entry | `functionName`, `routeGroup`, `httpMethod`, `correlationId`, `requestId`, `environment` | info |
| `handler.success` | Handler returns 2xx | `functionName`, `routeGroup`, `httpMethod`, `correlationId`, `requestId`, `durationMs`, `statusCode` | info |
| `handler.error` | Handler returns 4xx/5xx or throws | `functionName`, `routeGroup`, `httpMethod`, `correlationId`, `requestId`, `durationMs`, `statusCode`, `errorMessage` | error |

**Payload field definitions:**
- `functionName` — Azure Function name (e.g., `proxyGet`, `submitProjectSetupRequest`, `SendNotification`)
- `routeGroup` — logical route group from C1 catalog (`proxy`, `project-setup-requests`, `acknowledgments`, `notifications`, `provisioning-saga`, `signalr`)

**Design note:** This is the outermost instrumentation layer. Proxy requests emit both `handler.*` and the more detailed `proxy.*` events from 2.1.1. Consider implementing as middleware or a wrapper in `createLogger()` for auto-emission rather than manual `trackEvent` calls in each handler.

#### 2.1.3 Auth / OBO Token Flow

**Scope:** PWA-side MSAL token acquisition and backend-side Bearer validation plus OBO exchange. These events track the auth critical path that gates every authenticated request.

**Status:** NOT IMPLEMENTED on either surface.

**PWA auth events:**

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `auth.token.acquire` | MSAL `acquireTokenSilent` or `acquireTokenRedirect` begins | `provider` (`msal`), `scope`, `correlationId`, `adapterMode`, `environment` | info |
| `auth.token.success` | Token acquired | `provider`, `scope`, `correlationId`, `durationMs`, `adapterMode`, `environment` | info |
| `auth.token.error` | Token acquisition failed | `provider`, `scope`, `correlationId`, `durationMs`, `errorCode`, `adapterMode`, `environment` | error |

**Backend auth events:**

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `auth.bearer.validate` | Bearer token validation begins | `correlationId`, `requestId`, `environment` | info |
| `auth.bearer.success` | Bearer token validated | `correlationId`, `requestId`, `durationMs`, `environment` | info |
| `auth.bearer.error` | Bearer validation failed | `correlationId`, `requestId`, `durationMs`, `errorCode`, `environment` | error |
| `auth.obo.exchange` | OBO token exchange begins | `scope`, `correlationId`, `requestId`, `environment` | info |
| `auth.obo.success` | OBO token acquired | `scope`, `correlationId`, `requestId`, `durationMs`, `environment` | info |
| `auth.obo.error` | OBO token exchange failed | `scope`, `correlationId`, `requestId`, `durationMs`, `errorCode`, `environment` | error |

**Design note:** The previous `auth.mode.switch` event is removed. Adapter mode is a deployment-time startup concern, not a runtime auth event — see 2.1.6.

#### 2.1.4 Provisioning Saga Lifecycle

**Scope:** Saga orchestrator, step execution, compensation, and timer-based deferred Step 5 processing.

**Status:** IMPLEMENTED — this surface already emits structured telemetry via `trackEvent` and `trackMetric`. The tables below document the actual events and payloads present in code. No new events are required; this section exists for taxonomy completeness and cross-reference.

**Saga events:**

| Event | Trigger | Actual Payload | Severity | Source |
|---|---|---|---|---|
| `ProvisioningSagaStarted` | Saga `execute()` entry | `correlationId`, `projectId`, `projectNumber`, `triggeredBy`, `submittedBy` | info | saga-orchestrator.ts |
| `ProvisioningStepCompleted` | Step returns success (or skipped via idempotency) | `correlationId`, `projectId`, `projectNumber`, `stepNumber`, `stepName`, `durationMs`, `idempotentSkip` | info | saga-orchestrator.ts, handler.ts |
| `ProvisioningStepFailed` | Step fails after retry exhaustion | `correlationId`, `projectId`, `projectNumber`, `stepNumber`, `stepName`, `errorMessage`, `attempt`, `durationMs` | error | saga-orchestrator.ts, handler.ts |
| `ProvisioningStep5Deferred` | Step 5 deferred to overnight timer | `correlationId`, `projectId`, `projectNumber`, `reason` | warn | saga-orchestrator.ts, handler.ts |
| `ProvisioningSagaCompleted` | All steps finished | `correlationId`, `projectId`, `projectNumber`, `totalDurationMs`, `step5Deferred` | info | saga-orchestrator.ts |
| `ProvisioningSagaFailed` | Saga entered failure/compensation path | `correlationId`, `projectId`, `projectNumber`, `failedAtStep`, `errorMessage` | error | saga-orchestrator.ts |

**Timer events:**

| Event | Trigger | Actual Payload | Severity | Source |
|---|---|---|---|---|
| `ProvisioningTimerStarted` | Timer function entry | `timerCorrelationId`, `pendingJobCount` | info | handler.ts |
| `ProvisioningTimerCompleted` | Timer run finishes | `timerCorrelationId`, `completed`, `failed`, `totalDurationMs` | info | handler.ts |
| `ProvisioningTimerJobFailed` | Deferred job exceeds retry threshold or throws | `timerCorrelationId`, `projectId`, `projectNumber`, `step5TimerRetryCount` | error | handler.ts |

**Metrics:**

| Metric | Value | Dimensions | Source |
|---|---|---|---|
| `ProvisioningStepDurationMs` | Step wall-clock duration (ms) | `stepNumber`, `stepName`, `projectId`, `projectNumber`, `correlationId` | saga-orchestrator.ts, handler.ts |
| `Step5DeferralRate` | 1 if deferred, 0 if not | `projectId`, `projectNumber`, `correlationId` | saga-orchestrator.ts |
| `ProvisioningSagaSuccessRate` | 1 on success, 0 on failure | `projectId`, `projectNumber`, `correlationId`, `outcome` | saga-orchestrator.ts |

**Note on compensation:** Compensation logic uses `logger.warn`/`logger.error` for structured logging but does not emit a dedicated `trackEvent` for compensation start/complete. `ProvisioningSagaFailed` serves as the compensation signal. Finer-grained compensation observability would be a future enhancement.

#### 2.1.5 Notification System

**Scope:** Notification delivery pipeline — queue-based send processing, digest timer, and delivery outcomes. Covers the 7 HTTP routes + 3 non-HTTP triggers from the C1 catalog. HTTP route-level observability (getCenter, markRead, dismiss, etc.) is covered by handler lifecycle events in 2.1.2.

**Status:** NOT IMPLEMENTED — notification handlers have no `trackEvent` calls.

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `notification.send.enqueue` | Notification queued for delivery | `notificationType`, `tier`, `correlationId`, `sourceRecordId` | info |
| `notification.send.process` | Queue trigger picks up message | `notificationType`, `tier`, `correlationId`, `sourceRecordId` | info |
| `notification.send.complete` | Notification successfully delivered | `notificationType`, `tier`, `correlationId`, `durationMs`, `recipientCount` | info |
| `notification.send.error` | Notification delivery failed | `notificationType`, `tier`, `correlationId`, `durationMs`, `errorCode`, `failureReason` | error |
| `notification.digest.trigger` | Hourly digest timer fires | `correlationId`, `pendingCount` | info |
| `notification.digest.complete` | Digest processing finished | `correlationId`, `durationMs`, `processedCount` | info |
| `notification.digest.error` | Digest processing failed | `correlationId`, `durationMs`, `errorCode`, `failureReason` | error |

**Payload field definitions:**
- `notificationType` — notification event type string (e.g., `provisioning.started`, `provisioning.completed`)
- `tier` — delivery tier (`in-app`, `email`, `both`)
- `recipientCount` — number of recipients the notification was sent to

#### 2.1.6 Adapter-Mode Startup / Environment Classification

**Scope:** Per B3 Layer 2, the startup guard must emit the resolved adapter mode and environment for observability. Single event emitted once per cold start on each surface (PWA and backend).

**Status:** NOT IMPLEMENTED — depends on B3 Layer 2 startup guard.

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `startup.mode.resolved` | Cold start, after adapter mode resolution | `adapterMode`, `environment`, `surface` (`pwa` or `backend`), `timestamp` | info |

**Design note:** This event replaces the previous `auth.mode.switch`. Adapter mode is a deployment-time concern, not a runtime toggle. If the resolved mode is unexpected for the environment (e.g., `mock` in production), the startup guard itself will throw — this event provides the observability trail for normal operation.

#### 2.1.7 Deployment / Smoke-Test Verification

**Scope:** Lightweight signals emitted during deployment verification to confirm production activation confidence. Maps to CI Stage 4 smoke tests and post-deployment health checks.

**Status:** NOT IMPLEMENTED — smoke tests exist in CI but do not emit telemetry to Application Insights.

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `deploy.smoke.start` | Smoke test suite begins | `environment`, `version`, `correlationId` | info |
| `deploy.smoke.pass` | Individual check passes | `environment`, `version`, `checkName`, `durationMs` | info |
| `deploy.smoke.fail` | Individual check fails | `environment`, `version`, `checkName`, `durationMs`, `failureReason` | error |

**Design note:** These events are emitted by the smoke-test runner, not by the application itself. They provide a queryable record of deployment verification outcomes in Application Insights alongside the application telemetry they validate.

#### 2.1.8 Future-Phase Placeholders

The following adapter surfaces will require their own telemetry events when their respective phases begin. No detailed event tables are provided — they will be specified in phase-specific instrumentation plans.

- **SharePoint adapter events** — PnPjs calls, SPFx context, SharePoint list/library operations. Deferred to future SharePoint engineering phase.
- **Direct API adapter events** — Azure SQL operations, connection pool metrics. Deferred to future API phase.
- **PWA client-side performance events** — route navigation timing, component render metrics, error boundary captures. Separate concern from backend instrumentation.

---

### 2.2 Health Checks and Circuit Breakers

#### 2.2.1 Health Check Endpoints

- `/api/health` — Azure Functions health probe (returns 200 if operational). **Note:** Not currently verified in repo — see C1 catalog. Must be implemented or an alternative health signal defined.
- Proxy adapter health: test call to a known backend route
- Graph adapter health: scoped dependency probe (specific Graph endpoint TBD — `/me` is a delegated-user scenario and may not be appropriate for service health)

#### 2.2.2 Circuit Breaker Strategy

**Note:** Retry and circuit-breaker policy are owned by P1-D1 (Write Safety, Retry, and Recovery). The parameters below are target behavior pending D1 delivery. Proxy adapters do not implement their own retry logic per B1.

- **Threshold:** 5 consecutive failures or 50% failure rate in 60-second window
- **Open duration:** 30 seconds before half-open probe
- **Half-open:** Single test request; success closes circuit, failure re-opens
- **Fallback:** Return cached data if available; otherwise graceful degradation with user-visible notice

---

### 2.3 Monitoring Dashboards

#### 2.3.1 Required Dashboards

| Dashboard | Audience | Key Metrics |
|---|---|---|
| Adapter Health | DevOps | Request rate, error rate, p50/p95/p99 latency per domain |
| Auth & Token | Security | Token acquisition rate, failure rate, mode distribution |
| Provisioning | Operations | Saga success rate, step duration heatmap, compensation events |
| Error Budget | Leadership | Error rate vs SLO, burn rate, time-to-breach projection |

#### 2.3.2 Alert Templates

| Alert | Condition | Severity | Notification |
|---|---|---|---|
| High adapter error rate | > 5% errors in 5-minute window | P2 | Teams webhook (see note below) |
| Adapter latency spike | p95 > 10s for any domain | P3 | Teams webhook |
| Auth failure burst | > 3 auth failures in 1 minute | P1 | Teams webhook + on-call |
| Provisioning saga failure | Any compensation event | P2 | Teams webhook |
| Circuit breaker open | Any adapter circuit opens | P1 | Teams webhook + on-call |

**Alert channel note:** "Teams webhook" refers to the supported alert delivery mechanism (Incoming Webhooks or Power Automate Workflows). The specific mechanism must be confirmed — Office 365 connectors are deprecated; Microsoft recommends Workflows for new integrations.

---

### 2.4 MTTD Targets

| Issue Class | MTTD Target | Detection Method |
|---|---|---|
| Adapter unavailable (circuit open) | < 2 minutes | Circuit breaker state change alert |
| Elevated error rate (> 5%) | < 5 minutes | Sliding window error rate dashboard |
| Auth system failure | < 2 minutes | Token acquisition failure burst alert |
| Provisioning saga compensation | < 1 minute | Real-time saga event stream |
| Performance degradation (p95 > 10s) | < 10 minutes | Latency percentile dashboard |

---

## Part 3: Observability Delta Matrix

Maps current state (Part 1) against target requirements (Part 2) to identify the implementation gap for Phase 1.

| Area | Current State | Target | Gap |
|---|---|---|---|
| Backend logging | Custom structured logger, 22 files | Structured logging across all domain route handlers | Extend to new Phase 1 domain handlers |
| Backend AI sampling | host.json sampling (20 items/sec) | Severity-based sampling (100% warn/error) | Sampling config update needed |
| Proxy adapter telemetry | `logger.info`/`logger.error` only, no `trackEvent` | `proxy.request.*` + `proxy.cache.*` per 2.1.1 | Full implementation needed |
| Handler lifecycle telemetry | No uniform handler instrumentation | `handler.invoke`/`success`/`error` for all HTTP handlers per 2.1.2 | Full implementation needed |
| Auth telemetry | Not implemented on either surface | PWA `auth.token.*` + backend `auth.bearer.*`/`auth.obo.*` per 2.1.3 | Full implementation needed |
| Provisioning telemetry | 9 events, 3 metrics, correlation IDs (2.1.4) | Complete — already meets spec | No gap |
| Notification telemetry | No `trackEvent` calls in notification handlers | `notification.send.*` + `notification.digest.*` per 2.1.5 | Full implementation needed |
| Adapter-mode startup signal | Not implemented | `startup.mode.resolved` per 2.1.6 (depends on B3 Layer 2) | Full implementation needed |
| Deployment verification signals | Smoke tests in CI, no App Insights emission | `deploy.smoke.start`/`pass`/`fail` per 2.1.7 | Full implementation needed |
| Health endpoint | Not implemented | `/api/health` returning 200 | Implementation needed (see B3) |
| PWA telemetry | None | Adapter-mode startup signal, client error tracking | Full implementation needed |
| OpenTelemetry | None | OTel-compatible span context | Deferred — Azure Functions supports it but not yet adopted |
| Dashboards | None verified | 4 dashboards (Adapter, Auth, Provisioning, Error Budget) | Full implementation needed |
| Alerts | 2 documented (PH6.14) | 5 alert rules | 3 additional rules needed |
| Alert channel | "Teams webhook" documented | Specific mechanism confirmed | Workflows recommended — mechanism must be confirmed |

---

## Part 4: Infrastructure Requirements

### 4.1 Logging

- **Local:** Console logger with structured JSON output
- **Staging:** Application Insights (Azure) with correlation IDs
- **Production:** Application Insights with sampling — current repo: `host.json` sets `maxTelemetryItemsPerSecond: 20`; target sampling strategy (severity-based) requires further configuration

### 4.2 Metrics

- Custom metrics via Application Insights trackMetric API
- OpenTelemetry-compatible span context for distributed tracing — **target behavior**; current repo does not have OTel host enablement. Azure Functions now supports first-class OpenTelemetry; migration path should be defined as a follow-on.

### 4.3 Environment Parity

All environments (local, staging, production) must have:
- Structured logging with domain/operation/correlationId fields
- Health check endpoints or equivalent readiness signals
- Error alerting configured (local: console, staging/production: Teams webhook or equivalent)
