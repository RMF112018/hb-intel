# Prompt 03 — Runtime Error Handling and Authoring-Safe Failure States

## Objective

Bring the Project Portfolio Spotlight up to homepage-grade runtime maturity by making the consumer distinguish clearly between loading, empty, invalid, and data-fetch failure states.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. `docs/reference/spfx-surfaces/benchmark/`

## Files / seams to inspect

- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/homepage/data/useProjectSpotlightData.ts`
- `apps/hb-webparts/src/homepage/shared/HomepageEmptyState.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageLoadingState.tsx`
- any existing homepage error-state primitive or equivalent seam that should be reused rather than duplicated

## Current gap to close

The data hook already exposes `error`, but the current consumer does not render a distinct Spotlight error state. Failures can collapse into a generic no-data posture, which is below homepage benchmark maturity.

## Required implementation outcome

Implement a professional failure-state path such that:

- loading remains explicit
- empty/invalid authoring remains explicit
- data-fetch/runtime failure is explicit and visually distinct from “no data”
- fallback behavior remains safe in non-SPFx/local contexts
- the final state language remains appropriate for homepage users and page authors

Prefer reuse of existing homepage/shared state primitives when that produces a clean result.

## Guardrails

- Do not push data-fetch awareness down into the shared ui-kit presentation surface.
- Keep SharePoint/runtime awareness in the webpart consumer layer.
- Do not broaden into unrelated shell or list work.
- Do not re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Proof of closure

Return:

1. exact files changed
2. state matrix showing loading vs empty vs invalid vs error
3. any new tests added
4. confirmation that local/no-SPFx fallback still works
