# Admin SPFx IT Control Center — Phase 4 Persistence Boundary Matrix

**Prompt:** P4-02 — Canonical Run, Audit, and Evidence Baseline  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Define where each category of admin control-plane data is stored, why, and what Phase 4 must do.

---

## Persistence boundary matrix

| Concern | Authoritative store | Compatibility store(s) | Why it belongs there | What must NOT own it | Current repo anchor | Phase 4 action |
|---------|--------------------|-----------------------|---------------------|---------------------|-------------------|---------------|
| **Canonical run record** (`IAdminRunEnvelope`) | `AdminRuns` Azure Table | None | Table Storage is proven for per-run durable state (provisioning precedent); partition by domain enables domain-scoped queries | SharePoint (too slow for status reads); in-memory (not durable); `ProvisioningStatus` table (provisioning-specific shape) | Phase 3 `InMemoryAdminRunService` (Map-backed) | **Replace** in-memory store with Table Storage-backed `IAdminRunService` writing to `AdminRuns` table |
| **Append-only audit event** (`IAdminAuditRecord`) | `AdminAuditEvents` Azure Table | `ProvisioningAuditLog` SharePoint list (provisioning compatibility sink only) | Table Storage supports high-throughput append; partition by runId groups events for efficient retrieval | SharePoint (fire-and-forget, not reliably queryable); in-memory (not durable) | Phase 3 `StubAdminAuditService` (array-backed) | **Replace** stub with Table Storage-backed `IAdminAuditService` writing to `AdminAuditEvents` table |
| **Checkpoint record** | `AdminAuditEvents` Azure Table (as `CheckpointCreated` / `CheckpointDecided` events) | None | Checkpoints are audit events with specialized payload; storing them in the audit table preserves event ordering and simplifies queries | Separate checkpoint table (unnecessary complexity for Phase 4 volume) | Phase 2 types (`IAdminCheckpoint`, `IAdminCheckpointDecision`); Phase 3 stub handler | **Implement** checkpoint event recording in audit service when checkpoint handlers are called |
| **SignalR event** | None (ephemeral) | None | SignalR is enhancement-only real-time progress; not authoritative (confirmed in provisioning audit report) | Any durable store — SignalR events are transient and best-effort | `signalr-push-service.ts` | **No action** — SignalR remains enhancement-only; status endpoint is authoritative |
| **Compatibility status projection** (`IProvisioningStatus`) | `ProvisioningStatus` Azure Table | None | Provisioning-specific entity shape with 7 fixed steps, step5 deferral, department, entra groups; owned by project-setup host | `AdminRuns` table (different shape and lifecycle); in-memory | `table-storage-service.ts` `upsertProvisioningStatus()` | **Preserve** as-is; provisioning bridge maps to `IAdminRunEnvelope` on read |
| **Compatibility SharePoint audit write** (`IProvisioningAuditRecord`) | `ProvisioningAuditLog` SharePoint list | None | Fire-and-forget audit writes for provisioning started/completed/failed events; existing consumer contract | `AdminAuditEvents` table (different lifecycle and queryability); generalized audit spine (SharePoint is not reliably queryable) | `sharepoint-service.ts` `writeAuditRecord()` | **Preserve** as-is; Phase 4 adds generalized audit spine alongside, does not replace SharePoint writes |
| **Evidence manifest** (set of `IAdminEvidenceReference` for a run) | `AdminEvidence` Azure Table | None | Table Storage enables per-run evidence queries (partition by runId); evidence metadata is small and fits entity limits | Blob Storage (that's for oversized payloads, not metadata); SharePoint | No current implementation | **Implement** evidence metadata table with `IAdminEvidenceReference` entity serialization |
| **Oversized raw evidence** (> 32 KB payloads) | Azure Blob Storage `admin-evidence` container (Phase 6) | None | Table Storage entities have 1 MB limit; large payloads (deployment logs, full drift reports) need blob storage | Table Storage (entity size risk); SharePoint (performance, access control) | No current implementation | **Define** the `storageLocator` reference pattern; **defer** blob storage implementation to Phase 6 |
| **Operator-facing retrieval payload** | Computed from `AdminRuns` + `AdminAuditEvents` + `AdminEvidence` | None | Retrieval payloads are assembled at query time from authoritative stores; not persisted separately | Any single store (retrieval spans run + audit + evidence) | Phase 3 admin API route handlers (stubs) | **Wire** admin API retrieval endpoints to durable stores |
| **Export payload** | Computed on demand from authoritative stores | None | Export payloads are generated at request time; retention class determines what is included | Any persistent store (exports are ephemeral) | No current implementation | **Define** export contract; **defer** full export implementation to Phase 6 |

---

## Key decisions reflected in this matrix

| Decision | Rationale |
|----------|-----------|
| Separate `AdminRuns` table from `ProvisioningStatus` | Different entity shapes, different partition strategies, different lifecycle ownership. Merging would compromise both. |
| Audit events partitioned by `runId` | Most audit queries are "show me events for this run." Partition-scoped queries are the cheapest Table Storage operation. |
| Evidence metadata in Table Storage, not Blob Storage | Evidence metadata (references) is small and queryable; only oversized payloads go to Blob Storage. |
| SharePoint audit writes preserved as compatibility sink | Existing provisioning consumers expect `ProvisioningAuditLog`; removing it would break fire-and-forget audit patterns. |
| No dedicated checkpoint table | Checkpoint events are audit events with specialized payload. A separate table adds complexity without benefit at Phase 4 volume. |
| SignalR remains ephemeral | Confirmed by existing Phase 4 provisioning audit report — SignalR is enhancement-only, not authoritative. |
| Export payloads are computed, not persisted | Persisting exports creates stale data and storage bloat. Compute on demand from authoritative stores. |

---

## Store summary

| Store | Table name | Phase 4 status | Technology |
|-------|-----------|---------------|------------|
| Generalized run store | `AdminRuns` | **New — implement in P4-03** | Azure Table Storage |
| Generalized audit store | `AdminAuditEvents` | **New — implement in P4-03** | Azure Table Storage |
| Evidence metadata store | `AdminEvidence` | **New — implement in P4-06** | Azure Table Storage |
| Oversized evidence store | `admin-evidence` container | **Deferred to Phase 6** | Azure Blob Storage |
| Provisioning run store | `ProvisioningStatus` | **Preserve as-is** | Azure Table Storage |
| Provisioning audit sink | `ProvisioningAuditLog` | **Preserve as-is** | SharePoint list |

---

## Cross-references

- [Phase 4 run/audit/evidence baseline](./admin-spfx-phase-4-run-audit-evidence-baseline.md)
- [Phase 4 repo-truth audit](./admin-spfx-phase-4-repo-truth-audit.md)
- [Phase 4 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md)
- [Phase 2 audit/evidence contracts](../phase-02/admin-control-plane-audit-evidence-and-config-contracts.md)
- [Existing provisioning saga audit](../../../reviews/phase-4-provisioning-status-and-saga-audit.md)
