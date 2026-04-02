# Admin SPFx IT Control Center — Phase 4 Provisioning Bridge

**Prompt:** P4-04 — Provisioning Bridge and Backward Compatibility  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Bridge provisioning saga lifecycle events into the generalized admin run/audit spine while preserving existing behavior.

---

## 1. What provisioning now writes to the generalized spine

The `ProvisioningAuditBridge` writes the following events to the generalized audit store (`AdminAuditEvents`):

| Provisioning event | Admin audit event type | Trigger |
|--------------------|----------------------|---------|
| Saga started | `RunStarted` | Saga `execute()` begins |
| Step completed | `RunStarted` (annotation) | Each step completes successfully |
| Step failed | `RunFailed` | A step fails after retries |
| Step 5 deferred | `RunStarted` (annotation) | Web parts deferred to timer |
| Saga completed | `RunCompleted` | All 7 steps pass |
| Saga failed | `RunFailed` | Compensation completes after step failure |
| Admin retry | `RunRetried` | Admin initiates retry from ProvisioningOversightPage |
| Admin escalate | `CheckpointEscalated` | Admin escalates a failed run |
| Admin archive | `RunCancelled` | Admin archives a failed run |
| Admin ack escalation | `CheckpointDecided` | Admin acknowledges an escalation |
| Admin force-state | `ConfigModified` | Admin forces a state transition |

All bridge writes are **fire-and-forget** — they log warnings on failure but never propagate errors to the saga or provisioning endpoints.

---

## 2. What remains provisioning-specific

| Component | Owner | Status |
|-----------|-------|--------|
| `ProvisioningStatus` Table Storage entity | `table-storage-service.ts` (project-setup host) | **Unchanged** — continues as authoritative provisioning status |
| `IProvisioningStatus` interface | `@hbc/models` | **Unchanged** — 7 fixed steps, step5 deferral, department, entra groups |
| `SagaOrchestrator.execute()` | `saga-orchestrator.ts` | **Unchanged** — still writes to `ProvisioningStatus` table |
| `ProvisioningAuditLog` SharePoint list | `sharepoint-service.ts` | **Unchanged** — fire-and-forget compatibility sink |
| Provisioning API endpoints | `functions/provisioningSaga/index.ts` | **Unchanged** — same routes, same contracts |
| `IProvisioningApiClient` | `@hbc/provisioning` | **Unchanged** — same client interface |

---

## 3. Compatibility surfaces preserved

| Surface | Consumer | Verification |
|---------|----------|-------------|
| `GET /api/provision-project-site/status?projectId=` | `ProvisioningOversightPage` | Unchanged endpoint and response shape |
| `POST /api/provision-project-site/retry` | Admin retry action | Unchanged endpoint |
| `POST /api/provision-project-site/escalate` | Admin escalation action | Unchanged endpoint |
| `POST /api/provision-project-site/archive` | Admin archive action | Unchanged endpoint |
| `POST /api/project-setup-requests/{id}/state` | Controller state advancement | Unchanged endpoint |
| `ProvisioningStatus` table entities | All provisioning reads/writes | Unchanged entity shape |
| `ProvisioningAuditLog` SharePoint list | Fire-and-forget audit writes | Unchanged write pattern |

---

## 4. Intentional transitional duplication

| Data | Provisioning store | Generalized store | Why both |
|------|-------------------|-------------------|----------|
| Run status | `ProvisioningStatus` table (authoritative for provisioning) | `AdminAuditEvents` table (audit events recording lifecycle) | Provisioning status is the operational source of truth; audit events provide generalized history |
| Audit records | `ProvisioningAuditLog` SharePoint list (fire-and-forget) | `AdminAuditEvents` table (durable, queryable) | SharePoint writes preserved for compatibility; Table Storage is the authoritative audit spine |

This duplication is temporary. Phase 5 migrates the operator console to the generalized admin API, at which point provisioning status can be read through the orchestration bridge mapping instead of directly.

---

## 5. Bridge architecture

```
Provisioning saga orchestrator
  ├── writes to ProvisioningStatus table (unchanged)
  ├── writes to ProvisioningAuditLog SharePoint list (unchanged)
  └── [P4-04] ProvisioningAuditBridge.recordEvent() → AdminAuditEvents table (new)

Provisioning admin mutation handlers
  ├── modify ProvisioningStatus table (unchanged)
  └── [P4-04] ProvisioningAuditBridge.recordEvent() → AdminAuditEvents table (new)
```

The bridge is available as `createProvisioningAuditBridge(runService, auditService)` and can be called from any provisioning handler that has access to the admin service container.

---

## Cross-references

- [Phase 4 store implementation notes](./admin-spfx-phase-4-store-implementation-notes.md)
- [Phase 4 baseline](./admin-spfx-phase-4-run-audit-evidence-baseline.md)
- [Persistence boundary matrix](./admin-spfx-phase-4-persistence-boundary-matrix.md)
- [Orchestration bridge plan (Phase 3)](../phase-03/admin-control-plane-orchestration-bridge-plan.md)
- [Provisioning saga audit](../../../reviews/phase-4-provisioning-status-and-saga-audit.md)
- [`provisioning-audit-bridge.ts`](../../../../../backend/functions/src/services/admin-control-plane/provisioning-audit-bridge.ts)
