# Prompt-05 — Backend Observability APIs and Telemetry Normalization

## Objective

Add or harden the backend APIs and normalization paths that power Phase 12 observability surfaces.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Reuse the new shared models and durable persistence plumbing.
- Keep privileged or storage-aware logic in the backend.
- Keep API surfaces specific enough to support the current operator-console use cases.

## Inputs

Use:
- shared observability models from Prompt-03
- durable persistence work from Prompt-04
- current backend logging / telemetry / provisioning foundations
- current admin-facing page needs revealed by the gap map

## Scope of work

Implement backend read/action/query behavior for at least:
- list alerts
- alert detail
- acknowledge alert
- resolve / close alert where in scope
- list latest probe snapshots
- get current health summary
- list/query normalized error events
- query correlated records for a run / project / source when supported
- retrieve operator-visible observability history slices needed by SPFx

## Telemetry normalization requirements

Where current backend/runtime telemetry exists:
- normalize what needs to become durable operator-facing observability records
- keep raw platform telemetry separate from the normalized records
- preserve correlation IDs and source metadata
- avoid duplicating every raw log line into the normalized store

## Implementation guidance

- Prefer backend query endpoints or functions that return operator-ready shapes.
- Avoid making SPFx compose critical observability joins client-side.
- Preserve existing retry / compensation / audit semantics already present in provisioning where relevant.
- Keep the API surface narrowly aligned to real operator use cases.

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-api-map.md`

Include:
- endpoint / function inventory
- request/response shapes
- auth expectations
- correlation semantics
- query/filter capabilities
- explicit non-goals

## Validation

At minimum:
- targeted API / query handler tests
- normalization tests
- regression tests for existing provisioning behavior touched by the work
- compile/lint checks for backend code

## Completion condition

Stop after backend observability APIs and their documentation are complete.
Do not implement probe runtime or SPFx pages in this prompt.
