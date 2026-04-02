# Provisioning Models Reference

> Site provisioning saga orchestrator — SharePoint site creation workflow.

**Package:** `@hbc/models` | **Module:** `provisioning`
**Consumers:** `backend/functions/` (saga orchestrator, step functions, SignalR push), `packages/provisioning/` (API client, store, hooks), `apps/admin/`, `apps/pwa/`

## Durable Persistence Model (P4-02)

- One Azure Table Storage entity per saga run.
- **PartitionKey:** `projectId` | **RowKey:** `correlationId`
- Upsert mode: `Replace` (full entity replacement after every step).
- Retries create new rows (new `correlationId`) in the same partition.
- `getProvisioningStatus(projectId)` returns the latest run by `startedAt`.
- See `docs/reference/provisioning/durable-status-contract.md` for the full contract.

## Interfaces

### `IProvisionSiteRequest`

Request body for triggering a new provisioning saga.

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Immutable auto-generated project identifier (UUID v4) |
| `projectNumber` | `string` | Human-assigned project number (##-###-##) |
| `projectName` | `string` | Display name |
| `triggeredBy` | `string` | UPN of initiating user (from Bearer token) |
| `triggeredByOid?` | `string` | Entra Object ID of initiating user |
| `correlationId` | `string` | Unique run identity (UUID v4, generated at trigger time) |
| `parentCorrelationId?` | `string` | Correlation ID of prior run on retry (traceability chain) |
| `groupMembers` | `string[]` | UPNs for Team group membership |
| `submittedBy` | `string` | UPN of Estimating Coordinator |
| `submittedByOid?` | `string` | Entra Object ID of Estimating Coordinator |
| `groupLeaders?` | `string[]` | UPNs for Leaders group (Full Control) |
| `department?` | `ProjectDepartment` | Department for background viewer access lookup |

### `IProvisioningStatus`

Authoritative provisioning run record. One entity per saga run in Azure Table Storage.

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Project identifier (Table PartitionKey) |
| `projectNumber` | `string` | Human-assigned project number (##-###-##) |
| `projectName` | `string` | Display name |
| `correlationId` | `string` | Unique run identity (Table RowKey) |
| `overallStatus` | `ProvisioningOverallStatus` | Saga lifecycle status |
| `currentStep` | `number` | Current step (1-7) or 0 before first step |
| `steps` | `ISagaStepResult[]` | Per-step results (always 7 entries) |
| `siteUrl?` | `string` | SharePoint site URL (set by Step 1) |
| `triggeredBy` | `string` | UPN of provisioning initiator |
| `triggeredByOid?` | `string` | Entra Object ID of initiator |
| `submittedBy` | `string` | UPN of Estimating Coordinator |
| `submittedByOid?` | `string` | Entra Object ID of Coordinator |
| `groupMembers` | `string[]` | Team group UPNs |
| `startedAt` | `string` | ISO 8601 run start (sort key for latest-run reads) |
| `completedAt?` | `string` | ISO 8601 terminal success timestamp |
| `failedAt?` | `string` | ISO 8601 terminal failure timestamp |
| `step5DeferredToTimer` | `boolean` | Whether Step 5 deferred to overnight timer |
| `step5TimerRetryCount` | `number` | Consecutive timer retries for Step 5 (ceiling: 3) |
| `retryCount` | `number` | Total provisioning retry count |
| `escalatedBy?` | `string` | UPN of admin who escalated |
| `escalatedAt?` | `string` | ISO 8601 escalation timestamp |
| `groupLeaders?` | `string[]` | UPNs for Leaders group (Full Control) |
| `department?` | `ProjectDepartment` | Department classification |
| `entraGroups?` | `IEntraGroupSet` | Entra ID group IDs from Step 6 |
| `failureClass?` | `ProvisioningFailureClass` | Backend-assigned failure classification |
| `lastRetryAt?` | `string` | ISO 8601 most recent retry timestamp |

### `ISagaStepResult`

Result for a single saga step execution.

| Field | Type | Description |
|-------|------|-------------|
| `stepNumber` | `number` | Step number (1-7) |
| `stepName` | `string` | Human-readable step name |
| `status` | `SagaStepStatus` | Step execution status |
| `startedAt?` | `string` | ISO 8601 start time |
| `completedAt?` | `string` | ISO 8601 completion time |
| `errorMessage?` | `string` | Error message if failed |
| `idempotentSkip?` | `boolean` | True if skipped by idempotency check |
| `metadata?` | `Record<string, unknown>` | Structured step reporting metadata |

### `IProvisioningProgressEvent`

Real-time progress event pushed via SignalR on each step state change.

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | `string` | Subscription key |
| `projectNumber` | `string` | Display context |
| `projectName` | `string` | Display context |
| `correlationId` | `string` | Saga run identity |
| `stepNumber` | `number` | Step number (1-7) |
| `stepName` | `string` | Step name |
| `status` | `SagaStepStatus` | Step status |
| `overallStatus` | `ProvisioningOverallStatus` | Current overall saga status |
| `timestamp` | `string` | ISO 8601 event time |
| `errorMessage?` | `string` | Error message if step failed |

### `IProvisioningAuditRecord`

Audit record written to SharePoint ProvisioningAuditLog list.

### `IEntraGroupSet`

Entra ID security group IDs created during provisioning Step 6.

| Field | Type |
|-------|------|
| `leadersGroupId` | `string` |
| `teamGroupId` | `string` |
| `viewersGroupId` | `string` |

## Type Unions

### `ProvisioningOverallStatus`

`'NotStarted'` | `'InProgress'` | `'BaseComplete'` | `'Completed'` | `'Failed'` | `'WebPartsPending'`

- **NotStarted** — queued, not yet started
- **InProgress** — saga executing
- **BaseComplete** — Steps 1-6 complete, awaiting Step 7
- **Completed** — all steps successful (terminal)
- **Failed** — saga failed; admin may retry (terminal)
- **WebPartsPending** — Step 5 deferred to overnight timer; Steps 6-7 may have completed

### `SagaStepStatus`

`'NotStarted'` | `'InProgress'` | `'Completed'` | `'Failed'` | `'Skipped'` | `'DeferredToTimer'`

- **DeferredToTimer** — Step 5 only; deferred to overnight scheduled retry
- **Skipped** — idempotency check confirmed step already completed

### `ProjectSetupRequestState`

`'Submitted'` | `'UnderReview'` | `'NeedsClarification'` | `'AwaitingExternalSetup'` | `'ReadyToProvision'` | `'Provisioning'` | `'Completed'` | `'Failed'`

### `ProjectDepartment`

`'commercial'` | `'luxury-residential'`

### `ProvisioningFailureClass`

`'transient'` | `'structural'` | `'permissions'` | `'repeated'` | `'admin-class'`

Backend-assigned only. Agents must NOT infer from error strings.

## Runtime Constants

| Constant | Type | Value |
|----------|------|-------|
| `SAGA_STEPS` | `readonly string[]` | 7-element array of step names |
| `TOTAL_SAGA_STEPS` | `number` | `7` |

## Correlation Model

See `docs/reference/provisioning/durable-status-contract.md` for the full correlation chain, persistence model, and read semantics.
