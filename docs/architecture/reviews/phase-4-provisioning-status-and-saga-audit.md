# Phase 4 — Provisioning Status and Saga Audit Report

> **Prompt:** P4-01 | **Date:** 2026-04-01 | **Type:** Repo-truth audit (no code changes)

## Executive Summary

The HB Intel provisioning system implements a **per-run durable status model with latest-run project-scoped reads**. Each saga execution creates one Azure Table Storage entity keyed by `projectId` (partition) + `correlationId` (row). Retries produce new rows with new correlation IDs in the same partition. The project-scoped status endpoint returns only the latest run by `startedAt` timestamp.

Request state reconciliation occurs at saga start (`Provisioning`) and terminal states (`Completed`, `Failed`). Step 5 deferral to the overnight timer does **not** reconcile request state — the request remains `Provisioning` until the timer completes or fails the deferred job. Admin mutations (escalation, archive, acknowledgment, force-state) do **not** trigger request state changes.

SignalR is a best-effort enhancement layer. The status endpoint is authoritative. The client store merges SignalR events incrementally and API responses wholesale, with SignalR skeleton creation handling early-event races.

This report establishes the single evidence-backed baseline for Prompts 02 through 06.

---

## Confirmed Repo Facts

### Saga Orchestration

- The saga orchestrator is a class-based implementation (`SagaOrchestrator`) in `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`, not Azure Durable Functions.
- Seven steps execute sequentially: Create Site, Create Document Library, Upload Template Files, Create Data Lists, Install Web Parts, Set Permissions, Associate Hub Site.
- Each step is retried up to 3 attempts with 2-second base delay and exponential backoff via `withRetry()`.
- Status is upserted to Table Storage after every step, regardless of success or failure.
- Step 5 has a dedicated 90-second timeout and 2 in-memory attempts before deferring to the overnight timer.
- Steps 6 and 7 continue executing even when Step 5 defers.
- Compensation runs in reverse order (7 -> 4 -> 3 -> 2 -> 1) on failure. Compensation errors are logged but do not re-throw.

### Launch Paths

- **Primary (auto-trigger):** Controller advances request to `ReadyToProvision` via `PATCH /api/project-setup-requests/{requestId}/state`. Backend auto-triggers saga fire-and-forget if no existing status or previous status is `Failed`. Returns HTTP 200 with updated request (not provisioning metadata).
- **Secondary (direct):** `POST /api/provision-project-site` requires Admin role + delegated scope L2. Returns HTTP 202 with `{ message, projectId, correlationId }`.

### Terminal States

- **Completed:** All 7 steps succeed (non-deferred), or timer completes deferred Step 5.
- **WebPartsPending:** Steps 1-4, 6, 7 complete but Step 5 deferred to timer. Not a terminal state — awaits timer processing.
- **Failed:** Any step fails after retries, or timer exceeds 3 nightly attempts for Step 5.

### Request State Machine

8 states: `Submitted` -> `UnderReview` -> `NeedsClarification` (loop) -> `AwaitingExternalSetup` -> `ReadyToProvision` -> `Provisioning` -> `Completed` / `Failed`.

---

## Confirmed Repo-Doc Intent

The provisioning architecture documentation intends:

- Status endpoint reads are authoritative; SignalR is enhancement-only.
- Per-run persistence with latest-run reads is the governing model.
- Admin consumes provisioning status directly; Accounting consumes request state indirectly.
- Timer-driven Step 5 retries are nightly with a 3-attempt ceiling.
- Retry creates new run identity; parent correlation ID enables chain traceability.

