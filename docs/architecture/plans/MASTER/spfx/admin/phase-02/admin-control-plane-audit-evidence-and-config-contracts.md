# Admin Control Plane — Audit, Evidence, and Config/Standards Contract Model

## Purpose

This document defines the contract model that makes admin actions reconstructable, explainable, and traceable to the standards/configuration state that governed them. It defines how audit records, evidence references, config snapshots, standards versions, operator rationale, and post-run validation summaries are structured and linked.

The shared type surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Design principles

1. **References, not embeddings**: Large mutable payloads (command inputs, step details, config values) are stored separately and referenced by ID. Audit records stay lean; evidence stores are independently queryable.
2. **No storage lock-in**: Storage locators are opaque strings. The contract defines what is captured and how it links, not where or how it is persisted. Persistence design is a Phase 4/10 concern.
3. **Hybrid config model**: Standards come from code defaults, live admin overrides, or a merge of both (LD-08). The contract supports all three sources.
4. **Audit ≠ evidence ≠ config**: Each serves a distinct purpose and has its own lifecycle. They link to each other but are not embedded.

## Record-type separation

| Record type | Interface | What it captures | Lifecycle |
|-------------|-----------|-----------------|-----------|
| **Audit record** | `IAdminAuditRecord` | That an event happened, who caused it, what governed it | Immutable after creation. Retained per compliance policy. |
| **Evidence reference** | `IAdminEvidenceReference` | Pointer to detailed evidence artifact (input snapshot, step detail, preview result) | Created when evidence is captured. Evidence payload stored separately. |
| **Config snapshot reference** | `IAdminConfigSnapshotReference` | Pointer to config version active at a point in time | Created at run launch. Links run to governing config. |
| **Standards reference** | `IAdminStandardsReference` | Which standards version was used as baseline | Created when standards are applied or compared. |
| **Rationale** | `IAdminRationale` | Why the operator took an action | Captured at run launch, checkpoint decisions, cancellations, config modifications. |
| **Post-run validation summary** | `IAdminPostRunValidationSummary` | Operator's verification of run outcome | Created after destructive/high-risk runs. |
| **Run-to-config trace** | `IAdminRunConfigTrace` | Links a run to its governing config and standards | Created at run launch. Bridge for traceability queries. |

### What lives where

| Data | Lives in | Referenced from |
|------|----------|----------------|
| Run envelope (`IAdminRunEnvelope`) | Run store | Audit records (via `runId`) |
| Checkpoint instance (`IAdminCheckpoint`) | Run store | Audit records (via `checkpointInstanceId`) |
| Audit record (`IAdminAuditRecord`) | Audit store | — (top-level query target) |
| Evidence payload | Evidence store | Audit records and run records (via `IAdminEvidenceReference.storageLocator`) |
| Config snapshot | Config store | Audit records and runs (via `IAdminConfigSnapshotReference.storageLocator`) |
| Standards definition | Standards store / code | Audit records (via `IAdminStandardsReference`) |

## Audit event types

13 auditable event types covering the full admin lifecycle:

| Event type | When emitted |
|------------|-------------|
| `run.started` | A run is created and begins execution |
| `run.completed` | A run finishes successfully |
| `run.failed` | A run fails |
| `run.cancelled` | An operator cancels a run |
| `run.retried` | A retry run is created from a failed run |
| `checkpoint.created` | A checkpoint is activated during a run |
| `checkpoint.decided` | An operator approves or rejects a checkpoint |
| `checkpoint.timed-out` | A checkpoint expires without decision |
| `checkpoint.escalated` | A checkpoint is escalated to higher authority |
| `config.modified` | Configuration/standards are modified by an admin |
| `standards.applied` | Standards are applied to an environment |
| `external-event.received` | An external event is received and processed |

**Typed as**: `AdminAuditEventType` enum in `@hbc/models`.

## Evidence types

8 evidence types covering inputs, outputs, and analysis:

| Evidence type | What it captures |
|---------------|-----------------|
| `command-input-snapshot` | Full command payload at run creation |
| `step-result-detail` | Detailed step execution results |
| `preview-result` | Preview/dry-run impact analysis |
| `post-validation-summary` | Post-run validation check results |
| `compensation-record` | Compensation/rollback execution details |
| `external-event-payload` | External event data received |
| `drift-report` | Standards comparison / drift detection results |
| `error-diagnostic` | Detailed error information for failed steps |

**Typed as**: `AdminEvidenceType` enum in `@hbc/models`.

## Traceability rules

### Run → audit

Every run lifecycle event produces an audit record with the `runId` field set. Given a `runId`, all related audit records can be queried.

### Run → config

At run creation, the system captures `IAdminRunConfigTrace` linking the run to:
- The active `IAdminConfigSnapshotReference` (what config governed this run)
- Any `IAdminStandardsReference` entries used as baselines

This enables "what standard governed this run" queries.

### Run → evidence

