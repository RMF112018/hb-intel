# Prompt 03 — Presentation Surface Family Implementation

You are working in the live HB Intel repository.

## Objective

Implement the presentation lane as a first-class shared surface-family system inside the UI kit so homepage/editorial/branded content stops relying on generic productive-card treatment.

This prompt is governed by the accepted Prompt 00 reconciliation note and its corrective addendum. Treat that accepted Prompt 00 output as the active baseline.

## Mandatory reference files

Read and follow:

- `Prompt-00-Acceptance-and-Corrective-Addendum.md`
- `UI-System-Reconciliation-Execution-Note.md`
- `docs/reference/ui-kit/UI-System-Layer-Model.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/architecture/blueprint/ui-system-target-architecture.md`
- `docs/explanation/ui-system/Why-Two-Lanes.md`
- `docs/how-to/developer/Building-New-Homepage-Surfaces.md`
- `docs/how-to/developer/Migrating-Legacy-UI-to-the-Two-Lane-System.md`

Also inspect existing presentation-grade consumers, especially the strongest current examples and the current homepage/webpart assemblies.

Do not reread files that are already in your active context unless needed.

## Surface-family goal

Implement or formalize shared presentation surface families such as:

- signature hero,
- spotlight / feature surfaces,
- editorial / leadership surfaces,
- pulse / news surfaces,
- people-and-culture storytelling surfaces,
- command / launcher presentation bands where appropriate.

## Required outcomes

- presentation surfaces are clearly modeled as shared surface families, not as disguised productive cards,
- the system supports premium authored hierarchy, imagery, scale, and rhythm,
- consumer assemblies are easier to compose without excessive local CSS invention,
- surface APIs remain maintainable and cross-surface aware,
- the completion note names the exact consumer surfaces affected in this wave.

## Consumer naming requirement

You must name the exact consumer surfaces affected by this wave.

At minimum, identify:

- which homepage webparts or consumer assemblies were directly improved,
- which specific surfaces are now backed by shared presentation families,
- which consumers are still local by design and why,
- which consumers remain deferred.

Tie all visual-proof reporting to these named surfaces. Do not report presentation-lane progress in generic terms only.

## Validation

Provide:

- named before/after surfaces,
- representative screenshots or story coverage for each named affected surface where available,
- explanation of how shared presentation families now differ from productive-lane surfaces,
- actual verification performed.

## Required completion report structure

Use this exact structure in your completion note:

### Structural / architectural progress
### Visual / presentation-quality progress
### Verification performed
### Remaining risks or regressions

The visual section must explicitly state whether each named surface materially advanced beyond the prior generic internal-app feel.

## Guardrails

- Do not make every presentation surface identical.
- Do not allow feature-local CSS to remain the primary authored system if the surface belongs in shared UI.
- Do not degrade the best current presentation work into flatter generic shared abstractions.
- Treat the current signature hero as the presentation-lane quality floor, not the ceiling.
