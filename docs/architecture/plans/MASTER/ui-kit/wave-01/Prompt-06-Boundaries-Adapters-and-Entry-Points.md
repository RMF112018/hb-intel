# Prompt 06 — Boundaries, Adapters, and Entry Points

You are working in the live HB Intel repository.

## Objective

Reconcile package boundaries, export surfaces, and migration adapters so the shared UI system can evolve cleanly without a destructive flag-day rewrite.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`
- `docs/architecture/blueprint/package-relationship-map.md`

Inspect live package exports and entry points in `packages/ui-kit`.

Do not reread files that are already in your active context unless needed.

## Required work

- clean up or clarify entry points,
- ensure exports align to the layered system,
- introduce or refine adapters/shims for legacy consumers,
- reduce confusion around what is foundation, primitive, surface family, or consumer-specific assembly,
- name the concrete consumers or packages that depend on the changed entry points and adapters.

## Consumer naming requirement

Name the specific consumers or packages affected by boundary, export, or adapter changes.

At minimum, identify:

- which consumers are expected to keep working through adapters/shims,
- which named consumers should move to cleaner entry points,
- which named consumers remain transitional after this wave.

Do not describe boundary work only in abstract package terms.

## Deliverables

- updated export strategy,
- adapter/shim plan and implementation where warranted,
- notes on deprecated or transitional APIs,
- verification of changed paths,
- named consumer impact notes.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

If presentation-lane consumers are affected by entry-point or adapter changes, the visual section must state whether those consumers remained protected from regression.

## Guardrails

- Do not break large consumer areas unnecessarily.
- Do not preserve confusing boundaries merely for historical continuity.
- Do not leave consumer impact unnamed.
