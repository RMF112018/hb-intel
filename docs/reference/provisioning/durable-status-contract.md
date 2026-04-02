# Durable Status Contract

> P4-02: Canonical documentation of the provisioning durable status persistence model, run correlation, and read semantics.

## Physical Persistence Model

**Storage:** Azure Table Storage, table `ProvisioningStatus`

| Key | Field | Purpose |
|-----|-------|---------|
| **PartitionKey** | `projectId` | Groups all runs for one project |
| **RowKey** | `correlationId` | Unique identity per saga run (UUID v4) |

**Upsert semantics:** Every step writes the full entity using `Replace` mode (idempotent).

**Run lifecycle:** Each `SagaOrchestrator.execute()` call creates one entity. Retries create new entities with new `correlationId` values in the same partition.

## Canonical Read Model

**Latest-run reads:** `getProvisioningStatus(projectId)` scans the partition and returns the entity with the latest `startedAt` timestamp. This is the only read path for standard consumers (PWA progress view, status endpoint).

**All-runs reads:** `listAllRuns(status?)` returns entities across all partitions, optionally filtered by `overallStatus`. Used by admin oversight.

**Client store:** Keys status by `projectId` — one entry per project, always the latest run.

## Correlation Chain

| Identifier | Scope | Purpose |
|------------|-------|---------|
| `projectId` | Project | Links request, status partition, and all runs for a project |
| `correlationId` | Run | Unique saga execution identity (UUID v4, generated at launch) |
| `parentCorrelationId` | Retry chain | Previous run's `correlationId`, set on `IProvisionSiteRequest` at retry time |

**Chain example:**

1. Initial run: `correlationId = A`, no parent
2. Retry: `correlationId = B`, `parentCorrelationId = A`
3. Second retry: `correlationId = C`, `parentCorrelationId = B`

Both rows A and B persist in Table Storage. `getProvisioningStatus()` returns C (latest `startedAt`).

## Launch and Retry Semantics

### Launch (auto-trigger)

- **Trigger:** Controller advances request to `ReadyToProvision`
- **Guard:** Only fires if no existing status or previous status is `Failed`
- **Identity:** Fresh `correlationId` generated, new entity created
- **Reconciliation:** Request state set to `Provisioning` immediately

### Launch (direct)

- **Endpoint:** `POST /api/provision-project-site`
- **Response:** HTTP 202 `{ message, projectId, correlationId }`
- **Identity:** `correlationId` from request body or fresh UUID

### Retry

- **Endpoint:** `POST /api/provisioning-retry/{projectId}`
- **Response:** HTTP 202 `{ message, projectId }`
- **Identity:** Loads latest run, generates new `correlationId`, sets `parentCorrelationId`
- **Behavior:** `retryCount` incremented, step idempotency guards skip completed steps

### Timer (Step 5 follow-on)

- **Trigger:** Nightly timer scans for `step5DeferredToTimer eq true AND overallStatus eq 'WebPartsPending'`
- **Identity:** Updates the existing entity in place (same `correlationId`)
- **Ceiling:** 3 timer attempts via `step5TimerRetryCount`

## Request State Reconciliation

The saga reconciles the project setup request at these points:

| Trigger | Request State | Timing |
|---------|--------------|--------|
| Saga starts | `Provisioning` | Immediate |
| Saga completes (non-deferred) | `Completed` | With siteUrl, completedBy, completedAt |
| Saga fails | `Failed` | Immediate |
| Timer completes Step 5 | `Completed` | completedBy = 'timer' |
| Timer fails Step 5 (ceiling) | `Failed` | Immediate |
| Step 5 deferred | No change | Request stays `Provisioning` |
| Admin mutations | No change | Escalation, archive, force-state do not reconcile |

## Terminal States

| Status | Terminal | Next possible action |
|--------|---------|---------------------|
| `Completed` | Yes | None (success) |
| `Failed` | Yes | Admin retry or archive |
| `WebPartsPending` | No | Awaits timer; eventually -> Completed or Failed |
| `InProgress` | No | Saga executing |

## Consumers

### Direct

- Admin `ProvisioningOversightPage` — full status via `listProvisioningRuns()`
- PWA `ProvisioningProgressView` — latest status via SignalR + polling
- Backend status routes — `GET /api/provisioning-status/{projectId}`

### Indirect

- Accounting `ProjectReviewDetailPage` — request state only, reconciled at terminal boundaries

## Serialization Notes

Complex fields are JSON-serialized for Azure Table Storage:
- `steps` -> `stepsJson`
- `groupMembers` -> `groupMembersJson`
- `groupLeaders` -> `groupLeadersJson`
- `entraGroups` -> `entraGroupsJson`

Empty/undefined primitives are stored as empty strings (Table Storage limitation).
