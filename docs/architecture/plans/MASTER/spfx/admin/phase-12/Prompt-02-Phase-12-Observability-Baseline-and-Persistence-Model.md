# Prompt-02 — Phase 12 Observability Baseline and Persistence Model

## Objective

Create the canonical **Phase 12 observability baseline** and **durable persistence model** for admin observability so later implementation work uses one approved operating model.

## Important execution rules

- Do **not** re-read files still in active context unless needed because they changed or context became stale.
- Use the Prompt-01 gap map as the immediate evidence base.
- Keep the baseline explicit and implementation-facing.
- Do not allow SPFx to absorb storage, privileged query, or durable execution responsibilities.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-gap-map.md`
- the governing end-state plan
- current repo observability code/docs already reviewed in Prompt-01

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-baseline.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-storage-retention-and-access-model.md`

## Required baseline content

The baseline doc must define:
- operator-console responsibilities in SPFx
- reusable package responsibilities in `@hbc/features-admin`
- shared-domain responsibilities in `packages/models`
- backend/control-plane responsibilities
- observability data categories:
  - alerts
  - probe snapshots
  - incidents
  - errors
  - correlated run timeline items
  - operator actions (acknowledge / resolve / escalate)
- what counts as raw telemetry vs durable operator-facing observability state
- what absolutely must not live only in browser memory
- how observability should relate to provisioning and current admin-control surfaces

## Required storage / retention / access content

The storage/access model doc must define:
- the canonical durable ownership model for observability state
- what should stay as raw platform telemetry vs normalized app-level records
- retention expectations
- access / authorization boundaries
- correlation keys
- minimal query surfaces required by SPFx
- recommended production adapter direction if the repo currently supports more than one plausible storage path

## Decision rules

If the repo already has a clearly intended durable store for admin observability:
- preserve and extend it.

If the repo is still mixed or ambiguous:
- choose the narrowest architecture-safe direction that aligns with:
  - backend-owned persistence,
  - current repo foundations,
  - and the governing end-state plan.

Document the reason.

## Validation

Before finishing:
- verify the baseline does not contradict Prompt-01,
- verify the storage model distinguishes raw telemetry from durable operator-facing projections,
- verify nothing in the docs implies browser-owned durability.

## Completion condition

Stop after the two docs are complete.
Do not implement contracts or adapters in this prompt.
