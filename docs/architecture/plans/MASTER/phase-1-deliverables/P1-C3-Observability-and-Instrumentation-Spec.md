# P1-C3: Observability and Instrumentation Spec

| Field | Value |
|---|---|
| **Doc ID** | P1-C3 |
| **Phase** | Phase 1 |
| **Workstream** | C — Backend Service Contracts and Hardening |
| **Document Type** | Instrumentation Specification |
| **Owner** | Backend Services Team / DevOps |
| **Update Authority** | C-workstream lead; changes require review by DevOps and B-workstream |
| **Status** | Aligned — repo-truth verified 2026-03-18; execution-ready |
| **Last Reviewed Against Repo Truth** | 2026-03-18 |
| **References** | P1-B2 (Adapter Completion Backlog), P1-B3 (Mock Isolation Policy), P1-C1 (Backend Service Contract Catalog), P1-D1 (Write Safety), P1-E1 (Contract Testing) |

**Note:** This document was previously identified as P1-C1, which collided with the backend service contract catalog. Re-identified as P1-C3.

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
- Integration model: Azure Functions host built-in forwarding via `context.log()` — no direct `applicationinsights` npm SDK or `TelemetryClient`

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

Not implemented on either surface. No OTel packages, configuration, or SDK usage in backend or PWA.

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

### 2.2 Health Checks, Dependency Probes, and Resilience Observability

#### 2.2.1 Platform / App Health Endpoint

**`GET /api/health`** — **NOT IMPLEMENTED.** Not present in the C1 implemented route inventory (explicitly removed as unverified). This is a **target contract / missing implementation dependency**.

- **Target behavior:** Returns 200 with `{ status: "healthy", environment, timestamp }` if the Azure Functions host is operational
- **Purpose:** Azure App Service health probe target and external uptime monitor endpoint
- **Implementation note:** May require backend entrypoint restructuring. Ownership should be assigned — likely B3 (environment/bootstrap) or a standalone backend task. This spec defines the observability requirement; it does not own the implementation.

#### 2.2.2 Dependency Probes

Dependency probes verify that downstream services the backend relies on are reachable. These are distinct from the platform health endpoint (2.2.1), which checks that the Azure Functions host itself is operational.

| Probe | Target | Method | Assumptions | Status |
|---|---|---|---|---|
| Graph API reachability | Microsoft Graph | `GET /organization` with app-only token, or lightweight endpoint that does not require delegated user context | Requires app-registration with `Organization.Read.All` or equivalent minimal scope | NOT IMPLEMENTED — target |
| Redis cache reachability | Azure Cache for Redis | `PING` command via existing Redis client | Backend proxy handler already uses Redis for cache; probe reuses existing connection | NOT IMPLEMENTED — target |
| Azure SQL reachability | Azure SQL (future API phase) | Deferred — no direct SQL dependency in Phase 1 proxy lane | N/A | Future phase |

**Design note on Graph probe:** The previous spec listed `/me` as a Graph health probe. `/me` requires a delegated user token (OBO flow) and cannot be called from a background health probe without an active user session — it is inappropriate for service health verification. Use an app-only-scoped endpoint like `/organization` with minimal permissions, or verify that the Graph base URL returns a non-5xx response.

#### 2.2.3 Circuit Breaker — Governance and Observability

**Current behavior:**

No circuit breaker is implemented. Proxy adapters pass requests through to Graph API without retry or circuit logic. This is by design — B1 explicitly defers retry to D1 as a transport-layer concern (P1-B1 Decision: "No retry in B1").

**Target behavior (owned by P1-D1):**

D1 will deliver `withRetry()` wrapping `ProxyHttpClient` with configurable retry and circuit-breaker policies. This spec does not prescribe circuit-breaker parameters (threshold, open duration, half-open probe behavior, fallback strategy) — those are D1 implementation decisions.

- **Reference:** P1-D1 (Write Safety, Retry, and Recovery), P1-B1 (Proxy Adapter Implementation Plan)
- **Dependency:** D1 delivery is a blocking dependency for production activation (`PROD_ACTIVE` gate per B2)

**Observability requirements for circuit-breaker state (C3 owned):**

When D1 implements circuit-breaker logic, the following telemetry events MUST be emitted using `ILogger.trackEvent()`:

| Event | Trigger | Required Payload | Severity |
|---|---|---|---|
| `circuit.state.change` | Circuit transitions between closed/open/half-open | `domain`, `routeGroup`, `previousState`, `newState`, `correlationId`, `environment`, `failureCount`, `windowDurationMs` | warn |
| `circuit.fallback.used` | Fallback behavior activated (cached data or degraded response) | `domain`, `routeGroup`, `correlationId`, `fallbackType` (`cache` or `degraded`), `environment` | warn |

