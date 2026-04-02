# Prompt-06 — Probe Execution and Alert Evaluation Productionization

## Objective

Turn the current monitor/probe scaffolding into a production-ready execution path with durable snapshots and alert evaluation.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Reuse `@hbc/features-admin` where it already owns monitor/probe logic or registries.
- Move durable execution and persistence concerns into backend-owned code paths.
- Do not leave production behavior dependent on page load, in-memory browser state, or best-effort-only flows.

## Inputs

Use:
- `packages/features/admin/**` observability code
- backend observability persistence and API work from Prompts 04–05
- the Phase 12 baseline docs
- current README-documented limitations in `@hbc/features-admin`

## Scope of work

Productionize at least:
- probe execution flow
- probe snapshot persistence
- alert evaluation rules
- alert state transitions
- dedupe / repeat handling where necessary to avoid operator spam
- failure capture when a probe itself errors
- summary health rollups needed by SPFx pages

## Required handling of current deferred/stubbed items

Audit the monitors/probes that are currently documented as:
- live
- stubbed
- deferred

Then:
- complete what is realistically supported by current repo dependencies,
- convert placeholders into explicit non-goals only if the underlying dependency truly does not exist,
- and document the reasoning.

Do not silently leave stubs in place if Phase 12 is supposed to finish the observability layer.

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-probe-and-alert-runtime.md`

This doc must explain:
- how probes run
- how snapshots are persisted
- how alerts are generated and updated
- how duplicate / repeated conditions are handled
- what remains deferred, if anything, and why

## Validation

At minimum:
- targeted tests for probe execution and alert evaluation
- tests covering state transitions and duplicate-condition handling
- compile/lint checks for touched packages/backends

## Completion condition

Stop after probe/alert runtime work and its documentation are complete.
Do not implement cross-domain instrumentation or SPFx surfaces in this prompt.
