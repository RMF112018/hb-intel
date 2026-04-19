# Prompt-05 — Replace Flex-Stretch Chips With a Variable-Width Launcher Primitive

## Objective

Replace the current equal-width stretch-pill primary row with a more compact, density-disciplined launcher primitive that behaves credibly across sparse and dense states.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx` only as needed to support the new primitive family

## Current problem to solve

The current primary row uses equal-width flex stretch behavior, which inflates chips when counts are low and reduces usable density. This is a structural primitive problem, not just a spacing issue.

## Required implementation work

1. Tear down the equal-width stretch assumption in the homepage launcher primary row.
2. Build a primary-row primitive that keeps a compact operational posture across device classes.
3. Use the actual launcher container width as the governing layout input; preserve and deepen container-query behavior where useful.
4. Ensure low-count states remain visually controlled instead of growing into oversized pills.
5. Keep the launcher unmistakably utility-first rather than turning it into a dashboard-card strip.
6. Preserve inspectable runtime markers and device-count markers.
7. Add or update tests if the new primitive introduces variant logic that needs protection.

## Required future state

The primary launcher row should read as a premium compact command surface: dense enough to be useful, branded enough to feel flagship, and stable enough that sparse counts do not look inflated or under-designed.

## Proof of closure required

- low-count primary states no longer overgrow
- desktop/tablet states remain single-row and compact where intended
- phone and constrained states remain deliberate rather than accidentally compressed
- runtime markers still expose device/count state for hosted proof

## Prohibitions

- Do not fall back into a timid thin-border white-card row.
- Do not turn the launcher into a generic multi-line tile gallery.
- Do not regress host-fit behavior for the wrapper-owned actions region.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
