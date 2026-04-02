# Admin SPFx IT Control Center — Phase 4 Repo-Truth Audit

**Prompt:** P4-01 — Phase 4 Repo-Truth Audit and Preconditions  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Establish exactly what already exists for durable run history, audit spine, and evidence-model work so Phase 4 implementation prompts start from verified repo truth.

---

## 1. Purpose

Phase 4 replaces the Phase 3 in-memory run store and stub audit service with durable persistence, adds generalized retrieval/query APIs, and establishes evidence-capture and retention boundaries. This audit inventories what already exists, classifies each finding, identifies real gaps, and defines the preconditions for implementation prompts P4-02 through P4-08.

---

## 2. Authority set used

| Priority | Source | Role |
|----------|--------|------|
| 1 | Verified live code and configuration | Primary implementation truth |
| 2 | [`current-state-map.md`](../../../blueprint/current-state-map.md) | Canonical present-truth document (updated 2026-04-02 for Phase 3) |
| 3 | [Existing Phase 4 provisioning saga audit](../../../reviews/phase-4-provisioning-status-and-saga-audit.md) | Prior audit evidence for provisioning persistence |
| 4 | Phase 3 admin control-plane artifacts | Immediate backend foundation |
| 5 | [Phase 4 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md) | Phase scope and sequence |
| 6 | [End-state plan](../admin-spfx-it-control-center-end-state-plan.md) | Target product state |
| 7 | [Target architecture](../admin-spfx-target-architecture.md) | Intended architectural shape |

---

## 3. Confirmed existing run-history foundations

### 3.1 Provisioning run persistence (existing and reusable pattern)

**Classification: Existing but provisioning-specific**

Azure Table Storage already persists provisioning runs durably:

| Aspect | Implementation | Location |
|--------|---------------|----------|
| Table | `ProvisioningStatus` | `backend/functions/src/services/table-storage-service.ts` |
| Partition key | `projectId` (groups all runs per project) | Entity serialization in `table-storage-service.ts` |
| Row key | `correlationId` (unique per saga run) | Entity serialization in `table-storage-service.ts` |
| Write mode | Replace (full entity upsert after each step) | `upsertProvisioningStatus()` |
| Entity shape | `IProvisioningStatus` — 7 fixed steps, step5 deferral, department, entra groups | `packages/models/src/provisioning/IProvisioning.ts` |
| Serialization | JSON string fields for arrays/objects, empty-string-to-undefined for optionals | Private `deserialize()` in `table-storage-service.ts` |

**Key read methods:**
- `getProvisioningStatus(projectId)` — latest run by `startedAt` descending
- `getLatestRun(projectId)` — alias/variant for partition scan
- `listAllRuns(status?)` — optional status filter for admin visibility
- `listFailedRuns()` — `overallStatus=Failed` filter
- `listPendingStep5Jobs()` — `step5DeferredToTimer=true AND overallStatus=WebPartsPending`

**Retry chain:** New run gets new `correlationId`; `parentCorrelationId` preserves linkage. `retryCount` accumulates across all runs for a project.

### 3.2 Phase 3 in-memory admin run service (existing — must be replaced)

**Classification: Existing but must be replaced in Phase 4**

| Aspect | Implementation | Location |
|--------|---------------|----------|
| Storage | `Map<string, IAdminRunEnvelope>` (in-memory) | `backend/functions/src/services/admin-control-plane/in-memory-run-service.ts` |
| Entity shape | `IAdminRunEnvelope` (Phase 2 contract) | `packages/models/src/admin-control-plane/IAdminRun.ts` |
| Capabilities | launch, getRun, listRuns (filter + paginate), cancelRun, retryRun | `IAdminRunService` interface in `types.ts` |
| Limitation | State lost on process restart | By design — Phase 3 foundation only (P3-D01) |

### 3.3 Provisioning-to-admin mapping (existing and reusable)

**Classification: Existing and reusable**

