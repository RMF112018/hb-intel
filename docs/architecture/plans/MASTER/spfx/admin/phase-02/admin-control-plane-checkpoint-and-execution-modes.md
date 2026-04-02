# Admin Control Plane — Checkpoint, Approval, and Execution Mode Contract

## Purpose

This document defines the generalized checkpoint and approval contract for the admin control plane. It covers how runs pause, how operators make decisions, how timeouts and escalations work, how external events correlate, and how each execution mode interacts with checkpoints.

The shared type surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Checkpoint lifecycle

```
                    ┌─────────────┐
                    │   Pending   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐───────────────┐
           ▼               ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐
     │ Approved │   │ Rejected │   │ TimedOut  │   │  Escalated  │
     └──────────┘   └──────────┘   └──────────┘   └──────┬──────┘
                                                          │
                                                   ┌──────┴──────┐
                                                   ▼             ▼
                                              Approved      Rejected
```

A checkpoint may also transition to `Superseded` if the run is cancelled while the checkpoint is pending.

**Typed as**: `AdminCheckpointStatus` enum in `@hbc/models`.

| Status | Meaning | Terminal? |
|--------|---------|-----------|
| `Pending` | Awaiting operator decision or external event | No |
| `Approved` | Operator approved — run continues | Yes |
| `Rejected` | Operator rejected — run cancels/rolls back | Yes |
| `TimedOut` | Checkpoint expired without decision | Yes |
| `Escalated` | Timeout triggered escalation to higher authority | No (re-enters Pending at escalated level) |
| `Superseded` | Checkpoint invalidated by run cancellation or newer checkpoint | Yes |

## Checkpoint categories

5 categories, each with distinct UX and behavioral expectations:

### Pre-execution approval

- **When**: Before any steps execute.
- **Used by**: Destructive-mode actions as the initial gate.
- **UX**: Show the action description, risk level, and target entity. Operator clicks "Approve" or "Reject."
- **Timeout default**: Configurable per action. Typical: 24 hours.

### Mid-execution review

- **When**: Between steps, after intermediate results are available.
- **Used by**: Checkpointed-mode actions.
- **UX**: Show step results so far and what will happen next. Operator reviews and decides to continue or stop.
- **Timeout default**: Configurable per checkpoint. Typical: 4–8 hours.

### Destructive confirmation

- **When**: Before a destructive action executes.
- **Used by**: Critical-risk actions (site deletion, user removal, access revocation).
- **UX**: Show impact summary with explicit warnings. May require the operator to type a confirmation phrase (e.g., "DELETE site-name"). Must display preview/dry-run results.
- **Timeout default**: Short (1–4 hours). Auto-rejects on timeout.
- **`requiresConfirmationPhrase`**: true.

### External event wait

- **When**: The run needs an event from an external system before continuing.
- **Used by**: Actions that depend on external approvals (IT ticket systems, Azure deployment callbacks, manual infrastructure steps).
- **UX**: Show what the run is waiting for and the expected source system. Operator cannot directly approve — the checkpoint resolves when the external event arrives.
- **Timeout default**: Long (24–72 hours). Auto-escalates on timeout.
- **Correlation**: Uses `IAdminExternalEventCorrelation` for event matching.

### Post-execution validation

- **When**: After all primary steps complete, before the run is marked Completed.
- **Used by**: High-risk actions where the operator should verify the outcome.
- **UX**: Show execution results and ask the operator to confirm the outcome is acceptable.
- **Timeout default**: Configurable. Typical: 8–24 hours.

**Typed as**: `AdminCheckpointCategory` enum in `@hbc/models`.

## Checkpoint definition vs instance

| Concept | Type | When created | Purpose |
|---------|------|-------------|---------|
| **Definition** | `IAdminCheckpointDefinition` | At action design time | Declares where checkpoints occur in an action's execution plan |
| **Instance** | `IAdminCheckpoint` | At run time, when the run reaches the checkpoint point | Tracks the state of a specific checkpoint in a specific run |

Definitions are static and reusable. Instances are per-run and mutable.

## Checkpoint decision

Every checkpoint resolution produces an `IAdminCheckpointDecision` record:

| Field | Purpose |
|-------|---------|
| `actor` | `IAdminActorContext` — who made the decision |
| `outcome` | `'approve'` or `'reject'` |
| `comment` | Operator's rationale (required for rejections) |
| `confirmationPhrase` | Typed phrase for destructive confirmations |
| `decidedAt` | ISO 8601 timestamp |
| `idempotencyKey` | Prevents duplicate decision processing |

Decision records are linked to the run's audit/evidence chain but kept as focused checkpoint metadata, not full audit records.

## Execution mode × checkpoint interaction

| Execution mode | Checkpoints used | Behavior |
|----------------|-----------------|----------|
| **Seamless** | None | Run proceeds without any pause points. Only pauses on failure. Provisioning operates in this mode (LD-05). |
| **Checkpointed** | Mid-execution review (1+) | Run pauses at defined review points between steps. Operator approves or rejects continuation at each. |
| **Destructive** | Pre-execution approval + destructive confirmation + post-execution validation | Run pauses before starting (with impact preview), requires explicit confirmation, and pauses after completion for validation. |
| **Advisory** | None | Run produces a read-only report. No state changes, no approval needed. |

