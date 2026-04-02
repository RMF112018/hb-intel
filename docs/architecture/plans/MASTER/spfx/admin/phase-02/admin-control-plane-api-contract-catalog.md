# Admin Control Plane — API Contract Catalog

## Purpose

This is the canonical API contract catalog for the admin control plane. It defines the request/response vocabulary that the operator console (SPFx) and privileged backend (Azure Functions) will implement in Phase 3.

These contracts are transport-agnostic — no HTTP status codes, route paths, or framework-specific types. Phase 3 maps them to concrete Azure Function endpoints.

The shared DTO surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Shared envelope patterns

All API contracts use consistent response envelopes, aligned with existing backend response helpers (`successResponse`, `listResponse`, `errorResponse`).

| Envelope | DTO | Shape |
|----------|-----|-------|
| Single resource | `IAdminApiResponse<T>` | `{ data: T, requestId: string }` |
| Paginated list | `IAdminApiListResponse<T>` | `{ items: T[], pagination: { total, page, pageSize, totalPages }, requestId: string }` |
| Error | `IAdminApiError` | `{ code: string, message: string, requestId: string, fieldErrors?: [...], runId?: string }` |

The `requestId` field supports X-Request-Id propagation for end-to-end tracing, consistent with the existing `extractOrGenerateRequestId` pattern.

## Endpoint-intent table

| # | Intent | Request DTO | Response DTO | Behavior | Auth |
|---|--------|-------------|--------------|----------|------|
| 1 | Launch a new admin run | `IAdminRunLaunchRequest` | `IAdminApiResponse<IAdminRunLaunchResponse>` | Async run launch | Authenticated operator |
| 2 | Get run status | `IAdminRunStatusRequest` | `IAdminApiResponse<IAdminRunEnvelope>` | Synchronous read | Authenticated operator |
| 3 | Get run history | `IAdminRunHistoryRequest` | `IAdminApiListResponse<IAdminRunSummary>` | Synchronous read | Authenticated operator |
| 4 | Get run detail | `IAdminRunStatusRequest` | `IAdminApiResponse<IAdminRunEnvelope>` | Synchronous read | Authenticated operator |
| 5 | Cancel a run | `IAdminRunCancelRequest` | `IAdminApiResponse<IAdminRunEnvelope>` | Synchronous state change | Authenticated operator |
| 6 | Retry a failed run | `IAdminRunRetryRequest` | `IAdminApiResponse<IAdminRunRetryResponse>` | Async run launch (new run) | Authenticated operator |
| 7 | Record checkpoint decision | `IAdminCheckpointDecisionRequest` | `IAdminApiResponse<IAdminCheckpointDecisionResponse>` | Synchronous + triggers async resume | Authenticated operator |
| 8 | Run preflight validation | `IAdminPreflightRequest` | `IAdminApiResponse<IAdminPreflightResponse>` | Synchronous validation | Authenticated operator |
| 9 | Preview / dry-run | `IAdminRunLaunchRequest` (with `dryRun: true`) | `IAdminApiResponse<IAdminPreviewResponse>` | Synchronous analysis | Authenticated operator |
| 10 | Get config state | `IAdminConfigRequest` | `IAdminApiResponse<IAdminConfigResponse>` | Synchronous read | Authenticated operator |
| 11 | List action metadata | `IAdminActionMetadataRequest` | `IAdminApiListResponse<IAdminActionMetadata>` | Synchronous read | Authenticated operator |

## Contract details

### 1. Launch run

**Intent**: Create and start a new admin control-plane run.

**Request** (`IAdminRunLaunchRequest`):
- `actionKey` — action from the catalog (required)
- `commandInput` — domain-specific payload (required, opaque to envelope)
- `targetEntityId` — entity being operated on (optional)
- `dryRun` — if true, returns preview instead of launching (optional)

**Response** (`IAdminRunLaunchResponse`):
- `runId` — new run's unique identifier
- `status` — initial status (typically `Pending`)
- `actionKey`, `executionMode`, `riskLevel` — confirmed action parameters

**Behavior**: Async run launch. The response confirms the run was created; actual execution proceeds asynchronously. The operator polls status or receives SignalR updates.

**Idempotency**: Not idempotent. Each call creates a new run. Duplicate protection is the caller's responsibility (UI debounce).

