# Phase 5 — Escalation Ownership and Reopen Lifecycle Report

> **Prompt:** P5-04 | **Date:** 2026-04-02 | **Type:** Implementation + documentation

## Executive Summary

This prompt aligns escalation, reopen, retry, and exception transitions across request lifecycle and provisioning status. Three targeted fixes were implemented: (1) retryCount and lastRetryAt are now propagated from the prior run to the new run on retry, fixing a pre-existing bug where coordinator retry limits and admin retry counters always showed 0; (2) the auto-trigger on re-approval now accepts `Completed` provisioning status in addition to `Failed` and null, enabling re-provisioning after admin archive on a reopened request; (3) documentation was updated to explicitly describe escalation lifecycle, reopen behavior, and retry field propagation.

No changes were needed for escalation persistence across retries — new runs already start with clean escalation fields since `execute()` creates a fresh entity. This was verified and documented.

---

## Changes Made

### 1. Fix retryCount propagation across retries

**Problem:** The saga `retry()` method incremented `retryCount` on the in-memory status object but never passed it to the new run. The `execute()` method always initialized `retryCount: 0`, meaning coordinator retry limits (`canCoordinatorRetry()` checks `retryCount >= 2`) never triggered, and admin retry counters always displayed `Retry (0/N)`.

**Files changed:**
- `packages/models/src/provisioning/IProvisioning.ts:50–53` — Added optional `retryCount` and `lastRetryAt` fields to `IProvisionSiteRequest`.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts:85–87` — `execute()` now reads `request.retryCount` and `request.lastRetryAt` instead of hardcoding `retryCount: 0`.
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts:391–394` — `retry()` now passes `retryCount` and `lastRetryAt` in the request object.

**Behavior after fix:**
- First provisioning: `retryCount = 0` (default).
- After 1st retry: new run has `retryCount = 1`.
- After 2nd retry: new run has `retryCount = 2` → coordinator retry blocked by `canCoordinatorRetry()`.
- Admin retry counter correctly shows `Retry (2/N)`.

### 2. Expand auto-trigger for archived failures on reopen

**Problem:** When a controller reopened a failed request that an admin had archived (provisioning `Completed` via `archiveFailure`), the auto-trigger at `ReadyToProvision` was skipped because it only allowed `null` or `Failed` statuses. The controller had no way to re-trigger provisioning without admin direct intervention.

**File changed:** `backend/functions/src/functions/projectRequests/index.ts:375–380`

**Before:** `if (!existingStatus || existingStatus.overallStatus === 'Failed')`

**After:** Extracted to `canAutoTrigger` variable that also accepts `Completed`. Only `InProgress`, `WebPartsPending`, and `BaseComplete` block auto-trigger (active/deferred saga runs).

### 3. Documentation updates

**File:** `docs/reference/provisioning/durable-status-contract.md`
- Updated Retry section to document state guard (P5-03), retryCount propagation (P5-04), and clean escalation on new runs.
- Added "Reopen and Re-Provisioning" section documenting auto-trigger conditions.
- Added "Escalation Lifecycle" section documenting set/clear/retry/reopen behavior.

---

## Verification Evidence

### Escalation Behavior

**Verified:** New retry runs start without escalation fields.
- `execute()` at `saga-orchestrator.ts:63–87` creates a fresh `IProvisioningStatus` with no `escalatedBy` or `escalatedAt`.
- `retry()` does not include `escalatedBy`/`escalatedAt` in the `IProvisionSiteRequest`.
- `getLatestRun()` returns the newest run by `startedAt`, so consumers see the clean new run.
- Old run retains its escalation markers (correct — that specific run was escalated).
- Only `acknowledgeEscalation()` clears escalation (admin-exclusive, L3).

### Reopen Behavior

**Verified:** `Failed → UnderReview` transition does not touch provisioning status.
- `advanceRequestState` at `projectRequests/index.ts:322–323` only updates `existing.state`.
- No provisioning-related side effects for this transition.
- Auto-trigger fires only at `ReadyToProvision` (line 374).

**Changed:** Auto-trigger now accepts `Completed` status.
- `null` → trigger (never provisioned) ✓
- `Failed` → trigger (retry needed) ✓
- `Completed` → trigger (archived failure, re-provisioning safe) ✓ (P5-04)
- `InProgress` → skip (active saga) ✓
- `WebPartsPending` → skip (deferred saga) ✓
- `BaseComplete` → skip (partial completion) ✓

### Retry Behavior

**Changed:** `retryCount` and `lastRetryAt` now propagate across retries.
- `retry()` reads `status.retryCount`, increments it, and passes it via `IProvisionSiteRequest`.
- `execute()` reads `request.retryCount ?? 0` instead of hardcoding 0.
- `lastRetryAt` is set in `retry()` and passed through similarly.
- Coordinator 5-condition gate `canCoordinatorRetry()` at `failureClassification.ts:48` now correctly limits retries.
- Admin retry counter in `ProvisioningOversightPage.tsx` now correctly shows accumulated count.

### Request/Status Consistency

| Scenario | Request State | Provisioning Status | Auto-Trigger | Status |
|----------|--------------|-------------------|-------------|--------|
| First approval | ReadyToProvision | null | Yes | ✓ |
| Reopen after failure | UnderReview → ReadyToProvision | Failed | Yes | ✓ |
| Reopen after archive | UnderReview → ReadyToProvision | Completed | Yes (P5-04) | ✓ |
| Reopen during deferral | UnderReview → ReadyToProvision | WebPartsPending | Skip | ✓ |
| Retry from coordinator | Failed | Failed → InProgress (new run) | N/A | ✓ |
| Retry from admin | Failed | Failed → InProgress (new run) | N/A | ✓ |

### Intentionally Preserved Ambiguity

| Item | Decision | Rationale |
|------|----------|-----------|
| Step 5 deferral does not reconcile request state | Accepted (P4-01) | Request stays `Provisioning` while provisioning is `WebPartsPending`. Timer eventually resolves. Changing this would require complex mid-saga request updates. |
| Reopen does not reset provisioning status | Accepted | Preserves provisioning history. Auto-trigger condition handles the re-provisioning decision at ReadyToProvision. |
| `WebPartsPending` blocks auto-trigger on reopen | Accepted | Site resources partially created (Steps 1–4, 6–7). Blind re-provisioning could create duplicates. Admin manual intervention is correct for this case. |

---

## Files Changed

| File | Change |
|------|--------|
| `packages/models/src/provisioning/IProvisioning.ts` | Add `retryCount` and `lastRetryAt` to `IProvisionSiteRequest` |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Propagate retryCount/lastRetryAt through execute() and retry() |
| `backend/functions/src/functions/projectRequests/index.ts` | Expand auto-trigger to accept Completed status |
| `docs/reference/provisioning/durable-status-contract.md` | Document retry propagation, escalation lifecycle, reopen behavior |
| `docs/architecture/reviews/phase-5-escalation-ownership-and-reopen-lifecycle-report.md` | This report |
