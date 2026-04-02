# Phase 4 — Durable Status Contract and Run Correlation Report

> **Prompt:** P4-02 | **Date:** 2026-04-01 | **Type:** Contract hardening + documentation

## Adopted Physical Persistence Model

**Confirmed and hardened:** One Azure Table Storage entity per saga run.

- **PartitionKey:** `projectId` — groups all runs for a project
- **RowKey:** `correlationId` — unique per saga run (UUID v4)
- **Upsert mode:** `Replace` — full entity replacement after every step (idempotent)
- **Decision:** The existing per-run persistence model is correct and deliberately preserved. No change to the storage architecture.

## Adopted Logical Project-Read Model

**Confirmed:** `getProvisioningStatus(projectId)` returns the latest run by `startedAt` timestamp.

- Standard consumers (PWA, status endpoint) always see the latest run.
- Admin consumers can access all historical rows via `listAllRuns()`.
- Client store keys status by `projectId` (one entry = latest run).

## Correlation Field Table

| Identifier | Scope | Generated | Persisted | Purpose |
|------------|-------|-----------|-----------|---------|
| `projectId` | Project | Request creation | Table PartitionKey | Links request to status |
| `correlationId` | Run | Launch / retry | Table RowKey | Unique run identity |
| `parentCorrelationId` | Retry chain | Retry | Launch request only | Traceability to prior run |

**Note:** `parentCorrelationId` is carried on `IProvisionSiteRequest` at retry time and logged for traceability. It is not persisted on the `IProvisioningStatus` entity — the chain is preserved through the partition's multiple rows and telemetry logs.

## Launch / Retry / Latest-Read Semantics

| Path | New correlationId? | New Table row? | Request reconciliation |
|------|--------------------|----------------|----------------------|
| Auto-trigger launch | Yes | Yes | -> Provisioning |
| Direct launch | Yes | Yes | -> Provisioning |
| Retry | Yes | Yes (new row, same partition) | -> Provisioning (via execute) |
| Timer Step 5 | No | No (updates existing row) | -> Completed or Failed |

## Status Contract Changes (P4-02)

### Fields added to Table Storage persistence

Six fields declared on `IProvisioningStatus` were previously not serialized to Azure Table Storage. They were set in memory during saga execution but lost on read-back. This has been corrected:

| Field | Serialization | Deserialization |
|-------|--------------|-----------------|
| `groupLeaders` | `groupLeadersJson` (JSON array) | Parsed to `string[]` |
| `department` | `department` (string) | Cast to `ProjectDepartment` or undefined |
| `entraGroups` | `entraGroupsJson` (JSON object or null) | Parsed to `IEntraGroupSet` or undefined |
| `failureClass` | `failureClass` (string) | Cast to `ProvisioningFailureClass` or undefined |
| `lastRetryAt` | `lastRetryAt` (string) | Passthrough or undefined |
| `escalatedAt` | `escalatedAt` (string) | Passthrough or undefined |

### escalatedAt now set on escalation

The `escalateProvisioning()` method in both `RealTableStorageService` and `MockTableStorageService` now sets `escalatedAt` to the current ISO timestamp alongside `escalatedBy`.

### JSDoc hardening

Added comprehensive JSDoc to:

- `IProvisioningStatus` interface — documents durable persistence model, correlation chain, and read semantics
- `ITableStorageService` interface — documents storage model, partition/row key strategy, and read semantics
- `SagaOrchestrator` class — documents run identity, request reconciliation, and retry chain
- `SagaOrchestrator.retry()` method — documents new run identity creation
- `RealTableStorageService.deserialize()` — P4-02 attribution

## Package/Client Alignment Changes

- `packages/models/src/provisioning/IProvisioning.ts` — field-level JSDoc added to all `IProvisioningStatus` fields
- `docs/reference/models/provisioning.md` — complete rewrite to match live code (14 contradictions resolved)
- `docs/reference/provisioning/durable-status-contract.md` — new canonical contract document

## Doc Updates

| Document | Action | Reason |
|----------|--------|--------|
| `docs/reference/models/provisioning.md` | Rewritten | Was materially stale (P4-01 finding) — wrong field names, wrong enum values, missing fields |
| `docs/reference/provisioning/durable-status-contract.md` | Created | No canonical durable status contract documentation existed |
| `packages/models/src/provisioning/IProvisioning.ts` | JSDoc added | Persistence model and correlation semantics undocumented |
| `backend/functions/src/services/table-storage-service.ts` | JSDoc + persistence fix | Interface JSDoc, 6 missing fields now persisted, escalatedAt set |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | JSDoc added | Run identity and reconciliation semantics undocumented |

## Unresolved Residual Risks

### 1. parentCorrelationId not persisted on status entity

`parentCorrelationId` is passed on the `IProvisionSiteRequest` at retry time and logged to telemetry, but is not stored on the `IProvisioningStatus` entity in Table Storage. The retry chain is reconstructible from partition rows (sorted by `startedAt`) and telemetry, but not from a single status read. This is acceptable for the current model but should be reconsidered if admin tooling needs to display the retry chain from status alone.

### 2. WebPartsPending gap in request state

Request remains `Provisioning` when Step 5 defers to timer. Addressed in Prompt-04 scope.

### 3. Admin force-state does not reconcile request

`forceStateTransition()` changes provisioning `overallStatus` without updating request state. Addressed in Prompt-04/05 scope.

### 4. Concurrent retry race condition

No mutual exclusion on simultaneous retries. Addressed in Prompt-04 scope.

## Verification Evidence

### Persistence contract

- `upsertProvisioningStatus()` now serializes all 6 previously-missing fields
- `deserialize()` now deserializes all 6 fields with safe parsing
- Both real and mock adapters updated consistently
- `escalateProvisioning()` now sets `escalatedAt` in both adapters

### Type alignment

- `IProvisioningStatus` interface unchanged (fields already declared, now persisted)
- No consumer changes required — consumers already reference these optional fields

### Documentation

- `docs/reference/models/provisioning.md` rewritten with correct field names, enum values, and correlation model
- `docs/reference/provisioning/durable-status-contract.md` created with full persistence, correlation, and read model documentation
- JSDoc added to 3 source files across 2 packages

## Completion Standard

The repo now contains one explicit, evidence-backed answer to:

> What durable status entities exist, what run identity they represent, and what canonical project-level status read model consumers should rely on.

**Answer:** One entity per saga run, keyed by `projectId` + `correlationId`. Run identity is `correlationId` (UUID v4). The canonical project-level read returns the latest run by `startedAt`. This is documented in `docs/reference/provisioning/durable-status-contract.md`, in the `IProvisioningStatus` JSDoc, and in the `ITableStorageService` interface JSDoc.