These events feed the "Circuit breaker open" alert (2.3.2) and the < 2 minute MTTD target for adapter unavailability (2.4).

---

### 2.3 Monitoring, Dashboards, and Alerting

#### 2.3.1 Required Dashboards

| Dashboard | Owner / Audience | Source Signals (AI tables) | Required Dimensions | B2 Gate Evidence |
|---|---|---|---|---|
| Adapter Health | DevOps | `proxy.request.*` events (2.1.1), `handler.*` events (2.1.2) from `customEvents` | `domain`, `routeGroup`, `operation`, `statusCode`, `environment` | Proxy adapter `PROD_ACTIVE` gate: error rate < 5%, p95 latency < 10s |
| Auth & Token | Security / DevOps | `auth.token.*`, `auth.bearer.*`, `auth.obo.*` events (2.1.3) from `customEvents` | `provider`, `scope`, `errorCode`, `environment` | Auth flow verified for production activation |
| Provisioning | Operations | `ProvisioningSaga*`, `ProvisioningTimer*` events + `ProvisioningStepDurationMs`, `ProvisioningSagaSuccessRate` metrics (2.1.4) from `customEvents` + `customMetrics` | `projectId`, `stepName`, `correlationId`, `outcome` | Provisioning saga success rate ≥ 95% over 7-day window |
| Error Budget | Leadership / SRE | Aggregate error counts from `handler.error` events (2.1.2); SLO definitions from operational agreement | `routeGroup`, `environment`, time window | Overall error rate vs SLO; burn rate projection |

**Implementation note:** All dashboards are Application Insights Workbooks or Azure Monitor dashboards querying the `customEvents`, `customMetrics`, and `traces` tables. KQL queries should be developed alongside telemetry implementation and stored in version control.

#### 2.3.2 Alert Rules

| Alert | Owner | Source Signal | Condition | Severity | Escalation Path | Response Reference |
|---|---|---|---|---|---|---|
| High adapter error rate | DevOps on-call | `proxy.request.error` count / total `proxy.request.*` events | > 5% error rate in 5-min sliding window | P2 | Alert channel → DevOps on-call | Check domain-specific error codes, verify Graph API status, check Redis connectivity |
| Adapter latency spike | DevOps on-call | `proxy.request.success` event `durationMs` field | p95 > 10s for any domain in 5-min window | P3 | Alert channel → DevOps on-call | Check Graph API latency, Redis cache hit rate, function cold start frequency |
| Auth failure burst | Security + DevOps on-call | `auth.token.error` + `auth.bearer.error` + `auth.obo.error` count | > 3 auth failures in 1 minute from any surface | P1 | Alert channel → on-call → security escalation | Check MSAL config, verify Azure AD service health, check OBO scope permissions |
| Provisioning saga failure | Operations on-call | `ProvisioningSagaFailed` event (2.1.4) | Any `ProvisioningSagaFailed` event emitted | P2 | Alert channel → operations on-call | Check `failedAtStep`, review step-specific error, assess compensation outcome |
| Circuit breaker open | DevOps on-call | `circuit.state.change` event where `newState = 'open'` (2.2.3) | Any circuit opens | P1 | Alert channel → on-call → incident escalation | Check downstream dependency health, review failure pattern, assess fallback behavior |

**Circuit breaker alert note:** Activates only after D1 delivers circuit-breaker implementation. Currently a placeholder — no circuit breaker exists to trigger it.

**Runbook note:** Full incident runbooks are out of scope for this spec. The "Response Reference" column provides initial triage guidance. Runbooks should be developed as a companion deliverable during telemetry implementation.

#### 2.3.3 Alert Notification Channel

**Recommended mechanism:** Microsoft Teams Workflows (Power Automate) posting to a dedicated HB Intel alerts channel.

**Rationale:** Office 365 Incoming Webhooks (connectors) are deprecated by Microsoft. Teams Workflows via Power Automate is the supported replacement for programmatic message delivery to Teams channels. Workflows support:

- Adaptive Card payloads (structured alert formatting with severity, source, and action links)
- Rate limiting appropriate for alert volumes (not a concern at Phase 1 scale)
- Azure Monitor native integration via Action Groups → Logic App / Workflow trigger

**Implementation path:**

