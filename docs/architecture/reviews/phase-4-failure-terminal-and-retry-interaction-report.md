# Phase 4 — Failure, Terminal State, and Retry Interaction Report

> **Prompt:** P4-04 | **Date:** 2026-04-01 | **Type:** Mutation path hardening

## Mutation Classification

### Mutations that create a new run

| Mutation | New correlationId | New Table row | Request reconciliation |
|----------|-------------------|---------------|----------------------|
| **Saga execute()** (launch) | Yes | Yes | -> Provisioning (immediate) |
| **Saga retry()** | Yes | Yes | -> Provisioning (via execute) |

### Mutations that edit the latest run in place

| Mutation | Request reconciliation | Notes |
|----------|----------------------|-------|
| **Saga step completion** | No (until terminal) | Upsert after each step |
| **Saga completion** | -> Completed | With siteUrl, completedBy, completedAt |
| **Saga failure** | -> Failed | Immediate |
| **Timer Step 5 success** | -> Completed | completedBy = 'timer' |
| **Timer Step 5 failure** | -> Failed | After 3 timer retries |
| **Escalation** | No | Annotation only (escalatedBy + escalatedAt) |
| **Acknowledge escalation** | No | Annotation cleanup (clears markers) |
| **Archive failure** | -> Completed (P4-04) | Previously did not reconcile — now fixed |
| **Force-state override** | -> target state if terminal (P4-04) | Previously did not reconcile — now fixed |

### Mutations that must reconcile request state

| Mutation | Reconciles to | Evidence |
|----------|---------------|---------|
| Saga start | Provisioning | saga-orchestrator.ts execute() |
| Saga completion (non-deferred) | Completed | saga-orchestrator.ts execute() |
| Saga failure | Failed | saga-orchestrator.ts compensate() |
| Timer Step 5 success | Completed | timerFullSpec/handler.ts |
| Timer Step 5 failure (ceiling) | Failed | timerFullSpec/handler.ts |
| Archive failure (P4-04) | Completed | provisioningSaga/index.ts archiveFailure |
| Force-state to Completed/Failed (P4-04) | target state | provisioningSaga/index.ts forceStateTransition |

### Mutations that do NOT reconcile request state (by design)

| Mutation | Reason |
|----------|--------|
| Escalation | Annotation only — does not change overallStatus |
| Acknowledge escalation | Annotation cleanup — does not change overallStatus |
| Force-state to non-terminal | Non-terminal targets (InProgress, WebPartsPending) are transitional; request stays in its current state until a terminal path fires |
| Step 5 deferral | Request stays Provisioning; timer will reconcile on completion/failure |

## Changes Made

### archiveFailure: request reconciliation added

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

Previously, `archiveFailure` set `overallStatus = 'Completed'` on the provisioning status without updating the linked request. This caused permanent request/status drift — the request would stay `Provisioning` or `Failed` while the status showed `Completed`.

Now reconciles the request to `Completed` with `completedAt` and `completedBy` (the admin who archived). Reconciliation is non-blocking — failure is logged but does not break the archive operation.

### forceStateTransition: terminal request reconciliation added

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

Previously, `forceStateTransition` could set any `overallStatus` without updating the request. This was the highest drift risk identified in P4-01.

Now reconciles the request state when the target is `Completed` or `Failed`. Non-terminal targets (InProgress, WebPartsPending, etc.) do not reconcile — these are transitional states that should eventually reach a terminal path that reconciles.

### retry(): lastRetryAt now set

**File:** `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`

The `lastRetryAt` field on `IProvisioningStatus` was declared in the interface and persisted to Table Storage (P4-02) but never populated. Now set to the current ISO timestamp when `retry()` is called, providing admin visibility into retry timing.

### JSDoc hardening

Added P4-04 mutation-path documentation to:
- `archiveFailure` endpoint — documents reconciliation behavior
- `forceStateTransition` endpoint — documents terminal reconciliation
- `escalateProvisioning` endpoint — documents annotation-only semantics
- `acknowledgeEscalation` endpoint — documents annotation cleanup semantics
- `SagaOrchestrator.retry()` — documents lastRetryAt and request reconciliation path

## Verification Evidence

### Failure transition behavior
- Saga failure: `compensate()` sets `overallStatus = 'Failed'`, `failedAt`, reconciles request to `Failed`. Evidence: saga-orchestrator.ts.
- Timer failure: Sets `overallStatus = 'Failed'`, `failedAt`, reconciles request to `Failed`. Evidence: timerFullSpec/handler.ts.

### Retry behavior
- `retry()` loads latest run, generates new `correlationId`, increments `retryCount`, sets `lastRetryAt` (P4-04), constructs new `IProvisionSiteRequest` with `parentCorrelationId`, calls `execute()`.
- `execute()` creates a new Table Storage row and reconciles request to `Provisioning`.
- Step idempotency guards skip already-completed steps on the new run.

### Escalation behavior
- `escalateProvisioning` sets `escalatedBy` and `escalatedAt` on the latest run. No overallStatus change. No request reconciliation. Annotation only.

### Archive behavior (P4-04 hardened)
- `archiveFailure` sets `overallStatus = 'Completed'` and `completedAt`. Now reconciles request to `Completed` with `completedBy` = admin UPN. Non-blocking reconciliation.

### Acknowledgment behavior
- `acknowledgeEscalation` clears `escalatedBy` and `escalatedAt`. No overallStatus change. No request reconciliation. Annotation cleanup only.

### Force-state override behavior (P4-04 hardened)
- `forceStateTransition` sets `overallStatus` to any valid state. Sets `completedAt` or `failedAt` for terminal targets.
- Now reconciles request state when target is `Completed` or `Failed` (P4-04). Non-terminal targets do not reconcile.

### Timer Step 5 success/failure behavior
- Success: Sets `overallStatus = 'Completed'`, clears deferred flags, reconciles request to `Completed` (completedBy = 'timer').
- Failure (3 retries exceeded): Sets `overallStatus = 'Failed'`, `failedAt`, reconciles request to `Failed`.
- Continued deferral (< 3 retries): Increments `step5TimerRetryCount`, keeps `overallStatus = 'WebPartsPending'`. No request reconciliation.

### Request/status consistency after each mutation
All mutations that change `overallStatus` to a terminal state now reconcile the linked request. Annotation-only mutations (escalation, acknowledgment) correctly leave request state unchanged.

### Direct Admin compatibility
Admin `ProvisioningOversightPage` reads `IProvisioningStatus` via `listProvisioningRuns()`. All admin actions (retry, archive, acknowledge, force-state) continue to work correctly. The reconciliation changes are backend-only and do not affect the admin UI contract.

## Residual Risks

### 1. Concurrent retry race condition
If two retries execute simultaneously, both create new rows and both reconcile request state. Last-write-wins applies. This is a low-probability scenario (requires near-simultaneous API calls) and the eventual consistency is acceptable — the latest run by `startedAt` wins on status reads, and the last request reconciliation wins on request reads. A distributed lock would add complexity without material benefit at current scale.

### 2. Step 5 deferral does not reconcile request
Request stays `Provisioning` during the deferral window (hours to days). This is by design — `WebPartsPending` is not a request-level state. The timer will reconcile to `Completed` or `Failed` when the deferral resolves.

### 3. Non-terminal force-state does not reconcile
Forcing to `InProgress`, `WebPartsPending`, or `BaseComplete` does not update the request. This is intentional — these are transitional states that should eventually reach a terminal path. If an admin forces a stuck run back to `InProgress` and then manually retries, the retry will reconcile normally.
