# Phase 4 — Provisioning Status and Saga Readiness Report

> **Date:** 2026-04-01 | **Status:** Phase 4 complete

## Phase 4 Objectives

Harden the provisioning execution-read boundary so the Project Setup system behaves like a reliable production asynchronous workflow:

- Durable run-status persistence
- Request / run / status correlation
- SignalR and polling interaction
- Failure / retry / terminal-state semantics
- Admin direct status consumption
- Accounting indirect compatibility
- Final repo-doc reconciliation

## What Was Implemented

### P4-01: Repo-Truth Audit
- Created evidence-based audit of the entire provisioning status/saga model
- Answered 12 required questions with file-level evidence
- Identified `docs/reference/models/provisioning.md` as materially stale (14 contradictions)
- Identified 4 unresolved issues (WebPartsPending request gap, concurrent retry race, force-state reconciliation, timer config)

### P4-02: Durable Status Contract and Run Correlation Hardening
- Added 6 previously-unpersisted fields to Table Storage: `groupLeaders`, `department`, `entraGroups`, `failureClass`, `lastRetryAt`, `escalatedAt`
- Set `escalatedAt` timestamp in escalation handler
- Added comprehensive JSDoc to `IProvisioningStatus`, `ITableStorageService`, `SagaOrchestrator`
- Rewrote stale `docs/reference/models/provisioning.md` (14 contradictions resolved)
- Created `docs/reference/provisioning/durable-status-contract.md`

### P4-03: SignalR, Polling, and Client Status Consumption Hardening
- Added correlationId stale-event guard to store `handleProgressEvent`
- Hardened `ProvisioningProgressView` to disable SignalR and stop API polling on terminal state
- Added JSDoc documenting authoritative status precedence across all SignalR/store/view files

### P4-04: Failure, Terminal State, and Retry Interaction Hardening
- Added non-blocking request reconciliation to `archiveFailure` (-> Completed)
- Added non-blocking request reconciliation to `forceStateTransition` (-> terminal target)
- Set `lastRetryAt` on retry
- Documented all mutation paths: which create new runs, which edit in place, which reconcile request state

### P4-05: Accounting and Admin Compatibility Verification
- Verified Accounting remains a pure indirect consumer (request state only, no provisioning status imports)
- Verified Admin renders all P4-02 persisted fields
- Updated `controller-review-surface.md` with P4 reconciliation boundary
- Updated `admin-recovery-boundary.md` with P4 mutation reconciliation table and field availability

### P4-06: Final Documentation Reconciliation
- Fixed stale reconciliation table in `durable-status-contract.md` (was pre-P4-04)
- Updated `provisioning-runbook.md` with admin operation guidance (archive, force-state, override, decision table)

## What Was Corrected

| Issue | Source | Resolution |
|-------|--------|------------|
| 14 contradictions in provisioning models reference | P4-01 finding | Complete rewrite in P4-02 |
| 6 fields declared but not persisted | P4-02 finding | Added to serialization/deserialization |
| `escalatedAt` never set | P4-02 finding | Set in escalation handler |
| No correlationId stale-event guard | P4-01 finding | Added to store in P4-03 |
| SignalR/polling never stop on terminal | P4-03 finding | Disabled in ProvisioningProgressView |
| Archive does not reconcile request | P4-01 finding | Fixed in P4-04 |
| Force-state does not reconcile request | P4-01 finding | Fixed in P4-04 |
| `lastRetryAt` never set | P4-02 finding | Set in retry() in P4-04 |
| Runbook references wrong app for admin actions | P4-06 finding | Corrected to Admin app |
| Durable-status-contract reconciliation table stale | P4-06 finding | Updated to reflect P4-04 |

## Final Physical Persistence Model

One Azure Table Storage entity per saga run.

- **Table:** `ProvisioningStatus`
- **PartitionKey:** `projectId` — groups all runs for a project
- **RowKey:** `correlationId` — unique per saga run (UUID v4)
- **Upsert mode:** `Replace` — full entity replacement after every step (idempotent)
- **Retries:** Create new rows (new `correlationId`) in the same partition

## Final Logical Project-Read Model

`getProvisioningStatus(projectId)` scans the partition and returns the entity with the latest `startedAt` timestamp. This is the canonical project-level read for all standard consumers.

- **Standard consumers:** PWA progress view, status endpoint — see latest run only
- **Admin consumers:** `listAllRuns()` — see all historical rows
- **Client store:** Keys status by `projectId` — one entry = latest run

## Final Request / Run / Status Correlation

| Identifier | Scope | Purpose |
|------------|-------|---------|
| `projectId` | Project | Links request, status partition, all runs |
| `correlationId` | Run | Unique saga execution identity |
| `parentCorrelationId` | Retry chain | Previous run's correlationId (on IProvisionSiteRequest) |

## Final SignalR / Polling Behavior

- SignalR is an enhancement layer; the status API endpoint is authoritative
- Store `handleProgressEvent` performs incremental merge; `setProvisioningStatus` performs wholesale replacement
- CorrelationId stale-event guard drops events from a different run than the known status
- Terminal state disables SignalR connection and stops API polling
- Backend `closeGroup(projectId)` removes per-project SignalR group on completion/failure