Evidence references are stored on audit records (`evidenceRef` field) and on the run envelope (`commandInputRef`, `configSnapshotRef`). Each reference includes a `storageLocator` for retrieving the full evidence payload.

### Checkpoint → audit

Checkpoint events produce audit records with both `runId` and `checkpointInstanceId` set. The checkpoint decision's `IAdminCheckpointDecision` is the authoritative decision record; the audit record is the durable event log entry.

### Config modification → audit

Config changes produce `config.modified` audit records with the actor, rationale, and a config snapshot reference to the new version. The previous version is recoverable via the config store's version history (Phase 10).

## Retention and linkage considerations

These are contract-level considerations. Actual retention policies are a Phase 4 concern.

| Record type | Retention expectation | Linkage |
|-------------|----------------------|---------|
| Audit records | Long-term (compliance-driven) | Link to runs, checkpoints, evidence, config via IDs |
| Evidence references | Medium-term (operational) | Linked from audit records; payload in evidence store |
| Config snapshots | Long-term (governance) | Linked from audit records and run-config traces |
| Standards references | Long-term (governance) | Linked from run-config traces and drift reports |
| Rationale | Same as parent audit record | Embedded in audit records |
| Post-run validation | Same as parent run | Linked from audit records via evidence reference |

## Config/standards hybrid model support

The contract supports the locked-decision hybrid model (LD-08):

| Source | `IAdminStandardsReference.source` | Meaning |
|--------|-----------------------------------|---------|
| `code-default` | Standard defined in code/config files | Immutable without code deployment |
| `live-override` | Standard maintained by authorized admin in live environment | Mutable via governed controls |
| `merged` | Effective standard merging code defaults with live overrides | Code defaults + admin overrides combined |

This enables traceability queries like:
- "Was this run governed by code defaults or a live override?"
- "When was this live override last modified, and by whom?"
- "What code-default version was active when this override was applied?"

## Examples

### Provisioning run

```
Run created (provisioning-rollout:saga:launch)
├── Audit: run.started
│   ├── actor: operator who initiated
│   ├── evidenceRef → command-input-snapshot (project config, team members)
│   ├── configSnapshotRef → provisioning standards version
│   └── rationale: null (provisioning is routine)
├── [steps 1–7 execute seamlessly]
├── Audit: run.completed
│   ├── evidenceRef → step-result-detail (7 step summaries)
│   └── configSnapshotRef → same provisioning standards version
└── RunConfigTrace
    ├── configSnapshot → provisioning config v1.2.3
    └── standardsRefs → [site-provisioning standards v2.0.1 (code-default)]
```

### SharePoint repair action

```
Run created (sharepoint-control:site:repair)
├── Audit: run.started
│   ├── actor: operator
│   ├── evidenceRef → command-input-snapshot (site URL, repair scope)
│   ├── configSnapshotRef → site standards version
│   └── rationale: "Site drift detected in weekly audit"
├── Checkpoint: pre-execution-approval (destructive mode)
│   ├── Audit: checkpoint.created
│   └── Audit: checkpoint.decided (approved, with impact preview evidence)
├── [repair steps execute]
├── Checkpoint: post-execution-validation
│   ├── Audit: checkpoint.created
│   ├── PostRunValidationSummary: 5 checks passed, operator confirmed
│   └── Audit: checkpoint.decided (approved)
├── Audit: run.completed
│   └── evidenceRef → step-result-detail + post-validation-summary
└── RunConfigTrace
    ├── configSnapshot → site config v3.1.0
    └── standardsRefs → [site-provisioning standards v2.0.1 (merged)]
```

### Standards application

```
Run created (standards-config:config:apply)
├── Audit: run.started
│   ├── actor: operator
│   ├── evidenceRef → command-input-snapshot (target scope, new values)
│   ├── configSnapshotRef → config before change
│   └── rationale: "Updating naming convention per Q2 policy change"
├── Checkpoint: pre-execution-approval (checkpointed mode)
│   ├── Audit: checkpoint.created
│   ├── evidenceRef → preview-result (what will change)
│   └── Audit: checkpoint.decided (approved)
├── [config applied]
├── Audit: config.modified
│   ├── configSnapshotRef → config after change (new version)
│   └── evidenceRef → drift-report (before/after comparison)
├── Audit: standards.applied
├── Audit: run.completed
└── RunConfigTrace
    ├── configSnapshot → config v3.2.0 (new version)
    └── standardsRefs → [naming-convention v1.1.0 (live-override)]
```

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Run model](admin-control-plane-run-model.md) | Run envelope, actor context, failure semantics |
| [Checkpoint contract](admin-control-plane-checkpoint-and-execution-modes.md) | Checkpoint lifecycle, decision records |
| [API contract catalog](admin-control-plane-api-contract-catalog.md) | Config request/response DTOs |
| [Action catalog](admin-control-plane-action-catalog.md) | Action keys and risk levels |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | LD-08 (hybrid config), LD-10 (single-admin safety + traceability) |
| `@hbc/models/admin-control-plane` | Shared type surface |