| Aspect | Implementation | Location |
|--------|---------------|----------|
| Status mapping | `mapProvisioningStatus()` — provisioning status → `AdminRunStatus` | `orchestration-bridge.ts` |
| Step mapping | `mapProvisioningStepStatus()` — step status → `AdminStepStatus` | `orchestration-bridge.ts` |
| Envelope mapping | `mapProvisioningToRunEnvelope()` — `IProvisioningStatusSnapshot` → `IAdminRunEnvelope` | `orchestration-bridge.ts` |

---

## 4. Confirmed existing audit-history foundations

### 4.1 SharePoint provisioning audit log (existing but provisioning-specific)

**Classification: Existing but provisioning-specific**

| Aspect | Implementation | Location |
|--------|---------------|----------|
| Target | SharePoint list `ProvisioningAuditLog` | `backend/functions/src/services/sharepoint-service.ts` |
| Write method | `writeAuditRecord(record: IProvisioningAuditRecord)` | `sharepoint-service.ts:334` |
| Write pattern | Fire-and-forget with `.catch()` — intentionally non-blocking (D-PH6-06) | `saga-orchestrator.ts:119` and `timerFullSpec/handler.ts:270` |
| Events written | `Started`, `Completed`, `Failed` (at saga terminal states) | Saga orchestrator and timer handler |
| Not written | Step progress, admin mutations (escalate, archive, force-state) | By design — not the full audit spine |

### 4.2 Phase 3 stub admin audit service (existing — must be replaced)

**Classification: Existing but must be replaced in Phase 4**

| Aspect | Implementation | Location |
|--------|---------------|----------|
| Storage | In-memory `IAdminAuditRecord[]` array | `backend/functions/src/services/admin-control-plane/stubs.ts` |
| Interface | `IAdminAuditService` — `recordEvent()`, `listByRunId()`, `listByEventType()` | `types.ts` |
| Contract | `IAdminAuditRecord` with 12 event types (Phase 2) | `packages/models/src/admin-control-plane/IAdminAudit.ts` |

### 4.3 Phase 2 audit contract types (existing and reusable)

**Classification: Existing and reusable**

| Type | Purpose | Location |
|------|---------|----------|
| `IAdminAuditRecord` | Generalized audit event record | `IAdminAudit.ts` |
| `AdminAuditEventType` | 12 audit event categories | `IAdminAudit.ts` |
| `IAdminEvidenceReference` | Evidence artifact linkage | `IAdminAudit.ts` |
| `AdminEvidenceType` | 8 evidence type categories | `IAdminAudit.ts` |
| `IAdminConfigSnapshotReference` | Config version linkage | `IAdminAudit.ts` |
| `IAdminStandardsReference` | Standards version linkage | `IAdminAudit.ts` |
| `IAdminRationale` | Operator-provided reason capture | `IAdminAudit.ts` |
| `IAdminPostRunValidationSummary` | Post-run validation results | `IAdminAudit.ts` |
| `IAdminRunConfigTrace` | Run-to-config traceability | `IAdminAudit.ts` |

---

## 5. Confirmed existing evidence-related data already captured

**Classification: Existing but limited**

| Evidence type | What exists | Where | Limitation |
|--------------|-------------|-------|-----------|
| Run status per step | `ISagaStepResult[]` with status, timestamps, error messages | `IProvisioningStatus.steps` in Table Storage | Provisioning-specific; 7 fixed steps |
| Terminal state records | `overallStatus`, `completedAt`, `failedAt` timestamps | Table Storage `ProvisioningStatus` entity | Provisioning-specific |
| Failure classification | `failureClass` enum (transient/structural/permissions/repeated/admin-class) | Table Storage entity | Provisioning-specific; useful pattern to generalize |
| Retry lineage | `parentCorrelationId`, `retryCount`, `lastRetryAt` | Table Storage entity | Provisioning-specific; maps to `IAdminRunEnvelope.parentRunId` |
| Admin escalation | `escalatedBy`, `escalatedAt` | Table Storage entity | Provisioning-specific; no generalized equivalent |
| SharePoint audit records | `Started`, `Completed`, `Failed` events | SharePoint `ProvisioningAuditLog` list | Fire-and-forget; not queryable as durable audit spine |
| SignalR progress events | Real-time step progress pushed to clients | `signalr-push-service.ts` | Enhancement-only; not persisted; not authoritative (P4-03 in existing audit) |

