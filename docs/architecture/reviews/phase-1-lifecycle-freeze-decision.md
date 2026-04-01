# Phase 1 — Request Lifecycle and Provisioning Trigger Freeze Decision

**Phase:** Phase 1 — Workflow Contract and Boundary Freeze
**Prompt:** Prompt-02
**Date:** 2026-04-01
**Classification:** Freeze Decision Record (contract-freeze artifact, not a historical plan)

---

## 1. Final Decision Summary

The Accounting-side Project Setup request lifecycle and provisioning trigger semantics are frozen against the current repo truth as of 2026-04-01.

Controller approval is not a bare state change. The Accounting detail page captures a human-assigned `projectNumber` in `##-###-##` format, validates it client-side, and calls `advanceState(requestId, 'ReadyToProvision', { projectNumber })`. The backend validates the same pattern server-side, persists the project number and derived year on the request record, and then immediately auto-triggers the provisioning saga via fire-and-forget execution — unless an active non-failed provisioning status already exists.

The saga owns all system-side progression from that point forward. It reconciles the request record to `Provisioning`, executes 7 provisioning steps with retry and compensation, and reconciles to `Completed` or `Failed` at termination. Both `ReadyToProvision` and `Provisioning` are system-owned states in the BIC model — they resolve to `null` owner and `null` urgency tier, meaning no human ball-in-court assignment exists for these states.

There is no distinct controller-side "launch provisioning" action in the current repo. Any documentation that implies a manual trigger post-approval is stale or limited in scope. The auto-trigger in `advanceRequestState` is the authoritative contract.

---

## 2. Frozen State Definitions

| State | Owner (BIC) | Urgency Tier | Meaning |
|-------|-------------|-------------|---------|
| `Submitted` | Controller | watch | New request awaiting initial review |
| `UnderReview` | Controller | watch | Controller actively reviewing; approve, clarify, hold, or route actions available |
| `NeedsClarification` | Requester | immediate | Requester must respond to controller clarification items |
| `AwaitingExternalSetup` | Controller | watch | Blocked on external IT prerequisites; no forward UI action currently exposed |
| `ReadyToProvision` | System (null) | null | Approval-triggered handoff state; backend auto-triggers provisioning saga immediately |
| `Provisioning` | System (null) | null | System-owned execution state; saga running 7 provisioning steps |
| `Completed` | Project Lead | upcoming | All provisioning steps succeeded; project site ready |
| `Failed` | Admin | immediate | Saga compensation completed; requires admin investigation or retry |

**Classification:** Confirmed repo fact.
**Evidence:** `packages/provisioning/src/bic-config.ts` lines 44-55 (urgency map), lines 76-99 (owner derivation).

---

## 3. Frozen Transition Model

| From | To | Initiator | Exposed in Accounting UI | Notes |
|------|----|-----------|--------------------------|-------|
| `Submitted` | `UnderReview` | Controller | Yes | Initial review pickup |
| `UnderReview` | `NeedsClarification` | Controller | Yes | Clarification with note and items |
| `UnderReview` | `AwaitingExternalSetup` | Controller | Yes | "Place on Hold" action |
| `UnderReview` | `ReadyToProvision` | Controller | Yes | "Approve Request" with `projectNumber` |
| `NeedsClarification` | `UnderReview` | Submitter | N/A (Estimating surface) | Coordinator resubmits |
| `AwaitingExternalSetup` | `ReadyToProvision` | Controller | **No** | Valid in backend; no Accounting UI action |
| `ReadyToProvision` | `Provisioning` | System (saga) | N/A | Saga reconciliation, not user-initiated |
| `Provisioning` | `Completed` | System (saga) | N/A | Saga success |
| `Provisioning` | `Failed` | System (saga) | N/A | Saga compensation |
| `Failed` | `UnderReview` | Admin / Controller | Yes (Admin surface) | Reopen for retry |

**Classification:** Confirmed repo fact.
**Evidence:** `packages/provisioning/src/state-machine.ts` lines 19-28 (transition map), `backend/functions/src/state-machine.ts` lines 73-80 (controller transitions), lines 88-103 (authorization logic).

---

## 4. Frozen Trigger Explanation

The provisioning trigger is a single automatic sequence initiated by controller approval:

