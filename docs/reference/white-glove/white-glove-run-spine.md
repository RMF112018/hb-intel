# White-Glove Run Spine Reference

> Parent/child package run orchestration, retry semantics, and SPFx result envelopes.

**Backend service:** `WhiteGloveRunService` in `backend/functions/src/services/white-glove/white-glove-run-service.ts`
**Consumers:** `backend/functions/` (adapters, orchestrator), `apps/admin/` (run history, checkpoints, evidence UX)

## Run hierarchy

| Level | Storage | Partition strategy |
|-------|---------|-------------------|
| Package run | In-memory (Phase 9.1); future: AdminRuns table | `white-glove-deployment` domain |
| Device run | In-memory (Phase 9.1); future: dedicated table or AdminRuns | Parent package run ID |
| Checkpoint | Inline on device run record | Device run ID |
| Evidence | Inline on device run + AdminEvidence table | Device run ID / run ID |
| Audit event | AdminAuditEvents table | Package run ID |

## API endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/admin/white-glove/runs` | Admin | Launch package run |
| GET | `/api/admin/white-glove/runs` | Scope | List package runs |
| GET | `/api/admin/white-glove/runs/{runId}` | Scope | Get package run result |
| POST | `/api/admin/white-glove/runs/{runId}/cancel` | Admin | Cancel package run |
| POST | `/api/admin/white-glove/runs/{runId}/retry` | Admin | Retry package run |
| GET | `/api/admin/white-glove/devices/{deviceRunId}` | Scope | Get device run detail |
| POST | `/api/admin/white-glove/devices/{deviceRunId}/retry` | Admin | Retry device run |
| POST | `/api/admin/white-glove/devices/{deviceRunId}/checkpoint/{cpId}` | Admin | Resolve checkpoint |

## Package status aggregation

Package run status is derived from child device run statuses:

| Condition | Package status |
|-----------|---------------|
| All devices completed | `Completed` |
| All terminal, some completed + some failed | `PartiallyCompleted` |
| All terminal, all failed | `Failed` |
| Any device awaiting checkpoint | `AwaitingCheckpoint` |
| Otherwise (devices still running) | `Running` |

## Retry semantics

| Failure class | Eligible | Max retries | Backoff | Compensation |
|---|---|---|---|---|
| connector-failure | Yes | 3 | 5s | None |
| enrollment-failure | Yes | 2 | 10s | Unenroll if partial |
| profile-assignment-failure | Yes | 2 | 10s | Unassign profile |
| standardization-failure | Yes | 3 | 5s | None (idempotent) |
| validation-failure | Yes | 3 | 2s | None |
| operator-cancellation | No | 0 | — | Full compensation |
| transient | Yes | 5 | 3s | None |
| permission-denied | No | 0 | — | None (admin action) |

## SPFx result envelope

`IWhiteGlovePackageRunResult` provides a normalized view:
- Package-level status and progress counts
- Device-level status, checkpoints, evidence, failure details
- Active checkpoints (pending across all devices)
- Recent audit events

## Provisioning compatibility

The white-glove run service does **not** modify existing provisioning infrastructure:
- Existing `DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore` are unchanged
- The orchestration bridge for provisioning is untouched
- White-glove runs use `AdminDomain.WhiteGloveDeployment` to partition from provisioning runs
- Both provisioning and white-glove runs coexist in the same audit/evidence tables

## Cross-references

- [Domain model](white-glove-domain-model.md)
- [Architecture baseline](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-architecture-baseline.md)
- [Connector governance](../configuration/white-glove-connector-governance.md)
- [Run spine architecture](../../architecture/plans/MASTER/spfx/admin/white-glove/white-glove-run-spine-architecture.md)
