# Prompt-03 — Durable Run Store and Audit Spine Implementation

## Objective

Implement the backend durable-storage primitives for the generalized admin run store and generalized admin audit store, then wire them into the backend service factory.

This prompt is the main Phase 4 persistence implementation step.

## Important execution rules

- Do **not** re-read files already in context unless necessary.
- Follow the canonical Phase 4 baseline docs from Prompt-02.
- Preserve current provisioning behavior while adding generalized primitives.
- Prefer additive, well-typed implementation over risky destructive refactors.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-run-audit-evidence-baseline.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-persistence-boundary-matrix.md`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/service-factory.ts`
- `packages/models/src/provisioning/IProvisioning.ts`

## Required implementation work

### A. Shared model additions
Add or update shared model types for generalized admin history/audit concepts.
Create only what is necessary, but define typed primitives for:
- generalized admin run record
- generalized admin audit event
- evidence manifest / evidence reference
- retention class / evidence disposition flags
- optional checkpoint record or checkpoint snapshot type if the baseline requires it

Prefer placing these in the shared models package in a location that fits repo conventions.
Do not bury generalized admin history types inside provisioning-only files unless that is the only repo-safe transitional step and you clearly mark it transitional.

### B. Backend service implementation
Add backend services for:
- generalized durable run storage
- generalized durable audit-event storage
- evidence metadata persistence

Use current repo patterns and naming conventions.
If Azure Table Storage remains the authoritative store for these primitives, implement with explicit keying and serialization boundaries.

### C. Service factory integration
Register the new services in:
- `backend/functions/src/services/service-factory.ts`

Use the same mock/real strategy pattern the repo already uses.
Do not break current service factory behavior for unrelated consumers.

### D. Minimal helper utilities
Add helper utilities only if needed for:
- row-key generation
- serialization normalization
- retention metadata normalization
- evidence inline-vs-offload decisioning

Keep helpers tight and local to the new persistence concern.

## Constraints

- Do not delete or replace the existing provisioning status store in this prompt.
- Do not break existing provisioning routes.
- Do not make the new generalized store depend on SPFx or admin page code.
- Do not make SharePoint list writes the source of truth for generalized audit history.
- Keep entity shape and partitioning choices explicit and documented in code comments where appropriate.

## Required tests

Add targeted tests for:
- store write/read round-trip
- append-only audit event behavior
- evidence manifest serialization
- service-factory registration and mock/real mode behavior
- any helper that determines oversized evidence handling

Use the smallest justified test surface.

## Documentation updates required in this prompt

Update or create Phase 4 implementation notes documenting:
- where the new stores live,
- how keys are generated,
- what remains compatibility-only,
- and what is still deferred.

Recommended file:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-store-implementation-notes.md`

## Validation

Run the smallest credible set for touched files, typically:
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- any touched shared-package type/test commands

Record what you ran in the implementation notes or commit summary comments if the repo convention prefers that.

## Completion condition

Stop when the generalized durable run/audit/evidence storage primitives exist, are wired, and are validated without breaking current provisioning storage behavior.
