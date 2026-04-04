# Admin SPFx IT Control Center — Phase 13 Operational Doctrine

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-07 — Phase 13 Operational Doctrine and Service Boundaries
**Scope:** Operational boundaries, service dependencies, degraded mode, change discipline
**Evidence base:** P13-01 through P13-06

---

## 1. Purpose

This document defines the operational doctrine for running the Admin SPFx IT Control Center in production. It establishes service boundaries, dependency expectations, degraded-mode behavior, change discipline, and explicit no-go behaviors.

This is an operations-focused document. It does not restate the target architecture. For architecture, see the end-state plan. For support ownership, see the P13-04 support model. For specific procedures, see the runbook set (P13-05, P13-06).

---

## 2. Operational boundary model

The Admin IT Control Center operates across three boundaries with distinct operational responsibilities.

### 2.1 Boundary definitions

| Boundary | What it includes | Operational owner | Change authority |
|----------|-----------------|-------------------|-----------------|
| **SPFx operator console** | `apps/admin` WebPart, route-based UI, client-side polling, lane navigation | T2 (Platform Engineering) deploys; T1 (Operator) uses | Code changes via git + CI/CD only |
| **Privileged backend** | `backend/functions` Azure Functions, API endpoints, durable stores, timer functions, saga orchestrator | T2 deploys and configures; T3 (IT) manages infrastructure | Code changes via git + CI/CD; config via Azure Portal (T2/T3) |
| **External platform services** | SharePoint Online, Entra ID, Microsoft Graph, Azure Table Storage, Application Insights, Teams Webhooks, Azure SignalR | T3 (IT) manages; T2 consumes | Changes via Azure Portal / SharePoint Admin Center (T3) |

### 2.2 Boundary rules

1. **The SPFx console is an operator surface, not a control plane.** It displays information, triggers actions, and collects operator input. It does NOT execute privileged logic directly. All privileged operations flow through the backend.

2. **The backend is the execution boundary.** Provisioning, identity operations, audit writes, evidence assembly, and permission enforcement happen in the backend, not in the browser.

3. **External services are consumed, not owned.** The Admin IT Control Center depends on SharePoint, Entra ID, Graph, and Azure services but does not control their availability, policy, or configuration beyond what is granted via managed identity and per-site permissions.

4. **No boundary leakage.** Do not move privileged logic into the SPFx console for convenience. Do not bypass the backend API to write directly to Table Storage from the client. Do not embed tenant-admin operations in the operator console.

---

## 3. Service dependency map

### 3.1 Runtime dependencies

```
┌─────────────────────────────────────────────┐
│           SharePoint Online                 │
│  ┌───────────────────────────────────────┐  │
│  │  Admin SPFx WebPart (apps/admin)      │  │
│  │  - Lane navigation, operator UI       │  │
│  │  - Alert polling (30s)                │  │
│  │  - Probe polling (15min)              │  │
│  └──────────────┬────────────────────────┘  │
│                 │ HTTPS (JWT bearer)         │
└─────────────────┼───────────────────────────┘
                  │
    ┌─────────────▼─────────────────────┐
    │  Azure Functions (backend)        │
    │  - Admin Control Plane host       │
    │  - Project Setup host             │
    │  - 40+ API endpoints              │
    │  - Timer functions (2)            │
    │  - Saga orchestrator              │
    └──┬────┬────┬────┬────┬────┬───────┘
       │    │    │    │    │    │
       ▼    ▼    ▼    ▼    ▼    ▼
    Table  Entra Graph  SP  App   Teams
    Store  ID    API   API  Insights Webhooks
```

### 3.2 Dependency criticality

| Dependency | If unavailable | Operational impact | Compensating control |
|-----------|---------------|-------------------|---------------------|
| SharePoint Online | SPFx app does not render | **Total** — no operator access | None; wait for SharePoint recovery |
| Entra ID | JWT validation fails; all auth broken | **Total** — no authenticated API calls | Platform operational runbook Alert 1 |
| Azure Table Storage | No durable writes; reads serve stale cache | **Severe** — operations degrade progressively | In-memory caches serve stale data temporarily; fire-and-forget emitters do not cascade |
| Microsoft Graph | Group/user operations fail | **Partial** — provisioning and identity blocked; core admin console still operational | Saga retry with exponential backoff; failure classification guides operator |
| Application Insights | Telemetry lost; KQL queries return nothing | **Observability blind** — system runs but operators lose visibility | In-app alert/probe/error surfaces still function independently |
| Teams Webhooks | Alert notifications not delivered | **Notification blind** — alerts fire but no human notification | Delivery tracking (P12-09) records failures; operators can check Health dashboard directly |
| Azure SignalR | No real-time push | **Minor** — polling (30s/15min) compensates | Deferred; mock in place |

---

## 4. Degraded mode expectations

### 4.1 Recognized degraded states

