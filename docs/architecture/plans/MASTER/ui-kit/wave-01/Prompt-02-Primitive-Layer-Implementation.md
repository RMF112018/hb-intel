# Prompt 02 — Primitive Layer Implementation

You are working in the live HB Intel repository.

## Objective

Rebuild and reconcile the primitive layer so both lanes use a shared, modern, maintainable set of building blocks.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

Inspect the live primitive-related code in `packages/ui-kit` and representative consumers.

Do not reread files that are already in your active context unless needed.

## Implementation goals

Create or refactor a coherent primitive layer for:

- layout,
- text,
- button/action,
- status/badge,
- input and field shells where appropriate,
- overlays and positioning utilities,
- navigation and small interaction scaffolds.

## Required outcomes

- primitives clearly distinguish shared building blocks from higher-order surface families,
- productive-lane primitives remain efficient and disciplined,
- presentation-lane consumers can compose premium results without resorting to scattered one-off primitives,
- legacy wrappers are either modernized, deprecated, or adapter-backed,
- the wave explicitly names the consumers most affected by the primitive changes.

## Consumer naming requirement

Name the specific consumer surfaces, packages, stories, or webparts materially affected by the primitive changes.

At minimum, identify:

- the key productive-lane consumers expected to use the changed primitives,
- the key presentation-lane consumers expected to compose from the changed primitives,
- any adapter-backed legacy consumers still depending on transitional patterns.

Do not speak generically about “consumers” without naming them.

## Validation

Report:

- which primitives were rebuilt, wrapped, or deprecated,
- where adapters were introduced,
- which named consumers were checked, updated, or intentionally deferred,
- whether affected consumer stories/tests/typecheck passed,
- what remains intentionally transitional.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

If presentation-lane consumers are materially affected, the visual section must state whether the primitive changes improved premium composition capability without turning primitives themselves into surface families.

## Guardrails

- Do not treat homepage/editorial compositions as primitives.
- Do not force presentation-lane drama into productive primitives.
- Do not report primitive success without naming the real consumers that benefited or remain blocked.
