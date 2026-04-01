# Phase 1 — Application Boundary and Role Responsibility Freeze

**Phase:** Phase 1 — Workflow Contract and Boundary Freeze
**Prompt:** Prompt-03
**Date:** 2026-04-01
**Classification:** Freeze Decision Record (contract-freeze artifact)
**Depends on:** `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md`

---

## 1. Executive Summary

The application boundary, role responsibility map, and action ownership model for the Project Setup workflow are frozen against repo truth as of 2026-04-01.

The current repo cleanly separates four domains: Accounting owns controller review and approval-to-handoff; Estimating owns requester submission and bounded coordinator retry/escalation; Admin owns authoritative operational recovery; and the backend with `@hbc/provisioning` owns system transitions, lifecycle enforcement, and shared lifecycle state. These boundaries are already well-implemented in code and mostly well-documented, with two notable gaps: the `AwaitingExternalSetup → ReadyToProvision` transition is contract-valid and controller-authorized but not exposed in any live UI, and the surface docs do not all carry explicit boundary cross-references.

Accounting is both a review gate and an approval-to-handoff gate. It is not a recovery surface. Failed requests route to Admin via navigation, not via state transition. The Estimating coordinator surface handles bounded transient-failure retry (max 2 attempts, transient class only) and escalation to Admin, but does not perform approval, review, or full recovery. Admin owns force retry (regardless of failure class), archival, escalation acknowledgment, and expert-tier diagnostic override.

---

## 2. Surface Responsibility Matrix

| Domain | Responsible For | Not Responsible For |
|--------|----------------|-------------------|
| **Accounting** | Controller review, approve (with projectNumber), request clarification, place on hold, route failed to Admin | Retry, recovery, escalation, archive, state override, requester submission |
| **Estimating** | Requester submission (wizard), coordinator queue visibility, bounded transient retry (max 2), escalation to Admin | Approval, review, hold, full recovery, archive, state override |
| **Admin** | Force retry (any failure class), archive failure, acknowledge escalation, manual state override, expert diagnostics | Requester submission, approval, review, clarification |
| **Backend orchestration** | Transition validation, role-based authorization, auto-trigger saga, saga execution, state reconciliation | UI rendering, user-facing action decisions |
| **`@hbc/provisioning`** | Shared lifecycle types, state machine, BIC config, notification registrations, API client, display helpers | Surface-specific composition, recovery logic, approval UI |

**Classification:** Confirmed repo fact.
**Evidence:** `controller-review-surface.md`, `coordinator-visibility-spec.md`, `admin-recovery-boundary.md`, `bic-config.ts`, `projectRequests/index.ts`, `saga-orchestrator.ts`.

---

## 3. State-by-State Visible Action Matrix

What actions are currently visible in each surface's UI for each request state:

| Request State | Accounting (Controller) | Estimating (Coordinator) | Estimating (Requester) | Admin |
|--------------|------------------------|-------------------------|----------------------|-------|
| `Submitted` | — (not in queue filter) | Queue visibility | Queue visibility | — |
| `UnderReview` | Approve, Request Clarification, Place on Hold | Queue visibility | Queue visibility | — |
| `NeedsClarification` | Queue visibility (tab) | "Awaiting Response" text | Resubmit action | — |
| `AwaitingExternalSetup` | Queue visibility (tab), **no forward action** | Queue visibility | Queue visibility | — |
| `ReadyToProvision` | — (system-owned, not in queue filter) | — | — | Active Runs tab |
| `Provisioning` | — (system-owned, not in queue filter) | Progress tracking (SignalR) | Progress tracking | Active Runs tab |
| `Completed` | — | Completion card, Project Hub handoff | Completion card | Completed tab |
| `Failed` | Route to Admin ("Send to Admin") | Retry (if eligible), Escalate (if not retryable) | — | Force Retry, Archive, Ack Escalation, State Override |

**Classification:** Confirmed repo fact.
**Evidence:** `ProjectReviewDetailPage.tsx` action panel, `ProjectReviewQueuePage.tsx` tab filters, `coordinator-visibility-spec.md` sections 1-2, `admin-recovery-boundary.md` action table.

---

## 4. State-by-State Authorized Transition Matrix