---

## 6. Provisioning-specific seams that must be generalized

| Seam | Current state | What Phase 4 must do |
|------|--------------|---------------------|
| `ProvisioningStatus` table name | Hardcoded in `table-storage-service.ts` | Add generalized `AdminRuns` and `AdminAuditEvents` tables (or configurable table names) |
| `IProvisioningStatus` entity shape | 7 fixed steps, step5 deferral, entra groups, department | Implement `IAdminRunEnvelope` as the generalized durable entity |
| Entity serialization | JSON string fields, empty-string-to-undefined deserialization | Create generalized serialization for `IAdminRunEnvelope` and `IAdminAuditRecord` |
| Status enum values | `NotStarted`, `InProgress`, `BaseComplete`, `WebPartsPending` | Map to `AdminRunStatus` enum (already done in orchestration bridge) |
| `getLatestRun()` partition scan | Scans all rows in partition, sorts by `startedAt` | Generalize for multi-domain run queries, not just project-scoped |
| Admin mutations (escalate, archive, force-state) | Provisioning-specific; don't reconcile request state | Generalize as admin run state transitions with audit event recording |

---

## 7. Current compatibility surfaces that must be preserved

| Surface | Consumer | Contract | Preservation requirement |
|---------|----------|----------|------------------------|
| `GET /api/provision-project-site/status?projectId=` | `ProvisioningOversightPage` via `createProvisioningApiClient` | Returns `IProvisioningStatus` | Must continue working unchanged |
| `POST /api/provision-project-site/retry` | Admin retry action | Accepts `projectId`, creates new saga run | Must continue working unchanged |
| `POST /api/provision-project-site/escalate` | Admin escalation action | Sets `escalatedBy/At` | Must continue working unchanged |
| `POST /api/provision-project-site/archive` | Admin archive action | Archives failed run | Must continue working unchanged |
| `POST /api/project-setup-requests/{id}/state` | Controller state advancement | Triggers saga on `ReadyToProvision` | Must continue working unchanged |
| `ProvisioningStatus` Table Storage entity | All provisioning reads/writes | `IProvisioningStatus` shape | Must not be modified destructively |
| `ProvisioningAuditLog` SharePoint list | Fire-and-forget audit writes | `IProvisioningAuditRecord` | Optional to preserve; may be superseded by generalized audit spine |

---

## 8. Stale or conflicting documentation

| Document | Issue | Action needed |
|----------|-------|--------------|
| None identified | Phase 3 P3-09 reconciled all touched docs with `current-state-map.md` | No immediate action |
| `backend/functions/README.md` Phase 3 summary | Says "in-memory run service (Phase 4 → Table Storage)" | Accurate — this is the planned replacement, not a conflict |
| Phase 3 `RELEASE-SCOPE.md` | Lists `StubAdminAuditService` and `StubAdminConfigService` | Accurate for current state; Phase 4 will update when replacing stubs |
| Existing Phase 4 review reports (6 files under `docs/architecture/reviews/`) | Pre-date Phase 3 foundation; reference provisioning-only patterns | Still valid as provisioning audit evidence; Phase 4 implementation should reference them but not treat them as governing docs |

---

## 9. Phase 4 real gaps

### Gap 1 — No generalized durable run store

**Classification: Missing**

The `InMemoryAdminRunService` (Phase 3) stores `IAdminRunEnvelope` in a `Map`. State is lost on restart. Phase 4 must implement Table Storage-backed persistence for `IAdminRunEnvelope` using a generalized table (not `ProvisioningStatus`).

