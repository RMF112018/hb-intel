# Prompt 07 — Docs and Doctrine Reconciliation

You are working in the live HB Intel repository.

## Objective

Reconcile the repository documentation and doctrine so the live code, the new two-lane model, and the shared UI migration path all point in the same direction.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`
- `docs/reference/developer/documentation-authoring-standard.md`
- `docs/README.md`

Do not reread files that are already in your active context unless needed.

## Required work

- update or reconcile any stale `docs/reference/ui-kit/**` material that materially conflicts with live code or the new governing direction,
- ensure docs distinguish foundations, primitives, surface families, and consumers,
- ensure docs distinguish presentation and productive lanes,
- ensure docs reflect the reporting and visual-proof obligations for presentation-lane work,
- avoid adding patch guidance on top of clearly stale doctrine when replacement or consolidation is more appropriate.

## Consumer naming requirement

Where documentation changes affect implementation guidance, name the concrete consumer surfaces, packages, or workflows the updated docs are meant to govern.

At minimum, identify:

- which docs now govern homepage/presentation-lane work,
- which docs now govern productive-lane work,
- which named consumer areas or migration waves those docs are intended to support.

Do not keep the documentation map abstract if it is meant to guide real consumers.

## Deliverables

- concise documentation updates,
- stale-doc replacement or consolidation notes,
- final documentation map of what now governs this UI system,
- explicit notes on which docs govern which named consumer areas or migration waves.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

The visual section should explain whether the docs now better protect the presentation lane from drifting back toward generic internal-app patterns.

## Guardrails

- Do not produce bloated duplicate doctrine.
- Keep docs aligned to actual repo truth and current exports.
- Do not leave the documentation-to-consumer relationship vague.