| State | Trigger | What still works | What does not | Operator action |
|-------|---------|-----------------|---------------|----------------|
| **Backend unreachable** | Function App down, network issue, auth failure | SPFx console renders with cached data; static navigation works | Polling returns errors; no new data; no action execution | Check Health dashboard; escalate to T2 per incident triage runbook |
| **Storage unavailable** | Table Storage outage or access revoked | API responds; reads return cached/empty; fire-and-forget writes fail silently | No durable persistence; runs not recorded; alerts not stored | Escalate to T2/T3; service recovery R4 |
| **Graph unavailable** | Graph API outage or permission revoked | Core console, provisioning oversight, error log, health dashboard | Provisioning saga fails at group/permission steps; identity operations blocked | Escalate to T3; retry when Graph recovers |
| **Observability blind** | App Insights unavailable or misconfigured | All operational surfaces; alerts/probes still poll and display | KQL queries empty; no telemetry for diagnostics; alert rules (if deployed) stop evaluating | Escalate to T2; rely on in-app surfaces for monitoring |
| **Notification blind** | Teams webhook unavailable or misconfigured | Alerts still fire and display in Health dashboard | No proactive notification to operators | T1 must monitor Health dashboard directly; escalate to T2 for webhook recovery (R6) |
| **Partial monitor coverage** | 3 monitors are stubs (Wave 0 deferral) | 3 live monitors detect provisioning anomalies | No detection for permission anomalies, upcoming expirations, stale records | Known limitation; operators monitor manually for these categories |

### 4.2 Degraded mode discipline

1. **Acknowledge the degraded state explicitly.** Do not pretend the system is fully operational when it is not.
2. **Document the degradation** in the incident log with start time, affected capability, and known cause.
3. **Increase manual monitoring** for capabilities that lost automated coverage.
4. **Do not attempt workarounds that bypass security boundaries.** A degraded state does not authorize breaking the operational boundary model.
5. **Restore normal operations before expanding scope.** Do not deploy new features or expand admin domains while operating in a degraded state.

---

## 5. Operator-console vs backend responsibilities in operations

### 5.1 What the operator console (SPFx) does

| Responsibility | How | Operational constraint |
|---------------|-----|----------------------|
| Displays operational state | Polls backend APIs at configured intervals | Read-only; does not modify backend state directly |
| Collects operator actions | Retry, acknowledge, resolve, escalate, force-state (expert) | Every action is an API call to the backend; the backend validates permissions and executes |
| Renders alerts, probes, errors | Fetches from backend observability APIs | In-memory cache; durable state lives in backend |
| Provides lane-based navigation | TanStack Router with lazy loading | No privileged routing; permission guard prevents unauthorized access |
| Manages client-side polling lifecycle | Starts/stops polling on mount/unmount | Skips gracefully if backend URL not configured |

### 5.2 What the backend does

| Responsibility | How | Operational constraint |
|---------------|-----|----------------------|
| Executes provisioning saga | 7-step orchestration with compensation | Validates prerequisites before execution; fails safely with classification |
| Manages durable state | Azure Table Storage (6 tables) | All writes are auditable; append-only for audit/evidence |
| Enforces auth and permissions | JWT validation via `jose`; managed identity for Azure services | Auth middleware on every authenticated endpoint |
| Runs timer functions | `timerFullSpec` (1 AM EST), `cleanupIdempotency` (3 AM EST) | Requires `WEBSITE_TIME_ZONE=Eastern Standard Time` |
| Emits observability events | Fire-and-forget error emitter, provisioning audit bridge | Non-blocking; failures do not cascade to request handling |
| Serves health endpoint | `GET /api/health` (anonymous) | Primary health signal for monitoring |

### 5.3 What neither should do alone

| Action | Correct path | Wrong path |
|--------|-------------|-----------|
| Create SharePoint sites | Backend saga via provisioning API | SPFx direct SharePoint API call |
| Modify Entra ID groups | Backend via Graph API with managed identity | SPFx direct Graph call with user token |
| Write audit records | Backend audit store (append-only) | SPFx client-side logging |
| Validate provisioning prerequisites | Backend `validateProvisioningPrerequisites()` | SPFx checking env vars or feature flags |
| Rotate secrets | Azure Portal / Key Vault (T2/T3) | In-app configuration UI |

---

## 6. Audit and evidence doctrine

### 6.1 What must be auditable

| Category | Audit mechanism | Retention |
|----------|----------------|-----------|
| Provisioning run lifecycle | `AdminRunStore` — durable run state tracking | 365 days |
| Provisioning step execution | `AdminAuditStore` — 16 event types via provisioning audit bridge | 365 days |
| Terminal-state evidence | `AdminEvidenceStore` — evidence payload at saga completion/failure | 365 days |
| Observability alerts | `ObservabilityAlertStore` — category-partitioned, deduplicated | Active: indefinite; resolved: 90 days |
| Observability errors | `ObservabilityErrorStore` — domain-partitioned, classified | 90 days |
| Probe snapshots | `ObservabilityProbeSnapshots` — timestamped health records | 90 days |
| Operator actions (in-app) | Alert acknowledge/resolve recorded in alert store | Follows alert retention |
| Break-glass actions | Manual audit record (see break-glass guidance) | Permanent (incident log) |
| Deployment actions | GitHub Actions workflow logs + evidence capture | 30 days (artifacts); permanent (git log) |

