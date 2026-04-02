# Admin SPFx IT Control Center — Phase 4 Run, Audit, and Evidence Baseline

**Prompt:** P4-02 — Canonical Run, Audit, and Evidence Baseline  
**Status:** Complete  
**Date:** 2026-04-02  
**Purpose:** Define the canonical model and doctrine for generalized admin run history, audit events, evidence metadata, and evidence-handling boundaries.

---

## A. Canonical concepts

### Admin run

A single execution of a generalized admin action. Represented by `IAdminRunEnvelope` (Phase 2). Each run has a unique `runId`, belongs to an `AdminDomain`, carries an `AdminActionKey`, and progresses through `AdminRunStatus` states. Runs are the primary unit of durable history.

**Identity pattern:** `runId` (UUID v4) — globally unique. Retry chains use `parentRunId` to link new runs to failed predecessors. This mirrors the provisioning pattern where `correlationId` is per-run and `parentCorrelationId` chains retries.

### Admin run status / lifecycle

Defined by `AdminRunStatus` (Phase 2): `Pending` → `Validating` → `Running` → `Completed` | `Failed` | `Cancelled` | `PartiallyDeferred`. Checkpoint-capable runs may enter `AwaitingApproval`. Transition rules vary by `AdminExecutionMode` (Seamless, Checkpointed, Destructive, Advisory).

### Audit event

An append-only record of something that happened within or to a run. Represented by `IAdminAuditRecord` (Phase 2). Audit events are immutable after creation. They reference runs, checkpoints, actors, evidence, and config snapshots by ID — they do not embed large payloads.

### Checkpoint event

A specialized audit event recording that a run paused at a defined checkpoint and an operator made an approve/reject decision. Checkpoint events carry `IAdminCheckpointDecision` (Phase 2) and record the actor, rationale, and timestamp of the decision.

### Operator action attribution

Every state-changing admin operation captures `IAdminActorContext` (Phase 2): `upn`, `objectId`, `displayName`, `capturedAt`. This enables "who did what, when" queries. The `AdminActorContextResolver` (Phase 3) extracts this from JWT claims at request time.

### Config / standards version attribution

When a run is created, the system captures which config/standards version was active via `IAdminConfigSnapshotReference` (Phase 2): `scope`, `version`, `capturedAt`, `storageLocator`. This enables "what standard governed this run" queries. Full config versioning is a Phase 10 deliverable; Phase 4 establishes the reference pattern.

### Evidence item

A discrete artifact produced by or associated with a run. Evidence items are referenced by `IAdminEvidenceReference` (Phase 2): `evidenceId`, `evidenceType`, `label`, `runId`, `stepNumber`, `capturedAt`, `storageLocator`. Evidence payloads are stored separately from audit records.

### Evidence manifest

A collection of evidence references associated with a run. The manifest is the set of all `IAdminEvidenceReference` records linked to a given `runId`. It enables "show me everything produced by this run" queries.

### Evidence retention class

A classification determining how long evidence must be retained and when it may be purged. Phase 4 defines three classes:

| Class | Retention | Examples |
|-------|-----------|---------|
| `operational` | 90 days | Step progress details, preview results, diagnostic data |
| `compliance` | 1 year | Run input/output snapshots, operator decisions, config traces |
| `permanent` | Indefinite | Destructive-action evidence, post-run validation records |

Phase 4 establishes the classification; enforcement is deferred to Phase 13.

### Inline evidence vs offloaded evidence

- **Inline evidence:** Small payloads (< 32 KB) stored directly in the audit event or evidence record as `adapterSpecificData` or summary fields. Suitable for step results, error messages, decision rationale.
- **Offloaded evidence:** Large payloads (> 32 KB) stored in a separate evidence store (Azure Blob or equivalent) and referenced by `storageLocator`. Suitable for full input snapshots, drift reports, deployment logs.

Phase 4 defines the boundary; offloaded storage implementation is deferred to Phase 6 (install/bootstrap evidence).

---

## B. Required durable capture dimensions

Every generalized admin run should durably capture:

