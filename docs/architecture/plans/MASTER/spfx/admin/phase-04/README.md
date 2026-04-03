# README — Admin SPFx IT Control Center Phase 4 Prompt Package

## What this package is

This is a **local-code-agent prompt package** for:

**Phase 4 — Durable run history, audit spine, and evidence model**

The package is designed to implement the Phase 4 work described in the Admin SPFx IT Control Center end-state plan while staying grounded in current repo truth.

## Included files

1. `Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md`
2. `README.md`
3. `Prompt-01-Phase-4-Repo-Truth-Audit-and-Preconditions.md`
4. `Prompt-02-Phase-4-Canonical-Run-Audit-and-Evidence-Baseline.md`
5. `Prompt-03-Durable-Run-Store-and-Audit-Spine-Implementation.md`
6. `Prompt-04-Provisioning-Bridge-and-Backward-Compatibility.md`
7. `Prompt-05-Audit-Retrieval-APIs-and-Query-Contracts.md`
8. `Prompt-06-Evidence-Storage-Retention-and-Export-Boundaries.md`
9. `Prompt-07-Documentation-Alignment-and-Developer-References.md`
10. `Prompt-08-Validation-Migration-Rails-and-Exit-Reconciliation.md`

## Intended execution order

Run the prompts in numeric order.

Do not skip forward unless a prompt explicitly says to stop because repo truth materially differs from the assumptions captured in this package.

## Governing posture for the code agent

Use this authority order when signals conflict:

1. verified live code and configuration
2. the existing repo audit artifacts directly relevant to Phase 4
3. `docs/architecture/blueprint/current-state-map.md`
4. the Admin IT Control Center end-state plan
5. the admin Phase 4 docs created by these prompts
6. older historical plans that predate current repo truth

## Required execution behavior

- Read the **smallest authoritative set** needed for the current task.
- Do **not** re-read files still in active context or memory unless:
  - they changed,
  - context became stale,
  - the prompt explicitly requires a fresh check,
  - or the task widened.
- Preserve working repo foundations unless there is a clear reason to refactor.
- Keep this phase focused on durable run history, auditability, and evidence.
- Avoid accidental bleed into full Phase 5 console work or later admin domains.

## Explicit cautions

- Do not move durable-history or evidence logic into SPFx.
- Do not redesign the backend around Azure Durable Functions solely because the name sounds aligned. The repo already has a functioning class-based orchestration pattern; this phase is about durable history and evidence, not orchestration replacement.
- Do not break provisioning-specific endpoints or existing admin oversight pages while introducing generalized run/audit primitives.
- Do not treat the SharePoint `ProvisioningAuditLog` write path as the sole authoritative audit system.
- Do not ignore Azure Table Storage payload limits when designing evidence persistence.
- Do not remove existing repo audit or compatibility docs unless replaced by a clearly better canonical artifact.

## Canonical Phase 4 artifacts

### Baseline docs (define the model)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Repo-Truth Audit](admin-spfx-phase-4-repo-truth-audit.md) | P4-01 | Provisioning persistence inventory, gaps, preconditions |
| [Run/Audit/Evidence Baseline](admin-spfx-phase-4-run-audit-evidence-baseline.md) | P4-02 | Canonical concepts, capture dimensions, audit event taxonomy, storage doctrine |
| [Persistence Boundary Matrix](admin-spfx-phase-4-persistence-boundary-matrix.md) | P4-02 | 10-row store ownership and boundary rules |

### Implementation notes (document what was built)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Store Implementation Notes](admin-spfx-phase-4-store-implementation-notes.md) | P4-03 | Table keying, serialization, service factory wiring |
| [Provisioning Bridge](admin-spfx-phase-4-provisioning-bridge.md) | P4-04 | Saga-to-spine event mapping, compatibility surfaces |
| [Retrieval API Contract](admin-spfx-phase-4-retrieval-api-contract.md) | P4-05 | Audit/evidence query endpoints and response shapes |
| [Evidence & Retention Boundaries](admin-spfx-phase-4-evidence-and-retention-boundaries.md) | P4-06 | Inline/offload thresholds, retention classes |

### Exit reconciliation (created by P4-08)

| Document | Prompt | Purpose |
|----------|--------|---------|
| [Migration & Cutover Notes](admin-spfx-phase-4-migration-and-cutover-notes.md) | P4-08 | Forward-only migration posture, data duplication, deployment notes |
| [Exit Reconciliation](admin-spfx-phase-4-exit-reconciliation.md) | P4-08 | Final validation, acceptance criteria, residual risks, next phase entry |

## Expected repo outputs

Primary outputs should land under:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/`
- `backend/functions/src/services/`
- `backend/functions/src/functions/`
- `packages/models/src/`
- `packages/provisioning/src/`

Secondary outputs may include narrowly scoped updates to:
- `apps/admin/README.md`
- `backend/functions/README.md`
- stale provisioning/reference docs
- current-state-map or admin reference docs, but only when a present-truth alignment change is actually warranted

## Validation posture

Use the smallest credible validation set for the scope actually touched.

Expected default posture:
- targeted unit/contract tests for touched backend services and endpoints
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- package-level checks for any touched shared package(s)
- formatting / lint checks only where justified by touched files

Do not run broad workspace validation by default unless repo truth or touched scope justifies it.

## Completion standard

The package is complete when the repo has:
- a canonical Phase 4 run/audit/evidence baseline,
- durable generalized backend stores,
- retrieval/query rails,
- a provisioning bridge to the generalized spine,
- evidence boundary / retention handling,
- aligned docs,
- and a final exit-reconciliation artifact confirming end-to-end reviewability.
