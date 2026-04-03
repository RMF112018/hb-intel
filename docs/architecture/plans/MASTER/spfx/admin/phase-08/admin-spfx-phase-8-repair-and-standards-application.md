# Admin SPFx IT Control Center — Phase 8 Repair and Standards Application

**Prompt:** P8-06 — Controlled Repair, Apply, and Reapply Flows
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the backend execution flows for constrained SharePoint standards application and drift repair.

---

## 1. Supported action types

All Phase 8 repair actions are **idempotent creates** — they create missing items or restore items to expected state. No destructive operations (delete, restructure, schema migration) are supported.

| Action | Description | changeType |
|--------|-------------|-----------|
| Create missing document library | Idempotent library creation with versioning | `create` |
| Create missing data list | Idempotent list creation from provisioning Step 4 definitions | `create` |
| Upload missing template file | Idempotent file upload (never overwrite existing) | `create` |
| Create missing Entra security group | Idempotent group creation per three-group naming convention | `create` |
| Join hub site | Idempotent hub association (skip if already associated) | `create` |

### Not supported in Phase 8

| Action | Why excluded |
|--------|-------------|
| Site creation | Provisioning concern, not drift repair |
| App catalog package install/upgrade | ALM deployment workflow deferred |
| API access permission grant | Requires tenant-admin consent |
| Permission-level reassignment | Structural change requires checkpoint |
| List schema modification | Schema migration deferred |
| File content update | Content versioning deferred |
| Any delete or destructive operation | Phase 8 boundary: idempotent creates only |

---

## 2. Execution boundaries

### Managed-asset boundary enforcement

`validateRepairBoundary()` blocks repair when:
- No preview has been generated (preview is mandatory before repair)
- Asset has no provisioning record (outside managed-asset boundary)
- Asset site does not exist (site creation is not a Phase 8 action)

### Scope restriction

- Only findings with `repairable: true` are attempted
- Non-repairable findings are counted (`excludedNonRepairable`) but never executed
- The repair executor callback is scoped to the specific asset and finding

### Idempotency guarantee

The `RepairExecutor` callback must be idempotent:
- If the item already exists, return `outcome: 'skipped'`
- If the item was created, return `outcome: 'created'`
- If the action failed, return `outcome: 'failed'` with error message

---

## 3. Safeguard model

| Safeguard | Implementation |
|-----------|---------------|
| **Preview required** | `validateRepairBoundary()` blocks execution without preview |
| **Managed-asset boundary** | Provisioning record required; site must exist |
| **Non-repairable exclusion** | Only `repairable: true` findings are attempted |
| **No destructive operations** | All repairs are `create` — no delete, no schema changes |
| **Per-step error isolation** | Each step executes independently; one failure does not block others |
| **Thrown-error handling** | Executor exceptions are caught and recorded as `failed` steps |
| **Audit trail** | Every repair run records an audit event with operator identity |
| **Evidence capture** | Per-step results, timing, and error details persisted as evidence |

---

## 4. Audit behavior

### Audit event

| Field | Value |
|-------|-------|
| `eventType` | `StandardsApplied` |
| `domain` | `SharePointControl` |
| `actionKey` | `sharepoint-control:standards:apply-repair` |
| `summary` | `SharePoint repair for {projectNumber}: {outcome} ({N} created, {M} skipped, {F} failed, {E} excluded)` |

### Evidence capture

| Field | Value |
|-------|-------|
| `evidenceType` | `StepResultDetail` |
| `storageLocator` | `inline://sharepoint-repair/{projectId}/{timestamp}` |
| `payload` | Asset, outcome, standards version, per-step results with timing and errors |

Both are fire-and-forget — failures do not block the repair result.

---

## 5. Rollback / retry notes

### No automatic rollback

Phase 8 repairs are idempotent creates. If a step fails:
- The item was not created (nothing to roll back)
- The step is recorded as `failed` with error details
- Other steps continue independently

### Retry behavior

- The entire repair can be re-run from the beginning (all steps are idempotent)
- Previously created items will return `skipped` on retry
- There is no step-level resume; retry re-runs all repairable findings

### Outcome classification

| Outcome | Meaning |
|---------|---------|
| `all-repaired` | All repairable findings were created or already existed (skipped) |
| `partial` | Some findings were created, some failed |
| `none-repaired` | All attempted repairs failed |
| `nothing-to-repair` | No repairable findings existed |

---

## 6. Open limitations

| Limitation | Phase 8 state | Future extension |
|-----------|---------------|-----------------|
| No step-level resume | Re-run retries all steps | Later phases may add step-level resume |
| No parallel step execution | Steps execute sequentially | Later phases may add concurrency |
| No run envelope integration | Standalone result, not wrapped in IAdminRunEnvelope | Later phases may add full run tracking |
| Executor is injected callback | Real SharePoint/Graph calls not wired yet | Later prompts implement real executors |
| No checkpoint gates | All repairs execute automatically after preview | Later phases may add approval gates for specific areas |
| No cost/duration estimation | Steps report actual duration only | Later phases may add estimates |

---

## Validation

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Backend tests | `pnpm --filter @hbc/functions test` | **Pass** — 1392 passed, 3 skipped |
| New test suite | `sharepoint-repair-service.test.ts` | **Pass** — 15 tests |

### Test coverage

| Test group | Tests | Coverage |
|-----------|-------|----------|
| validateRepairBoundary | 4 | Valid request, missing preview, unprovisioned asset, missing site |
| executeSharePointRepair | 11 | All-repaired, non-repairable exclusion, nothing-to-repair, partial failure, thrown errors, skip (idempotent), boundary blocking, step timing, area/ID capture, audit/evidence invocation, result fields |

### Not run

| Check | Reason |
|-------|--------|
| Models build | No model changes |
| Admin lint/build | No frontend changes |

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — repair boundary (section 8.3)
- [Preview and Dry-Run](admin-spfx-phase-8-preview-and-dry-run.md) — preview input
- [Drift Detection Workflow](admin-spfx-phase-8-drift-detection-workflow.md) — comparison input
- Service code: `backend/functions/src/services/admin-control-plane/sharepoint-repair-service.ts`
- Test code: `backend/functions/src/services/admin-control-plane/__tests__/sharepoint-repair-service.test.ts`