| Dimension | Source field | Store |
|-----------|------------|-------|
| Run identity | `runId` (UUID v4) | Run store (partition key or row key) |
| Correlation / parent correlation | `parentRunId` | Run store |
| Run type / action type | `actionKey` (domain:family:verb) | Run store |
| Domain | `domain` (AdminDomain enum) | Run store |
| Risk level | `riskLevel` (AdminRiskLevel enum) | Run store |
| Execution mode | `executionMode` (AdminExecutionMode enum) | Run store |
| Operator identity | `initiatedBy` (IAdminActorContext) | Run store |
| Initiation source | Implicit from host (admin-control-plane) | Run store (host metadata) |
| Timestamps | `createdAt`, `startedAt`, `completedAt` | Run store |
| Step results | `steps[]` (IAdminStepResult[]) | Run store (JSON serialized) |
| Checkpoint history | Via audit events (CheckpointCreated, CheckpointDecided) | Audit store |
| Config / standards snapshot | `configSnapshotRef` (IAdminConfigSnapshotReference) | Run store (reference only) |
| Output summary | Terminal status + step results | Run store |
| Failure summary | `failure` (IAdminFailureSummary) | Run store |
| Linked evidence references | `evidenceRefs[]` on audit events and adapter results | Evidence metadata store |
| Target entity | `targetEntityId`, `targetEntityLabel` | Run store |

---

## C. Required audit-event classes

The Phase 2 `AdminAuditEventType` enum defines 12 event types. Phase 4 maps them to durable capture requirements:

| Event class | `AdminAuditEventType` | Trigger | Required capture |
|-------------|----------------------|---------|-----------------|
| Run launched | `RunStarted` | `launchRun()` | Actor, actionKey, commandInputRef, configSnapshotRef |
| Run completed | `RunCompleted` | Terminal success status | Actor, run duration, output summary |
| Run failed | `RunFailed` | Terminal failure status | Actor, failure summary, step where failure occurred |
| Run cancelled | `RunCancelled` | `cancelRun()` | Actor, cancellation reason |
| Run retried | `RunRetried` | `retryRun()` | Actor, parentRunId, new runId |
| Checkpoint created | `CheckpointCreated` | Run enters AwaitingApproval | Step number, checkpoint definition |
| Checkpoint approved | `CheckpointDecided` (approve) | Operator approves continuation | Actor, decision, comment, timestamp |
| Checkpoint rejected | `CheckpointDecided` (reject) | Operator rejects continuation | Actor, decision, comment, reason |
| Checkpoint timed out | `CheckpointTimedOut` | Checkpoint exceeds timeout | Timeout duration, escalation action |
| Checkpoint escalated | `CheckpointEscalated` | Checkpoint escalated to higher authority | Original actor, escalation target |
| Config modified | `ConfigModified` | Admin modifies live config | Actor, scope, old/new version |
| Standards applied | `StandardsApplied` | Standards applied to environment | Actor, standards domain, target |
| External event received | `ExternalEventReceived` | External system callback | Source, correlation, payload ref |
| Administrative override | Mapped to `RunRetried` or domain-specific | Force-state, escalation, archive | Actor, override type, reason, target |

---

## D. Storage doctrine

### Generalized run store

**Purpose:** Durable persistence of `IAdminRunEnvelope` records.

| Aspect | Decision |
|--------|----------|
| Technology | Azure Table Storage (proven by provisioning precedent) |
| Table name | `AdminRuns` (separate from `ProvisioningStatus`) |
| Partition key | `domain` (enables domain-scoped queries) |
| Row key | `runId` (globally unique, enables direct lookup) |
| Entity shape | Serialized `IAdminRunEnvelope` with JSON string fields for arrays/objects |
| Write mode | Replace (full entity upsert — matches provisioning pattern) |
| Must own | All generalized admin run state and lifecycle |
| Must NOT own | Provisioning-specific status (stays in `ProvisioningStatus` table) |

### Generalized audit store

**Purpose:** Append-only persistence of `IAdminAuditRecord` records.

| Aspect | Decision |
|--------|----------|
| Technology | Azure Table Storage |
| Table name | `AdminAuditEvents` |
| Partition key | `runId` (groups all events for one run) |
| Row key | `auditId` (unique per event, enables direct lookup) |
| Entity shape | Serialized `IAdminAuditRecord` with JSON string fields for nested objects |
| Write mode | Insert (append-only — audit events are immutable) |
| Must own | All generalized admin audit events |
| Must NOT own | Provisioning-specific SharePoint audit writes (compatibility sink) |

