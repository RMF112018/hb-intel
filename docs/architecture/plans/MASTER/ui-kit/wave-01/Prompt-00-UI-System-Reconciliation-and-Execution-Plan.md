# Prompt 00 — UI System Reconciliation and Execution Plan

You are working in the live HB Intel repository.

## Objective

Reconcile current repo truth against the new two-lane UI-system direction, then produce and begin executing a concrete implementation plan for the shared UI refactor.

## Mandatory read set

Read only the smallest necessary authoritative set first, but you must include the following files in your review:

- `CLAUDE.md`
- `.claude/agents/hb-ui-ux-conformance-reviewer.md`
- `docs/reference/developer/agent-authority-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`
- `packages/ui-kit/**` entry points, exports, and representative implementation files
- key homepage/webpart consumers that currently express presentation-grade surfaces

Do not re-read files already in active context unless they changed, context is stale, or scope expanded.

## What to determine

Produce a repo-truth execution note covering:

1. current `@hbc/ui-kit` layering and where it violates the new model,
2. where productive and presentation concerns are still mixed,
3. which current exports are healthy, transitional, or legacy,
4. where adapters are needed,
5. which consumers are the best first migration targets,
6. what sequence should be used for implementation.

## Required outputs

- a concise execution plan,
- a layer-and-lane mismatch register,
- a recommended first migration wave,
- explicit notes on what should be rebuilt versus adapted.

## Guardrails

- Do not treat legacy UI-kit doctrine as authoritative if it conflicts with the new files above and live repo truth.
- Do not jump into broad rewrites before establishing the migration order.
- Do not collapse presentation and productive lanes into a single generic card language.