### Gap 2 — No generalized audit event persistence

**Classification: Missing**

The `StubAdminAuditService` stores `IAdminAuditRecord` in an in-memory array. Phase 4 must implement durable audit event persistence (Table Storage or equivalent) with the 12 `AdminAuditEventType` categories.

### Gap 3 — No evidence metadata capture

**Classification: Missing**

`IAdminEvidenceReference` and `AdminEvidenceType` are defined as pure types (Phase 2) but no evidence capture, storage, or linkage logic exists. Phase 4 must implement evidence metadata recording linked to runs and audit events.

### Gap 4 — No generalized retrieval APIs

**Classification: Missing**

The Phase 3 admin API stubs return in-memory data. Phase 4 must wire retrieval endpoints to durable stores for: run history queries, run detail, audit event history, evidence manifest retrieval.

### Gap 5 — No retention or redaction boundaries

**Classification: Missing**

No retention policy, TTL, or redaction logic exists for admin runs or audit events. Phase 4 must establish boundaries even if full implementation is deferred.

### Gap 6 — No provisioning bridge to durable admin spine

**Classification: Missing**

The orchestration bridge (Phase 3) maps provisioning status to `IAdminRunEnvelope` in memory. Phase 4 must decide whether provisioning runs are **projected** into the admin run store on read or **written** to both stores on mutation.

---

## 10. Explicit non-gaps

These items already exist and do NOT need to be built in Phase 4:

| Item | Why it's not a gap |
|------|-------------------|
| Admin API route handlers | 10 endpoints exist (Phase 3 P3-04); Phase 4 wires them to durable stores |
| `IAdminRunEnvelope` type definition | Defined in Phase 2 `@hbc/models/admin-control-plane` |
| `IAdminAuditRecord` type definition | Defined in Phase 2 with 12 event types |
| `IAdminEvidenceReference` type definition | Defined in Phase 2 with 8 evidence types |
| `IAdminRunService` interface | Defined in Phase 3 `types.ts` |
| `IAdminAuditService` interface | Defined in Phase 3 `types.ts` |
| Adapter registry | `AdminAdapterRegistry` with 10 descriptors (Phase 3 P3-06) |
| Orchestration bridge mapping | `mapProvisioningToRunEnvelope()` (Phase 3 P3-07) |
| Authorization wiring | `requireAdmin` + `requireDelegatedScope` on all admin routes (Phase 3 P3-08) |
| Actor context resolver | `AdminActorContextResolver` (Phase 3 P3-08) |
| Host/composition-root structure | `src/hosts/admin-control-plane/` with scoped factory (Phase 3 P3-02) |
| Table Storage service infrastructure | `ITableStorageService` already in admin container (Phase 3) |

---

## 11. Preconditions for implementation prompts

### For P4-02 (Canonical run/audit/evidence baseline)

- Phase 2 types are stable and exported from `@hbc/models/admin-control-plane`
- `IAdminRunService` and `IAdminAuditService` interfaces are defined
- Entity serialization patterns are documented (provisioning precedent in `table-storage-service.ts`)

### For P4-03 (Durable run store and audit spine)

- `ITableStorageService` is available in `IAdminControlPlaneServiceContainer`
- Table Storage entity patterns (partition/row key, JSON serialization, deserialization) are proven
- `InMemoryAdminRunService` provides the reference implementation for all `IAdminRunService` methods
- `StubAdminAuditService` provides the reference for `IAdminAuditService` methods

### For P4-04 (Provisioning bridge and backward compatibility)

- `mapProvisioningToRunEnvelope()` already translates provisioning status to admin run envelopes
- Existing provisioning endpoints must remain unchanged (compatibility surfaces in Section 7)
- Bridge decision (project vs write-through) is the key architectural choice

### For P4-05 (Audit retrieval APIs)

