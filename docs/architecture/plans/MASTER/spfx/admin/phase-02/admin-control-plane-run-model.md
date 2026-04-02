# Admin Control Plane — Generalized Run Model and Provisioning Crosswalk

## Purpose

This document defines the generalized admin run model — the domain-agnostic vocabulary for representing any admin control-plane execution. It also provides an explicit crosswalk from current provisioning lifecycle concepts to the generalized model.

The shared type surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Relationship to provisioning

The generalized run model is a **translation target**, not a replacement.

- **Existing provisioning types** (`IProvisioningStatus`, `OverallProvisioningStatus`, etc.) remain owned by `@hbc/provisioning` and `@hbc/models/provisioning`.
- **New admin domains** (Entra control, SharePoint control, install/bootstrap, etc.) use the generalized model natively.
- **Unified display** in the operator console projects provisioning data into the generalized model for consistent presentation alongside other domain runs.
- **Migration**: provisioning is not migrated away from its current types. Instead, a read-only projection adapter maps provisioning status to `IAdminRunEnvelope` at the display boundary. This adapter is a Phase 5 concern, not Phase 2.

## Run envelope

The `IAdminRunEnvelope` is the core type. It captures:

| Field group | Fields | Purpose |
|-------------|--------|---------|
| **Identity** | `runId`, `parentRunId` | Unique run ID (UUID v4). Retry chains link via `parentRunId`. |
| **Action reference** | `actionKey`, `domain`, `riskLevel`, `executionMode` | What action was performed, in what domain, at what risk, in what mode. |
| **Actor** | `initiatedBy`, `lastApprovedBy` | Who initiated the run and who last approved a checkpoint (both `IAdminActorContext`). |
| **Input/config snapshots** | `commandInputRef`, `configSnapshotRef` | Opaque references to the command payload and config version at run creation time. |
| **Lifecycle** | `status`, `totalSteps`, `currentStep`, `steps` | Current state, progress, and ordered step results. |
| **Failure/retry** | `failure` | `IAdminFailureSummary` with failure class, retry count, escalation state. |
| **Timestamps** | `createdAt`, `startedAt`, `completedAt` | ISO 8601 lifecycle timestamps. |
| **Correlation** | `targetEntityId`, `targetEntityLabel` | Domain-specific entity this run operates on (e.g., projectId for provisioning). |

**Typed as**: `IAdminRunEnvelope` in `@hbc/models`.

## Run lifecycle states

| State | Meaning | Terminal? |
|-------|---------|-----------|
| `Pending` | Run created but not yet started | No |
| `Validating` | Preflight validation in progress | No |
| `Running` | Actively executing steps | No |
| `AwaitingApproval` | Paused at a checkpoint for operator approval | No |
| `Completed` | All steps finished successfully | Yes |
| `Failed` | One or more steps failed; may be retried | Yes (retryable) |
| `Cancelled` | Operator cancelled before completion | Yes |
| `PartiallyDeferred` | Some steps deferred to a later execution window | Yes (resumable) |

**Typed as**: `AdminRunStatus` enum in `@hbc/models`.

## Transition rules by execution mode

### Seamless mode

```
Pending → Validating → Running → Completed
                         ↓
                       Failed → (retry creates new run with parentRunId)
                         ↓
                       PartiallyDeferred → (timer resumes deferred steps)
```

No `AwaitingApproval` state. The run proceeds without operator intervention unless failure occurs. This is the provisioning model (LD-05).

### Checkpointed mode

```
Pending → Validating → Running ⇄ AwaitingApproval → Running → Completed
                         ↓
                       Failed → (retry creates new run with parentRunId)
```

The run pauses at defined checkpoints. The operator must approve each checkpoint to continue. Multiple checkpoint cycles are allowed.

### Destructive mode

```
Pending → Validating → AwaitingApproval → Running → Completed
                                            ↓
                                          Failed
```

Mandatory pre-execution approval after validation. The operator reviews a preview/impact summary before the run begins execution. Post-action validation is required before marking complete.

### Advisory mode

```
Pending → Validating → Running → Completed
```

No state changes to external systems. The run produces a report or assessment. No failure retry semantics (advisory runs that fail simply report the failure).