## Final Failure / Retry / Terminal-State Behavior

- **Failure:** Compensation runs in reverse (7→1), request reconciled to Failed
- **Retry:** New `correlationId`, new Table row, `retryCount` incremented, `lastRetryAt` set, step idempotency guards skip completed steps
- **Timer Step 5:** Updates existing row in place, 3-attempt ceiling, reconciles on terminal
- **Terminal states:** Completed (success) and Failed (failure) are deterministic and reconcile request state

## Final Archive / Acknowledgment / Override Behavior

| Mutation | Status change | Request reconciliation | Run identity |
|----------|--------------|----------------------|-------------|
| Archive | -> Completed | -> Completed (P4-04) | Edits latest |
| Acknowledge escalation | Clears markers | No change | Edits latest |
| Escalation | Sets markers | No change | Edits latest |
| Force-state to terminal | -> target | -> target (P4-04) | Edits latest |
| Force-state to non-terminal | -> target | No change | Edits latest |

## Accounting Indirect Compatibility

**Conclusion: COMPATIBLE**

Accounting operates exclusively on `IProjectSetupRequest` state via `advanceState()`. It does not import, reference, or query `IProvisioningStatus`. All provisioning awareness comes through request-state reconciliation at terminal boundaries. No recovery actions leak into Accounting.

## Admin Direct Compatibility

**Conclusion: COMPATIBLE**

Admin reads `IProvisioningStatus` directly via `listProvisioningRuns()`. It renders all P4-02 persisted fields (`failureClass`, `escalatedBy`, `escalatedAt`, `lastRetryAt`, `entraGroups`). All admin mutations (retry, archive, acknowledge, force-state) work correctly with P4-04 request reconciliation. No controller actions leak into Admin.

## Residual Risks

### 1. Concurrent retry race condition (LOW)
If two retries execute simultaneously, both create new rows and both reconcile request state. Last-write-wins applies. Low probability at current scale.

### 2. Step 5 deferral does not reconcile request (BY DESIGN)
Request stays `Provisioning` during the deferral window. The timer will reconcile to `Completed` or `Failed` when resolved.

### 3. parentCorrelationId not persisted on status entity (ACCEPTABLE)
The retry chain is reconstructible from partition rows (sorted by `startedAt`) and telemetry logs. Not needed for current admin tooling.

### 4. SignalR push has no retry logic (ACCEPTABLE)
Push failures are non-blocking. Clients have polling fallback. Acceptable for current scale.

## Hard Requirement Answers

### 1. Does the repo retain per-run durable status entities plus latest-run project reads?
**Yes.** One entity per run (PartitionKey=projectId, RowKey=correlationId). `getProvisioningStatus(projectId)` returns latest by `startedAt`.

### 2. If not, what deliberate replacement model was implemented?
**N/A.** The existing model was confirmed correct and hardened, not replaced.

### 3. Which surfaces consume provisioning truth directly?
- Admin `ProvisioningOversightPage` via `listProvisioningRuns()`
- PWA `ProvisioningProgressView` via SignalR + API polling
- Backend status routes (`GET /api/provisioning-status/{projectId}`)

### 4. Which surfaces consume it indirectly?
- Accounting `ProjectReviewDetailPage` via request-state reconciliation only

### 5. Are all known request/status drift paths closed, documented, or still open?
**All closed or documented:**
- Archive → now reconciles (P4-04)
- Force-state to terminal → now reconciles (P4-04)
- Step 5 deferral → documented as by-design (timer resolves)
- Escalation/acknowledgment → documented as annotation-only (no drift)
- Concurrent retry race → documented as low-risk

### 6. What residual risks remain?
See Residual Risks section above. All are LOW or ACCEPTABLE severity.

## Phase 5 Prerequisites

None identified. Phase 4 can be closed. The adopted status model, correlation chain, reconciliation paths, and consumer boundaries are explicit, documented, and verified.

## Phase 4 Status

**Phase 4 complete.**

All 6 prompts executed. The repo contains explicit, evidence-backed documentation of how provisioning status is persisted, read, correlated, and consumed. A later implementation phase can start without reopening basic questions about the status model.

### Deliverables Produced

| Prompt | Report |
|--------|--------|
| P4-01 | `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md` |
| P4-02 | `docs/architecture/reviews/phase-4-durable-status-contract-and-run-correlation-report.md` |
| P4-03 | `docs/architecture/reviews/phase-4-signalr-polling-and-client-status-hardening-report.md` |
| P4-04 | `docs/architecture/reviews/phase-4-failure-terminal-and-retry-interaction-report.md` |
| P4-05 | `docs/architecture/reviews/phase-4-accounting-admin-status-compatibility-report.md` |
| P4-06 | `docs/architecture/reviews/phase-4-provisioning-status-and-saga-readiness-report.md` (this report) |

### Reference Artifacts Created/Updated

| Document | Action |
|----------|--------|
| `docs/reference/models/provisioning.md` | Rewritten (P4-02) |
| `docs/reference/provisioning/durable-status-contract.md` | Created (P4-02), updated (P4-06) |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Updated (P4-05) |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Updated (P4-05) |
| `docs/maintenance/provisioning-runbook.md` | Updated (P4-06) |
