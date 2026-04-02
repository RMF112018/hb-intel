# Prompt-05 — Versioning, Audit, Diff, and Concurrency Model

## Objective

Implement the version/history/audit backbone for live admin-maintained standards/configuration changes.

## Important execution rules

- Build on Prompt-04 rather than bypassing it.
- Keep secrets and infrastructure-only values out of this model.
- Do not wait for Phase 11 to make the audit/history model usable.
- Keep the model compatible with single-admin operation but do not overbuild the full Phase 11 safety framework here.

## Inputs

Use:
- Prompt-02 baseline
- Prompt-03 catalog model
- Prompt-04 provider/store implementation
- existing repo patterns for run and audit persistence where relevant

## Required implementation work

Implement typed contracts and service behavior for:
- version identifiers
- draft/published status if used
- change reason / operator note
- diff generation
- audit event payload
- optimistic concurrency / stale-write protection
- publish
- revert
- read history
- read specific version

## Required behaviors

- a live-editable config item cannot silently overwrite a newer value
- changes produce an auditable event record
- publish and revert create their own auditable records
- diff output is stable and usable by both API and UI layers
- version history can be retrieved without reconstructing from raw logs only

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-10/admin-spfx-phase-10-version-audit-model.md`

Document:
- version lifecycle
- event types
- concurrency rules
- publish/revert semantics
- what is intentionally deferred to Phase 11

## Validation requirement

Add focused tests for:
- concurrent update rejection
- version retrieval
- diff stability
- publish/revert behavior
- audit event emission

## Completion condition

Stop when the version/audit backbone is implemented and documented well enough that API and UI prompts can consume it without redefining semantics.
