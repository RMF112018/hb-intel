# Admin SPFx IT Control Center — Install Checkpoint Lifecycle

**Prompt:** P6-06 — Checkpoint, Resume, and Manual-Action Flow
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document checkpoint entry conditions, payload shape, operator actions, resume/reject semantics, and evidence requirements.

---

## 1. Checkpoint entry conditions

A checkpoint is entered when the install orchestrator reaches a step with `requiresCheckpoint: true` in the step catalog. Phase 6 has exactly 2 checkpoint steps:

| Step # | Step ID | Reason | External system |
|--------|---------|--------|----------------|
| 10 | `grant-api-permissions` | Tenant-admin consent required for Graph API permissions | Entra admin portal |
| 12 | `request-sharepoint-api-access` | Tenant-admin must approve SharePoint API access | SharePoint admin center |

When the orchestrator reaches a checkpoint step:
1. A `CheckpointCreated` audit event is recorded (fire-and-forget)
2. The run status transitions to `AwaitingApproval`
3. The orchestrator returns the run envelope — execution is paused

---

## 2. Checkpoint payload shape

Each checkpoint provides an operator instruction block via `getCheckpointInstructions(stepId)`:

```typescript
interface CheckpointInstructions {
  instructions: string;      // What the operator needs to do
  externalUrl: string | null; // URL to the external admin portal
  verificationHint: string;  // How to confirm the action was completed
  riskWarning: string;       // What happens if they approve without completing the action
  resumeBehavior: string;    // What the install will do next after approval
}
```

The SPFx UI reads the pending checkpoint from the run envelope's `AwaitingApproval` status and the audit trail's `CheckpointCreated` event, then calls `getCheckpointInstructions()` to render the operator instructions.

---

## 3. Operator actions

| Action | API call | Result |
|--------|----------|--------|
| **Approve** | `POST /api/admin/runs/{runId}/checkpoint` with `{ stepNumber, decision: 'approve' }` | Run transitions to `Running`; orchestrator resumes from step after checkpoint |
| **Reject** | `POST /api/admin/runs/{runId}/checkpoint` with `{ stepNumber, decision: 'reject', comment? }` | Run transitions to `Failed`; `CheckpointDecided` + `RunFailed` audit events recorded |
| **Cancel** | `POST /api/admin/runs/{runId}/cancel` with `{ reason }` | Run transitions to `Cancelled` via existing cancel endpoint |

All actions require `admin:access-control:view` permission + admin role (enforced by endpoint middleware).

---

## 4. Resume/reject semantics

### On approve

1. `processCheckpointDecision()` validates run is in `AwaitingApproval` state
2. Records `CheckpointDecided` audit event with actor, timestamp, and `Running` status
3. Returns `{ success: true, updatedStatus: 'Running' }`
4. The caller invokes `resumeAfterCheckpoint()` to continue from the step after the checkpoint
5. The resume function re-enters the step loop and continues sequentially
6. If a second checkpoint is encountered, the run pauses again

### On reject

1. `processCheckpointDecision()` validates run is in `AwaitingApproval` state
2. Records `CheckpointDecided` audit event with actor, timestamp, comment, and `Failed` status
3. Records `RunFailed` audit event
4. Returns `{ success: true, updatedStatus: 'Failed' }`
5. No further steps execute

### Terminal-state safety

Decisions are rejected (409 Conflict) if the run is in any terminal state:
- `Completed` — run already finished
- `Failed` — run already failed
- `Cancelled` — run already cancelled

Decisions are also rejected if the run is not in `AwaitingApproval` (e.g., `Running`, `Pending`).

---

## 5. Evidence and audit requirements

### Audit events per checkpoint

| Event | Timing | Actor captured |
|-------|--------|---------------|
| `CheckpointCreated` | When orchestrator pauses at checkpoint step | Initiating operator |
| `CheckpointDecided` | When operator submits approve/reject | Deciding operator |
| `RunFailed` | On reject only | Deciding operator |

### Decision rationale

When the operator provides a `comment` with their decision, it is recorded as an `IAdminRationale` in the audit event:
- `reason` — the operator's comment text
- `recordedAt` — ISO 8601 timestamp
- `recordedBy` — full `IAdminActorContext`

### Traceability

Every checkpoint decision is traceable via:
- `checkpointInstanceId` format: `checkpoint-step-{stepNumber}`
- `runId` links to the install run
- `actor` captures who made the decision
- `summary` includes human-readable description

---

## Implementation location

| File | Purpose |
|------|---------|
| `backend/functions/src/services/admin-control-plane/install-checkpoint-service.ts` | `getCheckpointInstructions()`, `processCheckpointDecision()`, `resumeAfterCheckpoint()` |
| `backend/functions/src/functions/adminApi/index.ts` | `adminCheckpointDecision` endpoint — now wired to real `processCheckpointDecision()` |
| `backend/functions/src/services/admin-control-plane/__tests__/install-checkpoint-service.test.ts` | Unit tests |

---

## Cross-references

- [Manual Checkpoint Policy](admin-spfx-install-manual-checkpoint-policy.md) — what qualifies as a checkpoint, anti-patterns
- [Install Orchestrator](admin-spfx-install-orchestrator.md) — step sequencing and checkpoint pauses
- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities
