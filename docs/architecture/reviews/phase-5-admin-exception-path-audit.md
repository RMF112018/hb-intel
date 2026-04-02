# Phase 5 — Admin Exception-Path Audit Report

> **Prompt:** P5-01 | **Date:** 2026-04-02 | **Type:** Repo-truth audit (no code changes)

## Executive Summary

The Admin exception path is **functionally complete** — Accounting routes failed requests to Admin, Admin exposes five recovery actions gated by role and permission, and documentation is largely accurate. However, the exception path is **not exclusively Admin-owned**. Estimating participates via bounded coordinator retry (transient failures only, max 2 attempts) and escalation annotation, both using the same backend endpoints that Admin uses.

The most significant finding is an **authorization asymmetry**: the `retryProvisioning` and `escalateProvisioning` backend endpoints enforce only L2 delegated-scope checks, **not** L3 admin-role checks. Any authenticated user with `access_as_user` scope can invoke these endpoints directly. Coordinator-tier gating is enforced only at the frontend level via `canCoordinatorRetry()`. This is an intentional design (shared endpoints serve both surfaces) but represents a backend enforcement gap worth explicit documentation and possible hardening.

Additionally, Estimating's "Open Admin Recovery" button links to `/provisioning-oversight` — a route that does not exist in the Admin app. The correct Admin route is `/provisioning-failures`. This is a dead link in production.

This report establishes the evidence-backed baseline for Prompts 02 through 05.

---

## Confirmed Repo Facts

### Accounting Route-Out

- The "Send to Admin" button renders **only when `request.state === 'Failed'`** (`apps/accounting/src/pages/ProjectReviewDetailPage.tsx:422`).
- Navigation method: `window.open(url, '_blank')` — opens Admin in a new tab.
- URL pattern: `${adminUrl}/provisioning-failures?projectId=${request.projectId}` (line 429).
- `adminUrl` is resolved from `import.meta.env.VITE_ADMIN_APP_URL` via `getAdminAppUrl()` in `apps/accounting/src/utils/crossAppUrls.ts`.
- When the env var is missing, the button is hidden and a warning banner is shown (line 436–438).
- No `runId`, `correlationId`, or other parameters are passed — only `projectId`.

### Admin Route-In

- The `/provisioning-failures` route is defined in `apps/admin/src/router/routes.ts:40–51`.
- Route uses `validateSearch()` to normalize `projectId` from the query string (line 43–44).
- `beforeLoad` enforces `requireAdminAccessControl()`, which checks for `admin:access-control:view` permission or `*:*` wildcard (line 9–16).
- The page component `ProvisioningOversightPage` parses `?projectId=` using manual `new URLSearchParams(window.location.search)` (line 177) instead of TanStack Router's `useSearch()` hook — a deviation from the architectural spec in `W0-G4-T07`.
- Auto-selection logic: `allRuns.find(r => r.projectId === projectId)` selects the **first match** (line 180). In a multi-run scenario, this may select the wrong run.

### Estimating Exception Touchpoints

- `RetrySection.tsx` (line 27–100) exposes coordinator retry and escalation, gated by `HbcComplexityGate minTier="standard"`.
- Three rendering paths:
  1. Retryable transient failure → "Retry Provisioning" button calling `client.retryProvisioning(projectId)`.
  2. Non-retryable with defined `failureClass` → escalation banner with "Escalate to Admin" + "Open Admin Recovery" buttons.
  3. `failureClass === undefined` → renders nothing (spec R1).
- `canCoordinatorRetry()` in `failureClassification.ts:40–52` implements a 5-condition gate: `overallStatus === 'Failed'`, `failureClass !== undefined`, `failureClass === 'transient'`, `retryCount < MAX_COORDINATOR_RETRIES (2)`, `escalatedBy == null`.
- Five failure classes defined: `transient`, `structural`, `permissions`, `repeated`, `admin-class`.
- **Dead link**: Estimating's "Open Admin Recovery" button navigates to `/provisioning-oversight?projectId=` (RetrySection.tsx:88), but the Admin route is `/provisioning-failures`. This link will 404 in production.