What transitions are authorized per role in the backend, regardless of UI exposure:

| From State | To State | admin | controller | submitter | system |
|-----------|----------|-------|------------|-----------|--------|
| `Submitted` | `UnderReview` | Yes | Yes | No | No |
| `UnderReview` | `NeedsClarification` | Yes | Yes | No | No |
| `UnderReview` | `AwaitingExternalSetup` | Yes | Yes | No | No |
| `UnderReview` | `ReadyToProvision` | Yes | Yes | No | No |
| `NeedsClarification` | `UnderReview` | Yes | No | Yes | No |
| `AwaitingExternalSetup` | `ReadyToProvision` | Yes | Yes | No | No |
| `ReadyToProvision` | `Provisioning` | Yes | No | No | Yes |
| `Provisioning` | `Completed` | Yes | No | No | Yes |
| `Provisioning` | `Failed` | Yes | No | No | Yes |
| `Failed` | `UnderReview` | Yes | Yes | No | No |

**Classification:** Confirmed repo fact.
**Evidence:** `backend/functions/src/state-machine.ts` lines 73-103 (`CONTROLLER_TRANSITIONS`, `isAuthorizedTransition`).

---

## 5. State-by-State Authoritative Owner Matrix

Who holds the ball-in-court (BIC) for each state:

| State | BIC Owner | BIC Role | Urgency Tier | Meaning |
|-------|-----------|----------|-------------|---------|
| `Submitted` | Controller | Controller | watch | Awaiting initial review pickup |
| `UnderReview` | Controller | Controller | watch | Active review in progress |
| `NeedsClarification` | Submitter | Requester | immediate | Requester must respond |
| `AwaitingExternalSetup` | Controller | Controller | watch | Blocked on external prerequisites |
| `ReadyToProvision` | System (null) | — | null | Auto-triggered handoff; no human owner |
| `Provisioning` | System (null) | — | null | Saga executing; no human owner |
| `Completed` | Project Lead | Project Lead | upcoming | Handoff to project site |
| `Failed` | Admin | Admin | immediate | Requires investigation or recovery |

**Classification:** Confirmed repo fact.
**Evidence:** `packages/provisioning/src/bic-config.ts` lines 44-55 (urgency map), lines 76-99 (owner derivation function).

---

## 6. State-by-State System Transition Matrix

Transitions that are system-owned and not initiated by any user action:

| From | To | Mechanism | Owner |
|------|----|-----------|-------|
| `ReadyToProvision` | `Provisioning` | `SagaOrchestrator.reconcileRequestState()` | Saga |
| `Provisioning` | `Completed` | `SagaOrchestrator.reconcileRequestState()` with `siteUrl` | Saga |
| `Provisioning` | `Failed` | Saga compensation via `reconcileRequestState()` | Saga |

The `advanceRequestState` API handler never directly sets `Provisioning`, `Completed`, or `Failed`. Only the saga's internal `reconcileRequestState` method performs these transitions. The auto-trigger from `ReadyToProvision` is fire-and-forget within the `advanceRequestState` handler, but the actual state change to `Provisioning` is saga-owned.

**Classification:** Confirmed repo fact.
**Evidence:** `saga-orchestrator.ts` lines 100-101 (→ Provisioning), 287-293 (→ Completed), 479 (→ Failed).

---

## 7. Accounting Scope

### Accounting IS

