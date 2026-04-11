# 02 — Prompt: Shared Reaction Affordance and Contract

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the shared public-surface contract so the HB Kudos public webpart can expose an obvious, production-ready reaction / like interaction on the primary display element.

## Mandatory scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`

## Required outcomes

The shared public surface must support:

- a visible reaction affordance on the featured recognition card
- direct callback-driven interaction, not only href-style celebrate rendering
- clear zero-state behavior so reaction is visible even when count = 0
- premium visual treatment consistent with the public Kudos surface
- keyboard accessibility and focus treatment
- repeatable reuse by the public Kudos webpart without local hacks

## Required implementation direction

1. Audit the current celebrate-related contract on `HbcPeopleCultureSurface`.
2. Determine the strongest contract shape for interactive reaction support.
3. Add the minimum necessary shared props and internal wiring so reaction can be triggered from the public surface.
4. Ensure the reaction affordance is visually obvious even when no one has reacted yet.
5. Keep the design subordinate to the recognition content, but present enough that users can infer the capability exists.

## Strong design rule

The reaction affordance must feel like an intentional homepage interaction component, not a bolted-on debug button.

## Explicit prohibitions

Do not:
- leave the public surface reaction invisible when the count is zero
- depend on a detail-panel-only reaction path
- add an href-only solution if the intended behavior is direct interaction
- regress the premium public styling

## Deliverables

Return:
- files changed
- new shared-surface contract summary
- explanation of the visible reaction affordance
- explanation of zero-state and non-zero-state behavior