### Admin Recovery Actions

Five actions are implemented in `ProvisioningOversightPage.tsx`:

| Action | Endpoint | Auth | Tier Gate | State Change | Request Reconciliation |
|--------|----------|------|-----------|-------------|----------------------|
| Force Retry | `POST /provisioning-retry/{projectId}` | L2 only | — | Fire-and-forget saga retry | Via saga |
| Archive Failure | `POST /provisioning-archive/{projectId}` | L2 + L3 Admin | — | `overallStatus → Completed` | Yes (P4-04) |
| Acknowledge Escalation | `POST /provisioning-escalation-ack/{projectId}` | L2 + L3 Admin | — | Clears `escalatedBy`/`escalatedAt` | No (annotation only) |
| Manual State Override | `POST /provisioning-force-state/{projectId}` | L2 + L3 Admin | Expert | `overallStatus → targetState` | Yes on terminal targets (P4-04) |
| View Full Diagnostics | Display only | — | Expert | — | — |

### Backend Authorization Posture

- **retryProvisioning** (line 194–196): `requireDelegatedScope()` only — **no admin-role check**.
- **escalateProvisioning** (line 241–243): `requireDelegatedScope()` only — **no admin-role check**.
- **archiveFailure** (line 309–314): `requireDelegatedScope()` + `requireAdmin()`.
- **acknowledgeEscalation** (line 362–367): `requireDelegatedScope()` + `requireAdmin()`.
- **forceStateTransition** (line 403–408): `requireDelegatedScope()` + `requireAdmin()`.
- **listProvisioningRuns** (line 280–284): `requireDelegatedScope()` + `requireAdmin()`.
- **listFailedRuns**: `requireDelegatedScope()` + `requireAdmin()`.

### State Machine

- Request states: `Submitted → UnderReview → NeedsClarification/AwaitingExternalSetup/ReadyToProvision → Provisioning → Completed/Failed` (`state-machine.ts:10–19`).
- `Failed → UnderReview` reopen is allowed for controller and admin roles (line 88).
- Provisioning statuses: `NotStarted | InProgress | BaseComplete | Completed | Failed | WebPartsPending`.
- `WebPartsPending` is **non-terminal** — it can transition to `Completed` or `Failed` via the overnight timer.

### Cross-App URL Utility

- `crossAppUrls.ts` is **duplicated identically** in both `apps/accounting/src/utils/` and `apps/estimating/src/utils/` — not in a shared package.
- Both export `getAdminAppUrl()` reading `VITE_ADMIN_APP_URL` with URL validation and trailing-slash stripping.

---

## Confirmed Repo-Doc Intent

The following living docs accurately reflect current implementation:

- **`docs/reference/spfx-surfaces/admin-recovery-boundary.md`** — Admin-exclusive actions (archive, force-state, acknowledge-escalation) are correctly documented. Phase 4 hardening is reflected.
- **`docs/reference/spfx-surfaces/controller-review-surface.md`** — Accounting routing correctly described as navigation-only. No recovery actions in Accounting.
- **`docs/reference/spfx-surfaces/coordinator-visibility-spec.md`** — Coordinator retry model correctly bounded to transient + max 2. Escalation documented.
- **`docs/reference/provisioning/durable-status-contract.md`** — Per-run durable model correct. Phase 4 field persistence confirmed.
- **`docs/reference/provisioning/state-machine.md`** — State transitions match live code, with one exception noted in Contradictions.

Three low-impact documentation gaps exist:
1. `IProvisioningApiClient` methods in `packages/provisioning/src/api-client.ts` lack JSDoc noting role-based access requirements.
2. Escalation ownership asymmetry is not explicitly documented — coordinator can escalate but only Admin can clear via acknowledge.
3. Retry idempotency guarantee (new `correlationId`, completed-step skipping) is not stated in coordinator-visibility-spec.md.