### 2–4. Get run status / history / detail

**Intent**: Read run state for operator visibility.

**Status request** (`IAdminRunStatusRequest`): `runId` only.

**History request** (`IAdminRunHistoryRequest`): Filters by `domain`, `status`, `targetEntityId` with pagination (`page`, `pageSize`).

**Status/detail response**: Full `IAdminRunEnvelope` including all steps.

**History response**: Paginated list of `IAdminRunSummary` (lightweight projection without step details).

**Behavior**: Synchronous read. No side effects.

**Idempotency**: Naturally idempotent (read-only).

### 5. Cancel run

**Intent**: Cancel a running or pending run before completion.

**Request** (`IAdminRunCancelRequest`):
- `runId` — run to cancel (required)
- `reason` — cancellation reason for audit trail (required)

**Response**: Updated `IAdminRunEnvelope` with `status: Cancelled`.

**Behavior**: Synchronous state change. The backend sets the run to `Cancelled` and stops further step execution. Compensation for already-completed steps may be triggered depending on the action's compensation policy.

**Idempotency**: Idempotent. Cancelling an already-cancelled run returns the same result.

### 6. Retry run

**Intent**: Retry a failed run by creating a new run linked to the original.

**Request** (`IAdminRunRetryRequest`): `runId` of the failed run.

**Response** (`IAdminRunRetryResponse`):
- `newRunId` — the retry run's ID
- `originalRunId` — the failed run's ID (now `parentRunId`)
- `retryCount` — incremented retry count

**Behavior**: Async run launch. Creates a new run with `parentRunId` pointing to the original. Steps completed in the original may be skipped on retry (idempotency).

**Idempotency**: Not idempotent. Each call creates a new retry run.

### 7. Record checkpoint decision

**Intent**: Approve or reject a checkpoint in a paused run.

**Request** (`IAdminCheckpointDecisionRequest`):
- `runId` — run with pending checkpoint
- `stepNumber` — step at the checkpoint
- `decision` — `'approve'` or `'reject'`
- `comment` — optional decision rationale

**Response** (`IAdminCheckpointDecisionResponse`):
- `runId`, `stepNumber`, `decision` — confirmation
- `updatedStatus` — new run status after decision

**Behavior**: Synchronous decision record. If approved, triggers async resume of run execution. If rejected, transitions run to `Cancelled`.

**Idempotency**: Idempotent for same decision. Conflicting decisions on the same checkpoint return an error.

### 8. Run preflight validation

**Intent**: Check prerequisites before launching an action.

**Request** (`IAdminPreflightRequest`):
- `actionKey` — action to validate for
- `commandInput` — payload to validate
- `targetEntityId` — target entity (optional)

**Response** (`IAdminPreflightResponse`):
- `ready` — boolean overall readiness
- `checks` — array of `IAdminPreflightCheck` (each with `checkId`, `label`, `passed`, `message`, `blocking`)

**Behavior**: Synchronous validation. No state changes.

**Idempotency**: Naturally idempotent (read-only).

### 9. Preview / dry-run

**Intent**: Show what would happen if an action were executed, without making changes.

**Request**: Same as launch (`IAdminRunLaunchRequest`) with `dryRun: true`.

**Response** (`IAdminPreviewResponse`):
- `actionKey` — action previewed
- `impactSummary` — array of `IAdminPreviewImpactItem` (resource, changeType, description)
- `riskLevel` — assessed risk
- `warnings` — any detected issues

**Behavior**: Synchronous analysis. No state changes. The backend simulates execution and reports what would change.

**Idempotency**: Naturally idempotent (read-only).

### 10. Get config state

**Intent**: Read current configuration/standards state.

**Request** (`IAdminConfigRequest`): `scope` identifier.

**Response** (`IAdminConfigResponse`):
- `scope`, `version`, `lastModifiedAt`, `lastModifiedBy` — config metadata
- `values` — domain-specific config values

**Behavior**: Synchronous read. No side effects.

**Idempotency**: Naturally idempotent.

### 11. List action metadata

**Intent**: Discover available admin actions and their current availability.

**Request** (`IAdminActionMetadataRequest`): Optional `domain` filter.

**Response**: Paginated list of `IAdminActionMetadata` — each with `actionKey`, labels, risk/mode info, `available` flag, and `unavailableReason`.