1. Create an Azure Monitor Action Group for HB Intel alerts
2. Configure Action Group to trigger a Teams Workflow (Power Automate) for channel delivery
3. For P1 alerts (Auth failure burst, Circuit breaker open): add a secondary action to page the on-call engineer (PagerDuty, Opsgenie, or equivalent — mechanism TBD)
4. Use Adaptive Card template for alert messages including: alert name, severity, condition detail, dashboard link, timestamp

**Environment consistency requirement:** The alert notification transport must be consistent across staging and production. Staging alerts should use a separate Teams channel (e.g., `#hb-intel-alerts-staging`) with the same Workflow mechanism to validate alert delivery before production activation.

**Open decision:** On-call paging mechanism (PagerDuty, Opsgenie, or native Azure Monitor SMS/email) is not yet selected. This must be confirmed before P1 alerts requiring on-call escalation can be fully operational.

---

### 2.4 MTTD Targets

| Issue Class | MTTD Target | Source Signal | Alert Owner | Detection Evidence |
|---|---|---|---|---|
| Adapter unavailable (circuit open) | < 2 minutes | `circuit.state.change` event (2.2.3) | DevOps on-call | Circuit breaker open alert (2.3.2) — activates after D1 delivery |
| Elevated error rate (> 5%) | < 5 minutes | `proxy.request.error` / total `proxy.request.*` ratio (2.1.1) | DevOps on-call | High adapter error rate alert (2.3.2); Adapter Health dashboard (2.3.1) |
| Auth system failure | < 2 minutes | `auth.token.error` + `auth.bearer.error` + `auth.obo.error` events (2.1.3) | Security + DevOps on-call | Auth failure burst alert (2.3.2) |
| Provisioning saga compensation | < 1 minute | `ProvisioningSagaFailed` event (2.1.4) | Operations on-call | Provisioning saga failure alert (2.3.2); Provisioning dashboard (2.3.1) |
| Performance degradation (p95 > 10s) | < 10 minutes | `proxy.request.success` event `durationMs` (2.1.1) | DevOps on-call | Adapter latency spike alert (2.3.2); Adapter Health dashboard (2.3.1) |
| Unexpected adapter mode in production | < 5 minutes | `startup.mode.resolved` event (2.1.6) where `adapterMode ≠ 'proxy'` | DevOps on-call + B3 escalation | Runtime telemetry alert (B3 Layer 5); SEV-1 incident response |

**MTTD validation:** MTTD targets are validated during `PROD_ACTIVE` gate progression by injecting synthetic failure conditions in staging and measuring time-to-detection against the target thresholds. This is a staging-environment exercise, not a production test.

---

### 2.5 Observability Gate Evidence Requirements

This section maps C3 observability deliverables to B2 gate progression. Each gate lists the observability evidence required for advancement. References: P1-B2 (Adapter Completion Backlog), P1-B3 (Mock Isolation Policy).

**`CODE_COMPLETE_MOCK`**

No observability evidence required — mock-lane testing only.

**`CONTRACT_ALIGNED`**

No observability evidence required — contract/schema alignment only.

**`INTEGRATION_READY`**

- `startup.mode.resolved` event (2.1.6) verified in deployment logs — confirms adapter mode and environment classification
- `APPLICATIONINSIGHTS_CONNECTION_STRING` configured and telemetry flowing to AI workspace
- Evidence: Application Insights log query showing `startup.mode.resolved` event with correct `adapterMode` and `environment`

**`STAGING_READY`**

- `handler.*` lifecycle events (2.1.2) emitting for all exercised route groups in staging
- `proxy.request.*` events (2.1.1) emitting for proxy adapter calls in staging
- `auth.bearer.*` / `auth.obo.*` events (2.1.3) emitting for authenticated requests in staging
- E1 contract test runs observable in Application Insights (test requests visible via handler telemetry)
- Evidence: AI log query showing handler/proxy/auth events during E1 test execution in staging

**`PROD_ACTIVE`** (B2: "Observability: Monitoring, error reporting, and alerting confirmed")

- All `STAGING_READY` evidence verified against production environment
- Dashboards operational: all 4 dashboards (2.3.1) populated with production telemetry
- Alert rules active: all 5 alert rules (2.3.2) configured in Azure Monitor with Action Group delivery
- Alert channel verified: at least one test alert successfully delivered via Teams Workflow (2.3.3)
- Health probe configured: `/api/health` (2.2.1) responding or alternative readiness signal confirmed
- Smoke test evidence: `deploy.smoke.pass` events (2.1.7) recorded in AI for production deployment
- Startup guard evidence: `startup.mode.resolved` event confirms `adapterMode: 'proxy'` and `environment: 'Production'` (B3 Layer 2/5)
- Evidence: Links to production dashboard, Action Group configuration, smoke test AI query, startup log query

