# Phase 5 — Admin Recovery Action Boundary and Authorization Report

> **Prompt:** P5-03 | **Date:** 2026-04-02 | **Type:** Implementation + documentation

## Executive Summary

This prompt hardens the Admin recovery action boundary by adding backend state guards to the shared retry and escalate endpoints, and by clearly classifying all exception actions into Admin-exclusive and shared categories. No role-level authorization changes were made — retry and escalate remain L2 delegated-scope endpoints by design, since coordinators (Estimating) and admins both need access. The hardening consists of enforcing `overallStatus === 'Failed'` at the backend before allowing retry or escalation, closing the gap where non-failed runs could theoretically be retried or escalated via direct API calls.

---

## 1. Admin-Exclusive UI Actions

These actions appear only in the Admin ProvisioningOversightPage and are not reachable from any other surface:

| Action | Component | Gating |
|--------|-----------|--------|
| Archive Failure | `ProvisioningOversightPage` | `PermissionGate(ADMIN_PROVISIONING_ARCHIVE)` |
| Acknowledge Escalation | `ProvisioningOversightPage` | `PermissionGate(ADMIN_PROVISIONING_ESCALATE)` |
| Manual State Override | `ProvisioningOversightPage` | `PermissionGate(ADMIN_PROVISIONING_FORCE_STATE)` + `HbcComplexityGate(expert)` |
| View Full Diagnostics | `ProvisioningOversightPage` | `HbcComplexityGate(expert)` |

## 2. Admin-Exclusive Backend Actions

These endpoints enforce both L2 delegated scope and L3 admin role:

| Endpoint | Route | Auth Stack |
|----------|-------|-----------|
| `archiveFailure` | `POST /provisioning-archive/{projectId}` | `requireDelegatedScope` + `requireAdmin` |
| `acknowledgeEscalation` | `POST /provisioning-escalation-ack/{projectId}` | `requireDelegatedScope` + `requireAdmin` |
| `forceStateTransition` | `POST /provisioning-force-state/{projectId}` | `requireDelegatedScope` + `requireAdmin` |
| `listProvisioningRuns` | `GET /provisioning-runs` | `requireDelegatedScope` + `requireAdmin` |
| `listFailedRuns` | `GET /provisioning-failures` | `requireDelegatedScope` + `requireAdmin` |
| `provisionProjectSite` | `POST /provision-project-site` | `requireDelegatedScope` + `requireAdmin` |
| `triggerTimerManually` | `POST /admin/trigger-timer` | `requireDelegatedScope` + `requireAdmin` |

## 3. Shared Exception Actions

These endpoints enforce L2 delegated scope only. Both coordinators (Estimating) and admins (Admin) invoke them. **P5-03 added `overallStatus === 'Failed'` state guards.**

| Endpoint | Route | Auth Stack | State Guard (P5-03) | Consumers |
|----------|-------|-----------|--------------------|-----------| 
| `retryProvisioning` | `POST /provisioning-retry/{projectId}` | `requireDelegatedScope` | `overallStatus === 'Failed'` or 409 | Estimating `RetrySection`, Admin `ProvisioningOversightPage` |
| `escalateProvisioning` | `POST /provisioning-escalate/{projectId}` | `requireDelegatedScope` | `overallStatus === 'Failed'` or 409 | Estimating `RetrySection` |
| `getProvisioningStatus` | `GET /provisioning-status/{projectId}` | `requireDelegatedScope` | — (read-only) | All surfaces |

## 4. Backend Routes Broader Than Admin UI Language

The P5-01 audit identified that the Admin UI labels "Force Retry" as an admin action, but the backend `retryProvisioning` endpoint is L2-only. This is **intentional and correct**:

- Coordinators need retry access for bounded transient retries.
- Admins need retry access for unbounded force retries.
- The same endpoint serves both, with the frontend enforcing coordinator business rules.

The distinction is:
- **Admin UI**: "Force Retry" — no failure class restriction, no retry limit (up to `ADMIN_RETRY_CEILING`).
- **Estimating UI**: "Retry Provisioning" — transient-only, max 2 retries, not escalated (enforced by `canCoordinatorRetry()`).
- **Backend**: `retryProvisioning` — L2 scope + `overallStatus === 'Failed'` guard (P5-03). No role or failure-class check.

