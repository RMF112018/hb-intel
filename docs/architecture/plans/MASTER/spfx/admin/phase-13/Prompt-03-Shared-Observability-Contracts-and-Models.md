# Prompt-03 — Shared Observability Contracts and Models

## Objective

Implement the shared **observability contracts and models** that Phase 12 requires across backend, reusable admin package code, and SPFx pages.

## Important execution rules

- Do **not** re-read files still in active context unless needed.
- Follow the Phase 12 baseline and storage/access model as the controlling inputs.
- Prefer version-safe, explicit, typed contracts over ad hoc JSON shapes.
- Do not bury shared types inside page-local or adapter-local files.

## Inputs

Use:
- Phase 12 baseline docs from Prompt-02
- existing `packages/models/**`
- existing `packages/features/admin/**` types and APIs
- current provisioning / admin models already in the repo

## Scope of work

Implement or update shared domain contracts for at least:

- alert severity
- alert status
- alert source / category
- probe kind
- probe execution status
- probe snapshot
- observability incident / issue
- operator acknowledgment and resolution events
- error event classification
- correlation metadata
- timeline/query filter models
- summary / card / table view models needed by SPFx pages

## Preferred repo areas

Use the existing package architecture and place code where it belongs, likely across:
- `packages/models/**`
- `packages/features/admin/**`

## Required implementation standards

- Keep transport DTOs and domain models clearly separated if the repo already distinguishes them.
- Reuse existing naming conventions where healthy.
- Keep model definitions stable enough for:
  - backend persistence
  - API query responses
  - hooks/components
  - page rendering
  - tests/fixtures

## Documentation work

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-12/admin-spfx-phase-12-observability-model.md`

Document:
- the model set,
- which package owns each part,
- and where future extensions should go.

## Validation

At minimum:
- targeted unit tests for new or changed model helpers/validators
- compile/lint checks for touched packages
- fixture coverage for key query and state combinations

## Completion condition

Stop after shared models/contracts and the model doc are complete.
Do not implement persistence adapters or APIs in this prompt.