---

## Current Cross-App Routing Model

### Accounting → Admin

| Property | Value |
|----------|-------|
| Trigger | `request.state === 'Failed'` |
| Source file | `apps/accounting/src/pages/ProjectReviewDetailPage.tsx:422–441` |
| URL construction | `${adminUrl}/provisioning-failures?projectId=${request.projectId}` |
| Navigation method | `window.open(url, '_blank')` |
| Parameters passed | `projectId` only |
| Env var | `VITE_ADMIN_APP_URL` |
| Graceful degradation | Warning banner when env var missing |

### Admin Route-In

| Property | Value |
|----------|-------|
| Route | `/provisioning-failures` (`apps/admin/src/router/routes.ts:42`) |
| Search validation | `validateSearch()` normalizes `projectId` from query string |
| Auth gate | `requireAdminAccessControl()` — `admin:access-control:view` or `*:*` |
| Query parsing | Manual `URLSearchParams` — **deviates from TanStack Router `useSearch()` spec** |
| Auto-selection | `allRuns.find(r => r.projectId === projectId)` — first match only |

### Estimating → Admin

| Property | Value |
|----------|-------|
| Source file | `apps/estimating/src/components/project-setup/RetrySection.tsx:84–94` |
| URL construction | `${adminUrl}/provisioning-oversight?projectId=${projectId}` |
| Route target | `/provisioning-oversight` — **DOES NOT EXIST; correct route is `/provisioning-failures`** |
| Navigation method | `window.open(url, '_blank')` |

### Gaps

1. **Multi-run disambiguation**: `projectId` alone selects the first matching run. If multiple runs exist for the same project, the wrong run may be selected.
2. **URLSearchParams deviation**: The Admin page uses manual `URLSearchParams` instead of TanStack Router's `useSearch()` even though the route already has `validateSearch()`.
3. **Estimating dead link**: The "Open Admin Recovery" button navigates to `/provisioning-oversight`, which does not exist in the Admin app.
4. **Duplicated utility**: `crossAppUrls.ts` is copied between accounting and estimating instead of being in a shared package.

---

## Current Admin Recovery Action Model

All actions are in `apps/admin/src/pages/ProvisioningOversightPage.tsx`.

### Force Retry (line 238–243)
- Calls `client.retryProvisioning(projectId)` via `runAction()`.
- Fire-and-forget (HTTP 202). The saga creates a new run with new `correlationId`, increments `retryCount`, and sets `lastRetryAt`.
- Admin UI shows retry counter: `Retry (${run.retryCount}/${ADMIN_RETRY_CEILING})`.
- Disabled when retries exhausted.
- Confirmation modal with idempotency risk warning.

### Archive Failure (line 245–250)
- Calls `client.archiveFailure(projectId)`.
- Sets `overallStatus = 'Completed'` + `completedAt`. Reconciles request state to `Completed` (P4-04).
- Removes the run from the failures view.
- Confirmation required.

### Acknowledge Escalation (line 252–257)
- Calls `client.acknowledgeEscalation(projectId)`.
- Clears `escalatedBy` and `escalatedAt` — annotation cleanup only, no state change.
- Immediate action (no confirmation modal).
- Only visible when `run.escalatedBy` is set.

### Manual State Override (line 259–270)
- Calls `client.forceStateTransition(projectId, targetState)`.
- Expert-tier only (`HbcComplexityGate minTier="expert"`).
- Available when request is stuck in non-terminal state.
- Valid targets: `NotStarted | InProgress | BaseComplete | Completed | Failed | WebPartsPending`.
- Reconciles request state on terminal targets (Completed/Failed) via P4-04.
- Confirmation dialog with danger warning.

### View Full Diagnostics
- Display-only, expert-tier gated.
- Shows step-level detail, failure metadata, retry history.

---

## Shared Exception-Action Model

### Coordinator Retry (Estimating)

