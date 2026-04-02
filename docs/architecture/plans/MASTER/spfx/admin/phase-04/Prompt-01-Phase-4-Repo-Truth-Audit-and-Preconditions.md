# Prompt-01 — Phase 4 Repo-Truth Audit and Preconditions

## Objective

Perform the Phase 4 repo-truth audit and write the canonical preconditions report for durable run history, audit spine, and evidence-model work.

This prompt is an audit/evidence prompt.
It must establish exactly what already exists, what is provisioning-specific, what is reusable, what is stale, and what Phase 4 actually needs to change.

## Important execution rules

- Read the **smallest authoritative set** required.
- Do **not** re-read files already in current context unless they changed or the context is stale.
- Treat the existing repo as present truth.
- Do not start implementing generalized persistence in this prompt.

## Required source set

Read and use at minimum:

### Governing docs
1. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md`
2. `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md`
3. `docs/architecture/blueprint/current-state-map.md`

### Existing Phase 4 evidence
4. `docs/architecture/reviews/phase-4-provisioning-status-and-saga-audit.md`

### Admin surfaces / boundaries
5. `apps/admin/README.md`
6. `packages/features/admin/README.md`

### Backend / shared contract files
7. `backend/functions/src/services/service-factory.ts`
8. `backend/functions/src/services/table-storage-service.ts`
9. `backend/functions/src/services/sharepoint-service.ts`
10. `backend/functions/src/services/signalr-push-service.ts`
11. `backend/functions/src/functions/provisioningSaga/index.ts`
12. `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
13. `packages/models/src/provisioning/IProvisioning.ts`
14. `packages/provisioning/src/api-client.ts`
15. `backend/functions/README.md`
16. `backend/functions/package.json`

### Optional, only if directly needed
- any timer handler or admin page directly referenced by the audit report
- any stale reference doc the audit report already identifies as conflicting

## Deliverable

Create:

- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-repo-truth-audit.md`

## Required structure

Include these sections:

1. **Purpose**
2. **Authority set used**
3. **Confirmed existing run-history foundations**
4. **Confirmed existing audit-history foundations**
5. **Confirmed existing evidence-related data already captured**
6. **Provisioning-specific seams that must be generalized**
7. **Current compatibility surfaces that must be preserved**
8. **Stale or conflicting documentation**
9. **Phase 4 real gaps**
10. **Explicit non-gaps**
11. **Preconditions for implementation prompts**
12. **Forward-looking cautions**

## Minimum findings that must be called out if still true

- Azure Table Storage already persists provisioning status per run.
- The provisioning model already uses `projectId` + `correlationId` as a durable run identity pattern.
- Existing provisioning endpoints already expose status/history-like reads and admin mutations.
- SharePoint audit writes already exist, but are not the full generalized audit spine.
- SignalR is enhancement-only and the status endpoint is authoritative.
- The current typed model is still heavily provisioning-specific.
- There is already a repo audit report documenting a large part of the provisioning persistence behavior.
- `apps/admin` and `@hbc/features-admin` are not where durable run/audit persistence should live.
- The admin doc folder is still thin relative to what Phase 4 needs.

## Classification requirement

Be explicit when labeling findings as:
- existing and reusable
- existing but provisioning-specific
- stale / conflicting
- missing
- deferred to later phase

Do not blur those categories.

## Validation

Before finishing:
- verify every referenced path exists,
- verify the new audit does not contradict the existing Phase 4 provisioning audit report without explaining why,
- verify the document clearly separates repo fact from recommendation.

## Completion condition

Stop when the Phase 4 repo-truth audit is complete and usable as the baseline for the remaining prompts.