- A **review gate**: controllers examine request details, team composition, contract info, and project metadata before deciding to advance.
- An **approval-to-handoff gate**: the approve action captures `projectNumber` (##-###-##), advances to `ReadyToProvision`, and the backend auto-triggers the provisioning saga. Approval is the last controller action before system takeover.
- A **clarification surface**: controllers can request clarification with structured items and notes.
- A **hold surface**: controllers can place requests in `AwaitingExternalSetup` for external prerequisites.
- A **failed-request routing surface**: for failed requests, the controller navigates to Admin via "Send to Admin" — this is **navigation only**, not a state transition.

### Accounting IS NOT

- A retry or recovery surface. Accounting never calls `retryProvisioning()`.
- An archive surface. Accounting never calls `archiveFailure()`.
- An escalation surface. Accounting never calls `escalateProvisioning()`.
- A state-override surface. Accounting never calls `forceStateTransition()`.
- A submission surface. Request intake is Estimating-only.

### Current Accounting Queue Tabs

| Tab | State Filter | Purpose |
|-----|-------------|---------|
| Pending Review | `UnderReview` | Active review queue |
| Awaiting Re-Submission | `NeedsClarification` | Clarification pending |
| Awaiting External Setup | `AwaitingExternalSetup` | External prerequisites |
| Failed / Needs Routing | `Failed` | Route to Admin |

System-owned states (`ReadyToProvision`, `Provisioning`, `Completed`) are not in the Accounting queue.

**Classification:** Confirmed repo fact.
**Evidence:** `ProjectReviewQueuePage.tsx` tab configuration, `ProjectReviewDetailPage.tsx` action panel, `controller-review-surface.md`.

---

## 8. Estimating Scope

### Estimating Requester Surface

- Submission wizard (5-step request intake)
- Request detail visibility (read-only after submission)
- Resubmit from `NeedsClarification` → `UnderReview`
- Completion card and Project Hub handoff on `Completed`

### Estimating Coordinator Surface

- Queue visibility with `HbcDataTable` (standard+ tier)
- **Bounded transient retry**: `retryProvisioning(projectId)` — only when ALL five conditions met:
  1. `overallStatus === 'Failed'`
  2. `failureClass !== undefined`
  3. `failureClass === 'transient'`
  4. `retryCount < 2`
  5. `escalatedBy == null`
- **Escalation to Admin**: `escalateProvisioning(projectId, escalatedBy)` — when not retryable and failureClass is defined
- Failure detail card (standard tier): failed step, classification, error message, retry count
- Provisioning progress tracking (SignalR checklist)

### Estimating IS NOT

- An approval or review surface
- A hold or clarification-request surface
- A full recovery surface (force retry, archive, state override are Admin-only)
- An escalation-acknowledgment surface

**Classification:** Confirmed repo fact.
**Evidence:** `coordinator-visibility-spec.md` sections 1-4, `canCoordinatorRetry` 5-condition check (section 4).

---

## 9. Admin Scope

### Admin Owns

- **Force retry** (any failure class, no bounded limit): `retryProvisioning(projectId)` with danger confirmation
- **Archive failure**: `archiveFailure(projectId)` with warning confirmation
- **Acknowledge escalation**: `acknowledgeEscalation(projectId)` (immediate, no confirmation)
- **Manual state override** (expert-tier only): `forceStateTransition(projectId, targetState)` with danger confirmation and data-inconsistency warning
- Full provisioning run oversight: active, failed, completed, all tabs
- Expert-tier diagnostics: step error messages, metadata, Entra group IDs, correlation IDs, deferred-timer status

### Admin Cross-App Entry Points

- Estimating coordinator "Open Admin Recovery" button → navigates with `?projectId=` query param
- Accounting controller "Send to Admin" button → navigates with `?projectId=` query param

### Admin IS NOT

- A request intake surface (Estimating)
- An approval, review, or clarification surface (Accounting)
- A bounded retry surface (coordinator retry is Estimating)
- A requester status view (Estimating)

**Classification:** Confirmed repo fact.
**Evidence:** `admin-recovery-boundary.md` action table, role boundary table, and route/query-param documentation.

---

## 10. Backend and `@hbc/provisioning` Scope

### Backend Orchestration Owns

- **Transition validation**: `isValidTransition()` enforces the state machine
- **Role-based authorization**: `resolveRequestRole()` + `isAuthorizedTransition()` — JWT app-role claims, not env-var allowlists
- **ProjectNumber validation**: server-side `##-###-##` enforcement for `ReadyToProvision`
- **Auto-trigger**: fire-and-forget saga instantiation on `ReadyToProvision` with idempotency guard
- **Saga execution**: 7-step provisioning with retry, compensation, and state reconciliation
- **Authorization telemetry**: structured `authz.decision` and `authz.break_glass` events

### `@hbc/provisioning` (Shared Package) Owns

- **Type definitions**: `ProjectSetupRequestState`, `IProjectSetupRequest`, `IProvisioningStatus`
- **State machine**: `STATE_TRANSITIONS`, `isValidTransition()`
- **BIC configuration**: `PROJECT_SETUP_BIC_CONFIG`, `deriveCurrentOwner()`, urgency tiers
- **Notification registrations**: `PROVISIONING_NOTIFICATION_REGISTRATIONS`, 8-event contract
- **Display helpers**: state labels, badge variants, department labels, kebab-case mapping
- **API client**: `IProvisioningApiClient` (advanceState, retryProvisioning, escalateProvisioning, listRequests, etc.)
- **Store**: provisioning request store (Zustand)
- **Summary field registry**: field-level display configuration

### Neither Domain Owns Surface-Specific Decisions

Backend and `@hbc/provisioning` do not decide which actions are visible in which surface. They provide the contract (valid transitions, authorization) and the shared infrastructure (types, client, BIC). Surfaces compose these to build their own action panels.

**Classification:** Confirmed repo fact.
**Evidence:** `backend/functions/src/state-machine.ts`, `backend/functions/src/middleware/authorization.ts`, `packages/provisioning/src/state-machine.ts`, `packages/provisioning/src/bic-config.ts`.

---

## 11. Current Live Gap Register

| ID | Gap | Contract Status | Authorization | UI Status | Impact |
|----|-----|----------------|---------------|-----------|--------|
| G-01 | `AwaitingExternalSetup → ReadyToProvision` in Accounting | Valid transition in state machine | Controller-authorized (backend line 78) | **Not exposed** in Accounting detail page | Controller cannot approve from hold state without Admin intervention or workaround |
| G-02 | Admin backend endpoints deferred | T04 spec defines actions | N/A | UI rendered with API methods | `archiveFailure`, `acknowledgeEscalation`, `forceStateTransition` backend implementation deferred to G2 |
| G-03 | Expert diagnostic fields incomplete | Spec §7.1 defines fields | N/A | Conditional rendering | `errorDetails`, `stepContext`, Graph API sequence not on `IProvisioningStatus` model |

### G-01 Detail: `AwaitingExternalSetup → ReadyToProvision`

This is the most material boundary gap for Prompt-03:

- **State machine**: `AwaitingExternalSetup` → `ReadyToProvision` is a defined valid transition (`packages/provisioning/src/state-machine.ts` line 23)
- **Backend authorization**: listed in `CONTROLLER_TRANSITIONS` (`backend/functions/src/state-machine.ts` line 78) — controller-authorized
- **BIC ownership**: `AwaitingExternalSetup` owner is Controller (`bic-config.ts` line 80)
- **Accounting UI**: detail page action panel does NOT render any action when `request.state === 'AwaitingExternalSetup'`
- **Classification**: confirmed repo fact (gap) + confirmed repo-doc intent (deferred to later phases per lifecycle freeze decision)

No other surface currently exposes this transition either. It is a documented gap across all surfaces.

**Classification:** Confirmed repo fact (all three gaps).

---

## 12. Prohibited Boundary Drift

The following boundary violations are explicitly prohibited by this freeze:

1. **Accounting must not gain retry or recovery actions.** No `retryProvisioning()`, `archiveFailure()`, `forceStateTransition()`, or `acknowledgeEscalation()` calls may be added to the Accounting surface. Failed requests route to Admin via navigation.

2. **Estimating coordinator retry must remain bounded.** The 5-condition check (`canCoordinatorRetry`) is the contract. Coordinator retry must not bypass the transient-class, max-2, and not-escalated guards.

3. **Admin must not gain approval or review actions.** Admin is the recovery surface, not a review gate. Request approval with `projectNumber` capture is Accounting-only.

4. **No surface may directly set system-owned states.** `Provisioning`, `Completed`, and `Failed` are saga-owned transitions. No user-facing API call should perform these transitions except through the saga's `reconcileRequestState`.

5. **Backend authorization must remain claims-based.** Role resolution uses JWT app-role claims (`isAdmin`, `isController`, `isBreakGlass`) and `oid`-based ownership checks. Env-var allowlists (`CONTROLLER_UPNS`, `ADMIN_UPNS`) are for notification routing only, not authorization.

6. **`@hbc/provisioning` must not contain surface-specific composition.** The shared package provides types, state machine, BIC config, API client, and display helpers. Surface-specific action panels, modals, and routing belong in the consuming app.

7. **Cross-feature direct dependencies must not form.** Accounting, Estimating, and Admin communicate via navigation (query params) and shared backend state, not via direct package imports of each other's components.

**Classification:** Confirmed repo-doc intent (constraints 1-4, 6-7) + confirmed repo fact (constraint 5).

---

## 13. Phase 2 Implications

The following boundary facts carry forward to Phase 2 (Backend Lifecycle Hardening) and later phases:

1. **G-01 must be resolved.** The `AwaitingExternalSetup → ReadyToProvision` transition is controller-authorized but unexposed. Phase 3 (Accounting App Functional Completion) should decide whether to add the UI affordance in Accounting, move it to another surface, or document it as intentionally backend-only.

2. **G-02 backend endpoints must be implemented.** Admin recovery actions (`archiveFailure`, `acknowledgeEscalation`, `forceStateTransition`) have UI but no backend implementation. Phase 2 backend hardening should prioritize these.

3. **Coordinator retry boundary is load-bearing.** The 5-condition bounded retry is a deliberate safety mechanism. Phase 2 must not weaken the guards without explicit architectural justification.

4. **Role resolution is the authorization contract.** `resolveRequestRole` → `isAuthorizedTransition` is the single authorization path for state transitions. Phase 2 backend hardening should not introduce parallel authorization paths.

5. **Navigation-based cross-app routing is the pattern.** Accounting → Admin and Estimating → Admin routing uses navigation with `?projectId=` query params, not shared state or direct component imports. This pattern should be preserved.

---

## Verification

### Files Reviewed

| File | Purpose |
|------|---------|
| `apps/accounting/src/pages/ProjectReviewQueuePage.tsx` | Queue tabs, filters, column configuration |
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Action panel, approve flow, state-conditional rendering |
| `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx` | Queue behavior test coverage |
| `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx` | Action and state-transition test coverage |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Accounting surface spec |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Estimating coordinator surface spec |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Admin recovery surface spec |
| `packages/provisioning/src/bic-config.ts` | BIC ownership, urgency tiers |
| `packages/provisioning/src/state-machine.ts` | Shared state definitions and transitions |
| `backend/functions/src/functions/projectRequests/index.ts` | advanceRequestState handler, auto-trigger |
| `backend/functions/src/state-machine.ts` | Backend transitions, role resolution, authorization |
| `backend/functions/src/middleware/authorization.ts` | App-role constants, role checks, ownership, scope, telemetry |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | System-owned transitions |
| `docs/architecture/blueprint/current-state-map.md` | Authority hierarchy |
| `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` | Lifecycle freeze (Prompt-02 dependency) |

### Files Updated

| File | Change |
|------|--------|
| `docs/architecture/reviews/phase-1-application-boundary-freeze.md` | Created (this document) |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Added boundary freeze cross-reference |
| `docs/reference/spfx-surfaces/coordinator-visibility-spec.md` | Added boundary freeze cross-reference |
| `docs/reference/spfx-surfaces/admin-recovery-boundary.md` | Added boundary freeze cross-reference |

### Boundary Questions Answered

All 14 boundary questions from Prompt-03 spec are answered:

1. Accounting owns: Section 7
2. Estimating owns: Section 8
3. Admin owns: Section 9
4. Backend orchestration owns: Section 10
5. `@hbc/provisioning` owns: Section 10
6. Accounting visible actions: Section 3 (Accounting column)
7. Estimating visible actions: Section 3 (Estimating columns)
8. Admin visible actions: Section 3 (Admin column)
9. System transitions: Section 6
10. Valid but not exposed: Section 11 (G-01)
11. Prohibited from Accounting: Section 12 (items 1, 3)
12. Accounting is both review gate and approval-to-handoff gate: Section 7
13. `AwaitingExternalSetup → ReadyToProvision`: Section 11 G-01 detail
14. Role-resolution model meaning: Section 4 + Section 10

### Remaining Ambiguities

- **G-01 resolution surface**: Whether the `AwaitingExternalSetup → ReadyToProvision` forward action belongs in Accounting, Admin, or another surface is deferred to Phase 3.
- **G-02 backend timeline**: Admin backend endpoint implementation timeline is a Phase 2 decision.