#### Mock-Mode Evidence Policy

Per B3 staged exception model: while a staging mock exception is active, `STAGING_READY` and `PROD_ACTIVE` observability evidence gathered under mock mode does **NOT** count toward gate progression. Observability evidence must be gathered against real adapter traffic to be valid for gate advancement. Production has no mock exception path — mock detected in production is a SEV-1 incident (B3).

#### Cross-Workstream Ownership for Observability Validation

| Concern | Owner | Gate Dependency |
|---|---|---|
| Telemetry event implementation (2.1) | C-workstream (backend), B-workstream (adapter integration) | `STAGING_READY` |
| Health endpoint implementation (2.2.1) | TBD (likely B3 or standalone backend task) | `PROD_ACTIVE` |
| Circuit-breaker telemetry (2.2.3) | D1-workstream (implementation), C-workstream (observability contract) | `PROD_ACTIVE` |
| Dashboard creation (2.3.1) | DevOps / C-workstream | `PROD_ACTIVE` |
| Alert rule configuration (2.3.2) | DevOps | `PROD_ACTIVE` |
| Alert channel setup (2.3.3) | DevOps | `PROD_ACTIVE` |
| Smoke test telemetry (2.1.7) | DevOps / CI pipeline owner | `PROD_ACTIVE` |
| Startup guard + telemetry (2.1.6) | B3-workstream (guard), C-workstream (event contract) | `INTEGRATION_READY` |
| E1 contract test observability | E1-workstream (tests), C-workstream (handler telemetry) | `STAGING_READY` |

---

## Part 3: Observability Delta Matrix

Maps current state (Part 1) against target requirements (Part 2) to identify the implementation gap for Phase 1.

| Area | Current State | Target | Gap |
|---|---|---|---|
| Backend logging | Custom structured logger, 22 files | Structured logging across all domain route handlers | Extend to new Phase 1 domain handlers |
| Backend AI sampling | Adaptive sampling at 20 items/sec; no severity filtering | Exception exclusion + log-level config per 4.2; full severity-based sampling deferred (requires AI SDK) | `host.json` update needed |
| Proxy adapter telemetry | `logger.info`/`logger.error` only, no `trackEvent` | `proxy.request.*` + `proxy.cache.*` per 2.1.1 | Full implementation needed |
| Handler lifecycle telemetry | No uniform handler instrumentation | `handler.invoke`/`success`/`error` for all HTTP handlers per 2.1.2 | Full implementation needed |
| Auth telemetry | Not implemented on either surface | PWA `auth.token.*` + backend `auth.bearer.*`/`auth.obo.*` per 2.1.3 | Full implementation needed |
| Provisioning telemetry | 9 events, 3 metrics, correlation IDs (2.1.4) | Complete — already meets spec | No gap |
| Notification telemetry | No `trackEvent` calls in notification handlers | `notification.send.*` + `notification.digest.*` per 2.1.5 | Full implementation needed |
| Adapter-mode startup signal | Not implemented | `startup.mode.resolved` per 2.1.6 (depends on B3 Layer 2) | Full implementation needed |
| Deployment verification signals | Smoke tests in CI, no App Insights emission | `deploy.smoke.start`/`pass`/`fail` per 2.1.7 | Full implementation needed |
| Platform health endpoint | Not implemented; removed from C1 catalog | `GET /api/health` returning 200 per 2.2.1 | Target contract — implementation and ownership TBD |
| Dependency probes | Not implemented | Graph + Redis reachability probes per 2.2.2 | Full implementation needed |
| Circuit-breaker telemetry | No circuit breaker exists (D1 not delivered) | `circuit.state.change` + `circuit.fallback.used` per 2.2.3 | Blocked on D1 delivery |
| PWA telemetry | None | `startup.mode.resolved` (2.1.6) + `auth.token.*` (2.1.3); client-side performance deferred (2.1.8) | Full implementation needed |
| OpenTelemetry | None — zero packages or config | Not a Phase 1 requirement; future migration path defined in 4.5 | Deferred to post-Phase 1 workstream |
| Dashboards | None verified | 4 AI Workbooks with source signals and dimensions per 2.3.1 | Full implementation needed |
| Alerts | 2 rules documented (PH6.14); no Action Group | 5 alert rules with owner, source signal, and escalation per 2.3.2 | 3 additional rules + Action Group needed |
| Alert channel | No configured delivery mechanism | Teams Workflows via Action Group per 2.3.3; on-call paging mechanism TBD | Workflow setup + channel creation needed |
| Gate evidence | No observability evidence mapped to B2 gates | Evidence requirements per gate per 2.5; mock-mode policy stated | Full mapping needed |