1. **Controller approves** via the Accounting detail page modal, entering a `projectNumber` in `##-###-##` format.
2. **Client validates** the format (`/^\d{2}-\d{3}-\d{2}$/`) and calls `client.advanceState(requestId, 'ReadyToProvision', { projectNumber })`.
3. **Backend validates** the transition is authorized for the caller's role, validates the `projectNumber` pattern server-side, persists the project number and derived year on the request, and advances the request state to `ReadyToProvision`.
4. **Backend checks** for an existing provisioning status via `services.tableStorage.getProvisioningStatus(projectId)`.
5. **If no status exists or status is `Failed`:** backend constructs an `IProvisionSiteRequest` with project metadata, caller identity, and a fresh correlation ID. It instantiates `SagaOrchestrator` and calls `execute()` fire-and-forget — errors are logged but do not fail the API response.
6. **If non-failed status exists:** backend skips the auto-trigger (idempotency guard) and logs the skip.
7. **Saga executes:** reconciles the request to `Provisioning` state, runs 7 provisioning steps with retry (3 attempts, exponential backoff), and writes step-level status.
8. **On success:** saga reconciles the request to `Completed` with `siteUrl` — unless Step 5 is deferred (WebPartsPending), in which case the request stays in `Provisioning`.
9. **On failure:** saga runs compensation (reverse steps 7→1), reconciles to `Failed`, and dispatches failure notifications (escalated if retry count >= 1).

**Classification:** Confirmed repo fact.
**Evidence:** `backend/functions/src/functions/projectRequests/index.ts` lines 295-393 (validation + auto-trigger), `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` lines 43-130 (saga start), lines 281-293 (terminal determination), lines 447-543 (compensation).

---

## 5. Exact Approval Action Contract

| Aspect | Value | Evidence |
|--------|-------|----------|
| UI entry point | "Approve Request" primary button, visible when state is `UnderReview` | `ProjectReviewDetailPage.tsx` action panel |
| Modal | `HbcModal` with `HbcTextField` for `projectNumber` | `ProjectReviewDetailPage.tsx` lines 382-414 |
| Client-side validation | `/^\d{2}-\d{3}-\d{2}$/` | `ProjectReviewDetailPage.tsx` line 75 |
| Call shape | `client.advanceState(requestId, 'ReadyToProvision', { projectNumber: projectNumber.trim() })` | `ProjectReviewDetailPage.tsx` lines 118-123 |
| Server-side validation | Same `##-###-##` pattern; rejects with 400 if missing or invalid | `projectRequests/index.ts` lines 296-298 |
| Side effects | Persists `projectNumber` and derived `year` on request record | `projectRequests/index.ts` lines 300-302 |
| Success feedback | `toast.success('Request approved — provisioning started.')` | `ProjectReviewDetailPage.tsx` line 121 |
| Post-action navigation | Returns to `/project-review` queue | `ProjectReviewDetailPage.tsx` line 107 |

**Classification:** Confirmed repo fact.

---

## 6. Controller Event vs System Event Separation

### Controller-Initiated Events

These transitions are triggered by human action through a UI surface:

| Transition | Initiated By | Surface |
|------------|-------------|---------|
| Submitted → UnderReview | Controller | Accounting |
| UnderReview → NeedsClarification | Controller | Accounting |
| UnderReview → AwaitingExternalSetup | Controller | Accounting |
| UnderReview → ReadyToProvision | Controller (approve) | Accounting |
| NeedsClarification → UnderReview | Submitter (resubmit) | Estimating |
| Failed → UnderReview | Admin / Controller | Admin |

### System-Owned Events

These transitions are triggered by the provisioning saga, not by any user action:

| Transition | Initiated By | Mechanism |
|------------|-------------|-----------|
| ReadyToProvision → Provisioning | Saga | `reconcileRequestState(projectId, 'Provisioning')` |
| Provisioning → Completed | Saga | `reconcileRequestState(projectId, 'Completed', { siteUrl })` |
| Provisioning → Failed | Saga compensation | `reconcileRequestState(projectId, 'Failed')` |

The `advanceRequestState` API handler never sets `Provisioning`, `Completed`, or `Failed` directly. Only the saga's `reconcileRequestState` method touches these transitions.

**Classification:** Confirmed repo fact.
**Evidence:** `saga-orchestrator.ts` lines 100-101 (Provisioning), 287-293 (Completed), 479 (Failed). `projectRequests/index.ts` lines 351-390 (auto-trigger only, no direct state set beyond ReadyToProvision).

---

## 7. Current UI-Supported Path vs Contract-Valid But Not Exposed Path

### UI-Supported Actions (Accounting Detail Page)

| Action | Visible When | Transition |
|--------|-------------|------------|
| Approve Request | `UnderReview` | → `ReadyToProvision` (with `projectNumber`) |
| Request Clarification | `UnderReview` | → `NeedsClarification` (with note/items) |
| Place on Hold | `UnderReview` | → `AwaitingExternalSetup` |
| Send to Admin | `Failed` | Navigation to Admin surface (no state change) |

### Contract-Valid But Not Exposed

