# Prompt 04 — First-Paint Mode Stability

## Objective

Harden the Project Portfolio Spotlight so the first render does not visibly assume a wide posture before container measurement settles.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

- `packages/ui-kit/src/HbcProjectSpotlightSurface/use-spotlight-layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/layout-mode.ts`
- `packages/ui-kit/src/HbcProjectSpotlightSurface/index.tsx`
- associated stories/tests for forced-mode or initial-mode behavior

## Current gap to close

The Spotlight’s layout hook currently starts from a wide default before real measurement settles. In narrow or constrained containers, that can cause an unnecessary first-paint mis-posture or layout snap.

That is inconsistent with the goal of stable, container-aware homepage behavior.

## Required implementation outcome

Refine the initial mode / first-paint strategy so that:

- narrow containers do not visibly render as wide first
- the first stable posture is more conservative or otherwise visually safe
- runtime mode resolution remains container-aware
- stories/tests remain deterministic where forced mode is used

Acceptable solutions may include:
- a safer initial mode
- an unmeasured pre-resolution posture
- or another deliberate strategy that avoids visible false-wide rendering

## Guardrails

- Do not remove the container-aware `ResizeObserver` model.
- Do not replace the explicit mode system with viewport CSS.
- Do not broaden into unrelated styling work.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact strategy used
2. exact files changed
3. why the new approach is safer
4. any tests or stories updated
5. any remaining known limitation