- Admin API routes exist as handler skeletons (Phase 3 P3-04)
- Authorization wiring is in place
- Retrieval APIs need durable stores from P4-03 before they can return real data

### For P4-06 (Evidence storage and retention)

- Phase 2 `IAdminEvidenceReference` and `AdminEvidenceType` types are stable
- Evidence is produced by adapter invocations (`IAdminAdapterResult.evidenceRefs`)
- No evidence storage exists yet — this is the primary P4-06 deliverable

---

## 12. Forward-looking cautions

| Caution | Why it matters |
|---------|---------------|
| Do not modify `ProvisioningStatus` table schema | Existing provisioning reads/writes depend on the current entity shape; changes would break the project-setup host |
| Do not merge admin and provisioning tables | Different entity shapes, different partition strategies, different lifecycle ownership |
| Do not assume SharePoint audit log is the admin audit spine | SharePoint writes are fire-and-forget and not reliably queryable; the generalized audit spine needs Table Storage or equivalent |
| Do not add provisioning-specific fields to `IAdminRunEnvelope` | The run model is domain-agnostic by design (Phase 2 P2-D06); provisioning-specific data belongs in the provisioning bridge mapping |
| Do not claim full evidence maturity in Phase 4 | Phase 4 establishes evidence metadata and boundaries; full evidence lifecycle (export, redaction, retention enforcement) spans Phases 10–13 |
| Do not break `ProvisioningOversightPage` | This consumer uses provisioning-specific endpoints and types; migration to generalized admin API is Phase 5 |
| SignalR is enhancement-only, not authoritative | Status endpoint is the source of truth; SignalR events are best-effort progress updates (confirmed in existing audit report) |

---

## Cross-references

### Governing docs
- [End-state plan](../admin-spfx-it-control-center-end-state-plan.md)
- [Target architecture](../admin-spfx-target-architecture.md)
- [Current-state map](../../../blueprint/current-state-map.md)
- [Phase 4 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md)

### Existing Phase 4 evidence
- [Provisioning status and saga audit](../../../reviews/phase-4-provisioning-status-and-saga-audit.md)
- [Durable status contract and run correlation report](../../../reviews/phase-4-durable-status-contract-and-run-correlation-report.md)
- [SignalR polling and client status hardening report](../../../reviews/phase-4-signalr-polling-and-client-status-hardening-report.md)
- [Failure terminal and retry interaction report](../../../reviews/phase-4-failure-terminal-and-retry-interaction-report.md)
- [Accounting admin status compatibility report](../../../reviews/phase-4-accounting-admin-status-compatibility-report.md)
- [Provisioning status and saga readiness report](../../../reviews/phase-4-provisioning-status-and-saga-readiness-report.md)

### Phase 3 foundation
- [Phase 3 validation report](../phase-03/admin-control-plane-phase-3-validation-report.md)
- [Phase 3 decision register](../phase-03/admin-control-plane-phase-3-decision-register.md)
- [Orchestration bridge plan](../phase-03/admin-control-plane-orchestration-bridge-plan.md)
- [Service factory and container plan](../phase-03/admin-control-plane-service-factory-and-container-plan.md)

### Key implementation files
- [`table-storage-service.ts`](../../../../../backend/functions/src/services/table-storage-service.ts)
- [`IProvisioning.ts`](../../../../../packages/models/src/provisioning/IProvisioning.ts)
- [`saga-orchestrator.ts`](../../../../../backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts)
- [`in-memory-run-service.ts`](../../../../../backend/functions/src/services/admin-control-plane/in-memory-run-service.ts)
- [`stubs.ts` (audit service)](../../../../../backend/functions/src/services/admin-control-plane/stubs.ts)
- [`IAdminAudit.ts`](../../../../../packages/models/src/admin-control-plane/IAdminAudit.ts)
- [`IAdminRun.ts`](../../../../../packages/models/src/admin-control-plane/IAdminRun.ts)
