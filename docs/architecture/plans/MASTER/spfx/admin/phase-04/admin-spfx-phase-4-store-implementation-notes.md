# Admin SPFx IT Control Center — Phase 4 Store Implementation Notes

**Prompt:** P4-03 — Durable Run Store and Audit Spine Implementation  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Document where the new durable stores live, how keys are generated, what remains compatibility-only, and what is deferred.

---

## 1. New stores

### `AdminRuns` — Durable admin run store

| Aspect | Value |
|--------|-------|
| Implementation | `DurableAdminRunStore` in `backend/functions/src/services/admin-control-plane/admin-run-store.ts` |
| Technology | Azure Table Storage via `createAppTableClient('AdminRuns')` |
| Partition key | `domain` (AdminDomain enum value — enables domain-scoped queries) |
| Row key | `runId` (UUID v4 — globally unique) |
| Write mode | Replace (full entity upsert — matches provisioning precedent) |
| Entity shape | Serialized `IAdminRunEnvelope` with JSON string fields for complex types |
| Mock/test mode | `InMemoryAdminRunService` (unchanged from Phase 3) |

### `AdminAuditEvents` — Durable admin audit store

| Aspect | Value |
|--------|-------|
| Implementation | `DurableAdminAuditStore` in `backend/functions/src/services/admin-control-plane/admin-audit-store.ts` |
| Technology | Azure Table Storage via `createAppTableClient('AdminAuditEvents')` |
| Partition key | `runId` (groups all events for one run; `__global__` for non-run events) |
| Row key | `auditId` (UUID v4 — unique per event) |
| Write mode | Insert (append-only — audit events are immutable) |
| Entity shape | Serialized `IAdminAuditRecord` with JSON string fields for nested objects |
| Mock/test mode | `MockAdminAuditStore` (in-memory, deterministic) |

---

## 2. Key generation

| Key | Format | Generator |
|-----|--------|-----------|
| `runId` | UUID v4 | `crypto.randomUUID()` in `DurableAdminRunStore.launchRun()` |
| `auditId` | UUID v4 | Caller-generated (expected in `IAdminAuditRecord.auditId`) |
| Partition key (runs) | AdminDomain enum string value | Extracted from `IAdminRunEnvelope.domain` |
| Partition key (audit) | `runId` or `__global__` | From `IAdminAuditRecord.runId` |

---

## 3. Serialization patterns

Both stores follow the provisioning precedent:
- Complex objects → `JSON.stringify()` stored as string fields (suffixed with `Json`)
- Optional strings → empty string `''` when null/undefined
- Deserialization → `JSON.parse()` for JSON fields; empty-string-to-null for optional strings
- Numeric fields with null semantics → sentinel value `-1` for null (e.g., `currentStep`)

---

## 4. Compatibility-only stores (preserved, not modified)

| Store | Table/List | Owner | Phase 4 action |
|-------|-----------|-------|---------------|
| `ProvisioningStatus` | Azure Table Storage | Project-setup host / `table-storage-service.ts` | Preserved as-is |
| `ProvisioningAuditLog` | SharePoint list | `sharepoint-service.ts` | Preserved as-is |

---

## 5. Service factory wiring

| Mode | Run service | Audit service |
|------|------------|--------------|
| Production (`proxy`) | `DurableAdminRunStore` (Table Storage) | `DurableAdminAuditStore` (Table Storage) |
| Mock/test (`mock` / `NODE_ENV=test`) | `InMemoryAdminRunService` (Map-backed) | `MockAdminAuditStore` (array-backed) |

---

## 6. What is deferred

| Item | Target |
|------|--------|
| Evidence metadata table (`AdminEvidence`) | P4-06 |
| Oversized evidence blob storage | Phase 6 |
| Retention TTL enforcement | Phase 13 |
| Config version snapshotting | Phase 10 |
| Run-to-audit event automatic recording | P4-05 (wired in retrieval API implementation) |

---

## Cross-references

- [Phase 4 baseline](./admin-spfx-phase-4-run-audit-evidence-baseline.md)
- [Persistence boundary matrix](./admin-spfx-phase-4-persistence-boundary-matrix.md)
- [Phase 4 repo-truth audit](./admin-spfx-phase-4-repo-truth-audit.md)
- [`admin-run-store.ts`](../../../../../backend/functions/src/services/admin-control-plane/admin-run-store.ts)
- [`admin-audit-store.ts`](../../../../../backend/functions/src/services/admin-control-plane/admin-audit-store.ts)
- [Service factory](../../../../../backend/functions/src/hosts/admin-control-plane/service-factory.ts)