---

## Part 4: Infrastructure Requirements

### 4.1 Phase 1 Telemetry Backend: Application Insights via Azure Functions Host

**Primary telemetry path for Phase 1:** Azure Functions built-in Application Insights integration. All telemetry flows through the Functions host — the backend does NOT use the `applicationinsights` npm SDK directly or instantiate a `TelemetryClient`.

**How it works:**

- `createLogger(context)` emits structured JSON via `context.log()`, `context.warn()`, `context.error()`
- The Azure Functions host forwards these to Application Insights based on `host.json` configuration
- Custom events use `_telemetryType: 'customEvent'` markers; custom metrics use `_telemetryType: 'customMetric'`
- Correlation IDs are application-level (`correlationId` property in event payloads), not W3C trace context

This is intentional for Phase 1: the Functions host integration is zero-dependency, requires no additional npm packages, and surfaces telemetry in Application Insights `traces`, `customEvents`, and `customMetrics` tables.

### 4.2 Sampling Configuration

**Current (`host.json`):**

```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  }
}
```

This is Azure's adaptive sampling — it rate-limits telemetry to 20 items/second across all severity levels. It does NOT provide severity-based filtering.

**Target Phase 1 configuration:**

```json
{
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20,
        "excludedTypes": "Exception"
      }
    },
    "logLevel": {
      "default": "Information",
      "Host.Results": "Warning",
      "Function": "Information"
    }
  }
}
```

**Configuration delta required:**

- Add `excludedTypes: "Exception"` to ensure exceptions are never sampled out
- Add `logLevel` section to control verbosity by category
- Full severity-based sampling (100% capture of warn/error, reduced capture of info/debug) requires the Application Insights SDK with a custom `ITelemetryProcessor` — this is a post-Phase 1 enhancement, not achievable through `host.json` alone

### 4.3 Correlation and Tracing

**Current behavior:**

- Application-level correlation via manual `correlationId` properties in `trackEvent`/`trackMetric` payloads
- No W3C trace context propagation (`traceparent`/`tracestate` headers)
- No distributed tracing spans connecting PWA → backend → Graph API

**Phase 1 posture:**

- Continue using application-level correlation IDs — sufficient for saga tracing, request correlation, and triage
- Azure Functions host automatically assigns `operation_Id` to Application Insights records within a single function invocation, providing basic request-level correlation
- Cross-service distributed tracing (PWA → backend → Graph) is NOT a Phase 1 requirement

### 4.4 Metrics

- Custom metrics via `ILogger.trackMetric()` — surfaces in Application Insights `customMetrics` table
- Queryable by dimension properties (e.g., `projectId`, `stepName`, `correlationId`)
- No Prometheus/OpenMetrics endpoint — not needed for Phase 1

### 4.5 OpenTelemetry — Future Direction

OpenTelemetry is NOT part of Phase 1. Current state: zero OTel packages, configuration, or SDK usage on either surface.

Azure Functions now supports first-class OTel host enablement (via `OTEL_EXPORTER_OTLP_ENDPOINT` and the Azure Monitor OpenTelemetry Exporter).

**Migration path (post-Phase 1):**

- Replace `context.log()` telemetry path with OTel SDK spans and metrics
- Enable W3C trace context propagation for distributed tracing across PWA → backend → Graph
- Adopt Azure Monitor OpenTelemetry Exporter as the Application Insights bridge
- The `ILogger` interface can be preserved as a facade — the underlying implementation would switch from `context.log()` to OTel span/event emission
- This migration should be planned as a dedicated workstream, not incrementally mixed into Phase 1 work

### 4.6 Environment Parity

| Concern | Local | Staging | Production |
|---|---|---|---|
| Structured logging | Console JSON output via `context.log()` | Application Insights | Application Insights |
| Sampling | None (all telemetry captured) | Adaptive (20 items/sec) | Adaptive (20 items/sec) + exception exclusion (target) |
| Correlation | Application-level `correlationId` | Application-level `correlationId` + AI `operation_Id` | Same as staging |
| Alerting | Console output | Teams Workflow via Action Group (target) | Teams Workflow via Action Group (target) |
| Health probes | Manual verification | Azure App Service health probe (target) | Azure App Service health probe (target) |
