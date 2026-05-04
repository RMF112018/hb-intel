# Read Model, Command Model, and SharePoint Storage Contract

## Read-Model-First Implementation

Phase 14 should begin with contracts and deterministic fixtures. SPFx renders read models and disabled/non-executing decision affordances until command routes are separately authorized.

## Read Models

### ApprovalQueueReadModel

Fields:

- `projectId`
- `viewerPersona`
- `queueSummary`
- `items`
- `filters`
- `sorts`
- `pagination`
- `degradedState`
- `generatedAtUtc`

### ApprovalQueueItem

Fields:

- `approvalRequestId`
- `checkpointInstanceId`
- `title`
- `sourceModule`
- `checkpointFamily`
- `state`
- `priority`
- `dueUtc`
- `agingBucket`
- `escalationState`
- `currentStepId`
- `currentActionOwnerRole`
- `currentActionOwnerPrincipalKey`
- `assignedToCurrentUser`
- `assignedToCurrentRole`
- `blocksDownstreamWorkflow`
- `sourceSummary`
- `visibleDecisionActions`
- `disabledDecisionReasons`

### ApprovalDetailReadModel

Fields:

- `request`
- `route`
- `steps`
- `participants`
- `sourceReferences`
- `evidenceLinks`
- `decisionHistory`
- `comments`
- `priorityActionLinks`
- `readinessImpact`
- `hbiGroundingRecords`
- `availableActions`
- `redactionState`
- `degradedState`

### CheckpointRegistryReadModel

Fields:

- `checkpointDefinitions`
- `approvalPolicies`
- `routeTemplates`
- `slaDefinitions`
- `reasonCodeCatalog`
- `roleActionMatrix`

### DecisionHistoryReadModel

Fields:

- `approvalRequestId`
- `events`
- `decisions`
- `comments`
- `supersessionChain`
- `archiveState`

### EscalationQueueReadModel

Fields:

- `escalatedItems`
- `summaryByRole`
- `summaryBySourceModule`
- `summaryByAgingBucket`

### AdminVerificationQueueReadModel

Fields:

- `technicalCheckpoints`
- `securityCheckpoints`
- `siteHealthRepairRequests`
- `mappingCorrectionRequests`
- `executionPendingItems`

## Future Command Models

Command models are blocked from MVP runtime unless separately gated.

Every command must include:

- `commandId`
- `approvalRequestId`
- `actorPrincipalKey`
- `actorRole`
- `expectedState`
- `targetAction`
- `reasonCode`
- `comment`
- `evidenceRefs`
- `sourceReferenceVersion`
- `correlationId`
- `idempotencyKey`

## SharePoint Storage Candidates

Storage is documentation-planned only. Future implementation should validate against tenant list strategy and backend boundary.

| Candidate List | Purpose | Notes |
| --- | --- | --- |
| `PCC Approval Requests` | request/control header | high-volume queue list |
| `PCC Approval Steps` | route step records | indexed by request/current step |
| `PCC Approval Participants` | participants/assignments | avoid high-cardinality person-field filtering as first filter |
| `PCC Approval Decisions` | decision records | append-only business audit |
| `PCC Checkpoint Definitions` | module checkpoint registry | low-volume configuration |
| `PCC Approval Policies` | policy versions | versioned configuration |
| `PCC Checkpoint Evidence Links` | source evidence references | references only |
| `PCC Checkpoint Audit Events` | append-only event stream | business/security audit separation |
| `PCC Approval Comments` | comment threads | redaction-aware |
| `PCC Approval Priority Action Links` | action linkage/dedupe | deterministic dedupe keys |

## Queue Index Strategy

Required indexed columns:

- `ProjectId`
- `ApprovalRequestId`
- `CheckpointInstanceId`
- `AssignedToPrincipalKey`
- `AssignedRole`
- `State`
- `DueDate`
- `Priority`
- `EscalationState`
- `SourceModule`
- `CheckpointFamily`
- `CurrentStepId`
- `CreatedUtc`
- `UpdatedUtc`
- `ArchivedFlag`

## Query Rules

- Never fetch all approval records.
- Queue reads must be paged.
- Server-side filters must be applied before client-side filtering.
- Default queues should filter by project, assignment, state, and archive flag.
- Avoid first-order filtering on large multi-person, lookup, or managed metadata columns.
- Denormalize display names and source labels for queue display.
- Use immutable IDs/principal keys for joins and decisions.
- Archive terminal records out of default active queue views.

## Permission and Redaction Strategy

Do not use item-level unique permissions as the default approval security model.

Use:

- inherited storage permissions;
- backend read-model filtering;
- persona/role checks;
- field-level redaction;
- sensitive-field visibility bands;
- audit events for unauthorized access/decision attempts.

Item-level unique permissions may be used only for exceptional document/file cases governed by Document Control or tenant policy, not as the default Phase 14 queue security model.

## Optimistic Update and Concurrency

Future command routes must use:

- `expectedState`;
- `sourceReferenceVersion`;
- `policyVersion`;
- `idempotencyKey`;
- `updatedUtc` or ETag equivalent;
- conflict response semantics.

Conflict outcomes:

- `state-conflict`
- `source-stale`
- `policy-superseded`
- `route-superseded`
- `permission-changed`
- `duplicate-command`

## Versioning and Archive

- Policy versions are retained.
- Decisions are append-only.
- Audit events are append-only.
- Supersession replaces active queue posture without deleting history.
- Archive removes records from active views but preserves history for authorized users.
