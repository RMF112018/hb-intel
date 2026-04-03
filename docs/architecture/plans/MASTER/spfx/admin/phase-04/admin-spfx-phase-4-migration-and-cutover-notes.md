# Admin SPFx IT Control Center — Phase 4 Migration and Cutover Notes

**Prompt:** P4-08 — Validation, Migration Rails, and Exit Reconciliation
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document data migration posture, transition behavior, and deployment considerations for Phase 4 durable stores.

---

## 1. Migration posture: forward-only

Phase 4 introduces three new Azure Table Storage tables as the generalized admin run/audit/evidence spine. These tables are **new** and operate on a **forward-only** basis:

| Table | Service | Purpose |
|-------|---------|---------|
| `AdminRuns` | `DurableAdminRunStore` | Generalized admin run lifecycle and history |
| `AdminAuditEvents` | `DurableAdminAuditStore` | Append-only audit event log |
| `AdminEvidence` | `DurableAdminEvidenceStore` | Evidence metadata with inline/offload boundary |

No data migration from existing stores to new stores is needed or planned. The existing provisioning-specific persistence path remains intact and authoritative for provisioning-domain consumers.

## 2. Data duplication during transition

During the transition period, provisioning events appear in both old and new stores. This is by design.

| Existing store | New store | Overlap | Authority resolution |
|----------------|-----------|---------|---------------------|
| `ProvisioningStatus` (Azure Table) | `AdminRuns` | Provisioning runs appear in both | `ProvisioningStatus` remains authoritative for provisioning-specific consumers; `AdminRuns` is authoritative for generalized admin queries |
| `ProvisioningAuditLog` (SharePoint list) | `AdminAuditEvents` | Provisioning lifecycle events appear in both | SharePoint list is fire-and-forget compatibility write; `AdminAuditEvents` is authoritative audit spine |
| _(none)_ | `AdminEvidence` | No overlap | New capability — no existing equivalent |

The `ProvisioningAuditBridge` maps provisioning saga lifecycle events into the generalized spine without modifying existing provisioning writes. Bridge writes are fire-and-forget — failures are logged but never propagate to the saga.

## 3. Compatibility with current consumers

All existing provisioning and admin endpoints remain unchanged:

- **Provisioning saga endpoints** (`/api/provisioningSaga/*`) — unchanged, continue writing to `ProvisioningStatus` table
- **Project request endpoints** (`/api/projectRequests/*`) — unchanged
- **Admin oversight pages** (`apps/admin`) — continue reading from `ProvisioningStatus` table via existing data providers
- **SignalR progress push** — unchanged

Phase 4 adds three **new** admin API endpoints that are purely additive:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/runs/{runId}/audit` | List audit events for a run |
| GET | `/api/admin/audit` | List audit events by type |
| GET | `/api/admin/runs/{runId}/evidence` | Get evidence manifest for a run |

No existing endpoint signatures, response shapes, or behavioral contracts were modified.

## 4. Deployment considerations

### New infrastructure requirements

- **Three Azure Table Storage tables** (`AdminRuns`, `AdminAuditEvents`, `AdminEvidence`) must be accessible from the Azure Functions host
- Tables are **auto-created** by the Azure Table Storage client on first write — no manual table provisioning is required
- The storage account is already configured via the existing `AZURE_TABLE_ENDPOINT` environment variable (required since Phase 3)

### No new environment variables

Phase 4 does not introduce any new environment variables beyond those already required by Phase 3 (see `RELEASE-SCOPE.md` Startup Config Requirements).

### Rollback

If Phase 4 changes need to be reverted:
- New tables (`AdminRuns`, `AdminAuditEvents`, `AdminEvidence`) can be dropped without affecting provisioning-specific stores
- New API endpoints can be removed without affecting existing provisioning or admin endpoints
- The `ProvisioningAuditBridge` can be disabled without affecting saga execution (bridge writes are fire-and-forget)
- Existing provisioning flows are fully independent of the new spine

## 5. What is intentionally not backfilled

| Data | Reason for omission |
|------|-------------------|
| Historical provisioning runs | Forward-only avoids data transformation risk; historical data remains queryable through existing provisioning-specific endpoints |
| Historical provisioning audit events | Existing `ProvisioningAuditLog` SharePoint list and `ProvisioningStatus` table entries remain in place and queryable |
| Historical evidence artifacts | No prior generalized evidence model existed; nothing to migrate |

### Rationale

Backfill would require:
- Mapping heterogeneous historical provisioning status records to the new `IAdminRunEnvelope` shape
- Resolving actor context from historical records that may not have captured full actor metadata
- Risk of data transformation errors in production storage

The cost-benefit analysis strongly favors forward-only: new runs benefit from the generalized spine immediately, and historical data remains accessible through its original query paths.

---

## Cross-references

- [Persistence Boundary Matrix](admin-spfx-phase-4-persistence-boundary-matrix.md) — 10-row store ownership and boundary rules
- [Store Implementation Notes](admin-spfx-phase-4-store-implementation-notes.md) — Table keying, serialization, service factory wiring
- [Provisioning Bridge](admin-spfx-phase-4-provisioning-bridge.md) — Saga-to-spine event mapping and compatibility surfaces
- [Evidence & Retention Boundaries](admin-spfx-phase-4-evidence-and-retention-boundaries.md) — Inline/offload thresholds, retention classes