This design is intentional. Adding an admin-role check would break coordinator retry. Adding a failure-class check at the backend would couple the backend to frontend-tier business rules. The state guard is the correct backend-level safety net.

---

## Changes Made

### Backend: State guards on retry and escalate

**File:** `backend/functions/src/functions/provisioningSaga/index.ts`

**retryProvisioning** (lines 185–250):
- Added: Load provisioning status via `getProvisioningStatus(projectId)`.
- Added: Return 404 if status does not exist.
- Added: Return 409 if `overallStatus !== 'Failed'` with message: `Cannot retry: provisioning is {status}, not Failed`.
- Preserved: Fire-and-forget saga retry pattern, 202 response.

**escalateProvisioning** (lines 252–305):
- Added: Load provisioning status via `getProvisioningStatus(projectId)`.
- Added: Return 404 if status does not exist.
- Added: Return 409 if `overallStatus !== 'Failed'` with message: `Cannot escalate: provisioning is {status}, not Failed`.
- Preserved: Annotation-only behavior (sets `escalatedBy` + `escalatedAt`).

### Test: Updated classification comment

**File:** `backend/functions/src/functions/provisioningSaga/__tests__/provisioning-authorization.test.ts`

Updated the Delegated-Open route classification comment to note that retry and escalate now enforce `overallStatus === 'Failed'` at the handler level while remaining L2-only for authorization.

### Documentation: Action boundary classification

**File:** `docs/reference/spfx-surfaces/admin-recovery-boundary.md`

Replaced the single "Admin-Exclusive Actions" section with two clearly separated sections:
- **Admin-Exclusive Actions (L2 + L3 Admin)**: archive, acknowledge-escalation, state override.
- **Shared Exception Actions (L2 Delegated Scope)**: retry, escalation — with state guard documentation.

---

## Verification Evidence

### Admin-Only Action Inventory

Verified all seven admin-gated endpoints enforce `requireDelegatedScope` + `requireAdmin`:
- `archiveFailure` — line 310–314
- `acknowledgeEscalation` — line 362–367
- `forceStateTransition` — line 403–408
- `listProvisioningRuns` — line 280–284
- `listFailedRuns` — (same pattern)
- `provisionProjectSite` — line 46–50
- `triggerTimerManually` — line 167–172

### Shared Action Inventory

Verified both shared endpoints enforce `requireDelegatedScope` only (no `requireAdmin`), plus the new state guard:
- `retryProvisioning` — L2 scope (line 194–196) + Failed guard (new)
- `escalateProvisioning` — L2 scope (line 241–243) + Failed guard (new)
- `getProvisioningStatus` — L2 scope only (read-only, no state guard needed)

### Route and Backend Authorization Correctness

The authorization test at `provisioning-authorization.test.ts` confirms:
- L2 scope enforcement works correctly (pass/deny/bypass for app-only).
- L3 admin enforcement works correctly (pass for Admin/HBIntelAdmin, deny for Controller/empty).
- Route classification: retry/escalate are Delegated-Open; archive/force-state/acknowledge are Delegated-Privileged.

### Preserved Separation from Accounting

- Accounting has zero imports from `@hbc/features-admin`.
- Accounting's `ProjectReviewDetailPage` exposes only "Send to Admin" navigation — no recovery actions.
- No retry, archive, escalate, force-state, or acknowledge buttons exist in Accounting.

### Residual Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Coordinator retry business rules are frontend-only | Low | Backend state guard prevents non-failed retries; frontend `canCoordinatorRetry()` enforces class/count/escalation limits |
| Escalation has no `failureClass` check at backend | Low | Frontend renders escalation UI only when `failureClass` is defined (spec R1); backend state guard prevents non-failed escalation |
| `retryProvisioning` response is 202 fire-and-forget | Accepted | By design — saga execution is async; status endpoint is authoritative |

---

## Files Changed

| File | Change |
|------|--------|
| `backend/functions/src/functions/provisioningSaga/index.ts` | Add `overallStatus === 'Failed'` state guards to retry and escalate endpoints |
| `backend/functions/src/functions/provisioningSaga/__tests__/provisioning-authorization.test.ts` | Update classification comment for P5-03 state guards |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Separate Admin-exclusive vs shared action categories |
| `docs/architecture/reviews/phase-5-admin-recovery-boundary-and-authorization-report.md` | This report |
