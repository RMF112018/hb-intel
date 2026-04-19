# Prompt-10 — Add Regression Tests, Packaged Proof, and Hosted Cutover Checks

## Objective

Make the redesigned launcher hard to regress by adding stronger tests, stronger runtime markers, and a hosted cutover checklist that proves the deployed package matches the intended homepage launcher surface.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/homepage/__tests__/priorityActionsLauncherAdapter.test.ts`
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`
- any new tests you add under `apps/hb-webparts/src/homepage/__tests__/`
- any new tests you add under `packages/ui-kit/src/HbcHomepageLauncher/__tests__/`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- any launcher-specific closure/proof markdown you add

## Current problem to solve

The current proof posture is still too weak. It is too easy to ship a launcher that looks changed without proving that icon semantics, count rules, overflow behavior, and hosted cutover are all correct.

## Required implementation work

1. Add or expand tests for:
   - adapter model richness
   - icon resolution precedence
   - visible-count behavior by device class
   - short-height behavior
   - grouped overflow behavior if introduced
   - link-behavior semantics
2. Preserve or deliberately enhance inspectable runtime markers on the launcher root.
3. Add a concise hosted cutover checklist that proves the deployed homepage is using the intended launcher family and package version.
4. Ensure the closure proof is usable by a reviewer who is validating the built/deployed `.sppkg`, not only local source code.
5. Make sure test names and proof steps are specific enough to fail loudly when the launcher regresses.

## Required future state

A closure reviewer should be able to verify, with source + tests + hosted DOM inspection, that the launcher redesign is truly live and semantically correct — not just superficially restyled.

## Proof of closure required

- new and updated tests pass
- runtime markers remain inspectable in hosted DOM
- a hosted cutover checklist exists and is launcher-specific
- closure proof covers icon semantics, count rules, overflow behavior, link semantics, and packaged identity

## Prohibitions

- Do not add noise tests that do not protect meaningful launcher decisions.
- Do not stop at version-marker proof alone.
- Do not declare closure without hosted cutover validation steps.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
