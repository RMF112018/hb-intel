# Prompt-04 — Durable Persistence Adapters and Storage Plumbing

## Objective

Replace in-memory observability persistence with durable backend-owned storage plumbing that matches the Phase 12 baseline.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Reuse healthy backend foundations already present:
  - service factory
  - adapter-mode validation
  - current persistence patterns
- Do not place durable persistence logic in browser code or page hooks.
- Avoid inventing a second observability storage path unless a dual-path design is explicitly required and documented.

## Inputs

Use:
- Phase 12 gap map
- Phase 12 baseline
- Phase 12 storage / retention / access model
- backend service-factory and existing persistence adapter patterns
- any existing admin alert / probe APIs currently using in-memory stores

## Scope of work

Implement durable persistence for at least:
- alerts
- probe snapshots
- operator acknowledgment / resolution state
- normalized error / issue records required by the operator console
- minimal correlation fields needed for run / project / tenant / source drilldown

## Expected implementation shape

Implement backend-side persistence abstractions and production adapters that fit the repo’s current architecture.

The result should allow the backend to:
- write observability records durably,
- query them efficiently enough for admin pages,
- update operator action state,
- and support incremental expansion without reshaping browser contracts.

## Requirements

- Respect existing real-vs-mock adapter mode patterns.
- Keep storage names / schema details centralized and documented.
- Add retention-aware metadata where appropriate.
- Avoid overfitting the design to only one page.
- If an existing SharePoint-list target or other repo-defined target is already canonical, preserve it behind an adapter instead of rewriting the entire persistence strategy.

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-persistence-adapter-map.md`

The doc must show:
- adapter ownership
- storage targets
- normalized entity shapes
- key indexes / lookup paths
- mock/test behavior
- production behavior

## Validation

At minimum:
- targeted adapter tests
- persistence read/write tests for the chosen production adapter path where feasible
- mock-vs-real mode behavior verification
- compile/lint checks for touched backend code

## Completion condition

Stop after durable persistence plumbing and adapter documentation are complete.
Do not implement final SPFx surfaces in this prompt.
