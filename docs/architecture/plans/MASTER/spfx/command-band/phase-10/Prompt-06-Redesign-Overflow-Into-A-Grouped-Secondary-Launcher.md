# Prompt-06 — Redesign Overflow Into a Grouped Secondary Launcher

## Objective

Turn the current flat “More tools” list into a stronger secondary launcher surface with better grouping, scanability, and service identity.

## Governing authority

Treat the following as controlling implementation authority for this prompt:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/reference/spfx-surfaces/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

The doctrine and benchmark materials are binding. Do not preserve a weak launcher decision merely because it compiles, currently renders, or resembles a prior package recommendation.

## Inspect these exact seams

- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts` for any new grouping inputs
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts` only where grouping fields need to flow through more explicitly

## Current problem to solve

The current overflow is technically correct but product-weak. It behaves like an overflow dump rather than a polished extension of the launcher. The repo already carries grouping metadata that is not being used strongly enough here.

## Required implementation work

1. Redesign the overflow surface as a governed secondary launcher.
2. Where the data supports it, introduce grouping / sectioning that improves scan speed and findability.
3. Preserve menu mode for desktop/tablet and sheet mode for handheld / short-height where justified.
4. Keep the trigger clearly secondary to the primary launcher row.
5. Strengthen overflow item identity with better icon + label handling and clearer grouping rhythm.
6. Use dividers, spacing, and section treatment deliberately — not performatively.
7. Add tests for grouped overflow behavior if you introduce grouping into the public model.

## Required future state

Overflow should feel like the second half of the launcher system, not a fallback list. Users should be able to scan it quickly, understand groupings, and recognize services immediately.

## Proof of closure required

- overflow remains compact and accessible in both menu and sheet modes
- grouped/sectioned behavior is deterministic where present
- desktop and handheld overflow surfaces both read as intentional launcher extensions

## Prohibitions

- Do not bloat the overflow into a mini application.
- Do not introduce gratuitous motion or decorative panel furniture.
- Do not regress focus management, dismissal, or host-safe overlay behavior.

## Working rule

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.
