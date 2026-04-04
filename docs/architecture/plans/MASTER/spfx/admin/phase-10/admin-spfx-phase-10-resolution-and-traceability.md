# Phase 10 — Resolution Engine and Run-to-Config Traceability

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 06  
**Date:** 2026-04-04  
**Status:** Implemented

---

## 1. Purpose

The resolution engine makes the hybrid source-of-truth model operational. Given a config key, it computes the effective value by applying the precedence order from P10-02 §5 and returns full provenance. Snapshots capture the effective state at a point in time so downstream runs can reference exactly which config they consumed.

---

## 2. Precedence order

| Priority | Source | Condition |
|----------|--------|-----------|
| 1 (highest) | Infrastructure (environment variable) | Item marked `infrastructureControlled: true` and env var is set |
| 2 | Live admin override (published) | Item marked `liveEditable: true` and a published override exists |
| 3 | Code default | No override exists, or item is not live-editable, or env var not set for infra item |
| — | Secret / Key Vault | Excluded — secret items are never resolved through this engine |

---

## 3. Resolution contract

For any resolved item, the system answers:

| Question | Field |
|----------|-------|
| What value was used? | `effectiveValue` |
| Where did it come from? | `source` (`'code-default'`, `'live-override'`, `'infrastructure'`) |
| What version was active? | `version` (number for live overrides, null otherwise) |
| Who last changed the live version? | `lastChangedBy` (actor context, null if not live override) |
| When was it last changed? | `lastChangedAt`, `publishedAt` |
| What is the code default for comparison? | `codeDefault` |

---

## 4. Service architecture

```
┌──────────────────────────────────┐
│  IConfigResolutionService        │  ← API routes and run orchestrators consume this
├──────────────────────────────────┤
│  resolveItem(key)                │  → single item with provenance
│  resolveAll(domain?)             │  → all items (domain-scoped or full), excludes secrets
│  captureSnapshot(domain?)        │  → immutable snapshot persisted in snapshot store
│  getSnapshot(snapshotId)         │  → retrieve a previously captured snapshot
└───────┬──────────┬───────────────┘
        │          │
        ▼          ▼
┌───────────┐  ┌────────────────┐
│ Override   │  │ Snapshot Store  │
│ Store      │  │ (ConfigSnapshots│
│ (P10-04)   │  │  table)        │
└───────────┘  └────────────────┘
```

**Dependencies:**
- `IConfigOverrideStore` (P10-04) — provides live override records
- `IConfigSnapshotStore` (new) — persists immutable snapshots
- `IResolvableCatalogEntry[]` — catalog entries defining defaults, editability, and infrastructure flags
- `EnvReader` — injectable function for reading environment variables (defaults to `process.env`)

---

## 5. Snapshot model

A snapshot captures the complete effective config state at a point in time.

| Field | Description |
|-------|-------------|
| `snapshotId` | UUID, unique per snapshot |
| `resolvedAt` | ISO 8601 timestamp of capture |
| `versionMap` | Map of config key → version number (live overrides only) |
| `effectiveValues` | Map of config key → effective value |
| `sourceMap` | Map of config key → source attribution |

Snapshots are **immutable** after creation. The snapshot store rejects duplicate IDs.

**Storage:** `ConfigSnapshots` Azure Table Storage table, partitioned by `'snapshot'`, row key = `snapshotId`.

---

## 6. Run-to-config traceability

### How a run captures its config

1. Before a run starts, the orchestrator calls `configResolution.captureSnapshot()`.
2. The returned `snapshotId` is stored in the run's `configSnapshotRef` field (already present on `IAdminRunEnvelope`).
3. After the run completes, anyone can call `configResolution.getSnapshot(snapshotId)` to inspect the exact config state the run used.

### What the snapshot answers for a run

- What was the effective value of every config item when this run executed?
- Which items had live overrides vs. code defaults?
- Has the config changed since this run executed? (Compare current resolved values to snapshot)

### Integration points

| Run Type | Integration Status |
|----------|-------------------|
| Admin runs (`IAdminRunEnvelope`) | Ready — `configSnapshotRef` field exists |
| Provisioning saga (`IProvisioningStatus`) | Compatibility seam — `configSnapshotRef` can be added when needed |
| SharePoint control actions (Phase 8) | Compatibility seam — snapshot ID can be passed as parameter |
| Hybrid identity operations (Phase 9) | Compatibility seam — snapshot ID can be passed as parameter |
| Device package deployments (Phase 9B) | Compatibility seam — snapshot ID can be passed as parameter |

---

## 7. Implementation locations

| Artifact | Location |
|---------|----------|
| `IResolvedConfigItem`, `ConfigValidationStatus` | `packages/models/src/admin-control-plane/IConfigGovernance.ts` |
| `IConfigResolutionService`, `ConfigResolutionService` | `backend/functions/src/services/admin-control-plane/config-resolution-service.ts` |
| `IConfigSnapshotStore`, `DurableConfigSnapshotStore`, `MockConfigSnapshotStore` | `backend/functions/src/services/admin-control-plane/config-snapshot-store.ts` |
| Service factory wiring | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` |
| Tests | `backend/functions/src/services/admin-control-plane/__tests__/config-resolution-service.test.ts` |