## Step result model

Each step within a run produces an `IAdminStepResult`:

| Field | Type | Purpose |
|-------|------|---------|
| `stepNumber` | `number` | 1-based ordinal position |
| `stepLabel` | `string` | Human-readable step name |
| `status` | `AdminStepStatus` | Current step status |
| `startedAt` | `string \| null` | ISO 8601 start timestamp |
| `completedAt` | `string \| null` | ISO 8601 completion timestamp |
| `durationMs` | `number \| null` | Duration in milliseconds |
| `errorMessage` | `string \| null` | Error message if failed |
| `compensatable` | `boolean` | Whether this step supports rollback |
| `compensated` | `boolean` | Whether compensation was attempted |

### Step statuses

| Status | Meaning |
|--------|---------|
| `Pending` | Not started |
| `Running` | Currently executing |
| `Completed` | Finished successfully |
| `Failed` | Failed |
| `Skipped` | Skipped (already completed on retry, or not applicable) |
| `Deferred` | Deferred to later execution window |
| `AwaitingApproval` | Paused at step-level checkpoint |
| `Compensated` | Rolled back via compensation |

**Typed as**: `AdminStepStatus` enum in `@hbc/models`.

## Failure and retry semantics

`IAdminFailureSummary` captures failure details:

| Field | Purpose |
|-------|---------|
| `failedAtStep` | Step number where failure occurred |
| `failureClass` | Classification: `transient`, `structural`, `permissions`, `repeated`, `admin-class` |
| `failureMessage` | Human-readable failure description |
| `retryEligible` | Whether the run can be retried |
| `retryCount` | Number of retry attempts so far |
| `lastRetryAt` | ISO 8601 timestamp of last retry |
| `escalated` | Whether the run has been escalated |
| `escalatedBy` / `escalatedAt` | Escalation actor and timestamp |

### Retry rules

- A retry creates a **new run** with a fresh `runId`.
- The new run stores the previous `runId` as `parentRunId` for traceability.
- `retryCount` is incremented on the new run.
- Steps completed in a previous run may be skipped on retry (idempotency).
- Retry eligibility is determined by the domain and failure class.

### Failure class definitions

| Class | Meaning | Typical retry behavior |
|-------|---------|----------------------|
| `transient` | Temporary infrastructure issue (network, timeout, throttle) | Auto-retryable within step; manual retry of run if step retries exhausted |
| `structural` | Configuration or schema mismatch | Not retryable without fix |
| `permissions` | Missing permissions or consent | Not retryable without admin action |
| `repeated` | Same step has failed multiple consecutive times | Eligible for retry after investigation |
| `admin-class` | Requires admin-level intervention | Admin must review before retry |

## Actor context

`IAdminActorContext` captures operator identity at key moments:

| Field | Source | Purpose |
|-------|--------|---------|
| `upn` | JWT `upn` claim | Operator's User Principal Name |
| `objectId` | JWT `oid` claim | Operator's Entra Object ID |
| `displayName` | JWT `name` or `preferred_username` | Display name for audit records |
| `capturedAt` | System clock | ISO 8601 timestamp when context was captured |

Actor context is captured:
- At run creation (`initiatedBy`)
- At each checkpoint approval (`lastApprovedBy`)
- In audit records for evidence chains

## Correlation identifiers

| Field | Purpose | Example |
|-------|---------|---------|
| `runId` | Unique per run (UUID v4) | `a1b2c3d4-...` |
| `parentRunId` | Links to previous run in retry chain | `e5f6g7h8-...` |
| `targetEntityId` | Domain-specific entity being operated on | `projectId` for provisioning, `groupId` for Entra |
| `targetEntityLabel` | Human-readable entity label | Project name, group display name |

## Provisioning crosswalk

### Concept mapping