### 6.2 Audit discipline

1. **No silent writes.** Every state change that affects a run, alert, or configuration must produce an audit record.
2. **No audit gaps.** If the audit store is unavailable (degraded mode), the fire-and-forget emitter fails silently but the operation still proceeds. The audit gap must be documented in the incident log.
3. **Append-only for audit and evidence.** Audit records are never modified or deleted in normal operations. Evidence records are never modified after creation.
4. **Correlation is mandatory.** Run-level events must include `runId`. Alert events must include `dedupeKey`. Error events must include `correlationId` when available.
5. **Retention is enforced.** Retention targets are documented in the P12 config-and-retention guide. Data beyond retention may be archived or purged per IT policy.

---

## 7. Change discipline expectations

### 7.1 What constitutes a production change

| Change type | Examples | Required process |
|------------|---------|-----------------|
| **Code change** | Bug fix, feature, refactor, dependency update | Git commit → CI pipeline → staging verify → production deploy (Deployment Runbook) |
| **Configuration change** | Environment variable update, feature flag, UPN list | Azure Portal change by T2/T3 → document in incident/change log → verify |
| **Infrastructure change** | New Azure resource, permission grant, App Catalog trust | IT-Department-Setup-Guide procedures by T3 → document → verify |
| **Runbook/doc change** | Updated procedure, new runbook, corrected guidance | Git commit → review → merge |
| **Break-glass action** | Emergency override | Break-glass guidance procedures → mandatory post-action review |

### 7.2 Change discipline rules

1. **All code changes go through git and CI/CD.** No direct code edits in Azure Portal, Kudu, or Function App editor. No exceptions.
2. **All configuration changes are documented.** Every change to Function App Configuration, GitHub secrets, or environment variables must be recorded with who, when, what, and why.
3. **No silent configuration mutations.** Changing a config value without documenting it is a violation of operational doctrine, even if the change is correct.
4. **Staging before production.** All code changes and significant configuration changes must be verified in staging before production. Emergency exceptions require break-glass approval.
5. **Rollback readiness.** Before making any production change, confirm the rollback path is available (Rollback Runbook).

---

## 8. Production anti-patterns / no-go behaviors

### Explicit no-go statements

| # | No-go | Why | What to do instead |
|---|-------|-----|-------------------|
| NG-1 | **No undocumented production changes** | Undocumented changes create untraceable operational state; they are the #1 cause of "it works on staging but not production" | Document every change before or immediately after execution |
| NG-2 | **No privileged bypass through SPFx** | The SPFx console runs in the user's browser with user-level permissions. Moving privileged logic into SPFx bypasses the backend security boundary. | All privileged operations flow through the backend API |
| NG-3 | **No silent config mutations** | Changing an env var without recording it means the next operator or engineer cannot understand the current state | Use the change discipline process (Section 7) for every config change |
| NG-4 | **No use of break-glass as routine operations** | Break-glass procedures bypass normal controls. Repeated use indicates a missing standard procedure. | If a break-glass action is needed twice for the same scenario, create a standard recovery procedure |
| NG-5 | **No expansion into broader tenant-wide control without approved expansion scope** | The Admin IT Control Center manages HB Intel assets only. Expanding to tenant-wide SharePoint governance, broader M365 admin, or enterprise device management requires explicit architecture approval. | Document the expansion need → T4 review → expansion rails architecture (P13-08) |
| NG-6 | **No direct Table Storage entity modification in normal operations** | Table entities are application-managed. Manual edits bypass validation, auditing, and consistency checks. | Use application APIs for all data operations; reserve manual entity modification for break-glass BG-2 only |
| NG-7 | **No disabling of auth middleware or CORS controls** | These are security boundaries, not operational impediments. Disabling them opens the API to unauthorized access. | Fix the underlying auth issue; never weaken security to work around an operational problem |
| NG-8 | **No deployment without staging verification** | Deploying untested code to production risks user-facing outages. | Follow the Deployment Runbook; use break-glass BG-4 only for Sev 1 emergencies |
| NG-9 | **No granting `Sites.FullControl.All` to replace `Sites.Selected`** | This violates the least-privilege model and grants managed identity access to every SharePoint site in the tenant. | Use per-site `Sites.Selected` grants as documented in the IT-Department-Setup-Guide |
| NG-10 | **No treating deferred items as non-existent** | Deferred items (email relay, stub monitors, stub probes, ApprovalAuthority persistence) have documented mitigations. Ignoring them could lead to surprise when the mitigation is insufficient. | Review deferred items in the release readiness baseline (P13-02 Section 7) periodically |

---

## Validation checklist

- [x] Aligns with support model (P13-04) tier definitions and ownership
- [x] Aligns with runbook set (P13-05, P13-06) procedures and escalation paths
- [x] Does not contradict boundary doctrine from end-state plan or architecture invariants
- [x] Operationally usable — concrete guidance, not abstract principles
- [x] No-go statements cover all required items from prompt plus additional safety boundaries
- [x] Service dependency map matches P13-03 environment baseline
- [x] Degraded mode expectations align with P13-03 dependency failure considerations