All living docs except `docs/reference/models/provisioning.md` accurately reflect these intentions. See [Identified Contradictions](#identified-contradictions) for the stale doc.

---

## Physical Persistence Model

**Table:** `ProvisioningStatus` (Azure Table Storage)

| Key | Source | Purpose |
|-----|--------|---------|
| **PartitionKey** | `projectId` | Groups all runs for a project |
| **RowKey** | `correlationId` | Unique per saga run (UUID v4) |

**Entity fields persisted:**

| Field | Type | Serialization |
|-------|------|---------------|
| `projectNumber` | `string` | Direct |
| `projectName` | `string` | Direct |
| `overallStatus` | `string` | `NotStarted` / `InProgress` / `BaseComplete` / `Completed` / `Failed` / `WebPartsPending` |
| `currentStep` | `number` | 0-7 |
| `stepsJson` | `string` | `JSON.stringify(steps)` — array of 7 `ISagaStepResult` |
| `siteUrl` | `string` | Empty string if undefined |
| `triggeredBy` | `string` | UPN |
| `triggeredByOid` | `string` | Entra OID or empty string |
| `submittedBy` | `string` | UPN |
| `submittedByOid` | `string` | Entra OID or empty string |
| `groupMembersJson` | `string` | `JSON.stringify(groupMembers)` |
| `startedAt` | `string` | ISO 8601 |
| `completedAt` | `string` | ISO 8601 or empty string |
| `failedAt` | `string` | ISO 8601 or empty string |
| `step5DeferredToTimer` | `boolean` | Direct |
| `step5TimerRetryCount` | `number` | Direct |
| `retryCount` | `number` | Direct |
| `escalatedBy` | `string` | UPN or empty string |

**Upsert semantics:** `Replace` mode — each write fully replaces the entity. Idempotent.

**Evidence:** `backend/functions/src/services/table-storage-service.ts` lines 31-55.

---

## Logical Read Model

### Backend Queries

| Method | Filter | Returns |
|--------|--------|---------|
| `getLatestRun(projectId)` | `PartitionKey eq projectId`, sort by `startedAt` descending | Single latest `IProvisioningStatus` or null |
| `listPendingStep5Jobs()` | `step5DeferredToTimer eq true AND overallStatus eq 'WebPartsPending'` | Array of deferred statuses |
| `listFailedRuns()` | `overallStatus eq 'Failed'` | Array of failed statuses |
| `listAllRuns(status?)` | Optional `overallStatus eq {status}` | Array of all statuses |

### Client Read Model

- Store keys status by `projectId` — one entry per project, always latest run.
- `setProvisioningStatus(status)` — wholesale replacement from API fetch.
- `handleProgressEvent(event)` — incremental merge from SignalR: updates `overallStatus`, `currentStep`, and the specific step's status/timestamps.
- Skeleton creation: if SignalR event arrives before API fetch, store creates a skeleton `IProvisioningStatus` with 7 `NotStarted` steps.

**Evidence:** `packages/provisioning/src/store.ts`, `packages/provisioning/src/api-client.ts`.

---

## Request / Run / Status Correlation Map

| Entity | Storage | Key(s) | Purpose |
|--------|---------|--------|---------|
| `IProjectSetupRequest` | Backend (CosmosDB) | `requestId` = `projectId` | Lifecycle state machine |
| `IProvisioningStatus` | Azure Table Storage | `projectId` (partition) + `correlationId` (row) | Per-run saga execution trace |
| `IProvisionSiteRequest` | In-memory parameter | `projectId` + `correlationId` | Launch payload |

**Correlation chain:**

1. Request created with `projectId` (UUID).
2. Controller approval generates `correlationId` (UUID) at launch time.
3. Status entity created: `projectId` (partition) + `correlationId` (row).
4. Request state reconciled to `Provisioning` immediately.
5. On retry: new `correlationId` generated, `parentCorrelationId` set to previous run's `correlationId`. Both rows coexist in partition.
6. Terminal state reconciles request to `Completed` or `Failed`.

**Evidence:** `saga-orchestrator.ts` lines 43-101, 347-374.

---

## Reconciliation Map

| Trigger | Request State Change | Timing | Evidence |
|---------|---------------------|--------|----------|
| Controller approves to `ReadyToProvision` | No change (stays `ReadyToProvision`) | Inline with PATCH | `projectRequests/index.ts:358` |
| Saga `execute()` starts | -> `Provisioning` | Line 101 | `saga-orchestrator.ts:101` |
| Saga completes (non-deferred) | -> `Completed` + siteUrl + completedBy + completedAt | Lines 288-292 | `saga-orchestrator.ts:288-292` |
| Saga fails any step | -> `Failed` | Line 489 | `saga-orchestrator.ts:489` |
| Step 5 deferred to timer | **No change** (remains `Provisioning`) | N/A | No reconciliation call |
| Timer completes Step 5 | -> `Completed` + siteUrl + completedBy='timer' | Lines 274-278 | `timerFullSpec/handler.ts:274-278` |
| Timer Step 5 exceeds 3 retries | -> `Failed` | Lines 305-306 | `timerFullSpec/handler.ts:305-306` |
| Admin escalation | **No change** | N/A | Only sets `escalatedBy`/`escalatedAt` |
| Admin archive | **No change** | N/A | Only marks status as archived |
| Admin acknowledge escalation | **No change** | N/A | Clears escalation flags |
| Admin force-state | **No change** | N/A | Only changes provisioning status |

**Drift risk:** Admin mutations (escalate, archive, acknowledge, force-state) modify provisioning status without reconciling request state. If `forceStateTransition` sets `overallStatus` to `Completed` without a corresponding request reconciliation, request/status drift occurs.

---

## SignalR / Polling / Client-Store Interaction Map

### Negotiate

- **Endpoint:** `POST /api/provisioning-negotiate?projectId={projectId}`
- **Groups assigned:**
  - `provisioning-{projectId}` — all authenticated users for that project
  - `provisioning-admin` — admin role holders only
- **Auth:** Bearer token via `accessTokenFactory`

### Push Points

| Location | Event | Payload |
|----------|-------|---------|
| Saga start | `provisioningProgress` | Step 0 / InProgress |
| Each step completion | `provisioningProgress` | Step N / step status |
| Step 5 deferral | `provisioningProgress` | Step 5 / DeferredToTimer, overall WebPartsPending |
| Saga failure | `provisioningProgress` | Failed step / Failed |
| Timer success | `provisioningProgress` | Step 5 / Completed, overall Completed |
| Timer failure | `provisioningProgress` | Step 5 / Failed, overall Failed |

### Client Connection

- **Library:** `@microsoft/signalr` `HubConnectionBuilder`
- **Reconnect backoff:** `[0, 2000, 5000, 10000, 30000, 60000]` ms, then repeats at 60s
- **Token refresh:** fresh token acquired on each reconnect attempt
- **Event handler:** `connection.on('provisioningProgress', handleProgressEvent)`
- **Cleanup:** `closeGroup(projectId)` called on saga completion and failure (removes per-project group)

### Store Merge

| Source | Merge Type | Behavior |
|--------|-----------|----------|
| API fetch (`setProvisioningStatus`) | Wholesale | Replaces entire status for projectId |
| SignalR event (`handleProgressEvent`) | Incremental | Updates overallStatus, currentStep, and specific step only |

### Polling Fallback

- When `signalRConnected === false`, consumer surfaces should poll `GET /api/provisioning-status/{projectId}`.
- Polling interval: 30 seconds (consumer-implemented, not enforced by hook).
- When reconnected, polling stops.

### Stale Event Handling

- Last-write-wins for step status values.
- No explicit out-of-order event detection.
- WebSocket maintains ordering per subscription, so out-of-order delivery is unlikely.

---

## Direct Consumer Map

### Admin — `ProvisioningOversightPage`

- **Route:** `/provisioning-failures`
- **API methods:** `listProvisioningRuns()`, `retryProvisioning()`, `archiveFailure()`, `acknowledgeEscalation()`, `forceStateTransition()`
- **Reads:** Full `IProvisioningStatus` including all steps, failure classification, escalation, retry counts, correlation IDs
- **Mutations:** Retry (ceiling 3), archive, acknowledge escalation, force-state (expert-tier)
- **Tabs:** active, failures (default), completed (capped 50), all
- **Complexity tiers:** Essential (summary), Standard (step log), Expert (diagnostics + override)
- **Permission gating:** `admin:provisioning:retry`, `admin:provisioning:archive`, `admin:provisioning:escalate`, `admin:provisioning:force-state`

### PWA — `ProvisioningProgressView`

- **Route:** Provisioning progress path
- **Consumption:** Dual — SignalR real-time events + API polling fallback
- **Reads:** `overallStatus`, step checklist (`steps[]` with status/errorMessage), project identification
- **Mutations:** None (read-only for requesters)
- **Connection status:** Warning banner when disconnected and not terminal

### Backend Status Routes

- `GET /api/provisioning-status/{projectId}` — latest run for project
- `GET /api/provisioning-failures` — all failed runs
- `GET /api/provisioning-runs?status={status}` — all runs with optional filter
- All routes require delegated scope L2; admin routes require Admin role

**Evidence:** `apps/admin/src/pages/ProvisioningOversightPage.tsx`, `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`, `backend/functions/src/functions/provisioningSaga/index.ts`.

---

## Indirect Compatibility Surface Map

### Accounting — `ProjectReviewDetailPage`

- **Route:** `/project-review/$requestId`
- **Does NOT consume `IProvisioningStatus` directly.**
- **Consumes:** `IProjectSetupRequest` lifecycle state via `useProvisioningStore().requests` and `advanceState()`.
- **Reads:** `request.state` (Submitted, UnderReview, NeedsClarification, AwaitingExternalSetup, ReadyToProvision, Provisioning, Completed, Failed), clarification items, approval metadata.
- **Mutations:** Begin Review, Approve (with projectNumber), Request Clarification, Place on Hold, Resolve Hold.
- **Boundary:** All provisioning awareness comes through request-state reconciliation. Accounting sees `Provisioning`, `Completed`, or `Failed` because the saga reconciles request state at those transitions.
- **No provisioning step details, no retry controls, no escalation controls.**

**Compatibility assessment:** Accounting remains correctly isolated from provisioning internals. It operates entirely on the request lifecycle, which the saga keeps synchronized at terminal boundaries.

**Evidence:** `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`.

---

## Identified Contradictions

### Critical: `docs/reference/models/provisioning.md` is materially stale

This reference document contains field names, enum values, and interface structures that do not match the live `packages/models/src/provisioning/IProvisioning.ts` contract.

| Aspect | Document Claims | Actual Code |
|--------|----------------|-------------|
| Project identifier field | `projectCode` | `projectNumber` |
| Steps array field | `stepResults` | `steps` |
| Escalation model | `escalated: boolean` | `escalatedBy?: string` + `escalatedAt?: string` |
| Overall status values | NotStarted, InProgress, Completed, Failed, **RollingBack, RolledBack, Escalated** | NotStarted, InProgress, **BaseComplete**, Completed, Failed, **WebPartsPending** |
| Step status values | **Pending**, InProgress, Completed, Failed, Skipped, **RolledBack** | **NotStarted**, InProgress, Completed, Failed, Skipped, **DeferredToTimer** |
| Missing fields in doc | — | `correlationId`, `retryCount`, `failureClass`, `lastRetryAt`, `step5DeferredToTimer`, `step5TimerRetryCount`, `groupMembers`, `groupLeaders`, `department`, `entraGroups`, `failedAt` |
| `totalSteps` field | Present in doc | Not in actual interface |
| `lastSuccessfulStep` field | Present in doc | Not in actual interface |
| `fullSpecDeferred` field | Present in doc | Not in actual interface (replaced by `step5DeferredToTimer`) |

**Impact:** New developers or integration consumers consulting this reference will get wrong field names and enum values. This is the highest-priority doc fix for Phase 4.

### Minor: No other doc contradictions found

All other provisioning documentation verified current (see Exact Files Inspected).

---

## Unresolved Issues

### 1. WebPartsPending Gap in Request State

When Step 5 defers to the timer, the request remains in `Provisioning` state indefinitely until the timer completes or fails. There is no `WebPartsPending` request state, so request consumers (including Accounting) cannot distinguish between active provisioning and timer-deferred waiting. This is a design gap, not a bug — the system works correctly, but the request state is less informative than the provisioning status during the deferral window.

**Recommendation:** Evaluate whether a `WebPartsPending` request state or a separate field would improve observability for request consumers. Address in Prompt-02 or Prompt-04.

### 2. Concurrent Retry Race Condition

If multiple retries are triggered simultaneously (e.g., via API and timer), both create new `correlationId` rows in the same partition. `getLatestRun()` returns whichever has the latest `startedAt`, but both sagas execute concurrently without mutual exclusion. Last-write-wins on the request reconciliation could produce inconsistent terminal states.

**Recommendation:** Evaluate whether a lightweight lock or guard is needed. Address in Prompt-04.

### 3. Admin Force-State Does Not Reconcile Request

`forceStateTransition()` changes provisioning `overallStatus` without updating the corresponding request state. If an admin forces a stuck run to `Completed`, the request may remain `Provisioning` indefinitely.

**Recommendation:** Add request reconciliation to `forceStateTransition()` or document the gap explicitly. Address in Prompt-04 or Prompt-05.

### 4. Timer Schedule Configuration

The timer is documented as running at 1:00 AM EST nightly. The Azure Functions timer binding configuration was not directly inspected in this audit (it lives in function registration or app settings). The mechanism works correctly per test and code evidence; only the schedule configuration source is unverified.

**Recommendation:** Verify timer CRON expression in Prompt-02 or Prompt-04.

---

## Recommended Implementation Targets for Prompt-02 through Prompt-05

### Prompt-02: Durable Status Contract and Run Correlation Hardening

- Document the canonical durable run-status contract based on this audit's physical persistence model.
- Make per-run persistence with latest-run reads explicit in contract documentation.
- Evaluate whether `WebPartsPending` should propagate to request state.
- Verify timer CRON expression configuration.

### Prompt-03: SignalR, Polling, and Client Status Consumption Hardening

- Validate store merge behavior against concurrent event/API races.
- Confirm stale-event handling is adequate (last-write-wins).
- Verify reconnect token refresh works across token expiry boundaries.
- Document polling fallback interval expectations.

### Prompt-04: Failure, Terminal State, and Retry Interaction Hardening

- Address concurrent retry race condition (mutual exclusion or guard).
- Address admin force-state request reconciliation gap.
- Verify compensation behavior preserves request/status consistency.
- Test Step 5 timer retry ceiling behavior (3 attempts -> Failed).
- Verify escalation -> retry -> terminal interaction chain.

### Prompt-05: Accounting and Admin Status Workflow Compatibility Verification

- Verify Accounting indirect compatibility: request state reflects provisioning truth at all terminal boundaries.
- Verify Admin direct compatibility: all oversight actions produce consistent status/request state pairs.
- Update stale `docs/reference/models/provisioning.md` to match live contract.
- Verify admin cross-app navigation (`?projectId=` query param) works correctly.

---

## Answers to Required Questions

### Q1. What is the physical durable status persistence model today?

One Azure Table Storage entity per saga run. PartitionKey = `projectId`, RowKey = `correlationId`. Entity is upserted (Replace mode) after every step. Multiple runs per project coexist in the same partition.

### Q2. What is the logical project-scoped read model today?

`getLatestRun(projectId)` scans all entities in the partition and returns the one with the latest `startedAt` timestamp. The project-scoped status endpoint (`GET /api/provisioning-status/{projectId}`) returns this single latest run. The client store also maintains one status entry per `projectId`.

### Q3. Is the repo truth best described as one status row per project, one durable status row per run plus latest-run reads per project, or some hybrid?

**One durable status row per run plus latest-run reads per project.** Each saga execution (including retries) creates a new row with a new `correlationId`. All reads return only the latest run. Historical runs are preserved in Table Storage but not surfaced to standard consumers. Admin `listAllRuns()` can access all historical rows.

### Q4. What exact identifiers correlate request, run, and durable status?

- `projectId` links request to status partition (request table key = `projectId`).
- `correlationId` identifies a specific saga run (Table Storage row key).
- `parentCorrelationId` chains retries (stored on the new run, points to previous run's `correlationId`).
- `requestId` = `projectId` in the request table.

### Q5. What exact response is returned by launch and retry endpoints?

- **Auto-trigger** (`PATCH /api/project-setup-requests/{requestId}/state`): HTTP 200 with the updated `IProjectSetupRequest` record. No provisioning metadata in response.
- **Direct launch** (`POST /api/provision-project-site`): HTTP 202 with `{ message: 'Provisioning started', projectId, correlationId }`.
- **Retry** (`POST /api/provisioning-retry/{projectId}`): HTTP 202 with `{ message: 'Retry started', projectId }`.

### Q6. When and where is request state reconciled from provisioning status changes?

- Saga start: `reconcileRequestState(projectId, 'Provisioning')` at `saga-orchestrator.ts:101`.
- Saga success: `reconcileRequestState(projectId, 'Completed', { siteUrl, completedBy, completedAt })` at `saga-orchestrator.ts:288-292`.
- Saga failure: `reconcileRequestState(projectId, 'Failed')` at `saga-orchestrator.ts:489`.
- Timer success: `reconcileRequestState(projectId, 'Completed', { siteUrl, completedBy: 'timer', completedAt })` at `timerFullSpec/handler.ts:274-278`.
- Timer failure: `reconcileRequestState(projectId, 'Failed')` at `timerFullSpec/handler.ts:305-306`.

### Q7. Which mutation paths reconcile request state correctly today, and which do not?

**Correctly reconciled:**
- Saga start -> `Provisioning`
- Saga completion (non-deferred) -> `Completed`
- Saga failure -> `Failed`
- Timer completion -> `Completed`
- Timer failure (3 retries exceeded) -> `Failed`

**Not reconciled:**
- Step 5 deferral (request stays `Provisioning`, not `WebPartsPending`)
- Admin escalation (no request change)
- Admin archive (no request change)
- Admin acknowledge escalation (no request change)
- Admin force-state transition (no request change — highest drift risk)

### Q8. How do retry and timer follow-on behavior affect run identity and latest-run reads?

- **Retry:** Creates a new `correlationId` and a new Table Storage row. `retryCount` is incremented. `parentCorrelationId` links to the prior run. `getLatestRun()` returns the retry (newer `startedAt`). Step idempotency guards skip already-completed steps.
- **Timer:** Does NOT create a new row. Updates the existing deferred run's status in place (same `correlationId`). Increments `step5TimerRetryCount`. On terminal success/failure, updates `overallStatus` and reconciles request state.

### Q9. Which surfaces consume provisioning truth directly, and which consume it indirectly?

**Direct consumers:**
- Admin `ProvisioningOversightPage` — reads full `IProvisioningStatus` via `listProvisioningRuns()`
- PWA `ProvisioningProgressView` — reads `IProvisioningStatus` via SignalR + API polling
- Backend status routes — serve `IProvisioningStatus` directly

**Indirect compatibility surface:**
- Accounting `ProjectReviewDetailPage` — reads `IProjectSetupRequest.state` only, which is reconciled from provisioning status at terminal boundaries

### Q10. How does SignalR currently interact with authoritative status reads?

SignalR is a best-effort enhancement layer. It pushes `IProvisioningProgressEvent` after each step state change. The client store merges events incrementally (updating only the changed step and overall status). If SignalR is unavailable, the saga completes successfully — clients fall back to polling `GET /api/provisioning-status/{projectId}`. SignalR events arrive before API responses can be fetched; the store handles this by creating skeleton status entries. API responses overwrite skeletons wholesale.

### Q11. Where can request/status drift occur today?

1. **Step 5 deferral:** Request stays `Provisioning` while status is `WebPartsPending`. Drift window: hours to days (until timer succeeds or fails).
2. **Admin force-state:** Can set provisioning `overallStatus` to any value without updating request state. Drift is permanent unless manually corrected.
3. **Concurrent retries:** If two retries execute simultaneously, both reconcile request state at terminal — last write wins, which may not match the logically "latest" run.
4. **Reconciliation failure:** If `reconcileRequestState()` throws, the saga logs the error but continues. Request state may lag behind provisioning status.

### Q12. Which current docs are materially stale or incomplete for Phase 4?

**Materially stale:**
- `docs/reference/models/provisioning.md` — wrong field names, wrong enum values, missing fields. See [Identified Contradictions](#identified-contradictions) for full inventory.

**All other docs verified current:**
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/estimating-requester-surface.md`
- `docs/explanation/provisioning-architecture.md`
- `docs/reference/provisioning/request-lifecycle.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/reference/provisioning/saga-steps.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/how-to/developer/spfx-signalr-auth.md`

---

## Exact Files Inspected

### Backend

| File | Relevance |
|------|-----------|
| `backend/functions/src/functions/projectRequests/index.ts` | Launch path, auto-trigger, request state transitions |
| `backend/functions/src/functions/provisioningSaga/index.ts` | Saga entry routes, retry/escalate/archive/force-state endpoints |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Full orchestration, step execution, status persistence, request reconciliation, compensation |
| `backend/functions/src/functions/signalr/index.ts` | Negotiate endpoint, group assignment |
| `backend/functions/src/functions/timerFullSpec/handler.ts` | Timer Step 5 follow-on, retry ceiling, terminal reconciliation |
| `backend/functions/src/services/table-storage-service.ts` | Table Storage entity shape, keying, queries, deserialization |
| `backend/functions/src/services/signalr-push-service.ts` | SignalR push mechanics, group management |
| `backend/functions/src/functions/provisioningSaga/__tests__/saga-orchestrator.test.ts` | Unit tests: execution, idempotency, compensation, deferral |
| `backend/functions/src/functions/provisioningSaga/__tests__/approval-provisioning-integration.test.ts` | Integration tests: approval -> provisioning -> reconciliation |
| `backend/functions/src/functions/provisioningSaga/__tests__/provisioning-authorization.test.ts` | Authorization: delegated scope + admin role enforcement |

### Shared Packages

| File | Relevance |
|------|-----------|
| `packages/models/src/provisioning/IProvisioning.ts` | Typed contract: interfaces, enums, all fields |
| `packages/provisioning/src/api-client.ts` | API client methods, endpoints, return types, error handling |
| `packages/provisioning/src/store.ts` | Client store shape, merge behavior, terminal propagation |
| `packages/provisioning/src/hooks/useProvisioningSignalR.ts` | SignalR hook: connection lifecycle, reconnect, event handling |
| `packages/provisioning/src/index.ts` | Public exports manifest |
| `packages/provisioning/README.md` | Documented contract and usage |

### App Consumers

| File | Relevance |
|------|-----------|
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Indirect compatibility: request state only |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Direct consumer: full status with admin mutations |
| `apps/admin/src/test/ProvisioningOversightPage.test.tsx` | Test evidence: permissions, tiers, retry ceiling |
| `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` | Direct consumer: SignalR + polling, read-only |
| `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts` | API client factory for PWA |

### Documentation

| File | Status |
|------|--------|
| `docs/architecture/blueprint/current-state-map.md` | Current |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Current |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Current |
| `docs/reference/spfx-surfaces/estimating-requester-surface.md` | Current |
| `docs/reference/models/provisioning.md` | **Stale** — see Identified Contradictions |
| `docs/explanation/provisioning-architecture.md` | Current |
| `docs/how-to/developer/spfx-signalr-auth.md` | Current |
| `docs/reference/provisioning/request-lifecycle.md` | Current |
| `docs/reference/provisioning/state-machine.md` | Current |
| `docs/reference/provisioning/saga-steps.md` | Current |
| `docs/maintenance/provisioning-runbook.md` | Current |
