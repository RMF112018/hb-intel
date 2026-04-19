# Prompt-02 — Reconcile Authoring Contract and Dead Homepage Knobs

## Objective

Remove or quarantine contract and config semantics that the homepage launcher path no longer genuinely honors, so the homepage launcher is governed by a truthful contract.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- any directly adjacent admin or validation seams that still assume the homepage path obeys the retired authored layout matrix

## Current problem to solve

The homepage launcher now uses binding launcher behavior and hard-coded visible-count governance, yet the contracts still expose authored layout/cap knobs that imply stronger homepage control than the runtime actually delivers. That is a repo-truth and standards-truth drift problem.

## Required implementation work

1. Identify which authored config fields are still meaningful for the homepage launcher path and which are effectively dead there.
2. Decide, based on repo truth, whether each dead field should be:
   - retired from the homepage path,
   - clearly quarantined as non-homepage / legacy / admin-only,
   - or actually re-honored by the homepage runtime.
3. Update contracts, comments, helper functions, and validations so the homepage path no longer implies fake configurability.
4. Preserve canonical data loading and list-shape compatibility unless a field is truly dead and safe to isolate.
5. Add or update tests so the contract truth is explicit and regression-resistant.

## Required future state

A reviewer should be able to inspect the homepage launcher contracts and know exactly which controls genuinely govern the homepage runtime and which do not. No fake per-device layout authority should remain implied.

## Proof of closure required

- homepage launcher path no longer pretends to honor dead layout/cap knobs
- contract comments and validations reflect actual runtime behavior
- tests prove the homepage path’s governance is consistent and explicit

## Prohibitions

- Do not silently delete fields without accounting for admin/list compatibility.
- Do not preserve fake configurability for convenience.
- Do not broaden into unrelated list-schema refactors.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
