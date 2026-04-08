# Prompt 08 — Verification, Visual Proof, and Packaging

You are working in the live HB Intel repository.

## Objective

Finish the UI-system refactor wave with disciplined validation, visual proof, and packaging confidence appropriate to the changed layer and the affected surfaces.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/developer/verification-commands.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/Productive-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

Do not reread files that are already in your active context unless needed.

## Required validation model

Use the smallest meaningful verification set first, but include the layers actually touched:

- foundations and tokens,
- primitives/components,
- surface-family stories or representative render coverage,
- affected consumers,
- adapters or shims,
- SPFx packaging/build validation where affected.

## Consumer naming requirement

You must name the exact consumers covered by validation and visual proof.

At minimum, identify:

- which named consumers were directly verified,
- which named consumers have before/after visual proof,
- which named consumers were not verified and why,
- which named consumers remain transitional.

Do not report verification only by package or layer if real consumer surfaces were affected.

## Required reporting

Report clearly:

- exactly what was verified,
- exactly what was not verified,
- visual before/after proof expectations for named homepage/editorial surfaces,
- any known gaps or remaining transitional areas,
- packaging/build evidence tied to named SPFx or packaged consumers where applicable.

## Packaging expectations

When SPFx or packaged consumers are involved:

- prove the changed code path is included in the built package,
- avoid assuming packaging success from source changes alone,
- document the packaging/build evidence,
- tie that evidence to the named consumer webparts or packaged surfaces.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

For presentation-lane consumers, the visual section must state whether the named surfaces materially advanced beyond the prior generic internal-app feel.

## Guardrails

- Do not claim completion based only on typecheck or lint if visual surfaces materially changed.
- Do not treat code quality alone as sufficient proof for premium presentation work.
- Do not leave consumer-level verification vague.
