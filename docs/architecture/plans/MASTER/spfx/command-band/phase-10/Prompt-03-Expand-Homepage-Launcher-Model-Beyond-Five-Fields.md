# Prompt-03 — Expand Homepage Launcher Model Beyond Five Fields

## Objective

Replace the current overly lossy homepage launcher chip contract with a semantically credible model that preserves the information needed for a premium launcher outcome.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`

## Current problem to solve

The current homepage launcher model is reduced to `id/title/href/icon/external`. That is too lossy relative to the normalized source model and forces the surface family to operate without important semantics such as grouping, stronger service identity, and more precise link behavior.

## Required implementation work

1. Define an expanded homepage launcher model that is still compact but materially more expressive than the current five-field contract.
2. Preserve and pass through the minimum additional semantics needed for:
   - service/tool identity
   - grouping or sectioning in overflow
   - link-behavior precision
   - label rescue / assistive metadata where justified
3. Update the adapter and ui-kit surface types accordingly.
4. Ensure the surface family consumes the expanded model intentionally instead of carrying dead fields.
5. Add tests for the expanded model and adapter behavior.

## Required future state

The homepage launcher surface should receive a model that is rich enough to render a premium primary row and a structured overflow surface without reverse-engineering meaning from too-thin inputs.

## Proof of closure required

- the homepage launcher types are no longer limited to the old five-field bottleneck
- adapter tests prove the richer semantics survive mapping
- the ui-kit surface family uses the richer model intentionally, not performatively

## Prohibitions

- Do not bloat the model with speculative fields that the surface family will not use.
- Do not regress existing data loading and filtering seams.
- Do not introduce stringly typed drift where typed fields are warranted.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
