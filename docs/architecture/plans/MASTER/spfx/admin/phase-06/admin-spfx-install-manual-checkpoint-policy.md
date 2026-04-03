# Admin SPFx IT Control Center — Install Manual Checkpoint Policy

**Prompt:** P6-02 — Install/Bootstrap Architecture and Step Model
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Define the rules for manual checkpoint handling during install/bootstrap runs.

---

## 1. What qualifies as an unavoidable manual action

A step qualifies for a manual checkpoint **only** when all of the following are true:

1. **The action requires human authorization** that cannot be delegated to the managed identity (e.g., tenant-admin consent in Entra, SharePoint API access approval)
2. **The authorization must happen in an external system** (e.g., Entra admin portal, SharePoint admin center) — not within the HB Intel app
3. **There is no programmatic API** to complete the action with the credentials available to the backend

### Phase 6 checkpoint steps

| Step | Why manual | External system | Operator action required |
|------|-----------|----------------|------------------------|
| 3.6 Grant API permissions | Tenant-admin consent cannot be granted by managed identity | Entra admin portal | Navigate to Entra → App registrations → Grant admin consent |
| 3.8 Request SharePoint API access | Tenant admin must approve API access requests | SharePoint admin center | Navigate to SharePoint Admin → API access → Approve pending request |

### What is NOT a valid checkpoint

| Scenario | Why excluded | Correct handling |
|----------|-------------|-----------------|
| Resource deployment (Bicep) | Fully automatable via managed identity | Automated step |
| App registration creation | Automatable via Graph API with application permissions | Automated step |
| Package upload to app catalog | Automatable via SharePoint ALM API | Automated step |
| Error recovery after failure | Not an approval — it's a failure state | Retry or cancel |
| "Are you sure?" confirmation | Not a meaningful gate — adds friction without safety | Skip — preflight covers readiness |
| Config value entry | Should be in env config, not runtime prompts | Preflight validates config completeness |

---

## 2. How checkpoints are represented in run state

### Run envelope state machine (checkpoint path)

```
Running → AwaitingApproval → Running (on approve) → ...
Running → AwaitingApproval → Failed (on reject)
Running → AwaitingApproval → Cancelled (on cancel)
```

### Checkpoint data in the run envelope

When the orchestrator reaches a checkpoint step, it writes a checkpoint record to the run envelope:

```typescript
interface IInstallCheckpoint {
  /** Unique checkpoint ID within the run */
  checkpointId: string;
  /** Step that triggered the checkpoint */
  stepId: string;
  /** What the operator needs to do */
  instructions: string;
  /** URL to the external system where the action must be performed */
  externalUrl?: string;
  /** What evidence the operator should look for to confirm completion */
  verificationHint: string;
  /** When the checkpoint was created */
  createdAt: string;
  /** When the checkpoint was resolved (null if pending) */
  resolvedAt?: string;
  /** Resolution: approve, reject, or cancel */
  resolution?: 'approve' | 'reject' | 'cancel';
  /** Who resolved the checkpoint */
  resolvedBy?: IAdminActorContext;
  /** Optional rationale provided by the operator */
  rationale?: string;
}
```

---

## 3. Required operator instructions

Every checkpoint **must** include:

| Field | Requirement |
|-------|------------|
| `instructions` | Clear, actionable text describing what the operator must do (e.g., "Navigate to Entra admin portal → App registrations → [app name] → API permissions → Grant admin consent for [scope]") |
| `externalUrl` | Direct URL to the external admin portal when constructible (e.g., `https://entra.microsoft.com/#/...`) |
| `verificationHint` | What the operator should see when the action is complete (e.g., "The 'Status' column should show 'Granted' for all listed permissions") |

### Instruction quality bar

Instructions must be specific enough that an operator unfamiliar with the specific external portal can complete the action. Generic instructions like "approve the pending request" are insufficient — include the portal name, navigation path, and expected visual confirmation.

---

## 4. Resume / reject / cancel behavior

### Approve (resume)

When the operator submits `approve`:
1. The orchestrator records the approval with actor context and timestamp
2. An audit event of type `CheckpointDecided` is recorded
3. The run status transitions from `AwaitingApproval` back to `Running`
4. The orchestrator resumes execution from the step **after** the checkpoint step
5. The next step may verify that the manual action was actually completed (e.g., check that permissions are now granted)

### Reject

When the operator submits `reject`:
1. The orchestrator records the rejection with actor context, timestamp, and rationale
2. An audit event of type `CheckpointDecided` is recorded with rejection reason
3. The run status transitions from `AwaitingApproval` to `Failed`
4. The run records a failure summary indicating the checkpoint was rejected
5. The operator can later retry the run (which will re-attempt from the beginning of the failed step family)

### Cancel

When the operator submits `cancel`:
1. The orchestrator records the cancellation with actor context
2. An audit event of type `RunCancelled` is recorded
3. The run status transitions from `AwaitingApproval` to `Cancelled`
4. No compensation or rollback is attempted — the environment is left in its current state
5. The operator can inspect the audit trail to understand what was completed before cancellation

---

## 5. Evidence and audit expectations

### Every checkpoint must produce

| Artifact | Timing | Evidence type |
|----------|--------|--------------|
| Checkpoint creation audit event | When checkpoint is set | `CheckpointCreated` |
| Checkpoint instruction snapshot | When checkpoint is set | `CommandInputSnapshot` |
| Checkpoint decision audit event | When operator responds | `CheckpointDecided` |
| Decision rationale (if provided) | When operator responds | `ApprovalDecision` |

### Audit event detail

The `CheckpointDecided` audit event must include:
- `checkpointId` — links to the specific checkpoint
- `resolution` — approve, reject, or cancel
- `actor` — full `IAdminActorContext` (UPN, object ID, display name, timestamp)
- `rationale` — operator-provided reason (optional but encouraged for reject/cancel)
- `durationMs` — time from checkpoint creation to resolution

---

## 6. Explicit anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|-------------|---------------|-----------------|
| **Hidden manual work outside the run record** | Breaks auditability — no one can tell what happened or who did it | All manual actions must be modeled as checkpoints within the run |
| **Auto-approving checkpoints** | Defeats the purpose of manual gates — if it can be automated, it should be an automated step | Remove the checkpoint and make it an automated step, or keep it manual |
| **Checkpoint without instructions** | Operator has no idea what to do, leading to errors or indefinite pauses | Every checkpoint must include actionable instructions |
| **Checkpoint for automatable actions** | Adds unnecessary friction and operator burden | Automate the step and remove the checkpoint |
| **Checkpoint timeout with auto-cancel** | Silently cancels runs, creating confusion | Checkpoints remain pending until operator acts; notification/alerting can remind |
| **Checkpoint that modifies run state on creation** | Side effects before approval break the approval contract | Checkpoint creation only pauses the run; no state changes until operator approves |
| **Operator submitting approve without performing the external action** | Creates false audit trail and will likely cause next-step failures | Post-checkpoint verification step should confirm the action was completed |

---

## Cross-references

- [Install/Bootstrap Architecture](admin-spfx-install-bootstrap-architecture.md) — layer responsibilities and checkpoint placement
- [Install/Bootstrap Step Model](admin-spfx-install-bootstrap-step-model.md) — step families and checkpoint steps
- [Prerequisite Audit](admin-spfx-phase-6-prerequisite-audit.md) — substrate inventory