**Behavior**: Synchronous read. The backend checks prerequisites in real time to populate `available` flags.

**Idempotency**: Naturally idempotent.

## Auth / operator-context expectations

All contracts require an authenticated operator context:
- JWT Bearer token validated via `withAuth()` middleware
- `IAdminActorContext` derived from JWT claims (`upn`, `oid`, `name`)
- The actor context is captured on run creation and checkpoint decisions for audit traceability
- Authorization (which operators can perform which actions) is a Phase 3 implementation concern; the contract layer defines that auth is required, not how it is enforced

## Async vs sync behavior summary

| Behavior | Contracts | SignalR |
|----------|-----------|--------|
| **Synchronous read** | Status, history, detail, config, action metadata, preflight, preview | Not applicable |
| **Synchronous state change** | Cancel, checkpoint decision | Status push after state change |
| **Async run launch** | Launch, retry | Real-time step progress via SignalR |

## Idempotency summary

| Contract | Idempotent | Notes |
|----------|-----------|-------|
| Launch run | No | Each call creates a new run |
| Get status/history/detail | Yes | Read-only |
| Cancel run | Yes | Same result on repeat |
| Retry run | No | Each call creates a new retry run |
| Checkpoint decision | Yes | Same decision; conflicts error |
| Preflight | Yes | Read-only |
| Preview | Yes | Read-only |
| Get config | Yes | Read-only |
| List metadata | Yes | Read-only |

## DTO cross-reference

| DTO | File | Used by contracts |
|-----|------|-------------------|
| `IAdminApiResponse<T>` | `IAdminApi.ts` | All single-resource responses |
| `IAdminApiListResponse<T>` | `IAdminApi.ts` | History, action metadata |
| `IAdminApiError` | `IAdminApi.ts` | All error responses |
| `IAdminRunLaunchRequest` | `IAdminApi.ts` | Launch, preview/dry-run |
| `IAdminRunLaunchResponse` | `IAdminApi.ts` | Launch |
| `IAdminRunStatusRequest` | `IAdminApi.ts` | Status, detail |
| `IAdminRunHistoryRequest` | `IAdminApi.ts` | History |
| `IAdminRunSummary` | `IAdminApi.ts` | History list items |
| `IAdminRunCancelRequest` | `IAdminApi.ts` | Cancel |
| `IAdminRunRetryRequest` / `Response` | `IAdminApi.ts` | Retry |
| `IAdminCheckpointDecisionRequest` / `Response` | `IAdminApi.ts` | Checkpoint |
| `IAdminPreflightRequest` / `Response` / `Check` | `IAdminApi.ts` | Preflight |
| `IAdminPreviewResponse` / `ImpactItem` | `IAdminApi.ts` | Preview |
| `IAdminConfigRequest` / `Response` | `IAdminApi.ts` | Config |
| `IAdminActionMetadataRequest` / `Metadata` | `IAdminApi.ts` | Action discovery |
| `IAdminRunEnvelope` | `IAdminRun.ts` | Status, detail, cancel responses |
| `IAdminActorContext` | `IAdminRun.ts` | Run summary, config response |

## Phase 3 implementation handoff notes

Phase 3 should:
1. Map each contract to concrete Azure Function HTTP triggers under a new admin control-plane domain host.
2. Use the existing `withAuth()` middleware for authentication.
3. Use the existing `parseBody()` / `parseQuery()` validators with Zod schemas derived from these DTOs.
4. Use the existing response helpers (`successResponse`, `listResponse`, `errorResponse`) to produce the envelope shapes.
5. Implement the `IAdminRunEnvelope` persistence layer (Phase 4 concern, but Phase 3 needs a working in-memory or Table Storage adapter).
6. Keep provisioning routes in the project-setup host — do not merge them into the admin control-plane host.

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Action catalog](admin-control-plane-action-catalog.md) | Action keys, domains, risk levels, execution modes |
| [Run model](admin-control-plane-run-model.md) | Run envelope, lifecycle states, step results, failure semantics |
| [Phase 2 prerequisite inventory](admin-spfx-phase-2-prereq-and-contract-inventory.md) | Existing provisioning API client patterns |
| [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) | SPFx triggers, backend executes |
| `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` | Domain-host pattern for Phase 3 |