### Seamless flow (no checkpoints)

```
Run Created → Validating → Running [step 1] → [step 2] → ... → [step N] → Completed
                                                                    ↓ (on failure)
                                                                  Failed
```

No checkpoints. No operator intervention during normal execution. This is the provisioning model. The generalized checkpoint contract explicitly does not impose checkpoints on seamless actions.

### Checkpointed flow

```
Run Created → Validating → Running [step 1] → [step 2]
    → AwaitingApproval (mid-execution-review)
        → Approved → Running [step 3] → [step 4]
            → AwaitingApproval (mid-execution-review)
                → Approved → Running [step 5] → Completed
```

Multiple review points possible. Each must be independently approved.

### Destructive flow

```
Run Created → Validating
    → AwaitingApproval (pre-execution-approval + destructive-confirmation)
        → Approved (with confirmation phrase) → Running [step 1] → ... → [step N]
            → AwaitingApproval (post-execution-validation)
                → Approved → Completed
```

Three-gate pattern: preflight validation, explicit destructive confirmation, post-execution validation.

### Advisory flow

```
Run Created → Validating → Running [analysis step 1] → ... → Completed (report generated)
```

No checkpoints. No state changes to external systems.

## Timeout and expiry behavior

Each checkpoint definition specifies:
- `timeoutMs` — duration before the checkpoint expires (null = no timeout)
- `timeoutAction` — what happens on expiry: `'reject'` or `'escalate'`

| Timeout action | Behavior |
|---------------|----------|
| `reject` | Checkpoint status → `TimedOut`. Run status → `Cancelled`. No further steps execute. |
| `escalate` | Checkpoint status → `Escalated`. Notification sent to escalation recipients (ADMIN_UPNS). Checkpoint remains actionable at the escalated level. |

### Expiry tracking

The checkpoint instance stores `expiresAt` (ISO 8601), computed from `createdAt + timeoutMs`. The backend checks expiry via timer or on-demand when the checkpoint is queried.

## Escalation semantics

Escalation occurs when:
1. A checkpoint times out with `timeoutAction: 'escalate'`, or
2. An operator explicitly escalates a checkpoint to admin attention.

On escalation:
- Checkpoint status → `Escalated`
- The checkpoint remains actionable — an admin can still approve or reject
- An escalation notification is dispatched (using existing notification patterns)
- The escalation is recorded in the checkpoint decision audit trail

## Event/decision correlation and deduplication

### Decision correlation

Each `IAdminCheckpointDecision` includes an `idempotencyKey` (UUID v4 generated by the caller). The backend:
1. Records the decision with the idempotency key
2. On duplicate submission (same `idempotencyKey`), returns the existing decision result without re-processing
3. On conflicting submission (different decision for the same checkpoint), returns an error

This ensures at-least-once delivery tolerance for operator decisions.

### External event correlation

`IAdminExternalEventCorrelation` provides:

| Field | Purpose |
|-------|---------|
| `sourceSystem` | Identifies the external system (e.g., `'azure-deployment'`, `'service-now'`) |
| `correlationKey` | Unique key for matching incoming events to this checkpoint |
| `expectedEventType` | Event type validation on receipt |
| `eventReceived` | Whether the event has been processed |
| `eventReceivedAt` | Timestamp of event receipt |
| `lastProcessedDedupeToken` | Deduplication token for at-least-once delivery |

**Deduplication rule**: If an incoming event has the same `correlationKey` + `sourceSystem` and its deduplication token matches `lastProcessedDedupeToken`, it is safely ignored. This prevents duplicate processing from webhook retries or message replay.

### Event receipt flow

```
External event arrives → Match by correlationKey + sourceSystem
    → Validate expectedEventType
    → Check dedupeToken against lastProcessedDedupeToken
        → If duplicate: ignore (return success)
        → If new: process event, update checkpoint, store dedupeToken
            → Checkpoint status → Approved (auto-approval on event receipt)
            → Run resumes
```

## Provisioning compatibility

The checkpoint contract is explicitly compatible with provisioning's seamless model:

- **Provisioning actions** (`provisioning-rollout:saga:launch`, `:retry`) use `AdminExecutionMode.Seamless`.
- Seamless-mode actions declare **zero checkpoint definitions**.
- The checkpoint system is not invoked for seamless runs.
- Provisioning's existing Step 5 deferral (timer-based) is not a checkpoint — it is a step-level deferral handled by the saga orchestrator's own timer logic. The generalized checkpoint model does not replace or interfere with it.
- This preserves LD-05 (provisioning stays seamless).

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Action catalog](admin-control-plane-action-catalog.md) | Execution modes and risk levels that determine checkpoint usage |
| [Run model](admin-control-plane-run-model.md) | `AwaitingApproval` run/step status, `IAdminActorContext` |
| [API contract catalog](admin-control-plane-api-contract-catalog.md) | `IAdminCheckpointDecisionRequest/Response` API DTOs |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | LD-05 (provisioning seamless), LD-06 (checkpointed risky actions), LD-10 (single-admin safety) |
| `@hbc/models/admin-control-plane` | Shared type surface |
