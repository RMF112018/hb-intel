# Prompt-07 — Cross-Domain Instrumentation and Correlation Adoption

## Objective

Adopt the new observability model across current admin/control-plane domains so operators can correlate real failures and health signals instead of seeing isolated fragments.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Instrument current repo-supported domains; do not fabricate future domains that do not exist yet.
- Preserve existing provisioning behavior while adding correlation and observability emission.
- Keep raw telemetry and normalized observability records clearly separated.

## Inputs

Use:
- backend observability APIs and persistence
- provisioning saga and existing admin/control-plane code
- Phase 12 baseline docs
- the gap map’s domain inventory

## Scope of work

Adopt the observability framework across the current repo-supported domains, prioritizing:
- provisioning saga
- provisioning failures / retry / escalate flows
- backend install/bootstrap surfaces if already present
- current SharePoint-control or admin-control backend actions if already present
- current Entra-related admin/control actions if already present

For each touched domain:
- emit correlation-aware observability records,
- map failures into normalized operator-facing records,
- tie alerts/errors/incidents back to the relevant run / action / project / source where possible.

## Deliverable constraint

If some domains named in the end-state plan are not yet implemented in repo truth:
- do not fabricate the missing domains,
- but do record the adoption gap and leave clear extension points.

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-adoption-map.md`

Include:
- current adopted domains
- correlation keys used
- what evidence each domain emits
- what remains future-dependent

## Validation

At minimum:
- targeted regression tests for touched provisioning/admin flows
- verification that observability adoption does not break existing success/failure semantics
- compile/lint checks for touched code

## Completion condition

Stop after cross-domain adoption and the adoption map are complete.
Do not implement SPFx UI in this prompt.