The coordinator retry path is bounded by the 5-condition `canCoordinatorRetry()` check in `failureClassification.ts:40–52`:

1. `status.overallStatus === 'Failed'`
2. `status.failureClass !== undefined` (spec R1)
3. `status.failureClass === 'transient'`
4. `status.retryCount < 2` (`MAX_COORDINATOR_RETRIES`)
5. `status.escalatedBy == null`

When all five conditions pass, the coordinator can call `client.retryProvisioning(projectId)` — the **same backend endpoint** that Admin's Force Retry uses.

When conditions fail, the coordinator sees the escalation banner with:
- Failure class description from `FAILURE_CLASS_DESCRIPTIONS`.
- "Escalate to Admin" button → `client.escalateProvisioning(projectId, escalatedBy)`.
- "Open Admin Recovery" link → **broken** (navigates to wrong route).

### Escalation (Estimating → Admin)

Escalation is an **annotation-only** action:
- Sets `escalatedBy` (caller's UPN) and `escalatedAt` on the latest provisioning run.
- Does **not** change `overallStatus` or request state.
- Only Admin can clear via `acknowledgeEscalation()`.
- Escalation is a **one-way marker** from coordinator perspective — there is no coordinator-side undo.

### Failure Class Taxonomy

| Class | Badge | Coordinator Action | Admin Action |
|-------|-------|-------------------|-------------|
| `transient` | warning | Retry (max 2) | Force retry (unbounded up to ceiling) |
| `structural` | error | Escalate | Force retry, archive, force-state |
| `permissions` | error | Escalate | Force retry, archive, force-state |
| `repeated` | info | Escalate | Force retry, archive, force-state |
| `admin-class` | error | Escalate | Force retry, archive, force-state |

### Key Boundary Facts

- `retryProvisioning` and `escalateProvisioning` are **shared endpoints** — not Admin-exclusive.
- Archive, acknowledge-escalation, and force-state are **true Admin-exclusive** actions (L3 role enforcement).
- Coordinator retry is **frontend-bounded** (5-condition gate); the backend imposes no such limit.

---

## Authorization Model Summary

| Endpoint | Route | Frontend Gate | Backend Gate | Gap |
|----------|-------|---------------|-------------|-----|
| retryProvisioning | `POST /provisioning-retry/{projectId}` | `canCoordinatorRetry()` (Estimating) | L2 scope only | No backend role or state check |
| escalateProvisioning | `POST /provisioning-escalate/{projectId}` | `failureClass` defined (Estimating) | L2 scope only | No backend role, state, or failureClass check |
| archiveFailure | `POST /provisioning-archive/{projectId}` | Admin app only | L2 + L3 Admin | None |
| acknowledgeEscalation | `POST /provisioning-escalation-ack/{projectId}` | Admin app only | L2 + L3 Admin | None |
| forceStateTransition | `POST /provisioning-force-state/{projectId}` | Admin app only + Expert tier | L2 + L3 Admin | None |
| listProvisioningRuns | `GET /provisioning-runs` | Admin app only | L2 + L3 Admin | None |
| State transition (reopen) | `PATCH /project-setup-requests/{id}/state` | Controller/Admin UI | Role-based (`resolveRequestRole`) | None |

**Critical finding**: Any user with `access_as_user` scope can call `retryProvisioning` and `escalateProvisioning` directly (bypassing frontend gating). This is acceptable given:
- Retry is idempotent (new run, completed-step skipping).
- Escalation is annotation-only.
- Both are low-risk actions with auditable side effects.

However, the backend does **not validate** that provisioning is in `Failed` state before retry, meaning a successful run could theoretically be retried.

---

## Lifecycle/Status Interaction Summary

### Request State ↔ Provisioning Status

| Request State | Provisioning Status | Reconciliation |
|---------------|-------------------|----------------|
| ReadyToProvision | null or Failed | Backend auto-triggers saga if missing or Failed |
| Provisioning | InProgress | Saga reconciles request to Provisioning at start |
| Provisioning | WebPartsPending | Step 5 deferred — request stays Provisioning, **no reconciliation** |
| Completed | Completed | Saga reconciles request to Completed at terminal |
| Failed | Failed | Saga compensates and reconciles request to Failed |

### Drift Risks

1. **Escalation persists across retries**: When a coordinator escalates and then a retry is triggered, the `escalatedBy` marker is not cleared. It persists on the latest run even after retry succeeds. Admin must manually acknowledge.

2. **Reopen does not reset provisioning**: When a controller reopens a failed request (`Failed → UnderReview`), provisioning status is **not touched**. If the old status is `Completed` or `WebPartsPending` (not `Failed`), auto-trigger on re-approval will be skipped — manual admin intervention required.

3. **Step 5 deferral gap**: When Step 5 defers to the timer, request stays `Provisioning` while provisioning status moves to `WebPartsPending`. The site may be partially created (Steps 1–4, 6–7 completed) but the request shows "provisioning in progress."

4. **Archive/force-state reconcile but don't validate source state**: Both archive and force-state load the provisioning status and mutate it, then reconcile the request. Neither validates that the provisioning status was in a specific state before mutation.

---

## Contradictions and Unresolved Issues

### Issue 1 — Backend retry/escalate lack admin-role enforcement
- **Severity:** Moderate
- **Files:** `backend/functions/src/functions/provisioningSaga/index.ts:194–196, 241–243`
- **Finding:** Both endpoints enforce only `requireDelegatedScope()`. Any authenticated user can invoke them.
- **Recommended prompt:** P5-03

### Issue 2 — Retry does not validate provisioning state
- **Severity:** Low–Moderate
- **Files:** `backend/functions/src/functions/provisioningSaga/index.ts:185–225`
- **Finding:** No check that `overallStatus === 'Failed'` before retry. Saga idempotency guards provide partial mitigation.
- **Recommended prompt:** P5-03

### Issue 3 — Escalation is annotation-only with no state validation
- **Severity:** Low
- **Files:** `backend/functions/src/functions/provisioningSaga/index.ts:232–266`
- **Finding:** No validation that provisioning failed or that `failureClass` is defined. Annotation applied unconditionally.
- **Recommended prompt:** P5-04

### Issue 4 — Escalation persists across retries
- **Severity:** Low
- **Files:** `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` (retry method)
- **Finding:** `escalatedBy` is not cleared when retry starts. Admin must manually acknowledge.
- **Recommended prompt:** P5-04

### Issue 5 — Step 5 deferral does not reconcile request state
- **Severity:** Low (documented design decision)
- **Files:** `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- **Finding:** Request stays `Provisioning` when provisioning moves to `WebPartsPending`. P4-01 documented this as accepted.
- **Recommended prompt:** P5-04 (verify and document)

### Issue 6 — Request reopen does not reset provisioning status
- **Severity:** Moderate
- **Files:** `backend/functions/src/functions/projectRequests/index.ts`, `backend/functions/src/state-machine.ts:18`
- **Finding:** Controller reopens request (`Failed → UnderReview`), but provisioning status stays as-is. If status is not `Failed`, re-approval will not auto-trigger saga.
- **Recommended prompt:** P5-04

### Issue 7 — Admin page uses manual URLSearchParams instead of useSearch()
- **Severity:** Low
- **Files:** `apps/admin/src/pages/ProvisioningOversightPage.tsx:177–178`, `apps/admin/src/router/routes.ts:43–44`
- **Finding:** Route already has `validateSearch()` but the page bypasses it. Functionally correct but deviates from architectural spec.
- **Recommended prompt:** P5-02

### Issue 8 — Multi-run disambiguation gap
- **Severity:** Low–Moderate
- **Files:** `apps/admin/src/pages/ProvisioningOversightPage.tsx:180`
- **Finding:** `allRuns.find(r => r.projectId === projectId)` selects first match. Multiple runs for one project may select the wrong run.
- **Recommended prompt:** P5-02

### Issue 9 — Estimating "Open Admin Recovery" links to wrong route
- **Severity:** High (dead link in production)
- **Files:** `apps/estimating/src/components/project-setup/RetrySection.tsx:88`
- **Finding:** Links to `/provisioning-oversight?projectId=` but Admin route is `/provisioning-failures`. This is a 404 in production.
- **Recommended prompt:** P5-02

### Issue 10 — crossAppUrls.ts duplicated across apps
- **Severity:** Low
- **Files:** `apps/accounting/src/utils/crossAppUrls.ts`, `apps/estimating/src/utils/crossAppUrls.ts`
- **Finding:** Identical utility duplicated instead of being in a shared package. Risk of divergence.
- **Recommended prompt:** P5-02

### Issue 11 — state-machine.md table header mislabels WebPartsPending
- **Severity:** Low (documentation only)
- **Files:** `docs/reference/provisioning/state-machine.md`
- **Finding:** Table header may list `WebPartsPending` under terminal states, but live code and durable-status-contract.md correctly show it as non-terminal.
- **Recommended prompt:** P5-05

---

## Recommended Implementation Targets for Prompt-02 through Prompt-05

### P5-02 — Cross-App Failure Routing and Context Handoff

| Target | Issue # | Action |
|--------|---------|--------|
| Fix Estimating dead link | 9 | Change `/provisioning-oversight` to `/provisioning-failures` in RetrySection.tsx |
| Replace URLSearchParams with useSearch() | 7 | Use TanStack Router search params in ProvisioningOversightPage |
| Multi-run disambiguation | 8 | Evaluate whether to pass `correlationId` or select latest run by `startedAt` |
| crossAppUrls duplication | 10 | Evaluate shared package extraction or accept duplication with documentation |

### P5-03 — Admin Recovery Action Boundary and Authorization Hardening

| Target | Issue # | Action |
|--------|---------|--------|
| Backend auth gap on retry | 1 | Decide whether to add role check or document intentional shared access |
| Retry state validation | 2 | Add `overallStatus === 'Failed'` guard on retry endpoint |
| Escalation state validation | 3 | Add `overallStatus === 'Failed'` and `failureClass` check on escalation endpoint |

### P5-04 — Escalation Ownership and Reopen Lifecycle Integration

| Target | Issue # | Action |
|--------|---------|--------|
| Escalation persistence across retries | 4 | Decide whether to auto-clear on retry or document as intentional |
| Step 5 deferral reconciliation | 5 | Verify and document the accepted design decision |
| Reopen does not reset provisioning | 6 | Add provisioning status reset on reopen, or document the manual recovery path |

### P5-05 — Exception UX and Operational Verification

| Target | Issue # | Action |
|--------|---------|--------|
| state-machine.md terminal-state label | 11 | Fix documentation table header |
| Doc gaps (JSDoc, escalation asymmetry, idempotency) | — | Update coordinator-visibility-spec.md and api-client.ts |
| Operator messaging verification | — | Verify cross-app messaging reinforces correct ownership model |

---

## Answers to Required Questions

### Q1: What exactly does Accounting pass when it routes a failed case to Admin?
Accounting passes **only `projectId`** as a URL query parameter: `?projectId={projectId}`. No `runId`, `correlationId`, failure class, or other context is included. The URL opens Admin's `/provisioning-failures` route in a new tab.

### Q2: What exactly does Admin use to resolve the inbound case?
Admin extracts `projectId` from the URL, loads all provisioning runs via `listProvisioningRuns()` or `listFailedRuns()`, and auto-selects the first run matching `projectId`. Admin then presents the five recovery actions (force retry, archive, acknowledge escalation, manual state override, diagnostics).

### Q3: Is the current route-in contract sufficient if multiple provisioning runs exist for the same project?
**No.** The current contract uses `projectId` only, and the Admin page selects `allRuns.find(r => r.projectId === projectId)` — the first array match. In a multi-run scenario (sequential retries creating new `correlationId` rows), this may not select the latest or most relevant run. The selection should prefer the latest run by `startedAt`.

### Q4: Which exception actions are truly Admin-exclusive in the live repo?
Three actions are Admin-exclusive (L3 admin-role enforcement): **archive failure**, **acknowledge escalation**, and **manual state override**. Additionally, **list provisioning runs** and **list failed runs** are Admin-gated.

### Q5: Which exception actions are shared with Estimating/requester flows?
**Retry provisioning** and **escalate provisioning** are shared. Both endpoints enforce only L2 delegated-scope checks. Estimating's `RetrySection.tsx` calls these endpoints with frontend-only coordinator gating.

### Q6: Which backend routes are broader than the Admin UI language implies?
`retryProvisioning` and `escalateProvisioning` are accessible to any authenticated user with `access_as_user` scope — not just Admin. The Admin UI labels these as admin recovery actions, but the backend authorization is broader.

### Q7: What request/provisioning drift risks already exist after recovery/status actions?
Four drift scenarios exist: (1) escalation persists across retries, (2) reopen does not reset provisioning status, (3) Step 5 deferral leaves request in `Provisioning` while status is `WebPartsPending`, (4) archive/force-state reconcile request state but don't validate source state first. See Lifecycle/Status Interaction Summary.

### Q8: What current docs overstate the maturity or exclusivity of the Admin exception path?
No docs **materially** overstate maturity. The admin-recovery-boundary.md correctly documents Admin-exclusive actions and known diagnostic gaps. The coordinator-visibility-spec.md correctly bounds coordinator retry. However, the documentation does not explicitly state that retry and escalation are **shared endpoints** — the Admin boundary doc implies all five actions are Admin-exclusive, when two are not. The state-machine.md may mislabel `WebPartsPending` as terminal in a table header.

---

## Exact Files Inspected

### Backend
- `backend/functions/src/functions/provisioningSaga/index.ts` — retry, escalate, archive, force-state, acknowledge endpoints
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` — saga execution, compensation, retry method
- `backend/functions/src/functions/projectRequests/index.ts` — request lifecycle, reopen, auto-trigger
- `backend/functions/src/middleware/authorization.ts` — role checks, scope enforcement, ownership
- `backend/functions/src/state-machine.ts` — request state transitions, role-based authorization

### Frontend — Accounting
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` — "Send to Admin" button, failed state rendering
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` — "Failed / Needs Routing" tab
- `apps/accounting/src/utils/crossAppUrls.ts` — cross-app URL resolution
- `apps/accounting/src/utils/stateDisplayHelpers.ts` — failed state context text

### Frontend — Admin
- `apps/admin/src/router/routes.ts` — route definition, `validateSearch()`, auth gate
- `apps/admin/src/router/root-route.tsx` — nav label "Provisioning Oversight"
- `apps/admin/src/pages/ProvisioningOversightPage.tsx` — query param handling, recovery actions, auto-selection
- `apps/admin/src/bootstrap.ts` — feature flags

### Frontend — Estimating
- `apps/estimating/src/pages/RequestDetailPage.tsx` — failure card + retry section rendering
- `apps/estimating/src/components/project-setup/RetrySection.tsx` — coordinator retry/escalation UI, dead admin link
- `apps/estimating/src/utils/failureClassification.ts` — `canCoordinatorRetry()`, failure class taxonomy
- `apps/estimating/src/utils/crossAppUrls.ts` — duplicate cross-app URL utility

### Packages
- `packages/provisioning/src/api-client.ts` — provisioning API client interface

### Documentation
- `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- `docs/reference/spfx-surfaces/controller-review-surface.md`
- `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- `docs/reference/provisioning/durable-status-contract.md`
- `docs/reference/provisioning/state-machine.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`
- `docs/architecture/reviews/phase-4-durable-status-contract-and-run-correlation-report.md`
- `docs/architecture/reviews/phase-4-accounting-admin-status-compatibility-report.md`