| Transition | Authorization | Status |
|-----------|--------------|--------|
| `AwaitingExternalSetup` → `ReadyToProvision` | Controller-authorized (`CONTROLLER_TRANSITIONS` line 78) | **Not exposed** in Accounting detail page UI |

The backend state machine and authorization logic both permit a controller to approve a request directly from `AwaitingExternalSetup` to `ReadyToProvision`. However, the current Accounting detail page does not render an approve action when the request state is `AwaitingExternalSetup`. The detail page's action panel only shows actions when `request.state === 'UnderReview'` or `request.state === 'Failed'`.

This is a documented gap, not a bug. Whether to add a forward action from `AwaitingExternalSetup` is deferred to later phases.

**Classification:** Confirmed repo fact (gap) + confirmed repo-doc intent (deliberate deferral).
**Evidence:** `backend/functions/src/state-machine.ts` line 78, `ProjectReviewDetailPage.tsx` action panel conditional rendering.

---

## 8. Superseded or Limited-Scope Semantics

### `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`

- **Still valid:** State definitions, transition rules, `projectNumber` format requirement, SharePoint Projects list schema.
- **Superseded:** Provisioning trigger semantics — the document implies a distinct controller-side launch action. The current backend auto-triggers the saga from approval. Service-factory and auth posture sections predate the current domain-host architecture.
- **Action:** Annotated with historical-context notice referencing this freeze decision.

### `docs/reference/provisioning/notification-event-matrix.md`

- **Still valid:** Event types and tier classifications (8-event contract).
- **Superseded:** Recipient Resolution section — describes env-var-based resolution (`CONTROLLER_UPNS`, `ADMIN_UPNS`) which has been superseded by claims-based authorization.
- **Action:** Annotated with staleness notice referencing this freeze decision and the current canonical registration doc.

### `docs/reference/workflow-experience/setup-notification-registrations.md`

- **Still valid:** G3-T04 canonical normative plan; event registrations and tier assignments.
- **Ambiguous:** The `provisioning.ready-to-provision` event description says "ready for external setup and provisioning trigger" — this could be misread as implying a manual trigger.
- **Freeze clarification:** "Provisioning trigger" in this context means the automatic saga trigger that fires immediately when the request transitions to `ReadyToProvision`, not a manual user action.

### `docs/reference/provisioning/request-lifecycle.md`

- **Still valid:** Transition rules, `projectNumber` requirement, notification targets.
- **Incomplete:** Missing auto-trigger behavior, system ownership explanation, role authorization detail, and `AwaitingExternalSetup` UI gap documentation.
- **Action:** Expanded with new sections covering these gaps.

**Classification:** Confirmed repo-doc intent (for authority classification) + inferred recommendation (for annotation actions).

---

## 9. Required Consequences for Later Implementation

The following constraints are binding on all later Phase 1 prompts (03–06) and subsequent implementation work:

1. **Approval requires `projectNumber`.** Any UI surface that exposes an approve action must capture a `projectNumber` in `##-###-##` format with both client-side and server-side validation. Bare state-change approval is not the contract.

2. **No manual provisioning trigger.** No implementation should add a distinct "start provisioning" or "launch" button. The auto-trigger in `advanceRequestState` is the authoritative mechanism. The approval action is the only controller event that initiates provisioning.

3. **System-owned states are hands-off.** Any UI displaying `ReadyToProvision` or `Provisioning` must treat them as system-owned states with no expected human action. BIC surfaces must handle `null` owner gracefully.

4. **Saga owns terminal transitions.** No user-facing API call should directly set `Provisioning`, `Completed`, or `Failed`. Only the saga's `reconcileRequestState` method performs these transitions.

5. **`AwaitingExternalSetup` forward path is open.** The transition is valid in the backend but not exposed in the Accounting UI. Later phases may decide to add the affordance, move it to another surface, or leave it unexposed. This decision must not be made implicitly.

6. **Role authorization is claims-based.** Transition authorization uses JWT app-role claims and ownership checks, not env-var allowlists. Documentation and implementation must reflect the current `resolveRequestRole` → `isAuthorizedTransition` contract.

**Classification:** Confirmed repo-doc intent (constraints 1-4, 6) + inferred recommendation (constraint 5).

---

## 10. Explicitly Deferred Items

The following items are intentionally not resolved by this freeze and are carried forward:

1. **`AwaitingExternalSetup` → `ReadyToProvision` UI affordance.** Whether to add a forward action in the Accounting detail page, move this capability to Admin, or leave it backend-only. The backend contract supports it; the UX decision is deferred.

2. **`ReadyToProvision` visibility in user-facing state displays.** In practice this state is short-lived (auto-trigger fires immediately), but it is still a durable modeled state. Whether to hide it from end-user state displays or show it as a transient processing indicator is a UX decision for later phases.

