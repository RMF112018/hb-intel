# Prompt 02 — Tokenize the Spotlight Surface and Remove Hardcoded Presentation Drift

## Objective

Bring the shared Project Portfolio Spotlight surface into strict alignment with homepage token-discipline expectations by removing the bulk of its hardcoded presentation values.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`
4. `packages/ui-kit/src/homepage.ts`
5. relevant `packages/ui-kit/src/theme/**` and homepage token exports

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/project-spotlight-surface.module.css`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- `packages/ui-kit/src/homepage.ts`
- relevant theme/homepage token sources and existing premium-surface aliases

## Current gap to close

The current Spotlight surface still contains too many direct presentation literals:
- hex colors
- rgba values
- spacing values
- radii
- heights
- local font family

For a flagship homepage surface, this is too much ungoverned styling debt.

## Required implementation outcome

Refactor the Spotlight so its presentation values are driven by governed homepage/theme aliases wherever practical.

Acceptable outcomes include:

- direct replacement with existing semantic tokens
- introduction of clearly governed homepage-specific aliases
- narrow, documented flagship exceptions only where truly justified

Do not perform a symbolic token pass.
Actually reduce the hardcoded presentation field in a meaningful way.

## Guardrails

- Preserve the current premium visual character unless a doctrine conflict requires a visible change.
- Do not flatten the Spotlight into generic shared-card styling.
- Do not push ad hoc token definitions into arbitrary local files without governance.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. files changed
2. categories of literals removed
3. token/alias sources adopted
4. any remaining deliberate exceptions and why they remain
5. visual regression / story / screenshot evidence if available