| Provisioning concept | Generalized equivalent | Notes |
|---------------------|----------------------|-------|
| `IProvisioningStatus.correlationId` | `IAdminRunEnvelope.runId` | Both are UUID v4 unique per run |
| `IProvisioningStatus.parentCorrelationId` | `IAdminRunEnvelope.parentRunId` | Both link retry chains |
| `IProvisioningStatus.projectId` | `IAdminRunEnvelope.targetEntityId` | Domain-specific entity |
| `IProvisioningStatus.overallStatus` | `IAdminRunEnvelope.status` | State mapping below |
| `IProvisioningStatus.steps[n]` | `IAdminRunEnvelope.steps[n]` | Step result mapping below |
| `IProvisioningStatus.startedAt` | `IAdminRunEnvelope.startedAt` | Direct mapping |
| `IProvisioningStatus.completedAt` | `IAdminRunEnvelope.completedAt` | Direct mapping |
| `IProvisioningStatus.retryCount` | `IAdminRunEnvelope.failure.retryCount` | Nested in failure summary |
| `IProvisioningStatus.escalatedBy` | `IAdminRunEnvelope.failure.escalatedBy` | Nested in failure summary |
| `IProvisioningStatus.failureClass` | `IAdminRunEnvelope.failure.failureClass` | Same enum values |
| `IProvisioningStatus.step5DeferredToTimer` | `steps[4].status === 'Deferred'` + `status === 'PartiallyDeferred'` | Step-level deferral |
| Request submitter UPN | `IAdminRunEnvelope.initiatedBy.upn` | Actor context formalization |

### State mapping

| Provisioning `overallStatus` | Generalized `AdminRunStatus` |
|------------------------------|------------------------------|
| `NotStarted` | `Pending` |
| `InProgress` | `Running` |
| `Completed` | `Completed` |
| `Failed` | `Failed` |
| `WebPartsPending` | `PartiallyDeferred` |
| `CompensationCompleted` | `Failed` (with `compensated: true` on affected steps) |

### Step status mapping

| Provisioning step status | Generalized `AdminStepStatus` |
|--------------------------|-------------------------------|
| `NotStarted` | `Pending` |
| `InProgress` | `Running` |
| `Completed` | `Completed` |
| `Failed` | `Failed` |
| `Skipped` | `Skipped` |
| `Compensated` | `Compensated` |

### What is NOT mapped

| Provisioning concept | Why not mapped |
|---------------------|----------------|
| `IProjectSetupRequest` | This is a domain entity (request lifecycle), not a run record. The generalized model does not replace domain entities. |
| BIC ownership (`deriveCurrentOwner`) | Domain-specific ownership logic. The generalized model has `initiatedBy` for actor context but not domain-specific ownership. |
| Summary field registries | Display concern owned by `@hbc/provisioning`. The generalized model does not prescribe display. |
| Failure mode catalog | Domain-specific failure descriptions. The generalized model has `failureClass` for classification only. |

## Compatibility notes

- **No breaking changes**: existing provisioning types and exports are untouched.
- **No dependency introduced**: `@hbc/provisioning` does not import from `admin-control-plane`. The generalized model is in `@hbc/models` alongside but independent of provisioning types.
- **Projection adapter**: a read-only adapter that maps `IProvisioningStatus` → `IAdminRunEnvelope` will be created in Phase 5 when the operator console needs unified run display. Phase 2 only defines the target shape.

## Migration guidance for later phases

1. **Phase 3** (backend): Implement new domain hosts using `IAdminRunEnvelope` natively for their run persistence.
2. **Phase 4** (persistence): Generalize Table Storage service to store `IAdminRunEnvelope` records alongside provisioning-specific `IProvisioningStatus` records.
3. **Phase 5** (console): Create a projection adapter that maps `IProvisioningStatus` → `IAdminRunEnvelope` for unified display. Do not replace provisioning's native persistence.
4. **Phase 7** (provisioning hardening): Decide whether provisioning should also write generalized run records or continue with projection-only. This is a Phase 7 decision, not a Phase 2 decision.

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Action catalog](admin-control-plane-action-catalog.md) | Action keys and execution modes referenced by run envelopes |
| [Phase 2 prerequisite inventory](admin-spfx-phase-2-prereq-and-contract-inventory.md) | Current contract surfaces and gap analysis |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | LD-05 (provisioning seamless), LD-04 (generalize, don't discard) |
| [`@hbc/models/admin-control-plane`](../../../../../packages/models/src/admin-control-plane/) | Shared type surface |
| [`@hbc/provisioning`](../../../../../packages/provisioning/README.md) | Current provisioning lifecycle types |