3. **Notification recipient resolution modernization.** The current backend uses claims-based auth, but `notification-event-matrix.md` still describes env-var recipient resolution. The annotation added by this freeze flags the staleness, but full doc rewrite is deferred to the doc-reconciliation prompt (Prompt-05).

4. **`WebPartsPending` deferral end-state.** When saga Step 5 is deferred, the request stays in `Provisioning` with a provisioning status of `WebPartsPending`. The contract for how this path terminates (manual completion, automated check, or timeout) is not fully specified in the current repo.

---

## 11. Ambiguities Intentionally Preserved

The following ambiguities remain because the current repo does not yet justify a stronger claim:

1. **`WebPartsPending` terminal behavior.** The saga sets `overallStatus: 'WebPartsPending'` when Step 5 is deferred but does not reconcile the request to a terminal state. No current mechanism re-enters the saga to finalize. This is an acknowledged open question, not a frozen contract point.

2. **`AwaitingExternalSetup` surface ownership.** The state exists and is filterable in the Accounting queue, but no forward action is exposed. Whether the forward action belongs in Accounting, Admin, or another operational surface is genuinely unresolved. The backend allows controller authorization for this transition.

3. **Notification recipient group resolution for system-owned states.** `STATE_NOTIFICATION_TARGETS` routes `ReadyToProvision` notifications to `controller` and `Provisioning` notifications to `group`. The actual recipient identity resolution (how "controller" and "group" map to specific UPNs) depends on runtime configuration that is partially env-var-driven for routing (not authorization). The exact resolution contract is not fully documented.

**Classification:** Unresolved ambiguity (all three items).

---

## Verification

### Files Reviewed

| File | Purpose |
|------|---------|
| `apps/accounting/src/pages/ProjectReviewDetailPage.tsx` | Approve action, call shape, projectNumber validation, action visibility |
| `packages/provisioning/src/state-machine.ts` | State definitions, transition map, notification targets |
| `packages/provisioning/src/bic-config.ts` | Owner assignments, system-owned states, urgency tiers |
| `backend/functions/src/state-machine.ts` | Backend transitions, controller transitions, role resolution, authorization |
| `backend/functions/src/functions/projectRequests/index.ts` | advanceRequestState handler, auto-trigger logic, guard conditions |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Saga progression, reconcileRequestState, compensation |
| `docs/architecture/blueprint/current-state-map.md` | Authority hierarchy |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Controller action mapping (stale approve call shape) |
| `docs/reference/provisioning/request-lifecycle.md` | Lifecycle reference (incomplete) |
| `docs/reference/provisioning/verification-matrix.md` | Verification evidence |
| `docs/reference/workflow-experience/setup-notification-registrations.md` | Notification event descriptions |
| `docs/reference/provisioning/notification-event-matrix.md` | Stale recipient resolution |
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Historical lifecycle plan |
| `docs/architecture/plans/MASTER/spfx/accounting/phase-1/Accounting_Phase1_Prompt_Audit_Report.md` | Audit evidence basis |
| `docs/architecture/reviews/phase-1-prompt-package-audit-and-reconciliation.md` | Package reconciliation review |

### Files Updated

| File | Change |
|------|--------|
| `docs/architecture/reviews/phase-1-lifecycle-freeze-decision.md` | Created (this document) |
| `docs/reference/spfx-surfaces/controller-review-surface.md` | Fixed approve action call shape to include `{ projectNumber }`; updated confirmation type; added freeze cross-reference |
| `docs/reference/provisioning/request-lifecycle.md` | Added auto-trigger, system ownership, role authorization, UI gap, and freeze reference sections |
| `docs/reference/provisioning/notification-event-matrix.md` | Added staleness annotation for recipient resolution section |
| `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md` | Added historical-context annotation for trigger semantics |

### Stale Statements Replaced or Annotated

| Document | Stale Claim | Action |
|----------|------------|--------|
| controller-review-surface.md | `advanceState(id, 'ReadyToProvision')` without projectNumber | Fixed to `advanceState(id, 'ReadyToProvision', { projectNumber })` |
| controller-review-surface.md | Approve confirmation listed as `HbcConfirmDialog` | Fixed to `HbcModal` with `HbcTextField` |
| notification-event-matrix.md | Env-var recipient resolution (`CONTROLLER_UPNS`, `ADMIN_UPNS`) | Annotated as stale |
| PH6.8-RequestLifecycle-StateEngine.md | Implied controller-side launch action | Annotated as historical |
| request-lifecycle.md | Missing auto-trigger and system ownership | Expanded with new sections |

### Remaining Ambiguities

See Section 11 above. Three items are intentionally preserved as unresolved.
