# Prompt-07 — Reconcile Visible-Count Governance and Short-Height Rules

## Objective

Eliminate contradictory visible-count logic across launcher layers and establish one authoritative count regime for the homepage launcher path.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- related tests under `apps/hb-webparts/src/homepage/__tests__/` and any ui-kit launcher tests you add

## Current problem to solve

The launcher path currently carries contradictory count assumptions across layers, especially around phone behavior, and also mixes baseline visible counts with short-height shaving. That weakens governance and makes future closure fragile.

## Required implementation work

1. Identify every live source of truth for homepage launcher visible counts.
2. Choose and enforce a single authoritative count regime consistent with doctrine and the desired launcher outcome.
3. Reconcile short-height adjustments so the behavior is explicit, deterministic, and tested.
4. Update comments and tests so no contradictory count language remains.
5. Ensure the runtime markers still expose the final effective counts for hosted inspection.

## Required future state

A reviewer should be able to inspect one authoritative count table and trust that the homepage launcher path, adapter, tests, and runtime markers all agree with it.

## Proof of closure required

- a single count regime governs the homepage launcher path
- tests cover each device class and short-height behavior
- no contradictory phone/tablet/desktop count rules remain in adjacent launcher layers

## Prohibitions

- Do not preserve contradictory tables for convenience.
- Do not change counts casually without documenting the rationale.
- Do not break overflow-only semantics or audience/device filtering while reconciling counts.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