### Evidence metadata store

**Purpose:** Track evidence references and their storage locations.

| Aspect | Decision |
|--------|----------|
| Technology | Azure Table Storage (Phase 4); Blob metadata index (Phase 6+ for large evidence) |
| Table name | `AdminEvidence` |
| Partition key | `runId` (groups evidence by run) |
| Row key | `evidenceId` (unique per evidence item) |
| Entity shape | Serialized `IAdminEvidenceReference` |
| Write mode | Insert (evidence records are immutable) |
| Must own | Evidence metadata and inline evidence payloads (< 32 KB) |
| Must NOT own | Oversized evidence blobs (Phase 6+) |

### Oversized evidence storage target

**Purpose:** Store large evidence payloads that exceed Table Storage entity size limits.

| Aspect | Decision |
|--------|----------|
| Technology | Azure Blob Storage (deferred to Phase 6) |
| Container | `admin-evidence` |
| Blob naming | `{runId}/{evidenceId}.json` |
| Phase 4 action | Define the reference pattern (`storageLocator`); do not implement blob storage |

### Compatibility sinks

| Sink | Purpose | Phase 4 action |
|------|---------|---------------|
| `ProvisioningStatus` Table Storage | Existing provisioning run persistence | Preserve as-is; do not merge with `AdminRuns` |
| `ProvisioningAuditLog` SharePoint list | Existing provisioning audit writes | Preserve as-is; not authoritative for generalized audit |

---

## E. Retention and redaction doctrine

### Retention classes

| Class | Default TTL | Applies to | Enforcement |
|-------|-------------|-----------|-------------|
| `operational` | 90 days | Step progress details, preview results, probe snapshots | Deferred to Phase 13 |
| `compliance` | 365 days | Run envelopes, audit events, operator decisions, config traces | Deferred to Phase 13 |
| `permanent` | Indefinite | Destructive-action evidence, post-run validation records | Deferred to Phase 13 |

### Retention representation in Phase 4

Each evidence record should carry a `retentionClass` field (string: `operational` | `compliance` | `permanent`). Phase 4 stores the classification; Phase 13 enforces TTL-based cleanup.

### Redaction boundaries

| Boundary | Rule |
|----------|------|
| Operator UPN in audit records | Not redacted (required for accountability) |
| Command input payloads | May contain sensitive data; oversized payloads stored in evidence store with access control |
| Adapter-specific output data | May contain tenant secrets; inline only if < 32 KB and non-sensitive |
| Config/standards values | Snapshots by reference; actual values in config store with separate access control |

Phase 4 establishes the boundary definitions. Redaction enforcement (right-to-forget, data subject access) is deferred to Phase 13.

---

## Design constraints (explicit)

1. **Do not break existing provisioning status reads** — `ProvisioningStatus` table and its consumers remain unchanged.
2. **Do not make SharePoint the authoritative audit backbone** — SharePoint audit writes are fire-and-forget compatibility sinks, not the generalized audit spine.
3. **Do not assume all evidence fits in Table Storage entities** — Azure Table entities have a 1 MB limit; evidence payloads over 32 KB should use offloaded storage references.
4. **Do not force a full orchestration rewrite** — Phase 4 adds durable persistence alongside Phase 3 in-memory services; it does not rewrite the adapter/orchestration layer.
5. **Preserve attribution for single-admin high-risk actions** — `IAdminActorContext` must be captured on every state-changing operation and persisted in both run and audit stores.

---

## Cross-references

- [Phase 4 repo-truth audit](./admin-spfx-phase-4-repo-truth-audit.md)
- [Phase 4 persistence boundary matrix](./admin-spfx-phase-4-persistence-boundary-matrix.md)
- [Phase 4 Summary Plan](./Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md)
- [End-state plan](../admin-spfx-it-control-center-end-state-plan.md)
- [Phase 2 audit/evidence contracts](../phase-02/admin-control-plane-audit-evidence-and-config-contracts.md)
- [Phase 2 run model](../phase-02/admin-control-plane-run-model.md)
- [Phase 3 service factory plan](../phase-03/admin-control-plane-service-factory-and-container-plan.md)
- [Existing provisioning saga audit](../../../reviews/phase-4-provisioning-status-and-saga-audit.md)
